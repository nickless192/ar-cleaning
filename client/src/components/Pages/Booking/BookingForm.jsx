import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Form, FormGroup, Label, Input, Button, Spinner, Alert,
  Table, Card, CardBody
} from "reactstrap";
import Auth from "/src/utils/auth";
import CustomerForm from "/src/components/Pages/Customer/CustomerForm";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '/src/components/API/customerApi';

const NEW_CUSTOMER_VALUE = "__new__";
const DRAFT_KEY = "booking.draft";

const BookingForm = ({
  customers, prefillDate, setShowAddModal, fetchBookings, setCustomers
}) => {

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    serviceType: '',
    date: prefillDate || '',
    scheduleConfirmation: false,
    confirmationDate: '',
    reminderScheduled: false,
    disableConfirmation: false,
  });

  const emptyCustomerInitial = useMemo(() => ({
    firstName: "",
    lastName: "",
    email: "",
    telephone: "",
    address: "",
    city: "",
    province: "",
    postalcode: "",
    companyName: "",
    defaultService: "",
    status: "",
    type: "",
  }), []);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const newCustomer = location.state?.newCustomer;

    if (newCustomer?._id) {
      setSelectedCustomerId(newCustomer._id);
      applySelectedCustomerToForm(newCustomer);

      // clear state so it doesn't re-trigger if user refreshes
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);



  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [customerCreateLoading, setCustomerCreateLoading] = useState(false);

  const [services, setServices] = useState([
    {
      serviceType: "",
      description: "",
      billingType: "quantity",
      hours: 0,
      quantity: 1,
      price: 0,
      amount: 0,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const handleChange = e => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const handleServiceChange = (index, field, value) => {
    const updated = [...services];
    updated[index][field] = value;

    if (field === "hours" || field === "quantity" || field === "price" || field === "billingType") {
      const svc = updated[index];
      if (svc.billingType === "hours") {
        svc.amount = (svc.hours || 0) * (svc.price || 0);
      } else {
        svc.amount = (svc.quantity || 0) * (svc.price || 0);
      }
    }
    setServices(updated);
  };

  const addServiceRow = () => {
    setServices((prev) => [
      ...prev,
      { serviceType: "", description: "", billingType: "quantity", hours: 0, quantity: 1, price: 0, amount: 0 },
    ]);
  };

  const removeServiceRow = (index) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const totalIncome = services.reduce((sum, s) => sum + (s.amount || 0), 0);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!formData.customerName || !formData.customerEmail || !formData.date) {
      setMessage({ type: 'danger', text: 'Please fill in all required fields.' });
      setLoading(false);
      return;
    }

    const hasAtLeastOneService = services.some((s) => s.serviceType && (s.amount || 0) >= 0);
    if (!hasAtLeastOneService) {
      setMessage({ type: "danger", text: "Please add at least one service." });
      setLoading(false);
      return;
    }

    try {
      const body = {
        ...formData,
        serviceType: services[0]?.serviceType || "Service(s)",
        income: totalIncome,
        services,
        userId: Auth.getProfile().data._id,
      };
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Failed to submit booking');

      setMessage({ type: 'success', text: 'Booking submitted successfully!' });
      sessionStorage.removeItem(DRAFT_KEY);
      setShowAddModal(false);
      fetchBookings();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error submitting booking.' });
    } finally {
      setLoading(false);
    }
  };

  const applySelectedCustomerToForm = (selectedCustomer) => {
    if (!selectedCustomer) {
      setFormData(prev => ({ ...prev, customerId: '', customerName: '', customerEmail: '', serviceType: '' }));
      setSelectedCustomerId("");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      customerId: selectedCustomer._id,
      customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
      customerEmail: selectedCustomer.email,
      serviceType: selectedCustomer.defaultService,
    }));

    setServices((prev) => {
      const updated = [...prev];
      updated[0] = {
        ...updated[0],
        serviceType: selectedCustomer.defaultService || "",
        description: selectedCustomer.defaultService || "",
      };
      return updated;
    });
  };

  const handleCustomerCreateSubmit = async (e, customerFormData) => {
    e.preventDefault();
    setCustomerCreateLoading(true);
    await createCustomer(customerFormData);
    setCustomerCreateLoading(false);
    setMessage(null);

    // try {
    //   const res = await fetch("/api/customers", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(customerFormData),
    //   });

    //   if (!res.ok) throw new Error("Failed to create customer.");
    //   const createdCustomer = await res.json();

    //   if (typeof setCustomers === "function") {
    //     setCustomers((prev) => [createdCustomer, ...prev]);
    //   }

    //   // Automatically select the newly created customer
    //   setSelectedCustomerId(createdCustomer._id);
    //   applySelectedCustomerToForm(createdCustomer);

    //   setMessage({ type: "success", text: "Customer created and selected ✅" });
    //   setIsNewCustomerOpen(false); // Hide the inline form
    //   setCustomerCreateLoading(false);
    // } catch (err) {
    //   setMessage({ type: "danger", text: err.message || "Error creating customer." });
    // } 
    // finally {
    // }
  };

  const handleSave = async (e, data) => {
    e.preventDefault();
    if (data._id) await updateCustomer(data._id, data);
    else await createCustomer(data);
    setModalOpen(false);
    fetchCustomers();
  };

  return (
    <>
      {message && <Alert color={message.type}>{message.text}</Alert>}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="customerSelect">Select Saved Customer</Label>
          {/* <Input
            type="select"
            id="customerSelect"
            value={selectedCustomerId}
            onChange={(e) => {
              const selectedId = e.target.value;
              if (selectedId === NEW_CUSTOMER_VALUE) {
                setIsNewCustomerOpen(true);
                return;
              }
              setIsNewCustomerOpen(false);
              setSelectedCustomerId(selectedId);
              const selectedCustomer = customers.find((c) => c._id === selectedId);
              applySelectedCustomerToForm(selectedCustomer);
            }}
          > */}
          <Input
            type="select"
            id="customerSelect"
            value={selectedCustomerId}
            onChange={(e) => {
              const selectedId = e.target.value;

              if (selectedId === NEW_CUSTOMER_VALUE) {
                sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
                  formData,
                  selectedCustomerId,
                  // include anything else you need to restore (selected service, date, notes, etc.)
                }));
                navigate("/admin/customer?tab=customers", {
                  state: {
                    from: "/admin/booking",
                    returnToBooking: true,
                    openAddCustomerModal: true,
                    // prefill: {
                    //   customerName: formData.customerName,
                    //   customerEmail: formData.customerEmail,
                    // },
                    reopenBookingModal: true,
                    prefillDate: formData.date
                  },
                });
                return;
              }

              setSelectedCustomerId(selectedId);
              const selectedCustomer = customers.find((c) => c._id === selectedId);
              applySelectedCustomerToForm(selectedCustomer);
            }}
          >

            <option value="">-- Select a customer --</option>
            <option value={NEW_CUSTOMER_VALUE}>+ Add new customer…</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.firstName} {c.lastName} ({c.email})
              </option>
            ))}
          </Input>
        </FormGroup>

        {/* INLINE CUSTOMER FORM */}
        {/* {isNewCustomerOpen && (
          <Card className="mb-4 border-primary bg-light">
            <CardBody>
              <h5>Create New Customer</h5>
              <CustomerForm
                initialData={emptyCustomerInitial}
                onSubmit={handleCustomerCreateSubmit}
                onCancel={() => setIsNewCustomerOpen(false)}
              />
              {customerCreateLoading && (
                <div className="mt-2 text-center">
                  <Spinner size="sm" /> Creating customer...
                </div>
              )}
              <Button 
                color="link" 
                size="sm" 
                className="mt-2" 
                onClick={() => setIsNewCustomerOpen(false)}
              >
                Cancel and return to selection
              </Button>
            </CardBody>
          </Card>
        )} */}

        <FormGroup>
          <Label for="customerName">Customer Name</Label>
          <Input
            type="text"
            name="customerName"
            className="text-cleanar-color text-bold form-input"
            id="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
            readOnly={!!formData.customerId}
          />
        </FormGroup>

        <FormGroup>
          <Label for="customerEmail">Customer Email</Label>
          <Input
            type="email"
            name="customerEmail"
            className="text-cleanar-color text-bold form-input"
            id="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            required
            readOnly={!!formData.customerId}
          />
        </FormGroup>

        <FormGroup>
          <Label>Services</Label>
          <Table bordered size="sm" responsive>
            <thead>
              <tr>
                <th>Service Type</th>
                <th>Description</th>
                <th>Billing</th>
                <th>Value</th>
                <th>Price</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, index) => (
                <tr key={index}>
                  <td>
                    <Input
                      value={s.serviceType}
                      className="text-cleanar-color text-bold form-input"
                      onChange={(e) => handleServiceChange(index, "serviceType", e.target.value)}
                      required={index === 0}
                    />
                  </td>
                  <td>
                    <Input
                      value={s.description}
                      className="text-cleanar-color text-bold form-input"
                      onChange={(e) => handleServiceChange(index, "description", e.target.value)}
                    />
                  </td>
                  <td>
                    <Input
                      type="select"
                      value={s.billingType}
                      className="text-cleanar-color text-bold form-input"
                      onChange={(e) => handleServiceChange(index, "billingType", e.target.value)}
                    >
                      <option value="hours">Hours</option>
                      <option value="quantity">Quantity</option>
                    </Input>
                  </td>
                  <td>
                    <Input
                      type="number"
                      value={s.billingType === "hours" ? s.hours : s.quantity}
                      className="text-cleanar-color text-bold form-input"
                      onChange={(e) => handleServiceChange(index, s.billingType === "hours" ? "hours" : "quantity", Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      value={s.price}
                      className="text-cleanar-color text-bold form-input"
                      onChange={(e) => handleServiceChange(index, "price", Number(e.target.value))}
                    />
                  </td>
                  <td>{s.amount.toFixed(2)}</td>
                  <td>
                    {index > 0 && (
                      <Button color="danger" size="sm" onClick={() => removeServiceRow(index)}>X</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button color="secondary" size="sm" onClick={addServiceRow}>+ Add Service</Button>
        </FormGroup>

        <FormGroup>
          <Label for="date">Service Date</Label>
          <Input
            type="datetime-local"
            name="date"
            id="date"
            className="text-cleanar-color text-bold form-input"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Total (CAD)</Label>
          <Input
            type="number"
            readOnly
            className="text-cleanar-color text-bold form-input"
            value={totalIncome.toFixed(2)}
          />
        </FormGroup>

        <Button type="submit" color="primary" disabled={loading || isNewCustomerOpen}>
          {loading ? <Spinner size="sm" /> : 'Submit Booking'}
        </Button>
      </Form>
    </>
  );
};

export default BookingForm;