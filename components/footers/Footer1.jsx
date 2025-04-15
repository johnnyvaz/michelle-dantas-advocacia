"use client";
import Link from "next/link";
import Image from "next/image";
import { recentPosts } from "@/data/blogs";
import { socialLinks2 } from "@/data/socials";
import { footerLinks } from "@/data/footer";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useRef } from "react";

export default function Footer1() {
  const form = useRef();

  const sandMail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm("service_noj8796", "template_fs3xchn", form.current, {
        publicKey: "iG4SCmR-YtJagQ4gV",
      })
      .then((res) => {
        if (res.status == 200) {
          toast.success("Message Sent successfully!", {
            position: "bottom-left",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          form.current.reset();
        } else {
          toast.error("Ops Message not Sent!", {
            position: "bottom-left",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
      });
  };
  return (
    <footer
      className="footer-area"
      style={{
        backgroundImage: "url(/assets/img/bg/footerBg1.png)",
      }}
    >
      <div className="widget-area style1 pt-100 pb-80">
        <div className="shape2_1">
          <Image
            src="/assets/img/shape/footerShape1_1.png"
            width={361}
            height={372}
            alt="shape"
          />
        </div>
        <div className="shape2_2">
          <Image
            src="/assets/img/shape/footerShape2_2.png"
            width={288}
            height={383}
            alt="shape"
          />
        </div>
        <div className="container">
          <div className="footer-layout style1">
            <div className="row">
              <div className="col-xl-3 col-md-6 col-12">
                <div
                  className="widget footer-widget wow fadeInUp"
                  data-wow-delay=".6s"
                >
                  <div className="gt-widget-about">
                    <div className="about-logo">
                      <Link scroll={false} href={`/`}>
                        <Image
                          src="/assets/img/logo-white.png"
                          width={199}
                          height={42}
                          alt="Michelle Dantas Advocacia"
                        />
                      </Link>
                    </div>
                    <p className="about-text">
                      Michelle Dantas Advocacia - Excelência em advocacia com foco em resultados. 
                      Atendimento personalizado e compromisso com a ética profissional.
                    </p>
                    <div className="gt-social style2">
                      {socialLinks2.map((link, index) => (
                        <a href={link.href} key={index}>
                          <i className={link.iconClass} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-md-6 col-12">
                <div
                  className="widget widget_nav_menu footer-widget wow fadeInUp"
                  data-wow-delay="1s"
                >
                  <h3 className="widget_title">Links Rápidos</h3>
                  <div className="menu-all-pages-container">
                    <ul className="menu">
                      {footerLinks.map((item, index) => (
                        <li key={index}>
                          <Link scroll={false} href={item.href}>
                            <i className="fa-solid fa-chevrons-right" />
                            {item.text}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-md-6 col-12">
                <div
                  className="widget footer-widget wow fadeInUp"
                  data-wow-delay="1.3s"
                >
                  <h3 className="widget_title">Contato</h3>
                  <div className="checklist">
                    <ul className="ps-0">
                      <li className="text-white">
                        <i className="fa-thin fa-envelope" />
                      </li>
                      <li className="text-white">contato@mdantas.adv.br</li>
                    </ul>
                    <ul className="ps-0">
                      <li className="text-white">
                        <i className="fa-light fa-phone-volume" />
                      </li>
                      <li className="text-white">(19) 99284-5413</li>
                    </ul>
                    <ul className="ps-0">
                      <li className="text-white">
                        <i className="fa-light fa-location-dot" />
                      </li>
                      <li className="text-white">R. Uruguai, 853 - Vila Frezzarim, Americana - SP, 13465-680</li>
                    </ul>
                    {/* <form
                      ref={form}
                      onSubmit={sandMail}
                      className="email-input-container"
                    >
                      <input
                        type="email"
                        id="email"
                        placeholder="Seu endereço de email"
                        required
                      />
                      <button type="submit" id="submitButton">
                        <i className="fa-regular fa-arrow-right-long" />
                      </button>
                    </form> */}
                    {/* <form id="termsForm">
                      <label className="custom-checkbox">
                        <input
                          type="checkbox"
                          name="agree"
                          id="agreeCheckbox"
                        />
                        <span className="checkmark" />Eu concordo com a{" "}
                        <Link
                          scroll={false}
                          className="text-underline"
                          href={`/politica-privacidade`}
                        >
                          Política de Privacidade.
                        </Link>
                      </label>
                      <br />
                    </form> */}
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6 col-12">
                <div
                  className="widget footer-widget wow fadeInUp"
                  data-wow-delay="1.6s"
                >
                  <h3 className="widget_title">CNPJ</h3>
                  <div className="checklist">
                    <ul className="ps-0">
                      <li className="text-white">
                        <i className="fa-light fa-building" />
                      </li>
                      <li className="text-white">51.721.550/0001-30</li>
                    </ul>
                    <ul className="ps-0">
                      <li className="text-white">
                        <i className="fa-light fa-file-signature" />
                      </li>
                      <li className="text-white">MICHELLE DANTAS SANCHES SOCIEDADE INDIVIDUAL DE ADVOCACIA</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="copyright-wrap bg-theme">
        <div className="container">
          <div className="copyright-layout">
            <div className="layout-text wow fadeInUp" data-wow-delay=".3s">
              <p className="copyright">
                <i className="fal fa-copyright" /> Todos os direitos reservados {new Date().getFullYear()} por
                <Link scroll={false} href={`/`}>
                  Michelle Dantas Advocacia
                </Link>
              </p>
            </div>
            <div className="layout-link wow fadeInUp" data-wow-delay=".6s">
              <div className="link-wrapper">
                <Link scroll={false} href={`/termos-uso`}>
                  Termos de Uso{" "}
                </Link>
                <Link scroll={false} href={`/politica-privacidade`}>
                  Política de Privacidade
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
