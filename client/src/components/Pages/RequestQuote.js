import React, { useState, useEffect } from 'react';
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

const RequestQuote = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        email: '',
        products: [],
        services: []
    });

    const [costs, setCosts] = useState({
        productCosts: {},
        serviceCosts: {}
    });

    useEffect(() => {
        // Fetch costs for products and services
        const fetchCosts = async () => {
            try {
                const productCostsResponse = await fetch(`/api/products/:byName`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ names: formData.products })
                });
                const productCostsData = await productCostsResponse.json();
                setCosts((prevCosts) => ({
                    ...prevCosts,
                    productCosts: productCostsData
                }));

                const serviceCostsResponse = await fetch(`/api/services/:byName`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ names: formData.services })
                });
                const serviceCostsData = await serviceCostsResponse.json();
                setCosts((prevCosts) => ({
                    ...prevCosts,
                    serviceCosts: serviceCostsData
                }));
            } catch (error) {
                console.error('Error fetching costs:', error);
            }
        };

        if (formData.products.length > 0 || formData.services.length > 0) {
            fetchCosts();
        }
    }, [formData.products, formData.services]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleProductChange = (e, index) => {
        const { value } = e.target;
        const updatedProducts = [...formData.products];
        updatedProducts[index] = value;
        setFormData({ ...formData, products: updatedProducts });
    };

    const handleServiceChange = (e, index) => {
        const { value } = e.target;
        const updatedServices = [...formData.services];
        updatedServices[index] = value;
        setFormData({ ...formData, services: updatedServices });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Your fetch logic here
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
                            <Col className="text-center ml-auto mr-auto" lg="6" md="8">
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
                                <div className="textarea-container">
                                    <Input
                                        cols="80"
                                        name="description"
                                        placeholder="Message..."
                                        rows="4"
                                        type="textarea"
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </div>
                                {/* Product Selector */}
                                <div className="product-selector">
                                    <h5>Select Products:</h5>
                                    {formData.products.map((product, index) => (
                                        <InputGroup key={index}>
                                            <Input
                                                type="select"
                                                value={product}
                                                onChange={(e) => handleProductChange(e, index)}
                                            >
                                                <option value="">Select Product...</option>
                                                <option value="Shampoo">Shampoo</option>
                                                <option value="Spot Remover">Spot Remover</option>
                                                <option value="Carpet Deodorizer">Carpet Deodorizer</option>
                                                <option value="Stain Protector">Stain Protector</option>
                                                <option value="Carpet Cleaning Machine Rental">Carpet Cleaning Machine Rental</option>
                                            </Input>
                                            <Input
                                                placeholder="Amount..."
                                                type="number"
                                                value={product.amount}
                                                onChange={(e) =>
                                                    handleChange({
                                                        target: {
                                                            name: 'products',
                                                            value: formData.products.map((p, i) =>
                                                                i === index
                                                                    ? { ...p, amount: e.target.value }
                                                                    : p
                                                            )
                                                        }
                                                    })
                                                }
                                            />
                                            <Input
                                                placeholder="Cost per Quantity: $..."
                                                type="text"
                                                value={costs.productCosts[product]}
                                                readOnly
                                            />
                                        </InputGroup>
                                    ))}
                                    <Button
                                        color="primary"
                                        onClick={() =>
                                            setFormData((prevData) => ({
                                                ...prevData,
                                                products: [...prevData.products, '']
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
                                                value={service}
                                                onChange={(e) => handleServiceChange(e, index)}
                                            >
                                                <option value="">Select Service...</option>
                                                <option value="Deep Cleaning">Deep Cleaning</option>
                                                <option value="Spot Cleaning">Spot Cleaning</option>
                                                <option value="Stain Removal">Stain Removal</option>
                                                <option value="Odor Removal">Odor Removal</option>
                                                <option value="Area Rug Cleaning">Area Rug Cleaning</option>
                                            </Input>
                                            <Input
                                                placeholder="Amount..."
                                                type="number"
                                                value={service.amount}
                                                onChange={(e) =>
                                                    handleChange({
                                                        target: {
                                                            name: 'services',
                                                            value: formData.services.map((s, i) =>
                                                                i === index
                                                                    ? { ...s, amount: e.target.value }
                                                                    : s
                                                            )
                                                        }
                                                    })
                                                }
                                            />
                                            <Input
                                                placeholder="Cost per Quantity: $..."
                                                type="text"
                                                value={costs.serviceCosts[service]}
                                                readOnly
                                            />
                                        </InputGroup>
                                    ))}
                                    <Button
                                        color="primary"
                                        onClick={() =>
                                            setFormData((prevData) => ({
                                                ...prevData,
                                                services: [...prevData.services, '']
                                            }))
                                        }
                                    >
                                        Add Service
                                    </Button>
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
