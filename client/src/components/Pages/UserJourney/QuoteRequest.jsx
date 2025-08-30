import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
    Popover, PopoverBody
} from 'reactstrap';
import {
    // Container,
    // Form,
    FormGroup,
    Label,
    Input,
    // Button,
    Card,
    CardBody,
    CardHeader,
    Spinner
} from 'reactstrap';
import { Form, Button, Row, Container, Col } from 'react-bootstrap';
import Auth from "/src/utils/auth";
import VisitorCounter from "/src/components/Pages/Management/VisitorCounter";
import {
    FaQuestionCircle
} from 'react-icons/fa';
import { generatePDF } from '/src/utils/generatePDF';

const QuoteRequest = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        companyName: '',
        email: '',
        phonenumber: '',
        postalcode: '',
        promoCode: '',
        subtotalCost: 0,
        tax: 0,
        grandTotal: 0,
        services: [],
        products: [],
        // serviceLevel: '', // New field for service level
    });
    const [popoverOpen, setPopoverOpen] = useState({
        name: false,
        email: false,
        phonenumber: false,
        description: false,
        companyName: false,
        postalcode: false,
        services: false,
    });

    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);

    const [, setValidPromoCode] = useState(false);
    const [isLogged] = useState(Auth.loggedIn());
    const [loading, setLoading] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [scrolledToQuote, setScrolledToQuote] = useState(false);
    const [selectedService, setSelectedService] = useState("");
    const [options, setOptions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [customOptions, setCustomOptions] = useState({});

    const fetchInitialData = async () => {
        try {
            const [catRes, svcRes] = await Promise.all([
                fetch('/api/categories'),
                fetch('/api/services')
            ]);

            const cats = await catRes.json();
            const svcs = await svcRes.json();
            setCategories(cats);
            setServices(svcs);
        } catch (err) {
            console.error('Failed to fetch quote data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Define services and their options
    const serviceOptions = {
        'Residential Cleaning': [
            "House Cleaning",
            "Move-In/Out Cleaning",
            "Condominium Cleaning",
            "Residential Building Cleaning"
        ],
        'Commercial Cleaning': [
            "Office Cleaning",
            "Industrial Cleaning",
            "Retail Cleaning"
        ],
        'Carpet And Upholstery': [
            "Carpet Cleaning",
            "Upholstery Cleaning"
        ],
        'Window Cleaning': [
            "Interior Window Cleaning",
            "Window Track & Sill Cleaning",
            "Glass Door Cleaning"
        ],
        'Power/Pressure Washing': [
            "Driveway Cleaning",
            "Patio & Deck Cleaning",
            "Sidewalk Cleaning",
            "Exterior Siding Cleaning",
            "Fence Cleaning",
            "Garage Floor Cleaning"
        ]
    };

    const togglePopover = (field) => {
        setPopoverOpen((prevState) => {
            // Reset all fields to false
            const newState = Object.keys(prevState).reduce((acc, key) => {
                acc[key] = false;
                return acc;
            }, {});

            // Toggle the selected field
            return { ...newState, [field]: !prevState[field] };
        });
    };


    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const scrollToQuote = searchParams.get('scrollToQuote');
        if (isInitialLoad) {
            const promoCode = searchParams.get('promoCode');
            // console.log('promoCode:', promoCode);
            const serviceClicked = searchParams.get('service');
            if (promoCode) {
                setFormData(prevFormData => ({
                    ...prevFormData,
                    promoCode: promoCode
                }));
            }
            if (serviceClicked) {
                handleServiceChange(serviceClicked);
            }
            prepopulateForm();
            fetchInitialData();
            setIsInitialLoad(false);
        }
        // console.log('serviceClicked:', serviceClicked);

        // calculateTotals();
        document.body.classList.add("request-quote", "sidebar-collapse");
        document.documentElement.classList.remove("nav-open");
        // if (location.state?.scrollToQuote) {
        if (scrollToQuote && !scrolledToQuote) {
            document.getElementById("quote-section")?.scrollIntoView({ behavior: "smooth" });
            const promoCode = searchParams.get('promoCode');
            if (promoCode) {
                setFormData(prevFormData => ({
                    ...prevFormData,
                    promoCode: promoCode
                }));
            }
            setScrolledToQuote(true);
        }
        return document.body.classList.remove("request-quote", "sidebar-collapse");
    }, [isLogged, formData.services, location.search, location.state]);

    const prepopulateForm = useCallback(() => {
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

    const calculateTotals = useCallback(() => {
        const subtotalCost = formData.services.reduce((total, service) => {
            return total + Object.values(service.customOptions || {}).reduce((sum, option) => {
                return sum + (option.service ? option.serviceCost : 0);
            }, 0);
        }, 0);

        const tax = subtotalCost * 0.13;
        const grandTotal = subtotalCost + tax;

        setFormData(prev => ({
            ...prev,
            subtotalCost,
            tax,
            grandTotal
        }));
    }, [formData.services]);


    const handleChange = (event) => {
        const { name, value } = event.target;
        // reset validation if promo code is changed
        if (name === 'promoCode') {
            setValidPromoCode(false);
        }
        setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };


    // Step 1 – Handle Category Change
    const handleCategoryChange = (e) => {
        const value = e.target.value;
        setSelectedCategory(value);
        setSelectedService(null);
        setCustomOptions({});
    };

    // Step 2 – Handle Service Change
    const handleServiceChange = (e) => {
        const serviceId = e.target.value;
        const found = services.find((svc) => svc._id === serviceId);
        setSelectedService(found);
        setCustomOptions({});
    };

    const handleCustomOptionChange = (e) => {
        const { name, value, type, checked } = e.target;
        // let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        const ariaLabel = e.target.getAttribute('aria-label');
        setCustomOptions(prev => {
            const updated = {
                ...prev,
                [name]: {
                    service: type === 'checkbox' ? checked : value,
                    label: ariaLabel
                }
            };

            // Immediately use `updated` to set FormData
            setFormData(prevForm => ({
                ...prevForm,
                services: [{
                    type: t(selectedCategory),
                    service: t(selectedService.nameKey),
                    customOptions: updated
                }]
            }));

            return updated;
        });

        // setCustomOptions(prev => ({
        //     ...prev,
        //     [name]: {
        //         service: type === 'checkbox' ? checked : value,
        //         label: ariaLabel
        //     }
        // }));
        // setFormData(prev => ({
        //     ...prev,
        //     services: [{

        //         type: t(selectedCategory),
        //         service: t(selectedService.nameKey),
        //         customOptions:
        //             customOptions
        //     }
        //     ],
        // }));
    }

    const handlePromoCodeValidation = async (e) => {
        e.preventDefault();
        //const promoCode = e.target.value;
        const promoCode = formData.promoCode.toLowerCase();
        // if (promoCode === 'welcome10') {
        if (promoCode === 'toronto15' || promoCode === 'follow15'
            || promoCode === 'now15' || promoCode === 'start15' || promoCode === 'fresh15' || promoCode === 'secret15'
            || promoCode === 'welcome15'
        ) {
            setValidPromoCode(true);
            // alert('Valid promo code! 15% discount will be applied to your quote');
            return true;
        }
        else {
            setValidPromoCode(false);
            alert('Invalid promo code. Please review your code and try again. If you do not have a promo code, please leave the field blank.');
            return false;
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form data:', formData);
        console.log('Categories: ', categories);
        console.log('Services: ', services);
        let promoCodeIsValid = false;

        if (formData.promoCode !== "") {
            promoCodeIsValid = await handlePromoCodeValidation(e);
            if (!promoCodeIsValid) {
                return;
            }
        }

        if (promoCodeIsValid || formData.promoCode === '') {
            if (!validateForm()) {
                return;
            }


            // Purge customOptions that don't have a service
            const sanitizedServices = formData.services.map(service => {
                if (service.customOptions) {
                    const sanitizedOptions = Object.keys(service.customOptions)
                        // .filter(option => service.customOptions.service[option])
                        .filter(option => service.customOptions[option].service)
                        .reduce((acc, option) => {
                            acc[option] = service.customOptions[option];
                            return acc;
                        }, {});
                    return { ...service, customOptions: sanitizedOptions };
                }
                return service;
            });

            // console.log('Sanitized services:', sanitizedServices);
            // Capture screenshot of the form
            // const serviceSelectionForm = document.getElementById("service-selection");
            const serviceSelectionForm = document.getElementById("quote-form");
            // const canvas = await html2canvas(serviceSelectionForm);
            // const imageBase64 = canvas.toDataURL("image/png").split(",")[1]; // PNG format
            // Extract form values
            const textSummary = getTextSummary(serviceSelectionForm);

            const updatedFormData = {
                ...formData,
                // serviceSelectionForm,
                services: sanitizedServices
            };

            // console.log(textSummary);

            // const payload = { textSummary, imageBase64, formData: updatedFormData };
            const payload = { textSummary, formData: updatedFormData };

            // console.log(textSummary);

            // Send form data and image to the backend
            fetch("/api/email/quick-quote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
                .then(response => response.json())
                .then(data => console.log("Success:", data))
                .catch(error => console.error("Error:", error));

            // console.log('Updated form data:', updatedFormData);

            try {
                const response = await fetch('/api/quotes/quickquote', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify(updatedFormData)
                });

                if (response.ok) {
                    alert(`Quote submitted successfully! We'll be in touch shortly to discuss your needs. In the meantime, feel free to browse our services.`);
                    await generatePDF(updatedFormData, t);
                    // disable for testing
                    resetForm();
                    // Generate and download the PDF
                    // navigate('/index');
                    navigate('/products-and-services');
                }
            } catch (error) {
                console.error('Error submitting quote:', error);
                alert('Error submitting quote, please ensure all fields are filled out correctly. If the problem persists, please contact us directly with a description of the issue.');
            }




        }
    };

    const validateForm = () => {
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
    };

    const resetForm = () => {
        setFormData({
            name: '',
            companyName: '',
            email: '',
            phonenumber: '',
            postalcode: '',
            promoCode: '',
            services: [],
            products: [],
        });
        setSelectedService("");
        setOptions([]);

    };

    const sanitizeText = (text) => {
        // Remove characters outside basic Latin + Latin-1 Supplement
        return text.replace(/[^\x00-\xFF]/g, '');
    };

    const getTextSummary = (form) => {
        const formData = new FormData(form);
        let textSummary = "";
        for (let [key, value] of formData.entries()) {
            const element = form.querySelector(`[name="${key}"]`);
            const placeholder = sanitizeText(
                element?.getAttribute('label') || element?.getAttribute('aria-label') || key
            );
            console.log(placeholder);

            if (element?.type === 'checkbox') {
                textSummary += `<strong>${placeholder}:</strong> ${element.checked ? 'Yes' : 'No'}<br>`;
            } else {
                textSummary += `<strong>${placeholder}:</strong> ${value}<br>`;
            }
        }
        return textSummary;
    };

    const renderInput = (opt) => {
        // console.log(opt.type);
        if (opt.choices?.length > 0) {
            if (opt.type === 'select') {
                return (
                    <Input
                        type="select"
                        name={opt.key}
                        aria-label={t(opt.labelKey)}
                        className="text-cleanar-color form-input"
                        value={customOptions[opt.key]?.service || ''}
                        onChange={handleCustomOptionChange}
                    >
                        <option value="">{t('quick_quote.customOptions.selectText')}</option>
                        {opt.choices.map((c, i) => (
                            <option key={i} value={c.value}>
                                {t(c.labelKey)} {opt.unitKey ? t(opt.unitKey) : null}
                            </option>
                        ))}
                    </Input>
                );
            }

            if (opt.type === 'radio') {
                return (
                    <div>
                        {opt.choices.map((c, i) => (
                            <FormGroup check inline key={i}>
                                <Input
                                    type="radio"
                                    name={opt.key}
                                    aria-label={t(opt.labelKey)}
                                    className="text-cleanar-color form-input"
                                    value={c.value}
                                    checked={customOptions[opt.key]?.service === c.value}
                                    onChange={handleCustomOptionChange}
                                />
                                <Label check>{t(c.labelKey)} {opt.unitKey ? t(opt.unitKey) : null}</Label>
                            </FormGroup>
                        ))}
                    </div>
                );
            }

        }
        if (opt.type === 'date') {
            return (
                <div>
                    <Form.Group>
                        <Form.Control
                            type="date"
                            name={opt.key}
                            aria-label={t(opt.labelKey)}
                            // size="sm"
                            className="text-cleanar-color form-input"
                            value={customOptions[opt.key]?.service || ''}
                            onChange={handleCustomOptionChange}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </Form.Group>
                </div>
            )
        }

        if (opt.type === 'checkbox') {
            return (
                <div>
                    <Form.Check
                        type="checkbox"
                        label={t(opt.labelKey)}
                        name={opt.key}
                        aria-label={t(opt.labelKey)}
                        className=""
                        checked={
                            customOptions[opt.key]?.service || false
                        }
                        onChange={handleCustomOptionChange}
                    />
                </div>
            )
        }

        return (
            <Input
                type={opt.type === 'number' ? 'number' : 'text'}
                name={opt.key}
                aria-label={t(opt.labelKey)}
                value={customOptions[opt.key]?.service || ''}
                className="text-cleanar-color form-input"
                onChange={handleCustomOptionChange}
                placeholder={opt.unitKey || ''}
            />
        );
    };


    const getTooltipText = (name) => {
        switch (name) {
            case 'name':
                return t('quick_quote.tooltips.name');
            case 'email':
                return t('quick_quote.tooltips.email');
            case 'phonenumber':
                return t('quick_quote.tooltips.phonenumber');
            case 'companyName':
                return t('quick_quote.tooltips.companyName');
            case 'postalcode':
                return t('quick_quote.tooltips.postalcode');
            case 'promoCode':
                return t('quick_quote.tooltips.promoCode');
            default:
                return '';
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner color="primary" />
            </Container>
        );
    }

    // Filter services by selected category
    const filteredServices = services.filter(
        (s) => s.categoryKey === selectedCategory
    );

    return (
        <>
            <Container className="quick-quote-container px-4" id="quote-section">
                <HelmetProvider>
                    <title>CleanAR Solutions</title>
                    <meta name="description" content="Get a quick service estimate from CleanAR Solutions. Fill out our form to receive a personalized quote for your cleaning needs." />
                </HelmetProvider>
                <VisitorCounter />
                <h2 className="text-center primary-color text-bold pt-2">{t('quick_quote.form.title')}</h2>
                {/* <p className="text-center text-sm italic text-gray-500 mb-1">
                    *Translation coming soon in French and Spanish
                </p> */}
                <p className="text-center text-secondary-color">
                    {t("quick_quote.form.description")}
                </p>
                <hr />
                <Form onSubmit={handleSubmit} id="quote-form" className="m-0 p-0">
                    <Form.Group className="mb-1">
                        <Row>
                            {[
                                { label: t('quick_quote.form.name'), name: 'name', placeholder: 'Jane Doe', required: true },
                                { label: t('quick_quote.form.email'), name: 'email', placeholder: 'jane.doe@email.com', required: true },
                                { label: t('quick_quote.form.phonenumber'), name: 'phonenumber', placeholder: '647-555-0000', required: true },
                                { label: t('quick_quote.form.companyName'), name: 'companyName', placeholder: 'Company ABC' },
                                { label: t('quick_quote.form.postalcode'), name: 'postalcode', placeholder: 'X0X 0X0', required: true },
                                { label: t('quick_quote.form.promoCode'), name: 'promoCode', placeholder: 'Promo123' }
                            ].map(({ label, name, placeholder, required }) => (
                                <Col key={name} md={3} xs={6} className="mb-2 ">
                                    <Form.Label className="text-bold mb-1">
                                        {label}{required && '*'}
                                        <FaQuestionCircle
                                            id={`${name}Tooltip`}
                                            className="ms-1"
                                            onClick={() => togglePopover(name)}
                                        />
                                        <Popover
                                            placement="top"
                                            isOpen={popoverOpen[name]}
                                            target={`${name}Tooltip`}
                                            toggle={() => togglePopover(name)}
                                        >
                                            <PopoverBody>{getTooltipText(name)}</PopoverBody>
                                        </Popover>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        id={`floating${label.replace(' ', '')}`}
                                        placeholder={placeholder}
                                        aria-label={label}
                                        className="text-cleanar-color form-input rounded-pill"
                                        name={name}
                                        value={formData[name]}
                                        onChange={handleChange}
                                        required={required}
                                    />
                                </Col>
                            ))}
                        </Row>
                    </Form.Group>
                    <hr />
                    <section className="section-border">
                        <Row>

                            <Col md={6} xs={6}>
                                {/* Step 1: Category */}
                                <FormGroup>
                                    <Label for="category">{t('quick_quote.form.selectCategory')}</Label>
                                    <Input
                                        type="select"
                                        id="category"
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                    >
                                        <option value="">{t('quick_quote.customOptions.selectText')}</option>
                                        {categories.map((cat) => (
                                            <option key={cat.key} value={cat.key}>
                                                {t(cat.key)}
                                            </option>
                                        ))}
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={6} xs={6}>
                                {/* Step 2: Service */}
                                {selectedCategory && (
                                    <FormGroup>
                                        <Label for="service">{t('quick_quote.form.selectService')}</Label>
                                        <Input
                                            type="select"
                                            id="service"
                                            value={selectedService?._id || ''}
                                            onChange={handleServiceChange}
                                        >
                                            <option value="">{t('quick_quote.customOptions.selectText')}</option>
                                            {filteredServices.map((svc) => (
                                                <option key={svc._id} value={svc._id}>
                                                    {t(svc.nameKey)}
                                                </option>
                                            ))}
                                        </Input>
                                    </FormGroup>
                                )}
                            </Col>

                        </Row>


                        {/* Step 3: Options */}
                        {selectedService && (
                            <Card className="mb-3">
                                <CardHeader tag="h5">{t(selectedService.nameKey)} - {t('quick_quote.form.customOptions')}</CardHeader>
                                <CardBody>
                                    <Row>
                                        {selectedService.options?.map((opt) => (
                                            <Col sm="12" md="6" lg="4" key={opt._id}>

                                                <FormGroup>
                                                    {/* <Label for={opt.key}>{t(opt.labelKey)}</Label>  */}
                                                    {opt.type === 'checkbox' ? null : <Label for={opt.key}>{t(opt.labelKey)}</Label>}
                                                    {renderInput(opt)}
                                                </FormGroup>
                                            </Col>
                                        ))}

                                    </Row>
                                </CardBody>
                            </Card>
                        )}

                    </section>
                    <Row>
                        <Col>
                            <p className='primary-color text-bold pt-2'>
                                {t('quick_quote.form.confirmationMessage')}
                            </p>
                        </Col>
                    </Row>
                    <Row className='pb-3'>
                        <Col md className="">
                            <Button type="submit" className='secondary-bg-color rounded-pill' data-track="clicked_submit_quote">{t("quick_quote.form.submit")}</Button>
                        </Col>
                        <Col md className="">
                            <Button data-track="clicked_reset_quote" onClick={resetForm} className='btn-danger rounded-pill'>{t("quick_quote.form.reset")}</Button>
                        </Col>
                    </Row>
                </Form>
            </Container>
        </>
    );
};

export default QuoteRequest;