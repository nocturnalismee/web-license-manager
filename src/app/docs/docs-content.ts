export type DocPage = { slug: string; group: string; title: string; description: string; content: "intro" | "validate" | "activate" | "deactivate" | "status" | "limits" | "webhooks" | "errors" | "javascript" | "php" };
export const docsPages: DocPage[] = [
  { slug: "quickstart", group: "Getting started", title: "Quickstart", description: "Connect your first product and make a license request in minutes.", content: "intro" },
  { slug: "validate", group: "License API", title: "Validate a license", description: "Check whether a license is currently valid for an installation.", content: "validate" },
  { slug: "activate", group: "License API", title: "Activate an installation", description: "Bind a license to a stable installation ID on first run.", content: "activate" },
  { slug: "deactivate", group: "License API", title: "Deactivate an installation", description: "Release an installation before uninstall or device migration.", content: "deactivate" },
  { slug: "status", group: "License API", title: "License status", description: "POST /api/v1/licenses/status with Authorization: Bearer sk_live_… returning { status, expires_at, activation_count }.", content: "status" },
  { slug: "rate-limits", group: "Reference", title: "Rate limits", description: "Validate 60/min and activate/deactivate 10/min per installation + IP with Retry-After.", content: "limits" },
  { slug: "webhooks", group: "Reference", title: "Webhooks", description: "Signatures are required in all environments (missing secret → 503, bad signature → 401, oversized → 413).", content: "webhooks" },
  { slug: "errors", group: "Reference", title: "Errors", description: "Handle response codes and recoverable license failures.", content: "errors" },
  { slug: "javascript", group: "SDKs", title: "JavaScript / TypeScript", description: "Integrate IndoLicense with the JavaScript reference SDK.", content: "javascript" },
  { slug: "php", group: "SDKs", title: "PHP", description: "Integrate IndoLicense with the PHP reference SDK.", content: "php" },
];
export const docsGroups = ["Getting started", "License API", "Reference", "SDKs"];
