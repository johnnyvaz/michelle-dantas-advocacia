"use client";
import React, { useEffect, useRef, useState } from "react";

const Progress = ({ percentage }) => {
  const targetElement = useRef();

  useEffect(() => {
    const handleIntersection = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          targetElement.current.style.animation =
            "1.8s ease 0s 1 normal forwards running animate-positive";
          observer.unobserve(entry.target);
        }
      });
    };

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    if (targetElement.current) {
      observer.observe(targetElement.current);
    }

    return () => {
      if (targetElement.current) {
        observer.unobserve(targetElement.current);
      }
    };
  }, []);

  return (
    <div
      ref={targetElement}
      style={{
        opacity: 1,
        "--progress-width": `${percentage}`,
        width: `${percentage}`,
      }}
      className="progress-bar"
    />
  );
};

export default Progress;
