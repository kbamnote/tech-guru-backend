const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email to the customer with the ebook download link.
 * @param {string} email - Customer's email address
 * @param {string} bookName - Name of the purchased ebook
 * @param {string} downloadLink - Google Drive link for the ebook
 */
const sendBookEmail = async (email, bookName, downloadLink) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'ImTechGuru <noreply@imtechguru.in>',
      to: [email],
      subject: `Your Ebook: ${bookName} - ImTechGuru`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff; }
            .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f4f4f4; }
            .header h1 { color: #2c3e50; margin: 0; }
            .content { padding: 30px 0; }
            .book-name { font-weight: bold; color: #27ae60; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { background-color: #27ae60; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; transition: background-color 0.3s; }
            .footer { text-align: center; font-size: 12px; color: #7f8c8d; border-top: 1px solid #f4f4f4; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Successful!</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              <p>Thank you for your purchase from <strong>ImTechGuru</strong>. Your payment was verified successfully.</p>
              <p>You have purchased: <span class="book-name">${bookName}</span></p>
              <p>Click the button below to download your ebook directly from Google Drive:</p>
              <div class="button-container">
                <a href="${downloadLink}" class="button">Download Ebook</a>
              </div>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p><a href="${downloadLink}">${downloadLink}</a></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ImTechGuru. All rights reserved.</p>
              <p>If you have any issues, please contact us at support@imtechguru.in</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Resend Error:', error);
      throw new Error(error.message);
    }

    console.log(`✅ Email sent successfully to ${email} for book: ${bookName}`);
    return data;
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
    throw err;
  }
};

module.exports = { sendBookEmail };
