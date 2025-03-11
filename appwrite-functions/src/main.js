const sdk = require("node-appwrite");
const nodemailer = require("nodemailer");

module.exports = async function (context) {
  console.log(" Function Started!");

  const client = new sdk.Client();
  client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  console.log(" Appwrite Client Initialized");

  let requestBody = context.req.bodyJson; // aqui esta el cambio thel json por el otro en caso crash
  console.log(" Parsed Request Body:", requestBody);

  if (!requestBody || !requestBody.email || !requestBody.otp) {
    console.error(" Missing email or OTP in request body!");
    return context.res.json({ success: false, error: "Missing email or OTP!" });
  }

  const { email, otp } = requestBody;
  console.log("Sending OTP to:", email);

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    console.log("Sending email...");

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`,
    });

    console.log(" Email Sent Successfully:", info.response);
    return context.res.json({
      success: true,
      message: "OTP sent successfully!",
    });
  } catch (error) {
    console.error(" Error Sending Email:", error);
    return context.res.json({ success: false, error: error.message });
  }
};
