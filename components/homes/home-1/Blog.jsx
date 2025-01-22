import { blogCards } from "@/data/blogs";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Blog() {
  return (
    <section className="blog-area fix">
      <div
        className="blog-wrap style1 space-top pb-425"
        style={{ backgroundImage: "url(/assets/img/bg/blogBg1_1.png)" }}
      >
        <div className="shape1_1 movingX d-xl-block d-none">
          <Image
            alt="shape"
            width="358"
            height="393"
            src="/assets/img/shape/blogShape1_1.png"
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
                  width="28"
                  height="12"
                  src="/assets/img/icon/titleIcon.png"
                />
              </span>{' '}
              News &amp; Article{' '}
              <span className="ms-1">
                <Image
                  alt="icon"
                  width="28"
                  height="12"
                  src="/assets/img/icon/titleIcon.png"
                />
              </span>
            </h5>
            <h2
              className="title text-center mb-50 wow fadeInUp"
              data-wow-delay=".3s"
            >
              Read our latest insights
            </h2>
          </div>
          <div className="blog-card-wrap style1">
            {blogCards.map((card, index) => (
              <div
                className="blog-card style1 img-shine wow fadeInUp"
                data-wow-delay={card.delay}
                key={index}
              >
                <div className="blog-card-thumb style1">
                  <Image
                    src={card.thumb}
                    width={322}
                    height={216}
                    alt="thumb"
                  />
                </div>
                <div className="blog-card-body">
                  <div className="tag-cloud">
                    {card.meta.map((metaItem, metaIndex) => (
                      <div className="meta" key={metaIndex}>
                        <span className="icon">
                          <Image
                            src={metaItem.icon}
                            width={20}
                            height={20}
                            alt="icon"
                          />
                        </span>
                        <span className="text">{metaItem.text}</span>
                      </div>
                    ))}
                  </div>
                  <h3 className="blog-title style1">
                    <Link scroll={false} href={`/blog-details/${card.id}`}>
                      {card.title}
                    </Link>
                  </h3>
                  <div className="btn-wrapper">
                    <Link scroll={false} href={`/blog-details/${card.id}`}>
                      Read More
                      <Image
                        alt="icon"
                        width="16"
                        height="16"
                        src="/assets/img/icon/arrowIconDark.png"
                      />
                    </Link>
                  </div>
                  <div className="calendar">
                    <div className="date">{card.date}</div>
                    <div className="month">{card.month}</div>
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
