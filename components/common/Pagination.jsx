"use client";

import React, { useState } from "react";

export default function Pagination() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = 3; // Set this to the total number of pages you have

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousClick = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <ul className="pagination">
      <li className={currentPage === 1 ? "disabled" : ""}>
        <a className="page-numbers" onClick={handlePreviousClick}>
          <i className="fa-sharp fa-light fa-arrow-left-long" />
        </a>
      </li>
      {[...Array(totalPages)].map((_, index) => (
        <li key={index} className={currentPage === index + 1 ? " active" : ""}>
          <a
            className="page-numbers"
            onClick={() => handlePageClick(index + 1)}
          >
            {index + 1}
          </a>
        </li>
      ))}
      <li className={currentPage === totalPages ? "disabled" : ""}>
        <a className="page-numbers" onClick={handleNextClick}>
          <i className="fa-sharp fa-light fa-arrow-right-long" />
        </a>
      </li>
    </ul>
  );
}
