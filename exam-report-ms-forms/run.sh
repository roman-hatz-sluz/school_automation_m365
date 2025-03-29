#!/bin/bash

# Variables to change
#FOLDER="pruefung_m290_MMA22"
#EXCEL_SOURCE_FILE="ICT Modul 290 - Prüfung.xlsx"
#MAX_POINTS=42

#FOLDER="pruefung_m324_ims22d"
#EXCEL_SOURCE_FILE="ICT Modul 324 - Prüfung 1 Teil A.xlsx"
#MAX_POINTS=37

#FOLDER="pruefung_m290_MMA22"
#EXCEL_SOURCE_FILE="ICT Modul 290 - Prüfung.xlsx"
#MAX_POINTS=42

#FOLDER="pruefung2_m324_ims22d"
#EXCEL_SOURCE_FILE="M324 - 2024 - Prüfung 2 - Docker_CI.CD_Git.xlsx"
#MAX_POINTS=46

#FOLDER="pruefung2_m324_ims22d_nachhol"
#EXCEL_SOURCE_FILE="M324 - 2024 - Prüfung 2 Nachhol - Docker_CI.CD_Git.xlsx"
#MAX_POINTS=50

#FOLDER="pruefung1_m324_ina"
#EXCEL_SOURCE_FILE="M324 - INA - 2024 - Prüfung 1.xlsx"
#MAX_POINTS=74

FOLDER="pruefung1_m293_ina24"
EXCEL_SOURCE_FILE="M293 - Prüfung 1 - Web_HTML_CSS Grundlagen.xlsx"
MAX_POINTS=23


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

node $SCRIPT2 \
  --excel_source_path "$EXCEL_SOURCE_PATH" \
  --excel_source_file "$EXCEL_SOURCE_FILE" \
  --max_points $MAX_POINTS

# Remove all Excel files in the response folder
rm -rf ${RESPONSE_FOLDER}/*.xlsx
