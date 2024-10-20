import nodemailer from "nodemailer";

let transporter=nodemailer.createTransport(
    {
        service:"gmail",
        auth:{
            user:process.env.MY_EMAIL,
            pass:process.env.MY_PASSWORD
        }
   }
)

export {transporter}