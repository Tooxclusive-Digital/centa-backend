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
exports.PlatformFilingController = void 0;
const common_1 = require("@nestjs/common");
const platform_auth_guard_1 = require("./guards/platform-auth.guard");
const current_platform_admin_decorator_1 = require("./decorator/current-platform-admin.decorator");
const platform_filing_service_1 = require("./services/platform-filing.service");
const platform_note_service_1 = require("./services/platform-note.service");
const record_filing_dto_1 = require("./dto/record-filing.dto");
const create_note_dto_1 = require("./dto/create-note.dto");
let PlatformFilingController = class PlatformFilingController {
    constructor(filings, notes) {
        this.filings = filings;
        this.notes = notes;
    }
    recordFiling(dto, admin, ip) {
        return this.filings.recordFiling(dto, admin, ip);
    }
    listNotes() {
        return this.notes.getAll();
    }
    createNote(dto, admin, ip) {
        return this.notes.create(dto, admin, ip);
    }
    removeNote(id, admin) {
        return this.notes.remove(id, admin);
    }
    getAuditLog(limit) {
        return this.filings.getAuditLog(Math.min(Math.max(Number(limit) || 50, 1), 200));
    }
};
exports.PlatformFilingController = PlatformFilingController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_platform_admin_decorator_1.CurrentPlatformAdmin)()),
    __param(2, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [record_filing_dto_1.RecordFilingDto, Object, String]),
    __metadata("design:returntype", void 0)
], PlatformFilingController.prototype, "recordFiling", null);
__decorate([
    (0, common_1.Get)('notes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlatformFilingController.prototype, "listNotes", null);
__decorate([
    (0, common_1.Post)('notes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_platform_admin_decorator_1.CurrentPlatformAdmin)()),
    __param(2, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_note_dto_1.CreateNoteDto, Object, String]),
    __metadata("design:returntype", void 0)
], PlatformFilingController.prototype, "createNote", null);
__decorate([
    (0, common_1.Delete)('notes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_platform_admin_decorator_1.CurrentPlatformAdmin)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PlatformFilingController.prototype, "removeNote", null);
__decorate([
    (0, common_1.Get)('audit'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlatformFilingController.prototype, "getAuditLog", null);
exports.PlatformFilingController = PlatformFilingController = __decorate([
    (0, common_1.Controller)('platform/filings'),
    (0, common_1.UseGuards)(platform_auth_guard_1.PlatformAuthGuard),
    __metadata("design:paramtypes", [platform_filing_service_1.PlatformFilingService,
        platform_note_service_1.PlatformNoteService])
], PlatformFilingController);
//# sourceMappingURL=platform-filing.controller.js.map