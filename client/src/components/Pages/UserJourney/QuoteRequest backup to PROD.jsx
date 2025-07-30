import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
    Popover, PopoverBody
} from 'reactstrap';
import {
    Container,
    Button,
    Form,
    Row,
    Col,
} from 'react-bootstrap';
import Auth from "/src/utils/auth";
// import VisitorCounter from "/src/components/Pages/Management/VisitorCounter";
import {
    FaQuestionCircle
} from 'react-icons/fa';
import { generatePDF } from '/src/utils/generatePDF';

const QuoteRequest = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
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
        ]
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
        document.body.classList.add("request-quote", "sidebar-collapse");
        document.documentElement.classList.remove("nav-open");
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
        return document.body.classList.remove("request-quote", "sidebar-collapse");
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

    return (
        <>
            <Container className="quick-quote-container px-4" id="quote-section">
                <HelmetProvider>
                    <title>CleanAR Solutions</title>
                    <meta name="description" content="Get a quick service estimate from CleanAR Solutions. Fill out our form to receive a personalized quote for your cleaning needs." />
                </HelmetProvider>
                <VisitorCounter />
                <h2 className="text-center primary-color text-bold pt-2">Get a Free Quote</h2>
                {/* <p className="text-center text-sm italic text-gray-500 mb-1">
                    *Translation coming soon in French and Spanish
                </p> */}
                <p className="text-center text-secondary-color">
                    Fill out the form below to receive a personalized quote for your cleaning needs. Our team will review your request and get back to you as soon as possible.
                </p>
                <hr />
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
                    <hr />
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