# Route Planner

## How to Run

### Backend (C++)
1. Open a **new** terminal and navigate to the `backend` folder.
2. run `.\build.bat` to compile if not compiled yet
3. Start the server by running `.\server.exe`
   - The server will run on `http://localhost:8080`. Keep this terminal open.

### Frontend (React/Vite)
1. Open a **new** terminal and navigate to the `frontend` folder.
2. Install the necessary packages by running: `npm install` (only needed the first time).
3. Start the web dashboard by running: `npm run dev`
4. Open the `localhost` URL provided in the terminal (usually `http://localhost:5173`) in your web browser.

## Requirements

### Backend Requirements
- **C++ Compiler**: GCC/MinGW or MSVC (with C++11 or higher)
- **Libraries**:
  - `httplib` (included in `include/`)
  - `nlohmann/json` (included in `include/`)
  - Standard C++ libraries

### Frontend Requirements
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **Browser**: Modern web browser (Chrome, Firefox, Safari, Edge)

### Data Requirements
- Shuttle data files (`.txt` format: `ID,DESTINATION,TIME`)
- Passenger data files (`.txt` format: `ID,DESTINATION,TIME`)
- Sample data files provided in `data/` folder