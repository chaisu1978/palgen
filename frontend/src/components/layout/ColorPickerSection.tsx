import { useState, useEffect } from "react";
import { Box, Switch, Typography, IconButton, Tooltip } from "@mui/material";
import { ContentCopy as CopyIcon } from "@mui/icons-material";
import { MuiColorInput } from "mui-color-input";
import type { SxProps, Theme } from "@mui/material/styles";
import { useSnackbar } from "../common/SnackbarProvider";

interface ColorPickerSectionProps {
  label: string;
  defaultColor: string;
  disabled?: boolean;
  onColorChange: (color: string) => void;
  onToggle?: (enabled: boolean) => void;
  showToggle?: boolean;
  sx?: SxProps<Theme>;
}

export default function ColorPickerSection({
  label,
  defaultColor,
  disabled = false,
  onColorChange,
  onToggle,
  showToggle = false,
  sx = {},
}: ColorPickerSectionProps) {
  const [color, setColor] = useState(defaultColor);
  const [isEnabled, setIsEnabled] = useState(!disabled);
  const { showSnackbar } = useSnackbar();

  // Update local color state when defaultColor prop changes
  useEffect(() => {
    setColor(defaultColor);
  }, [defaultColor]);

  // Update local enabled state when disabled prop changes
  useEffect(() => {
    setIsEnabled(!disabled);
  }, [disabled]);

  const handleColorChange = (newColor: string) => {
    if (!isEnabled) return;
    setColor(newColor);
    onColorChange(newColor);
  };

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEnabledState = event.target.checked;
    setIsEnabled(newEnabledState);
    if (onToggle) {
      onToggle(newEnabledState);
    }
  };

  const handleCopyColor = async () => {
    if (!isEnabled) return;
    try {
      await navigator.clipboard.writeText(color);
      showSnackbar(`Copied ${color}`, "success");
    } catch (err) {
      showSnackbar("Failed to copy color", "error");
    }
  };

  const calculateContrastTextColor = (hexColor: string): string => {
    if (!hexColor) return "#000000"; // Default to black if no color provided

    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black for light colors, white for dark colors
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  return (
    <Box
      flex={1}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={1}
      position="relative"
      sx={{
        bgcolor: isEnabled ? color : "action.disabledBackground",
        transition: "all 0.3s ease",
        opacity: isEnabled ? 1 : 0.7,
        ...sx,
      }}
    >
      <Box
        position="absolute"
        top={4}
        right={4}
        zIndex={1}
        display="flex"
        alignItems="center"
        sx={{
          "& .Mui-disabled": {
            color: "text.primary !important",
            opacity: 0.7,
          },
        }}
      >
        {/* Toggle Switch - Positioned absolutely at the top right */}
        {showToggle && onToggle && (
          <Switch
            checked={isEnabled}
            onChange={handleToggle}
            disabled={false}
            color="primary"
            size="small"
          />
        )}
      </Box>

      {/* Color Picker */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 200,
          opacity: isEnabled ? 1 : 0.5,
          pointerEvents: isEnabled ? "auto" : "none",
        }}
      >
        <Box sx={{ position: "relative", width: "100%" }}>
          <MuiColorInput
            fullWidth
            sx={{
              bgcolor: "background.default",
              border: 1,
              borderColor: "background.paper",
              borderRadius: 2,
            }}
            format="hex"
            fallbackValue={defaultColor}
            value={color}
            isAlphaHidden={true}
            onChange={handleColorChange}
          />
          <Tooltip title="Copy color">
            <IconButton
              size="small"
              onClick={handleCopyColor}
              disabled={!isEnabled}
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1,
              }}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Label moved below the picker */}
      <Typography
        variant="h6"
        sx={{
          mt: 1,
          color: isEnabled ? calculateContrastTextColor(color) : "text.primary",
          fontSize: "0.9rem",
          fontWeight: "bold",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
