const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const excelJS = require("exceljs");
const { parser } = require("./convertExcelArgs");
const { convertExceltoPDF } = require("./convertExceltoPDF");

const args = parser.parse_args();
const EXCEL_SOURCE_PATH = args.excel_source_path;
const EXCEL_SOURCE_FILE = args.excel_source_file;
const MAX_POINTS = args.max_points;
const JSON_FILE = "temp.json";

// GLOBALS
const TRUNCATE_COL_VALUES = 800;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function readExcel(fileName) {
  const filePath = path.join(EXCEL_SOURCE_PATH, fileName);
  const workbook = xlsx.readFile(filePath);

  // Keep empty rows by setting defval to null and raw to true
  return xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
    raw: true,
    defval: "",
  });
}

function computeNoteValue(totalPoints) {
  let result = (5 / MAX_POINTS) * totalPoints + 1;
  return Math.round(result * 4) / 4;
}

function swapNameOrder(name) {
  const nameParts = name.split(" ");
  const surname = nameParts.pop();
  return `${surname} ${nameParts.join(" ")}`;
}

// Save row as Excel
async function saveRowAsExcel(questions, df, rowIndex) {
  const name = swapNameOrder(df[rowIndex]["Name"]);
  const outputFilename = `${EXCEL_SOURCE_PATH}/responses/${EXCEL_SOURCE_FILE.replace(
    "_",
    ""
  ).replace(".xlsx", "")}_${name}.xlsx`;

  // Create basic structure of the new sheet
  const newRow = [];

  // (1) Print first 3 rows with titles E-Mail, Name, Gesamtpunktzahl
  newRow.push(["Name", df[rowIndex]["Name"]]);
  newRow.push(["E-Mail", df[rowIndex]["E-Mail"]]);
  newRow.push([
    "Gesamtpunktzahl",
    df[rowIndex]["Gesamtpunktzahl"] +
      `/${MAX_POINTS}, Note: ${computeNoteValue(
        df[rowIndex]["Gesamtpunktzahl"]
      )}`,
  ]);
  console.log(
    "Name:",
    df[rowIndex]["Name"],
    "| Note:",
    computeNoteValue(df[rowIndex]["Gesamtpunktzahl"])
  );
  // (2) Add two empty rows
  newRow.push(["", ""]);
  newRow.push(["", ""]);

  // (3) Add the headers starting in the 5th row
  newRow.push(["Frage", "Punkte", "Max Punkte", "Ihre Antwort", "Feedback"]);

  // (4) Print output from data (answer, points, maxPoints, feedback)
  questions.forEach((question) => {
    newRow.push([
      question.title,
      question.points,
      question.maxPoints,
      question.feedback ? question.answer : "",
      question.feedback,
    ]);
  });

  // Convert the newRow to Excel format
  const newSheet = xlsx.utils.aoa_to_sheet(newRow);
  const newWorkbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Prüfungsergebnisse");

  // Save the file
  xlsx.writeFile(newWorkbook, outputFilename);

  await convertExceltoPDF(
    outputFilename,
    outputFilename.replace(".xlsx", ".pdf")
  );
}
/*
// Export grades sheet
function exportGradesSheet() {
  const dfExport = dataGrades.map((item) => ({
    Name: item[0],
    Gesamtpunktzahl: item[1],
    Note: item[2],
  }));

  const outputFilename = `${EXCEL_SOURCE_PATH}${EXCEL_SOURCE_FILE}_Notenblatt.xlsx`;
  const newSheet = xlsx.utils.json_to_sheet(dfExport);
  const newWorkbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Sheet1");

  // Add average row
  const avgNote =
    dfExport.reduce((acc, item) => acc + item.Note, 0) / dfExport.length;
  xlsx.utils.sheet_add_aoa(newSheet, [["Average", null, avgNote]], {
    origin: -1,
  });

  // Save the grades sheet
  xlsx.writeFile(newWorkbook, outputFilename);
}*/

function mapRowData(row, jsonData, df) {
  const result = [];
  const keys = Object.keys(row);

  jsonData.questions.forEach((question, idx) => {
    // offset by 9 for first question, always 3 columns per question
    const excelQuestionOffset = 8 + idx * 3;

    const points = parseFloat(row[keys[excelQuestionOffset + 1]]);
    const feedback = row[keys[excelQuestionOffset + 2]];
    let actualPoints, actualFeedback;

    if (!isNaN(points)) {
      // If points is a valid number, it's correct as is
      actualPoints = points;
      actualFeedback = feedback;
    } else {
      // If points is not a number, they might be switched
      const potentialPoints = parseFloat(feedback);
      if (!isNaN(potentialPoints)) {
        actualPoints = potentialPoints;
        actualFeedback = row[keys[excelQuestionOffset + 1]]; // feedback is actually in the points field
      } else {
        actualPoints = null; // Neither is a number, leave points as null
        actualFeedback = feedback;
      }
    }
    if (actualPoints) {
      result.push({
        title: "(" + (idx + 1) + ") " + Object.keys(df[0])[excelQuestionOffset],
        answer: row[keys[excelQuestionOffset]],
        points: actualPoints,
        maxPoints: question.Point,
        feedback: actualFeedback,
      });
    }
  });

  return result;
}

// Main function
async function main() {
  const jsonData = readJson(JSON_FILE);

  let df = readExcel(EXCEL_SOURCE_FILE);

  for (let [idx, row] of df.entries()) {
    row = mapRowData(row, jsonData, df);
    await saveRowAsExcel(row, df, idx);
  }
}

// Execute main function
if (require.main === module) {
  main();
}
