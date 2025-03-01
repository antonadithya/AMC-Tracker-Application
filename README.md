# AMC Tracker

AMC Tracker is an offline application designed for logging and inputting data related to printers, PCs, and UPS Annual Maintenance Contract (AMC) services. The application provides functionality to generate filtering reports and mark completed AMCs, ensuring seamless integration between the front-end and back-end using SQLite.

## Features

- Input and log AMC service data for printers, PCs, and UPS.
- Generate reports based on various filters such as time frame and completion status.
- Mark AMCs as completed.
- User-friendly interface built with React.
- Offline functionality using SQLite for data storage.

## Project Structure

```
amc-tracker
├── src
│   ├── index.html          # Main HTML document
│   ├── index.js            # Entry point for the React application
│   ├── App.jsx             # Main application component
│   ├── database.js         # SQLite database connection and operations
│   ├── components          # Contains reusable components
│   │   ├── ServiceForm.jsx # Form for inputting service data
│   │   └── ReportTable.jsx  # Table for displaying service data
│   └── styles              # CSS styles for the application
│       └── main.css        # Main stylesheet
├── electron.js             # Main entry point for the Electron application
├── package.json            # Project configuration and dependencies
└── README.md               # Documentation for the project
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd amc-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the application:
   ```
   npm start
   ```

## Usage

- Open the application to access the AMC Tracker interface.
- Use the Service Form to input new service data.
- Utilize the Report Table to view and filter existing service records.
- Mark AMCs as completed directly from the table.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the ISC License.