
## Run: 2026-05-27 06:23:28 UTC  |  Host: http://62.238.15.118:30200

| Service | Working Endpoints | Total Endpoints | Status |
|---|:---:|:---:|---|
| User Service | 6 | 6 | ✅ ALL PASS |
| Product Service | 0 | 6 | ❌ ALL FAIL |
| Cart Service | 0 | 4 | ❌ ALL FAIL |
| Order Service | 0 | 2 | ❌ ALL FAIL |
| Payment Service | 1 | 2 | ⚠️ PARTIAL |
| Notification Service | 0 | 1 | ❌ ALL FAIL |

### Endpoint Detail

**User Service**
- ✅ `POST /v1/auth/signup`
- ✅ `POST /v1/auth/password`
- ✅ `POST /v1/roles`
- ✅ `GET /v1/roles`
- ✅ `GET /v1/users/1`
- ✅ `POST /v1/users/1/roles`

**Product Service**
- ❌ `POST /v1/products`  _(0 passed, 5 failed)_
- ❌ `GET /v1/products`  _(0 passed, 3 failed)_
- ❌ `GET /v1/products/undefined`  _(1 passed, 3 failed)_
- ❌ `PATCH /v1/products`  _(0 passed, 3 failed)_
- ❌ `POST /v1/products/search`  _(0 passed, 4 failed)_
- ❌ `DELETE /v1/products/undefined`  _(1 passed, 1 failed)_

**Cart Service**
- ❌ `GET /v1/cart/testuser_1779863005073`  _(0 passed, 3 failed)_
- ❌ `POST /v1/cart/testuser_1779863005073/items`  _(0 passed, 3 failed)_
- ❌ `PATCH /v1/cart/testuser_1779863005073/items`  _(0 passed, 3 failed)_
- ❌ `DELETE /v1/cart/testuser_1779863005073/items`  _(0 passed, 2 failed)_

**Order Service**
- ❌ `POST /v1/orders`  _(0 passed, 6 failed)_
- ❌ `GET /v1/orders/testuser_1779863006730`  _(0 passed, 2 failed)_

**Payment Service**
- ✅ `POST /v1/payments`
- ❌ `POST /v1/payments/webhooks`  _(1 passed, 1 failed)_

**Notification Service**
- ❌ `POST /v1/notifications/send-message`  _(0 passed, 2 failed)_

**Overall: 7/21 endpoints working**

---

## Run: 2026-05-27 06:27:23 UTC  |  Gateway: http://62.238.15.118:30000  |  Auth: http://62.238.15.118:30200

| Service | Working Endpoints | Total Endpoints | Status |
|---|:---:|:---:|---|
| User Service | 3 | 4 | ⚠️ PARTIAL |
| Product Service | 5 | 6 | ⚠️ PARTIAL |
| Cart Service | 0 | 4 | ❌ ALL FAIL |
| Order Service | 0 | 2 | ❌ ALL FAIL |
| Payment Service | 2 | 2 | ✅ ALL PASS |
| Notification Service | 0 | 1 | ❌ ALL FAIL |

### Endpoint Detail

**User Service**
- ✅ `POST /v1/auth/signup`
- ✅ `POST /v1/auth/password`
- ✅ `POST /v1/roles`
- ❌ `GET /v1/roles`  _(0 passed, 2 failed)_

**Product Service**
- ✅ `POST /v1/products`
- ✅ `GET /v1/products`
- ✅ `GET /v1/products/0ff89edd-2771-4e4d-bd54-1ebe08de79c2`
- ✅ `PATCH /v1/products`
- ❌ `POST /v1/products/search`  _(0 passed, 4 failed)_
- ✅ `DELETE /v1/products/0ff89edd-2771-4e4d-bd54-1ebe08de79c2`

