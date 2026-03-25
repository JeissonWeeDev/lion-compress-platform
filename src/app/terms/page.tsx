"use client";

import { Container } from "@/components/layout/Container";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Background } from "@/components/layout/Background";
import { useDict } from "@/lib/i18n/context";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
  const dict = useDict();

  return (
    <div className="relative flex min-h-screen flex-col bg-bg-default text-text-primary selection:bg-accent/30">
      <Background />
      <Header />
      
      <main className="flex-1 py-16 sm:py-24">
        <Container className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link 
              href="/" 
              className="mb-8 inline-flex items-center gap-2 text-xs font-medium text-text-tertiary transition-colors hover:text-accent"
            >
              <ArrowLeft size={14} />
              {dict.legal.backHome}
            </Link>

            <header className="mb-12 space-y-4">
              <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <FileText size={24} />
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                {dict.legal.termsTitle}
              </h1>
              <p className="text-sm text-text-tertiary">
                {dict.legal.lastUpdated}
              </p>
            </header>

            <div className="prose prose-sm prose-invert max-w-none space-y-10 text-text-secondary">
              <section className="space-y-4">
                <p className="text-lg leading-relaxed text-text-primary">
                  {dict.legal.termsContent.intro}
                </p>
              </section>

              <section className="space-y-6">
                <div className="grid gap-4">
                  {dict.legal.termsContent.points.map((point: string, i: number) => (
                    <div 
                      key={i}
                      className="flex items-start gap-4 rounded-2xl border border-border bg-bg-elevated/50 p-5 transition-colors hover:border-accent/20"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">
                        0{i + 1}
                      </span>
                      <p className="text-sm leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </section>

              <footer className="pt-10">
                <p className="text-[11px] leading-loose opacity-50">
                  {dict.footer.privacy} {dict.privacy.noteHighlight}
                </p>
              </footer>
            </div>
          </motion.div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
