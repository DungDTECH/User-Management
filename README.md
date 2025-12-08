# User Management API (NestJS)

A comprehensive NestJS service for user management with **JWT Authentication**, **Role-Based Authorization**, and **Avatar Upload** capabilities. Built with TypeORM and PostgreSQL, includes Docker support for local development.

## 🚀 Features

### Migration Files

Migrations are located in `src/migrations/`:

- `CreateUsersTable.ts` - Creates the `users` table with all columns

## Quickstart (Docker Compose)

1. Copy the example env and docker-compose file and edit values if needed:

   cp .env.example .env

   cp docker-compose.example.yml docker-compose.yml

2. Build and run with Docker Compose:

   docker-compose up --build

3. The API will be available at http://localhost:3000 (or the value in `PORT`).

4. Create a user by POSTing to `/users` (see API docs in code). Example body:

```json
{
  "userId": "DX01",
  "email": "alice@example.com",
  "name": "Alice",
  "role": "staff"
}
```

## API Documentation

### ⚠️ Tạo User Đầu Tiên (Bootstrap Admin)

**Khi database chưa có user nào**, bạn có thể tạo user đầu tiên **KHÔNG CẦN TOKEN**:

- ✅ **Không cần** header `Authorization`
- ⚠️ **BẮT BUỘC** `role` phải là `"ADMIN"`
- 🚫 Nếu `role` không phải `"ADMIN"` → Lỗi `400 Bad Request: Invalid parameters`

**Ví dụ tạo admin đầu tiên:**

```bash
POST /users
Content-Type: application/json

{
  "userId": "DX01",
  "email": "admin@example.com",
  "password": "Admin@123",
  "name": "Admin User",
  "role": "ADMIN"
}
```

**Lưu ý:** Sau khi có user đầu tiên, mọi request tạo user tiếp theo **BẮT BUỘC** phải có JWT token của admin.

---

### 🔑 Authentication Endpoints

#### 1. **Login** (Public)

Đăng nhập và nhận JWT access token.

- **Method:** `POST`
- **URL:** `/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "email": "admin@example.com",
  "password": "SecurePass123!"
}
```

- **Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "DX01",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

- **Errors:**
  - `401 Unauthorized` — Email hoặc password không đúng
  - `400 Bad Request` — Payload không hợp lệ

---

#### 2. **Get Profile** (Protected)

Lấy thông tin user hiện tại từ JWT token.

- **Method:** `GET`
- **URL:** `/auth/profile`
- **Headers:**
  - `Authorization: Bearer <your-jwt-token>`

- **Response (200 OK):**

```json
{
  "userId": "DX01",
  "email": "admin@example.com",
  "name": "Admin User",
  "role": "ADMIN",
  "isActive": true,
  "createdAt": "2025-12-03T10:00:00.000Z",
  "updatedAt": "2025-12-03T10:00:00.000Z"
}
```

- **Errors:**
  - `401 Unauthorized` — Token không hợp lệ hoặc expired

---

#### 3. **Logout** (Protected)

Logout user (client cần xóa token).

- **Method:** `POST`
- **URL:** `/auth/logout`
- **Headers:**
  - `Authorization: Bearer <your-jwt-token>`

- **Response (200 OK):**

```json
{
  "message": "Logged out successfully"
}
```

---

### 👤 User Management Endpoints

**Lưu ý:**

- Tất cả endpoints yêu cầu authentication (trừ login)
- User chỉ có thể xem/sửa data của chính họ
- Admin có thể truy cập tất cả user data

#### 1. **Create User** (🔒 Admin Only)

Tạo user mới (chỉ admin mới được tạo user).

- **Method:** `POST`
- **URL:** `/users`
- **Headers:**
  - `Authorization: Bearer <admin-jwt-token>`
  - `Content-Type: application/json`
- **Body:**

```json
{
  "userId": "DX02",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "USER"
}
```

**Validation:**

- `userId`: Bắt buộc, unique
- `email`: Bắt buộc, phải là email hợp lệ, unique
- `password`: Bắt buộc, tối thiểu 8 ký tự, phải có chữ hoa, chữ thường, số và ký tự đặc biệt
- `name`: Tùy chọn
- `role`: Enum (`USER`, `ADMIN`, `MODERATOR`)

