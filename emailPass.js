/**
 * Created by cbl34 on 26/10/16.
 */
var nodemailer = require('nodemailer');
var Config=require('./Config');

exports.sendEmail = function(email, subject, content, cb) {

    console.log(Config.emailConfig.nodeMailer.Mandrill.auth.user);
    //create reusable transporter object using the default SMTP transport
    ///////=========================Email============================/////////////////////////////
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: Config.emailConfig.nodeMailer.Mandrill.auth.user,
            pass: Config.emailConfig.nodeMailer.Mandrill.auth.pass
        },
        secure: true
    });

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: Config.emailConfig.nodeMailer.Mandrill.auth.user, // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        html: '<b>welcome</b>'
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
            cb(null)
        }
        else{
            console.log('Message sent: ' + info.response);
            cb(null);
        }
    });
}