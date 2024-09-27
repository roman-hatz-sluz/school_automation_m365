const style = `<style>
    body {
        font-family: 'Roboto', sans-serif;
       font-size: 10px
    }
        * {
     font-size: 10px;}

    table {
        border-collapse: collapse;
        width: 100%;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin: 20px 0;
    }

    th,
    td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }

    th {
        background-color: #3f51b5;
        color: white;
        text-transform: uppercase;
    }

    tr:nth-child(even) {
        background-color: #f2f2f2;
    }

    tr:hover {
        background-color: #e0e0e0;
    }

    tr:empty {
        height: 20px;
        background-color: #f0f0f0;
    }

    tr:nth-child(6) {
        font-style: italic;
    }

    tr:nth-child(3) {
        font-weight: bold;
    }

    td,
    th {
        border: 1px solid #ddd;
    }

    td:last-child {
        color: #ff5252;
        /* For feedback column */
    }

    td {
        word-wrap: break-word;
        white-space: normal;
    }
</style>`;
module.exports = style;
