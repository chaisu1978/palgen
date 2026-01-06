import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignInPage from "./components/pages/SignInPage";
import SignUpPage from "./components/pages/SignUpPage";
import ChangePasswordPage from "./components/pages/ChangePasswordPage";
import MainLayout from "./components/layout/MainLayout";
import AuthGuard from "./components/common/AuthGuard";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUserData } from "./store/authSlice";
import type { AppDispatch } from './store';
import ForgotPasswordPage from "./components/pages/ForgotPasswordPage";
import ResetPasswordPage from "./components/pages/ResetPasswordPage";

const App = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Only fetch user data if we have a refresh token (indicating a real user session)
    if (localStorage.getItem("refreshToken")) {
      dispatch(fetchUserData());
    }
    // Remove the public token fetch - we'll handle it per-request
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Global Routes */}
        <Route path="/login" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/*" element={<MainLayout />} />
        {/* Authenticated Routes */}
        <Route
          path="/change-password"
          element={
            <AuthGuard>
              <ChangePasswordPage />
            </AuthGuard>
          }
        />
        {/* Superuser Routes */}

        {/* MainSite Routes */}
      </Routes>
    </Router>
  );
};

export default App;
