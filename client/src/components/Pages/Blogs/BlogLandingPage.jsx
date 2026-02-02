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
  Badge,
} from "reactstrap";
import { Image } from "react-bootstrap";
import {
  FaSearch,
  FaRegNewspaper,
  FaBullhorn,
  FaShieldAlt,
  FaArrowRight,
  FaTimes,
  FaSlidersH,
} from "react-icons/fa";
import Logo from "/src/assets/img/cleanar-logo.png";
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter.jsx";

function BlogLandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest"); // newest | a-z

  const goToQuote = () => navigate("/index?scrollToQuote=true");

  useEffect(() => {
    document.body.classList.add("index-page", "sidebar-collapse");
    return () => {
      document.body.classList.remove("index-page", "sidebar-collapse");
    };
  }, []);

  /**
   * Categories should use stable IDs (NOT translated strings),
   * and translation happens at render-time.
   */
  const CATEGORY_ALL = "all";
  const CATEGORY_PRO = "professional";
  const CATEGORY_DIVERSITY = "diversity";
  const CATEGORY_MORE = "more";

  /**
   * BLOG POSTS (manual list for now)
   * - Use translation keys for title/excerpt/dateLabel/categoryLabel.
   * - Keep categoryId stable for filtering/grouping across languages.
   */
  const posts = useMemo(
    () => [
      {
        id: "issa-canada",
        titleKey: "blog.posts.issa.title",
        excerptKey: "blog.posts.issa.excerpt",
        categoryId: CATEGORY_PRO,
        categoryLabelKey: "blog.sections.professional",
        dateLabelKey: "blog.labels.companyNews",
        to: "/blog/cleanar-solutions-joins-issa-canada",
        icon: <FaShieldAlt className="me-2" />,
        featured: true,
        tags: ["ISSA", "Standards", "Training"],
      },
      {
        id: "cqcc-lgbtbe",
        titleKey: "blog.posts.cqcc.title",
        excerptKey: "blog.posts.cqcc.excerpt",
        categoryId: CATEGORY_DIVERSITY,
        categoryLabelKey: "blog.sections.diversity",
        dateLabelKey: "blog.labels.companyNews",
        to: "/blog/cleanar-joins-cqcc",
        icon: <FaBullhorn className="me-2" />,
        featured: true,
        tags: ["CQCC", "LGBTBE", "Supplier Diversity"],
      },
    ],
    []
  );

  const categories = useMemo(
    () => [
      { id: CATEGORY_ALL, label: t("blog.filters.all") },
      { id: CATEGORY_PRO, label: t("blog.sections.professional") },
      { id: CATEGORY_DIVERSITY, label: t("blog.sections.diversity") },
    ],
    [t]
  );

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = posts;

    if (activeCategory !== CATEGORY_ALL) {
      list = list.filter((p) => p.categoryId === activeCategory);
    }

    if (q) {
      list = list.filter((p) => {
        // Search against translated strings so it works in EN/ES/FR
        const title = t(p.titleKey);
        const excerpt = t(p.excerptKey);
        const category = t(p.categoryLabelKey);
        const dateLabel = t(p.dateLabelKey);

        const haystack = `${title} ${excerpt} ${category} ${dateLabel} ${(p.tags || []).join(" ")}`
          .toLowerCase()
          .trim();

        return haystack.includes(q);
      });
    }

    if (sortBy === "a-z") {
      list = [...list].sort((a, b) => t(a.titleKey).localeCompare(t(b.titleKey)));
    } else {
      list = [...list].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    }

    return list;
  }, [posts, query, activeCategory, sortBy, t]);

  const grouped = useMemo(() => {
    if (activeCategory !== CATEGORY_ALL) {
      return {
        [activeCategory]: filteredPosts,
      };
    }

    return filteredPosts.reduce((acc, post) => {
      const key = post.categoryId || CATEGORY_MORE;
      acc[key] = acc[key] || [];
      acc[key].push(post);
      return acc;
    }, {});
  }, [filteredPosts, activeCategory]);

  const featured = useMemo(() => posts.filter((p) => p.featured), [posts]);

  // Lightweight inline styles (no external CSS required)
  const styles = {
    page: {
      background:
        "radial-gradient(1200px 600px at 20% 0%, rgba(13,110,253,0.10), transparent 60%), radial-gradient(900px 450px at 90% 10%, rgba(25,135,84,0.10), transparent 55%), linear-gradient(180deg, rgba(248,249,250,1) 0%, rgba(255,255,255,1) 35%, rgba(248,249,250,1) 100%)",
    },
    heroCard: {
      borderRadius: 18,
      overflow: "hidden",
      border: "1px solid rgba(0,0,0,0.06)",
      background:
        "linear-gradient(135deg, rgba(13,110,253,0.12) 0%, rgba(25,135,84,0.10) 45%, rgba(255,255,255,1) 100%)",
    },
    pill: {
      borderRadius: 999,
      border: "1px solid rgba(0,0,0,0.08)",
      background: "rgba(255,255,255,0.8)",
      backdropFilter: "blur(6px)",
    },
    searchWrap: {
      borderRadius: 16,
      border: "1px solid rgba(0,0,0,0.08)",
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(8px)",
    },
    postCard: {
      borderRadius: 16,
      border: "1px solid rgba(0,0,0,0.07)",
      transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
      background: "rgba(255,255,255,0.9)",
      backdropFilter: "blur(6px)",
    },
    postCardHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 14px 30px rgba(0,0,0,0.10)",
      borderColor: "rgba(13,110,253,0.20)",
    },
    sectionTitle: {
      letterSpacing: "-0.02em",
    },
  };

  // Helper component
  const CategoryPill = ({ label, active, onClick }) => (
    <Button
      type="button"
      color={active ? "primary" : "light"}
      onClick={onClick}
      className="px-3 py-2 d-inline-flex align-items-center gap-2"
      style={{
        borderRadius: 999,
        border: active ? "1px solid rgba(13,110,253,0.35)" : "1px solid rgba(0,0,0,0.08)",
        background: active ? undefined : "rgba(255,255,255,0.75)",
      }}
    >
      <span className="fw-semibold">{label}</span>
    </Button>
  );

  const PostCard = ({ post }) => {
    const [hover, setHover] = useState(false);

    const dateLabel = t(post.dateLabelKey);
    const categoryLabel = t(post.categoryLabelKey);
    const title = t(post.titleKey);
    const excerpt = t(post.excerptKey);

    return (
      <Card
        className="h-100"
        style={{
          ...styles.postCard,
          ...(hover ? styles.postCardHover : {}),
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <CardHeader
          className="d-flex align-items-center justify-content-between"
          style={{
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            background: "transparent",
            paddingTop: 14,
            paddingBottom: 14,
          }}
        >
          <div className="d-inline-flex align-items-center">
            <span className="d-inline-flex align-items-center text-primary fw-bold">
              {post.icon}
              {dateLabel}
            </span>

            {post.featured ? (
              <Badge color="success" className="ms-2" pill>
                {t("blog.featured")}
              </Badge>
            ) : null}
          </div>

          <Badge
            text="dark"
            pill
            className="d-none d-md-inline-flex"
            style={{ border: "1px solid rgba(0,0,0,0.08)" }}
          >
            {categoryLabel}
          </Badge>
        </CardHeader>

        <CardBody className="d-flex flex-column">
          <div className="mb-2 d-md-none">
            <Badge
              color="light"
              text="dark"
              pill
              style={{ border: "1px solid rgba(0,0,0,0.08)" }}
            >
              {categoryLabel}
            </Badge>
          </div>

          <h3 className="fw-bold mb-2" style={{ lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            {title}
          </h3>

          <CardText className="text-secondary" style={{ marginBottom: 14 }}>
            {excerpt}
          </CardText>

          {Array.isArray(post.tags) && post.tags.length ? (
            <div className="d-flex flex-wrap gap-2 mb-3">
              {post.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="px-2 py-1 small" style={styles.pill}>
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-auto d-flex align-items-center justify-content-between">
            <Link to={post.to} className="btn btn-outline-primary d-inline-flex align-items-center">
              {t("blog.readMore")} <FaArrowRight className="ms-2" />
            </Link>

            <span className="small text-muted d-none d-sm-inline">{t("blog.readTime")}</span>
          </div>
        </CardBody>
      </Card>
    );
  };

  const activeCategoryLabel =
    activeCategory === CATEGORY_ALL
      ? t("blog.filters.all")
      : activeCategory === CATEGORY_PRO
      ? t("blog.sections.professional")
      : activeCategory === CATEGORY_DIVERSITY
      ? t("blog.sections.diversity")
      : t("blog.sections.more");

  const sectionTitleForGroup = (categoryId) => {
    switch (categoryId) {
      case CATEGORY_PRO:
        return t("blog.sections.professional");
      case CATEGORY_DIVERSITY:
        return t("blog.sections.diversity");
      default:
        return t("blog.sections.more");
    }
  };

  return (
    <div className="section pb-0 mb-0" style={styles.page}>
      <VisitorCounter page="blog_landing" />

      {/* HERO */}
      <Container className="pt-4">
        <Card className="shadow-sm" style={styles.heroCard}>
          <CardBody className="p-4 p-md-5">
            <Row className="align-items-center gy-4">
              <Col xs="12" md="5" className="text-center text-md-start">
                <Image
                  alt={t("blog.logoAlt", { defaultValue: "CleanAR Solutions Logo" })}
                  src={Logo}
                  className="img-fluid"
                  style={{
                    maxWidth: "320px",
                    filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.12))",
                    transition: "transform 220ms ease",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />

                <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2 mt-3">
                  <span className="px-3 py-2 small" style={styles.pill}>
                    <FaRegNewspaper className="me-2 text-primary" />
                    {t("blog.pill1")}
                  </span>
                  <span className="px-3 py-2 small" style={styles.pill}>
                    <FaShieldAlt className="me-2 text-primary" />
                    {t("blog.pill2")}
                  </span>
                  <span className="px-3 py-2 small" style={styles.pill}>
                    <FaBullhorn className="me-2 text-primary" />
                    {t("blog.pill3")}
                  </span>
                </div>
              </Col>

              <Col xs="12" md="7">
                <h1 className="fw-bold mb-2" style={{ letterSpacing: "-0.03em" }}>
                  {t("blog.title")}
                </h1>

                <p className="fs-5 text-secondary mb-3" style={{ maxWidth: 760 }}>
                  {t("blog.subtitle")}
                </p>

                <div className="d-flex flex-column flex-sm-row gap-2 mt-3">
                  <Button onClick={goToQuote} className="btn btn-lg primary-bg-color">
                    {t("blog.ctaQuote")}
                  </Button>

                  <Link to="/products-and-services" className="btn btn-lg btn-success">
                    {t("blog.ctaServices")}
                  </Link>
                </div>

                <div className="mt-3 small text-muted">
                  {t("blog.metaCount")}: <span className="fw-semibold">{posts.length}</span>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>

      {/* FEATURED STRIP */}
      {featured.length > 0 ? (
        <Container className="mt-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h2 className="h5 fw-bold mb-0" style={styles.sectionTitle}>
              {t("blog.featured")}
            </h2>
            <span className="small text-muted">{t("blog.updated")}</span>
          </div>

          <Row className="g-3">
            {featured.slice(0, 2).map((p) => (
              <Col key={p.id} xs="12" md="6">
                <PostCard post={p} />
              </Col>
            ))}
          </Row>
        </Container>
      ) : null}

      {/* SEARCH + FILTERS */}
      <Container className="mt-4">
        <Card className="shadow-sm" style={styles.searchWrap}>
          <CardBody className="p-3 p-md-4">
            <Row className="align-items-center gy-3">
              <Col xs="12" md="6">
                <div
                  className="d-flex align-items-center gap-2 px-3 py-2"
                  style={{
                    borderRadius: 14,
                    border: "1px solid rgba(0,0,0,0.10)",
                    background: "rgba(255,255,255,0.95)",
                  }}
                >
                  <FaSearch className="text-secondary" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("blog.searchPlaceholder")}
                    style={{ border: "none", boxShadow: "none" }}
                  />
                  {query ? (
                    <Button
                      type="button"
                      color="link"
                      className="p-0 text-muted"
                      onClick={() => setQuery("")}
                      aria-label={t("blog.clearSearch")}
                    >
                      <FaTimes />
                    </Button>
                  ) : null}
                </div>

                <div className="mt-2 small text-muted">
                  {filteredPosts.length}{" "}
                  {filteredPosts.length === 1 ? t("blog.count.post") : t("blog.count.posts")}{" "}
                  {activeCategory !== CATEGORY_ALL ? (
                    <>
                      {t("blog.count.in")} <span className="fw-semibold">{activeCategoryLabel}</span>
                    </>
                  ) : null}
                </div>
              </Col>

              <Col xs="12" md="6">
                <div className="d-flex flex-wrap justify-content-md-end gap-2">
                  <div className="d-flex align-items-center gap-2 me-md-2">
                    <FaSlidersH className="text-secondary" />
                    <span className="small text-muted">{t("blog.filter")}</span>
                  </div>

                  {categories.map((cat) => (
                    <CategoryPill
                      key={cat.id}
                      label={cat.label}
                      active={activeCategory === cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                    />
                  ))}

                  <Button
                    type="button"
                    color="light"
                    className="px-3 py-2"
                    onClick={() => setSortBy((s) => (s === "newest" ? "a-z" : "newest"))}
                    style={{
                      borderRadius: 999,
                      border: "1px solid rgba(0,0,0,0.08)",
                      background: "rgba(255,255,255,0.75)",
                    }}
                    title={t("blog.sortToggle")}
                  >
                    <span className="fw-semibold">
                      {sortBy === "newest" ? t("blog.sortNewest") : t("blog.sortAZ")}
                    </span>
                  </Button>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>

      {/* CONTENT */}
      <Container className="mt-4 mb-5">
        {Object.keys(grouped).length === 0 ? (
          <Card className="shadow-sm border-0" style={{ borderRadius: 18 }}>
            <CardBody className="p-4 p-md-5 text-center">
              <div className="mb-2" style={{ fontSize: 34 }}>
                🧼
              </div>
              <h2 className="fw-bold mb-2">{t("blog.emptyTitle")}</h2>
              <p className="text-secondary mb-4" style={{ maxWidth: 560, margin: "0 auto" }}>
                {t("blog.emptyDesc")}
              </p>
              <div className="d-flex justify-content-center gap-2 flex-wrap">
                <Button color="primary" onClick={() => setQuery("")}>
                  {t("blog.clearSearch")}
                </Button>
                <Button color="light" onClick={() => setActiveCategory(CATEGORY_ALL)}>
                  {t("blog.clearFilters")}
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          Object.entries(grouped).map(([categoryId, sectionPosts]) => (
            <div key={categoryId} className="mb-4 mb-md-5">
              <div className="d-flex align-items-end justify-content-between mb-3">
                <div>
                  <h2 className="fw-bold mb-1" style={styles.sectionTitle}>
                    {sectionTitleForGroup(categoryId)}
                  </h2>
                  <div className="text-muted small">{t("blog.sectionHint")}</div>
                </div>

                <Badge
                  color="light"
                  text="dark"
                  pill
                  style={{ border: "1px solid rgba(0,0,0,0.08)" }}
                >
                  {sectionPosts.length}
                </Badge>
              </div>

              <Row className="g-3">
                {sectionPosts.map((post) => (
                  <Col lg="4" md="6" xs="12" key={post.id}>
                    <PostCard post={post} />
                  </Col>
                ))}
              </Row>
            </div>
          ))
        )}
      </Container>

      {/* CTA */}
      <Container className="pb-5">
        <Card className="shadow-sm border-0" style={{ borderRadius: 18 }}>
          <CardBody className="p-4 p-md-5 text-center">
            <h2 className="fw-bold mb-2">{t("blog.ctaTitle")}</h2>
            <p className="text-secondary mb-4" style={{ maxWidth: 760, margin: "0 auto" }}>
              {t("blog.ctaDesc")}
            </p>
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <Button onClick={goToQuote} className="btn btn-lg primary-bg-color">
                {t("blog.ctaButton")}
              </Button>
              <Link to="/products-and-services" className="btn btn-lg btn-outline-success">
                {t("blog.ctaSecondary")}
              </Link>
            </div>
          </CardBody>
        </Card>

        <div className="text-center mt-3 small text-muted">
          © {new Date().getFullYear()} CleanAR Solutions
        </div>
      </Container>
    </div>
  );
}

export default BlogLandingPage;
