import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
    Container,
    Form,
    Row,
    Col,
    Button,
    ProgressBar,
    Alert,
    Badge,
    Card,
    Accordion
} from "react-bootstrap";
import { FaCheckCircle, FaChevronLeft, FaChevronRight, FaTag } from "react-icons/fa";

import Auth from "/src/utils/auth";
import { generatePDF } from "/src/utils/generatePDF";

// -----------------------------
// Premium SaaS Quote Request (V2)
// -----------------------------

const DRAFT_KEY = "cleanar_quote_draft_v2";

const QuoteRequest = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const isLogged = useMemo(() => Auth.loggedIn(), []);
    const [step, setStep] = useState(1);

    // Core data
    const [formData, setFormData] = useState({
        name: "",
        companyName: "",
        email: "",
        phonenumber: "",
        postalcode: "",
        promoCode: "",
        services: [], // [{ category, type, customOptions }]
        products: [],
        userId: "",
        subtotalCost: 0,
        tax: 0,
        grandTotal: 0,
    });

    // UX state
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [errors, setErrors] = useState({});
    const [banner, setBanner] = useState({ variant: "", msg: "" });

    // Promo
    const [promoStatus, setPromoStatus] = useState({ state: "idle", msg: "" }); // idle | valid | invalid

    // Focus management
    const firstFieldRef = useRef(null);

    // Services catalog (same logic as your original, but renamed for clarity)
    const serviceOptions = useMemo(
        () => ({
            Residential: ["House Cleaning", "Move-In/Out Cleaning", "Condominium Cleaning", "Residential Building Cleaning"],
            Commercial: ["Office Cleaning", "Industrial Cleaning", "Retail Cleaning"],
            "Carpet & Upholstery": ["Carpet Cleaning", "Upholstery Cleaning"],
            "Window Cleaning": ["Interior Window Cleaning", "Window Track & Sill Cleaning", "Glass Door Cleaning"],
            "Power/Pressure Washing": [
                "Driveway Cleaning",
                "Patio & Deck Cleaning",
                "Sidewalk Cleaning",
                "Exterior Siding Cleaning",
                "Fence Cleaning",
                "Garage Floor Cleaning",
            ],
        }),
        []
    );

    const categoryCards = useMemo(
        () => [
            { key: "Residential", title: t("quick_quote.form.serviceOptions.Residential Cleaning", "Residential Cleaning"), desc: t("quick_quote.v2.residential_desc", "Homes, condos, move-in/out, building units") },
            { key: "Commercial", title: t("quick_quote.form.serviceOptions.Commercial Cleaning", "Commercial Cleaning"), desc: t("quick_quote.v2.commercial_desc", "Offices, retail, industrial spaces") },
            { key: "Carpet & Upholstery", title: t("quick_quote.form.serviceOptions.Carpet And Upholstery", "Carpet & Upholstery"), desc: t("quick_quote.v2.carpet_desc", "Carpets, sofas, chairs, stain treatment") },
            { key: "Window Cleaning", title: t("quick_quote.form.serviceOptions.Window Cleaning", "Window Cleaning"), desc: t("quick_quote.v2.window_desc", "Interior windows, tracks & sills, doors") },
            { key: "Power/Pressure Washing", title: t("quick_quote.form.serviceOptions.Power/Pressure Washing", "Power/Pressure Washing"), desc: t("quick_quote.v2.power_desc", "Exterior surfaces, driveways, decks") },
        ],
        [t]
    );

    // Prefill from Auth + load draft
    useEffect(() => {
        // Load draft first
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (raw) {
                const draft = JSON.parse(raw);
                setFormData((prev) => ({ ...prev, ...draft }));
                setSelectedCategory(draft?.services?.[0]?.service || "");
                setSelectedType(draft?.services?.[0]?.type || "");
            }
        } catch {
            // ignore draft errors
        }

        // Query params behaviour (keeps your existing flow)
        const searchParams = new URLSearchParams(location.search);
        const scrollToQuote = searchParams.get("scrollToQuote");
        const promoCode = searchParams.get("promoCode");
        const serviceClicked = searchParams.get("service");

        if (promoCode) {
            setFormData((prev) => ({ ...prev, promoCode }));
        }

        if (serviceClicked) {
            // Try map old keys (original) to new categories when possible
            // If serviceClicked equals category name, set it; otherwise ignore.
            const normalized = String(serviceClicked || "").trim();
            const categoryMatch = Object.keys(serviceOptions).find((k) => k.toLowerCase() === normalized.toLowerCase());
            if (categoryMatch) setSelectedCategory(categoryMatch);
        }

        if (isLogged) {
            const data = Auth.getProfile()?.data;
            if (data) {
                setFormData((prev) => ({
                    ...prev,
                    name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
                    email: data.email || "",
                    phonenumber: data.telephone || "",
                    postalcode: data.postalcode || "",
                    companyName: data.companyName || "",
                    userId: data._id || "",
                }));
            }
        }

        if (scrollToQuote) {
            setTimeout(() => firstFieldRef.current?.focus?.(), 150);
        }
    }, [isLogged, location.search, serviceOptions]);

    // Autosave
    useEffect(() => {
        const draft = {
            ...formData,
            // avoid saving totals-only derived? okay to keep
        };
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        } catch {
            // ignore
        }
    }, [formData]);

    // Totals
    const calculateTotals = useCallback(() => {
        const subtotalCost = (formData.services || []).reduce((total, service) => {
            return (
                total +
                Object.values(service.customOptions || {}).reduce((sum, option) => {
                    return sum + (option?.service ? option?.serviceCost || 0 : 0);
                }, 0)
            );
        }, 0);

        const tax = subtotalCost * 0.13;
        const grandTotal = subtotalCost + tax;

        setFormData((prev) => ({ ...prev, subtotalCost, tax, grandTotal }));
    }, [formData.services]);

    useEffect(() => {
        calculateTotals();
    }, [calculateTotals]);

    // Helpers
    const setField = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const setServiceCustomOption = (key, value, label) => {
        setFormData((prev) => {
            const services = prev.services?.length ? [...prev.services] : [];
            if (!services[0]) return prev;

            services[0] = {
                ...services[0],
                customOptions: {
                    ...(services[0].customOptions || {}),
                    [key]: {
                        service: value,
                        label: label || key,
                    },
                },
            };
            return { ...prev, services };
        });
    };

    const clearBanner = () => setBanner({ variant: "", msg: "" });

    const validPromoCodes = useMemo(
        () => new Set(["toronto15", "follow15", "now15", "start15", "fresh15", "secret15", "welcome15", "refresh15", "thankyou10"]),
        []
    );

    const validatePromo = useCallback(() => {
        const code = (formData.promoCode || "").trim().toLowerCase();
        if (!code) {
            setPromoStatus({ state: "idle", msg: "" });
            return true;
        }
        if (validPromoCodes.has(code)) {
            setPromoStatus({ state: "valid", msg: t("quick_quote.v2.promo_valid", "Promo code applied.") });
            return true;
        }
        setPromoStatus({ state: "invalid", msg: t("quick_quote.form.invalidPromoCode", "Invalid promo code.") });
        return false;
    }, [formData.promoCode, t, validPromoCodes]);

    // Step validation
    const validateStep = useCallback(() => {
        clearBanner();
        const e = {};

        if (step === 1) {
            if (!formData.name?.trim()) e.name = t("quick_quote.v2.required", "Required");
            if (!formData.email?.trim()) e.email = t("quick_quote.v2.required", "Required");
            if (!formData.phonenumber?.trim()) e.phonenumber = t("quick_quote.v2.required", "Required");
            // if (!formData.postalcode?.trim()) e.postalcode = t("quick_quote.v2.required", "Required");
            // promo optional, but if present validate inline
            if (formData.promoCode?.trim() && !validatePromo()) e.promoCode = t("quick_quote.form.invalidPromoCode", "Invalid promo code.");
        }

        if (step === 2) {
            if (!selectedCategory) {
                e.selectedCategory = t("quick_quote.v2.pick_category", "Please select a service category.");
            }
        }

        if (step === 3) {
            if (!selectedType) e.selectedType = t("quick_quote.v2.pick_type", "Please select a service type.");
        }

        if (step === 4) {
            if (!formData.postalcode?.trim()) e.postalcode = t("quick_quote.v2.required", "Required");
            // Require at least a preferred date for most services (good conversion + scheduling)
            const s0 = formData.services?.[0];
            const date = s0?.customOptions?.startDate?.service;
            if (!date) e.startDate = t("quick_quote.v2.pick_date", "Please choose a preferred date.");
            const pc = formData.postalcode?.trim().toUpperCase();
            const caPostalOk = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/.test(pc);
            if (!caPostalOk) e.postalcode = "Enter a valid postal code (e.g., M5V 2T6)";
            if (s0?.type === "Upholstery Cleaning") {
                const items = s0?.customOptions?.upholsterySelectedItems?.service;
                if (!Array.isArray(items) || items.length === 0) {
                    e.upholsterySelectedItems = "Select at least one upholstery item.";
                }
            }
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    }, [formData, selectedCategory, selectedType, step, t, validatePromo]);

    const goNext = () => {
        const ok = validateStep();
        if (!ok) {
            setBanner({ variant: "danger", msg: t("quick_quote.v2.fix_errors", "Please fix the highlighted fields to continue.") });
            return;
        }
        setStep((s) => Math.min(5, s + 1));
        setTimeout(() => firstFieldRef.current?.focus?.(), 120);
    };

    const goBack = () => {
        clearBanner();
        setStep((s) => Math.max(1, s - 1));
        setTimeout(() => firstFieldRef.current?.focus?.(), 120);
    };

    // Category selection
    const chooseCategory = (categoryKey) => {
        clearBanner();
        setSelectedCategory(categoryKey);
        setSelectedType("");

        // reset services when category changes
        setFormData((prev) => ({
            ...prev,
            services: [],
        }));
        setErrors((prev) => ({ ...prev, selectedCategory: "" }));
    };

    // Type selection creates the "service" object
    const chooseType = (type) => {
        clearBanner();
        setSelectedType(type);

        setFormData((prev) => ({
            ...prev,
            services: [
                {
                    service: selectedCategory,
                    type,
                    customOptions: prev.services?.[0]?.customOptions || {},
                },
            ],
        }));
        setErrors((prev) => ({ ...prev, selectedType: "" }));
    };

    // Reset
    const resetAll = () => {
        clearBanner();
        setErrors({});
        setPromoStatus({ state: "idle", msg: "" });
        setSelectedCategory("");
        setSelectedType("");
        setStep(1);
        setFormData({
            name: "",
            companyName: "",
            email: "",
            phonenumber: "",
            postalcode: "",
            promoCode: "",
            services: [],
            products: [],
            userId: isLogged ? Auth.getProfile()?.data?._id || "" : "",
            subtotalCost: 0,
            tax: 0,
            grandTotal: 0,
        });
        try {
            localStorage.removeItem(DRAFT_KEY);
        } catch {
            // ignore
        }
    };

    // Sanitization (keeps your backend stable)
    const sanitizeServices = (services) =>
        (services || []).map((service) => {
            const customOptions = service.customOptions || {};
            const sanitizedOptions = Object.keys(customOptions)
                .filter((k) => customOptions[k]?.service !== false && customOptions[k]?.service !== "" && customOptions[k]?.service != null)
                .reduce((acc, k) => {
                    acc[k] = customOptions[k];
                    return acc;
                }, {});
            return { ...service, customOptions: sanitizedOptions };
        });

    // Summary used for email payload (your old getTextSummary used DOM FormData; here we build a clean summary)
    const buildTextSummary = () => {
        const s0 = formData.services?.[0];
        const options = s0?.customOptions || {};
        const lines = [
            `<strong>Name:</strong> ${escapeHtml(formData.name)}`,
            `<strong>Email:</strong> ${escapeHtml(formData.email)}`,
            `<strong>Phone:</strong> ${escapeHtml(formData.phonenumber)}`,
            `<strong>Postal Code:</strong> ${escapeHtml(formData.postalcode)}`,
        ];

        if (formData.companyName) lines.push(`<strong>Company:</strong> ${escapeHtml(formData.companyName)}`);
        if (formData.promoCode) lines.push(`<strong>Promo Code:</strong> ${escapeHtml(formData.promoCode)}`);

        if (s0?.category) lines.push(`<strong>Service Category:</strong> ${escapeHtml(s0.category)}`);
        if (s0?.type) lines.push(`<strong>Service Type:</strong> ${escapeHtml(s0.type)}`);

        Object.keys(options).forEach((k) => {
            const label = options[k]?.label || k;
            const val = options[k]?.service;
            lines.push(`<strong>${escapeHtml(label)}:</strong> ${escapeHtml(String(val))}`);
        });

        return lines.join("<br>");
    };

    // Submit (keeps your endpoints)
    const handleSubmit = async () => {
        clearBanner();
        // console.log("Submitting quote request with data:", formData);

        // final validation (step 5)
        // validate promo again if present
        if (formData.promoCode?.trim() && !validatePromo()) {
            setStep(1);
            setBanner({ variant: "danger", msg: t("quick_quote.form.invalidPromoCode", "Invalid promo code.") });
            return;
        }

        // Must have service
        if (!formData.services?.length && !formData.products?.length) {
            setStep(2);
            setBanner({ variant: "danger", msg: t("quick_quote.form.requiredFields", "Required fields missing:") + " Service" });
            return;
        }

        const sanitizedServices = sanitizeServices(formData.services);
        const payloadData = { ...formData, services: sanitizedServices };

        const payload = {
            textSummary: buildTextSummary(),
            formData: payloadData,
        };

        try {
            // Email summary
            fetch("/api/email/quick-quote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }).catch(() => { /* non-blocking */ });

            // Save quote
            const response = await fetch("/api/quotes/quickquote", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(payloadData),
            });

            if (!response.ok) {
                setBanner({ variant: "danger", msg: t("quick_quote.form.submissionError", "Something went wrong. Please try again.") });
                return;
            }

            setBanner({ variant: "success", msg: t("quick_quote.form.submissionSuccess", "Quote submitted successfully!") });

            // Generate PDF then reset and redirect
            await generatePDF(payloadData, t);

            try {
                localStorage.removeItem(DRAFT_KEY);
            } catch {
                // ignore
            }

            // Soft reset (keeps success banner briefly)
            setTimeout(() => {
                resetAll();
                navigate("/products-and-services");
            }, 600);
        } catch (err) {
            setBanner({ variant: "danger", msg: t("quick_quote.form.submissionError", "Something went wrong. Please try again.") });
        }
    };

    const totalSteps = 5;
    const progress = Math.round((step / totalSteps) * 100);

    const activeServiceTypes = selectedCategory ? serviceOptions[selectedCategory] || [] : [];

    // Motion variants
    const panel = {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.22 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.18 } },
    };
    const formatPostal = (v) =>
        v.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^(.{3})(.*)$/, "$1 $2").trim();


    return (
        <>
            <Helmet>
                <title>CleanAR Solutions</title>
                <meta
                    name="description"
                    content="Get a quick service estimate from CleanAR Solutions. Fill out our form to receive a personalized quote for your cleaning needs."
                />
            </Helmet>

            <Container className="cleanar-quote-v2 my-4">
                <Row className="justify-content-center">
                    <Col lg={9} xl={8}>
                        <Card className="quoteShell shadow-sm border-0">
                            <Card.Body className="p-4 p-md-5">
                                {/* Header */}
                                <div className="d-flex align-items-start justify-content-between gap-3 mb-3 headerTop">
                                    <div>
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            {/* <Badge bg="light" text="dark" className="pillBadge">
                        {t("quick_quote.v2.free_quote", "Free Quote")}
                      </Badge> */}
                                            <Badge bg="light" text="dark" className="pillBadge">
                                                {t("quick_quote.v2.fast_response", "Fast response")}
                                            </Badge>
                                        </div>
                                        <h2 className="quoteTitle mb-1">
                                            {t("quick_quote.form.title", "Get a Free Quote")}
                                        </h2>
                                        <p className="quoteSubtitle mb-0">
                                            {t(
                                                "quick_quote.form.description",
                                                "Fill out the form below to receive a personalized quote for your cleaning needs. Our team will review your request and get back to you as soon as possible."
                                            )}
                                        </p>
                                    </div>

                                    <div className="text-end headerRight">
                                        <div className="stepText">
                                            {t("quick_quote.v2.step", "Step")} <strong>{step}</strong> / {totalSteps}
                                        </div>
                                        <ProgressBar now={progress} className="quoteProgress mt-2" />
                                    </div>
                                </div>

                                {banner.msg && (
                                    <Alert variant={banner.variant} className="mb-4">
                                        {banner.msg}
                                    </Alert>
                                )}

                                {/* Content */}
                                <AnimatePresence mode="wait">
                                    {step === 1 && (
                                        <motion.div key="step1" {...panel}>
                                            <SectionTitle
                                                title={t("quick_quote.v2.about_you", "About you")}
                                                subtitle={t("quick_quote.v2.about_you_sub", "Just the basics — we’ll use this to send your quote.")}
                                            />

                                            <Row className="g-3">
                                                <Col md={6}>
                                                    <Field
                                                        inputRef={firstFieldRef}
                                                        label={t("quick_quote.form.name", "Name")}
                                                        required
                                                        value={formData.name}
                                                        onChange={(v) => setField("name", v)}
                                                        placeholder={t("contact.form.name_placeholder", "Full Name")}
                                                        error={errors.name}
                                                        name="name"
                                                        type="text"
                                                    />
                                                </Col>

                                                <Col md={6}>
                                                    <Field
                                                        label={t("quick_quote.form.email", "Email")}
                                                        required
                                                        value={formData.email}
                                                        onChange={(v) => setField("email", v)}
                                                        placeholder={t("contact.form.email_placeholder", "Email")}
                                                        error={errors.email}
                                                        name="email"
                                                        type="email"
                                                    />
                                                </Col>

                                                <Col md={6}>
                                                    <Field
                                                        label={t("quick_quote.form.phonenumber", "Phone")}
                                                        required
                                                        value={formData.phonenumber}
                                                        onChange={(v) => setField("phonenumber", v)}
                                                        placeholder={t("contact.form.phone_placeholder", "Phone Number")}
                                                        error={errors.phonenumber}
                                                        name="phonenumber"
                                                        type="tel"
                                                    />
                                                </Col>


                                            </Row>

                                            {/* Optional section */}
                                            {/* <div className="mt-4">
                                                <DetailsBlock title={t("quick_quote.v2.optional", "Optional details")}> */}
                                            <Accordion className="optionalAccordion mt-4" defaultActiveKey={null}>
                                                <Accordion.Item eventKey="0" className="optionalItem">
                                                    <Accordion.Header>
                                                        {t("quick_quote.v2.optional", "Optional details")}
                                                    </Accordion.Header>

                                                    <Accordion.Body>
                                                        <Row className="g-3">
                                                            <Col md={6}>
                                                                <Field
                                                                    label={t("quick_quote.form.companyName", "Company")}
                                                                    value={formData.companyName}
                                                                    onChange={(v) => setField("companyName", v)}
                                                                    placeholder={t("contact.form.companyName_placeholder", "Company Name")}
                                                                    error={errors.companyName}
                                                                    name="companyName"
                                                                    type="text"
                                                                    helper={t("quick_quote.v2.company_helper", "If this is for a business or building, add the company name.")}
                                                                />
                                                            </Col>

                                                            <Col md={6}>
                                                                <Field
                                                                    label={t("quick_quote.form.promoCode", "Promo Code")}
                                                                    value={formData.promoCode}
                                                                    onChange={(v) => {
                                                                        setField("promoCode", v);
                                                                        setPromoStatus({ state: "idle", msg: "" });
                                                                    }}
                                                                    placeholder={t("contact.form.promoCode_placeholder", "Promo Code")}
                                                                    error={errors.promoCode}
                                                                    name="promoCode"
                                                                    type="text"
                                                                    helper={t("quick_quote.tooltips.promoCode", "Enter your promo code. Promos cannot be combined.")}
                                                                    rightSlot={
                                                                        <Button
                                                                            variant="outline-secondary"
                                                                            size="sm"
                                                                            className="btnApply"
                                                                            onClick={() => {
                                                                                const ok = validatePromo();
                                                                                setErrors((prev) => ({ ...prev, promoCode: ok ? "" : t("quick_quote.form.invalidPromoCode", "Invalid promo code.") }));
                                                                            }}
                                                                        >
                                                                            {t("quick_quote.v2.apply", "Apply")}
                                                                        </Button>
                                                                    }
                                                                />

                                                                {promoStatus.state === "valid" && (
                                                                    <div className="promoOk mt-2">
                                                                        <FaCheckCircle className="me-2" />
                                                                        {promoStatus.msg}
                                                                    </div>
                                                                )}
                                                                {promoStatus.state === "invalid" && (
                                                                    <div className="promoBad mt-2">
                                                                        {promoStatus.msg}
                                                                    </div>
                                                                )}
                                                            </Col>
                                                        </Row>
                                                        {/* </DetailsBlock>
                                            </div> */}
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            </Accordion>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div key="step2" {...panel}>
                                            <SectionTitle
                                                title={t("quick_quote.v2.choose_category", "Choose a service category")}
                                                subtitle={t("quick_quote.v2.choose_category_sub", "Pick the category that best matches what you need.")}
                                            />

                                            {errors.selectedCategory && (
                                                <div className="text-danger fw-semibold mb-3">{errors.selectedCategory}</div>
                                            )}

                                            <Row className="g-3">
                                                {categoryCards.map((c) => (
                                                    <Col md={6} key={c.key}>
                                                        <SelectableCard
                                                            title={c.title}
                                                            desc={c.desc}
                                                            active={selectedCategory === c.key}
                                                            onClick={() => chooseCategory(c.key)}
                                                        />
                                                    </Col>
                                                ))}
                                            </Row>

                                            {selectedCategory && (
                                                <div className="mt-4 smallMuted">
                                                    {t("quick_quote.v2.selected", "Selected:")}{" "}
                                                    <strong>{selectedCategory}</strong>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div key="step3" {...panel}>
                                            <SectionTitle
                                                title={t("quick_quote.v2.choose_type", "Choose a service type")}
                                                subtitle={t("quick_quote.v2.choose_type_sub", "This helps us estimate time, materials, and staffing.")}
                                            />

                                            {!selectedCategory ? (
                                                <Alert variant="warning" className="mb-0">
                                                    {t("quick_quote.v2.pick_category_first", "Please choose a category first.")}
                                                </Alert>
                                            ) : (
                                                <>
                                                    {errors.selectedType && (
                                                        <div className="text-danger fw-semibold mb-3">{errors.selectedType}</div>
                                                    )}

                                                    <div className="pillWrap">
                                                        {activeServiceTypes.map((opt) => (
                                                            <Pill
                                                                key={opt}
                                                                active={selectedType === opt}
                                                                onClick={() => chooseType(opt)}
                                                                label={t(`quick_quote.form.serviceOptions.${selectedCategory} Options.${opt}`, opt)}
                                                            />
                                                        ))}
                                                    </div>

                                                    {selectedType && (
                                                        <div className="mt-3 smallMuted">
                                                            {t("quick_quote.v2.selected", "Selected:")}{" "}
                                                            <strong>{selectedType}</strong>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </motion.div>
                                    )}

                                    {step === 4 && (
                                        <motion.div key="step4" {...panel}>
                                            <SectionTitle
                                                title={t("quick_quote.v2.customize", "Customize your request")}
                                                subtitle={t("quick_quote.v2.customize_sub", "A few quick details so we can quote accurately.")}
                                            />

                                            {!formData.services?.[0]?.type ? (
                                                <Alert variant="warning" className="mb-0">
                                                    {t("quick_quote.v2.pick_type_first", "Please choose a service type first.")}
                                                </Alert>
                                            ) : (
                                                <>
                                                    {errors.startDate && (
                                                        <div className="text-danger fw-semibold mb-3">{errors.startDate}</div>
                                                    )}
                                                  
                                                    <CustomOptionsPremium
                                                        t={t}
                                                        serviceType={formData.services[0].type}
                                                        customOptions={formData.services[0].customOptions || {}}
                                                        onSet={setServiceCustomOption}
                                                    />
                                                      <Row className="g-3 mb-3">
                                                        <Col md={6}>
                                                            <Field
                                                                label={t("quick_quote.form.postalcode", "Postal Code")}
                                                                required
                                                                value={formData.postalcode}
                                                                // onChange={(v) => setField("postalcode", v)}
                                                                onChange={(v) => setField("postalcode", formatPostal(v))}
                                                                placeholder={t("contact.form.postalcode_placeholder", "Postal Code")}
                                                                error={errors.postalcode}
                                                                name="postalcode"
                                                                type="text"
                                                            />
                                                        </Col>
                                                    </Row>
                                                </>
                                            )}
                                        </motion.div>
                                    )}

                                    {step === 5 && (
                                        <motion.div key="step5" {...panel}>
                                            <SectionTitle
                                                title={t("quick_quote.v2.review", "Review & submit")}
                                                subtitle={t("quick_quote.v2.review_sub", "Confirm your details — then we’ll generate your quote and follow up.")}
                                            />

                                            <ReviewPanel t={t} formData={formData} selectedCategory={selectedCategory} selectedType={selectedType} />

                                            <div className="d-flex gap-2 mt-4">
                                                <Button variant="outline-secondary" onClick={resetAll}>
                                                    {t("quick_quote.form.reset", "Reset")}
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    className="ms-auto btnPrimary"
                                                    onClick={handleSubmit}
                                                    data-track="clicked_submit_quote_v2"
                                                >
                                                    {t("quick_quote.form.submit", "Submit Quote")}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Footer nav */}
                                <div className="wizardFooter mt-4 pt-3">
                                    <div className="footerRow">
                                        <Button
                                            variant="outline-secondary"
                                            onClick={goBack}
                                            disabled={step === 1}
                                            className="btnNav btnBackIcon"
                                            aria-label={t("quick_quote.v2.back", "Back")}
                                            title={t("quick_quote.v2.back", "Back")}
                                        >
                                            <FaChevronLeft />
                                            <span className="btnText ms-2">{t("quick_quote.v2.back", "Back")}</span>
                                        </Button>

                                        <Button variant="outline-secondary" onClick={resetAll} className="btnNav">
                                            Clear
                                        </Button>

                                        {step < 5 ? (
                                            <Button variant="primary" onClick={goNext} className="btnPrimary">
                                                <span className="btnLabel">{t("quick_quote.v2.continue", "Continue")}</span>
                                                <FaChevronRight className="btnIcon ms-2" />
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default QuoteRequest;

// -----------------------------
// Subcomponents (same file)
// -----------------------------

function SectionTitle({ title, subtitle }) {
    return (
        <div className="mb-3">
            <h4 className="sectionTitle mb-1">{title}</h4>
            {subtitle ? <div className="sectionSubtitle">{subtitle}</div> : null}
            <div className="sectionAccent" />
        </div>
    );
}

function DetailsBlock({ title, children }) {
    return (
        <div className="detailsBlock">
            <div className="detailsTitle">{title}</div>
            <div className="detailsBody">{children}</div>
        </div>
    );
}

function Field({
    label,
    required,
    value,
    onChange,
    placeholder,
    error,
    name,
    type,
    helper,
    rightSlot,
    inputRef,
}) {
    return (
        <Form.Group>
            <div className="d-flex align-items-end justify-content-between gap-2">
                <Form.Label className="fieldLabel">
                    {label} {required ? <span className="req">*</span> : null}
                </Form.Label>
                {rightSlot ? <div className="fieldRight">{rightSlot}</div> : null}
            </div>

            <Form.Control
                ref={inputRef}
                name={name}
                type={type || "text"}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                isInvalid={!!error}
                className="fieldControl form-input"
                autoComplete="on"
            />
            {helper ? <Form.Text className="fieldHelper">{helper}</Form.Text> : null}
            {error ? <div className="invalidText">{error}</div> : null}
        </Form.Group>
    );
}

function SelectableCard({ title, desc, active, onClick }) {
    return (
        <button
            type="button"
            className={`selectCard ${active ? "active" : ""}`}
            onClick={onClick}
        >
            <div className="selectCardInner">
                <div className="selectCardTitle">{title}</div>
                <div className="selectCardDesc">{desc}</div>
            </div>
            {active ? <FaCheckCircle className="selectCardCheck" /> : null}
        </button>
    );
}

function Pill({ label, active, onClick }) {
    return (
        <button type="button" className={`pill ${active ? "active" : ""}`} onClick={onClick}>
            {label}
        </button>
    );
}

function ReviewPanel({ t, formData }) {
    const s0 = formData.services?.[0] || {};
    const opts = s0.customOptions || {};

    const rows = [
        { label: t("quick_quote.form.name", "Name"), value: formData.name },
        { label: t("quick_quote.form.email", "Email"), value: formData.email },
        { label: t("quick_quote.form.phonenumber", "Phone"), value: formData.phonenumber },
        { label: t("quick_quote.form.postalcode", "Postal Code"), value: formData.postalcode },
        { label: t("quick_quote.form.companyName", "Company"), value: formData.companyName || "—" },
        { label: t("quick_quote.form.promoCode", "Promo Code"), value: formData.promoCode || "—" },
        { label: t("quick_quote.v2.category", "Category"), value: s0.category || "—" },
        { label: t("quick_quote.v2.type", "Service Type"), value: s0.type || "—" },
    ];

    const optRows = Object.keys(opts).map((k) => ({
        label: opts[k]?.label || k,
        value: String(opts[k]?.service ?? ""),
    }));

    return (
        <div className="reviewGrid">
            <div className="reviewCard">
                <div className="reviewCardTitle">{t("quick_quote.v2.contact_details", "Contact details")}</div>
                <div className="reviewList">
                    {rows.slice(0, 6).map((r) => (
                        <div key={r.label} className="reviewRow">
                            <div className="reviewLabel">{r.label}</div>
                            <div className="reviewValue">{r.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="reviewCard">
                <div className="reviewCardTitle">{t("quick_quote.v2.service_details", "Service details")}</div>
                <div className="reviewList">
                    {rows.slice(6).map((r) => (
                        <div key={r.label} className="reviewRow">
                            <div className="reviewLabel">{r.label}</div>
                            <div className="reviewValue">{r.value}</div>
                        </div>
                    ))}
                </div>

                {optRows.length ? (
                    <>
                        <div className="reviewDivider" />
                        <div className="reviewCardTitle">{t("quick_quote.v2.custom_options", "Custom options")}</div>
                        <div className="reviewList">
                            {optRows.map((r) => (
                                <div key={r.label} className="reviewRow">
                                    <div className="reviewLabel">{r.label}</div>
                                    <div className="reviewValue">{r.value || "—"}</div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}

// Premium custom options UI (keeps your original intent, simplified + cleaner)
function CustomOptionsPremium({ t, serviceType, customOptions, onSet }) {
    const today = useMemo(() => new Date().toISOString().split("T")[0], []);

    // Helpers
    const set = (key, val, label) => onSet(key, val, label);
    const get = (key) => customOptions?.[key]?.service ?? "";

    // Upholstery list from your original
    const upholsteryList = useMemo(
        () => [
            "Sofa Cleaning",
            "Chair Cleaning",
            "Couch Cleaning",
            "Sectional Cleaning",
            "Ottoman Cleaning",
            "Loveseat Cleaning",
            "Dining Chair Cleaning",
            "Recliner Cleaning",
        ],
        []
    );

    const SELECT_KEY = "upholsterySelectedItems";

    const selectedItems = useMemo(() => {
        const raw = get(SELECT_KEY);
        return Array.isArray(raw) ? raw : [];
    }, [customOptions]); // or [get] if stable

    const toggleItem = (item) => {
        const next = selectedItems.includes(item)
            ? selectedItems.filter((x) => x !== item)
            : [...selectedItems, item];

        set(SELECT_KEY, next, "Upholstery items");
    };

    const clearItemDetails = (item) => {
        const idx = upholsteryList.indexOf(item);
        if (idx < 0) return;
        // optional: clear details when unselected
        set(`upholsteryArea-${idx}`, "", "Area (sqft)");
        set(`upholsteryPieces-${idx}`, "", "Pieces");
        set(`upholsteryFabric-${idx}`, "", "Fabric");
    };

    // Common blocks
    const PreferredDate = (
        <Form.Group className="mb-3">
            <Form.Label className="fieldLabel">
                {t("quick_quote.customOptions.desiredDate", "Preferred service date")} <span className="req">*</span>
            </Form.Label>
            <Form.Control
                type="date"
                min={today}
                className="fieldControl"
                value={get("startDate")}
                onChange={(e) => set("startDate", e.target.value, t("quick_quote.customOptions.desiredDate", "Preferred service date"))}
            />
            <Form.Text className="fieldHelper">
                {t("quick_quote.v2.date_helper", "Pick a date — we’ll confirm availability by email.")}
            </Form.Text>
        </Form.Group>
    );

    // Service-specific options (modern layout)
    if (serviceType === "House Cleaning" || serviceType === "Move-In/Out Cleaning") {
        return (
            <div className="optionsCard">
                <div className="optionsHeader">
                    <div className="optionsTitle">{t("quick_quote.v2.details", "Details")}</div>
                    <div className="optionsSub">{t("quick_quote.v2.details_sub", "These help us size the job correctly.")}</div>
                </div>

                <Row className="g-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fieldLabel">{t("quick_quote.customOptions.frequency", "Frequency")}</Form.Label>
                            <Form.Select
                                className="fieldControl"
                                value={get("frequency")}
                                onChange={(e) => set("frequency", e.target.value, t("quick_quote.customOptions.frequency", "Frequency"))}
                            >
                                <option value="">{t("quick_quote.customOptions.selectText", "Select")}</option>
                                <option value="One Time">{t("quick_quote.customOptions.oneTime", "One Time")}</option>
                                <option value="Weekly">{t("quick_quote.customOptions.weekly", "Weekly")}</option>
                                <option value="Bi-Weekly">{t("quick_quote.customOptions.biWeekly", "Bi-Weekly")}</option>
                                <option value="Monthly">{t("quick_quote.customOptions.monthly", "Monthly")}</option>
                                <option value="Other">{t("quick_quote.customOptions.other", "Other")}</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fieldLabel">{t("quick_quote.customOptions.unitSize", "Unit Size")}</Form.Label>
                            <Form.Select
                                className="fieldControl"
                                value={get("squareFootage")}
                                onChange={(e) => set("squareFootage", e.target.value, t("quick_quote.customOptions.unitSize", "Unit Size"))}
                            >
                                <option value="">{t("quick_quote.customOptions.selectText", "Select")}</option>
                                <option value="0-499 sqft">0–499 {t("quick_quote.customOptions.area", "sqft")}</option>
                                <option value="500-999 sqft">500–999 {t("quick_quote.customOptions.area", "sqft")}</option>
                                <option value="1000-1499 sqft">1000–1499 {t("quick_quote.customOptions.area", "sqft")}</option>
                                <option value="1500-1999 sqft">1500–1999 {t("quick_quote.customOptions.area", "sqft")}</option>
                                <option value="2000+ sqft">2000+ {t("quick_quote.customOptions.area", "sqft")}</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fieldLabel">{t("quick_quote.customOptions.bedrooms", "Bedrooms")}</Form.Label>
                            <Form.Select
                                className="fieldControl"
                                value={get("bedrooms")}
                                onChange={(e) => set("bedrooms", e.target.value, t("quick_quote.customOptions.bedrooms", "Bedrooms"))}
                            >
                                <option value="">{t("quick_quote.customOptions.selectText", "Select")}</option>
                                {Array.from({ length: 6 }, (_, i) => (
                                    <option key={i} value={String(i)}>{i === 5 ? "5+" : i}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fieldLabel">{t("quick_quote.customOptions.bathrooms", "Bathrooms")}</Form.Label>
                            <Form.Select
                                className="fieldControl"
                                value={get("bathrooms")}
                                onChange={(e) => set("bathrooms", e.target.value, t("quick_quote.customOptions.bathrooms", "Bathrooms"))}
                            >
                                <option value="">{t("quick_quote.customOptions.selectText", "Select")}</option>
                                {Array.from({ length: 6 }, (_, i) => (
                                    <option key={i} value={String(i)}>{i === 5 ? "5+" : i}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <div className="mt-3">{PreferredDate}</div>

                {serviceType === "House Cleaning" ? (
                    <div className="mt-3">
                        <div className="fieldLabel mb-2">{t("quick_quote.customOptions.additionalOptions", "Add-ons")}</div>
                        <div className="addonGrid">
                            {[
                                { key: "deepCleaning", label: t("quick_quote.customOptions.deepCleaning", "Deep cleaning") },
                                { key: "windowCleaning", label: t("quick_quote.customOptions.windowCleaning", "Window cleaning") },
                                { key: "laundryService", label: t("quick_quote.customOptions.laundryService", "Laundry service") },
                            ].map((x) => (
                                <button
                                    key={x.key}
                                    type="button"
                                    className={`pill addonPill ${get(x.key) ? "active" : ""}`}
                                    onClick={() => set(x.key, !get(x.key), x.label)}
                                >
                                    {x.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null}

            </div>
        );
    }

    if (serviceType === "Carpet Cleaning") {
        return (
            <div className="optionsCard">
                <div className="optionsHeader">
                    <div className="optionsTitle">{t("quick_quote.v2.carpet_details", "Carpet details")}</div>
                    <div className="optionsSub">{t("quick_quote.v2.carpet_details_sub", "Material, area and stain level help us quote accurately.")}</div>
                </div>

                <Row className="g-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fieldLabel">{t("quick_quote.customOptions.carpetMaterial", "Carpet material")}</Form.Label>
                            <Form.Select
                                className="fieldControl"
                                value={get("carpetType")}
                                onChange={(e) => set("carpetType", e.target.value, t("quick_quote.customOptions.carpetMaterial", "Carpet material"))}
                            >
                                <option value="">{t("quick_quote.customOptions.chooseMaterial", "Choose material")}</option>
                                <option value="Wool">{t("quick_quote.customOptions.wool", "Wool")}</option>
                                <option value="Nylon">{t("quick_quote.customOptions.nylon", "Nylon")}</option>
                                <option value="Polyester">{t("quick_quote.customOptions.polyester", "Polyester")}</option>
                                <option value="Olefin">{t("quick_quote.customOptions.olefin", "Olefin")}</option>
                                <option value="Other">{t("quick_quote.customOptions.other", "Other")}</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fieldLabel">{t("quick_quote.customOptions.carpetArea", "Approx. area (sqft)")}</Form.Label>
                            <Form.Control
                                className="fieldControl"
                                type="number"
                                min={0}
                                inputMode="numeric"
                                value={get("carpetArea")}
                                placeholder="e.g. 500"
                                onChange={(e) => set("carpetArea", e.target.value, t("quick_quote.customOptions.carpetArea", "Approx. area (sqft)"))}
                            />
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fieldLabel">{t("quick_quote.customOptions.carpetStains", "Stain level")}</Form.Label>
                            <Form.Select
                                className="fieldControl"
                                value={get("stains")}
                                onChange={(e) => set("stains", e.target.value, t("quick_quote.customOptions.carpetStains", "Stain level"))}
                            >
                                <option value="">{t("quick_quote.customOptions.howSevereAreTheStains", "How severe are the stains?")}</option>
                                <option value="None">{t("quick_quote.customOptions.none", "None")}</option>
                                <option value="Light">{t("quick_quote.customOptions.light", "Light")}</option>
                                <option value="Moderate">{t("quick_quote.customOptions.moderate", "Moderate")}</option>
                                <option value="Heavy">{t("quick_quote.customOptions.heavy", "Heavy")}</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        {PreferredDate}
                    </Col>
                </Row>
            </div>
        );
    }

    if (serviceType === "Upholstery Cleaning") {
        const SELECT_KEY = "upholsterySelectedItems";

        const selectedItems = Array.isArray(get(SELECT_KEY)) ? get(SELECT_KEY) : [];

        const toggleItem = (item) => {
            const isOn = selectedItems.includes(item);
            const next = isOn ? selectedItems.filter((x) => x !== item) : [...selectedItems, item];
            set(SELECT_KEY, next, t("quick_quote.v2.upholstery_items", "Upholstery items"));

            // optional: clear details when unselecting
            if (isOn) {
                const idx = upholsteryList.indexOf(item);
                if (idx >= 0) {
                    set(`upholsteryArea-${idx}`, "", t("quick_quote.customOptions.upholsteryArea", "Area (sqft)"));
                    set(`upholsteryPieces-${idx}`, "", t("quick_quote.customOptions.upholsteryPieces", "Pieces"));
                    set(`upholsteryFabric-${idx}`, "", t("quick_quote.customOptions.selectFabric", "Fabric"));
                }
            }
        };

        return (
            <div className="optionsCard">
                <div className="optionsHeader">
                    <div className="optionsTitle">{t("quick_quote.v2.upholstery_details", "Upholstery details")}</div>
                    <div className="optionsSub">{t("quick_quote.v2.upholstery_details_sub", "Select the items you want cleaned, then add details.")}</div>
                </div>

                {/* Stage 1: pick items */}
                <div className="fieldLabel mb-2">
                    {t("quick_quote.v2.select_items", "Select items")}
                </div>

                <div className="upSelectGrid">
                    {upholsteryList.map((item) => {
                        const active = selectedItems.includes(item);
                        return (
                            <button
                                key={item}
                                type="button"
                                className={`pill upItemPill ${active ? "active" : ""}`}
                                onClick={() => toggleItem(item)}
                            >
                                {item}
                            </button>
                        );
                    })}
                </div>

                {/* Stage 2: details for selected items only */}
                {selectedItems.length > 0 ? (
                    <>
                        <div className="mt-3 fieldLabel">
                            {t("quick_quote.v2.item_details", "Item details")}
                        </div>

                        <Accordion className="upDetailsAcc mt-2">
                            {selectedItems.map((item) => {
                                const idx = upholsteryList.indexOf(item);
                                const areaKey = `upholsteryArea-${idx}`;
                                const piecesKey = `upholsteryPieces-${idx}`;
                                const fabricKey = `upholsteryFabric-${idx}`;

                                const summary = [
                                    get(piecesKey) ? `${get(piecesKey)} pcs` : null,
                                    get(areaKey) ? `${get(areaKey)} sqft` : null,
                                    get(fabricKey) ? get(fabricKey) : null,
                                ].filter(Boolean).join(" • ");

                                return (
                                    <Accordion.Item key={item} eventKey={item} className="upAccItem">
                                        <Accordion.Header>
                                            <div className="upAccHeader">
                                                <div className="upAccTitle">{item}</div>
                                                {summary ? <div className="upAccSummary">{summary}</div> : null}
                                            </div>
                                        </Accordion.Header>

                                        <Accordion.Body>
                                            <div className="upGrid">
                                                <Form.Control
                                                    className="fieldControl"
                                                    type="number"
                                                    min={0}
                                                    placeholder={t("quick_quote.customOptions.upholsteryPieces", "Pieces")}
                                                    value={get(piecesKey)}
                                                    onChange={(e) => set(piecesKey, e.target.value, t("quick_quote.customOptions.upholsteryPieces", "Pieces"))}
                                                />

                                                <Form.Control
                                                    className="fieldControl"
                                                    type="number"
                                                    min={0}
                                                    placeholder={t("quick_quote.customOptions.upholsteryArea", "Area (sqft)")}
                                                    value={get(areaKey)}
                                                    onChange={(e) => set(areaKey, e.target.value, t("quick_quote.customOptions.upholsteryArea", "Area (sqft)"))}
                                                />

                                                <Form.Select
                                                    className="fieldControl"
                                                    value={get(fabricKey)}
                                                    onChange={(e) => set(fabricKey, e.target.value, t("quick_quote.customOptions.selectFabric", "Fabric"))}
                                                >
                                                    <option value="">{t("quick_quote.customOptions.selectFabric", "Select fabric")}</option>
                                                    <option value="Leather">{t("quick_quote.customOptions.leather", "Leather")}</option>
                                                    <option value="Cotton">{t("quick_quote.customOptions.cotton", "Cotton")}</option>
                                                    <option value="Polyester">{t("quick_quote.customOptions.polyester", "Polyester")}</option>
                                                    <option value="Nylon">{t("quick_quote.customOptions.nylon", "Nylon")}</option>
                                                    <option value="Other">{t("quick_quote.customOptions.other", "Other")}</option>
                                                </Form.Select>
                                            </div>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                );
                            })}
                        </Accordion>
                    </>
                ) : (
                    <div className="smallMuted mt-2">
                        {t("quick_quote.v2.pick_at_least_one", "Choose at least one item to continue.")}
                    </div>
                )}

                <div className="mt-3">{PreferredDate}</div>
            </div>
        );
    }

    // Default: description + date
    return (
        <div className="optionsCard">
            <div className="optionsHeader">
                <div className="optionsTitle">{t("quick_quote.v2.extra_details", "Extra details")}</div>
                <div className="optionsSub">{t("quick_quote.v2.extra_details_sub", "Add anything that helps us quote accurately.")}</div>
            </div>

            <Form.Group className="mb-3">
                <Form.Label className="fieldLabel">{t("quick_quote.customOptions.description", "Description")}</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={4}
                    className="fieldControl"
                    placeholder={t("quick_quote.customOptions.descriptionDetail", "Tell us what you need, any priorities, special notes, etc.")}
                    value={get("description")}
                    onChange={(e) => set("description", e.target.value, t("quick_quote.customOptions.description", "Description"))}
                />
            </Form.Group>

            {PreferredDate}
        </div>
    );
}

// Basic HTML escaping for the email summary
function escapeHtml(str) {
    return String(str || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}