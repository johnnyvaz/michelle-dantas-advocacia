"use client";

import { useEffect } from "react";

export default function CursorFollor() {
  useEffect(() => {
    if (document.querySelector(".cursor-follower")) {
      var follower = document.querySelector(".cursor-follower");

      var posX = 0,
        posY = 0;
      var mouseX = 0,
        mouseY = 0;

      function animateFollower() {
        posX += (mouseX - posX) / 9;
        posY += (mouseY - posY) / 9;

        follower.style.left = posX - 12 + "px";
        follower.style.top = posY - 12 + "px";

        requestAnimationFrame(animateFollower);
      }

      requestAnimationFrame(animateFollower);

      document.addEventListener("mousemove", function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      var sliderAreas = document.querySelectorAll(".slider-area");
      sliderAreas.forEach(function (sliderArea) {
        sliderArea.addEventListener("mouseenter", function () {
          follower.classList.add("d-none");
        });

        sliderArea.addEventListener("mouseleave", function () {
          follower.classList.remove("d-none");
        });
      });
    }
  }, []);

  return <div className="cursor-follower"></div>;
}
