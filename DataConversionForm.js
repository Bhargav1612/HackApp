import React, { useState } from 'react'; // Importing React and useState hook
import axios from 'axios'; // Importing Axios for HTTP requests
//import './AppAdvanced.css'; // Importing CSS file for styling

// Component for data conversion form
const DataConversionForm = () => {
  const [data, setData] = useState(''); // State for data input
  const [fileType, setFileType] = useState(''); // State for selected file type
  const [errorMessage, setErrorMessage] = useState(''); // State for error messages
  const fileInputRef = React.createRef(); // Reference to the file input element

  // Handler for data textarea change
  const handleDataChange = (e) => {
    const newData = e.target.value;
    setData(newData); // Update data state

    // Clear error message if JSON data is updated
    if (errorMessage && newData.trim() !== '') {
      try {
        JSON.parse(newData); // Try to parse the JSON
        setErrorMessage(''); // Clear error message if JSON is valid
      } catch (error) {
        // Do nothing if JSON is invalid
      }
    }
  };

  // Handler for file input change (upload JSON file)
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Get the uploaded file
    if (file && file.type === 'application/json') { // Validate if file is JSON
      const reader = new FileReader();
      reader.onload = (e) => {
        setData(e.target.result); // Update data state with file content
        setErrorMessage(''); // Clear error message
      };
      reader.readAsText(file); // Read file as text
    } else {
      setErrorMessage('Please upload a valid JSON file.'); // Display error message for invalid file type
    }
  };

  // Handler for file type select change
  const handleFileTypeChange = (e) => {
    setFileType(e.target.value); // Update fileType state
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Check for valid JSON format
    try {
      JSON.parse(data); // Try to parse the JSON
    } catch (error) {
      setErrorMessage('Invalid JSON format'); // Set error message if JSON is invalid
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/convert', {
        data,
        fileType,
      }, { responseType: 'blob' }); // Send POST request to backend API

      const blob = new Blob([response.data], { type: response.headers['content-type'] }); // Create Blob object from response data
      const url = URL.createObjectURL(blob); // Create URL for Blob object
      const link = document.createElement('a'); // Create <a> element
      link.href = url; // Set href attribute to URL
      link.download = `converted.${fileType === 'Excel' ? 'xlsx' : fileType.toLowerCase()}`; // Set download attribute based on fileType
      link.click(); // Programmatically click the link to trigger download

      // Clear file input and data after download
      setData(''); // Clear data state
      setFileType(''); // Clear fileType state
      fileInputRef.current.value = ''; // Clear file input value
      setErrorMessage(''); // Clear error message
    } catch (error) {
      console.error(error); // Log any errors to the console
      setErrorMessage('An error occurred during conversion.'); // Display error message for conversion error
    }
  };

  // JSX for rendering the data conversion form
  return (
    <div className="container">
      <h1>Hackathon</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="data">Data:</label>
          <textarea id="data" value={data} onChange={handleDataChange} /> {/* Textarea for entering data */}
        </div>
        <div className="form-group">
          <label htmlFor="file">Upload JSON File:</label>
          <input type="file" id="file" accept=".json" onChange={handleFileChange} ref={fileInputRef} /> {/* File input for uploading JSON file */}
        </div>
        <div className="form-group">
          <label htmlFor="fileType">File Type:</label>
          <select id="fileType" value={fileType} onChange={handleFileTypeChange}>
            <option value="">Select File Type</option>
            <option value="CSV">CSV</option>
            <option value="Excel">Excel</option>
            <option value="PDF">PDF</option>
            <option value="XML">XML</option>
            <option value="TXT">TXT</option>
          </select> {/* Dropdown for selecting output file type */}
        </div>
        <button type="submit" disabled={!data || !fileType}>Convert and Download</button> {/* Button to submit form */}
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message if any */}
    </div>
  );
};

export default DataConversionForm; // Export DataConversionForm component




