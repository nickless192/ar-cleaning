import React, { useEffect, useState } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Table,
    Tabs,
    Tab,
    Spinner,
    Alert,
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
   TEMPLATES TAB
============================ */

// const TemplatesTab = () => {
//     const [templates, setTemplates] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');
//     const [selectedId, setSelectedId] = useState(null);
//     const [form, setForm] = useState({
//         key: '',
//         name: '',
//         type: 'transactional',
//         subject: '',
//         html: '',
//         enabled: true,
//     });

//     const loadTemplates = async () => {
//         setLoading(true);
//         setError('');
//         try {
//             const data = await apiFetch('/api/notifications/templates');
//             setTemplates(data);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadTemplates();
//     }, []);

//     const handleSelectTemplate = (tpl) => {
//         setSelectedId(tpl._id);
//         setForm({
//             key: tpl.key,
//             name: tpl.name || '',
//             type: tpl.type || 'transactional',
//             subject: tpl.subject || '',
//             html: tpl.html || '',
//             enabled: tpl.enabled ?? true,
//         });
//         setSuccess('');
//         setError('');
//     };

//     const handleNewTemplate = () => {
//         setSelectedId(null);
//         setForm({
//             key: '',
//             name: '',
//             type: 'transactional',
//             subject: '',
//             html: '',
//             enabled: true,
//         });
//         setSuccess('');
//         setError('');
//     };

//     const handleChange = (field, value) => {
//         setForm((prev) => ({
//             ...prev,
//             [field]: value,
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setSaving(true);
//         setError('');
//         setSuccess('');
//         try {
//             if (selectedId) {
//                 // update
//                 const updated = await apiFetch(
//                     `/api/notifications/templates/${selectedId}`,
//                     {
//                         method: 'PUT',
//                         body: JSON.stringify(form),
//                     }
//                 );
//                 setSuccess('Template updated successfully.');
//                 setTemplates((prev) =>
//                     prev.map((t) => (t._id === updated._id ? updated : t))
//                 );
//             } else {
//                 // create
//                 const created = await apiFetch('/api/notifications/templates', {
//                     method: 'POST',
//                     body: JSON.stringify(form),
//                 });
//                 setSuccess('Template created successfully.');
//                 setTemplates((prev) => [...prev, created]);
//                 setSelectedId(created._id);
//             }
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setSaving(false);
//         }
//     };

//     return (
//         <Row>
//             <Col md={4} className="mb-3">
//                 <Card>
//                     <Card.Header>
//                         <div className="d-flex justify-content-between align-items-center">
//                             <span>Templates</span>
//                             <Button size="sm" variant="outline-primary" onClick={handleNewTemplate}>
//                                 New
//                             </Button>
//                         </div>
//                     </Card.Header>
//                     <Card.Body style={{ maxHeight: 400, overflowY: 'auto' }}>
//                         {loading ? (
//                             <div className="d-flex justify-content-center">
//                                 <Spinner animation="border" size="sm" />
//                             </div>
//                         ) : (
//                             <Table hover size="sm" className="mb-0">
//                                 <thead>
//                                     <tr>
//                                         <th>Key</th>
//                                         <th>Type</th>
//                                         <th>Enabled</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {templates.map((tpl) => (
//                                         <tr
//                                             key={tpl._id}
//                                             onClick={() => handleSelectTemplate(tpl)}
//                                             style={{
//                                                 cursor: 'pointer',
//                                                 backgroundColor:
//                                                     tpl._id === selectedId ? '#f0f8ff' : 'transparent',
//                                             }}
//                                         >
//                                             <td>{tpl.key}</td>
//                                             <td>{tpl.type}</td>
//                                             <td>{tpl.enabled ? 'Yes' : 'No'}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </Table>
//                         )}
//                     </Card.Body>
//                 </Card>
//             </Col>

//             <Col md={8}>
//                 <Card>
//                     <Card.Header>
//                         {selectedId ? 'Edit Template' : 'Create New Template'}
//                     </Card.Header>
//                     <Card.Body>
//                         {error && <Alert variant="danger">{error}</Alert>}
//                         {success && <Alert variant="success">{success}</Alert>}

