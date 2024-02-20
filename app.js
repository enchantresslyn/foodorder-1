const bodyParser = require('body-parser');
const express = require('express');
const ejs = require('ejs');
const path = require('path');

const foods = require('./food/food');


const port = 3000;



const app = express();
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.send('Hello World!');
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

    // Create an order in the database in memory
    const order = { cart, payment };
    console.log('Saving order:', order); // Log the order before saving it

    const result = db.push(order);

    if (result) {
        console.log('Order saved:', order); // Log the order after saving it
        res.json({ success: true });
    } else {
        console.log('Failed to save order:', order);
        res.status(500).json({ success: false, message: 'Failed to save order' });
    }
});
app.get('/orders', (req, res) => {
    console.log('GET /orders', db); // Log the orders
    res.render('orders', { orders: db });
});



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

