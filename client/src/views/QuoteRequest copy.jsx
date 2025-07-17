import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Popover, PopoverBody } from 'reactstrap';
import { Container, Button, Form, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaQuestionCircle } from 'react-icons/fa';
import Auth from "../utils/auth";
import VisitorCounter from "../components/Pages/VisitorCounter";
import { generatePDF } from '../utils/generatePDF';

// Constants
const PROMO_CODES = ['toronto15', 'follow15', 'now15', 'start15', 'fresh15', 'secret15', 'welcome15'];

const INITIAL_FORM_STATE = {
    name: '',
    companyName: '',
    email: '',
    phonenumber: '',
    postalcode: '',
    promoCode: '',
    subtotalCost: 0,
    tax: 0,
    grandTotal: 0,
    services: [{
        type: '',
        service: '',
        customOptions: {},
    }],
    products: [],
};

const UPHOLSTERY_ITEMS = [
    "Sofa Cleaning",
    "Chair Cleaning",
    "Couch Cleaning",
    "Sectional Cleaning",
    "Ottoman Cleaning",
    "Loveseat Cleaning",
    "Dining Chair Cleaning",
    "Recliner Cleaning"
];

// Reusable Components
const FormField = ({ label, name, placeholder, required, value, onChange, type = 'text', ...props }) => {
    const { t } = useTranslation();
    const [popoverOpen, setPopoverOpen] = useState(false);
    
    return (
        <Col md={3} xs={6} className="mb-2">
            <Form.Label className="text-bold mb-1">
                {label}{required && '*'}
                <FaQuestionCircle
                    id={`${name}Tooltip`}
                    className="ms-1"
                    onClick={() => setPopoverOpen(!popoverOpen)}
                />
                <Popover
                    placement="top"
                    isOpen={popoverOpen}
                    target={`${name}Tooltip`}
                    toggle={() => setPopoverOpen(!popoverOpen)}
                >
                    <PopoverBody>{t(`quick_quote.tooltips.${name}`)}</PopoverBody>
                </Popover>
            </Form.Label>
            <Form.Control
                type={type}
                placeholder={placeholder}
                aria-label={label}
                className="text-cleanar-color form-input rounded-pill"
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                {...props}
            />
        </Col>
    );
};

const SelectField = ({ label, name, options, value, onChange, placeholder, size = "sm", ...props }) => (
    <Form.Group controlId={name}>
        <Form.Label className="fw-semibold">{label}</Form.Label>
        <Form.Select
            aria-label={label}
            name={name}
            size={size}
            className="text-cleanar-color form-input"
            value={value}
            onChange={onChange}
            {...props}
        >
            <option value="">{placeholder}</option>
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </Form.Select>
    </Form.Group>
);

