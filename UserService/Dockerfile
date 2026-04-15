FROM eclipse-temurin:21-jre

COPY target/*.jar userservice.jar

EXPOSE 8200

ENTRYPOINT ["java", "-jar", "userservice.jar"]