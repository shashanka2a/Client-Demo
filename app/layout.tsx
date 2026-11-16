import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import { KmzProvider } from "@/contexts/kmz-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "UtilityVision | Client Demo",
    template: "%s | UtilityVision",
  },
  description:
    "Interactive product demo showcasing the UtilityVision client-facing portal capabilities, solar site progress, health watchlists, and certified reports.",
  keywords: ["UtilityVision", "Client Demo", "solar farm", "client portal", "utility vegetation management"],
  authors: [{ name: "UtilityVision" }],
  openGraph: {
    title: "UtilityVision | Client Demo",
    description: "Interactive product demo showcasing the UtilityVision client-facing portal capabilities.",
    type: "website",
    siteName: "UtilityVision",
    images: [
      {
        url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=630&fit=crop&auto=format",
        width: 1200,
        height: 630,
        alt: "UtilityVision Client Demo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UtilityVision | Client Demo",
    description: "Interactive product demo showcasing the UtilityVision client-facing portal capabilities.",
    images: ["https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=630&fit=crop&auto=format"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <KmzProvider>{children}</KmzProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