// Custom option configurations
const customOptionConfigs = {
    'House Cleaning': {
        fields: [
            {
                type: 'select',
                name: 'frequency',
                label: 'quick_quote.customOptions.frequency',
                options: ['oneTime', 'weekly', 'biWeekly', 'monthly', 'other']
            },
            {
                type: 'select',
                name: 'squareFootage',
                label: 'quick_quote.customOptions.unitSize',
                options: ['0-499', '500-999', '1000-1499', '1500-1999', '2000+']
            },
            {
                type: 'select',
                name: 'bedrooms',
                label: 'quick_quote.customOptions.bedrooms',
                options: Array.from({ length: 6 }, (_, i) => ({ value: i.toString(), label: i === 5 ? '5+' : i.toString() }))
            },
            {
                type: 'select',
                name: 'bathrooms',
                label: 'quick_quote.customOptions.bathrooms',
                options: Array.from({ length: 6 }, (_, i) => ({ value: i.toString(), label: i === 5 ? '5+' : i.toString() }))
            },
            {
                type: 'date',
                name: 'startDate',
                label: 'quick_quote.customOptions.startDate'
            },
            {
                type: 'checkboxGroup',
                name: 'additionalOptions',
                label: 'quick_quote.customOptions.additionalOptions',
                options: ['deepCleaning', 'windowCleaning', 'laundryService']
            }
        ]
    },
    'Carpet Cleaning': {
        fields: [
            {
                type: 'select',
                name: 'carpetType',
                label: 'quick_quote.customOptions.carpetMaterial',
                options: ['wool', 'nylon', 'polyester', 'olefin', 'other']
            },
            {
                type: 'number',
                name: 'carpetArea',
                label: 'quick_quote.customOptions.carpetArea',
                placeholder: 'e.g. 500'
            },
            {
                type: 'select',
                name: 'stains',
                label: 'quick_quote.customOptions.stains',
                options: ['none', 'light', 'moderate', 'heavy']
            },
            {
                type: 'date',
                name: 'startDate',
                label: 'quick_quote.customOptions.preferredCleaningDate'
            }
        ]
    },
    'Move-In/Out Cleaning': {
        fields: [
            {
                type: 'select',
                name: 'frequency',
                label: 'quick_quote.customOptions.frequency',
                options: ['oneTime', 'weekly', 'biWeekly', 'monthly', 'other']
            },
            {
                type: 'select',
                name: 'squareFootage',
                label: 'quick_quote.customOptions.unitSize',
                options: ['0-499', '500-999', '1000-1499', '1500-1999', '2000+']
            },
            {
                type: 'select',
                name: 'bedrooms',
                label: 'quick_quote.customOptions.bedrooms',
                options: Array.from({ length: 6 }, (_, i) => ({ value: i.toString(), label: i === 5 ? '5+' : i.toString() }))
            },
            {
                type: 'select',
                name: 'bathrooms',
                label: 'quick_quote.customOptions.bathrooms',
                options: Array.from({ length: 6 }, (_, i) => ({ value: i.toString(), label: i === 5 ? '5+' : i.toString() }))
            },
            {
                type: 'date',
                name: 'startDate',
                label: 'quick_quote.customOptions.startDate'
            },
        ]
    },
    // Add other service configurations as needed
};

