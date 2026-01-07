"use client";
import MobileNav from "@/components/headers/MobileNav";
import "../public/assets/scss/styles.scss";
import "react-modal-video/css/modal-video.css";
import { useEffect } from "react";
import SiteMenu from "@/components/headers/SiteMenu";
import ScrollTop from "@/components/common/ScrollTop";
import CursorFollor from "@/components/common/CursorFollor";
import { usePathname } from "next/navigation";
import { ToastContainer } from "react-toastify";
import PopupSearch from "@/components/headers/PopupSearch";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const path = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("bootstrap/dist/js/bootstrap.esm");
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", function () {
      const topPos = window.scrollY || document.documentElement.scrollTop;
      const stickyWrapper = document.querySelector(".sticky-wrapper");

      if (topPos > 500) {
        stickyWrapper?.classList.add("sticky");
      } else {
        stickyWrapper?.classList.remove("sticky");
      }
    });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  
    import("wowjs").then((module) => {
      const WOW = module.default;
      const wow = new WOW({ mobile: false, live: false });
      wow.init();
    });
  }, [path]);
  

  return (
    <html lang="pt-BR" className="bg-white">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/fontawesome.min.css" />
        <link rel="stylesheet" href="/assets/css/animate.css" />
        <link rel="stylesheet" href="/assets/css/magnific-popup.min.css" />
        <link rel="stylesheet" href="/assets/css/swiper-bundle.min.css" />

        {/* Script do Chatwoot */}
        <Script id="chatwoot" strategy="afterInteractive">
          {`
            (function(d,t) {
              var BASE_URL="https://mdantas.cod2d.com.br";
              var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
              g.src=BASE_URL+"/packs/js/sdk.js";
              g.defer = true;
              g.async = true;
              s.parentNode.insertBefore(g,s);
              g.onload=function(){
                window.chatwootSDK.run({
                  websiteToken: 'BayffjTGqx77qea5kphPDhan',
                  baseUrl: BASE_URL
                });
              }
            })(document,"script");
          `}
        </Script>


      </head>

      <body className={inter.className}>
        <SiteMenu />
        <MobileNav />
        <PopupSearch />
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        {children}
        <CursorFollor />
        <ScrollTop />


      </body>
    </html>
  );
}
