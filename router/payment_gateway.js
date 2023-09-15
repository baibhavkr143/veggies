const express= require('express');
const env= require('dotenv');
env.config({ path: "../backend/config.env" });
const stripe= require('stripe')(process.env.secret_key);
const router=express.Router();
//code for accepting payment using stripe
router.post("/customer/create-checkout-session", async (req, res) => {
  const { total_price, currency } = req.body;

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
  