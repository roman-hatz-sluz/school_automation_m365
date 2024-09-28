const excelJS = require("exceljs");
const fs = require("fs");

const convertExcelStyleSheet = require("./convertExcelStyleSheet");

async function convertExceltoHTML(excelPath, outputFilePath, examTitle) {
  const workbook = new excelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);

  const worksheet = workbook.getWorksheet(1); // or workbook.getWorksheet('Sheet1')

  // wait for a little for IO
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
  await workbook.xlsx.writeFile(excelPath);

  generateHtmlFromExcel(worksheet, examTitle, outputFilePath);
}

// Helper function to generate HTML from an Excel worksheet
function generateHtmlFromExcel(worksheet, examTitle = "", outputFilePath) {
  let html = `
  <h2>${examTitle.replace(".xlsx", "")} - ${new Date().getFullYear()}</h2> 
  ${convertExcelStyleSheet}<table>`;
  const columns = ["Frage", "Punkte", "Max Punkte", "Ihre Antwort", "Feedback"];
  worksheet.eachRow({ includeEmpty: true }, (row, rowIndex) => {
    html += `<tr>`;
    let columnCounter = 0;
    row.eachCell({ includeEmpty: true }, (cell) => {
      columnCounter++;
      // Apply style for bold text for the first row
      const bold = rowIndex === 1 ? "font-weight:bold;" : "";
      // Adjust cell content for long text

      let cellValue = cell.value || ""; // Ensure empty cells are rendered as empty

      if (isNaN(cellValue)) {
        cellValue = cellValue.replace(/_x000d_/g, "").replace(/\s\s+/g, " ");
      }
      html += `<td   style="${bold}  ">${cellValue}</td>`;
    });
    if (columnCounter <= columns.length) {
      for (let i = columnCounter; i < columns.length; i++) {
        html += `<td></td>`;
      }
    }
    html += `</tr>`;
  });

  html += `</table>
  <footer class="footer">
    <p>${examTitle.replace(".xlsx", "")} - Lehrperson: Roman Hatz 2024/2025</p>
    <p>${new Date().toLocaleString("de")}</p>
    <p>MS PDF Generator: <a href="https://github.com/roman-hatz-sluz/school_automation_m365" target="_blank">https://github.com/roman-hatz-sluz/school_automation_m365</a></p>
    </footer>
`;
  fs.writeFileSync(outputFilePath, html);
  return html;
}

module.exports = { convertExceltoHTML };
