import React, { useState, useEffect } from 'react';
import "assets/css/our-palette.css";
import {
    Button,
    Container,
    Row,
    Col,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    FormGroup,
    Label,
    Form, Card, CardBody, CardTitle, CardText,
    CardHeader
} from 'reactstrap'; // Importing required components from reactstrap


const ManageService = () => {
    const [formData, setFormData] = useState({
        serviceName: '',
        description: '',
        serviceCost: '',
        isResidential: false,
        isCommercial: false,
        isIndustrial: false,
        serviceLevel: ''
    });

    const [services, setServices] = useState([]);

    const [editingServiceId, setEditingServiceId] = useState(null);
    const [editedService, setEditedService] = useState({});

    const handleEditClick = (service) => {
        console.log(service);
        setEditingServiceId(service._id);
        setEditedService({ ...service });
    };

    // the handleSaveClick function is called when the save button is clicked and the edited service is saved so the function needs to receive a service.id as an argument
    const handleSaveClick = () => {
        // onSave(editedService);
        // api call to update service        
        const { name, description, serviceCost } = editedService;
        if (!name || !description || !serviceCost) {
            alert('Please provide all fields');
            return;
        }
        const body = JSON.stringify({
            name,
            description,
            serviceCost
        });

        fetch(`/api/services/${editingServiceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        })
            .then(response => {
                if (response.ok) {
                    console.log(response);
                    console.log('Service updated!');
                    response.json()
                        .then(data => {
                            console.log(data);
                            alert(`Service ${data.name} updated!`);
                            setServices(services.map(service => service._id === editingServiceId ? data : service));
                            setEditedService({});
                            setEditingServiceId(null);
                        });
                } else {
                    alert(response.statusText);
                }
            })
            .catch(err => console.log(err));
        setEditedService({});
        setEditingServiceId(null);
    };

    const handleCancelClick = () => {
        setEditingServiceId(null);
        setEditedService({});
    };

    const handleDeleteClick = () => {
        // onDelete(serviceId);
        // api call to delete service
        fetch(`/api/services/${editingServiceId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    console.log(response);
                    console.log('Service deleted!');
                    response.json()
                        .then(data => {
                            console.log(data);
                            alert(`Service ${data.name} deleted!`);
                            setServices(services.filter(service => service._id !== editingServiceId));
                            setEditedService({});
                            setEditingServiceId(null);
                        });
                } else {
                    alert(response.statusText);
                }
            })
            .catch(err => console.log(err));
        setEditedService({});
        setEditingServiceId(null);

    };

    const handleChange = (e) => {
        // setFormData({
        //     ...formData,
        //     [e.target.name]: e.target.value
        // });
        const { name, value, type, checked } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // console.log(formData);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditedService(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        if (formData.serviceName && formData.description && formData.serviceCost && (formData.isResidential || formData.isCommercial || formData.isIndustrial) && formData.serviceLevel) {
            const body = {
                name: formData.serviceName,
                description: formData.description,
                serviceCost: formData.serviceCost,
                isResidential: formData.isResidential,
                isCommercial: formData.isCommercial,
                isIndustrial: formData.isIndustrial,
                serviceLevel: formData.serviceLevel
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
                                    serviceCost: '',
                                    isResidential: false,
                                    isCommercial: false,
                                    isIndustrial: false,
                                    serviceLevel: ''
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
            {/* <Navbar /> */}
            {/* <div className="page-header clear-filter" filter-color="blue"> */}
            <div
                className="section page-header-image"
                style={{
                    backgroundImage: "url(" + require("assets/img/stock-photo-cropped-shot-woman-rubber-gloves-cleaning-office-table.jpg") + ")",
                    backgroundSize: "cover",
                    backgroundPosition: "top center",
                    minHeight: "700px"
                }}
            >
                <div className='content'>

                    <Container>
                        <h2>All Services</h2>
                        <Row>
                            {services.map(service => (
                                <Col key={service._id} className="text-center ml-auto mr-auto" lg="6" md="8">
                                    <Card className='km-bg-test'>
                                        {editingServiceId === service._id ? (
                                            <CardBody>
                                                <Input
                                                    type="text"
                                                    name="name"
                                                    value={editedService.name}
                                                    onChange={handleEditChange}
                                                    placeholder="Service Name"
                                                />
                                                <Input
                                                    type="text"
                                                    name="description"
                                                    value={editedService.description}
                                                    onChange={handleEditChange}
                                                    placeholder="Description"
                                                />
                                                <Input
                                                    type="text"
                                                    name="serviceCost"
                                                    value={editedService.serviceCost}
                                                    onChange={handleEditChange}
                                                    placeholder="Cost per Quantity"
                                                />
                                                <Button color="primary" onClick={handleSaveClick}>Save</Button>
                                                <Button color="secondary" onClick={handleCancelClick}>Cancel</Button>
                                                <Button color="danger" onClick={handleDeleteClick}>Delete</Button>
                                            </CardBody>
                                        ) : (
                                            <>
                                                <CardHeader tag='h5' className='text-primary '>
                                                    {service.name}
                                                </CardHeader>
                                                <CardBody>
                                                    <CardTitle className='text-secondary'>
                                                        {service.description.toUpperCase()}
                                                    </CardTitle>
                                                    <CardText className='font-weight-bold text-secondary'>
                                                        Cost per Quantity: <span className='text-success'>{service.serviceCost}</span>
                                                    </CardText>
                                                    <Button
                                                        color="primary"
                                                        onClick={() => handleEditClick(service)}
                                                        disabled={editingServiceId !== null && editingServiceId !== service._id}
                                                    >
                                                        Edit
                                                    </Button>
                                                </CardBody>
                                            </>
                                        )}
                                    </Card>
                                </Col>
                            ))}

                        </Row>

                        <Form onSubmit={handleSubmit} className='form'>
                            {/* <Container> */}
                            <h2 className='title'>Add Service</h2>
                            <p className='description '>Add a new service to the list of services</p>

                            <Row>
                                <Col className="text-center ml-auto mr-auto" lg="6" md="8"
                                    id='service-form'>
                                    <InputGroup className={
                                        "no-border" + (formData.name ? " input-group-focus" : "")
                                    }>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText className='km-bg-test'>
                                                <i className="now-ui-icons users_circle-08"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            placeholder='Service Name...'
                                            type="text"
                                            className='km-bg-test'
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
                                            <InputGroupText className='km-bg-test'>
                                                <i className="now-ui-icons business_money-coins"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            placeholder='Cost per Quantity...'
                                            type="text"
                                            id="serviceCost"
                                            name="serviceCost"
                                            className='km-bg-test'
                                            value={formData.serviceCost}
                                            onChange={handleChange}
                                        />
                                    </InputGroup>
                                    <InputGroup className={
                                        "no-border" + (formData.description ? " input-group-focus" : "")
                                    }>
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText className='km-bg-test'>

                                                <i className="now-ui-icons ui-2_chat-round"></i>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            placeholder='Description...'
                                            type="textarea"
                                            id="description"
                                            name="description"
                                            className='rounded km-bg-test'
                                            value={formData.description}
                                            onChange={handleChange}
                                        />
                                    </InputGroup>
                                    <InputGroup className={
                                        "no-border" + (formData.serviceLevel ? " input-group-focus" : "")
                                    }>
                                        {/* <InputGroupAddon addonType="prepend">
                                            <InputGroupText className='km-bg-test'>

                                                <i className="now-ui-icons ui-2_chat-round"></i>
                                            </InputGroupText>
                                        </InputGroupAddon> */}
                                        <Label>Select Service Level</Label>
                                        <Input type="select" name="serviceLevel" value={formData.serviceLevel} onChange={handleChange}>
                                <option value="">Select Service Level...</option>
                                <option value="Basic Cleaning">Basic Cleaning</option>
                                <option value="Deep Cleaning">Deep Cleaning</option>
                                <option value="Special Deal">Special Deal</option>
                            </Input>
                                        </InputGroup>
                                    {/* need to add checkboxes to indicate if the service is applicable for residential, commercial and/or industrial */}
                                    {/* <InputGroup>
                                    <InputGroupAddon addonType='prepend'>
                                        <InputGroupText className='km-bg-test'>
                                            
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    </InputGroup> */}
                                    <FormGroup check>
                                        <p className='primary-color'>Applicable for Which Service Types?</p>
                                        
                                        {/* <div className="form-check form-check-inline"> */}
                                            <Label spellCheck className="form-check-label">
                                                <Input
                                                    type="checkbox"
                                                    name="isResidential"
                                                    checked={formData.isResidential}
                                                    onChange={handleChange}
                                                />
                                                <span className="form-check-sign"></span>
                                                Residential
                                            </Label>
                                        {/* </div> */}
                                        {/* <div className="form-check form-check-inline"> */}
                                            <Label check className="form-check-label">
                                                <Input
                                                    type="checkbox"
                                                    name="isCommercial"
                                                    checked={formData.isCommercial}
                                                    onChange={handleChange}
                                                />
                                                 <span className="form-check-sign"></span>
                                                Commercial
                                            </Label>
                                        {/* </div> */}
                                        {/* <div className="form-check form-check-inline"> */}
                                            <Label className="form-check-label">
                                                <Input
                                                    type="checkbox"
                                                    name="isIndustrial"
                                                    checked={formData.isIndustrial}
                                                    onChange={handleChange}
                                                />
                                                <span className="form-check-sign"></span>
                                                Industrial
                                            </Label>
                                        {/* </div> */}
                                    </FormGroup>




                                </Col>
                            </Row>
                            {/* </Container> */}

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
                    </Container>
                </div>
            </div>
            {/* </div> */}
            {/* <Footer /> */}
        </>

    );
};

export default ManageService;
