import { Chip } from "@mui/material";

const sentimentColor = {
  Positive: "success",
  Neutral: "default",
  Negative: "warning",
  Critical: "error"
};

export default function SentimentBadge({ sentiment }) {
  return (
    <Chip
      size="small"
      label={sentiment || "Neutral"}
      color={sentimentColor[sentiment] || "default"}
      variant={sentiment === "Neutral" ? "outlined" : "filled"}
    />
  );
}
