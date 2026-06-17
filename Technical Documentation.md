# Route Planner Project technical documentation

## Project Overview

The Route Planner is a full-stack application designed to match driverless shuttle vehicles with passengers based on their destination and departure time. The system reads shuttle and passenger data from files, matches them algorithmically, and displays the results through a web-based dashboard :/

## Core Requirements

### Backend (C++)
- Create objects of different classes in the same application
- Allow objects to communicate with each othera
- Create more complex classes from existing ones
- Extend definition of existing classes
- Override methods (inheritance, polymorphism)
- HTTP server for frontend communication
- Match shuttles to passengers based on destination and time

### Frontend (React/Vite)
- Start page for file upload (shuttle and passenger data)
- Main dashboard with top bar and sidebar
- Map view showing assigned routes
- Table view with filtering and sorting
- Admin panel for add/edit/delete operations
- Search functionality
- Export matched data

### Data Format (.txt files)
- **Shuttle files**: `ID,DESTINATION,TIME` (e.g., `s04,Cinema,14:30`)
- **Passenger files**: `ID,DESTINATION,TIME` (e.g., `p01,Mall,09:15`)

---

## Object-Oriented Programming (OOP) Principles 

**demonstrating 4 poillars of oop**

### 1. **Encapsulation**

Encapsulation is the bundling of data (attributes) and methods (functions) within a class, with controlled access through visibility modifiers.

**Examples in this project:**

- **Entity Class**: Contains private member variables (`ID`, `Destination`, `Time`) with public getter methods:
  ```cpp
  private:
      std::string ID;
      std::string Destination;
      std::string Time;
  public:
      std::string getID() const;
      std::string getDestination() const;
      std::string getTime() const;
  ```
  This prevents direct modification of data while providing controlled read-only access.

- **Shuttle Class**: Encapsulates the `isOccupied` boolean with a getter and setter:
  ```cpp
  private:
      bool isOccupied;
  public:
      bool getIsOccupied() const;
      void setOccupied(bool status);
  ```

- **Passenger Class**: Similarly encapsulates `isMatched` status:
  ```cpp
  private:
      bool isMatched;
  public:
      bool getIsMatched() const;
      void setMatched(bool match);
  ```

- **PassengerList & ShuttleList Classes**: Encapsulate the vectors of objects and provide methods for manipulation (add, delete, edit):
  ```cpp
  private:
      std::vector<Passenger> totalPassengers;
  public:
      void addPassenger(const Passenger& newPassenger);
      void deletePassenger(int index);
      void editPassenger(const Passenger& updatePassenger);
  ```

### 2. **Inheritance**

Inheritance allows a class to inherit properties and methods from a parent class, promoting code reuse.

**Examples in this project:**

- **Shuttle and Passenger inherit from Entity**:
  ```cpp
  class Shuttle : public Entity { ... }
  class Passenger : public Entity { ... }
  ```
  Both `Shuttle` and `Passenger` classes inherit the three core properties (ID, Destination, Time) from `Entity`, avoiding code duplication and establishing a "IS-A" relationship:
  - A Shuttle IS-A Entity
  - A Passenger IS-A Entity

### 3. **Polymorphism**

Polymorphism allows objects to be used interchangeably through a common interface, enabling flexible and extensible designs.

**Examples in this project:**

- **Virtual Method Override**: The `Entity` class defines a pure virtual method `getDetails()`:
  ```cpp
  class Entity {
  public:
      virtual std::string getDetails() = 0;
  };
  ```

  Both `Shuttle` and `Passenger` override this method with their own implementations:
  ```cpp
  //In Shuttle class
  std::string Shuttle::getDetails() {
      return "Shuttle [ID: " + getID() + ", Dest: " + getDestination() + ", Time: " + getTime() + "]";
  }

  //In Passenger class
  std::string Passenger::getDetails() {
      return "Passenger [ID: " + getID() + ", Dest: " + getDestination() + ", Time: " + getTime() + "]";
  }
  ```

  This allows the `RoutePlanner` to call `getDetails()` on any Entity-derived object without knowing its exact type, and it will execute the correct method.

### 4. **Abstraction**

Abstraction hides complex implementation details and exposes only the necessary interface to the user.

**Examples in this project:**

- **Entity Class as Abstract Base**: The `Entity` class defines a contract that all transportation entities must fulfill (getDetails method) without specifying how:
  ```cpp
  class Entity {
  public:
      virtual std::string getDetails() = 0;  //derived classes must implement ts
  };
  ```

