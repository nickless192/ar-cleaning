import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const slides = [
  { id: 1, text: "Reliable Carpet Cleaning", img: "/images/slide1.jpg" },
  { id: 2, text: "Eco-Friendly Products", img: "/images/slide2.jpg" },
  { id: 3, text: "Satisfaction Guaranteed", img: "/images/slide3.jpg" },
];

export default function LandingCarousel() {
  const [active, setActive] = useState(0);

  const prev = () =>
    setActive((active - 1 + slides.length) % slides.length);
  const next = () =>
    setActive((active + 1) % slides.length);

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Slides */}
      <div className="overflow-hidden rounded-2xl shadow-lg">
        <img
          src={slides[active].img}
          alt={slides[active].text}
          className="w-full h-64 object-cover"
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-1 rounded-full text-white text-sm">
          {slides[active].text}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex justify-center space-x-3">
        <button
          className="w-auto inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
          onClick={prev}
          type="button"
        >
          <FiChevronLeft className="text-base" />
          <span className="hidden sm:inline">Prev</span>
        </button>
        <button
          className="w-auto inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
          onClick={next}
          type="button"
        >
          <span className="hidden sm:inline">Next</span>
          <FiChevronRight className="text-base" />
        </button>
      </div>

      {/* Custom Dots */}
      <div className="flex justify-center mt-3 space-x-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`w-3 h-3 rounded-full transition ${
              active === i ? "bg-cleanar-color" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