**Cart Service**
- ❌ `GET /v1/cart/testuser_1779863206414`  _(0 passed, 3 failed)_
- ❌ `POST /v1/cart/testuser_1779863206414/items`  _(0 passed, 3 failed)_
- ❌ `PATCH /v1/cart/testuser_1779863206414/items`  _(0 passed, 3 failed)_
- ❌ `DELETE /v1/cart/testuser_1779863206414/items`  _(0 passed, 2 failed)_

**Order Service**
- ❌ `POST /v1/orders`  _(0 passed, 6 failed)_
- ❌ `GET /v1/orders/testuser_1779863208350`  _(0 passed, 2 failed)_

**Payment Service**
- ✅ `POST /v1/payments`
- ✅ `POST /v1/payments/webhooks`

**Notification Service**
- ❌ `POST /v1/notifications/send-message`  _(0 passed, 2 failed)_

**Overall: 10/19 endpoints working**

---

## Run: 2026-05-27 06:29:36 UTC  |  Gateway: http://62.238.15.118:30000  |  Auth: http://62.238.15.118:30200

| Service | Working Endpoints | Total Endpoints | Status |
|---|:---:|:---:|---|
| User Service | 4 | 6 | ⚠️ PARTIAL |
| Product Service | 5 | 6 | ⚠️ PARTIAL |
| Cart Service | 0 | 4 | ❌ ALL FAIL |
| Order Service | 0 | 3 | ❌ ALL FAIL |
| Payment Service | 2 | 2 | ✅ ALL PASS |
| Notification Service | 0 | 1 | ❌ ALL FAIL |

### Endpoint Detail

**User Service**
- ✅ `POST /v1/auth/signup`
- ✅ `POST /v1/auth/password`
- ✅ `POST /v1/roles`
- ❌ `GET /v1/roles`  _(0 passed, 3 failed)_
- ❌ `GET /v1/users/1`  _(0 passed, 3 failed)_
- ✅ `POST /v1/users/1/roles`

**Product Service**
- ✅ `POST /v1/products`
- ✅ `GET /v1/products`
- ✅ `GET /v1/products/c09af5cf-ecb6-4712-84b7-2494e27b0f95`
- ✅ `PATCH /v1/products`
- ❌ `POST /v1/products/search`  _(0 passed, 4 failed)_
- ✅ `DELETE /v1/products/c09af5cf-ecb6-4712-84b7-2494e27b0f95`

**Cart Service**
- ❌ `GET /v1/cart/testuser_1779863343297`  _(0 passed, 3 failed)_
- ❌ `POST /v1/cart/testuser_1779863343297/items`  _(0 passed, 3 failed)_
- ❌ `PATCH /v1/cart/testuser_1779863343297/items`  _(0 passed, 3 failed)_
- ❌ `DELETE /v1/cart/testuser_1779863343297/items`  _(0 passed, 2 failed)_

**Order Service**
- ❌ `POST /v1/orders`  _(0 passed, 6 failed)_
- ❌ `GET /v1/orders/testuser_1779863344591`  _(0 passed, 3 failed)_
- ❌ `PATCH /v1/orders/payment-status`  _(0 passed, 2 failed)_

**Payment Service**
- ✅ `POST /v1/payments`
- ✅ `POST /v1/payments/webhooks`

**Notification Service**
- ❌ `POST /v1/notifications/send-message`  _(0 passed, 3 failed)_

**Overall: 11/22 endpoints working**

---

## Run: 2026-05-27 06:39:43 UTC  |  Gateway: http://62.238.15.118:30000  |  Auth: http://62.238.15.118:30200

| Service | Working Endpoints | Total Endpoints | Status |
|---|:---:|:---:|---|
| User Service | 4 | 6 | ⚠️ PARTIAL |
| Product Service | 5 | 6 | ⚠️ PARTIAL |
| Cart Service | 3 | 4 | ⚠️ PARTIAL |
| Order Service | 0 | 3 | ❌ ALL FAIL |
| Payment Service | 2 | 2 | ✅ ALL PASS |
| Notification Service | 0 | 1 | ❌ ALL FAIL |

