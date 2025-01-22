import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Features() {
  return (
    <section className="wcu-tab-area">
      <div
        className="wcu-tab-wrap space"
        data-bg-src=""
        style={{ backgroundImage: "url(/assets/img/bg/wcuBg1_1.png)" }}
      >
        <div className="shape1_1 d-none d-xl-block">
          <Image
            alt="shape"
            src="/assets/img/shape/wcuShape1_1.png"
            width="270"
            height="733"
          />
        </div>
        <div className="shape1_2 d-none d-xl-block">
          <Image
            alt="shape"
            src="/assets/img/shape/wcuShape1_2.png"
            width="248"
            height="321"
          />
        </div>
        <div className="container">
          <div className="wcu-wrap style1">
            <div className="title-area mx-auto">
              <h5 className="subtitle text-center">
                {" "}
                <span className="me-2">
                  <Image
                    alt="icon"
                    src="/assets/img/icon/titleIcon.png"
                    width="28"
                    height="12"
                  />
                </span>{" "}
                wHy choose Us App{" "}
                <span className="ms-2">
                  <Image
                    alt="icon"
                    src="/assets/img/icon/titleIcon.png"
                    width="28"
                    height="12"
                  />
                </span>{" "}
              </h5>
              <h2 className="title text-center mb-50">
                Smart &amp; Clean User Interface For Our Active Client
              </h2>
            </div>
            <div className="row">
              <div className="col-xxl-4 col-xl-4 col-lg-12">
                <div
                  className="wcu-tab-area wow fadeInLeft"
                  data-wow-delay="500ms"
                >
                  <ul
                    className="nav nav-pills mb-3"
                    id="pills-tab"
                    role="tablist"
                  >
                    <li className="nav-item" role="presentation">
                      <button
                        className="nav-link active"
                        id="real-time-activity-tab"
                        data-bs-toggle="pill"
                        data-bs-target="#real-time-activity"
                        type="button"
                        role="tab"
                        aria-controls="real-time-activity"
                        aria-selected="true"
                      >
                        <Image
                          alt="icon"
                          src="/assets/img/icon/wcuIcon1_1.png"
                          width="50"
                          height="50"
                        />{" "}
                        Real time activity
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className="nav-link"
                        id="easy-integration-tab"
                        data-bs-toggle="pill"
                        data-bs-target="#easy-integration"
                        type="button"
                        role="tab"
                        aria-controls="easy-integration"
                        aria-selected="false"
                      >
                        <Image
                          alt="icon"
                          src="/assets/img/icon/wcuIcon1_2.png"
                          width="50"
                          height="50"
                        />{" "}
                        Easy integrations
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className="nav-link"
                        id="instant-deploy-tab"
                        data-bs-toggle="pill"
                        data-bs-target="#instant-deploy"
                        type="button"
                        role="tab"
                        aria-controls="instant-deploy"
                        aria-selected="false"
                      >
                        <Image
                          alt="icon"
                          src="/assets/img/icon/wcuIcon1_3.png"
                          width="50"
                          height="50"
                        />{" "}
                        Instant deploy{" "}
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className="nav-link"
                        id="software-services-tab"
                        data-bs-toggle="pill"
                        data-bs-target="#software-services"
                        type="button"
                        role="tab"
                        aria-controls="software-services"
                        aria-selected="false"
                      >
                        <Image
                          alt="icon"
                          src="/assets/img/icon/wcuIcon1_4.png"
                          width="50"
                          height="50"
                        />{" "}
                        Software Services
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-xxl-8 col-xl-8 col-lg-12">
                <div className="wcu-tab-details-area">
                  <div className="tab-content" id="pills-tabContent">
                    <div
                      className="tab-pane fade show active"
                      id="real-time-activity"
                      role="tabpanel"
                      aria-labelledby="real-time-activity-tab"
                      tabIndex={0}
                    >
                      <div className="wcu-tab-content">
                        <div className="shape d-none d-xl-block">
                          <Image
                            alt="shape"
                            src="/assets/img/wcu/wcuShape1.png"
                            width="396"
                            height="269"
                          />
                        </div>
                        <div className="wcu-thumb">
                          <Image
                            alt="thunmb"
                            src="/assets/img/wcu/wcuThumb.png"
                            width="268"
                            height="403"
                          />
                        </div>
                        <div className="wcu-content">
                          <div className="title">Real time activity</div>
                          <div className="text">
                            It is a long established fact that a reader will
                            content of a page when looking at layout the point
                            of using lorem.
                          </div>
                          <div className="checklist">
                            <ul className="ps-0">
                              <li>
                                <Image
                                  alt="icon"
                                  src="/assets/img/icon/signIcon2.png"
                                  width="20"
                                  height="20"
                                />
                              </li>
                              <li>Accurate Testing Processes</li>
                            </ul>
                            <ul className="ps-0">
                              <li>
                                <Image
                                  alt="icon"
                                  src="/assets/img/icon/signIcon2.png"
                                  width="20"
                                  height="20"
                                />
                              </li>
                              <li>100% Satisfaction Guarantee</li>
                            </ul>
                            <ul className="ps-0">
                              <li>
                                <Image
                                  alt="icon"
                                  src="/assets/img/icon/signIcon2.png"
                                  width="20"
                                  height="20"
                                />
                              </li>
                              <li>Award Winning Company.</li>
                            </ul>
                          </div>
                          <Link
                            scroll={false}
                            className="gt-btn gt-btn-icon"
                            href={`/contact`}
                          >
                            Explore More
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div
                      className="tab-pane fade"
                      id="easy-integration"
                      role="tabpanel"
                      aria-labelledby="easy-integration-tab"
                      tabIndex={0}
                    >
                      <div className="wcu-tab-content">
                        <div className="shape d-none d-xl-block">
                          <Image
                            alt="shape"
                            src="/assets/img/wcu/wcuShape1.png"
                            width="396"
                            height="269"
                          />
                        </div>
                        <div className="wcu-thumb">
                          <Image
                            alt="thunmb"
                            src="/assets/img/wcu/wcuThumb.png"
                            width="268"
                            height="403"
                          />
                        </div>
                        <div className="wcu-content">
                          <div className="title">Easy Integrations</div>
                          <div className="text">
                            It is a long established fact that a reader will
                            content of a page when looking at layout the point
                            of using lorem.
                          </div>
                          <div className="checklist">
                            <ul className="ps-0">
                              <li>
                                <Image
                                  alt="icon"
                                  src="/assets/img/icon/signIcon2.png"
                                  width="20"
                                  height="20"
                                />
                              </li>
                              <li>Accurate Testing Processes</li>
                            </ul>
                            <ul className="ps-0">
                              <li>
                                <Image
                                  alt="icon"
                                  src="/assets/img/icon/signIcon2.png"
                                  width="20"
                                  height="20"
                                />
                              </li>
                              <li>100% Satisfaction Guarantee</li>
                            </ul>
                            <ul className="ps-0">
                              <li>
                                <Image
                                  alt="icon"
                                  src="/assets/img/icon/signIcon2.png"
                                  width="20"
                                  height="20"
                                />
                              </li>
                              <li>Award Winning Company.</li>
                            </ul>
                          </div>
                          <Link
                            scroll={false}
                            className="gt-btn gt-btn-icon"
                            href={`/contact`}
                          >
                            Explore More
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div
                      className="tab-pane fade"
                      id="instant-deploy"
                      role="tabpanel"
                      aria-labelledby="instant-deploy-tab"
                      tabIndex={0}
                    >
                      <div className="wcu-tab-content">
                        <div className="shape d-none d-xl-block">
                          <Image
                            alt="shape"
                            src="/assets/img/wcu/wcuShape1.png"
                            width="396"
                            height="269"
                          />
                        </div>
                        <div className="wcu-thumb">
                          <Image
                            alt="thunmb"
                            src="/assets/img/wcu/wcuThumb.png"
                            width="268"
                            height="403"
                          />
                        </div>
                        <div className="wcu-content">
                          <div className="title">Instant deploy</div>
                          <div className="text">
                            It is a long established fact that a reader will
                            content of a page when looking at layout the point
                            of using lorem.
                          </div>
                          <div className="checklist">
                            <ul className="ps-0">
                              <li>
                                <Image
                                  alt="icon"
                                  src="/assets/img/icon/signIcon2.png"
                                  width="20"
                                  height="20"
                                />
                              </li>
                              <li>Accurate Testing Processes</li>
                            </ul>
                            <ul className="ps-0">
                              <li>
                                <Image
                                  alt="icon"
                                  src="/assets/img/icon/signIcon2.png"
                                  width="20"
                                  height="20"
                                />
                              </li>
                              <li>100% Satisfaction Guarantee</li>
                            </ul>
                            <ul className="ps-0">
                              <li>
                                <Image
                                  alt="icon"
                                  src="/assets/img/icon/signIcon2.png"
                                  width="20"
                                  height="20"
                                />
                              </li>
                              <li>Award Winning Company.</li>
                            </ul>
                          </div>
                          <Link
                            scroll={false}
                            className="gt-btn gt-btn-icon"
                            href={`/contact`}
                          >
                            Explore More
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div
                      className="tab-pane fade"
                      id="software-services"
                      role="tabpanel"
                      aria-labelledby="software-services-tab"
                      tabIndex={0}
                    >
                      <div className="wcu-tab-content">
                        <div className="shape d-none d-xl-block">
                          <Image
                            alt="shape"
                            src="/assets/img/wcu/wcuShape1.png"
                            width="396"
                            height="269"
                          />
                        </div>
                        <div className="wcu-thumb">
                          <Image
                            alt="thunmb"
                            src="/assets/img/wcu/wcuThumb.png"
                            width="268"
                            height="403"
                          />
                        </div>
                        <div className="wcu-content">
                          <div className="title">Software Services</div>
                          <div className="text">
                            It is a long established fact that a reader will
                            content of a page when looking at layout the point
                            of using lorem.
                          </div>
                          <div className="checklist">
                            <ul className="ps-0">
                              <li>
                                <Image
                                  alt="icon"
                                  src="/assets/img/icon/signIcon2.png"
                                  width="20"
                                  height="20"
                                />
                              </li>
                              <li>Accurate Testing Processes</li>
                            </ul>
                            <ul className="ps-0">
                              <li>
                                <Image
                                  alt="icon"
                                  src="/assets/img/icon/signIcon2.png"
                                  width="20"
                                  height="20"
                                />
                              </li>
                              <li>100% Satisfaction Guarantee</li>
                            </ul>
                            <ul className="ps-0">
                              <li>
                                <Image
                                  alt="icon"
                                  src="/assets/img/icon/signIcon2.png"
                                  width="20"
                                  height="20"
                                />
                              </li>
                              <li>Award Winning Company.</li>
                            </ul>
                          </div>
                          <Link
                            scroll={false}
                            className="gt-btn gt-btn-icon"
                            href={`/contact`}
                          >
                            Explore More
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
