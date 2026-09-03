# IndoLicense JavaScript/TypeScript SDK

Reference SDK untuk Node.js 18+ dan aplikasi JavaScript/TypeScript yang memakai `fetch`.

```bash
npm install @indolicense/javascript
```

```ts
import { IndoLicenseClient } from "@indolicense/javascript";

const client = new IndoLicenseClient("https://your-indolicense.example.com");
const result = await client.validate({
  productPublicId: "prod_...",
  licenseKey: "...",
  installationId: "server-01",
  domain: "example.com",
});
```

`validate()` memakai cache in-memory 30 detik secara default. Semua request memiliki timeout 5 detik dan retry maksimal dua kali untuk network error, 408, 429, dan 5xx. `activate()` dan `deactivate()` tidak di-cache. Error dilempar sebagai `IndoLicenseError` dengan `errorCode`, `httpStatus`, `requestId`, dan `retryAfterSeconds`.
