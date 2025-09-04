const nodemailer = require("nodemailer");
require("dotenv").config();

async function testMail() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "navya151205@gmail.com",   // ✅ comma added
        pass: "sffhfviibvrqtdhg",        // ✅ comma added
      },
    });

    const info = await transporter.sendMail({
      from: "navya151205@gmail.com",     // ✅ comma added
      to: "pri3121187@gmail.com",        // ✅ comma added
      subject: "Test Email from Food Order App",  // ✅ comma added
      text: "Hello, this is a test email to check if mailing works!",
    });

    console.log("✅ Email sent successfully:", info.response);
  } catch (err) {
    console.error("❌ Error sending email:", err);
  }
}

testMail();

