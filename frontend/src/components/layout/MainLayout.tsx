// MainLayout.tsx
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { logout } from "../../store/authSlice";
import ThemeToggle from "../common/ThemeToggle";
import ConfirmationDialog from "../common/ConfirmationDialog";
import HelpModal from "../common/HelpModal";
import MyPalettesPage from "./MyPalettesPage";
import {
  AppBar as MuiAppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer as MuiDrawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
  styled,
  type Theme,
  type CSSObject,
} from "@mui/material";
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import PaletteIcon from "@mui/icons-material/Palette";
import CollectionsIcon from "@mui/icons-material/Collections";
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LogoutIcon from '@mui/icons-material/Logout';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MainContent from "./MainContent";

const drawerWidth = 215;

// Styled components for the drawer
const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.highlight.main,
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,  // Slightly wider for better touch targets
  [theme.breakpoints.down("sm")]: {
    width: `${theme.spacing(6)}`,  // Smaller on mobile
  },
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.highlight.main,
});

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open?: boolean }>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    '& .MuiDrawer-paper': {
      position: 'fixed',
      height: '100vh',
      overflowY: 'auto',
      borderRight: 'none',
      ...(open ? openedMixin(theme) : closedMixin(theme)),
    },
  })
);

const DrawerHeader = styled("div", {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open?: boolean }>(({ theme, open }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: open ? "flex-end" : "center", // Right-aligned when open, centered when closed
  padding: theme.spacing(0, 1),
  minHeight: 40,
  height: 40,
  "& .MuiIconButton-root": {
    padding: theme.spacing(0.75),
    margin: 0,
  }
}));

