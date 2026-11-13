"use client";
import { teamMembers2, teamMembers2b } from "@/data/team";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

export default function Team() {

  return (
    <section className="team-area">
      <div className="team-wrap style2 space fix">
        <div className="shape1_1">
          <Image
            alt=""
            src="/assets/img/shape/teamShape2_1.png"
            width="645"
            height="395"
          />
        </div>
        <div className="shape1_2 movingX d-xl-block d-none">
          <Image
            alt=""
            src="/assets/img/shape/teamShape2_2.png"
            width="248"
            height="321"
          />
        </div>
        <div className="container">
          <div className="title-area mx-auto">
            <h5
              className="subtitle text-center wow fadeInUp"
              data-wow-delay=".3s"
            >
              <span>
                <Image
                  alt=""
                  src="/assets/img/icon/titleIcon.png"
                  width="28"
                  height="12"
                />
              </span>{' '}
              NOSSA EQUIPE{' '}
              <span>
                <Image
                  alt=""
                  src="/assets/img/icon/titleIcon.png"
                  width="28"
                  height="12"
                />
              </span>
            </h5>
            <h2
              className="title text-center mb-50 wow fadeInUp"
              data-wow-delay=".6s"
            >
              Conheça Nossa Equipe Especializada
            </h2>
          </div>
          <div className="slider-area">
            <Swiper
            breakpoints={{
              0: { slidesPerView: 1 },
              576: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              992: { slidesPerView: 3 },
              1200: { slidesPerView: 4 },
            }}
            loop
              spaceBetween={30}
              className="swiper gt-slider team-slider pb-4 px-1"
            >
              {[...teamMembers2, ...teamMembers2b].map((member, index) => (
                <SwiperSlide className="swiper-slide mr-0" key={index}>
                  <div className="team-card style2">
                    <div className="team-thumb">
                      <Image
                        src={member.imgSrc}
                        width={246}
                        height={241}
                        alt={`${member.name}, ${member.role}`}
                      />
                    </div>
                    <div className="team-content text-center">
                      <h3>{member.name}</h3>
                      <p>{member.role}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
