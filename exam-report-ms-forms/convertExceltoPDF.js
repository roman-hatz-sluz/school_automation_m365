const excelJS = require("exceljs");
const puppeteer = require("puppeteer");

const convertExcelStyleSheet = require("./convertExcelStyleSheet");

async function convertExceltoPDF(excelPath, pdfPath) {
  // 1. Load and style Excel file using exceljs
  const workbook = new excelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);

  const worksheet = workbook.getWorksheet(1); // or workbook.getWorksheet('Sheet1')

  // Apply bold font to all texts in row 4
  const row4 = worksheet.getRow(4);
  row4.eachCell((cell) => {
    cell.font = { bold: true };
  });
  row4.commit(); // Commit changes for row 4

  // Insert 2 blank rows before row 4 (current row 4 will move to row 6)
  //worksheet.spliceRows(4, 0, [], []); // Insert 2 blank rows before current row 4

  // Replace "_x000d_" with "" and replace double spaces with one space in column 1
  worksheet.eachRow((row) => {
    const cell = row.getCell(1); //
    const cell2 = row.getCell(4); //
    if (typeof cell.value === "string") {
      cell.value = cell.value.replace(/_x000d_/g, "").replace(/\s\s+/g, " ");
    }
    if (typeof cell2.value === "string") {
      cell2.value = cell2.value.replace(/_x000d_/g, "").replace(/\s\s+/g, " ");
    }
  });

  // Save the styled Excel file
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000); // 2000 milliseconds = 2 seconds
  });
  await workbook.xlsx.writeFile(excelPath);

  // 2. Convert the Excel sheet to HTML (to preserve formatting)
  const html = generateHtmlFromExcel(worksheet);

  // 3. Use puppeteer to convert the HTML to PDF
  await generatePdfFromHtml(html, pdfPath);
  //console.log("PDF file created", pdfPath);
}

// Helper function to generate HTML from an Excel worksheet
function generateHtmlFromExcel(worksheet) {
  let html = `${convertExcelStyleSheet}<table border="1" cellspacing="0" cellpadding="5" style="border-collapse:collapse;width:100%;">`;

  worksheet.eachRow({ includeEmpty: true }, (row, rowIndex) => {
    html += `<tr>`;
    row.eachCell({ includeEmpty: true }, (cell) => {
      // Apply style for bold text for the first row
      const bold = rowIndex === 1 ? "font-weight:bold;" : "";
      // Adjust cell content for long text
      const wordBreak = "word-wrap:break-word; white-space:normal;";
      const cellValue = cell.value || ""; // Ensure empty cells are rendered as empty
      html += `<td style="${bold} ${wordBreak}">${cellValue}</td>`;
    });
    html += `</tr>`;
  });

  html += `</table>
  <footer style="text-align: center; padding: 10px; background-color: #f1f1f1; margin-top: 20px;">
    <p>ICT Modul 324 - Prüfung 1 Teil A - Lehrperson: Roman Hatz 2024/2025</p>
    <p>Source: <a href="https://github.com/roman-hatz-sluz/school_automation_m365" target="_blank">https://github.com/roman-hatz-sluz/school_automation_m365</a></p>
  </footer>
`;

  return html;
}

// Helper function to generate a PDF from HTML using puppeteer
async function generatePdfFromHtml(htmlContent, pdfPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set the content of the page to the generated HTML
  await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

  // Generate PDF
  await page.pdf({
    path: pdfPath,
    format: "A4", // Adjust the format as needed
    printBackground: true,
  });

  await browser.close();
}

module.exports = { convertExceltoPDF };
