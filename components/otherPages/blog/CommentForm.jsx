"use client";

export default function CommentForm() {
  return (
    <form id="contact-form" onSubmit={(e) => e.preventDefault()}>
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="form-clt">
            <input type="text" name="name" id="name" placeholder="Your Name" />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="form-clt">
            <input
              type="text"
              name="email"
              id="email2"
              placeholder="Your Email"
            />
          </div>
        </div>
        <div className="col-lg-12">
          <div className="form-clt">
            <textarea
              name="message"
              id="message"
              placeholder="Write Message"
              defaultValue={""}
            />
          </div>
        </div>
        <div className="col-lg-6">
          <button type="submit" className="gt-btn">
            Post a Comment
            <i className="fa-sharp fa-light fa-arrow-right-long ms-1" />
          </button>
        </div>
      </div>
    </form>
  );
}
