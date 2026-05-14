const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const books = require('../data/books');
const { sendBookEmail } = require('../utils/sendEmail');

/**
 * @route POST /api/payments/verify-payment
 * @desc Verify Razorpay signature and send ebook email
 */
router.post('/verify-payment', async (req, res) => {
  const { bookId, email, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    console.log(`\n--- Verification Start: Order ${razorpay_order_id} ---`);

    // 1. Validate required fields
    if (!bookId || !email || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.log('❌ Missing required fields in request body');
      return res.status(400).json({ success: false, message: 'Missing required payment details' });
    }

    // 2. Verify Razorpay Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      console.log('❌ Invalid signature detected');
      return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature' });
    }

    console.log('✅ Razorpay signature verified successfully');

    // 3. Get Book Details
    const book = books[bookId];
    if (!book) {
      console.log(`❌ Book ID not found: ${bookId}`);
      return res.status(404).json({ success: false, message: 'Ebook not found in our records' });
    }

    // 4. Send Ebook via Email
    console.log(`📧 Sending "${book.name}" to ${email}...`);
    await sendBookEmail(email, book.name, book.driveLink);

    // 5. Respond to Client
    console.log(`--- Verification Success: Email delivered --- \n`);
    res.status(200).json({
      success: true,
      message: 'Payment verified and ebook delivered successfully!',
      bookName: book.name
    });

  } catch (error) {
    console.error('❌ Payment Verification Error:', error);
    res.status(500).json({
      success: false,
      message: 'An internal error occurred during payment verification',
      error: error.message
    });
  }
});

module.exports = router;
