import React from "react";
import Sidebar from "./Sidebar";
import Comments from "./Comments";
import CommentForm from "./CommentForm";
import Image from "next/image";

export default function BlogDetails({ blogItem }) {
  return (
    <section className="news-standard fix space-top pb-425">
      <div className="container">
        <div className="news-details-area">
          <div className="row g-5">
            <div className="col-12 col-lg-8">
              <div className="blog-post-details">
                <div className="single-blog-post">
                  <div
                    className="post-featured-thumb"
                    data-bg-src=""
                    style={{
                      backgroundImage:
                        "url(/assets/img/blog/blogCardThumb3_1.png)",
                    }}
                  />
                  <div className="post-content">
                    <ul
                      className="post-list d-flex align-items-center wow fadeInUp"
                      data-wow-delay=".2s"
                    >
                      <li>
                        <i className="fa-light fa-user" />
                        By Admin
                      </li>
                      <li>
                        <i className="fa-light fa-comments" />2 Comments
                      </li>
                      <li>
                        <Image
                          alt="icon"
                          src="/assets/img/icon/tagIcon.png"
                          width="20"
                          height="20"
                        />
                        IT Services
                      </li>
                    </ul>
                    <h3 className="wow fadeInUp" data-wow-delay=".4s">
                      {blogItem.title}
                    </h3>
                    <p className="mb-3 wow fadeInUp" data-wow-delay=".6s">
                      Consectetur adipisicing elit, sed do eiusmod tempor
                      incididunt ut labore et dolore of magna aliqua. Ut enim ad
                      minim veniam, made of owl the quis nostrud exercitation
                      ullamco laboris nisi ut aliquip ex ea dolor commodo
                      consequat. Duis aute irure and dolor in reprehenderit.
                    </p>
                    <p className="mb-3 wow fadeInUp" data-wow-delay=".8s">
                      The is ipsum dolor sit amet consectetur adipiscing elit.
                      Fusce eleifend porta arcu In hac habitasse the is platea
                      augue thelorem turpoi dictumst. In lacus libero faucibus
                      at malesuada sagittis placerat eros sed istincidunt augue
                      ac ante rutrum sed the is sodales augue consequat.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="1s">
                      Nulla facilisi. Vestibulum tristique sem in eros eleifend
                      imperdiet. Donec quis convallis neque. In id lacus
                      pulvinar lacus, eget vulputate lectus. Ut viverra bibendum
                      lorem, at tempus nibh mattis in. Sed a massa eget lacus
                      consequat auctor.
                    </p>
                    <div
                      className="hilight-text mt-4 mb-4 wow fadeInUp"
                      data-wow-delay=".8s"
                    >
                      <p>
                        Pellentesque sollicitudin congue dolor non aliquam.
                        Morbi volutpat, nisi vel ultricies urnacondimentum,
                        sapien neque lobortis tortor, quis efficitur mi ipsum eu
                        metus. Praesent eleifend orci sit amet est vehicula.
                      </p>
                      <svg
                        width={36}
                        height={36}
                        viewBox="0 0 36 36"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0 20.3698H7.71428L2.57139 30.5546H10.2857L15.4286 20.3698V5.09247H0V20.3698Z"
                          fill="#3C72FC"
                        />
                        <path
                          d="M20.5703 5.09247V20.3698H28.2846L23.1417 30.5546H30.856L35.9989 20.3698V5.09247H20.5703Z"
                          fill="#3C72FC"
                        />
                      </svg>
                    </div>
                    <p className="mt-4 mb-5 wow fadeInUp" data-wow-delay="1s">
                      Lorem ipsum dolor sit amet consectetur adipiscing elit Ut
                      et massa mi. Aliquam in hendrerit urna. Pellentesque sit
                      amet sapien fringilla, mattis ligula consectetur, ultrices
                      mauris. Maecenas vitae mattis tellus. Nullam quis
                      imperdiet augue. Vestibulum auctor ornare leo, non
                      suscipit magna interdum eu. Curabitur pellentesque nibh
                      nibh, at maximus ante fermentum sit amet. Pellentesque
                      commodo lacus at sodales sodales. Quisque sagittis orci ut
                      diam condimentum, vel euismod erat placerat. In iaculis
                      arcu eros.
                    </p>
                    <div className="row g-4 wow fadeInUp" data-wow-delay="1s">
                      <div className="col-lg-6">
                        <div className="details-image">
                          <Image
                            alt="img"
                            src="/assets/img/blog/blogCardThumb3_2.png"
                            width="710"
                            height="430"
                          />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="details-image">
                          <Image
                            alt="img"
                            src="/assets/img/blog/blogCardThumb3_3.png"
                            width="710"
                            height="430"
                          />
                        </div>
                      </div>
                    </div>
                    <p className="pt-5 wow fadeInUp" data-wow-delay="1.2s">
                      Consectetur adipisicing elit, sed do eiusmod tempor
                      incididunt ut labore et dolore of magna aliqua. Ut enim ad
                      minim veniam, made of owl the quis nostrud exercitation
                      ullamco laboris nisi ut aliquip ex ea dolor commodo
                      consequat. Duis aute irure and dolor in
                      reprehenderit.Consectetur adipisicing elit, sed do eiusmod
                      tempor incididunt ut labore et dolore of magna aliqua. Ut
                      enim ad minim veniam, made of owl the quis nostrud
                      exercitation ullamco laboris nisi ut aliquip ex ea dolor
                      commodo consequat. Duis aute irure and dolor in
                      reprehenderit.
                    </p>
                  </div>
                </div>
                <div
                  className="row tag-share-wrap mt-4 mb-30 wow fadeInUp"
                  data-wow-delay=".8s"
                >
                  <div className="col-lg-8 col-12">
                    <div className="tagcloud">
                      <h6 className="d-inline me-2">Tags:</h6>
                      <a href={`#`}>News</a>
                      <a href={`#`}>business</a>
                      <a href={`#`}>marketing</a>
                    </div>
                  </div>
                  <div
                    className="col-lg-4 col-12 mt-3 mt-lg-0 text-lg-end wow fadeInUp"
                    data-wow-delay="1.2s"
                  >
                    <div className="social-share">
                      <span className="me-3">Share:</span>
                      <a href="#">
                        <i className="fab fa-facebook-f" />
                      </a>
                      <a href="#">
                        <i className="fab fa-twitter" />
                      </a>
                      <a href="#">
                        <i className="fab fa-linkedin-in" />
                      </a>
                      <a href="#">
                        <i className="fab fa-youtube" />
                      </a>
                    </div>
                  </div>
                </div>
                <Comments />
                <div
                  className="comment-form-wrap pt-5 wow fadeInUp"
                  data-wow-delay="1.2s"
                >
                  <h3>Leave a comments</h3>
                  <CommentForm />
                </div>
              </div>
            </div>
            <Sidebar />
          </div>
        </div>
      </div>
    </section>
  );
}
