import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border py-6">
      <Container className="flex flex-col items-center justify-between gap-3 text-xs text-text-tertiary sm:flex-row">
        <p>
          &copy; {new Date().getFullYear()} Lion Labs. Todos tus archivos se procesan localmente.
        </p>
        <p>
          Construido con Next.js · WebAssembly · WebCodecs
        </p>
      </Container>
    </footer>
  );
}
