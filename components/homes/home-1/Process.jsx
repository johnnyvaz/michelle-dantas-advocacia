import { processSteps } from "@/data/process";
import React from "react";
import Image from "next/image";

export default function Process() {
  return (
    <section className="work-process-area space-top pb-300 fix">
      <div className="work-process-wrap style1">
        <div className="shape1_1 moving d-xl-block d-none">
          <Image
            alt="shape"
            src="/assets/img/shape/workProcessShape1_1.png"
            width="293"
            height="553"
          />
        </div>
        <div className="shape1_2 jump d-xl-block d-none">
          <Image
            alt="shape"
            src="/assets/img/shape/workProcessShape1_2.png"
            width="188"
            height="275"
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
              Work Process{' '}
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
              className="title text-center mb-100 wow fadeInUp"
              data-wow-delay=".6s"
            >
              Our software development process
            </h2>
          </div>
          <div className="process-card-wrap">
            {processSteps.map((step, index) => (
              <div
                className="process-card style1 wow fadeInUp"
                data-wow-delay={step.delay}
                key={index}
              >
                <div className="content">
                  <h3 className="title">{step.title}</h3>
                  <p className="text">{step.text}</p>
                  <div className="number">{step.number}</div>
                </div>
                <div className="icon-container">
                  <div className="icon">
                    <Image
                      src={step.iconSrc}
                      width={48}
                      height={48}
                      alt="icon"
                    />
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