const getNavItems = (isAuthenticated: boolean) => {
  const commonItems = [
    { text: "Generator", icon: <PaletteIcon />, path: "/" },
  ];

  const authItems = isAuthenticated
    ? [
        { text: "My Palettes", icon: <CollectionsIcon />, path: "/my-palettes" },
        { text: "Change Password", icon: <VpnKeyIcon />, path: "#" },
        { text: "Logout", icon: <LogoutIcon />, path: "#" },
      ]
    : [
      { text: "Login", icon: <LoginIcon />, path: "/login" },
        { text: "Sign Up", icon: <PersonAddIcon />, path: "/sign-up" },
      ];

  return [...commonItems, ...authItems];
};

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [tappedItem, setTappedItem] = useState<string | null>(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    confirmAction: (() => void) | null;
    confirmColor?: 'primary' | 'secondary' | 'error' | 'success' | 'info' | 'warning';
  }>({
    open: false,
    title: '',
    message: '',
    confirmAction: null,
  });

  const location = useLocation();
  const navItems = getNavItems(isAuthenticated);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  useEffect(() => {
    if (tappedItem) {
      const timer = setTimeout(() => setTappedItem(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [tappedItem]);

  const showConfirmationDialog = (
    title: string, 
    message: string, 
    confirmAction: () => void, 
    confirmText?: string,
    confirmColor?: 'primary' | 'secondary' | 'error' | 'success' | 'info' | 'warning'
  ) => {
    setDialogConfig({
      open: true,
      title,
      message,
      confirmText,
      confirmAction,
      confirmColor,
    });
  };

  const handleCloseDialog = () => {
    setDialogConfig(prev => ({ ...prev, open: false }));
  };

  const handleConfirm = () => {
    if (dialogConfig.confirmAction) {
      dialogConfig.confirmAction();
    }
    handleCloseDialog();
  };

  const handleLogout = () => {
    showConfirmationDialog(
      'Confirm Logout',
      'Are you sure you want to log out?',
      () => {
        dispatch(logout());
        navigate("/");
      },
      'Logout',
      'error'
    );
  };

  const handleChangePassword = () => {
    showConfirmationDialog(
      'Change Password',
      'You will be redirected to the change password page. Continue?',
      () => {
        navigate("/change-password");
      },
      'Continue',
      'primary'
    );
  };

  const handleLogin = () => {
    showConfirmationDialog(
      'Login',
      'You will be redirected to the login page. Continue?',
      () => {
        navigate("/login");
      },
      'Continue',
      'primary'
    );
  };

  const handleSignUp = () => {
    showConfirmationDialog(
      'Sign Up',
      'You will be redirected to the sign-up page. Continue?',
      () => {
        navigate("/sign-up");
      },
      'Continue',
      'primary'
    );
  };

  const handleNavItemClick = (path: string, text: string) => {
    if (text === 'Logout') {
      handleLogout();
    } else if (text === 'Change Password') {
      handleChangePassword();
    } else if (text === 'Login') {
      handleLogin();
    } else if (text === 'Sign Up') {
      handleSignUp();
    } else {
      navigate(path);
      if (isMobile) {
        setOpen(false);
      }
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} sx={{ backgroundColor: theme.palette.secondary.main }} >
        <Toolbar variant="dense" sx={{ minHeight: 40, height: 40, py: 0 }} >
          {!isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              edge="start"
              sx={{
                marginRight: 3,
                ...(open && { display: 'none' }),
                backgroundColor: theme.palette.secondary.light,
                padding: 0.75,
              }}
            >
              {open ? <MenuOpenIcon /> : <MenuOpenIcon sx={{ transform: 'scaleX(-1)' }} />}
            </IconButton>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/logo3.png" alt="PalGen" width={'auto'} height={22} />
            </Link>
            {!isMobile && (
              <Typography
                variant="h6"
                color="text.primary"
                noWrap
                component="div"
                sx={{ ml: 1, fontSize: '1.1rem', lineHeight: 1, textDecoration: 'none', '&:hover': { textDecoration: 'none' }, '&:visited': { textDecoration: 'none' }, '&:focus': { textDecoration: 'none' } }}
              >
                PalGen
              </Typography>
            )}
          </Box>
          <Box sx={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Help & Instructions">
              <IconButton
                color="inherit"
                onClick={() => setHelpModalOpen(true)}
                sx={{
                  backgroundColor: theme.palette.secondary.light,
                  padding: 0.75,
                  '&:hover': {
                    backgroundColor: theme.palette.secondary.dark,
                  },
                }}
              >
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <ThemeToggle />
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          "& .MuiDrawer-paper": {
            boxShadow: "6px 0px 6px -6px rgba(0,0,0,0.5)",
          },
        }}
      >
        <DrawerHeader open={open}>
          <IconButton
            onClick={toggleDrawer}
            sx={{
              color: theme.palette.highlight.main,
              backgroundColor: theme.palette.primary.light,
              margin: 0,
            }}
          >
            {open ? <MenuOpenIcon fontSize="small" /> : <MenuOpenIcon sx={{ transform: 'scaleX(-1)' }} />}
          </IconButton>
        </DrawerHeader>
        <Divider color={theme.palette.divider} />
        <List>
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
              <Tooltip 
                title={item.text} 
                placement="right"
                open={!open && tappedItem === item.text}
                onClose={() => setTappedItem(null)}
                disableFocusListener
                disableTouchListener
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2,
                    borderBottom: `1px solid ${theme.palette.primary.light}`,
                    backgroundColor: location.pathname === item.path ? theme.palette.primary.dark : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                  onClick={() => handleNavItemClick(item.path, item.text)}
                  onTouchStart={(e) => {
                    if (!open) {
                      e.preventDefault();
                      setTappedItem(item.text);
                    }
                  }}
                  onTouchEnd={(e) => {
                    if (!open) {
                      e.preventDefault();
                      if (item.text === "Logout") {
                        handleLogout();
                      } else if (item.text === "Change Password") {
                        handleChangePassword();
                      } else if (item.text === "Login") {
                        handleLogin();
                      } else if (item.text === "Sign Up") {
                        handleSignUp();
                      } else {
                        navigate(item.path);
                      }
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : "auto",
                      justifyContent: "center",
                      color: theme.palette.highlight.main,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{ opacity: open ? 1 : 0, color: theme.palette.highlight.main }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          marginLeft: { xs: -21, sm: -20 },
          overflow: 'auto',
          height: '100vh',
          pb: 2,
          transition: theme => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: 0,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme => theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 40 }} />
        <Box sx={{ minHeight: 'calc(100vh - 40px - 56px)', pb: 0 }}>
          {location.pathname === '/my-palettes' ? (
            <MyPalettesPage />
          ) : (
            <MainContent drawerOpen={open}>
              <Outlet />
            </MainContent>
          )}
        </Box>
      </Box>

<ConfirmationDialog
        open={dialogConfig.open}
        title={dialogConfig.title}
        message={dialogConfig.message}
        confirmText={dialogConfig.confirmText}
        confirmColor={dialogConfig.confirmColor}
        onConfirm={handleConfirm}
        onCancel={handleCloseDialog}
      />
      <HelpModal
        open={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </Box>
  );
}