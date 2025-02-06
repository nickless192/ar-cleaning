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
        // const initializeServices = async () => {
        //     try {
        //         const serviceResponse = await fetch(`/api/services`);
        //         const productResponse = await fetch(`/api/products`);

        //         if (serviceResponse.ok) {
        //             const serviceData = await serviceResponse.json();
        //             setServices(serviceData.map(item => ({
        //                 name: item.name,
        //                 id: item._id,
        //                 serviceCost: item.serviceCost,
        //                 isResidential: item.isResidential,
        //                 isCommercial: item.isCommercial,
        //                 isIndustrial: item.isIndustrial,
        //                 serviceLevel: item.serviceLevel
        //             })));
        //         }

        //         if (productResponse.ok) {
        //             const productData = await productResponse.json();
        //             setProducts(productData.map(item => ({
        //                 name: item.name,
        //                 id: item._id,
        //                 productCost: item.productCost
        //             })));
        //         }
        //     } catch (error) {
        //         console.error('Error fetching services or products:', error);
        //     }

        //     console.log(services);
        // };

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

        setFormData(prevFormData => {
            const service = {
                type: serviceType,
                serviceLevel: '',
                customOptions: {}
            };
            return {
                ...prevFormData,
                services: [service]
                
            };
        });
        console.log('services:', formData.services);

        const optionValue = e.target.value;
        setOptions(serviceOptions[optionValue] || []);


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
        console.log('option:', option);
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
        // switch (type) {
        //     case 'residential':
        //         return (
        //             // <Tab>
        //             <>
        //                 <Row className='g-2 px-1'>
        //                     <Col md='2' xs='6'>
        //                         <FloatingLabel controlId={`floatingServiceLevel${type}`} label="Select Service Level...*" className=''>
        //                             <Form.Select aria-label="Service level" name="serviceLevel" className="transparent" onChange={(e) => handleCustomOptionChange(type, 'serviceLevel', e)} >
        //                                 <option value="">Service Level...*</option>
        //                                 <option value="Basic Cleaning">Basic Cleaning</option>
        //                                 <option value="Deep Cleaning">Deep Cleaning</option>
        //                             </Form.Select>
        //                         </FloatingLabel>
        //                     </Col>
        //                     <Col md='2' xs='6'>
        //                         <FloatingLabel controlId="floatingUnitSize" label="Unit Size" >
        //                             <Form.Select aria-label="Unit Size" className="transparent" onChange={(e) => handleCustomOptionChange(type, 'squareFootage', e, pricing.squareFootage[e.target.value], e.target.getAttribute('aria-label'))}>
        //                                 <option value="">Unit Size...</option>
        //                                 <option value="0-499 sqft">0-499 sqft</option>
        //                                 <option value="500-999 sqft">500-999 sqft</option>
        //                                 <option value="1000-1499 sqft">1000-1499 sqft</option>
        //                                 <option value="1500-1999 sqft">1500-1999 sqft</option>
        //                                 <option value="2000+ sqft">2000+ sqft</option>
        //                             </Form.Select>
        //                         </FloatingLabel>
        //                     </Col>
        //                     <Col md='2' xs='6'>
        //                         <FloatingLabel controlId="floatingBedrooms" label="Number of Bedrooms">
        //                             <Form.Select aria-label="Number of Bedrooms" className="transparent" onChange={(e) => handleCustomOptionChange(type, 'bedrooms', e, pricing.bedrooms[e.target.value], e.target.getAttribute('aria-label'))}>
        //                                 <option value="">Number of Bedrooms...</option>
        //                                 <option value="0">0</option>
        //                                 <option value="1">1</option>
        //                                 <option value="2">2</option>
        //                                 <option value="3">3</option>
        //                                 <option value="4">4</option>
        //                                 <option value="5">5+</option>
        //                             </Form.Select>
        //                         </FloatingLabel>
        //                     </Col>
        //                     <Col md='2' xs='6'>
        //                         <FloatingLabel controlId="floatingBathrooms" label="Number of Bathrooms">
        //                             <Form.Select aria-label="Number of Bathrooms" className="transparent" onChange={(e) => handleCustomOptionChange(type, 'bathrooms', e, pricing.bathrooms[e.target.value], e.target.getAttribute('aria-label'))}>
        //                                 <option value="">Number of Bathrooms...</option>
        //                                 <option value="0">0</option>
        //                                 <option value="1">1</option>
        //                                 <option value="2">2</option>
        //                                 <option value="3">3</option>
        //                                 <option value="4">4</option>
        //                                 <option value="5">5+</option>
        //                             </Form.Select>
        //                             {/* <Form.Control aria-label='Number of Bathrooms' type="number" min="0" className='text-cleanar-color' onChange={(e) => handleCustomOptionChange(type, 'bathrooms', e.target.value, pricing.bathrooms[e.target.value], e.target.getAttribute('aria-label'))}
        //                             // disabled={formData.serviceLevel === 'Deep Cleaning'}
        //                             /> */}
        //                         </FloatingLabel>
        //                     </Col>
        //                 </Row>
        //                 <Row className='g-2 px-2'>
        //                     <Col className='py-1' md='3' xs='12'>
        //                         <p className='text-bold'>Customize your service</p>
        //                         <FormGroup check>
        //                             {services
        //                                 .filter(service => service.serviceLevel === serviceLevel)
        //                                 .map((service, index) => {
        //                                     return (<>
        //                                         {service.isResidential ? (
        //                                             <Label check>
        //                                                 <Input
        //                                                     type="checkbox"
        //                                                     onChange={(e) => handleCustomOptionChange(type, service.name, e, service.serviceCost, "")}
        //                                                 // disabled={formData.serviceLevel !== service.serviceLevel}
        //                                                 />
        //                                                 <span className="form-check-sign"></span>
        //                                                 {service.name} - {service.description}
        //                                             </Label>
        //                                         ) : null}
        //                                     </>)
        //                                 })}
        //                         </FormGroup>
        //                     </Col>
        //                 </Row>

        //                 <Row className='g-2 px-1'>
        //                     <Col md>
        //                         <Button onClick={() => handleRemoveService(type)} className='btn-danger' >Remove</Button>
        //                     </Col>
        //                 </Row>
        //                 {/* </Tab> */}
        //             </>
        //         );
        //     case 'commercial':
        //         return (
        //             <>
        //                 <Row className='g-2 px-1'>
        //                     <Col md='3' xs='6'>
        //                         <FloatingLabel controlId={`floatingServiceLevel${type}`} label="Select Service Level...*">
        //                             <Form.Select aria-label="Service level" className='transparent' name="serviceLevel" onChange={(e) => handleCustomOptionChange(type, 'serviceLevel', e)} >
        //                                 <option value="">Service Level...*</option>
        //                                 <option value="Basic Cleaning">Basic Cleaning</option>
        //                                 <option value="Deep Cleaning">Deep Cleaning</option>
        //                                 <option value="Special Deal">Special Deal</option>
        //                             </Form.Select>
        //                         </FloatingLabel>
        //                     </Col>
        //                     <Col md='3' xs='6'>
        //                         <FloatingLabel controlId="floatingSquareFootage" label="Square Footage" className=''>
        //                             <Form.Select aria-label="Square Footage" className='transparent' onChange={(e) => handleCustomOptionChange(type, 'squareFootage', e, pricing.squareFootageCommercial[e.target.value], e.target.getAttribute('aria-label'))}
        //                             >
        //                                 <option value="">Square Footage...</option>
        //                                 <option value="0-999 sqft">0-999 sqft</option>
        //                                 <option value="1000-4999 sqft">1000-4999 sqft</option>
        //                                 <option value="5000-9999 sqft">5000-9999 sqft</option>
        //                                 <option value="10000+ sqft">10000+ sqft</option>
        //                             </Form.Select>
        //                         </FloatingLabel>
        //                     </Col>
        //                     <Col md='3' xs='6'>
        //                         <FloatingLabel controlId="floatingRooms" label="Number of Rooms" className=''>
        //                             <Form.Select aria-label="Number of Rooms" className='transparent' onChange={(e) => handleCustomOptionChange(type, 'rooms', e, pricing.rooms[e.target.value], e.target.getAttribute('aria-label'))}>
        //                                 <option value="">Number of Rooms...</option>
        //                                 <option value="0">0</option>
        //                                 <option value="1">1</option>
        //                                 <option value="2">2</option>
        //                                 <option value="3">3</option>
        //                                 <option value="4">4</option>
        //                                 <option value="5">5+</option>
        //                             </Form.Select>
        //                         </FloatingLabel>
        //                         {/* <FormGroup>
        //                             <Label>Number of Rooms</Label>
        //                             <Input type="number" min="0" onChange={(e) => handleCustomOptionChange(type, 'rooms', e.target.value, pricing.rooms[e.target.value])}
        //                             // disabled={formData.serviceLevel === 'Deep Cleaning'}
        //                             />
        //                         </FormGroup> */}
        //                     </Col>
        //                 </Row>
        //                 <Row className='g-2 px-2'>
        //                     <Col className='py-1' md='3' xs='12'>
        //                         <p className='text-bold'>Customize your service</p>
        //                         <FormGroup check>
        //                             {services
        //                                 .filter(service => service.serviceLevel === serviceLevel)
        //                                 .map((service, index) => {
        //                                     return (<>
        //                                         {service.isCommercial ? (
        //                                             <Label check>
        //                                                 <Input
        //                                                     type="checkbox"
        //                                                     onChange={(e) => handleCustomOptionChange(type, service.name, e, service.serviceCost, "")}
        //                                                 // disabled={formData.serviceLevel === 'Deep Cleaning'}
        //                                                 />
        //                                                 <span className="form-check-sign"></span>
        //                                                 {service.name} - {service.description}
        //                                             </Label>
        //                                         ) : null}
        //                                     </>)
        //                                 })}
        //                         </FormGroup>
        //                     </Col>
        //                 </Row>
        //                 <Row className='g-2 px-1'>
        //                     <Col md>
        //                         <Button onClick={() => handleRemoveService(type)} className='btn-danger'>Remove</Button>
        //                     </Col>
        //                 </Row>
        //             </>
        //         );
        //     case 'specialevents':
        //         return (
        //             <> <Row className='g-2 px-1'>
        //                 <Col md='3' xs='6'>
        //                     <FloatingLabel controlId={`floatingServiceLevel${type}`} label="Select Service Level...*">
        //                         <Form.Select aria-label="Service level" className='transparent' name="serviceLevel" onChange={(e) => handleCustomOptionChange(type, 'serviceLevel', e)} >
        //                             <option value="">Select Service Level...*</option>
        //                             <option value="Basic Cleaning">Basic Cleaning</option>
        //                             <option value="Deep Cleaning">Deep Cleaning</option>
        //                             <option value="Special Deal">Special Deal</option>
        //                         </Form.Select>
        //                     </FloatingLabel>
        //                 </Col>
        //                 <Col md='3' xs='6'>
        //                     <FloatingLabel controlId="floatingSquareFootage" label="Square Footage" className=''>
        //                         <Form.Select aria-label="Square Footage" className='transparent' onChange={(e) => handleCustomOptionChange(type, 'squareFootage', e, pricing.squareFootage[e.target.value], e.target.getAttribute('aria-label'))}>
        //                             <option value="">Select Square Footage...</option>
        //                             <option value="0-999 sqft">0-999 sqft</option>
        //                             <option value="1000-4999 sqft">1000-4999 sqft</option>
        //                             <option value="5000-9999 sqft">5000-9999 sqft</option>
        //                             <option value="10000+ sqft">10000+ sqft</option>
        //                         </Form.Select>
        //                     </FloatingLabel>
        //                 </Col>
        //                 <Col md='3' xs='6'>
        //                     <FloatingLabel controlId="floatingEmployees" label="Number of Employees" className=''>
        //                         <Form.Select aria-label="Number of Employees" className='transparent' onChange={(e) => handleCustomOptionChange(type, 'employees', e, pricing.employees[e.target.value], e.target.getAttribute('aria-label'))}>
        //                             <option value="">Select Number of Employees...</option>
        //                             <option value="0">0</option>
        //                             <option value="1">1</option>
        //                             <option value="2">2</option>
        //                             <option value="3">3</option>
        //                             <option value="4">4</option>
        //                             <option value="5">5</option>
        //                         </Form.Select>
        //                     </FloatingLabel>
        //                 </Col>
        //             </Row>
        //                 <Row className='g-2 px-2'>
        //                     <Col className='py-1' md='3' xs='12'>
        //                         <p className='text-bold'>Customize your service</p>
        //                         <FormGroup check>
        //                             {services
        //                                 .filter(service => service.serviceLevel === serviceLevel)
        //                                 .map((service, index) => {
        //                                     return (<>
        //                                         {service.isIndustrial ? (
        //                                             <Label check>
        //                                                 <Input
        //                                                     type="checkbox"
        //                                                     onChange={(e) => handleCustomOptionChange(type, service.name, e, service.serviceCost, "")}
        //                                                 // disabled={formData.serviceLevel === 'Deep Cleaning'}
        //                                                 />
        //                                                 <span className="form-check-sign"></span>
        //                                                 {service.name} - {service.description}
        //                                             </Label>
        //                                         ) : null}
        //                                     </>)
        //                                 })}
        //                             {/* <Label check>
        //                         <Input
        //                             type="checkbox"
        //                             onChange={(e) => handleCustomOptionChange(type, 'highDusting', e.target.checked)}
        //                             disabled={formData.serviceLevel === 'Deep Cleaning'}
        //                         />
        //                         <span className="form-check-sign"></span>
        //                         High Dusting
        //                     </Label> */}
        //                         </FormGroup>
        //                     </Col>
        //                 </Row>
        //                 <Row className='g-2 px-1'>
        //                     <Col md>
        //                         <Button onClick={() => handleRemoveService(type)} className='btn-danger'>Remove</Button>
        //                     </Col>
        //                 </Row>
        //             </>
        //         );
        //     default:
        //         return null;
        // }

        // const serviceOptions = {
        //     Residential: ["House Cleaning", "Carpet Cleaning", "Move-In/Out Cleaning", "Residential Building Cleaning"],
        //     Commercial: ["Office Cleaning", "Industrial Cleaning", "Retail Cleaning"],
        // };

        // create a switch based on the serviceOptions above
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
                            <Form.Select aria-label="Unit Size" className="transparent" onChange={(e) => handleCustomOptionChange(type, 'squareFootage', e, pricing.squareFootage[e.target.value], e.target.getAttribute('aria-label'))}>
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
                        {/* </Col>
                            <Col md='2' xs='6'> */}
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
                                value={formData.description}
                                onChange={handleChange}
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
                                placeholder='Include any specific requirements or details.'
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
                    <Row className=''>
                        <Col md='4' xs='3'>
                            <Form.Group className="mb-3">
                                <Row>
                                    <Col>
                                        <Form.Label className='text-bold'>Name*</Form.Label> <FaQuestionCircle id="Tooltip1" tabIndex='-1'
                                            // color="link"    
                                            // className='primary-bg-color'                                 
                                            onClick={() => togglePopover('name')} />
                                        <Popover placement="right" isOpen={popoverOpen.name} target="Tooltip1" toggle={() => togglePopover('name')}>
                                            <PopoverBody>Enter your full name.</PopoverBody>
                                        </Popover>
                                    </Col>
                                    <Col>
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

                                </Row>
                            </Form.Group>
                        </Col>
                        <Col md='4' xs='3'>
                            <Form.Group className="mb-3">
                                <Row>
                                    <Col>
                                        <Form.Label className='text-bold'>Email*</Form.Label> <FaQuestionCircle id="Tooltip2" onClick={() => togglePopover('email')} />
                                        <Popover placement="right" isOpen={popoverOpen.email} target="Tooltip2" toggle={() => togglePopover('email')}>
                                            <PopoverBody>Enter your email address.</PopoverBody>
                                        </Popover>
                                    </Col>
                                    <Col>
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
                                </Row>
                            </Form.Group>
                        </Col>
                        <Col md='4' xs='3'>
                            <Form.Group className="mb-3">
                                <Row>
                                    <Col>
                                        <Form.Label className='text-bold'>Phone No*</Form.Label><FaQuestionCircle id="Tooltip3" onClick={() => togglePopover('phonenumber')} />
                                        <Popover placement="right" isOpen={popoverOpen.phonenumber} target="Tooltip3" toggle={() => togglePopover('phonenumber')}>
                                            <PopoverBody>Enter your phone number.</PopoverBody>
                                        </Popover>
                                    </Col>
                                    <Col>
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
                        </Col>
                    </Row>
                    <Row>
                        <Col md='4' xs='3'>
                            <Form.Group className="mb-3">
                                <Row>
                                    <Col>
                                        <Form.Label className='text-bold'>Company</Form.Label>
                                        <FaQuestionCircle id="companyNameTooltip" onClick={() => togglePopover('companyName')} />
                                        <Popover placement="right" isOpen={popoverOpen.companyName} target="companyNameTooltip" toggle={() => togglePopover('companyName')}>
                                            <PopoverBody>Enter your company name.</PopoverBody>
                                        </Popover>

                                    </Col>
                                    <Col>

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
                                </Row>
                            </Form.Group>
                        </Col>
                        <Col md='4' xs='3' >
                            <Form.Group className="mb-3">
                                <Row>
                                    <Col>
                                        <Form.Label className='text-bold'>Postal Code*</Form.Label>
                                        <FaQuestionCircle id="Tooltip7" onClick={() => togglePopover('postalcode')} />
                                        <Popover placement="right" isOpen={popoverOpen.postalcode} target="Tooltip7" toggle={() => togglePopover('postalcode')}>
                                            <PopoverBody>Enter your postal code.</PopoverBody>
                                        </Popover>
                                    </Col>
                                    <Col>

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
                                </Row>
                            </Form.Group>
                        </Col>
                        <Col md='4' xs='3'>
                            <Form.Group className="mb-3">
                                <Row>
                                    <Col>

                                        <Form.Label className='text-bold'>Promo Code</Form.Label>
                                        <FaQuestionCircle id="Tooltip10" onClick={() => togglePopover('promoCode')} />
                                        <Popover placement="right" isOpen={popoverOpen.promoCode} target="Tooltip10" toggle={() => togglePopover('promoCode')}>
                                            <PopoverBody>Enter your promo code. Discount will be reflected on the quote if eligible. Promos cannot be combined.</PopoverBody>
                                        </Popover>
                                    </Col>
                                    <Col>

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

                        </Col>
                    </Row>
                    <Row>
                        <Col md='3' xs='3'>
                            <Label className='text-cleanar-color text-bold'>Add Service Required*: </Label>{' '}
                            <FaQuestionCircle id="Tooltip11" tabIndex='-1' onClick={() => togglePopover('services')} />
                            {/* <Button id="Tooltip11" type="button" tabIndex='-1' onClick={() => togglePopover('services')} className='primary-bg-color btn-round btn-icon'><FaQuestionCircle /></Button> */}
                            <Popover placement="right" isOpen={popoverOpen.services} target="Tooltip11" toggle={() => togglePopover('services')}>
                                <PopoverBody>Please add service type and level to customize your order</PopoverBody>
                            </Popover>
                            <div className="radio-group">
                                {Object.keys(serviceOptions).map((service) => (
                                    <label key={service} className="radio-label">
                                        <input
                                            type="radio"
                                            name="serviceType"
                                            value={service}
                                            checked={selectedService === service}
                                            onChange={() => handleServiceChange(service)}
                                        />
                                        {service}
                                    </label>
                                ))}
                            </div>
                        </Col>
                        <Col md='4' xs='6'>
                            {/* Options for Selected Service */}
                            {selectedService && (
                                <div className="options-selection">
                                    <label>Choose a Service:</label>
                                    <div className="radio-group">
                                        {options.map((option) => (
                                            <label key={option} className="radio-label">
                                                <input type="radio" name="serviceOption" key={option} value={option} onChange={handleAddService} />
                                                {option}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Col>
                        <Col md='4' xs='3'>
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
