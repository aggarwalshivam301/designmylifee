import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, protect, type AuthRequest } from "../middlewares/auth";

const router = Router();

function sanitize(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    aiEnabled: user.aiEnabled,
    createdAt: user.createdAt.toISOString(),
  };
}

// POST /api/auth/register
router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ message: "Password must be at least 6 characters" });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
  if (existing.length > 0) {
    res.status(400).json({ message: "Email already in use" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({ name, email: email.toLowerCase(), passwordHash }).returning();
  res.status(201).json({ token: signToken(user.id), user: sanitize(user) });
});

// POST /api/auth/login
router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email?.toLowerCase()));
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }
  res.json({ token: signToken(user.id), user: sanitize(user) });
});

// GET /api/auth/profile
router.get("/auth/profile", protect, (req, res): void => {
  const authReq = req as AuthRequest;
  res.json(sanitize(authReq.user));
});

// PUT /api/auth/profile
router.put("/auth/profile", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const { name, avatar } = req.body;
  const [user] = await db
    .update(usersTable)
    .set({ name, avatar })
    .where(eq(usersTable.id, authReq.user.id))
    .returning();
  res.json(sanitize(user));
});

// PUT /api/auth/change-password
router.put("/auth/change-password", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ message: "New password must be at least 6 characters" });
    return;
  }
  const ok = await bcrypt.compare(currentPassword, authReq.user.passwordHash);
  if (!ok) {
    res.status(401).json({ message: "Current password is incorrect" });
    return;
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, authReq.user.id));
  res.json({ message: "Password updated successfully" });
});

// PUT /api/auth/toggle-ai
router.put("/auth/toggle-ai", protect, async (req, res): Promise<void> => {
  const authReq = req as AuthRequest;
  const { aiEnabled } = req.body;
  const [user] = await db
    .update(usersTable)
    .set({ aiEnabled: !!aiEnabled })
    .where(eq(usersTable.id, authReq.user.id))
    .returning();
  res.json(sanitize(user));
});

export default router;
