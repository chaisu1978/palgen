import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export type DeviceVariant = "phone" | "browser";
export type ToolbarStyle = "light" | "dark";
export type ShadowDepth = "none" | "sm" | "md" | "lg";
export type NavigationStyle = "topbar" | "sidebar";

interface DeviceFrameProps {
  variant: DeviceVariant;
  radius?: number; // Not used for device frame, kept for API compatibility
  shadow?: ShadowDepth;
  showNotch?: boolean;
  toolbarStyle?: ToolbarStyle;
  navigationStyle?: NavigationStyle; // Not used in frame, kept for API compatibility
  logicalWidth: number;
  logicalHeight: number;
  children?: ReactNode;
}

export default function DeviceFrame({
  variant,
  shadow = "md",
  showNotch = true,
  toolbarStyle = "light",
  logicalWidth,
  logicalHeight,
  children,
}: DeviceFrameProps) {
  const shadowMap = {
    none: "none",
    sm: "0 2px 6px rgba(0,0,0,0.08)",
    md: "0 10px 24px rgba(0,0,0,0.18)",
    lg: "0 24px 48px rgba(0,0,0,0.28)",
  } as const;

  // Auto-scale logic
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  const logicalSize = useMemo(() => ({ w: logicalWidth, h: logicalHeight }), [logicalWidth, logicalHeight]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cw = entry.contentRect.width;
        const ch = entry.contentRect.height;
        // Compute scale to fit logical size within container
        const s = Math.max(0.1, Math.min(cw / logicalSize.w, ch / logicalSize.h));
        setScale(s);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [logicalSize.w, logicalSize.h]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: logicalWidth,
          height: logicalHeight,
          transform: `scale(${scale})`,
          transformOrigin: "center",
          willChange: "transform",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: logicalWidth,
            height: logicalHeight,
            borderRadius: variant === "phone" ? 6 : 2,
            boxShadow: shadowMap[shadow],
            bgcolor: "var(--bg-paper, #ffffff)",
            border: 1,
            borderColor: "var(--divider, rgba(0,0,0,0.12))",
            overflow: "hidden",
          }}
        >
        {variant === "phone" && showNotch && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: logicalWidth * 0.4,
              height: 24,
              bgcolor: "var(--neutral-900, #000)",
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              zIndex: 2,
            }}
          />
        )}

        {variant === "browser" && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 40,
              bgcolor:
                toolbarStyle === "light"
                  ? "var(--neutral-200, #ffffff)"
                  : "var(--neutral-900, #000000)",
              color:
                toolbarStyle === "light"
                  ? "var(--text-primary, #1f2937)"
                  : "var(--neutral-100, #ffffff)",
              display: "flex",
              alignItems: "center",
              px: 1.5,
              gap: 1,
              borderBottom: 1,
              borderColor: "var(--divider, rgba(0,0,0,0.12))",
            }}
          >
            <Box sx={{ display: "flex", gap: 0.75 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "error.main" }} />
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "warning.main" }} />
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "success.main" }} />
            </Box>
            <Box
              sx={{
                mx: 1,
                flex: 1,
                height: 26,
                borderRadius: 13,
                bgcolor:
                  toolbarStyle === "light"
                    ? "var(--neutral-300, #f2f2f2)"
                    : "var(--neutral-800, #181c2c)",
                border: 1,
                borderColor: "var(--divider, rgba(0,0,0,0.12))",
              }}
            />
          </Box>
        )}

        <Box
          sx={{
            position: "absolute",
            top: variant === "browser" ? 40 : 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {children}
        </Box>
        </Box>
      </Box>
    </Box>
  );
}
