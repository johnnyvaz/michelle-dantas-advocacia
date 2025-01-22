import { projectItems } from "@/data/projects";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Projects() {
  return (
    <section className="all-project-area mx-auto space-top pb-425">
      <div className="container">
        <div className="row">
          {projectItems.map((item, index) => (
            <div key={index} className="col-xl-4 col-md-6 col-12 mb-30">
              <div
                className="project-card style1 img-shine wow fadeInUp"
                data-wow-delay={item.delay}
              >
                <div className="project-img">
                  <Image
                    src={item.imgSrc}
                    width={450}
                    height={450}
                    alt="project image"
                  />
                </div>
                <div className="fancy-box style2">
                  <p>{item.category}</p>
                  <h4>
                    <Link scroll={false} href={`/project-details/${item.id}`}>
                      {item.title}
                    </Link>
                  </h4>
                  <Link
                    scroll={false}
                    href={`/project-details/${item.id}`}
                    className="arrow-icon"
                  >
                    <i className="fa-solid fa-arrow-right"></i>
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
