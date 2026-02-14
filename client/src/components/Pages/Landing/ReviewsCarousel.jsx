import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaStar, FaRegStar } from "react-icons/fa";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

function ReviewsCarousel() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const reviews = useMemo(
    () =>  [
    {
      text: "CleanAR Solutions has been outstanding each time I've used them. They leave every room absolutely spotless, paying attention to every corner and surface. The team is not only thorough but also incredibly kind and professional throughout the entire process. This is hands-down the best cleaning service I've ever used, and I highly recommend CleanAR Solutions to anyone seeking top-notch cleaning.",
      author: "James F.M.",
      stars: 5,
      source: "Google Reviews",
    },
    {
      text: "Excellent services, windows cleaning, washroom deep clean and regular cleaning. Always on time! I’m really happy with their service, price and quality!",
      author: "Luis BM",
      stars: 5,
      source: "Google Reviews",
    },
    {
      text: "Absolutely amazing service! The team was professional, punctual, and very detail-oriented. My home looked spotless and fresh after their visit. They went above and beyond to make sure everything was perfect. I highly recommend this cleaning company to anyone looking for reliable and top-quality service.",
      author: "Maria B.",
      stars: 5,
      source: "Google Reviews",
    },
    {
      text: "I’ve used CleanAR Solutions a number of times over the past few months, and every single time they’ve gone above and beyond. Walking into a spotless home after a long day feels incredible, and their attention to detail never disappoints. Reliable, thorough, and truly professional - I wouldn’t hesitate for a second to recommend them!",
      author: "Mark B.",
      stars: 5,
      source: "Google Reviews",
    },
    {
      text: "Highly recommend the team at CleanARSolutions! My house was sparkling from top to bottom! They even got some stains out that my previous cleaner couldn’t!",
      author: "Shimki C.",
      stars: 5,
      source: "Google Reviews", 
    },
    {
      text: "Great experience! Our home was left spotless and fresh. Very reliable, thorough, and professional. Highly recommend!",
      author: "Ali S.",
      stars: 5,
      source: "Google Reviews",
    },
    {
      text: "Just moved to my new condo and used CleanAR Salution for a deep clean - absolutely fantastic service -Fili & Omar-! Their team was professional, thorough, and made my new place spotless. The attention to detail was impressive, and they left everything pristine for my move-in. Highly recommend CleanAR for anyone needing quality cleaning services!",
      author: "Angel G.",
      stars: 5,
      source: "Google Reviews",
    },
    {
      text: `So happy to have found CleanAR solutions. They were highly recommended by my sister. Filiberto and Marian cleans our home so well! They are kind, thorough, efficient and so professional! We really appreciate the reasonable price, availability, and their variety of cleaning options. Thank you CleanAR for servicing our home!`,
      author: "Seya D.",
      stars: 5,
      source: "Google Reviews",
    },
    {
      text: "We recently hired Fili from Cleanar Solutions to clean our windows, and they did an absolutely fantastic job! From start to finish, their service was professional, efficient, and incredibly thorough. Our windows have never looked this spotless and bright. Fili’s attention to detail was evident, and he ensured every window sparkled by the time they were done. Not only was the quality of their work impressive, but they were on time, friendly and provided excellent service at a reasonable price. We couldn't be happier with the results and would highly recommend Cleanar Solutions to anyone looking for top-notch cleaning. Thank you, Cleanar Solutions!",
      author: "Nikita C.",
      stars: 5,
      source: "Google Reviews",
    },
    {
      text: "Booking CleanAR Solutions was fast and easy to do! They were super professional and left the place looking shiny and new! They did a deep clean of our bathroom, and steam cleaned our carpet. The tile has never sparkled so bright, they put everything back in its place, and we had an overall great experience. We will definitely be using their services again for our next job.",
      author: "Alex C.",
      stars: 5,
      source: "Google Reviews",
    },
    
  ],
    []
  );

  const next = () => {
    setExpanded(false);
    setIndex((i) => (i + 1) % reviews.length);
  };

  const prev = () => {
    setExpanded(false);
    setIndex((i) => (i - 1 + reviews.length) % reviews.length);
  };

  const renderStars = (count) => {
    const starsArray = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= count) starsArray.push(<FaStar key={i} className="text-warning" />);
      else starsArray.push(<FaRegStar key={i} className="text-warning" />);
    }
    return starsArray;
  };

  // Truncate long reviews to keep the carousel “punchy”
  const MAX_CHARS = 220;
  const active = reviews[index];
  const isLong = active.text.length > MAX_CHARS;
  const shownText = expanded || !isLong ? active.text : `${active.text.slice(0, MAX_CHARS).trim()}…`;

  return (
    <div className="py-5">
      <Container>
        <h2 className="text-center mb-2 montserrat-bold">{t("testimonials.heading")}</h2>
        <h6 className="text-center mb-4 fst-italic">{t("testimonials.subheading")}</h6>

        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8} className="text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
                className="p-4 border rounded shadow-sm bg-white"
                style={{
                  minHeight: 260, // ✅ reduces layout jumping
                  touchAction: "pan-y",
                }}
                // ✅ swipe support
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) next();
                  if (info.offset.x > 60) prev();
                }}
              >
                <div className="mb-2">{renderStars(active.stars)}</div>

                <p className="lead fst-italic mb-2">“{shownText}”</p>

                {isLong && (
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-decoration-none p-0"
                    onClick={() => setExpanded((v) => !v)}
                  >
                    {expanded ? (t("testimonials.readLess") || "Read less") : (t("testimonials.readMore") || "Read more")}
                  </button>
                )}

                <div className="mt-3 text-muted">
                  <div className="fw-semibold">— {active.author}</div>
                  <div className="small">{active.source}</div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="d-flex justify-content-center gap-2 mt-3 flex-wrap">
              {reviews.slice(0, 7).map((_, i) => {
                // show first 7 dots to avoid huge dot rows; adjust if you prefer all
                const activeDot = i === index;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setExpanded(false);
                      setIndex(i);
                    }}
                    aria-label={`Go to review ${i + 1}`}
                    className="btn p-0"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      border: "none",
                      background: activeDot ? "#6c757d" : "#d1d5db",
                    }}
                  />
                );
              })}
            </div>

            <div className="d-flex justify-content-center gap-3 mt-3">
              <Button variant="outline-secondary" size="sm" onClick={prev} aria-label="Previous Review">
                <FiChevronLeft /> {t("testimonials.prev")}
              </Button>

              <Button variant="outline-secondary" size="sm" onClick={next} aria-label="Next Review">
                {t("testimonials.next")} <FiChevronRight />
              </Button>
            </div>

            <p className="mt-4 fw-semibold">
              {t("testimonials.visitGoogleProfile")}{" "}
              <a href="https://g.co/kgs/7jGzM3E" target="_blank" rel="noopener noreferrer">
                {t("testimonials.googleProfileLink")}
              </a>
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ReviewsCarousel;
