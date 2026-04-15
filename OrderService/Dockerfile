FROM eclipse-temurin:21-jre

COPY target/OrderService-0.0.1-SNAPSHOT.jar orderservice.jar

EXPOSE 8500

ENTRYPOINT ["java", "-jar", "orderservice.jar"]