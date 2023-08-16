const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db/db.js'); // Import your User model
const crypto = require('crypto');
const nodemailer = require('nodemailer');

function generateResetToken() {
  return crypto.randomBytes(20).toString('hex');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  logger:true,
  debug: false,
  secureConnection:false,
  auth: {
    user: 'suraj9801439605@gmail.com',
    pass: 'djnyrflezdoyywcq'
  },
  tls: {
    rejectUnauthorized:true
  }
});

function sendResetEmail(email, resetToken) {
  const mailOptions = {
    from: 'suraj9801439605@gmail.com',
    to: email,
    subject: 'Password Reset',
    text: `Click the following link to reset your password: http://localhost:8000/seller/reset-password/${resetToken}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}


// Step 1: User requests password reset
router.post('/seller/forgot-password', async (req, res) => {
  try {
    const email = req.body.email;
    const user = await db.seller_login.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = generateResetToken(); // Implement your token generation function
    const resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Send email with reset link containing resetToken
    sendResetEmail(email, resetToken); // Implement your email sending function
    res.status(200).json({ message: 'Reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Step 3: Update password
router.post('/seller/reset-password/:token', async (req, res) => {
  try {
    // const { resetToken, newPassword } = req.body;
    const resetToken=req.params.token;
    const newPassword = req.body.newPassword;
    const user = await db.seller_login.findOne({ resetToken, resetTokenExpiry: { $gt: Date.now() } });
    console.log(user);
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    const result = await db.seller_login.findOneAndUpdate(
      { resetToken },
      { $set: { password: hashedNewPassword, resetToken: "" } }
    );
    if (result) {
      res.status(200).json({ message: "Password reset successful" });
    } else {
      res
        .status(500)
        .json({ message: `Internal server error in customer reset password` });
    }
  } catch (error) {
    res.status(500).json({ message: `Internal server error is ${error.message}` });
  }
});

module.exports = router;
