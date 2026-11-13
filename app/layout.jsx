import MobileNav from "@/components/headers/MobileNav";
import "../public/assets/scss/styles.scss";
import "react-modal-video/css/modal-video.css";
import SiteMenu from "@/components/headers/SiteMenu";
import ScrollTop from "@/components/common/ScrollTop";
import CursorFollor from "@/components/common/CursorFollor";
import ClientEffects from "@/components/common/ClientEffects";
import { ToastContainer } from "react-toastify";
import PopupSearch from "@/components/headers/PopupSearch";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ESCRITORIO, SITE_URL, legalServiceJsonLd } from "@/lib/site";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Advogada em Americana/SP | Michelle Dantas Advocacia",
    template: "%s | Michelle Dantas Advocacia",
  },
  description:
    "Escritório em Americana/SP com atuação em Direito Cível, Trabalhista, de Família, Digital e ações contra planos de saúde.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: ESCRITORIO.nome,
    images: [{ url: "/assets/img/logo-dark.png" }],
  },
};

export default function RootLayout({ children }) {
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(legalServiceJsonLd()) }}
        />

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
        <ClientEffects />
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
