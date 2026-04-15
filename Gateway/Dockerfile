FROM eclipse-temurin:21-jre

COPY target/Gateway-0.0.1-SNAPSHOT.jar gateway.jar

EXPOSE 8000

ENTRYPOINT ["java", "-jar", "gateway.jar"]