### Endpoint Detail

**User Service**
- ✅ `POST /v1/auth/signup`
- ✅ `POST /v1/auth/password`
- ✅ `POST /v1/roles`
- ❌ `GET /v1/roles`  _(0 passed, 3 failed)_
- ❌ `GET /v1/users/1`  _(0 passed, 3 failed)_
- ✅ `POST /v1/users/1/roles`

**Product Service**
- ✅ `POST /v1/products`
- ✅ `GET /v1/products`
- ✅ `GET /v1/products/63422e1e-7977-4d6f-9c92-90ebdba8a43b`
- ✅ `PATCH /v1/products`
- ❌ `POST /v1/products/search`  _(0 passed, 4 failed)_
- ✅ `DELETE /v1/products/63422e1e-7977-4d6f-9c92-90ebdba8a43b`

**Cart Service**
- ❌ `GET /v1/cart/1`  _(0 passed, 3 failed)_
- ✅ `POST /v1/cart/1/items`
- ✅ `PATCH /v1/cart/1/items`
- ✅ `DELETE /v1/cart/1/items`

**Order Service**
- ❌ `POST /v1/orders`  _(0 passed, 6 failed)_
- ❌ `GET /v1/orders/1`  _(0 passed, 3 failed)_
- ❌ `PATCH /v1/orders/payment-status`  _(0 passed, 2 failed)_

**Payment Service**
- ✅ `POST /v1/payments`
- ✅ `POST /v1/payments/webhooks`

**Notification Service**
- ❌ `POST /v1/notifications/send-message`  _(0 passed, 3 failed)_

**Overall: 14/22 endpoints working**

---

## Run: 2026-05-27 06:58:15 UTC  |  Gateway: http://62.238.15.118:30000  |  Auth: http://62.238.15.118:30200

| Service | Working Endpoints | Total Endpoints | Status |
|---|:---:|:---:|---|
| User Service | 4 | 6 | ⚠️ PARTIAL |
| Product Service | 5 | 6 | ⚠️ PARTIAL |
| Cart Service | 3 | 4 | ⚠️ PARTIAL |
| Order Service | 0 | 3 | ❌ ALL FAIL |
| Payment Service | 2 | 2 | ✅ ALL PASS |
| Notification Service | 0 | 1 | ❌ ALL FAIL |

### Endpoint Detail

**User Service**
- ✅ `POST /v1/auth/signup`
- ✅ `POST /v1/auth/password`
- ✅ `POST /v1/roles`
- ❌ `GET /v1/roles`  _(0 passed, 3 failed)_
- ❌ `GET /v1/users/1`  _(0 passed, 3 failed)_
- ✅ `POST /v1/users/1/roles`

**Product Service**
- ✅ `POST /v1/products`
- ✅ `GET /v1/products`
- ✅ `GET /v1/products/532a0de8-b116-4579-a7e2-8f679b9ca04b`
- ✅ `PATCH /v1/products`
- ❌ `POST /v1/products/search`  _(0 passed, 4 failed)_
- ✅ `DELETE /v1/products/532a0de8-b116-4579-a7e2-8f679b9ca04b`

**Cart Service**
- ❌ `GET /v1/cart/1`  _(0 passed, 3 failed)_
- ✅ `POST /v1/cart/1/items`
- ✅ `PATCH /v1/cart/1/items`
- ✅ `DELETE /v1/cart/1/items`

**Order Service**
- ❌ `POST /v1/orders`  _(0 passed, 6 failed)_
- ❌ `GET /v1/orders/1`  _(0 passed, 3 failed)_
- ❌ `PATCH /v1/orders/payment-status`  _(0 passed, 2 failed)_

**Payment Service**
- ✅ `POST /v1/payments`
- ✅ `POST /v1/payments/webhooks`

