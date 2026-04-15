FROM eclipse-temurin:21-jre

COPY target/userservicetestfinal-0.0.1-SNAPSHOT.jar userservice.jar

EXPOSE 8200

ENTRYPOINT ["java", "-jar", "userservice.jar"]