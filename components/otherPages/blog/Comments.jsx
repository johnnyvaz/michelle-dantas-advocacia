import React from "react";
import Image from "next/image";

export default function Comments() {
  return (
    <div className="comments-area wow fadeInUp" data-wow-delay="1.2s">
      <div className="comments-heading">
        <h3>02 Comments</h3>
      </div>
      <div className="blog-single-comment d-flex gap-4 pt-30 pb-30">
        <div className="image">
          <Image
            alt="image"
            src="/assets/img/blog/blogProfileThumb3_1.png"
            width="96"
            height="96"
          />
        </div>
        <div className="content">
          <div className="head d-flex flex-wrap gap-2 align-items-center justify-content-between">
            <div className="con">
              <h5>
                <a href={`#`}>Albert Flores</a>
              </h5>
              <span>March 20, 2024 at 2:37 pm</span>
            </div>
            <div className="btn">
              <a href={`#`} className="reply">
                Reply
              </a>
            </div>
          </div>
          <p className="mt-10 mb-0">
            Neque porro est qui dolorem ipsum quia quaed inventor veritatis et
            quasi architecto var sed efficitur turpis gilla sed sit amet finibus
            eros. Lorem Ipsum is simply dummy
          </p>
        </div>
      </div>
      <div className="blog-single-comment d-flex gap-4 pt-30 pb-30">
        <div className="image">
          <Image
            alt="image"
            src="/assets/img/blog/blogProfileThumb3_2.png"
            width="96"
            height="96"
          />
        </div>
        <div className="content">
          <div className="head d-flex flex-wrap gap-2 align-items-center justify-content-between">
            <div className="con">
              <h5>
                <a href={`#`}>Alex Flores</a>
              </h5>
              <span>March 20, 2024 at 2:37 pm</span>
            </div>
            <div className="btn">
              <a href={`#`} className="reply">
                Reply
              </a>
            </div>
          </div>
          <p className="mt-10 mb-0">
            Neque porro est qui dolorem ipsum quia quaed inventor veritatis et
            quasi architecto var sed efficitur turpis gilla sed sit amet finibus
            eros. Lorem Ipsum is simply dummy
          </p>
        </div>
      </div>
    </div>
  );
}