**Notification Service**
- ❌ `POST /v1/notifications/send-message`  _(0 passed, 3 failed)_

**Overall: 14/22 endpoints working**

---

## Run: 2026-05-27 07:00:04 UTC  |  Gateway: http://62.238.15.118:30000  |  Auth: http://62.238.15.118:30200

| Service | Working Endpoints | Total Endpoints | Status |
|---|:---:|:---:|---|
| User Service | 4 | 6 | ⚠️ PARTIAL |
| Product Service | 5 | 6 | ⚠️ PARTIAL |
| Cart Service | 3 | 4 | ⚠️ PARTIAL |
| Order Service | 0 | 3 | ❌ ALL FAIL |
| Payment Service | 2 | 2 | ✅ ALL PASS |
| Notification Service | 0 | 1 | ❌ ALL FAIL |

### Endpoint Detail

**User Service**
- ✅ `POST /v1/auth/signup`
- ✅ `POST /v1/auth/password`
- ✅ `POST /v1/roles`
- ❌ `GET /v1/roles`  _(0 passed, 3 failed)_
- ❌ `GET /v1/users/1`  _(0 passed, 3 failed)_
- ✅ `POST /v1/users/1/roles`

**Product Service**
- ✅ `POST /v1/products`
- ✅ `GET /v1/products`
- ✅ `GET /v1/products/ee7bd231-f299-4b06-9b06-5caaf39fd229`
- ✅ `PATCH /v1/products`
- ❌ `POST /v1/products/search`  _(0 passed, 4 failed)_
- ✅ `DELETE /v1/products/ee7bd231-f299-4b06-9b06-5caaf39fd229`

**Cart Service**
- ❌ `GET /v1/cart/1`  _(0 passed, 3 failed)_
- ✅ `POST /v1/cart/1/items`
- ✅ `PATCH /v1/cart/1/items`
- ✅ `DELETE /v1/cart/1/items`

**Order Service**
- ❌ `POST /v1/orders`  _(0 passed, 6 failed)_
- ❌ `GET /v1/orders/1`  _(0 passed, 3 failed)_
- ❌ `PATCH /v1/orders/payment-status`  _(0 passed, 2 failed)_

**Payment Service**
- ✅ `POST /v1/payments`
- ✅ `POST /v1/payments/webhooks`

**Notification Service**
- ❌ `POST /v1/notifications/send-message`  _(0 passed, 3 failed)_

**Overall: 14/22 endpoints working**

---

## Run: 2026-05-27 07:13:36 UTC  |  Gateway: http://62.238.15.118:30000  |  Auth: http://62.238.15.118:30200

| Service | Working Endpoints | Total Endpoints | Status |
|---|:---:|:---:|---|
| User Service | 4 | 6 | ⚠️ PARTIAL |
| Product Service | 5 | 6 | ⚠️ PARTIAL |
| Cart Service | 3 | 4 | ⚠️ PARTIAL |
| Order Service | 1 | 3 | ⚠️ PARTIAL |
| Payment Service | 2 | 2 | ✅ ALL PASS |
| Notification Service | 0 | 1 | ❌ ALL FAIL |

### Endpoint Detail

**User Service**
- ✅ `POST /v1/auth/signup`
- ✅ `POST /v1/auth/password`
- ✅ `POST /v1/roles`
- ❌ `GET /v1/roles`  _(0 passed, 3 failed)_
- ❌ `GET /v1/users/1`  _(0 passed, 3 failed)_
- ✅ `POST /v1/users/1/roles`

**Product Service**
- ✅ `POST /v1/products`
- ✅ `GET /v1/products`
- ✅ `GET /v1/products/d44bac61-4d47-4331-803e-6a0e8a4292a4`
- ✅ `PATCH /v1/products`
- ❌ `POST /v1/products/search`  _(0 passed, 4 failed)_
- ✅ `DELETE /v1/products/d44bac61-4d47-4331-803e-6a0e8a4292a4`

