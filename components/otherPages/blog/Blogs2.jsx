import { newsItems } from "@/data/blogs";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "./Sidebar";
import Pagination from "@/components/common/Pagination";

export default function Blogs2() {
  return (
    <section className="news-standard fix space-top pb-425">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="news-standard-wrapper">
              {newsItems.map((item, index) => (
                <div
                  key={index}
                  className="news-standard-items wow fadeInUp"
                  data-wow-delay={item.delay}
                >
                  <div className="news-thumb">
                    <Image
                      src={item.imgSrc}
                      width={710}
                      height={430}
                      alt="img"
                    />
                    <div className="post-date">
                      <h3>
                        {item.date} <br />
                        <span>{item.month}</span>
                      </h3>
                    </div>
                  </div>
                  <div className="news-content">
                    <ul>
                      <li>
                        <i className="fa-light fa-user" />
                        {item.user}
                      </li>
                      <li>
                        <i className="fa-light fa-comments" />
                        {item.comments}
                      </li>
                    </ul>
                    <h3>
                      <Link scroll={false} href={`/blog-details`}>
                        {item.title}
                      </Link>
                    </h3>
                    <p>{item.description}</p>
                    <Link
                      scroll={false}
                      href={`/blog-details`}
                      className="gt-btn mt-1"
                    >
                      Read More
                      <i className="fa-sharp fa-light fa-arrow-right-long" />
                    </Link>
                  </div>
                </div>
              ))}
              <div
                className="page-nav-wrap pt-5 text-center wow fadeInUp"
                data-wow-delay=".8s"
              >
                <ul>
                  <Pagination />
                </ul>
              </div>
            </div>
          </div>
          <Sidebar />
        </div>
      </div>
    </section>
  );
}
