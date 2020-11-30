import fs from "fs";
import readline from "readline";
import pkg from "googleapis";
const { google } = pkg;

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
// const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const TOKEN_PATH = "token.json";

export default class Gmail {
  exec(callback, option) {
    fs.readFile("credentials.json", (err, content) => {
      if (err) return console.log("Error loading client secret file:", err);
      this.authorize(JSON.parse(content), callback, option);
    });
  }

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   * @param {options} options The callback to call with the authorized client.
   */
  authorize(credentials, callback, option) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return this.getNewToken(oAuth2Client, callback, option);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client, option);
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  getNewToken(oAuth2Client, callback, option) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter the code from that page here: ", (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error("Error retrieving access token", err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log("Token stored to", TOKEN_PATH);
        });
        callback(oAuth2Client, option);
      });
    });
  }

  buildMail(message) {
    const utf8Subject = `=?utf-8?B?${Buffer.from(message.subject).toString(
      "base64"
    )}?=`;

    const mailParts = [
      `From: ${process.env.FROM_NAME} <${process.env.FROM_ADDRESS}>`,
      `To: ${process.env.TO_NAME} <${process.env.TO_ADDRESS}>`,
      "Content-Type: text/html; charset=utf-8",
      "Content-Transfer-Encoding: 7bit",
      "MIME-Version: 1.0",
      `Subject: ${utf8Subject}`,
      "",
      `${message.body}`,
    ];
    const mail = mailParts.join("\n");

    // The body needs to be base64url encoded.
    const encodedMail = Buffer.from(mail)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    return encodedMail;
  }

  sendMail(auth, mail) {
    const gmail = google.gmail({ version: "v1", auth });
    return gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: mail,
      },
    });
  }
}
