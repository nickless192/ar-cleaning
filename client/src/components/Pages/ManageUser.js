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
    Form, Card, CardBody, CardTitle, CardText, CardHeader
} from 'reactstrap';
import Auth from "../../utils/auth";

import Navbar from "components/Pages/Navbar.js";
import Footer from "components/Pages/Footer.js";

const ManageUser = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        adminFlag: false
    });

    const [users, setUsers] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editedUser, setEditedUser] = useState({});
    const [isLogged] = React.useState(Auth.loggedIn());
    const [currentUserId] = useState(Auth.getProfile().data._id);

    useEffect(() => {
        // fetch('/api/currentUser')
        //     .then(response => response.json())
        //     .then(data => setCurrentUserId(data._id))
        //     .catch(error => console.log(error));

        fetch('/api/users')
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.log(error));



        document.body.classList.add("manage-user-page");
        document.body.classList.add("sidebar-collapse");
        document.documentElement.classList.remove("nav-open");
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        return function cleanup() {
            document.body.classList.remove("manage-user-page");
            document.body.classList.remove("sidebar-collapse");
        };
    }, []);

    const handleEditClick = (user) => {
        setEditingUserId(user._id);
        setEditedUser({ ...user });
    };

    const handleSaveClick = () => {
        const { firstName, lastName, email, username, adminFlag } = editedUser;
        if (!firstName || !lastName || !email || !username) {
            alert('Please provide all fields');
            return;
        }
        // lets put the fields into a stringify object body
        const body = JSON.stringify({ firstName, lastName, email, username, adminFlag });
        fetch(`/api/users/${editingUserId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        })
            .then(response => response.json())
            .then(data => {
                setUsers(users.map(user => user._id === editingUserId ? data : user));
                setEditingUserId(null);
                setEditedUser({});
            })
            .catch(err => console.log(err));
    };

    const handleCancelClick = () => {
        setEditingUserId(null);
        setEditedUser({});
    };

    const handleDeleteClick = (userId) => {
        fetch(`/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(() => {
                setUsers(users.filter(user => user._id !== userId));
                setEditingUserId(null);
                setEditedUser({});
            })
            .catch(err => console.log(err));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditedUser(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.firstName && formData.lastName && formData.email && formData.username && formData.password) {
            fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
                .then(response => response.json())
                .then(data => {
                    setUsers([...users, data]);
                    setFormData({
                        firstName: '',
                        lastName: '',
                        email: '',
                        username: '',
                        password: '',
                        adminFlag: false
                    });
                })
                .catch(err => console.log(err));
        }
    };

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
                        <h2>All Users</h2>
                        <Row>
                            {users.map(user => (
                                <Col key={user._id} className="text-center ml-auto mr-auto" lg="6" md="8">
                                    <Card className='shadow-sm border-0 km-bg-test'>
                                        {editingUserId === user._id ? (
                                            <CardBody>
                                                <Input
                                                    type="text"
                                                    name="firstName"
                                                    value={editedUser.firstName}
                                                    onChange={handleEditChange}
                                                    placeholder="First Name"
                                                />
                                                <Input
                                                    type="text"
                                                    name="lastName"
                                                    value={editedUser.lastName}
                                                    onChange={handleEditChange}
                                                    placeholder="Last Name"
                                                />
                                                <Input
                                                    type="email"
                                                    name="email"
                                                    value={editedUser.email}
                                                    onChange={handleEditChange}
                                                    placeholder="Email"
                                                />
                                                <Input
                                                    type="text"
                                                    name="username"
                                                    value={editedUser.username}
                                                    onChange={handleEditChange}
                                                    placeholder="Username"
                                                />
                                                {/* <Input
                                                    type="password"
                                                    name="password"
                                                    value={editedUser.password}
                                                    onChange={handleEditChange}
                                                    placeholder="Password"
                                                /> */}
                                                <InputGroup className="no-border">
                                                    <InputGroupAddon addonType="prepend">
                                                        <InputGroupText>
                                                            <i className="now-ui-icons ui-1_check"></i>
                                                        </InputGroupText>
                                                    </InputGroupAddon>
                                                    <Input
                                                        type="checkbox"
                                                        name="adminFlag"
                                                        checked={editedUser.adminFlag}
                                                        onChange={handleEditChange}
                                                    /> Admin
                                                </InputGroup>
                                                <Button color="primary" onClick={handleSaveClick}>Save</Button>
                                                <Button color="secondary" onClick={handleCancelClick}>Cancel</Button>
                                                {user._id !== currentUserId && (
                                                    <Button color="danger" onClick={() => handleDeleteClick(user._id)}>Delete</Button>
                                                )}
                                            </CardBody>
                                        ) : (
                                            <>
                                                <CardHeader tag='h5' className='text-primary'>
                                                    {user.firstName} {user.lastName}
                                                </CardHeader>
                                                <CardBody>
                                                    <CardTitle className='text-secondary'>
                                                        {user.email}
                                                    </CardTitle>
                                                    <CardText className='font-weight-bold text-secondary'>
                                                        Username: <span className='text-success'>{user.username}</span><br />
                                                        Admin: <span className='text-success'>{user.adminFlag ? 'Yes' : 'No'}</span>
                                                    </CardText>
                                                    <Button
                                                        color="primary"
                                                        onClick={() => handleEditClick(user)}
                                                        disabled={(editingUserId !== null && editingUserId !== user._id) || user._id === currentUserId}
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
                            <Container>
                                <h2>Add User</h2>
                                <p className='text-muted'>Please fill in the form to add a new user</p>
                                <Row>
                                    <Col className="text-center ml-auto mr-auto" lg="6" md="8" id='user-form'>
                                        <InputGroup className={"no-border" + (formData.firstName ? " input-group-focus" : "")}>
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="now-ui-icons users_circle-08"></i>
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input
                                                placeholder="First Name"
                                                type="text"
                                                id="firstName"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                            />
                                        </InputGroup>
                                    </Col>
                                    <Col className="text-center ml-auto mr-auto" lg="6" md="8" id='user-form'>
                                        <InputGroup className={"no-border" + (formData.lastName ? " input-group-focus" : "")}>
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="now-ui-icons users_circle-08"></i>
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input
                                                placeholder="Last Name"
                                                type="text"
                                                id="lastName"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                            />
                                        </InputGroup>
                                    </Col>
                                    <Col className="text-center ml-auto mr-auto" lg="6" md="8" id='user-form'>
                                        <InputGroup className={"no-border" + (formData.email ? " input-group-focus" : "")}>
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="now-ui-icons ui-1_email-85"></i>
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input
                                                placeholder="Email"
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </InputGroup>
                                    </Col>
                                    <Col className="text-center ml-auto mr-auto" lg="6" md="8" id='user-form'>
                                        <InputGroup className={"no-border" + (formData.username ? " input-group-focus" : "")}>
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="now-ui-icons users_single-02"></i>
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input
                                                placeholder="Username"
                                                type="text"
                                                id="username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                            />
                                        </InputGroup>
                                    </Col>
                                    <Col className="text-center ml-auto mr-auto" lg="6" md="8" id='user-form'>
                                        <InputGroup className={"no-border" + (formData.password ? " input-group-focus" : "")}>
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="now-ui-icons ui-1_lock-circle-open"></i>
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input
                                                placeholder="Password"
                                                type="password"
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                            />
                                        </InputGroup>
                                    </Col>
                                    <Col className="text-center ml-auto mr-auto" lg="6" md="8" id='user-form'>
                                        <InputGroup className="no-border">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="now-ui-icons ui-1_check"></i>
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input
                                                type="checkbox"
                                                name="adminFlag"
                                                checked={formData.adminFlag}
                                                onChange={handleChange}
                                            /> Admin
                                        </InputGroup>
                                    </Col>
                                    <Col className="text-center ml-auto mr-auto" lg="6" md="8" id='user-form'>
                                        <Button type='submit' color='primary'>Add User</Button>
                                    </Col>
                                </Row>
                            </Container>
                        </Form>
                    </Container>
                    </div>
                    
                </div>
            {/* </div> */}
            {/* <Footer /> */}
        </>
    );
};

export default ManageUser;
