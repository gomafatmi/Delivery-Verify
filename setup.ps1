# Delivery Verify — Setup Script
# Run this from the project root: .\setup.ps1

$ErrorActionPreference = "Stop"
$PG_VERSION = "17"
$PG_BIN = "C:\Program Files\PostgreSQL\$PG_VERSION\bin"
$PG_PORT = 5433

# 1. Verify PostgreSQL
Write-Host "[1/4] Checking PostgreSQL..." -ForegroundColor Cyan
if (-not (Get-Service "postgresql-x64-$PG_VERSION" -ErrorAction SilentlyContinue)) {
    Write-Host "PostgreSQL $PG_VERSION is not installed." -ForegroundColor Red
    exit 1
}
$svc = Get-Service "postgresql-x64-$PG_VERSION"
if ($svc.Status -ne "Running") {
    Write-Host "Starting PostgreSQL..." -ForegroundColor Yellow
    Start-Service $svc.Name
}

# 2. Create database
Write-Host "[2/4] Creating database..." -ForegroundColor Cyan
$env:PGPASSWORD = "postgres"
& "$PG_BIN\psql.exe" -U postgres -p $PG_PORT -c "SELECT 1" -q 2>&1 | Out-Null
$exists = & "$PG_BIN\psql.exe" -U postgres -p $PG_PORT -t -c "SELECT 1 FROM pg_database WHERE datname='delivery_verify'" 2>&1
if (-not $exists) {
    & "$PG_BIN\psql.exe" -U postgres -p $PG_PORT -c "CREATE DATABASE delivery_verify" -q
    Write-Host "  Database created." -ForegroundColor Green
} else {
    Write-Host "  Database already exists." -ForegroundColor Yellow
}

# 3. Run migration
Write-Host "[3/4] Applying schema..." -ForegroundColor Cyan
$migration = Join-Path $PSScriptRoot "migrations\001_initial.sql"
if (Test-Path $migration) {
    & "$PG_BIN\psql.exe" -U postgres -p $PG_PORT -d delivery_verify -f $migration -q
    Write-Host "  Schema applied." -ForegroundColor Green
}

# 4. Update .env.local
Write-Host "[4/4] Configuring environment..." -ForegroundColor Cyan
$envFile = Join-Path $PSScriptRoot ".env.local"
$content = @"
PGHOST=localhost
PGPORT=$PG_PORT
PGDATABASE=delivery_verify
PGUSER=postgres
PGPASSWORD=postgres
NEXTAUTH_SECRET=dev-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000
"@
Set-Content -Path $envFile -Value $content
Write-Host "  .env.local configured." -ForegroundColor Green

Write-Host ""
Write-Host "Setup complete! Run: npm run dev" -ForegroundColor Green
