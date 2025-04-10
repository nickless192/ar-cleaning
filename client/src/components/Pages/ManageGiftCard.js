import React, { useState, useEffect } from 'react';
import "assets/css/our-palette.css";
import {
    Button,
    Container,
    Row,
    Col,
    Input,
    FormGroup,
    Label,
    Form, Card, CardBody, CardTitle, CardText,
    CardHeader
} from 'reactstrap'; // Importing required components from reactstrap

const ManageGiftCard = () => {
    const [formData, setFormData] = useState({
        code: '',
        amount: '',
        purchaserName: '',
        recipientName: '',
        recipientEmail: '',
        message: '',
        isRedeemed: false,
        redeemedDate: '',
        purchaseDate: ''
    });

    const [giftCards, setGiftCards] = useState([]);

    const [editingGiftCardId, setEditingGiftCardId] = useState(null);
    const [editedGiftCard, setEditedGiftCard] = useState({});

    const handleEditClick = (giftCard) => {
        console.log(giftCard);
        setEditingGiftCardId(giftCard._id);
        setEditedGiftCard({ ...giftCard });
    };

    // the handleSaveClick function is called when the save button is clicked and the edited giftCard is saved so the function needs to receive a giftCard.id as an argument
    const handleSaveClick = () => {
        // onSave(editedGiftCard);
        // api call to update giftCard        
        const { code, amount, purchaserName, recipientName, recipientEmail, message } = editedGiftCard;
        if (!amount || !purchaserName || !recipientName || !recipientEmail || !message) {
            alert('Please provide all fields');
            return;
        }
        const body = JSON.stringify({
            code,
            amount,
            purchaserName,
            recipientName,
            recipientEmail,
            message
        });

        fetch(`/api/giftCards/${editingGiftCardId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Failed to update giftCard');
            })
            .then(data => {
                console.log(data);
                setGiftCards(giftCards.map(giftCard => {
                    if (giftCard._id === editingGiftCardId) {
                        return data;
                    }
                    return giftCard;
                }));
                setEditingGiftCardId(null);
                setEditedGiftCard({});
            })
            .catch(error => {
                console.error(error);
            });
    };

    const handleDeleteClick = (giftCard) => {
        fetch(`/api/giftCards/${giftCard._id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Failed to delete giftCard');
            }
            )
            .then(data => {
                console.log(data);
                setGiftCards(giftCards.filter(giftCard => giftCard._id !== data._id));
                setEditingGiftCardId(null);
                setEditedGiftCard({});
            })
            .catch(error => {
                console.error(error);
            });
    }

    const handleCancelClick = () => {
        setEditingGiftCardId(null);
        setEditedGiftCard({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedGiftCard({ ...editedGiftCard, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { code, amount, purchaserName, recipientName, recipientEmail, message } = formData;
        if (!amount || !purchaserName || !recipientName || !recipientEmail || !message) {
            alert('Please provide all fields');
            return;
        }
        const body = JSON.stringify({
            code,
            amount,
            purchaserName,
            recipientName,
            recipientEmail,
            message
        });

        fetch('/api/giftCards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Failed to create giftCard');
            })
            .then(data => {
                console.log(data);
                setGiftCards([...giftCards, data]);
                setFormData({
                    code: '',
                    amount: '',
                    purchaserName: '',
                    recipientName: '',
                    recipientEmail: '',
                    message: '',
                    isRedeemed: false,
                    redeemedDate: '',
                    purchaseDate: ''
                });
            })
            .catch(error => {
                console.error(error);
            });
    };


    useEffect(() => {
        fetch('/api/giftCards')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setGiftCards(data);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    return (

        <Container>

            <Row>
                <Col>
                    <h1>Manage Gift Cards</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <h3>Gift Cards</h3>
                            </CardTitle>
                        </CardHeader>
                        <CardBody>
                            {giftCards.map(giftCard => (
                                <Card key={giftCard._id}>
                                    <CardBody>
                                        <CardText>
                                            <strong>Code:</strong> {giftCard.code}<br />
                                            <strong>Amount:</strong> {giftCard.amount}<br />
                                            <strong>Purchaser Name:</strong> {giftCard.purchaserName}<br />
                                            <strong>Recipient Name:</strong> {giftCard.recipientName}<br />
                                            <strong>Recipient Email:</strong> {giftCard.recipientEmail}<br />
                                            <strong>Message:</strong> {giftCard.message}<br />
                                            <strong>Redeemed:</strong> {giftCard.isRedeemed ? 'Yes' : 'No'}<br />
                                            <strong>Redeemed Date:</strong> {giftCard.redeemedDate}<br />
                                            <strong>Purchase Date:</strong> {giftCard.purchaseDate}<br />
                                        </CardText>
                                        <Button onClick={() => handleEditClick(giftCard)}>Edit</Button>
                                        <Button onClick={() => handleDeleteClick(giftCard)}>Delete</Button>
                                    </CardBody>
                                </Card>
                            ))}
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <h3>Add Gift Card</h3>
                            </CardTitle>
                        </CardHeader>
                        <CardBody>
                            <Form>
                                <FormGroup>
                                    <Label for="code">Code (if known)</Label>
                                    <Input type="text" name="code" id="code" value={formData.code} onChange={handleInputChange} />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="amount">Amount</Label>
                                    <Input type="text" name="amount" id="amount" value={formData.amount} onChange={handleInputChange} />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="purchaserName">Purchaser Name</Label>
                                    <Input type="text" name="purchaserName" id="purchaserName" value={formData.purchaserName} onChange={handleInputChange} />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="recipientName">Recipient Name</Label>
                                    <Input type="text" name="recipientName" id="recipientName" value={formData.recipientName} onChange={handleInputChange} />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="recipientEmail">Recipient Email</Label>
                                    <Input type="text" name="recipientEmail" id="recipientEmail" value={formData.recipientEmail} onChange={handleInputChange} />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="message">Message</Label>
                                    <Input type="text" name="message" id="message" value={formData.message} onChange={handleInputChange} />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="isRedeemed">Redeemed</Label>
                                    <Input type="checkbox" name="isRedeemed" id="isRedeemed" checked={formData.isRedeemed} onChange={handleInputChange} />
                                </FormGroup>
                                <Button onClick={handleSaveClick}>Save</Button>
                                <Button onClick={handleCancelClick}>Cancel</Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default ManageGiftCard; // Exporting ManageGiftCard component