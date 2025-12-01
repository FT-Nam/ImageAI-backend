## Hướng dẫn chạy và triển khai

Tài liệu này mô tả cách chuẩn bị môi trường, chạy ứng dụng Image AI Backend ở môi trường local và các lưu ý khi triển khai.

---

### 1. Yêu cầu hệ thống

- **Ngôn ngữ & Build**
  - Java 17+
  - Maven 3.8+ (hoặc sử dụng `mvnw` đi kèm dự án)

- **Dịch vụ bên ngoài**
  - MySQL (database chính)
  - Redis
  - Apache Kafka
  - Python AI service (chạy tại `http://localhost:5000`, có endpoint `POST /predict` nhận file multipart)

---

### 2. Cấu hình môi trường

> Khuyến nghị: không hard-code secret trong `application.yaml`. Hãy dùng biến môi trường hoặc external config.

Các nhóm cấu hình chính:

- **Server**
  - `server.port` – port ứng dụng (mặc định 8080).
  - `server.servlet.context-path` – context path (mặc định `/api/v1`).

- **Database (MySQL)**
  - `spring.datasource.url`
  - `spring.datasource.username`
  - `spring.datasource.password`

- **JPA**
  - `spring.jpa.hibernate.ddl-auto`
  - `spring.jpa.show-sql`

- **Redis**
  - `spring.redis.host`
  - `spring.redis.port`
  - `spring.redis.password` (nếu có)

- **Kafka**
  - `spring.kafka.bootstrap-servers`
  - `spring.kafka.consumer.*`, `spring.kafka.producer.*`

- **JWT**
  - `jwt.signer-key`
  - `jwt.valid-duration`
  - `jwt.refreshable-duration`

- **VNPay**
  - Các thông tin endpoint, mã terminal, secret key và URL trả về.

- **Email Provider**
  - API key và thông tin cấu hình cụ thể nhà cung cấp.

- **File Storage**
  - Thư mục lưu file upload.
  - URL prefix để download file.

---

### 3. Khởi chạy môi trường local

#### 3.1. Chuẩn bị dịch vụ phụ thuộc

1. **MySQL**
   - Tạo database (ví dụ: `imageai`).
   - Cấu hình đúng `spring.datasource.*` tương ứng.

2. **Redis**
   - Khởi chạy Redis (mặc định lắng nghe port 6379).
   - Cập nhật lại host/port nếu khác.

3. **Kafka**
   - Có thể sử dụng `docker-compose.yml` trong project:

```bash
docker-compose up -d
```

4. **Python AI service**
   - Chạy service Python tại `http://localhost:5000`.
   - Đảm bảo có endpoint `POST /predict` nhận file với field `file` và trả về JSON tương ứng với `AnalyzeResponse`.

#### 3.2. Build & Run backend

Trong thư mục root của project:

```bash
./mvnw clean package
./mvnw spring-boot:run
```

Sau khi chạy thành công, API sẽ có tại:

- `http://localhost:8080/api/v1`

---

### 4. Gợi ý triển khai Production

Các ý sau mang tính gợi ý chung, cần điều chỉnh theo hạ tầng thực tế:

- **Tách cấu hình theo profile**
  - Sử dụng các profile: `application-dev.yaml`, `application-prod.yaml`, ... để tách biệt setting.
  - Dùng biến môi trường/secret manager để quản lý credential (DB, JWT key, VNPay, Email...).

- **Containerization**
  - Đóng gói ứng dụng thành Docker image (ví dụ dùng `spring-boot-maven-plugin` và Dockerfile).
  - Chạy cùng với MySQL/Redis/Kafka trên Kubernetes hoặc docker-compose tuỳ quy mô.

- **Giám sát & Logging**
  - Bật log mức phù hợp (`INFO`/`WARN`/`ERROR`).
  - Tích hợp thêm monitoring/APM nếu cần (Prometheus, Grafana, v.v.) – phần này tuỳ vào hệ thống, không nằm trong code hiện tại.

- **Bảo mật**
  - Bảo vệ JWT signer key, VNPay secret key, API key email provider.
  - Bật HTTPS ở tầng reverse proxy (Nginx/Ingress) hoặc ở chính ứng dụng.
  - Hạn chế CORS ở production (không để `*`, chỉ cho phép domain FE thực tế).

---

### 5. Kiểm thử nhanh sau khi triển khai

Sau khi deploy, có thể kiểm tra nhanh:

1. Gọi `POST /api/v1/auth/login` với tài khoản hợp lệ để lấy token.
2. Dùng token gọi các endpoint yêu cầu auth (ví dụ `/api/v1/user`, `/api/v1/history/userId/{userId}`, ...).
3. Test upload ảnh qua `POST /api/v1/analyze` và xác nhận:
   - Ảnh được lưu đúng chỗ.
   - Python service trả về kết quả.
   - Lịch sử và credit cập nhật đúng.
4. Thực hiện một thanh toán test với VNPay sandbox (nếu đã cấu hình) và kiểm tra:
   - Order được cập nhật trạng thái.
   - Subscription & credit của user được cập nhật.
   - Email & notification được gửi.


