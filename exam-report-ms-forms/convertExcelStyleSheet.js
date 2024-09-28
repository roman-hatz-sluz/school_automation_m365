const style = `<style>
  /* General Body Styling */
/* General Body Styling */
body {
    padding: 24px;
    background-color: #f5f7fa; /* Softer, neutral background */
    font-family: 'Roboto', sans-serif;
    line-height: 1.6; /* Improved line spacing for readability */
    color: #333; /* Darker text for better contrast */
}

/* Headings */
h2 {
    color: #2388C6; /* Use blue for headings */
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
}

/* Table Styling */
table {
    border-collapse: collapse;
    width: 100%;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* Softer shadow for a cleaner look */
    margin: 20px 0;
    background-color: white;
    border-radius: 8px; /* Adds rounded corners to the table */
    overflow: hidden;
}

/* Header and Cell Styling */
th,
td {
    padding: 16px; /* Increased padding for better spacing */
    text-align: left;
    border: 1px solid #ddd;
    font-size: 14px; /* Slightly larger font for better readability */
}

/* Header Specific Styling */
th {
    background-color: #2388C6; /* Use blue for table headers */
    color: white;
    text-transform: uppercase;
    letter-spacing: 1px; /* Slight spacing for more elegant look */
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

th:last-child,
tr:nth-child(1) td:last-child,
tr:nth-child(3) td:last-child {
    color: #2388C6; /* Use blue for results */
}

tr:nth-child(6)   {
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

/* Links in Footer */
.footer a {
    color: #2388C6; /* Use blue for links */
    text-decoration: none;
}

.footer a:hover {
    text-decoration: underline;
}

</style>`;
module.exports = style;
