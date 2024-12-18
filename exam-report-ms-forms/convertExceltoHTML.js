const fs = require("fs");
const path = require("path");

const cssFilePath = path.join(__dirname, "convertExcelStyles.css");
const cssContent = fs.readFileSync(cssFilePath, "utf-8");
let gradesCSV = "Name;Grade\n";
function formatExamTitle(examTitle) {
  return `<h2>${examTitle.replace(".xlsx", "")} - ${new Date().getFullYear()}</h2>`;
}
function computeNoteValue(totalPoints, maxPointsTotal) {
  let result = (5 / maxPointsTotal) * totalPoints + 1;

  return Math.round(result * 4) / 4;
}
function formatFooter(examTitle) {
  return `
    <footer class="footer">
      <p>${examTitle.replace(".xlsx", "")} - Lehrperson: Roman Hatz 2024/2025</p>
      <p>${new Date().toLocaleString("de")}</p>
      <p>PDF Forms Report Generator: <a href="https://github.com/roman-hatz-sluz/school_automation_m365" target="_blank">https://github.com/roman-hatz-sluz/school_automation_m365</a></p>
    </footer>`;
}

function addTableHeaders() {
  return `
    <tr class="tr_italic">
      <td >Frage</td>
      <td>Punkte</td>
      <td>Max Punkte</td>
      <td>Ihre Antwort</td>
      <td>Feedback</td>
    </tr>`;
}

function addSummary(userData, maxPointsTotal) {
  const grade = computeNoteValue(userData["Gesamtpunktzahl"], maxPointsTotal);
  gradesCSV += userData.Name + ";" + grade + "\n";

  return `
  <table class="summaryTable">
    <tr class="tr_large">
      <td data-name="${userData["Name"]}" class="td_bold">Name</td><td>${userData["Name"]}</td></tr>
    <tr><td data-email="${userData["E-Mail"]}">E-Mail</td><td>${userData["E-Mail"]}</td></tr>
    <tr class="tr_large">
      <td class="td_bold">Total</td><td>${userData["Gesamtpunktzahl"]} von ${maxPointsTotal} Punkten <br><br>
        <span class="td_underline">
          Note: <span data-grade="${grade}">${grade}</span>
        </span>
      </td>
    </tr> </table>`;
}

function generateTableRows(questionData, userData) {
  let html = "";
  let controlCount = 0;
  questionData.forEach((question) => {
    const hasErrors = Number(question.points) !== Number(question.maxPoints);
    controlCount += Number(question.points);
    html += `
      <tr>
        <td>${question.title}</td>
        <td class="${hasErrors ? "td_red" : "td_green"}">${question.points}</td>
        <td>${question.maxPoints}</td>
        <td>${question.feedback.length > 3 ? question.answer : ""}</td>
        <td class="${hasErrors ? "td_red" : "td_green"}">${question.feedback}</td>
      </tr>`;
  });
  if (controlCount !== userData.Gesamtpunktzahl) {
    console.error(
      "Points count does not match: ",
      userData.Name,
      controlCount,
      userData.Gesamtpunktzahl
    );
  }

  return html;
}

function writeHtmlToFile(htmlContent, outputFilePath) {
  fs.writeFileSync(outputFilePath + ".html", htmlContent);
}
function writeGradeOverviewsToFile(outputFilePath) {
  fs.writeFileSync(outputFilePath + ".csv", gradesCSV);
}

// Function to generate and write the HTML report
function writeHtmlReport(
  examTitle,
  questionData,
  userData,
  outputFilePath,
  maxPointsTotal
) {
  let html = `
    <style>${cssContent}</style>  
    ${formatExamTitle(examTitle)}
    `;

  html += addSummary(userData, maxPointsTotal);

  html += "<table>" + addTableHeaders();

  html += generateTableRows(questionData, userData) + "</table>";

  html += formatFooter(examTitle);

  writeHtmlToFile(html, outputFilePath + `_${userData.Name}`);
}

module.exports = { writeHtmlReport, writeGradeOverviewsToFile };
