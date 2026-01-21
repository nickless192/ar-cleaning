// CustomerList.jsx (Modern UX drop-in)
// Uses only react + reactstrap, keeps your callbacks & note modal behavior.

import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  FormGroup,
  Row,
  Table,
} from "reactstrap";

const safe = (v) => (v == null ? "" : String(v));
const fmtDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
};

const normalize = (s) => safe(s).trim().toLowerCase();

const CustomerList = ({ customers = [], onEdit, onManageRelations, onDelete }) => {
  // Notes modal state (kept from your current version)
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState("");

  // New UX state
  const [query, setQuery] = useState("");
  const [view, setView] = useState("cards"); // "cards" | "table"
  const [sortKey, setSortKey] = useState("createdAt"); // "name" | "createdAt" | "company" | "city"
  const [sortDir, setSortDir] = useState("desc"); // "asc" | "desc"

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterProvince, setFilterProvince] = useState("all");
  const [filterCity, setFilterCity] = useState("all");

  const provinces = useMemo(() => {
    const set = new Set();
    customers.forEach((c) => {
      if (c?.province) set.add(String(c.province));
    });
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [customers]);

  const cities = useMemo(() => {
    const set = new Set();
    customers.forEach((c) => {
      if (c?.city) set.add(String(c.city));
    });
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [customers]);

  const handleOpenModal = (customer) => {
    setSelectedCustomer(customer);
    fetch(`/api/customers/${customer._id}/notes`)
      .then((response) => response.json())
      .then((data) => setNotes(data.notes || ""))
      .catch((err) => console.error("Failed to load notes", err));
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNotes("");
  };

  const handleSaveNote = () => {
    if (!selectedCustomer?._id) return;
    fetch(`/api/customers/${selectedCustomer._id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    })
      .then((response) => response.json())
      .then(() => handleCloseModal())
      .catch((err) => console.error("Failed to save note", err));
  };

  const filteredSorted = useMemo(() => {
    const q = normalize(query);

    const passesQuery = (c) => {
      if (!q) return true;
      const hay = [
        c.firstName,
        c.lastName,
        c.email,
        c.telephone,
        c.companyName,
        c.address,
        c.city,
        c.province,
        c.postalcode,
        c.defaultService,
        c.status,
        c.type,
        c?.user?.username,
      ]
        .map(normalize)
        .join(" ");
      return hay.includes(q);
    };

    const passesFilters = (c) => {
      const st = normalize(c.status || "active");
      const ty = normalize(c.type || "one-time");
      const prov = safe(c.province);
      const city = safe(c.city);

      if (filterStatus !== "all" && st !== normalize(filterStatus)) return false;
      if (filterType !== "all" && ty !== normalize(filterType)) return false;
      if (filterProvince !== "all" && prov !== filterProvince) return false;
      if (filterCity !== "all" && city !== filterCity) return false;

      return true;
    };

    const compare = (a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const nameA = `${safe(a.firstName)} ${safe(a.lastName)}`.trim();
      const nameB = `${safe(b.firstName)} ${safe(b.lastName)}`.trim();

      const getVal = (c) => {
        switch (sortKey) {
          case "name":
            return normalize(nameA === nameB ? nameA : `${safe(c.firstName)} ${safe(c.lastName)}`);
          case "company":
            return normalize(c.companyName);
          case "city":
            return normalize(c.city);
          case "createdAt":
          default:
            return new Date(c.createdAt || 0).getTime();
        }
      };

      const va = getVal(a);
      const vb = getVal(b);

      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    };

    return [...customers].filter((c) => passesQuery(c) && passesFilters(c)).sort(compare);
  }, [customers, query, filterStatus, filterType, filterProvince, filterCity, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "createdAt" ? "desc" : "asc");
    }
  };

  const TypeBadge = ({ type }) => {
    const t = normalize(type || "one-time");
    const color = t === "recurring" ? "success" : t === "one-time" ? "secondary" : "info";
    return <Badge color={color} pill className="text-uppercase">{safe(type || "one-time")}</Badge>;
  };

  const StatusBadge = ({ status }) => {
    const s = normalize(status || "active");
    const color = s === "active" ? "success" : s === "inactive" ? "warning" : "dark";
    return <Badge color={color} pill className="text-uppercase">{safe(status || "active")}</Badge>;
  };

  const UserBadge = ({ user }) => {
    if (!user?.username) return <Badge color="light" pill className="text-muted">No user linked</Badge>;
    return <Badge color="primary" pill>@{user.username}</Badge>;
  };

  const CustomerCard = ({ cust }) => {
    const fullName = `${safe(cust.firstName)} ${safe(cust.lastName)}`.trim() || "Unnamed Customer";
    const bookingCount = Array.isArray(cust.bookings) ? cust.bookings.length : 0;
    const hasNotes = !!safe(cust.notes).trim();

    return (
      <Card className="h-100 shadow-sm border-0">
        <CardHeader className="bg-white border-0 pb-0">
          <div className="d-flex justify-content-between align-items-start gap-2">
            <div className="min-w-0">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h6 className="mb-0 text-truncate" title={fullName}>{fullName}</h6>
                <TypeBadge type={cust.type} />
                <StatusBadge status={cust.status} />
              </div>

              <div className="text-muted small mt-1 text-truncate">
                {cust.companyName ? <span className="me-2"><strong>{cust.companyName}</strong></span> : null}
                <span className="me-2">Created: {fmtDate(cust.createdAt)}</span>
                <span>Bookings: {bookingCount}</span>
              </div>
            </div>

            <div className="d-flex flex-column align-items-end gap-1">
              <UserBadge user={cust.user} />
              {cust.defaultService ? (
                <Badge color="info" pill className="text-truncate" title={cust.defaultService}>
                  {cust.defaultService}
                </Badge>
              ) : (
                <Badge color="light" pill className="text-muted">No default service</Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardBody className="pt-3">
          <div className="d-flex flex-column gap-2">
            <div className="d-flex flex-wrap gap-3">
              <div className="text-truncate" style={{ maxWidth: "48%" }}>
                <div className="text-muted small">Email</div>
                <div className="text-truncate" title={safe(cust.email)}>{cust.email || "-"}</div>
              </div>
              <div className="text-truncate" style={{ maxWidth: "48%" }}>
                <div className="text-muted small">Phone</div>
                <div className="text-truncate" title={safe(cust.telephone)}>{cust.telephone || "-"}</div>
              </div>
            </div>

            <div className="text-truncate">
              <div className="text-muted small">Address</div>
              <div className="text-truncate" title={`${safe(cust.address)} ${safe(cust.city)} ${safe(cust.province)} ${safe(cust.postalcode)}`}>
                {[cust.address, cust.city, cust.province, cust.postalcode].filter(Boolean).join(", ") || "-"}
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-2">
              <div className="text-muted small">
                Notes:{" "}
                {hasNotes ? (
                  <Badge color="success" pill>Has notes</Badge>
                ) : (
                  <Badge color="light" pill className="text-muted">None</Badge>
                )}
              </div>

              <ButtonGroup size="sm">
                <Button color="primary" onClick={() => onEdit?.(cust)}>Edit</Button>
                <Button color="info" onClick={() => onManageRelations?.(cust)}>Links</Button>
                <Button color="secondary" onClick={() => handleOpenModal(cust)}>Notes</Button>
                <Button color="danger" onClick={() => onDelete?.(cust._id)}>Delete</Button>
              </ButtonGroup>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <>
      {/* Toolbar */}
      <Card className="border-0 shadow-sm mb-3">
        <CardBody>
          <Row className="g-2 align-items-end">
            <Col md={4}>
              <Label className="small text-muted mb-1">Search</Label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, phone, company, address, user…"
              />
            </Col>

            <Col md={2}>
              <Label className="small text-muted mb-1">Status</Label>
              <Input type="select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </Input>
            </Col>

            <Col md={2}>
              <Label className="small text-muted mb-1">Type</Label>
              <Input type="select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All</option>
                <option value="one-time">One-time</option>
                <option value="recurring">Recurring</option>
                <option value="other">Other</option>
              </Input>
            </Col>

            <Col md={2}>
              <Label className="small text-muted mb-1">Province</Label>
              <Input type="select" value={filterProvince} onChange={(e) => setFilterProvince(e.target.value)}>
                {provinces.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Input>
            </Col>

            <Col md={2}>
              <Label className="small text-muted mb-1">City</Label>
              <Input type="select" value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Input>
            </Col>
          </Row>

          <Row className="g-2 mt-2 align-items-center">
            <Col md={6} className="d-flex gap-2 flex-wrap align-items-center">
              <span className="text-muted small">
                Showing <strong>{filteredSorted.length}</strong> of <strong>{customers.length}</strong>
              </span>

              <ButtonGroup size="sm">
                <Button
                  color={view === "cards" ? "primary" : "light"}
                  onClick={() => setView("cards")}
                >
                  Cards
                </Button>
                <Button
                  color={view === "table" ? "primary" : "light"}
                  onClick={() => setView("table")}
                >
                  Table
                </Button>
              </ButtonGroup>
            </Col>

            <Col md={6} className="d-flex justify-content-md-end gap-2">
              <Button size="sm" color="light" onClick={() => toggleSort("name")}>
                Sort: Name {sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </Button>
              <Button size="sm" color="light" onClick={() => toggleSort("createdAt")}>
                Sort: Created {sortKey === "createdAt" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </Button>
              <Button size="sm" color="light" onClick={() => toggleSort("company")}>
                Sort: Company {sortKey === "company" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </Button>
              <Button size="sm" color="light" onClick={() => toggleSort("city")}>
                Sort: City {sortKey === "city" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Empty state */}
      {filteredSorted.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardBody className="text-center text-muted py-5">
            <div className="mb-2">No customers found.</div>
            <div className="small">Try adjusting search/filters.</div>
          </CardBody>
        </Card>
      ) : view === "cards" ? (
        // Cards view
        <Row className="g-3">
          {filteredSorted.map((cust) => (
            <Col key={cust._id} xl={4} lg={6} md={6} sm={12}>
              <CustomerCard cust={cust} />
            </Col>
          ))}
        </Row>
      ) : (
        // Table view (compact but richer)
        <Table responsive hover className="align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ minWidth: 220 }}>Customer</th>
              <th style={{ minWidth: 220 }}>Contact</th>
              <th style={{ minWidth: 260 }}>Address</th>
              <th style={{ minWidth: 170 }}>Meta</th>
              <th style={{ minWidth: 260 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSorted.map((cust) => {
              const fullName = `${safe(cust.firstName)} ${safe(cust.lastName)}`.trim();
              const bookingCount = Array.isArray(cust.bookings) ? cust.bookings.length : 0;

              return (
                <tr key={cust._id}>
                  <td>
                    <div className="fw-semibold">{fullName || "Unnamed Customer"}</div>
                    <div className="small text-muted d-flex gap-2 flex-wrap mt-1">
                      <TypeBadge type={cust.type} />
                      <StatusBadge status={cust.status} />
                      {cust.companyName ? <Badge color="light" pill>{cust.companyName}</Badge> : null}
                      <UserBadge user={cust.user} />
                    </div>
                  </td>

                  <td>
                    <div className="small">
                      <div className="text-truncate" title={safe(cust.email)}>
                        <span className="text-muted">Email:</span> {cust.email || "-"}
                      </div>
                      <div className="text-truncate" title={safe(cust.telephone)}>
                        <span className="text-muted">Phone:</span> {cust.telephone || "-"}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="small text-truncate" title={`${safe(cust.address)} ${safe(cust.city)} ${safe(cust.province)} ${safe(cust.postalcode)}`}>
                      {[cust.address, cust.city, cust.province, cust.postalcode].filter(Boolean).join(", ") || "-"}
                    </div>
                  </td>

                  <td>
                    <div className="small text-muted">
                      <div>Created: {fmtDate(cust.createdAt)}</div>
                      <div>Bookings: {bookingCount}</div>
                      <div className="text-truncate" title={safe(cust.defaultService)}>
                        Default: {cust.defaultService || "-"}
                      </div>
                    </div>
                  </td>

                  <td>
                    <ButtonGroup size="sm" className="flex-wrap">
                      <Button color="primary" onClick={() => onEdit?.(cust)}>Edit</Button>
                      <Button color="info" onClick={() => onManageRelations?.(cust)}>Links</Button>
                      <Button color="secondary" onClick={() => handleOpenModal(cust)}>Notes</Button>
                      <Button color="danger" onClick={() => onDelete?.(cust._id)}>Delete</Button>
                    </ButtonGroup>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      {/* Modal for Adding Notes (kept) */}
      <Modal isOpen={showModal} toggle={handleCloseModal}>
        <ModalHeader toggle={handleCloseModal}>
          Add Note for {selectedCustomer?.firstName} {selectedCustomer?.lastName}
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="notes">Notes</Label>
            <Input
              type="textarea"
              id="notes"
              value={notes}
              className="text-cleanar-color form-input"
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveNote}>Save Note</Button>
          <Button color="secondary" onClick={handleCloseModal}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CustomerList;
