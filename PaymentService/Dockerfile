FROM eclipse-temurin:21-jre

COPY target/PaymentService-0.0.1-SNAPSHOT.jar paymentservice.jar

EXPOSE 8600

ENTRYPOINT ["java", "-jar", "paymentservice.jar"]