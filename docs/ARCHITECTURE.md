## Kiến trúc hệ thống

### Mục tiêu

Backend **Image AI** cung cấp API phân tích ảnh bằng AI, quản lý người dùng, phân quyền, gói subscription, credit, thanh toán VNPay, lịch sử phân tích, thông báo real-time và gửi email nền.

Kiến trúc được chia lớp rõ ràng: **Controller → Service → Repository → Entity/DTO**, kết hợp với **Redis, Kafka, WebSocket** và **Python AI service** bên ngoài.

---

### Các thành phần chính

- **Spring Boot Application**
  - Điểm vào: `ImageAiBackendApplication`.
  - Chạy trên HTTP (mặc định port 8080) với `context-path` `/api/v1`.

- **Lớp Controller (`controller/`)**
  - Chịu trách nhiệm định nghĩa REST API:
    - Auth: `AuthenticationController`
    - User/Role/Permission: `UserController`, `RoleController`, `PermissionController`
    - Subscription/Plan: `PlanInfoController`
    - Phân tích ảnh: `AnalyzeController`
    - File: `FileController`
    - Lịch sử: `HistoryController`
    - Thông báo: `NotificationController`
    - Thanh toán: `PaymentController`
    - Email: `EmailController`

- **Lớp Service (`service/` và `service/impl/`)**
  - Chứa business logic:
    - `AuthenticationServiceImpl`: đăng nhập, refresh token, logout.
    - `UserServiceImpl`, `RoleServiceImpl`, `PermissionServiceImpl`: quản lý user/role/permission.
    - `PlanInfoServiceImpl`: quản lý gói subscription và thông tin credit tuần.
    - `AnalyzeServiceImpl`: upload ảnh, gọi Python AI service, quản lý credit và lịch sử, gửi notification.
    - `HistoryServiceImpl`: CRUD lịch sử phân tích.
    - `NotificationServiceImpl` + `NotificationPublisher`: quản lý và gửi thông báo (DB + WebSocket).
    - `FileServiceImpl`: upload/download file.
    - `PaymentServiceImpl`: luồng tạo đơn và xử lý kết quả thanh toán VNPay.
    - `EmailServiceImpl`: gửi email thông qua Kafka và provider bên ngoài.

- **Lớp Repository (`repository/`)**
  - Dùng Spring Data JPA:
    - `UserRepository`, `RoleRepository`, `PermissionRepository`
    - `PlanInfoRepository`, `OrderRepository`
    - `HistoryRepository`, `NotificationRepository`, `FileMgmtRepository`
    - `InvalidatedTokenRepository`, `RefreshTokenRedisRepository`
  - **HTTP Client**:
    - `PythonServiceClient` (OpenFeign) kết nối tới Python AI service tại `http://localhost:5000` với endpoint `POST /predict`.

- **Entity (`entity/`) và DTO (`dto/`)**
  - Entity: `User`, `Role`, `Permission`, `PlanInfo`, `Order`, `History`, `Notification`, `FileMgmt`, `InvalidatedToken`, `RefreshTokenRedis`, ...
  - DTO request/response: trong `dto.request` và `dto.response`.
  - DTO event: `EmailEvent`, `NotificationEvent` dùng cho Kafka.

- **Mapper (`mapper/`)**
  - Sử dụng MapStruct để chuyển đổi giữa Entity và DTO (ví dụ: `NotificationMapper`, `UserMapper`, ...).

- **Scheduler (`scheduler/`)**
  - `CreditResetScheduler`: job chạy theo cron để:
    - Kiểm tra subscription hết hạn và hạ về gói FREE.
    - Cộng credit hàng tuần theo `PlanInfo`.
    - Gửi email và notification tương ứng.

- **WebSocket (`websocket/`)**
  - `NotificationWebSocketPublisher`: dùng `SimpMessagingTemplate` để gửi message tới `/topic/notifications/{userId}`.

---

### Bảo mật & Cấu hình

- **Security**
  - `SecurityConfig`:
    - Bật `@EnableWebSecurity`, `@EnableMethodSecurity`.
    - Khai báo danh sách endpoint public: `"/user/**", "/auth/**", "/analyze/**", "/file/**", "/payment/vnpay/return-url", "/ws/**"`.
    - Các endpoint khác yêu cầu xác thực JWT.
    - Cấu hình Resource Server dùng `CustomJwtDecoder` và `JwtAuthenticationEntryPoint`.
    - Cấu hình CORS cho phép frontend (ví dụ: `http://localhost:3000`) truy cập.

- **WebSocket**
  - `WebSocketConfig`:
    - STOMP endpoint: `/ws` (hỗ trợ SockJS).
    - Broker: `/topic`, prefix gửi từ client: `/app`.

