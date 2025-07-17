import React, { useState } from 'react';
import { Form, Row, Col, Button, Input, Label, Popover, PopoverBody, FormGroup } from 'reactstrap';
import { FaQuestionCircle } from 'react-icons/fa';

const tooltipText = {
  firstName: 'Your given name.',
  lastName: 'Your family or surname.',
  email: 'We’ll use this to send updates.',
  telephone: 'We might call for confirmations.',
  address: 'Street address or unit #.',
  city: 'City of residence.',
  province: 'e.g., Ontario',
  postalcode: 'Format: A1A 1A1',
  companyName: 'If you are representing a business.',
  howDidYouHearAboutUs: 'Optional feedback helps us improve.',
  user: 'The associated user ID in the system.'
};


const Customer = () => {
  const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  telephone: '',
  address: '',
  city: '',
  province: '',
  postalcode: '',
  companyName: '',
  howDidYouHearAboutUs: '',
//   user: ''
});
  const [popoverOpen, setPopoverOpen] = useState({});

  const togglePopover = (field) => {
    setPopoverOpen((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      alert('Customer created successfully');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        telephone: '',
        address: '',
        city: '',
        province: '',
        postalcode: '',
        companyName: '',
        howDidYouHearAboutUs: ''
      });
    } else {
      const error = await res.json();
      alert(`Error: ${error.message || 'Something went wrong'}`);
    }
  };

  const fields = [
    { label: 'First Name', name: 'firstName', required: true },
    { label: 'Last Name', name: 'lastName', required: true },
    { label: 'Email', name: 'email', required: true },
    { label: 'Phone Number', name: 'telephone', required: false },
    { label: 'Address', name: 'address', required: false },
    { label: 'City', name: 'city', required: false },
    { label: 'Province', name: 'province', required: false },
    { label: 'Postal Code', name: 'postalcode', required: true },
    { label: 'Company Name', name: 'companyName', required: false },
    // { label: 'User ID', name: 'user', required: false }
  ];

  return (
    <Form onSubmit={handleSubmit} id="customer-form" className="m-0 p-0">
      <Row>
        {fields.map(({ label, name, required }) => {
  // Determine input type
  const inputType = name === 'email' ? 'email' : name === 'telephone' ? 'tel' : 'text';

  return (
    <Col key={name} md={4} xs={12} className="mb-3">
      <FormGroup>
        <Label className="text-bold mb-1" for={name}>
          {label}{required && '*'}
          <FaQuestionCircle
            id={`${name}Tooltip`}
            className="ms-1"
            onClick={() => togglePopover(name)}
            style={{ cursor: 'pointer' }}
          />
          <Popover
            placement="top"
            isOpen={popoverOpen[name]}
            target={`${name}Tooltip`}
            toggle={() => togglePopover(name)}
          >
            <PopoverBody>{tooltipText[name] || 'Enter value'}</PopoverBody>
          </Popover>
        </Label>
        <Input
          type={inputType}
          id={name}
          name={name}
          placeholder={label}
          aria-label={label}
          className="text-cleanar-color form-input rounded-pill"
          value={formData[name]}
          onChange={handleChange}
          required={required}
        />
      </FormGroup>
    </Col>
  );
})}

      </Row>

      <Row className="pb-3">
        <Col md>
          <Button
            type="submit"
            className="secondary-bg-color rounded-pill"
            data-track="clicked_submit_customer"
          >
            Submit Customer
          </Button>
        </Col>
        <Col md>
          <Button
            type="button"
            onClick={() => setFormData(initialForm)}
            className="btn-danger rounded-pill"
            data-track="clicked_reset_customer"
          >
            Reset Form
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default Customer;
