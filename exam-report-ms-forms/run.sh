#!/bin/bash

# Variables to change
#FOLDER="pruefung_m290_MMA22"
#EXCEL_SOURCE_FILE="ICT Modul 290 - Prüfung.xlsx"
#MAX_POINTS=42

#FOLDER="pruefung_m324_ims22d"
#EXCEL_SOURCE_FILE="ICT Modul 324 - Prüfung 1 Teil A.xlsx"
#MAX_POINTS=37

FOLDER="pruefung_m290_MMA22"
EXCEL_SOURCE_FILE="ICT Modul 290 - Prüfung.xlsx"
MAX_POINTS=42
# Variables
JSON_FILE="temp.json"
SCRIPT1="parseQuestions.js"
SCRIPT2="convertExcel.js"
EXCEL_SOURCE_PATH="./${FOLDER}/"
RESPONSE_FOLDER="${EXCEL_SOURCE_PATH}responses"

# Remove temp JSON file if it exists
rm -f $JSON_FILE

# Execute the first node script
node $SCRIPT1 $FOLDER

# Execute the second node script with arguments
node $SCRIPT2 --excel_source_path "$EXCEL_SOURCE_PATH" --excel_source_file "$EXCEL_SOURCE_FILE" --max_points $MAX_POINTS

# Remove all Excel files in the response folder
rm -rf ${RESPONSE_FOLDER}/*.xlsx
