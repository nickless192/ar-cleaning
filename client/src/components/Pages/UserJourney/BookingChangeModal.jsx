import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Row, Col, Alert, Badge } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaCalendarAlt, FaExchangeAlt, FaRegStickyNote } from "react-icons/fa";

const BookingChangeModal = ({
  show,
  handleClose,
  handleSubmit,
  initialDate,
  initialServiceType,
  mode = "change", // "change" | "new"
}) => {
  const { t } = useTranslation();

  const initialDateStr = useMemo(() => {
    if (!initialDate) return "";
    return new Date(initialDate).toISOString().split("T")[0];
  }, [initialDate]);

  const [newDate, setNewDate] = useState(initialDateStr || "");
  const [comment, setComment] = useState("");
  const [serviceType, setServiceType] = useState(initialServiceType || "");

  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState("");

  const title =
    mode === "new"
      ? t("bookingChangeModal.title_new", "Request a new booking")
      : t("bookingChangeModal.title", "Request a booking change");

  const subtitle =
    mode === "new"
      ? t("bookingChangeModal.subtitle_new", "Tell us what service you need and when you’d like it.")
      : t("bookingChangeModal.subtitle", "Update the service type, date, or add a note. We’ll confirm by email.");

  const submitLabel =
    mode === "new"
      ? t("bookingChangeModal.buttons.submit_new", "Submit request")
      : t("bookingChangeModal.buttons.submit", "Submit");

  const hasChanges = useMemo(() => {
    if (mode === "new") return true;
    const noDateChange = newDate === initialDateStr;
    const noServiceChange = serviceType === (initialServiceType || "");
    const noComment = comment.trim() === "";
    return !(noDateChange && noServiceChange && noComment);
  }, [mode, newDate, initialDateStr, serviceType, initialServiceType, comment]);

  const validate = () => {
    const e = {};
    if (!serviceType?.trim()) e.serviceType = t("bookingChangeModal.alerts.missing_service", "Please enter the service type.");
    if (!newDate) e.newDate = t("bookingChangeModal.alerts.missing_date", "Please select a date.");
    setErrors(e);

    if (Object.keys(e).length) {
      setBanner(t("bookingChangeModal.alerts.missing_fields", "Please complete the required fields."));
      return false;
    }

    if (mode === "change" && !hasChanges) {
      setBanner(t("bookingChangeModal.alerts.no_changes", "No changes made."));
      return false;
    }

    setBanner("");
    return true;
  };

  const onSubmit = () => {
    if (!validate()) return;

    if (mode === "change") {
      const noDateChange = newDate === initialDateStr;
      const noServiceChange = serviceType === (initialServiceType || "");

      handleSubmit({
        newDate: noDateChange ? null : newDate,
        serviceType: noServiceChange ? null : serviceType,
        comment,
        mode: "change",
      });
    } else {
      handleSubmit({
        requestedDate: newDate,
        requestedServiceType: serviceType,
        comment,
        mode: "new",
      });
    }

    // reset + close
    setNewDate("");
    setComment("");
    setServiceType("");
    setErrors({});
    setBanner("");
    handleClose();
  };

  useEffect(() => {
    if (!show) return;

    setErrors({});
    setBanner("");

    if (mode === "new") {
      setNewDate("");
      setServiceType("");
      setComment("");
      return;
    }

    // change mode
    setNewDate(initialDateStr || "");
    setServiceType(initialServiceType || "");
    setComment("");
  }, [show, mode, initialDateStr, initialServiceType]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      contentClassName="cleanarModal"
      backdropClassName="cleanarModalBackdrop"
    >
      <Modal.Header closeButton className="cleanarModalHeader">
        <div className="d-flex align-items-start gap-3">
          <div className="cleanarModalIcon">
            <FaExchangeAlt />
          </div>

          <div>
            <Modal.Title className="cleanarModalTitle">{title}</Modal.Title>
            <div className="cleanarModalSubtitle">{subtitle}</div>

            <div className="d-flex gap-2 mt-2">
              <Badge bg="light" text="dark" className="cleanarPillBadge">
                {mode === "new" ? t("bookingChangeModal.badge_new", "New request") : t("bookingChangeModal.badge_change", "Change request")}
              </Badge>
              <Badge bg="light" text="dark" className="cleanarPillBadge">
                {t("bookingChangeModal.badge_fast", "Fast response")}
              </Badge>
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="cleanarModalBody">
        {banner ? (
          <Alert variant="warning" className="mb-3">
            {banner}
          </Alert>
        ) : null}

        {mode === "change" ? (
          <div className="cleanarSummaryCard mb-3">
            <div className="cleanarSummaryTitle">{t("bookingChangeModal.summary_title", "Current booking")}</div>
            <div className="cleanarSummaryGrid">
              <div>
                <div className="cleanarSummaryLabel">{t("bookingChangeModal.fields.serviceType", "Service type")}</div>
                <div className="cleanarSummaryValue">{initialServiceType || "—"}</div>
              </div>
              <div>
                <div className="cleanarSummaryLabel">{t("bookingChangeModal.fields.date", "Date")}</div>
                <div className="cleanarSummaryValue">{initialDateStr || "—"}</div>
              </div>
            </div>
          </div>
        ) : null}

        <Form>
          <Row className="g-3">
            <Col md={7}>
              <Form.Group controlId="formServiceType">
                <Form.Label className="cleanarLabel">
                  {t("bookingChangeModal.fields.serviceType", "Service type")} <span className="cleanarReq">*</span>
                </Form.Label>

                <div className="cleanarInputWithIcon">
                  <FaRegStickyNote className="cleanarInputIcon" />
                  <Form.Control
                    type="text"
                    value={serviceType}
                    className="cleanarInput"
                    placeholder={t("bookingChangeModal.fields.serviceType_placeholder", "e.g., House Cleaning")}
                    onChange={(e) => {
                      setServiceType(e.target.value);
                      setErrors((p) => ({ ...p, serviceType: "" }));
                    }}
                    isInvalid={!!errors.serviceType}
                    autoFocus
                  />
                </div>

                {errors.serviceType ? <div className="cleanarInvalid">{errors.serviceType}</div> : null}
              </Form.Group>
            </Col>

            <Col md={5}>
              <Form.Group controlId="formNewDate">
                <Form.Label className="cleanarLabel">
                  {t("bookingChangeModal.fields.date", "Date")} <span className="cleanarReq">*</span>
                </Form.Label>

                <div className="cleanarInputWithIcon">
                  <FaCalendarAlt className="cleanarInputIcon" />
                  <Form.Control
                    type="date"
                    value={newDate}
                    className="cleanarInput"
                    onChange={(e) => {
                      setNewDate(e.target.value);
                      setErrors((p) => ({ ...p, newDate: "" }));
                    }}
                    isInvalid={!!errors.newDate}
                  />
                </div>

                {errors.newDate ? <div className="cleanarInvalid">{errors.newDate}</div> : null}
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group controlId="formComment">
                <Form.Label className="cleanarLabel">
                  {t("bookingChangeModal.fields.comment", "Comment")}{" "}
                  <span className="cleanarMuted">({t("bookingChangeModal.optional", "optional")})</span>
                </Form.Label>

                <Form.Control
                  as="textarea"
                  rows={4}
                  className="cleanarInput"
                  placeholder={t("bookingChangeModal.fields.comment_placeholder", "Add details like access notes, preferences, or constraints.")}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                <div className="cleanarHint mt-2">
                  {t("bookingChangeModal.hint", "We’ll confirm availability and any adjustments by email.")}
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer className="cleanarModalFooter">
        <Button variant="outline-secondary" onClick={handleClose} className="cleanarBtnGhost">
          {t("bookingChangeModal.buttons.cancel", "Cancel")}
        </Button>

        <Button
          variant="primary"
          onClick={onSubmit}
          className="cleanarBtnPrimary"
          disabled={mode === "change" ? !hasChanges : false}
          title={mode === "change" && !hasChanges ? t("bookingChangeModal.disabled_no_changes", "Make a change to submit.") : undefined}
        >
          {submitLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingChangeModal;