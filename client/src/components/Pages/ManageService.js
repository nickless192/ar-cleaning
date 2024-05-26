import React, { useState } from 'react';
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

import Navbar from "components/Pages/Navbar.js";
import TransparentFooter from "components/Footers/TransparentFooter";

const ManageService = () => {
    const [formData, setFormData] = useState({
        serviceName: '',
        description: '',
        serviceCost: ''
    });

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
                            });
                    } else {
                        alert(response.statusText);
                    }
                })
                .catch(err => console.log(err));
        }

    };

    return (
        <>
            <Navbar />
            <div className="page-header clear-filter" filter-color="blue">
                <div
                    className="page-header-image"
                    style={{
                        backgroundImage: "url(" + require("assets/img/login.jpg") + ")"
                    }}
                ></div>
                <div className='content'>
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
                <div className="footer register-footer text-center">
                    <TransparentFooter />
                </div>
            </div>

        </>

    );
};

export default ManageService;
