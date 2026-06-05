import { Card, CardContent, Stack, Typography } from "@mui/material";

export default function MetricCard({ label, value, helper, icon }) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Stack spacing={0.5}>
            <Typography color="text.secondary" variant="body2">
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              {value}
            </Typography>
            {helper ? (
              <Typography color="text.secondary" variant="caption">
                {helper}
              </Typography>
            ) : null}
          </Stack>
          {icon}
        </Stack>
      </CardContent>
    </Card>
  );
}
