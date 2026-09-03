# IndoLicense PHP SDK

Reference SDK untuk integrasi license validation, activation, dan deactivation dari aplikasi PHP.

## Install

```bash
composer require indolicense/php-sdk
```

## Usage

```php
use IndoLicense\IndoLicenseClient;

$client = new IndoLicenseClient('https://your-indolicense.example.com');
$result = $client->validate($productPublicId, $licenseKey, $installationId, $domain);
```

`validate()` memakai in-memory cache 30 detik secara default. Request network dan HTTP 408/429/5xx akan diulang maksimal dua kali dengan backoff; error API dilempar sebagai `IndoLicenseException` dengan `errorCode`, `httpStatus`, dan `requestId`.

Do not cache activation/deactivation. Untuk aplikasi web multi-worker, cache validate sebaiknya tetap dianggap hint; server IndoLicense tetap source of truth.
