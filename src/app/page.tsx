import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { AppShell } from "./AppShell";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 py-12">
        <Container className="space-y-10">
          {/* Hero copy */}
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
              Comprime imágenes y video.{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--accent-gradient)" }}
              >
                En tu navegador.
              </span>
            </h1>
            <p className="text-base text-text-secondary">
              Procesamiento 100% local. Tus archivos nunca salen de tu dispositivo.
            </p>
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-4 pt-2 text-xs text-text-tertiary">
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-1.5 rounded-full bg-success" />
                100% Privado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-1.5 rounded-full bg-accent" />
                Acelerado por hardware
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-1.5 rounded-full bg-purple-500" />
                Sin límites de tamaño
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
