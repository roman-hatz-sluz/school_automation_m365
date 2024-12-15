import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const runNpmScriptsInFolders = async (
  baseFolder,
  reportFile = "check_runtime.md"
) => {
  const report = [];

  // Check if the base folder exists
  if (!fs.existsSync(baseFolder)) {
    console.error(
      `Error: The specified folder '${baseFolder}' does not exist.`
    );
    return;
  }

  console.log(`Processing base folder: ${baseFolder}`);
  const originalDir = process.cwd(); // Save the current working directory

  // Get all entries in the base folder
  const folders = fs.readdirSync(baseFolder);

  for (const folderName of folders) {
    const folderPath = path.join(baseFolder, folderName);

    // Check if it's a directory
    if (fs.lstatSync(folderPath).isDirectory()) {
      process.chdir(folderPath); // Change to the folder
      report.push(`## Processing folder: ${folderName}\n `);

      try {
        // Run npm install and capture output
        const installOutput = execSync("npm install", { encoding: "utf-8" });
        report.push("### npm install: SUCCESS");
        report.push(installOutput); // Append install output
      } catch (err) {
        report.push("### npm install: FAILED");
        report.push(`- Error: ${err.message}`);
        report.push(`- Output: ${err.stdout || "No output"}`);
        report.push(`- Error Output: ${err.stderr || "No error output"}`);
        process.chdir(originalDir); // Return to the base directory
        continue; // Skip this folder
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
              report.push(`### npm run ${scriptName}: SUCCESS`);
              report.push(scriptOutput); // Append script output
            } catch (err) {
              report.push(`### npm run ${scriptName}: FAILED`);
              report.push(`- Error: ${err.message}`);
              report.push(`- Output: ${err.stdout || "No output"}`);
              report.push(`- Error Output: ${err.stderr || "No error output"}`);
            }
          }
        } else {
          report.push("### No scripts defined in package.json");
        }
      } else {
        report.push("### No package.json found");
      }

      process.chdir(originalDir);
    }
  }

  const reportFilePath = path.join(originalDir, reportFile);
  fs.writeFileSync(reportFilePath, report.join("\n"), "utf-8");
  console.log(`Report saved to ${reportFilePath}`);
};

// Specify the base folder (modify the path as needed)
const baseFolderPath = path.resolve("responses");
runNpmScriptsInFolders(baseFolderPath);