# Hospital Management System - Backend API

The backend for the Hospital Management System is a robust RESTful API built with Node.js and Express, utilizing modern ES Modules and strict TypeScript.

## 🛠️ Features

- **RESTful API**: Clean and predictable resource-based endpoints.
- **WebSocket Gateway**: Real-time event broadcasting with Socket.io.
- **Auto-generated Documentation**: Swagger/OpenAPI 3.0 support.
- **Validation Layer**: Zod-based request validation middleware.
- **Security**: Password hashing with Bcrypt and JWT authentication.

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Seeding (Initial Data)

```bash
npm run seed
```

## 📂 Project Structure

- `src/config`: Database, Socket, and Env configurations.
- `src/controllers`: Business logic handlers.
- `src/middleware`: Auth, error handling, and validation.
- `src/models`: Mongoose schemas and interfaces.
- `src/routes`: API endpoint definitions.
- `src/utils`: Helper functions and response formatters.

## 🔗 API Documentation

Once the server is running, visit:
`http://localhost:5000/api-docs`
