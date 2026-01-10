"use client";
import { useState } from "react";
import Image from "next/image";
import ProtectedRoute from "./components/ProtectedRoute";

export default function Home() {
  const [counter, setCounter] = useState(1);

  const images = [1, 2, 3, 4, 5];

  function cycleNums(sign: "+" | "-") {
    setCounter((prev) => {
      if (sign === "+") {
        return prev >= images.length ? 1 : prev + 1;
      } else {
        return prev <= 1 ? images.length : prev - 1;
      }
    });
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen items-center justify-center gap-6">
        <div className="relative rounded-3xl overflow-hidden">
          <Image
            width={800}
            height={500}
            src={`/${counter}.jpg`}
            alt={`${counter}`}
            priority
          />
          <div
            className="absolute top-0 right-0 rounded-t-3xl h-full w-60 bg-linear-to-l from-black/90 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 flex justify-center items-center"
            onClick={() => cycleNums("+")}
          >
            <span className="text-6xl">›</span>
          </div>
          <div
            className="absolute top-0 left-0 rounded-t-3xl h-full w-60 bg-linear-to-r from-black/90 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 flex justify-center items-center"
            onClick={() => cycleNums("-")}
          >
            <span className="text-6xl">‹</span>
          </div>
        </div>

        <div className="flex gap-2">
          {images.map((num) => (
            <button
              key={num}
              className={counter === num ? "font-bold" : ""}
              onClick={() => setCounter(num)}
            >
              {num}{" "}
            </button>
          ))}
        </div>
        <div className="flex text-2xl gap-5">
          <button onClick={() => cycleNums("-")}>
            <span>‹</span>
          </button>
          <p>{counter}</p>
          <button onClick={() => cycleNums("+")}>
            <span>›</span>
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
