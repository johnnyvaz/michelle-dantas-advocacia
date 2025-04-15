import { counterBoxes } from "@/data/facts";
import React from "react";
import Image from "next/image";
import Counter from "@/components/common/Counter";

export default function Facts() {
  return (
    <div className="counter-area py-80 bg-gradient-to-r from-[#4c2c18] to-[#b89238] text-white text-center">
      <div className="container">
        {/* Alterado para grid com colunas responsivas e alinhamento centralizado */}
        <div className="counter-wrap grid grid-cols-1 md:grid-cols-3 justify-items-center gap-10">
          {counterBoxes.map((box, index) => (
            <div
              className="counter-box style2 wow fadeInUp flex flex-col items-center"
              data-wow-delay={box.delay}
              key={index}
            >
              <div className="counter-box_icon mb-4">
                <Image src={box.icon} width={60} height={60} alt="icon" />
              </div>
              <div className="counter-box_counter">
                {/* Adicionado mx-auto para centralização horizontal */}
                <div className="text-3xl md:text-4xl font-bold mx-auto">
                  <Counter parentClass={"counter-number"} max={box.number} />
                  <span className="plus">+</span>
                </div>
                <span className="text-lg md:text-xl mt-2 block">{box.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}