#!/bin/bash

# Variables
JSON_FILE="temp.json"
SCRIPT1="parseQuestions.js"
SCRIPT2="convertExcel.js"
FOLDER="pruefung_m324_ims22d"
EXCEL_SOURCE_FILE="M324_Test_1_.xlsx"
MAX_POINTS=37
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
