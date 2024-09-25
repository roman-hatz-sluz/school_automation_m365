rm -f temp.json
node parseQuestions.js pruefung_m324_ims22d
node convertExcel.js --excel_source_path "./pruefung_m324_ims22d/" --excel_source_file  "M324_Test_1_.xlsx" --max_points 37

 