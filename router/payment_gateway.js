const express= require('express');
const env= require('dotenv');
env.config({ path: "../backend/config.env" });
const stripe= require('stripe')(process.env.secret_key);
const router=express.Router();
//code for accepting payment using stripe
<<<<<<< HEAD
router.post("/customer/create-checkout-session", async (req, res) => {
  const { total_price, currency } = req.body;
=======
router.post('/customer/payment', async (req, res) => {
    try {
      const { amount, currency } = req.body;
  
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
      });
  
      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create Payment Intent' });
    }
  });
>>>>>>> 4907901af9ccd5bc4fbfdd7701ddfa715f06ba52

  try {
    const params = {
      submit_type: 'pay',
      mode: "payment",
      payment_method_types: ['card'],
      billing_address_collection: "auto",
      line_items: [
        {
          price_data: {
            currency: currency,
            unit_amount: total_price * 100, // Convert to cents
          },
          quantity: 1, // Assuming you want to charge for one item
        }
      ],
      success_url: `http://localhost:3000/success`,
      cancel_url: `http://localhost:3000/cart`,
    };

    // Create the Stripe Checkout session
    const session = await stripe.checkout.sessions.create(params);

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create Checkout Session' });
  }
});
  module.exports=router;
  