**Cart Service**
- ❌ `GET /v1/cart/1`  _(0 passed, 3 failed)_
- ✅ `POST /v1/cart/1/items`
- ✅ `PATCH /v1/cart/1/items`
- ✅ `DELETE /v1/cart/1/items`

**Order Service**
- ✅ `POST /v1/orders`
- ❌ `GET /v1/orders/1`  _(0 passed, 3 failed)_
- ❌ `PATCH /v1/orders/payment-status`  _(0 passed, 2 failed)_

**Payment Service**
- ✅ `POST /v1/payments`
- ✅ `POST /v1/payments/webhooks`

**Notification Service**
- ❌ `POST /v1/notifications/send-message`  _(0 passed, 3 failed)_

**Overall: 15/22 endpoints working**

---

## Run: 2026-05-27 09:02:28 UTC  |  Gateway: http://62.238.15.118:30000  |  Auth: http://62.238.15.118:30200

| Service | Working Endpoints | Total Endpoints | Status |
|---|:---:|:---:|---|
| User Service | 4 | 6 | ⚠️ PARTIAL |
| Product Service | 5 | 6 | ⚠️ PARTIAL |
| Cart Service | 4 | 4 | ✅ ALL PASS |
| Order Service | 1 | 3 | ⚠️ PARTIAL |
| Payment Service | 2 | 2 | ✅ ALL PASS |
| Notification Service | 0 | 1 | ❌ ALL FAIL |

### Endpoint Detail

**User Service**
- ✅ `POST /v1/auth/signup`
- ✅ `POST /v1/auth/password`
- ✅ `POST /v1/roles`
- ❌ `GET /v1/roles`  _(0 passed, 3 failed)_
- ❌ `GET /v1/users/1`  _(0 passed, 3 failed)_
- ✅ `POST /v1/users/1/roles`

**Product Service**
- ✅ `POST /v1/products`
- ✅ `GET /v1/products`
- ✅ `GET /v1/products/f3ee4dea-2b0f-42a2-aa23-f6e135b8d22b`
- ✅ `PATCH /v1/products`
- ❌ `POST /v1/products/search`  _(0 passed, 4 failed)_
- ✅ `DELETE /v1/products/28356df7-22cd-470b-9e6a-faeab80ff3b2`

**Cart Service**
- ✅ `GET /v1/cart/1`
- ✅ `POST /v1/cart/1/items`
- ✅ `PATCH /v1/cart/1/items`
- ✅ `DELETE /v1/cart/1/items`

**Order Service**
- ✅ `POST /v1/orders`
- ❌ `GET /v1/orders/1`  _(0 passed, 3 failed)_
- ❌ `PATCH /v1/orders/payment-status`  _(0 passed, 2 failed)_

**Payment Service**
- ✅ `POST /v1/payments`
- ✅ `POST /v1/payments/webhooks`

**Notification Service**
- ❌ `POST /v1/notifications/send-message`  _(0 passed, 3 failed)_

**Overall: 16/22 endpoints working**

---

## Run: 2026-06-09 08:51:26 UTC  |  Gateway: http://62.238.15.118:30000  |  Auth: http://62.238.15.118:30200

| Service | Working Endpoints | Total Endpoints | Status |
|---|:---:|:---:|---|
| User Service | 4 | 6 | ⚠️ PARTIAL |
| Product Service | 5 | 6 | ⚠️ PARTIAL |
| Cart Service | 4 | 4 | ✅ ALL PASS |
| Order Service | 1 | 3 | ⚠️ PARTIAL |
| Payment Service | 2 | 2 | ✅ ALL PASS |
| Notification Service | 0 | 1 | ❌ ALL FAIL |

### Endpoint Detail

