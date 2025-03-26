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
        <Row>
            <Col>
                <SignUp />
            </Col>
            <Col>
                <LoginPage />
            </Col>
        </Row>
    );
};

export default LoginSign;