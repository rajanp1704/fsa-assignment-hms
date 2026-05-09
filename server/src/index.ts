import express, { Express } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import routes from "./routes/index.js";
import { setupSwagger } from "./config/swagger.js";
import { createServer } from "http";
import { initSocket } from "./config/socket.js";

const app = express() as Express;
const server = createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Swagger Documentation
setupSwagger(app);

// API Routes
app.use("/api", routes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  console.log(
    `📝 Swagger documentation available at http://localhost:${PORT}/api-docs`
  );
});

export default app;
