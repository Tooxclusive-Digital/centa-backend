import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import type { User } from 'src/common/types/user.type';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import type { db } from 'src/drizzle/types/drizzle';
import { AuditService } from '../audit/audit.service';
import {
  announcementCategories,
  announcementComments,
  announcementReactions,
  announcements,
} from './schema/announcements.schema';
import { and, desc, eq, inArray, isNotNull, sql } from 'drizzle-orm';
import { CommentService } from './comment.service';
import { ReactionService } from './reaction.service';
import { AwsService } from 'src/common/aws/aws.service';
import {
  companies,
  companyLocations,
  companyRoles,
  departments,
  employees,
  users,
} from 'src/drizzle/schema';
import { CacheService } from 'src/common/cache/cache.service';
import { PushNotificationService } from '../notification/services/push-notification.service';
import { format } from 'date-fns';
import { stripHtml } from 'string-strip-html'; // or write a quick regex

@Injectable()
export class AnnouncementService {
  constructor(
    @Inject(DRIZZLE) private readonly db: db,
    private readonly auditService: AuditService,
    private readonly commentService: CommentService,
    private readonly reactionService: ReactionService,
    private readonly awsService: AwsService,
    private readonly cache: CacheService,
    private readonly push: PushNotificationService,
    @InjectQueue('emailQueue') private readonly emailQueue: Queue,
  ) {}

  private tags(companyId: string) {
    return [
      `company:${companyId}:announcements`,
      `company:${companyId}:announcements:feed`,
      `company:${companyId}:announcements:meta`,
    ];
  }

  /**
   * Resolve a category by name for a company, creating it if absent.
   *
   * Used by system-generated announcements (e.g. birthdays) which have no
   * human picking a category from the UI.
   */
  async findOrCreateCategory(companyId: string, name: string) {
    const [existing] = await this.db
      .select({ id: announcementCategories.id })
      .from(announcementCategories)
      .where(
        and(
          eq(announcementCategories.companyId, companyId),
          eq(announcementCategories.name, name),
        ),
      )
      .limit(1)
      .execute();

    if (existing) return existing.id;

    const [created] = await this.db
      .insert(announcementCategories)
      .values({ companyId, name })
      .returning({ id: announcementCategories.id })
      .execute();

    return created.id;
  }

  /**
   * Queue the announcement email to every employee in the company.
   *
   * Shared by author-created and system-created announcements so both reach
   * staff the same way. Delivery honours EMAIL_TEST_REDIRECT at the transport
   * level, so a test run never contacts real recipients.
   */
  async queueAnnouncementEmails(input: {
    companyId: string;
    announcementId: string;
    title: string;
    body: string;
    publishedAt?: Date | null;
    /** Limit to one department; omit for the whole company. */
    departmentId?: string | null;
  }) {
    const recipients = await this.db
      .select({
        id: employees.id,
        email: employees.email,
        firstName: employees.firstName,
      })
      .from(employees)
      .where(
        input.departmentId
          ? and(
              eq(employees.companyId, input.companyId),
              eq(employees.departmentId, input.departmentId),
              // Leavers keep their record (and email) for history; they must
              // not keep receiving company announcements.
              eq(employees.employmentStatus, 'active'),
              isNotNull(employees.email),
            )
          : and(
              eq(employees.companyId, input.companyId),
              eq(employees.employmentStatus, 'active'),
              isNotNull(employees.email),
            ),
      )
      .execute();

    if (!recipients.length) return 0;

    const [company] = await this.db
      .select({ name: companies.name })
      .from(companies)
      .where(eq(companies.id, input.companyId))
      .execute();

    const companyName = company?.name || 'Your Company';
    const publishedAtFormatted = input.publishedAt
      ? format(input.publishedAt, 'PPP')
      : undefined;

    const plainBody = stripHtml(input.body).result;
    const preview =
      plainBody.length > 200 ? plainBody.slice(0, 200) + '…' : plainBody;

    const chunkSize = 500;
    for (let i = 0; i < recipients.length; i += chunkSize) {
      const chunk = recipients.slice(i, i + chunkSize);

      await this.emailQueue.addBulk(
        chunk.map((r) => ({
          name: 'sendAnnouncement',
          data: {
            toEmail: r.email,
            subject: `New company announcement: ${input.title}`,
            firstName: r.firstName || 'there',
            title: input.title,
            body: preview,
            publishedAt: publishedAtFormatted,
            companyName,
            meta: { announcementId: input.announcementId },
          },
          opts: {
            attempts: 3,
            // Without backoff a retry re-hits the same rate limit instantly.
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: true,
            removeOnFail: false,
          },
        })),
      );
    }

    return recipients.length;
  }

