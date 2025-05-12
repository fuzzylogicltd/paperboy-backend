// This file is not in TS to avoid this issue: https://github.com/mailgun/mailgun.js/issues/409

import fs from "fs";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import FormData from "node-fetch";
import Mailgun from "mailgun.js";

import config from "../config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function sendEmail(
  recipient,
  subject,
  templateName,
  payload
) {
  const templatePath = path.join(
    __dirname,
    `./emailTemplates/${templateName}.html`
  );

  const template = fs.readFileSync(templatePath, "utf-8");
  const emailBody = ejs.render(template, payload);
  const sender = "paperboy@fuzzylogic.ltd";

  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: config.secrets.mailgunApiKey,
    url: config.secrets.mailgunDomain,
  });
  try {
    const data = await mg.messages.create("mail.fuzzylogic.ltd", {
      from: sender,
      to: recipient,
      subject: subject,
      html: emailBody,
    });

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}
