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
import Auth from "../../utils/auth";
import VisitorCounter from "components/Pages/VisitorCounter.js";
import {
    FaQuestionCircle
} from 'react-icons/fa';


const RequestQuote = () => {

    const location = useLocation();
    // const [promoCode, setPromoCode] = useState('');
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
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

    const allServices = ["Residential", "Commercial", "Carpet Cleaning"];
    const [validPromoCode, setValidPromoCode] = useState(false);
    // const togglePopover = (field) => {
    //     setPopoverOpen({ ...popoverOpen, [field]: !popoverOpen[field] });
    //   };
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

    // const [sendEmail, setSendEmail] = useState(true); // Default to true so that the user receives an email
    const [isLogged] = useState(Auth.loggedIn());
    // const [open, setOpen] = useState(false);
    // const [openStates, setOpenStates] = useState({});
    const [openService, setOpenService] = useState(null);

    // mock pricing structure
    const pricing = {
        squareFootage: {
            '0-499 sqft': 50,
            '500-999 sqft': 100,
            '1000-1499 sqft': 150,
            '1500-1999 sqft': 200,
            '2000+ sqft': 250,
        },
        bedrooms: {
            0: 0,
            1: 20,
            2: 40,
            3: 60,
            4: 80,
            5: 100,
        },
        bathrooms: {
            0: 0,
            1: 30,
            2: 60,
            3: 90,
            4: 120,
            5: 150,
        },
        rooms: {
            0: 0,
            1: 50,
            2: 100,
            3: 150,
            4: 200,
            5: 250,
        },
        squareFootageCommercial: {
            '0-999 sqft': 100,
            '1000-4999 sqft': 200,
            '5000-9999 sqft': 300,
            '10000+ sqft': 400,
        },
        employees: {
            0: 0,
            1: 50,
            2: 100,
            3: 150,
            4: 200,
            5: 250,
        }
    };

    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        const initializeServices = async () => {
            try {
                const serviceResponse = await fetch(`/api/services`);
                const productResponse = await fetch(`/api/products`);

                if (serviceResponse.ok) {
                    const serviceData = await serviceResponse.json();
                    setServices(serviceData.map(item => ({
                        name: item.name,
                        id: item._id,
                        serviceCost: item.serviceCost,
                        isResidential: item.isResidential,
                        isCommercial: item.isCommercial,
                        isIndustrial: item.isIndustrial,
                        serviceLevel: item.serviceLevel
                    })));
                }

                if (productResponse.ok) {
                    const productData = await productResponse.json();
                    setProducts(productData.map(item => ({
                        name: item.name,
                        id: item._id,
                        productCost: item.productCost
                    })));
                }
            } catch (error) {
                console.error('Error fetching services or products:', error);
            }

            console.log(services);
        };

        const prepopulateForm = async () => {
            if (isLogged) {
                const data = Auth.getProfile().data;
                setFormData(prevFormData => ({
                    ...prevFormData,
                    name: data.firstName + " " + data.lastName,
                    email: data.email,
                    phonenumber: data.telephone,
                    // howDidYouHearAboutUs: data.howDidYouHearAboutUs,
                    address: data.address,
                    city: data.city,
                    province: data.province,
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
            const searchParams = new URLSearchParams(location.search);
            const promoCode = searchParams.get('promoCode');
            const serviceType = searchParams.get("service");

            if (promoCode) {
                setFormData(prevFormData => ({
                    ...prevFormData,
                    promoCode: promoCode
                }));
            }
            if (serviceType) {
                handleAddService({ target: { value: serviceType } });
            }
            initializeServices();
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

        setFormData(prevFormData => {
            const serviceExists = prevFormData.services.find(s => s.type === serviceType);

            if (!serviceExists) {
                // Add the new service
                const updatedFormData = {
                    ...prevFormData,
                    services: [
                        ...prevFormData.services,
                        { type: serviceType, serviceLevel: '' }
                    ]
                };

                // Set the open service after updating the state
                setOpenService(serviceType);

                return updatedFormData;
            } else {
                // Remove the existing service
                return {
                    ...prevFormData,
                    services: prevFormData.services.filter(s => s.type !== serviceType)
                };
            }
        });


    };

    const handleRemoveService = (type) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            services: prevFormData.services.filter(s => s.type !== type)
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
        setFormData(prevFormData => ({
            ...prevFormData,
            services: prevFormData.services.map(s =>
                s.type === type
                    ? {
                        ...s,
                        ...(option === "serviceLevel"
                            ? { [option]: value }  // Add serviceLevel directly to the top level
                            : {
                                customOptions: {
                                    ...s.customOptions,
                                    [option]: { service: value, serviceCost: cost, label: label }  // Group service and serviceCost
                                }
                            }
                        )
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
            const emailCheckbox = document.getElementById('emailCheckbox');
            if (!formData.name || (!formData.email && !emailCheckbox) || !formData.phonenumber || !formData.description || (!formData.services.length && !formData.products.length) || !formData.address || !formData.city || !formData.province || !formData.postalcode) {
                // if (!formData.name || !formData.email || !formData.phonenumber || !formData.description || !formData.companyName || (!formData.services.length && !formData.products.length) || !formData.howDidYouHearAboutUs || !formData.subtotalCost || !formData.tax || !formData.grandTotal || !formData.address || !formData.city || !formData.province || !formData.postalcode) {
                const missingFields = [];
                if (!formData.name) missingFields.push('Full Name');
                if (!formData.email) missingFields.push('Email');
                if (!formData.phonenumber) missingFields.push('Phone Number');
                if (!formData.description) missingFields.push('Description');
                if (!formData.address) missingFields.push('Address');
                if (!formData.city) missingFields.push('City');
                if (!formData.province) missingFields.push('Province');
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
            const isServiceLevelFilled = formData.services.every(service => service.serviceLevel);
            const isCustomOptionsFilled = formData.services.every(service =>
                service.customOptions &&
                (service.customOptions.squareFootage) &&
                service.customOptions.squareFootage.service
            );

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

            const updatedFormData = {
                ...formData,
                services: sanitizedServices
            };
            // console.log('sanitizedServices:', sanitizedServices);
            // console.log('isServiceLevelFilled:', isServiceLevelFilled);
            // console.log('isCustomOptionsFilled:', isCustomOptionsFilled);
            if (!isServiceLevelFilled) {
                alert('Please select a service level for all services');
                return;
            }

            // this is not needed for now
            // if (!isCustomOptionsFilled) {
            //     alert('Please select unit size/square footage for all services');
            //     return;
            // }


            try {
                const response = await fetch('/api/quotes', {
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
                        userId: '',
                        description: '',
                        companyName: '',
                        email: '',
                        phonenumber: '',
                        address: '',
                        city: '',
                        province: '',
                        postalcode: '',
                        howDidYouHearAboutUs: '',
                        subtotalCost: 0,
                        promoCode: '',
                        tax: 0,
                        grandTotal: 0,
                        services: [],
                        products: [],
                        // serviceLevel: '' // Reset service level
                    });


                    // if (window.confirm('Would you like to download the quote as a PDF?')) {
                    //     const element = document.getElementById('quote-form');
                    //     const opt = {
                    //         margin: 0.5,
                    //         filename: 'quote.pdf',
                    //         image: { type: 'jpeg', quality: 0.98 },
                    //         html2canvas: { scale: 2 },
                    //         jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                    //     };
                    //     html2pdf().set(opt).from(element).save();
                    // }

                    const quoteResponse = await response.json();
                    if (!emailCheckbox.checked) {
                        const emailResponse = await fetch('/api/email/quote', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Accept: 'application/json'
                            },
                            body: JSON.stringify({ email: formData.email, quote: quoteResponse })
                        });

                        if (emailResponse.ok) {
                            alert('Email confirmation sent successfully!');
                            console.log('Email sent successfully!');
                        } else {
                            alert('Error sending email');
                        }
                    }
                    // merged the two fetch requests into one
                    const emailNotification = await fetch('/api/email/quote-notification', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json'
                        },
                        body: JSON.stringify({ email: formData.email, quote: quoteResponse })
                    });
                    if (emailNotification.ok) {
                        // alert('Email notification sent successfully!');
                        console.log('Email notification sent successfully!');
                    }
                    else {
                        alert('Error sending email notification');
                    }
                    navigate('/index');
                }
            } catch (error) {
                console.error('Error submitting quote:', error);
                alert('Error submitting quote, please ensure all fields are filled out correctly. If the problem persists, please contact us directly with a description of the issue.');
            }
        }
        else {
            alert('Invalid promo code. Please review your code and try again. If you do not have a promo code, please leave the field blank.');
        }


    };


    const renderCustomOptions = (type, serviceLevel) => {
        switch (type) {
            case 'Residential':
                return (
                    // <Tab>
                    <>
                        <Row className='g-2 px-1'>
                            <Col md='2' xs='6'>
                                <FloatingLabel controlId={`floatingServiceLevel${type}`} label="Select Service Level...*" className=''>
                                    <Form.Select aria-label="Service level" name="serviceLevel" className="transparent" onChange={(e) => handleCustomOptionChange(type, 'serviceLevel', e)} >
                                        <option value="">Service Level...*</option>
                                        <option value="Basic Cleaning">Basic Cleaning</option>
                                        <option value="Deep Cleaning">Deep Cleaning</option>
                                        <option value="Special Deal">Special Deal</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col md='2' xs='6'>
                                <FloatingLabel controlId="floatingUnitSize" label="Unit Size" >
                                    <Form.Select aria-label="Unit Size" className="transparent" onChange={(e) => handleCustomOptionChange(type, 'squareFootage', e, pricing.squareFootage[e.target.value], e.target.getAttribute('aria-label'))}>
                                        <option value="">Unit Size...</option>
                                        <option value="0-499 sqft">0-499 sqft</option>
                                        <option value="500-999 sqft">500-999 sqft</option>
                                        <option value="1000-1499 sqft">1000-1499 sqft</option>
                                        <option value="1500-1999 sqft">1500-1999 sqft</option>
                                        <option value="2000+ sqft">2000+ sqft</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col md='2' xs='6'>
                                <FloatingLabel controlId="floatingBedrooms" label="Number of Bedrooms">
                                    <Form.Select aria-label="Number of Bedrooms" className="transparent" onChange={(e) => handleCustomOptionChange(type, 'bedrooms', e, pricing.bedrooms[e.target.value], e.target.getAttribute('aria-label'))}>
                                        <option value="">Number of Bedrooms...</option>
                                        <option value="0">0</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5+</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col md='2' xs='6'>
                                <FloatingLabel controlId="floatingBathrooms" label="Number of Bathrooms">
                                    <Form.Select aria-label="Number of Bathrooms" className="transparent" onChange={(e) => handleCustomOptionChange(type, 'bathrooms', e, pricing.bathrooms[e.target.value], e.target.getAttribute('aria-label'))}>
                                        <option value="">Number of Bathrooms...</option>
                                        <option value="0">0</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5+</option>
                                    </Form.Select>
                                    {/* <Form.Control aria-label='Number of Bathrooms' type="number" min="0" className='text-cleanar-color' onChange={(e) => handleCustomOptionChange(type, 'bathrooms', e.target.value, pricing.bathrooms[e.target.value], e.target.getAttribute('aria-label'))}
                                    // disabled={formData.serviceLevel === 'Deep Cleaning'}
                                    /> */}
                                </FloatingLabel>
                            </Col>
                        </Row>

                        <Row className='g-2 px-2'>
                            <Col className='py-1' md='3' xs='12'>
                                <p className='text-bold'>Customize your service</p>
                                <FormGroup check>
                                    {services
                                        .filter(service => service.serviceLevel === serviceLevel)
                                        .map((service, index) => {
                                            return (<>
                                                {service.isResidential ? (
                                                    <Label check>
                                                        <Input
                                                            type="checkbox"
                                                            onChange={(e) => handleCustomOptionChange(type, service.name, e, service.serviceCost, "")}
                                                        // disabled={formData.serviceLevel !== service.serviceLevel}
                                                        />
                                                        <span className="form-check-sign"></span>
                                                        {service.name} - {service.description}
                                                    </Label>
                                                ) : null}
                                            </>)
                                        })}
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row className='g-2 px-1'>
                            <Col md>
                                <Button onClick={() => handleRemoveService(type)} className='btn-danger' >Remove</Button>
                            </Col>
                        </Row>
                        {/* </Tab> */}
                    </>
                );
            case 'Commercial':
                return (
                    <>
                        <Row className='g-2 px-1'>
                            <Col md='3' xs='6'>
                                <FloatingLabel controlId={`floatingServiceLevel${type}`} label="Select Service Level...*">
                                    <Form.Select aria-label="Service level" className='transparent' name="serviceLevel" onChange={(e) => handleCustomOptionChange(type, 'serviceLevel', e)} >
                                        <option value="">Service Level...*</option>
                                        <option value="Basic Cleaning">Basic Cleaning</option>
                                        <option value="Deep Cleaning">Deep Cleaning</option>
                                        <option value="Special Deal">Special Deal</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col md='3' xs='6'>
                                <FloatingLabel controlId="floatingSquareFootage" label="Square Footage" className=''>
                                    <Form.Select aria-label="Square Footage" className='transparent' onChange={(e) => handleCustomOptionChange(type, 'squareFootage', e, pricing.squareFootageCommercial[e.target.value], e.target.getAttribute('aria-label'))}
                                    >
                                        <option value="">Square Footage...</option>
                                        <option value="0-999 sqft">0-999 sqft</option>
                                        <option value="1000-4999 sqft">1000-4999 sqft</option>
                                        <option value="5000-9999 sqft">5000-9999 sqft</option>
                                        <option value="10000+ sqft">10000+ sqft</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col md='3' xs='6'>
                                <FloatingLabel controlId="floatingRooms" label="Number of Rooms" className=''>
                                    <Form.Select aria-label="Number of Rooms" className='transparent' onChange={(e) => handleCustomOptionChange(type, 'rooms', e, pricing.rooms[e.target.value], e.target.getAttribute('aria-label'))}>
                                        <option value="">Number of Rooms...</option>
                                        <option value="0">0</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5+</option>
                                    </Form.Select>
                                </FloatingLabel>
                                {/* <FormGroup>
                                    <Label>Number of Rooms</Label>
                                    <Input type="number" min="0" onChange={(e) => handleCustomOptionChange(type, 'rooms', e.target.value, pricing.rooms[e.target.value])}
                                    // disabled={formData.serviceLevel === 'Deep Cleaning'}
                                    />
                                </FormGroup> */}
                            </Col>
                        </Row>
                        <Row className='g-2 px-2'>
                            <Col className='py-1' md='3' xs='12'>
                                <p className='text-bold'>Customize your service</p>
                                <FormGroup check>
                                    {services
                                        .filter(service => service.serviceLevel === serviceLevel)
                                        .map((service, index) => {
                                            return (<>
                                                {service.isCommercial ? (
                                                    <Label check>
                                                        <Input
                                                            type="checkbox"
                                                            onChange={(e) => handleCustomOptionChange(type, service.name, e, service.serviceCost, "")}
                                                        // disabled={formData.serviceLevel === 'Deep Cleaning'}
                                                        />
                                                        <span className="form-check-sign"></span>
                                                        {service.name} - {service.description}
                                                    </Label>
                                                ) : null}
                                            </>)
                                        })}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row className='g-2 px-1'>
                            <Col md>
                                <Button onClick={() => handleRemoveService(type)} className='btn-danger'>Remove</Button>
                            </Col>
                        </Row>
                    </>
                );
            case 'Industrial':
                return (
                    <> <Row className='g-2 px-1'>
                        <Col md='3' xs='6'>
                            <FloatingLabel controlId={`floatingServiceLevel${type}`} label="Select Service Level...*">
                                <Form.Select aria-label="Service level" className='transparent' name="serviceLevel" onChange={(e) => handleCustomOptionChange(type, 'serviceLevel', e)} >
                                    <option value="">Select Service Level...*</option>
                                    <option value="Basic Cleaning">Basic Cleaning</option>
                                    <option value="Deep Cleaning">Deep Cleaning</option>
                                    <option value="Special Deal">Special Deal</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                        <Col md='3' xs='6'>
                            <FloatingLabel controlId="floatingSquareFootage" label="Square Footage" className=''>
                                <Form.Select aria-label="Square Footage" className='transparent' onChange={(e) => handleCustomOptionChange(type, 'squareFootage', e, pricing.squareFootage[e.target.value], e.target.getAttribute('aria-label'))}>
                                    <option value="">Select Square Footage...</option>
                                    <option value="0-999 sqft">0-999 sqft</option>
                                    <option value="1000-4999 sqft">1000-4999 sqft</option>
                                    <option value="5000-9999 sqft">5000-9999 sqft</option>
                                    <option value="10000+ sqft">10000+ sqft</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                        <Col md='3' xs='6'>
                            <FloatingLabel controlId="floatingEmployees" label="Number of Employees" className=''>
                                <Form.Select aria-label="Number of Employees" className='transparent' onChange={(e) => handleCustomOptionChange(type, 'employees', e, pricing.employees[e.target.value], e.target.getAttribute('aria-label'))}>
                                    <option value="">Select Number of Employees...</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                    </Row>
                        <Row className='g-2 px-2'>
                            <Col className='py-1' md='3' xs='12'>
                                <p className='text-bold'>Customize your service</p>
                                <FormGroup check>
                                    {services
                                        .filter(service => service.serviceLevel === serviceLevel)
                                        .map((service, index) => {
                                            return (<>
                                                {service.isIndustrial ? (
                                                    <Label check>
                                                        <Input
                                                            type="checkbox"
                                                            onChange={(e) => handleCustomOptionChange(type, service.name, e, service.serviceCost, "")}
                                                        // disabled={formData.serviceLevel === 'Deep Cleaning'}
                                                        />
                                                        <span className="form-check-sign"></span>
                                                        {service.name} - {service.description}
                                                    </Label>
                                                ) : null}
                                            </>)
                                        })}
                                    {/* <Label check>
                                <Input
                                    type="checkbox"
                                    onChange={(e) => handleCustomOptionChange(type, 'highDusting', e.target.checked)}
                                    disabled={formData.serviceLevel === 'Deep Cleaning'}
                                />
                                <span className="form-check-sign"></span>
                                High Dusting
                            </Label> */}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row className='g-2 px-1'>
                            <Col md>
                                <Button onClick={() => handleRemoveService(type)} className='btn-danger'>Remove</Button>
                            </Col>
                        </Row>
                    </>
                );
            case 'Carpet Cleaning':
                return (
                    <>
                        <Row className='g-2 px-1'>
                            <Col md='3' xs='6'>
                                <FloatingLabel controlId={`floatingServiceLevel${type}`} label="Select Service Level...*">
                                    <Form.Select aria-label="Service level" className='transparent' name="serviceLevel" onChange={(e) => handleCustomOptionChange(type, 'serviceLevel', e)} >
                                        <option value="">Service Level...*</option>
                                        <option value="Basic Cleaning">Basic Cleaning</option>
                                        <option value="Deep Cleaning">Deep Cleaning</option>
                                        <option value="Special Deal">Special Deal</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col md='3' xs='6'>
                                <FloatingLabel controlId="carpetMaterial" label="Carpet Material" className=''>
                                    <Form.Select aria-label="Carpet Material" className='transparent' onChange={(e) => handleCustomOptionChange(type, 'carpetMaterial', e, 50, e.target.getAttribute('aria-label'))}>
                                        <option value="">Carpet Material...*</option>
                                        <option value="Nylon">Nylon</option>
                                        <option value="Polyester">Polyester</option>
                                        <option value="Olefin">Olefin</option>
                                        <option value="Acrylic">Acrylic</option>
                                        <option value="Wool">Wool</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col md='3' xs='6'>
                                <FloatingLabel controlId="carpetSize" label="Carpet Size" className=''>
                                    <Form.Select aria-label="Carpet Size" className='transparent' onChange={(e) => handleCustomOptionChange(type, 'carpetSize', e, 50, e.target.getAttribute('aria-label'))}>
                                        <option value="">Carpet Size...</option>
                                        <option value="Small">Small</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Large">Large</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col md='3' xs='6'>
                                <FloatingLabel controlId="carpetCondition" label="Carpet Condition" className=''>
                                    <Form.Select aria-label="Carpet Condition" className='transparent' onChange={(e) => handleCustomOptionChange(type, 'carpetCondition', e, 50, e.target.getAttribute('aria-label'))}>
                                        <option value="">Carpet Condition...</option>
                                        <option value="Lightly Soiled">Lightly Soiled</option>
                                        <option value="Moderately Soiled">Moderately Soiled</option>
                                        <option value="Heavily Soiled">Heavily Soiled</option>
                                        <option value="Stain Removal Needed">Stain Removal Needed</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            {/* <Col md='3' xs='6'>
                                <FloatingLabel controlId="frequencyCleaning" label="Frequency of Cleaning" className=''>
                                    <Form.Select aria-label="Frequency of Cleaning" className='transparent' onChange={(e) => handleCustomOptionChange(type, 'frequencyCleaning', e, 50, e.target.getAttribute('aria-label'))}>
                                        <option value="">Select Frequency of Cleaning...</option>
                                        <option value="One Time">One Time</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Quarterly">Quarterly</option>
                                        <option value="Bi-Annually">Bi-Annually</option>
                                        <option value="Annually">Annually</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col> */}
                        </Row>
                        <Row className='g-2 px-1'>
                            <Col md='3' xs='12'>
                                <p className='text-bold'>Customize your service</p>
                                <FormGroup check>
                                    {services
                                        .filter(service => service.serviceLevel === serviceLevel)
                                        .map((service, index) => {
                                            return (<>
                                                {service.isResidential ? (
                                                    <Label check>
                                                        <Input
                                                            type="checkbox"
                                                            onChange={(e) => handleCustomOptionChange(type, service.name, e, service.serviceCost, "")}
                                                        />
                                                        <span className="form-check-sign"></span>
                                                        {service.name} - ${service.serviceCost}
                                                    </Label>
                                                ) : null}
                                            </>)
                                        })}
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row className='g-2 px-1'>
                            <Col md>
                                <Button onClick={() => handleRemoveService(type)} className='btn-danger'>Remove</Button>
                            </Col>
                        </Row>
                    </>
                );


            default:
                return null;
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
            {/* <Navbar /> */}
            <Helmet>
                <title>Request a Quote - CleanAR Solutions</title>
                <meta name="description" content="Request a quote for professional cleaning services from CleanAR Solutions. Fill out the form to get a customized quote for your cleaning needs." />
                <meta name="keywords" content="request quote, cleaning services, professional cleaning, CleanAR Solutions" />
                <meta name="author" content="CleanAR Solutions" />
                <meta property="og:title" content="Request a Quote - CleanAR Solutions" />
                <meta property="og:description" content="Request a quote for professional cleaning services from CleanAR Solutions. Fill out the form to get a customized quote for your cleaning needs." />
                <meta property="og:url" content="www.cleanarsolutions.ca/request-quote" />
                <meta property="og:type" content="website" />
            </Helmet>
            <div className="pb-0 mb-0 request-quote-bg">
                <VisitorCounter page={"request-quote"} />
                <Container>
                    <h2 className="pt-3 primary-color text-bold">Request a Quote</h2>
                    <p className="text-bold">
                        {isLogged ? (
                            <span>Logged in as {Auth.getProfile().data.firstName} {Auth.getProfile().data.lastName}. Feel free to adjust the autofill data if needed!</span>
                        ) : (
                            <span>Please fill out the form below to request a quote. Fields with * are required. <br />
                                Speed up your booking process! <Link to="/login-page">Log in</Link> or <Link to="/signup-page">Sign up</Link> to autofill your details and complete your reservation in seconds.</span>
                        )}
                    </p>
                    {/* add a button to reset all fields */}
                    <Button onClick={() => setFormData({
                        name: '',
                        description: '',
                        companyName: '',
                        email: '',
                        address: '',
                        city: '',
                        province: '',
                        postalcode: '',
                        phonenumber: '',
                        howDidYouHearAboutUs: '',
                        subtotalCost: 0,
                        promoCode: '',
                        tax: 0,
                        grandTotal: 0,
                        services: [],
                        products: []
                    })} className='btn-danger'>Reset Form</Button>

                    {/* <p>If you have an account with us already, please log-in to pre-fill your information for a speedy request</p> */}
                    <Form onSubmit={handleSubmit} id="quote-form">
                        <Row className=''>
                            <Col md='3' xs='10'>
                                <Form.Group className="mb-3">
                                    <Form.Label className='text-bold'>Full Name*</Form.Label> <FaQuestionCircle id="Tooltip1" tabIndex='-1'
                                        // color="link"   
                                        // className='primary-bg-color'                                 
                                        onClick={() => togglePopover('name')} />
                                    <Popover placement="right" isOpen={popoverOpen.name} target="Tooltip1" toggle={() => togglePopover('name')}>
                                        <PopoverBody>Enter your full name.</PopoverBody>
                                    </Popover>
                                    <Form.Control
                                        type="text"
                                        id="floatingFullName"
                                        placeholder="Full Name"
                                        className='text-cleanar-color text-bold form-input'
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            {/* <Col md='1' xs='1'>
                                <Button id="Tooltip1" type="button" tabIndex='-1'
                                    // color="link"                                    
                                    onClick={() => togglePopover('name')} className='primary-bg-color btn-round btn-icon'><FaQuestionCircle /></Button>
                                
                            </Col> */}
                            <Col md='3' xs='10'>
                                <Form.Group className="mb-3">
                                    <Form.Label className='text-bold'>Email*</Form.Label> <FaQuestionCircle id="Tooltip2" onClick={() => togglePopover('email')} />
                                    <Popover placement="right" isOpen={popoverOpen.email} target="Tooltip2" toggle={() => togglePopover('email')}>
                                        <PopoverBody>Enter your email address.</PopoverBody>
                                    </Popover>
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
                                </Form.Group>
                                {/* <Form.Floating className="mb-3">
                                    <Form.Control
                                        type="text"
                                        id="floatingEmail"
                                        placeholder="Email"
                                        className='text-cleanar-color text-bold form-input'
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="floatingEmail" className='text-bold'>Email*</label>
                                </Form.Floating> */}
                            </Col>
                            {/* <Col md='1' xs='1'> */}
                            {/* <Button id="Tooltip2" type="button" tabIndex='-1'
                                    // color="link"
                                     className='primary-bg-color btn-round btn-icon'> */}

                            {/* </Button> */}

                            {/* </Col> */}
                            <Col md='3' xs='10'>
                                <Form.Group className="mb-3">
                                    <Form.Label className='text-bold'>Phone Number*</Form.Label>
                                    <FaQuestionCircle id="Tooltip3" onClick={() => togglePopover('phonenumber')} />
                                    <Popover placement="right" isOpen={popoverOpen.phonenumber} target="Tooltip3" toggle={() => togglePopover('phonenumber')}>
                                        <PopoverBody>Enter your phone number.</PopoverBody>
                                    </Popover>
                                    <Form.Control
                                        type="text"
                                        id="floatingPhoneNumber"
                                        placeholder="Phone Number"
                                        className='text-cleanar-color text-bold form-input'
                                        name="phonenumber"
                                        value={formData.phonenumber}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                {/* <Form.Floating className="mb-3">
                                    <Form.Control
                                        type="text"
                                        id="floatingPhoneNumber"
                                        placeholder="Phone Number"
                                        className='text-cleanar-color text-bold'
                                        name="phonenumber"
                                        value={formData.phonenumber}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="floatingPhoneNumber" className='text-bold'>Phone Number*</label>
                                </Form.Floating> */}
                            </Col>
                            {/* <Col md='1' xs='1'>
                                <Button id="Tooltip3" type="button" tabIndex='-1' onClick={() => togglePopover('phonenumber')} className='primary-bg-color btn-round btn-icon'><FaQuestionCircle /></Button>
                                <Popover placement="right" isOpen={popoverOpen.phonenumber} target="Tooltip3" toggle={() => togglePopover('phonenumber')}>
                                    <PopoverBody>Enter your phone number.</PopoverBody>
                                </Popover>
                            </Col> */}
                            <Col md='3' xs='10'>
                                <Form.Group className="mb-3">
                                    <Form.Label className='text-bold'>Company Name</Form.Label>
                                    <FaQuestionCircle id="companyNameTooltip" onClick={() => togglePopover('companyName')} />
                                    <Popover placement="right" isOpen={popoverOpen.companyName} target="companyNameTooltip" toggle={() => togglePopover('companyName')}>
                                        <PopoverBody>Enter your company name.</PopoverBody>
                                    </Popover>
                                    <Form.Control
                                        type="text"
                                        id="floatingCompanyName"
                                        placeholder="Company Name"
                                        className='text-cleanar-color text-bold form-input'
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                {/* <Form.Floating className="mb-3">
                                    <Form.Control
                                        type="text"
                                        id="floatingCompanyName"
                                        placeholder="Company Name"
                                        className='text-cleanar-color text-bold'
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="floatingCompanyName" className='text-bold '>Company Name</label>
                                </Form.Floating> */}
                            </Col>
                        </Row>
                        <Row className=''>
                            <Col md='3' xs='10'>
                                <Form.Group className="mb-3">
                                    <Form.Label className='text-bold'>Address*</Form.Label>
                                    <FaQuestionCircle id="Tooltip4" onClick={() => togglePopover('address')} />
                                    <Popover placement="right" isOpen={popoverOpen.address} target="Tooltip4" toggle={() => togglePopover('address')}>
                                        <PopoverBody>Enter your address.</PopoverBody>
                                    </Popover>
                                    <Form.Control
                                        type="text"
                                        id="floatingAddress"
                                        placeholder="Address"
                                        className='text-cleanar-color text-bold form-input'
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                {/* <Form.Floating className="mb-3">
                                    <Form.Control
                                        type="text"
                                        id="floatingAddress"
                                        placeholder="Address"
                                        className='text-cleanar-color text-bold'
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="floatingAddress" className='text-bold'>Address*</label>
                                </Form.Floating> */}
                            </Col>
                            {/* <Col md='1' xs='1'>
                                <Button id="Tooltip4" type="button" tabIndex='-1' onClick={() => togglePopover('address')} className='primary-bg-color btn-round btn-icon'><FaQuestionCircle /></Button>
                                <Popover placement="right" isOpen={popoverOpen.address} target="Tooltip4" toggle={() => togglePopover('address')}>
                                    <PopoverBody>Enter your address.</PopoverBody>
                                </Popover>
                            </Col> */}
                            <Col md='3' xs='10'>
                                <Form.Group className="mb-3">
                                    <Form.Label className='text-bold'>City*</Form.Label>
                                    <FaQuestionCircle id="Tooltip5" onClick={() => togglePopover('city')} />
                                    <Popover placement="right" isOpen={popoverOpen.city} target="Tooltip5" toggle={() => togglePopover('city')}>
                                        <PopoverBody>Enter your city.</PopoverBody>
                                    </Popover>
                                    <Form.Control
                                        type="text"
                                        id="floatingCity"
                                        placeholder="City"
                                        className='text-cleanar-color text-bold form-input'
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                {/* <Form.Floating className="mb-3">
                                    <Form.Control
                                        type="text"
                                        id="floatingCity"
                                        placeholder="City"
                                        className='text-cleanar-color text-bold'
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="floatingCity" className='text-bold'>City*</label>
                                </Form.Floating> */}
                            </Col>
                            {/* <Col md='1' xs='1'>
                                <Button id="Tooltip5" type="button" tabIndex='-1' onClick={() => togglePopover('city')} className='primary-bg-color btn-round btn-icon'><FaQuestionCircle /></Button>
                                <Popover placement="right" isOpen={popoverOpen.city} target="Tooltip5" toggle={() => togglePopover('city')}>
                                    <PopoverBody>Enter your city.</PopoverBody>
                                </Popover>
                            </Col> */}
                            <Col md='3' xs='10'>
                                <Form.Group className="mb-3">
                                    <Form.Label className='text-bold'>Province*</Form.Label>
                                    <FaQuestionCircle id="Tooltip6" onClick={() => togglePopover('province')} />
                                    <Popover placement="right" isOpen={popoverOpen.province} target="Tooltip6" toggle={() => togglePopover('province')}>
                                        <PopoverBody>Enter your province.</PopoverBody>
                                    </Popover>
                                    <Form.Control
                                        type="text"
                                        id="floatingProvince"
                                        placeholder="Province"
                                        className='text-cleanar-color text-bold form-input'
                                        name="province"
                                        value={formData.province}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                {/* <Form.Floating className="mb-3">
                                    <Form.Control
                                        type="text"
                                        id="floatingProvince"
                                        placeholder="Province"
                                        className='text-cleanar-color text-bold'
                                        name="province"
                                        value={formData.province}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="floatingState" className='text-bold'>Province*</label>
                                </Form.Floating> */}
                            </Col>
                            {/* <Col md='1' xs='1'>
                                <Button id="Tooltip6" type="button" tabIndex='-1' onClick={() => togglePopover('province')} className='primary-bg-color btn-round btn-icon'><FaQuestionCircle /></Button>
                                <Popover placement="right" isOpen={popoverOpen.province} target="Tooltip6" toggle={() => togglePopover('province')}>
                                    <PopoverBody>Enter your province.</PopoverBody>
                                </Popover>
                            </Col> */}
                            <Col md='3' xs='10' >
                                <Form.Group className="mb-3">
                                    <Form.Label className='text-bold'>Postal Code*</Form.Label>
                                    <FaQuestionCircle id="Tooltip7" onClick={() => togglePopover('postalcode')} />
                                    <Popover placement="right" isOpen={popoverOpen.postalcode} target="Tooltip7" toggle={() => togglePopover('postalcode')}>
                                        <PopoverBody>Enter your postal code.</PopoverBody>
                                    </Popover>
                                    <Form.Control
                                        type="text"
                                        id="floatingPostalCode"
                                        placeholder="Postal Code"
                                        className='text-cleanar-color text-bold form-input'
                                        name="postalcode"
                                        value={formData.postalcode}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                {/* <Form.Floating className="mb-3 ">
                                    <Form.Control
                                        type="text"
                                        id="floatingPostalCode"
                                        placeholder="Postal Code"
                                        className='text-cleanar-color text-bold'
                                        name="postalcode"
                                        value={formData.postalcode}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="floatingPostalCode" className='text-bold'>Postal Code*</label>
                                </Form.Floating> */}
                            </Col>
                        </Row>

                        <FormGroup>
                            <Label className='text-bold'>Description*</Label>
                            <Input
                                type="textarea"
                                name="description"
                                placeholder='Please describe the services you are looking for, including any specific requirements or details.'
                                value={formData.description}
                                onChange={handleChange}
                                className='text-cleanar-color text-bold'
                            />

                        </FormGroup>
                        <Row>
                            <Col md='12' xs='12'>
                                <Label className='text-cleanar-color text-bold'>Add Services: </Label>{' '}
                                <FaQuestionCircle id="Tooltip11" tabIndex='-1' onClick={() => togglePopover('services')} />
                                {/* <Button id="Tooltip11" type="button" tabIndex='-1' onClick={() => togglePopover('services')} className='primary-bg-color btn-round btn-icon'><FaQuestionCircle /></Button> */}
                                <Popover placement="right" isOpen={popoverOpen.services} target="Tooltip11" toggle={() => togglePopover('services')}>
                                    <PopoverBody>Please add service type and level to customize your order</PopoverBody>
                                </Popover>
                            </Col>
                            <Col md='12' xs='12'>
                                {/* <Button key='1' className={`service-button-residential ${isServiceAdded("Residential") ? "disabled" : ""}`} variant="" onClick={() => handleAddService({ target: { value: "Residential" } })} value="Residential">Residential</Button>{' '}
                                <Button key='2' className={`service-button-commercial ${isServiceAdded("Commercial") ? "disabled" : ""}`} onClick={() => handleAddService({ target: { value: "Commercial" } })} value="Commercial">Commercial</Button>{' '} */}
                                {/* <Button className='service-button-industrial' onClick={() => handleAddService({ target: { value: "Industrial" } })} value="Industrial">Industrial</Button> */}
                                {/* <Button key='3' className={`service-button-industrial ${isServiceAdded("Carpet Cleaning") ? "disabled" : ""}`} onClick={() => handleAddService({ target: { value: "Carpet Cleaning" } })} value="Carpet Cleaning">Carpet Cleaning</Button> */}
                                {allServices
                                    .filter(serviceType => !formData.services.some(service => service.type === serviceType)) // Only show buttons for services not yet added
                                    .map(serviceType => (
                                        <Button
                                            key={serviceType}
                                            className={`service-button-${serviceType.toLowerCase().replace(" ", "-")}`}
                                            onClick={() => handleAddService({ target: { value: serviceType } })}
                                            value={serviceType}
                                        >
                                            {serviceType}
                                        </Button>
                                    ))}
                            </Col>
                        </Row>
                        <>
                            {/* <Row className='mx-0'> */}
                            {(formData.services.length === 0) ? (
                                <Button
                                    disabled
                                    className='service-button-residential px-2'
                                >Choose a service type to customize your quote</Button>
                            )
                                : (
                                    <>
                                        {formData.services.map(service => (
                                            <>
                                                {/* <Col xs='4' > */}
                                                <Button
                                                    onClick={() => handleToggle(service.type)}
                                                    aria-controls={service.type}
                                                    // aria-expanded={openStates[service.type]}
                                                    aria-expanded={openService === service.type}
                                                    className={`service-button-${service.type.toLowerCase().replace(" ", "-")} px-2`}
                                                >{service.type}
                                                    {openService === service.type ? (
                                                        <FaChevronUp className="ms-2" />
                                                    ) : (
                                                        <FaChevronDown className="ms-2" />
                                                    )}
                                                </Button>
                                                {/* </Col> */}
                                            </>
                                        ))}
                                    </>
                                )
                            }
                            {/* </Row> */}
                        </>
                        <>
                            {formData.services.map(service => (
                                <>
                                    {/* <Collapse in={openStates[service.type]}> */}
                                    <Collapse in={openService === service.type}>

                                        <div id={service.type}
                                            className={`service-section-${service.type.toLowerCase().replace(" ", "-")} `}>
                                            {/* {renderCustomOptions(service.type, service.customOptions.serviceLevel)} */}
                                            {renderCustomOptions(service.type, service.serviceLevel)}
                                        </div>
                                    </Collapse>
                                </>
                            ))}
                        </>
                        {/* ) */}
                        {/* } */}
                        {/* <Row>                                
                                <Col md>
                                    <div className="text-center">
                                        <h4>Products coming soon!</h4>
                                    </div>
                                </Col>
                            </Row> */}
                        {/* disable price display in the initial release */}
                        {/* <Row>
                                <Col >
                                    <FormGroup>
                                        <Label>Subtotal</Label>
                                        <Input
                                            type="text"
                                            value={`$${subtotalCost.toFixed(2)}`}
                                            readOnly
                                        />
                                    </FormGroup>
                                </Col>
                                <Col >
                                    <FormGroup>
                                        <Label>Tax</Label>
                                        <Input
                                            type="currency"
                                            value={`$${tax.toFixed(2)}`}
                                            readOnly
                                        />
                                    </FormGroup>
                                </Col>
                                <Col >
                                    <FormGroup>
                                        <Label>Grand Total</Label>
                                        <Input
                                            type="currency"
                                            value={`$${grandTotal.toFixed(2)}`}
                                            readOnly
                                        />
                                    </FormGroup>
                                </Col>
                            </Row> */}

                        <Row className=''>
                            <Col md='3' xs='10'>
                                <Form.Group className="mb-3">
                                    <Form.Label className='text-bold'>Promo Code</Form.Label>
                                    <FaQuestionCircle id="Tooltip10" onClick={() => togglePopover('promoCode')} />
                                    <Popover placement="right" isOpen={popoverOpen.promoCode} target="Tooltip10" toggle={() => togglePopover('promoCode')}>
                                        <PopoverBody>Enter your promo code. Discount will be reflected on the quote if eligible. Promos cannot be combined.</PopoverBody>
                                    </Popover>
                                    <Form.Control
                                        type="text"
                                        id="promoCode"
                                        placeholder="Promo Code"
                                        className='text-cleanar-color text-bold form-input'
                                        name="promoCode"
                                        value={formData.promoCode}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                            </Col>
                        </Row>
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
                            </Col>
                        </Row>
                    </Form>
                </Container>
            </div>
            {/* <Footer /> */}
        </>
    );
};

export default RequestQuote;
