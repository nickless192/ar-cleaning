// ReviewsCarousel.jsx
import React from "react";
// import { Carousel, CarouselItem, CarouselIndicators, CarouselCaption } from "reactstrap";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import { Carousel } from "react-bootstrap";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";



function ReviewsCarousel() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  const [reviews, setReviews] = useState([
    {
      text: "Just moved to my new condo and used CleanAR Salution for a deep clean - absolutely fantastic service -Fili & Omar-! Their team was professional, thorough, and made my new place spotless. The attention to detail was impressive, and they left everything pristine for my move-in. Highly recommend CleanAR for anyone needing quality cleaning services!",
      author: "Angel G.",
      stars: 5
    },
    {
      text: `So happy to have found CleanAR solutions. They were highly recommended by my sister. Filiberto and Marian cleans our home so well! They are kind, thorough, efficient and so professional! We really appreciate the reasonable price, availability, and their variety of cleaning options. Thank you CleanAR for servicing our home!`,
      author: "Seya D.",
      stars: 5
    },
    {
      text: "We recently hired Fili from Cleanar Solutions to clean our windows, and they did an absolutely fantastic job! From start to finish, their service was professional, efficient, and incredibly thorough. Our windows have never looked this spotless and bright. Fili’s attention to detail was evident, and he ensured every window sparkled by the time they were done. Not only was the quality of their work impressive, but they were on time, friendly and provided excellent service at a reasonable price. We couldn't be happier with the results and would highly recommend Cleanar Solutions to anyone looking for top-notch cleaning. Thank you, Cleanar Solutions!",
      author: "Nikita C.",
      stars: 5
    },
    {
      text: "Booking CleanAR Solutions was fast and easy to do! They were super professional and left the place looking shiny and new! They did a deep clean of our bathroom, and steam cleaned our carpet. The tile has never sparkled so bright, they put everything back in its place, and we had an overall great experience. We will definitely be using their services again for our next job.",
      author: "Alex C.",
      stars: 5
    }
  ]);
  const next = () => setIndex((i) => (i + 1) % reviews.length);
  const prev = () => setIndex((i) => (i - 1 + reviews.length) % reviews.length);
  // const handleSelect = (selectedIndex) => {
  //   setIndex(selectedIndex);
  // };

  return (
     <div className="bg-light py-5 text-center">
      <h2 className="mb-4">{t("testimonials.heading")}</h2>

      <div className="relative w-full max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="p-4"
          >
            <p className="lead">“{reviews[index].text}”</p>
            <h6 className="text-muted">— {reviews[index].author}</h6>
          </motion.div>
        </AnimatePresence>

       <div className="mt-4 flex justify-center space-x-3">
  <button
    className="w-auto inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
    onClick={prev}
    type="button"
  >
    <FiChevronLeft className="text-base" />
    <span className="hidden sm:inline">{t("testimonials.prev")}</span>
  </button>
  <button
    className="w-auto inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
    onClick={next}
    type="button"
  >
    <span className="hidden sm:inline">{t("testimonials.next")}</span>
    <FiChevronRight className="text-base" />
  </button>
</div>
      </div>
    </div>
  );

}

export default ReviewsCarousel;
