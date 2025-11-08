### Backend Dockerfile (multi-stage)
FROM maven:3.8.8-eclipse-temurin-17 AS builder
WORKDIR /build

# Copy only what we need to build
COPY pom.xml ./
COPY src ./src

# Build the application
RUN mvn -B -DskipTests package

### Run stage
FROM eclipse-temurin:17-jdk
WORKDIR /app

# copy jar produced by builder
COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="-Xms256m -Xmx768m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]