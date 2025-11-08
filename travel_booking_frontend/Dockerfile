### Frontend Dockerfile: build React app and serve with nginx
FROM node:18-alpine AS build
WORKDIR /app

# copy package files first for better caching
COPY package.json package-lock.json* ./
RUN npm ci --silent

# copy rest of app
COPY public ./public
COPY src ./src

# Optional: allow overriding the backend API URL at build-time
ARG REACT_APP_API_URL=http://backend:8080
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html

# expose nginx on port 80 (we map to host:3000 in docker-compose)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]