"use client";
import Image from "next/image";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footers/Footer1";
import Cta from "@/components/common/Cta";

export default function ServicesDireitoFamilia() {
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
                                    Direito de Família
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
                                    <li>Direito de Família</li>
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
                                                        <a href="#">Direito Cível</a>
                                                    </li>
                                                    <li>
                                                        <a href="#">Direito Trabalhista</a>
                                                    </li>
                                                    <li>
                                                        <a href="#">Direito de Família</a>
                                                    </li>
                                                    <li>
                                                        <a href="#">Direito Previdenciário</a>
                                                    </li>
                                                    <li>
                                                        <a href="#">Direito Digital</a>
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
                                                        <i className="fa-regular fa-clock" />
                                                        Segunda a Sexta: 09:00 - 17:00
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
                                                Direito de Família
                                            </h3>
                                            <p className="mt-3 wow fadeInUp" data-wow-delay=".9s">
                                                Atuamos com sensibilidade e firmeza na resolução de
                                                conflitos familiares, como divórcios, pensões
                                                alimentícias, guarda e convivência de filhos, partilhas,
                                                reconhecimento de paternidade e união estável.
                                            </p>
                                            <p className="mt-3 wow fadeInUp" data-wow-delay="1.2s">
                                                Nosso objetivo é proteger os laços afetivos e
                                                patrimoniais, garantindo segurança jurídica para todas
                                                as partes envolvidas com empatia, respeito e
                                                profissionalismo.
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
                                                        Apoio jurídico completo em momentos delicados da
                                                        vida familiar.
                                                    </p>
                                                    <ul className="list ps-0">
                                                        <li>
                                                            <i className="fa-regular fa-circle-check" />{" "}
                                                            Acordos extrajudiciais e judiciais eficazes
                                                        </li>
                                                        <li>
                                                            <i className="fa-regular fa-circle-check" />{" "}
                                                            Garantia dos direitos de crianças e adolescentes
                                                        </li>
                                                        <li>
                                                            <i className="fa-regular fa-circle-check" />{" "}
                                                            Agilidade em processos de divórcio e guarda
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <p className="mb-40 wow fadeInUp" data-wow-delay="1.5s">
                                                Cada família é única, por isso oferecemos um atendimento
                                                acolhedor e personalizado, buscando sempre preservar os
                                                vínculos e minimizar os impactos emocionais e legais dos
                                                conflitos.
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