**User Service**
- ✅ `POST /v1/auth/signup`
- ✅ `POST /v1/auth/password`
- ✅ `POST /v1/roles`
- ❌ `GET /v1/roles`  _(0 passed, 3 failed)_
- ❌ `GET /v1/users/1`  _(0 passed, 3 failed)_
- ✅ `POST /v1/users/1/roles`

**Product Service**
- ✅ `POST /v1/products`
- ✅ `GET /v1/products`
- ✅ `GET /v1/products/4d3e0f74-a9fd-4b49-8e6b-1e73d06cb83a`
- ✅ `PATCH /v1/products`
- ❌ `POST /v1/products/search`  _(0 passed, 4 failed)_
- ✅ `DELETE /v1/products/e570d226-06d8-40e4-8e39-f83a45f2a369`

**Cart Service**
- ✅ `GET /v1/cart/1`
- ✅ `POST /v1/cart/1/items`
- ✅ `PATCH /v1/cart/1/items`
- ✅ `DELETE /v1/cart/1/items`

**Order Service**
- ✅ `POST /v1/orders`
- ❌ `GET /v1/orders/1`  _(0 passed, 3 failed)_
- ❌ `PATCH /v1/orders/payment-status`  _(0 passed, 2 failed)_

**Payment Service**
- ✅ `POST /v1/payments`
- ✅ `POST /v1/payments/webhooks`

**Notification Service**
- ❌ `POST /v1/notifications/send-message`  _(0 passed, 3 failed)_

**Overall: 16/22 endpoints working**

---

## Run: 2026-06-09 09:34:14 UTC  |  Gateway: http://62.238.15.118:30000  |  Auth: http://62.238.15.118:30200

| Service | Working Endpoints | Total Endpoints | Status |
|---|:---:|:---:|---|
| User Service | 6 | 6 | ✅ ALL PASS |
| Product Service | 5 | 6 | ⚠️ PARTIAL |
| Cart Service | 4 | 4 | ✅ ALL PASS |
| Order Service | 2 | 3 | ⚠️ PARTIAL |
| Payment Service | 2 | 2 | ✅ ALL PASS |
| Notification Service | 0 | 1 | ❌ ALL FAIL |

### Endpoint Detail

**User Service**
- ✅ `POST /v1/auth/signup`
- ✅ `POST /v1/auth/password`
- ✅ `POST /v1/roles`
- ✅ `GET /v1/roles`
- ✅ `GET /v1/users/1`
- ✅ `POST /v1/users/1/roles`

**Product Service**
- ✅ `POST /v1/products`
- ✅ `GET /v1/products`
- ✅ `GET /v1/products/fe635c94-c254-423e-b7c6-f20256c775b2`
- ✅ `PATCH /v1/products`
- ❌ `POST /v1/products/search`  _(0 passed, 4 failed)_
- ✅ `DELETE /v1/products/1707cca3-87a6-40b6-8069-d1e81d72b80a`

**Cart Service**
- ✅ `GET /v1/cart/1`
- ✅ `POST /v1/cart/1/items`
- ✅ `PATCH /v1/cart/1/items`
- ✅ `DELETE /v1/cart/1/items`

**Order Service**
- ✅ `POST /v1/orders`
- ✅ `GET /v1/orders/1`
- ❌ `PATCH /v1/orders/payment-status`  _(0 passed, 2 failed)_

**Payment Service**
- ✅ `POST /v1/payments`
- ✅ `POST /v1/payments/webhooks`

**Notification Service**
- ❌ `POST /v1/notifications/send-message`  _(0 passed, 3 failed)_

**Overall: 19/22 endpoints working**

---

## Run: 2026-06-09 09:40:46 UTC  |  Gateway: http://62.238.15.118:30000  |  Auth: http://62.238.15.118:30200

| Service | Working Endpoints | Total Endpoints | Status |
|---|:---:|:---:|---|
| User Service | 6 | 6 | ✅ ALL PASS |
| Product Service | 5 | 6 | ⚠️ PARTIAL |
| Cart Service | 4 | 4 | ✅ ALL PASS |
| Order Service | 2 | 3 | ⚠️ PARTIAL |
| Payment Service | 2 | 2 | ✅ ALL PASS |
| Notification Service | 0 | 1 | ❌ ALL FAIL |

