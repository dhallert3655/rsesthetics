require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Use CORS middleware
app.use(cors());

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Handle form submission
app.post('/send-email', (req, res) => {
    const { name, email, message } = req.body;

    const msg = {
        to: 'info@rsesthetics.com', // Replace with your recipient email address
        from: 'em4346@rsesthetics.com', // Replace with your verified sender email
        replyTo: email, // Use the email address provided by the user as reply-to
        subject: 'New Contact Form Submission',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`,
    };

    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent');
            res.status(200).send('Email sent successfully!');
        })
        .catch((error) => {
            console.error('Error sending email:', error.response.body.errors);
            res.status(500).send('Error sending email. Please try again later.');
        });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