const QuoteRequest = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [selectedService, setSelectedService] = useState('');
    const [options, setOptions] = useState([]);
    const [isLogged] = useState(Auth.loggedIn());

    // Form field configuration
    const formFields = useMemo(() => [
        { label: t('quick_quote.form.name'), name: 'name', required: true },
        { label: t('quick_quote.form.email'), name: 'email', required: true },
        { label: t('quick_quote.form.phonenumber'), name: 'phonenumber', required: true },
        { label: t('quick_quote.form.companyName'), name: 'companyName', required: false },
        { label: t('quick_quote.form.postalcode'), name: 'postalcode', required: true },
        { label: t('quick_quote.form.promoCode'), name: 'promoCode', required: false }
    ], [t]);

    const serviceOptions = useMemo(() => ({
        "Residential Cleaning": {
            label: t("quick_quote.services.Residential Cleaning.label"),
            types: t("quick_quote.services.Residential Cleaning.types", { returnObjects: true }),
        },
        "Commercial Cleaning": {
            label: t("quick_quote.services.Commercial Cleaning.label"),
            types: t("quick_quote.services.Commercial Cleaning.types", { returnObjects: true }),
        },
        "Carpet And Upholstery": {
            label: t("quick_quote.services.Carpet And Upholstery.label"),
            types: t("quick_quote.services.Carpet And Upholstery.types", { returnObjects: true }),
        },
        "Window Cleaning": {
            label: t("quick_quote.services.Window Cleaning.label"),
            types: t("quick_quote.services.Window Cleaning.types", { returnObjects: true }),
        },
        "Power/Pressure Washing": {
            label: t("quick_quote.services.Power/Pressure Washing.label"),
            types: t("quick_quote.services.Power/Pressure Washing.types", { returnObjects: true }),
        }
    }), [t]);

    // Simplified handlers
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleServiceChange = useCallback((service) => {
        setSelectedService(service);
        setOptions(serviceOptions[service] || []);
        setFormData(prev => ({ ...prev, services: [{ type: service, service: '', customOptions: {} }] }));
    }, [serviceOptions]);

    const handleCustomOptionChange = useCallback((type, option, e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        const ariaLabel = e.target.getAttribute('aria-label');
        
        setFormData(prev => ({
            ...prev,
            services: prev.services.map(s =>
                s.type === type ? {
                    ...s,
                    customOptions: {
                        ...s.customOptions,
                        [option]: { service: value, label: ariaLabel }
                    }
                } : s
            )
        }));
    }, []);

    const validatePromoCode = useCallback((code) => {
        return PROMO_CODES.includes(code.toLowerCase());
    }, []);

    const validateForm = useCallback(() => {
        const requiredFields = ['name', 'email', 'phonenumber', 'postalcode'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (formData.services.length === 0 && formData.products.length === 0) {
            missingFields.push('Services or Products');
        }

        if (missingFields.length > 0) {
            alert(`Please fill out all required fields: ${missingFields.join(', ')}`);
            return false;
        }
        return true;
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.promoCode && !validatePromoCode(formData.promoCode)) {
            alert('Invalid promo code. Please review your code and try again.');
            return;
        }

        if (!validateForm()) return;

        // Rest of your submit logic...
        try {
            // Your existing submit logic
            alert('Quote submitted successfully!');
            await generatePDF(formData);
            setFormData(INITIAL_FORM_STATE);
            navigate('/products-and-services');
        } catch (error) {
            console.error('Error submitting quote:', error);
            alert('Error submitting quote. Please try again.');
        }
    };

    // Dynamic custom options renderer
    const renderCustomOptions = (type) => {
        const config = customOptionConfigs[type];
        if (!config) {
            // Default case for unconfigured services
            return (
                <Row>
                    <Col>
                        <Form.Group>
                            <Form.Label>{t('quick_quote.customOptions.description')}*</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                className='text-cleanar-color form-input'
                                placeholder={t('quick_quote.customOptions.descriptionDetail')}
                                value={formData.services.find(s => s.type === type)?.customOptions?.description?.service || ''}
                                onChange={(e) => handleCustomOptionChange(type, 'description', e)}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            );
        }

        return (
            <Row className="g-1">
                {config.fields.map(field => {
                    const serviceData = formData.services.find(s => s.type === type);
                    const fieldValue = serviceData?.customOptions?.[field.name]?.service || '';

                    switch (field.type) {
                        case 'select':
                            return (
                                <Col key={field.name} xs={12} md={6}>
                                    <SelectField
                                        label={t(field.label)}
                                        name={field.name}
                                        value={fieldValue}
                                        className='text-cleanar-color form-input rounded-pill'
                                        onChange={(e) => handleCustomOptionChange(type, field.name, e)}
                                        placeholder={t('quick_quote.customOptions.selectText')}
                                        options={field.options.map(opt => ({
                                            value: typeof opt === 'object' ? opt.value : opt,
                                            label: typeof opt === 'object' ? opt.label : t(`quick_quote.customOptions.${opt}`)
                                        }))}
                                    />
                                </Col>
                            );
                        case 'date':
                            return (
                                <Col key={field.name} xs={12} md={6}>
                                    <Form.Group>
                                        <Form.Label>{t(field.label)}</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name={field.name}
                                            value={fieldValue}
                                            className='text-cleanar-color form-input rounded-pill'
                                            onChange={(e) => handleCustomOptionChange(type, field.name, e)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </Form.Group>
                                </Col>
                            );
                        case 'checkboxGroup':
                            return (
                                <Col key={field.name} xs={12}>
                                    <Form.Group>
                                        <Form.Label>{t(field.label)}</Form.Label>
                                        <Row>
                                            {field.options.map(option => (
                                                <Col key={option} xs={12} sm={6} lg={4}>
                                                    <Form.Check
                                                        type="checkbox"
                                                        id={`${option}-${type}`}
                                                        label={t(`quick_quote.customOptions.${option}`)}
                                                        name={option}
                                                        aria-label={t(`quick_quote.customOptions.${option}`)}
                                                        className='text-cleanar-color'
                                                        checked={serviceData?.customOptions?.[option]?.service || false}
                                                        onChange={(e) => handleCustomOptionChange(type, option, e)}
                                                    />
                                                </Col>
                                            ))}
                                        </Row>
                                    </Form.Group>
                                </Col>
                            );
                        case 'number':
                            return (
                                <Col key={field.name} xs={12} md={6}>
                                    <Form.Group>
                                        <Form.Label>{t(field.label)}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name={field.name}
                                            placeholder={field.placeholder}
                                            value={fieldValue}
                                            className='text-cleanar-color form-input rounded-pill'
                                            onChange={(e) => handleCustomOptionChange(type, field.name, e)}
                                            min={0}
                                        />
                                    </Form.Group>
                                </Col>
                            );
                        default:
                            return null;
                    }
                })}
            </Row>
        );
    };

    // Effects
    useEffect(() => {
        if (isLogged) {
            const data = Auth.getProfile().data;
            setFormData(prev => ({
                ...prev,
                name: `${data.firstName} ${data.lastName}`,
                email: data.email,
                phonenumber: data.telephone,
                postalcode: data.postalcode,
                companyName: data.companyName,
                userId: data._id
            }));
        }
    }, [isLogged]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const promoCode = searchParams.get('promoCode');
        const serviceClicked = searchParams.get('service');
        const scrollToQuote = searchParams.get('scrollToQuote');

        if (promoCode) {
            setFormData(prev => ({ ...prev, promoCode }));
        }
        if (serviceClicked) {
            handleServiceChange(serviceClicked);
        }
        if (scrollToQuote) {
            document.getElementById("quote-section")?.scrollIntoView({ behavior: "smooth" });
        }
    }, [location.search, handleServiceChange]);

    return (
        <Container className="quick-quote-container px-4" id="quote-section">
            <HelmetProvider>
                <Helmet>
                    <title>CleanAR Solutions - Quick Quote</title>
                    <meta name="description" content="Get a quick service estimate from CleanAR Solutions. Fill out our form to receive a personalized quote for your cleaning needs." />
                </Helmet>
            </HelmetProvider>
            
            <VisitorCounter />
            
            <h2 className="text-center primary-color text-bold pt-2">
                {t('quick_quote.form.title')}
            </h2>

            <Form onSubmit={handleSubmit} id="quote-form" className="m-0 p-0">
                {/* Contact Information Section */}
                <Row>
                    {formFields.map(field => (
                        <FormField
                            key={field.name}
                            {...field}
                            placeholder={field.label}
                            value={formData[field.name]}
                            onChange={handleChange}
                        />
                    ))}
                </Row>

                {/* Service Selection Section */}
                <section className="section-border">
                    <Row>
                        {/* Service Type Selection */}
                        <Col md={3} xs={12} className="mb-3">
                            <ServiceTypeSelector
                                serviceOptions={serviceOptions}
                                selectedService={selectedService}
                                onServiceChange={handleServiceChange}
                            />
                        </Col>

                        {/* Service Options */}
                        <Col md={3} xs={12} className="mb-3">
                            <ServiceOptionsSelector
                                selectedService={selectedService}
                                serviceOptions={serviceOptions}
                                onServiceSelect={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        services: [{
                                            type: e.target.value,
                                            service: selectedService,
                                            customOptions: {}
                                        }]
                                    }));
                                }}
                            />
                        </Col>

                        {/* Custom Options */}
                        <Col md={6} xs={12}>
                            <CustomOptionsSection
                                services={formData.services}
                                renderCustomOptions={renderCustomOptions}
                            />
                        </Col>
                    </Row>
                </section>

                {/* Confirmation Message */}
                <Row>
                    <Col>
                        <p className='primary-color text-bold pt-2'>
                            {t('quick_quote.form.confirmationMessage')}
                        </p>
                    </Col>
                </Row>

                {/* Action Buttons */}
                <Row className='pb-3'>
                    <Col md={6}>
                        <Button 
                            type="submit" 
                            className='secondary-bg-color rounded-pill'
                            data-track="clicked_submit_quote"
                        >
                            {t('quick_quote.form.submit')}
                        </Button>
                    </Col>
                    <Col md={6}>
                        <Button 
                            type="button"
                            onClick={() => setFormData(INITIAL_FORM_STATE)}
                            className='btn-danger rounded-pill'
                            data-track="clicked_reset_quote"
                        >
                            {t('quick_quote.form.reset')}
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

