node parseQuestions.js pruefung_m324_ims22d > temp.json
python3  convertExcel.py --excel_source_path "./pruefung_m324_ims22d/" --excel_source_file  "M324_Test_1_.xlsx" --max_points 37 
#rm temp.json
 