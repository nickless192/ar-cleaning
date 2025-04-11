import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
    Input,
    FormGroup, Label,
    Popover, PopoverBody
} from 'reactstrap';
import {
    FloatingLabel,
    Container,
    Button,
    Form,
    Row,
    Col,
    Collapse
} from 'react-bootstrap';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
// import { ButtonGroup, ToggleButton } from 'react-bootstrap';
// import html2pdf from 'html2pdf.js';
import Auth from "../utils/auth";
import VisitorCounter from "components/Pages/VisitorCounter.js";
import {
    FaQuestionCircle
} from 'react-icons/fa';
import html2canvas from 'html2canvas';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const QuickQuote = () => {

    const location = useLocation();
    // const [promoCode, setPromoCode] = useState('');
    const navigate = useNavigate();
    const [service, setService] = useState({});
    const [setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        userId: '',
        description: '',
        companyName: '',
        email: '',
        phonenumber: '',
        promoCode: '',
        subtotalCost: 0,
        tax: 0,
        grandTotal: 0,
        services: [],
        products: [],
        // serviceLevel: '', // New field for service level
    });
    const [popoverOpen, setPopoverOpen] = useState({
        name: false,
        email: false,
        phonenumber: false,
        description: false,
        companyName: false,
        postalcode: false,
        services: false,
    });

    const [validPromoCode, setValidPromoCode] = useState(false);
    const [isLogged] = useState(Auth.loggedIn());
    const [openService, setOpenService] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [selectedService, setSelectedService] = useState("");
    const [options, setOptions] = useState([]);

    // Define services and their options
    const serviceOptions = {
        'Residential': ["House Cleaning", "Carpet Cleaning", "Move-In/Out Cleaning", "Residential Building Cleaning"],
        'Commercial': ["Office Cleaning", "Industrial Cleaning", "Retail Cleaning"],
        'Special Events': ["Event Cleaning", "Post-Construction Cleaning"],
    };

    const togglePopover = (field) => {
        setPopoverOpen((prevState) => {
            // Reset all fields to false
            const newState = Object.keys(prevState).reduce((acc, key) => {
                acc[key] = false;
                return acc;
            }, {});

            // Toggle the selected field
            return { ...newState, [field]: !prevState[field] };
        });
    };


    useEffect(() => {
        if (isInitialLoad) {
            prepopulateForm();
            setIsInitialLoad(false);
        }
        calculateTotals();
        handleBodyClass();
        return cleanupBodyClass;
    }, [isLogged, formData.services, location.search]);

    const prepopulateForm = useCallback(() => {
        if (isLogged) {
            const data = Auth.getProfile().data;
            setFormData(prev => ({
                ...prev,
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                phonenumber: data.telephone,
                postalcode: data.postalcode,
                companyName: data.companyName,
                userId: data._id
            }));
        }
    }, [isLogged]);

    const calculateTotals = useCallback(() => {
        const subtotalCost = formData.services.reduce((total, service) => {
            return total + Object.values(service.customOptions || {}).reduce((sum, option) => {
                return sum + (option.service ? option.serviceCost : 0);
            }, 0);
        }, 0);

        const tax = subtotalCost * 0.13;
        const grandTotal = subtotalCost + tax;

        setFormData(prev => ({
            ...prev,
            subtotalCost,
            tax,
            grandTotal
        }));
    }, [formData.services]);


    const handleBodyClass = () => {
        document.body.classList.add("request-quote", "sidebar-collapse");
        document.documentElement.classList.remove("nav-open");
    };

    const cleanupBodyClass = () => {
        document.body.classList.remove("request-quote", "sidebar-collapse");
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        // reset validation if promo code is changed
        if (name === 'promoCode') {
            setValidPromoCode(false);
        }
        setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
    };

    const handleToggle = (type) => {
        setOpenService((prev) => (prev === type ? null : type));
    };

    const handleAddService = (e) => {
        const serviceType = e.target.value;
        console.log('serviceType:', serviceType);
        setFormData(prevFormData => {
            const service = {
                type: serviceType,
                service: selectedService,
                customOptions: {}
            };
            return {
                ...prevFormData,
                services: [service]
            };
        });
        console.log('services:', formData.services);
    };

    // Handle service selection
    const handleServiceChange = useCallback((service) => {
        setSelectedService(service);
        setOptions(serviceOptions[service] || []);
        setFormData(prev => ({ ...prev, services: [] }));
    }, []);

    // const handleCustomOptionChange = (type, option, e, cost, label) => {
    //     let value;
    //     if (e.target.type === 'checkbox') {
    //         value = e.target.checked;
    //     } else {
    //         value = e.target.value;
    //     }
    //     // const value = e.target.checked || e.target.value;
    //     // console.log(e.target.value);
    //     // console.log(e.target.checked);
    //     // console.log("value: ", value);
    //     console.log('option:', option);
    //     setFormData(prevFormData => ({
    //         ...prevFormData,
    //         services: prevFormData.services.map(s =>
    //             s.type === type
    //                 ? {
    //                     ...s,
    //                     customOptions: {
    //                         ...s.customOptions,
    //                         [option]: value   // Group service and serviceCost
    //                     }
    //                 }
    //                 : s
    //         )
    //     }));
    // };

    const handleCustomOptionChange = useCallback((type, option, e, label) => {
        let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        const ariaLabel = e.target.getAttribute('aria-label');
        // console.log('value:', value);
        setFormData(prev => ({
            ...prev,
            services: prev.services.map(s =>
                s.type === type ? {
                    ...s,
                    customOptions: {
                        ...s.customOptions,
                        [option]: { service: value, label: ariaLabel }
                    }
                }
                    : s
            )
        }));
    }, []);

    const handlePromoCodeValidation = async (e) => {
        e.preventDefault();
        //const promoCode = e.target.value;
        const promoCode = formData.promoCode.toLowerCase();
        // if (promoCode === 'welcome10') {
        if (promoCode === 'winter10' || promoCode === 'follow15') {
            setValidPromoCode(true);
            // alert('Valid promo code! 15% discount will be applied to your quote');
            return true;
        }
        else {
            setValidPromoCode(false);
            alert('Invalid promo code. Please review your code and try again. If you do not have a promo code, please leave the field blank.');
            return false;
        }
    };

    const generatePDF = useCallback(async (formData) => {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);

        const { width, height } = page.getSize();
        const fontSize = 12;
        let yPosition = height - 50;

        // Function to add text to the PDF
        const addText = async (text, x, y, size = fontSize) => {
            page.drawText(text, {
                x: x,
                y: y,
                size: size,
                font: await pdfDoc.embedFont(StandardFonts.Helvetica),
                color: rgb(0, 0, 0),
            });
        };

        // Add title
        await addText('Quote Submission Confirmation', 50, yPosition, 24);
        yPosition -= 40;

        // Add basic information
        const basicInfo = [
            `Name: ${formData.name}`,
            `Email: ${formData.email}`,
            `Phone Number: ${formData.phonenumber}`,
            `Company: ${formData.companyName}`,
            `Postal Code: ${formData.postalcode}`,
            `Promo Code: ${formData.promoCode}`,
        ];

        for (const info of basicInfo) {
            await addText(info, 50, yPosition);
            yPosition -= 20;
        }

        yPosition -= 20;

        // Add services
        await addText('Services:', 50, yPosition, 18);
        yPosition -= 30;

        for (const [index, service] of formData.services.entries()) {
            await addText(`${index + 1}. ${service.type}`, 50, yPosition, 16);
            yPosition -= 20;

            // Render custom options
            if (service.customOptions) {
                for (const [key, value] of Object.entries(service.customOptions)) {
                    if (typeof value === 'object' && value !== null && value.service !== undefined) {
                        // If value is an object, render its properties using the label
                        await addText(`   - ${value.label || key}: ${value.service}`, 50, yPosition, 14);
                        yPosition -= 20;
                    }
                }
            }

            yPosition -= 20;
        }

        // Add totals
        // await addText('Totals:', 50, yPosition, 18);
        // yPosition -= 30;

        // const totals = [
        //   `Subtotal: $${formData.subtotalCost.toFixed(2)}`,
        //   `Tax: $${formData.tax.toFixed(2)}`,
        //   `Grand Total: $${formData.grandTotal.toFixed(2)}`,
        // ];

        // for (const total of totals) {
        //   await addText(total, 50, yPosition, 16);
        //   yPosition -= 20;
        // }

        // Convert the PDF to base64 and send it in an email
        const pdfBase64 = await pdfDoc.saveAsBase64();
        await sendEmailWithPDF(formData.email, 'Your Quote Confirmation', pdfBase64);
    }, []);

    const sendEmailWithPDF = useCallback(async (to, subject, pdfBase64) => {
        const mailOptions = {
            from: 'info@cleanARsolutions.ca',
            to: to,
            subject: subject,
            html: '<p>Please find your quote confirmation attached.</p>',
            attachments: [{
                filename: 'quote_confirmation.pdf',
                content: pdfBase64,
                encoding: 'base64'
            }]
        };

        try {
            const response = await fetch('/api/email/send-quick-quote-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mailOptions)
            });

            if (response.ok) {
                console.log('Email with PDF sent successfully!');
            } else {
                console.error('Error sending email with PDF');
            }
        } catch (error) {
            console.error('Error sending email with PDF:', error);
        }
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log('Form data:', formData);
        let promoCodeIsValid = false;

        if (formData.promoCode !== "") {
            promoCodeIsValid = await handlePromoCodeValidation(e);
            if (!promoCodeIsValid) {
                return;
            }
        }

        if (promoCodeIsValid || formData.promoCode === '') {
            if (!validateForm()) {
                return;
            }

            // Purge customOptions that don't have a service
            const sanitizedServices = formData.services.map(service => {
                if (service.customOptions) {
                    const sanitizedOptions = Object.keys(service.customOptions)
                        // .filter(option => service.customOptions.service[option])
                        .filter(option => service.customOptions[option].service)
                        .reduce((acc, option) => {
                            acc[option] = service.customOptions[option];
                            return acc;
                        }, {});
                    return { ...service, customOptions: sanitizedOptions };
                }
                return service;
            });

            // console.log('Sanitized services:', sanitizedServices);
            // Capture screenshot of the form
            const serviceSelectionForm = document.getElementById("service-selection");
            const canvas = await html2canvas(serviceSelectionForm);
            const imageBase64 = canvas.toDataURL("image/png").split(",")[1]; // PNG format
            // Extract form values
            const textSummary = getTextSummary(serviceSelectionForm);

            const updatedFormData = {
                ...formData,
                // serviceSelectionForm,
                services: sanitizedServices
            };

            // console.log('Updated form data:', updatedFormData);

            try {
                const response = await fetch('/api/quotes/quickquote', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify(updatedFormData)
                });

                if (response.ok) {
                    alert(`Quote submitted successfully! We'll be in touch shortly to discuss your needs. In the meantime, feel free to browse our services.`);
                    // disable for testing
                    resetForm();
                    navigate('/index');
                    // Generate and download the PDF
                    await generatePDF(updatedFormData);
                }
            } catch (error) {
                console.error('Error submitting quote:', error);
                alert('Error submitting quote, please ensure all fields are filled out correctly. If the problem persists, please contact us directly with a description of the issue.');
            }


            console.log(textSummary);

            const payload = { textSummary, imageBase64, formData: updatedFormData };

            // Send form data and image to the backend
            fetch("/api/email/quick-quote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
                .then(response => response.json())
                .then(data => console.log("Success:", data))
                .catch(error => console.error("Error:", error));

        }
    };

    const validateForm = () => {
        const requiredFields = ['name', 'email', 'phonenumber', 'postalcode'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (formData.services.length === 0 && formData.products.length === 0) {
            missingFields.push('Services or Products');
        }

        if (missingFields.length > 0) {
            alert(`Please fill out all required fields: ${missingFields.join(', ')}`);
            return false;
        }
        return true;
    };

    const resetForm = () => {
        setFormData({
            name: '',
            companyName: '',
            email: '',
            phonenumber: '',
            postalcode: '',
            promoCode: '',
            services: [],
            products: [],
        });
        setSelectedService("");
        setOptions([]);
        
    };

    const getTextSummary = (form) => {
        const formData = new FormData(form);
        console.log('formData:', formData);
        let textSummary = "";
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
            const placeholder = form.querySelector(`[name="${key}"]`)?.placeholder || key;
            textSummary += `<strong>${placeholder}:</strong> ${value}<br>`;
        }
        return textSummary;
    };


    const renderCustomOptions = (type) => {
        switch (type) {
            case 'House Cleaning':
            case 'Move-In/Out Cleaning': {
                return (
                    <>
                        <Row className="mb-3">
                            <Col md={12} xs={12}>
                                <Form.Group controlId={`frequency-${type}`}>
                                    <Form.Label className="text-bold">Frequency of Cleaning</Form.Label>
                                    <Form.Select
                                        aria-label="Frequency of Cleaning"
                                        className="transparent form-border"
                                        size='sm'
                                        onChange={(e) => handleCustomOptionChange(type, 'frequency', e)}
                                        value={formData.services.find(s => s.type === type)?.customOptions?.frequency?.service || ''}
                                    >
                                        <option value="">Select Frequency...</option>
                                        <option value="One Time">One Time</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Bi-Weekly">Bi-Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Other">Other</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12} xs={12}>
                                <Form.Group controlId={`unitSize-${type}`}>
                                    <Form.Label className="text-bold">Unit Size</Form.Label>
                                    <Form.Select
                                        aria-label="Unit Size"
                                        size='sm'
                                        className="transparent form-border"
                                        onChange={(e) => handleCustomOptionChange(type, 'squareFootage', e)}
                                        value={formData.services.find(s => s.type === type)?.customOptions?.squareFootage?.service || ''}
                                    >
                                        <option value="">Select Unit Size...</option>
                                        <option value="0-499 sqft">0-499 sqft</option>
                                        <option value="500-999 sqft">500-999 sqft</option>
                                        <option value="1000-1499 sqft">1000-1499 sqft</option>
                                        <option value="1500-1999 sqft">1500-1999 sqft</option>
                                        <option value="2000+ sqft">2000+ sqft</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={12} xs={12}>
                                <Form.Group controlId={`bedrooms-${type}`}>
                                    <Form.Label className="text-bold">Number of Bedrooms</Form.Label>
                                    <Form.Select
                                        aria-label="Number of Bedrooms"
                                        className="transparent form-border"
                                        size='sm'
                                        onChange={(e) => handleCustomOptionChange(type, 'bedrooms', e)}
                                        value={formData.services.find(s => s.type === type)?.customOptions?.bedrooms?.service || ''}
                                    >
                                        <option value="">Select Number of Bedrooms...</option>
                                        {Array.from({ length: 6 }, (_, i) => (
                                            <option key={i} value={i.toString()}>{i === 5 ? '5+' : i}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12} xs={12}>
                                <Form.Group controlId={`bathrooms-${type}`}>
                                    <Form.Label className="text-bold">Number of Bathrooms</Form.Label>
                                    <Form.Select
                                        aria-label="Number of Bathrooms"
                                        className="transparent form-border"
                                        size='sm'
                                        onChange={(e) => handleCustomOptionChange(type, 'bathrooms', e)}
                                        value={formData.services.find(s => s.type === type)?.customOptions?.bathrooms?.service || ''}
                                    >
                                        <option value="">Select Number of Bathrooms...</option>
                                        {Array.from({ length: 6 }, (_, i) => (
                                            <option key={i} value={i.toString()}>{i === 5 ? '5+' : i}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        {type === 'House Cleaning' && (
                            <Row className="mb-3">
                                <Col>
                                    <Form.Group controlId={`additionalOptions-${type}`}>
                                        <Form.Label className="text-bold">Additional Options</Form.Label>
                                        <br />
                                        <Label check className="me-3">
                                            <Input
                                                type="checkbox"
                                                onChange={(e) => handleCustomOptionChange(type, 'deepCleaning', e)}
                                                checked={formData.services.find(s => s.type === type)?.customOptions?.deepCleaning?.service || false}
                                            />
                                            <span className="form-check-sign"></span>
                                            Deep Cleaning
                                        </Label>
                                        <Label check className="me-3">
                                            <Input
                                                type="checkbox"
                                                onChange={(e) => handleCustomOptionChange(type, 'windowCleaning', e)}
                                                checked={formData.services.find(s => s.type === type)?.customOptions?.windowCleaning?.service || false}
                                            />
                                            <span className="form-check-sign"></span>
                                            Window Cleaning
                                        </Label>
                                        <Label check className="me-3">
                                            <Input
                                                type="checkbox"
                                                onChange={(e) => handleCustomOptionChange(type, 'laundryService', e)}
                                                checked={formData.services.find(s => s.type === type)?.customOptions?.laundryService?.service || false}
                                            />
                                            <span className="form-check-sign"></span>
                                            Laundry Service
                                        </Label>
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}
                    </>
                );
            }
            case 'Carpet Cleaning': {
                return (
                    <>
                        <Row className="mb-3">
                            <Col>
                                <Form.Group controlId={`carpetType-${type}`}>
                                    <Form.Label className="text-bold">Type of Carpet</Form.Label>
                                    <Form.Select
                                        aria-label="Type of Carpet"
                                        className="transparent form-border"
                                        size='sm'
                                        onChange={(e) => handleCustomOptionChange(type, 'carpetType', e)}
                                        value={formData.services.find(s => s.type === type)?.customOptions?.carpetType?.service || ''}
                                    >
                                        <option value="">Select Carpet Type...</option>
                                        <option value="Wool">Wool</option>
                                        <option value="Nylon">Nylon</option>
                                        <option value="Polyester">Polyester</option>
                                        <option value="Olefin">Olefin</option>
                                        <option value="Other">Other</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col>
                                <Form.Group controlId={`carpetArea-${type}`}>
                                    <Form.Label className="text-bold">Carpet Area (sqft)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        aria-label="Carpet Area"
                                        placeholder="Enter carpet area in square feet"
                                        className="text-cleanar-color text-bold form-border"
                                        onChange={(e) => handleCustomOptionChange(type, 'carpetArea', e)}
                                        value={formData.services.find(s => s.type === type)?.customOptions?.carpetArea?.service || ''}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col>
                                <Form.Group controlId={`stains-${type}`}>
                                    <Form.Label className="text-bold">Stains or Spots</Form.Label>
                                    <Form.Select
                                        aria-label="Stains or Spots"
                                        size='sm'
                                        className="transparent form-border"
                                        onChange={(e) => handleCustomOptionChange(type, 'stains', e)}
                                        value={formData.services.find(s => s.type === type)?.customOptions?.stains?.service || ''}
                                    >
                                        <option value="">Select Stain Level...</option>
                                        <option value="None">None</option>
                                        <option value="Light">Light</option>
                                        <option value="Moderate">Moderate</option>
                                        <option value="Heavy">Heavy</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </>
                );
            }
            default:
                return (
                    <Form.Group controlId={`description-${type}`} className="mb-3">
                        <Form.Label className="text-bold">Description*</Form.Label>
                        <Form.Control
                            as="textarea"
                            placeholder="Provide a description of the services you require. We will be in touch shortly to schedule a consultation."
                            value={formData.services.find(s => s.type === type)?.customOptions?.description?.service || ''}
                            onChange={(e) => handleCustomOptionChange(type, 'description', e)}
                            className="text-cleanar-color text-bold"
                        />
                    </Form.Group>
                );
        }

    };

    const getTooltipText = (name) => {
        switch (name) {
            case 'name':
                return 'Enter your full name.';
            case 'email':
                return 'Enter your email address.';
            case 'phonenumber':
                return 'Enter your phone number.';
            case 'companyName':
                return 'Enter your company name.';
            case 'postalcode':
                return 'Enter your postal code.';
            case 'promoCode':
                return 'Enter your promo code. Discount will be reflected on the quote if eligible. Promos cannot be combined.';
            default:
                return '';
        }
    };


    // const handleEmailCheckbox = (e) => {
    //     if (e.target.checked) {
    //         // disable the email field
    //         document.getElementById('floatingEmail').disabled = true;
    //         // set the email field to blank
    //         setFormData(prevFormData => ({ ...prevFormData, email: '' }));
    //     }
    //     else {
    //         document.getElementById('floatingEmail').disabled = false;
    //     }
    // }

    return (
        <>
            <Container className="quick-quote-container px-4">
                <Helmet>
                    <title>CleanAR Solutions - Quick Quote</title>
                    <meta name="description" content="Get a quick service estimate from CleanAR Solutions. Fill out our form to receive a personalized quote for your cleaning needs." />
                </Helmet>
                {/* <h2 className="primary-color text-bold">Obtain a Service Estimate</h2> */}
                <h2 className="text-center primary-color text-bold pt-2">Get a Free Quote</h2>
                <Form onSubmit={handleSubmit} id="quote-form" className="m-0 p-0">
                    <Form.Group className="mb-1">
                        <Row>
                            {[
                                { label: 'Name', name: 'name', placeholder: 'Full Name', required: true },
                                { label: 'Email', name: 'email', placeholder: 'Email', required: true },
                                { label: 'Phone No', name: 'phonenumber', placeholder: 'Phone Number', required: true },
                                { label: 'Company', name: 'companyName', placeholder: 'Company Name' },
                                { label: 'Postal Code', name: 'postalcode', placeholder: 'Postal Code', required: true },
                                { label: 'Promo Code', name: 'promoCode', placeholder: 'Promo Code' }
                            ].map(({ label, name, placeholder, required }) => (
                                <Col key={name} md={4} xs={12} className="mb-2 ">
                                    <Form.Label className="text-bold mb-1">
                                        {label}{required && '*'}
                                        <FaQuestionCircle
                                            id={`${name}Tooltip`}
                                            className="ms-1"
                                            onClick={() => togglePopover(name)}
                                        />
                                        <Popover
                                            placement="top"
                                            isOpen={popoverOpen[name]}
                                            target={`${name}Tooltip`}
                                            toggle={() => togglePopover(name)}
                                        >
                                            <PopoverBody>{getTooltipText(name)}</PopoverBody>
                                        </Popover>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        id={`floating${label.replace(' ', '')}`}
                                        placeholder={placeholder}
                                        className="text-cleanar-color text-bold form-input"
                                        name={name}
                                        value={formData[name]}
                                        onChange={handleChange}
                                        required={required}
                                    />
                                </Col>
                            ))}
                        </Row>
                    </Form.Group>
                    <section className="section-border">
                    <Form.Group className="mb-3">
                        <Form.Label className="text-bold mb-1">
                            Add Service Required*
                            <FaQuestionCircle
                                id="servicesTooltip"
                                className="ms-1"
                                onClick={() => togglePopover('services')}
                            />
                            <Popover
                                placement="top"
                                isOpen={popoverOpen.services}
                                target="servicesTooltip"
                                toggle={() => togglePopover('services')}
                            >
                                <PopoverBody>Please add service type and level to customize your order</PopoverBody>
                            </Popover>
                        </Form.Label>
                    </Form.Group>
                    <Form id="service-selection">
                        <Row>
                            <Col md={3} xs={12} className="mb-3 radio-group">
                                {/* <div className="radio-group">    */}
                                    {Object.keys(serviceOptions).map((service) => (
                                        <label key={service} className="radio-label d-block mb-2">
                                            <input
                                                type="radio"
                                                name="serviceType"
                                                value={service}
                                                checked={selectedService === service}
                                                onChange={() => handleServiceChange(service)}
                                                className="me-2"
                                            />
                                            {service}
                                        </label>
                                    ))}
                                {/* </div> */}
                            </Col>
                            <Col md={3} xs={12} className="mb-3">
                                {selectedService && (
                                    // <div className="options-selection">
                                        <div className="radio-group options-selection">
                                            {options.map((option) => (
                                                <label key={option} className="radio-label d-block mb-2">
                                                    <input
                                                        type="radio"
                                                        name="serviceOption"
                                                        value={option}
                                                        onChange={handleAddService}
                                                        className="me-2"
                                                    />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    // {/* </div> */}
                                )}
                            </Col>
                            <Col md={6} xs={12}>
                                {formData.services.map((service, index) => (
                                    <div key={index} className="mb-3">
                                        {/* <Button
                                            variant="link"
                                            className="text-cleanar-color text-bold p-0"
                                            onClick={() => handleToggle(service.type)}
                                        >
                                            {service.type}
                                            {openService === service.type ? <FaChevronUp className="ms-2" /> : <FaChevronDown className="ms-2" />}
                                        </Button> */}
                                        {/* <Collapse in={openService === service.type}> */}
                                            {/* <div> */}
                                                {renderCustomOptions(service.type)}
                                            {/* </div> */}
                                        {/* </Collapse> */}
                                    </div>
                                ))}
                            </Col>
                        </Row>
                    </Form>
                    </section>
                    <Row>
                        <Col>
                            <p className='primary-color text-bold pt-2'>
                                A confirmation email will be sent to you upon submission. Our team will review your request and get back to you as soon as possible. Thank you for choosing CleanAR Solutions!
                            </p>
                        </Col>
                    </Row>
                    <Row className='pb-3'>
                        <Col md className="">
                            <Button type="submit" className='secondary-bg-color'>Submit Quote</Button>
                        </Col>
                        <Col md className="">
                            <Button onClick={() => setFormData({
                                name: '',
                                companyName: '',
                                email: '',
                                postalcode: '',
                                phonenumber: '',
                                promoCode: '',
                                services: [],
                                products: []
                            })} className='btn-danger'>Reset Form</Button>
                        </Col>
                    </Row>
                </Form>
            </Container>
        </>
    );
};

export default QuickQuote;
