import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text }) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
       user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    // Send mail
    const info = await transporter.sendMail({
      from: `"Registration Alert" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("Email sent:", info.response);
  } catch (err) {
    console.log("Email error:", err.message);
  }
};
