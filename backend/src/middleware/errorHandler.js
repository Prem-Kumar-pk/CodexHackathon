export function notFound(req, res) {
  res.status(404).json({ error: "Route not found" });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const status = error.status || 500;
  const payload = {
    error: status >= 500 ? "Internal server error" : error.message
  };

  if (process.env.NODE_ENV !== "production" && status >= 500) {
    payload.detail = error.message;
  }

  console.error(error);
  res.status(status).json(payload);
}
