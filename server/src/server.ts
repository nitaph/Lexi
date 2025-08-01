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
import { formsRouter } from "./routers/formsRouter";
import { usersRouter } from "./routers/usersRouter.router";
import { usersService } from "./services/users.service";

dotenv.config();

mongoDbProvider.initialize();

const createAdminUser = (username: string, password: string) => {
  if (!username || !password) {
    console.warn("Username and password are required");
    process.exit(1);
  }

  usersService
    .createAdminUser(username, password)
    .then(() => {
      console.log("Admin user created successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error creating admin user:", error);
      process.exit(1);
    });
};

const setupServer = () => {
  const app = express();
  app.use(bodyParser.json());
  const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.use(cookieParser());

  const PORT = process.env.PORT || 5001;
  app.use("/health", (req, res) => res.status(200).send("OK"));
  app.use("/conversations", conversationsRouter());
  app.use("/experiments", experimentsRouter());
  app.use("/users", usersRouter());
  app.use("/agents", agentsRouter());
  app.use("/dataAggregation", dataAggregationRouter());
  app.use("/forms", formsRouter());

  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
};

if (process.argv[2] === "create-user") {
  const [, , , username, password] = process.argv;
  createAdminUser(username, password);
} else {
  setupServer();
}
