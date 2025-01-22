import { counterBoxes } from "@/data/facts";
import React from "react";
import Image from "next/image";
import Counter from "@/components/common/Counter";

export default function Facts() {
  return (
    <div className="counter-area mt-n150 mb-n116 fix">
      <div className="container">
        <div className="counter-wrap">
          {counterBoxes.map((box, index) => (
            <div
              className="counter-box style2 wow fadeInUp"
              data-wow-delay={box.delay}
              key={index}
            >
              <div className="counter-box_icon">
                <Image src={box.icon} width={60} height={60} alt="icon" />
              </div>
              <div className="counter-box_counter">
                <div>
                  <Counter parentClass={"counter-number"} max={box.number} />

                  <span className="plus">+</span>
                </div>
                <span>{box.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
