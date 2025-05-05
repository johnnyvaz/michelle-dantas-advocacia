"use client";
import Image from "next/image";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footers/Footer1";
import Cta from "@/components/common/Cta";

export default function ServicesDireitoTrabalhista() {
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
                                    Direito Trabalhista
                                </h1>
                                <ul className="breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                                    <li><a href="/">Home</a></li>
                                    <li><i className="fas fa-chevrons-right" /></li>
                                    <li>Direito Trabalhista</li>
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
                                        <div className="single-sidebar-widget wow fadeInUp" data-wow-delay=".6s">
                                            <div className="wid-title">
                                                <h3>Áreas de Atuação</h3>
                                            </div>
                                            <div className="news-widget-categories">
                                                <ul>
                                                    <li><a href="#">Direito Cível</a></li>
                                                    <li><a href="#">Direito Trabalhista</a></li>
                                                    <li><a href="#">Direito de Família</a></li>
                                                    <li><a href="#">Direito Digital</a></li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="single-sidebar-widget wow fadeInUp" data-wow-delay=".8s">
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

                                        <div className="single-sidebar-image bg-cover wow fadeInUp" data-wow-delay="1s"
                                            style={{
                                                backgroundImage: "url(/assets/img/service/serviceThumb3_5.png)",
                                            }}>
                                            <div className="contact-text">
                                                <div className="icon">
                                                    <i className="fa-solid fa-phone" />
                                                </div>
                                                <h4>Entre em contato</h4>
                                                <h5><a href="tel:+5519992845413">(19) 99284-5413</a></h5>
                                                <h5><a href="tel:+551934065788">(19) 3406-5788</a></h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12 col-lg-8 order-1 order-md-2">
                                    <div className="service-details-items">
                                        <div className="details-image">
                                            <Image
                                                alt="img"
                                                src="/assets/img/hero/direito-trabalhista.png"
                                                width="770"
                                                height="470"
                                            />
                                        </div>
                                        <div className="details-content">
                                            <h3 className="wow fadeInUp" data-wow-delay=".6s">
                                                Direito Trabalhista
                                            </h3>
                                            <p className="mt-3 wow fadeInUp" data-wow-delay=".9s">
                                                Atuamos na defesa dos direitos de empregados e empregadores, oferecendo soluções jurídicas em casos de demissão, horas extras, acidentes de trabalho, assédio moral, verbas rescisórias, FGTS, entre outros.
                                            </p>
                                            <p className="mt-3 wow fadeInUp" data-wow-delay="1.2s">
                                                Nosso escritório busca conciliar e resolver conflitos trabalhistas com agilidade, sempre com foco na justiça, na ética e na proteção dos direitos previstos na legislação.
                                            </p>

                                            <div className="details-video-items wow fadeInUp" data-wow-delay="1.3s">
                                                <div className="content">
                                                    <h4>Principais Benefícios</h4>
                                                    <p>
                                                        Proteção jurídica tanto para empresas quanto para trabalhadores.
                                                    </p>
                                                    <ul className="list ps-0">
                                                        <li><i className="fa-regular fa-circle-check" /> Cálculos trabalhistas corretos e atualizados</li>
                                                        <li><i className="fa-regular fa-circle-check" /> Acompanhamento de ações na Justiça do Trabalho</li>
                                                        <li><i className="fa-regular fa-circle-check" /> Consultoria preventiva para empresas</li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <p className="mb-40 wow fadeInUp" data-wow-delay="1.5s">
                                                Conte com uma equipe preparada para orientar e representar você ou sua empresa com excelência no campo do Direito do Trabalho.
                                            </p>

                                            <div className="image-area wow fadeInUp" data-wow-delay="1.6s">
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
