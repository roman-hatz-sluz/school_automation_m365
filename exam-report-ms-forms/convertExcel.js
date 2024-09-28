const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const { parser } = require("./convertExcelArgs");
const { convertExceltoHTML } = require("./convertExceltoHTML");

const args = parser.parse_args();
const EXCEL_SOURCE_PATH = args.excel_source_path;
const EXCEL_SOURCE_FILE = args.excel_source_file;
const MAX_POINTS = args.max_points;
const JSON_FILE = "temp.json";

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

async function saveRowAsExcel(questions, df, rowIndex) {
  const name = swapNameOrder(df[rowIndex]["Name"]);
  const outputFilename = `${EXCEL_SOURCE_PATH}/responses/${EXCEL_SOURCE_FILE.replace(
    "_",
    ""
  ).replace(".xlsx", "")}_${name}.xlsx`;

  const newRow = [];

  newRow.push(["Name", "", "", df[rowIndex]["Name"]]);
  newRow.push(["E-Mail", "", "", df[rowIndex]["E-Mail"]]);
  newRow.push([
    "Total",
    "",
    "",
    df[rowIndex]["Gesamtpunktzahl"] +
      ` von ${MAX_POINTS} Punkten <br>
      <span style="text-decoration: underline">Note: ${computeNoteValue(df[rowIndex]["Gesamtpunktzahl"])}</span>`,
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
      question.points > 0 ? question.points : "0",
      question.maxPoints,
      question.feedback ? question.answer : "",
      question.feedback,
    ]);
  });

  const newSheet = xlsx.utils.aoa_to_sheet(newRow);
  const newWorkbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Prüfungsergebnisse");

  xlsx.writeFile(newWorkbook, outputFilename);

  await convertExceltoHTML(
    outputFilename,
    outputFilename.replace(".xlsx", ".html"),
    EXCEL_SOURCE_FILE
  );
}

function mapRowData(row, jsonData, df) {
  const result = [];
  const keys = Object.keys(row);

  jsonData.questions.forEach((question, idx) => {
    // offset by 9 for first question, always 3 columns per question
    const excelQuestionOffset = 8 + idx * 3;

    let points = row[keys[excelQuestionOffset + 1]];
    let feedback = row[keys[excelQuestionOffset + 2]];

    // points and feedback columns can be switched
    // if points is a number and not a longer string

    if (isNaN(points) || points.length > 4) {
      let tempPoints = points;
      points = feedback;
      feedback = tempPoints;
    }
    // dont print points as feedback, only text
    feedback = feedback.length > 4 ? feedback : "";
    //console.log("points:", points, "feedback:", feedback, question.Point);
    result.push({
      title: "(" + (idx + 1) + ") " + Object.keys(df[0])[excelQuestionOffset],
      answer: row[keys[excelQuestionOffset]],
      points: parseFloat(points),
      maxPoints: question.Point,
      feedback: feedback,
    });
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

if (require.main === module) {
  main();
}
