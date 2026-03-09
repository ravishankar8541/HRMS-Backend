const nodemailer = require('nodemailer');
const generateTerminationPDF = require('./terminationPdfGenerator'); 

const transporter = nodemailer.createTransport({
  host: "smtp.titan.email",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Sends a formal termination notice with PDF attachment
 */
const sendTerminationLetter = async (to, data) => {
  // Pass data to the Puppeteer-based PDF generator
  const pdfBuffer = await generateTerminationPDF(data);

  // Formatting date for the email body
  const formattedDate = data.lastWorkingDate ? new Date(data.lastWorkingDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) : "Immediate Effect";

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
      <h2 style="color: #d9534f; border-bottom: 2px solid #d9534f; padding-bottom: 10px;">Official Notice: Termination of Employment</h2>
      <p>Dear <strong>${data.name}</strong>,</p>
      
      <p>This email serves as formal notification regarding the termination of your employment as <strong>${data.designation || 'Employee'}</strong> with <strong>Viral Ads Media</strong>, effective <strong>${formattedDate}</strong>.</p>
      
      <p>Please find the official <strong>Termination Letter</strong> attached to this email.</p>
      
      <div style="background: #fff5f5; padding: 15px; border-left: 4px solid #d9534f; margin: 20px 0;">
        <strong style="color: #d9534f;">Immediate Actions Required:</strong><br>
        1. Please review the attached document carefully.<br>
        2. Ensure all company property is returned by your final date.<br>
        3. Complete all department-level clearance for final settlement processing.
      </div>
      
      <p>Regards,<br>
        <strong>HR Department</strong><br>
        <strong>Viral Ads Media</strong> | Digital Creative Agency<br>
        B-27, Budh Vihar Phase 1, Delhi-110086 
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"Viral Ads Media HR" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Official Notice: Termination of Employment | ${data.name}`,
    html: emailHtml,
    attachments: [{
      filename: `Termination_Letter_${data.name.replace(/\s+/g, '_')}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Email Error:", error);
    throw new Error("Failed to send termination email: " + error.message);
  }
};

module.exports = sendTerminationLetter;