//                         <Form onSubmit={handleSubmit}>
//                             <Form.Group className="mb-3">
//                                 <Form.Label>Key (unique)</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     value={form.key}
//                                     onChange={(e) => handleChange('key', e.target.value)}
//                                     disabled={!!selectedId} // don’t change key on update
//                                     required
//                                 />
//                                 <Form.Text>
//                                     e.g. <code>booking_confirmation_customer</code>
//                                 </Form.Text>
//                             </Form.Group>

//                             <Form.Group className="mb-3">
//                                 <Form.Label>Name</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     value={form.name}
//                                     onChange={(e) => handleChange('name', e.target.value)}
//                                     placeholder="Friendly name (optional)"
//                                 />
//                             </Form.Group>

//                             <Form.Group className="mb-3">
//                                 <Form.Label>Type</Form.Label>
//                                 <Form.Select
//                                     value={form.type}
//                                     onChange={(e) => handleChange('type', e.target.value)}
//                                 >
//                                     <option value="transactional">Transactional</option>
//                                     <option value="marketing">Marketing</option>
//                                 </Form.Select>
//                             </Form.Group>

//                             <Form.Group className="mb-3">
//                                 <Form.Label>Subject</Form.Label>
//                                 <Form.Control
//                                     type="text"
//                                     value={form.subject}
//                                     onChange={(e) => handleChange('subject', e.target.value)}
//                                     required
//                                 />
//                             </Form.Group>

//                             <Form.Group className="mb-3">
//                                 <Form.Label>HTML</Form.Label>
//                                 <Form.Control
//                                     as="textarea"
//                                     rows={8}
//                                     value={form.html}
//                                     onChange={(e) => handleChange('html', e.target.value)}
//                                     required
//                                 />
//                                 <Form.Text>
//                                     You can use placeholders like{' '}
//                                     <code>{'{{customerName}} {{bookingDateTime}}'}</code>
//                                 </Form.Text>
//                             </Form.Group>

//                             <Form.Group className="mb-3">
//                                 <Form.Check
//                                     type="switch"
//                                     id="template-enabled"
//                                     label="Enabled"
//                                     checked={form.enabled}
//                                     onChange={(e) =>
//                                         handleChange('enabled', e.target.checked)
//                                     }
//                                 />
//                             </Form.Group>

//                             <div className="d-flex justify-content-end">
//                                 <Button type="submit" disabled={saving}>
//                                     {saving ? 'Saving...' : 'Save Template'}
//                                 </Button>
//                             </div>
//                         </Form>
//                     </Card.Body>
//                 </Card>
//             </Col>
//         </Row>
//     );
// };

