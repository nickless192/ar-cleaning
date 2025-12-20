import React, { useState, useEffect, useMemo } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    CardHeader,
    CardBody,
    Form,
    FormControl,
    FormCheck,
    Button,
    Table,
    InputGroup,
    Spinner,
    Alert,
    Badge,
} from 'react-bootstrap';
import Auth from '/src/utils/auth';

/* ============================
   API HELPER
============================ */

const apiFetch = async (url, options = {}) => {
    const token = Auth.getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
        let message = 'Request failed';
        try {
            const data = await res.json();
            message = data.message || JSON.stringify(data);
        } catch (err) {
            message = await res.text();
        }
        throw new Error(message || 'Request failed');
    }

    if (res.status === 204) return null;
    return res.json();
};

/* ============================
   ROLE HELPERS
============================ */

// Fallback roles if /api/admin/roles is not yet implemented
const DEFAULT_ROLE_OPTIONS = [
    { name: 'customer', label: 'Customer' },
    { name: 'staff', label: 'Staff' },
    { name: 'admin', label: 'Admin' },
    { name: 'tester', label: 'Tester' },
];

const guessPrimaryRoleName = (user, allRoles) => {
    // Try from roles array (if populated with Role docs)
    if (user.roles && user.roles.length > 0) {
        const first = user.roles[0];
        if (typeof first === 'string') {
            // If it's just an ID string, we can't know the name; fallback to flags
        } else if (first && first.name) {
            return first.name;
        }
    }

    // Legacy flags
    if (user.adminFlag) return 'admin';
    if (user.testerFlag) return 'tester';

    // Some apps may have "staff" flag in future; for now default to 'customer'
    return 'customer';
};

/* ============================
   MAIN COMPONENT
============================ */

