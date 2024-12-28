FROM maven:3.8.8-eclipse-temurin-17 AS builder

COPY ./src/ /root/src
COPY ./pom.xml /root/
WORKDIR /root
RUN mvn clean package -DskipTests

FROM openjdk:17

ENV TZ=UTC

COPY --from=builder /root/target/ChattingSide-0.0.1-SNAPSHOT.jar /app/app.jar

EXPOSE 8083

ENTRYPOINT ["java", "-jar", "/app/app.jar"]