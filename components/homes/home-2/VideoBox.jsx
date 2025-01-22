"use client";

import { useState } from "react";
import ModalVideo from "react-modal-video";

export default function VideoBox() {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <div className="video-box-area fix wow fadeInUp" data-wow-delay="0.6s">
        <div className="video-wrap style1">
          <div className="container">
            <div
              className="video-box background-image"
              style={{
                backgroundImage: 'url("/assets/img/bg/videoBoxBg2_1.png")',
              }}
            >
              <a onClick={() => setOpen(true)} className="play-btn popup-video">
                <i className="fa-sharp fa-solid fa-play" />
              </a>
            </div>
          </div>
        </div>
      </div>{" "}
      <ModalVideo
        channel="youtube"
        youtube={{ mute: 0, autoplay: 0 }}
        isOpen={isOpen}
        videoId="f2Gzr8sAGB8"
        onClose={() => setOpen(false)}
      />
    </>
  );
}
