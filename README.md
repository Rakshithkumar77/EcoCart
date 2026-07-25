# Premium Full-Stack E-Commerce Platform

A production-grade, highly responsive, and aesthetically outstanding E-Commerce application. Built with a state-of-the-art tech stack consisting of **Spring Boot 3.4.2 (Java 21/25)**, **React 18 (Vite + Tailwind CSS v4)**, and **MySQL 8**. 

The platform supports robust Stateless JWT Authentication, hierarchical category mapping, pagination + specification queries, order lifecycle transitions, interactive stats graphs, and a complete checkout workflow.

---

## 🚀 Tech Stack & Core Libraries

### Backend
*   **Java 25 / 21** with Spring Boot 3.4.2
*   **Spring Security & JWT** (Stateless access & refresh token rotation)
*   **Spring Data JPA & Hibernate** (Specification-based dynamic filtering)
*   **MySQL 8** (Relational Database)
*   **Lombok & SLF4J** (Boilerplate reduction & logging)
*   **Springdoc OpenAPI / Swagger UI** (Interactive API testing console)

### Frontend
*   **React 18** (Vite SPA bundler)
*   **Tailwind CSS v4** (Advanced PostCSS styling)
*   **React Router Dom v6** (Client-side routing)
*   **React Hook Form & Zod** (Typesafe client validations)
*   **Axios** (With custom refresh interceptor queues)
*   **Recharts** (Interactive administrative sales dashboards)
*   **React Toastify** (Fluid feedback toasts)

---

## 📂 Project Directory Structure

```
├── backend/
│   ├── src/main/java/com/example/ecommerce/
│   │   ├── config/          # Spring Security, CORS & Swagger configs
│   │   ├── controller/      # REST API Controllers (Customer & Admin)
│   │   ├── dto/             # Request & Response payload entities
│   │   ├── entity/          # JPA Hibernate database entities (13 total)
│   │   ├── exception/       # Custom Exception types & Global handler
│   │   ├── mapper/          # Compile-safe static mapping methods
│   │   ├── repository/      # Spring Data JPA specifications-enabled interfaces
│   │   ├── security/        # JWT Authentication Filter & User details logic
│   │   ├── seeder/          # Auto-seeder setting up mock inventory and users
│   │   └── service/         # Business services implementation
│   ├── Dockerfile           # Multi-stage Java compiler and JRE build
│   └── pom.xml              # Maven dependencies override configurations
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, Route Guards (Admin / Protected)
│   │   ├── context/         # React Context Providers (Auth, Cart)
│   │   ├── pages/           # Store front client and account management screens
│   │   │   └── admin/       # CRUD products, categories, orders, users
│   │   ├── services/        # Axios API Client with failed request queues
│   │   ├── App.jsx          # Route router mapping
│   │   └── index.css        # Tailwind CSS imports & animations
│   ├── Dockerfile           # Multi-stage Node builder and Nginx container
│   ├── nginx.conf           # Client-side router proxy configurations
│   └── vite.config.js       # Vite development proxy targeting backend port 8080
│
├── .env                     # Local environment settings
└── docker-compose.yml       # Production-orchestration file
```

---

## 🔑 Seeded User Accounts

During the database startup phase, a `DataSeeder` automatically populates the tables with categories, coupons, reviews, and 30+ products. It also configures the following default login credentials:

| Role | Username | Password |
|---|---|---|
| **Administrator** | `admin@example.com` | `Admin@123` |
| **Standard User** | `user1@example.com` | `User@123` |
| **Standard User** | `user2@example.com` | `User@123` |

---

## ⚙️ Running Locally

### 1. Prerequisite Settings
*   Install Java 21 or Java 25.
*   Install Node.js 18+.
*   Create a local MySQL database named `ecommerce_db` at `localhost:3306`.
*   Ensure the database credentials in your root `.env` file match your MySQL setup.

### 2. Startup Backend
Navigate to the `/backend` folder and run the Maven wrapper:
```bash
cd backend
.\mvnw spring-boot:run
```
*   The API server will launch at: **`http://localhost:8080`**
*   Access Swagger UI interactive docs at: **`http://localhost:8080/swagger-ui/index.html`**

### 3. Startup Frontend
Navigate to the `/frontend` folder and start Vite:
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
*   The storefront will launch at: **`http://localhost:5173`**
*   Vite will proxy all requests starting with `/api` to port `8080` automatically.

---

## 🐳 Running with Docker Compose

To build and run the entire ecosystem (MySQL, Java JRE API, and Nginx Web Server) inside isolated containers, simply run the following command in the root workspace directory:

```bash
docker-compose up --build
```

### Port mappings inside Docker network:
*   **Storefront Web App**: Accessible at **`http://localhost:3000`**
*   **Spring Boot REST API**: Accessible at **`http://localhost:8080`**
*   **MySQL Server**: Accessible at **`localhost:3306`** (authenticated with user: `root`, password: `rootpassword`)

---

## 🛡️ Authentication Architecture (JWT Refresh Token Rotation)

Our stateless authentication system uses dual-token rotation:
1.  **Short-Lived Access Token (15 mins)**: Sent in the HTTP Authorization header (`Bearer <token>`) for secure API calls.
2.  **Long-Lived Refresh Token (7 days)**: Stored in the database and sent by the client when access expires.
3.  **Failed Interceptor Queue**: If a secure API call returns a `401 Unauthorized` response, our Axios client interceptor queue locks the process, calls `/api/auth/refresh-token` to exchange the refresh token for a new access token, updates local state, and replays all failed requests seamlessly without logging the user out.
