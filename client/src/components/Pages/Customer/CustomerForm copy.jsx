import React, { useEffect, useMemo, useState } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  Input,
  Label,
  Popover,
  PopoverBody,
  FormGroup,
} from "reactstrap";
import { FaQuestionCircle } from "react-icons/fa";

/**
 * ✅ Drop-in Accordion version (Reactstrap-only)
 * - Condenses the form into collapsible sections
 * - Mobile friendly
 * - Keeps your tooltips + normalizeCustomer + prefill safety
 * - No extra deps (no react-bootstrap Accordion)
 */

const tooltipText = {
  firstName: "Customer’s given name.",
  lastName: "Customer’s family/surname (optional).",
  email: "We’ll use this to send confirmations, invoices, and updates.",
  telephone: "Optional. Useful for confirmations or access details.",
  companyName: "Optional. If this customer is a business.",
  address: "Street address, unit #, or building details.",
  city: "City of residence/service location.",
  province: "e.g., Ontario",
  postalcode: "Format: A1A 1A1",
  defaultService: "Quick label for what they usually book (e.g., Deep Clean).",
  defaultServiceDescription:
    "Default scope/notes you often use for this customer (included as a starting point in bookings/invoices).",
  status: "Customer status (active/inactive/archived).",
  type: "Customer type (one-time, recurring, other).",
};

const splitFullName = (fullName = "") => {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  const firstName = parts.shift() || "";
  const lastName = parts.join(" ");
  return { firstName, lastName };
};

const normalizeCustomer = (data) => {
  const d = data && typeof data === "object" ? data : {};

  return {
    firstName: d.firstName || "",
    lastName: d.lastName || "",
    email: d.email || "",
    telephone: d.telephone || "",
    companyName: d.companyName || "",
    address: d.address || "",
    city: d.city || "",
    province: d.province || "",
    postalcode: d.postalcode || "",
    defaultService: d.defaultService || "",
    defaultServiceDescription: d.defaultServiceDescription || "",
    status: d.status || "active",
    type: d.type || "",
    _id: d._id,
    prefill: d.prefill,
  };
};

