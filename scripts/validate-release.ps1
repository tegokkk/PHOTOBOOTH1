$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot

function Invoke-Checked {
    param(
        [Parameter(Mandatory = $true)][string]$WorkingDirectory,
        [Parameter(Mandatory = $true)][string]$FilePath,
        [Parameter(Mandatory = $false)][string[]]$Arguments = @()
    )

    Push-Location -LiteralPath $WorkingDirectory
    try {
        & $FilePath @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "Command failed ($LASTEXITCODE): $FilePath $($Arguments -join ' ')"
        }
    }
    finally {
        Pop-Location
    }
}

$trackedForbidden = git ls-files | Select-String -Pattern '(^|/)(\.env$|dev\.db$|uploads/|node_modules/|\.next/|logs/|backups/|ARCHIVE/backup/)'
if ($trackedForbidden) {
    throw "Sensitive or generated paths are still tracked:`n$($trackedForbidden -join "`n")"
}

$frameReferences = foreach ($line in Get-Content -LiteralPath (Join-Path $projectRoot "backend\prisma\seed.js")) {
    if ($line -match "imageUrl:\s*'(/frames/[^']+)'") {
        $matches[1]
    }
}
foreach ($frameReference in $frameReferences) {
    $framePath = Join-Path $projectRoot ("frontend\public" + $frameReference.Replace('/', '\'))
    if (-not (Test-Path -LiteralPath $framePath -PathType Leaf)) {
        throw "Seeded frame asset is missing: $frameReference"
    }
}
$oversizedFrameAssets = Get-ChildItem -LiteralPath (Join-Path $projectRoot "frontend\public\frames") -File |
    Where-Object { $_.Length -gt 5MB }
if ($oversizedFrameAssets) {
    throw "Frame assets exceed 5 MB:`n$($oversizedFrameAssets.FullName -join "`n")"
}

$trackedSourceFiles = git ls-files | Where-Object {
    $_ -notmatch '(^|/)(\.env\.example|package-lock\.json)$' -and
    $_ -notmatch '(^|/)(node_modules|\.next|uploads|backups|logs)(/|$)'
}
$secretPatterns = @(
    '-----BEGIN (RSA|OPENSSH|EC|DSA|PGP) PRIVATE KEY-----',
    'AKIA[0-9A-Z]{16}',
    '(?i)(JWT_SECRET|SECRET_KEY|AWS_SECRET_ACCESS_KEY)\s*[:=]\s*["'']?[A-Za-z0-9+/=_-]{16,}'
)
$secretMatches = foreach ($sourceFile in $trackedSourceFiles) {
    foreach ($secretPattern in $secretPatterns) {
        Select-String -LiteralPath $sourceFile -Pattern $secretPattern -AllMatches -ErrorAction SilentlyContinue |
            Where-Object { $_.Line -notmatch 'gunakan_string_acak_minimal_32_karakter|generate_a_secure_random_string_with_at_least_32_characters' }
    }
}
if ($secretMatches) {
    throw "Potential hardcoded secret found in tracked source:`n$($secretMatches -join "`n")"
}
Write-Host "[1/9] Repository hygiene, frame assets, and secret scan"

$backendRoot = Join-Path $projectRoot "backend"
$frontendRoot = Join-Path $projectRoot "frontend"

Write-Host "[2/9] Backend tests"
Invoke-Checked $backendRoot "npm.cmd" @("test", "--", "--runInBand")

Write-Host "[3/9] Prisma validation"
Invoke-Checked $backendRoot "npx.cmd" @("prisma", "validate")

Write-Host "[4/9] Prisma migration status"
$migrationDatabaseUrl = $env:PHOTOBOOTH_MIGRATION_DATABASE_URL
$backendEnvPath = Join-Path $backendRoot ".env"
$poolerConfigured = (Test-Path -LiteralPath $backendEnvPath) -and (Select-String -LiteralPath $backendEnvPath -Pattern ":6543" -Quiet)
if ($migrationDatabaseUrl) {
    $previousDatabaseUrl = $env:DATABASE_URL
    try {
        $env:DATABASE_URL = $migrationDatabaseUrl
        Invoke-Checked $backendRoot "npx.cmd" @("prisma", "migrate", "status")
    }
    finally {
        $env:DATABASE_URL = $previousDatabaseUrl
    }
} elseif ($poolerConfigured) {
    Write-Warning "Migration status dilewati karena backend/.env memakai transaction pooler. Set PHOTOBOOTH_MIGRATION_DATABASE_URL ke direct PostgreSQL URL untuk memeriksanya."
} else {
    Invoke-Checked $backendRoot "npx.cmd" @("prisma", "migrate", "status")
}

Write-Host "[5/9] Backend dependency audit"
Invoke-Checked $backendRoot "npm.cmd" @(
    "audit",
    "--omit=dev",
    "--audit-level=high",
    "--fetch-timeout=30000",
    "--fetch-retries=1",
    "--fetch-retry-mintimeout=1000",
    "--fetch-retry-maxtimeout=5000"
)

Write-Host "[6/9] Frontend lint"
Invoke-Checked $frontendRoot "npm.cmd" @("run", "lint")

Write-Host "[7/9] Frontend dependency audit"
Invoke-Checked $frontendRoot "npm.cmd" @(
    "audit",
    "--omit=dev",
    "--audit-level=high",
    "--fetch-timeout=30000",
    "--fetch-retries=1",
    "--fetch-retry-mintimeout=1000",
    "--fetch-retry-maxtimeout=5000"
)

Write-Host "[8/9] Frontend production build"
Invoke-Checked $frontendRoot "npm.cmd" @("run", "build")

Write-Host "[9/9] Release gate complete"
