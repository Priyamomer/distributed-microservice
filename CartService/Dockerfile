FROM eclipse-temurin:21-jre

COPY target/CartService-0.0.1-SNAPSHOT.jar cartservice.jar

EXPOSE 8400

ENTRYPOINT ["java", "-jar", "cartservice.jar"]