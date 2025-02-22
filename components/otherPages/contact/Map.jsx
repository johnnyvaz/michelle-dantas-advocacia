import React from "react";

export default function Map() {
  return (
    <div className="map-section wow fadeInUp" data-wow-delay=".6s">
      <div className="map-items">
        <div className="googpemap">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7359.10514344889!2d-47.34404410076812!3d-22.74486591690172!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94c89a329d316123%3A0x142d0a0864cf8598!2sMichelle%20Dantas%20Advocacia!5e0!3m2!1spt-BR!2sus!4v1740231990064!5m2!1spt-BR!2sus"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