- **Redis**
  - Cấu hình trong `RedisConfig` (dùng `spring-boot-starter-data-redis`).
  - Dùng cho token/refresh token hoặc cache tuỳ theo cài đặt trong code.

- **Kafka**
  - Tích hợp qua `spring-kafka`.
  - Dùng để gửi `EmailEvent` và các event liên quan thông báo.

- **VNPay**
  - `VnPayConfig` chứa logic tiện ích như sinh mã đơn hàng, hash, xác minh chữ ký.
  - `PaymentServiceImpl` phối hợp `VnPayConfig`, `OrderRepository`, `PlanInfoRepository`, `UserRepository` để xử lý thanh toán.

---

### Luồng nghiệp vụ chính

#### 1. Đăng nhập & xác thực

1. Client gửi request tới `POST /auth/login` với thông tin đăng nhập.
2. `AuthenticationServiceImpl` xác thực, tạo JWT + refresh token, trả về `AuthenticationResponse`.
3. Các request tiếp theo gửi JWT trong header Authorization (Bearer).
4. Spring Security + `CustomJwtDecoder` kiểm tra token trước khi vào controller.

#### 2. Phân tích ảnh

1. Client gọi `POST /analyze` kèm file ảnh dạng multipart.
2. `AnalyzeServiceImpl`:
   - Gọi `FileServiceImpl.uploadFile` để lưu file và lấy URL.
   - Gửi file sang Python AI service qua `PythonServiceClient.predict`.
   - Nếu user đang đăng nhập:
     - Lấy user từ `SecurityContextHolder`.
     - Kiểm tra credit, nếu không đủ thì gửi notification và ném exception.
     - Nếu đủ: trừ credit, tạo `History`, gửi notification thành công.
   - Trả về `AnalyzeResponse` chứa kết quả AI và URL ảnh.

#### 3. Subscription & Credit

1. Mỗi user có:
   - `subscription` (enum `SubscriptionPlan`),
   - `credit`,
   - `creditResetAt`,
   - `subscriptionExpiredAt`.
2. `PlanInfo` quy định `weeklyCredit` cho từng loại subscription.
3. `CreditResetScheduler` (cron hằng ngày):
   - Nếu `subscriptionExpiredAt` đã qua:
     - Đặt lại subscription về FREE, cập nhật `creditResetAt`, gửi email + notification.
   - Nếu đã đủ khoảng thời gian (>= 7 ngày) từ `creditResetAt`:
     - Cộng thêm `weeklyCredit` nhưng không vượt quá giới hạn tối đa đặt trong code.
     - Cập nhật `creditResetAt`, gửi notification.

#### 4. Thanh toán VNPay

1. Client gọi `POST /payment/vnpay/create`:
   - Lấy `userId` từ context bảo mật.
   - Tạo `Order` trạng thái `PENDING`.
   - Dùng `VnPayConfig` để build URL thanh toán (bao gồm hash bảo mật).
   - Trả về URL cho frontend redirect người dùng sang VNPay.
2. Sau thanh toán, VNPay redirect về `GET /payment/vnpay/return-url`:
   - `PaymentServiceImpl`:
     - Đọc các tham số VNPay gửi về.
     - Xác minh chữ ký với `VnPayConfig`.
     - Lấy `Order` và `User`, `PlanInfo`.
     - Nếu thanh toán thành công:
       - Cập nhật `Order` = `SUCCESS`.
       - Cập nhật `User.subscription`, cộng credit, set thời gian hết hạn.
       - Gửi `EmailEvent` qua Kafka và notification cho user.
     - Nếu thất bại hoặc chữ ký không hợp lệ:
       - Cập nhật `Order` = `FAILED`, gửi notification hoặc trả message phù hợp.

#### 5. Thông báo & WebSocket

1. Khi có các sự kiện như:
   - Phân tích ảnh thành công / thất bại do thiếu credit.
   - Cộng credit mới.
   - Subscription hết hạn hoặc thanh toán thành công/thất bại.
2. Service sử dụng `NotificationPublisher` hoặc `NotificationServiceImpl`:
   - Ghi `Notification` vào DB.
   - Dùng `NotificationWebSocketPublisher` gửi thông báo tới client qua channel `/topic/notifications/{userId}`.

---

### Tóm tắt

Kiến trúc của Image AI Backend:

- Bám sát mô hình **layered architecture**: Controller → Service → Repository.
- Tận dụng tốt các thành phần Spring: Security, Data JPA, Redis, Kafka, WebSocket.
- Hỗ trợ tích hợp chặt chẽ với **Python AI service** và **cổng thanh toán VNPay**.
- Có cơ chế **subscription + credit** rõ ràng, được tự động hoá bằng scheduler và thông báo đa kênh (email + WebSocket).


