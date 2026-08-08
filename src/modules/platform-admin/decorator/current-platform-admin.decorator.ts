import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PlatformAdminUser } from '../types/platform-admin.type';

export const CurrentPlatformAdmin = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PlatformAdminUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
