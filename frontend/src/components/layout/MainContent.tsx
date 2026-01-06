import { Box } from "@mui/material";
import type { BoxProps } from "@mui/material";
import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ColorPickerSection from "./ColorPickerSection";
import PreviewSection from "./PreviewSection";
import Footer from "./Footer";

interface MainContentProps extends BoxProps {
  children: ReactNode;
  drawerOpen?: boolean;
}

export default function MainContent({ children }: MainContentProps) {
  const location = useLocation();
  const defaultPrimaryColor = "#c2c2c2";
  const defaultSecondaryColor = "#a8a8a8";
  const defaultTertiaryColor = "#8f8f8f";

  const [primaryColor, setPrimaryColor] = useState(defaultPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(defaultSecondaryColor);
  const [tertiaryColor, setTertiaryColor] = useState(defaultTertiaryColor);
  const [isTertiaryEnabled, setIsTertiaryEnabled] = useState(false); // Tertiary enabled by default

  // Reset generator to initial state
  const resetGenerator = () => {
    setPrimaryColor(defaultPrimaryColor);
    setSecondaryColor(defaultSecondaryColor);
    setTertiaryColor(defaultTertiaryColor);
    setIsTertiaryEnabled(false);
  };

  // Scroll to top when the component mounts or when the location changes
  useEffect(() => {
    // Small delay to ensure the DOM is fully loaded
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <Box width="100%">
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        flexWrap="nowrap"
        justifyContent="space-between"
        alignItems="stretch"
        height={{ xs: "auto", sm: 100 }}
        width="100%"
        border={1}
        borderColor="background.paper"
        gap={0.2}
      >
        <ColorPickerSection
          label="Select Primary"
          defaultColor={primaryColor}
          onColorChange={setPrimaryColor}
          sx={{ bgcolor: primaryColor }}
        />

        <ColorPickerSection
          label="Select Secondary"
          defaultColor={secondaryColor}
          onColorChange={setSecondaryColor}
          sx={{
            bgcolor: secondaryColor,
          }}
        />

        <ColorPickerSection
          label="Select Tertiary"
          defaultColor={tertiaryColor}
          disabled={!isTertiaryEnabled} // Disable only the color picker
          onColorChange={setTertiaryColor}
          onToggle={() => setIsTertiaryEnabled((prev) => !prev)} // Toggle state
          showToggle={true}
          sx={{
            bgcolor: isTertiaryEnabled ? tertiaryColor : "background.default", // Gray out when disabled
          }}
        />
      </Box>

      <PreviewSection
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        tertiaryColor={tertiaryColor}
        isTertiaryEnabled={isTertiaryEnabled}
      />

      {children}
      <Outlet />
      <Footer
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        tertiaryColor={isTertiaryEnabled ? tertiaryColor : undefined}
        onReset={resetGenerator}
      />
    </Box>
  );
}
