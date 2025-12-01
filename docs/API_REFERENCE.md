## Tài liệu API tổng quan

Tài liệu này mô tả **các endpoint chính** của Image AI Backend.  
Tất cả URL bên dưới giả định `context-path` là `/api/v1`.

> Lưu ý: Chỉ mô tả ở mức high-level, chi tiết field của DTO có thể xem trong package `dto.request` và `dto.response`.

---

### 1. Authentication (`/auth`)

- **POST `/auth/login`**
  - **Mô tả**: Đăng nhập, trả về access token và refresh token.
  - **Body**: `AuthenticationRequest`
  - **Response**: `ApiResponse<AuthenticationResponse>`

- **POST `/auth/refresh`**
  - **Mô tả**: Refresh access token từ refresh token hợp lệ.
  - **Body**: `RefreshRequest`
  - **Response**: `ApiResponse<AuthenticationResponse>`

- **POST `/auth/logout`**
  - **Mô tả**: Đăng xuất, vô hiệu hóa token/refresh token.
  - **Body**: `LogoutRequest`
  - **Response**: `ApiResponse<Void>`

---

### 2. User Management (`/user`)

- **POST `/user`**
  - **Mô tả**: Tạo người dùng mới.
  - **Body**: `UserCreationRequest`
  - **Response**: `ApiResponse<UserResponse>`

- **GET `/user`**
  - **Mô tả**: Lấy danh sách user (hỗ trợ phân trang bằng `Pageable`).
  - **Query**: Các tham số phân trang chuẩn Spring (page, size, sort).
  - **Response**: `ApiResponse<List<UserResponse>>` + `paginationInfo`.

- **GET `/user/{id}`**
  - **Mô tả**: Lấy thông tin chi tiết user theo id.
  - **Response**: `ApiResponse<UserResponse>`

- **PUT `/user/{id}`**
  - **Mô tả**: Cập nhật thông tin user.
  - **Body**: `UserUpdateRequest`
  - **Response**: `ApiResponse<UserResponse>`

- **DELETE `/user/{id}`**
  - **Mô tả**: Xóa user theo id.
  - **Response**: `ApiResponse<Void>`

---

### 3. Roles & Permissions

#### Role (`/role`)

- **POST `/role`**
  - **Mô tả**: Tạo role mới.
  - **Body**: `RoleRequest`
  - **Response**: `ApiResponse<RoleResponse>`

- **GET `/role`**
  - **Mô tả**: Lấy tất cả role.
  - **Response**: `ApiResponse<List<RoleResponse>>`

- **DELETE `/role/{name}`**
  - **Mô tả**: Xóa role theo tên.
  - **Response**: `ApiResponse<Void>`

#### Permission

- **POST `/permission`**
  - **Mô tả**: Tạo permission mới.
  - **Body**: `PermissionRequest`
  - **Response**: `ApiResponse<PermissionResponse>`

- **GET `/permission`**
  - **Mô tả**: Lấy tất cả permission.
  - **Response**: `ApiResponse<List<PermissionResponse>>`

- **DELETE `/permission/{name}`**
  - **Mô tả**: Xóa permission theo tên.
  - **Response**: `ApiResponse<Void>`

---

### 4. Subscription Plans (`/plan`)

- **POST `/plan`**
  - **Mô tả**: Tạo gói subscription mới.
  - **Body**: `PlanInfoRequest`
  - **Response**: `ApiResponse<PlanInfoResponse>`

- **GET `/plan`**
  - **Mô tả**: Lấy danh sách tất cả gói subscription.
  - **Response**: `ApiResponse<List<PlanInfoResponse>>`

---

### 5. Image Analysis (`/analyze`)

- **POST `/analyze`**
  - **Mô tả**: Phân tích ảnh bằng AI.
  - **Request**: multipart/form-data với field `file` (`MultipartFile`).
  - **Response**: `ApiResponse<AnalyzeResponse>` (bao gồm prediction, accuracy, description, imageUrl).

---

### 6. File Management (`/file`)

