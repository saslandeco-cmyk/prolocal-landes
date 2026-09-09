"use client";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Force le retour en haut de la page de destination après un clic sur un
 * lien, où qu'il soit sur le site. Bien que Next.js gère nativement un
 * scroll-to-top par défaut sur la plupart des navigations, ce composant
 * garantit un comportement homogène et systématique quel que soit le
 * mécanisme de navigation utilisé (Link, router.push, redirection interne,
 * changement de paramètres d'URL, etc.).
 */
function ScrollToTopInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, searchParams]);

  return null;
}

export default function ScrollToTop() {
  return (
    <Suspense fallback={null}>
      <ScrollToTopInner />
    </Suspense>
  );
}
