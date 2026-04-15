FROM eclipse-temurin:21-jre

COPY target/NotificationService-0.0.1-SNAPSHOT.jar notificationservice.jar

EXPOSE 8700

ENTRYPOINT ["java", "-jar", "notificationservice.jar"]