import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
// import { ButtonGroup, ToggleButton } from 'react-bootstrap';
import html2pdf from 'html2pdf.js';
import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";
import Auth from "../../utils/auth";
import VisitorCounter from "components/Pages/VisitorCounter.js";
import { FaQuestionCircle } from 'react-icons/fa';

const RequestQuote = () => {
    // const [selectedOptions, setSelectedOptions] = useState([]);
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        userId: '',
        description: '',
        companyName: '',
        email: '',
        phonenumber: '',
        howDidYouHearAboutUs: '',
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
        unitSize: {
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
        squareFootage: {
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

        const tax = subtotalCost * 0.13;
        const grandTotal = subtotalCost + tax;

        // Update formData with calculated values
        setFormData(prevFormData => ({
            ...prevFormData,
            subtotalCost,
            tax,
            grandTotal
        }));

        initializeServices();
        prepopulateForm();
        document.body.classList.add("request-quote", "sidebar-collapse");
        document.documentElement.classList.remove("nav-open");
        // window.scrollTo(0, 0);

        return () => {
            document.body.classList.remove("request-quote", "sidebar-collapse");
        };
    }, [isLogged, formData.services]);

    const handleChange = (event) => {

        const { name, value } = event.target;
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

    const handleCustomOptionChange = (type, option, value, cost) => {
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
                                    [option]: { service: value, serviceCost: cost }  // Group service and serviceCost
                                }
                            }
                        )
                    }
                    : s
            )
        }));

        console.log(formData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form data:', formData);

        if (!formData.name || !formData.email || !formData.phonenumber || !formData.description || !formData.companyName || (!formData.services.length && !formData.products.length) || !formData.howDidYouHearAboutUs || !formData.subtotalCost || !formData.tax || !formData.grandTotal || !formData.address || !formData.city || !formData.province || !formData.postalcode) {
            alert('Please fill out all required fields');
            return;
        }

        try {
            const response = await fetch('/api/quotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify(formData)
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
                    howDidYouHearAboutUs: '',
                    subtotalCost: 0,
                    tax: 0,
                    grandTotal: 0,
                    services: [],
                    products: [],
                    // serviceLevel: '' // Reset service level
                });


                if (window.confirm('Would you like to download the quote as a PDF?')) {
                    const element = document.getElementById('quote-form');
                    const opt = {
                        margin: 0.5,
                        filename: 'quote.pdf',
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2 },
                        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                    };
                    html2pdf().set(opt).from(element).save();
                }

                const quoteResponse = await response.json();
                // if (sendEmail) {
                const emailResponse = await fetch('/api/email/quote', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify({ email: formData.email, quote: quoteResponse })
                });

                if (emailResponse.ok) {
                    alert('Email sent successfully!');
                } else {
                    alert('Error sending email');
                }
                // }
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
                    alert('Email notification sent successfully!');
                }
                else {
                    alert('Error sending email notification');
                }
                navigate('/index');
            }
        } catch (error) {
            console.error('Error submitting quote:', error);
        }
    };

    const subtotalCost = formData.services.reduce((total, service) => {
        // Sum up all the costs of the services' custom options
        const serviceCost = Object.values(service.customOptions || {}).reduce((sum, option) => {
            if (option.service) {
                return sum + option.serviceCost;
            }
            return sum;
        }, 0);
        return total + serviceCost;
    }, 0);
    const tax = subtotalCost * 0.13;
    const grandTotal = subtotalCost + tax;


    const renderCustomOptions = (type, serviceLevel) => {
        switch (type) {
            case 'Residential':
                return (
                    // <Tab>
                    <>
                        <Row className='g-2 px-1'>
                            <Col md='4' xs='12'>
                                <FloatingLabel controlId={`floatingServiceLevel${type}`} label="Select Service Level..." className=''>
                                    <Form.Select aria-label="Service level" name="serviceLevel" className="transparent" onChange={(e) => handleCustomOptionChange(type, 'serviceLevel', e.target.value)} >
                                        <option value="">Select Service Level...</option>
                                        <option value="Basic Cleaning">Basic Cleaning</option>
                                        <option value="Deep Cleaning">Deep Cleaning</option>
                                        <option value="Special Deal">Special Deal</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col md='4' xs='12'>

                                <FloatingLabel controlId="floatingUnitSize" label="Unit Size" >
                                    <Form.Select aria-label="Unit Size" className="transparent" onChange={(e) => handleCustomOptionChange(type, 'unitSize', e.target.value, pricing.unitSize[e.target.value])}>
                                        <option value="">Select Unit Size...</option>
                                        <option value="0-499 sqft">0-499 sqft</option>
                                        <option value="500-999 sqft">500-999 sqft</option>
                                        <option value="1000-1499 sqft">1000-1499 sqft</option>
                                        <option value="1500-1999 sqft">1500-1999 sqft</option>
                                        <option value="2000+ sqft">2000+ sqft</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col md='4' xs='12'>
                                <FloatingLabel controlId="floatingBedrooms" label="Number of Bedrooms">
                                    <Form.Control type="number" min="0" className='text-cleanar-color' onChange={(e) => handleCustomOptionChange(type, 'bedrooms', e.target.value, pricing.bedrooms[e.target.value])}
                                    // disabled={formData.serviceLevel === 'Deep Cleaning'}
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col md='4' xs='12'>
                                <FloatingLabel controlId="floatingBathrooms" label="Number of Bathrooms">
                                    <Form.Control type="number" min="0" className='text-cleanar-color' onChange={(e) => handleCustomOptionChange(type, 'bathrooms', e.target.value, pricing.bathrooms[e.target.value])}
                                    // disabled={formData.serviceLevel === 'Deep Cleaning'}
                                    />
                                </FloatingLabel>
                            </Col>
                        </Row>
                        {serviceLevel !== "" ? (

                            <Row className='g-2 px-1'>
                                <Col md='4' xs='12'>
                                    <FormGroup check>
                                        {services
                                            .filter(service => service.serviceLevel === serviceLevel)
                                            .map((service, index) => {
                                                return (<>
                                                    {service.isResidential ? (
                                                        <Label check>
                                                            <Input
                                                                type="checkbox"
                                                                onChange={(e) => handleCustomOptionChange(type, service.name, e.target.checked, service.serviceCost)}
                                                            // disabled={formData.serviceLevel !== service.serviceLevel}
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
                        ) : null}
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
                            <Col md='4' xs='12'>
                                <FloatingLabel controlId={`floatingServiceLevel${type}`} label="Select Service Level...">
                                    <Form.Select aria-label="Service level" className='transparent' name="serviceLevel" onChange={(e) => handleCustomOptionChange(type, 'serviceLevel', e.target.value)} >
                                        <option value="">Select Service Level...</option>
                                        <option value="Basic Cleaning">Basic Cleaning</option>
                                        <option value="Deep Cleaning">Deep Cleaning</option>
                                        <option value="Special Deal">Special Deal</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col md='4' xs='12'>
                                <FloatingLabel controlId="floatingSquareFootage" label="Square Footage" className=''>
                                    <Form.Select aria-label="Square Footage" className='transparent' onChange={(e) => handleCustomOptionChange(type, 'squareFootage', e.target.value, pricing.squareFootage[e.target.value])}

                                    >
                                        <option value="">Select Square Footage...</option>
                                        <option value="0-999 sqft">0-999 sqft</option>
                                        <option value="1000-4999 sqft">1000-4999 sqft</option>
                                        <option value="5000-9999 sqft">5000-9999 sqft</option>
                                        <option value="10000+ sqft">10000+ sqft</option>
                                    </Form.Select>
                                </FloatingLabel>
                                {/* <FormGroup>
                                    <Label>Square Footage</Label>
                                    <Input type="select"  onChange={(e) => handleCustomOptionChange(type, 'squareFootage', e.target.value, pricing.squareFootage[e.target.value])}
                                    // disabled={formData.serviceLevel === 'Deep Cleaning'}
                                    >
                                        <option value="">Select Square Footage...</option>
                                        <option value="0-999 sqft">0-999 sqft</option>
                                        <option value="1000-4999 sqft">1000-4999 sqft</option>
                                        <option value="5000-9999 sqft">5000-9999 sqft</option>
                                        <option value="10000+ sqft">10000+ sqft</option>
                                    </Input>
                                </FormGroup> */}
                            </Col>
                            <Col md='4' xs='12'>
                                <FloatingLabel controlId="floatingRooms" label="Number of Rooms" className=''>
                                    <Form.Select aria-label="Number of Rooms" className='transparent' onChange={(e) => handleCustomOptionChange(type, 'rooms', e.target.value, pricing.rooms[e.target.value])}>
                                        <option value="">Select Number of Rooms...</option>
                                        <option value="0">0</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
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
                        <Row className='g-2 px-1'>
                            <Col md='4' xs='12'>
                                <FormGroup check>
                                    {services
                                        .filter(service => service.serviceLevel === serviceLevel)
                                        .map((service, index) => {
                                            return (<>
                                                {service.isCommercial ? (
                                                    <Label check>
                                                        <Input
                                                            type="checkbox"
                                                            onChange={(e) => handleCustomOptionChange(type, service.name, e.target.checked, service.serviceCost)}
                                                        // disabled={formData.serviceLevel === 'Deep Cleaning'}
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
            case 'Industrial':
                return (
                    <> <Row className='g-2 px-1'>
                        <Col md='4' xs='12'>
                            <FloatingLabel controlId={`floatingServiceLevel${type}`} label="Select Service Level...">
                                <Form.Select aria-label="Service level" className='transparent' name="serviceLevel" onChange={(e) => handleCustomOptionChange(type, 'serviceLevel', e.target.value)} >
                                    <option value="">Select Service Level...</option>
                                    <option value="Basic Cleaning">Basic Cleaning</option>
                                    <option value="Deep Cleaning">Deep Cleaning</option>
                                    <option value="Special Deal">Special Deal</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                        <Col md='4' xs='12'>
                            <FloatingLabel controlId="floatingSquareFootage" label="Square Footage" className=''>
                                <Form.Select aria-label="Square Footage" className='transparent' onChange={(e) => handleCustomOptionChange(type, 'squareFootage', e.target.value, pricing.squareFootage[e.target.value])}>
                                    <option value="">Select Square Footage...</option>
                                    <option value="0-999 sqft">0-999 sqft</option>
                                    <option value="1000-4999 sqft">1000-4999 sqft</option>
                                    <option value="5000-9999 sqft">5000-9999 sqft</option>
                                    <option value="10000+ sqft">10000+ sqft</option>
                                </Form.Select>
                            </FloatingLabel>
                            {/* <FormGroup>
                                <Label>Square Footage</Label>
                                <Input type="select" onChange={(e) => handleCustomOptionChange(type, 'squareFootage', e.target.value, pricing.squareFootage[e.target.value])}
                                    disabled={formData.serviceLevel === 'Deep Cleaning'}
                                >
                                    <option value="">Select Square Footage...</option>
                                    <option value="0-999 sqft">0-999 sqft</option>
                                    <option value="1000-4999 sqft">1000-4999 sqft</option>
                                    <option value="5000-9999 sqft">5000-9999 sqft</option>
                                    <option value="10000+ sqft">10000+ sqft</option>
                                </Input>
                            </FormGroup> */}
                        </Col>
                        <Col md='4' xs='12'>
                            <FloatingLabel controlId="floatingEmployees" label="Number of Employees" className=''>
                                <Form.Select aria-label="Number of Employees" className='transparent' onChange={(e) => handleCustomOptionChange(type, 'employees', e.target.value, pricing.employees[e.target.value])}>
                                    <option value="">Select Number of Employees...</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </Form.Select>
                            </FloatingLabel>
                            {/* <FormGroup>
                                <Label>Number of Employees</Label>
                                <Input type="number" min="0" onChange={(e) => handleCustomOptionChange(type, 'employees', e.target.value, pricing.employees[e.target.value])}
                                    disabled={formData.serviceLevel === 'Deep Cleaning'}
                                />
                            </FormGroup> */}
                        </Col>
                    </Row>
                        <Row className='g-2 px-1'>
                            <Col md='4' xs='12'>
                                <FormGroup check>
                                    {services
                                        .filter(service => service.serviceLevel === serviceLevel)
                                        .map((service, index) => {
                                            return (<>
                                                {service.isIndustrial ? (
                                                    <Label check>
                                                        <Input
                                                            type="checkbox"
                                                            onChange={(e) => handleCustomOptionChange(type, service.name, e.target.checked, service.serviceCost)}
                                                        // disabled={formData.serviceLevel === 'Deep Cleaning'}
                                                        />
                                                        <span className="form-check-sign"></span>
                                                        {service.name} - ${service.serviceCost}
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
            default:
                return null;
        }
    };

    return (
        <>
            <Navbar />
            <div className="section light-bg-color pb-0 mb-0">
                <VisitorCounter page={"request-quote"} />
                <div className="content">
                    <Container>
                        <h2 className="text-center">Request a Quote</h2>
                        <Form onSubmit={handleSubmit} id="quote-form">
                            <Row className='g-2'>
                                <Col md='3' xs='11'>
                                    <Form.Floating className="mb-3">
                                        <Form.Control
                                            type="text"
                                            id=" floatingFullName"
                                            placeholder="Full Name"
                                            className='text-cleanar-color text-bold'
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="floatingFullName" className='text-bold'>Full Name</label>
                                    </Form.Floating>
                                </Col>
                                <Col md='1' xs='1'>
                                    <Button id="Tooltip1" type="button" 
                                    // color="link"                                    
                                     onClick={() => togglePopover('name')} className='primary-bg-color btn-round btn-icon'><FaQuestionCircle /></Button>
                                    <Popover placement="right" isOpen={popoverOpen.name} target="Tooltip1" toggle={() => togglePopover('name')}>
                                        <PopoverBody>Enter your full name.</PopoverBody>
                                    </Popover>
                                </Col>
                                <Col md='3' xs='11'>
                                    <Form.Floating className="mb-3">
                                        <Form.Control
                                            type="text"
                                            id="floatingEmail"
                                            placeholder="Email"
                                            className='text-cleanar-color text-bold'
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="floatingEmail" className='text-bold'>Email</label>
                                    </Form.Floating>
                                </Col>
                                <Col md='1' xs='1'>
                                    <Button id="Tooltip2" type="button" 
                                    // color="link"
                                     onClick={() => togglePopover('email')} className='primary-bg-color btn-round btn-icon'><FaQuestionCircle /></Button>
                                    <Popover placement="right" isOpen={popoverOpen.email} target="Tooltip2" toggle={() => togglePopover('email')}>
                                        <PopoverBody>Enter your email address.</PopoverBody>
                                    </Popover>
                                </Col>
                                <Col md='3' xs='11'>
                                    <Form.Floating className="mb-3">
                                        <Form.Control
                                            type="text"
                                            id="floatingPhoneNumber"
                                            placeholder="Phone Number"
                                            className='text-cleanar-color text-bold'
                                            name="phonenumber"
                                            value={formData.phonenumber}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="floatingPhoneNumber" className='text-bold'>Phone Number</label>
                                    </Form.Floating>
                                </Col>
                                <Col md='1' xs='1'>
                                    <Button id="Tooltip3" type="button"  onClick={() => togglePopover('phonenumber')} className='primary-bg-color btn-round btn-icon'><FaQuestionCircle /></Button>
                                    <Popover placement="right" isOpen={popoverOpen.phonenumber} target="Tooltip3" toggle={() => togglePopover('phonenumber')}>
                                        <PopoverBody>Enter your phone number.</PopoverBody>
                                    </Popover>
                                </Col>
                            </Row>
                            <Row className='g-2'>
                                <Col md='3' xs='11'>
                                    <Form.Floating className="mb-3">
                                        <Form.Control
                                            type="text"
                                            id="floatingAddress"
                                            placeholder="Address"
                                            className='text-cleanar-color text-bold'
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="floatingAddress" className='text-bold'>Address</label>
                                    </Form.Floating>
                                </Col>
                                <Col md='1' xs='1'>
                                    <Button id="Tooltip4" type="button" onClick={() => togglePopover('address')} className='primary-bg-color btn-round btn-icon'><FaQuestionCircle /></Button>
                                    <Popover placement="right" isOpen={popoverOpen.address} target="Tooltip4" toggle={() => togglePopover('address')}>
                                        <PopoverBody>Enter your address.</PopoverBody>
                                    </Popover>
                                </Col>
                                <Col md='3' xs='11'>
                                    <Form.Floating className="mb-3">
                                        <Form.Control
                                            type="text"
                                            id="floatingCity"
                                            placeholder="City"
                                            className='text-cleanar-color text-bold'
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="floatingCity" className='text-bold'>City</label>
                                    </Form.Floating>
                                </Col>
                                <Col md='1' xs='1'>
                                    <Button id="Tooltip5" type="button" onClick={() => togglePopover('city')} className='primary-bg-color btn-round btn-icon'><FaQuestionCircle /></Button>
                                    <Popover placement="right" isOpen={popoverOpen.city} target="Tooltip5" toggle={() => togglePopover('city')}>
                                        <PopoverBody>Enter your city.</PopoverBody>
                                    </Popover>
                                </Col>
                                <Col md='3' xs='11'>
                                    <Form.Floating className="mb-3">
                                        <Form.Control
                                            type="text"
                                            id="floatingProvince"
                                            placeholder="Province"
                                            className='text-cleanar-color text-bold'
                                            name="province"
                                            value={formData.province}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="floatingState" className='text-bold'>Province</label>
                                    </Form.Floating>
                                </Col>
                                <Col md='1' xs='1'>
                                    <Button id="Tooltip6" type="button"  onClick={() => togglePopover('province')} className='primary-bg-color btn-round btn-icon'><FaQuestionCircle /></Button>
                                    <Popover placement="right" isOpen={popoverOpen.province} target="Tooltip6" toggle={() => togglePopover('province')}>
                                        <PopoverBody>Enter your province.</PopoverBody>
                                    </Popover>
                                </Col>
                            </Row>
                            <Row className='g-2'>
                                <Col md='3' xs='11' >
                                    <Form.Floating className="mb-3 ">
                                        <Form.Control
                                            type="text"
                                            id="floatingPostalCode"
                                            placeholder="Postal Code"
                                            className='text-cleanar-color text-bold'
                                            name="postalcode"
                                            value={formData.postalcode}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="floatingPostalCode" className='text-bold'>Postal Code</label>
                                    </Form.Floating>
                                </Col>
                                <Col md='1' xs='1'>
                                    <Button id="Tooltip7" type="button" onClick={() => togglePopover('postalcode')} className='primary-bg-color btn-round btn-icon'><FaQuestionCircle /></Button>
                                    <Popover placement="right" isOpen={popoverOpen.postalcode} target="Tooltip7" toggle={() => togglePopover('postalcode')}>
                                        <PopoverBody>Enter your postal code.</PopoverBody>
                                    </Popover>
                                </Col>
                                <Col md='3' xs='11'>
                                    <Form.Floating className="mb-3">
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
                                    </Form.Floating>
                                </Col>
                                <Col md='1' xs='1'>
                                    <Button id="Tooltip8" type="button" onClick={() => togglePopover('companyName')} className='primary-bg-color btn-round btn-icon'><FaQuestionCircle /></Button>
                                    <Popover placement="right" isOpen={popoverOpen.companyName} target="Tooltip8" toggle={() => togglePopover('companyName')}>
                                        <PopoverBody>Enter your company name.</PopoverBody>
                                    </Popover>
                                </Col>
                                <Col md='3' xs='11' className=''>
                                    <FloatingLabel controlId="floatingHowDidYouHear" label="How Did You Hear About Us..." className='text-bold'>
                                        <Form.Select aria-label="How Did You Hear About Us" value={formData.howDidYouHearAboutUs}
                                            name='howDidYouHearAboutUs' onChange={handleChange} className='transparent no-border text-cleanar-color text-bold'>
                                            <option value="">How Did You Hear About Us?...</option>
                                            <option value="Google">Google</option>
                                            <option value="Facebook">Facebook</option>
                                            <option value="Instagram">Instagram</option>
                                            <option value="Referral">Referral</option>
                                            <option value="Other">Other</option>
                                        </Form.Select>
                                    </FloatingLabel>
                                </Col>
                                <Col md='1' xs='1'>
                                    <Button id="Tooltip9" type="button"  onClick={() => togglePopover('howDidYouHearAboutUs')} className='primary-bg-color btn-round btn-icon'><FaQuestionCircle /></Button>
                                    <Popover placement="right" isOpen={popoverOpen.howDidYouHearAboutUs} target="Tooltip9" toggle={() => togglePopover('howDidYouHearAboutUs')}>
                                        <PopoverBody>How did you hear about us?</PopoverBody>
                                    </Popover>
                                </Col>

                            </Row>
                            <FormGroup>
                                <Label className='text-bold'>Description</Label>
                            {/* <Row>
                                <Col md='3' xs='3'>
                                </Col>
                            <Col md='1' xs='1'>
                                    <Button id="Tooltip10" type="button" color="link" onClick={() => togglePopover('description')} className='text-cleanar-color'><FaQuestionCircle /></Button> 
                                    <Popover placement="right" isOpen={popoverOpen.description} target="Tooltip10" toggle={() => togglePopover('description')}>
                                        <PopoverBody>Enter a brief description of the services you are looking for.</PopoverBody>
                                    </Popover>
                                </Col>
                                </Row> */}
                                <Input
                                    type="textarea"
                                    name="description"
                                    placeholder='Please provide a brief description of the services you are looking for, including any specific requirements or details.'
                                    value={formData.description}
                                    onChange={handleChange}
                                    className='text-cleanar-color text-bold'
                                />
                                
                            </FormGroup>
                            <Row>
                                <Col md='12' xs='12'>
                                    <Label className='text-cleanar-color text-bold'>Add Services: </Label>
                                    <Button className='service-button-residential' variant="" onClick={() => handleAddService({ target: { value: "Residential" } })} value="Residential">Residential</Button>{' '}
                                    <Button className='service-button-commercial' onClick={() => handleAddService({ target: { value: "Commercial" } })} value="Commercial">Commercial</Button>{' '}
                                    <Button className='service-button-industrial' onClick={() => handleAddService({ target: { value: "Industrial" } })} value="Industrial">Industrial/Specialized</Button>
                                    <Button id="Tooltip11" type="button" onClick={() => togglePopover('services')} className='primary-bg-color btn-round btn-icon'><FaQuestionCircle /></Button>
                                    <Popover placement="right" isOpen={popoverOpen.services} target="Tooltip11" toggle={() => togglePopover('services')}>
                                        <PopoverBody>Select the service type you are interested in.</PopoverBody>
                                    </Popover>
                                </Col>
                                {/* <Col md='1' xs='1'>
                                </Col>                                 */}
                            </Row>
                            {(formData.services.length === 0) ? (
                                <div className="text-center">
                                    <h4>Please add service type and level to customize your order</h4>
                                </div>
                            ) : (
                                <>
                                    {formData.services.map(service => (
                                        <>

                                            <Button
                                                onClick={() => handleToggle(service.type)}
                                                aria-controls={service.type}
                                                // aria-expanded={openStates[service.type]}
                                                aria-expanded={openService === service.type}
                                                className={`service-button-${service.type.toLowerCase()}`}
                                            >{service.type}
                                            </Button>
                                            {/* <Button id="Tooltip12" type="button" color="link" onClick={() => togglePopover(service.type)} className='text-cleanar-color'><FaQuestionCircle /></Button>
                                            <Popover placement="right" isOpen={popoverOpen[service.type]} target="Tooltip12" toggle={() => togglePopover(service.type)}>
                                                <PopoverBody>Click to expand and customize your {service.type} service.</PopoverBody>
                                            </Popover> */}
                                        </>
                                    ))}
                                </>
                            )
                            }
                            {(formData.services.length === 0) ? null : (
                                <>
                                    {formData.services.map(service => (
                                        <>
                                            {/* <Collapse in={openStates[service.type]}> */}
                                            <Collapse in={openService === service.type}>

                                                <div id={service.type} className={`service-section-${service.type.toLowerCase()} rounded`}>
                                                    {/* {renderCustomOptions(service.type, service.customOptions.serviceLevel)} */}
                                                    {renderCustomOptions(service.type, service.serviceLevel)}
                                                </div>
                                            </Collapse>
                                        </>
                                    ))}
                                </>
                            )
                            }
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
                            
                            
                            <Row>
                                <Col>
                                    <p className='text-cleanar-color text-bold'>
                                        A confirmation email will be sent to you upon submission.
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
            </div>
            <Footer />
        </>
    );
};

export default RequestQuote;
