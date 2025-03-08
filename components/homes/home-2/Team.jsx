"use client";
import { teamMembers } from "@/data/team";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import Image from "next/image";

export default function Team() {

  return (
    <section className="team-area">
      <div className="team-wrap style2 space fix">
        <div className="shape1_1">
          <Image
            alt="shape"
            src="/assets/img/shape/teamShape2_1.png"
            width="645"
            height="395"
          />
        </div>
        <div className="shape1_2 movingX d-xl-block d-none">
          <Image
            alt="shape"
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
                  alt="icon"
                  src="/assets/img/icon/titleIcon.png"
                  width="28"
                  height="12"
                />
              </span>{' '}
              OUR TEAM MEMBER{' '}
              <span>
                <Image
                  alt="icon"
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
              See Our Skilled Expert Team
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
              {teamMembers.map((member, index) => (
                <SwiperSlide className="swiper-slide mr-0" key={index}>
                  <div className="team-card style2">
                    <div className="team-thumb">
                      <Image
                        src={member.imgSrc}
                        width={246}
                        height={241}
                        alt="team-img"
                      />
                      <div className="social-profile">
                        <span className="plus-btn">
                          <i className="fas fa-share-alt" />
                        </span>
                        <ul>
                          <li>
                            <a href="https://www.facebook.com/">
                              <i className="fab fa-facebook-f" />
                            </a>
                          </li>
                          <li>
                            <a href="https://www.twitter.com/">
                              <i className="fab fa-twitter" />
                            </a>
                          </li>
                          <li>
                            <a href="https://www.linkedin.com/">
                              <i className="fa-brands fa-linkedin-in" />
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="team-content text-center">
                      <h3>
                        <Link
                          scroll={false}
                          href={`/team-details/${member.id}`}
                        >
                          {member.name}
                        </Link>
                      </h3>
                      <p>{member.position}</p>
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
