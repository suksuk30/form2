# Start Next.js with portable Node 20 (avoids system Node 24 SSL issues on this machine)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeDir = Join-Path $root ".tools\node20"

if (-not (Test-Path (Join-Path $nodeDir "node.exe"))) {
  Write-Host "Portable Node 20 not found at .tools\node20"
  Write-Host "Using system Node instead..."
} else {
  $env:Path = "$nodeDir;$env:Path"
  Write-Host "Using Node:" (& (Join-Path $nodeDir "node.exe") -v)
}

if (-not (Test-Path (Join-Path $root "node_modules\next\package.json"))) {
  Write-Host "node_modules/next missing. Run install first."
  exit 1
}

Set-Location $root
npm run dev
