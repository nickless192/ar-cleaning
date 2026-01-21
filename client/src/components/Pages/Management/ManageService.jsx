import React, { useState, useEffect, useRef } from 'react';
import {
    //     Button,
    Container,
    //     Row,
    //     Col,
    //     Input,
    //     InputGroup,
    //     // InputGroupAddon,
    //     InputGroupText,
    //     FormGroup,
    //     Label,
    //     Form, Card, CardBody, CardTitle, CardText,
    //     CardHeader
} from 'reactstrap'; // Importing required components from reactstrap
import { Button, Form, Row, Col, Card, Table, ButtonGroup } from 'react-bootstrap';
import { FaEdit, FaTrash, FaCopy } from 'react-icons/fa';

import { v4 as uuidv4 } from 'uuid';
import { t } from 'i18next';

const ManageService = () => {
    const [formData, setFormData] = useState({
        categoryKey: '',
        name: '',
        nameKey: '',
        descriptionKey: '',
        cost: 0,
        isActive: true,
        options: [],
        order: 0,
        isVisible: true,
    });

    const [optionInput, setOptionInput] = useState({
        key: '',
        labelKey: '',
        type: 'select',
        unitKey: '',
        required: true,
        isVisible: true,
        defaultValue: '',
        choices: [],
    });

    const [choiceInput, setChoiceInput] = useState({
        labelKey: '',
        value: '',
        optionCost: 0,
    });

    const [services, setServices] = useState([]);

    const [categories, setCategories] = useState([]);
    // const [optionInput, setOptionInput] = useState({ labelKey: '', value: '', optionCost: 0 });

    const [editingServiceId, setEditingServiceId] = useState(null);
    const [editedService, setEditedService] = useState({});
    const [editingOption, setEditingOption] = useState(null);
    const [editingChoice, setEditingChoice] = useState(null);
    const addServiceRef = useRef(null);

    const handleEditClick = (service) => {
        console.log(service);
        setEditingServiceId(service._id);
        setFormData({ ...service });
        scrollToAddSection();
    };

    const scrollToAddSection = () => {
  const yOffset = -110; 
  const y = addServiceRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;

  window.scrollTo({ top: y, behavior: 'smooth' });
};

    const handleDuplicateService = async (service) => {
        const confirmed = window.confirm(`Are you sure you want to duplicate "${service.name}"?`);
        if (!confirmed) return;
        try {
            const response = await fetch(`/api/services/duplicate/${service._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: `${service.name} (Copy)` // Optional custom name
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to duplicate service');
            }

            const newService = await response.json();

            // Optional: Refresh the list or give feedback
            alert(`Service duplicated: ${newService.name}`);
            fetchServices(); // Or whatever your list-refresh method is
        } catch (error) {
            console.error('Duplicate error:', error);
            alert(error.message);
        }
    };

    const handleCancelClick = () => {
        setEditingServiceId(null);
        setEditedService({});
        setFormData({
            categoryKey: '',
            name: '',
            nameKey: '',
            descriptionKey: '',
            cost: 0,
            isActive: true,
            options: [],
            order: 0,
            isVisible: true,
        });
    };

    const handleDeleteClick = (serviceId) => {
        // onDelete(serviceId);
        // api call to delete service
        const confirmed = window.confirm("Are you sure you want to delete this service?");
        if (!confirmed) return;
        fetch(`/api/services/${serviceId}`, {
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
                            fetchServices(); // Or whatever your list-refresh method is
                            // setServices(services.filter(service => service._id !== editingServiceId));
                            // setEditedService({});
                            // setEditingServiceId(null);
                        });
                } else {
                    alert(response.statusText);
                }
            })
            .catch(err => console.log(err));
        // setEditedService({});
        // setEditingServiceId(null);

    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // console.log(formData);
    };


    const handleAddService = (e) => {
        e.preventDefault();
        console.log(formData);
        if (formData.categoryKey && formData.nameKey && formData.name && formData.cost >= 0) {
            const body = JSON.stringify(formData);
            const method = editingServiceId ? 'PUT' : 'POST';
            const url = editingServiceId ? `/api/services/${editingServiceId}` : '/api/services';
            fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body
            })
                .then(response => {
                    if (response.ok) {
                        console.log(response);
                        console.log('Service added!');
                        response.json()
                            .then(data => {
                                console.log(data);
                                alert(`Service ${data.name} added!`);
                                fetchServices();
                                setFormData({
                                    categoryKey: '',
                                    name: '',
                                    nameKey: '',
                                    descriptionKey: '',
                                    cost: 0,
                                    isActive: true,
                                    options: [],
                                    order: 0,
                                    isVisible: true,
                                });
                                setOptionInput({
                                    key: '',
                                    labelKey: '',
                                    type: 'select',
                                    unitKey: '',
                                    required: true,
                                    isVisible: true,
                                    defaultValue: '',
                                    choices: [],
                                });
                                setChoiceInput({
                                    labelKey: '',
                                    value: '',
                                    optionCost: 0,
                                });
                            });
                    } else {
                        alert(response.statusText);
                    }
                })
                .catch(err => console.log(err));
        }

    };

    const addNewSaveEditOption = () => {

        if (editingOption !== null && editingOption !== undefined) {
            const updatedOptions = formData.options.map((opt, i) =>
                i === editingOption ? { ...optionInput } : opt
            );
            setFormData({ ...formData, options: updatedOptions });
            setEditingOption(null);

        } else {
            setFormData(prev => ({ ...prev, options: [...prev.options, { ...optionInput }] }));
        }
        // Reset option input after adding
        setOptionInput({
            key: '',
            labelKey: '',
            type: 'select',
            unitKey: '',
            required: true,
            isVisible: true,
            defaultValue: '',
            choices: [],
        });

    };

    const editOption = (index) => {
        const option = formData.options[index];
        if (option) {
            setOptionInput({
                key: option.key,
                labelKey: option.labelKey,
                type: option.type,
                unitKey: option.unitKey,
                required: option.required,
                isVisible: option.isVisible,
                defaultValue: option.defaultValue,
                choices: option.choices,
            });
            setEditingOption(index);
        }
    };

    const removeOption = (index) => {
        setFormData((prev) => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index),
        }));
    };

    const addNewSaveEditChoice = () => {
        if (editingChoice !== null && editingChoice !== undefined) {
            const updatedChoices = optionInput.choices.map((c, i) =>
                i === editingChoice ? { ...choiceInput } : c
            );
            setOptionInput({ ...optionInput, choices: updatedChoices });
            setEditingChoice(null);
        } else {
            setOptionInput({ ...optionInput, choices: [...optionInput.choices, choiceInput] });
        }
        // Reset choice input after adding
        setChoiceInput({ labelKey: '', value: '', optionCost: 0 });
    };

    const editChoice = (index) => {
        const choice = optionInput.choices[index];
        if (choice) {
            setChoiceInput({
                labelKey: choice.labelKey,
                value: choice.value,
                optionCost: choice.optionCost,
            });
            setEditingChoice(index);
        }
    };

    const removeChoice = (index) => {
        setOptionInput((prev) => {
            const updatedChoices = prev.choices.filter((_, i) => i !== index);
            return { ...prev, choices: updatedChoices };
        });
    };

    const fetchServices = async () => {
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
    };

    const fetchCategories = async () => {
        fetch('/api/categories', {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => setCategories(data))
            .catch(error => console.log(error));
    };


    useEffect(() => {
        fetchCategories();
        fetchServices();
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
                    backgroundSize: "cover",
                    backgroundPosition: "top center",
                    minHeight: "700px"
                }}
            >
                <div className='content'>

                    <Card className="mt-5 p-3">
                        <h4>Existing Services</h4>
                        <Table striped bordered responsive>
                            <thead>
                                <tr>
                                    <th>Category Key</th>
                                    <th>Name Key</th>
                                    <th>Description Key</th>
                                    <th>Cost</th>
                                    <th>Active</th>
                                    <th>Visible</th>
                                    <th>Options</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((s) => (
                                    <tr key={s._id}>
                                        <td><div>
                                            Text: {t(s.categoryKey)} <br />
                                            Key: {s.categoryKey} <br />
                                        </div></td>
                                        <td><div>
                                            Name: {s.name} <br />
                                            Key: {s.nameKey} <br />
                                            Text: {t(s.nameKey)} <br />
                                        </div></td>
                                        <td><div>
                                            Key: {s.descriptionKey} <br />
                                            Text: {t(s.descriptionKey)}
                                        </div></td>
                                        <td>${s.cost}</td>
                                        <td>{s.isActive ? 'Yes' : 'No'}</td>
                                        <td>{s.isVisible ? 'Yes' : 'No'}</td>
                                        <td>
                                            {s.options.map((opt, i) => (
                                                <div key={i}>
                                                    <strong>
                                                        Key: {opt.labelKey}</strong> — ${opt.optionCost} <br />
                                                    Text: {t(opt.labelKey)}
                                                </div>
                                            ))}
                                        </td>
                                        <td>
                                            <ButtonGroup>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="ms-2"
                                                    onClick={() => handleDuplicateService(s)}
                                                    title="Duplicate Service"
                                                >
                                                    <FaCopy />
                                                </Button>

                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleEditClick(s)}>
                                                    <FaEdit />
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(s._id)}>
                                                    <FaTrash />
                                                </Button>
                                            </ButtonGroup>
                                        </td>

                                    </tr>

                                ))}
                            </tbody>
                        </Table>
                    </Card>
                    <Card className="p-3" ref={addServiceRef}>
                        <h2 className='title'>Add Service</h2>
                        <p className='description '>Add a new service to the list of services</p>
                        {editingServiceId && (<h3>Editing Service: {formData.name}</h3>)}
                        <Form onSubmit={handleAddService}>
                            <Row>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Category Key</Form.Label>
                                        {/* <Form.Control name="categoryKey" className="text-cleanar-color form-input" value={formData.categoryKey} onChange={handleChange} required /> */}
                                        <Form.Control as="select" name="categoryKey" className='text-cleanar-color form-input' value={formData.categoryKey} onChange={handleChange} required>
                                            <option value="">Select a category</option>
                                            {categories.filter(cat => cat.type === 'service').map(cat => (
                                                <option key={cat._id} value={cat.key}>{cat.labelKey}</option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control name="name" className="text-cleanar-color form-input" value={formData.name} onChange={handleChange} required />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Name Key</Form.Label>
                                        <Form.Control name="nameKey" className="text-cleanar-color form-input" value={formData.nameKey} onChange={handleChange} required />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Description Key</Form.Label>
                                        <Form.Control name="descriptionKey" className="text-cleanar-color form-input" value={formData.descriptionKey} onChange={handleChange} />
                                    </Form.Group>
                                </Col>

                                <Col md={1}>
                                    <Form.Group>
                                        <Form.Label>Cost ($)</Form.Label>
                                        <Form.Control type="number" name="cost" className="text-cleanar-color form-input" value={formData.cost} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                                {/* </Row>

                            <Row className="mt-2"> */}
                                <Col md={1}>
                                    <Form.Group>
                                        <Form.Label>Order</Form.Label>
                                        <Form.Control type="number" name="order" className='text-cleanar-color form-input' value={formData.order} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                                {/* </Row>

                            <Row className="mt-2"> */}
                                <Col md={1}>
                                    <Form.Check
                                        type="checkbox"
                                        label="Active"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col md={1}>
                                    <Form.Check
                                        type="checkbox"
                                        label="Visible"
                                        name="isVisible"
                                        checked={formData.isVisible}
                                        onChange={handleChange}
                                    />
                                </Col>
                            </Row>

                            <hr />
                            <h4>Options</h4>
                            <Table bordered hover responsive size="sm" className="mt-3">
                                <thead>
                                    <tr>
                                        <th>Option Label</th>
                                        <th>Type</th>
                                        <th>Unit</th>
                                        <th>Cost</th>
                                        <th>Required</th>
                                        <th>Visible</th>
                                        <th colSpan="2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.options.map((opt, index) => (
                                        <tr key={opt._id}>
                                            <td><div>
                                                Text: {t(opt.labelKey)} <br />
                                                Key: {opt.labelKey}
                                            </div></td>
                                            <td>{opt.type}</td>
                                            <td><div>
                                                Text: {t(opt.unitKey)} <br />
                                                Key: {opt.unitKey}
                                            </div></td>
                                            <td>${opt.optionCost}</td>
                                            <td>{opt.required ? 'Yes' : 'No'}</td>
                                            <td>{opt.isVisible ? 'Yes' : 'No'}</td>
                                            <td>
                                                <Button variant="info" size="sm" onClick={() => editOption(index)}><FaEdit /></Button>
                                            </td>
                                            <td>
                                                <Button variant="danger" size="sm" onClick={() => removeOption(index)}><FaTrash /></Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <h5>Add Option</h5>
                            {editingOption !== null && (
                                <p>Editing option: {optionInput.labelKey}</p>
                            )}
                            <Row className="mb-2">
                                <Col md={2}><Form.Control placeholder="Key" className='text-cleanar-color form-input' value={optionInput.key} onChange={(e) => setOptionInput({ ...optionInput, key: e.target.value })} /></Col>
                                <Col md={2}><Form.Control placeholder="Label Key" className='text-cleanar-color form-input' value={optionInput.labelKey} onChange={(e) => setOptionInput({ ...optionInput, labelKey: e.target.value })} /></Col>
                                <Col md={2}><Form.Control placeholder="Label Key Preview" className='text-cleanar-color form-input' value={t(optionInput.labelKey)} readOnly /></Col>
                                <Col md={2}>
                                    <Form.Control as="select" className='text-cleanar-color form-input' value={optionInput.type} onChange={(e) => setOptionInput({ ...optionInput, type: e.target.value })}>
                                        <option value="select">Select</option>
                                        <option value="number">Number</option>
                                        <option value="text">Text</option>
                                        <option value="boolean">Boolean</option>
                                        <option value="date">Date</option>
                                        <option value="checkbox">Checkbox</option>
                                    </Form.Control>
                                </Col>
                                <Col md={2}><Form.Control placeholder="Unit Key" className='text-cleanar-color form-input' value={optionInput.unitKey} onChange={(e) => setOptionInput({ ...optionInput, unitKey: e.target.value })} /></Col>
                                <Col md={1}><Form.Check label="Required" className='text-cleanar-color' checked={optionInput.required} onChange={(e) => setOptionInput({ ...optionInput, required: e.target.checked })} /></Col>
                                <Col md={1}><Form.Check label="Visible" className='text-cleanar-color' checked={optionInput.isVisible} onChange={(e) => setOptionInput({ ...optionInput, isVisible: e.target.checked })} /></Col>
                            </Row>
                            <hr />
                            <h6>Choices</h6>
                            {/* display a message to indicate in edit mode */}
                            {editingChoice !== null && (
                                <p>Editing choice: {choiceInput.labelKey}</p>
                            )}
                            <Row className="mb-2">
                                <Col md={2}><Form.Control placeholder="Label Key" className='text-cleanar-color form-input' value={choiceInput.labelKey} onChange={(e) => setChoiceInput({ ...choiceInput, labelKey: e.target.value })} /></Col>
                                <Col md={2}><Form.Control placeholder="Label Key Preview" className='text-cleanar-color form-input' value={t(choiceInput.labelKey)} readOnly /></Col>
                                <Col md={2}><Form.Control placeholder="Value" className='text-cleanar-color form-input' value={choiceInput.value} onChange={(e) => setChoiceInput({ ...choiceInput, value: e.target.value })} /></Col>
                                <Col md={2}><Form.Control type="number" placeholder="Cost" className='text-cleanar-color form-input' value={choiceInput.optionCost} onChange={(e) => setChoiceInput({ ...choiceInput, optionCost: parseFloat(e.target.value) })} /></Col>
                                <Col md={2}><Button variant="primary" onClick={() => addNewSaveEditChoice()
                                }>{editingChoice !== null ? 'Save Changes To Choice' : 'Add New Choice'}</Button></Col>
                            </Row>

                            {/* {optionInput.choices.length > 0 && (
                                <ul>
                                    {optionInput.choices.map((c, i) => (
                                        <li key={i}>{c.labelKey} ({c.value}) — ${c.optionCost} <Button size="sm" variant="info" onClick={() => editChoice(i)}>O</Button> <Button size="sm" variant="danger" onClick={() => removeChoice(i)}>X</Button></li>
                                    ))}
                                </ul>
                            )} */}
                            {optionInput.choices.length > 0 && (
                                <Table bordered responsive size="sm" className="mt-3">
                                    <thead>
                                        <tr>
                                            <th>Label Key</th>
                                            <th>Value</th>
                                            <th>Cost</th>
                                            <th colSpan="2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {optionInput.choices.map((c, i) => (
                                            <tr key={i}>
                                                <td><div>
                                                    Key: {c.labelKey} <br />
                                                    Text: {t(c.labelKey)}
                                                </div></td>
                                                <td>{c.value}</td>
                                                <td>${c.optionCost}</td>
                                                <td>
                                                    <Button variant="info" size="sm" onClick={() => editChoice(i)}>
                                                        <FaEdit />
                                                    </Button>
                                                </td>
                                                <td>
                                                    <Button variant="danger" size="sm" onClick={() => removeChoice(i)}>
                                                        <FaTrash />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}

                            <Button onClick={() => addNewSaveEditOption()
                            }>{editingOption !== null ? 'Save Changes to Option' : 'Add New Option'}</Button>



                            <div className="mt-3">
                                <ButtonGroup>

                                    <Button type="submit">{editingServiceId !== null ? 'Save Changes to Service' : 'Add New Service'}</Button>
                                    <Button type="button" variant="secondary" onClick={handleCancelClick}>Cancel</Button>
                                </ButtonGroup>
                            </div>
                        </Form>
                    </Card>
                </div>
            </div>
            {/* </div> */}
            {/* <Footer /> */}
        </>

    );
};

export default ManageService;
