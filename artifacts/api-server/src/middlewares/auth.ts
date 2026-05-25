import jwt from "jsonwebtoken";
import { type Request, type Response, type NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const JWT_SECRET = process.env.JWT_SECRET || "designmylife_secret_key_32chars";

export function signToken(id: number): string {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });
}

export async function protect(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authorized, no token" });
    return;
  }
  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.id));
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    (req as Request & { user: typeof user }).user = user;
    next();
  } catch (err) {
    logger.warn({ err }, "Auth token invalid");
    res.status(401).json({ message: "Token invalid or expired" });
  }
}

export type AuthRequest = Request & {
  user: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    aiEnabled: boolean;
    passwordHash: string;
    createdAt: Date;
  };
};
