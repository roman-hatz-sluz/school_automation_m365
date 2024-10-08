import os
import subprocess
import time
import sys
from bs4 import BeautifulSoup


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
            send
        end tell
        activate
    end tell
    """
    subprocess.run(["osascript", "-e", applescript])


def process_html_files_in_directory(directory_path, draft_mode=True):
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
                6.00: "Sehr Gut - Fantastische Arbeit! 😃🌟👏",
                5.75: "Hervorragend - Unglaublich gut gemacht! Ihre Leistung ist beeindruckend! 👍🤩",
                5.50: "Hervorragend - Bemerkenswert! Sie zeigen grosses Potenzial! 👌😀",
                5.25: "Gut bis sehr gut - Wirklich toll gemacht! 🚀😎",
                5.00: "Gut - Tolle Arbeit! 👏😊",
                4.75: "Okay bis gut - Gute Arbeit! Bleiben Sie dran und Sie werden noch besser! 👍👨‍🏫",
                4.50: "Okay - Geschafft, aber mehr ist immer besser! Sie können noch mehr erreichen! 😅📚",
                4.25: "Genügend - Solide Leistung, aber da geht noch mehr 🤔✅",
                4.00: "Genügend - Sie haben es geschafft, aber da geht noch mehr 😐📖",
                3.75: "Ungenügend - Nahe dran, nicht ganz auf der Ziellinie 😕❌",
                3.50: "Ungenügend - Das geht besser! 😟❌",
                3.25: "Schwach - Sie haben das Potenzial, sich zu steigern! 😞❌",
                3.00: "Schwach - Da geht noch mehr! 😔❌",
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

            print(f"{name} ({email_address}), Note:  {grade}, Text: {description}")

            if draft_mode:
                create_draft_with_attachment(
                    "Prüfung M324 - Resultat",
                    email_address,
                    f"{name} | Note {grade} | {description}",
                    file_path,
                )
            else:
                create_and_send_email(
                    "Prüfung M324 - Resultat",
                    email_address,
                    f"{name} | Note {grade} | {description}",
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


# in mail app: login to account
# python3 send_mails.py /path/to/html/folder send
# draft mode: python3 send_mails.py /path/to/html/folder
