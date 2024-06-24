// npm install axios json2csv pdfkit pdfkit-table react-scripts xlsx xml2js
const express = require('express'); // Import Express framework
const app = express(); // Create an instance of an Express application
const fs = require('fs'); // Import filesystem module
const csv = require('json2csv'); // Import json2csv module for CSV conversion
const xlsx = require('xlsx'); // Import xlsx module for Excel conversion
const { jsPDF } = require('jspdf'); // Import jsPDF for PDF generation
const bodyParser = require('body-parser'); // Import body-parser for parsing JSON request bodies

app.use(bodyParser.json()); // Middleware to parse JSON bodies

// Endpoint to handle data conversion
app.post('/api/convert', (req, res) => {
  const { data, fileType } = req.body; // Destructure data and fileType from request body

  // Validate input
  if (!data || !fileType) {
    return res.status(400).json({ error: 'Data and fileType are required' });
  }

  let convertedData;

  try {
    // Convert data based on fileType
    if (fileType === 'CSV') {
      const jsonData = JSON.parse(data); // Parse JSON data
      const fields = Object.keys(jsonData[0]); // Get keys for CSV fields
      convertedData = csv.parse(jsonData, { fields }); // Convert JSON to CSV
    } else if (fileType === 'Excel') {
      const jsonData = JSON.parse(data); // Parse JSON data
      const worksheet = xlsx.utils.json_to_sheet(jsonData); // Convert JSON to Excel worksheet
      const workbook = xlsx.utils.book_new(); // Create a new workbook
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1'); // Append worksheet to workbook
      convertedData = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' }); // Write workbook to buffer
    } else if (fileType === 'PDF') {
      const jsonData = JSON.parse(data); // Parse JSON data
      const doc = new jsPDF(); // Create a new jsPDF document
      const tableColumn = Object.keys(jsonData[0]); // Get keys for table columns
      const tableRows = jsonData.map(item => Object.values(item)); // Get values for table rows

      // Add table to PDF with custom styles
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        styles: {
          cellPadding: 3,
          fontSize: 10,
          halign: 'center',
          valign: 'middle',
          lineColor: [44, 62, 80],
          lineWidth: 0.1,
          textColor: [0, 0, 0],
          fillColor: [255, 255, 255],
          tableLineColor: [0, 0, 0],
          tableLineWidth: 0.15
        },
        headStyles: {
          fillColor: [44, 62, 80],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        }
      });

      convertedData = doc.output('arraybuffer'); // Get the PDF as an array buffer
    } else if (fileType === 'XML') {
      const jsonData = JSON.parse(data); // Parse JSON data
      const xml = json2xml(jsonData); // Convert JSON to XML (assuming you have a function to do this)
      convertedData = Buffer.from(xml); // Convert XML to Buffer
    } else if (fileType === 'TXT') {
      const jsonData = JSON.parse(data); // Parse JSON data
      convertedData = Buffer.from(JSON.stringify(jsonData, null, 2)); // Convert JSON to pretty-printed text
    } else {
      return res.status(400).json({ error: 'Invalid fileType' });
    }

    // Set appropriate Content-Type header
    let contentType;
    if (fileType === 'CSV') {
      contentType = 'text/csv';
    } else if (fileType === 'Excel') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (fileType === 'PDF') {
      contentType = 'application/pdf';
    } else if (fileType === 'XML') {
      contentType = 'application/xml';
    } else if (fileType === 'TXT') {
      contentType = 'text/plain';
    }

    // Set Content-Disposition header for file download
    res.set('Content-Type', contentType);
    res.set('Content-Disposition', `attachment; filename="converted.${fileType === 'Excel' ? 'xlsx' : fileType.toLowerCase()}"`);

    // Send the converted data as the response
    res.send(convertedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred during conversion' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000'); // Log server start message
});
