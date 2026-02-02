const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (mailOptions) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
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

  await transporter.sendMail(finalOptions);
  console.log(`Email sent to ${finalOptions.to}`);
};

module.exports = sendEmail;
