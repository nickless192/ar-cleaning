import React, { useState, useEffect } from 'react';
import {
    Button,
    Row,
    Col,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Form, FormGroup, Label,
    Container
} from 'reactstrap';
import html2pdf from 'html2pdf.js';
import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";
import Auth from "../../utils/auth";

const RequestQuote = () => {
    // const [selectedOptions, setSelectedOptions] = useState([]);
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
        serviceLevel: '', // New field for service level
    });
    const [addedServices, setAddedServices] = useState([]);
    const [sendEmail, setSendEmail] = useState(false);
    const [isLogged] = useState(Auth.loggedIn());

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
                        serviceCost: item.serviceCost
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
        };

        const prepopulateForm = async () => {
            if (isLogged) {
                const data = Auth.getProfile().data;
                setFormData(prevFormData => ({
                    ...prevFormData,
                    name: data.firstName + " " + data.lastName,
                    email: data.email,
                    userId: data._id
                }));
            }
        };

        initializeServices();
        prepopulateForm();
        document.body.classList.add("request-quote", "sidebar-collapse");
        document.documentElement.classList.remove("nav-open");
        window.scrollTo(0, 0);

        return () => {
            document.body.classList.remove("request-quote", "sidebar-collapse");
        };
    }, [isLogged]);

    const handleChange = ({ target: { name, value } }) => {
        setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
    };

    const toggleSelection = (type, item) => {
        setFormData(prevFormData => {
            const updatedItems = prevFormData[type].includes(item)
                ? prevFormData[type].filter(i => i !== item)
                : [...prevFormData[type], item];
            return { ...prevFormData, [type]: updatedItems };
        });
    };

    const handleAddService = () => {
        if (formData.serviceType && !addedServices.find(s => s.type === formData.serviceType)) {
            setAddedServices([...addedServices, { type: formData.serviceType, customOptions: {} }]);
            setFormData(prevFormData => ({ ...prevFormData, serviceType: '' }));
        }
    };

    const handleRemoveService = (type) => {
        setAddedServices(addedServices.filter(s => s.type !== type));
        setFormData(prevFormData => ({ ...prevFormData, services: addedServices }));
    };

    const handleCustomOptionChange = (type, option, value) => {
        setAddedServices(addedServices.map(s =>
            s.type === type ? { ...s, customOptions: { ...s.customOptions, [option]: value } } : s
        ));
        setFormData(prevFormData => ({ ...prevFormData, services: addedServices }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form data:', formData);
        if (!formData.name || !formData.email || !formData.phonenumber || !formData.description || !formData.companyName || !formData.howDidYouHearAboutUs || (!formData.services.length && !formData.products.length)) {
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
                // setSelectedOptions([]);
                setFormData({
                    name: '',
                    userId: '',
                    description: '',
                    email: '',
                    phonenumber: '',
                    companyName: '',
                    howDidYouHearAboutUs: '',
                    subtotalCost: 0,
                    tax: 0,
                    grandTotal: 0,
                    services: [],
                    products: [],
                    serviceLevel: '' // Reset service level
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
            }
        } catch (error) {
            console.error('Error submitting quote:', error);
        }
    };

    const calculateCost = (items, costField) => items.reduce((acc, item) => acc + item[costField], 0);
    const subtotalCost = calculateCost(formData.services, 'serviceCost') + calculateCost(formData.products, 'productCost');
    const tax = subtotalCost * 0.13;
    const grandTotal = subtotalCost + tax;

    const renderCustomOptions = (type) => {
        switch (type) {
            case 'Residential':
                return (
                    <>
                        <FormGroup>
                            <Label>Select Service Level</Label>
                            <Input type="select" name="serviceLevel" value={formData.serviceLevel} onChange={handleChange}>
                                <option value="">Select Service Level...</option>
                                <option value="Basic Cleaning">Basic Cleaning</option>
                                <option value="Deep Cleaning">Deep Cleaning</option>
                                <option value="Special Deal">Special Deal</option>
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label>Unit Size</Label>
                            <Input type="select" onChange={(e) => handleCustomOptionChange(type, 'unitSize', e.target.value)} disabled={formData.serviceLevel === 'Deep Cleaning'}>
                                <option value="">Select Unit Size...</option>
                                <option value="0-499 sqft">0-499 sqft</option>
                                <option value="500-999 sqft">500-999 sqft</option>
                                <option value="1000-1499 sqft">1000-1499 sqft</option>
                                <option value="1500-1999 sqft">1500-1999 sqft</option>
                                <option value="2000+ sqft">2000+ sqft</option>
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label>Number of Bedrooms</Label>
                            <Input type="number" min="0" onChange={(e) => handleCustomOptionChange(type, 'bedrooms', e.target.value)}
                                disabled={formData.serviceLevel === 'Deep Cleaning'}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Number of Bathrooms</Label>
                            <Input type="number" min="0" onChange={(e) => handleCustomOptionChange(type, 'bathrooms', e.target.value)}
                                disabled={formData.serviceLevel === 'Deep Cleaning'}
                            />
                        </FormGroup>
                        <FormGroup check>
                            <Label check>
                                <Input
                                    type="checkbox"
                                    onChange={(e) => handleCustomOptionChange(type, 'fridge', e.target.checked)}
                                    disabled={formData.serviceLevel === 'Deep Cleaning'}
                                />
                                <span className="form-check-sign"></span>
                                Fridge
                            </Label>
                        </FormGroup>
                        <FormGroup check>
                            <Label check>
                                <Input
                                    type="checkbox"
                                    onChange={(e) => handleCustomOptionChange(type, 'parking', e.target.checked)}
                                    disabled={formData.serviceLevel === 'Deep Cleaning'}
                                />
                                <span className="form-check-sign"></span>
                                Parking
                            </Label>
                        </FormGroup>
                    </>
                );
            case 'Commercial':
                return (
                    <>
                        <FormGroup>
                            <Label>Square Footage</Label>
                            <Input type="select" onChange={(e) => handleCustomOptionChange(type, 'squareFootage', e.target.value)}
                                disabled={formData.serviceLevel === 'Deep Cleaning'}
                            >
                                <option value="">Select Square Footage...</option>
                                <option value="0-999 sqft">0-999 sqft</option>
                                <option value="1000-4999 sqft">1000-4999 sqft</option>
                                <option value="5000-9999 sqft">5000-9999 sqft</option>
                                <option value="10000+ sqft">10000+ sqft</option>
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label>Number of Rooms</Label>
                            <Input type="number" min="0" onChange={(e) => handleCustomOptionChange(type, 'rooms', e.target.value)}
                                disabled={formData.serviceLevel === 'Deep Cleaning'}
                            />
                        </FormGroup>
                        <FormGroup check>
                            <Label check>
                                <Input
                                    type="checkbox"
                                    onChange={(e) => handleCustomOptionChange(type, 'windows', e.target.checked)}
                                    disabled={formData.serviceLevel === 'Deep Cleaning'}
                                />
                                <span className="form-check-sign"></span>
                                Windows
                            </Label>
                        </FormGroup>
                    </>
                );
            case 'Industrial':
                return (
                    <>
                        <FormGroup>
                            <Label>Square Footage</Label>
                            <Input type="select" onChange={(e) => handleCustomOptionChange(type, 'squareFootage', e.target.value)}
                                disabled={formData.serviceLevel === 'Deep Cleaning'}
                            >
                                <option value="">Select Square Footage...</option>
                                <option value="0-999 sqft">0-999 sqft</option>
                                <option value="1000-4999 sqft">1000-4999 sqft</option>
                                <option value="5000-9999 sqft">5000-9999 sqft</option>
                                <option value="10000+ sqft">10000+ sqft</option>
                            </Input>
                        </FormGroup>
                        <FormGroup>
                            <Label>Number of Employees</Label>
                            <Input type="number" min="0" onChange={(e) => handleCustomOptionChange(type, 'employees', e.target.value)}
                                disabled={formData.serviceLevel === 'Deep Cleaning'}
                            />
                        </FormGroup>
                        <FormGroup check>
                            <Label check>
                                <Input
                                    type="checkbox"
                                    onChange={(e) => handleCustomOptionChange(type, 'highDusting', e.target.checked)}
                                    disabled={formData.serviceLevel === 'Deep Cleaning'}
                                />
                                <span className="form-check-sign"></span>
                                High Dusting
                            </Label>
                        </FormGroup>
                        <FormGroup check>
                            <Label check>
                                <Input
                                    type="checkbox"
                                    onChange={(e) => handleCustomOptionChange(type, 'machineryCleaning', e.target.checked)}
                                    disabled={formData.serviceLevel === 'Deep Cleaning'}
                                />
                                <span className="form-check-sign"></span>
                                Machinery Cleaning
                            </Label>
                        </FormGroup>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Navbar />
            <div
                className="section page-header-image km-bg-primary"
                style={{
                    // backgroundImage: "url(" + require("assets/img/stock-photo-high-angle-view-person-cleaning-white-carpet-professional-vacuum-cleaner.jpg") + ")",
                    backgroundSize: "cover",
                    backgroundColor: "green",
                    backgroundPosition: "top center",
                    minHeight: "700px",
                    // opacity: 0.8
                }}
            >

                <div className="content">
                    <Container>
                        <h2 className="text-center">Request a Quote</h2>
                        <Form onSubmit={handleSubmit} id="quote-form">
                            <FormGroup>
                                <Label>Full Name</Label>
                                <Input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Phone Number</Label>
                                <Input
                                    type="text"
                                    name="phonenumber"
                                    value={formData.phonenumber}
                                    onChange={handleChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label>Company Name</Label>
                                <Input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                />
                            </FormGroup>
                            <InputGroup className={`no-border ${formData.howDidYouHearAboutUs ? "input-group-focus" : ""}`}>
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
                            </InputGroup>
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
                                <Col md="12">
                                    <FormGroup>
                                        <Label>Select Services</Label>
                                        <Input
                                            type="select"
                                            name="serviceType"
                                            value={formData.serviceType}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Service...</option>
                                            <option value="Residential" disabled={addedServices.some(service => service.type === 'Residential')}>Residential</option>
                                            <option value="Commercial" disabled={addedServices.some(service => service.type === 'Commercial')}>Commercial</option>
                                            <option value="Industrial" disabled={addedServices.some(service => service.type === 'Industrial')}>Industrial</option>
                                        </Input>
                                        <Button onClick={handleAddService} color="primary">Add Service</Button>
                                    </FormGroup>

                                </Col>
                            </Row>
                            {addedServices.map(service => (
                                <div key={service.type} className="mb-3">
                                    <h5>{service.type} Options</h5>
                                    {renderCustomOptions(service.type)}
                                    <Button onClick={() => handleRemoveService(service.type)} color="danger">Remove</Button>
                                </div>
                            ))}
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
                                            type="text"
                                            value={`$${tax.toFixed(2)}`}
                                            readOnly
                                        />
                                    </FormGroup>
                                </Col>
                                <Col >
                                    <FormGroup>
                                        <Label>Grand Total</Label>
                                        <Input
                                            type="text"
                                            value={`$${grandTotal.toFixed(2)}`}
                                            readOnly
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="12" className="text-center">
                                    <Button type="submit" color="primary">Submit Quote</Button>
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
