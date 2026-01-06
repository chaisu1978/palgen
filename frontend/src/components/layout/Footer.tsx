import { useState, useRef } from 'react';
import { Box, Button, TextField, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import DownloadIcon from '@mui/icons-material/Download';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createPalette, downloadAnonymousPalette } from '../../services/palette';
import type { RootState } from '../../store';

interface FooterProps {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor?: string;
  onReset?: () => void;
}

export default function Footer({ primaryColor, secondaryColor, tertiaryColor, onReset }: FooterProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [paletteName, setPaletteName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handlePaletteNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaletteName(event.target.value);
    // Clear any previous messages when user types
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleGenerateClick = async () => {
    if (!paletteName.trim()) return;
    
    // Validate colors are not empty
    if (!primaryColor || !secondaryColor) {
      setError('Primary and secondary colors are required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isAuthenticated) {
        // Authenticated user: Save to account
        const paletteData = {
          name: paletteName.trim(),
          primary: primaryColor,
          secondary: secondaryColor,
          ...(tertiaryColor && { tertiary: tertiaryColor })
        };
        
        await createPalette(paletteData);
        
        // Show success message
        setSuccess(`Palette "${paletteName}" created successfully!`);
        setPaletteName('');
        
        // Redirect to my-palettes page after a short delay
        setTimeout(() => {
          navigate('/my-palettes');
        }, 1500);
      } else {
        // Anonymous user: Download immediately
        const downloadPayload = {
          name: paletteName.trim(),
          primary: primaryColor,
          secondary: secondaryColor,
          ...(tertiaryColor && { tertiary: tertiaryColor, include_tertiary: true })
        };
        
        const blob = await downloadAnonymousPalette(downloadPayload);
        
        // Trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${paletteName.trim()}-palette-files.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        // Show success message
        setSuccess(`Palette "${paletteName}" downloaded successfully!`);
        
        // Reset the generator state
        setPaletteName('');
        if (onReset) {
          setTimeout(() => {
            onReset();
          }, 500);
        }
      }
    } catch (err) {
      console.error('Error generating palette:', err);
      const action = isAuthenticated ? 'generate' : 'download';
      setError(err instanceof Error ? err.message : `Failed to ${action} palette`);
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !paletteName.trim() || isLoading;
  const buttonText = isAuthenticated ? 'Generate Palette' : 'Download Palette';
  const buttonIcon = isAuthenticated ? <LocalOfferIcon /> : <DownloadIcon />;
  
  return (
    <>
      <Box
        component="footer"
        sx={{
          backgroundColor: theme.palette.primary.light,
          color: theme.palette.highlight.main,
          py: 0.5,
          px: 0.5,
          borderTop: `3px solid ${theme.palette.primary.dark}`,
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.drawer - 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: { xs: 'center', sm: 'flex-end' },
            ml: 5,
          }}
        >
          <Box position="relative">
            <TextField
              id="palette-name"
              label="Palette Name"
              variant="outlined"
              size="small"
              value={paletteName}
              onChange={handlePaletteNameChange}
              disabled={isLoading}
              sx={{
                margin: 1,
                backgroundColor: theme.palette.background.default,
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary,
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.secondary,
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.divider,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
              }}
            />
          </Box>
          <Button
            ref={buttonRef}
            variant="contained"
            color="secondary"
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : buttonIcon}
            onClick={handleGenerateClick}
            disabled={isButtonDisabled}
            sx={{ 
              margin: 1,
              minWidth: 150,
              '&.Mui-disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled,
              },
            }}
          >
            {isLoading ? (isAuthenticated ? 'Generating...' : 'Downloading...') : buttonText}
          </Button>
        </Box>

      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
