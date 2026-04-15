FROM eclipse-temurin:21-jre

COPY target/*.jar discoveryservice.jar

EXPOSE 8100

ENTRYPOINT ["java", "-jar", "discoveryservice.jar"]