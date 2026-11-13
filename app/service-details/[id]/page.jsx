import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import HeaderTop from "@/components/headers/HeaderTop";

import Cta from "@/components/common/Cta";
import ServiceDetails from "@/components/otherPages/service/ServiceDetails";
import Link from "next/link";
import { allService } from "@/data/services";
// Rota legada do template: o mesmo texto para todo id. Fica no ar para não quebrar
// links antigos, mas fora do índice; as páginas de verdade estão em /service/*.
export const metadata = {
  title: "Áreas de atuação",
  robots: { index: false, follow: true },
};
export default function Page({ params }) {
  const serviceItem =
    allService.filter((elm) => elm.id == params.id)[0] || allService[0];
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
                  {serviceItem.title}
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
                  <li>Services Details</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <ServiceDetails serviceItem={serviceItem} />
        <Cta />
      </main>
      <Footer1 />
    </>
  );
}
