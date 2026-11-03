# Build stage
FROM eclipse-temurin:17-jdk AS builder
WORKDIR /workspace/app

COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src ./src
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /workspace/app/target/*.jar app.jar

ENV PORT=8081
EXPOSE 8081

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
