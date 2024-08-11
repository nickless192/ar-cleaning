import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    // Button,
    // Row,
    // Col,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    FormGroup, Label,

} from 'reactstrap';
import {
    FloatingLabel,
    Container,
    Button,
    Form,
    Row,
    Card,
    Col,
    ButtonGroup,
    Tabs,
    Tab,
    Collapse,
    ToggleButton
} from 'react-bootstrap';
// import { ButtonGroup, ToggleButton } from 'react-bootstrap';
import html2pdf from 'html2pdf.js';
import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";
import Auth from "../../utils/auth";

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
    const [addedServices, setAddedServices] = useState([]);
    const [sendEmail, setSendEmail] = useState(false);
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
                    howDidYouHearAboutUs: data.howDidYouHearAboutUs,
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

    const handleChange = ({ target: { name, value } }) => {
        setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
    };

    // const handleToggle = (type) => {
    //     setOpenStates((prev) => ({
    //         ...prev,
    //         [type]: !prev[type],
    //     }));
    // };
    const handleToggle = (type) => {
        setOpenService((prev) => (prev === type ? null : type));
    };

    const toggleSelection = (type, item) => {
        setFormData(prevFormData => {
            const updatedItems = prevFormData[type].includes(item)
                ? prevFormData[type].filter(i => i !== item)
                : [...prevFormData[type], item];
            return { ...prevFormData, [type]: updatedItems };
        });
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
        // setAddedServices(addedServices.filter(s => s.type !== type));
        // setFormData(prevFormData => ({ ...prevFormData, services: addedServices }));
        setFormData(prevFormData => ({
            ...prevFormData,
            services: prevFormData.services.filter(s => s.type !== type)
        }));
    };

    const handleCustomOptionChange = (type, option, value, cost) => {
        // setAddedServices(addedServices.map(s => 
        //     s.type === type 
        //     ? { 
        //         ...s, 
        //         ...(option === "serviceLevel" 
        //             ? { [option]: value }  // Add serviceLevel directly to the top level
        //             : {
        //                 customOptions: { 
        //                     ...s.customOptions, 
        //                     [option]: { service: value, serviceCost: cost }  // Group service and serviceCost
        //                 }
        //             }
        //         )
        //     } 
        //     : s
        // ));
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

        // setFormData(prevFormData => ({ 
        //     ...prevFormData, 
        //     services: addedServices 
        // }));

        // console.log(addedServices);
        console.log(formData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form data:', formData);

        if (!formData.name || !formData.email || !formData.phonenumber || !formData.description || !formData.companyName || (!formData.services.length && !formData.products.length)) {
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
                setAddedServices([]);
                

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
                if (sendEmail) {
                    const emailResponse = await fetch('/api/quotes/send-email', {
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
                }

                const emailNotification = await fetch('/api/quotes/send-email-notification', {
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
                        <Row className='g-2'>
                            <Col md>
                                <FloatingLabel controlId={`floatingServiceLevel${type}`} label="Select Service Level...">
                                    <Form.Select aria-label="Service level" name="serviceLevel" onChange={(e) => handleCustomOptionChange(type, 'serviceLevel', e.target.value)} >
                                        <option value="">Select Service Level...</option>
                                        <option value="Basic Cleaning">Basic Cleaning</option>
                                        <option value="Deep Cleaning">Deep Cleaning</option>
                                        <option value="Special Deal">Special Deal</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col md>

                                <FloatingLabel controlId="floatingUnitSize" label="Unit Size">
                                    <Form.Select aria-label="Unit Size" onChange={(e) => handleCustomOptionChange(type, 'unitSize', e.target.value, pricing.unitSize[e.target.value])}>
                                        <option value="">Select Unit Size...</option>
                                        <option value="0-499 sqft">0-499 sqft</option>
                                        <option value="500-999 sqft">500-999 sqft</option>
                                        <option value="1000-1499 sqft">1000-1499 sqft</option>
                                        <option value="1500-1999 sqft">1500-1999 sqft</option>
                                        <option value="2000+ sqft">2000+ sqft</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col md>
                                <FloatingLabel controlId="floatingBedrooms" label="Number of Bedrooms">
                                    <Form.Control type="number" min="0" onChange={(e) => handleCustomOptionChange(type, 'bedrooms', e.target.value, pricing.bedrooms[e.target.value])}
                                    // disabled={formData.serviceLevel === 'Deep Cleaning'}
                                    />
                                </FloatingLabel>
                            </Col>
                            <Col md>
                                <FloatingLabel controlId="floatingBathrooms" label="Number of Bathrooms">
                                    <Form.Control type="number" min="0" onChange={(e) => handleCustomOptionChange(type, 'bathrooms', e.target.value, pricing.bathrooms[e.target.value])}
                                    // disabled={formData.serviceLevel === 'Deep Cleaning'}
                                    />
                                </FloatingLabel>
                            </Col>
                        </Row>
                        {serviceLevel !== "" ? (

                            <Row className='g-2'>
                                <Col md>
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
                        <Button onClick={() => handleRemoveService(type)} color="danger">Remove</Button>
                        {/* </Tab> */}
                    </>
                );
            case 'Commercial':
                return (
                    <>
                        <Row className='g-2'>
                            <Col md>
                                <FloatingLabel controlId={`floatingServiceLevel${type}`} label="Select Service Level...">
                                    <Form.Select aria-label="Service level" name="serviceLevel" onChange={(e) => handleCustomOptionChange(type, 'serviceLevel', e.target.value)} >
                                        <option value="">Select Service Level...</option>
                                        <option value="Basic Cleaning">Basic Cleaning</option>
                                        <option value="Deep Cleaning">Deep Cleaning</option>
                                        <option value="Special Deal">Special Deal</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>
                            <Col md>
                                <FormGroup>
                                    <Label>Square Footage</Label>
                                    <Input type="select" onChange={(e) => handleCustomOptionChange(type, 'squareFootage', e.target.value, pricing.squareFootage[e.target.value])}
                                    // disabled={formData.serviceLevel === 'Deep Cleaning'}
                                    >
                                        <option value="">Select Square Footage...</option>
                                        <option value="0-999 sqft">0-999 sqft</option>
                                        <option value="1000-4999 sqft">1000-4999 sqft</option>
                                        <option value="5000-9999 sqft">5000-9999 sqft</option>
                                        <option value="10000+ sqft">10000+ sqft</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row className='g-2'>
                            <Col md>
                                <FormGroup>
                                    <Label>Number of Rooms</Label>
                                    <Input type="number" min="0" onChange={(e) => handleCustomOptionChange(type, 'rooms', e.target.value, pricing.rooms[e.target.value])}
                                    // disabled={formData.serviceLevel === 'Deep Cleaning'}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md>
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
                        <Button onClick={() => handleRemoveService(type)} color="danger">Remove</Button>
                    </>
                );
            case 'Industrial':
                return (
                    <> <Row className='g-2'>
                        <Col md>
                            <FloatingLabel controlId={`floatingServiceLevel${type}`} label="Select Service Level...">
                                <Form.Select aria-label="Service level" name="serviceLevel" onChange={(e) => handleCustomOptionChange(type, 'serviceLevel', e.target.value)} >
                                    <option value="">Select Service Level...</option>
                                    <option value="Basic Cleaning">Basic Cleaning</option>
                                    <option value="Deep Cleaning">Deep Cleaning</option>
                                    <option value="Special Deal">Special Deal</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                        <Col md>
                            <FormGroup>
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
                            </FormGroup>
                        </Col>
                        <Col md>
                            <FormGroup>
                                <Label>Number of Employees</Label>
                                <Input type="number" min="0" onChange={(e) => handleCustomOptionChange(type, 'employees', e.target.value, pricing.employees[e.target.value])}
                                    disabled={formData.serviceLevel === 'Deep Cleaning'}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                        <Row className='g-2'>
                            <Col md>
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
                        <Button onClick={() => handleRemoveService(type)} color="danger">Remove</Button>
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
                <div className="content">
                    <Container>
                        <h2 className="text-center">Request a Quote</h2>
                        <Form onSubmit={handleSubmit} id="quote-form">
                            <Row className='g-2'>
                                <Col md>
                                    <Form.Floating className="mb-3">
                                        <Form.Control
                                            type="text"
                                            id=" floatingFullName"
                                            placeholder="Full Name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="floatingFullName">Full Name</label>
                                    </Form.Floating>
                                </Col>
                                <Col md>
                                    <Form.Floating className="mb-3">
                                        <Form.Control
                                            type="text"
                                            id="floatingEmail"
                                            placeholder="Email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="floatingEmail">Email</label>
                                    </Form.Floating>
                                </Col>
                                <Col md>
                                    <Form.Floating className="mb-3">
                                        <Form.Control
                                            type="text"
                                            id="floatingPhoneNumber"
                                            placeholder="Phone Number"
                                            name="phonenumber"
                                            value={formData.phonenumber}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="floatingPhoneNumber">Phone Number</label>
                                    </Form.Floating>
                                </Col>
                            </Row>
                            <Row className='g-2'>
                                <Col md>
                                    <Form.Floating className="mb-3">
                                        <Form.Control
                                            type="text"
                                            id="floatingAddress"
                                            placeholder="Address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="floatingAddress">Address</label>
                                    </Form.Floating>
                                </Col>
                                <Col md>
                                    <Form.Floating className="mb-3">
                                        <Form.Control
                                            type="text"
                                            id="floatingCity"
                                            placeholder="City"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="floatingCity">City</label>
                                    </Form.Floating>
                                </Col>
                                <Col md>
                                    <Form.Floating className="mb-3">
                                        <Form.Control
                                            type="text"
                                            id="floatingProvince"
                                            placeholder="Province"
                                            name="province"
                                            value={formData.province}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="floatingState">Province</label>
                                    </Form.Floating>
                                </Col>
                            </Row>
                            <Row className='g-2'>
                                <Col md>
                                    <Form.Floating className="mb-3">
                                        <Form.Control
                                            type="text"
                                            id="floatingPostalCode"
                                            placeholder="Postal Code"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="floatingPostalCode">Postal Code</label>
                                    </Form.Floating>
                                </Col>
                                <Col md>
                                    <Form.Floating className="mb-3">
                                        <Form.Control
                                            type="text"
                                            id="floatingCompanyName"
                                            placeholder="Company Name"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="floatingCompanyName">Company Name</label>
                                    </Form.Floating>
                                </Col>
                                {isLogged ? null : (
                                    <>
                                        <Col md>
                                            <FloatingLabel controlId="floatingServiceLevel" label="How Did You Hear About Us...">
                                                <Form.Select aria-label="How Did You Hear About Us" value={formData.howDidYouHearAboutUs}
                                                    name='howDidYouHearAboutUs' onChange={handleChange}>
                                                    <option value="">How Did You Hear About Us?...</option>
                                                    <option value="Google">Google</option>
                                                    <option value="Facebook">Facebook</option>
                                                    <option value="Instagram">Instagram</option>
                                                    <option value="Referral">Referral</option>
                                                    <option value="Other">Other</option>
                                                </Form.Select>
                                            </FloatingLabel>
                                            {/* <InputGroup className={`no-border ${formData.howDidYouHearAboutUs ? "input-group-focus" : ""}`}>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText className=''>
                                                <i className="now-ui-icons objects_globe"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            type="select"
                                            value={formData.howDidYouHearAboutUs}
                                            name='howDidYouHearAboutUs'
                                            className=''
                                            onChange={handleChange}
                                        >
                                            <option value="">How Did You Hear About Us?...</option>
                                            <option value="Google">Google</option>
                                            <option value="Facebook">Facebook</option>
                                            <option value="Instagram">Instagram</option>
                                            <option value="Referral">Referral</option>
                                            <option value="Other">Other</option>
                                        </Input>
                                    </InputGroup> */}
                                        </Col>
                                    </>
                                )}
                            </Row>
                            <FormGroup>
                                <Label>Description</Label>
                                <Input
                                    type="textarea"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </FormGroup>
                            <Row>
                                <Col md>
                                    {/* <FormGroup> */}
                                    <Label>Add Requested Services</Label>
                                    <Button className='service-button-residential' variant="" onClick={() => handleAddService({ target: { value: "Residential" } })} value="Residential">Add Residential</Button>{' '}
                                    <Button className='service-button-commercial' onClick={() => handleAddService({ target: { value: "Commercial" } })} value="Commercial">Add Commercial</Button>{' '}
                                    <Button className='service-button-industrial' onClick={() => handleAddService({ target: { value: "Industrial" } })} value="Industrial">Add Industrial</Button>

                                    {/* <ButtonGroup>
                                        <ToggleButton type="checkbox"
                                            variant="primary"
                                            onClick={() => handleAddService({ target: { value: "Residential" } })} id="Residential" value="Residential" checked={formData.services.some(service => service.type === 'Residential')}>Residential</ToggleButton>
                                        <ToggleButton type="checkbox"
                                            variant="primary" onClick={() => handleAddService({ target: { value: "Commercial" } })} value="Commercial" checked={formData.services.some(service => service.type === 'Commercial')}>Commercial</ToggleButton>
                                        <ToggleButton type="checkbox"
                                            variant="primary" onClick={() => handleAddService({ target: { value: "Industrial" } })} value="Industrial" checked={formData.services.some(service => service.type === 'Industrial')}>Industrial</ToggleButton>
                                    </ButtonGroup> */}
                                </Col>
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
                                            {/* <Tab eventKey={service.type} title={service.type}>
                                            {renderCustomOptions(service.type)}
                                        </Tab> */}
                                        </>

                                        // <div key={service.type} className="mb-3">
                                        // </div>
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
                                            {/* <Tab eventKey={service.type} title={service.type}>
                                            {renderCustomOptions(service.type)}
                                        </Tab> */}
                                        </>

                                        // <div key={service.type} className="mb-3">
                                        // </div>
                                    ))}
                                </>
                            )
                            }
                            <Row>
                                {/* Add a message indicating that requesting products is coming soon */}
                                <Col md>
                                <div className="text-center">
                                    <h4>Products coming soon!</h4>
                                </div>                                    
                                </Col>
                            </Row>

                            <Row>
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
                            </Row>
                            <Row>
                                <Col>
                                    <FormGroup check className=''>
                                        <Label check>
                                            <Input
                                                type="checkbox"
                                                checked={sendEmail}
                                                onChange={() => setSendEmail(!sendEmail)}
                                            />
                                            <span className="form-check-sign"></span>
                                            Email me a copy of the quote
                                        </Label>
                                    </FormGroup>

                                </Col>
                            </Row>
                            <Row className='pb-3'>
                                <Col md="12" className="text-center">
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
