import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { DictionaryProvider } from "@/lib/i18n/context";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { Background } from "@/components/layout/Background";
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
    metadataBase: new URL("https://lioncompress.dev"),
    openGraph: {
      title: "LionMedia Compress",
      description: dict.hero.subtitle,
      url: "https://lioncompress.dev",
      siteName: "LionMedia Compress",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "LionMedia Compress",
      description: dict.hero.subtitle,
      images: ["/og-image.png"],
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary overflow-x-hidden">
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <Background />
          <DictionaryProvider dict={dict} locale={locale}>
            {children}
          </DictionaryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
