import React from 'react';
// import './LoginSign.css';
import LoginPage from 'views/LoginPage';
import SignUp from 'views/SignUp';
import {
    FloatingLabel,
    Container,
    Button,
    Form,
    Row,
    Col,
    Collapse
} from 'react-bootstrap';

const LoginSign = () => {
    return (
        <Row className='justify-content-center align-items-center'>
            <Col md='4'>
                <SignUp />
            </Col>
            <Col md='4'>
                <LoginPage />
            </Col>
        </Row>
    );
};

export default LoginSign;