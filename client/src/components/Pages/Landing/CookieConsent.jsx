import { useState, useEffect } from "react";
import { Button, Alert, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function CookieBanner({ show: externalShow, onClose }) {
    const [show, setShow] = useState(false);
    // const [preferences, setPreferences] = useState({ analytics: false, marketing: false });
    const { t } = useTranslation();

    useEffect(() => {
        const consent = localStorage.getItem("cookieConsent");
        if (!consent && externalShow === undefined) setShow(true);
    }, [externalShow]);

    // If a parent controls `show`, use that
    const isVisible = externalShow !== undefined ? externalShow : show;

    const handleAcceptAll = () => {
        const pref = { analytics: true, marketing: true };
        localStorage.setItem("cookieConsent", JSON.stringify(pref));
        // setPreferences(pref);
        // setShow(false);
        if (onClose) onClose();
        else setShow(false);

        // ✅ Fire analytics scripts here
    };

    const handleReject = () => {
        // localStorage.setItem("cookieConsent", JSON.stringify(preferences));
        const pref = { analytics: false, marketing: false };
        localStorage.setItem("cookieConsent", JSON.stringify(pref));
        // setShow(false);
        if (onClose) onClose();
        else setShow(false);

    };

    // if (!show) return null;
    if (!isVisible) return null;

    return (
        <Alert
            variant="light"
            className="position-fixed bottom-0 start-50 translate-middle-x shadow p-3 mb-0 w-100 w-md-75"
            style={{ zIndex: 1080 }}
        >
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between text-center text-md-start">
                <p className="mb-3 mb-md-0 fw-medium">
                    {t("cookie_consent.description")}{" "}
                    {t("cookie_consent.read_our")}{" "}
                    <a href="/privacy-policy" className="text-decoration-underline">
                        {t("footer.privacy_policy")}
                    </a>{" "}
                    &{" "}
                    <a href="/terms" className="text-decoration-underline">
                        {t("footer.terms")}.
                    </a>
                    {" "}{t("cookie_consent.manage_preferences")}
                    {/* <span className="d-block d-md-inline">
    </span> */}
                </p>

                {/* Button Group with Responsive Layout */}
                <div className="d-flex flex-column flex-md-row gap-2">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        className="px-3 rounded-pill"
                        onClick={handleReject}
                    >
                        {t("cookie_consent.reject")}
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        className="px-3 rounded-pill shadow-sm text-nowrap"
                        onClick={handleAcceptAll}
                    >
                        {t("cookie_consent.accept_all")}
                    </Button>
                </div>
            </div>


        </Alert>
    );
}
