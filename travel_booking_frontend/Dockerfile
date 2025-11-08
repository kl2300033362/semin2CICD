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

## Use a lightweight Apache httpd image to serve the static build. Some
## hosts have issues executing the nginx binary in the alpine image; httpd
## tends to be more portable across environments.
FROM httpd:2.4-alpine
COPY --from=build /app/build /usr/local/apache2/htdocs/

# Expose httpd on port 80 (mapped to host:3000 in docker-compose)
EXPOSE 80
CMD ["httpd-foreground"]