- **RoutePlanner Service**: The matching algorithm is abstracted into a `generateMatches()` method:
  ```cpp
  void RoutePlanner::generateMatches(std::vector<Shuttle>& shuttles, std::vector<Passenger>& passengers);
  ```
  The UI doesn't need to know how the matching algorithm works; it just calls this method and gets the result.

- **UI Serialization**: The `serializeState()` method abstracts the conversion of internal objects to JSON:
  ```cpp
  json UI::serializeState();
  ```
  The frontend donnid to know about C++ objects, it receives clean JSON data.

### Summary of OOP Concepts

| Concept | Implementation | Benefit |
| **Encapsulation** | Private attributes with public getters/setters | Data protection and controlled access |
| **Inheritance** | Shuttle and Passenger extend Entity | Code reuse, common interface |
| **Polymorphism** | Virtual getDetails() method override | Flexible type handling |
| **Abstraction** | Entity abstract class, RoutePlanner service | Hides complexity, focuses on contracts |
| **Composition** | UI contains ShuttleList, PassengerList, RoutePlanner | Flexible object combination |
| **Aggregation** | Schedule contains Shuttle and Passenger | Creates meaningful relationships |

---

## Class Relationships and Architecture

### Class Hierarchy Diagram 

```
                    Entity (Abstract Base Class)
                   /        \
                  /          \
            Shuttle          Passenger
              |                 |
              |                 |
        ShuttleList      PassengerList       <- might be wrong
              \                 /
               \               /
                \             /
                 \           /
                  \         /
                   \       /
                   Schedule
                      |
                      |
                RoutePlanner
                      |
                      |
                     UI
```

### Class Descriptions and Relationships (.h files)

#### **1. Entity (Abstract Base Class)**
- **Purpose**: Defines the common interface for all transportation entities
- **Attributes**:
  - `ID` (string): Unique identifier
  - `Destination` (string): Target location
  - `Time` (string): Departure time in HH:MM format
- **Methods**:
  - `getDetails()`: Pure virtual method (must be overridden)
  - Getters for ID, Destination, Time
- **Relationships**: Parent class for Shuttle and Passenger

#### **2. Shuttle (inherits from Entity)**
- **Purpose**: Represents a driverless shuttle vehicle
- **Additional Attributes**:
  - `isOccupied` (bool): Whether the shuttle has assigned passengers
- **Key Methods**:
  - `getDetails()`: Returns shuttle information formatted as a string
  - `getIsOccupied()`: Check if shuttle is in use
  - `setOccupied()`: Mark shuttle as occupied or available
- **Relationships**: 
  - Inherits from Entity
  - Used by ShuttleList (composition)
  - Used by Schedule (composition)
  - Used by RoutePlanner (reference)

#### **3. Passenger (inherits from Entity)**
- **Purpose**: Represents a passenger requesting a ride
- **Additional Attributes**:
  - `isMatched` (bool): Whether the passenger has been assigned a shuttle
- **Key Methods**:
  - `getDetails()`: Returns passenger information formatted as a string
  - `getIsMatched()`: Check if passenger is assigned
  - `setMatched()`: Mark passenger as matched or unmatched
- **Relationships**:
  - Inherits from Entity
  - Used by PassengerList (composition)
  - Used by Schedule (composition)
  - Used by RoutePlanner (reference)

#### **4. Schedule**
- **Purpose**: Represents a matched pairing of a Shuttle and Passenger
- **Attributes**:
  - `shuttle` (Shuttle): The assigned shuttle
  - `passenger` (Passenger): The assigned passenger
- **Key Methods**:
  - `isCompatible()`: Checks if shuttle and passenger have the same destination and time
  - `getCopyShuttle()`: Returns a copy of the shuttle
  - `getCopyPassenger()`: Returns a copy of the passenger
- **Relationships**:
  - Aggregates (contains) Shuttle and Passenger
  - Used by RoutePlanner (composition)
  - Links Shuttle and Passenger together

#### **5. ShuttleList**
- **Purpose**: Manages a collection of shuttles
- **Attributes**:
  - `totalShuttle` (vector<Shuttle>): Dynamic array of shuttles
