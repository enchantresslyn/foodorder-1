const bodyParser = require('body-parser');
const express = require('express');
const ejs = require('ejs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const foods = require('./food/food');


const port = 3000;

function generateUniqueId() {
    return uuidv4();
}



const app = express();
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
// static files
app.use(express.static(path.join(__dirname, 'public')));



app.get('/', (req, res) => {
    // return index.html
    res.render('index');
}
);





app.get('/foods', (req, res) => {
    res.render('foods', { foods: foods });
});

let cart = [];
app.post('/cart', express.json(), (req, res) => {
    const foodId = req.body.id;
    const food = foods.find(food => food.id === Number(foodId));
    if (food) {
        cart.push(food);
        res.json({ success: true, cart: cart });
    } else {
        res.status(400).json({ success: false, message: 'Invalid food ID' });
    }
});

app.get('/cart', (req, res) => {
    let totalAmount = 0;
    cart.forEach(item => {
        totalAmount += item.price;
    });
    res.render('cart', { cart: cart, totalAmount: totalAmount });
});

app.post('/checkout', express.json(), (req, res) => {
    const address = req.body.address;
    // Here you can process the checkout, e.g. create an order in your database
    // console.log('Checkout', address, cart);
    res.json({ success: true });
});

let db = [];

app.post('/create-order', express.json(), (req, res) => {
    console.log('Create order', req.body);
    const cart = req.body.cart;
    const paymentResults = req.body.paymentResults;
    // Save the order in the in-memory database
    db.push({ cart: cart, paymentResults: paymentResults });
    res.json({ success: true });
});


app.post('/order', (req, res) => {
    console.log('POST /order', req.body); // Log the request body

    const { cart, payment } = req.body;

    // Generate a unique identifier for the order
    const orderId = generateUniqueId(); // You need to implement this function

    // Check if an order with the same ID already exists in the database
    if (db.some(order => order.orderId === orderId)) {
        console.log('Duplicate order detected');
        res.status(400).json({ success: false, message: 'Duplicate order detected' });
        return;
    }

    // Create an order in the database in memory
    const order = { orderId, cart, payment };
    console.log('Saving order:', order); // Log the order before saving it

    db.push(order);

    console.log('Order saved:', order); // Log the order after saving it
    res.json({ success: true });
});

app.get('/orders', (req, res) => {
    console.log('GET /orders', db); // Log the orders
    res.render('orders', { orders: db });
});



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

