import { CookieOptions, Request, Response } from "express";
import { usersService } from "../services/users.service";
import { requestHandler } from "../utils/requestHandler";

const cookieConfig: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  maxAge: 24 * 60 * 60 * 1000,
};

class UsersController {
  createUser = requestHandler(
    async (req: Request, res: Response) => {
      const { userInfo, experimentId } = req.body;
      const { user, token } = await usersService.createUser(
        userInfo,
        experimentId
      );
      res.cookie("token", token, cookieConfig);
      res.status(200).send(user);
    },
    (req, res, error) => {
      if ((error as any).code === 11000) {
        return res.status(409).json({ message: "User Already Exists" });
      }
      if ((error as any).code === 403) {
        return res.status(403).json({ message: "Experiment Is Not Active" });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  );

  login = requestHandler(
    async (req: Request, res: Response) => {
      const { username, userPassword, experimentId } = req.body;
      const { token, user } = await usersService.login(
        username,
        experimentId,
        userPassword
      );
      res.cookie("token", token, cookieConfig);
      res.status(200).send({ token, user });
    },
    (req, res, error) => {
      if ((error as any).code === 401) {
        return res.status(401).json({ message: error.message });
      }
      res.status(500).json({ message: "Error logging in" });
    }
  );

  getActiveUser = requestHandler(
    async (req: Request, res: Response) => {
      let token = req.cookies?.token as string | undefined;
      if (!token) {
        const auth = req.headers.authorization as string | undefined;
        if (auth?.startsWith("Bearer ")) token = auth.slice(7);
      }
      if (!token)
        throw Object.assign(new Error("No token provided."), { code: 401 });
      const { user, newToken } = await usersService.getActiveUser(token);
      res.cookie("token", newToken, cookieConfig);
      res.status(200).send(user);
    },
    (req, res, error) => {
      if ((error as any).code === 401 || (error as any).code === 404) {
        return res.status((error as any).code).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to fetch active user" });
    }
  );

  logout = requestHandler(async (_req, res: Response) => {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });
    res.status(200).send({ message: "Logged out successfully" });
  });

  validateUserName = requestHandler(
    async (req: Request, res: Response) => {
      const username = req.query.username as string;
      const experimentId = req.query.experimentId as string;
      const user = await usersService.getUserByName(username, experimentId);
      if (user)
        throw Object.assign(new Error("User Already Exist"), { code: 409 });
      res.status(200).send(true);
    },
    (req, res, error) => {
      if ((error as any).code === 409) {
        return res.status(409).json({ message: "User Already Exists" });
      }
      res.status(500).json({ message: "Validation error" });
    }
  );

  // ← Must be present:
  updateBigFive = requestHandler(
    async (req: Request, res: Response) => {
      console.log("📝 [updateBigFive] body:", req.body);
      const { userId, scores } = req.body;
      await usersService.updateBigFiveScores(userId, scores);
      res.status(200).json({ success: true });
    },
    (req, res, error) => {
      console.error("❌ updateBigFive error:", error);
      res.status(500).json({ message: "Failed to save Big Five scores." });
    }
  );

  updateUsersAgent = requestHandler(async (req: Request, res: Response) => {
    const { agent } = req.body;
    await usersService.updateUsersAgent(agent);
    res.status(200).send();
  });
}

export const usersController = new UsersController();