// Sub-components for better organization
const ServiceTypeSelector = ({ serviceOptions, selectedService, onServiceChange }) => {
    const { t } = useTranslation();
    const [popoverOpen, setPopoverOpen] = useState(false);

    return (
        <>
            <Form.Group className="mb-3">
                <Form.Label className="text-bold mb-1">
                    {t('quick_quote.form.serviceRequired')}*
                    <FaQuestionCircle
                        id="servicesTooltip"
                        className="ms-1"
                        onClick={() => setPopoverOpen(!popoverOpen)}
                    />
                    <Popover
                        placement="top"
                        isOpen={popoverOpen}
                        target="servicesTooltip"
                        toggle={() => setPopoverOpen(!popoverOpen)}
                    >
                        <PopoverBody>{t('quick_quote.form.serviceDescription')}</PopoverBody>
                    </Popover>
                </Form.Label>
            </Form.Group>
            <div className="radio-group">
                {Object.keys(serviceOptions).map((service) => (
                    <label key={service} className="radio-label d-block mb-2">
                        <input
                            type="radio"
                            name="serviceType"
                            value={service}
                            checked={selectedService === service}
                            onChange={() => onServiceChange(service)}
                            className="me-2"
                        />
                        {serviceOptions[service].label}
                    </label>
                ))}
            </div>
        </>
    );
};