- **Response (201 Created):**

```json
{
  "userId": "DX02",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "isActive": true,
  "createdAt": "2025-12-05T10:00:00.000Z",
  "updatedAt": "2025-12-05T10:00:00.000Z"
}
```

- **Errors:**
  - `403 Forbidden` — Không có quyền admin
  - `409 Conflict` — userId hoặc email đã tồn tại
  - `400 Bad Request` — Validation errors

---

#### 2. **Get All Users** (🔒 Admin Only)

Lấy danh sách tất cả users (chỉ admin).

- **Method:** `GET`
- **URL:** `/users`
- **Headers:**
  - `Authorization: Bearer <admin-jwt-token>`

- **Response (200 OK):**

```json
[
  {
    "userId": "DX01",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN",
    "avatar": "avatar-1733400000000.jpg",
    "isActive": true,
    "createdAt": "2025-12-03T10:00:00.000Z",
    "updatedAt": "2025-12-05T10:00:00.000Z"
  },
  {
    "userId": "DX02",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "avatar": null,
    "isActive": true,
    "createdAt": "2025-12-05T10:00:00.000Z",
    "updatedAt": "2025-12-05T10:00:00.000Z"
  }
]
```

- **Errors:**
  - `401 Unauthorized` — Chưa đăng nhập
  - `403 Forbidden` — Không có quyền admin

---

#### 3. **Get User By ID** (Protected)

Lấy thông tin user theo ID.

- User chỉ xem được thông tin của chính họ
- Admin xem được thông tin tất cả users

- **Method:** `GET`
- **URL:** `/users/:userId`
- **Headers:**
  - `Authorization: Bearer <your-jwt-token>`
- **Path Params:**
  - `userId` (string) — ID của user cần lấy

- **Response (200 OK):**

```json
{
  "userId": "DX02",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER",
  "avatar": "avatar-1733400000000.jpg",
  "isActive": true,
  "createdAt": "2025-12-05T10:00:00.000Z",
  "updatedAt": "2025-12-05T10:00:00.000Z"
}
```

- **Errors:**
  - `403 Forbidden` — Không có quyền xem user này
  - `404 Not Found` — User không tồn tại

---

#### 4. **Update User** (Protected)

Cập nhật thông tin user.

- User chỉ sửa được thông tin của chính họ
- Admin sửa được thông tin tất cả users

- **Method:** `POST`
- **URL:** `/users/:userId`
- **Headers:**
  - `Authorization: Bearer <your-jwt-token>`
  - `Content-Type: application/json`
- **Path Params:**
  - `userId` (string)
- **Body (partial update):**

```json
{
  "name": "John Updated",
  "email": "john.new@example.com",
  "password": "NewPass123!"
}
```

- **Response (200 OK):**

```json
{
  "userId": "DX02",
  "email": "john.new@example.com",
  "name": "John Updated",
  "role": "USER",
  "avatar": "avatar-1733400000000.jpg",
  "isActive": true,
  "createdAt": "2025-12-05T10:00:00.000Z",
  "updatedAt": "2025-12-05T11:30:00.000Z"
}
```

- **Errors:**
  - `403 Forbidden` — Không có quyền sửa user này
  - `404 Not Found` — User không tồn tại
  - `400 Bad Request` — Validation errors

---

#### 5. **Delete User** (🔒 Admin Only)

Xóa user (chỉ admin).

- **Method:** `DELETE`
- **URL:** `/users/:userId`
- **Headers:**
  - `Authorization: Bearer <admin-jwt-token>`
- **Path Params:**
  - `userId` (string)

- **Response:**
  - `204 No Content` — Xóa thành công
- **Errors:**
  - `403 Forbidden` — Không có quyền admin
  - `404 Not Found` — User không tồn tại

---

#### 6. **Upload Avatar** (Protected)

Upload ảnh avatar cho user.

- User chỉ upload được avatar của chính họ
- Admin upload được cho bất kỳ user nào

- **Method:** `POST`
- **URL:** `/users/:userId/avatar`
- **Headers:**
  - `Authorization: Bearer <your-jwt-token>`
  - `Content-Type: multipart/form-data`
- **Path Params:**
  - `userId` (string)
- **Body (Form Data):**
  - `avatar`: File (image only)

