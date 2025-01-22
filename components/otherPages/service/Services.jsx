import { serviceItems } from "@/data/services";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Services() {
  return (
    <section className="all-services-area space-top">
      <div className="container">
        <div className="row">
          {serviceItems.map((item, index) => (
            <div
              key={index}
              className={`col-12 col-md-6 col-xl-3 ${
                index === 5 || index === 7 ? "wow fadeInUp" : ""
              }`}
              data-wow-delay={item.delay}
            >
              <div
                className={`service-card style3 ${index === 7 ? "mb-0" : ""}`}
              >
                <div className="card_icon">
                  <Image src={item.imgSrc} width={40} height={40} alt="icon" />
                </div>
                <div className="card_content">
                  <h3>
                    <Link
                      scroll={false}
                      href={`/service-details/${item.id}`}
                      className="title"
                    >
                      {item.title}
                    </Link>
                  </h3>
                  <p className="text">{item.text}</p>
                </div>
                <div className="link-wrap">
                  <Link scroll={false} href={`/service-details/${item.id}`}>
                    More Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
