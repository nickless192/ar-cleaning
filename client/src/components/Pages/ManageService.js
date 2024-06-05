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
} from 'reactstrap'; // Importing required components from reactstrap

import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";

const ManageService = () => {
    const [formData, setFormData] = useState({
        serviceName: '',
        description: '',
        serviceCost: ''
    });

    const [services, setServices] = useState([]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        if (formData.serviceName && formData.description && formData.serviceCost) {
            const body = {
                name: formData.serviceName,
                description: formData.description,
                serviceCost: formData.serviceCost
            };
            fetch(`/api/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })
                .then(response => {
                    if (response.ok) {
                        console.log(response);
                        console.log('Service added!');
                        response.json()
                            .then(data => {
                                console.log(data);
                                alert(`Service ${data.name} added!`);
                                setServices([...services, data]);
                                setFormData({
                                    serviceName: '',
                                    description: '',
                                    serviceCost: ''
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
        fetch('/api/services', {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => setServices(data))
            .catch(error => console.log(error));

        document.body.classList.add("manage-service-page");
        document.body.classList.add("sidebar-collapse");
        document.documentElement.classList.remove("nav-open");
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        return function cleanup() {
            document.body.classList.remove("manage-service-page");
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
                        backgroundImage: "url(" + require("assets/img/login.jpg") + ")",
                        backgroundSize: "cover",
                        backgroundPosition: "top center",
                        minHeight: "700px"
                    }}
                ></div>
                <div className='container'>

                    {/* <Container> */}
                    <h2>All Services</h2>
                    <Row>
                        {services.map(service => (
                            <Col key={service.id} className="text-center ml-auto mr-auto" lg="6" md="8">
                                <Card className='shadow-sm mb-4 border-0'>
                                    <CardBody className='p-4'>
                                        <CardTitle tag='h5' className='text-primary mb-3'>
                                            {service.name}
                                        </CardTitle>
                                        <CardText className='text-secondary'>
                                            {service.description.toUpperCase()}
                                        </CardText>
                                        <CardText className='font-weight-bold text-secondary'>
                                            Cost per Quantity: <span className='text-success'>{service.serviceCost}</span>
                                        </CardText>
                                    </CardBody>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    {/* </Container> */}
                    <Form onSubmit={handleSubmit} className='form'>
                        <Container>
                            <h2 className='title'>Add Service</h2>
                            <p className='description'>Add a new service to the list of services</p>

                            <Row>
                                <Col className="text-center ml-auto mr-auto" lg="6" md="8"
                                    id='service-form'>
                                    <InputGroup className={
                                        "no-border" + (formData.name ? " input-group-focus" : "")
                                    }>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="now-ui-icons users_circle-08"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            placeholder='Service Name...'
                                            type="text"
                                            id="serviceName"
                                            name="serviceName"
                                            value={formData.serviceName}
                                            onChange={handleChange}
                                        />
                                    </InputGroup>
                                    <InputGroup className={
                                        "no-border" + (formData.serviceCost ? " input-group-focus" : "")
                                    }>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="now-ui-icons business_money-coins"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            placeholder='Cost per Quantity...'
                                            type="text"
                                            id="serviceCost"
                                            name="serviceCost"
                                            value={formData.serviceCost}
                                            onChange={handleChange}
                                        />
                                    </InputGroup>
                                    <InputGroup className={
                                        "no-border" + (formData.description ? " input-group-focus" : "")
                                    }>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>

                                                <i className="now-ui-icons ui-2_chat-round"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            placeholder='Description...'
                                            type="textarea"
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                        />
                                    </InputGroup>
                                </Col>
                            </Row>
                        </Container>

                        {/* <div>
                    <label htmlFor="serviceName">Service Name:</label>
                    <input
                        type="text"
                        id="serviceName"
                        name="serviceName"
                        value={formData.serviceName}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="serviceCost">Cost per Quantity:</label>
                    <input
                        type="text"
                        id="serviceCost"
                        name="serviceCost"
                        value={formData.serviceCost}
                        onChange={handleChange}
                    />
                </div> */}
                        <Button type="submit">Add Service</Button>
                        {/* <button type="submit">Add Service</button> */}
                    </Form>

                </div>
            </div>
            <Footer />
        </>

    );
};

export default ManageService;
