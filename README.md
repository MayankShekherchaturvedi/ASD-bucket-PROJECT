# Express Products API with In-Memory Caching

A layered Express.js application demonstrating in-memory caching with Time-to-Live (TTL), cache status headers (`HIT`/`MISS`), and automatic cache invalidation upon data mutation.

---

## Architecture & Request Flow

The application follows a strict layered architecture:

$$\text{Route} \longrightarrow \text{Middleware} \longrightarrow \text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Database}$$

1. **Route (`routes/`)**: Maps incoming HTTP requests to endpoints and attaches middleware before dispatching to controllers.
2. **Middleware (`middleware/`)**: Checks the in-memory cache, checks TTL expiration, sets cache status headers, and monitors mutations for invalidation.
3. **Controller (`controllers/`)**: Extracts request parameters and body, calls service methods, sets HTTP response status codes, and sends JSON responses.
4. **Service (`services/`)**: Houses business logic (ID generation, data mapping, filtering, updating).
5. **Database (`database/`)**: Manages persistence by reading from and writing to `db.json`.

---

## Directory Structure

```
newproj/
├── controllers/
│   ├── index.js
│   └── productController.js
├── database/
│   ├── db.js
│   └── index.js
├── middleware/
│   ├── cache.js
│   ├── cacheMiddleware.js
│   └── index.js
├── routes/
│   ├── index.js
│   ├── productRoutes.js
│   └── products.js
├── services/
│   ├── index.js
│   └── productService.js
├── db.json
├── package.json
├── server.js
└── test.js
```

---

## How Caching Works

### 1. In-Memory Store
Cached items are kept in an in-memory dictionary. Each entry stores:
- `data`: The JSON response payload.
- `createdAt`: Timestamp in milliseconds (`Date.now()`) when the entry was stored.

### 2. Time-to-Live (TTL)
- **TTL Duration**: 1 minute (60,000 ms).
- On each `GET` request:
  - If a cached entry exists and `Date.now() - createdAt < 60000`, the cached data is returned with `X-Cache: HIT`.
  - If the entry is older than 60,000 ms, the expired entry is deleted and treated as a cache miss.

### 3. Cache Headers
- `X-Cache: HIT`: Returned when the response was served directly from cache.
- `X-Cache: MISS`: Returned when data was read from the database and newly cached.

### 4. Cache Invalidation
Whenever a `POST`, `PUT`, `PATCH`, or `DELETE` request successfully modifies data in the database (status code `2xx`), all cache entries are invalidated immediately so that subsequent requests do not serve stale data.

---

## API Reference

Base URL: `http://localhost:3000`

### 1. Get All Products
- **Method**: `GET`
- **Path**: `/products`
- **Headers**:
  - `X-Cache: HIT` (if served from cache)
  - `X-Cache: MISS` (if read from database)
- **Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "Keyboard",
    "price": 49.99
  }
]
```

### 2. Get Product By ID
- **Method**: `GET`
- **Path**: `/products/:id`
- **Headers**:
  - `X-Cache: HIT` / `X-Cache: MISS`
- **Response**: `200 OK`
```json
{
  "id": 1,
  "name": "Keyboard",
  "price": 49.99
}
```
- **Error**: `404 Not Found` if product does not exist.

### 3. Create Product
- **Method**: `POST`
- **Path**: `/products`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "name": "Headphones",
  "price": 89.99
}
```
- **Response**: `201 Created`
- **Side Effect**: Invalidates all cache entries.

### 4. Replace Product
- **Method**: `PUT`
- **Path**: `/products/:id`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "name": "Wireless Keyboard",
  "price": 59.99
}
```
- **Response**: `200 OK`
- **Side Effect**: Invalidates all cache entries.

### 5. Update Product (Partial)
- **Method**: `PATCH`
- **Path**: `/products/:id`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "price": 44.99
}
```
- **Response**: `200 OK`
- **Side Effect**: Invalidates all cache entries.

### 6. Delete Product
- **Method**: `DELETE`
- **Path**: `/products/:id`
- **Response**: `200 OK`
```json
{
  "message": "Product deleted successfully"
}
```
- **Side Effect**: Invalidates all cache entries.

---

## Getting Started

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run server
```
Server runs on `http://localhost:3000`.

### Run Automated Tests
```bash
npm test
```
The test suite validates:
- Route and controller handling
- Cache MISS on first request
- Cache HIT on subsequent requests
- Cache invalidation on POST, PUT, PATCH, and DELETE
- 404 responses for non-existent items
- 1-minute TTL expiration behavior
