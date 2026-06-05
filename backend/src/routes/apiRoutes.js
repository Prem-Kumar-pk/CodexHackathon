import express from "express";
import {
  analyzeSentimentRequest,
  escalateRequest,
  generateResponseRequest,
  getAnalyticsRequest,
  getCustomerById,
  getCustomers,
  getInteractions,
  postMessage,
  summarizeRequest
} from "../controllers/supportController.js";
import { authenticate, authorize } from "../middleware/auth.js";

export const apiRouter = express.Router();

apiRouter.use(authenticate);

apiRouter.get("/interactions", getInteractions);
apiRouter.get("/customers", getCustomers);
apiRouter.get("/customers/:id", getCustomerById);
apiRouter.post("/messages", postMessage);
apiRouter.post("/analyze-sentiment", analyzeSentimentRequest);
apiRouter.post("/generate-response", generateResponseRequest);
apiRouter.post("/escalate", escalateRequest);
apiRouter.post("/summarize", summarizeRequest);
apiRouter.get("/analytics", authorize("supervisor"), getAnalyticsRequest);
