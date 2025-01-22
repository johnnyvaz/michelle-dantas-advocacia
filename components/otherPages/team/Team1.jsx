import { teamMembers3 } from "@/data/team";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Team1() {
  return (
    <section className="team-area space-top pb-425 fix">
      <div className="team-wrap style1 space-top mb-10">
        <div className="container">
          <div className="row team-card-wrapper style1">
            {teamMembers3.slice(0, 3).map((member, index) => (
              <div
                key={index}
                className="team-card style1 wow fadeInUp"
                data-wow-delay={member.delay}
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
                  <div className="text">{member.position}</div>
                </div>
                <div className="bg">
                  <Image src={member.bgSrc} width={370} height={343} alt="bg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="team-wrap style1 space-top mt-55">
        <div className="container">
          <div className="row team-card-wrapper style1">
            {teamMembers3.slice(3, 6).map((member, index) => (
              <div
                key={index}
                className="team-card style1 wow fadeInUp"
                data-wow-delay={member.delay}
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
                  <div className="text">{member.position}</div>
                </div>
                <div className="bg">
                  <Image src={member.bgSrc} width={370} height={343} alt="bg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