- **Key Methods**:
  - `addShuttle()`: Add a new shuttle
  - `deleteShuttle()`: Remove a shuttle by index
  - `editShuttle()`: Update a shuttle's properties
  - `getCopyShuttle()`: Get a copy of shuttle at index
  - `getSize()`: Return number of shuttles
  - `getRawList()`: Get reference to the vector (for modifications)
- **Relationships**:
  - Aggregates Shuttle objects (composition)
  - Used by UI class (composition)
  - Manages the collection of available shuttles

#### **6. PassengerList**
- **Purpose**: Manages a collection of passengers
- **Attributes**:
  - `totalPassengers` (vector<Passenger>): Dynamic array of passengers
- **Key Methods**:
  - `addPassenger()`: Add a new passenger
  - `deletePassenger()`: Remove a passenger by index
  - `editPassenger()`: Update a passenger's properties
  - `getCopyPassenger()`: Get a copy of passenger at index
  - `getSize()`: Return number of passengers
  - `getRawList()`: Get reference to the vector (for modifications)
- **Relationships**:
  - Aggregates Passenger objects (composition)
  - Used by UI class (composition)
  - Manages the collection of all passengers

#### **7. RoutePlanner (Service Class)**
- **Purpose**: Core business logic for matching shuttles to passengers
- **Attributes**:
  - `activeSchedule` (vector<Schedule>): Collection of matched pairings
- **Key Methods**:
  - `generateMatches()`: Matches unmatched passengers to available shuttles based on destination and time
  - `getCopySchedule()`: Get a copy of a schedule
  - `getSize()`: Return number of matches
  - `saveSchedule()`: Persist matches to file
  - `getActiveSchedule()`: Get all current matches
  - `clearSchedule()`: Reset all matches
- **Relationships**:
  - Uses ShuttleList (via references passed in)
  - Uses PassengerList (via references passed in)
  - Contains Schedule objects (composition)
  - Used by UI class (composition)

#### **8. UI (Application Controller)**
- **Purpose**: HTTP server interface bridging backend logic and frontend
- **Attributes**:
  - `mainShuttleList` (ShuttleList): All loaded shuttles
  - `mainPassengerList` (PassengerList): All loaded passengers
  - `plan` (RoutePlanner): Matching engine
- **HTTP Endpoints**:
  - `GET /state`: Returns current state as JSON
  - `POST /upload`: Upload new shuttles and passengers
  - `POST /assign`: Run matching algorithm
  - `POST /add`: Add new entity
  - `POST /edit`: Modify existing entity
  - `POST /delete`: Remove entity
  - `POST /export`: Export matches to file
- **Key Methods**:
  - `serializeState()`: Convert internal objects to JSON
  - `setCorsHeaders()`: Enable CORS for frontend access
  - `displaySchedule()`: Console output (optional)
  - `main()`: Start HTTP server and listen for requests
- **Relationships**:
  - Contains ShuttleList (composition)
  - Contains PassengerList (composition)
  - Contains RoutePlanner (composition)
  - Central orchestrator of all other classes

---

## .cpp files and roles 
### `backend/src/main.cpp` (line 6)
- This is the program entry point.
- It creates the `UI` object and starts the backend server by calling `ui.main()`.
- In simple terms: this file starts the backend application.

### `backend/src/ui/UI.cpp`
- This file handles the server and the communication channels.
- It defines the web endpoints the frontend can call:
  - `GET /state` (`UI.cpp` line 74)
  - `POST /upload` (`UI.cpp` line 80)
  - `POST /assign` (`UI.cpp` line 112)
  - `POST /add` (`UI.cpp` line 127)
  - `POST /edit` (`UI.cpp` line 164)
  - `POST /delete` (`UI.cpp` line 205)
  - `POST /export` (`UI.cpp` line 247)
- It also controls the main shuttle and passenger lists, and the `RoutePlanner` object that does matching.
- Key job: receive requests, update data, and send back the current data as JSON.

### `backend/src/services/RoutePlanner.cpp`
- This file contains the matching logic (`RoutePlanner.cpp` line 5).
- It looks at all shuttles and passengers and pairs them when they have the same destination and time.
- It remembers matches in a list called `activeSchedule`.
- It also lets the rest of the program ask for schedule details or clear the matched list.

### `backend/src/models/Entity.cpp`
- This is a shared base model used by both shuttle and passenger.
- It stores data fields that both shuttles and passengers share, such as `id`, `destination`, and `time`.

