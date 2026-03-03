import React, { useEffect, useMemo, useRef, useState } from "react";
import Auth from "/src/utils/auth";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import {
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUserPlus,
  FaEnvelope,
  FaPhoneAlt,
  FaUser,
} from "react-icons/fa";

/**
 * CleanAR Signup (leverages existing CleanAR CSS library)
 * - Uses cleanar-app-bg / cleanar-card / portal-primary-btn / cleanarInput styles
 * - Mobile-first, responsive, fast loading
 */
function SignUp({ focus }) {
  const { t } = useTranslation();

  const [step, setStep] = useState(1); // 1: personal, 2: account
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    telephone: "",
    // username: "",
    password: "",
    howDidYouHearAboutUs: "",
    howDidYouHearAboutUsSupport: "",
    termsConsent: false,
  });

  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const emailRef = useRef(null);

  useEffect(() => {
    if (focus && emailRef.current) emailRef.current.focus();
  }, [focus]);

  useEffect(() => {
    document.body.classList.add("signup-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("signup-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  const trimmed = useMemo(() => {
    return Object.fromEntries(
      Object.entries(formData).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
    );
  }, [formData]);

  const isEmailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
  const isPhoneLikelyValid = (v) => String(v || "").replace(/[^\d+]/g, "").length >= 10;
  const isStrongEnoughPassword = (v) => String(v || "").length >= 8;

  const validate = (data) => {
    const errors = {};

    if (!data.email) errors.email = t("signup.alerts.missing_email", "Email is required.");
    else if (!isEmailValid(data.email))
      errors.email = t("signup.alerts.invalid_email", "Enter a valid email address.");

    if (!data.firstName)
      errors.firstName = t("signup.alerts.missing_first_name", "First name is required.");
    if (!data.lastName)
      errors.lastName = t("signup.alerts.missing_last_name", "Last name is required.");

    if (!data.telephone)
      errors.telephone = t("signup.alerts.missing_telephone", "Phone number is required.");
    else if (!isPhoneLikelyValid(data.telephone))
      errors.telephone = t("signup.alerts.invalid_telephone", "Enter a valid phone number.");

    // if (!data.username)
    //   errors.username = t("signup.alerts.missing_username", "Username is required.");

    if (!data.password)
      errors.password = t("signup.alerts.missing_password", "Password is required.");
    else if (!isStrongEnoughPassword(data.password))
      errors.password = t(
        "signup.alerts.password_length",
        "Password must be at least 8 characters."
      );

    if (!data.termsConsent)
      errors.termsConsent = t("signup.alerts.terms_required", "You must agree to continue.");

    if (data.howDidYouHearAboutUs === "Referral" || data.howDidYouHearAboutUs === "Other") {
      if (!data.howDidYouHearAboutUsSupport) {
        errors.howDidYouHearAboutUsSupport = t(
          "signup.alerts.how_heard_support_required",
          "Please provide a bit more detail."
        );
      }
    }

    return errors;
  };

  const errors = useMemo(() => validate(trimmed), [trimmed]);

  const step1Valid = useMemo(() => {
    const keys = ["firstName", "lastName", "telephone"];
    return keys.every((k) => !errors[k]);
  }, [errors]);

  const step2Valid = useMemo(() => {
    const keys = ["email", "password", "termsConsent", "howDidYouHearAboutUsSupport"];
    return keys.every((k) => !errors[k]);
  }, [errors]);

  const markTouched = (name) => setTouched((prev) => ({ ...prev, [name]: true }));
  const showErr = (name) => touched[name] && !!errors[name];

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setServerError("");
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onNext = () => {
    ["email", "firstName", "lastName", "telephone"].forEach((k) => markTouched(k));
    if (step1Valid) setStep(2);
  };

  const onBack = () => setStep(1);

  const SupportLabel = useMemo(() => {
    if (trimmed.howDidYouHearAboutUs === "Referral")
      return t("signup.form_labels.referral", "Who referred you?");
    if (trimmed.howDidYouHearAboutUs === "Other")
      return t("signup.form_labels.please_specify", "Please specify");
    return "";
  }, [trimmed.howDidYouHearAboutUs, t]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    Object.keys(formData).forEach((k) => markTouched(k));

    if (!step1Valid) {
      setStep(1);
      return;
    }
    if (!step2Valid) return;

    setSubmitting(true);
    setServerError("");

    try {
      const response = await fetch(`/api/users/`, {
        method: "post",
        body: JSON.stringify(trimmed),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        setServerError(t("signup.alerts.email_taken", "That email is taken. Try another."));
        setSubmitting(false);
        return;
      }

      const data = await response.json();

      // keep your email calls; don't block login on failures
      try {
        await fetch(`/api/email/new-user`, {
          method: "post",
          body: JSON.stringify({ email: trimmed.email, user: data.dbUserData }),
          headers: { "Content-Type": "application/json" },
        });
      } catch {}

      try {
        await fetch(`/api/email/new-user-notification`, {
          method: "post",
          body: JSON.stringify({ email: trimmed.email, user: data.dbUserData }),
          headers: { "Content-Type": "application/json" },
        });
      } catch {}

      Auth.login(data.token, data.dbUserData.adminFlag);
    } catch (err) {
      console.error(err);
      setServerError(t("signup.alerts.generic_error", "Something went wrong. Please try again."));
      setSubmitting(false);
    }
  };

  return (
    <div className="cleanar-app-bg d-flex align-items-stretch">
      <Container className="py-4 py-md-5">
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={7} xl={6}>
            {/* Hero-ish header (lightweight) */}
            <div className="text-center mb-3">
              <div className="cleanar-badge cleanar-badge--button mx-auto mb-2 px-3 py-2 rounded-pill">
                <FaLock />
                <span className="alata-regular">
                  {t("signup.microcopy.security", "Secure signup • No spam")}
                </span>
              </div>

              <h1 className="portal-section-title mb-1 montserrat-bold">
                {t("signup.title", "Create your account")}
              </h1>
              <div className="portal-section-sub alata-regular">
                {t(
                  "signup.description",
                  "Manage bookings, view invoices, and update appointments anytime."
                )}
              </div>

              {/* Step indicator styled like your progress UI */}
              <div className="booking-progress mx-auto" style={{ maxWidth: 520 }}>
                <div className="booking-progress-track">
                  <div
                    className="booking-progress-fill"
                    style={{ width: step === 1 ? "50%" : "100%" }}
                  />
                </div>
                <div className="booking-progress-labels">
                  <div className={`booking-progress-item ${step === 1 ? "active" : ""}`}>
                    <span className="booking-progress-dot" />
                    <span className="booking-progress-text">
                      {t("signup.section_personal", "Personal")}
                    </span>
                  </div>
                  <div className={`booking-progress-item ${step === 2 ? "active" : ""}`}>
                    <span className="booking-progress-dot" />
                    <span className="booking-progress-text">
                      {t("signup.section_account", "Account")}
                    </span>
                  </div>
                  {/* filler columns to keep your 5-col grid happy */}
                  <div className="booking-progress-item" aria-hidden="true" />
                  <div className="booking-progress-item" aria-hidden="true" />
                  <div className="booking-progress-item" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Main card */}
            <div className="cleanar-card p-3 p-md-4">

              {serverError && (
                <Alert variant="danger" className="mb-3">
                  {serverError}
                </Alert>
              )}

              <Form onSubmit={handleSubmit} noValidate>
                {step === 1 && (
                  <>
                    <div className="account-section-title mb-3">
                      <FaUserPlus className="me-2" />
                      {t("signup.section_personal", "Personal details")}
                    </div>

                 

                    <Row className="g-3">
                      <Col xs={12} md={6}>
                        <Form.Group className="mb-1" controlId="signupFirstName">
                          <Form.Label className="cleanarLabel">
                            {t("signup.form_labels.first_name", "First name")}
                          </Form.Label>
                          <div className="cleanarInputWithIcon">
                            <span className="cleanarInputIcon">
                              <FaUser />
                            </span>
                            <Form.Control
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={onChange}
                              onBlur={() => markTouched("firstName")}
                              className="cleanarInput"
                              placeholder={t("signup.placeholders.first_name", "John")}
                              autoComplete="given-name"
                            />
                          </div>
                          {showErr("firstName") && (
                            <div className="cleanarInvalid">{errors.firstName}</div>
                          )}
                        </Form.Group>
                      </Col>

                      <Col xs={12} md={6}>
                        <Form.Group className="mb-1" controlId="signupLastName">
                          <Form.Label className="cleanarLabel">
                            {t("signup.form_labels.last_name", "Last name")}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={onChange}
                            onBlur={() => markTouched("lastName")}
                            className="cleanarInput"
                            placeholder={t("signup.placeholders.last_name", "Doe")}
                            autoComplete="family-name"
                          />
                          {showErr("lastName") && (
                            <div className="cleanarInvalid">{errors.lastName}</div>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Phone */}
                    <Form.Group className="mt-3" controlId="signupTelephone">
                      <Form.Label className="cleanarLabel">
                        {t("signup.form_labels.telephone", "Phone")}
                      </Form.Label>
                      <div className="cleanarInputWithIcon">
                        <span className="cleanarInputIcon">
                          <FaPhoneAlt />
                        </span>
                        <Form.Control
                          type="tel"
                          name="telephone"
                          value={formData.telephone}
                          onChange={onChange}
                          onBlur={() => markTouched("telephone")}
                          className="cleanarInput"
                          placeholder={t("signup.placeholders.telephone", "(647) 555-1234")}
                          autoComplete="tel"
                          inputMode="tel"
                        />
                      </div>
                      {showErr("telephone") && (
                        <div className="cleanarInvalid">{errors.telephone}</div>
                      )}
                      {!showErr("telephone") && (
                        <div className="cleanarHint">
                          {t("signup.microcopy.telephone", "Used for booking updates only.")}
                        </div>
                      )}
                    </Form.Group>

                    {/* Actions */}
                    <div className="d-grid gap-2 mt-4">
                      <Button type="button" className="portal-primary-btn" size="lg" onClick={onNext}>
                        {t("signup.buttons.continue", "Continue")}
                      </Button>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="account-section-title mb-3">
                      <FaLock className="me-2" />
                      {t("signup.section_account", "Account setup")}
                    </div>

                       {/* Email */}
                    <Form.Group className="mb-3" controlId="signupEmail">
                      <Form.Label className="cleanarLabel">
                        {t("signup.form_labels.email", "Email")}
                      </Form.Label>
                      <div className="cleanarInputWithIcon">
                        <span className="cleanarInputIcon">
                          <FaEnvelope />
                        </span>
                        <Form.Control
                          ref={emailRef}
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={onChange}
                          onBlur={() => markTouched("email")}
                          className="cleanarInput"
                          isInvalid={false}
                          placeholder={t("signup.placeholders.email", "name@email.com")}
                          autoComplete="email"
                          inputMode="email"
                        />
                      </div>
                      {showErr("email") && <div className="cleanarInvalid">{errors.email}</div>}
                      {!showErr("email") && (
                        <div className="cleanarHint">
                          {t("signup.tooltips.email", "We’ll use this to confirm your account.")}
                        </div>
                      )}
                    </Form.Group>

                    {/* Password */}
                    <Form.Group className="mb-3" controlId="signupPassword">
                      <Form.Label className="cleanarLabel">
                        {t("signup.form_labels.password", "Password")}
                      </Form.Label>

                      <div className="d-flex gap-2 align-items-stretch">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={onChange}
                          onBlur={() => markTouched("password")}
                          className="cleanarInput"
                          placeholder={t("signup.placeholders.password", "At least 8 characters")}
                          autoComplete="new-password"
                        />
                        <Button
                          type="button"
                          className="qa-ghost"
                          onClick={() => setShowPassword((s) => !s)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          style={{ width: 56 }}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </div>

                      {showErr("password") ? (
                        <div className="cleanarInvalid">{errors.password}</div>
                      ) : (
                        <div className="cleanarHint">
                          {t("signup.microcopy.password", "Use 8+ characters for better security.")}
                        </div>
                      )}
                    </Form.Group>

                    {/* How heard */}
                    <Form.Group className="mb-3" controlId="signupHowHeard">
                      <Form.Label className="cleanarLabel">
                        {t("signup.form_labels.how_heard", "How did you hear about us?")}
                      </Form.Label>
                      <Form.Select
                        name="howDidYouHearAboutUs"
                        value={formData.howDidYouHearAboutUs}
                        onChange={onChange}
                        className="cleanarInput"
                      >
                        <option value="">
                          {t("signup.form_labels.how_heard", "How did you hear about us?")}
                        </option>
                        <option value="Google">{t("signup.dropdown_options.google", "Google")}</option>
                        <option value="Facebook">
                          {t("signup.dropdown_options.facebook", "Facebook")}
                        </option>
                        <option value="Instagram">
                          {t("signup.dropdown_options.instagram", "Instagram")}
                        </option>
                        <option value="Referral">
                          {t("signup.dropdown_options.referral", "Referral")}
                        </option>
                        <option value="Other">{t("signup.dropdown_options.other", "Other")}</option>
                      </Form.Select>
                    </Form.Group>

                    {/* Support field */}
                    {(trimmed.howDidYouHearAboutUs === "Referral" ||
                      trimmed.howDidYouHearAboutUs === "Other") && (
                      <Form.Group className="mb-3" controlId="signupHowHeardSupport">
                        <Form.Label className="cleanarLabel">{SupportLabel}</Form.Label>
                        <Form.Control
                          type="text"
                          name="howDidYouHearAboutUsSupport"
                          value={formData.howDidYouHearAboutUsSupport}
                          onChange={onChange}
                          onBlur={() => markTouched("howDidYouHearAboutUsSupport")}
                          className="cleanarInput"
                          placeholder={t(
                            "signup.placeholders.how_heard_support",
                            "e.g., John / Building concierge / etc."
                          )}
                        />
                        {showErr("howDidYouHearAboutUsSupport") && (
                          <div className="cleanarInvalid">{errors.howDidYouHearAboutUsSupport}</div>
                        )}
                      </Form.Group>
                    )}

                    {/* Terms */}
                    <Form.Group className="mb-3" controlId="termsCheckbox">
                      <Form.Check
                        type="checkbox"
                        name="termsConsent"
                        checked={!!formData.termsConsent}
                        onChange={onChange}
                        onBlur={() => markTouched("termsConsent")}
                        label={
                          <span className="alata-regular">
                            {t("signup.form_labels.agree", "I agree to the")}{" "}
                            <a href="/terms" target="_blank" rel="noopener noreferrer">
                              {t("footer.terms", "Terms")}
                            </a>{" "}
                            &{" "}
                            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                              {t("footer.privacy_policy", "Privacy Policy")}
                            </a>
                            .
                          </span>
                        }
                      />
                      {showErr("termsConsent") && (
                        <div className="cleanarInvalid">{errors.termsConsent}</div>
                      )}
                    </Form.Group>

                    {/* Actions */}
                    <div className="d-grid gap-2 mt-4">
                      <Button
                        type="submit"
                        className="portal-primary-btn"
                        size="lg"
                        disabled={submitting}
                        data-track="signup"
                      >
                        {submitting
                          ? t("signup.buttons.creating", "Creating account…")
                          : t("signup.button", "Create my account")}
                      </Button>

                      <Button
                        type="button"
                        className="qa-ghost"
                        onClick={onBack}
                        disabled={submitting}
                      >
                        {t("signup.buttons.back", "Back")}
                      </Button>

                      <div className="text-center cleanarHint mt-1">
                        <FaLock className="me-1" />
                        {t("signup.microcopy.security", "Secure signup • No spam")}
                      </div>
                    </div>
                  </>
                )}
              </Form>

                {/* Benefits */}
              <div className="cleanar-proofbox mt-3">
                <div className="fw-semibold mb-2">
                  {t("signup.benefits_title", "With your CleanAR account you can:")}
                </div>
                <div className="d-grid gap-2">
                  <div className="d-flex gap-2 align-items-start">
                    <FaCheckCircle className="mt-1" />
                    <div className="alata-regular">
                      {t("signup.benefit_1", "View and manage upcoming bookings")}
                    </div>
                  </div>
                  <div className="d-flex gap-2 align-items-start">
                    <FaCheckCircle className="mt-1" />
                    <div className="alata-regular">
                      {t("signup.benefit_2", "Access receipts and invoices anytime")}
                    </div>
                  </div>
                  <div className="d-flex gap-2 align-items-start">
                    <FaCheckCircle className="mt-1" />
                    <div className="alata-regular">
                      {t("signup.benefit_3", "Get reminders and service updates")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-3 cleanarHint">
                {t("signup.microcopy.already", "Already have an account?")}{" "}
                <a href="/login">{t("signup.microcopy.login", "Log in")}</a>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default SignUp;