const excelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const cssFilePath = path.join(__dirname, "convertExcelStyles.css");
const cssContent = fs.readFileSync(cssFilePath, "utf-8");

function formatExamTitle(examTitle) {
  return `<h2>${examTitle.replace(".xlsx", "")} - ${new Date().getFullYear()}</h2>`;
}

function formatFooter(examTitle) {
  return `
    <footer class="footer">
      <p>${examTitle.replace(".xlsx", "")} - Lehrperson: Roman Hatz 2024/2025</p>
      <p>${new Date().toLocaleString("de")}</p>
      <p>MS PDF Generator: <a href="https://github.com/roman-hatz-sluz/school_automation_m365" target="_blank">https://github.com/roman-hatz-sluz/school_automation_m365</a></p>
    </footer>`;
}

function addTableHeaders() {
  return `
    <tr>
      <td>Frage</td>
      <td>Punkte</td>
      <td>Max Punkte</td>
      <td>Ihre Antwort</td>
      <td>Feedback</td>
    </tr>`;
}

function addUserInfoRow(df, rowIndex, maxPoints) {
  return `
    <tr><td>Name</td><td>${df[rowIndex]["Name"]}</td></tr>
    <tr><td>E-Mail</td><td>${df[rowIndex]["E-Mail"]}</td></tr>
    <tr>
      <td>Total</td><td>${df[rowIndex]["Gesamtpunktzahl"]} von ${maxPoints} Punkten <br><br>
        <span class="td_underline">Note: ${computeNoteValue(df[rowIndex]["Gesamtpunktzahl"])}</span>
      </td>
    </tr>`;
}

function generateTableRows(excelData) {
  let html = "";
  excelData.forEach((question) => {
    html += `
      <tr>
        <td>${question.title}</td>
        <td>${question.points > 0 ? question.points : "0"}</td>
        <td>${question.maxPoints}</td>
        <td>${question.answer}</td>
        <td>${question.feedback}</td>
      </tr>`;
  });
  return html;
}

function generateHtmlFromWorksheet(worksheet, examTitle) {
  let html = formatExamTitle(examTitle);
  html += `<table>`;
  html += addTableHeaders();
  html += generateTableRows(worksheet); // Assuming `worksheet` is structured to represent questions.
  html += `</table>`;
  html += formatFooter(examTitle);
  return html;
}

function writeHtmlToFile(htmlContent, outputFilePath) {
  fs.writeFileSync(outputFilePath, htmlContent);
}

// Function to generate and write the HTML report
function writeHtmlReport(
  examTitle,
  rowData,
  jsonData,
  outputFilePath,
  maxPoints,
  maxPointsTotal
) {
  let html = `
    ${cssContent}
    ${formatExamTitle(examTitle)}
    <table>`;

  html += addUserInfoRow(df, rowIndex, maxPoints, computeNoteValue);

  // Add two empty rows after user info
  html += `<tr><td></td></tr><tr><td></td></tr>`;

  html += addTableHeaders();

  html += generateTableRows(excelData);

  html += `</table>`;
  html += formatFooter(examTitle);

  writeHtmlToFile(html, outputFilePath);
}
function computeNoteValue(totalPoints) {
  let result = (5 / MAX_POINTS) * totalPoints + 1;
  return Math.round(result * 4) / 4;
}
module.exports = { writeHtmlReport };
