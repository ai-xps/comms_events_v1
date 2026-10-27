import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gather — Birmingham Community Events",
  description: "A closed calendar for Birmingham community events.",
  icons: {
    icon: [{ url: "/brand/gather-mark.png", type: "image/png" }],
    apple: [{ url: "/brand/gather-mark.png", type: "image/png" }]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fdf2f0",
  /** Let iOS/iPadOS size the layout for notches, Dynamic Island, and home indicator. */
  interactiveWidget: "resizes-content"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
