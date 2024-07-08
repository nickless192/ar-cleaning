// /**
//  * ManageProduct component for managing products.
//  *
//  * @component
//  * @returns {JSX.Element} ManageProduct component
//  */
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
    Form, Card, CardBody, CardTitle, CardText,
    CardFooter
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
    const [editingProductId, setEditingProductId] = useState(null);
    const [editedProduct, setEditedProduct] = useState({});

    const handleEditClick = (product) => {
        setEditingProductId(product._id);
        setEditedProduct({ ...product });
    };

    const handleSaveClick = () => {
        const { name, description, productCost, quantityAtHand } = editedProduct;
        if (!name || !description || !productCost || !quantityAtHand) {
            alert('Please provide all fields');
            return;
        }
        const body = JSON.stringify({
            name,
            description,
            productCost,
            quantityAtHand
        });

        fetch(`/api/products/${editingProductId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        })
            .then(response => {
                if (response.ok) {
                    response.json()
                        .then(data => {
                            alert(`Product ${data.name} updated!`);
                            setProducts(products.map(product => product._id === editingProductId ? data : product));
                            setEditedProduct({});
                            setEditingProductId(null);
                        });
                } else {
                    alert(response.statusText);
                }
            })
            .catch(err => console.log(err));
    };

    const handleCancelClick = () => {
        setEditingProductId(null);
        setEditedProduct({});
    };

    const handleDeleteClick = () => {
        fetch(`/api/products/${editingProductId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    response.json()
                        .then(data => {
                            alert(`Product ${data.name} deleted!`);
                            setProducts(products.filter(product => product._id !== editingProductId));
                            setEditedProduct({});
                            setEditingProductId(null);
                        });
                } else {
                    alert(response.statusText);
                }
            })
            .catch(err => console.log(err));
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditedProduct(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
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
                        response.json()
                            .then(data => {
                                alert(`Product ${data.name} added!`);
                                setProducts([...products, data]);
                                setFormData({
                                    productName: '',
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

        document.body.classList.add("manage-product-page");
        document.body.classList.add("sidebar-collapse");
        document.documentElement.classList.remove("nav-open");
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        return function cleanup() {
            document.body.classList.remove("manage-product-page");
            document.body.classList.remove("sidebar-collapse");
        };
    }, []);

    return (
        <>
            <Navbar />
            <div className="page-header clear-filter" filter-color="blue">
                <div
                    className="page-header-image"
                    style={{
                        backgroundImage: "url(" + require("assets/img/stock-photo-cropped-shot-woman-rubber-gloves-cleaning-office-table.jpg") + ")",
                        backgroundSize: "cover",
                        backgroundPosition: "top center",
                        minHeight: "700px"
                    }}
                >
                </div>
                <div className="container">
                    <h2>All Products</h2>
                    <Row className='ml-auto mr-auto'>
                        {products.map(product => (
                            <Col key={product._id} className="text-center " lg="6" md="8">
                                <Card className='shadow-sm border-0 km-bg-test'>
                                    {editingProductId === product._id ? (
                                        <CardBody>
                                            <Input
                                                type="text"
                                                name="name"
                                                value={editedProduct.name}
                                                onChange={handleEditChange}
                                                placeholder="Product Name"
                                            />
                                            <Input
                                                type="text"
                                                name="description"
                                                value={editedProduct.description}
                                                onChange={handleEditChange}
                                                placeholder="Description"
                                            />
                                            <Input
                                                type="text"
                                                name="productCost"
                                                value={editedProduct.productCost}
                                                onChange={handleEditChange}
                                                placeholder="Cost per Quantity"
                                            />
                                            <Input
                                                type="text"
                                                name="quantityAtHand"
                                                value={editedProduct.quantityAtHand}
                                                onChange={handleEditChange}
                                                placeholder="Quantity at Hand"
                                            />
                                            <Button color="primary" onClick={handleSaveClick}>Save</Button>
                                            <Button color="secondary" onClick={handleCancelClick}>Cancel</Button>
                                            <Button color="danger" onClick={handleDeleteClick}>Delete</Button>
                                        </CardBody>
                                    ) : (
                                        <>
                                            <CardTitle tag='h5' className='text-primary '>
                                                {product.name}
                                            </CardTitle>
                                            <CardText className='text-secondary'>
                                                {product.description.toUpperCase()}
                                            </CardText>
                                            <CardFooter className='font-weight-bold text-secondary'>
                                                Cost per Quantity: <span className='text-success'>{product.productCost}</span><br />
                                                Quantity at Hand: <span className='text-success'>{product.quantityAtHand}</span>
                                            </CardFooter>
                                            <Button
                                                color="primary"
                                                onClick={() => handleEditClick(product)}
                                                disabled={editingProductId !== null && editingProductId !== product._id}
                                            >
                                                Edit
                                            </Button>
                                        </>
                                    )}
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <Form onSubmit={handleSubmit} className='form'>
                        <Container>
                            <h2>Add Product</h2>
                            <p className='text-muted'>Please fill in the form to add a new product</p>
                            <Row>
                                <Col className="text-center ml-auto mr-auto" lg="6" md="8">
                                    <InputGroup className={
                                        "no-border" + (formData.productName ? " input-group-focus" : "")
                                    }>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="now-ui-icons shopping_tag-content"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            placeholder="Product Name"
                                            type="text"
                                            id="productName"
                                            name="productName"
                                            value={formData.productName}
                                            onChange={handleChange}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col className="text-center ml-auto mr-auto" lg="6" md="8">
                                    <InputGroup className={
                                        "no-border" + (formData.description ? " input-group-focus" : "")
                                    }>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="now-ui-icons shopping_box"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            placeholder="Description"
                                            type="text"
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col className="text-center ml-auto mr-auto" lg="6" md="8">
                                    <InputGroup className={
                                        "no-border" + (formData.productCost ? " input-group-focus" : "")
                                    }>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="now-ui-icons shopping_cart-simple"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            placeholder="Cost per Quantity"
                                            type="text"
                                            id="productCost"
                                            name="productCost"
                                            value={formData.productCost}
                                            onChange={handleChange}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col className="text-center ml-auto mr-auto" lg="6" md="8">
                                    <InputGroup className={
                                        "no-border" + (formData.quantityAtHand ? " input-group-focus" : "")
                                    }>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="now-ui-icons shopping_delivery-fast"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            placeholder="Quantity at Hand"
                                            type="text"
                                            id="quantityAtHand"
                                            name="quantityAtHand"
                                            value={formData.quantityAtHand}
                                            onChange={handleChange}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col className="text-center ml-auto mr-auto" lg="6" md="8">
                                    <Button type='submit' color='primary'>Add Product</Button>
                                </Col>
                            </Row>
                        </Container>
                    </Form>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ManageProduct;
