# User Management (NestJS)

Small NestJS service for user management. This repository includes a Dockerfile and a docker-compose example to run the app together with Postgres locally.

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

## API documentation

Tất cả endpoints nằm dưới base path `/users`.

1. Create user
   - Method: POST
   - URL: /users
   - Body (application/json):
     - `userId` (string) — bắt buộc: mã do bạn cung cấp, ví dụ `DX01`.
     - `email` (string) — tuỳ chọn nhưng nếu gửi phải là email hợp lệ.
     - `name` (string) — tuỳ chọn.
     - `role` (string) — bắt buộc (ví dụ `staff`, `admin`).
   - Response:
     - 201 Created: trả về object user vừa tạo, ví dụ:

```json
{
  "userId": "DX01",
  "email": "alice@example.com",
  "name": "Alice",
  "role": "staff",
  "isActive": true,
  "createdAt": "2025-12-03T10:00:00.000Z",
  "updatedAt": "2025-12-03T10:00:00.000Z"
}
```

- Errors:
  - 409 Conflict — nếu `userId` đã tồn tại.
  - 400 Bad Request

2. Get all users
   - Method: GET
   - URL: /users
   - Response: 200 OK — mảng các user.

3. Get user by id
   - Method: GET
   - URL: /users/:userId
   - Path param: `userId` (string)
   - Response:
     - 200 OK — object user
     - 404 Not Found — nếu user không tồn tại

4. Update user
   - Method: PATCH
   - URL: /users/:userId
   - Path param: `userId` (string)
   - Body (application/json): partial của `CreateUserDto` — chỉ gửi các trường cần cập nhật (không cần gửi `userId`). Ví dụ:

```json
{
  "name": "Alice Updated",
  "email": "alice.new@example.com",
  "role": "admin"
}
```

    - Response:
       - 200 OK: trả về object user đã được cập nhật, ví dụ:

```json
{
  "userId": "DX01",
  "email": "alice.new@example.com",
  "name": "Alice Updated",
  "role": "admin",
  "isActive": true,
  "createdAt": "2025-12-03T10:00:00.000Z",
  "updatedAt": "2025-12-04T09:00:00.000Z"
}
```

    - Errors:
       - 404 Not Found — nếu `userId` không tồn tại.
       - 400 Bad Request — nếu payload không hợp lệ 

5. Delete user
   - Method: DELETE
   - URL: /users/:userId
   - Response:
     - 204 No Content — xóa thành công
     - 404 Not Found — nếu user không tồn tại

## Example requests (PowerShell)

Create user:

```powershell
$body = @{
   userId = "DX01"
   email = "alice@example.com"
   name = "Alice Nguyen"
   role = "staff"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri http://localhost:3000/users -Body $body -ContentType 'application/json'
```

Get all users:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/users
```

Get one user:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/users/DX01
```

Update user:

```powershell
$patch = @{ name = "Alice Updated" } | ConvertTo-Json
Invoke-RestMethod -Method Patch -Uri http://localhost:3000/users/DX01 -Body $patch -ContentType 'application/json'
```

Delete user:

```powershell
Invoke-RestMethod -Method Delete -Uri http://localhost:3000/users/DX01
```

## Environment variables

Copy `.env.example` -> `.env` và chỉnh cho phù hợp. Các biến quan trọng:

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `PORT` (mặc định 3000)
- `NODE_ENV` (development/production)

## Docker / Docker Compose

Build image và chạy bằng docker-compose:

```powershell
docker-compose up --build
```

Nếu bạn dùng `docker-compose.example.yml`, copy và sửa theo nhu cầu.