### `backend/src/models/Shuttle.cpp`
- This is the shuttle model.
- It stores shuttle details and whether the shuttle is currently occupied.
- It also provides helper methods like `getIsOccupied()` and `setOccupied()`.

### `backend/src/models/Passenger.cpp`
- This is the passenger model.
- It stores passenger details and whether the passenger is already matched.
- It has helpers like `getIsMatched()` and `setMatched()`.

### `backend/src/models/Schedule.cpp`
- This file stores a shuttle-passenger match.
- It keeps one shuttle and one passenger together as a pair.
- It is used when a match is created by the route planner.

### `backend/src/models/ShuttleList.cpp`
- A container for many `Shuttle` objects.
- Lets the backend add, delete, edit, and count shuttles.

### `backend/src/models/PassengerList.cpp`
- A container for many `Passenger` objects.
- Lets the backend add, delete, edit, and count passengers.

---

## Data Flow and Interaction (HTTP endpoints summary)

### 1. **Application Startup**
- `main()` creates a UI instance
- UI creates empty ShuttleList, PassengerList, and RoutePlanner
- HTTP server starts listening on port 8080

### 2. **File Upload (Frontend → Backend)**
- Frontend parses CSV files from user
- Sends JSON with arrays of shuttles and passengers to `/upload`
- UI receives data and populates ShuttleList and PassengerList

### 3. **Route Assignment**
- Frontend calls `/assign` endpoint
- RoutePlanner.generateMatches() runs:
  - Iterates through each unmatched Passenger
  - For each Passenger, finds a matching Shuttle with same destination and time
  - Creates Schedule objects linking matched pairs
  - Updates isOccupied and isMatched flags
- UI serializes matches and returns to frontend

### 4. **CRUD Operations**
- Frontend sends add/edit/delete requests to respective endpoints
- UI modifies ShuttleList or PassengerList
- Matches are recalculated
- Updated state is serialized and returned

### 5. **Export**
- Frontend requests `/export` endpoint
- UI iterates through active Schedule objects
- Writes formatted results to `data/matched.txt`

---

## Backend, API, Frontend communications (in dept explanation ok)

The frontend sends and receives information from the backend using web requests. The backend responds with JSON data that the frontend uses to update the screen.

### 1. Upload data
- Frontend file: `frontend/src/components/StartPage.jsx` (line 35 and 51).
- Action: user selects shuttle and passenger files and clicks **Start Planning**.
- What happens in code:
  - `parseCSV()` reads the text files and converts them into lists of objects.
  - The frontend sends this data to the backend with:

```js
await fetch('http://localhost:8080/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ shuttles, passengers })
});
```

- Backend handler in `backend/src/ui/UI.cpp` (line 80):
  - clears old data
  - loads the new shuttle and passenger lists
  - responds with the current state

### 2. Get current state
- Frontend code in `frontend/src/components/Dashboard.jsx` calls (line 63):

```js
const res = await fetch('http://localhost:8080/state');
const newState = await res.json();
setData(newState);
```

- Backend handler in `backend/src/ui/UI.cpp` (line 74) returns the current list of shuttles and unassigned passengers.
- This allows the page to show the latest updates without changing anything.

### 3. Assign routes
- When the user clicks **Assign Routes** in the dashboard (frontend file `Dashboard.jsx`, line 69):

```js
const res = await fetch('http://localhost:8080/assign', { method: 'POST' });
```

- Backend handler in `backend/src/ui/UI.cpp` (line 112) does:
  - reset all shuttle and passenger match flags
  - call `plan.generateMatches(...)`
  - return the updated state

- `RoutePlanner::generateMatches()` in `backend/src/services/RoutePlanner.cpp` (line 5) checks every passenger and shuttle and pairs them when they match.

### 4. Export matched data
- Frontend button uses `Dashboard.jsx` (line 75):

```js
const res = await fetch('http://localhost:8080/export', { method: 'POST' });
```

- Backend handler in `backend/src/ui/UI.cpp` (line 247) writes the matched list into `data/matched.txt`.
- The frontend shows a message when this succeeds.

### 5. Add, edit, and delete shuttles or passengers
- Dashboard sends requests to one of these endpoints:
  - `POST /add`
  - `POST /edit`
  - `POST /delete`
- The payload includes:
  - `type`: either `shuttle` or `passenger`
  - `id`, `destination`, `time`

Example code in `Dashboard.jsx` (line 89 and 129):

