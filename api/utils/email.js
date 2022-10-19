const nodeMailer = require('nodemailer');

const sendEmail = async (options_) => {
    let transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    let options = {
        from: process.env.SMTP_FROM,
        to: options_.to,
        subject: options_.subject,
        text: options_.text,
        html: options_.html,
    };

    await transporter.sendMail(options);
}

const sendNewUserEmail = async (user, password) => {
    console.log("sendNewUserEmail" + user);
    let subject_ = "New Account !";
    let text_ = "Welcome to e-certificate platform, your username is " + user.username + " and your password is " + password;
    let html_ = `
        <p>Dear <b>${user.username}</b>,</p>
        <p>Welcome to e-certificate platform, here you can find your account details :</p>
        <p><b>Username : </b>${user.username}</p>
        <p><b>Email : </b>${user.email}</p>
        <p><b>Password : </b>${password}</p>
    `;
    let options = {
        to: user.email,
        subject: subject_,
        text: text_,
        html: html_,
    }
    try {
        const sent = await sendEmail(options);
        console.log("sendNewUserEmailSend");
    } catch (err) {
        console.log("sendNewUserEmailError" + err);
    }
  }

module.exports = {
    sendEmail,
    sendNewUserEmail
};