const TemplatesTab = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [cloning, setCloning] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [form, setForm] = useState({
        key: '',
        name: '',
        type: 'transactional',
        subject: '',
        html: '',
        enabled: true,
    });

    const loadTemplates = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await apiFetch('/api/notifications/templates');
            setTemplates(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    const handleSelectTemplate = (tpl) => {
        setSelectedId(tpl._id);
        setForm({
            key: tpl.key,
            name: tpl.name || '',
            type: tpl.type || 'transactional',
            subject: tpl.subject || '',
            html: tpl.html || '',
            enabled: tpl.enabled ?? true,
        });
        setSuccess('');
        setError('');
    };

    const handleNewTemplate = () => {
        setSelectedId(null);
        setForm({
            key: '',
            name: '',
            type: 'transactional',
            subject: '',
            html: '',
            enabled: true,
        });
        setSuccess('');
        setError('');
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            if (selectedId) {
                const updated = await apiFetch(
                    `/api/notifications/templates/${selectedId}`,
                    {
                        method: 'PUT',
                        body: JSON.stringify(form),
                    }
                );
                setSuccess('Template updated successfully.');
                setTemplates((prev) =>
                    prev.map((t) => (t._id === updated._id ? updated : t))
                );
            } else {
                const created = await apiFetch('/api/notifications/templates', {
                    method: 'POST',
                    body: JSON.stringify(form),
                });
                setSuccess('Template created successfully.');
                setTemplates((prev) => [...prev, created]);
                setSelectedId(created._id);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleTestSend = async () => {
        if (!selectedId) return;
        setTesting(true);
        setError('');
        setSuccess('');
        try {
            const data = await apiFetch(
                `/api/notifications/templates/${selectedId}/test-send`,
                {
                    method: 'POST',
                }
            );
            setSuccess(data.message || 'Test email sent.');
        } catch (err) {
            setError(err.message);
        } finally {
            setTesting(false);
        }
    };

    const handleCloneTemplate = async () => {
        if (!selectedId) return;
        setCloning(true);
        setError('');
        setSuccess('');
        try {
            // Take current form as base
            // Suggest new key + name for quick promo variations
            const baseKey = form.key || 'template';
            const baseName = form.name || 'Template';

            // Basic suffix; user can edit later
            const newKey = `${baseKey}_copy_${Date.now()}`;
            const newName = `${baseName} (Copy)`;

            const payload = {
                key: newKey,
                name: newName,
                type: form.type,
                subject: form.subject,
                html: form.html,
                enabled: form.enabled,
            };

            const created = await apiFetch('/api/notifications/templates', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            setTemplates((prev) => [...prev, created]);
            setSelectedId(created._id);
            setForm({
                key: created.key,
                name: created.name || '',
                type: created.type,
                subject: created.subject,
                html: created.html,
                enabled: created.enabled,
            });

            setSuccess(
                `Template cloned as "${created.key}". You can now tweak it for a new promo.`
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setCloning(false);
        }
    };

    // Simple preview renderer: mirrors backend {{key}} replacement
    const getPreviewHtml = () => {
        const context = {
            customerName: 'Test Customer',
            adminName: 'Omar / Fili',
            bookingId: 'TEST-123',
            bookingDateTime: 'Jan 1, 2026, 10:00 AM',
            bookingAddress: '123 Test Street, Toronto',
            bookingStatus: 'confirmed',
            bookingNotes: 'This is a sample booking note.',
            bookingsCount: 3,
            days: 7,
            bookingsListHtml:
                '<ul><li>Sample booking 1</li><li>Sample booking 2</li></ul>',
        };

        let html = form.html || '';
        html = html.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
            return context[key] !== undefined && context[key] !== null
                ? String(context[key])
                : `<span style="color:#999;">[${key}]</span>`;
        });

        return html;
    };

    const renderTemplateHelp = () => {
        const key = form.key || '';

        if (key === 'booking_confirmation_customer') {
            return (
                <Alert variant="info" className="mb-2 py-2">
                    <strong>Booking Confirmation – Customer.</strong>{' '}
                    Sent right after a customer books.{' '}
                    Common placeholders:{' '}
                    <code>{'{{customerName}} {{bookingDateTime}} {{bookingAddress}} {{bookingId}}'}</code>
                </Alert>
            );
        }

        if (key === 'booking_reminder_customer') {
            return (
                <Alert variant="info" className="mb-2 py-2">
                    <strong>Booking Reminder – Customer.</strong>{' '}
                    Sent before the service (e.g. 24h).{' '}
                    Common placeholders:{' '}
                    <code>{'{{customerName}} {{bookingDateTime}} {{bookingAddress}}'}</code>
                </Alert>
            );
        }

        if (key === 'admin_upcoming_bookings_digest') {
            return (
                <Alert variant="info" className="mb-2 py-2">
                    <strong>Admin Digest – Upcoming Bookings.</strong>{' '}
                    Sent to admin users with a summary list.{' '}
                    Common placeholders:{' '}
                    <code>
                        {'{{adminName}} {{days}} {{bookingsCount}} {{bookingsListHtml}}'}
                    </code>
                </Alert>
            );
        }

        if (form.type === 'marketing') {
            return (
                <Alert variant="warning" className="mb-2 py-2">
                    <strong>Marketing Email.</strong>{' '}
                    Use this for promos / campaigns. Remember CASL rules and include
                    unsubscribe options where required. Placeholders like{' '}
                    <code>{'{{customerName}}'}</code> are supported.
                </Alert>
            );
        }

        return (
            <Alert variant="secondary" className="mb-2 py-2">
                <strong>Tip for future you / Omar:</strong> This template can use
                placeholders like{' '}
                <code>{'{{customerName}} {{bookingDateTime}} {{bookingAddress}}'}</code>{' '}
                to personalize messages. Treat it as part of your customer journey
                (confirmation, reminder, promo, win-back, etc.).
            </Alert>
        );
    };

    return (
        <Row>
            <Col md={4} className="mb-3">
                <Card>
                    <Card.Header>
                        <div className="d-flex justify-content-between align-items-center">
                            <span>Templates</span>
                            <Button size="sm" variant="outline-primary" onClick={handleNewTemplate}>
                                New
                            </Button>
                        </div>
                    </Card.Header>
                    <Card.Body style={{ maxHeight: 400, overflowY: 'auto' }}>
                        {loading ? (
                            <div className="d-flex justify-content-center">
                                <Spinner animation="border" size="sm" />
                            </div>
                        ) : (
                            <Table hover size="sm" className="mb-0">
                                <thead>
                                    <tr>
                                        <th>Key</th>
                                        <th>Type</th>
                                        <th>Enabled</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {templates.map((tpl) => (
                                        <tr
                                            key={tpl._id}
                                            onClick={() => handleSelectTemplate(tpl)}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor:
                                                    tpl._id === selectedId ? '#f0f8ff' : 'transparent',
                                            }}
                                        >
                                            <td>{tpl.key}</td>
                                            <td>{tpl.type}</td>
                                            <td>{tpl.enabled ? 'Yes' : 'No'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
            </Col>

            <Col md={8}>
                <Card>
                    <Card.Header>
                        <div className="d-flex justify-content-between align-items-center">
                            <span>
                                {selectedId ? 'Edit Template' : 'Create New Template'}
                            </span>
                            <div className="d-flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    disabled={!selectedId || cloning}
                                    onClick={handleCloneTemplate}
                                >
                                    {cloning ? 'Cloning...' : 'Clone'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline-success"
                                    disabled={!selectedId || testing}
                                    onClick={handleTestSend}
                                >
                                    {testing ? 'Sending test...' : 'Send Test Email'}
                                </Button>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}

                        {renderTemplateHelp()}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Key (unique)</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={form.key}
                                    onChange={(e) => handleChange('key', e.target.value)}
                                    disabled={!!selectedId}
                                    required
                                />
                                <Form.Text>
                                    e.g. <code>booking_confirmation_customer</code> or{' '}
                                    <code>promo_spring_sale_2026</code>. This is used in
                                    code and in journeys.
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="Friendly name (for internal use)"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Type</Form.Label>
                                <Form.Select
                                    value={form.type}
                                    onChange={(e) => handleChange('type', e.target.value)}
                                >
                                    <option value="transactional">Transactional</option>
                                    <option value="marketing">Marketing</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Subject</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={form.subject}
                                    onChange={(e) =>
                                        handleChange('subject', e.target.value)
                                    }
                                    required
                                />
                            </Form.Group>

                            <Row>
                                <Col md={7}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>HTML</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={12}
                                            value={form.html}
                                            onChange={(e) =>
                                                handleChange('html', e.target.value)
                                            }
                                            required
                                        />
                                        <Form.Text>
                                            Use placeholders like{' '}
                                            <code>
                                                {
                                                    '{{customerName}} {{bookingDateTime}} {{bookingAddress}}'
                                                }
                                            </code>
                                            . Clone is perfect for creating variations of promos
                                            (e.g. A/B subject lines, different seasonal campaigns).
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                                <Col md={5}>
                                    <Form.Label>Live Preview</Form.Label>
                                    <Card
                                        className="mb-3"
                                        style={{
                                            maxHeight: 320,
                                            overflowY: 'auto',
                                            borderColor: '#e2e6ea',
                                        }}
                                    >
                                        <Card.Header className="py-2">
                                            <small className="text-muted">
                                                Preview with sample data
                                            </small>
                                        </Card.Header>
                                        <Card.Body>
                                            <div
                                                style={{ fontSize: '0.9rem' }}
                                                dangerouslySetInnerHTML={{
                                                    __html: getPreviewHtml(),
                                                }}
                                            />
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    id="template-enabled"
                                    label="Enabled"
                                    checked={form.enabled}
                                    onChange={(e) =>
                                        handleChange('enabled', e.target.checked)
                                    }
                                />
                            </Form.Group>

                            <div className="d-flex justify-content-end">
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Template'}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

/* ============================
   COMPANY DEFAULTS TAB
============================ */

const CompanyDefaultsTab = () => {
    const [defaults, setDefaults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadDefaults = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await apiFetch('/api/notifications/company-defaults');
            setDefaults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDefaults();
    }, []);

    const updateNested = (path, value) => {
        setDefaults((prev) => {
            if (!prev) return prev;
            const clone = { ...prev };
            const keys = path.split('.');
            let curr = clone;
            for (let i = 0; i < keys.length - 1; i += 1) {
                const k = keys[i];
                curr[k] = curr[k] || {};
                curr = curr[k];
            }
            curr[keys[keys.length - 1]] = value;
            return clone;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!defaults) return;
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const data = await apiFetch('/api/notifications/company-defaults', {
                method: 'PUT',
                body: JSON.stringify(defaults),
            });
            setDefaults(data);
            setSuccess('Company defaults updated.');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center my-4">
                <Spinner animation="border" />
            </div>
        );
    }

    if (!defaults) {
        return <Alert variant="warning">No company defaults found.</Alert>;
    }

    return (
        <Row>
            <Col md={8}>
                <Card>
                    <Card.Header>Company Notification Defaults</Card.Header>
                    <Card.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Company Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={defaults.companyName || ''}
                                    onChange={(e) =>
                                        updateNested('companyName', e.target.value)
                                    }
                                />
                            </Form.Group>

                            <hr />
                            <h5>Customer Booking Reminders</h5>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    id="bookingReminderCustomer-enabled"
                                    label="Enable reminders"
                                    checked={
                                        defaults.bookingReminderCustomer?.enabled ?? true
                                    }
                                    onChange={(e) =>
                                        updateNested(
                                            'bookingReminderCustomer.enabled',
                                            e.target.checked
                                        )
                                    }
                                />
                            </Form.Group>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Frequency</Form.Label>
                                        <Form.Select
                                            value={
                                                defaults.bookingReminderCustomer
                                                    ?.frequency || 'immediate'
                                            }
                                            onChange={(e) =>
                                                updateNested(
                                                    'bookingReminderCustomer.frequency',
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="immediate">Immediate</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Hours Before Booking</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min={1}
                                            value={
                                                defaults.bookingReminderCustomer
                                                    ?.hoursBefore || 24
                                            }
                                            onChange={(e) =>
                                                updateNested(
                                                    'bookingReminderCustomer.hoursBefore',
                                                    Number(e.target.value)
                                                )
                                            }
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />
                            <h5>Admin Upcoming Bookings Digest</h5>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    id="upcomingBookingsAdmin-enabled"
                                    label="Enable admin digest"
                                    checked={
                                        defaults.upcomingBookingsAdmin?.enabled ?? true
                                    }
                                    onChange={(e) =>
                                        updateNested(
                                            'upcomingBookingsAdmin.enabled',
                                            e.target.checked
                                        )
                                    }
                                />
                            </Form.Group>

                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Frequency</Form.Label>
                                        <Form.Select
                                            value={
                                                defaults.upcomingBookingsAdmin
                                                    ?.frequency || 'daily'
                                            }
                                            onChange={(e) =>
                                                updateNested(
                                                    'upcomingBookingsAdmin.frequency',
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Time of Day (HH:mm)</Form.Label>
                                        <Form.Control
                                            type="time"
                                            value={
                                                defaults.upcomingBookingsAdmin
                                                    ?.timeOfDay || '07:00'
                                            }
                                            onChange={(e) =>
                                                updateNested(
                                                    'upcomingBookingsAdmin.timeOfDay',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <hr />
                            <h5>Marketing Emails</h5>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    id="marketing-enabled"
                                    label="Enable marketing emails by default"
                                    checked={defaults.marketing?.enabled ?? true}
                                    onChange={(e) =>
                                        updateNested(
                                            'marketing.enabled',
                                            e.target.checked
                                        )
                                    }
                                />
                            </Form.Group>

                            <div className="d-flex justify-content-end">
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Defaults'}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

/* ============================
   MY PREFERENCES TAB
============================ */

const MyPreferencesTab = () => {
    const [settings, setSettings] = useState(null);
    const [companyDefaults, setCompanyDefaults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await apiFetch('/api/notifications/settings/me');
            setSettings({
                user: data.user || data.user?._id,
                preferences: data.preferences || {},
            });
            setCompanyDefaults(data.companyDefaults || null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const updatePref = (path, value) => {
        setSettings((prev) => {
            if (!prev) return prev;
            const clone = { ...prev, preferences: { ...prev.preferences } };
            const keys = path.split('.');
            let curr = clone.preferences;
            for (let i = 0; i < keys.length - 1; i += 1) {
                const k = keys[i];
                curr[k] = curr[k] || {};
                curr = curr[k];
            }
            curr[keys[keys.length - 1]] = value;
            return clone;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!settings) return;
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const data = await apiFetch('/api/notifications/settings/me', {
                method: 'PUT',
                body: JSON.stringify({
                    preferences: settings.preferences,
                }),
            });
            setSettings(data);
            setSuccess('Notification preferences updated.');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center my-4">
                <Spinner animation="border" />
            </div>
        );
    }

    if (!settings) {
        return <Alert variant="warning">No settings found.</Alert>;
    }

    const prefs = settings.preferences || {};

    return (
        <Row>
            <Col md={8}>
                <Card>
                    <Card.Header>My Notification Preferences</Card.Header>
                    <Card.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <h5>Booking Notifications</h5>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    id="pref-booking-confirmation"
                                    label="Booking Confirmations (email)"
                                    checked={
                                        prefs.bookingConfirmation?.email ?? true
                                    }
                                    onChange={(e) =>
                                        updatePref(
                                            'bookingConfirmation.email',
                                            e.target.checked
                                        )
                                    }
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    id="pref-booking-reminder"
                                    label="Booking Reminders (email)"
                                    checked={prefs.bookingReminder?.email ?? true}
                                    onChange={(e) =>
                                        updatePref(
                                            'bookingReminder.email',
                                            e.target.checked
                                        )
                                    }
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Booking Reminder Frequency</Form.Label>
                                <Form.Select
                                    value={
                                        prefs.bookingReminder?.frequency ||
                                        companyDefaults?.bookingReminderCustomer
                                            ?.frequency ||
                                        'immediate'
                                    }
                                    onChange={(e) =>
                                        updatePref(
                                            'bookingReminder.frequency',
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="immediate">Immediate</option>
                                    <option value="daily">Daily Digest</option>
                                    <option value="weekly">Weekly Digest</option>
                                </Form.Select>
                                <Form.Text>
                                    Default:{' '}
                                    {companyDefaults?.bookingReminderCustomer
                                        ?.frequency || 'immediate'}
                                </Form.Text>
                            </Form.Group>

                            <hr />
                            <h5>Admin Digest (if you are an admin)</h5>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    id="pref-admin-upcoming"
                                    label="Upcoming Bookings Digest (email)"
                                    checked={
                                        prefs.adminUpcomingBookings?.email ?? true
                                    }
                                    onChange={(e) =>
                                        updatePref(
                                            'adminUpcomingBookings.email',
                                            e.target.checked
                                        )
                                    }
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Digest Frequency</Form.Label>
                                <Form.Select
                                    value={
                                        prefs.adminUpcomingBookings?.frequency ||
                                        companyDefaults?.upcomingBookingsAdmin
                                            ?.frequency ||
                                        'daily'
                                    }
                                    onChange={(e) =>
                                        updatePref(
                                            'adminUpcomingBookings.frequency',
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </Form.Select>
                                <Form.Text>
                                    Default:{' '}
                                    {companyDefaults?.upcomingBookingsAdmin
                                        ?.frequency || 'daily'}
                                </Form.Text>
                            </Form.Group>

                            <hr />
                            <h5>Marketing Emails</h5>

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="switch"
                                    id="pref-marketing"
                                    label="Allow marketing / promotional emails"
                                    checked={prefs.marketing?.email ?? true}
                                    onChange={(e) =>
                                        updatePref('marketing.email', e.target.checked)
                                    }
                                />
                                <Form.Text>
                                    Company default:{' '}
                                    {companyDefaults?.marketing?.enabled
                                        ? 'Enabled'
                                        : 'Disabled'}
                                </Form.Text>
                            </Form.Group>

                            <div className="d-flex justify-content-end">
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Preferences'}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

/* ============================
   MAIN ADMIN PAGE
============================ */

const NotificationAdminPage = () => {
    return (
        <Container fluid className="mt-4">
            <Row className="mb-3">
                <Col>
                    <h3>Notification Center</h3>
                    <p className="text-muted mb-0">
                        Manage templates, company defaults, and your own notification
                        preferences.
                    </p>
                </Col>
            </Row>

            <Tabs defaultActiveKey="templates" className="mb-3">
                <Tab eventKey="templates" title="Templates">
                    <TemplatesTab />
                </Tab>
                <Tab eventKey="companyDefaults" title="Company Defaults">
                    <CompanyDefaultsTab />
                </Tab>
                <Tab eventKey="myPreferences" title="My Preferences">
                    <MyPreferencesTab />
                </Tab>
            </Tabs>
        </Container>
    );
};

export default NotificationAdminPage;
