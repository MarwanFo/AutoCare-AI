# ==============================================================================
# AutoCare-AI - Backend Dockerfile (Multi-stage build)
# Java 21 / Spring Boot 3 / Eclipse Temurin
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build & Package with Maven
# ------------------------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Cache dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# Extract Spring Boot layered jar for optimal Docker caching
WORKDIR /app/target
RUN java -Djarmode=layertools -jar *.jar extract

# ------------------------------------------------------------------------------
# Stage 2: Runtime Image (Lightweight & Secure)
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create unprivileged system user for security
RUN addgroup -S autocare && adduser -S autocare -G autocare

# Copy extracted layers from builder
COPY --from=builder --chown=autocare:autocare /app/target/dependencies/ ./
COPY --from=builder --chown=autocare:autocare /app/target/spring-boot-loader/ ./
COPY --from=builder --chown=autocare:autocare /app/target/snapshot-dependencies/ ./
COPY --from=builder --chown=autocare:autocare /app/target/application/ ./

# Create uploads folder with proper permissions
RUN mkdir -p /app/uploads && chown -R autocare:autocare /app/uploads

USER autocare

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]
