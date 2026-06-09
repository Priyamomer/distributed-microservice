# UserService — API Endpoints

Base URL: `http://62.238.15.118:30000`

---

## 1. POST /v1/auth/signup
**Status: ✅ Working**

| Field | Value |
|---|---|
| Full URL | `http://62.238.15.118:30000/v1/auth/signup` |
| Method | POST |

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "email": "user@example.com",
  "roles": []
}
```

---

## 2. POST /v1/auth/password
**Status: ✅ Working**

| Field | Value |
|---|---|
| Full URL | `http://62.238.15.118:30000/v1/auth/password` |
| Method | POST |

**Request Body:**
```json
{
  "email": "user@example.com",
  "oldPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

**Response:**
```
"Password Change Successfully"
```

---

## 3. POST /v1/roles
**Status: ✅ Working**

| Field | Value |
|---|---|
| Full URL | `http://62.238.15.118:30000/v1/roles` |
| Method | POST |

**Request Body:**
```json
{
  "name": "ROLE_ADMIN"
}
```

**Response:**
```json
{
  "id": 1,
  "role": "ROLE_ADMIN"
}
```

---

## 4. GET /v1/roles
**Status: ❌ Not Working — returns 401 Unauthorized**

| Field | Value |
|---|---|
| Full URL | `http://62.238.15.118:30000/v1/roles` |
| Method | GET |

**Request Body:** None

**Expected Response:**
```json
[
  { "id": 1, "role": "ROLE_ADMIN" },
  { "id": 2, "role": "ROLE_USER" }
]
```

**Issue:** Gateway is blocking this route with a 401. Likely missing auth token passthrough or the route is not whitelisted in the gateway security config.

---

## 5. GET /v1/users/{id}
**Status: ❌ Not Working — returns 401 Unauthorized**

| Field | Value |
|---|---|
| Full URL | `http://62.238.15.118:30000/v1/users/1` |
| Method | GET |
| Path Variable | `id` — the user's numeric ID |

**Request Body:** None

**Expected Response:**
```json
{
  "email": "user@example.com",
  "roles": [
    { "id": 1, "role": "ROLE_ADMIN" }
  ]
}
```

**Issue:** Gateway is blocking this route with a 401. Likely missing auth token passthrough or the route is not whitelisted in the gateway security config.

---

## 6. POST /v1/users/{id}/roles
**Status: ✅ Working**

| Field | Value |
|---|---|
| Full URL | `http://62.238.15.118:30000/v1/users/1/roles` |
| Method | POST |
| Path Variable | `id` — the user's numeric ID |

**Request Body:**
```json
{
  "roleIds": [1, 2]
}
```

**Response:**
```json
{
  "email": "user@example.com",
  "roles": [
    { "id": 1, "role": "ROLE_ADMIN" }
  ]
}
```

---

## Summary

| # | Method | Endpoint | Status |
|---|---|---|---|
| 1 | POST | `/v1/auth/signup` | ✅ Working |
| 2 | POST | `/v1/auth/password` | ✅ Working |
| 3 | POST | `/v1/roles` | ✅ Working |
| 4 | GET | `/v1/roles` | ❌ 401 Unauthorized |
| 5 | GET | `/v1/users/{id}` | ❌ 401 Unauthorized |
| 6 | POST | `/v1/users/{id}/roles` | ✅ Working |
