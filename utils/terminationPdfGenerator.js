const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

/**
 * Generates PDF buffer for Termination Letter using Puppeteer
 * @param {Object} data 
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateTerminationPDF = async (data) => {
  const templatePath = path.join(__dirname, '../templates/terminationLetter.ejs');
  
  // 1. Load Logo and convert to Base64 (Ensures visibility in PDF) 
  let logoBase64 = "";
  try {
    const logoPath = path.join(__dirname, '../assets/blackLogo.png');
    if (fs.existsSync(logoPath)) {
      const bitmap = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${bitmap.toString('base64')}`;
    }
  } catch (err) {
    console.error("LOGO ERROR: Ensure logo is at backend/assets/blackLogo.png");
  }

  // 2. Render HTML with your existing data structure
  const html = await ejs.renderFile(templatePath, {
    logo: logoBase64,
    noticeDate: formatDate(data.noticeDate || new Date()), 
    name: data.name || data.employeeName, 
    email: data.email || 'N/A', 
    contact: data.phoneNumber || 'N/A', 
    designation: data.designation,
    lastWorkingDate: formatDate(data.lastWorkingDate), 
    reason: data.reason || 'Not work Proper in the Office', 
    hrName: data.hrName || 'HR Manager', 
    companyAddress: 'B-27, Budh Vihar Phase 1, Delhi-110086' 
  });

  // 3. Launch Puppeteer for deployment-ready rendering
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    // Use networkidle0 to ensure the logo is fully rendered before printing
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true, 
      margin: { top: '10mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    if (browser) await browser.close();
    throw error;
  }
};

/**
 * Helper to format dates: "28 February 2026"
 */
function formatDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

module.exports = generateTerminationPDF;