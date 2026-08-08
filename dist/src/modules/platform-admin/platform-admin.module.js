"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformAdminModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const platform_auth_controller_1 = require("./platform-auth.controller");
const platform_metrics_controller_1 = require("./platform-metrics.controller");
const platform_filing_controller_1 = require("./platform-filing.controller");
const platform_auth_service_1 = require("./services/platform-auth.service");
const platform_metrics_service_1 = require("./services/platform-metrics.service");
const platform_filing_service_1 = require("./services/platform-filing.service");
const platform_note_service_1 = require("./services/platform-note.service");
const platform_profile_service_1 = require("./services/platform-profile.service");
const platform_profile_controller_1 = require("./platform-profile.controller");
const aws_service_1 = require("../../common/aws/aws.service");
const platform_auth_guard_1 = require("./guards/platform-auth.guard");
let PlatformAdminModule = class PlatformAdminModule {
};
exports.PlatformAdminModule = PlatformAdminModule;
exports.PlatformAdminModule = PlatformAdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({}),
        ],
        controllers: [
            platform_auth_controller_1.PlatformAuthController,
            platform_metrics_controller_1.PlatformMetricsController,
            platform_filing_controller_1.PlatformFilingController,
            platform_profile_controller_1.PlatformProfileController,
        ],
        providers: [
            platform_auth_service_1.PlatformAuthService,
            platform_metrics_service_1.PlatformMetricsService,
            platform_filing_service_1.PlatformFilingService,
            platform_note_service_1.PlatformNoteService,
            platform_profile_service_1.PlatformProfileService,
            platform_auth_guard_1.PlatformAuthGuard,
            aws_service_1.AwsService,
            config_1.ConfigService,
        ],
        exports: [
            platform_auth_service_1.PlatformAuthService,
            platform_metrics_service_1.PlatformMetricsService,
            platform_filing_service_1.PlatformFilingService,
            platform_note_service_1.PlatformNoteService,
            platform_profile_service_1.PlatformProfileService,
        ],
    })
], PlatformAdminModule);
//# sourceMappingURL=platform-admin.module.js.map