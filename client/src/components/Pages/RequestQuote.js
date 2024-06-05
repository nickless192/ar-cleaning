import React, { useState } from 'react';
import "./../../assets/css/our-palette.css";
import {
    Button,
    Container,
    Row,
    Col,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Form, FormGroup, Label
} from 'reactstrap'; // Importing required components from reactstrap

import html2pdf from 'html2pdf.js'; // Importing html2pdf library
import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";


const RequestQuote = () => {

    const [selectedOptions, setSelectedOptions] = useState([]);

    const [services, setServices] = useState([]);
    const [products, setProducts] = useState([]);


    const [formData, setFormData] = useState({
        name: '',
        description: '',
        companyName: '',
        email: '',
        phonenumber: '',
        howDidYouHearAboutUs: '',
        serviceType: '',
        subtotalCost: 0,
        tax: 0,
        // discountCode: '',
        // discountAmount: 0,
        grandTotal: 0,
        // paymentMethod: '',        
        services: [],
        products: selectedOptions
    });

    const [sendEmail, setSendEmail] = useState(false);


    const handleChange = (e) => {
        e.preventDefault();
        const { name, value } = e.target;
        console.log(name, value);
        console.log(formData);
        setFormData({ ...formData, [name]: value });
    };


    const toggleProduct = (e, product) => {
        // e.preventDefault();
        console.log(selectedOptions);
        const updatedProducts = [...formData.products];
        if (updatedProducts.includes(product)) {
            updatedProducts.pop(product);
            console.log('product removed');
        } else {
            updatedProducts.push(product);
            console.log('product added');
        }

        setFormData({ ...formData, products: updatedProducts });
        // setFormData({ ...formData, grandTotal: formData.services.reduce((acc, service) => acc + service.serviceCost, 0) + formData.products.reduce((acc, product) => acc + product.productCost, 0) * 1.13});
    };

    const toogleService = (e, service) => {
        const updatedServices = [...formData.services];
        if (updatedServices.includes(service)) {
            updatedServices.pop(service);
        } else {
            updatedServices.push(service);
        }
        setFormData({ ...formData, services: updatedServices });


        // setFormData({ ...formData, grandTotal: formData.services.reduce((acc, service) => acc + service.serviceCost, 0) + formData.products.reduce((acc, product) => acc + product.productCost, 0) * 1.13});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);

        try {
            // Your fetch logic here
            // if (formData.serviceType !== '' && formData.name !== '' && formData.email !== '' && formData.phonenumber !== '' && formData.howDidYouHearAboutUs !== '' && formData.description !== '' && formData.companyName !== '') {

                if ((formData.services.length !== 0 || formData.products.length !== 0) && formData.serviceType !== '' && formData.name !== '' && formData.email !== '' && formData.phonenumber !== '' && formData.howDidYouHearAboutUs !== '' && formData.description !== '' && formData.companyName !== '') {
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
                        description: '',
                        email: '',
                        phonenumber: '',
                        companyName: '',
                        howDidYouHearAboutUs: '',
                        subtotalCost: 0,
                        tax: 0,
                        serviceType: '',
                        // discountCode: '',
                        // discountAmount: 0,
                        grandTotal: 0,
                        // paymentMethod: '',        
                        services: [],
                        products: selectedOptions
                    });
                    // Generate PDF
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
                    // const element = document.getElementById('quote-form'); // Replace 'quote-form' with the ID of the form element
                    // const opt = {
                    //     margin: 0.5,
                    //     filename: 'quote.pdf', // parametarize the filename with the quote ID
                    //     image: { type: 'jpeg', quality: 0.98 },
                    //     html2canvas: { scale: 2 },
                    //     jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                    // };
                    // html2pdf().set(opt).from(element).save(); // Generate and save the PDF

                    // send email calling api
                    if (sendEmail) {

                        const emailResponse = await fetch('/api/quotes/send-email', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Accept: 'application/json'
                            },
                            body: JSON.stringify({ email: formData.email, quote: formData })
                        });
                        if (emailResponse.ok) {
                            alert('Email sent successfully!');
                        } else {
                            alert('Error sending email');
                        }
                    }
                }
            }
            else {
                alert('Please fill out all required fields');
                return;
            }



        } catch (error) {
            console.error('Error submitting quote:', error);
        }
    };

    React.useEffect(() => {
        const initializeServices = () => {
            const localServices = [];
            const localProducts = [];

            fetch(`/api/services`, {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
            )
                .then(response => {
                    if (response.ok) {
                        response.json()
                            .then(data => {
                                console.log(data);
                                for (let i = 0; i < data.length; i++) {
                                    console.log(data[i].name);
                                    localServices.push({ name: data[i].name, id: data[i]._id, serviceCost: data[i].serviceCost });
                                    // setServices(...services, { name: data[i].name, id: data[i]._id, serviceCost: data[i].serviceCost });
                                }
                                setServices(localServices);
                                return localServices;

                            })
                            .then(localServices => {
                                setServices(localServices);
                                // console.log(services);
                                console.log(localServices);

                            },)
                    } else {
                        console.log(response.statusText);
                    }
                })

            fetch('/api/products', {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        response.json()
                            .then(data => {
                                console.log(data);
                                for (let i = 0; i < data.length; i++) {
                                    console.log(data[i].name);
                                    localProducts.push({ name: data[i].name, id: data[i]._id, productCost: data[i].productCost });
                                    // setServices(...services, { name: data[i].name, id: data[i]._id, serviceCost: data[i].serviceCost });
                                }
                                setProducts(localProducts);
                                return localProducts;

                            })
                            .then(localProducts => {
                                setProducts(localProducts);
                                // console.log(services);
                                console.log(localProducts);

                            },)
                    } else {
                        console.log(response.statusText);
                    }
                })

            // setAdminFlag(localStorage.getItem('adminFlag'));
        }

        initializeServices();
        document.body.classList.add("request-quote");
        document.body.classList.add("sidebar-collapse");
        document.documentElement.classList.remove("nav-open");
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        return function cleanup() {
            document.body.classList.remove("request-quote");
            document.body.classList.remove("sidebar-collapse");
        };
    }
        , []);



    return (
        <>
            <Navbar />
            <div className="page-header clear-filter" filter-color="blue">
                <div
                    className="page-header-image"
                    style={{
                        backgroundImage: "url(" + require("assets/img/login.jpg") + ")",
                        backgroundSize: "cover",
          backgroundPosition: "top center",
          minHeight: "700px"
                    }}
                ></div>

                <div className='container'> 
                    <Form onSubmit={(e) => handleSubmit(e)} className='form'>
                        {/* <Container> */}
                            <h2 className="title test-primary text-center">Request a Quote</h2>
                            <p className="test-secondary description text-center">Please fill out the form below:</p>
                            <Row>
                                <Col className="text-center ml-auto mr-auto test-accent" lg="6" md="8" id='quote-form'>
                                    <InputGroup  className={
                                        "no-border" + (formData.name ? " input-group-focus" : "")
                                    }>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="now-ui-icons users_circle-08"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            placeholder="Your Name..."
                                            type="text"
                                            // className='test-secondary'
                                            // color='light'
                                            name="name"
                                            // className='input-lg'
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </InputGroup>
                                    <InputGroup className={
                                        "no-border" + (formData.companyName ? " input-group-focus" : "")
                                    }>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="now-ui-icons shopping_shop"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            placeholder="Your Company Name..."
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                        />
                                    </InputGroup>
                                    <InputGroup className={
                                        "no-border" + (formData.email ? " input-group-focus" : "")
                                    }>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="now-ui-icons ui-1_email-85"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            placeholder="Your Email..."
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </InputGroup>
                                    <InputGroup className={
                                        "no-border" + (formData.phonenumber ? " input-group-focus" : "")
                                    }>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="now-ui-icons tech_headphones"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            placeholder="Your Phone Number..."
                                            type="phonenumber"
                                            name="phonenumber"
                                            value={formData.phonenumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </InputGroup>
                                    <InputGroup className={
                                        "no-border" + (formData.description ? " input-group-focus" : "")
                                    }>
                                        <Input
                                            cols="80"
                                            name="description"
                                            placeholder="Message..."
                                            rows="4"
                                            type="textarea"
                                            className='rounded-lg'
                                            value={formData.description}
                                            onChange={handleChange}
                                        />
                                    </InputGroup>
                                    <InputGroup className={
                                        "no-border" + (formData.howDidYouHearAboutUs ? " input-group-focus" : "")
                                    }>
                                        <Input
                                            type="select"
                                            value={formData.howDidYouHearAboutUs}
                                            name='howDidYouHearAboutUs'
                                            onChange={(e) => handleChange(e)}
                                        >
                                            <option value="">How Did You Hear About Us?...</option>
                                            <option value="Google">Google</option>
                                            <option value="Facebook">Facebook</option>
                                            <option value="Instagram">Instagram</option>
                                            <option value="Referral">Referral</option>
                                            <option value="Other">Other</option>
                                        </Input>
                                    </InputGroup>
                                    <InputGroup className={
                                        "no-border" + (formData.serviceType ? " input-group-focus" : "")
                                    }>
                                        {/* <h5>Select Service Type:</h5> */}
                                        <Input
                                            type="select"
                                            value={formData.serviceType}
                                            name='serviceType'
                                            onChange={(e) => handleChange(e)}
                                        >
                                            <option value="">Select Service Type...</option>
                                            <option value="Residential">Residential</option>
                                            <option value="Commercial">Commercial</option>
                                            <option value="Industrial">Industrial</option>
                                            {/* <option value="Automotive">Automotive</option> */}
                                            <option value="Other">Other</option>
                                        </Input>
                                    </InputGroup>
                                    {/* Product Selector */}
                                    <div className='product-selector '>
                                        <h5>Select Products:</h5> 
                                        {/* map each product from the array and a checkmark to add them to the quote */}
                                        <Row>
                                            {products.map((product) => (
                                                <Col className=''>
                                                    <FormGroup key={product.id}>

                                                        <Label check for={product.id}>
                                                            <Input
                                                                type="checkbox"
                                                                id={product.id}
                                                                checked={formData.products.includes(product)}
                                                                onChange={(e) => toggleProduct(e, product)}
                                                            />{' '}
                                                            {product.name}
                                                        </Label>

                                                    </FormGroup>
                                                </Col>
                                            ))}
                                        </Row>

                                    </div>


                                    {/* Service Selector */}
                                    <div className="service-selector ">
                                        <h5>Select Services:</h5>                                       
                                        <Row>
                                            {services.map((service) => (
                                                <Col>
                                                    <FormGroup key={service.id}>
                                                        <Label check for={service.id}>
                                                            <Input
                                                                type="checkbox"
                                                                id={service.id}
                                                                checked={formData.services.includes(service)}
                                                                onChange={(e) => toogleService(e, service)}
                                                            />{' '}
                                                            {service.name}
                                                        </Label>
                                                    </FormGroup>
                                                </Col>
                                            ))}
                                        </Row>
                                        
                                        <InputGroup>
                                            <Input
                                                placeholder='Subtotal Cost: $...'
                                                type='text'
                                                name='subtotalCost'
                                                onChange={(e) => handleChange(e)}
                                                value={formData.services.reduce((acc, service) => acc + service.serviceCost, 0) +
                                                    formData.products.reduce((acc, product) => acc + product.productCost, 0)}
                                                readOnly
                                            />
                                            <Input
                                                placeholder='Tax: $...'
                                                type='text'
                                                name='tax'
                                                onChange={(e) => handleChange(e)}
                                                value={(formData.services.reduce((acc, service) => acc + service.serviceCost, 0) +
                                                    formData.products.reduce((acc, product) => acc + product.productCost, 0)) * 0.13}
                                                readOnly
                                            />
                                            {/* <Input
                                            placeholder='Discount Code'
                                            type='text'
                                            value={formData.discountCode}
                                            onChange={handleChange}
                                        />
                                        <Input
                                            placeholder='Discount Amount: $...'
                                            type='text'
                                            value={formData.discountAmount}
                                            readOnly
                                        /> */}
                                            <Input
                                        placeholder='Grand Total: $...'
                                        type='text'
                                        name='grandTotal'
                                        onChange={() => handleChange(
                                            {
                                                target: {
                                                    name: 'grandTotal',
                                                    value: formData.services.reduce((acc, service) => acc + service.serviceCost, 0) +
                                                        formData.products.reduce((acc, product) => acc + product.productCost, 0) * 1.13
                                                    // value:formData.grandTotal
                                                }
                                            }
                                        )}
                                        value={formData.grandTotal}
                                        // formData.products.reduce((acc, product) => acc + product.productamount * product.productcostperquantity, 0) - formData.discountAmount}
                                        readOnly
                                    />
                                            {/* <Input
                                            placeholder='Payment Method'
                                            type='select'
                                            value={formData.paymentMethod}
                                            name='paymentMethod'
                                            onChange={handleChange}
                                        /> */}


                                        </InputGroup>
                                    </div>
                                    <div>

                                    </div>
                                    <div className="send-button">
                                        <Input
                                            type='checkbox'
                                            name='sendEmail'
                                            value={sendEmail}
                                            onChange={() => setSendEmail(!sendEmail)}
                                        />
                                        <Label for='sendEmail'>Email Form</Label>
                                        <Button
                                            block
                                            className="btn-round"
                                            color="info"
                                            type="submit"
                                        // onClick={handleSubmit}
                                        >
                                            Submit
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        {/* </Container> */}
                    </Form>
                    </div>
            </div>
                    <Footer />
        </>
    );
};

export default RequestQuote;
