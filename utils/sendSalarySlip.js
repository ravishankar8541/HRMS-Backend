const nodemailer = require('nodemailer');
const generateSalarySlipPDF = require('./salarySlipPdfGenerator'); 

const sendSalarySlip = async (email, data) => {
  try {
    // Generate the PDF buffer using the updated Puppeteer function
    const pdfBuffer = await generateSalarySlipPDF(data);

    // Nodemailer setup with Titan Email
    const transporter = nodemailer.createTransport({
      host: "smtp.titan.email",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Safe filename logic preserved
    const safeName = (data.employeeName || "Employee").replace(/[^a-zA-Z0-9]/g, '_');
    const safeMonth = (data.monthYear || "Period").replace(/[^a-zA-Z0-9]/g, '-');

    // Send email
    await transporter.sendMail({
      from: `"Viral Ads Media Payroll" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Payslip - ${data.monthYear || 'Current Period'} | ${data.employeeName || 'Employee'}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <p>Dear ${data.employeeName || 'Employee'},</p>
          <p>Your salary payslip for <strong>${data.monthYear || 'the period'}</strong> is attached.</p>
          <p>Should you have any discrepancies, please reach out to the HR department.</p>
          <p>Regards,<br><strong>Viral Ads Media HR Team</strong></p>
        </div>
      `,
      attachments: [{
        filename: `Payslip_${safeName}_${safeMonth}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    });

    console.log(`Payslip email sent to ${email}`);
    return true;

  } catch (error) {
    console.error('Error in sendSalarySlip:', error);
    throw error;
  }
};

module.exports = sendSalarySlip;