const ServiceOptionsSelector = ({ selectedService, serviceOptions, onServiceSelect }) => {
    const { t } = useTranslation();
    const [popoverOpen, setPopoverOpen] = useState(false);

    return (
        <>
            <Form.Group className="mb-3">
                <Form.Label className="text-bold mb-1">
                    {t('quick_quote.form.serviceType')}*
                    <FaQuestionCircle
                        id="serviceLevelTooltip"
                        className="ms-1"
                        onClick={() => setPopoverOpen(!popoverOpen)}
                    />
                    <Popover
                        placement="top"
                        isOpen={popoverOpen}
                        target="serviceLevelTooltip"
                        toggle={() => setPopoverOpen(!popoverOpen)}
                    >
                        <PopoverBody>{t('quick_quote.form.serviceLevel')}</PopoverBody>
                    </Popover>
                </Form.Label>
            </Form.Group>
            {selectedService ? (
                <div className="radio-group options-selection">
                    {serviceOptions[selectedService]?.types?.map((option) => (
                        <label key={option} className="radio-label d-block mb-2">
                            <input
                                type="radio"
                                name="serviceOption"
                                value={option}
                                onChange={onServiceSelect}
                                className="me-2"
                            />
                            {option}
                        </label>
                    ))}
                </div>
            ) : (
                <p className="text-danger text-bold">{t('quick_quote.customOptions.pleaseAddService')}</p>
            )}
        </>
    );
};

const CustomOptionsSection = ({ services, renderCustomOptions }) => {
    const { t } = useTranslation();
    const [popoverOpen, setPopoverOpen] = useState(false);

    // Translation reverse mapping utility
    const reverseLabelMap = {
        "Nettoyage de maison": "House Cleaning",
        "Nettoyage avant/après déménagement": "Move-In/Out Cleaning",
        // ... rest of your translations
    };

    return (
        <>
            <Form.Group className="mb-3">
                <Form.Label className="text-bold mb-1">
                    {t('quick_quote.form.customOptions')}*
                    <FaQuestionCircle
                        id="additionalServicesTooltip"
                        className="ms-1"
                        onClick={() => setPopoverOpen(!popoverOpen)}
                    />
                    <Popover
                        placement="top"
                        isOpen={popoverOpen}
                        target="additionalServicesTooltip"
                        toggle={() => setPopoverOpen(!popoverOpen)}
                    >
                        <PopoverBody>{t('quick_quote.form.additionalServices')}</PopoverBody>
                    </Popover>
                </Form.Label>
            </Form.Group>
            {services.map((service, index) => {
                const internalKey = reverseLabelMap[service.type] || service.type;
                return (
                    <div key={index} className="mb-3">
                        {renderCustomOptions(internalKey)}
                    </div>
                );
            })}
        </>
    );
};

export default QuoteRequest;