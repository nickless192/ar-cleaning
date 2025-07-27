// TO DO: Add preview of the translated text

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Input,
  Label,
  Button,
  Row,
  Col,
  ButtonGroup,
  Table
} from 'reactstrap';

import { FaEdit, FaTrash } from 'react-icons/fa';

export default function ManageCategories() {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        key: '', 
        type: 'service', 
        descriptionKey: '',
        labelKey: ''
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting form:', form);
        if (!form.labelKey || !form.key) {
            alert('Name and Key are required');
            return;
        }
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `/api/categories/${editingId}` : '/api/categories';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });

        setForm({ labelKey: '', key: '', type: 'service', descriptionKey: '' });
        // Reset editing state
        if (editingId) {
            setEditingId(null);
        }
        fetchCategories();
    };

    const handleEdit = (cat) => {
        setForm({ labelKey: cat.labelKey, key: cat.key, type: cat.type, descriptionKey: cat.descriptionKey || '' });
        setEditingId(cat._id);
    };

    const handleDelete = async (id) => {
        await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        fetchCategories();
    };

    return (
    <div className="py-4 px-3">
      <Card>
        <CardHeader tag="h5">
          {editingId ? 'Edit Category' : 'Add New Category'}
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={3}>
                <FormGroup>
                  <Label for="labelKey">Name</Label>
                  <Input
                    id="labelKey"
                    name="labelKey"
                    placeholder="Category Name"
                    className='text-cleanar-color form-input'
                    value={form.labelKey}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label for="key">Key</Label>
                  <Input
                    id="key"
                    name="key"
                    placeholder="e.g., services.residential"
                    className='text-cleanar-color form-input'
                    value={form.key}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
              </Col>
            {/* </Row>
            <Row> */}
              <Col md={3}>
                <FormGroup>
                  <Label for="descriptionKey">Description Key</Label>
                  <Input
                    id="descriptionKey"
                    name="descriptionKey"
                    placeholder="e.g., services.residential.description"
                    className='text-cleanar-color form-input'
                    value={form.descriptionKey}
                    onChange={handleChange}
                  />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup>
                  <Label for="type">Type</Label>
                  <Input
                    type="select"
                    id="type"
                    name="type"
                    className='text-cleanar-color form-input'
                    value={form.type}
                    onChange={handleChange}
                  >
                    <option value="service">Service</option>
                    <option value="product">Product</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>

            <ButtonGroup className="mt-3">
              <Button color="primary" type="submit">
                {editingId ? 'Update' : 'Add'}
              </Button>
              <Button
                type="button"
                color="secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm({ labelKey: '', key: '', type: 'service', descriptionKey: '' });
                }}
              >
                Cancel
              </Button>
            </ButtonGroup>
          </Form>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader tag="h5">Category List</CardHeader>
        <CardBody className="p-0">
          <Table responsive hover striped className="mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Key</th>
                <th>Type</th>
                <th>Description</th>
                <th>Translations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td>{cat.labelKey}</td>
                  <td className="text-muted">{cat.key}</td>
                  <td>{cat.type}</td>
                  <td>{cat.descriptionKey}</td>
                  <td>
                    <div className="text-success">{t(cat.key)}</div>
                    <div className="text-info small">
                      {t(cat.descriptionKey, { returnObjects: true })}
                    </div>
                  </td>
                  <td>
                    <Button size="sm" color="outline-secondary" onClick={() => handleEdit(cat)} className="me-2">
                      <FaEdit />
                    </Button>
                    <Button size="sm" color="outline-danger" onClick={() => handleDelete(cat._id)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );

    // return (
    //     <div className="container py-4">
    //         <h2 className="mb-3">Manage Categories</h2>
    //         <form onSubmit={handleSubmit} className="mb-4">
    //             <div className="mb-2">
    //                 <input
    //                     type="text"
    //                     name="labelKey"
    //                     value={form.labelKey}
    //                     onChange={handleChange}
    //                     placeholder="Category Name"
    //                     required
    //                     className="form-control text-cleanar-color form-input"
    //                 />
    //             </div>
    //             <div className="mb-2">
    //                 <input
    //                     type="text"
    //                     name="key"
    //                     value={form.key}
    //                     onChange={handleChange}
    //                     placeholder="Category Key (e.g., services.residential)"
    //                     required
    //                     className="form-control text-cleanar-color form-input"
    //                 />
    //             </div>
    //             <div className="mb-2">
    //                 <input
    //                     type="text"
    //                     name="descriptionKey"
    //                     value={form.descriptionKey}
    //                     onChange={handleChange}
    //                     placeholder="Category Description Key (e.g., services.residential.description)"
    //                     className="form-control text-cleanar-color form-input"
    //                 />
    //             </div>
    //             <div className="mb-2">
    //                 <select
    //                     name="type"
    //                     value={form.type}
    //                     onChange={handleChange}
    //                     className="form-select text-cleanar-color form-input"
    //                 >
    //                     <option value="service">Service</option>
    //                     <option value="product">Product</option>
    //                 </select>
    //             </div>
    //             <button type="submit" className="btn btn-primary">
    //                 {editingId ? 'Update' : 'Add'} Category
    //             </button>
    //             <button type="button" className="btn btn-secondary" onClick={() => {
    //                 setEditingId(null);
    //                 setForm({ labelKey: '', key: '', type: 'service', descriptionKey: '' });
    //             }}>
    //                 Cancel
    //             </button>
    //         </form>

    //         <ul className="list-group">
    //             {categories.map((cat) => (
    //                 <li key={cat._id} className="list-group-item d-flex justify-content-between align-items-center">
    //                     <div>
    //                         <strong>{cat.name}</strong> <span className="text-muted">({cat.key})</span> - <em>{cat.type}</em>
    //                         {cat.descriptionKey && <span className="text-secondary"> - {cat.descriptionKey}</span>}
    //                         <br />
    //                         {t(cat.key) && <span className="text-success"> {t(cat.key)}</span>}
    //                         <br />
    //                         {t(cat.descriptionKey) && <span className="text-info">{t(cat.descriptionKey, { returnObjects: true })}</span>}
    //                     </div>
    //                     <div>
    //                         <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleEdit(cat)}>
    //                             Edit
    //                         </button>
    //                         <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(cat._id)}>
    //                             Delete
    //                         </button>
    //                     </div>
    //                 </li>
    //             ))}
    //         </ul>
    //     </div>
    // );
}
