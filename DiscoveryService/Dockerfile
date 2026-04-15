FROM eclipse-temurin:21-jre

COPY target/DiscoveryService-0.0.1-SNAPSHOT.jar discoveryservice.jar

EXPOSE 8100

ENTRYPOINT ["java", "-jar", "discoveryservice.jar"]