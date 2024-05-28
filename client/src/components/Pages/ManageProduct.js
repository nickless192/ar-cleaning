import React, { useState, useEffect } from 'react';

import {
    Button,
    Container,
    Row,
    Col,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Form, Card, CardBody, CardTitle, CardText
} from 'reactstrap';

import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";


const ManageProduct = () => {
    const [formData, setFormData] = useState({
        productName: '',
        description: '',
        productCost: '',
        quantityAtHand: ''
    });

    const [products, setProducts] = useState([]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        if (formData.productName && formData.description && formData.productCost && formData.quantityAtHand) {
            const body = {
                name: formData.productName,
                description: formData.description,
                productCost: formData.productCost,
                quantityAtHand: formData.quantityAtHand
            };
            fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })
                .then(response => {
                    if (response.ok) {
                        console.log(response);
                        console.log('Product added!');
                        response.json()
                            .then(data => {
                                console.log(data);
                                alert(`Product ${data.name} added!`);
                                setProducts([...products, data]);
                                setFormData({
                                    name: '',
                                    description: '',
                                    productCost: '',
                                    quantityAtHand: ''
                                });

                            });
                    } else {
                        alert(response.statusText);
                    }
                })
                .catch(err => console.log(err));
        }
    };

    useEffect(() => {
        fetch('/api/products', {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => setProducts(data))
            .catch(error => console.log(error));
    }, []);

    return (
        <>
            <Navbar />
            <div className="page-header clear-filter" filter-color="blue">
                <div
                    className="page-header-image"
                    style={{
                        backgroundImage: "url(" + require("assets/img/login.jpg") + ")",
                        backgroundRepeat: "repeat",
                        backgroundSize: "auto"
                    }}
                ></div>
                <div className="content">
                    <Container>
                        <h2>All Products`</h2>
                        <Row>
                            {products.map(product => (
                                <Col key={product.id} className="text-center ml-auto mr-auto" lg="6" md="8">
                                    <Card className='shadow-sm mb-4 border-0'>
                                        <CardBody className='p-4'>
                                            <CardTitle tag='h5' className='text-primary mb-3'>
                                                {product.name}
                                            </CardTitle>
                                            <CardText className='text-secondary'>
                                                {product.description.toUpperCase()}
                                            </CardText>
                                            <CardText className='font-weight-bold text-secondary'>
                                                Cost per Quantity: <span className='text-success'>{product.productCost}</span>
                                            </CardText>
                                            <CardText className='font-weight-bold text-info'>
                                                Quantity at Hand: <span className='text-success'>{product.quantityAtHand}</span>
                                            </CardText>
                                        </CardBody>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Container>

                    <Form onSubmit={handleSubmit} className='form'>
                        <Container>

                            <h2>Add Product</h2>
                            <p className='text-muted'>Please fill in the form to add a new product</p>
                            <Row>
                                <Col className="text-center ml-auto mr-auto" lg="6" md="8"
                                    id='product-form'>
                                    <InputGroup className={
                                        "no-border" + (formData.productName ? " input-group-focus" : "")
                                    }>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="now-ui-icons shopping_tag-content"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input placeholder="Product Name" type="text" id="productName" name="productName" value={formData.productName} onChange={handleChange} />
                                    </InputGroup>
                                </Col>
                                <Col className="text-center ml-auto mr-auto" lg="6" md="8"
                                    id='product-form'>
                                    <InputGroup className={
                                        "no-border" + (formData.description ? " input-group-focus" : "")
                                    }>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="now-ui-icons shopping_box"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input placeholder="Description" type="text" id="description" name="description" value={formData.description} onChange={handleChange} />
                                    </InputGroup>
                                </Col>
                                <Col className="text-center ml-auto mr-auto" lg="6" md="8"
                                    id='product-form'>
                                    <InputGroup className={
                                        "no-border" + (formData.productCost ? " input-group-focus" : "")
                                    }>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="now-ui-icons shopping_cart-simple"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input placeholder="Cost per Quantity" type="text" id="productCost" name="productCost" value={formData.productCost} onChange={handleChange} />
                                    </InputGroup>
                                </Col>
                                <Col className="text-center ml-auto mr-auto" lg="6" md="8"
                                    id='product-form'>
                                    <InputGroup className={
                                        "no-border" + (formData.quantityAtHand ? " input-group-focus" : "")
                                    }>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="now-ui-icons shopping_delivery-fast"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input placeholder="Quantity at Hand" type="text" id="quantityAtHand" name="quantityAtHand" value={formData.quantityAtHand} onChange={handleChange} />
                                    </InputGroup>
                                </Col>
                                <Col className="text-center ml-auto mr-auto" lg="6" md="8"
                                    id='product-form'>
                                    <Button type='submit' color='primary'>Add Product</Button>
                                </Col>
                            </Row>
                        </Container>
{/* 
                            <div>
                                <label htmlFor="productName">Product Name:</label>
                                <input
                                    type="text"
                                    id="productName"
                                    name="productName"
                                    value={formData.productName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="productDescription">Description:</label>
                                <textarea
                                    id="productDescription"
                                    name="productDescription"
                                    value={formData.productDescription}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                            <div>
                                <label htmlFor="productCost">Cost per Quantity:</label>
                                <input
                                    type="text"
                                    id="productCost"
                                    name="productCost"
                                    value={formData.productCost}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="quantityAtHand">Quantity at Hand:</label>
                                <input
                                    type="text"
                                    id="quantityAtHand"
                                    name="quantityAtHand"
                                    value={formData.quantityAtHand}
                                    onChange={handleChange}
                                />
                            </div>
                            <button type="submit">Add Product</button> */}

                    </Form>

                </div>
                <div className="footer register-footer text-center">
                <Footer />
                    </div>
            </div>
        </>

    );
};

export default ManageProduct;
