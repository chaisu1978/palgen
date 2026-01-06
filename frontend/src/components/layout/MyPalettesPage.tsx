import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, CircularProgress, IconButton,
  Menu, MenuItem, ListItemIcon, ListItemText, Snackbar, Alert, TextField,
  InputAdornment, Paper, useTheme, useMediaQuery, Tooltip, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import { Smartphone, LightMode, DarkMode, Palette as SwatchesIcon, TableChart as TableIcon } from '@mui/icons-material';
import { Download, MoreVert, Delete, FolderZip, Search, ContentCopy } from '@mui/icons-material';
import { Icon } from '@iconify/react';
import { fetchUserPalettes, downloadPaletteFiles, downloadPaletteFile, deletePalette, fetchPalettePreview, type UserPalette, type BackendPalette } from '../../services/palette';
import ConfirmationDialog from '../common/ConfirmationDialog';
import DeviceFrame from '../preview/DeviceFrame';
import PaletteVarsProvider from '../preview/PaletteVarsProvider';
import UIContentPreview from '../preview/UIContentPreview';

export default function MyPalettesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [palettes, setPalettes] = useState<UserPalette[]>([]);
  const [filteredPalettes, setFilteredPalettes] = useState<UserPalette[]>([]);
  const [selectedPalette, setSelectedPalette] = useState<UserPalette | null>(null);
  const [selectedPaletteData, setSelectedPaletteData] = useState<BackendPalette | null>(null);
  const [paletteLoading, setPaletteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [previewFormat, setPreviewFormat] = useState<'browser' | 'phone' | 'swatches' | 'table'>('browser');
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');
  const [layoutType, setLayoutType] = useState<'dashboard' | 'landing'>('landing');

  const loadPalettes = async () => {
    try {
      setLoading(true);
      const data = await fetchUserPalettes();
      if (!Array.isArray(data)) {
        console.error('Expected an array of palettes but got:', data);
        setError('Invalid data format received from server');
        setPalettes([]);
        return;
      }
      setPalettes(data);
      setFilteredPalettes(data);
      if (data.length > 0 && !selectedPalette) {
        const firstPalette = data[0];
        setSelectedPalette(firstPalette);
        fetchPaletteData(firstPalette);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load palettes';
      setError(errorMessage);
      console.error('Error loading palettes:', err);
      setPalettes([]);
      setFilteredPalettes([]);
    } finally {
      setLoading(false);
    }
  };

  const location = useLocation();
  
  // Create refs for scrolling
  const topRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  // Scroll to top when the component mounts or when the location changes
  useEffect(() => {
    // Small delay to ensure the DOM is fully loaded
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      loadPalettes();
    }, 0);
    
    return () => clearTimeout(timer);
  }, [location.pathname]); // Re-run when the pathname changes

  // Track if a palette has been selected by the user
  const userSelectedPalette = useRef(false);

  // Scroll to details when a palette is selected on mobile
  useEffect(() => {
    if (isMobile && selectedPalette && detailsRef.current && userSelectedPalette.current) {
      // Small timeout to ensure the DOM has updated
      const timer = setTimeout(() => {
        detailsRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [selectedPalette, isMobile]);

  const fetchPaletteData = async (palette: UserPalette) => {
    try {
      setPaletteLoading(true);
      const paletteData = await fetchPalettePreview({
        primary: palette.primary,
        secondary: palette.secondary || '#a351a9',
        ...(palette.tertiary && { 
          tertiary: palette.tertiary,
          include_tertiary: true 
        })
      });
      setSelectedPaletteData(paletteData);
    } catch (err) {
      console.error('Error fetching palette data:', err);
      setError('Failed to load palette preview data');
      setSelectedPaletteData(null);
    } finally {
      setPaletteLoading(false);
    }
  };

  const handlePaletteSelect = (palette: UserPalette) => {
    userSelectedPalette.current = true;
    setSelectedPalette(palette);
    fetchPaletteData(palette);
  };

  useEffect(() => {
    const filtered = palettes.filter(palette =>
      palette.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPalettes(filtered);
  }, [searchTerm, palettes]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, palette: UserPalette) => {
    setAnchorEl(event.currentTarget);
    setSelectedPalette(palette);
    
    // On mobile, the menu is not shown, so we need to handle selection differently
    if (isMobile) {
      setSelectedPalette(palette);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadAll = async () => {
    if (!selectedPalette) return;
    try {
      const blob = await downloadPaletteFiles(selectedPalette.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedPalette.name}-palette-files.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      setError('Failed to download palette files');
      console.error(err);
    }
    handleMenuClose();
  };

  const handleDownloadFile = async (fileId: number, fileName: string) => {
    try {
      const blob = await downloadPaletteFile(fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      setError('Failed to download file');
      console.error(err);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedPalette) return;
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPalette) return;
    try {
      await deletePalette(selectedPalette.id);
      setSelectedPalette(null);
      await loadPalettes();
      setDeleteDialogOpen(false);
    } catch (err) {
      setError('Failed to delete palette');
      console.error(err);
    }
    handleMenuClose();
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    handleMenuClose();
  };

  const handleCopyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy:', err);
      setError('Failed to copy color to clipboard');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
    if (!selectedPaletteData) return null;

    return (
      <Box sx={{ height: "100%", overflowY: "auto", overflowX: "auto", mt: 0 }}>
        <table style={{ 
          width: "100%", 
          borderCollapse: "collapse",
          fontSize: "0.75rem",
          fontWeight: "normal"
        }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "6px",
                  borderBottom: "1px solid #ddd",
                  fontSize: "0.75rem",
                  fontWeight: "600"
                }}
              >
                Color
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "6px",
                  borderBottom: "1px solid #ddd",
                  fontSize: "0.75rem",
                  fontWeight: "600"
                }}
              >
                Shade
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "6px",
                  borderBottom: "1px solid #ddd",
                  fontSize: "0.75rem",
                  fontWeight: "600"
                }}
              >
                RGB
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "6px",
                  borderBottom: "1px solid #ddd",
                  fontSize: "0.75rem",
                  fontWeight: "600"
                }}
              >
                HEX
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "6px",
                  borderBottom: "1px solid #ddd",
                  fontSize: "0.75rem",
                  fontWeight: "600"
                }}
              >
                HSB
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "6px",
                  borderBottom: "1px solid #ddd",
                  fontSize: "0.75rem",
                  fontWeight: "600"
                }}
              >
                CMYK
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(selectedPaletteData).flatMap(([colorKey, color]) =>
              Object.entries(color.shades).map(([shade, swatch]) => (
                <tr key={`${colorKey}-${shade}`}>
                  <td
                    style={{ padding: "6px", borderBottom: "1px solid #eee", fontSize: "0.75rem" }}
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
                    style={{ padding: "6px", borderBottom: "1px solid #eee", fontSize: "0.75rem" }}
                  >
                    {`${color.name} ${shade}`}
                  </td>
                  <td
                    style={{ padding: "6px", borderBottom: "1px solid #eee", fontSize: "0.75rem" }}
                  >
                    {`rgb(${swatch.rgb.join(", ")})`}
                  </td>
                  <td
                    style={{ padding: "6px", borderBottom: "1px solid #eee", fontSize: "0.75rem" }}
                  >
                    {swatch.hex}
                  </td>
                  <td
                    style={{ padding: "6px", borderBottom: "1px solid #eee", fontSize: "0.75rem" }}
                  >
                    {swatch.hsb ? `hsb(${Math.round(swatch.hsb[0])}°, ${Math.round(swatch.hsb[1])}%, ${Math.round(swatch.hsb[2])}%)` : 'N/A'}
                  </td>
                  <td
                    style={{ padding: "6px", borderBottom: "1px solid #eee", fontSize: "0.75rem" }}
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
    if (!selectedPaletteData) return null;

    const columns = orderedSwatchKeys(selectedPaletteData, !!selectedPalette?.tertiary);
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
          height: "100%",
          display: "grid",
          gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
          gap: 1,
        }}
      >
        {/* Column Headers */}
        {columns.map((key) => (
          <Box key={key} sx={{ textAlign: "center", fontWeight: 600, mb: 1 }}>
            {selectedPaletteData[key].name}
          </Box>
        ))}

        {/* Shades */}
        {shadeScale.flatMap((shade) =>
          columns.map((key) => {
            const swatch = selectedPaletteData[key].shades[shade];
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
                  cursor: "pointer",
                }}
                onClick={() => handleCopyColor(swatch.hex)}
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


  const getFileTypeConfig = (fileType: string) => {
    const type = fileType.toUpperCase();
    
    const config = {
      XLSX: {
        icon: <Icon icon="vscode-icons:file-type-excel" width={24} height={24} />,
        color: 'success.main',
        label: 'Excel',
      },
      PNG: {
        icon: <Icon icon="vscode-icons:file-type-image" width={24} height={24} />,
        color: 'info.main',
        label: 'PNG Image',
      },
      TYPESCRIPT: {
        icon: <Icon icon="vscode-icons:file-type-typescript" width={24} height={24} />,
        color: 'warning.main',
        label: 'TypeScript',
      },
      TS: {
        icon: <Icon icon="vscode-icons:file-type-typescript" width={24} height={24} />,
        color: 'warning.main',
        label: 'TypeScript',
      },
      DART: {
        icon: <Icon icon="vscode-icons:file-type-dartlang" width={24} height={24} />,
        color: 'primary.main',
        label: 'Dart',
      },
      CSS: {
        icon: <Icon icon="vscode-icons:file-type-css" width={24} height={24} />,
        color: 'secondary.main',
        label: 'CSS',
      },
    };

    return config[type as keyof typeof config] || {
      icon: <Icon icon="vscode-icons:default-file" width={24} height={24} />,
      color: 'grey.300',
      label: fileType,
    };
  };

  return (
    <Box 
      ref={topRef}
      sx={{ 
        px: 2,
        py: 1.5,
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'background.paper' 
      }}>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        flex: 1,
        gap: 2, 
        mt: 1,
        minWidth: 0, // Prevent flex items from overflowing
        width: '100%', // Ensure full width
      }}>
        {/* Left Panel - Palette List */}
        <Paper sx={{
          p: 1.5,
          flex: isMobile ? '0 0 auto' : '0 0 33%',
          maxWidth: isMobile ? '100%' : '33%',
          minWidth: 0, // Prevent flex item from growing beyond container
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          overflow: 'hidden',
          backgroundColor: 'background.default',
          height: '85vh',
          overflowY: 'auto',
        }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            My Palettes
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search palettes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ 
            overflowY: 'auto', 
            flex: 1,
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.primary.light,
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.primary.light,
              borderRadius: '3px',
              '&:hover': {
                background: theme.palette.primary.main,
              },
            },
          }}>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : filteredPalettes.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" p={2}>
                {searchTerm ? 'No matching palettes found' : 'No palettes found'}
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {filteredPalettes.map((palette) => (
                  <Card
                    key={palette.id}
                    onClick={() => handlePaletteSelect(palette)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: selectedPalette?.id === palette.id ? 'secondary.main' : 'primary.light',
                      '&:hover': { backgroundColor: 'secondary.light' },
                      transition: 'background-color 0.2s',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <CardContent sx={{ p: 2, pb: 5 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle1" noWrap>{palette.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(palette.updated_at)}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, palette);
                        }}>
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      height: '36px',
                      width: '100%',
                      position: 'absolute',
                      bottom: 0,
                      left: 0
                    }}>
                      <Box sx={{ 
                        flex: 1, 
                        backgroundColor: palette.primary,
                        height: '100%',
                        borderRight: '1px solid rgba(255,255,255,0.3)'
                      }} />
                      {palette.secondary && (
                        <Box sx={{ 
                          flex: 1, 
                          backgroundColor: palette.secondary,
                          height: '100%',
                          borderRight: palette.tertiary ? '1px solid rgba(255,255,255,0.3)' : 'none'
                        }} />
                      )}
                      {palette.tertiary && (
                        <Box sx={{ 
                          flex: 1, 
                          backgroundColor: palette.tertiary,
                          height: '100%'
                        }} />
                      )}
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        </Paper>

        {/* Right Panel - Selected Palette Details */}
        <div ref={detailsRef} style={{ 
          scrollMarginTop: '80px',
          flex: 1,
          minWidth: 0, // Prevent flex item from growing beyond container
        }}>
          <Paper sx={{
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: 'background.default',
            minWidth: 0, // Prevent content from overflowing
          }}>
          {selectedPalette ? (
            <>
              {/* Color Hash Display with Copy - Moved to top */}
              <Box sx={{ 
                display: 'flex', 
                height: '56px',
                width: '100%',
                position: 'relative',
                mb: 2
              }}>
                <Box sx={{ 
                  flex: 1, 
                  backgroundColor: selectedPalette.primary,
                  height: '100%',
                  borderRight: '1px solid rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  px: 1,
                }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontFamily: 'monospace',
                      color: () => {
                        const rgb = parseInt(selectedPalette.primary.slice(1), 16);
                        const r = (rgb >> 16) & 0xff;
                        const g = (rgb >> 8) & 0xff;
                        const b = rgb & 0xff;
                        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                        return brightness > 128 ? '#000' : '#fff';
                      },
                      fontWeight: 'bold',
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    {selectedPalette.primary}
                  </Typography>
                  <Tooltip title="Copy to clipboard">
                    <IconButton
                      size="small"
                      onClick={() => handleCopyColor(selectedPalette.primary)}
                      sx={{ 
                        p: 0.5,
                        color: () => {
                          const rgb = parseInt(selectedPalette.primary.slice(1), 16);
                          const r = (rgb >> 16) & 0xff;
                          const g = (rgb >> 8) & 0xff;
                          const b = rgb & 0xff;
                          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                          return brightness > 128 ? '#000' : '#fff';
                        },
                      }}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                {selectedPalette.secondary && (
                  <Box sx={{ 
                    flex: 1, 
                    backgroundColor: selectedPalette.secondary,
                    height: '100%',
                    borderRight: selectedPalette.tertiary ? '1px solid rgba(255,255,255,0.3)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    px: 1,
                  }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontFamily: 'monospace',
                        color: () => {
                          const rgb = parseInt(selectedPalette.secondary!.slice(1), 16);
                          const r = (rgb >> 16) & 0xff;
                          const g = (rgb >> 8) & 0xff;
                          const b = rgb & 0xff;
                          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                          return brightness > 128 ? '#000' : '#fff';
                        },
                        fontWeight: 'bold',
                        display: { xs: 'none', sm: 'block' },
                      }}
                    >
                      {selectedPalette.secondary}
                    </Typography>
                    <Tooltip title="Copy to clipboard">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyColor(selectedPalette.secondary!)}
                        sx={{ 
                          p: 0.5,
                          color: () => {
                            const rgb = parseInt(selectedPalette.secondary!.slice(1), 16);
                            const r = (rgb >> 16) & 0xff;
                            const g = (rgb >> 8) & 0xff;
                            const b = rgb & 0xff;
                            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                            return brightness > 128 ? '#000' : '#fff';
                          },
                        }}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
                
                {selectedPalette.tertiary && (
                  <Box sx={{ 
                    flex: 1, 
                    backgroundColor: selectedPalette.tertiary,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5,
                    px: 1,
                  }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontFamily: 'monospace',
                        color: () => {
                          const rgb = parseInt(selectedPalette.tertiary!.slice(1), 16);
                          const r = (rgb >> 16) & 0xff;
                          const g = (rgb >> 8) & 0xff;
                          const b = rgb & 0xff;
                          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                          return brightness > 128 ? '#000' : '#fff';
                        },
                        fontWeight: 'bold',
                        display: { xs: 'none', sm: 'block' },
                      }}
                    >
                      {selectedPalette.tertiary}
                    </Typography>
                    <Tooltip title="Copy to clipboard">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyColor(selectedPalette.tertiary!)}
                        sx={{ 
                          p: 0.5,
                          color: () => {
                            const rgb = parseInt(selectedPalette.tertiary!.slice(1), 16);
                            const r = (rgb >> 16) & 0xff;
                            const g = (rgb >> 8) & 0xff;
                            const b = rgb & 0xff;
                            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                            return brightness > 128 ? '#000' : '#fff';
                          },
                        }}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              {/* Palette Preview with Controls */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 0 }}>
                {/* Preview Controls */}
                <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 1, alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  {/* Preview Format Toggle */}
                  <ToggleButtonGroup
                    value={previewFormat}
                    exclusive
                    onChange={(_, newFormat) => newFormat && setPreviewFormat(newFormat)}
                    size="small"
                    color="secondary"
                    sx={{ 
                      '& .MuiToggleButton-root': { 
                        py: 0.5, 
                        px: 1, 
                        minWidth: 'auto',
                        backgroundColor: 'secondary.light',
                        '&.Mui-selected': {
                          backgroundColor: 'secondary.main',
                          color: 'secondary.contrastText',
                          '&:hover': {
                            backgroundColor: 'secondary.dark',
                          }
                        },
                        '&:hover': {
                          backgroundColor: 'secondary.light',
                        }
                      } 
                    }}
                  >
                    <Tooltip title="Browser Preview">
                      <ToggleButton value="browser">
                        <Icon icon="mdi:monitor" style={{ fontSize: '18px' }} />
                      </ToggleButton>
                    </Tooltip>
                    <Tooltip title="Phone Preview">
                      <ToggleButton value="phone">
                        <Smartphone sx={{ fontSize: '18px' }} />
                      </ToggleButton>
                    </Tooltip>
                    <Tooltip title="Color Swatches">
                      <ToggleButton value="swatches">
                        <SwatchesIcon sx={{ fontSize: '18px' }} />
                      </ToggleButton>
                    </Tooltip>
                    <Tooltip title="Color Table">
                      <ToggleButton value="table">
                        <TableIcon sx={{ fontSize: '18px' }} />
                      </ToggleButton>
                    </Tooltip>
                  </ToggleButtonGroup>

                  {/* Layout Type Toggle - Only for browser/phone previews */}
                  {(previewFormat === 'browser' || previewFormat === 'phone') && (
                    <ToggleButtonGroup
                      value={layoutType}
                      exclusive
                      onChange={(_, newLayout) => newLayout && setLayoutType(newLayout)}
                      size="small"
                      color="secondary"
                      sx={{ 
                        '& .MuiToggleButton-root': { 
                          py: 0.5, 
                          px: 1, 
                          minWidth: 'auto',
                          backgroundColor: 'secondary.light',
                          '&.Mui-selected': {
                            backgroundColor: 'secondary.main',
                            color: 'secondary.contrastText',
                            '&:hover': {
                              backgroundColor: 'secondary.dark',
                            }
                          },
                          '&:hover': {
                            backgroundColor: 'secondary.light',
                          }
                        } 
                      }}
                    >
                      <Tooltip title="Landing Page Layout">
                        <ToggleButton value="landing">
                          <Icon icon="mdi:web" style={{ fontSize: '18px' }} />
                        </ToggleButton>
                      </Tooltip>
                      <Tooltip title="Dashboard Layout">
                        <ToggleButton value="dashboard">
                          <Icon icon="mdi:view-dashboard" style={{ fontSize: '18px' }} />
                        </ToggleButton>
                      </Tooltip>
                    </ToggleButtonGroup>
                  )}

                  {/* Light/Dark Mode Toggle - Only for browser/phone previews */}
                  {(previewFormat === 'browser' || previewFormat === 'phone') && (
                    <ToggleButtonGroup
                      value={colorMode}
                      exclusive
                      onChange={(_, newMode) => newMode && setColorMode(newMode)}
                      size="small"
                      color="secondary"
                      sx={{ 
                        '& .MuiToggleButton-root': { 
                          py: 0.5, 
                          px: 1, 
                          minWidth: 'auto',
                          backgroundColor: 'secondary.light',
                          '&.Mui-selected': {
                            backgroundColor: 'secondary.main',
                            color: 'secondary.contrastText',
                            '&:hover': {
                              backgroundColor: 'secondary.dark',
                            }
                          },
                          '&:hover': {
                            backgroundColor: 'secondary.light',
                          }
                        } 
                      }}
                    >
                      <Tooltip title="Light Mode">
                        <ToggleButton value="light">
                          <LightMode sx={{ fontSize: '18px' }} />
                        </ToggleButton>
                      </Tooltip>
                      <Tooltip title="Dark Mode">
                        <ToggleButton value="dark">
                          <DarkMode sx={{ fontSize: '18px' }} />
                        </ToggleButton>
                      </Tooltip>
                    </ToggleButtonGroup>
                  )}
                </Box>

                {/* Preview Area */}
                <Paper sx={{ flex: 1, p: 1.5, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
                  <Box sx={{ height: "53vh", overflow: "hidden" }}>
                    {paletteLoading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <CircularProgress />
                      </Box>
                    ) : selectedPaletteData ? (
                      <>
                        {previewFormat === 'swatches' && renderSwatches()}
                        {previewFormat === 'table' && renderColorTable()}
                        {(previewFormat === 'phone' || previewFormat === 'browser') && (
                          <DeviceFrame
                            variant={previewFormat as any}
                            radius={8}
                            shadow="sm"
                            showNotch={previewFormat === 'phone'}
                            toolbarStyle="light"
                            logicalWidth={previewFormat === 'phone' ? 390 : 1280}
                            logicalHeight={previewFormat === 'phone' ? 844 : 800}
                          >
                            <PaletteVarsProvider palette={selectedPaletteData} isTertiaryEnabled={!!selectedPalette.tertiary} mode={colorMode}>
                              <UIContentPreview device={previewFormat as any} radius={8} navigationStyle="topbar" layout={layoutType} />
                            </PaletteVarsProvider>
                          </DeviceFrame>
                        )}
                      </>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                        <Typography>Select a palette to view preview</Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>

                {/* Palette Details Section */}
                <Paper sx={{ p: 1.5, mt: 1 }}>
                  {selectedPalette.status === 'processing' && (
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <CircularProgress size={16} />
                      <Typography variant="body2">Processing palette...</Typography>
                    </Box>
                  )}

                  {selectedPalette.status === 'error' && (
                    <Alert severity="error" sx={{ mb: 1, py: 0.5 }}>
                      <Typography variant="body2">Error: {selectedPalette.error_message || 'Unknown error occurred'}</Typography>
                    </Alert>
                  )}

                  <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'stretch' : 'flex-start'} gap={1.5}>
                    <Box>
                      <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>{selectedPalette.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        Created: {formatDate(selectedPalette.created_at)} • Updated: {formatDate(selectedPalette.updated_at)}
                      </Typography>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={0.5} alignItems={isMobile ? 'stretch' : 'flex-end'}>
                      {/* Icon Download Buttons */}
                      <Box display="flex" gap={0.5} justifyContent={isMobile ? 'center' : 'flex-end'}>
                        {selectedPalette.files.map((file) => {
                          const fileConfig = getFileTypeConfig(file.file_type.name);
                          return (
                            <Tooltip key={file.id} title={`Download ${fileConfig.label}`}>
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDownloadFile(file.id, file.file_name)}
                                  disabled={selectedPalette.status !== 'completed'}
                                  sx={{
                                    backgroundColor: (theme: any) => {
                                      const [colorType, colorShade] = fileConfig.color.split('.');
                                      const palette = theme.palette[colorType];
                                      return palette ? palette[colorShade] : theme.palette.grey[300];
                                    },
                                    '&:hover': {
                                      backgroundColor: (theme: any) => {
                                        const [colorType, colorShade] = fileConfig.color.split('.');
                                        const palette = theme.palette[colorType];
                                        return palette ? palette[colorShade === 'main' ? 'dark' : colorShade] : theme.palette.grey[400];
                                      },
                                    },
                                    color: 'highlight.main',
                                  }}
                                >
                                  {fileConfig.icon}
                                </IconButton>
                              </span>
                            </Tooltip>
                          );
                        })}
                      </Box>
                      
                      {/* Download All Button */}
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<FolderZip />}
                        onClick={handleDownloadAll}
                        disabled={selectedPalette.status !== 'completed'}
                        size="small"
                        fullWidth={isMobile}
                        sx={{ fontSize: '0.75rem', py: 0.5 }}
                      >
                        Download All
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">Select a palette to view details</Typography>
            </Box>
          )}
          </Paper>
        </div>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleDownloadAll} disabled={!selectedPalette || selectedPalette.status !== 'completed'}>
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download All Files</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error' }}>Delete Palette</ListItemText>
        </MenuItem>
      </Menu>

      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Palette"
        message={selectedPalette ? `Are you sure you want to delete "${selectedPalette.name}"?` : 'Are you sure you want to delete this palette?'}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setCopySuccess(false)} severity="success" sx={{ width: '100%' }}>
          Color copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}
