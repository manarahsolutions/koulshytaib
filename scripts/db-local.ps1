param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("start", "stop", "status")]
  [string]$Command
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$DataDir = Join-Path $Root ".postgres-data"
$LogFile = Join-Path $DataDir "pg.log"
$PgBin = "C:\Program Files\PostgreSQL\16\bin"
$Port = 5433

if (-not (Test-Path (Join-Path $PgBin "pg_ctl.exe"))) {
  Write-Error "PostgreSQL 16 binaries not found at $PgBin"
}

$env:Path = "$PgBin;$env:Path"

if (-not (Test-Path $DataDir)) {
  Write-Error "Missing $DataDir — run init once (see docs/runtime-database.md)"
}

switch ($Command) {
  "start" {
    & pg_ctl -D $DataDir -l $LogFile -o "-p $Port" start
  }
  "stop" {
    & pg_ctl -D $DataDir -m fast stop
  }
  "status" {
    & pg_ctl -D $DataDir status
    & pg_isready -h 127.0.0.1 -p $Port
  }
}
