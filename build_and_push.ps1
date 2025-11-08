<#
Build and push backend/frontend Docker images to Docker Hub.

Usage:
  1) Open PowerShell in repository root.
  2) Run: .\build_and_push.ps1 -DockerHubUser kl2300033362 -Tag latest

This script will:
  - Build the backend jar with Maven
  - Build the backend image using Dockerfile.local (fast)
  - Build the frontend image using the frontend Dockerfile
  - Tag images and push to Docker Hub

You will be prompted for Docker Hub credentials if not logged in.
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$DockerHubUser,
  [string]$Tag = "latest",
  [string]$RemoteBackendRepo = "",
  [string]$RemoteFrontendRepo = ""
)

Set-StrictMode -Version Latest

function Run-Command {
  param($cmd)
  Write-Host "==> $cmd"
  iex $cmd
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $root

# If remote repos provided, clone them into temp folders and use them
$backendDir = "travel_booking_backend"
$frontendDir = "travel_booking_frontend"
if ($RemoteBackendRepo -and $RemoteBackendRepo.Trim() -ne "") {
  Write-Host "Cloning remote backend repo: $RemoteBackendRepo"
  $backendDir = Join-Path $root "remote_backend"
  if (Test-Path $backendDir) { Remove-Item -Recurse -Force $backendDir }
  git clone --depth 1 $RemoteBackendRepo $backendDir
}
if ($RemoteFrontendRepo -and $RemoteFrontendRepo.Trim() -ne "") {
  Write-Host "Cloning remote frontend repo: $RemoteFrontendRepo"
  $frontendDir = Join-Path $root "remote_frontend"
  if (Test-Path $frontendDir) { Remove-Item -Recurse -Force $frontendDir }
  git clone --depth 1 $RemoteFrontendRepo $frontendDir
}

Write-Host "Building backend jar... (from $backendDir)"
Push-Location $backendDir
if (Test-Path "./mvnw.cmd") {
  & .\mvnw.cmd -DskipTests package
} else {
  mvn -DskipTests package
}
Pop-Location

Write-Host "Building backend Docker image (uses Dockerfile.local)..."
$backendImage = "$DockerHubUser/travel_backend:$Tag"
# Prefer the fast local Dockerfile that copies a pre-built jar. If the jar isn't present, fall back to the multi-stage Dockerfile
$backendJar = Get-ChildItem -Path (Join-Path $backendDir 'target') -Filter '*.jar' -ErrorAction SilentlyContinue | Select-Object -First 1
if ($backendJar) {
  Write-Host "Found built jar: $($backendJar.Name). Using Dockerfile.local to build (faster)."
  $backendDockerfile = Join-Path $backendDir 'Dockerfile.local'
} else {
  Write-Host "No built jar found in $backendDir/target. Falling back to multi-stage Dockerfile to build inside container."
  $backendDockerfile = Join-Path $backendDir 'Dockerfile'
}

docker build -t $backendImage -f "$backendDockerfile" "$backendDir"

Write-Host "Building frontend Docker image..."
$frontendImage = "$DockerHubUser/travel_frontend:$Tag"
docker build -t $frontendImage -f "$frontendDir/Dockerfile" "$frontendDir"

Write-Host "Logging in to Docker Hub (if needed)..."
try {
  docker info | Out-Null
} catch {
  Write-Host "Docker does not appear to be running or accessible. Ensure Docker Desktop is started."; exit 1
}

Write-Host "Logging in to Docker Hub (if needed)..."
# Support non-interactive login via DOCKERHUB_PASS env var for CI
if ($env:DOCKERHUB_PASS -and $env:DOCKERHUB_PASS.Trim() -ne "") {
  Write-Host "Detected DOCKERHUB_PASS environment variable, attempting non-interactive login..."
  try {
    $env:DOCKERHUB_PASS | docker login --username $DockerHubUser --password-stdin
  } catch {
    Write-Host "Non-interactive Docker login failed or unsupported; falling back to interactive login."
    docker login --username $DockerHubUser
  }
} else {
  Write-Host "Please login to Docker Hub (if not already):"
  docker login --username $DockerHubUser
}

Write-Host "Pushing images to Docker Hub..."
docker push $backendImage
docker push $frontendImage

Write-Host "Done. Pushed: $backendImage and $frontendImage"
Pop-Location
