import { verifyToken } from "../services/authService.js";

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ error: "Missing bearer token" });
    }

    req.user = await verifyToken(token);
    next();
  } catch (error) {
    return res.status(error.status || 401).json({ error: "Unauthorized" });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  };
}
