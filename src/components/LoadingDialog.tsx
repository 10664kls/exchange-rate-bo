import {
  CircularProgress,
  Dialog,
  DialogContent,
  Typography,
} from "@mui/material";

// Loading Dialog Component
const LoadingDialog = ({
  open,
  message,
}: {
  open: boolean;
  message: string;
}) => (
  <Dialog open={open} disableEscapeKeyDown maxWidth="sm" fullWidth>
    <DialogContent
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
      }}>
      <CircularProgress size={60} thickness={4} />
      <Typography
        variant="h6"
        sx={{
          mt: 2,
          textAlign: "center",
          color: "text.primary",
          fontWeight: 500,
        }}>
        {message}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mt: 1,
          textAlign: "center",
          color: "text.secondary",
        }}>
        Please wait...
      </Typography>
    </DialogContent>
  </Dialog>
);

export default LoadingDialog;
