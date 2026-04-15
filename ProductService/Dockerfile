FROM eclipse-temurin:21-jre

COPY target/*.jar productservice.jar

EXPOSE 8300

ENTRYPOINT ["java", "-jar", "productservice.jar"]