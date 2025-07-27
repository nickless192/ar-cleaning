// /src/components/SiteBanner/SiteBanner.js

import React, { useState } from 'react';
import { Alert, Container } from 'reactstrap';
import { FaWrench } from 'react-icons/fa'; // A fitting icon for "changes" or "work"
import { useTranslation } from 'react-i18next';
import '/src/assets/css/sitebanner.css'; // We will create this CSS file next

function SiteBanner() {
    const [visible, setVisible] = useState(true);
    const { t } = useTranslation();

    const onDismiss = () => setVisible(false);

    if (!visible) {
        return null; // Don't render anything if the banner is dismissed
    }

    return (
        // Using the "info" color for a neutral, informative look. You could also use "warning".
        // The `toggle` prop provides the 'x' button to close the alert.
        <Alert color="info" isOpen={visible} toggle={onDismiss} className="site-banner">
            <Container fluid className="d-flex align-items-center justify-content-center">
                <FaWrench className="banner-icon" />
                <span className="banner-text">
                    {t('banner.comingSoon')}
                </span>
            </Container>
        </Alert>
    );
}

export default SiteBanner;