- **POST `/file/upload`**
  - **Mô tả**: Upload file lên server.
  - **Request**: multipart/form-data với field `file`.
  - **Response**: `ApiResponse<FileResponse>`

- **GET `/file/download/{fileName}`**
  - **Mô tả**: Tải file theo tên file.
  - **Response**: `ResponseEntity<Resource>` với `Content-Type` tương ứng.

---

### 7. History (`/history`)

- **POST `/history`**
  - **Mô tả**: Tạo bản ghi lịch sử phân tích (thường được gọi nội bộ từ service).
  - **Body**: `HistoryRequest`
  - **Response**: `ApiResponse<HistoryResponse>`

- **GET `/history/userId/{userId}`**
  - **Mô tả**: Lấy danh sách lịch sử phân tích theo `userId`.
  - **Response**: `ApiResponse<List<HistoryResponse>>`

- **DELETE `/history/{id}`**
  - **Mô tả**: Xóa 1 bản ghi lịch sử theo id.
  - **Response**: `ApiResponse<Void>`

- **DELETE `/history/userId/{userId}`**
  - **Mô tả**: Xóa toàn bộ lịch sử của 1 user.
  - **Response**: `ApiResponse<Void>`

---

### 8. Notifications (`/notification` + WebSocket)

- **GET `/notification/{userId}`**
  - **Mô tả**: Lấy danh sách thông báo của 1 user.
  - **Response**: `ApiResponse<List<NotificationResponse>>`

- **PUT `/notification/{id}`**
  - **Mô tả**: Đánh dấu 1 thông báo là đã đọc.
  - **Response**: `ApiResponse<NotificationResponse>`

#### WebSocket

- **STOMP endpoint**: `/ws` (SockJS enabled).
- **Topic thông báo**: `/topic/notifications/{userId}`
  - Server dùng `NotificationWebSocketPublisher` gửi `NotificationResponse` tới topic này.

---

### 9. Payments (VNPay) (`/payment`)

- **POST `/payment/vnpay/create`**
  - **Mô tả**: Tạo đơn hàng VNPay và trả về URL thanh toán.
  - **Body**: `PaymentRequest` (bao gồm subscription plan, amount, bankCode, language, ...)
  - **Response**: `ApiResponse<String>` (chứa URL VNPay).

- **GET `/payment/vnpay/return-url`**
  - **Mô tả**: Endpoint return URL mà VNPay gọi sau khi thanh toán.
  - **Query**: Các tham số chuẩn của VNPay (vnp_Amount, vnp_ResponseCode, vnp_TxnRef, vnp_SecureHash, ...).
  - **Xử lý**:
    - Xác minh chữ ký bằng `VnPayConfig`.
    - Cập nhật `Order` (SUCCESS/FAILED).
    - Cập nhật subscription, credit cho user nếu thanh toán thành công.
  - **Response**: `ApiResponse<PaymentReturnResponse>`

---

### 10. Email (`/email`)

- **POST `/email/send`**
  - **Mô tả**: Gửi email dựa trên thông tin trong request.
  - **Body**: `SendEmailRequest` (gồm sender, recipient, subject, content, ...).
  - **Response**: `ApiResponse<EmailResponse>`

---

### 11. Quy ước Response chung

- Hầu hết các endpoint REST đều trả về kiểu:
  - `ApiResponse<T>`
    - `message`: thông điệp mô tả (có thể null).
    - `value`: dữ liệu chính (kiểu T).
    - `paginationInfo`: thông tin phân trang (nếu là list có phân trang).

---

### 12. Authentication & Authorization

- Các endpoint public được định nghĩa trong `SecurityConfig` (ví dụ: `/user/**`, `/auth/**`, `/analyze/**`, `/file/**`, `/payment/vnpay/return-url`, `/ws/**`).
- Các endpoint còn lại yêu cầu:
  - Header `Authorization: Bearer <access_token>`.
  - Token sẽ được kiểm tra/giải mã bởi `CustomJwtDecoder`.


