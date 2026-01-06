import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { ShoppingCart, Info, Build, Phone, TrendingUp, People } from "@mui/icons-material";

interface DashboardLayoutProps {
  isPhone: boolean;
  contentRadius: string;
}

export default function DashboardLayout({ isPhone, contentRadius }: DashboardLayoutProps) {
  // Helper to add tertiary border if available
  const tertiaryBorder = {
    borderBottom: "4px solid var(--tertiary-main, transparent)",
  };

  return (
    <>
      {/* Hero / Callout */}
      <Paper
        variant="outlined"
        sx={{
          p: isPhone ? 1.5 : 2,
          mb: 1.5,
          bgcolor: "var(--bg-paper, #ffffff)",
          borderColor: "var(--divider, rgba(0,0,0,0.12))",
          borderRadius: contentRadius,
          ...tertiaryBorder,
        }}
      >
        <Typography variant="h6" sx={{ mb: 0.5, color: "var(--text-primary, #1f2937)" }}>
          Welcome back
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--text-secondary, #374151)" }}>
          Explore how your palette affects key UI elements.
        </Typography>
        <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: "var(--primary-main, #4f68c5)",
              '&:hover': { bgcolor: "var(--primary-700, #2d4599)" },
              color: "var(--neutral-100, #ffffff)",
              borderRadius: contentRadius,
              border: "2px solid var(--tertiary-main, transparent)",
            }}
          >
            Primary
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "var(--secondary-main, #4f68c5)",
              '&:hover': { bgcolor: "var(--secondary-700, #2d4599)" },
              color: "var(--neutral-100, #ffffff)",
              borderRadius: contentRadius,
              border: "2px solid var(--tertiary-main, transparent)",
            }}
          >
            Secondary
          </Button>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr", gap: 1.5, mb: 1.5 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            bgcolor: "var(--bg-paper, #ffffff)",
            borderColor: "var(--divider, rgba(0,0,0,0.12))",
            borderRadius: contentRadius,
            ...tertiaryBorder,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <TrendingUp sx={{ color: "var(--primary-main, #4f68c5)" }} />
            <Typography variant="h6" sx={{ color: "var(--text-primary, #1f2937)" }}>
              Revenue
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "var(--text-primary, #1f2937)" }}>
            $12,345
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--text-secondary, #374151)" }}>
            +12% from last month
          </Typography>
        </Paper>
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            bgcolor: "var(--bg-paper, #ffffff)",
            borderColor: "var(--divider, rgba(0,0,0,0.12))",
            borderRadius: contentRadius,
            ...tertiaryBorder,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <People sx={{ color: "var(--secondary-main, #a351a9)" }} />
            <Typography variant="h6" sx={{ color: "var(--text-primary, #1f2937)" }}>
              Users
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "var(--text-primary, #1f2937)" }}>
            2,847
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--text-secondary, #374151)" }}>
            +8% from last month
          </Typography>
        </Paper>
      </Box>

      {/* Form Section */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          mb: 1.5,
          bgcolor: "var(--bg-paper, #ffffff)",
          borderColor: "var(--divider, rgba(0,0,0,0.12))",
          borderRadius: contentRadius,
          ...tertiaryBorder,
        }}
      >
        <Typography variant="h6" sx={{ mb: 1.5, color: "var(--text-primary, #1f2937)" }}>
          Contact Form
        </Typography>
        <Box sx={{ display: "flex", flexDirection: isPhone ? "column" : "row", gap: 2 }}>
          <TextField
            size="small"
            label="Name"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'var(--bg-paper, #ffffff)',
                borderRadius: contentRadius,
                '& fieldset': { borderColor: 'var(--divider, rgba(0,0,0,0.12))' },
                '&:hover fieldset': { borderColor: 'var(--primary-main, #4f68c5)' },
                '&.Mui-focused fieldset': { borderColor: 'var(--primary-main, #4f68c5)' },
              },
            }}
          />
          <TextField
            size="small"
            label="Email"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'var(--bg-paper, #ffffff)',
                borderRadius: contentRadius,
                '& fieldset': { borderColor: 'var(--divider, rgba(0,0,0,0.12))' },
                '&:hover fieldset': { borderColor: 'var(--secondary-main, #a351a9)' },
                '&.Mui-focused fieldset': { borderColor: 'var(--secondary-main, #a351a9)' },
              },
            }}
          />
          <Button
            variant="contained"
            sx={{
              bgcolor: "var(--primary-main, #4f68c5)",
              '&:hover': { bgcolor: "var(--primary-700, #2d4599)" },
              whiteSpace: "nowrap",
              color: 'var(--neutral-100, #ffffff)',
              borderRadius: contentRadius,
              border: "2px solid var(--tertiary-main, transparent)",
            }}
          >
            Save
          </Button>
        </Box>
      </Paper>

      {/* Data Table */}
      <Paper
        variant="outlined"
        sx={{
          p: 0,
          overflow: "hidden",
          bgcolor: "var(--bg-paper, #ffffff)",
          borderColor: "var(--divider, rgba(0,0,0,0.12))",
          borderRadius: contentRadius,
          mb: 1.5,
          ...tertiaryBorder,
        }}
      >
        <Box sx={{ px: 2, py: 1.5, bgcolor: "var(--neutral-300, #f2f2f2)", borderBottom: "1px solid", borderColor: "var(--divider, rgba(0,0,0,0.12))" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--text-primary, #1f2937)' }}>Recent Activity</Typography>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", px: 2, py: 1, bgcolor: "var(--neutral-200, #fafafa)", borderBottom: "1px solid", borderColor: "var(--divider, rgba(0,0,0,0.12))" }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>Item</Typography>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>Status</Typography>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>Action</Typography>
        </Box>
        {["Alpha", "Beta", "Gamma", "Delta"].map((row, i) => (
          <Box key={row} sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", px: 2, py: 1.5, borderTop: i === 0 ? "none" : "1px solid", borderColor: "var(--divider, rgba(0,0,0,0.12))", bgcolor: i % 2 ? 'transparent' : 'var(--neutral-200, #ffffff)' }}>
            <Typography variant="body2" sx={{ color: 'var(--text-primary, #1f2937)' }}>{row}</Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary, #374151)' }}>Active</Typography>
            <Button size="small" variant="outlined" sx={{ borderColor: "var(--secondary-main, #a351a9)", color: "var(--text-brandb, #772f7c)", '&:hover': { bgcolor: 'var(--neutral-300, #f2f2f2)' }, borderRadius: contentRadius }}>Edit</Button>
          </Box>
        ))}
      </Paper>

      {/* Feature Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: isPhone ? "1fr" : "repeat(3, 1fr)", gap: 1.5, mb: 1.5 }}>
        {[
          { icon: <Info />, title: "About", desc: "Learn more about us" },
          { icon: <Build />, title: "Services", desc: "What we offer" },
          { icon: <ShoppingCart />, title: "Shop", desc: "Browse products" },
        ].map((item, i) => (
          <Paper
            key={i}
            variant="outlined"
            sx={{
              p: 1.5,
              bgcolor: "var(--bg-paper, #ffffff)",
              borderColor: "var(--divider, rgba(0,0,0,0.12))",
              borderRadius: contentRadius,
              textAlign: "center",
              ...tertiaryBorder,
            }}
          >
            <Box sx={{ color: "var(--primary-main, #4f68c5)", mb: 1, display: "flex", justifyContent: "center" }}>
              {item.icon}
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "var(--text-primary, #1f2937)", mb: 0.5 }}>
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--text-secondary, #374151)" }}>
              {item.desc}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Footer CTA */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          bgcolor: "var(--bg-paper, #ffffff)",
          borderColor: "var(--divider, rgba(0,0,0,0.12))",
          borderRadius: contentRadius,
          textAlign: "center",
          ...tertiaryBorder,
        }}
      >
        <Phone sx={{ color: "var(--secondary-main, #a351a9)", fontSize: 40, mb: 1 }} />
        <Typography variant="h6" sx={{ color: "var(--text-primary, #1f2937)", mb: 1 }}>
          Get in Touch
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--text-secondary, #374151)", mb: 2 }}>
          Have questions? We're here to help!
        </Typography>
        <Button
          variant="contained"
          sx={{
            bgcolor: "var(--secondary-main, #a351a9)",
            '&:hover': { bgcolor: "var(--secondary-700, #772f7c)" },
            color: 'var(--neutral-100, #ffffff)',
            borderRadius: contentRadius,
            border: "2px solid var(--tertiary-main, transparent)",
          }}
        >
          Contact Us
        </Button>
      </Paper>
    </>
  );
}
