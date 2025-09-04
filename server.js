require('dotenv').config(); // Load .env variables

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const Order = require('./models/Order'); // Ensure models/Order.js exists

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Debug: check if .env variables are loaded
console.log("Mongo URI is:", process.env.MONGODB_URI);

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Nodemailer setup (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user:"navya151205@gmail.com",
        pass:"sffhfviibvrqtdhg"
    }
});

// ✅ Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend','public')));

// ✅ Serve index.html explicitly
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'frontend','public','index.html');
  console.log("Serving index.html from:", filePath); // Debugging
  res.sendFile(filePath);
});

// Place order endpoint
app.post('/place-order', async (req, res) => {
    try {
        const { name, address, phone, items, total } = req.body;

        if (!name || !address || !phone || !items || !total) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const order = new Order({
            name, address, phone, items, total, payment: 'COD'
        });

        await order.save();

        // Send email to owner
        const ownerEmail = process.env.OWNER_EMAIL;
        const mailOptions = {
            from: "navya151205@gmail.com",
            to: "Pri3121187@gmail.com",
            subject: `New Order #${order._id}`,
            text: `New COD order placed.\n\nCustomer: ${name}\nPhone: ${phone}\nAddress: ${address}\nTotal: ₹${total}\n\nItems:\n${items.map(it => `${it.name} x${it.qty} - ₹${it.price}`).join('\n')}\n\nOrder ID: ${order._id}\nPlaced at: ${order.createdAt}`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.error('Email error:', err);
            else console.log('Email sent:', info.response);
        });

        res.json({ message: 'Order placed successfully', orderId: order._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Health check
app.get('/health', (req, res) => res.send({ status: 'ok', version: '1.0' }));

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



