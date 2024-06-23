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
    const [selectedOptions, setSelectedOptions] = useState([]);
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
        serviceType: '',
        subtotalCost: 0,
        tax: 0,
        grandTotal: 0,
        services: [],
        products: selectedOptions
    });
    const [sendEmail, setSendEmail] = useState(false);

    const [isLogged] = React.useState(Auth.loggedIn());

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
            console.log('isLogged:', isLogged);
            if (isLogged) {
                const data = Auth.getProfile().data;
                console.log('name:', data);
                setFormData(prevFormData => ({
                    ...prevFormData,
                    name: data.firstName+" "+data.lastName,
                    email: data.email,
                    userId: data._id

                }));
                console.log('formData:', formData);
            }
        }  

        initializeServices();
        prepopulateForm();
        document.body.classList.add("request-quote", "sidebar-collapse");
        document.documentElement.classList.remove("nav-open");
        window.scrollTo(0, 0);

        return () => {
            document.body.classList.remove("request-quote", "sidebar-collapse");
        };
    }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('formData:', formData);

        if (!formData.name || !formData.email || !formData.phonenumber || !formData.description || !formData.companyName || !formData.serviceType || !formData.howDidYouHearAboutUs || (!formData.services.length && !formData.products.length)) {
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
                setSelectedOptions([]);
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
                    serviceType: '',
                    grandTotal: 0,
                    services: [],
                    products: selectedOptions
                });

                if (window.confirm('Would you like to download the quote as a PDF?')) {
                    try {
                        // if (printFormFlag) {
                        const element = document.getElementById('quote-form'); // Replace 'quote-form' with the ID of the form element
                        const opt = {
                            margin: 0.5,
                            filename: 'quote.pdf', // parametarize the filename with the quote ID
                            image: { type: 'jpeg', quality: 0.98 },
                            html2canvas: { scale: 2 },
                            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                        };
                        // console.log(html2pdf().set(opt).from(element));
                        html2pdf().set(opt).from(element).save(); // Generate and save the PDF
                        // }

                    }
                    catch (error) {
                        console.error('Error generating PDF:', error);
                    }
                }
                const quoteResponse = await response.json();
                console.log('quoteResponse:', quoteResponse);
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

    useEffect(() => {
        setFormData(prevFormData => ({
            ...prevFormData,
            subtotalCost,
            tax,
            grandTotal
        }));
    }, [formData.services, formData.products]);

    

    return (
        <>
            <Navbar />
            {/* <div className="page-header"> */}
                <div
                    className="section page-header-image"
                    style={{
                        backgroundImage: "url(" + require("assets/img/stock-photo-high-angle-view-person-cleaning-white-carpet-professional-vacuum-cleaner.jpg") + ")",
                        backgroundSize: "cover",
                        backgroundPosition: "top center",
                        minHeight: "700px",
                        opacity: 0.8
                    }}
                >

                <div className='content  mt-5'>                    
                    <Container>
                <h2 className="title text-center">Request a Quote</h2>
                    <p className="description text-center">Please fill out the form below:</p>
                    <Form onSubmit={handleSubmit} className='form text-center ml-auto mr-auto  p-2 col-6 form-switch' id='quote-form'>
                        {['name', 'companyName', 'email', 'phonenumber'].map((field, idx) => (
                            <InputGroup key={idx} className={`no-border ${formData[field] ? "input-group-focus" : ""}`}>
                                {/* <input type={field === 'email' ? 'email' : 'text'} className='form-control' placeholder={`Your ${field.charAt(0).toUpperCase() + field.slice(1)}...`} name={field} value={formData[field]} onChange={handleChange} required={field !== 'companyName'} id={field} />
                                <label for={field} className='placeholder-white'>{field.charAt(0).toUpperCase() + field.slice(1)}</label> */}
                                <InputGroupAddon addonType="prepend">
                                    <InputGroupText className='km-bg-test'>
                                        <i className={`now-ui-icons ${field === 'name' ? 'users_circle-08' : field === 'companyName' ? 'shopping_shop' : field === 'email' ? 'ui-1_email-85' : 'tech_headphones'}`}></i>
                                    </InputGroupText>
                                </InputGroupAddon>
                                
                                <Input
                                    placeholder={`Your ${field.charAt(0).toUpperCase() + field.slice(1)}...`}
                                    type={field === 'email' ? 'email' : 'text'}
                                    name={field}
                                    className='placeholder-white km-bg-test km-text-accent'
                                    value={formData[field]}
                                    onChange={handleChange}
                                    required={field !== 'companyName'}
                                    readOnly={(isLogged && (field === "name" || field === "email")) ? true : false}
                                />
                            </InputGroup>
                        ))}
                        <InputGroup className={`no-border ${formData.howDidYouHearAboutUs ? "input-group-focus" : ""}`}>
                            <InputGroupAddon addonType="prepend">
                                <InputGroupText className='km-bg-test'>
                                    <i className="now-ui-icons objects_globe"></i>
                                </InputGroupText>
                            </InputGroupAddon>
                            <Input
                                type="select"
                                value={formData.howDidYouHearAboutUs}
                                name='howDidYouHearAboutUs'
                                className='font-weight-bold km-bg-test'
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
                        <InputGroup className={`no-border ${formData.serviceType ? "input-group-focus" : ""}`}>
                            <InputGroupAddon addonType="prepend">
                                <InputGroupText className='km-bg-test'>
                                    <i className="now-ui-icons shopping_tag-content"></i>
                                </InputGroupText>
                            </InputGroupAddon>
                            <Input
                                type="select"
                                value={formData.serviceType}
                                className='font-weight-bold km-bg-test'
                                name='serviceType'
                                onChange={handleChange}
                            >
                                <option value="">Select Service Type...</option>
                                <option value="Residential">Residential</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Industrial">Industrial</option>
                                <option value="Other">Other</option>
                            </Input>
                        </InputGroup>
                        <InputGroup className={`no-border ${formData.description ? "input-group-focus" : ""}`}>
                            <Input
                                cols="80"
                                name="description"
                                placeholder="Tell us a bit about your project..."
                                rows="4"
                                className='km-bg-test placeholder-white font-weight-bold rounded'
                                type="textarea"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </InputGroup>
                        <h4 className='title text-center'>Select Your Services</h4>
                        <Row>
                            {services.map((service) => (
                                <Col key={service.id} md="4">
                                    <FormGroup check >
                                        <Label check>
                                            <Input
                                                type="checkbox"
                                                role='switch'
                                                checked={formData.services.includes(service)}
                                                onChange={() => toggleSelection('services', service)}
                                            />
                                            <span className="form-check-sign"></span>
                                            {service.name} - ${service.serviceCost}
                                        </Label>
                                    </FormGroup>
                                </Col>
                            ))}
                        </Row>
                        <h4 className='title text-center'>Select Your Products</h4>
                        <Row>
                            {products.map((product) => (
                                <Col key={product.id} md="4">
                                    <FormGroup check>
                                        <Label check>
                                            <Input
                                                type="checkbox"
                                                checked={formData.products.includes(product)}
                                                onChange={() => toggleSelection('products', product)}
                                            />
                                            <span className="form-check-sign"></span>
                                            {product.name} - ${product.productCost}
                                        </Label>
                                    </FormGroup>
                                </Col>
                            ))}
                        </Row>
                        <h4 className='title text-center'>Summary</h4>
                        <ul>
                            <li>Subtotal: ${subtotalCost.toFixed(2)}</li>
                            <li>Tax (13%): ${tax.toFixed(2)}</li>
                            <li>Grand Total: ${grandTotal.toFixed(2)}</li>
                        </ul>
                        <FormGroup check>
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
                        <Button className="btn-round" color="primary" size="lg" type="submit">Submit Quote</Button>
                    </Form>
                    </Container>
                    
                </div>
            </div>
            {/* </div> */}
            <Footer />
        </>
    );
};

export default RequestQuote;
