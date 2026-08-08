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
exports.PlatformMetricsController = void 0;
const common_1 = require("@nestjs/common");
const platform_auth_guard_1 = require("./guards/platform-auth.guard");
const platform_metrics_service_1 = require("./services/platform-metrics.service");
const VALID_INTERVALS = ['month', 'week', 'day'];
function parseInterval(value) {
    return VALID_INTERVALS.includes(value)
        ? value
        : 'month';
}
function parseSince(value) {
    if (!value)
        return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}
let PlatformMetricsController = class PlatformMetricsController {
    constructor(metrics) {
        this.metrics = metrics;
    }
    getOverview() {
        return this.metrics.getOverview();
    }
    getCompanyGrowth(interval, since) {
        return this.metrics.getCompanyGrowth(parseInterval(interval), parseSince(since));
    }
    getEmployeeGrowth(interval, since) {
        return this.metrics.getEmployeeGrowth(parseInterval(interval), parseSince(since));
    }
    getPayrollVolume(interval, since) {
        return this.metrics.getPayrollVolume(parseInterval(interval), parseSince(since));
    }
    getExceptions() {
        return this.metrics.getExceptions();
    }
    getStatutorySummary() {
        return this.metrics.getStatutorySummary();
    }
    getStatutoryTrend(interval, since) {
        return this.metrics.getStatutoryTrend(parseInterval(interval), parseSince(since));
    }
    getRemittances() {
        return this.metrics.getRemittances();
    }
    getRemittanceCoverage() {
        return this.metrics.getRemittanceCoverage();
    }
    getAdoptionFunnel() {
        return this.metrics.getAdoptionFunnel();
    }
    getTopCompanies(limit) {
        return this.metrics.getTopCompanies(Math.min(Math.max(Number(limit) || 6, 1), 20));
    }
    getCompanyList(limit, offset) {
        const parsedLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
        const parsedOffset = Math.max(Number(offset) || 0, 0);
        return this.metrics.getCompanyList(parsedLimit, parsedOffset);
    }
};
exports.PlatformMetricsController = PlatformMetricsController;
__decorate([
    (0, common_1.Get)('overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlatformMetricsController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('companies'),
    __param(0, (0, common_1.Query)('interval')),
    __param(1, (0, common_1.Query)('since')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PlatformMetricsController.prototype, "getCompanyGrowth", null);
__decorate([
    (0, common_1.Get)('employees'),
    __param(0, (0, common_1.Query)('interval')),
    __param(1, (0, common_1.Query)('since')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PlatformMetricsController.prototype, "getEmployeeGrowth", null);
__decorate([
    (0, common_1.Get)('payroll'),
    __param(0, (0, common_1.Query)('interval')),
    __param(1, (0, common_1.Query)('since')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PlatformMetricsController.prototype, "getPayrollVolume", null);
__decorate([
    (0, common_1.Get)('exceptions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlatformMetricsController.prototype, "getExceptions", null);
__decorate([
    (0, common_1.Get)('statutory'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlatformMetricsController.prototype, "getStatutorySummary", null);
__decorate([
    (0, common_1.Get)('statutory/trend'),
    __param(0, (0, common_1.Query)('interval')),
    __param(1, (0, common_1.Query)('since')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PlatformMetricsController.prototype, "getStatutoryTrend", null);
__decorate([
    (0, common_1.Get)('remittances'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlatformMetricsController.prototype, "getRemittances", null);
__decorate([
    (0, common_1.Get)('remittances/coverage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlatformMetricsController.prototype, "getRemittanceCoverage", null);
__decorate([
    (0, common_1.Get)('adoption'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlatformMetricsController.prototype, "getAdoptionFunnel", null);
__decorate([
    (0, common_1.Get)('companies/top'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlatformMetricsController.prototype, "getTopCompanies", null);
__decorate([
    (0, common_1.Get)('companies/list'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PlatformMetricsController.prototype, "getCompanyList", null);
exports.PlatformMetricsController = PlatformMetricsController = __decorate([
    (0, common_1.Controller)('platform/metrics'),
    (0, common_1.UseGuards)(platform_auth_guard_1.PlatformAuthGuard),
    __metadata("design:paramtypes", [platform_metrics_service_1.PlatformMetricsService])
], PlatformMetricsController);
//# sourceMappingURL=platform-metrics.controller.js.map