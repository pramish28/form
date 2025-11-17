import { google } from "googleapis";
import fs from "fs";

const CREDENTIALS = JSON.parse(fs.readFileSync("./credentials.json"));

const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export const syncDatabaseToSheet = async (spreadsheetId, allUsers) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const values = allUsers.map(u => [u.name, u.email]); // Add other fields if needed

    // Overwrite sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A1:B",  // adjust columns
      valueInputOption: "RAW",
      requestBody: {
        values: [["Name", "Email"], ...values],  // headers + data
      },
    });

    console.log("Google Sheet synced with database!");
  } catch (err) {
    console.log("Google Sheet Sync Error:", err.message);
  }
};
