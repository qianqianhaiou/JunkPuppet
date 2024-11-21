import { createTransport } from 'nodemailer';

interface MailerOption {
  mail: string;
  mailToken: string;
}

interface Attachment {
  filename: string;
  path?: string;
  cid?: string;
}

interface MailerData {
  from: string;
  subject: string;
  to: string;
  html: string;
  attachments?: Array<Attachment>;
}

class Mailer {
  transporter: {
    sendMail: (data: MailerData, fn: (error: any, info: any) => void) => void;
  };
  constructor(options: MailerOption) {
    this.transporter = createTransport({
      service: 'QQ',
      auth: {
        user: options.mail,
        pass: options.mailToken,
      },
    });
  }
  async sendMail(data: MailerData) {
    return new Promise((resolve, reject) => {
      this.transporter.sendMail(data, (error: any, info: any) => {
        if (error) {
          return reject(error);
        }
        resolve(info.response);
      });
    });
  }
}

export const MailerService = (() => {
  let instance: Mailer | null = null;
  return () => {
    if (!instance && process.env.MAIL && process.env.MAIL_TOKEN) {
      const options = {
        mail: process.env.MAIL,
        mailToken: process.env.MAIL_TOKEN,
      };
      instance = new Mailer(options);
    }
    return instance;
  };
})();