```js
const endpoint = `http://localhost:8080/${adminMode}`;
const payload = { type: adminEntityType, ...formData };
await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```

- Backend handler updates the correct list and returns the current state:
  - `/add` in `backend/src/ui/UI.cpp` (line 127)
  - `/edit` in `backend/src/ui/UI.cpp` (line 164)
  - `/delete` in `backend/src/ui/UI.cpp` (line 205)
- The frontend uses the response to show the updated data immediately.

---

## Action journeys (even more indept ya?)
These journeys show what happens step-by-step when the user clicks buttons or submits forms.

### Upload data journey
1. User clicks **Start Planning** on `frontend/src/components/StartPage.jsx` (line 35).
2. `handleSubmit()` reads shuttle and passenger files with `parseCSV()`.
3. The frontend sends a request to the backend at `http://localhost:8080/upload` using `fetch()` on `StartPage.jsx` (line 51).
4. The backend receives the request in `backend/src/ui/UI.cpp` at line 80.
5. `UI.cpp` clears old data, loads new shuttles and passengers, and sends the current state back with `serializeState()`.
6. The frontend receives the JSON response, converts it into JavaScript data, and moves to the dashboard screen.

### Get current state journey
1. The frontend calls `fetch('http://localhost:8080/state')` in `frontend/src/components/Dashboard.jsx` (line 63).
2. The backend receives the request in `backend/src/ui/UI.cpp` at line 74.
3. `UI.cpp` returns the current shuttle and passenger state as JSON.
4. The frontend updates the dashboard display using `setData(newState)`.

### Assign routes journey
1. User clicks **Assign Routes** in `frontend/src/components/Dashboard.jsx` (button at line 351).
2. This triggers `handleAssignRoutes()` in `Dashboard.jsx` (line 69).
3. The frontend sends a `POST` request to `http://localhost:8080/assign` in `Dashboard.jsx` (line 70).
4. The backend receives the request in `backend/src/ui/UI.cpp` at line 112.
5. `UI.cpp` clears previous matches and calls `plan.generateMatches(...)`.
6. The `RoutePlanner::generateMatches()` function in `backend/src/services/RoutePlanner.cpp` (line 5) does the matching.
7. The backend returns the updated state, and the frontend shows the new assignments.

### Export matched data journey
1. User clicks **Export Data** in `frontend/src/components/Dashboard.jsx` (button at line 354).
2. This triggers `handleExport()` in `Dashboard.jsx` (line 75).
3. The frontend sends a `POST` request to `http://localhost:8080/export` in `Dashboard.jsx` (line 77).
4. The backend receives the request in `backend/src/ui/UI.cpp` at line 247.
5. `UI.cpp` writes the matched schedule to `data/matched.txt`.
6. The frontend shows success or failure to the user.

### Add/edit/delete journey
1. User clicks the `Add`, `Edit`, or `Delete` button in `frontend/src/components/Dashboard.jsx` (lines 352-354).
2. The dashboard opens a form and the user fills in `id`, `destination`, and `time`.
3. On form submission, `handleAdminSubmit()` runs in `Dashboard.jsx` (line 89).
4. It builds the request URL and data body at `Dashboard.jsx` (line 129):

