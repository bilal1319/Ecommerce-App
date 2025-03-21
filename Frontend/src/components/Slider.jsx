import React, { useState, useEffect, useRef } from "react";

import tech from "../assets/tech.webp";
import iphone from "../assets/iphone.webp";
import android from "../assets/andriod.webp";
import beauty from "../assets/beauty.webp";
import cloth from "../assets/cloth.webp";

const images = [cloth, tech, iphone, android, beauty];

function Slider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  // Auto-slide every 10s
  const startAutoSlide = () => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000);
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  const goToPrevious = () => {
    stopAutoSlide();
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    restartAutoSlide();
  };

  const goToNext = () => {
    stopAutoSlide();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    restartAutoSlide();
  };

  const restartAutoSlide = () => {
    setTimeout(startAutoSlide, 12000);
  };

  return (
    <div className="relative w-[95vw] sm:w-[85vw] md:w-[80vw] lg:w-[70vw] max-w-[1500px] mx-auto h-[30vh] sm:h-[40vh] md:h-[50vh] lg:h-[60vh] overflow-hidden mt-4 sm:mt-6  sm:rounded-lg shadow-md sm:shadow-lg">
      {/* Image Container with Sliding Effect */}
      <div
        className="flex transition-transform duration-1000 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, index) => (
          <img 
            key={index} 
            src={src} 
            className="w-full h-full flex-shrink-0 object-fit object-center" 
            alt={`Slide ${index + 1}`} 
            loading="lazy" 
          />
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
              index === currentIndex ? "bg-blue-500 scale-125" : "bg-gray-300"
            }`}
            onClick={() => {
              stopAutoSlide();
              setCurrentIndex(index);
              restartAutoSlide();
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute flex items-center justify-center top-1/2 left-1 sm:left-2 transform -translate-y-1/2 bg-gray-700/50 hover:bg-gray-900/70 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 p-1 sm:p-2 transition text-sm sm:text-base"
        onClick={goToPrevious}
        aria-label="Previous slide"
      >
        ❮
      </button>
      <button
        className="absolute flex items-center justify-center top-1/2 right-1 sm:right-2 transform -translate-y-1/2 bg-gray-700/50 hover:bg-gray-900/70 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 p-1 sm:p-2 transition text-sm sm:text-base"
        onClick={goToNext}
        aria-label="Next slide"
      >
        ❯
      </button>
    </div>
  );
}

export default Slider;