import { loginWithEmail } from "../services/authService.js";

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await loginWithEmail(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
