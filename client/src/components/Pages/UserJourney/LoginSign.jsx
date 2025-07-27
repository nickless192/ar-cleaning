import React from 'react';
// import './LoginSign.css';
import LoginPage from '/src/components/Pages/UserJourney/LoginPage';
import SignUp from '/src/components/Pages/UserJourney/SignUp';
import {
    Row,
    Col,
} from 'react-bootstrap';

const LoginSign = () => {
    return (
        <Row className='justify-content-center align-items-center'>
            <Col md='5' className='mx-1'>
                <SignUp />
            </Col>
            <Col md='5' className='mx-1'>
                <LoginPage />
            </Col>
        </Row>
    );
};

export default LoginSign;