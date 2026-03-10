const nodemailer = require("nodemailer");
const generatePDF = require("./pdfGenerator");

const transporter = nodemailer.createTransport({
  host: "smtp.titan.email",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOfferLetter = async (to, offer) => {
  const pdfBuffer = await generatePDF(offer);

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px;">
      <h2 style="color: #f27022;">Congratulations, ${offer.employeeName}!</h2>

      <p>Dear <strong>${offer.employeeName}</strong>,</p>

      <p>
      We are delighted to formally offer you the position of 
      <strong>${offer.position}</strong> at <strong>Viral Ads Media</strong>.
      </p>

      <p>
      Please find your official 
      <strong>Offer Letter (Ref: ${offer.offerId})</strong> attached to this email.
      </p>

      <p>
      Best Regards,<br>
      <strong>HR Department</strong><br>
      Viral Ads Media
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"Viral Ads Media HR" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Job Offer: ${offer.position} | ${offer.employeeName}`,
    html: emailHtml,

    attachments: [
      {
        filename: `Offer_Letter_${offer.employeeName.replace(/\s+/g, "_")}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Email Error:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = sendOfferLetter;
