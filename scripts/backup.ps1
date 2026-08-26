$projectRoot = Split-Path -Parent $PSScriptRoot
$date = Get-Date -Format "yyyyMMdd_HHmmss"
$backupRoot = Join-Path $projectRoot "backups"
$backupDir = Join-Path $backupRoot $date
$zipFile = Join-Path $backupRoot "ririi_backup_$date.zip"
$databaseUrl = if ($env:PHOTOBOOTH_DATABASE_URL) { $env:PHOTOBOOTH_DATABASE_URL } elseif ($env:DATABASE_URL) { $env:DATABASE_URL } else { $null }
$databasePath = if ($env:PHOTOBOOTH_DATABASE_FILE) { $env:PHOTOBOOTH_DATABASE_FILE } else { Join-Path $projectRoot "backend\prisma\dev.db" }
$uploadsPath = if ($env:PHOTOBOOTH_UPLOAD_DIR) { $env:PHOTOBOOTH_UPLOAD_DIR } else { Join-Path $projectRoot "backend\uploads" }

Write-Host "Memulai proses backup RIRII..."

# Buat folder backup utama jika belum ada
if (!(Test-Path -LiteralPath $backupRoot)) {
    New-Item -ItemType Directory -Path $backupRoot | Out-Null
}

# Buat folder sementara untuk menyimpan file yang akan dizip
New-Item -ItemType Directory -Path $backupDir | Out-Null

Write-Host "Mencadangkan database..."
if ($databaseUrl -and $databaseUrl -match '^postgres(?:ql)?://') {
    $dumpPath = Join-Path $backupDir "database.dump"
    if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
        throw "pg_dump tidak ditemukan. Install PostgreSQL client atau gunakan PHOTOBOOTH_DATABASE_FILE untuk database lokal."
    }
    & pg_dump --format=custom --file=$dumpPath $databaseUrl
    if ($LASTEXITCODE -ne 0) { throw "pg_dump gagal dengan exit code $LASTEXITCODE" }
} elseif (Test-Path -LiteralPath $databasePath) {
    Copy-Item -LiteralPath $databasePath -Destination $backupDir
} else {
    throw "Database PostgreSQL belum dikonfigurasi dan file database tidak ditemukan: $databasePath"
}

Write-Host "Menyalin folder uploads..."
if (Test-Path -LiteralPath $uploadsPath) {
    Copy-Item -LiteralPath $uploadsPath -Destination (Join-Path $backupDir "uploads") -Recurse
}

Write-Host "Membuat arsip zip..."
Compress-Archive -Path (Join-Path $backupDir "*") -DestinationPath $zipFile

Write-Host "Membersihkan folder sementara..."
Remove-Item -LiteralPath $backupDir -Recurse -Force

Write-Host "Backup selesai! File tersimpan di: $zipFile"
