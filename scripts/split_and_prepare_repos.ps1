<#
Split the monorepo into two temporary repositories (backend and frontend), add a GitHub Actions workflow to each for building & pushing Docker images, initialize git, and optionally push to remote GitHub repos.

Usage (dry-run):
  .\scripts\split_and_prepare_repos.ps1 -BackendRemoteUrl https://github.com/kl2300033362/travel-backend.git -FrontendRemoteUrl https://github.com/kl2300033362/travel-fronend.git -DockerHubUser kl2300033362

To actually push to the remotes (requires git credentials):
  .\scripts\split_and_prepare_repos.ps1 -BackendRemoteUrl <url> -FrontendRemoteUrl <url> -DockerHubUser <dhuser> -Push

Notes:
- This script creates `temp_backend_repo` and `temp_frontend_repo` directories at the repo root.
- It will NOT overwrite those dirs unless you pass -Force.
- You should review the created folders before pushing.
- The script attempts to create a main branch if not present.
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$BackendRemoteUrl,
  [Parameter(Mandatory=$true)]
  [string]$FrontendRemoteUrl,
  [Parameter(Mandatory=$true)]
  [string]$DockerHubUser,
  [switch]$Push,
  [switch]$Force
)

Set-StrictMode -Version Latest
# Determine repository root (one level up from this scripts folder)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path (Join-Path $scriptDir "..")
Push-Location $root

function Copy-Project {
  param(
    [string]$SourceDir,
    [string]$DestDir,
    [string[]]$Exclude = @()
  )

  if (Test-Path $DestDir) {
    if (-not $Force) { throw "Destination $DestDir already exists. Use -Force to overwrite." }
    Remove-Item -Recurse -Force $DestDir
  }
  New-Item -ItemType Directory -Path $DestDir | Out-Null

  Write-Host "Copying $SourceDir -> $DestDir"
  $items = Get-ChildItem -Path $SourceDir -Force
  foreach ($it in $items) {
    if ($Exclude -contains $it.Name) { continue }
    $destPath = Join-Path $DestDir $it.Name
    if ($it.PSIsContainer) {
      Copy-Item -Path $it.FullName -Destination $destPath -Recurse -Force -ErrorAction Stop
    } else {
      Copy-Item -Path $it.FullName -Destination $destPath -Force -ErrorAction Stop
    }
  }
}

# Backend
$backendSrc = Join-Path $root "travel_booking_backend"
$backendDest = Join-Path $root "temp_backend_repo"
$backendExclude = @('target','logs','.git')
Copy-Project -SourceDir $backendSrc -DestDir $backendDest -Exclude $backendExclude

# Create .gitignore for backend
$backendGitignore = @(
  "target/",
  "logs/",
  "*.log",
  ".idea/",
  "*.iml",
  "*.class",
  "node_modules/"
) -join "`n"
Set-Content -Path (Join-Path $backendDest ".gitignore") -Value $backendGitignore -Encoding UTF8

# Add .env.example
$envExample = @"
# Backend runtime environment (example)
SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/tours_travel_system?createDatabaseIfNotExist=true&useUnicode=true
SPRING_DATASOURCE_USERNAME=appuser
SPRING_DATASOURCE_PASSWORD=apppass
IMAGE_FOLDER_PATH=/app/images
"@
Set-Content -Path (Join-Path $backendDest ".env.example") -Value $envExample -Encoding UTF8

# Add GitHub Actions workflow for backend
$backendWorkflow = @'
name: Build and push backend image

on:
  push:
    branches: [ main ]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    env:
      IMAGE_TAG: ${{ github.sha }}
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Build JAR
        run: |
          if [ -f mvnw ]; then ./mvnw -B -DskipTests package; else mvn -B -DskipTests package; fi
        working-directory: .

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push image
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: |
            __DOCKERHUB_USER__/travel_backend:latest
            __DOCKERHUB_USER__/travel_backend:${{ github.sha }}
'@

$backendWorkflow = $backendWorkflow -replace '__DOCKERHUB_USER__', $DockerHubUser
$backendWorkflowPath = Join-Path $backendDest ".github\workflows\docker-publish-backend.yml"
New-Item -ItemType Directory -Path (Split-Path $backendWorkflowPath) -Force | Out-Null
Set-Content -Path $backendWorkflowPath -Value $backendWorkflow -Encoding UTF8

# Frontend
$frontendSrc = Join-Path $root "travel_booking_frontend"
$frontendDest = Join-Path $root "temp_frontend_repo"
$frontendExclude = @('build','node_modules','.git')
Copy-Project -SourceDir $frontendSrc -DestDir $frontendDest -Exclude $frontendExclude

# Create .gitignore for frontend
$frontendGitignore = @(
  "build/",
  "node_modules/",
  "npm-debug.log",
  "yarn-error.log",
  ".env.local"
) -join "`n"
Set-Content -Path (Join-Path $frontendDest ".gitignore") -Value $frontendGitignore -Encoding UTF8

# Add .env.example for frontend
$frontendEnvExample = @"
# Frontend build-time env (example)
REACT_APP_API_URL=http://backend:8080
"@
Set-Content -Path (Join-Path $frontendDest ".env.example") -Value $frontendEnvExample -Encoding UTF8

# Add GitHub Actions workflow for frontend
$frontendWorkflow = @'
name: Build and push frontend image

on:
  push:
    branches: [ main ]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install deps and build
        run: |
          npm ci
          npm run build
        working-directory: .

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push image
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: |
            __DOCKERHUB_USER__/travel_frontend:latest
            __DOCKERHUB_USER__/travel_frontend:${{ github.sha }}
'@

$frontendWorkflow = $frontendWorkflow -replace '__DOCKERHUB_USER__', $DockerHubUser
$frontendWorkflowPath = Join-Path $frontendDest ".github\workflows\docker-publish-frontend.yml"
New-Item -ItemType Directory -Path (Split-Path $frontendWorkflowPath) -Force | Out-Null
Set-Content -Path $frontendWorkflowPath -Value $frontendWorkflow -Encoding UTF8

# Initialize git repos and optionally push
function Init-And-Prepare-Repo {
  param(
    [string]$RepoDir,
    [string]$RemoteUrl,
    [string]$DefaultBranch = 'main'
  )

  Push-Location $RepoDir
  if (-not (Test-Path .git)) {
    git init
    git config user.email "you@example.com" 2>$null
    git config user.name "Your Name" 2>$null
  }
  git add .
  git commit -m "Initial import for split repo" -a --allow-empty
  git branch -M $DefaultBranch
  git remote remove origin 2>$null | Out-Null
  git remote add origin $RemoteUrl

  if ($Push) {
    Write-Host "Pushing $RepoDir to $RemoteUrl"
    git push -u origin $DefaultBranch
  } else {
    Write-Host "Prepared $RepoDir. Not pushed. To push, re-run with -Push or push manually:"
    Write-Host "  cd $RepoDir; git push -u origin $DefaultBranch"
  }

  Pop-Location
}

Init-And-Prepare-Repo -RepoDir $backendDest -RemoteUrl $BackendRemoteUrl
Init-And-Prepare-Repo -RepoDir $frontendDest -RemoteUrl $FrontendRemoteUrl

Pop-Location
Write-Host "Done. Review temp_backend_repo and temp_frontend_repo before pushing (if not pushed)."