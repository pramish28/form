import User from "../models/User.js";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";

// import { sendEmail } from "../utils/sendEmail.js";
// import User from "../models/User.js";
// import bcrypt from "bcrypt";

// export const signup = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const exists = await User.findOne({ email });
//     if (exists) return res.status(400).json({ message: "Email already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     await User.create({ name, email, password: hashedPassword });

//     // Send email to the registered user
//     await sendEmail({
//       to: email, 
//       subject: "Welcome! Registration Successful",
//       text: `Hello ${name},\n\nYou have successfully registered in our system.\n\nThank you!`,
//     });

//     res.json({ message: "Signup successful! Email sent to user." });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Signup failed", error: err.message });
//   }
// };


import { sendEmail } from "../utils/sendmail.js";
import { syncDatabaseToSheet } from "../utils/googleSheets.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    // Sync all users to Google Sheet
    const allUsers = await User.find();
    await syncDatabaseToSheet(allUsers);

    // Send email to the new user
    await sendEmail({
      to: email,
      subject: "Welcome! Registration Successful",
      text: `Hello ${name},\n\nYou have successfully registered.\n\nThank you!`,
    });

    // Send email to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New User Registered",
      text: `A new user has registered.\nName: ${name}\nEmail: ${email}`,
    });

    res.json({ message: "Signup successful! Emails sent to user and admin." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};



// Login
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid email or password" });

    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// Excel Export
export const exportToExcel = async (req, res) => {
  try {
    const users = await User.find();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Users");

    sheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Password (hashed)", key: "password", width: 40 },
    ];

    users.forEach((u) => {
      sheet.addRow({ name: u.name, email: u.email, password: u.password });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: "Excel export failed", error: err.message });
  }
};
