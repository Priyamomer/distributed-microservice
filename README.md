# Distributed E-commerce Microservices Project

This repository contains the source code for a distributed e-commerce platform built using a microservices architecture. This project was developed as part of a Master's in Computer Science program and showcases a practical implementation of modern distributed systems principles.

## Project Overview

This project implements a scalable, resilient, and efficient backend for an e-commerce platform using microservices. The architecture is designed around eight core services, each responsible for a distinct business domain. This architecture leverages various cutting-edge technologies, including Spring Boot, MySQL, Redis, Elasticsearch, Kafka, and AWS services.

The key objectives of this project include:

*   **Modularity and Scalability**: Independent development, deployment, and scaling of individual services.
*   **Resilience and Fault Tolerance**: Handling failures gracefully and ensuring high availability.
*   **Performance Optimization**: Utilizing caching and efficient data retrieval techniques.
*   **Secure Communication**: Implementing secure communication protocols and authentication mechanisms.
*   **Real-Time Event Processing**: Integrating Kafka for real-time data processing and notifications.
*   **Comprehensive Monitoring**: Setting up detailed monitoring and logging for system health.

## Microservices Architecture

The system is composed of the following microservices:

1.  **Gateway Service (Port: 8000)**: A central point for API endpoints, routing requests to appropriate microservices and applying rate limiting.
2.  **Discovery Service (Port: 8100)**: Manages service registration and discovery using Netflix Eureka.
3.  **User/Auth Service (Port: 8200)**: Handles user authentication and authorization using OAuth 2.0 and Spring Security.
4.  **Product Service (Port: 8300)**: Manages product-related operations, including CRUD and advanced searches using Elasticsearch.
5.  **Cart Service (Port: 8400)**: Manages user carts, utilizing Redis for fast data retrieval.
6.  **Order Service (Port: 8500)**: Processes order-related operations and integrates with Payment Service.
7.  **Payment Service (Port: 8600)**: Generates payment links and handles payment status updates using Stripe and Razorpay webhooks.
8.  **Notification Service (Port: 8700)**: Uses Kafka for event-driven messaging to send real-time notifications.

## Technologies Used

*   **Programming Language**: Java 21
*   **Framework**: Spring Boot
*   **Database**: MySQL
*   **Caching**: Redis
*   **Search Engine**: Elasticsearch
*   **Message Broker**: Kafka
*   **Cloud Platform**: AWS
*    **Containerization**: Docker
*    **Orchestration**: Kubernetes
*    **Monitoring**: Prometheus and Grafana

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed and set up:

*   **Java**: JDK 21 or later.
*   **Maven** or **Gradle**: For building the Java projects.
*   **Docker**: For containerizing and running the microservices.
*   **MySQL Server**: For database persistence.
*   **Redis Server**: For caching.
*   **Kafka Server**: For messaging.
*   **Elasticsearch**: For product search.
*   **Kubernetes** (Optional): For container orchestration if you are using K8s deployment method.
*   **Prometheus and Grafana**: For monitoring your system.
*   **AWS Account**: Required if you plan on deploying to AWS

### Setting Up the Environment

1.  **Clone the Repository**:
    ```bash
    git clone [your-repo-url]
    cd [your-repo-name]
    ```
2.  **Configure Environment Variables**:
    *   Set up necessary environment variables for database connection, Redis host, Kafka bootstrap servers, and other service-specific settings. You can find these in the `application.properties` or `application.yml` files of each service.
    *   Create separate databases for each service with names like: `userdb`, `productdb` `orderdb`, etc. and update the data source urls in properties file.
3. **Setup Services**

    Follow these steps for each microservice:

    1.  **Navigate to Service Directory**:
        ```bash
        cd <service_name>
        ```
    2.  **Build the Project**:
        ```bash
        mvn clean install # For Maven project
        # or
         gradle clean build # For Gradle project
        ```
    3.  **Run the Service**:
       *  Run the application using following command
         ```bash
          mvn spring-boot:run
           #or
           gradle bootRun
        ```
        Alternatively you can run the services using their docker images by pulling the images and running them.
    4.  **Start Docker Containers**:
       Pull the images from dockerhub
        ```bash
        docker pull [docker-image-name]:[version]
        ```
        Start the container
        ```bash
        docker run -d -p <external_port>:<service_port> [docker-image-name]:[version]

        ```
        Replace `<docker-image-name>` and `[version]` with the actual image name and version. And `<external_port>` with the actual port you want to access the service in the following table

    For example, to run the product service:
    ```bash
      docker run -d -p 8300:8300 priyamomer/productservice:0.1.0
    ```
    Refer to the docker image list below,

    ```
        Service Name         |   Image Repository              |  Version   | Service Port 
        ---------------------|---------------------------------|----------|----------------
        Gateway Service      |   priyamomer/gateway           |   0.1.0   | 8000
        Discovery Service    |   priyamomer/discoveryservice  |   0.1.0  | 8100
        User Service         |   priyamomer/userservice        |  0.1.0  | 8200
        Product Service      |   priyamomer/productservice     |   0.1.0   | 8300
        Cart Service         |   priyamomer/cartservice        |   0.1.0   | 8400
        Order Service        |   priyamomer/orderservice       |   0.1.0   | 8500
        Payment Service      |   priyamomer/paymentservice     |   0.1.0   | 8600
        Notification Service |   priyamomer/notificationservice |   0.1.0   | 8700
    ```
