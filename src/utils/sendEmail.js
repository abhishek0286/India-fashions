const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
    }
});

exports.sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: "IndFashion <nishantsharma13903@gmail.com>",
            to,
            subject,
            html
        }
        const response = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully",response);
        return true;
    } catch (error) {
        console.log("Error during sending email",error);
        return false;
    }
}