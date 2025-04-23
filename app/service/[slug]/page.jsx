import Image from "next/image";
import { getAllServices, getServiceBySlug } from "@/lib/services";
import Cta from "@/components/common/Cta";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footers/Footer1";

// SEO dinâmico opcional
export async function generateMetadata({ params }) {
    const service = getServiceBySlug(params.slug);
    return {
        title: `${service.title} | Michelle Dantas Advocacia`,
        description: service.excerpt || "",
    };
}

// Geração de caminhos estáticos
export async function generateStaticParams() {
    const services = getAllServices();
    return services.map((s) => ({ slug: s.slug }));
}

export default function ServicePage({ params }) {
    const service = getServiceBySlug(params.slug);
    const services = getAllServices();

    if (!service) return <div>Serviço não encontrado.</div>;

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
                                    {service.title}
                                </h1>
                                <ul className="breadcrumb-items wow fadeInUp" data-wow-delay=".5s">
                                    <li><a href="/">Home</a></li>
                                    <li><i className="fas fa-chevrons-right" /></li>
                                    <li>{service.title}</li>
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
                                            <div className="wid-title"><h3>Áreas de Atuação</h3></div>
                                            <div className="news-widget-categories">
                                                <ul>
                                                    {services.map((s, i) => (
                                                        <li key={i}>
                                                            <a href={`/service/${s.slug}`}>{s.title}</a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="single-sidebar-widget wow fadeInUp" data-wow-delay=".8s">
                                            <div className="wid-title"><h3>Horário de Atendimento</h3></div>
                                            <div className="opening-category">
                                                <ul>
                                                    <li><i className="fa-regular fa-clock" />Segunda a Sexta: 09:00 - 17:00</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div
                                            className="single-sidebar-image bg-cover wow fadeInUp"
                                            data-wow-delay="1s"
                                            style={{ backgroundImage: "url(/assets/img/service/serviceThumb3_5.png)" }}
                                        >
                                            <div className="contact-text">
                                                <div className="icon"><i className="fa-solid fa-phone" /></div>
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
                                                src={service.image || "/assets/img/service/serviceThumb3_1.png"}
                                                width={770}
                                                height={470}
                                            />
                                        </div>
                                        <div className="details-content">
                                            {service.content?.map((text, idx) => (
                                                <p className="mt-3 wow fadeInUp" key={idx}>
                                                    {text}
                                                </p>
                                            ))}

                                            <div className="details-video-items wow fadeInUp" data-wow-delay="1.3s">
                                                <div className="video-thumb">
                                                    <Image
                                                        alt="video"
                                                        src={service.videoThumb || "/assets/img/service/serviceThumb3_2.png"}
                                                        width={405}
                                                        height={257}
                                                    />
                                                </div>
                                                <div className="content">
                                                    <h4>Principais Benefícios</h4>
                                                    <p>
                                                        Com a nossa assessoria, você tem respaldo técnico <br />e jurídico em todas as etapas do processo.
                                                    </p>
                                                    <ul className="list ps-0">
                                                        {(service.benefits || []).map((b, i) => (
                                                            <li key={i}><i className="fa-regular fa-circle-check" /> {b}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="image-area wow fadeInUp" data-wow-delay="1.6s">
                                                <div className="row g-4">
                                                    {(service.extraImages || []).map((img, i) => (
                                                        <div className="col-lg-6 col-md-6" key={i}>
                                                            <div className="thumb">
                                                                <Image alt="img" src={img} width={370} height={307} />
                                                            </div>
                                                        </div>
                                                    ))}
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
