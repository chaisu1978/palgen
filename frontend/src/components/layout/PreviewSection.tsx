import {
  Box,
  Button,
  Paper,
  Typography,
  Divider,
  CircularProgress,
  Slider,
  Switch,
  FormControlLabel,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import {
  Computer as BrowserIcon,
  Smartphone as PhoneIcon,
  Palette as SwatchesIcon,
  TableChart as TableIcon,
  LightMode as LightIcon,
  DarkMode as DarkIcon,
  ViewAgenda as TopBarIcon,
  ViewSidebar as SideBarIcon,
  Dashboard as DashboardIcon,
  Web as LandingIcon,
} from "@mui/icons-material";
import { useState, useCallback, useEffect, useMemo } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import { fetchPalettePreview, type BackendPalette } from "../../services/palette";
import { debounce } from "../../utils/debounce";
import DeviceFrame from "../preview/DeviceFrame";
import PaletteVarsProvider from "../preview/PaletteVarsProvider";
import UIContentPreview from "../preview/UIContentPreview";

type PaletteState = BackendPalette | null;

interface PreviewSectionProps {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  isTertiaryEnabled: boolean;
  sx?: SxProps<Theme>;
}

export default function PreviewSection({
  primaryColor,
  secondaryColor,
  tertiaryColor,
  isTertiaryEnabled,
  sx = {},
}: PreviewSectionProps) {
  const [selectedFormat, setSelectedFormat] = useState("browser");
  const [previewData, setPreviewData] = useState<PaletteState>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");
  const [radius, setRadius] = useState<number>(8);
  const [showNotch, setShowNotch] = useState<boolean>(true);
  const [toolbarStyle, setToolbarStyle] = useState<"light" | "dark">("dark");
  const [navigationStyle, setNavigationStyle] = useState<"topbar" | "sidebar">("topbar");
  const [layoutType, setLayoutType] = useState<"dashboard" | "landing">("landing");

  // Create a memoized version of the preview function
  const fetchPreview = useCallback(async () => {
    try {
      const palette = await fetchPalettePreview({
        primary: primaryColor,
        secondary: secondaryColor,
        ...(isTertiaryEnabled && { 
          tertiary: tertiaryColor,
          include_tertiary: true 
        })
      });
      setPreviewData(palette);
    } catch (err) {
      console.error("Error generating palette preview:", err);
      // You might want to show an error message to the user here
      // For example using a snackbar or alert
    } finally {
      setIsLoading(false);
    }
  }, [primaryColor, secondaryColor, tertiaryColor, isTertiaryEnabled]);

  // Create a stable debounced version of the preview function
  const debouncedFetchPreview = useMemo(
    () => {
      const debounced = debounce(async () => {
        console.log('Starting debounced preview with loading state');
        // Set loading state immediately when debounce triggers
        setIsLoading(true);
        try {
          console.log('Calling fetchPreview');
          await fetchPreview();
          console.log('fetchPreview completed');
        } catch (error) {
          console.error('Error in debounced preview:', error);
          setIsLoading(false);
        }
      }, 300); // Reduced to 1s for better UX while testing
      return debounced;
    },
    [fetchPreview]
  );

  // Show loading state when colors change
  useEffect(() => {
    if (primaryColor && secondaryColor) {
      setIsLoading(true);
      // The debounced function will handle the actual API call
      debouncedFetchPreview();
    }
  }, [primaryColor, secondaryColor, tertiaryColor, isTertiaryEnabled, debouncedFetchPreview]);

  // Debug log for loading state changes
  useEffect(() => {
    console.log('isLoading state changed:', isLoading);
  }, [isLoading]);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if ('cancel' in debouncedFetchPreview) {
        debouncedFetchPreview.cancel();
      }
    };
  }, [debouncedFetchPreview]);



  // Handle manual preview generation
  const handlePreview = async () => {
    console.log('handlePreview called, setting isLoading to true');
    const startTime = Date.now();
    const MIN_LOADING_TIME = 500; // Minimum time to show loading state (500ms)
    
    setIsLoading(true);
    try {
      console.log('Calling fetchPreview from handlePreview');
      const fetchPromise = fetchPreview();
      
      // Ensure loading state is shown for at least MIN_LOADING_TIME
      const [result] = await Promise.all([
        fetchPromise,
        new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME))
      ]);
      
      console.log('fetchPreview completed in handlePreview');
      return result;
    } catch (error) {
      console.error('Error in manual preview:', error);
      setIsLoading(false);
      throw error;
    } finally {
      // If the operation took less than MIN_LOADING_TIME, wait the remaining time
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_LOADING_TIME) {
        await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsed));
      }
      setIsLoading(false);
    }
  };

  const handleFormatChange = (_: React.MouseEvent<HTMLElement>, newFormat: string | null) => {
    if (newFormat !== null) {
      setSelectedFormat(newFormat);
      if (newFormat === "phone") {
        setRadius(8);
        setShowNotch(true);
        setNavigationStyle("topbar");
        setToolbarStyle("dark");
      } else if (newFormat === "browser") {
        setRadius(8);
        setShowNotch(false);
        setNavigationStyle("topbar");
        setToolbarStyle("dark");
      }
    }
  };

  const orderedSwatchKeys = (
    data: BackendPalette,
    showTertiary: boolean
  ): string[] => {
    const base = ["primary", "secondary"];
    if (showTertiary && data.tertiary) base.push("tertiary");
    base.push("neutral");
    const misc = Object.keys(data).filter(
      (k) => !base.includes(k) && k !== "tertiary"
    );
    return [...base, ...misc];
  };

  const renderColorTable = () => {
    if (!previewData) return null;

    return (
      <Box sx={{ height: "60vh", overflowY: "auto", overflowX: "auto", mt: 0 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Color
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Shade
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                RGB
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                HEX
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                HSB
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                CMYK
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(previewData).flatMap(([colorKey, color]) =>
              Object.entries(color.shades).map(([shade, swatch]) => (
                <tr key={`${colorKey}-${shade}`}>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #eee" }}
                  >
                    <Box
                      sx={{
                        width: "24px",
                        height: "24px",
                        bgcolor: swatch.hex,
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                      }}
                    />
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #eee" }}
                  >
                    {`${color.name} ${shade}`}
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #eee" }}
                  >
                    {`rgb(${swatch.rgb.join(", ")})`}
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #eee" }}
                  >
                    {swatch.hex}
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #eee" }}
                  >
                    {swatch.hsb ? `hsb(${Math.round(swatch.hsb[0])}°, ${Math.round(swatch.hsb[1])}%, ${Math.round(swatch.hsb[2])}%)` : 'N/A'}
                  </td>
                  <td
                    style={{ padding: "8px", borderBottom: "1px solid #eee" }}
                  >
                    {swatch.cmyk ? `cmyk(${Math.round(swatch.cmyk[0])}%, ${Math.round(swatch.cmyk[1])}%, ${Math.round(swatch.cmyk[2])}%, ${Math.round(swatch.cmyk[3])}%)` : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>
    );
  };

  // Render swatches based on the selected format
  const renderSwatches = () => {
    if (!previewData) return null;

    const columns = orderedSwatchKeys(previewData, isTertiaryEnabled);
    const shadeScale: Array<keyof BackendPalette["primary"]["shades"]> = [
      "100",
      "200",
      "300",
      "400",
      "500",
      "600",
      "700",
      "800",
      "900",
    ];

    return (
      <Box
        sx={{
          overflow: "auto",
          width: "100%",
          display: "grid",
          gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
          gap: 1,
        }}
      >
        {/* Column Headers */}
        {columns.map((key) => (
          <Box key={key} sx={{ textAlign: "center", fontWeight: 600 }}>
            {previewData[key].name}
          </Box>
        ))}

        {/* Shades */}
        {shadeScale.flatMap((shade) =>
          columns.map((key) => {
            const swatch = previewData[key].shades[shade];
            return (
              <Box
                key={`${key}-${shade}`}
                sx={{
                  height: 48,
                  bgcolor: swatch.hex,
                  color: parseInt(shade) < 500 ? "grey.900" : "grey.100",
                  fontSize: "0.75rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 0.5,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <span>{shade}</span>
                <span>{swatch.hex}</span>
              </Box>
            );
          })
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ mt: 0, ...sx }}>
      <Paper
        elevation={2}
        sx={{ p: 2, borderRadius: 2, bgcolor: "background.default" }}
      >
        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2}>
          {/* Left Panel - Menu/Options */}
          <Box flex={1} minWidth={{ md: "200px" }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
              Palette Preview
            </Typography>
            <Divider sx={{ mb: 1 }} />

            {/* Preview Format */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>Preview Format</Typography>
              <ToggleButtonGroup
                value={selectedFormat}
                exclusive
                onChange={handleFormatChange}
                fullWidth
                size="small"
                sx={{ 
                  mb: 1,
                  '& .MuiToggleButton-root': {
                    '&.Mui-selected': {
                      backgroundColor: 'secondary.main',
                      color: 'secondary.contrastText',
                      '&:hover': {
                        backgroundColor: 'secondary.dark',
                      },
                    },
                  },
                }}
              >
                <Tooltip title="Browser">
                  <ToggleButton value="browser" aria-label="browser">
                    <BrowserIcon fontSize="small" />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Phone">
                  <ToggleButton value="phone" aria-label="phone">
                    <PhoneIcon fontSize="small" />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Color Swatches">
                  <ToggleButton value="swatches" aria-label="swatches">
                    <SwatchesIcon fontSize="small" />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title="Color Table">
                  <ToggleButton value="table" aria-label="table">
                    <TableIcon fontSize="small" />
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>
            </Box>

            {(selectedFormat === "phone" || selectedFormat === "browser") && (
              <>
                {/* Layout Type */}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>Layout Type</Typography>
                  <ToggleButtonGroup
                    value={layoutType}
                    exclusive
                    onChange={(_, newLayout) => newLayout && setLayoutType(newLayout)}
                    fullWidth
                    size="small"
                    sx={{ 
                      mb: 1,
                      '& .MuiToggleButton-root': {
                        '&.Mui-selected': {
                          backgroundColor: 'secondary.main',
                          color: 'secondary.contrastText',
                          '&:hover': {
                            backgroundColor: 'secondary.dark',
                          },
                        },
                      },
                    }}
                  >
                    <Tooltip title="Landing Page Layout">
                      <ToggleButton value="landing" aria-label="landing layout">
                        <LandingIcon fontSize="small" />
                      </ToggleButton>
                    </Tooltip>
                    <Tooltip title="Dashboard Layout">
                      <ToggleButton value="dashboard" aria-label="dashboard layout">
                        <DashboardIcon fontSize="small" />
                      </ToggleButton>
                    </Tooltip>
                  </ToggleButtonGroup>
                </Box>

                {/* Content Theme */}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>Content Theme</Typography>
                  <ToggleButtonGroup
                    value={colorMode}
                    exclusive
                    onChange={(_, newMode) => newMode && setColorMode(newMode)}
                    fullWidth
                    size="small"
                    sx={{ 
                      mb: 1,
                      '& .MuiToggleButton-root': {
                        '&.Mui-selected': {
                          backgroundColor: 'secondary.main',
                          color: 'secondary.contrastText',
                          '&:hover': {
                            backgroundColor: 'secondary.dark',
                          },
                        },
                      },
                    }}
                  >
                    <Tooltip title="Light Theme">
                      <ToggleButton value="light" aria-label="light theme">
                        <LightIcon fontSize="small" />
                      </ToggleButton>
                    </Tooltip>
                    <Tooltip title="Dark Theme">
                      <ToggleButton value="dark" aria-label="dark theme">
                        <DarkIcon fontSize="small" />
                      </ToggleButton>
                    </Tooltip>
                  </ToggleButtonGroup>
                </Box>

                {/* Corner Radius */}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                    Corner Radius: {radius}px
                  </Typography>
                  <Slider 
                    value={radius} 
                    min={0} 
                    max={32} 
                    step={1} 
                    onChange={(_, v) => setRadius(v as number)}
                    valueLabelDisplay="auto"
                  />
                </Box>

                {selectedFormat === "phone" && (
                  <FormControlLabel
                    sx={{ mt: 1 }}
                    control={<Switch checked={showNotch} onChange={(e) => setShowNotch(e.target.checked)} />}
                    label="Show Notch"
                  />
                )}

                {selectedFormat === "browser" && (
                  <>
                    {/* Browser Chrome */}
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>Browser Chrome</Typography>
                      <ToggleButtonGroup
                        value={toolbarStyle}
                        exclusive
                        onChange={(_, newStyle) => newStyle && setToolbarStyle(newStyle)}
                        fullWidth
                        size="small"
                        sx={{ 
                          mb: 1,
                          '& .MuiToggleButton-root': {
                            '&.Mui-selected': {
                              backgroundColor: 'secondary.main',
                              color: 'secondary.contrastText',
                              '&:hover': {
                                backgroundColor: 'secondary.dark',
                              },
                            },
                          },
                        }}
                      >
                        <Tooltip title="Light Chrome">
                          <ToggleButton value="light" aria-label="light chrome">
                            <LightIcon fontSize="small" />
                          </ToggleButton>
                        </Tooltip>
                        <Tooltip title="Dark Chrome">
                          <ToggleButton value="dark" aria-label="dark chrome">
                            <DarkIcon fontSize="small" />
                          </ToggleButton>
                        </Tooltip>
                      </ToggleButtonGroup>
                    </Box>

                    {/* Navigation Style */}
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>Navigation Style</Typography>
                      <ToggleButtonGroup
                        value={navigationStyle}
                        exclusive
                        onChange={(_, newStyle) => newStyle && setNavigationStyle(newStyle)}
                        fullWidth
                        size="small"
                        sx={{ 
                          mb: 1,
                          '& .MuiToggleButton-root': {
                            '&.Mui-selected': {
                              backgroundColor: 'secondary.main',
                              color: 'secondary.contrastText',
                              '&:hover': {
                                backgroundColor: 'secondary.dark',
                              },
                            },
                          },
                        }}
                      >
                        <Tooltip title="Top Bar">
                          <ToggleButton value="topbar" aria-label="top bar">
                            <TopBarIcon fontSize="small" />
                          </ToggleButton>
                        </Tooltip>
                        <Tooltip title="Side Bar">
                          <ToggleButton value="sidebar" aria-label="side bar">
                            <SideBarIcon fontSize="small" />
                          </ToggleButton>
                        </Tooltip>
                      </ToggleButtonGroup>
                    </Box>
                  </>
                )}
              </>
            )}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handlePreview}
              disabled={isLoading}
              sx={{
                mt: 1,
                position: 'relative',
                minHeight: '48px',
                '&:disabled': {
                  backgroundColor: 'action.disabledBackground',
                  color: 'action.disabled',
                  '& .MuiCircularProgress-root': {
                    color: 'action.disabled'
                  }
                }
              }}
            >
              {isLoading ? (
                <>
                  <CircularProgress
                    size={24}
                    sx={{
                      color: 'primary.contrastText',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                  <span style={{ opacity: 0 }}>Refresh Preview</span>
                </>
              ) : (
                'Refresh Preview'
              )}
            </Button>
          </Box>

          {/* Right Panel - Preview */}
          <Box
            flex={3}
            sx={{
              pl: { md: 3 },
              borderLeft: { md: "1px solid" },
              borderColor: { md: "divider" },
              overflow: "hidden",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography variant="h6">
                {selectedFormat === "swatches"
                  ? "Swatches Preview"
                  : selectedFormat === "table"
                    ? "Table Preview"
                    : selectedFormat === "phone"
                      ? "Phone Preview"
                      : selectedFormat === "browser" ? "Browser Preview" : "Preview"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedFormat === "swatches"
                  ? "Swatches Preview"
                  : selectedFormat === "table"
                    ? "Table Preview"
                    : selectedFormat === "phone"
                      ? "Phone Preview"
                      : selectedFormat === "browser" ? "Browser Preview" : "Preview"}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {previewData ? (
              <Box>
                {selectedFormat === "swatches" && renderSwatches()}
                {selectedFormat === "table" && renderColorTable()}
                {(selectedFormat === "phone" || selectedFormat === "browser") && previewData && (
                  <Box sx={{ height: "60vh", overflow: "hidden" }}>
                    <DeviceFrame
                      variant={selectedFormat as any}
                      radius={radius}
                      shadow="md"
                      showNotch={selectedFormat === "phone" ? showNotch : false}
                      toolbarStyle={selectedFormat === "browser" ? toolbarStyle : "light"}
                      navigationStyle={selectedFormat === "browser" ? navigationStyle : "topbar"}
                      logicalWidth={selectedFormat === "phone" ? 390 : 1280}
                      logicalHeight={selectedFormat === "phone" ? 844 : 800}
                    >
                      <PaletteVarsProvider palette={previewData} isTertiaryEnabled={isTertiaryEnabled} mode={colorMode}>
                        <UIContentPreview device={selectedFormat as any} radius={radius} navigationStyle={navigationStyle} layout={layoutType} />
                      </PaletteVarsProvider>
                    </DeviceFrame>
                  </Box>
                )}
              </Box>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="300px"
                sx={{ 
                  bgcolor: 'background.paper',
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isLoading && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'background.paper',
                      zIndex: 1
                    }}
                  >
                    <CircularProgress 
                      size={60} 
                      thickness={4}
                      sx={{ 
                        color: secondaryColor || 'primary.main',
                      }} 
                    />
                  </Box>
                )}
                <Box sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  opacity: isLoading ? 0.5 : 1,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: isLoading ? 'none' : 'auto'
                }}>
                  <Typography variant="h6" color="text.primary" gutterBottom>
                    {previewData ? 'Palette Preview' : 'No Preview Generated'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {previewData 
                      ? 'Your color palette is ready!' 
                      : 'Select colors and click "Generate Preview" to see your palette'}
                  </Typography>
                  {!previewData && !isLoading && (
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      onClick={handlePreview}
                      sx={{ mt: 2 }}
                    >
                      Generate Preview
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
