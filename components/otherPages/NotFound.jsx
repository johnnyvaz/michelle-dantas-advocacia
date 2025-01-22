import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <section className="error-area space-top pb-425 fix">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="error-items">
              <div className="error-image">
                <Image
                  src="/assets/img/bg/error.png"
                  width={896}
                  height={539}
                  alt="img"
                />
              </div>
              <h2>
                <span>Oops! </span> Page not found
              </h2>
              <p>The page you are looking for does not exist</p>
              <Link
                scroll={false}
                href={`/`}
                className="gt-btn gt-btn-icon wow fadeInUp"
                data-wow-delay=".8s"
              >
                Go Back Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
