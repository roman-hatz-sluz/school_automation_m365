import { exec } from "child_process";

// Define the command you want to execute
const commandBase = "node_modules/.bin/m365";

// note: html content is not supported by cli-m365
const commands = {
  status: "",
  login: "",
  sendMsg: `${commandBase} teams chat message send --userEmails lfo@gmx.ch --message "Welcome to Teams <strong>bold</strong> ${Date.now()}"`,
};

// Execute the command
exec(commands.sendMsg, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing command: ${error}`);
    return;
  }

  console.log("Command output:");
  console.log(stdout);

  if (stderr) {
    console.error("Command error:");
    console.error(stderr);
  }
});
