import fs from "fs";
import path from "path";
import Mocha from "mocha";
import { execSync } from "child_process";

const BASE_FOLDER = "pruefung_m324_2";
const STUDENTS_CODE_FOLDER = BASE_FOLDER + "/responses";
const RESPONSES_DIR = BASE_FOLDER + "/report_check";

async function runTests() {
  const originalDir = process.cwd();
  const baseFolderPath = path.resolve(STUDENTS_CODE_FOLDER);

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
    if (
      folderName === ".DS_Store" ||
      folderName === ".github" ||
      folderName === ".git"
    ) {
      continue;
    }
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
        const isValid = /^pruefung2_m324_\w+_\w+$/.test(folderName);
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

      addTest(`Check origin/main branch exists`, () => {
        const branches = execSync("git branch -r", {
          cwd: projectFolder,
          encoding: "utf-8",
        });
        if (!branches.includes("origin/main")) {
          throw new Error("origin/main branch missing");
        }
      });

      addTest(`Check origin/exam branch exists`, () => {
        const branches = execSync("git branch -r", {
          cwd: projectFolder,
          encoding: "utf-8",
        });
        if (!branches.includes("origin/exam")) {
          throw new Error("origin/exam branch missing");
        }
      });
      const expectedCommits = [
        "Init",
        "Task 2: Create PR",
        "Task 3: Fixed CI Error 1",
        "Task 3: Fixed CI Error 2",
        "Task 3: Fixed Linter Error",
        "Task 3: Add formatting error",
        "Task 3: Fix formatting error",
        "Task 3: Improved package installation",
      ];
      addCommitMessageTests(expectedCommits);

      addTest(`Check README_Aufgabe4.md exists`, () =>
        checkFileExists(
          getFile("README_Aufgabe4.md"),
          "README_Aufgabe4.md exists.",
          "README_Aufgabe4.md is missing."
        )
      );

      const repoUrl = execSync("git remote get-url origin", {
        cwd: projectFolder,
        encoding: "utf-8",
      }).trim();
      addTest(
        `Check if repository ${repoUrl} has GitHub Workflows set up`,
        () => {
          const workflows = execSync(
            `gh workflow list --repo  ${repoUrl} --json name,path,state`,
            {
              cwd: projectFolder,
              encoding: "utf-8",
            }
          );

          if (workflows.length === 0) {
            throw new Error(
              "No GitHub Actions workflows found in the repository"
            );
          } else if (workflows.length === 1) {
            throw new Error(
              "Only 1 GitHub Actions workflows found in the repository"
            );
          }
        }
      );
      const actionLog = execSync(
        `gh run list --repo ${repoUrl} --json conclusion,status,attempt,workflowName,event,status`,
        {
          cwd: projectFolder,
          encoding: "utf-8",
        }
      );
      const actions = JSON.parse(actionLog);

      const groupedWorkflows = actions.reduce((acc, run) => {
        if (!acc[run.workflowName]) {
          acc[run.workflowName] = [];
        }
        acc[run.workflowName].push(run);
        return acc;
      }, {});
      addTest(`Check if the last workflow run was successful`, () => {
        if (actions.length === 0) {
          throw new Error("No Actions found in the repository");
        }
      });

      Object.keys(groupedWorkflows).forEach((workflowName) => {
        const lastRun = groupedWorkflows[workflowName].find(
          (run) => run.status === "completed"
        );

        addTest(
          `Check if the last execution of workflow '${workflowName}' was successful`,
          () => {
            if (!lastRun) {
              throw new Error(
                `No completed runs found for workflow '${workflowName}'`
              );
            }
            if (lastRun.conclusion !== "success") {
              throw new Error(
                `The last run of workflow '${workflowName}' was not successful. Conclusion: ${lastRun.conclusion}`
              );
            }
          }
        );
      });

      const addPullRequestTests = () => {
        const repoUrl = execSync("git remote get-url origin", {
          cwd: projectFolder,
          encoding: "utf-8",
        }).trim();

        const pullRequestsLog = execSync(
          `gh pr list --repo ${repoUrl} --json state,comments,number`,
          {
            cwd: projectFolder,
            encoding: "utf-8",
          }
        );

        const pullRequests = JSON.parse(pullRequestsLog);

        addTest(`Check if exactly one Pull Request exists`, () => {
          if (pullRequests.length !== 1) {
            throw new Error(
              `Expected exactly 1 Pull Request, found ${pullRequests.length}`
            );
          }
        });

        addTest(`Check if the Pull Request is open`, () => {
          if (pullRequests[0].state !== "OPEN") {
            throw new Error(
              `The Pull Request is not open. Current state: ${pullRequests[0].state}`
            );
          }
        });
      };

      addPullRequestTests();
      // MAIN

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

runTests();
