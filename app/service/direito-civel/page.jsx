"use client";
import Image from "next/image";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footers/Footer1";
import Cta from "@/components/common/Cta";

export default function ServicesDireitoCivel() {
    return (
        <>
            <Header1 />
            <main className="main position-relative" id="mains">
                <div className="breadcrumb-wrapper">
                    <div
                        className="breadcumb"
                        style={{ backgroundImage: "url(/assets/img/hero/breadcumbBg.png)" }}
                    >
                        <div className="container">
                            <div className="page-heading">
                                <h1 className="wow fadeInUp" data-wow-delay=".3s">
                                    Assessoria Cível
                                </h1>
                                <ul
                                    className="breadcrumb-items wow fadeInUp"
                                    data-wow-delay=".5s"
                                >
                                    <li>
                                        <a href="/">Home</a>
                                    </li>
                                    <li>
                                        <i className="fas fa-chevrons-right" />
                                    </li>
                                    <li>Assessoria Cível</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="service-details-section space-top pb-425 fix">
                    <div className="container">
                        <div className="service-details-wrapper">
                            <div className="row g-4">
                                <div className="col-12 col-lg-4 order-2 order-md-1">
                                    <div className="main-sidebar">
                                        <div
                                            className="single-sidebar-widget wow fadeInUp"
                                            data-wow-delay=".6s"
                                        >
                                            <div className="wid-title">
                                                <h3>Áreas de Atuação</h3>
                                            </div>
                                            <div className="news-widget-categories">
                                                <ul>
                                                    <li>
                                                        <a href="/service/direito-civel">Direito Cível</a>
                                                    </li>
                                                    <li>
                                                        <a href="/service/direito-trabalhista">Direito Trabalhista</a>
                                                    </li>
                                                    <li>
                                                        <a href="/service/direito-familia">Direito de Família</a>
                                                    </li>
                                                    <li>
                                                        <a href="/service/direito-previdenciario">Direito Previdenciário</a>
                                                    </li>
                                                    <li>
                                                        <a href="/service/direito-digital">Direito Digital</a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div
                                            className="single-sidebar-widget wow fadeInUp"
                                            data-wow-delay=".8s"
                                        >
                                            <div className="wid-title">
                                                <h3>Horário de Atendimento</h3>
                                            </div>
                                            <div className="opening-category">
                                                <ul>
                                                    <li>
                                                        <i className="fa-regular fa-clock" />Segunda a Sexta: 09:00 - 17:00
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div
                                            className="single-sidebar-image bg-cover wow fadeInUp"
                                            data-wow-delay="1s"
                                            style={{
                                                backgroundImage:
                                                    "url(/assets/img/service/serviceThumb3_5.png)",
                                            }}
                                        >
                                            <div className="contact-text">
                                                <div className="icon">
                                                    <i className="fa-solid fa-phone" />
                                                </div>
                                                <h4>Entre em contato</h4>
                                                <h5>
                                                    <a href="tel:+5519992845413">(19) 99284-5413</a>
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12 col-lg-8 order-1 order-md-2">
                                    <div className="service-details-items">
                                        <div className="details-image">
                                            <Image
                                                alt="img"
                                                src="/assets/img/service/serviceThumb3_1.png"
                                                width="770"
                                                height="470"
                                            />
                                        </div>
                                        <div className="details-content">
                                            <h3 className="wow fadeInUp" data-wow-delay=".6s">
                                                Assessoria Jurídica Cível
                                            </h3>
                                            <p className="mt-3 wow fadeInUp" data-wow-delay=".9s">
                                                A Assessoria Cível é voltada à prevenção e resolução de
                                                conflitos que envolvem direitos e obrigações entre
                                                pessoas físicas e jurídicas, como contratos,
                                                indenizações, responsabilidade civil e disputas
                                                patrimoniais.
                                            </p>
                                            <p className="mt-3 wow fadeInUp" data-wow-delay="1.2s">
                                                Atuamos de forma estratégica, com foco na resolução
                                                eficiente e segura dos litígios, buscando soluções
                                                judiciais e extrajudiciais que melhor atendam aos
                                                interesses de nossos clientes, sempre com transparência,
                                                ética e agilidade.
                                            </p>

                                            <div
                                                className="details-video-items wow fadeInUp"
                                                data-wow-delay="1.3s"
                                            >
                                                <div className="video-thumb">
                                                    <Image
                                                        alt="img"
                                                        src="/assets/img/service/serviceThumb3_2.png"
                                                        width="405"
                                                        height="257"
                                                    />
                                                    <a
                                                        className="play-btn popup-video"
                                                        onClick={(e) => e.preventDefault()}
                                                    >
                                                        <i className="fa-sharp fa-solid fa-play" />
                                                    </a>
                                                </div>
                                                <div className="content">
                                                    <h4>Principais Benefícios</h4>
                                                    <p>
                                                        Com a nossa assessoria, você tem respaldo técnico{" "}
                                                        <br />e jurídico em todas as etapas do processo.
                                                    </p>
                                                    <ul className="list ps-0">
                                                        <li>
                                                            <i className="fa-regular fa-circle-check" />{" "}
                                                            Redução de riscos e litígios futuros
                                                        </li>
                                                        <li>
                                                            <i className="fa-regular fa-circle-check" />{" "}
                                                            Orientação estratégica e personalizada
                                                        </li>
                                                        <li>
                                                            <i className="fa-regular fa-circle-check" />{" "}
                                                            Atuação ágil na defesa dos seus direitos
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <p className="mb-40 wow fadeInUp" data-wow-delay="1.5s">
                                                Nosso compromisso é garantir que cada cliente se sinta
                                                amparado, compreenda os caminhos legais disponíveis e
                                                tenha total segurança nas decisões tomadas ao longo do
                                                processo.
                                            </p>

                                            <div
                                                className="image-area wow fadeInUp"
                                                data-wow-delay="1.6s"
                                            >
                                                <div className="row g-4">
                                                    <div className="col-lg-6 col-md-6">
                                                        <div className="thumb">
                                                            <Image
                                                                alt="img"
                                                                src="/assets/img/service/serviceThumb3_3.png"
                                                                width="370"
                                                                height="307"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6 col-md-6">
                                                        <div className="thumb">
                                                            <Image
                                                                alt="img"
                                                                src="/assets/img/service/serviceThumb3_4.png"
                                                                width="370"
                                                                height="307"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Cta />
            </main>
            <Footer1 />
        </>
    );
}
