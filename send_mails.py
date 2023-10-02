import os
import openpyxl
import subprocess
import art
import time


def create_draft_with_attachment(subject, recipient, content, attachment_path):
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


def process_excel_files_in_directory(directory_path):
    for filename in os.listdir(directory_path):
        if filename.endswith(".xlsx") or filename.endswith(".xls"):
            file_path = os.path.join(directory_path, filename)

            # Open the Excel file and get the email address
            workbook = openpyxl.load_workbook(file_path)
            sheet = workbook.active
            email_address = sheet.cell(row=1, column=2).value
            name = sheet.cell(row=2, column=2).value

            create_and_send_email(
                "Prüfung M290 - Resultat",
                email_address,
                name,
                file_path,
            )
            time.sleep(1)


# Navigate to the "Results" directory and process the Excel files
results_directory = os.path.join(os.getcwd(), "Results")
process_excel_files_in_directory(results_directory)
