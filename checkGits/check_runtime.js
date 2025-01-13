import { execSync } from "child_process";
import fs from "fs";
import path from "path";
const BASE_FOLDER = "pruefung_m324_2";
const STUDENTS_CODE_FOLDER = BASE_FOLDER + "/responses";
const RESPONSES_DIR = BASE_FOLDER + "/report_check_runtime";
const EXAM_BRANCH = "exam";

let report = [];
let summary = { passed: 0, failed: 0 };
let originalDir = "";
const runNpmScriptsInFolders = async (baseFolder) => {
  // Check if the base folder exists
  if (!fs.existsSync(baseFolder)) {
    console.error(
      `Error: The specified folder '${baseFolder}' does not exist.`
    );
    return;
  }

  console.log(`Processing base folder: ${baseFolder}`);
  originalDir = process.cwd(); // Save the current working directory

  // Get all entries in the base folder
  const folders = fs.readdirSync(baseFolder);

  for (const folderName of folders) {
    if (
      folderName === ".DS_Store" ||
      folderName === ".github" ||
      folderName === ".git"
    ) {
      continue;
    }
    console.log("----- Processing folder: " + folderName + " -----");
    const folderPath = path.join(baseFolder, folderName);

    // Check if it's a directory
    if (fs.lstatSync(folderPath).isDirectory()) {
      process.chdir(folderPath); // Change to the folder
      report.push(`## Processing folder: ${folderName}\n `);
      if (EXAM_BRANCH) {
        try {
          // Check out specified branch
          const installOutput = execSync(
            "git stash && git checkout " + EXAM_BRANCH,
            {
              encoding: "utf-8",
            }
          );
          report.push("### git checkout: SUCCESS");
          summary.passed++;
          report.push(installOutput); // Append install output
        } catch (err) {
          summary.failed++;
          report.push("### git checkout: FAILED");
          report.push(`- Error: ${err.message} || "No error output"`);
          report.push(`- Output: ${err.stdout || "No output"}`);

          process.chdir(originalDir);
          continue;
        }
      }

      try {
        // Run npm ci and capture output
        const installOutput = execSync("npm ci", { encoding: "utf-8" });
        report.push("### npm ci: SUCCESS");
        summary.passed++;
        report.push(installOutput); // Append install output
      } catch (err) {
        summary.failed++;
        report.push("### npm ci: FAILED");
        report.push(`- Error: ${err.message} || "No error output"`);
        report.push(`- Output: ${err.stdout || "No output"}`);

        process.chdir(originalDir);
        continue;
      }

      // Check for package.json
      const packageJsonPath = path.join(folderPath, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf-8")
        );

        // Get scripts from package.json
        const scripts = packageJson.scripts || {};
        if (Object.keys(scripts).length > 0) {
          for (const [scriptName, _] of Object.entries(scripts)) {
            try {
              // Run the script and capture output
              const scriptOutput = execSync(`npm run ${scriptName}`, {
                encoding: "utf-8",
              });
              summary.passed++;
              report.push(`### npm run ${scriptName}: SUCCESS`);
              report.push(scriptOutput); // Append script output
            } catch (err) {
              summary.failed++;
              report.push(`### npm run ${scriptName}: FAILED`);
              report.push(`- Error: ${err.message}`);
              report.push(`- Error Output: ${err.stderr || "No error output"}`);
            }
          }
        } else {
          report.push("### No scripts defined in package.json");
        }
      } else {
        report.push("### No package.json found");
      }
      writeReportToFile(folderName);
      process.chdir(originalDir);
    }
  }
};

const writeReportToFile = (folderName) => {
  const reportFilePath = `${originalDir}/${RESPONSES_DIR}/${folderName.replace(
    "pruefung_m324_",
    ""
  )}_runtime_report.md`;
  let summaryString = `Summary: ${summary.passed} passed, ${summary.failed} failed`;
  const content = `# ${folderName} \n\n# Summary\n${summaryString}\n\n\n# Report\n${report.join(
    "\n"
  )}`;
  fs.writeFileSync(reportFilePath, content, "utf-8");
  report = [];
  summary = { passed: 0, failed: 0 };

  console.log(`Report saved to ${reportFilePath}`);
};

// Specify the base folder (modify the path as needed)
const baseFolderPath = path.resolve(STUDENTS_CODE_FOLDER);
runNpmScriptsInFolders(baseFolderPath);
