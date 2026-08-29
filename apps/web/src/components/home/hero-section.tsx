import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DecorativeMotif } from "@/components/brand/decorative-motif";
import { PageContainer } from "@/components/layout/page-container";
import { ICON_STROKE } from "@/lib/ui/icon-stroke";
import { cn } from "@/lib/utils/cn";

/** Full hero art: floral sides + bottom border + feathered dish (from assets/header). */
const HERO_BG_SRC = "/images/hero/header-bg.webp";

/**
 * Homepage hero — centered copy over patterned header art.
 */
export function HeroSection({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="home-hero-heading"
      className={cn("relative", className)}
    >
      <PageContainer
        width="wide"
        paddedY={false}
        className="py-4 sm:py-6 lg:py-8"
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl bg-surface-warm shadow-xs",
            "min-h-[22rem] sm:min-h-[26rem] lg:min-h-[28rem]",
          )}
        >
          <Image
            src={HERO_BG_SRC}
            alt=""
            fill
            priority
            className="object-cover object-[center_bottom] sm:object-center"
            sizes="100vw"
          />

          {/* Light veil only — keeps type readable without washing the art */}
          <div
            className="pointer-events-none absolute inset-0 bg-background/20"
            aria-hidden
          />

          <div
            className={cn(
              "relative z-10 flex min-h-[22rem] items-center justify-center sm:min-h-[26rem] lg:min-h-[28rem]",
              "px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12",
            )}
          >
            <div
              className={cn(
                "flex w-full max-w-md flex-col items-center gap-5 text-center motion-fade-up",
              )}
            >
              <div className="space-y-4 sm:space-y-5">
                <h1
                  id="home-hero-heading"
                  className={cn(
                    "text-balance font-bold tracking-tight",
                    "text-[2rem] leading-[1.25] sm:text-[2.45rem] sm:leading-[1.22] lg:text-[2.75rem] lg:leading-[1.18]",
                  )}
                >
                  <span className="block text-brand-navy">أكل بيت</span>
                  <span className="block text-brand-primary">يوصل لبابك</span>
                </h1>

                <div
                  className="mx-auto flex w-full max-w-[14rem] items-center gap-3"
                  aria-hidden
                >
                  <span className="h-px flex-1 bg-border-strong/50" />
                  <DecorativeMotif
                    variant="floral-corner"
                    density="subtle"
                    tone="navy"
                    className="size-5 shrink-0 text-brand-primary opacity-80"
                  />
                  <span className="h-px flex-1 bg-border-strong/50" />
                </div>

                <p className="typo-body-s mx-auto max-w-sm text-pretty text-text-muted sm:text-base sm:leading-[var(--leading-body)]">
                  أكلاتنا من قلب البيت العراقي، نختار الأفضل لعائلتك.
                </p>
              </div>

              <Link
                href="/menu"
                className={cn(
                  "inline-flex h-12 min-w-[10.5rem] items-center justify-center gap-2 rounded-2xl bg-brand-primary px-6 text-sm font-semibold text-on-primary sm:text-base",
                  "shadow-sm transition-[colors,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
                  "hover:bg-brand-primary-hover motion-safe:hover:-translate-y-px",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                )}
              >
                اطلب الآن
                <ArrowLeft
                  className="size-4"
                  strokeWidth={ICON_STROKE.emphasis}
                  aria-hidden
                />
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
