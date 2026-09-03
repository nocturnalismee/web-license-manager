<?php

declare(strict_types=1);

namespace IndoLicense;

final class IndoLicenseClient
{
    /** @var array<string, array{expires: float, value: array<string, mixed>}> */
    private array $validateCache = [];

    /** @var callable|null */
    private $transport;

    public function __construct(
        private readonly string $baseUrl,
        private readonly int $timeoutSeconds = 5,
        private readonly int $maxRetries = 2,
        private readonly int $validateCacheTtlSeconds = 30,
        ?callable $transport = null,
    ) {
        if ($timeoutSeconds < 1 || $maxRetries < 0 || $validateCacheTtlSeconds < 0) {
            throw new \InvalidArgumentException('Invalid IndoLicense client configuration.');
        }
        $this->transport = $transport;
    }

    /** @return array<string, mixed> */
    public function validate(string $productPublicId, string $licenseKey, string $installationId, string $domain): array
    {
        $payload = $this->payload($productPublicId, $licenseKey, $installationId, $domain);
        $cacheKey = hash('sha256', json_encode($payload, JSON_THROW_ON_ERROR));
        if ($this->validateCacheTtlSeconds > 0 && isset($this->validateCache[$cacheKey]) && $this->validateCache[$cacheKey]['expires'] > microtime(true)) {
            return $this->validateCache[$cacheKey]['value'];
        }
        $value = $this->request('/api/v1/licenses/validate', $payload);
        if ($this->validateCacheTtlSeconds > 0) $this->validateCache[$cacheKey] = ['expires' => microtime(true) + $this->validateCacheTtlSeconds, 'value' => $value];
        return $value;
    }

    /** @return array<string, mixed> */
    public function activate(string $productPublicId, string $licenseKey, string $installationId, string $domain): array
    {
        return $this->request('/api/v1/licenses/activate', $this->payload($productPublicId, $licenseKey, $installationId, $domain));
    }

    /** @return array<string, mixed> */
    public function deactivate(string $productPublicId, string $licenseKey, string $installationId, string $domain): array
    {
        return $this->request('/api/v1/licenses/deactivate', $this->payload($productPublicId, $licenseKey, $installationId, $domain));
    }

    /** @return array<string, string> */
    private function payload(string $productPublicId, string $licenseKey, string $installationId, string $domain): array
    {
        foreach ([$productPublicId, $licenseKey, $installationId, $domain] as $value) if (trim($value) === '') throw new \InvalidArgumentException('License request fields cannot be empty.');
        return ['product_public_id' => $productPublicId, 'license_key' => $licenseKey, 'installation_id' => $installationId, 'domain' => $domain];
    }

    /** @param array<string, string> $payload @return array<string, mixed> */
    private function request(string $path, array $payload): array
    {
        $attempt = 0;
        while (true) {
            try {
                $response = $this->transport ? ($this->transport)($path, $payload, $this->timeoutSeconds) : $this->curl($path, $payload);
            } catch (\Throwable $error) {
                if ($attempt++ < $this->maxRetries) { usleep((int) (100000 * (2 ** $attempt))); continue; }
                throw new IndoLicenseException('IndoLicense network request failed.', 'NETWORK_ERROR', 0, null, null);
            }
            $status = (int) ($response['status'] ?? 0);
            $body = is_array($response['body'] ?? null) ? $response['body'] : [];
            if ($status >= 200 && $status < 300 && isset($body['data']) && is_array($body['data'])) return $body['data'];
            $error = is_array($body['error'] ?? null) ? $body['error'] : [];
            $retryAfter = isset($response['retry_after']) ? (int) $response['retry_after'] : null;
            $retryable = $status === 408 || $status === 429 || $status >= 500;
            if ($retryable && $attempt++ < $this->maxRetries) { sleep(min(5, max(1, $retryAfter ?? (2 ** $attempt)))); continue; }
            throw new IndoLicenseException((string) ($error['message'] ?? 'IndoLicense request failed.'), (string) ($error['code'] ?? 'REQUEST_FAILED'), $status, isset($body['request_id']) ? (string) $body['request_id'] : null, $retryAfter);
        }
    }

    /** @return array{status: int, body: array<string, mixed>, retry_after?: int} */
    private function curl(string $path, array $payload): array
    {
        $handle = curl_init(rtrim($this->baseUrl, '/') . $path);
        if ($handle === false) throw new \RuntimeException('Unable to initialize cURL.');
        curl_setopt_array($handle, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => $this->timeoutSeconds, CURLOPT_TIMEOUT => $this->timeoutSeconds, CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Accept: application/json'], CURLOPT_POSTFIELDS => json_encode($payload, JSON_THROW_ON_ERROR)]);
        $raw = curl_exec($handle);
        $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
        $retryAfter = curl_getinfo($handle, CURLINFO_RETRY_AFTER);
        if ($raw === false) { $message = curl_error($handle); curl_close($handle); throw new \RuntimeException($message); }
        curl_close($handle);
        $body = json_decode($raw, true);
        return ['status' => $status, 'body' => is_array($body) ? $body : [], 'retry_after' => is_numeric($retryAfter) ? (int) $retryAfter : 0];
    }
}
