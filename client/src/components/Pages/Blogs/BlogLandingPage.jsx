// src/components/Pages/Blog/BlogLandingPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  CardText,
  Container,
  Button,
  Input,
} from "reactstrap";
import { Image } from "react-bootstrap";
import {
  FaSearch,
  FaRegNewspaper,
  FaBullhorn,
  FaShieldAlt,
  FaArrowRight,
} from "react-icons/fa";
import Logo from "/src/assets/img/cleanar-logo.png";
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";

function BlogLandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [query, setQuery] = useState("");

  const goToQuote = () => {
    navigate("/index?scrollToQuote=true");
  };

  useEffect(() => {
    document.body.classList.add("index-page", "sidebar-collapse");
    return () => {
      document.body.classList.remove("index-page", "sidebar-collapse");
    };
  }, []);

  /**
   * BLOG POSTS (manual list for now)
   * - Add new entries here as you create new blog components/routes.
   * - "category" is used to group sections on the page.
   */
  const posts = useMemo(
    () => [
      {
        id: "issa-canada",
        title: "CleanAR Solutions Joins ISSA Canada: Raising the Bar for Professional Cleaning in Toronto",
        excerpt:
          "We’re now an official ISSA Canada Member — a milestone that reinforces our commitment to recognized industry standards, training, and consistent results.",
        category: "Professional Standards",
        dateLabel: "Company News",
        to: "/blog/cleanar-solutions-joins-issa-canada",
        icon: <FaShieldAlt className="me-2" />,
      },
      {
        id: "cqcc-lgbtbe",
        title: "CleanAR Solutions is Now an LGBTQ+ Certified Supplier (LGBTBE) Through CQCC",
        excerpt:
          "CleanAR is now officially recognized as an LGBTQ+ Certified Supplier (LGBTBE) through CQCC — supporting inclusive procurement for organizations that track supplier diversity.",
        category: "Supplier Diversity",
        dateLabel: "Company News",
        to: "/blog/cleanar-joins-cqcc",
        icon: <FaBullhorn className="me-2" />,
      },
    ],
    []
  );

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;

    return posts.filter((p) => {
      const haystack = `${p.title} ${p.excerpt} ${p.category} ${p.dateLabel}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [posts, query]);

  const grouped = useMemo(() => {
    return filteredPosts.reduce((acc, post) => {
      const key = post.category || "More Articles";
      acc[key] = acc[key] || [];
      acc[key].push(post);
      return acc;
    }, {});
  }, [filteredPosts]);

  // Header name suggestion for the sections (category header):
  // - "Insights & Updates" (overall)
  // - Per section: "Company News", "Professional Standards", "Supplier Diversity"
  // Here we use category names as section headers.

  return (
    <div className="section pb-0 mb-0 light-bg-color-opaque">
      <VisitorCounter page="blog_landing" />

      {/* Hero Banner */}
      <Container>
        <Row className="px-4 py-5 align-items-center">
          <Col xs="12" md="6" className="text-center text-md-start mb-4 mb-md-0">
            <Image
              alt="CleanAR Solutions Logo"
              src={Logo}
              className="img-fluid"
              style={{ maxWidth: "350px", transition: "transform 0.3s" }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </Col>

          <Col xs="12" md="6">
            <h1 className="text-primary fw-bold mb-3">
              {t?.("blog.title") || "CleanAR Insights & Updates"}
            </h1>

            <p className="fs-5 text-secondary">
              {t?.("blog.subtitle") ||
                "Company news, professional standards, and practical cleaning insights — written for homeowners and businesses across Toronto."}
            </p>

            <div className="d-flex flex-column flex-sm-row gap-2 mt-3">
              <Button onClick={goToQuote} className="btn btn-lg primary-bg-color">
                {t?.("blog.ctaQuote") || "Request a Quote"}
              </Button>

              <Link to="/products-and-services" className="btn btn-lg btn-success">
                {t?.("blog.ctaServices") || "View Services"}
              </Link>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Search / Highlights */}
      <Container className="my-4">
        <Row className="justify-content-center">
          <Col md="10">
            <Card className="shadow-sm border-0 bg-transparent">
              <CardHeader className="bg-secondary text-white fw-bold d-flex align-items-center justify-content-between">
                <span className="d-inline-flex align-items-center">
                  <FaRegNewspaper className="me-2" />
                  {t?.("blog.latestHeader") || "Browse Articles"}
                </span>

                <span className="small fw-semibold opacity-75">
                  {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
                </span>
              </CardHeader>

              <CardBody className="bg-transparent">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FaSearch className="text-secondary" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t?.("blog.searchPlaceholder") || "Search posts (e.g., ISSA, CQCC, standards...)"}
                  />
                </div>

                {Object.keys(grouped).length === 0 ? (
                  <p className="text-secondary mb-0">
                    No posts found for “{query}”.
                  </p>
                ) : (
                  Object.entries(grouped).map(([sectionTitle, sectionPosts]) => (
                    <div key={sectionTitle} className="mb-4">
                      {/* Section Header Name (decent header name for the sections) */}
                      <h2 className="fw-bold mb-3">
                        {sectionTitle === "Professional Standards"
                          ? (t?.("blog.sections.professional") || "Professional Standards")
                          : sectionTitle === "Supplier Diversity"
                          ? (t?.("blog.sections.diversity") || "Supplier Diversity")
                          : (t?.("blog.sections.more") || sectionTitle)}
                      </h2>

                      <Row>
                        {sectionPosts.map((post) => (
                          <Col md="6" className="mb-4" key={post.id}>
                            <Card className="h-100 shadow-sm border-0 bg-transparent">
                              <CardHeader className="bg-primary text-white fw-bold">
                                <span className="d-inline-flex align-items-center">
                                  {post.icon}
                                  {post.dateLabel}
                                </span>
                              </CardHeader>

                              <CardBody className="bg-transparent d-flex flex-column">
                                <div className="mb-2 text-uppercase text-muted small fw-semibold">
                                  {post.category}
                                </div>

                                <h3 className="fw-bold mb-2" style={{ lineHeight: 1.2 }}>
                                  {post.title}
                                </h3>

                                <CardText className="text-secondary">
                                  {post.excerpt}
                                </CardText>

                                <div className="mt-auto d-flex justify-content-between align-items-center">
                                  <Link to={post.to} className="btn btn-outline-primary">
                                    Read More <FaArrowRight className="ms-2" />
                                  </Link>

                                  {/* Optional “featured” indicator, etc. */}
                                </div>
                              </CardBody>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Call to Action */}
      <Container className="text-center py-5">
        <h2 className="fw-bold text-dark mb-3">
          {t?.("blog.ctaTitle") || "Need a cleaning plan you can count on?"}
        </h2>
        <p className="text-bold mb-4">
          {t?.("blog.ctaDesc") ||
            "Tell us what type of space you have, and we’ll send a clear quote — with flexible options for your schedule and budget."}
        </p>
        <Button onClick={goToQuote} className="btn btn-lg primary-bg-color">
          {t?.("blog.ctaButton") || "Get a Free Quote"}
        </Button>
      </Container>
    </div>
  );
}

export default BlogLandingPage;