  /**
   * Create an announcement generated by the system rather than a person.
   *
   * Behaves like an author-created announcement: posted to the feed (where it
   * can be commented on and reacted to), pushed in-app, and emailed to every
   * employee in the company.
   */
  async createSystemAnnouncement(input: {
    companyId: string;
    createdBy: string;
    title: string;
    body: string;
    categoryName: string;
    /** Skips creation if an announcement with this title already exists. */
    dedupeByTitle?: boolean;
    expiresAt?: Date | null;
    pushTitle?: string;
    pushBody?: string;
    /**
     * Restrict the in-app push to these employees. Omit to notify everyone in
     * the company with a registered device.
     */
    pushEmployeeIds?: string[];
    /** Suppress the in-app push entirely (dry runs / previews). */
    skipPush?: boolean;
  }) {
    if (input.dedupeByTitle !== false) {
      const [existing] = await this.db
        .select({ id: announcements.id })
        .from(announcements)
        .where(
          and(
            eq(announcements.companyId, input.companyId),
            eq(announcements.title, input.title),
          ),
        )
        .limit(1)
        .execute();

      if (existing) return null;
    }

    const categoryId = await this.findOrCreateCategory(
      input.companyId,
      input.categoryName,
    );

    const [created] = await this.db
      .insert(announcements)
      .values({
        title: input.title,
        body: input.body,
        createdBy: input.createdBy,
        companyId: input.companyId,
        categoryId,
        isPublished: true,
        publishedAt: new Date(),
        expiresAt: input.expiresAt ?? null,
        link: '',
        image: '',
      })
      .returning()
      .execute();

    if (!input.skipPush) {
      try {
        await this.push.createAndSendToCompany(
          input.companyId,
          {
            title: input.pushTitle ?? 'New Announcement',
            body: input.pushBody ?? created.title,
            type: 'message',
            data: { id: created.id },
            route: `/screens/dashboard/announcements/announcement-detail`,
          },
          input.pushEmployeeIds?.length
            ? { employeeIds: input.pushEmployeeIds }
            : undefined,
        );
      } catch {
        // push failure must not roll back the announcement itself
      }
    }

    try {
      await this.queueAnnouncementEmails({
        companyId: input.companyId,
        announcementId: created.id,
        title: created.title,
        body: created.body,
        publishedAt: created.publishedAt,
      });
    } catch {
      // email failure must not roll back the announcement itself
    }

    await this.cache.bumpCompanyVersion(input.companyId);

    return created;
  }

  async create(dto: CreateAnnouncementDto, user: User) {
    return this.db.transaction(async (tx) => {
      const [existingAnnouncement] = await tx
        .select()
        .from(announcements)
        .where(eq(announcements.title, dto.title))
        .limit(1)
        .execute();

      if (existingAnnouncement) {
        throw new BadRequestException(
          'Announcement with this title already exists',
        );
      }

      let image = dto.image;

      if (image?.startsWith('data:image')) {
        const fileName = `receipt-${Date.now()}.jpg`;
        image = await this.awsService.uploadImageToS3(
          user.companyId,
          fileName,
          image,
        );
      }

      const [newAnnouncement] = await tx
        .insert(announcements)
        .values({
          title: dto.title,
          body: dto.body,
          createdBy: user.id,
          createdAt: new Date(),
          companyId: user.companyId,
          image,
          link: dto.link || '',
          departmentId: dto.departmentId || null,
          locationId: dto.locationId || null,
          publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
          isPublished: true,
          categoryId: dto.categoryId,
        })
        .returning()
        .execute();

      await this.auditService.logAction({
        action: 'create',
        entity: 'announcement',
        entityId: newAnnouncement.id,
        userId: user.id,
        details: `Created announcement with title: ${newAnnouncement.title}`,
        changes: {
          title: newAnnouncement.title,
          body: newAnnouncement.body,
          publishedAt: newAnnouncement.publishedAt,
        },
      });

      await this.push.createAndSendToCompany(user.companyId, {
        title: 'New Announcement',
        body: newAnnouncement.title,
        type: 'message',
        data: { id: newAnnouncement.id },
        route: `/screens/dashboard/announcements/announcement-detail`,
      });

      // Invalidate all announcement-related caches for this company
      await this.cache.bumpCompanyVersion(user.companyId);

      // Fan-out announcement emails. Shares one implementation with
      // system-generated announcements so the recipient rule (active staff
      // only) cannot drift between the two paths.
      if (newAnnouncement) {
        await this.queueAnnouncementEmails({
          companyId: user.companyId,
          announcementId: newAnnouncement.id,
          title: newAnnouncement.title,
          body: newAnnouncement.body,
          publishedAt: newAnnouncement.publishedAt,
          departmentId: dto.departmentId || null,
        });
      }

      return newAnnouncement;
    });
  }

