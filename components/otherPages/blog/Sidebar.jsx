"use client";
import { newsCategories, recentItems, tags } from "@/data/blogs";
import Link from "next/link";
import Image from "next/image";
import React from "react";

export default function Sidebar() {
  return (
    <div className="col-12 col-lg-4">
      <div className="main-sidebar">
        <div
          className="single-sidebar-widget wow fadeInUp"
          data-wow-delay=".2s"
        >
          <div className="wid-title">
            <h3>Search</h3>
          </div>
          <div className="search-widget">
            <form onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Search here" />
              <button type="submit">
                <i className="fa-sharp fa-light fa-magnifying-glass" />
              </button>
            </form>
          </div>
        </div>
        <div
          className="single-sidebar-widget wow fadeInUp"
          data-wow-delay=".4s"
        >
          <div className="wid-title">
            <h3>Categories</h3>
          </div>
          <div className="news-widget-categories">
            <ul>
              {newsCategories.map((category, index) => (
                <li key={index} className={category.isActive ? "active" : ""}>
                  <Link scroll={false} href={`/blog-details/1`}>
                    {category.name} <span>({category.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div
          className="single-sidebar-widget wow fadeInUp"
          data-wow-delay=".6s"
        >
          <div className="wid-title">
            <h3>Recent Post</h3>
          </div>
          <div className="recent-post-area">
            {recentItems.map((item, index) => (
              <div className="recent-items" key={index}>
                <div className="recent-thumb">
                  <Image src={item.imgSrc} width={78} height={79} alt="img" />
                </div>
                <div className="recent-content">
                  <ul>
                    <li>
                      <Image
                        alt="icon"
                        src="/assets/img/icon/calendarIcon.png"
                        width="20"
                        height="20"
                      />
                      {item.date}
                    </li>
                  </ul>
                  <h6>
                    <Link scroll={false} href={`/blog-details/1`}>
                      {item.title.split("\n").map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                    </Link>
                  </h6>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="single-sidebar-widget wow fadeInUp"
          data-wow-delay=".8s"
        >
          <div className="wid-title">
            <h3>Tags</h3>
          </div>
          <div className="news-widget-categories">
            <div className="tagcloud">
              {tags.map((elm, i) => (
                <a key={i} href={`#`}>
                  {elm.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
