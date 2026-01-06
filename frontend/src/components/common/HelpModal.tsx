import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import PaletteIcon from '@mui/icons-material/Palette';
import RefreshIcon from '@mui/icons-material/Refresh';
import LoginIcon from '@mui/icons-material/Login';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export default function HelpModal({ open, onClose }: HelpModalProps) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaletteIcon color="primary" />
          <Typography variant="h6" component="span">
            How to Use PalGen
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* Introduction */}
        <Typography variant="body1" paragraph>
          PalGen helps you create beautiful, accessible color palettes for your design projects. 
          Each palette includes 9 shades (100-900) in multiple formats.
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* How to Create a Palette */}
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaletteIcon fontSize="small" color="primary" />
          Creating Your Palette
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Typography variant="body2" fontWeight="bold">1.</Typography>
            </ListItemIcon>
            <ListItemText 
              primary="Choose Your Colors"
              secondary="Use the color pickers at the top to select your Primary and Secondary colors. Optionally enable and choose a Tertiary color."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Typography variant="body2" fontWeight="bold">2.</Typography>
            </ListItemIcon>
            <ListItemText 
              primary="Preview Your Palette"
              secondary="See a live preview of your color palette with all 9 shades for each color, plus supporting colors (Neutral, Green, Orange, Red, Blue)."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Typography variant="body2" fontWeight="bold">3.</Typography>
            </ListItemIcon>
            <ListItemText 
              primary="Name Your Palette"
              secondary="Enter a descriptive name in the text field at the bottom of the page."
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        {/* User-specific instructions */}
        {!isAuthenticated ? (
          <>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DownloadIcon fontSize="small" color="secondary" />
              Download Your Palette (Guest Mode)
            </Typography>
            <Typography variant="body2" paragraph>
              As a guest, you can instantly download your palette without creating an account:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" color="secondary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Click 'Download Palette'"
                  secondary="Your palette will be downloaded as a ZIP file containing 5 file formats: PNG image, Excel spreadsheet, CSS variables, TypeScript constants, and Dart/Flutter colors."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <RefreshIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Automatic Reset"
                  secondary="After downloading, the generator automatically resets so you can create another palette."
                />
              </ListItem>
            </List>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LoginIcon fontSize="small" color="primary" />
                <strong>Want to save your palettes?</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Create a free account to save unlimited palettes, organize them, and access them from anywhere!
              </Typography>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SaveIcon fontSize="small" color="secondary" />
              Save Your Palette (Authenticated)
            </Typography>
            <Typography variant="body2" paragraph>
              As a registered user, you can save palettes to your account:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <SaveIcon fontSize="small" color="secondary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Click 'Generate Palette'"
                  secondary="Your palette will be saved to your account and you'll be redirected to 'My Palettes' where you can view, download, or delete it."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Download Anytime"
                  secondary="Access your saved palettes from 'My Palettes' in the sidebar and download them whenever you need."
                />
              </ListItem>
            </List>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        {/* File Formats */}
        <Typography variant="h6" gutterBottom>
          Included File Formats
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="PNG Image"
              secondary="Visual reference showing all colors with their values (HEX, RGB, HSB, CMYK)"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Excel Spreadsheet (.xlsx)"
              secondary="Organized color data with visual swatches"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="CSS Variables (.css)"
              secondary="Ready-to-use CSS custom properties for web projects"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="TypeScript (.ts)"
              secondary="Type-safe color constants for React/TypeScript projects"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Dart/Flutter (.dart)"
              secondary="Material color swatches for Flutter mobile apps"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Tips */}
        <Typography variant="h6" gutterBottom>
          Tips for Best Results
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText 
              primary="• Choose colors with good contrast for better accessibility"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="• Use the preview to see how your colors work together"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="• The tertiary color is optional - toggle it on/off as needed"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="• Supporting colors (Green, Orange, Red, Blue) are automatically generated for alerts and status indicators"
            />
          </ListItem>
        </List>
      </DialogContent>
    </Dialog>
  );
}
