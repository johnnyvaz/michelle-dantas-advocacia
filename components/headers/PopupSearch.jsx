"use client";

import { closePopupSearch } from "@/utlis/togglePopupSearch";
import { useEffect, useRef } from "react";

export default function PopupSearch() {
  const formRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current && // Check if click is inside #mobileMenu
        containerRef.current.contains(event.target) &&
        formRef.current && // Check if click is outside .gt-menu-area
        !formRef.current.contains(event.target)
      ) {
        closePopupSearch();
        // Add your custom logic here
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div
      ref={containerRef}
      id="PopupSearch"
      className="popup-search-box d-none d-lg-block"
    >
      <button onClick={closePopupSearch} className="searchClose">
        <i className="fal fa-times" />
      </button>
      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <input type="text" placeholder="What are you looking for?" />
        <button type="submit">
          <i className="fal fa-search" />
        </button>
      </form>
    </div>
  );
}
