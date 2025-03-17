const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const PORT = 3000;

app.use(express.static('public')); // Essential for serving static files (images, CSS, JS)
app.use('/uploads', express.static('uploads')); // If you have uploads
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const homeRoutes = require('./routes/home');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const cartRoutes = require('./routes/cart');
const productRoutes = require('./routes/product');

app.use('/', homeRoutes);
app.use('/admin', adminRoutes);
// app.use('/shop', shopRoutes);
app.use('/cart', cartRoutes);
app.use('/admin', productRoutes); // Fix: Avoid duplicate admin routes

// Routes
app.get('/shop', (req, res) => {
    const productFilePath = path.join(__dirname, 'data', 'products.json');
    fs.readFile(productFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading product data:", err);
            return res.status(500).send('Internal Server Error');
        }
        try {
            const products = JSON.parse(data);
            res.render('shop', { products: products });
        } catch (error) {
            console.error("Error parsing product data:", error);
            return res.status(500).send('Internal Server Error');
        }
    });
});

app.get('/product/:id', (req, res) => {
    const productId = req.params.id;
    const productFilePath = path.join(__dirname, 'data', 'products.json');

    fs.readFile(productFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading product data:", err);
            return res.status(500).send('Internal Server Error');
        }

        try {
            const products = JSON.parse(data);
            const product = products.find(p => p.id === productId);

            if (product) {
                res.render('product_details', { product: product });
            } else {
                res.status(404).send('Product not found');
            }
        } catch (error) {
            console.error("Error parsing product data:", error);
            return res.status(500).send('Internal Server Error');
        }
    });
});

// Socket.io (If you need it)
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('message', (message) => {
        console.log('Received message:', message);
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});