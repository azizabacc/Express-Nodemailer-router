import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';

dotenv.config({ override: true });
const port = process.env.PORT;
const app = express();
app.use(cors());


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});


const storage = multer.memoryStorage(); // store files in memory
const upload = multer({ storage: storage });

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.post('/send-email', cors(), upload.array('files', 10), (req, res) => {
  const { name, email, message } = req.body;
  const attachments = req.files;

  if (!attachments) {
    return res.status(400).json({ success: false, message: 'No attachments have been uploaded.' });
  }

  const mailOptions = {
    from: process.env.EMAIL,
    to: email ,
    cc: email,
    subject: `Contact BK TRAD mailing from : ${email}`,
    text: message,
    attachments: attachments.map((file) => ({
      filename: file.originalname,
      content: file.buffer,
    })),
  };

  transporter.verify((err, success) => {
    if (err) {
      console.log(err);
      res.status(500).json({ success: false, message: 'Error sending email.' });
    } else {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          res.status(500).json({ success: false, message: 'Error sending email.' });
        } else {
          console.log('Email sent: ' + info.response);
          res.json({ success: true, message: 'Email sent successfully.' });
        }
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