5. **Kubernetes Deployment**:
     * Each microservice includes its own Kubernetes deployment and service configuration files:
        * `<MicroserviceName>Deployment.yaml`
        * `<MicroserviceName>Service.yaml`
     * To deploy a service using Kubernetes, navigate to the service directory (e.g., `cd productservice`) and apply the configurations:
        ```bash
        kubectl apply -f <MicroserviceName>Deployment.yaml
        kubectl apply -f <MicroserviceName>Service.yaml
        ```
        Repeat this for each service, replacing `<MicroserviceName>` with the actual name of the service.

6.  **Prometheus Setup**
    * To deploy prometheus for gateway monitoring, apply the configuration using the command
        ```bash
        kubectl apply -f prometheus.yml
        ```
### Important Configuration Notes

*   **Service Discovery**: Make sure all services have the appropriate Eureka URL configured to register themselves with the Discovery Service. This is essential for inter-service communication.
*   **Database**: Create the necessary databases in your MySQL server and update the database connection URLs in the service properties.
*   **Kafka**: Ensure your Kafka broker is running and accessible to the Notification and Order Services. Configure the appropriate Kafka bootstrap server address in your application properties.
*   **Elasticsearch**: Make sure your Elasticsearch server is running and accessible to Product service.
*   **Redis**: Ensure Redis is accessible and configured correctly for caching in Cart and Product service, as well as rate limiting in the Gateway.
*   **AWS**: If deploying to AWS, ensure that all required AWS services are set up in your AWS account, and their connection settings are configured in your application properties or environment variables.
*   **Kubernetes**: To deploy using Kubernetes create `deployment.yaml` and `service.yaml`  file for each service, and then execute  `kubectl apply -f <file_name>.yaml `
*  **Prometheus and Grafana**: setup your prometheus to pull metrics from each microservice, and import relevant dashboard in Grafana.

## Authentication
The system uses OAuth 2.0 with Spring Security for authentication. There are two main authentication flows:

### GET Requests
*   Uses form-based authentication.
*   Unauthenticated requests are redirected to a login form.
*   After successful login, users are redirected to their original request.

### POST/PATCH/DELETE Requests
*   Uses OAuth 2.0 client credentials grant or authorization code grant
*   To obtain a JWT bearer token, clients should use OAuth2 flow, with *`/oauth2/token`* endpoint of the **User Service**. The User Service will return a JWT Token if the `clientId`,`clientSecret` and `scope` are correct
*   Clients must include a valid JWT token as a **Bearer token** in the `Authorization` header in the requests.

Client applications must be registered in the User Service database, this will provide the necessary credentials to obtain JWT bearer tokens. 

## API Endpoints

All API endpoints are routed through the **Gateway Service** at `http://localhost:8000/`. Below are the details for each microservice:

### User Service (`/v1/auth`)

This service handles user registration, authentication, and authorization.

| Method  | Endpoint           | Description                                                                    | Request Body                               | Response Body      |
|---------|--------------------|--------------------------------------------------------------------------------|--------------------------------------------|--------------------|
| `POST`  | `/v1/auth/signup`  | Registers a new user.                                                          | `SignupRequestDto` (email, password)         | `UserDto`          |
| `POST` | `/v1/auth/password` | Changes the user's password.                                                  | `ChangePasswordDto` (oldPassword, newPassword)    | `ResponseEntity<String>`|
| `POST` | `/v1/roles`   | Creates a new role.                    | `createRoleRequestDto` (role) | `RoleDto`  |
| `GET`  | `/v1/roles`   | Retrieves a list of roles.              |  None |  `List<RoleDto>`       |
| `GET`  | `/v1/users/{id}` | Retrieves details of a specific user by ID. | None    | `UserDto`|
| `POST`  | `/v1/users/{id}/roles` | Sets roles for a specific user by ID.   | `SetUserRolesRequestDto` (roleIds)    | `UserDto`|