  async findAll(companyId: string) {
    return this.cache.getOrSetVersioned(
      companyId,
      ['announcements', 'feed', 'limit:20'],
      async () => {
        const allAnnouncements = await this.db
          .select({
            id: announcements.id,
            title: announcements.title,
            body: announcements.body,
            publishedAt: announcements.publishedAt,
            category: announcementCategories.name,
            categoryId: announcements.categoryId,
            createdBy:
              sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as(
                'createdBy',
              ),
            role: companyRoles.name,
            avatarUrl: users.avatar,
          })
          .from(announcements)
          .innerJoin(users, eq(announcements.createdBy, users.id))
          .innerJoin(companyRoles, eq(users.companyRoleId, companyRoles.id))
          .leftJoin(
            announcementCategories,
            eq(announcements.categoryId, announcementCategories.id),
          )
          .where(eq(announcements.companyId, companyId))
          .orderBy(desc(announcements.publishedAt))
          .limit(20)
          .execute();

        const announcementIds = allAnnouncements.map((a) => a.id);
        if (announcementIds.length === 0) return [];

        const reactionCount = await this.db
          .select({
            announcementId: announcementReactions.announcementId,
            reactionType: announcementReactions.reactionType,
            count: sql<number>`COUNT(*)`.as('count'),
          })
          .from(announcementReactions)
          .where(inArray(announcementReactions.announcementId, announcementIds))
          .groupBy(
            announcementReactions.announcementId,
            announcementReactions.reactionType,
          )
          .execute();

        const reactionMap = new Map<string, Record<string, number>>();
        reactionCount.forEach((r) => {
          if (!reactionMap.has(r.announcementId)) {
            reactionMap.set(r.announcementId, {});
          }
          reactionMap.get(r.announcementId)![r.reactionType] = r.count;
        });

        const commentCount = await this.db
          .select({
            announcementId: announcementComments.announcementId,
            count: sql<number>`COUNT(*)`.as('count'),
          })
          .from(announcementComments)
          .where(inArray(announcementComments.announcementId, announcementIds))
          .groupBy(announcementComments.announcementId)
          .execute();

        const commentCountMap = new Map<string, number>();
        commentCount.forEach((c) =>
          commentCountMap.set(c.announcementId, c.count),
        );

        return allAnnouncements.map((a) => ({
          id: a.id,
          category: a.category,
          categoryId: a.categoryId,
          title: a.title,
          body: a.body,
          reactionCounts: reactionMap.get(a.id) || {},
          commentCount: commentCountMap.get(a.id) || 0,
          publishedAt: a.publishedAt,
          createdBy: a.createdBy,
          role: a.role,
          avatarUrl: a.avatarUrl,
        }));
      },
      { tags: this.tags(companyId) },
    );
  }

  async findAllLimitTwo(companyId: string) {
    return this.cache.getOrSetVersioned(
      companyId,
      ['announcements', 'feed', 'limit:2'],
      async () => {
        const allAnnouncements = await this.db
          .select({
            id: announcements.id,
            title: announcements.title,
            body: announcements.body,
            publishedAt: announcements.publishedAt,
            category: announcementCategories.name,
            categoryId: announcements.categoryId,
            createdBy:
              sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as(
                'createdBy',
              ),
            role: companyRoles.name,
            avatarUrl: users.avatar,
          })
          .from(announcements)
          .innerJoin(users, eq(announcements.createdBy, users.id))
          .innerJoin(companyRoles, eq(users.companyRoleId, companyRoles.id))
          .leftJoin(
            announcementCategories,
            eq(announcements.categoryId, announcementCategories.id),
          )
          .where(eq(announcements.companyId, companyId))
          .orderBy(desc(announcements.publishedAt))
          .limit(2)
          .execute();

        const announcementIds = allAnnouncements.map((a) => a.id);
        if (announcementIds.length === 0) return [];

        const reactionCount = await this.db
          .select({
            announcementId: announcementReactions.announcementId,
            reactionType: announcementReactions.reactionType,
            count: sql<number>`COUNT(*)`.as('count'),
          })
          .from(announcementReactions)
          .where(inArray(announcementReactions.announcementId, announcementIds))
          .groupBy(
            announcementReactions.announcementId,
            announcementReactions.reactionType,
          )
          .execute();

        const reactionMap = new Map<string, Record<string, number>>();
        reactionCount.forEach((r) => {
          if (!reactionMap.has(r.announcementId)) {
            reactionMap.set(r.announcementId, {});
          }
          reactionMap.get(r.announcementId)![r.reactionType] = r.count;
        });

        const commentCount = await this.db
          .select({
            announcementId: announcementComments.announcementId,
            count: sql<number>`COUNT(*)`.as('count'),
          })
          .from(announcementComments)
          .where(inArray(announcementComments.announcementId, announcementIds))
          .groupBy(announcementComments.announcementId)
          .execute();

        const commentCountMap = new Map<string, number>();
        commentCount.forEach((c) =>
          commentCountMap.set(c.announcementId, c.count),
        );

        return allAnnouncements.map((a) => ({
          id: a.id,
          title: a.title,
          reactionCounts: reactionMap.get(a.id) || {},
          commentCount: commentCountMap.get(a.id) || 0,
          publishedAt: a.publishedAt,
          createdBy: a.createdBy,
          avatarUrl: a.avatarUrl,
        }));
      },
      { tags: this.tags(companyId) },
    );
  }

