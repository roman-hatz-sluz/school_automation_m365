const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const { parser } = require("./convertExcelArgs");
const {
  writeHtmlReport,
  writeGradeOverviewsToFile,
} = require("./convertExceltoHTML");

const args = parser.parse_args();
const EXCEL_SOURCE_PATH = args.excel_source_path;
const EXCEL_SOURCE_FILE = args.excel_source_file;
const MAX_POINTS = args.max_points;
const JSON_FILE = "temp.json";
const OUTPUT_FILE_PATH = `${EXCEL_SOURCE_PATH}/responses/${EXCEL_SOURCE_FILE.replace(".xlsx", "")}`;
const GRADES_REPORT_OUTPUT_FILE_PATH = `${EXCEL_SOURCE_PATH}/Notenblatt`;
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

function swapNameOrder(name) {
  const nameParts = name.split(" ");
  const surname = nameParts.pop();
  return `${surname} ${nameParts.join(" ")}`;
}

function normalizeData(row, jsonData) {
  const result = [];
  const keys = Object.keys(row);

  const userData = {
    "E-Mail": row[keys[3]],
    Name: swapNameOrder(row[keys[4]]),
    Gesamtpunktzahl: row[keys[5]],
  };
  jsonData.questions.forEach((question, idx) => {
    // offset by 9 for first question, always 3 columns per question
    const excelQuestionOffset = EXCEL_QUESTION_OFFSET + idx * 3;
    let points = 0;
    let feedback = "";
    const columns = Object.keys(row);
    let pointsCol = columns[excelQuestionOffset + 1];
    if (pointsCol.startsWith("Punkte")) {
      points = row[keys[excelQuestionOffset + 1]];
      feedback = row[keys[excelQuestionOffset + 2]];
    } else {
      points = row[keys[excelQuestionOffset + 2]];
      feedback = row[keys[excelQuestionOffset + 1]];
    }

    result.push({
      title: `(${idx + 1}) ${normalizeContent(Object.keys(row)[excelQuestionOffset])}`,
      answer: normalizeContent(row[keys[excelQuestionOffset]]),
      points: points,
      maxPoints: question.Point,
      feedback: normalizeContent(feedback),
    });
  });
  return {
    questionData: result,
    userData: userData,
  };
}

function normalizeContent(content) {
  content = content + "";
  content = content.replace(/_x000d_/g, "").replace(/\s\s+/g, " ");
  // content = content.replace(/<\/?[^>]+(>|$)/g, "");
  return content;
}

function main() {
  const jsonData = readJson(JSON_FILE);
  const excelData = excelToJson(EXCEL_SOURCE_FILE);
  testJsonMatch(excelData, jsonData);

  for (let [idx, questionData] of excelData.entries()) {
    const result = normalizeData(questionData, jsonData);

    writeHtmlReport(
      EXCEL_SOURCE_FILE.replace(".xlsx", ""),
      result.questionData,
      result.userData,
      OUTPUT_FILE_PATH,
      MAX_POINTS
    );
  }

  writeGradeOverviewsToFile(GRADES_REPORT_OUTPUT_FILE_PATH);
}

if (require.main === module) {
  main();
}
