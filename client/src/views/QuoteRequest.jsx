import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {
    Input,
    Label,
    Popover, PopoverBody
} from 'reactstrap';
import {
    Container,
    Button,
    Form,
    Row,
    Col,
} from 'react-bootstrap';
// import Logo from '../../assets/img/IC CLEAN AR-15-cropped.png"';
// import { ButtonGroup, ToggleButton } from 'react-bootstrap';
// import html2pdf from 'html2pdf.js';
import Auth from "../utils/auth";
import VisitorCounter from "../components/Pages/VisitorCounter";
import {
    FaQuestionCircle
} from 'react-icons/fa';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Logo from "../../src/assets/img/IC CLEAN AR-15-cropped.png"

const QuoteRequest = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        companyName: '',
        email: '',
        phonenumber: '',
        postalcode: '',
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

    const [, setValidPromoCode] = useState(false);
    const [isLogged] = useState(Auth.loggedIn());
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [scrolledToQuote, setScrolledToQuote] = useState(false);
    const [selectedService, setSelectedService] = useState("");
    const [options, setOptions] = useState([]);

    // Define services and their options
    const serviceOptions = {
        'Residential Cleaning': [
            "House Cleaning",
            "Move-In/Out Cleaning",
            "Condominium Cleaning",
            "Residential Building Cleaning"
        ],
        'Commercial Cleaning': [
            "Office Cleaning",
            "Industrial Cleaning",
            "Retail Cleaning"
        ],
        'Carpet And Upholstery': [
            "Carpet Cleaning",
            "Upholstery Cleaning"
        ],
        'Window Cleaning': [
            "Interior Window Cleaning",
            "Window Track & Sill Cleaning",
            "Glass Door Cleaning"
        ],
        'Power/Pressure Washing': [
            "Driveway Cleaning",
            "Patio & Deck Cleaning",
            "Sidewalk Cleaning",
            "Exterior Siding Cleaning",
            "Fence Cleaning",
            "Garage Floor Cleaning"
        ],
        // 'Specialty Services': [
        //     "Event Cleaning",
        //     "Post-Construction Cleaning"
        // ]
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
        const searchParams = new URLSearchParams(location.search);
        const scrollToQuote = searchParams.get('scrollToQuote');
        if (isInitialLoad) {
            const promoCode = searchParams.get('promoCode');
            // console.log('promoCode:', promoCode);
            const serviceClicked = searchParams.get('service');
            if (promoCode) {
                setFormData(prevFormData => ({
                    ...prevFormData,
                    promoCode: promoCode
                }));
            }
            if (serviceClicked) {
                handleServiceChange(serviceClicked);
            }
            prepopulateForm();
            setIsInitialLoad(false);
        }
        // console.log('serviceClicked:', serviceClicked);

        calculateTotals();
        handleBodyClass();
        // if (location.state?.scrollToQuote) {
        if (scrollToQuote && !scrolledToQuote) {
            document.getElementById("quote-section")?.scrollIntoView({ behavior: "smooth" });
            const promoCode = searchParams.get('promoCode');
            if (promoCode) {
                setFormData(prevFormData => ({
                    ...prevFormData,
                    promoCode: promoCode
                }));
            }
            setScrolledToQuote(true);
        }
        return cleanupBodyClass;
    }, [isLogged, formData.services, location.search, location.state]);

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


    const handleAddService = (e) => {
        const serviceType = e.target.value;
        // console.log('serviceType:', serviceType);
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
        // console.log('services:', formData.services);
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
        if (promoCode === 'toronto15' || promoCode === 'follow15'
            || promoCode === 'now15' || promoCode === 'start15' || promoCode === 'fresh15' || promoCode === 'secret15'
            || promoCode === 'welcome15'
        ) {
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

        // Add logo to the PDF
        const logoImageBytes = await fetch(Logo).then(res => res.arrayBuffer());
        const logoImage = await pdfDoc.embedPng(logoImageBytes);
        const logoDims = logoImage.scale(0.1); // Scale the logo to fit
        page.drawImage(logoImage, {
            x: 50,
            y: height - logoDims.height - 20,
            width: logoDims.width,
            height: logoDims.height,
        });
        yPosition -= 65;
        await addText('CleanAR Solutions', 50, yPosition, 18);
        yPosition -= 20;
        await addText('Trusted Clean, Trusted Service', 50, yPosition, 12);
        yPosition -= 20;

        // Add a line
        page.drawLine({
            start: { x: 50, y: yPosition },
            end: { x: width - 50, y: yPosition },
            thickness: 2,
            color: rgb(0, 0, 0),
        });
        yPosition -= 40;



        // Add title
        await addText('Service Request Confirmation', 50, yPosition, 24);
        yPosition -= 40;

        // Add basic information
        const basicInfo = [
            `Name: ${formData.name}`,
            `Email: ${formData.email}`,
            `Phone Number: ${formData.phonenumber}`,
            `Company: ${formData.companyName}`,
            `Postal Code: ${formData.postalcode.toUpperCase()}`,
            `Promo Code: ${formData.promoCode}`,
        ];

        for (const info of basicInfo) {
            await addText(info, 50, yPosition, 14);
            yPosition -= 20;
        }

        yPosition -= 20;

        // Add services
        await addText('Required Service:', 50, yPosition, 18);
        yPosition -= 40;

        // Draw a box around the services section
        const boxMargin = 10;
        const boxStartY = yPosition + 20; // Adjust to start above the first service
        let boxEndY = yPosition;

        // Define table column positions
        const columnPositions = [60, 90, 200, 320]; // Adjust as needed for spacing
        const columnHeaders = ["#", "Service", "Type", "Custom Options"];

        // Add table headers
        for (let i = 0; i < columnHeaders.length; i++) {
            await addText(columnHeaders[i], columnPositions[i], yPosition, 14);
        }
        yPosition -= 20;

        // Add a line under the headers
        page.drawLine({
            start: { x: columnPositions[0], y: yPosition },
            end: { x: columnPositions[columnPositions.length - 1] + 200, y: yPosition },
            thickness: 1,
            color: rgb(0, 0, 0),
        });
        yPosition -= 20;

        // Add table rows
        for (const [index, service] of formData.services.entries()) {
            // Column 0: Index
            await addText(`${index + 1}`, columnPositions[0], yPosition, 12);

            // Column 1: Service
            await addText(`${service.service || 'N/A'}`, columnPositions[1], yPosition, 12);

            // Column 2: Type
            await addText(`${service.type}`, columnPositions[2], yPosition, 12);

            // Column 3: Custom Options
            let customOptionsText = "";
            let customOptionsCount = 0; // Count the number of custom options

            if (service.customOptions) {
                for (const [key, value] of Object.entries(service.customOptions)) {
                    if (typeof value === 'object' && value !== null && value.service !== undefined) {
                        const optionText = `${value.label || key}: ${typeof value.service === 'boolean' ? (value.service ? 'Yes' : 'No') : value.service}`;
                        customOptionsText += `${optionText}\n`;
                        customOptionsCount++; // Increment the count for each custom option
                    }
                }
            }

            await addText(customOptionsText.trim(), columnPositions[3], yPosition, 12);

            // Adjust yPosition based on the number of custom options
            yPosition -= 20 * (customOptionsCount || 1); // Default to 1 if no custom options
        }

        // Update the box end position
        boxEndY = yPosition - 20;

        // Draw the box
        page.drawRectangle({
            x: 50 - boxMargin,
            y: boxEndY - boxMargin,
            width: 500 + boxMargin * 2,
            height: boxStartY - boxEndY + boxMargin * 2,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
        });


        yPosition -= 20;

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

        // // Debugging: Save the PDF to a Blob and open it in a new tab
        // const debugPdfBytes = await pdfDoc.save();
        // const debugBlob = new Blob([debugPdfBytes], { type: 'application/pdf' });
        // const debugUrl = URL.createObjectURL(debugBlob);
        // window.open(debugUrl, '_blank');

        await sendEmailWithPDF(formData, 'CleanAR Solutions: Your Quote Confirmation', pdfBase64);
    }, []);

    const sendEmailWithPDF = useCallback(async (formData, subject, pdfBase64) => {
        const hmtlMessage = `
        <h2>Thank you for contacting us!</h2>
        <p>Hi ${formData.name},</p>
        <p>We have received your quote request and are currently processing it. Please find your quote confirmation attached.</p>
        <p>We will be in touch shortly to discuss your needs. In the meantime, feel free to browse our services.</p>
        <p>Best regards,</p>
        <p>CleanAR Solutions</p>
        <p>
        <a href="https://www.cleanarsolutions.ca/index" target="_blank">www.cleanarsolutions.ca/index</a>
        </p>
        <p>
        <a href="tel:+437-440-5514">+1 (437) 440-5514</a>
        </p>`;

        const mailOptions = {
            from: 'info@cleanARsolutions.ca',
            to: formData.email,
            cc: ['info@cleanARsolutions.ca'],
            subject: subject,
            html: hmtlMessage,
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
            // const serviceSelectionForm = document.getElementById("service-selection");
            const serviceSelectionForm = document.getElementById("quote-form");
            // const canvas = await html2canvas(serviceSelectionForm);
            // const imageBase64 = canvas.toDataURL("image/png").split(",")[1]; // PNG format
            // Extract form values
            const textSummary = getTextSummary(serviceSelectionForm);

            const updatedFormData = {
                ...formData,
                // serviceSelectionForm,
                services: sanitizedServices
            };

            // console.log(textSummary);

            // const payload = { textSummary, imageBase64, formData: updatedFormData };
            const payload = { textSummary, formData: updatedFormData };

            // Send form data and image to the backend
            fetch("/api/email/quick-quote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
                .then(response => response.json())
                .then(data => console.log("Success:", data))
                .catch(error => console.error("Error:", error));

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
                    await generatePDF(updatedFormData);
                    // disable for testing
                    resetForm();
                    // Generate and download the PDF
                    // navigate('/index');
                    navigate('/products-and-services');
                }
            } catch (error) {
                console.error('Error submitting quote:', error);
                alert('Error submitting quote, please ensure all fields are filled out correctly. If the problem persists, please contact us directly with a description of the issue.');
            }




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
        let textSummary = "";
        for (let [key, value] of formData.entries()) {
            const element = form.querySelector(`[name="${key}"]`);
            const placeholder = element?.getAttribute('aria-label') || key;

            if (element?.type === 'checkbox') {
                textSummary += `<strong>${placeholder}:</strong> ${element.checked ? 'Yes' : 'No'}<br>`;
            } else {
                textSummary += `<strong>${placeholder}:</strong> ${value}<br>`;
            }
        }
        return textSummary;
    };


    const upholsteryList = [
        "Sofa Cleaning",
        "Chair Cleaning",
        "Couch Cleaning",
        "Sectional Cleaning",
        "Ottoman Cleaning",
        "Loveseat Cleaning",
        "Dining Chair Cleaning",
        "Recliner Cleaning"
    ]


    const renderCustomOptions = (type) => {
        switch (type) {
            case 'House Cleaning':
            case 'Move-In/Out Cleaning': {
                return (
                    <>
                        <Row className="g-1">
                            {/* Frequency */}
                            <Col xs={12} md={6}>
                                <Form.Group controlId={`frequency-${type}`}>
                                    <Form.Label className="fw-semibold">🕒 Frequency</Form.Label>
                                    <Form.Select
                                        aria-label="Cleaning Frequency"
                                        name="frequency"
                                        size="sm"
                                        className="text-cleanar-color text-bold form-input"
                                        value={formData.services.find(s => s.type === type)?.customOptions?.frequency?.service || ''}
                                        onChange={(e) => handleCustomOptionChange(type, 'frequency', e)}
                                    >
                                        <option value="">Select...</option>
                                        <option value="One Time">One Time</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Bi-Weekly">Bi-Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Other">Other</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            {/* Unit Size */}
                            <Col xs={12} md={6}>
                                <Form.Group controlId={`unitSize-${type}`}>
                                    <Form.Label className="fw-semibold">📏 Unit Size</Form.Label>
                                    <Form.Select
                                        aria-label="Unit Size"
                                        name="unitSize"
                                        size="sm"
                                        className="text-cleanar-color text-bold form-input"
                                        value={formData.services.find(s => s.type === type)?.customOptions?.squareFootage?.service || ''}
                                        onChange={(e) => handleCustomOptionChange(type, 'squareFootage', e)}
                                    >
                                        <option value="">Select...</option>
                                        <option value="0-499 sqft">0–499 sqft</option>
                                        <option value="500-999 sqft">500–999 sqft</option>
                                        <option value="1000-1499 sqft">1000–1499 sqft</option>
                                        <option value="1500-1999 sqft">1500–1999 sqft</option>
                                        <option value="2000+ sqft">2000+ sqft</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            {/* Bedrooms */}
                            <Col xs={12} md={6}>
                                <Form.Group controlId={`bedrooms-${type}`}>
                                    <Form.Label className="fw-semibold">🛏️ Bedrooms</Form.Label>
                                    <Form.Select
                                        aria-label="Number of Bedrooms"
                                        name="bedrooms"
                                        size="sm"
                                        className="text-cleanar-color text-bold form-input"
                                        value={formData.services.find(s => s.type === type)?.customOptions?.bedrooms?.service || ''}
                                        onChange={(e) => handleCustomOptionChange(type, 'bedrooms', e)}
                                    >
                                        <option value="">Select...</option>
                                        {Array.from({ length: 6 }, (_, i) => (
                                            <option key={i} value={i.toString()}>{i === 5 ? '5+' : i}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            {/* Bathrooms */}
                            <Col xs={12} md={6}>
                                <Form.Group controlId={`bathrooms-${type}`}>
                                    <Form.Label className="fw-semibold">🚿 Bathrooms</Form.Label>
                                    <Form.Select
                                        aria-label="Number of Bathrooms"
                                        name="bathrooms"
                                        size="sm"
                                        className="text-cleanar-color text-bold form-input"
                                        value={formData.services.find(s => s.type === type)?.customOptions?.bathrooms?.service || ''}
                                        onChange={(e) => handleCustomOptionChange(type, 'bathrooms', e)}
                                    >
                                        <option value="">Select...</option>
                                        {Array.from({ length: 6 }, (_, i) => (
                                            <option key={i} value={i.toString()}>{i === 5 ? '5+' : i}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            {/* Start Date */}
                            <Col xs={12} md={6}>
                                <Form.Group controlId={`startDate-${type}`}>
                                    <Form.Label className="fw-semibold">📅 Start Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="startDate"
                                        aria-label="Desired Start Date"
                                        size="sm"
                                        className="text-cleanar-color text-bold form-input"
                                        value={formData.services.find(s => s.type === type)?.customOptions?.startDate?.service || ''}
                                        onChange={(e) => handleCustomOptionChange(type, 'startDate', e)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </Form.Group>
                            </Col>

                            {/* Additional Options */}
                            {type === 'House Cleaning' && (
                                <Col xs={12} md={12}>
                                    <Form.Group controlId={`additionalOptions-${type}`}>
                                        <Form.Label className="fw-semibold">🧼 Additional Options</Form.Label>
                                        <Row className="">
                                            {[
                                                { label: 'Deep Cleaning', key: 'deepCleaning' },
                                                { label: 'Window Cleaning', key: 'windowCleaning' },
                                                { label: 'Laundry Service', key: 'laundryService' }
                                            ].map(({ label, key }) => (
                                                <Col xs={12} sm={6} lg={4} key={key}>
                                                    <Form.Check
                                                        type="checkbox"
                                                        id={`${key}-${type}`}
                                                        label={label}
                                                        name={key}
                                                        aria-label={label}
                                                        className=""
                                                        checked={
                                                            formData.services.find(s => s.type === type)?.customOptions?.[key]?.service || false
                                                        }
                                                        onChange={(e) => handleCustomOptionChange(type, key, e)}
                                                    />
                                                </Col>
                                            ))}
                                        </Row>
                                    </Form.Group>
                                </Col>

                            )}
                        </Row>

                    </>

                );
            }
            case 'Carpet Cleaning': {
                return (
                    <>
                        <Row className="mb-3">
                            <Col xs={12}>
                                <Form.Group controlId={`carpetType-${type}`}>
                                    <Form.Label className="text-bold">Carpet Material</Form.Label>
                                    <Form.Select
                                        aria-label="Select carpet material"
                                        className="transparent form-border"
                                        name="carpetType"
                                        size="sm"
                                        value={formData.services.find(s => s.type === type)?.customOptions?.carpetType?.service || ''}
                                        onChange={(e) => handleCustomOptionChange(type, 'carpetType', e)}
                                    >
                                        <option value="">Choose a material...</option>
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
                            <Col xs={12}>
                                <Form.Group controlId={`carpetArea-${type}`}>
                                    <Form.Label className="text-bold">Approximate Carpet Area (sqft)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min={0}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        size="sm"
                                        aria-label="Enter carpet area in square feet"
                                        name="carpetArea"
                                        placeholder="e.g. 500"
                                        className="text-cleanar-color text-bold form-border"
                                        value={formData.services.find(s => s.type === type)?.customOptions?.carpetArea?.service || ''}
                                        onChange={(e) => handleCustomOptionChange(type, 'carpetArea', e)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col xs={12} md={6}>
                                <Form.Group controlId={`stains-${type}`}>
                                    <Form.Label className="text-bold">Stain Level</Form.Label>
                                    <Form.Select
                                        aria-label="Select stain severity"
                                        className="transparent form-border"
                                        name="stains"
                                        size="sm"
                                        value={formData.services.find(s => s.type === type)?.customOptions?.stains?.service || ''}
                                        onChange={(e) => handleCustomOptionChange(type, 'stains', e)}
                                    >
                                        <option value="">How severe are the stains?</option>
                                        <option value="None">None</option>
                                        <option value="Light">Light</option>
                                        <option value="Moderate">Moderate</option>
                                        <option value="Heavy">Heavy</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col xs={12} md={6}>
                                <Form.Group controlId={`startDate-${type}`}>
                                    <Form.Label className="text-bold">Preferred Cleaning Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        aria-label="Select preferred service date"
                                        name="startDate"
                                        size="sm"
                                        placeholder="Select a date"
                                        min={new Date().toISOString().split('T')[0]}
                                        className="text-cleanar-color text-bold form-border"
                                        value={formData.services.find(s => s.type === type)?.customOptions?.startDate?.service || ''}
                                        onChange={(e) => handleCustomOptionChange(type, 'startDate', e)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </>

                );
            }
            case 'Power Washing': {
                return (
                    <>
                        <Row className="mb-3">
                            <Col>
                                <Form.Group controlId={`surfaceType-${type}`}>
                                    <Form.Label className="text-bold">Type of Surface</Form.Label>
                                    <Form.Select
                                        aria-label="Type of Surface"
                                        className="transparent form-border"
                                        name="surfaceType"
                                        placeholder="Type of Surface"
                                        size='sm'
                                        onChange={(e) => handleCustomOptionChange(type, 'surfaceType', e)}
                                        value={formData.services.find(s => s.type === type)?.customOptions?.surfaceType?.service || ''}
                                    >
                                        <option value="">Select Surface Type...</option>
                                        <option value="Concrete">Concrete</option>
                                        <option value="Wood">Wood</option>
                                        <option value="Vinyl">Vinyl</option>
                                        <option value="Brick">Brick</option>
                                        <option value="Other">Other</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId={`area-${type}`}>
                                    <Form.Label className="text-bold">Area (sqft)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        aria-label="Area"
                                        name="area"
                                        placeholder="Enter area in square feet"
                                        className="text-cleanar-color text-bold form-border"
                                        onChange={(e) => handleCustomOptionChange(type, 'area', e)}
                                        value={formData.services.find(s => s.type === type)?.customOptions?.area?.service || ''}
                                    />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId={`stains-${type}`}>
                                    <Form.Label className="text-bold">Stains or Spots</Form.Label>
                                    <Form.Select
                                        aria-label="Stains or Spots"
                                        size='sm'
                                        name="stains"
                                        placeholder="Stains or Spots"
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
                            <Col md={12} xs={12}>
                                <Form.Group controlId={`startDate-${type}`}>
                                    <Form.Label className="text-bold">Desired Service Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        aria-label="Desired Service Date"
                                        name='startDate'
                                        placeholder="Desired Service Date"
                                        className="text-cleanar-color text-bold form-border"
                                        min={new Date().toISOString().split('T')[0]} // Prevent dates before today
                                        onChange={(e) => handleCustomOptionChange(type, 'startDate', e)}
                                        value={formData.services.find(s => s.type === type)?.customOptions?.startDate?.service || ''}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </>
                );
            }
            case 'Upholstery Cleaning': {
                // include different types of upholstery to select from, and next to it, the area in sqft, the number of pieces, and the type of fabric
                return (
                    <>
                        <Row className="mb-3">
                            {upholsteryList.map((item, index) => (
                                <Col key={index} md={6} xs={12} className="mb-3">
                                    <Form.Group controlId={`upholstery-${type}-${index}`}>
                                        <Form.Label className="text-bold">{item}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            aria-label="Upholstery Area"
                                            name={`upholsteryArea-${index}`}
                                            placeholder="Enter area in square feet"
                                            className="text-cleanar-color text-bold form-border"
                                            onChange={(e) => handleCustomOptionChange(type, `upholsteryArea-${index}`, e)}
                                            value={formData.services.find(s => s.type === type)?.customOptions?.[`upholsteryArea-${index}`]?.service || ''}
                                        />
                                        <Form.Control
                                            type="number"
                                            aria-label="Upholstery Pieces"
                                            name={`upholsteryPieces-${index}`}
                                            placeholder="Enter number of pieces"
                                            className="text-cleanar-color text-bold form-border mt-2"
                                            onChange={(e) => handleCustomOptionChange(type, `upholsteryPieces-${index}`, e)}
                                            value={formData.services.find(s => s.type === type)?.customOptions?.[`upholsteryPieces-${index}`]?.service || ''}
                                        />
                                        <Form.Select
                                            aria-label="Upholstery Fabric Type"
                                            name={`upholsteryFabric-${index}`}
                                            placeholder="Select fabric type"
                                            className="transparent form-border mt-2"
                                            onChange={(e) => handleCustomOptionChange(type, `upholsteryFabric-${index}`, e)}
                                            value={formData.services.find(s => s.type === type)?.customOptions?.[`upholsteryFabric-${index}`]?.service || ''}
                                        >
                                            <option value="">Select Fabric Type...</option>
                                            <option value="Leather">Leather</option>
                                            <option value="Cotton">Cotton</option>
                                            <option value="Polyester">Polyester</option>
                                            <option value="Nylon">Nylon</option>
                                            <option value="Other">Other</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            ))}
                            <Col md={12} xs={12}>
                                <Form.Group controlId={`startDate-${type}`}>
                                    <Form.Label className="text-bold">Desired Service Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        aria-label="Desired Service Date"
                                        name='startDate'
                                        placeholder="Desired Service Date"
                                        className="text-cleanar-color text-bold form-border"
                                        min={new Date().toISOString().split('T')[0]} // Prevent dates before today
                                        onChange={(e) => handleCustomOptionChange(type, 'startDate', e)}
                                        value={formData.services.find(s => s.type === type)?.customOptions?.startDate?.service || ''}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </>
                );
            }
            default:
                return (
                    <>
                        <Row className="mb-3">
                            <Col>
                                <Form.Group controlId={`description-${type}`} className="mb-3">
                                    <Form.Label className="text-bold">Description*</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        aria-label="Description"
                                        name="description"
                                        placeholder="Provide a description of the services you require. We will be in touch shortly to schedule a consultation."
                                        value={formData.services.find(s => s.type === type)?.customOptions?.description?.service || ''}
                                        onChange={(e) => handleCustomOptionChange(type, 'description', e)}
                                        className="text-cleanar-color text-bold form-input"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12} xs={12}>
                                <Form.Group controlId={`startDate-${type}`}>
                                    <Form.Label className="text-bold">Desired Service Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        aria-label="Desired Service Date"
                                        name='startDate'
                                        size='sm'
                                        placeholder="Desired Service Date"
                                        className="text-cleanar-color text-bold form-border"
                                        min={new Date().toISOString().split('T')[0]} // Prevent dates before today
                                        onChange={(e) => handleCustomOptionChange(type, 'startDate', e)}
                                        value={formData.services.find(s => s.type === type)?.customOptions?.startDate?.service || ''}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </>
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
            <Container className="quick-quote-container px-4" id="quote-section">
                <HelmetProvider>
                    <title>CleanAR Solutions</title>
                    <meta name="description" content="Get a quick service estimate from CleanAR Solutions. Fill out our form to receive a personalized quote for your cleaning needs." />
                </HelmetProvider>
                <VisitorCounter />
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
                                <Col key={name} md={3} xs={6} className="mb-2 ">
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
                                        aria-label={label}
                                        className="text-cleanar-color form-input rounded-pill"
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
                        {/* <Form id="service-selection"> */}
                        <Row>
                            <Col md={3} xs={12} className="mb-3 radio-group">
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-bold mb-1">
                                        Service Required*
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
                                {Object.keys(serviceOptions).map((service) => (
                                    <label key={service} className="radio-label d-block mb-2">
                                        <input
                                            type="radio"
                                            name="serviceType"
                                            aria-label="Service Type"
                                            placeholder='Service Type'
                                            value={service}
                                            checked={selectedService === service}
                                            onChange={() => handleServiceChange(service)}
                                            className="me-2"
                                        />
                                        {service}
                                    </label>
                                ))}
                            </Col>
                            <Col md={3} xs={12} className="mb-3">
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-bold mb-1">
                                        Service Type*
                                        <FaQuestionCircle
                                            id="serviceLevelTooltip"
                                            className="ms-1"
                                            onClick={() => togglePopover('serviceLevel')}
                                        />
                                        <Popover
                                            placement="top"
                                            isOpen={popoverOpen.serviceLevel}
                                            target="serviceLevelTooltip"
                                            toggle={() => togglePopover('serviceLevel')}
                                        >
                                            <PopoverBody>Please select a service level to customize your order</PopoverBody>
                                        </Popover>
                                    </Form.Label>
                                </Form.Group>
                                {selectedService ? (
                                    <div className="radio-group options-selection">
                                        {options.map((option) => (
                                            <label key={option} className="radio-label d-block mb-2">
                                                <input
                                                    type="radio"
                                                    name="serviceOption"
                                                    aria-label="Service Option"
                                                    placeholder='Service Option'
                                                    value={option}
                                                    onChange={handleAddService}
                                                    className="me-2"
                                                />
                                                {option}
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-danger text-bold">Please Add Service First</p>
                                )}
                            </Col>
                            <Col md={6} xs={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="text-bold mb-1">
                                        Your Custom Options
                                        <FaQuestionCircle
                                            id="additionalServicesTooltip"
                                            className="ms-1"
                                            onClick={() => togglePopover('additionalServices')}
                                        />
                                        <Popover
                                            placement="top"
                                            isOpen={popoverOpen.additionalServices}
                                            target="additionalServicesTooltip"
                                            toggle={() => togglePopover('additionalServices')}
                                        >
                                            <PopoverBody>Please select any additional services you would like to add to your quote.</PopoverBody>
                                        </Popover>
                                    </Form.Label>
                                </Form.Group>
                                {formData.services.map((service, index) => (
                                    <div key={index} className="mb-3">
                                        {renderCustomOptions(service.type)}
                                    </div>
                                ))}
                            </Col>
                        </Row>
                        {/* </Form> */}
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
                            <Button type="submit" className='secondary-bg-color rounded-pill' data-track="clicked_submit_quote">Submit Quote</Button>
                        </Col>
                        <Col md className="">
                            <Button data-track="clicked_reset_quote" onClick={() => setFormData({
                                name: '',
                                companyName: '',
                                email: '',
                                postalcode: '',
                                phonenumber: '',
                                promoCode: '',
                                services: [],
                                products: []
                            })} className='btn-danger rounded-pill'>Reset Form</Button>
                        </Col>
                    </Row>
                </Form>
            </Container>
        </>
    );
};

export default QuoteRequest;