**File Validation:**

- **Allowed formats:** JPG, JPEG, PNG, GIF
- **Max file size:** 5MB (5 _ 1024 _ 1024 bytes)
- **Storage:** `./uploads/avatars/`

**Example Request (cURL):**

```bash
curl -X POST http://localhost:3000/users/DX02/avatar \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "avatar=@/path/to/image.jpg"
```

- **Response (200 OK):**

```json
{
  "message": "Avatar uploaded successfully",
  "avatar": "avatar-1733400000000-abc123.jpg",
  "url": "/uploads/avatars/avatar-1733400000000-abc123.jpg"
}
```

**Truy cập avatar:**

```
http://localhost:3000/uploads/avatars/avatar-1733400000000-abc123.jpg
```

- **Errors:**
  - `403 Forbidden` — Không có quyền upload avatar cho user này
  - `404 Not Found` — User không tồn tại
  - `400 Bad Request` — File không hợp lệ (không phải ảnh hoặc quá lớn)

---

### 🎭 Role Management Endpoints (🔒 Admin Only)

#### 1. **Create Role**

- **Method:** `POST`
- **URL:** `/roles`
- **Headers:**
  - `Authorization: Bearer <admin-jwt-token>`
  - `Content-Type: application/json`
- **Body:**

```json
{
  "roleName": "MODERATOR",
  "description": "Content moderator role"
}
```

- **Response (201 Created):**

```json
{
  "id": "uuid-here",
  "roleName": "MODERATOR",
  "description": "Content moderator role",
  "createdAt": "2025-12-05T10:00:00.000Z",
  "updatedAt": "2025-12-05T10:00:00.000Z"
}
```

---

#### 2. **Get All Roles** (Public)

- **Method:** `GET`
- **URL:** `/roles`

- **Response (200 OK):**

```json
[
  {
    "id": "uuid-1",
    "roleName": "ADMIN",
    "description": "Administrator role"
  },
  {
    "id": "uuid-2",
    "roleName": "USER",
    "description": "Regular user role"
  }
]
```

---

#### 3. **Update Role**

- **Method:** `POST`
- **URL:** `/roles/:id`
- **Headers:**
  - `Authorization: Bearer <admin-jwt-token>`
  - `Content-Type: application/json`
- **Path Params:**
  - `id` (uuid)
- **Body:**

```json
{
  "description": "Updated description"
}
```

- **Response (200 OK):**

```json
{
  "id": "uuid-here",
  "roleName": "MODERATOR",
  "description": "Updated description",
  "createdAt": "2025-12-05T10:00:00.000Z",
  "updatedAt": "2025-12-05T11:00:00.000Z"
}
```

---

#### 4. **Delete Role**

- **Method:** `DELETE`
- **URL:** `/roles/:id`
- **Headers:**
  - `Authorization: Bearer <admin-jwt-token>`
- **Path Params:**
  - `id` (uuid)

- **Response:**
  - `204 No Content` — Xóa thành công

---

## 🔒 Authorization Matrix

| Endpoint                 | User      | Admin     | Description         |
| ------------------------ | --------- | --------- | ------------------- |
| `POST /auth/login`       | ✅ Public | ✅ Public | Đăng nhập           |
| `GET /auth/profile`      | ✅ Own    | ✅ Own    | Xem profile         |
| `POST /auth/logout`      | ✅        | ✅        | Đăng xuất           |
| `POST /users`            | ❌        | ✅        | Tạo user mới        |
| `GET /users`             | ❌        | ✅        | Xem danh sách users |
| `GET /users/:id`         | ✅ Own    | ✅ All    | Xem chi tiết user   |
| `POST /users/:id`        | ✅ Own    | ✅ All    | Cập nhật user       |
| `DELETE /users/:id`      | ❌        | ✅        | Xóa user            |
| `POST /users/:id/avatar` | ✅ Own    | ✅ All    | Upload avatar       |
| `POST /roles`            | ❌        | ✅        | Tạo role            |
| `GET /roles`             | ✅        | ✅        | Xem danh sách roles |
| `POST /roles/:id`        | ❌        | ✅        | Cập nhật role       |
| `DELETE /roles/:id`      | ❌        | ✅        | Xóa role            |
