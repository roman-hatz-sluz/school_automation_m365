# COMMAND: python3 send_mails.py ./pruefung_test/responses

# in mail app: login to account
# send manually in mail app. problem: auto send mode does not work: attachment is missing. 

import os
import subprocess
import time
import sys
from bs4 import BeautifulSoup

examTitle="Modul M324 - DevOps - Prüfung 1 - 2024"

def create_draft_with_attachment(subject, recipient, content, attachment_path):
    attachment_path = os.path.abspath(attachment_path)
    applescript = f"""
    tell application "Mail"
        set newMessage to make new outgoing message with properties {{subject:"{subject}", content:"{content}"}}
        tell newMessage
            make new to recipient at end of to recipients with properties {{address:"{recipient}"}}
            set theAttachment to POSIX file "{attachment_path}"
            make new attachment with properties {{file name:theAttachment}} at after the last paragraph
        end tell
        activate
    end tell
    """
    subprocess.run(["osascript", "-e", applescript])


def create_and_send_email(subject, recipient, content, attachment_path):
    applescript = f"""
    tell application "Mail"
        set newMessage to make new outgoing message with properties {{subject:"{subject}", content:"{content}"}}
        tell newMessage
            make new to recipient at end of to recipients with properties {{address:"{recipient}"}}
            set theAttachment to POSIX file "{attachment_path}"
            make new attachment with properties {{file name:theAttachment}} at after the last paragraph
             
        end tell
        
        activate
    end tell
    """
    subprocess.run(["osascript", "-e", applescript])

def check_directory(directory_path):
    files = os.listdir(directory_path)
    if not files:
        return "The directory is empty."
    html_files = [file for file in files if file.endswith(".html")]
    if not html_files:
        return False
    return True


def process_html_files_in_directory(directory_path, draft_mode=True):
    if not check_directory(directory_path):
        print("No html files found")
        return False
    for filename in os.listdir(directory_path):
        if filename.endswith(".html"):
            file_path = os.path.join(directory_path, filename)

            # Open and parse the HTML file
            with open(file_path, 'r', encoding='utf-8') as file:
                soup = BeautifulSoup(file, 'html.parser')
                
                # Extract email
                email_element = soup.find(attrs={"data-email": True})
                email_address = email_element['data-email'] if email_element else "Unknown Email"
                
                # Extract name
                name_element = soup.find(attrs={"data-name": True})
                name = name_element['data-name'] if name_element else "Unknown Name"
                
                # Extract grade
                grade_element = soup.find(attrs={"data-grade": True})
                grade = float(grade_element['data-grade']) if grade_element else 0

            # Round the grade to the nearest 0.25
            rounded_grade = round(grade * 4) / 4

            # Define a dictionary for entertaining grade descriptions in German
            grade_descriptions = {
                6.00: "Sehr gut - „Programs must be written for people to read, and only incidentally for machines to execute.“ – Harold Abelson 💻🚀",
                5.75: "Hervorragend - „The best way to predict the future is to invent it.“ – Alan Kay 🔮⚙️",
                5.50: "Hervorragend - „Simplicity is the soul of efficiency.“ – Austin Freeman 🧠💡",
                5.25: "Gut bis sehr gut - „Progress is made by lazy people looking for easier ways to do things.“ – Robert A. Heinlein 🖥️👌",
                5.00: "Gut - „Talk is cheap. Show me the code.“ – Linus Torvalds 💾👍",
                4.75: "Okay bis gut - „If debugging is the process of removing bugs, then programming must be the process of putting them in.“ – Edsger Dijkstra 🔧🛠️",
                4.50: "Okay - „The computer was born to solve problems that did not exist before.“ – Bill Gates 🛠️⌛",
                4.25: "Genügend - „Bad code can always be improved. No code lives forever.“ – Bjarne Stroustrup 🧐✅",
                4.00: "Genügend - „It’s not that we use technology, we live technology.“ – Godfrey Reggio 🐞🚧",
                3.75: "Ungenügend - „In theory, there is no difference between theory and practice. In practice, there is.“ – Yogi Berra 🛑❌",
                3.50: "Ungenügend - „Errors should never pass silently. Unless explicitly silenced.“ – Zen of Python 🐛🔍",
                3.25: "Schwach - „Programs are meant to be read by humans and only incidentally for computers to execute.“ – Harold Abelson 😓❌",
                3.00: "Schwach - „The only way to go fast is to go well.“ – Robert C. Martin 💥❌",
            }

            # Check if the rounded grade is below 3
            if rounded_grade < 3:
                description = "Unglaublich schlecht - Das war nichts, aber beim nächsten Mal klappt's!"
            elif rounded_grade >= 3 and rounded_grade <= 6:
                description = grade_descriptions.get(
                    rounded_grade, "Ungültige Note - Hier stimmt etwas nicht."
                )
            else:
                description = "Ungültige Note - Hier stimmt etwas nicht."

            #print(f"{name} ({email_address}), Note:  {grade}, Text: {description}")
            message = (
                f"Ihre Resultate für: {examTitle}\n"
                f"Name: {name}\n"
                f"Note: {grade}\n"
                f"Feedback: {description}\n\n"
                "Im Anhang finden Sie eine HTML-Datei mit den detaillierten Ergebnissen.\n"
                "Bitte überprüfen Sie ihre Note in SchulNetz.\n\n"
                "Mit freundlichen Grüssen,\n Roman Hatz"
            )

            if draft_mode:
                create_draft_with_attachment(
                    f"{examTitle} - {name}",
                    email_address,
                    message,
                    file_path,
                )
            else:
                create_and_send_email(
                    f"{examTitle} - {name}",
                    email_address,
                    message,
                    file_path,
                )
            time.sleep(2)


if __name__ == "__main__":
    # Get command-line arguments
    if len(sys.argv) < 2:
        print("Usage: script.py <folder_path> [send]")
        sys.exit(1)

    folder_path = sys.argv[1]
    draft_mode = True  # default to draft mode

    # Check if 'send' argument is passed
    if len(sys.argv) > 2 and sys.argv[2] == "send":
        draft_mode = False

    process_html_files_in_directory(folder_path, draft_mode)


