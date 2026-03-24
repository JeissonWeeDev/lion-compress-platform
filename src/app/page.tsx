import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { AppShell } from "./AppShell";

export default async function Home() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <>
      <Header />
      <main className="flex-1 py-12">
        <Container className="space-y-10">
          {/* Hero copy */}
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
              {dict.hero.title}{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--accent-gradient)" }}
              >
                {dict.hero.titleHighlight}
              </span>
            </h1>
            <p className="text-base text-text-secondary">{dict.hero.subtitle}</p>
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-4 pt-2 text-xs text-text-tertiary">
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-1.5 rounded-full bg-success" />
                {dict.hero.trustPrivacy}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-1.5 rounded-full bg-accent" />
                {dict.hero.trustHardware}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-1.5 rounded-full bg-purple-500" />
                {dict.hero.trustLimits}
              </span>
            </div>
          </div>

          {/* App shell (client-side interactive area) */}
          <AppShell />
        </Container>
      </main>
      <Footer />
    </>
  );
}
