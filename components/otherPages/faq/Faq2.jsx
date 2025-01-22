import React from "react";

export default function Faq2() {
  return (
    <div className="accordion" id="accordion1">
      <div className="accordion-item mb-3 wow fadeInUp" data-wow-delay=".3s">
        <h5 className="accordion-header">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#faq5"
            aria-expanded="true"
            aria-controls="faq5"
          >
            Where should I incorporate my business?
          </button>
        </h5>
        <div
          id="faq5"
          className="accordion-collapse collapse"
          data-bs-parent="#accordion1"
        >
          <div className="accordion-body">
            There are many variations of passages of Lorem Ipsum available, but
            the majority have suffered alteration in some form, by injected
            humour, or randomised words which don't.
          </div>
        </div>
      </div>
      <div className="accordion-item mb-3 wow fadeInUp" data-wow-delay=".5s">
        <h5 className="accordion-header">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#faq6"
            aria-expanded="false"
            aria-controls="faq6"
          >
            How long should a business plan be?
          </button>
        </h5>
        <div
          id="faq6"
          className="accordion-collapse collapse"
          data-bs-parent="#accordion"
        >
          <div className="accordion-body">
            There are many variations of passages of Lorem Ipsum available, but
            the majority have suffered alteration in some form, by injected
            humour, or randomised words which don't.
          </div>
        </div>
      </div>
      <div className="accordion-item mb-3 wow fadeInUp" data-wow-delay=".7s">
        <h5 className="accordion-header">
          <button
            className="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#faq7"
            aria-expanded="false"
            aria-controls="faq7"
          >
            What is included in your services?
          </button>
        </h5>
        <div
          id="faq7"
          className="accordion-collapse show"
          data-bs-parent="#accordion1"
        >
          <div className="accordion-body">
            There are many variations of passages of Lorem Ipsum available, but
            the majority have suffered alteration in some form, by injected
            humour, or randomised words which don't.
          </div>
        </div>
      </div>
      <div className="accordion-item wow fadeInUp" data-wow-delay=".7s">
        <h5 className="accordion-header">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#faq8"
            aria-expanded="false"
            aria-controls="faq8"
          >
            What type of company is measured?
          </button>
        </h5>
        <div
          id="faq8"
          className="accordion-collapse collapse"
          data-bs-parent="#accordion1"
        >
          <div className="accordion-body">
            There are many variations of passages of Lorem Ipsum available, but
            the majority have suffered alteration in some form, by injected
            humour, or randomised words which don't.
          </div>
        </div>
      </div>
    </div>
  );
}
