import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import HeaderTop from "@/components/headers/HeaderTop";

import Cta from "@/components/common/Cta";
import Team from "@/components/homes/home-2/Team";
import SobreEscritorio from "@/components/otherPages/SobreEscritorio";
import Link from "next/link";
export const metadata = {
  title: "Sobre o escritório",
  description:
    "Conheça a equipe da Michelle Dantas Advocacia, em Americana/SP, e as áreas em que o escritório atua.",
  alternates: { canonical: "/sobre" },
};
export default function Page() {
  return (
    <>
      {/* <HeaderTop /> */}
      <Header1 />
      <main className="main position-relative" id="mains">
        <div className="breadcrumb-wrapper">
          <div
            className="breadcumb"
            data-bg-src=""
            style={{ backgroundImage: "url(/assets/img/hero/breadcumbBg.png)" }}
          >
            <div className="container">
              <div className="page-heading">
                <h1 className="wow fadeInUp" data-wow-delay=".3s">
                  Sobre o escritório
                </h1>
                <ul
                  className="breadcrumb-items wow fadeInUp"
                  data-wow-delay=".5s"
                >
                  <li>
                    <Link scroll={false} href={`/`}>
                      {" "}
                      Home{" "}
                    </Link>
                  </li>
                  <li>
                    <i className="fas fa-chevrons-right" />
                  </li>
                  <li>Sobre o escritório</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <SobreEscritorio />
        <Team />
        <div className="pb-300"></div>

        <Cta />
      </main>
      <Footer1 />
    </>
  );
}
