import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'success' | 'info' | 'warning';
}

export default function ConfirmationDialog({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmColor = 'primary',
}: ConfirmationDialogProps) {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{
        sx: {
          background: theme.palette.background.default,
          backgroundImage: 'none',
          minWidth: '300px',
          boxShadow: theme.shadows[10],
          borderRadius: '12px',
          '& .MuiDialogTitle-root': {
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${theme.palette.divider}`,
            padding: '16px 24px',
            fontWeight: 600,
          },
          '& .MuiDialogContent-root': {
            padding: '20px 24px',
          },
          '& .MuiDialogActions-root': {
            padding: '16px 24px',
            borderTop: `1px solid ${theme.palette.divider}`,
            '& > :not(style) ~ :not(style)': {
              marginLeft: '12px',
            },
          },
        },
      }}
    >
      <DialogTitle id="alert-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText 
          id="alert-dialog-description"
          sx={{ 
            color: theme.palette.text.secondary,
            fontSize: '1rem',
            lineHeight: 1.5,
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onCancel}
          variant="contained"
          color="inherit"
          sx={{
            textTransform: 'none',
            padding: '6px 16px',
            borderRadius: '8px',
            fontWeight: 500,
            backgroundColor: theme.palette.action.hover,
            '&:hover': {
              backgroundColor: theme.palette.action.selected,
            },
          }}
        >
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm}
          color={confirmColor}
          variant="contained"
          autoFocus
          sx={{
            textTransform: 'none',
            padding: '6px 16px',
            borderRadius: '8px',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: `${theme.palette[confirmColor].dark} !important`,
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
