const argparse = require("argparse");

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

module.exports = { parser };
