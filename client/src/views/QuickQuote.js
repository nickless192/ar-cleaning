import React, { useState, useEffect } from 'react';
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
        howDidYouHearAboutUs: false,
        address: false,
        city: false,
        province: false,
        postalcode: false,
        services: false,
        products: false
    });

    const [validPromoCode, setValidPromoCode] = useState(false);
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

    const [isLogged] = useState(Auth.loggedIn());
    const [openService, setOpenService] = useState(null);

    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        const prepopulateForm = async () => {
            if (isLogged) {
                const data = Auth.getProfile().data;
                setFormData(prevFormData => ({
                    ...prevFormData,
                    name: data.firstName + " " + data.lastName,
                    email: data.email,
                    phonenumber: data.telephone,
                    // howDidYouHearAboutUs: data.howDidYouHearAboutUs,
                    // address: data.address,
                    // city: data.city,
                    // province: data.province,
                    postalcode: data.postalcode,
                    companyName: data.companyName,
                    userId: data._id
                }));
            }
        };
        // Calculate subtotal, tax, and grand total whenever services change
        const subtotalCost = formData.services.reduce((total, service) => {
            const serviceCost = Object.values(service.customOptions || {}).reduce((sum, option) => {
                if (option.service) {
                    return sum + option.serviceCost;
                }
                return sum;
            }, 0);
            return total + serviceCost;
        }, 0);

        // Extract promoCode from the query string

        const tax = subtotalCost * 0.13;
        const grandTotal = subtotalCost + tax;

        if (isInitialLoad) {
            // initializeServices();
            prepopulateForm();
            setIsInitialLoad(false);
        }



        // Update formData with calculated values
        setFormData(prevFormData => ({
            ...prevFormData,
            subtotalCost,
            tax,
            grandTotal
        }));



        // handlePromoCodeValidation();
        document.body.classList.add("request-quote", "sidebar-collapse");
        document.documentElement.classList.remove("nav-open");
        // window.scrollTo(0, 0);

        return () => {
            document.body.classList.remove("request-quote", "sidebar-collapse");
        };
    }, [isLogged, formData.services, location.search]);

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
        // setSelectedService(selectedService.serviceType = serviceType);

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

        // setFormData(prevFormData => {
        //     const service = {
        //         type: serviceType,
        //         serviceLevel: '',
        //         customOptions: {}
        //     };
        //     return {
        //         ...prevFormData,
        //         services: [service]

        //     };
        // });
        console.log('services:', formData.services);
    };
    const [selectedService, setSelectedService] = useState("");
    const [options, setOptions] = useState([]);

    // Define services and their options
    const serviceOptions = {
        'Residential': ["House Cleaning", "Carpet Cleaning", "Move-In/Out Cleaning", "Residential Building Cleaning"],
        'Commercial': ["Office Cleaning", "Industrial Cleaning", "Retail Cleaning"],
        'Special Events': ["Event Cleaning", "Post-Construction Cleaning"],
    };

    // Handle service selection
    const handleServiceChange = (service) => {
        setSelectedService(service);
        setOptions(serviceOptions[service] || []);
        handleRemoveService();
    };

    const handleRemoveService = () => {
        setFormData(prevFormData => ({
            ...prevFormData,
            services: []
        }));
    };

    const handleCustomOptionChange = (type, option, e, cost, label) => {
        let value;
        if (e.target.type === 'checkbox') {
            value = e.target.checked;
        } else {
            value = e.target.value;
        }
        // const value = e.target.checked || e.target.value;
        // console.log(e.target.value);
        // console.log(e.target.checked);
        // console.log("value: ", value);
        console.log('option:', option);
        setFormData(prevFormData => ({
            ...prevFormData,
            services: prevFormData.services.map(s =>
                s.type === type
                    ? {
                        ...s,
                        // ...(option === "serviceLevel"
                        //     ? { [option]: value }  // Add serviceLevel directly to the top level
                        //     : {
                        customOptions: {
                            ...s.customOptions,
                            [option]: value   // Group service and serviceCost
                        }
                        // }
                        // )
                    }
                    : s
            )
        }));
    };

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


    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form data:', formData);

        let promoCodeIsValid = false;

        if (formData.promoCode !== "") {
            promoCodeIsValid = await handlePromoCodeValidation(e);
            if (!promoCodeIsValid) {
                return;
            }
        }

        // const promoCodeIsValid = await handlePromoCodeValidation(e);
        // if (!validPromoCode) {
        // }

        if (promoCodeIsValid || formData.promoCode === '') {
            // const emailCheckbox = document.getElementById('emailCheckbox');
            if (!formData.name || (!formData.email) || !formData.phonenumber || (!formData.services.length && !formData.products.length) || !formData.postalcode) {
                // if (!formData.name || !formData.email || !formData.phonenumber || !formData.description || !formData.companyName || (!formData.services.length && !formData.products.length) || !formData.howDidYouHearAboutUs || !formData.subtotalCost || !formData.tax || !formData.grandTotal || !formData.address || !formData.city || !formData.province || !formData.postalcode) {
                const missingFields = [];
                if (!formData.name) missingFields.push('Full Name');
                if (!formData.email) missingFields.push('Email');
                if (!formData.phonenumber) missingFields.push('Phone Number');
                // if (!formData.description) missingFields.push('Description');
                // if (!formData.address) missingFields.push('Address');
                // if (!formData.city) missingFields.push('City');
                // if (!formData.province) missingFields.push('Province');
                if (!formData.postalcode) missingFields.push('Postal Code');
                if (!formData.services.length && !formData.products.length) missingFields.push('Services or Products');
                // if (!formData.subtotalCost) missingFields.push('Subtotal Cost');
                // if (!formData.tax) missingFields.push('Tax');
                // if (!formData.grandTotal) missingFields.push('Grand Total');

                if (missingFields.length > 0) {
                    alert(`Please fill out all required fields: ${missingFields.join(', ')}`);
                    return;
                }
                return;
            }
            // const isServiceLevelFilled = formData.services.every(service => service.serviceLevel);
            // const isCustomOptionsFilled = formData.services.every(service =>
            //     service.customOptions &&
            //     (service.customOptions.squareFootage) &&
            //     service.customOptions.squareFootage.service
            // );

            // Purge customOptions that don't have a service
            const sanitizedServices = formData.services.map(service => {
                if (service.customOptions) {
                    const sanitizedOptions = Object.keys(service.customOptions)
                        .filter(option => service.customOptions[option].service)
                        .reduce((acc, option) => {
                            acc[option] = service.customOptions[option];
                            return acc;
                        }, {});
                    return { ...service, customOptions: sanitizedOptions };
                }
                return service;
            });

            const serviceSelectionForm = document.getElementById("service-selection");

            // Extract form values
            const serviceSelectionFormText = new FormData(serviceSelectionForm);
            let textSummary = "";
            for (let [key, value] of serviceSelectionFormText.entries()) {
                const placeholder = serviceSelectionForm.querySelector(`[name="${key}"]`)?.placeholder || key;
                textSummary += `<strong>${placeholder}:</strong> ${value}<br>`;
            }
            
            console.log(textSummary);

            const updatedFormData = {
                ...formData,
                // serviceSelectionForm,
                services: sanitizedServices
            };

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
                    alert('Quote submitted successfully!');
                    // disable for testing
                    setFormData({
                        name: '',
                        companyName: '',
                        email: '',
                        phonenumber: '',
                        postalcode: '',
                        promoCode: '',
                        services: [],
                        products: [],
                        // serviceLevel: '' // Reset service level
                    });

                    // const quoteResponse = await response.json();
                    // // if (!emailCheckbox.checked) {
                    // const emailResponse = await fetch('/api/email/quick-quote', {
                    //     method: 'POST',
                    //     headers: {
                    //         'Content-Type': 'application/json',
                    //         Accept: 'application/json'
                    //     },
                    //     body: JSON.stringify({ email: formData.email, quote: quoteResponse })
                    // });

                    // if (emailResponse.ok) {
                    //     alert('Email confirmation sent successfully!');
                    //     console.log('Email sent successfully!');
                    // } else {
                    //     alert('Error sending email');
                    // }
                    
                    navigate('/index');
                }
            } catch (error) {
                console.error('Error submitting quote:', error);
                alert('Error submitting quote, please ensure all fields are filled out correctly. If the problem persists, please contact us directly with a description of the issue.');
            }

            // html2canvas(serviceSelectionForm).then(canvas => {
            //     canvas.toBlob(async (blob) => {
            //         const imageBase64 = canvas.toDataURL("image/png").split(",")[1]; // Get Base64 data (remove prefix)

            //         const formData = new FormData();
            //         formData.append("textSummary", textSummary); // Send text version too
            //         // formData.append("screenshot", blob, "quote-form.png");
            //         formData.append("imageBase64", imageBase64); // Send Base64 image
        
            //         const response = await fetch("/api/email/quick-quote", {
            //             method: "POST",
            //             body: formData
            //         });
        
            //         const data = await response.json();
            //         alert(data.message);
            //     });
            // });

                // Capture screenshot of the form
    const canvas = await html2canvas(serviceSelectionForm);
    const imageBase64 = canvas.toDataURL("image/png").split(",")[1]; // PNG format

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
        else {
            alert('Invalid promo code. Please review your code and try again. If you do not have a promo code, please leave the field blank.');
        }


    };


    const renderCustomOptions = (type, serviceLevel) => {
        switch (type) {
            case 'House Cleaning': {
                return (
                    <>
                        <Row>
                            <Col>
                                <Label>Frequency Of Cleaning</Label>
                            </Col>
                            <Col>
                                <select aria-label="Frequency of Cleaning" className="transparent" onChange={(e) => handleCustomOptionChange(type, 'frequency', e)}>
                                    <option value="">Frequency of Cleaning...</option>
                                    <option value="One Time">One Time</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Bi-Weekly">Bi-Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Other">Other</option>
                                </select>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Label>Number of Bedrooms</Label>
                            </Col>
                            <Col>
                                <select aria-label="Number of Bedrooms" className="transparent" onChange={(e) => handleCustomOptionChange(type, 'bedrooms', e)}>
                                    <option value="">Number of Bedrooms...</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5+</option>
                                </select>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Label>Number of Bathrooms</Label>
                            </Col>
                            <Col>
                                <select aria-label="Number of Bathrooms" className="transparent" onChange={(e) => handleCustomOptionChange(type, 'bathrooms', e)}>
                                    <option value="">Number of Bathrooms...</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5+</option>
                                </select>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Label>Unit Size</Label>
                            </Col>
                            <Col>
                                <select aria-label="Unit Size" className="transparent" onChange={(e) => handleCustomOptionChange(type, 'squareFootage', e)}>
                                    <option value="">Unit Size...</option>
                                    <option value="0-499 sqft">0-499 sqft</option>
                                    <option value="500-999 sqft">500-999 sqft</option>
                                    <option value="1000-1499 sqft">1000-1499 sqft</option>
                                    <option value="1500-1999 sqft">1500-1999 sqft</option>
                                    <option value="2000+ sqft">2000+ sqft</option>
                                </select>
                            </Col>
                        </Row>
                    </>
                );
            }
            case 'Carpet Cleaning': {
                return (
                    <>

                    </>
                );
            }
            case 'Move-In/Out Cleaning': {
                return (
                    <>
                        {/* <Row className='g-2 px-1'>
                            <Col md='2' xs='6'> */}
                        <FloatingLabel controlId="floatingUnitSize" label="Unit Size" >
                            <Form.Select aria-label="Unit Size" className="transparent" onChange={(e) => handleCustomOptionChange(type, 'squareFootage', e)}>
                                <option value="">Unit Size...</option>
                                <option value="0-499 sqft">0-499 sqft</option>
                                <option value="500-999 sqft">500-999 sqft</option>
                                <option value="1000-1499 sqft">1000-1499 sqft</option>
                                <option value="1500-1999 sqft">1500-1999 sqft</option>
                                <option value="2000+ sqft">2000+ sqft</option>
                            </Form.Select>
                        </FloatingLabel>
                        {/* </Col>
                            <Col md='2' xs='6'> */}
                        <FloatingLabel controlId="floatingBedrooms" label="Number of Bedrooms">
                            <Form.Select aria-label="Number of Bedrooms" className="transparent" onChange={(e) => handleCustomOptionChange(type, 'bedrooms', e)}>
                                <option value="">Number of Bedrooms...</option>
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5+</option>
                            </Form.Select>
                        </FloatingLabel>
                        {/* </Col>
                            <Col md='2' xs='6'> */}
                        <FloatingLabel controlId="floatingBathrooms" label="Number of Bathrooms">
                            <Form.Select aria-label="Number of Bathrooms" className="transparent" onChange={(e) => handleCustomOptionChange(type, 'bathrooms', e)}>
                                <option value="">Number of Bathrooms...</option>
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5+</option>
                            </Form.Select>
                        </FloatingLabel>
                        {/* </Col>
                        </Row> */}
                    </>
                );
            }
            case 'Residential Building Cleaning': {
                // for this one, the message is to send us an email
                return (
                    <>
                        {/* <Row className='g-2 px-1'>
                            <Col md='2' xs='6'> */}
                        {/* send us an email */}

                        <p className=''>Provide a description of the services you require. We will be in touch shortly to schedule a consultation.</p>
                        <FloatingLabel controlId="floatingDescription" label="Description*" className=''>
                            <Form.Control
                                as="textarea"
                                placeholder="Description"
                                className='text-cleanar-color text-bold description-textarea'
                                name="description"
                                value={formData.services.find(s => s.type === type)?.customOptions?.description || ''}
                                onChange={(e) => handleCustomOptionChange(type, 'description', e)}
                            />
                        </FloatingLabel>
                        {/* </Col>
                        </Row> */}
                    </>
                );
            }
            default:
                return (
                    <>
                        {/* <Row className='g-2 px-1'>
                        <Col md='2' xs='6'> */}
                        {/* <p className='text-bold'>Send us an email</p> */}
                        {/* <p className=''>Description.</p> */}
                        <FormGroup>
                            <Label className='text-bold'>Description*</Label>
                            <Input
                                type="textarea"
                                name="description"
                                placeholder='Provide a description of the services you require. We will be in touch shortly to schedule a consultation.'
                                value={formData.description}
                                onChange={(e) => handleCustomOptionChange(type, 'description', e, 0, "description")}
                                className='text-cleanar-color text-bold'
                            />

                        </FormGroup>
                        {/* </Col>
                    </Row> */}
                    </>
                );
        }
    };

    const handleEmailCheckbox = (e) => {
        if (e.target.checked) {
            // disable the email field
            document.getElementById('floatingEmail').disabled = true;
            // set the email field to blank
            setFormData(prevFormData => ({ ...prevFormData, email: '' }));
        }
        else {
            document.getElementById('floatingEmail').disabled = false;
        }
    }


    return (
        <>
            <Container className="quick-quote-container">
                <h2 className="pt-3 primary-color text-bold">Obtain a Service Estimate</h2>
                <Form onSubmit={handleSubmit} id="quote-form" >
                    <Form.Group className="mb-1">
                        <Row>
                            <Col md='2' xs='6'>
                                <Form.Label className='text-bold'>Name*</Form.Label> <FaQuestionCircle id="Tooltip1" tabIndex='-1'
                                    // color="link"    
                                    // className='primary-bg-color'                                 
                                    onClick={() => togglePopover('name')} />
                                <Popover placement="right" isOpen={popoverOpen.name} target="Tooltip1" toggle={() => togglePopover('name')}>
                                    <PopoverBody>Enter your full name.</PopoverBody>
                                </Popover>
                            </Col>
                            <Col md='2' xs='6'>
                                <Form.Control
                                    type="text"
                                    id="floatingFullName"
                                    placeholder="Full Name"
                                    className='text-cleanar-color text-bold form-input'
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col md='2' xs='6'>
                                <Form.Label className='text-bold'>Email*</Form.Label> <FaQuestionCircle id="Tooltip2" onClick={() => togglePopover('email')} />
                                <Popover placement="right" isOpen={popoverOpen.email} target="Tooltip2" toggle={() => togglePopover('email')}>
                                    <PopoverBody>Enter your email address.</PopoverBody>
                                </Popover>
                            </Col>
                            <Col md='2' xs='6'>
                                <Form.Control
                                    type="text"
                                    id="floatingEmail"
                                    placeholder="Email"
                                    className='text-cleanar-color text-bold form-input'
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                {/* add a checkbox and if enabled, the email field will be disabled. but only for logged in admins */}
                                {(isLogged === true && Auth.getProfile().data.adminFlag === true) ?
                                    (<>
                                        <Form.Check type="checkbox" id="emailCheckbox" label="Disable email field" onChange={(e) => handleEmailCheckbox(e)} />
                                    </>)
                                    : null}
                            </Col>
                            <Col md='2' xs='6'>
                                <Form.Label className='text-bold'>Phone No*</Form.Label><FaQuestionCircle id="Tooltip3" onClick={() => togglePopover('phonenumber')} />
                                <Popover placement="right" isOpen={popoverOpen.phonenumber} target="Tooltip3" toggle={() => togglePopover('phonenumber')}>
                                    <PopoverBody>Enter your phone number.</PopoverBody>
                                </Popover>
                            </Col>
                            <Col md='2' xs='6'>
                                <Form.Control
                                    type="text"
                                    id="floatingPhoneNumber"
                                    placeholder="Phone Number"
                                    className='text-cleanar-color text-bold form-input'
                                    name="phonenumber"
                                    value={formData.phonenumber}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Row>
                    </Form.Group>
                    <Form.Group className="mb-1">
                        <Row>
                            <Col md='2' xs='6'>
                                <Form.Label className='text-bold'>Company</Form.Label>
                                <FaQuestionCircle id="companyNameTooltip" onClick={() => togglePopover('companyName')} />
                                <Popover placement="right" isOpen={popoverOpen.companyName} target="companyNameTooltip" toggle={() => togglePopover('companyName')}>
                                    <PopoverBody>Enter your company name.</PopoverBody>
                                </Popover>

                            </Col>
                            <Col md='2' xs='6'>

                                <Form.Control
                                    type="text"
                                    id="floatingCompanyName"
                                    placeholder="Company Name"
                                    className='text-cleanar-color text-bold form-input'
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col md='2' xs='6'>
                                <Form.Label className='text-bold'>Postal Code*</Form.Label>
                                <FaQuestionCircle id="Tooltip7" onClick={() => togglePopover('postalcode')} />
                                <Popover placement="right" isOpen={popoverOpen.postalcode} target="Tooltip7" toggle={() => togglePopover('postalcode')}>
                                    <PopoverBody>Enter your postal code.</PopoverBody>
                                </Popover>
                            </Col>
                            <Col md='2' xs='6'>

                                <Form.Control
                                    type="text"
                                    id="floatingPostalCode"
                                    placeholder="Postal Code"
                                    className='text-cleanar-color text-bold form-input'
                                    name="postalcode"
                                    value={formData.postalcode}
                                    onChange={handleChange}
                                />
                            </Col>
                            <Col md='2' xs='6'>

                                <Form.Label className='text-bold'>Promo Code</Form.Label>
                                <FaQuestionCircle id="Tooltip10" onClick={() => togglePopover('promoCode')} />
                                <Popover placement="right" isOpen={popoverOpen.promoCode} target="Tooltip10" toggle={() => togglePopover('promoCode')}>
                                    <PopoverBody>Enter your promo code. Discount will be reflected on the quote if eligible. Promos cannot be combined.</PopoverBody>
                                </Popover>
                            </Col>
                            <Col md='2' xs='6'>

                                <Form.Control
                                    type="text"
                                    id="promoCode"
                                    placeholder="Promo Code"
                                    className='text-cleanar-color text-bold form-input'
                                    name="promoCode"
                                    value={formData.promoCode}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Row>
                    </Form.Group>
                    <Label className='text-cleanar-color text-bold'>Add Service Required*: </Label>{' '}
                    <FaQuestionCircle id="Tooltip11" tabIndex='-1' onClick={() => togglePopover('services')} />
                    {/* <Button id="Tooltip11" type="button" tabIndex='-1' onClick={() => togglePopover('services')} className='primary-bg-color btn-round btn-icon'><FaQuestionCircle /></Button> */}
                    <Popover placement="right" isOpen={popoverOpen.services} target="Tooltip11" toggle={() => togglePopover('services')}>
                        <PopoverBody>Please add service type and level to customize your order</PopoverBody>
                    </Popover>
                    <Form id="service-selection">
                    <Row>
                        <Col md='3' xs='3'>
                            <div className="radio-group">
                                {Object.keys(serviceOptions).map((service) => (
                                    <label key={service} className="radio-label">
                                        <input
                                            type="radio"
                                            name="serviceType"
                                            placeholder='Service Type'
                                            value={service}
                                            checked={selectedService === service}
                                            onChange={() => handleServiceChange(service)}
                                        />
                                        {service}
                                    </label>
                                ))}
                            </div>
                        </Col>
                        <Col md='4' xs='4'>
                            {/* Options for Selected Service */}
                            {/* <label>Choose a Service:</label> */}
                            {selectedService && (
                                <div className="options-selection">
                                    <div className="radio-group">
                                        {options.map((option) => (
                                            <label key={option} className="radio-label">
                                                <input type="radio" name="serviceOption"
                                                placeholder='Service Option'
                                                key={option} value={option} onChange={handleAddService} />
                                                {option}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Col>
                        <Col md='4' xs='4'>
                            {/* add code to render options based on the serviceOption selected  */}
                            {formData.services.map(service => (
                                <>
                                    {/* <div id={service.type} */}
                                    {/* className={`service-section-${service.type.toLowerCase().replace(" ", "-")} `}> */}
                                    {/* {renderCustomOptions(service.type, service.customOptions.serviceLevel)} */}
                                    {renderCustomOptions(service.type, service.serviceLevel)}
                                    {/* </div> */}
                                </>
                            ))}
                        </Col>
                        <Col md='6' xs='6'>
                        </Col>
                    </Row>                  
                    </Form> 
                    <Row>
                        <Col>
                            <p className='primary-color text-bold pt-2'>
                                A confirmation email will be sent to you upon submission. Our team will review your request and get back to you as soon as possible. Thank you for choosing CleanAR Solutions!
                            </p>
                            {/* <FormGroup check className=''>
                                        <Label check>
                                            <Input
                                                type="checkbox"
                                                checked={sendEmail}
                                                onChange={() => setSendEmail(!sendEmail)}
                                            />
                                            <span className="form-check-sign"></span>
                                            {/* Check if you would like to receive a copy of the quote by email 
                                            An email confirmation will be sent to you upon submission
                                        </Label>
                                    </FormGroup> */}

                        </Col>
                    </Row>
                    <Row className='pb-3'>
                        <Col md className="">
                            <Button type="submit" className='secondary-bg-color'>Submit Quote</Button>
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
