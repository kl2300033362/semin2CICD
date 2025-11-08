# semin2CICD — Travel Booking (monorepo)

This repository contains the backend and frontend for the Travel Booking demo and helpful Docker/CI scripts.

## Clone the repository

Open a command prompt or PowerShell and run:

```powershell
# clone and enter the repo
git clone https://github.com/kl2300033362/semin2CICD.git
cd semin2CICD
```

## Run the backend (Windows PowerShell / CMD)

The backend is a Spring Boot application in `travel_booking_backend`.

1) Build with the included Maven wrapper (recommended):

```powershell
cd travel_booking_backend
# Windows (PowerShell / CMD)
.mvnw.cmd -DskipTests package
# or if you have Maven installed
mvn -DskipTests package
```

2) Run the produced jar:

```powershell
# from travel_booking_backend
java -jar target\*.jar
```

Alternative: run directly with the wrapper (development):

```powershell
cd travel_booking_backend
.mvnw.cmd spring-boot:run
```

Environment variables (recommended to set when running in Docker or production):
- SPRING_DATASOURCE_URL — JDBC URL for MySQL (example: `jdbc:mysql://db:3306/tours_travel_system`)
- SPRING_DATASOURCE_USERNAME
- SPRING_DATASOURCE_PASSWORD
- IMAGE_FOLDER_PATH
- ALLOWED_ORIGINS (CORS, comma-separated)

## Run the frontend (Windows PowerShell / CMD)

The frontend is a React app in `travel_booking_frontend`.

1) Install dependencies and run in development:

```powershell
cd travel_booking_frontend
npm ci
npm start
# open http://localhost:3000
```

2) Build production bundle:

```powershell
npm ci
npm run build
```

3) Serve with Docker (build & run):

```powershell
# build image
docker build -t kl2300033362/travel_frontend:local .
# run (serves on container port 80 mapped to host 3000)
docker run -p 3000:80 --env REACT_APP_API_URL="http://localhost:8080" kl2300033362/travel_frontend:local
```

Note: The frontend reads `REACT_APP_API_URL` at build/runtime (build-time for CRA). When using docker-compose we pass the correct API URL via build args or proxy settings.

## Run both services locally with Docker Compose

There are two compose files included:
- `docker-compose.yml` — builds images from the local source and runs DB + backend + frontend
- `docker-compose.hub.yml` — uses images from Docker Hub (kl2300033362/travel_backend and kl2300033362/travel_frontend)

Example — build locally and start:

```powershell
# from repo root
docker-compose up -d --build
# view logs
docker-compose logs -f
```

Example — run using images from Docker Hub:

```powershell
docker-compose -f docker-compose.hub.yml up -d
```

## Build & push Docker images (local)

A helper script `build_and_push.ps1` is provided. Usage:

```powershell
# set DOCKERHUB_PASS in your shell for non-interactive login (do NOT commit your secrets)
$env:DOCKERHUB_PASS = 'YOUR_DOCKERHUB_TOKEN_OR_PASSWORD'
.
\build_and_push.ps1 -DockerHubUser kl2300033362 -Tag latest
```

This will build the backend jar (using mvnw), build both images, and push them to `kl2300033362/travel_backend` and `kl2300033362/travel_frontend` on Docker Hub.

## CI (GitHub Actions)

Workflows are included to build and push images when changes are pushed to `main`. Configure the following repository secrets in GitHub:
- `DOCKERHUB_USERNAME` = your Docker Hub username
- `DOCKERHUB_TOKEN` = Docker Hub access token (preferred) or password

## Notes and troubleshooting

- If the backend Docker build fails because `target/*.jar` is missing, build the jar locally first with `mvnw.cmd -DskipTests package`.
- Large binary files (e.g., backups) shouldn't be kept in Git. Consider using Git LFS if needed.
- If you want me to perform automated pushes or cleanups (remove embedded repos, remove the backup zip from Git history), tell me and I will proceed after creating a safe archive backup.

---
