const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const htmlEntities = require("html-entities").decode;
const argparse = require("argparse");
const jsonPretty = require("json-pretty");

// Setup argument parser
const parser = new argparse.ArgumentParser({
  description: "Process Excel file for M324 exam",
});

parser.add_argument("--excel_source_path", {
  type: "str",
  required: true,
  help: "Path to the Excel source directory",
});
parser.add_argument("--excel_source_file", {
  type: "str",
  required: true,
  help: "Excel source file name",
});
parser.add_argument("--max_points", {
  type: "int",
  required: true,
  help: "Maximum points for the exam",
});

const args = parser.parse_args();
const EXCEL_SOURCE_PATH = args.excel_source_path;
const EXCEL_SOURCE_FILE = args.excel_source_file;
const MAX_POINTS = args.max_points;
const JSON_FILE = "temp.json";

// GLOBALS
const TRUNCATE_COL_VALUES = 800;
let dataGrades = [];

// Read JSON file
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// Extract text field questions
function extractTextFieldQuestions(jsonData) {
  return jsonData
    .filter((question) => question.type === "Question.TextField")
    .map((question) => question.questionCount);
}

// Read Excel file
function readExcel(fileName) {
  const filePath = path.join(EXCEL_SOURCE_PATH, fileName);
  const workbook = xlsx.readFile(filePath);
  return xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
}

// Compute note value
function computeNoteValue(totalPoints) {
  return (5 / MAX_POINTS) * totalPoints + 1;
}

// Rename points columns
function renamePointsColumns(df) {
  const pointsCols = Object.keys(df[0]).filter((col) => col.includes("Punkte"));
  const renameDict = {};

  pointsCols.forEach((col, idx) => {
    let newColName = col.replace("Punkte", `(${idx + 1})`);
    if (newColName.length > TRUNCATE_COL_VALUES) {
      newColName = newColName.substring(0, TRUNCATE_COL_VALUES - 3) + "...";
    }
    renameDict[col] = newColName;
  });

  df.forEach((row) => {
    Object.keys(renameDict).forEach((oldCol) => {
      row[renameDict[oldCol]] = row[oldCol];
      delete row[oldCol];
    });
  });

  return [df, renameDict];
}

// Filter columns
function filterColumns(df, renameDict) {
  const firstSixCols = Object.keys(df[0]).slice(0, 6);
  const colsToKeep = [...firstSixCols, ...Object.values(renameDict)];

  return df.map((row) => {
    const filteredRow = {};
    colsToKeep.forEach((col) => {
      if (row[col] !== undefined) {
        filteredRow[col] = row[col];
      }
    });
    return filteredRow;
  });
}

// Swap name order
function swapNameOrder(name) {
  const nameParts = name.split(" ");
  const surname = nameParts.pop();
  return `${surname} ${nameParts.join(" ")}`;
}

// Save row as Excel
function saveRowAsExcel(row, maxPoints, textQuestions) {
  const name = swapNameOrder(row["Name"]);
  const outputFilename = `${EXCEL_SOURCE_PATH}/responses/${EXCEL_SOURCE_FILE.replace(
    "_",
    ""
  ).replace(".xlsx", "")}_${name}.xlsx`;

  // Convert row to Excel
  const newRow = Object.keys(row).map((key) => [key, row[key]]);
  const newSheet = xlsx.utils.aoa_to_sheet(newRow);
  const newWorkbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Prüfungsergebnisse");

  // Save file
  xlsx.writeFile(newWorkbook, outputFilename);

  // Read source Excel for feedback columns
  const sourceDf = readExcel(EXCEL_SOURCE_FILE);
  const allMatchingColumns = [];

  textQuestions.forEach((questionNumber) => {
    const colIndex = 9; // Starting at column 9, each question takes 3 columns
    console.log("with colIndex", colIndex, textQuestions);
    // Extract the corresponding column names for the question, points, and feedback
    const questionCol = Object.keys(sourceDf[0])[colIndex - 1];
    const pointsCol = Object.keys(sourceDf[0])[colIndex]; // Points column
    const feedbackCol = Object.keys(sourceDf[0])[colIndex + 1]; // Feedback column

    // Only add non-undefined columns
    [questionCol, pointsCol, feedbackCol].forEach((col) => {
      if (col && !col.startsWith("Punkte")) {
        allMatchingColumns.push(col);
      }
    });
  });

  console.log("allMatchingColumns", allMatchingColumns);
  console.log("textQuestions", textQuestions);
  return false;

  // Add feedback data to Excel sheet
  allMatchingColumns.forEach((col) => {
    const questionValue = sourceDf[row.index][col];
    if (questionValue) {
      const formattedValue = htmlEntities(
        questionValue
          .replace(/&nbsp;/g, " ")
          .replace(/<br>/g, "\n")
          .replace(/<\/?span>/g, "")
      );
      newSheet[`${col}`] = { t: "s", v: formattedValue };
    }
  });

  // Save updated workbook
  xlsx.writeFile(newWorkbook, outputFilename);
}

// Export grades sheet
function exportGradesSheet() {
  return false;
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
}
/*
// Create question structure from Excel
function createQuestionStructureFromExcel(df) {
  const questions = [];
  let questionCount = 0;

  // Map metadata columns
  const mapping = {
    "E-Mail": Object.keys(df[0]).indexOf("E-Mail") + 1,
    Name: Object.keys(df[0]).indexOf("Name") + 1,
    Gesamtpunktzahl: Object.keys(df[0]).indexOf("Gesamtpunktzahl") + 1,
  };

  // Extract question columns (Question, Points, Feedback)
  const firstQuestionCol = 8;
  const questionMapping = {};

  for (let i = firstQuestionCol - 1; i < Object.keys(df[0]).length; i += 3) {
    if (Object.keys(df[0])[i]) {
      const questionTitle = Object.keys(df[0])[i];
      questionCount++;

      const questionEntry = {
        question_title: questionTitle,
        points_col: i + 2,
        question_count: questionCount,
        row_index: i + 1,
      };

      questions.push(questionEntry);
      questionMapping[questionCount] = {
        title_col: i + 1,
        points_col: i + 2,
        feedback_col: i + 3,
      };
    }
  }

  return { mapping, questions, questionMapping };
}
*/
// Main function
function main() {
  const jsonData = readJson(JSON_FILE);
  const textQuestions = extractTextFieldQuestions(jsonData.questions);

  let df = readExcel(EXCEL_SOURCE_FILE);

  // Rename and filter columns
  const [renamedDf, renameDict] = renamePointsColumns(df);
  df = filterColumns(renamedDf, renameDict);

  df.forEach((row) => {
    saveRowAsExcel(row, MAX_POINTS, textQuestions);
  });

  exportGradesSheet();
}

// Execute main function
if (require.main === module) {
  main();
}
