import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
  Alert,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { login, getUserDetails } from "../../services/auth";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { loginSuccess } from "../../store/authSlice";
import { setTheme } from "../../store/themeSlice";
import { useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Loading state
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the referrer route or default to "/"
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent multi-submit
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      const userDetails = await getUserDetails(); // Fetch user details
      dispatch(loginSuccess(userDetails)); // Dispatch full user object
      
      // Set the theme based on user preference after successful login
      if (userDetails.theme_mode) {
        dispatch(setTheme(userDetails.theme_mode === 'dark'));
      }
      
      navigate(from, { replace: true }); // Redirect to referrer or homepage
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
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
            marginTop: 3,
            padding: 4,
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            backgroundColor: "background.default",
          }}
        >
          <Typography
            variant="h5"
            align="center"
            sx={{ marginBottom: 2, fontWeight: "bold" }}
          >
            Log In
          </Typography>
          <Typography
            align="center"
            sx={{ marginBottom: 3, color: "text.secondary" }}
          >
            Sign-in to access all of the PalGen features
          </Typography>
          {error && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              variant="filled"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ marginBottom: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              variant="filled"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ marginBottom: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Log In"}
            </Button>
          </form>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 2,
              fontSize: "0.9rem",
            }}
          >
            <Link href="/sign-up" underline="hover">
              Sign Up
            </Link>
            <Link href="/forgot-password" underline="hover">
              Forgot password?
            </Link>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default SignInPage;
