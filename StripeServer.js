// This is your new server file.
// It uses Node.js and the Express framework to handle requests.
const express = require('express');
const app = express();
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY_HERE'); // <-- IMPORTANT: REPLACE WITH YOUR STRIPE SECRET KEY

// Serve the merch.html file when someone visits your site
app.use(express.static('.'));
app.use(express.json());

// This is a lookup table for your products.
// In a real application, you would pull this from a database.
// The 'price_id' comes from the Stripe product you create in your Stripe Dashboard.
const products = {
  't-shirt': { price_id: 'price_1P...' }, // <-- Replace with your actual Price ID from Stripe
  'hoodie': { price_id: 'price_1P...' },   // <-- Replace with your actual Price ID from Stripe
  'hat': { price_id: 'price_1P...' }      // <-- Replace with your actual Price ID from Stripe
};

// This endpoint creates the Stripe Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  const { productId } = req.body;
  const product = products[productId];

  if (!product) {
    return res.status(404).send({ error: 'Product not found' });
  }

  try {
    // Create a Checkout Session with the Price ID
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price: product.price_id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: `${req.headers.origin}/return.html?session_id={CHECKOUT_SESSION_ID}`,
    });

    // Send the clientSecret back to the frontend
    res.send({clientSecret: session.client_secret});
  } catch (error) {
    console.error("Stripe Error:", error.message);
    res.status(500).send({ error: error.message });
  }
});

// This endpoint checks the status of the session after the user pays
app.get('/session-status', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  res.send({
    status: session.status,
    customer_email: session.customer_details.email,
  });
});

app.listen(4242, () => console.log('Node server listening on port 4242!'));
