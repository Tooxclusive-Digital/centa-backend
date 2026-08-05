export declare const theme: {
    readonly brand: "#00626F";
    readonly pageBg: "#f5f7f9";
    readonly cardBg: "#ffffff";
    readonly cardBorder: "#eef2f6";
    readonly panelBg: "#f8fafc";
    readonly panelBorder: "#e8eef4";
    readonly text: "#0f172a";
    readonly body: "#334155";
    readonly muted: "#64748b";
    readonly faint: "#94a3b8";
    readonly font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, Helvetica, sans-serif";
};
export declare const DEFAULT_LOGO_URL = "https://centa-hr.s3.eu-west-3.amazonaws.com/company-files/7beedcd5-66c3-4351-8955-ddcab3528652/5cf61059-52be-4c46-9d4e-9817f2b9257b/1769600186954-1768990436384-logo-CqG_6WrI.png";
export declare function esc(value: unknown): string;
export declare function escUrl(value: unknown): string;
export declare function fromHeader(displayName: string, address: string): string;
export declare function button(href: string, label: string): string;
export declare function linkFallback(href: string, lead?: string): string;
export declare function detailRow(label: string, value: unknown): string;
export declare function panel(inner: string): string;
export interface LayoutOptions {
    title: string;
    preheader: string;
    heading: string;
    subheading?: string;
    body: string;
    cta?: string;
    footer?: string;
    logoUrl?: string;
    logoAlt?: string;
}
export declare function layout({ title, preheader, heading, subheading, body, cta, footer, logoUrl, logoAlt, }: LayoutOptions): string;
