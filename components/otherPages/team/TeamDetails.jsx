import React from "react";
import Image from "next/image";
import { progressData2 } from "@/data/skills";
import Progress from "@/components/common/Progress";

export default function TeamDetails({ teamMember }) {
  return (
    <section className="team-details-area fix space-top">
      <div className="container">
        <div className="team-details-wrap">
          <div className="row g-4 align-items-center">
            <div className="col-lg-4">
              <div
                className="team-details-thumb wow fadeInUp"
                data-wow-delay=".6s"
              >
                <Image
                  alt="team-img"
                  src={teamMember.imgSrc}
                  width="391"
                  height="474"
                />
              </div>
            </div>
            <div className="col-lg-8">
              <div className="team-details-content">
                <div
                  className="details-info d-flex justify-content-between wow fadeInUp"
                  data-wow-delay=".6s"
                >
                  <div className="profile">
                    <h3>{teamMember.name}</h3>
                    <span>Gemini market</span>
                  </div>
                  <div className="gt-social">
                    <a href="https://www.facebook.com/">
                      <i className="fa-brands fa-facebook-f" />
                    </a>
                    <a href="https://www.x.com/" className="active">
                      <i className="fa-brands fa-twitter" />
                    </a>
                    <a href="https://www.linkedin.com/">
                      <i className="fa-brands fa-linkedin-in" />
                    </a>
                    <a href="https://www.youtube.com/">
                      <i className="fa-brands fa-youtube" />
                    </a>
                  </div>
                </div>
                <p className="mt-3 wow fadeInUp" data-wow-delay=".9s">
                  Kenneth Z. Burke, known as Kenneth Duva Burke, was an
                  influential American literary theorist and philosopher. Born
                  on May 5, 1897, and passing away on November 19, 1993.
                </p>
                <p className="mb-70 wow fadeInUp" data-wow-delay="1s">
                  Burke made significant contributions to the fields of
                  rhetoric, literary criticism, and philosophy. His work
                  primarily focused on the nature of language and its role in
                  shaping human experience.
                </p>
                <div className="signature wow fadeInUp" data-wow-delay=".6s">
                  <Image
                    alt="signature"
                    src="/assets/img/team/signature.png"
                    width="91"
                    height="50"
                  />
                </div>
                <div
                  className="info-wrapper d-flex wow fadeInUp"
                  data-wow-delay="1.2s"
                >
                  <div className="checklist">
                    <ul>
                      <li>
                        <i className="fa-solid fa-phone-volume" />
                      </li>
                      <li>+91 5698 0036 420</li>
                    </ul>
                  </div>
                  <div className="checklist">
                    <ul>
                      <li>
                        <i className="fa-solid fa-paper-plane" />
                      </li>
                      <li>info@exmple.com</li>
                    </ul>
                  </div>
                  <div className="checklist">
                    <ul>
                      <li>
                        <i className="fa-solid fa-location-dot" />
                      </li>
                      <li>26 Manor St, Braintree UK</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="team-simple-history pb-425">
        <div className="container">
          <div className="row">
            <h4 className="title wow fadeInUp" data-wow-delay="1.6s">
              Personal Information
            </h4>
            <p className="wow fadeInUp" data-wow-delay="1.9s">
              Burke developed the concept of dramatism, which views human
              communication as a form of dramatic action. He introduced the
              pentad (act, scene, agent, agency, purpose) to analyze motives in
              communication.He emphasized the importance of identification in
              rhetoric, where persuasion is seen as the alignment of interests
              or the creation of a sense of unity between speaker and audience.
            </p>
            <p className="mb-55 wow fadeInUp" data-wow-delay=".6s">
              Burke examined how language shapes human perception and reality.
              He argued that language is not just a tool for communication but
              also a framework for understanding the world.Burke's
              interdisciplinary approach has influenced various fields,
              including communication studies, literary theory, sociology, and
              political science. His ideas on rhetoric and symbolic action
              remain foundational in understanding human communication and
              social interaction.
            </p>
            <div className="skills">
              <h4 className="title">Personal skills</h4>
              <div className="row">
                <div className="col-lg-6">
                  {progressData2.slice(0, 2).map((elm, i) => (
                    <div key={i} className="progress-wrap">
                      <div className="progress-meta">
                        <div className="title">{elm.title}</div>
                        <div className="percentage">{elm.percentage}</div>
                      </div>
                      <div className="progress-container">
                        <Progress percentage={elm.percentage} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="col-lg-6">
                  {progressData2.slice(2, 4).map((elm, i) => (
                    <div key={i} className="progress-wrap">
                      <div className="progress-meta">
                        <div className="title">{elm.title}</div>
                        <div className="percentage">{elm.percentage}</div>
                      </div>
                      <div className="progress-container">
                        <Progress percentage={elm.percentage} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-40 mb-0 wow fadeInUp" data-wow-delay=".6s">
                There are many variations of passages of Lorem Ipsum available,
                but the majority have suffered alteration in some form, by
                injected humour, or randomised words which don't look even
                slightly believable. If you are going to use a passage of Lorem
                Ipsum, you need to be sure there isn't anything embarrassing
                hidden in the middle of text. All the Lorem Ipsum generators on
                the Internet tend to repeat predefined chunks as necessary,
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
