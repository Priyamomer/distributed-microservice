FROM eclipse-temurin:21-jre

COPY target/ProductService-0.0.1-SNAPSHOT.jar productservice.jar

EXPOSE 8300

ENTRYPOINT ["java", "-jar", "productservice.jar"]