import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LionMedia Compress — Comprime imágenes y video en tu navegador",
  description:
    "Comprime imágenes (JPG, PNG, WebP, AVIF) y video (MP4, WebM) directamente en tu navegador. 100% privado, gratuito, sin límites. Acelerado por WebAssembly y WebCodecs.",
  keywords: [
    "compresor de imágenes",
    "comprimir video online",
    "compresión sin subir archivos",
    "privacidad",
    "WebAssembly",
    "client-side compression",
  ],
  metadataBase: new URL("https://lioncompress.dev"),
  openGraph: {
    title: "LionMedia Compress",
    description: "Compresión de imágenes y video. En tu navegador. Gratis.",
    url: "https://lioncompress.dev",
    siteName: "LionMedia Compress",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LionMedia Compress",
    description: "Compresión de imágenes y video. En tu navegador. Gratis.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary">
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
