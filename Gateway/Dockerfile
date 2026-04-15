FROM eclipse-temurin:21-jre

COPY target/*.jar gateway.jar

EXPOSE 8000

ENTRYPOINT ["java", "-jar", "gateway.jar"]