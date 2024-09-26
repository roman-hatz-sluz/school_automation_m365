const fs = require("fs");
const path = require("path");
const process = require("process");
const { decode } = require("html-entities");

const { Command } = require("commander");

let totalPoints = 0;
let questions = [];
let questionCount = 0;

function extractPointsFromJson(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // Process descriptive questions
  if (data.descriptiveQuestions) {
    data.descriptiveQuestions.forEach(processQuestion);
  }

  // Process normal questions
  if (data.questions) {
    data.questions.forEach(processQuestion);
  }

  // Sort the questions by the 'order' field
  sortedQuestions = questions.sort((a, b) => Number(a.order) - Number(b.order));

  return { sortedQuestions: questions, totalPoints };
}

function processQuestion(question) {
  const { formsProRTQuestionTitle, questionInfo, order, id, type } = question;
  if (formsProRTQuestionTitle && questionInfo && order && id) {
    const parsedInfo = JSON.parse(questionInfo);
    const cleanedText = stripHtmlTags(formsProRTQuestionTitle);
    if (parsedInfo.Point) {
      const point = parsedInfo.Point;

      questions.push({
        id,
        cleanedText,
        Point: point,
        order: order,
        type: type || null,
      });
      totalPoints += point;
    }
  }
}
function stripHtmlTags(text) {
  return decode(text.replace(/<\/?[^>]+(>|$)/g, ""));
}

function main() {
  const program = new Command();
  program
    .description("Extract points from questions.json in a specified folder.")
    .argument("<folder>", "The folder containing the questions.json file")
    .parse(process.argv);

  const folder = program.args[0];
  const questionsFilePath = path.join(folder, "questions.json");

  if (!fs.existsSync(questionsFilePath)) {
    process.exit(1);
  }

  const { sortedQuestions, totalPoints } =
    extractPointsFromJson(questionsFilePath);

  let questionCount = 0;
  sortedQuestions.forEach((_, idx) => {
    sortedQuestions[idx]["questionCount"] = ++questionCount;
  });
  const result = {
    questions: sortedQuestions,
    meta: { totalPoints: totalPoints, questionCount: questionCount },
  };

  try {
    fs.writeFileSync("temp.json", JSON.stringify(result, null, 4), "utf8");
  } catch (err) {
    console.error("An error occurred while writing JSON to file:", err);
  }
}

if (require.main === module) {
  main();
}
