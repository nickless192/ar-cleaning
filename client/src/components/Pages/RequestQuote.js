import React, { useState } from 'react';
import {
    Button,
    Container,
    Row,
    Col,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText
} from 'reactstrap'; // Importing required components from reactstrap

import html2pdf from 'html2pdf.js'; // Importing html2pdf library

const RequestQuote = ({ services, products }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        companyName: '',
        email: '',
        phonenumber: '',
        howDidYouHearAboutUs: '',
        subtotalCost: 0,
        tax: 0,
        // discountCode: '',
        // discountAmount: 0,
        grandTotal: 0,
        // paymentMethod: '',        
        services: [],
        products: []
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        setFormData({ ...formData, [name]: value });
    };

    const handleProductCost = (e, index) => {
        const { value } = e.target;
        const updatedProducts = [...formData.products];
        // console.log(value);
        // console.log(updatedProducts);
        // fetch(`http://localhost:3001/api/services/?name=Deep%20cleaning`)

        for (let i = 0; i < products.length; i++) {
            if (products[i].name === value) {
                // console.log(updatedProducts[index])
                // console.log(products[i].productCost);
                updatedProducts[index].productcostperquantity = products[i].productCost;
                setFormData({ ...formData, products: updatedProducts });
                return;
            }
        }
    }

    const handleServiceCost = (e, index) => {
        const { value } = e.target;
        const updatedServices = [...formData.services];
        // console.log(value);
        // fetch(`http://localhost:3001/api/services/?name=Deep%20cleaning`)

        for (let i = 0; i < services.length; i++) {
            if (services[i].name === value) {
                updatedServices[index].servicecostperquantity = services[i].serviceCost;
                setFormData({ ...formData, services: updatedServices });
                return;
            }
        }
    }

    const handleProductChange = async (e, index) => {
        const { name, value } = e.target;
        const updatedProducts = [...formData.products];
        if (name === 'product') {
            // retrieve cost from API call
            handleProductCost(e, index);
        }

        // console.log(updatedProducts); 
        updatedProducts[index][name] = value;
        setFormData({ ...formData, products: updatedProducts });
    };

    const handleServiceChange = async (e, index) => {
        const { name, value } = e.target;
        const updatedServices = [...formData.services];
        // console.log(updatedServices);
        // retrieve cost from API call
        if (name === 'service') {
            handleServiceCost(e, index);
        }
        // console.log(value);
        // updatedServices[index].service = value;
        updatedServices[index][name] = value;
        setFormData({ ...formData, services: updatedServices });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
        try {
            // Your fetch logic here
            // const response = await fetch('http://localhost:3001/api/quotes', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(formData)
            // });
            // if (response.ok) {
            //     alert('Quote submitted successfully!');
            //     setFormData({
            //         name: '',
            //         description: '',
            //         email: '',
            //         phonenumber: '',
            //         howDidYouHearAboutUs: '',
            //         subtotalCost: 0,
            //         tax: 0,
            //         // discountCode: '',
            //         // discountAmount: 0,
            //         grandTotal: 0,
            //         // paymentMethod: '',        
            //         services: [],
            //         products: []
            //     });
            // }

                // Generate PDF
                const element = document.getElementById('quote-form'); // Replace 'quote-form' with the ID of the form element
                const opt = {
                    margin: 0.5,
                    filename: 'quote.pdf', // parametarize the filename with the quote ID
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                };
                html2pdf().set(opt).from(element).save(); // Generate and save the PDF


        } catch (error) {
            console.error('Error submitting quote:', error);
        }
    };

    return (
        <>
            <div className="wrapper">
                <div className="section section-contact-us text-center">
                    <Container>
                        <h2 className="title">Request a Quote</h2>
                        <p className="description">Please fill out the form below:</p>
                        <Row>
                            <Col className="text-center ml-auto mr-auto" lg="6" md="8"
                                id='quote-form'
                            >
                                <InputGroup className="input-lg">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                            <i className="now-ui-icons users_circle-08"></i>
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input
                                        placeholder="Your Name..."
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </InputGroup>
                                <InputGroup className="input-lg">
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
                                <InputGroup className="input-lg">
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
                                <InputGroup className="input-lg">
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
                                <InputGroup className="input-lg">
                                    <Input
                                        cols="80"
                                        name="description"
                                        placeholder="Message..."
                                        rows="4"
                                        type="textarea"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </InputGroup>
                                <InputGroup className="input-lg">
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
                                {/* Product Selector */}
                                <div className="product-selector">
                                    <h5>Select Products:</h5>
                                    {formData.products.map((product, index) => (
                                        <InputGroup key={index}>
                                            <Input
                                                type="select"
                                                value={product.product}
                                                name='product'
                                                onChange={(e) => handleProductChange(e, index)}
                                            >
                                                <option value="">Select Product...</option>
                                                {products.map((product) => (
                                                    <option key={product._id} value={product.name}>
                                                        {product.name}
                                                    </option>
                                                ))}
                                                {/* <option value="Shampoo">Shampoo</option>
                                                <option value="Spot Remover">Spot Remover</option>
                                                <option value="Carpet Deodorizer">Carpet Deodorizer</option>
                                                <option value="Stain Protector">Stain Protector</option>
                                                <option value="Carpet Cleaning Machine Rental">Carpet Cleaning Machine Rental</option> */}
                                            </Input>
                                            <Input
                                                placeholder="Amount..."
                                                type="text"
                                                value={product.productamount}
                                                name='productamount'
                                                onChange={(e) =>
                                                    handleProductChange(e, index)
                                                }
                                            />
                                            <Input
                                                placeholder="Cost per Quantity: $..."
                                                type="text"
                                                name='productcostperquantity'
                                                value={product.productcostperquantity}
                                                readOnly
                                            />
                                            <Input
                                                placeholder="Total Cost: $..."
                                                type="text"
                                                name='producttotalcost'
                                                value={product.productamount * product.productcostperquantity}
                                                readOnly
                                            />
                                            <Button
                                                color="danger"
                                                onClick={() =>
                                                    setFormData((prevData) => ({
                                                        ...prevData,
                                                        products: prevData.products.filter(
                                                            (product, i) => i !== index
                                                        )
                                                    }))
                                                }
                                            >
                                                Remove Product
                                            </Button>
                                        </InputGroup>
                                    ))}
                                    <Button
                                        color="primary"
                                        onClick={() =>
                                            setFormData((prevData) => ({
                                                ...prevData,
                                                products: [...prevData.products, {}]
                                            }))
                                        }
                                    >
                                        Add Product
                                    </Button>
                                </div>


                                {/* Service Selector */}
                                <div className="service-selector">
                                    <h5>Select Services:</h5>
                                    {formData.services.map((service, index) => (
                                        <InputGroup key={index}>
                                            <Input
                                                type="select"
                                                value={service.service}
                                                name='service'
                                                onChange={(e) => handleServiceChange(e, index)}
                                            >
                                                <option value="">Select Service...</option>
                                                {services.map((service) => (
                                                    <option key={service._id} value={service.name}>
                                                        {service.name}
                                                    </option>
                                                ))}
                                                {/* <option value="Deep cleaning">Deep Cleaning</option>
                                                <option value="Spot cleaning">Spot Cleaning</option>
                                                <option value="Stain Removal">Stain Removal</option>
                                                <option value="Odor Removal">Odor Removal</option>
                                                <option value="Area Rug Cleaning">Area Rug Cleaning</option> */}
                                            </Input>

                                            <Input
                                                placeholder="Amount..."
                                                type="text"
                                                value={service.serviceamount}
                                                name='serviceamount'
                                                onChange={(e) =>
                                                    // handleChange(e)
                                                    handleServiceChange(e, index)
                                                }


                                            />
                                            <Input
                                                placeholder="Cost per Quantity: $..."
                                                type="text"
                                                name='servicecostperquantity'
                                                value={service.servicecostperquantity}
                                                readOnly
                                            />
                                            <Input
                                                placeholder="Total Cost: $..."
                                                type="text"
                                                name='servicetotalcost'
                                                onChange={(e) =>
                                                    // handleChange(e)
                                                    handleChange(e)
                                                }
                                                value={service.serviceamount * service.servicecostperquantity}
                                                readOnly
                                            />
                                            <Button
                                                color="danger"
                                                onClick={() =>
                                                    setFormData((prevData) => ({
                                                        ...prevData,
                                                        services: prevData.services.filter(
                                                            (service, i) => i !== index
                                                        )
                                                    }))
                                                }
                                            >
                                                Remove Service
                                            </Button>
                                        </InputGroup>
                                    ))}
                                    <Button
                                        color="primary"
                                        onClick={() =>
                                            setFormData((prevData) => ({
                                                ...prevData,
                                                services: [...prevData.services, {}]
                                            }))
                                        }
                                    >
                                        Add Service
                                    </Button>
                                    <InputGroup>
                                        <Input
                                            placeholder='Subtotal Cost: $...'
                                            type='text'
                                            name='subtotalCost'
                                            onChange={(e) => handleChange(e)}
                                            value={formData.services.reduce((acc, service) => acc + service.serviceamount * service.servicecostperquantity, 0) +
                                                formData.products.reduce((acc, product) => acc + product.productamount * product.productcostperquantity, 0)}
                                            readOnly
                                        />
                                        <Input
                                            placeholder='Tax: $...'
                                            type='text'
                                            name='tax'
                                            onChange={(e) => handleChange(e)}
                                            value={(formData.services.reduce((acc, service) => acc + service.serviceamount * service.servicecostperquantity, 0) +
                                                formData.products.reduce((acc, product) => acc + product.productamount * product.productcostperquantity, 0)) * 0.13}
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
                                                        value: formData.services.reduce((acc, service) => acc + service.serviceamount * service.servicecostperquantity, 0) +
                                                            formData.products.reduce((acc, product) => acc + product.productamount * product.productcostperquantity, 0) * 1.13                                                            
                                                }}
                                            )}
                                            value={formData.services.reduce((acc, service) => acc + service.serviceamount * service.servicecostperquantity, 0) +
                                                formData.products.reduce((acc, product) => acc + product.productamount * product.productcostperquantity, 0) * 1.13}
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
                                <div className="send-button">
                                    <Button
                                        block
                                        className="btn-round"
                                        color="info"
                                        type="submit"
                                        size="lg"
                                        onClick={handleSubmit}
                                    >
                                        Submit
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        </>
    );
};

export default RequestQuote;