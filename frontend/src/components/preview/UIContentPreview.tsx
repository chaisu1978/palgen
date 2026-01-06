import { Box, Button, Typography } from "@mui/material";
import { Apps } from "@mui/icons-material";
import DashboardLayout from "./layouts/DashboardLayout";
import LandingLayout from "./layouts/LandingLayout";

interface UIContentPreviewProps {
  device: "phone" | "browser";
  radius?: number;
  navigationStyle?: "topbar" | "sidebar";
  layout?: "dashboard" | "landing";
}

export default function UIContentPreview({ device, radius = 8, navigationStyle = "topbar", layout = "dashboard" }: UIContentPreviewProps) {
  const isPhone = device === "phone";
  const contentRadius = `${radius}px`;

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
      }}
    >
      {/* Sidebar for browser with sidebar navigation */}
      {!isPhone && navigationStyle === "sidebar" && (
        <Box
          sx={{
            width: 220,
            borderRight: "4px solid var(--tertiary-main, var(--divider, rgba(0,0,0,0.12)))",
            bgcolor: "var(--primary-main, #4f68c5)",
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            py: 2,
          }}
        >
          <Box sx={{ px: 2, py: 1, mb: 2 }}>
            <Box sx={{ fontWeight: 600, fontSize: 16, color: "var(--neutral-100, #ffffff)" }}>Your Site</Box>
          </Box>
          {["About", "Services", "Shop", "Contact Us"].map((item) => (
            <Box
              key={item}
              sx={{
                px: 2,
                py: 1.25,
                fontSize: 13,
                color: "var(--neutral-100, #ffffff)",
                '&:hover': { bgcolor: "var(--primary-700, #2d4599)" },
              }}
            >
              {item}
            </Box>
          ))}
        </Box>
      )}
      
      {/* Main content area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "var(--bg-default, #f5f5f5)",
        }}
      >
      {/* App Bar */}
      <Box
        sx={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "var(--primary-main, #4f68c5)",
          color: "var(--neutral-100, #ffffff)",
          borderBottom: "3px solid var(--tertiary-main, transparent)",
        }}
      >
        <Box sx={{ 
          width: "100%", 
          px: isPhone ? 2 : 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Apps sx={{ fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Your Site
            </Typography>
          </Box>
          {!isPhone && navigationStyle === "topbar" && (
            <Box sx={{ display: "flex", gap: 3, mr: "auto", ml: 4 }}>
              {["About", "Services", "Shop", "Contact Us"].map((item) => (
                <Typography key={item} variant="body2" sx={{ color: "var(--neutral-100, #ffffff)", cursor: "pointer", '&:hover': { opacity: 0.8 } }}>
                  {item}
                </Typography>
              ))}
            </Box>
          )}
          <Button
            size="small"
            variant="contained"
            sx={{
              bgcolor: "var(--secondary-main, #a351a9)",
              '&:hover': { bgcolor: "var(--secondary-700, #772f7c)" },
              color: "var(--neutral-100, #ffffff)",
              borderRadius: contentRadius,
              borderBottom: "3px solid var(--tertiary-main, transparent)",
            }}
          >
            Action
          </Button>
        </Box>
      </Box>

      {/* Content Area */}
      <Box
        sx={{
          flex: 1,
          p: isPhone ? 1.5 : 2,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          bgcolor: "var(--bg-default, #f5f5f5)",
          overflowY: "auto",
        }}
      >
        <Box sx={{ width: "100%", px: isPhone ? 0 : 1 }}>
          {layout === "dashboard" ? (
            <DashboardLayout isPhone={isPhone} contentRadius={contentRadius} />
          ) : (
            <LandingLayout isPhone={isPhone} contentRadius={contentRadius} />
          )}
        </Box>
      </Box>
      </Box>
    </Box>
  );
}
