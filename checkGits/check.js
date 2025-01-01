import fs from "fs";
import path from "path";
import Mocha from "mocha";
import { execSync } from "child_process";

const RESPONSES_DIR = "report_check";

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
    const mocha = new Mocha();

    const addTest = (title, fn) =>
      mocha.suite.addTest(new Mocha.Test(title, fn));

    const addCommitMessageTests = (expectedCommits) => {
      expectedCommits.forEach((commit) => {
        addTest(`Check commit message: ${commit}`, () => {
          const logOutput = execSync("git log --pretty=format:%s", {
            cwd: projectFolder,
            encoding: "utf-8",
          });
          if (!logOutput.includes(commit)) {
            throw new Error(`Missing commit message: ${commit}`);
          }
        });
      });
    };
    const checkFileExists = (filePath, successMsg, errorMsg) => {
      if (!fs.existsSync(filePath)) {
        throw new Error(errorMsg);
      }
    };

    const projectFolder = path.join(baseFolderPath, folderName);
    const getFile = (filename) => path.join(projectFolder, filename);

    try {
      addTest(`Validate repository name`, () => {
        const isValid = /^pruefung_m324_\w+_\w+$/.test(folderName);
        if (!isValid) throw new Error("Repository name format mismatch");
      });

      addTest(`Check if main branch exists`, () => {
        const branches = execSync("git branch -r", {
          cwd: projectFolder,
          encoding: "utf-8",
        });
        if (!branches.includes("origin/main")) {
          throw new Error("Main branch missing");
        }
      });

      addTest(`Check README.md exists`, () =>
        checkFileExists(
          getFile("README.md"),
          "README.md exists.",
          "README.md is missing."
        )
      );

      addTest(`Check .gitignore contains node_modules`, () => {
        const gitignorePath = getFile(".gitignore");
        checkFileExists(
          gitignorePath,
          ".gitignore exists.",
          ".gitignore is missing."
        );
        const content = fs.readFileSync(gitignorePath, "utf-8");
        if (!content.includes("node_modules")) {
          throw new Error(".gitignore missing node_modules entry");
        }
      });

      addTest(`Check package.json exists`, () =>
        checkFileExists(
          getFile("package.json"),
          "package.json exists.",
          "package.json is missing."
        )
      );

      addTest(`Execute index.js`, () => {
        execSync("node index.js", {
          cwd: projectFolder,
          encoding: "utf-8",
        });
      });

      addTest(`Check required packages are installed`, () => {
        const output = execSync("npm list --depth=0 --json", {
          cwd: projectFolder,
          encoding: "utf-8",
        });

        const installedPackages = JSON.parse(output).dependencies || {};

        ["eslint", "chalk", "prettier"].forEach((pkg) => {
          if (!installedPackages[pkg]) {
            throw new Error(`${pkg} not installed at the top level`);
          }
        });
      });

      addTest(`Check eslint and prettier in devDependencies`, () => {
        const packageJsonPath = getFile("package.json");
        checkFileExists(
          packageJsonPath,
          "package.json exists for dependency checks.",
          "package.json is missing for dependency checks."
        );
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf-8")
        );
        const devDependencies = packageJson.devDependencies || {};
        ["eslint", "prettier"].forEach((pkg) => {
          if (!devDependencies[pkg]) {
            throw new Error(`${pkg} missing in devDependencies`);
          }
        });
      });

      addTest(`Check chalk in dependencies`, () => {
        const packageJsonPath = getFile("package.json");
        checkFileExists(
          packageJsonPath,
          "package.json exists for dependency checks.",
          "package.json is missing for dependency checks."
        );
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf-8")
        );
        const dependencies = packageJson.dependencies || {};
        if (!dependencies["chalk"]) {
          throw new Error("chalk missing in dependencies");
        }
      });

      addTest(`Check formatting with Prettier`, () => {
        execSync("npm run format-check", {
          cwd: projectFolder,
          encoding: "utf-8",
        });
      });

      addTest(`Check npm run test does not exist`, () => {
        try {
          execSync("npm run test", {
            cwd: projectFolder,
            encoding: "utf-8",
            stdio: "pipe",
          });
          throw new Error("npm run test exists");
        } catch (err) {
          const expectedError = 'npm ERR! Missing script: "test"';
          if (!err.message.includes(expectedError)) {
            throw err;
          }
        }
      });

      addTest(`Check origin/conflict-feature branch exists`, () => {
        const branches = execSync("git branch -r", {
          cwd: projectFolder,
          encoding: "utf-8",
        });
        if (!branches.includes("origin/conflict-feature")) {
          throw new Error("origin/conflict-feature branch missing");
        }
      });
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
        "Merge pull request",
      ];
      addCommitMessageTests(expectedCommits);

      addTest(`Check task-3.md exists`, () =>
        checkFileExists(
          getFile("task-3.md"),
          "task-3.md exists.",
          "task-3.md is missing."
        )
      );
      addTest(`Check task-3.html exists`, () =>
        checkFileExists(
          getFile("task-3.html"),
          "task-3.html exists.",
          "task-3.html is missing."
        )
      );
      const reportFilePath = `${originalDir}/${RESPONSES_DIR}/${folderName.replace(
        "pruefung_m324_",
        ""
      )}_report.md`;
      const outputStream = fs.createWriteStream(reportFilePath);

      await new Promise((resolve) => {
        const runner = mocha.run((failures) => {
          console.log(`Report saved to ${reportFilePath}`);
          resolve();
        });

        runner.on("test end", (test) => {
          outputStream.write(`${test.title}: ${test.state}\n`);
        });

        runner.on("end", () => {
          outputStream.write(
            `\nStats: ${runner.stats.passes} passed, ${runner.stats.failures} failed\n`
          );
          outputStream.end();
        });
      });
    } catch (err) {
      console.error(`Error processing folder '${folderName}': ${err.message}`);
    }
  }
}

runTests("responses");
