import { teamMembers2 } from "@/data/team";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Team() {
  return (
    <section className="team-area space fix">
      <div className="team-wrap style1">
        <div className="shape1_1">
          <Image
            alt="shape"
            src="/assets/img/shape/teamShape1_1.png"
            width="440"
            height="879"
          />
        </div>
        <div className="shape1_2 movingX d-xl-block d-none">
          <Image
            alt="shape"
            src="/assets/img/shape/teamShape1_2.png"
            width="248"
            height="272"
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
              className="title text-center mb-200 wow fadeInUp"
              data-wow-delay=".6s"
            >
              See Our Skilled Expert Team
            </h2>
          </div>
          <div className="row team-card-wrapper style1">
            {teamMembers2.map((member, index) => (
              <div
                className="team-card style1 wow fadeInUp"
                data-wow-delay={member.delay}
                key={index}
              >
                <div className="team-thumb">
                  <Image
                    src={member.imgSrc}
                    width={275}
                    height={449}
                    alt="thumb"
                  />
                </div>
                <div className="profile-box">
                  <h3 className="title">
                    <Link scroll={false} href={`/team-details/${member.id}`}>
                      {member.name}
                    </Link>
                  </h3>
                  <div className="text">{member.role}</div>
                </div>
                <div className="bg">
                  <Image
                    src={member.bgImage}
                    width={275}
                    height={449}
                    alt="bg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
