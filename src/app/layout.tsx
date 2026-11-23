import type { Metadata } from "next";
import { Manrope, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pentagon Finances | Established in Switzerland",
  description:
    "Established in Switzerland. Experience premier EUR and multi-currency digital finance and wealth solutions, built around your life.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} ${ibmPlexMono.variable} antialiased h-full`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--text-primary)] selection:bg-brand-600/10 overflow-x-clip"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
