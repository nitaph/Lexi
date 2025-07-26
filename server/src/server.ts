import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { mongoDbProvider } from "./mongoDBProvider";
import { agentsRouter } from "./routers/agentsRouter.router";
import { conversationsRouter } from "./routers/conversationsRouter.router";
import { dataAggregationRouter } from "./routers/dataAggregationRouter.router";
import { experimentsRouter } from "./routers/experimentsRouter.router";
import { usersRouter } from "./routers/usersRouter.router";
import personalityRouter from "./routers/personalityRouter.router";
import { formsRouter } from "./routers/formsRouter";

dotenv.config();
mongoDbProvider.initialize();

const setupServer = () => {
  const app = express();

  // 🔥 LOG AT BOOT to confirm correct code is running
  console.log("🚀 Booting server with JSON body limit = 2 MB");

  // Increase JSON payload limit
  app.use(bodyParser.json({ limit: "2mb" }));

  // Enable CORS and cookies
  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    })
  );
  app.use(cookieParser());

  // Health check endpoint
  app.use("/health", (_req, res) => res.status(200).send("OK"));

  // API routes
  app.use("/api/agents", agentsRouter());
  app.use("/api/conversations", conversationsRouter());
  app.use("/api/experiments", experimentsRouter());
  app.use("/api/users", usersRouter());
  app.use("/api/dataAggregation", dataAggregationRouter());
  app.use("/api/forms", formsRouter());
  app.use("/api/personality", personalityRouter);

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("🔥 Uncaught error in Express:", err);
    res.status(500).json({ error: "Internal Server Error" });
  });

  // Determine port as number
  const port = parseInt(process.env.PORT || "5001", 10);
  app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
  });
};

// CLI: create admin user
if (process.argv[2] === "create-user") {
  const [, , , username, password] = process.argv;
  if (!username || !password) {
    console.error("Username and password are required");
    process.exit(1);
  }
  import("./services/users.service").then(({ usersService }) =>
    usersService
      .createAdminUser(username, password)
      .then(() => {
        console.log("Admin user created successfully");
        process.exit(0);
      })
      .catch((err) => {
        console.error("Error creating admin user:", err);
        process.exit(1);
      })
  );
} else {
  setupServer();
}