const ManageUser = () => {
    const currentUser = Auth.getProfile()?.data;
    const currentUserId = currentUser?._id;

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState(DEFAULT_ROLE_OPTIONS);
    const [loading, setLoading] = useState(true);
    const [savingUserId, setSavingUserId] = useState(null);
    const [deletingUserId, setDeletingUserId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [search, setSearch] = useState('');

    const [editingUserId, setEditingUserId] = useState(null);
    const [editedUser, setEditedUser] = useState(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        primaryRoleName: 'customer',
        adminFlag: false,
        testerFlag: false,
    });

    /* ============================
       LOAD DATA
    ============================ */

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            setSuccess('');
            try {
                // Users
                // const userData = await apiFetch('/api/admin/users'); // not using as i currently have the path routes blocked at the front-end
                const userData = await apiFetch('/api/users');
                setUsers(userData);

                // Roles (optional, if you have this endpoint)
                // try {
                //     const roleData = await apiFetch('/api/admin/roles');
                //     if (Array.isArray(roleData) && roleData.length) {
                //         setRoles(
                //             roleData.map((r) => ({
                //                 name: r.name,
                //                 label: r.label || r.name,
                //             }))
                //         );
                //     }
                // } catch (err) {
                //     // If roles endpoint not ready, keep defaults
                //     console.warn('[ManageUser] Could not load roles, using defaults:', err.message);
                // }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        load();

        document.body.classList.add('manage-user-page', 'sidebar-collapse');
        document.documentElement.classList.remove('nav-open');
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;

        return () => {
            document.body.classList.remove('manage-user-page', 'sidebar-collapse');
        };
    }, []);

    /* ============================
       FILTERED USERS
    ============================ */

    const filteredUsers = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return users;
        return users.filter((u) => {
            const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
            return (
                fullName.includes(q) ||
                (u.email || '').toLowerCase().includes(q) ||
                (u.username || '').toLowerCase().includes(q)
            );
        });
    }, [users, search]);

    /* ============================
       EDITING
    ============================ */

    const handleEditClick = (user) => {
        setEditingUserId(user._id);
        setSuccess('');
        setError('');

        const primaryRoleName = guessPrimaryRoleName(user, roles);

        setEditedUser({
            ...user,
            primaryRoleName,
        });
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditedUser((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSaveClick = async () => {
        if (!editedUser) return;
        const {
            firstName,
            lastName,
            email,
            username,
            adminFlag,
            testerFlag,
            primaryRoleName,
        } = editedUser;

        if (!firstName || !lastName || !email || !username) {
            setError('Please provide first name, last name, email, and username.');
            return;
        }

        setSavingUserId(editedUser._id);
        setError('');
        setSuccess('');

        try {
            const body = {
                firstName,
                lastName,
                email,
                username,
                adminFlag,
                testerFlag,
                roleName: primaryRoleName, // backend can map this to Role model
            };

            // const updated = await apiFetch(`/api/admin/users/${editedUser._id}`, {
             const updated = await apiFetch(`/api/users/${editedUser._id}`, {
                method: 'PUT',
                body: JSON.stringify(body),
            });

            setUsers((prev) =>
                prev.map((u) => (u._id === updated._id ? updated : u))
            );
            setEditingUserId(null);
            setEditedUser(null);
            setSuccess('User updated successfully.');
        } catch (err) {
            setError(err.message);
        } finally {
            setSavingUserId(null);
        }
    };

    const handleCancelClick = () => {
        setEditingUserId(null);
        setEditedUser(null);
        setError('');
        setSuccess('');
    };

    const handleDeleteClick = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        setDeletingUserId(userId);
        setError('');
        setSuccess('');
        try {
            // await apiFetch(`/api/admin/users/${userId}`, {
            await apiFetch(`/api/users/${userId}`, {
                method: 'DELETE',
            });
            setUsers((prev) => prev.filter((u) => u._id !== userId));
            setSuccess('User deleted.');
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingUserId(null);
        }
    };

    /* ============================
       ADD USER
    ============================ */

    const handleNewChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        const {
            firstName,
            lastName,
            email,
            username,
            password,
            adminFlag,
            testerFlag,
            primaryRoleName,
        } = formData;

        if (!firstName || !lastName || !email || !username || !password) {
            setError('Please fill in all required fields for the new user.');
            return;
        }

        setError('');
        setSuccess('');

        try {
            // const newUser = await apiFetch('/api/admin/users', {
            const newUser = await apiFetch('/api/users', {
                method: 'POST',
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    username,
                    password,
                    adminFlag,
                    testerFlag,
                    roleName: primaryRoleName,
                }),
            });

            setUsers((prev) => [...prev, newUser]);

            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                username: '',
                password: '',
                adminFlag: false,
                testerFlag: false,
                primaryRoleName: 'customer',
            });

            setSuccess('New user added successfully.');
        } catch (err) {
            setError(err.message);
        }
    };

    const renderRoleBadge = (user) => {
        const primaryRoleName = guessPrimaryRoleName(user, roles);
        const roleOption =
            roles.find((r) => r.name === primaryRoleName) || {
                name: primaryRoleName,
                label: primaryRoleName,
            };

        let bg = 'secondary';
        if (primaryRoleName === 'admin') bg = 'danger';
        else if (primaryRoleName === 'staff') bg = 'info';
        else if (primaryRoleName === 'tester') bg = 'warning';
        else if (primaryRoleName === 'customer') bg = 'success';

        return (
            <Badge bg={bg} pill>
                {roleOption.label}
            </Badge>
        );
    };

    /* ============================
       RENDER
    ============================ */

    return (
        <div className="section page-header-image" style={{ minHeight: '700px' }}>
            <div className="content py-4">
                <Container fluid>
                    <Row className="mb-3">
                        <Col>
                            <h3>User Management</h3>
                            <p className="text-muted mb-0">
                                View users, manage roles (Customer / Staff / Admin / Tester),
                                and update basic details.
                            </p>
                        </Col>
                    </Row>

                    {error && (
                        <Row className="mb-2">
                            <Col>
                                <Alert variant="danger" onClose={() => setError('')} dismissible>
                                    {error}
                                </Alert>
                            </Col>
                        </Row>
                    )}
                    {success && (
                        <Row className="mb-2">
                            <Col>
                                <Alert
                                    variant="success"
                                    onClose={() => setSuccess('')}
                                    dismissible
                                >
                                    {success}
                                </Alert>
                            </Col>
                        </Row>
                    )}

                    <Row>
                        <Col md={8} className="mb-3">
                            <Card className="shadow-sm border-0">
                                <CardHeader>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>All Users</span>
                                        <InputGroup style={{ maxWidth: 260 }}>
                                            <FormControl
                                                size="sm"
                                                placeholder="Search name, email, username..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                            />
                                        </InputGroup>
                                    </div>
                                </CardHeader>
                                <CardBody style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                    {loading ? (
                                        <div className="d-flex justify-content-center my-4">
                                            <Spinner animation="border" />
                                        </div>
                                    ) : filteredUsers.length === 0 ? (
                                        <p className="text-muted mb-0">
                                            No users found. Try adjusting your search.
                                        </p>
                                    ) : (
                                        <Table hover responsive size="sm" className="align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Username</th>
                                                    <th>Role</th>
                                                    <th>Flags</th>
                                                    <th style={{ width: 160 }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredUsers.map((user) => {
                                                    const isEditing = editingUserId === user._id;
                                                    const isSelf = user._id === currentUserId;
                                                    const saving = savingUserId === user._id;
                                                    const deleting = deletingUserId === user._id;

                                                    if (isEditing && editedUser) {
                                                        const primaryRoleName =
                                                            editedUser.primaryRoleName ||
                                                            guessPrimaryRoleName(user, roles);

                                                        return (
                                                            <tr key={user._id}>
                                                                <td>
                                                                    <FormControl
                                                                        size="sm"
                                                                        type="text"
                                                                        name="firstName"
                                                                        value={editedUser.firstName || ''}
                                                                        onChange={handleEditChange}
                                                                        placeholder="First name"
                                                                        className="mb-1 text-cleanar-color form-input"
                                                                    />
                                                                    <FormControl
                                                                        size="sm"
                                                                        type="text"
                                                                        name="lastName"
                                                                        value={editedUser.lastName || ''}
                                                                        onChange={handleEditChange}
                                                                        className="text-cleanar-color form-input"
                                                                        placeholder="Last name"
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <FormControl
                                                                        size="sm"
                                                                        type="email"
                                                                        name="email"
                                                                        value={editedUser.email || ''}
                                                                        className="text-cleanar-color form-input"
                                                                        onChange={handleEditChange}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <FormControl
                                                                        size="sm"
                                                                        type="text"
                                                                        name="username"
                                                                        value={editedUser.username || ''}
                                                                        onChange={handleEditChange}
                                                                        className="text-cleanar-color form-input"
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <Form.Select
                                                                        size="sm"
                                                                        name="primaryRoleName"
                                                                        value={primaryRoleName}
                                                                        className="text-cleanar-color form-input"
                                                                        onChange={handleEditChange}
                                                                    >
                                                                        {roles.map((r) => (
                                                                            <option
                                                                                key={r.name}
                                                                                value={r.name}
                                                                            >
                                                                                {r.label}
                                                                            </option>
                                                                        ))}
                                                                    </Form.Select>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column">
                                                                        <FormCheck
                                                                            size="sm"
                                                                            type="checkbox"
                                                                            id={`adminFlag-${user._id}`}
                                                                            label="Admin flag"
                                                                            name="adminFlag"
                                                                            checked={!!editedUser.adminFlag}
                                                                            onChange={handleEditChange}
                                                                        />
                                                                        <FormCheck
                                                                            size="sm"
                                                                            type="checkbox"
                                                                            id={`testerFlag-${user._id}`}
                                                                            label="Tester flag"
                                                                            name="testerFlag"
                                                                            checked={!!editedUser.testerFlag}
                                                                            onChange={handleEditChange}
                                                                        />
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column gap-1">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="primary"
                                                                            onClick={handleSaveClick}
                                                                            disabled={saving}
                                                                        >
                                                                            {saving ? 'Saving...' : 'Save'}
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline-secondary"
                                                                            onClick={handleCancelClick}
                                                                            disabled={saving}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                        {!isSelf && (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline-danger"
                                                                                onClick={() =>
                                                                                    handleDeleteClick(user._id)
                                                                                }
                                                                                disabled={deleting}
                                                                            >
                                                                                {deleting
                                                                                    ? 'Deleting...'
                                                                                    : 'Delete'}
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    }

                                                    return (
                                                        <tr key={user._id}>
                                                            <td>
                                                                <div className="fw-semibold">
                                                                    {user.firstName} {user.lastName}
                                                                </div>
                                                            </td>
                                                            <td>{user.email}</td>
                                                            <td>{user.username}</td>
                                                            <td>{renderRoleBadge(user)}</td>
                                                            <td>
                                                                <div className="small text-muted">
                                                                    Admin flag:{' '}
                                                                    <span className="fw-semibold">
                                                                        {user.adminFlag ? 'Yes' : 'No'}
                                                                    </span>
                                                                    <br />
                                                                    Tester flag:{' '}
                                                                    <span className="fw-semibold">
                                                                        {user.testerFlag ? 'Yes' : 'No'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-primary"
                                                                    onClick={() => handleEditClick(user)}
                                                                    disabled={
                                                                        (editingUserId &&
                                                                            editingUserId !== user._id) ||
                                                                        deleting
                                                                    }
                                                                >
                                                                    Edit
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>

                        <Col md={4}>
                            <Card className="shadow-sm border-0">
                                <CardHeader>Add User</CardHeader>
                                <CardBody>
                                    <p className="text-muted">
                                        Create a new user and assign a primary role. You can flip
                                        them between Customer / Staff / Admin / Tester later.
                                    </p>

                                    <Form onSubmit={handleAddUser}>
                                        <Form.Group className="mb-2">
                                            <Form.Label>First Name</Form.Label>
                                            <FormControl
                                                size="sm"
                                                type="text"
                                                name="firstName"
                                                className="text-cleanar-color form-input"
                                                value={formData.firstName}
                                                onChange={handleNewChange}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-2">
                                            <Form.Label>Last Name</Form.Label>
                                            <FormControl
                                                size="sm"
                                                type="text"
                                                className="text-cleanar-color form-input"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleNewChange}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-2">
                                            <Form.Label>Email</Form.Label>
                                            <FormControl
                                                size="sm"
                                                type="email"
                                                className="text-cleanar-color form-input"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleNewChange}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-2">
                                            <Form.Label>Username</Form.Label>
                                            <FormControl
                                                size="sm"
                                                type="text"
                                                name="username"
                                                className="text-cleanar-color form-input"
                                                value={formData.username}
                                                onChange={handleNewChange}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-2">
                                            <Form.Label>Password</Form.Label>
                                            <FormControl
                                                size="sm"
                                                type="password"
                                                className="text-cleanar-color form-input"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleNewChange}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-2">
                                            <Form.Label>Primary Role</Form.Label>
                                            <Form.Select
                                                size="sm"
                                                name="primaryRoleName"
                                                className="text-cleanar-color form-input"
                                                value={formData.primaryRoleName}
                                                onChange={handleNewChange}
                                            >
                                                {roles.map((r) => (
                                                    <option key={r.name} value={r.name}>
                                                        {r.label}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>

                                        <Form.Group className="mb-2">
                                            <FormCheck
                                                type="checkbox"
                                                id="adminFlag-new"
                                                label="Admin flag (legacy)"
                                                name="adminFlag"
                                                checked={formData.adminFlag}
                                                onChange={handleNewChange}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <FormCheck
                                                type="checkbox"
                                                id="testerFlag-new"
                                                label="Tester flag (legacy)"
                                                name="testerFlag"                                                
                                                checked={formData.testerFlag}
                                                onChange={handleNewChange}
                                            />
                                        </Form.Group>

                                        <div className="d-flex justify-content-end">
                                            <Button size="sm" type="submit" variant="primary">
                                                Add User
                                            </Button>
                                        </div>
                                    </Form>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default ManageUser;
