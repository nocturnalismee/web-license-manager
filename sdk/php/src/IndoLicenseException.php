<?php

declare(strict_types=1);

namespace IndoLicense;

final class IndoLicenseException extends \RuntimeException
{
    public function __construct(
        string $message,
        public readonly string $errorCode,
        public readonly int $httpStatus = 0,
        public readonly ?string $requestId = null,
        public readonly ?int $retryAfterSeconds = null,
    ) {
        parent::__construct($message, $httpStatus);
    }
}
