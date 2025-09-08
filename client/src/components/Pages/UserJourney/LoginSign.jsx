import React, {useState} from 'react';
// import './LoginSign.css';
import LoginPage from '/src/components/Pages/UserJourney/LoginPage';
import SignUp from '/src/components/Pages/UserJourney/SignUp';
import {
    Row,
    Col,
    Button 
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const LoginSign = () => {
    const [showLogin, setShowLogin] = useState(true);
    const { t } = useTranslation();

    return (
        <Row className='justify-content-center align-items-center'>
            <Col md='4' className='mx-1'>
                {/* <SignUp />
            </Col>
            <Col md='5' className='mx-1'>
                <LoginPage /> */}
                                {/* Toggle message */}
                 <div className="mb-3 d-flex justify-content-center align-items-center">
                    {showLogin ? (
                        <>
                            <span className="me-1 align-baseline text-bold text-cleanar-color">
                                {t("login.signup_prompt")}
                            </span>
                            <Button
                                variant="link"
                                className="p-0 m-0 align-baseline"
                                style={{
                                    display: 'inline',
                                    width: 'auto',
                                    fontSize: 'inherit',
                                    lineHeight: '1',
                                    textDecoration: 'underline'
                                }}
                                onClick={() => setShowLogin(false)}
                            >
                                {t("login.signup_link")}
                            </Button>
                        </>
                    ) : (
                        <>
                            <span className="me-1 align-baseline text-bold text-cleanar-color">
                                {t("signup.login_prompt")}
                            </span>
                            <Button
                                variant="link"
                                className="p-0 m-0 align-baseline"
                                style={{
                                    display: 'inline',
                                    width: 'auto',
                                    fontSize: 'inherit',
                                    lineHeight: '1',
                                    textDecoration: 'underline'
                                }}
                                onClick={() => setShowLogin(true)}
                            >
                                {t("signup.login_link")}
                            </Button>
                        </>
                    )}
                </div>

                {/* Form toggle */}
                {showLogin ? <LoginPage /> : <SignUp />}
            
            </Col>
        </Row>
    );
};

export default LoginSign;