### Endpoint Detail

**User Service**
- ✅ `POST /v1/auth/signup`
- ✅ `POST /v1/auth/password`
- ✅ `POST /v1/roles`
- ✅ `GET /v1/roles`
- ✅ `GET /v1/users/1`
- ✅ `POST /v1/users/1/roles`

**Product Service**
- ✅ `POST /v1/products`
- ✅ `GET /v1/products`
- ✅ `GET /v1/products/74f163f7-9118-4372-9cc1-e817d911df18`
- ✅ `PATCH /v1/products`
- ❌ `POST /v1/products/search`  _(0 passed, 4 failed)_
- ✅ `DELETE /v1/products/3e75a27f-85f9-4fa5-bdfa-a40679ac8f64`

**Cart Service**
- ✅ `GET /v1/cart/1`
- ✅ `POST /v1/cart/1/items`
- ✅ `PATCH /v1/cart/1/items`
- ✅ `DELETE /v1/cart/1/items`

**Order Service**
- ✅ `POST /v1/orders`
- ✅ `GET /v1/orders/1`
- ❌ `PATCH /v1/orders/payment-status`  _(0 passed, 2 failed)_

**Payment Service**
- ✅ `POST /v1/payments`
- ✅ `POST /v1/payments/webhooks`

**Notification Service**
- ❌ `POST /v1/notifications/send-message`  _(0 passed, 3 failed)_

**Overall: 19/22 endpoints working**

---

## Run: 2026-06-09 09:52:00 UTC  |  Gateway: http://62.238.15.118:30000  |  Auth: http://62.238.15.118:30200

| Service | Working Endpoints | Total Endpoints | Status |
|---|:---:|:---:|---|
| User Service | 6 | 6 | ✅ ALL PASS |
| Product Service | 6 | 6 | ✅ ALL PASS |
| Cart Service | 4 | 4 | ✅ ALL PASS |
| Order Service | 2 | 3 | ⚠️ PARTIAL |
| Payment Service | 2 | 2 | ✅ ALL PASS |
| Notification Service | 0 | 1 | ❌ ALL FAIL |

### Endpoint Detail

**User Service**
- ✅ `POST /v1/auth/signup`
- ✅ `POST /v1/auth/password`
- ✅ `POST /v1/roles`
- ✅ `GET /v1/roles`
- ✅ `GET /v1/users/1`
- ✅ `POST /v1/users/1/roles`

**Product Service**
- ✅ `POST /v1/products`
- ✅ `GET /v1/products`
- ✅ `GET /v1/products/7ed5fead-bd30-4ddb-82f1-5488cb9c5a6b`
- ✅ `PATCH /v1/products`
- ✅ `POST /v1/products/search`
- ✅ `DELETE /v1/products/f6a0aa43-623c-4412-9357-aaca46947798`

**Cart Service**
- ✅ `GET /v1/cart/1`
- ✅ `POST /v1/cart/1/items`
- ✅ `PATCH /v1/cart/1/items`
- ✅ `DELETE /v1/cart/1/items`

**Order Service**
- ✅ `POST /v1/orders`
- ✅ `GET /v1/orders/1`
- ❌ `PATCH /v1/orders/payment-status`  _(0 passed, 2 failed)_

**Payment Service**
- ✅ `POST /v1/payments`
- ✅ `POST /v1/payments/webhooks`

**Notification Service**
- ❌ `POST /v1/notifications/send-message`  _(0 passed, 3 failed)_

**Overall: 20/22 endpoints working**

---

## Run: 2026-06-09 11:15:52 UTC  |  Gateway: http://62.238.15.118:30000  |  Auth: http://62.238.15.118:30200

