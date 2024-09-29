const style = `<style>
body {
  padding: 24px;
  background-color: #f5f7fa;  
  font-family: "Roboto", sans-serif;
  line-height: 1.6;  
  color: #333;  
}

h2 {
  color: #2388c6;  
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

table {
  border-collapse: collapse;
  width: 100%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);  
  margin: 20px 0;
  background-color: white;
  border-radius: 8px;  
  overflow: hidden;
}

th,
td {
  padding: 16px;  
  text-align: left;
  border: 1px solid #ddd;
  font-size: 14px;  
}

th {
  background-color: #2388c6; 
  color: white;
  text-transform: uppercase;
  letter-spacing: 1px;  
  font-weight: 500;
}

/* Alternating Row Colors */
tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:nth-child(odd) {
  background-color: white;
}

/* Column Specific Styling */
td:last-child {
  color: #ff6b6b; /* Emphasize feedback column */
}

tr:nth-child(1) td,
tr:nth-child(3) td  {
  font-size: 18px !important;
}

tr:nth-child(1) td:last-child,
tr:nth-child(3) td:last-child {
  color: #2388c6; /* Use blue for results */
}

tr:nth-child(6) {
  font-style: italic;
}

/* Footer Styling */
.footer {
  text-align: center;
  padding: 16px;
  background-color: #f1f1f1;
  margin-top: 20px;
  font-size: 12px;
  color: #666;
}

.footer a {
  color: #2388c6; /* Use blue for links */
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

.td_green {
  color: #6bcf61;
}
.td_red {
  color: #ff6b6b;
}
.td_bold {
  font-weight: bold;
}

</style>`;
module.exports = style;
