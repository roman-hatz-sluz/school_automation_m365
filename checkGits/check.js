import fs from "fs";
import path from "path";
import Mocha from "mocha";
import { execSync } from "child_process";

async function runTests(baseFolder) {
  const originalDir = process.cwd();
  const baseFolderPath = path.resolve(baseFolder);

  if (!fs.existsSync(baseFolderPath)) {
    console.error(`Error: Folder '${baseFolderPath}' does not exist.`);
    return;
  }

  const projectFolders = fs
    .readdirSync(baseFolderPath)
    .filter((entry) =>
      fs.lstatSync(path.join(baseFolderPath, entry)).isDirectory()
    );

  for (const folderName of projectFolders) {
    const reportFile = `${folderName}_report.md`;
    const report = [];
    const mocha = new Mocha();

    const addTest = (title, fn) =>
      mocha.suite.addTest(new Mocha.Test(title, fn));

    const checkFileExists = (filePath, successMsg, errorMsg) => {
      if (fs.existsSync(filePath)) {
        report.push(`## [PASS] ${successMsg}`);
      } else {
        report.push(`## [FAIL] ${errorMsg}`);
        throw new Error(errorMsg);
      }
    };

    const projectFolder = path.join(baseFolderPath, folderName);
    const getFile = (filename) => path.join(projectFolder, filename);

    report.push(`# Processing folder: ${folderName}`);

    addTest(`${folderName} - Validate repository name`, () => {
      const isValid = /^pruefung_m324_\w+_\w+$/.test(folderName);
      report.push(
        isValid
          ? "## [PASS] Repository name matches the specified format."
          : "## [FAIL] Repository name does not match the specified format."
      );
      if (!isValid) throw new Error("Repository name format mismatch");
    });

    addTest(`${folderName} - Check if main branch exists`, () => {
      const branches = execSync("git branch -r", {
        cwd: projectFolder,
        encoding: "utf-8",
      });
      if (branches.includes("origin/main")) {
        report.push("## [PASS] Main branch exists in the repository.");
      } else {
        report.push("## [FAIL] Main branch does not exist in the repository.");
        throw new Error("Main branch missing");
      }
    });

    addTest(`${folderName} - Check README.md exists`, () =>
      checkFileExists(
        getFile("README.md"),
        "README.md exists.",
        "README.md is missing."
      )
    );

    addTest(`${folderName} - Check .gitignore contains node_modules`, () => {
      const gitignorePath = getFile(".gitignore");
      checkFileExists(
        gitignorePath,
        ".gitignore exists.",
        ".gitignore is missing."
      );
      const content = fs.readFileSync(gitignorePath, "utf-8");
      if (!content.includes("node_modules")) {
        report.push("## [FAIL] .gitignore does not contain node_modules.");
        throw new Error(".gitignore missing node_modules entry");
      }
      report.push("## [PASS] .gitignore contains node_modules.");
    });

    addTest(`${folderName} - Check package.json exists`, () =>
      checkFileExists(
        getFile("package.json"),
        "package.json exists.",
        "package.json is missing."
      )
    );

    addTest(`${folderName} - Execute index.js`, () => {
      const output = execSync("node index.js", {
        cwd: projectFolder,
        encoding: "utf-8",
      });
      report.push(
        `## [PASS] Index.js executed successfully: Output: ${output.trim()}`
      );
    });

    addTest(`${folderName} - Check required packages are installed`, () => {
      const output = execSync("npm list chalk prettier eslint", {
        cwd: projectFolder,
        encoding: "utf-8",
      });
      ["eslint", "chalk", "prettier"].forEach((pkg) => {
        if (output.includes(pkg)) {
          report.push(`## [PASS] ${pkg} is installed.`);
        } else {
          report.push(`## [FAIL] ${pkg} is not installed.`);
          throw new Error(`${pkg} not installed`);
        }
      });
    });

    addTest(`${folderName} - Check formatting with Prettier`, () => {
      execSync("npm run format-check", {
        cwd: projectFolder,
        encoding: "utf-8",
      });
      report.push("## [PASS] Code formatting is correct.");
    });

    addTest(`${folderName} - Check npm run test does not exist`, () => {
      try {
        execSync("npm run test", {
          cwd: projectFolder,
          encoding: "utf-8",
          stdio: "pipe",
        });
        report.push("## [FAIL] npm run test exists but should not.");
        throw new Error("npm run test exists");
      } catch (err) {
        const expectedError = 'npm ERR! Missing script: "test"';
        if (!err.message.includes(expectedError)) {
          report.push("## [FAIL] Unexpected error for npm run test.");
          throw err;
        }
        report.push(
          "## [PASS] npm run test does not exist and produced the correct error."
        );
      }
    });

    addTest(
      `${folderName} - Check origin/conflict-feature branch exists`,
      () => {
        const branches = execSync("git branch -r", {
          cwd: projectFolder,
          encoding: "utf-8",
        });
        if (branches.includes("origin/conflict-feature")) {
          report.push(
            "## [PASS] origin/conflict-feature branch exists in remote repository."
          );
        } else {
          report.push(
            "## [FAIL] origin/conflict-feature branch does not exist in remote repository."
          );
          throw new Error("origin/conflict-feature branch missing");
        }
      }
    );

    addTest(`${folderName} - Check for specified commit messages`, () => {
      const logOutput = execSync("git log ", {
        cwd: projectFolder,
        encoding: "utf-8",
      }).split("\n");
      const expectedCommits = [
        "first commit",
        "test color log",
        "build automation",
        "linter test",
        "linter fixed",
        "formatter test",
        "convert md to html",
        "changed index.js in feature branch",
        "changed index.js in main branch",
        "This reverts commit",
        "Merge pull request",
      ];
      const missingCommits = expectedCommits.filter(
        (commit) => !logOutput.some((log) => log.includes(commit))
      );
      if (missingCommits.length) {
        report.push(
          `## [FAIL] Missing commit messages: ${missingCommits.join(", ")}`
        );
        throw new Error(
          `Missing commit messages: ${missingCommits.join(", ")}`
        );
      }
      report.push("## [PASS] All specified commit messages are present.");
    });

    addTest(`${folderName} - Validate Markdown to HTML conversion`, () => {
      const markdownFilePath = getFile("task-3.md");
      const htmlFilePath = getFile("task-3.html");
      if (fs.existsSync(markdownFilePath)) {
        checkFileExists(
          htmlFilePath,
          "task-3.html is present.",
          "task-3.html is missing."
        );
      } else {
        report.push("- [SKIP] task-3.md not found, skipping HTML validation.");
      }
    });

    await new Promise((resolve) => {
      mocha.run(() => {
        fs.writeFileSync(
          path.join(originalDir, reportFile),
          report.join("\n"),
          "utf-8"
        );
        console.log(`Report saved to ${reportFile}`);
        resolve();
      });
    });
  }
}

runTests("responses");