| Service | Working Endpoints | Total Endpoints | Status |
|---|:---:|:---:|---|
| User Service | 6 | 6 | ✅ ALL PASS |
| Product Service | 6 | 6 | ✅ ALL PASS |
| Cart Service | 4 | 4 | ✅ ALL PASS |
| Order Service | 3 | 3 | ✅ ALL PASS |
| Payment Service | 2 | 2 | ✅ ALL PASS |
| Notification Service | 0 | 1 | ❌ ALL FAIL |

### Endpoint Detail

**User Service**
- ✅ `POST /v1/auth/signup`
- ✅ `POST /v1/auth/password`
- ✅ `POST /v1/roles`
- ✅ `GET /v1/roles`
- ✅ `GET /v1/users/1`
- ✅ `POST /v1/users/1/roles`

**Product Service**
- ✅ `POST /v1/products`
- ✅ `GET /v1/products`
- ✅ `GET /v1/products/719b0efc-59b3-4ba3-a7e4-7ea181a2bf0c`
- ✅ `PATCH /v1/products`
- ✅ `POST /v1/products/search`
- ✅ `DELETE /v1/products/2446ea4e-b965-49a7-a6b8-c24471744d97`

**Cart Service**
- ✅ `GET /v1/cart/1`
- ✅ `POST /v1/cart/1/items`
- ✅ `PATCH /v1/cart/1/items`
- ✅ `DELETE /v1/cart/1/items`

**Order Service**
- ✅ `POST /v1/orders`
- ✅ `GET /v1/orders/1`
- ✅ `PATCH /v1/orders/payment-status`

**Payment Service**
- ✅ `POST /v1/payments`
- ✅ `POST /v1/payments/webhooks`

**Notification Service**
- ❌ `POST /v1/notifications/send-message`  _(0 passed, 3 failed)_

**Overall: 21/22 endpoints working**

---

## Run: 2026-06-09 11:16:53 UTC  |  Gateway: http://62.238.15.118:30000  |  Auth: http://62.238.15.118:30200

| Service | Working Endpoints | Total Endpoints | Status |
|---|:---:|:---:|---|
| User Service | 6 | 6 | ✅ ALL PASS |
| Product Service | 6 | 6 | ✅ ALL PASS |
| Cart Service | 4 | 4 | ✅ ALL PASS |
| Order Service | 3 | 3 | ✅ ALL PASS |
| Payment Service | 2 | 2 | ✅ ALL PASS |
| Notification Service | 0 | 1 | ❌ ALL FAIL |

### Endpoint Detail

**User Service**
- ✅ `POST /v1/auth/signup`
- ✅ `POST /v1/auth/password`
- ✅ `POST /v1/roles`
- ✅ `GET /v1/roles`
- ✅ `GET /v1/users/1`
- ✅ `POST /v1/users/1/roles`

**Product Service**
- ✅ `POST /v1/products`
- ✅ `GET /v1/products`
- ✅ `GET /v1/products/9c6aa153-d32e-4249-8e9b-fd32088738a2`
- ✅ `PATCH /v1/products`
- ✅ `POST /v1/products/search`
- ✅ `DELETE /v1/products/97b71fd1-b22c-44ab-af81-86ee00a41c43`

**Cart Service**
- ✅ `GET /v1/cart/1`
- ✅ `POST /v1/cart/1/items`
- ✅ `PATCH /v1/cart/1/items`
- ✅ `DELETE /v1/cart/1/items`

**Order Service**
- ✅ `POST /v1/orders`
- ✅ `GET /v1/orders/1`
- ✅ `PATCH /v1/orders/payment-status`

**Payment Service**
- ✅ `POST /v1/payments`
- ✅ `POST /v1/payments/webhooks`

**Notification Service**
- ❌ `POST /v1/notifications/send-message`  _(0 passed, 3 failed)_

**Overall: 21/22 endpoints working**

---
