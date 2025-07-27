import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Logo from "/src/assets/img/IC CLEAN AR-15-cropped.png";



export const generatePDF = async (formData, t) => {
    const pdfDoc = await PDFDocument.create();

    const page = pdfDoc.addPage([600, 800]);

    const { width, height } = page.getSize();
    const fontSize = 12;
    let yPosition = height - 50;

    // Function to add text to the PDF
    const addText = async (text, x, y, size = fontSize) => {
        page.drawText(text, {
            x: x,
            y: y,
            size: size,
            font: await pdfDoc.embedFont(StandardFonts.Helvetica),
            color: rgb(0, 0, 0),
        });
    };

    // Add logo to the PDF
    const logoImageBytes = await fetch(Logo).then(res => res.arrayBuffer());
    const logoImage = await pdfDoc.embedPng(logoImageBytes);
    const logoDims = logoImage.scale(0.1); // Scale the logo to fit
    page.drawImage(logoImage, {
        x: 50,
        y: height - logoDims.height - 20,
        width: logoDims.width,
        height: logoDims.height,
    });
    yPosition -= 65;
    await addText('CleanAR Solutions', 50, yPosition, 18);
    yPosition -= 20;
    await addText(t('tagline'), 50, yPosition, 12);
    yPosition -= 20;

    // Add a line
    page.drawLine({
        start: { x: 50, y: yPosition },
        end: { x: width - 50, y: yPosition },
        thickness: 2,
        color: rgb(0, 0, 0),
    });
    yPosition -= 40;



    // Add title
    await addText(t('quick_quote.pdf.title'), 50, yPosition, 24);
    yPosition -= 40;

    // Add basic information
    const basicInfo = [
        `${t('quick_quote.pdf.headers.name')}: ${formData.name}`,
        `${t('quick_quote.pdf.headers.email')}: ${formData.email}`,
        `${t('quick_quote.pdf.headers.phone')}: ${formData.phonenumber}`,
        `${t('quick_quote.pdf.headers.company')}: ${formData.companyName}`,
        `${t('quick_quote.pdf.headers.postalcode')}: ${formData.postalcode.toUpperCase()}`,
        `${t('quick_quote.pdf.headers.promo')}: ${formData.promoCode}`,
    ];

    for (const info of basicInfo) {
        await addText(info, 50, yPosition, 14);
        yPosition -= 20;
    }

    yPosition -= 20;

    // Add services
    await addText(t("quick_quote.form.serviceRequired"), 50, yPosition, 18);
    yPosition -= 40;

    // Draw a box around the services section
    const boxMargin = 10;
    const boxStartY = yPosition + 20; // Adjust to start above the first service
    let boxEndY = yPosition;

    // Define table column positions
    const columnPositions = [60, 90, 200, 320]; // Adjust as needed for spacing
    const columnHeaders = ["#", t('quick_quote.pdf.table.service'), t('quick_quote.pdf.table.type'), t('quick_quote.pdf.table.customOptions')];

    // Add table headers
    for (let i = 0; i < columnHeaders.length; i++) {
        await addText(columnHeaders[i], columnPositions[i], yPosition, 14);
    }
    yPosition -= 20;

    // Add a line under the headers
    page.drawLine({
        start: { x: columnPositions[0], y: yPosition },
        end: { x: columnPositions[columnPositions.length - 1] + 200, y: yPosition },
        thickness: 1,
        color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    // Add table rows
    for (const [index, service] of formData.services.entries()) {
        // Column 0: Index
        await addText(`${index + 1}`, columnPositions[0], yPosition, 12);

        // Column 1: Service
        await addText(`${service.service || 'N/A'}`, columnPositions[1], yPosition, 12);

        // Column 2: Type
        await addText(`${service.type}`, columnPositions[2], yPosition, 12);

        // Column 3: Custom Options
        let customOptionsText = "";
        let customOptionsCount = 0; // Count the number of custom options

        if (service.customOptions) {
            for (const [key, value] of Object.entries(service.customOptions)) {
                if (typeof value === 'object' && value !== null && value.service !== undefined) {
                    const optionText = `${value.label || key}: ${typeof value.service === 'boolean' ? (value.service ? 'Yes' : 'No') : value.service}`;                    
                    customOptionsText += `${sanitizeText(optionText)}\n`;
                    customOptionsCount++; // Increment the count for each custom option
                }
            }
        }

        await addText(customOptionsText.trim(), columnPositions[3], yPosition, 12);

        // Adjust yPosition based on the number of custom options
        yPosition -= 20 * (customOptionsCount || 1); // Default to 1 if no custom options
    }

    // Update the box end position
    boxEndY = yPosition - 20;

    // Draw the box
    page.drawRectangle({
        x: 50 - boxMargin,
        y: boxEndY - boxMargin,
        width: 500 + boxMargin * 2,
        height: boxStartY - boxEndY + boxMargin * 2,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
    });


    yPosition -= 20;

    // Add totals
    // await addText('Totals:', 50, yPosition, 18);
    // yPosition -= 30;

    // const totals = [
    //   `Subtotal: $${formData.subtotalCost.toFixed(2)}`,
    //   `Tax: $${formData.tax.toFixed(2)}`,
    //   `Grand Total: $${formData.grandTotal.toFixed(2)}`,
    // ];

    // for (const total of totals) {
    //   await addText(total, 50, yPosition, 16);
    //   yPosition -= 20;
    // }

    // Convert the PDF to base64 and send it in an email
    const pdfBase64 = await pdfDoc.saveAsBase64();

    // // Debugging: Save the PDF to a Blob and open it in a new tab
    // const debugPdfBytes = await pdfDoc.save();
    // const debugBlob = new Blob([debugPdfBytes], { type: 'application/pdf' });
    // const debugUrl = URL.createObjectURL(debugBlob);
    // window.open(debugUrl, '_blank');

    await sendEmailWithPDF(formData, t("quick_quote.email.subject"), pdfBase64, t);
}

const sendEmailWithPDF = async (formData, subject, pdfBase64, t) => {
    const hmtlMessage = `
            <h2>${t("quick_quote.email.greeting")}</h2>
            <p>${t("quick_quote.email.body.0")} ${formData.name},</p>
            <p>${t("quick_quote.email.body.1")}</p>
            <p>${t("quick_quote.email.body.2")}</p>
            <p>${t("quick_quote.email.body.3")}</p>
            <p>CleanAR Solutions</p>
            <p>
            <a href="https://www.cleanarsolutions.ca/index" target="_blank">www.cleanarsolutions.ca/index</a>
            </p>
            <p>
            <a href="tel:+437-440-5514">+1 (437) 440-5514</a>
            </p>`;

    const mailOptions = {
        from: 'info@cleanARsolutions.ca',
        to: formData.email,
        cc: ['info@cleanARsolutions.ca'],
        subject: subject,
        html: hmtlMessage,
        attachments: [{
            filename: 'quote_confirmation.pdf',
            content: pdfBase64,
            encoding: 'base64'
        }]
    };

    try {
        const response = await fetch('/api/email/send-quick-quote-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mailOptions)
        });

        if (response.ok) {
            console.log('Email with PDF sent successfully!');
        } else {
            console.error('Error sending email with PDF');
        }
    } catch (error) {
        console.error('Error sending email with PDF:', error);
    }
}

    const sanitizeText = (text) => {
  // Remove characters outside basic Latin + Latin-1 Supplement
  return text.replace(/[^\x00-\xFF]/g, '');
};