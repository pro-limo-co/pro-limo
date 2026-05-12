import { ImageResponse } from "next/og";
import type { CSSProperties } from "react";

export const runtime = "edge";

const size = { width: 1200, height: 630 };
const rootStyle: CSSProperties = {
  height: "100%",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  background: "#0A0907",
  color: "#F2EEE5",
  fontFamily: "serif",
  padding: 80,
  position: "relative",
  backgroundImage:
    "radial-gradient(60% 40% at 50% 0%, rgba(200,169,106,0.18) 0%, transparent 60%), radial-gradient(80% 60% at 50% 110%, rgba(30,45,38,0.55) 0%, transparent 70%)",
};
const topLineStyle: CSSProperties = {
  position: "absolute",
  top: 80,
  left: 80,
  right: 80,
  height: 1,
  background: "rgba(242,238,229,0.18)",
};
const bottomLineStyle: CSSProperties = {
  position: "absolute",
  bottom: 80,
  left: 80,
  right: 80,
  height: 1,
  background: "rgba(242,238,229,0.18)",
};
const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingTop: 12,
};
const eyebrowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  letterSpacing: 2,
  fontSize: 22,
  textTransform: "uppercase",
  color: "#C9C3B8",
  fontFamily: "sans-serif",
};
const domainStyle: CSSProperties = {
  fontSize: 22,
  letterSpacing: 4,
  textTransform: "uppercase",
  color: "#8A847B",
  fontFamily: "sans-serif",
};
const titleRegionStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};
const titleStyle: CSSProperties = {
  fontSize: 96,
  lineHeight: 1.02,
  letterSpacing: -2,
  color: "#F2EEE5",
  fontStyle: "italic",
  fontWeight: 300,
  maxWidth: 920,
  display: "flex",
  flexWrap: "wrap",
};
const subtitleStyle: CSSProperties = {
  marginTop: 36,
  fontSize: 28,
  color: "#C9C3B8",
  fontFamily: "sans-serif",
};
const footerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingBottom: 8,
  color: "#8A847B",
  fontSize: 20,
  letterSpacing: 3,
  textTransform: "uppercase",
  fontFamily: "sans-serif",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Portland chauffeur service";
  const eyebrow = searchParams.get("eyebrow") ?? "Professional Limousine Driver";
  const subtitle =
    searchParams.get("subtitle") ?? "Airport pickup · Airport drop-off · Regional rides";

  return new ImageResponse(
    (
      <div style={rootStyle}>
        {/* Top hairline */}
        <div style={topLineStyle} />
        {/* Bottom hairline */}
        <div style={bottomLineStyle} />

        <div style={headerStyle}>
          <div style={eyebrowStyle}>
            <span style={{ display: "flex", color: "#C8A96A" }}>◆</span>
            {eyebrow}
          </div>
          <div style={domainStyle}>
            ProLimoDriver.com
          </div>
        </div>

        <div style={titleRegionStyle}>
          <div style={titleStyle}>
            {title}
          </div>
          <div style={subtitleStyle}>
            {subtitle}
          </div>
        </div>

        <div style={footerStyle}>
          <div style={{ display: "flex", gap: 32 }}>
            <span>Airport</span>
            <span>By the hour</span>
            <span>City to city</span>
            <span>For business</span>
          </div>
          <div style={{ display: "flex", color: "#C8A96A" }}>Reserve →</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
