import { useTranslation } from "react-i18next";
import NewIconAnimated from "/src/components/Pages/Navigation/NewIconAnimated";

function StickyButtons() {
  const { t } = useTranslation();

  // Scroll to Quote form
  const scrollToQuoteForm = () => {
    const quoteInput = document.getElementById("floatingName");
    if (quoteInput) {
      quoteInput.focus({ preventScroll: false });
    }
  };

  // Scroll to Contact form
  const scrollToContactForm = () => {
    const contactInput = document.getElementById("name");
    if (contactInput) {
      contactInput.focus({ preventScroll: false });
    }
  };

  return (
    <div
      className="d-md-none position-fixed bottom-0 start-0 end-0 bg-transparent"
      style={{ zIndex: 1050, padding: "0.75rem" }}
    >
      <div className="d-flex gap-2">
        {/* Quote Button */}
        <button
          onClick={scrollToQuoteForm}
          className="btn btn-success rounded-pill flex-fill"
        >
          {t("quick_quote.form.title")} 
          {/* <NewIconAnimated /> */}
        </button>

        {/* Contact Button */}
        {/* <button
          onClick={scrollToContactForm}
          className="btn btn-primary rounded-pill flex-fill"
        >
          {t("contact.heading")}
        </button> */}
      </div>
    </div>
  );
}

export default StickyButtons;
