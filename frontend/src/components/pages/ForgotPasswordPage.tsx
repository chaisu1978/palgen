import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Link,
  IconButton,
} from "@mui/material";
import apiClient from "../../services/auth";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await apiClient.post("/core/password_reset/", { email });
      setSuccess("Password reset email sent. Please check your inbox.");
      setEmail("");
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "background.paper",
      }}
    >
          <Box sx={{ 
  position: 'fixed', 
  top: 16, 
  left: 16, 
  zIndex: 1000 
}}>
  <IconButton 
    onClick={() => navigate(-1)}
    sx={{
      backgroundColor: 'background.default',
      boxShadow: 1,
      '&:hover': {
        backgroundColor: 'action.hover',
      },
    }}
    aria-label="go back"
  >
    <ArrowBackIcon />
  </IconButton>
</Box>
      <Box textAlign={"center"}>
        <Link href="/">
        <img src="/logo3.png" alt="Logo" width={65} height={65} />
        </Link>
        <Container
          maxWidth="xs"
          sx={{
            padding: 4,
            marginTop: 3,
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            backgroundColor: "background.default",
          }}
        >
          <Typography variant="h5" align="center" sx={{ marginBottom: 2 }}>
            Forgot Password
          </Typography>
          {error && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ marginBottom: 2 }}>
              {success}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="filled"
              sx={{ marginBottom: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Send Reset Email"}
            </Button>
          </form>
          <Box sx={{ marginTop: 2, textAlign: "center" }}>
            <Link href="/login">Back to Login</Link>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