### Product Service (`/v1/products`)

This service manages product-related operations, including CRUD and searches.

| Method  | Endpoint              | Description                                                                   | Request Body                         | Response Body               |
|---------|-----------------------|-------------------------------------------------------------------------------|--------------------------------------|-----------------------------|
| `GET`   | `/v1/products/{id}`    | Retrieves details of a specific product by ID.                              | None                                 | `GenericProductDto`         |
| `GET`   | `/v1/products`        | Retrieves a list of all products.                                           | None                                 | `List<GenericProductDto>`   |
| `DELETE`| `/v1/products/{id}`     | Deletes a specific product by ID.                                          | None                                  | `GenericProductDto`         |
| `POST`  | `/v1/products`        | Creates a new product.                                                         |  `GenericProductDto` (title, description, price, image, category)| `GenericProductDto`         |
| `PATCH` | `/v1/products/{id}`        | Updates details of a specific product by ID.                                  | `GenericProductDto` (title, description, price, image, category)| `GenericProductDto`         |
| `POST`  | `/v1/products/search` | Searches for products based on the provided criteria.                         | `SearchRequestDto` (keywords, category, filters, page, size, sort)         | `Page<GenericProductDto>` |

### Cart Service (`/v1/cart`)

This service manages user carts.

| Method  | Endpoint                | Description                                                                   | Request Body            | Response Body |
|---------|-------------------------|-------------------------------------------------------------------------------|-------------------------|---------------|
| `GET`   | `/v1/cart/{userId}`      | Retrieves the cart for a specific user by user ID.                           | None                    | `CartDto`      |
| `POST`  | `/v1/cart/{userId}/items`| Adds an item to the cart for a specific user by user ID.                     | `ItemDto` (productId, quantity)    | `CartItem`    |
| `PATCH` | `/v1/cart/{userId}/items`| Updates an item in the cart for a specific user by user ID.                     | `ItemDto` (productId, quantity)   | `CartItem`    |
| `DELETE`| `/v1/cart/{userId}/items`| Deletes an item from the cart for a specific user by user ID.              | `ItemDto` (productId)        | `String`      |

### Order Service (`/v1/orders`)

This service processes order-related operations.

| Method  | Endpoint            | Description                                                                   | Request Body                        | Response Body          |
|---------|---------------------|-------------------------------------------------------------------------------|-------------------------------------|------------------------|
| `GET`   | `/v1/orders/{userId}`| Retrieves a list of orders for a specific user by user ID.                  | None                                | `List<OrderResponseDto>` |
| `POST`  | `/v1/orders`         | Creates a new order.                                                          | `OrderRequestDto` (items:List<ItemDto>) | `OrderResponseDto`   |
| `PATCH`| `/v1/orders/payment-status` | Updates the payment status of an order.                                    |`OrderPaymentStatusUpdateDto` (orderId, paymentStatus) | `ResponseEntity<String>` |

### Payment Service (`/v1/payments`)

This service generates payment links and handles payment status updates.

| Method  | Endpoint           | Description                                                                     | Request Body                  | Response Body |
|---------|--------------------|---------------------------------------------------------------------------------|-------------------------------|---------------|
| `POST`  | `/v1/payments`     | Initiates a payment.                                                          | `InitiatePaymentRequestDto` (orderId, currency, amount, paymentGateway: "STRIPE" or "RAZORPAY") | `String`      |
|`POST`   | `/payments/webhooks`| Handles webhook events from the payment gateway.                      | `String`(payload) | `ResponseEntity<String>`      |

### Notification Service (`/v1/notifications`)

This service sends notification messages using Kafka.

| Method  | Endpoint                    | Description                                                                   | Request Body               | Response Body |
|---------|-----------------------------|-------------------------------------------------------------------------------|----------------------------|---------------|
| `POST`  | `/v1/notifications/send-message` | Sends a notification message.                                               | `MessageRequestDto`(message) | `String`      |

## Contributions
Contributions to this project are welcome. Please ensure to follow our [Code of Conduct](CODE_OF_CONDUCT.md) and contribute through pull requests. Please write the proper test case before adding any contributions.

## License
This project is licensed under the [MIT License](LICENSE)

## Project Report
The full project report is available upon request and for any other queries please email at priyamomer3@gmail.com.

