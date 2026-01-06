import { Box, Button, Paper, Typography } from "@mui/material";
import { ShoppingCart, Info, Build, PlayCircle, ArrowForward, PhoneIphone } from "@mui/icons-material";

interface LandingLayoutProps {
  isPhone: boolean;
  contentRadius: string;
}

export default function LandingLayout({ isPhone, contentRadius }: LandingLayoutProps) {
  // Helper to add tertiary border if available
  const tertiaryBorder = {
    borderBottom: "4px solid var(--tertiary-main, transparent)",
  };

  return (
    <>
      {/* Hero Section */}
      <Paper
        variant="outlined"
        sx={{
          p: isPhone ? 2 : 4,
          mb: 1.5,
          bgcolor: "var(--primary-main, #4f68c5)",
          borderColor: "var(--divider, rgba(0,0,0,0.12))",
          borderRadius: contentRadius,
          ...tertiaryBorder,
          position: "relative",
          overflow: "hidden",
          minHeight: isPhone ? 240 : 370,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Diagonal split background with lighter primary color */}
        {!isPhone && (
          <Box
            sx={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "55%",
              bgcolor: "var(--secondary-main, rgba(255, 255, 255, 0.2))",
              clipPath: "polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)",
              zIndex: 0,
            }}
          />
        )}

        {/* Large product/service icon with rotation */}
        {!isPhone && (
          <Box
            sx={{
              position: "absolute",
              right: "15%",
              top: "50%",
              transform: "translateY(-50%) rotate(-8deg)",
              zIndex: 1,
            }}
          >
            <PhoneIphone
              sx={{
                fontSize: 280,
                color: "var(--primary-500, rgba(255, 255, 255, 0.25))",
                filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1))",
              }}
            />
          </Box>
        )}
        
        <Typography 
          variant={isPhone ? "h5" : "h4"} 
          sx={{ 
            mb: 1, 
            color: "var(--neutral-100, #ffffff)",
            fontWeight: 700,
            position: "relative",
            zIndex: 2,
          }}
        >
          Landing Page Wireframe
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: "var(--neutral-100, #ffffff)", 
            mb: 2,
            opacity: 0.95,
            maxWidth: isPhone ? "100%" : "45%",
            position: "relative",
            zIndex: 2,
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", position: "relative", zIndex: 2 }}>
          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            sx={{
              bgcolor: "var(--secondary-main, #a351a9)",
              '&:hover': { bgcolor: "var(--secondary-700, #772f7c)" },
              color: "var(--neutral-100, #ffffff)",
              borderRadius: contentRadius,
              fontWeight: 600,
              border: "2px solid var(--tertiary-main, transparent)",
            }}
          >
            Get Started
          </Button>
        </Box>
      </Paper>

      {/* Countdown Timer Section */}
      <Paper
        variant="outlined"
        sx={{
          p: isPhone ? 2 : 3,
          mb: 1.5,
          bgcolor: "var(--bg-paper, #ffffff)",
          borderColor: "var(--divider, rgba(0,0,0,0.12))",
          borderRadius: contentRadius,
          textAlign: "center",
          ...tertiaryBorder,
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, color: "var(--text-brandb, #1f2937)", fontWeight: 600 }}>
          Limited Time Offer
        </Typography>
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
          {["01", "12", "42", "36"].map((num, i) => (
            <Box key={i}>
              <Paper
                elevation={0}
                sx={{
                  px: isPhone ? 1.5 : 2,
                  py: isPhone ? 1 : 1.5,
                  bgcolor: "var(--bg-default, #f2f2f2)",
                  borderRadius: contentRadius,
                  minWidth: isPhone ? 40 : 50,
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    bgcolor: "var(--tertiary-main, transparent)",
                    opacity: 0.3,
                    pointerEvents: "none",
                  },
                }}
              >
                <Typography variant={isPhone ? "h6" : "h5"} sx={{ fontWeight: 700, color: "var(--text-brandb, #1f2937)" }}>
                  {num}
                </Typography>
              </Paper>
              <Typography variant="caption" sx={{ color: "var(--text-brandb, #374151)", mt: 0.5, display: "block" }}>
                {["Days", "Hours", "Mins", "Secs"][i]}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Our Opportunities Section */}
      <Paper
        variant="outlined"
        sx={{
          p: isPhone ? 2 : 3,
          mb: 1.5,
          bgcolor: "var(--bg-paper, #ffffff)",
          borderColor: "var(--divider, rgba(0,0,0,0.12))",
          borderRadius: contentRadius,
          ...tertiaryBorder,
        }}
      >
        <Typography variant="h6" sx={{ mb: 1.5, color: "var(--text-primary, #1f2937)", fontWeight: 600 }}>
          Our Opportunities
        </Typography>
        <Box>
          <Typography variant="body2" sx={{ color: "var(--text-secondary, #374151)", mb: 1 }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--text-secondary, #374151)", mb: 1.5 }}>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: isPhone ? "1fr 1fr" : "repeat(4, 1fr)", gap: 1.5, maxWidth: isPhone ? "100%" : "100%" }}>
            {[1, 2, 3, 4].map((i) => (
              <Paper
                key={i}
                elevation={0}
                sx={{
                  p: 0,
                  bgcolor: "var(--secondary-main, #f2f2f2)",
                  opacity: 0.5,
                  borderRadius: contentRadius,
                  aspectRatio: "1",
                }}
              />
            ))}
          </Box>
        </Box>
      </Paper>



      {/* Video Section */}
      <Paper
        variant="outlined"
        sx={{
          p: 0,
          mb: 1.5,
          bgcolor: "var(--secondary-main, #f2f2f2)",
          borderColor: "var(--divider, rgba(0,0,0,0.12))",
          borderRadius: contentRadius,
          overflow: "hidden",
          aspectRatio: isPhone ? "16/9" : "21/9",
          display: "flex",
          alignItems: "center",
          opacity: 0.4,
          justifyContent: "center",
          ...tertiaryBorder,
        }}
      >
        <PlayCircle sx={{ fontSize: isPhone ? 80 : 120, color: "var(--info-main, #4f68c5)" }} />
      </Paper>


      {/* Feature Grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: isPhone ? "1fr" : "repeat(3, 1fr)", gap: 1.5, mb: 1.5 }}>
        {[
          { Icon: Info, title: "Feature One" },
          { Icon: Build, title: "Feature Two" },
          { Icon: ShoppingCart, title: "Feature Three" },
        ].map((item, i) => (
          <Paper
            key={i}
            variant="outlined"
            sx={{
              p: 0,
              bgcolor: "var(--bg-paper, #f2f2f2)",
              borderColor: "var(--divider, rgba(0,0,0,0.12))",
              borderRadius: contentRadius,
              overflow: "hidden",
              aspectRatio: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...tertiaryBorder,
            }}
          >
            <item.Icon 
              sx={{ 
                color: "var(--text-brandb, #4f68c5)", 
                // opacity: 0.9, 
                fontSize: isPhone ? 100 : 120
              }} 
            />
          </Paper>
        ))}
      </Box>


      {/* Testimonials Section */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="h6" sx={{ mb: 1.5, color: "var(--text-primary, #1f2937)", fontWeight: 600, textAlign: "center" }}>
          Testimonials
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: isPhone ? "1fr" : "repeat(3, 1fr)", gap: 1.5 }}>
          {[1, 2, 3].map((i) => (
            <Paper
              key={i}
              variant="outlined"
              sx={{
                p: 1.5,
                bgcolor: "var(--bg-paper, #ffffff)",
                borderColor: "var(--divider, rgba(0,0,0,0.12))",
                borderRadius: contentRadius,
                ...tertiaryBorder,
              }}
            >
              <Typography variant="body2" sx={{ color: "var(--text-secondary, #374151)", mb: 1, fontSize: "0.8rem" }}>
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor."
              </Typography>
              <Typography variant="caption" sx={{ color: "var(--text-primary, #1f2937)", fontWeight: 600 }}>
                - Customer {i}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Footer CTA */}
      <Paper
        variant="outlined"
        sx={{
          p: isPhone ? 2 : 3,
          bgcolor: "var(--bg-paper, #ffffff)",
          borderColor: "var(--divider, rgba(0,0,0,0.12))",
          borderRadius: contentRadius,
          textAlign: "center",
          ...tertiaryBorder,
        }}
      >
        <Typography variant="h6" sx={{ color: "var(--text-primary, #1f2937)", mb: 1, fontWeight: 600 }}>
          Get Started
        </Typography>
        <Typography variant="body2" sx={{ color: "var(--text-secondary, #374151)", mb: 2 }}>
          Ready to begin your journey? Click below to get started.
        </Typography>
        <Button
          variant="contained"
          sx={{
            bgcolor: "var(--secondary-main, #4f68c5)",
            '&:hover': { bgcolor: "var(--secondary-700, #2d4599)" },
            color: 'var(--neutral-100, #ffffff)',
            borderRadius: contentRadius,
            fontWeight: 600,
            mr: 2,
            border: "2px solid var(--tertiary-main, transparent)",
          }}
        >
          Start Now
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: "var(--primary-main, #4f68c5)",
            '&:hover': { bgcolor: "var(--primary-700, #2d4599)" },
            color: 'var(--neutral-100, #ffffff)',
            borderRadius: contentRadius,
            fontWeight: 600,
            border: "2px solid var(--tertiary-main, transparent)",
          }}
        >
          Learn More
        </Button>
      </Paper>
    </>
  );
}
