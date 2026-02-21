import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function StickyButtons() {
  const { t } = useTranslation();
  const [hide, setHide] = useState(false);

  // Scroll to Quote form
  const scrollToQuoteForm = () => {
    const quoteInput = document.getElementById("floatingName");
    if (quoteInput) {
      quoteInput.focus({ preventScroll: false });
      quoteInput.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      // fallback if input isn't mounted yet
      const quoteWizard = document.getElementById("quote-section");
      quoteWizard?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    // Prefer observing the whole wizard; fallback to the name input
    const target =
      document.getElementById("floatingName") ||
      document.getElementById("quote-section");

    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // hide sticky bar when quote is visible
        // console.log("IntersectionObserver entry:", entry);
        setHide(entry.isIntersecting);
      },
      {
        threshold: 0.25, // adjust: 0.15–0.6 depending on when you want it to hide
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={[
        "d-md-none position-fixed bottom-0 start-0 end-0 bg-transparent",
        "cleanar-sticky",
        hide ? "cleanar-sticky--hidden" : "",
      ].join(" ")}
      style={{ zIndex: 1050, padding: "0.75rem" }}
    >
      <div className="d-flex gap-2">
        <button
          onClick={scrollToQuoteForm}
          className="btn btn-success rounded-pill flex-fill"
          aria-label={t("quick_quote.form.title")}
        >
          {t("quick_quote.form.title")}
        </button>
      </div>
    </div>
  );
}

export default StickyButtons;