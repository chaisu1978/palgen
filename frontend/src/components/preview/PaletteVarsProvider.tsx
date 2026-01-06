import { Box } from "@mui/material";
import type { ReactNode, CSSProperties } from "react";
import { useMemo } from "react";

interface PaletteVarsProviderProps {
  palette: any;
  isTertiaryEnabled?: boolean;
  mode?: "light" | "dark";
  children?: ReactNode;
}

export default function PaletteVarsProvider({
  palette,
  isTertiaryEnabled = true,
  mode: _mode = "light",
  children,
}: PaletteVarsProviderProps) {
  const cssVars = useMemo(() => {
    if (!palette) return {} as Record<string, string>;
    const out: Record<string, string> = {};
    const keys = ["primary", "secondary", "neutral", ...(isTertiaryEnabled && palette.tertiary ? ["tertiary"] : [])];
    for (const key of keys) {
      const shades = palette[key]?.shades || {};
      for (const shade in shades) {
        const v = shades[shade]?.hex;
        if (v) out[`--${key}-${shade}`] = v;
      }
    }

    // Semantic variables aligned with light/dark theme defaults
    const get = (group: string, shade: string, fallback?: string) => {
      return (
        palette?.[group]?.shades?.[shade]?.hex ||
        out[`--${group}-${shade}`] ||
        fallback ||
        ""
      );
    };

    const isDark = _mode === "dark";
    // Brand mains
    out["--primary-main"] = get("primary", isDark ? "600" : "500", get("primary", "500", "#4f68c5"));
    out["--secondary-main"] = get("secondary", isDark ? "600" : "500", get("secondary", "500", "#a351a9"));
    if (isTertiaryEnabled && palette.tertiary) {
      out["--tertiary-main"] = get("tertiary", isDark ? "600" : "500", get("tertiary", "500", "#8fac38"));
    }

    // Backgrounds
    out["--bg-default"] = get("neutral", isDark ? "800" : "400", get("neutral", isDark ? "800" : "400", "#979db2"));
    out["--bg-paper"] = get("neutral", isDark ? "700" : "500", get("neutral", isDark ? "700" : "500", "#646b85"));

    // Text
    out["--text-primary"] = get("neutral", isDark ? "300" : "900", get("neutral", isDark ? "300" : "900", isDark ? "#e0e0e0" : "#1f2937"));
    out["--text-secondary"] = get("neutral", isDark ? "400" : "800", get("neutral", isDark ? "400" : "800", isDark ? "#cbd5e1" : "#374151"));

    // Brands in text
    out["--text-branda"] = get("primary", isDark ? "300" : "700", get("primary", isDark ? "300" : "700", "#7993f2"));
    out["--text-brandb"] = get("secondary", isDark ? "300" : "700", get("secondary", isDark ? "300" : "700", "#772f7c"));
    if (isTertiaryEnabled && palette.tertiary) {
      out["--text-brandc"] = get("tertiary", isDark ? "300" : "700", get("tertiary", isDark ? "300" : "700", "#667f1d"));
    }

    // Feedback colors (align to 500 for light, 600 for dark from theme files)
    out["--error-main"] = get("red", isDark ? "300" : "700", "#ed8e8e");
    out["--warning-main"] = get("orange", isDark ? "300" : "700", "#edb28e");
    out["--info-main"] = get("blue", isDark ? "300" : "700", "#8ec7ed");
    out["--success-main"] = get("green", isDark ? "300" : "700", "#8eeda4");

    // Divider
    out["--divider"] = get("neutral", isDark ? "500" : "700", get("neutral", isDark ? "500" : "700", "#646b85"));

    return out;
  }, [palette, isTertiaryEnabled, _mode]);

  return (
    <Box component="div" sx={{ position: "absolute", inset: 0 }} style={cssVars as CSSProperties}>
      {children}
    </Box>
  );
}
