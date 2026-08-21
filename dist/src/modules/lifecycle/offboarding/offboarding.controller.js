"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffboardingController = void 0;
const common_1 = require("@nestjs/common");
const offboarding_service_1 = require("./offboarding.service");
const update_offboarding_dto_1 = require("./dto/update-offboarding.dto");
const base_controller_1 = require("../../../common/interceptor/base.controller");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../auth/decorator/current-user.decorator");
const create_offboarding_dto_1 = require("./dto/create-offboarding.dto");
const add_offboarding_details_dto_1 = require("./dto/add-offboarding-details.dto");
const offboarding_export_service_1 = require("./offboarding-export.service");
let OffboardingController = class OffboardingController extends base_controller_1.BaseController {
    constructor(offboardingService, exportService) {
        super();
        this.offboardingService = offboardingService;
        this.exportService = exportService;
    }
    async downloadRecord(employeeId, user, reply, sections) {
        const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!UUID.test(employeeId)) {
            throw new common_1.BadRequestException('A valid employee id is required');
        }
        const requested = (sections ?? '')
            .split(',')
            .map((s) => s.trim())
            .filter((s) => offboarding_export_service_1.RECORD_SECTIONS.includes(s));
        const { buffer, filename } = await this.exportService.generateWorkbook(employeeId, user.companyId, requested);
        reply
            .header('Content-Disposition', `attachment; filename="${filename}"`)
            .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        return reply.send(buffer);
    }
    begin(dto, user) {
        return this.offboardingService.begin(dto, user);
    }
    addDetails(sessionId, dto, user) {
        return this.offboardingService.addDetails(sessionId, dto, user);
    }
    cancel(sessionId, user) {
        return this.offboardingService.cancel(sessionId, user);
    }
    findByEmployeeId(user, employeeId) {
        return this.offboardingService.findByEmployeeId(employeeId, user.companyId);
    }
    findAll(user) {
        return this.offboardingService.findAll(user.companyId);
    }
    findOne(id, user) {
        return this.offboardingService.findOne(id, user.companyId);
    }
    update(id, updateOffboardingDto, user) {
        return this.offboardingService.update(id, updateOffboardingDto, user);
    }
    updateChecklist(checklistItemId, user) {
        return this.offboardingService.updateChecklist(checklistItemId, user);
    }
    remove(id, user) {
        return this.offboardingService.remove(id, user);
    }
};
exports.OffboardingController = OffboardingController;
__decorate([
    (0, common_1.Get)('employee/:employeeId/record'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __param(3, (0, common_1.Query)('sections')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, String]),
    __metadata("design:returntype", Promise)
], OffboardingController.prototype, "downloadRecord", null);
__decorate([
    (0, common_1.Post)('begin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_offboarding_dto_1.CreateOffboardingBeginDto, Object]),
    __metadata("design:returntype", void 0)
], OffboardingController.prototype, "begin", null);
__decorate([
    (0, common_1.Post)(':sessionId/details'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_offboarding_details_dto_1.AddOffboardingDetailsDto, Object]),
    __metadata("design:returntype", void 0)
], OffboardingController.prototype, "addDetails", null);
__decorate([
    (0, common_1.Post)(':sessionId/cancel'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OffboardingController.prototype, "cancel", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], OffboardingController.prototype, "findByEmployeeId", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OffboardingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OffboardingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_offboarding_dto_1.UpdateOffboardingDto, Object]),
    __metadata("design:returntype", void 0)
], OffboardingController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('update-checklist'),
    __param(0, (0, common_1.Body)('checklistItemId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OffboardingController.prototype, "updateChecklist", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OffboardingController.prototype, "remove", null);
exports.OffboardingController = OffboardingController = __decorate([
    (0, common_1.Controller)('offboarding'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.SetMetadata)('permission', ['employees.manage']),
    __metadata("design:paramtypes", [offboarding_service_1.OffboardingService,
        offboarding_export_service_1.OffboardingExportService])
], OffboardingController);
//# sourceMappingURL=offboarding.controller.js.map