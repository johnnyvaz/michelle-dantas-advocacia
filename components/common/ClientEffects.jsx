"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Efeitos de navegador que antes moravam no RootLayout. Ficam aqui para que o
// layout seja componente de servidor e possa exportar `metadata`.
export default function ClientEffects() {
  const path = usePathname();

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.esm");
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const topPos = window.scrollY || document.documentElement.scrollTop;
      const stickyWrapper = document.querySelector(".sticky-wrapper");
      if (topPos > 500) {
        stickyWrapper?.classList.add("sticky");
      } else {
        stickyWrapper?.classList.remove("sticky");
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    import("wowjs").then((module) => {
      const WOW = module.default;
      const wow = new WOW({ mobile: false, live: false });
      wow.init();
    });
  }, [path]);

  return null;
}
