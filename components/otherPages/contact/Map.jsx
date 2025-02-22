import React from "react";

export default function Map() {
  return (
    <div className="map-section wow fadeInUp" data-wow-delay=".6s">
      <div className="map-items">
        <div className="googpemap">
          <iframe
            // src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6678.7619084840835!2d144.9618311901502!3d-37.81450084255415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642b4758afc1d%3A0x3119cc820fdfc62e!2sEnvato!5e0!3m2!1sen!2sbd!4v1641984054261!5m2!1sen!2sbd"
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7359.065346103587!2d-47.34389900000001!3d-22.745605!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94c89bdb21031f51%3A0xed432d58b88b69f1!2sR.%20Uruguai%2C%20853%20-%20Jardim%20Girassol%2C%20Americana%20-%20SP%2C%2013465-680%2C%20Brasil!5e0!3m2!1spt-BR!2sus!4v1740228712556!5m2!1spt-BR!2sus"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
