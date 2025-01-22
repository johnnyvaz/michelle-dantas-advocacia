import { blogPosts, blogPostsStyle2 } from "@/data/blogs";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Blog() {
  return (
    <section className="blog-area">
      <div className="blog-wrap style2 space-top pb-390 fix">
        <div className="shape2_1 d-none d-xl-block">
          <Image
            alt="shape"
            src="/assets/img/shape/blogShape2_1.png"
            width="225"
            height="466"
          />
        </div>
        <div className="shape2_2 d-none d-xl-block">
          <Image
            alt="shape"
            src="/assets/img/shape/blogShape2_2.png"
            width="343"
            height="393"
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
              News &amp; Article{' '}
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
              Read our latest insights
            </h2>
          </div>
          <div className="blog-card-wrap style2">
            {blogPostsStyle2.map((post, index) => (
              <div
                className="blog-card style2 img-shine wow fadeInUp"
                data-wow-delay={post.delay}
                key={index}
              >
                <div className="blog-card-thumb style2">
                  <Image
                    src={post.thumb}
                    width={530}
                    height={248}
                    alt="thumb"
                  />
                </div>
                <div className="blog-card-body">
                  <div className="tag-cloud style2">
                    <div className="meta">
                      <span className="icon">
                        <Image
                          alt="icon"
                          src="/assets/img/icon/tagIcon.png"
                          width="20"
                          height="20"
                        />
                      </span>
                      <span className="text">{post.tag}</span>
                    </div>
                    <div className="meta">
                      <span className="icon">
                        <Image
                          alt="icon"
                          src="/assets/img/icon/commentIcon.png"
                          width="20"
                          height="20"
                        />
                      </span>
                      <span className="text">{post.comments}</span>
                    </div>
                  </div>
                  <h3 className="blog-title style2">
                    <Link scroll={false} href={`/blog-details/${post.id}`}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className="blog-text">{post.text}</p>
                  <div className="profile-wrapper style2">
                    <div className="fancy-box style1">
                      <div className="fancy-box_icon">
                        <Image
                          src={post.profileImg}
                          width={56}
                          height={56}
                          alt="img"
                        />
                      </div>
                      <div className="fancy-box_content">
                        <span>By Admin</span>
                        <h4>{post.author}</h4>
                      </div>
                    </div>
                    <Link
                      scroll={false}
                      href={`/blog-details/${post.id}`}
                      className="gt-btn gt-btn-icon"
                    >
                      Read More
                    </Link>
                    <div className="calendar">
                      <div className="date">{post.date}</div>
                      <div className="month">{post.month}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div
              className="blog-card-wrap style3 wow fadeInUp"
              data-wow-delay=".8s"
            >
              {blogPosts.map((post, index) => (
                <div
                  className="blog-card style3 img-shine wow fadeInUp"
                  data-wow-delay={post.delay}
                  key={index}
                >
                  <div className="blog-card-thumb style3">
                    <Image
                      src={post.thumb}
                      width={238}
                      height={236}
                      alt="thumb"
                    />
                  </div>
                  <div className="blog-card-body">
                    <div className="tag-cloud style2">
                      <div className="meta">
                        <span className="icon">
                          <Image
                            alt="icon"
                            src="/assets/img/icon/tagIcon.png"
                            width="20"
                            height="20"
                          />
                        </span>
                        <span className="text">{post.tag}</span>
                      </div>
                      <div className="meta">
                        <span className="icon">
                          <Image
                            alt="icon"
                            src="/assets/img/icon/commentIcon.png"
                            width="20"
                            height="20"
                          />
                        </span>
                        <span className="text">{post.comments}</span>
                      </div>
                    </div>
                    <h3 className="blog-title style2">
                      <Link scroll={false} href={`/blog-details/${post.id}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <div className="profile-wrapper style2">
                      <div className="fancy-box style1">
                        <div className="fancy-box_icon">
                          <Image
                            src={post.profileImg}
                            width={56}
                            height={56}
                            alt="img"
                          />
                        </div>
                        <div className="fancy-box_content">
                          <span>By Admin</span>
                          <h4>{post.author}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="calendar">
                      <div className="date">{post.date}</div>
                      <div className="month">{post.month}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
