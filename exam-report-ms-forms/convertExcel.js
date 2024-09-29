const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const { parser } = require("./convertExcelArgs");
const { writeHtmlReport } = require("./convertExceltoHTML");

const args = parser.parse_args();
const EXCEL_SOURCE_PATH = args.excel_source_path;
const EXCEL_SOURCE_FILE = args.excel_source_file;
const MAX_POINTS = args.max_points;
const JSON_FILE = "temp.json";
const OUTPUT_FILE_PATH = `${EXCEL_SOURCE_PATH}/responses/${EXCEL_SOURCE_FILE.replace(".xlsx", "")}`;
const EXCEL_QUESTION_OFFSET = 8;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function excelToJson(fileName) {
  const filePath = path.join(EXCEL_SOURCE_PATH, fileName);
  const workbook = xlsx.readFile(filePath);

  // Keep empty rows by setting defval to null and raw to true
  return xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
    raw: true,
    defval: "",
  });
}

function getQuestionCountFromExcel(excelData) {
  /*  
  'ID',
  'Startzeit',
  'Fertigstellungszeit',
  'E-Mail',
  'Name',
  'Gesamtpunktzahl',
  'Prüfungsfeedback',
  'Uhrzeit der Notenveröffentlichung', 
  */
  const totalCount = Object.keys(excelData[0]).length;
  return (totalCount - EXCEL_QUESTION_OFFSET) / 3;
}

function testJsonMatch(excelData, jsonData) {
  if (getQuestionCountFromExcel(excelData) !== jsonData.questions.length) {
    throw Error(
      "json file question match: excel vs json:",
      getQuestionCountFromExcel(excelData),
      jsonData.questions.length
    );
  }
}

/*
function swapNameOrder(name) {
  const nameParts = name.split(" ");
  const surname = nameParts.pop();
  return `${surname} ${nameParts.join(" ")}`;
}*/

function normalizeData(row, jsonData) {
  const result = [];
  const keys = Object.keys(row);

  jsonData.questions.forEach((question, idx) => {
    // offset by 9 for first question, always 3 columns per question
    const excelQuestionOffset = EXCEL_QUESTION_OFFSET + idx * 3;

    let points = row[keys[excelQuestionOffset + 1]];
    let feedback = row[keys[excelQuestionOffset + 2]];

    // points and feedback columns can be switched
    // if points is a number and not a longer string
    if (isNaN(points) || points.length > 4) {
      let tempPoints = points;
      points = feedback;
      feedback = tempPoints;
    }

    // don't print points as feedback, only text
    feedback = feedback.length > 4 ? feedback : "";

    result.push({
      title: "(" + (idx + 1) + ") " + Object.keys(row)[excelQuestionOffset],
      answer: row[keys[excelQuestionOffset]],
      points: parseFloat(points),
      maxPoints: question.Point,
      feedback: feedback,
    });
  });
  console.log("result", result);
  return result;
}

// Main function
async function main() {
  const jsonData = readJson(JSON_FILE);
  const excelData = excelToJson(EXCEL_SOURCE_FILE);
  testJsonMatch(excelData, jsonData);

  for (let [idx, row] of excelData.entries()) {
    row = normalizeData(row, jsonData, excelData);

    writeHtmlReport(
      path.basename(excelPath),
      row,

      OUTPUT_FILE_PATH,
      MAX_POINTS
    );
  }
}

if (require.main === module) {
  main();
}
