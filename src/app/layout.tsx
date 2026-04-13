import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,          // evita zoom acidental em formulários
  viewportFit: "cover",     // ativa safe-area no iOS (notch / home bar)
};

export const metadata: Metadata = {
  title: "PedeFree",
  description: "Cardápio digital e pedidos online para restaurantes e fast foods locais.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PedeFree",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "PedeFree",
    description: "Cardápio digital e pedidos online para restaurantes e fast foods locais.",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PedeFree" />
      </head>
      <body className={`${poppins.className} antialiased`}>{children}</body>
    </html>
  );
}
