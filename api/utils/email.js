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
    let subject_ = "Noveau compte !";
    let text_ = "Bienvenue dans la platforme e-certificate, votre nom d'utilisateur est " + user.username + " et votre mot de passe est " + password;
    let html_ = `
        <p>Bonjour <b>${user.username}</b>,</p>
        <p>Bienvenue dans la platforme e-certificate, voici les détails de votre compte :</p>
        <p><b>Nom d'utilisateur : </b>${user.username}</p>
        <p><b>Email : </b>${user.email}</p>
        <p><b>Mot de passe : </b>${password}</p>
        <p>Vous pouvez vous connectez à votre espace utilisateur à partir du lien suivant : <a href="https://e-certificate.vr4.ma/login">https://e-certificate.vr4.ma/login</a></p>
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