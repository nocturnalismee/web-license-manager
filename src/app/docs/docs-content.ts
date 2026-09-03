export type DocPage = { slug: string; group: string; title: string; description: string; content: "intro" | "validate" | "activate" | "deactivate" | "limits" | "errors" | "javascript" | "php" };
export const docsPages: DocPage[] = [
  { slug: "quickstart", group: "Getting started", title: "Quickstart", description: "Connect your first product and make a license request in minutes.", content: "intro" },
  { slug: "validate", group: "License API", title: "Validate a license", description: "Check whether a license is currently valid for an installation.", content: "validate" },
  { slug: "activate", group: "License API", title: "Activate an installation", description: "Bind a license to a stable installation ID on first run.", content: "activate" },
  { slug: "deactivate", group: "License API", title: "Deactivate an installation", description: "Release an installation before uninstall or device migration.", content: "deactivate" },
  { slug: "rate-limits", group: "Reference", title: "Rate limits", description: "Understand public API limits and how to handle throttling.", content: "limits" },
  { slug: "errors", group: "Reference", title: "Errors", description: "Handle response codes and recoverable license failures.", content: "errors" },
  { slug: "javascript", group: "SDKs", title: "JavaScript / TypeScript", description: "Integrate IndoLicense with the JavaScript reference SDK.", content: "javascript" },
  { slug: "php", group: "SDKs", title: "PHP", description: "Integrate IndoLicense with the PHP reference SDK.", content: "php" },
];
export const docsGroups = ["Getting started", "License API", "Reference", "SDKs"];