  async findOne(id: string, userId: string) {
    // User-specific; do not cache the entire object by default.
    const [announcement, likeCount, likedByCurrentUser, comments] =
      await Promise.all([
        this.db
          .select()
          .from(announcements)
          .where(eq(announcements.id, id))
          .execute()
          .then(([res]) => {
            if (!res)
              throw new BadRequestException(
                `Announcement with id ${id} not found`,
              );
            return res;
          }),
        this.reactionService.countReactionsByType(id),
        this.reactionService.hasUserReacted(id, userId),
        this.commentService.getComments(id, userId),
      ]);

    return {
      announcement,
      likeCount,
      likedByCurrentUser,
      comments,
    };
  }

  async update(id: string, dto: UpdateAnnouncementDto, user: User) {
    return this.db.transaction(async (tx) => {
      const [announcement] = await tx
        .select()
        .from(announcements)
        .where(eq(announcements.id, id))
        .execute();

      if (!announcement) {
        throw new BadRequestException(`Announcement with id ${id} not found`);
      }

      let image = dto.image;
      if (image?.startsWith('data:image')) {
        const fileName = `announcement-${Date.now()}.jpg`;
        image = await this.awsService.uploadImageToS3(
          user.companyId,
          fileName,
          image,
        );
      }

      const [updatedAnnouncement] = await tx
        .update(announcements)
        .set({
          title: dto.title,
          body: dto.body,
          image,
          link: dto.link || '',
          departmentId: dto.departmentId || null,
          locationId: dto.locationId || null,
          categoryId: dto.categoryId,
          publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
        })
        .where(eq(announcements.id, id))
        .returning()
        .execute();

      await this.auditService.logAction({
        action: 'update',
        entity: 'announcement',
        entityId: updatedAnnouncement.id,
        userId: user.id,
        details: `Updated announcement with title: ${updatedAnnouncement.title}`,
        changes: {
          title: updatedAnnouncement.title,
          body: updatedAnnouncement.body,
          publishedAt: updatedAnnouncement.publishedAt,
        },
      });

      // Invalidate caches for this company’s announcements
      await this.cache.bumpCompanyVersion(user.companyId);

      return updatedAnnouncement;
    });
  }

  async remove(id: string, user: User) {
    return this.db.transaction(async (tx) => {
      const [announcement] = await tx
        .select()
        .from(announcements)
        .where(eq(announcements.id, id))
        .execute();

      if (!announcement) {
        throw new BadRequestException(`Announcement with id ${id} not found`);
      }

      await tx.delete(announcements).where(eq(announcements.id, id)).execute();

      await this.auditService.logAction({
        action: 'delete',
        entity: 'announcement',
        entityId: id,
        userId: user.id,
        details: `Deleted announcement with title: ${announcement.title}`,
      });

      // Invalidate caches
      await this.cache.bumpCompanyVersion(user.companyId);

      return { message: 'Announcement deleted successfully' };
    });
  }

  async getAllCreateElements(companyId: string) {
    return this.cache.getOrSetVersioned(
      companyId,
      ['announcements', 'create-elements'],
      async () => {
        const [categories, allDepartments, AllLocations] = await Promise.all([
          this.db
            .select({
              id: announcementCategories.id,
              name: announcementCategories.name,
            })
            .from(announcementCategories)
            .where(eq(announcementCategories.companyId, companyId))
            .execute(),

          this.db
            .select({
              id: departments.id,
              name: departments.name,
            })
            .from(departments)
            .where(eq(departments.companyId, companyId))
            .execute(),

          this.db
            .select({
              id: companyLocations.id,
              name: companyLocations.name,
            })
            .from(companyLocations)
            .where(eq(companyLocations.companyId, companyId))
            .execute(),
        ]);

        return {
          categories,
          departments: allDepartments,
          locations: AllLocations,
        };
      },
      { tags: this.tags(companyId) },
    );
  }
}
