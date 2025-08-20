import React, { useState, useEffect } from 'react';
import {
    Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Spinner, Table, Progress
} from 'reactstrap';
import Papa from 'papaparse'; // For CSV parsing
import moment from 'moment';
import Tesseract from 'tesseract.js';

const ExpenseDashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        date: moment().format('YYYY-MM-DD'),
        description: '',
        receipt: null
    });
    const [editingId, setEditingId] = useState(null);
    const [editedExpense, setEditedExpense] = useState({});


    // OCR states
    const [ocrRunning, setOcrRunning] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [ocrResult, setOcrResult] = useState(null);
    const [statementFile, setStatementFile] = useState(null);

    const expenseCategories = [
        // Marketing & Promotions
        'Advertising',
        'Promotional',
        'Car Wrapping',
        'Meals & Entertainment',

        // Fees & Dues
        'Commissions & Fees',
        'Bank Charges',
        'Dues & Subscriptions',
        'Disposal Fees',
        'Miscellaneous',

        // Office & Admin
        'Office Expenses',
        'Rent or Lease',
        'Supplies',
        'Stationary & Printing',
        'Repair & Maintenance',
        'Cellphone',
        'Utilities',
        'Website Hosting',

        // Operations & Materials
        'Cost of Labor',
        'Freight & Delivery',
        'Supplies & Materials',
        'Locker Room Rental',
        'Purchases',
        'Job Materials',

        // Travel & Vehicles
        'Airfare',
        'Hotels',
        'Travel Meals',
        'Transportation',
        'Car Leasing',
        'Entertainment',
        'Parking',

        // Professional Services
        'Legal & Professional Fees',

        // Insurance
        'Insurance - Disability',
        'Insurance - Liability',
        'Insurance - Errors & Omissions',
        'Insurance - Car',

        // Financial & Other
        'Penalties & Settlements',
        'Bad Debts',
        'Interest Expense',
        'Taxes & Licenses'
    ];


    // Fetch all expenses
    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/expenses');
            if (!res.ok) throw new Error('Failed to fetch expenses');
            const json = await res.json();
            setExpenses(json);
        } catch (err) {
            console.error('Error fetching expenses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    // Add new expense
    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            const body = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) body.append(key, formData[key]);
            });

            const res = await fetch('/api/expenses', {
                method: 'POST',
                body
            });
            if (!res.ok) throw new Error('Failed to add expense');

            await fetchExpenses();
            setFormData({
                amount: '',
                category: '',
                date: moment().format('YYYY-MM-DD'),
                description: '',
                receipt: null
            });
            setOcrRunning(false);
            setOcrProgress(0);
        } catch (err) {
            alert('Error adding expense.');
        } finally {
            setUploading(false);
        }
    };

    // Delete an expense
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;

        try {
            const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete expense');
            fetchExpenses();
        } catch (err) {
            alert('Error deleting expense.');
        }
    };

    // CSV Upload
    const handleCSVUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                const rows = result.data.map(r => ({
                    amount: parseFloat(r.Amount || r.amount || 0),
                    category: r.Category || 'Uncategorized',
                    date: r.Date || moment().format('YYYY-MM-DD'),
                    description: r.Description || '',
                }));
                uploadCSVExpenses(rows);
            }
        });
    };

    const uploadCSVExpenses = async (rows) => {
        setUploading(true);
        try {
            const res = await fetch('/api/expenses/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expenses: rows })
            });
            if (!res.ok) throw new Error('Failed to upload CSV');
            fetchExpenses();
        } catch (err) {
            alert('Error uploading CSV.');
        } finally {
            setUploading(false);
        }
    };

    // ---------- OCR with Tesseract ----------
    const handleReceiptChange = async (file) => {
        if (!file) return;
        setFormData(prev => ({ ...prev, receipt: file }));
        setOcrRunning(true);
        setOcrProgress(0);

        // try {
        //     const { data } = await Tesseract.recognize(file, 'eng', {
        //         logger: (m) => {
        //             if (m.status === 'recognizing text' && m.progress) {
        //                 setOcrProgress(Math.round(m.progress * 100));
        //             }
        //         }
        //     });


        try {
            const formDataToSend = new FormData();
            formDataToSend.append('receipt', file); // 👈 MUST match `upload.single('receipt')` on backend
            console.log(file.size, file.type);
            const res = await fetch('/api/expenses/ocr-receipt', {
                method: 'POST',
                body: formDataToSend
            });

            // const { text } = data;
            const data = await res.json();
            const extracted = data.text || '';
            // Try to parse amount & date
            const detectedAmount = parseAmountFromText(extracted);
            const detectedDate = parseDateFromText(extracted);

            setFormData(prev => ({
                ...prev,
                amount: detectedAmount ?? prev.amount,
                date: detectedDate ?? prev.date
            }));
        } catch (err) {
            console.error('OCR error', err);
        } finally {
            setOcrRunning(false);
        }
    };

    const handleStatementChange = async (file) => {
        if (!file) return;
        setStatementFile(file);
        setOcrRunning(true);
        setOcrProgress(0);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('statement', file); // 👈 MUST match `upload.single('statement')` on backend

            const res = await fetch('/api/expenses/ocr-bank-statement', {
                method: 'POST',
                body: formDataToSend
            });

            const data = await res.json();
            console.log('Imported transactions:', data.insertedExpenses);

            // Optional: show confirmation message
            setOcrResult(data);
        } catch (err) {
            console.error('OCR error', err);
        } finally {
            setOcrRunning(false);
            setOcrProgress(100);
        }
    };

    const parseAmountFromText = (text) => {
        // Look for values like 123.45 or $123.45
        // This picks the *largest* number with 2 decimals as a crude heuristic.
        const matches = [...text.matchAll(/(\$?\s?)(\d+\.\d{2})/g)].map(m => parseFloat(m[2]));
        if (!matches.length) return null;
        return Math.max(...matches).toFixed(2);
    };

    const parseDateFromText = (text) => {
        // Tries MM/DD/YYYY or YYYY-MM-DD or DD/MM/YYYY
        const patterns = [
            /\b(\d{4})[-\/](\d{2})[-\/](\d{2})\b/,         // 2025-07-28
            /\b(\d{2})[-\/](\d{2})[-\/](\d{4})\b/,         // 07/28/2025 or 28/07/2025
        ];
        for (const p of patterns) {
            const m = text.match(p);
            if (!m) continue;

            if (p === patterns[0]) {
                // YYYY-MM-DD
                const [_, yyyy, mm, dd] = m;
                const iso = `${yyyy}-${mm}-${dd}`;
                if (moment(iso, 'YYYY-MM-DD', true).isValid()) return iso;
            } else {
                // MM/DD/YYYY or DD/MM/YYYY -> try both safely
                const [_, a, b, yyyy] = m;
                // Try MM/DD
                let candidate = `${yyyy}-${a}-${b}`;
                if (moment(candidate, 'YYYY-MM-DD', true).isValid()) return candidate;
                // Try DD/MM
                candidate = `${yyyy}-${b}-${a}`;
                if (moment(candidate, 'YYYY-MM-DD', true).isValid()) return candidate;
            }
        }
        return null;
    };

    const handleSave = async (id) => {
        try {
            const updated = { ...editedExpense };
            const res = await fetch(`/api/expenses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
            });
            if (!res.ok) throw new Error('Failed to update');

            const updatedExp = await res.json();
            setExpenses(expenses.map(e => (e._id === id ? updatedExp : e)));
            setEditingId(null);
            setEditedExpense({});
        } catch (err) {
            console.error(err);
            alert('Update failed');
        }
    };


    return (
        <section className="py-4 px-1 mx-auto">
            <h3>Expense Dashboard</h3>

            <Row className="mb-4">
                <Col md={6}>
                    <Card>
                        <CardBody>
                            <h5>Add New Expense</h5>
                            <Form onSubmit={handleSubmit}>
                                <FormGroup>
                                    <Label>Amount (CAD)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        className="text-bold form-input text-cleanar-color"
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Category</Label>
                                    <Input
                                        type="select"
                                        value={formData.category}
                                        className="text-bold form-input text-cleanar-color"
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {expenseCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </Input>
                                </FormGroup>

                                <FormGroup>
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        className="text-bold form-input text-cleanar-color"
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label>Description</Label>
                                    <Input
                                        type="text"
                                        value={formData.description}
                                        className="text-bold form-input text-cleanar-color"
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </FormGroup>
                                {/* <FormGroup>
                                    <Label>Receipt (optional)</Label>
                                    <Input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={e => setFormData({ ...formData, receipt: e.target.files[0] })}
                                    />
                                </FormGroup> */}
                                <FormGroup>
                                    <Label>Receipt (optional - images recommended for OCR)</Label>
                                    <Input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="text-cleanar-color form-input"
                                        onChange={e => handleReceiptChange(e.target.files[0])}
                                    />
                                    {ocrRunning && (
                                        <div className="mt-2">
                                            <div className="small text-muted">Reading receipt (OCR)… {ocrProgress}%</div>
                                            <Progress value={ocrProgress} />
                                        </div>
                                    )}
                                </FormGroup>
                                <Button color="primary" type="submit" disabled={uploading}>
                                    {uploading ? <Spinner size="sm" /> : 'Add Expense'}
                                </Button>
                                {/* Bank Statement Upload */}
                                <FormGroup className="mt-4">
                                    <Label>Bank Statement (PDF recommended)</Label>
                                    <Input
                                        type="file"
                                        accept=".pdf,image/*"
                                        className="text-cleanar-color form-input"
                                        onChange={(e) => handleStatementChange(e.target.files[0])}
                                    />
                                    {ocrRunning && (
                                        <div className="mt-2">
                                            <div className="small text-muted">Processing OCR… {ocrProgress}%</div>
                                            <Progress value={ocrProgress} />
                                        </div>
                                    )}
                                    <Button
                                        className="mt-2"
                                        color="success"
                                        disabled={!statementFile || ocrRunning}
                                        onClick={() => uploadFile(statementFile, "/api/ocr-bank-statement")}
                                    >
                                        Upload Bank Statement
                                    </Button>
                                </FormGroup>

                                {ocrResult && (
                                    <pre className="mt-4 p-2 bg-light border rounded">
                                        {JSON.stringify(ocrResult, null, 2)}
                                    </pre>
                                )}
                            </Form>
                        </CardBody>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card>
                        <CardBody>
                            <h5>Import CSV</h5>
                            <p className="text-muted small mb-2">Upload a CSV (columns: Amount, Category, Date, Description)</p>
                            <Input type="file" accept=".csv"
                                className="text-cleanar-color form-input"
                                onChange={handleCSVUpload} />
                            {uploading && (
                                <div className="mt-3">
                                    <Spinner size="sm" /> Uploading…
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            <h4>All Expenses</h4>
            {loading ? <Spinner /> : (
                <Table striped bordered responsive>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Description</th>
                            <th>Receipt</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* {expenses.map(exp => (
                            <tr key={exp._id}>
                                <td>{moment(exp.date).format('YYYY-MM-DD')}</td>
                                <td>{exp.category}</td>
                                <td>${Number(exp.amount).toFixed(2)}</td>
                                <td>{exp.description || '-'}</td>
                                <td>
                                    {exp.receiptUrl ? <a href={exp.receiptUrl} target="_blank" rel="noreferrer">View</a> : 'N/A'}
                                </td>
                                <td>
                                    <Button size="sm" color="danger" onClick={() => handleDelete(exp._id)}>Delete</Button>
                                </td>
                            </tr>
                        ))} */}
                        {expenses.map(exp => {
                            const isEditing = editingId === exp._id;

                            return (
                                <tr key={exp._id}>
                                    <td>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                value={moment(editedExpense.date || exp.date).format('YYYY-MM-DD')}
                                                onChange={(e) =>
                                                    setEditedExpense({ ...editedExpense, date: e.target.value })
                                                }
                                            />
                                        ) : (
                                            moment(exp.date).format('YYYY-MM-DD')
                                        )}
                                    </td>

                                    <td>
                                        {isEditing ? (
                                            <select
                                                value={editedExpense.category || exp.category}
                                                onChange={(e) =>
                                                    setEditedExpense({ ...editedExpense, category: e.target.value })
                                                }
                                            >
                                                <option value="Bank Import">Bank Import</option>
                                                <option value="Supplies">Supplies</option>
                                                <option value="Utilities">Utilities</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        ) : (
                                            exp.category
                                        )}
                                    </td>

                                    <td>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editedExpense.amount ?? exp.amount}
                                                onChange={(e) =>
                                                    setEditedExpense({ ...editedExpense, amount: e.target.value })
                                                }
                                            />
                                        ) : (
                                            `$${Number(exp.amount).toFixed(2)}`
                                        )}
                                    </td>

                                    <td>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editedExpense.description ?? exp.description}
                                                onChange={(e) =>
                                                    setEditedExpense({ ...editedExpense, description: e.target.value })
                                                }
                                            />
                                        ) : (
                                            exp.description || '-'
                                        )}
                                    </td>

                                    <td>
                                        {exp.receiptUrl ? (
                                            <a href={exp.receiptUrl} target="_blank" rel="noreferrer">View</a>
                                        ) : 'N/A'}
                                    </td>

                                    <td>
                                        {isEditing ? (
                                            <>
                                                <Button size="sm" color="success" onClick={() => handleSave(exp._id)}>
                                                    Save
                                                </Button>{' '}
                                                <Button size="sm" color="secondary" onClick={() => setEditingId(null)}>
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    color="primary"
                                                    onClick={() => {
                                                        setEditingId(exp._id);
                                                        setEditedExpense(exp);
                                                    }}
                                                >
                                                    Edit
                                                </Button>{' '}
                                                <Button
                                                    size="sm"
                                                    color="danger"
                                                    onClick={() => handleDelete(exp._id)}
                                                >
                                                    Delete
                                                </Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            )}
        </section>
    );
};

export default ExpenseDashboard;
