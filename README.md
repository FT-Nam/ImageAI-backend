## Image AI Backend

Image AI Backend is a Spring Boot REST API for AI-powered image analysis with user management, subscriptions, credit management, payments, history tracking, notifications, and email integration.

The corresponding frontend application is available at  
[`ImageAI-frontend`](https://github.com/FT-Nam/ImageAI-frontend).

### Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture & Modules](#architecture--modules)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [API Overview](#api-overview)
- [Development Notes](#development-notes)

### Tech Stack

- **Language & Framework**: Java 17, Spring Boot 3
- **Spring Modules**: Web, Security (JWT + OAuth2 Resource Server), Data JPA, Validation, WebSocket, Data Redis
- **Data & Messaging**: MySQL, Redis, Apache Kafka
- **Integration**: OpenFeign (Python AI service), VNPay (payment gateway), external email provider (via Kafka events)

### Architecture & Modules

- **Configuration**
  - `SecurityConfig`: configures public endpoints, JWT resource server, CORS, and password encoding.
  - WebSocket, Redis, VNPay and Feign client configuration classes.

- **Domain Layers**
  - **Controllers**: REST endpoints for auth, users, roles, permissions, plans, analysis, files, history, notifications, payments, and email.
  - **Services / ServiceImpl**: business logic (authentication, credit & subscription handling, payment flows, history, notifications, email dispatch, file storage).
  - **Repositories**: Spring Data JPA repositories for all entities (users, roles, permissions, plans, orders, notifications, history, files, tokens).
  - **DTOs & Mappers**: request/response models and MapStruct mappers to keep the API layer separated from entities.

- **Integration**
  - **PythonServiceClient** (OpenFeign) calls a Python AI service (`POST /predict`) for image analysis.
  - **Kafka** is used to publish email and notification events.
  - **WebSocket** (`/ws`) + STOMP topics (`/topic/notifications/{userId}`) for real-time notifications.

### Key Features

- **Authentication & Security**
  - JWT-based login, refresh, and logout (`/auth/**`).
  - Public endpoints configured in `SecurityConfig`; all others require a valid JWT.

- **User, Role & Permission Management**
  - CRUD users (`/user/**`) with pagination support.
  - Manage roles (`/role/**`) and permissions to support role-based authorization.

- **Image Analysis**
  - `POST /analyze` accepts a multipart image file.
  - The file is uploaded, then sent to the Python AI service for prediction.
  - Returns prediction, accuracy, description, and image URL.
  - For authenticated users: validates available credits, deducts the analysis cost, stores history, and sends notifications.

- **Subscriptions & Credits**
  - Subscription plans and weekly credits defined via `PlanInfo` (e.g. FREE, paid tiers).
  - Scheduler (`CreditResetScheduler`) runs regularly to:
    - Reset or top up user credits based on their plan.
    - Handle expired subscriptions (downgrade to free, send notifications and email).

- **Payments (VNPay)**
  - `POST /payment/vnpay/create` creates a pending order and returns a VNPay payment URL for the client to redirect the user.
  - `GET /payment/vnpay/return-url` validates VNPay parameters and signatures, updates order status, activates or updates the subscription, adjusts credits, and triggers confirmation email and notifications.

- **History, Files, Notifications, Email**
  - Track user analysis history (`/history/**`) with image URL, result, accuracy, and description.
  - File upload and download endpoints (`/file/**`) for media management.
  - Notifications retrieved via REST (`/notification/**`) and pushed in real time via WebSocket.
  - Email sending orchestrated through Kafka events and an external email provider.

### Project Structure

High-level structure under `src/main/java/com/ftnam/image_ai_backend`:

- `configuration/` – security, WebSocket, Redis, VNPay, Feign, JWT.
- `controller/` – REST controllers for all public APIs.
- `service/` and `service/impl/` – business logic and integrations.
- `repository/` – JPA repositories and Feign clients (e.g. `PythonServiceClient`).
- `dto/` – request, response, and event DTOs.
- `entity/` – JPA entities (users, roles, permissions, plans, orders, history, notifications, files, tokens).
- `scheduler/` – scheduled jobs (credit reset and subscription expiry handling).
- `websocket/` – WebSocket notification publisher.

Resources under `src/main/resources` contain `application.yaml` and static/template directories.

### Configuration

Configure the following via environment variables or external configuration (do **not** commit real secrets in `application.yaml`):

- **Config template**
  - Use `src/main/resources/application-example.yaml` as a **safe template**.
  - For local development, you can copy it to `application.yaml` (or a profile-specific file) and fill in real values via environment variables.
  - Do not commit `application.yaml` that contains real secrets.

- **Database (MySQL)**
  - `spring.datasource.url`
  - `spring.datasource.username`
  - `spring.datasource.password`

- **Redis**
  - `spring.redis.host`
  - `spring.redis.port`
  - `spring.redis.password` (if used)

- **Kafka**
  - `spring.kafka.bootstrap-servers`
  - Consumer and producer settings for JSON messages.

- **JWT**
  - `jwt.signer-key`
  - `jwt.valid-duration`
  - `jwt.refreshable-duration`

- **Payments (VNPay)**
  - Pay URL, return URL, terminal code, secret key and API URL.

- **Email Provider**
  - API key and provider-specific configuration.

- **File Storage**
  - Base directory for uploaded files and public download URL prefix.

### Running Locally

1. **Prerequisites**
   - Java 17+, Maven
   - Running instances of MySQL, Redis, Kafka
   - Python AI service available at `http://localhost:5000` with `POST /predict` (multipart file `file`).

2. **Start Infrastructure**
   - Optionally start Kafka via Docker:

```bash
docker-compose up -d
```

3. **Build & Run the Application**

```bash
./mvnw clean package
./mvnw spring-boot:run
```

By default, the API is exposed at `http://localhost:8080/api/v1`.

### API Overview

- **Auth**: `/auth/login`, `/auth/refresh`, `/auth/logout`
- **Users**: `/user` (list/create), `/user/{id}` (get/update/delete)
- **Roles & Permissions**: `/role/**`, `/permission/**`
- **Plans**: `/plan/**`
- **Image Analysis**: `/analyze`
- **Files**: `/file/upload`, `/file/download/{fileName}`
- **History**: `/history/**`
- **Notifications**: `/notification/**`, WebSocket at `/ws` (`/topic/notifications/{userId}`)
- **Payments**: `/payment/vnpay/create`, `/payment/vnpay/return-url`
- **Email**: `/email/send`

### Development Notes

- Avoid committing real credentials, keys, or API secrets to the repository.
- Use separate profiles or external configuration for local, staging, and production environments.
- The modular structure (controllers, services, repositories, DTOs, mappers) is designed to make it easy to extend new features such as additional payment providers, new subscription plans, or extra analysis types.

