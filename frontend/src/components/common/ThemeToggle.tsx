import { useDispatch, useSelector } from "react-redux";
import { Switch } from "@mui/material";
import { toggleTheme } from "../../store/themeSlice";
import type { RootState } from "../../store";
import { FaMoon, FaSun } from "react-icons/fa";
import { useEffect } from "react";
import apiClient from "../../services/auth";

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // Save theme preference to backend when it changes and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Use the configured apiClient which has the correct base URL and auth headers
      apiClient.patch('/core/me/', {
        theme_mode: isDarkMode ? 'dark' : 'light'
      }).catch(console.error); // Silently log errors to console
    }
  }, [isDarkMode, isAuthenticated]);

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  return (
    <Switch
      checked={isDarkMode}
      onChange={handleToggleTheme}
      name="themeToggle"
      size="medium"
      color="default"
      checkedIcon={<FaMoon size={20} />}
      icon={<FaSun size={20} />}
    />
  );
};

export default ThemeToggle;
