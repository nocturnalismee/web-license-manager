<?php

declare(strict_types=1);

require __DIR__ . '/../src/IndoLicenseException.php';
require __DIR__ . '/../src/IndoLicenseClient.php';

use IndoLicense\IndoLicenseClient;
use IndoLicense\IndoLicenseException;

$calls = 0;
$client = new IndoLicenseClient('https://example.test', 1, 2, 30, function () use (&$calls): array {
    $calls++;
    if ($calls === 1) return ['status' => 503, 'body' => ['error' => ['code' => 'TEMPORARY']]];
    return ['status' => 200, 'body' => ['data' => ['status' => 'active']]];
});
assert($client->validate('prod_123456789012345678901234', 'license-key', 'install-01', 'example.com')['status'] === 'active');
assert($client->validate('prod_123456789012345678901234', 'license-key', 'install-01', 'example.com')['status'] === 'active');
assert($calls === 2, 'validate cache should avoid the second network request');

$failed = new IndoLicenseClient('https://example.test', 1, 0, 0, static fn () => ['status' => 409, 'body' => ['request_id' => 'req-1', 'error' => ['code' => 'LICENSE_EXPIRED', 'message' => 'expired']]]);
try { $failed->activate('prod_123456789012345678901234', 'license-key', 'install-01', 'example.com'); assert(false); } catch (IndoLicenseException $error) { assert($error->errorCode === 'LICENSE_EXPIRED'); assert($error->requestId === 'req-1'); }

echo "PHP SDK tests passed\n";
