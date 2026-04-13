const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (mailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER_CRM,
        pass: process.env.EMAIL_PASS_CRM,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const defaultOptions = {
      from: `"Sensitive Technologies Authentication Code" <${process.env.EMAIL_USER_CRM}>`,
    };

    const finalOptions = { ...defaultOptions, ...mailOptions };

    const info = await transporter.sendMail(finalOptions);
    console.log(`Email sent to ${finalOptions.to}: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;
