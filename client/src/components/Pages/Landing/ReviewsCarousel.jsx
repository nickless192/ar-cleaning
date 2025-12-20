import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import NewIconAnimated from "/src/components/Pages/Navigation/NewIconAnimated";

function ReviewsCarousel() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  const reviews = [
    {
      text: "CleaAR Solutions has been outstanding each time I've used them. They leave every room absolutely spotless, paying attention to every corner and surface. The team is not only thorough but also incredibly kind and professional throughout the entire process. This is hands-down the best cleaning service I've ever used, and I highly recommend CleaAR Solutions to anyone seeking top-notch cleaning.",
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
    
  ];

  const next = () => setIndex((i) => (i + 1) % reviews.length);
  const prev = () => setIndex((i) => (i - 1 + reviews.length) % reviews.length);

  const renderStars = (count) => {
    const starsArray = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= count) starsArray.push(<FaStar key={i} className="text-warning" />);
      else starsArray.push(<FaRegStar key={i} className="text-warning" />);
    }
    return starsArray;
  };

  return (
    <div className="py-5">
      <Container>
        <h2 className="text-center mb-4 montserrat-bold">{t("testimonials.heading")}</h2>
        <h6 className="text-center mb-4 fst-italic">{t("testimonials.subheading")}</h6>
        <Row className="justify-content-center">
          <Col xs={10} md={8} className="text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="p-4 border rounded shadow-sm bg-white"
              >
                <div className="mb-3">{renderStars(reviews[index].stars)}</div>
                <p className="lead fst-italic">“{reviews[index].text}”</p>
                <h6 className="text-muted mt-3">— {reviews[index].author}</h6>
              </motion.div>
            </AnimatePresence>

            <div className="d-flex justify-content-center gap-3 mt-4">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={prev}
                aria-label="Previous Review"
              >
                <FiChevronLeft /> {t("testimonials.prev")}
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={next}
                aria-label="Next Review"
              >
                {t("testimonials.next")} <FiChevronRight />
              </Button>
            </div>
          </Col>
        </Row>
        {/* add a statement inviting customer to visit our google profile and provide the link */}
        <Row className="justify-content-center">
          <Col xs={10} md={8} className="text-center">
            <p className="mt-4 text-bold">
              {t("testimonials.visitGoogleProfile")}
              <a href="https://g.co/kgs/7jGzM3E" target="_blank" rel="noopener noreferrer">
                {' '}{t("testimonials.googleProfileLink")}
              </a>
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ReviewsCarousel;
