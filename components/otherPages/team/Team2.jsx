import { teamMembers4 } from "@/data/team";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Team2() {
  return (
    <section className="team-area">
      <div className="team-wrap style2 space-top pb-425 fix">
        <div className="container">
          <div className="row">
            {teamMembers4.map((member, index) => (
              <div key={index} className="col-xl-3 col-md-6 col-12">
                <div
                  className="team-card style2 mb-30 wow fadeInUp"
                  data-wow-delay={member.delay}
                >
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
                        {Object.entries(member.socialLinks).map(
                          ([platform, url]) => (
                            <li key={platform}>
                              <a href={url}>
                                <i
                                  className={`fab fa-${
                                    platform === "facebook"
                                      ? "facebook-f"
                                      : platform
                                  }`}
                                />
                              </a>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="team-content text-center">
                    <h3>
                      <Link scroll={false} href={`/team-details/${member.id}`}>
                        {member.name}
                      </Link>
                    </h3>
                    <p>{member.position}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
