import fs from "fs";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import Mailgun from "mailgun-js";

import config from "../config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function sendEmail(
  recipient: string,
  subject: string,
  templateName: string,
  payload: object
) {
  const templatePath = path.join(
    __dirname,
    `./emailTemplates/${templateName}.html`
  );

  const template = fs.readFileSync(templatePath, "utf-8");
  const emailBody = ejs.render(template, payload);
  const sender = "paperboy@fuzzylogic.ltd";

  const mailgun = new Mailgun({
    apiKey: config.secrets.mailgunApiKey,
    domain: config.secrets.mailgunDomain,
  });

  const data = {
    from: sender,
    to: recipient,
    subject: subject,
    html: emailBody,
  };

  console.log({ data });

  mailgun.messages().send(data, function (err, body) {
    if (err) {
      console.log("error: ", err);
    } else {
      console.log("email should be sent: ", { body });
    }
  });

  //   console.log(
  //     `SEND EMAIL -- to: ${recipient}; subject: ${subject}; email: ${emailBody}`
  //   );
}
