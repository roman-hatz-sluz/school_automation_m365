import os
import json
import subprocess

def run_npm_scripts_in_folders(base_folder, report_file="npm_report.txt"):
     
    if not os.path.exists(base_folder):
        print(f"Error: The specified folder '{base_folder}' does not exist.")
        return
    report = []
    print(base_folder)
    for folder_name in os.listdir(base_folder):
        folder_path = os.path.join(base_folder, folder_name)

        # Check if the current path is a directory
        if os.path.isdir(folder_path):
            os.chdir(folder_path)  # Change to the folder
            report.append(f"Processing folder: {folder_name}")

            # Run npm install
            try:
                subprocess.run(["npm", "install"], check=True, text=True)
                report.append("npm install: SUCCESS")
            except subprocess.CalledProcessError as e:
                report.append(f"npm install: FAILED - {e}")
                continue  # Skip this folder if npm install fails

            # Check for package.json and parse it
            package_json_path = os.path.join(folder_path, "package.json")
            if os.path.exists(package_json_path):
                with open(package_json_path, "r") as f:
                    package_json = json.load(f)
                
                scripts = package_json.get("scripts", {})
                if scripts:
                    for script_name in scripts:
                        try:
                            # Run each script defined in package.json
                            subprocess.run(["npm", "run", script_name], check=True, text=True)
                            report.append(f"npm run {script_name}: SUCCESS")
                        except subprocess.CalledProcessError as e:
                            report.append(f"npm run {script_name}: FAILED - {e}")
                else:
                    report.append("No scripts defined in package.json")
            else:
                report.append("No package.json found")

            os.chdir("..")
    
    
    with open(os.path.join(base_folder, report_file), "w") as report_f:
        report_f.write("\n".join(report))
    print(f"Report saved to {os.path.join(base_folder, report_file)}")

 
run_npm_scripts_in_folders("responses")