const Customer = ({ initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(() => normalizeCustomer(initialData));
  const [popoverOpen, setPopoverOpen] = useState({});

  // Accordion open state (single-open mode)
  const [openSection, setOpenSection] = useState("customer"); // default open

  const isEditing = !!formData?._id;

  useEffect(() => {
    setFormData(normalizeCustomer(initialData));
  }, [initialData]);

  const togglePopover = (field) => {
    setPopoverOpen((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(normalizeCustomer(initialData));
  };

  // Safe prefill (won't crash)
  useEffect(() => {
    const prefill = initialData?.prefill;
    if (!prefill) return;

    const { firstName, lastName } = splitFullName(prefill.customerName || "");
    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || firstName,
      lastName: prev.lastName || lastName,
      email: prev.email || prefill.customerEmail || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusOptions = useMemo(
    () => [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "archived", label: "Archived" },
    ],
    []
  );

  const typeOptions = useMemo(
    () => [
      { value: "", label: "-- Select --" },
      { value: "one-time", label: "One-time" },
      { value: "recurring", label: "Recurring" },
      { value: "other", label: "Other" },
    ],
    []
  );

  const labelWithHelp = (fieldName, label, required) => (
    <div className="d-flex align-items-center justify-content-between gap-2">
      <span className="text-bold">
        {label}
        {required ? <span className="text-danger ms-1">*</span> : null}
      </span>

      <button
        type="button"
        className="btn btn-link p-0 text-muted"
        style={{ lineHeight: 1 }}
        id={`${fieldName}Tooltip`}
        onClick={() => togglePopover(fieldName)}
        aria-label={`Help: ${label}`}
      >
        <FaQuestionCircle />
      </button>

      <Popover
        placement="top"
        isOpen={!!popoverOpen[fieldName]}
        target={`${fieldName}Tooltip`}
        toggle={() => togglePopover(fieldName)}
      >
        <PopoverBody>{tooltipText[fieldName] || "Enter value"}</PopoverBody>
      </Popover>
    </div>
  );

  const toggleSection = (key) => {
    setOpenSection((prev) => (prev === key ? "" : key));
  };

  const AccordionSection = ({ k, title, subtitle, children, badge }) => {
    const isOpen = openSection === k;

    return (
      <div className="border rounded-3 mb-3 overflow-hidden">
        <button
          type="button"
          className={`w-100 text-start d-flex align-items-center justify-content-between gap-3 px-3 py-3 ${
            isOpen ? "bg-light" : "bg-white"
          }`}
          style={{ border: "none" }}
          onClick={() => toggleSection(k)}
          aria-expanded={isOpen}
        >
          <div className="d-flex align-items-start gap-2 flex-grow-1">
            <div className="fw-semibold">{title}</div>
            {badge ? <span className="badge bg-dark">{badge}</span> : null}
          </div>

          <div className="d-flex align-items-center gap-2">
            {subtitle ? (
              <span className="text-muted d-none d-sm-inline" style={{ fontSize: 13 }}>
                {subtitle}
              </span>
            ) : null}
            <span className="text-muted" aria-hidden>
              {isOpen ? "▾" : "▸"}
            </span>
          </div>
        </button>

        {isOpen ? <div className="p-3">{children}</div> : null}
      </div>
    );
  };

  return (
    <Form onSubmit={(e) => onSubmit(e, formData)} id="customer-form" className="m-0 p-0">
      {/* Header actions */}
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
        <div>
          <h5 className="mb-1">{isEditing ? "Edit Customer" : "New Customer"}</h5>
          <div className="text-muted" style={{ fontSize: 13 }}>
            {isEditing
              ? "Update details and save changes."
              : "Create a customer profile you can reuse for bookings & invoices."}
          </div>
        </div>

        <div className="d-flex gap-2">
          <Button
            type="button"
            color="secondary"
            outline
            className="rounded-pill"
            onClick={handleReset}
          >
            Reset
          </Button>

          {onCancel ? (
            <Button
              type="button"
              color="secondary"
              outline
              className="rounded-pill"
              onClick={onCancel}
            >
              Close
            </Button>
          ) : null}
        </div>
      </div>

      {/* Accordion sections */}

      <AccordionSection
        k="customer"
        title="Customer"
        subtitle="Name & company"
        badge={isEditing ? `ID: ${String(formData._id).slice(-6)}` : null}
      >
        <Row className="g-3">
          <Col xs={12} md={6} xl={4}>
            <FormGroup>
              <Label for="firstName" className="w-100 mb-1">
                {labelWithHelp("firstName", "First Name", true)}
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="e.g., Rosemary"
                className="text-cleanar-color form-input rounded-pill"
                autoComplete="given-name"
              />
            </FormGroup>
          </Col>

          <Col xs={12} md={6} xl={4}>
            <FormGroup>
              <Label for="lastName" className="w-100 mb-1">
                {labelWithHelp("lastName", "Last Name", false)}
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g., Seper"
                className="text-cleanar-color form-input rounded-pill"
                autoComplete="family-name"
              />
            </FormGroup>
          </Col>

          <Col xs={12} md={6} xl={4}>
            <FormGroup>
              <Label for="companyName" className="w-100 mb-1">
                {labelWithHelp("companyName", "Company Name", false)}
              </Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Optional"
                className="text-cleanar-color form-input rounded-pill"
                autoComplete="organization"
              />
            </FormGroup>
          </Col>
        </Row>
      </AccordionSection>

      <AccordionSection k="contact" title="Contact" subtitle="Email & phone (used for invoices)">
        <Row className="g-3">
          <Col xs={12} md={6}>
            <FormGroup>
              <Label for="email" className="w-100 mb-1">
                {labelWithHelp("email", "Email", true)}
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@email.com"
                className="text-cleanar-color form-input rounded-pill"
                autoComplete="email"
              />
            </FormGroup>
          </Col>

          <Col xs={12} md={6}>
            <FormGroup>
              <Label for="telephone" className="w-100 mb-1">
                {labelWithHelp("telephone", "Phone Number", false)}
              </Label>
              <Input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="Optional"
                className="text-cleanar-color form-input rounded-pill"
                autoComplete="tel"
              />
            </FormGroup>
          </Col>
        </Row>
      </AccordionSection>

      <AccordionSection k="address" title="Service Address" subtitle="Where CleanAR provides service">
        <Row className="g-3">
          <Col xs={12}>
            <FormGroup>
              <Label for="address" className="w-100 mb-1">
                {labelWithHelp("address", "Address", false)}
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street, unit #, buzz code, etc."
                className="text-cleanar-color form-input rounded-pill"
                autoComplete="street-address"
              />
            </FormGroup>
          </Col>

          <Col xs={12} md={6} xl={4}>
            <FormGroup>
              <Label for="city" className="w-100 mb-1">
                {labelWithHelp("city", "City", false)}
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Toronto"
                className="text-cleanar-color form-input rounded-pill"
                autoComplete="address-level2"
              />
            </FormGroup>
          </Col>

          <Col xs={12} md={6} xl={4}>
            <FormGroup>
              <Label for="province" className="w-100 mb-1">
                {labelWithHelp("province", "Province", false)}
              </Label>
              <Input
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                placeholder="Ontario"
                className="text-cleanar-color form-input rounded-pill"
                autoComplete="address-level1"
              />
            </FormGroup>
          </Col>

          <Col xs={12} md={6} xl={4}>
            <FormGroup>
              <Label for="postalcode" className="w-100 mb-1">
                {labelWithHelp("postalcode", "Postal Code", false)}
              </Label>
              <Input
                id="postalcode"
                name="postalcode"
                value={formData.postalcode}
                onChange={handleChange}
                placeholder="A1A 1A1"
                className="text-cleanar-color form-input rounded-pill"
                autoComplete="postal-code"
              />
            </FormGroup>
          </Col>
        </Row>
      </AccordionSection>

      <AccordionSection k="defaults" title="Defaults" subtitle="Speed up bookings & invoices">
        <Row className="g-3">
          <Col xs={12} md={6}>
            <FormGroup>
              <Label for="defaultService" className="w-100 mb-1">
                {labelWithHelp("defaultService", "Default Service", false)}
              </Label>
              <Input
                id="defaultService"
                name="defaultService"
                value={formData.defaultService}
                onChange={handleChange}
                placeholder="e.g., Biweekly Main Floor + Primary Bedroom"
                className="text-cleanar-color form-input rounded-pill"
              />
            </FormGroup>
          </Col>

          <Col xs={12}>
            <FormGroup>
              <Label for="defaultServiceDescription" className="w-100 mb-1">
                {labelWithHelp("defaultServiceDescription", "Default Service Description", false)}
              </Label>
              <Input
                type="textarea"
                id="defaultServiceDescription"
                name="defaultServiceDescription"
                value={formData.defaultServiceDescription}
                onChange={handleChange}
                placeholder="Optional notes: scope, priorities, supplies, access instructions, recurring notes…"
                className="text-cleanar-color form-input"
                style={{ borderRadius: 16, minHeight: 90 }}
              />
            </FormGroup>
          </Col>
        </Row>
      </AccordionSection>

      <AccordionSection k="settings" title="Customer Settings" subtitle="Status & type">
        <Row className="g-3">
          <Col xs={12} md={6} xl={4}>
            <FormGroup>
              <Label for="status" className="w-100 mb-1">
                {labelWithHelp("status", "Status", false)}
              </Label>
              <Input
                type="select"
                id="status"
                name="status"
                value={formData.status || "active"}
                onChange={handleChange}
                className="text-cleanar-color form-input rounded-pill"
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </Col>

          <Col xs={12} md={6} xl={4}>
            <FormGroup>
              <Label for="type" className="w-100 mb-1">
                {labelWithHelp("type", "Type", false)}
              </Label>
              <Input
                type="select"
                id="type"
                name="type"
                value={formData.type || ""}
                onChange={handleChange}
                className="text-cleanar-color form-input rounded-pill"
              >
                {typeOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </Col>
        </Row>
      </AccordionSection>

      {/* Actions */}
      <div className="d-flex flex-column flex-sm-row gap-2 pb-2">
        <Button
          type="submit"
          className="secondary-bg-color rounded-pill flex-grow-1"
          data-track="clicked_submit_customer"
        >
          {isEditing ? "Save Changes" : "Create Customer"}
        </Button>

        <Button
          type="button"
          onClick={handleReset}
          className="btn-outline-danger rounded-pill flex-grow-1"
          data-track="clicked_reset_customer"
        >
          Reset
        </Button>
      </div>
    </Form>
  );
};

export default Customer;
