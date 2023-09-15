const express= require('express');
const env= require('dotenv');
env.config({ path: "../backend/config.env" });
const stripe= require('stripe')(process.env.secret_key);
const router=express.Router();
//code for accepting payment using stripe
router.post('/create-payment-intent', async (req, res) => {
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

  module.exports=router;
  