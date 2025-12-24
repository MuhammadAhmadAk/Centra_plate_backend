const nodemailer = require('nodemailer');

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log("Email credentials not found. Logging email to console.");
            console.log(`To: ${email}`);
            console.log(`Subject: ${subject}`);
            console.log(`Text: ${text}`);
            return;
        }

        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Centra Plate" <no-reply@centraplate.com>',
            to: email,
            subject: subject,
            text: text,
        });

        console.log("Email sent successfully");
    } catch (error) {
        console.error("Email send failed:", error);
    }
};

module.exports = sendEmail;