```js
const endpoint = `http://localhost:8080/${adminMode}`;
const payload = { type: adminEntityType, ...formData };
```

5. The backend receives the request at:
  - `/add` in `backend/src/ui/UI.cpp` (line 127)
  - `/edit` in `backend/src/ui/UI.cpp` (line 164)
  - `/delete` in `backend/src/ui/UI.cpp` (line 205)
6. The backend updates the shuttle or passenger list and clears old route matches.
7. It returns the new state as JSON.
8. The frontend updates the dashboard and shows the result immediately.

---

## What the backend returns

When the backend sends data back to the frontend, it usually? sends an object like this:

- `shuttles`: a list of shuttles, each with assigned passengers
- `unassigned_passengers`: passengers who were not matched

This is how the frontend knows which shuttles have passengers and which passengers are still waiting.

---

## Data formats used in requests

### Upload request
- Sent from `frontend/src/components/StartPage.jsx` (line 51).
- Body format:

```json
{
  "shuttles": [
    { "id": "s01", "destination": "Mall", "time": "08:00" }
  ],
  "passengers": [
    { "id": "p01", "destination": "Mall", "time": "08:00" }
  ]
}
```

- Backend handler: `backend/src/ui/UI.cpp` (line 80).
- Response: the full current state with `shuttles` and `unassigned_passengers`.

### State request
- Sent from `frontend/src/components/Dashboard.jsx` (line 63).
- This request has no body.
- Backend handler: `backend/src/ui/UI.cpp` (line 74).
- Response: current state JSON with the same fields used by the app.

### Assign request
- Sent from `frontend/src/components/Dashboard.jsx` (line 70).
- This request has no body.
- Backend handler: `backend/src/ui/UI.cpp` (line 112).
- Response: updated state JSON after matching shuttles and passengers.

### Export request
- Sent from `frontend/src/components/Dashboard.jsx` (line 77).
- This request has no body.
- Backend handler: `backend/src/ui/UI.cpp` (line 247).
- Response: a small success or error message, not the full state.

### Add / edit / delete requests
- Sent from `frontend/src/components/Dashboard.jsx` (line 129).
- Body format for add/edit:

```json
{
  "type": "shuttle",
  "id": "s02",
  "destination": "Cinema",
  "time": "09:00"
}
```

- Body format for delete:

```json
{
  "type": "passenger",
  "id": "p02"
}
```

- Backend handlers:
  - add: `backend/src/ui/UI.cpp` (line 127)
  - edit: `backend/src/ui/UI.cpp` (line 164)
  - delete: `backend/src/ui/UI.cpp` (line 205)
- Response: updated state JSON with the latest lists.

---

## Simple summary for my bruddas

- The backend is the engine that stores information and does the matching.
- The frontend is the screen the user sees.
- When the user uploads files, the frontend sends the data to the backend.
- When the user asks the system to assign shuttle routes, the backend does the work and sends the result back.
- When the user adds, edits, or deletes records, the frontend tells the backend to change the data.
- The frontend and backend speak to each other using small messages called web requests.

---

## problenm and challenges

**NONE**

## Sources and references for hz

### API and Communications
- https://www.w3schools.com/tags/ref_httpmethods.asp?utm_source=copilot.com
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/POST
- https://www.freecodecamp.org/news/upload-files-with-javascript/
- https://blog.postman.com/get-vs-post/
- https://github.com/yhirose/cpp-httplib
- https://raw.githubusercontent.com/yhirose/cpp-httplib/refs/heads/master/httplib.h

### C++ tools and resource
- https://github.com/fffaraz/awesome-cpp/blob/master/books.md
- https://cplusplus.com/forum/general/286012/ 
- https://www.geeksforgeeks.org/cpp/memory-layout-of-cpp-program/
- https://www.w3schools.com/cpp//cpp_memory_management.asp
- https://www.w3schools.com/cpp/cpp_vectors.asp
- https://www.programiz.com/cpp-programming/vectors
- 

### OOP concepts 
- https://roadmap.sh/cpp
- https://www.geeksforgeeks.org/dsa/introduction-of-object-oriented-programming/
- https://stackify.com/oop-concept-for-beginners-what-is-encapsulation/
- https://www.geeksforgeeks.org/cpp/cpp-polymorphism/
- https://intellipaat.com/blog/polymorphism-in-cpp/
- https://www.wscubetech.com/resources/cpp/polymorphism
- https://www.geeksforgeeks.org/cpp/object-composition-delegation-in-c-with-examples/
- https://www.geeksforgeeks.org/cpp/virtual-base-class-in-c/
- https://stackoverflow.com/questions/1804734/how-can-i-perform-a-file-search-in-c
- https://www.delftstack.com/howto/cpp/how-to-get-list-of-files-in-a-directory-cpp/
- https://stackoverflow.com/questions/5424042/class-variables-public-access-read-only-but-private-access-read-write

### frontend tools and resources (react.js, html and css)
- https://github.com/codesandtags/frontend-resources
- https://github.com/abouolia/sticky-sidebar/blob/master/dist/jquery.sticky-sidebar.js
- https://github.com/djyde/ToProgress
- https://github.com/justforlxz/deepin-topbar
- https://github.com/gridstack/gridstack.js
- https://github.com/creativetimofficial/material-tailwind-dashboard-react
- https://github.com/tabler/tabler
- https://github.com/sendosalmansour105/Admin-Dashboard
- https://www.datacamp.com/tutorial/dashboard-design-tutorial
- https://csstoolbox.net/
- https://webcode.tools/css-generator