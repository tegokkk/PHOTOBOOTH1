$projectRoot = Split-Path -Parent $PSScriptRoot
$date = Get-Date -Format "yyyyMMdd_HHmmss"
$backupRoot = Join-Path $projectRoot "backups"
$backupDir = Join-Path $backupRoot $date
$zipFile = Join-Path $backupRoot "ririi_backup_$date.zip"
$databasePath = if ($env:PHOTOBOOTH_DATABASE_FILE) { $env:PHOTOBOOTH_DATABASE_FILE } else { Join-Path $projectRoot "backend\prisma\dev.db" }
$uploadsPath = if ($env:PHOTOBOOTH_UPLOAD_DIR) { $env:PHOTOBOOTH_UPLOAD_DIR } else { Join-Path $projectRoot "backend\uploads" }

Write-Host "Memulai proses backup RIRII..."

# Buat folder backup utama jika belum ada
if (!(Test-Path -LiteralPath $backupRoot)) {
    New-Item -ItemType Directory -Path $backupRoot | Out-Null
}

# Buat folder sementara untuk menyimpan file yang akan dizip
New-Item -ItemType Directory -Path $backupDir | Out-Null

Write-Host "Menyalin file database..."
if (Test-Path -LiteralPath $databasePath) {
    Copy-Item -LiteralPath $databasePath -Destination $backupDir
} else {
    throw "Database file not found: $databasePath"
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
