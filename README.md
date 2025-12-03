# User Management (NestJS)

Small NestJS service for user management. This repository includes a Dockerfile and a docker-compose example to run the app together with Postgres locally.


## 🗄️ Database Auto-Migration

This project uses **TypeORM migrations** that run automatically when you start the application with Docker Compose.


### Migration Files

Migrations are located in `src/migrations/`:

- `CreateUsersTable.ts` - Creates the `users` table with all columns

### Database Schema

The `users` table includes:

- `userId` (varchar, primary key)
- `email` (varchar, unique)
- `name` (varchar)
- `role` (varchar)
- `isActive` (boolean, default: true)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)




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
     - `role` (string) — tùy chọn (ví dụ `staff`, `admin`).

   Example:

```json
{
  "userId": "DX01",
  "email": "alice@example.com",
  "name": "Alice",
  "role": "staff"
}
```

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
