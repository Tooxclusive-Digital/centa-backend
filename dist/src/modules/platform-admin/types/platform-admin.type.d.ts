export interface PlatformAdminUser {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    lastLogin: Date | null;
}
export interface PlatformJwtPayload {
    sub: string;
    email: string;
    type: 'platform';
}
export interface PlatformAuthenticatedRequest {
    user?: PlatformAdminUser;
    url: string;
    method: string;
    headers: Record<string, any>;
    cookies?: Record<string, string>;
}
