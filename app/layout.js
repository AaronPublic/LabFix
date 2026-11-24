import "./globals.css";

export const metadata = {
  title: "LabFix · Computer Lab Issue Reporting",
  description: "Report broken computers in the university computer labs.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#172c6b", // school blue (brand-900), colors the phone's browser bar
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
