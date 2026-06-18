#include "../../include/ui/UI.h"
#include <iostream>
#include <fstream>
#include <cctype>

using json = nlohmann::json;

//Sets CORS headers for HTTP responses
void UI::setCorsHeaders(httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
}

//Serializes the state to JSON for the frontend
json UI::serializeState() {
    json response_json;
    response_json["shuttles"] = json::array();
    
    for (const auto& shuttle : mainShuttleList.getRawList()) {
        json sj;
        sj["id"] = shuttle.getID();
        sj["destination"] = shuttle.getDestination();
        sj["time"] = shuttle.getTime();
        sj["passengers"] = json::array();
        
        for (const auto& schedule : plan.getActiveSchedule()) {
            if (schedule.getCopyShuttle().getID() == shuttle.getID()) {
                json pj;
                pj["id"] = schedule.getCopyPassenger().getID();
                pj["destination"] = schedule.getCopyPassenger().getDestination();
                pj["time"] = schedule.getCopyPassenger().getTime();
                sj["passengers"].push_back(pj);
            }
        }
        response_json["shuttles"].push_back(sj);
    }

    response_json["unassigned_passengers"] = json::array();
    for (const auto& p : mainPassengerList.getRawList()) {
        if (!p.getIsMatched()) {
            json pj;
            pj["id"] = p.getID();
            pj["destination"] = p.getDestination();
            pj["time"] = p.getTime();
            response_json["unassigned_passengers"].push_back(pj);
        }
    }
    
    return response_json;
}

//Displays the schedule
void UI::displaySchedule() {
    //Optional implementation if console logging is needed
}

//Main application loop inside UI class
int UI::main() {
    httplib::Server svr;

    auto options_handler = [this](const httplib::Request& req, httplib::Response& res) {
        this->setCorsHeaders(res);
        res.status = 200;
    };
    svr.Options("/upload", options_handler);
    svr.Options("/assign", options_handler);
    svr.Options("/state", options_handler);
    svr.Options("/add", options_handler);
    svr.Options("/edit", options_handler);
    svr.Options("/delete", options_handler);
    svr.Options("/export", options_handler);

    //Get /state endpoint - returns current state of shuttles and passengers
    svr.Get("/state", [this](const httplib::Request& req, httplib::Response& res) {
        this->setCorsHeaders(res);
        res.set_content(this->serializeState().dump(), "application/json");
    });

    //Post /upload endpoint - receives shuttles and passengers from frontend
    svr.Post("/upload", [this](const httplib::Request& req, httplib::Response& res) {
        this->setCorsHeaders(res);
        try {
            json j = json::parse(req.body);
            
            //Clear existing data
            this->mainShuttleList.getRawList().clear();
            this->mainPassengerList.getRawList().clear();
            this->plan.clearSchedule();

            //Parse shuttles from JSON
            if (j.contains("shuttles") && j["shuttles"].is_array()) {
                for (auto& s : j["shuttles"]) {
                    this->mainShuttleList.addShuttle(Shuttle(s["id"], s["destination"], s["time"]));
                }
            }

            //Parse passengers from JSON
            if (j.contains("passengers") && j["passengers"].is_array()) {
                for (auto& p : j["passengers"]) {
                    this->mainPassengerList.addPassenger(Passenger(p["id"], p["destination"], p["time"]));
                }
            }

            res.set_content(this->serializeState().dump(), "application/json");
        } catch (...) {
            res.status = 400;
            res.set_content("{\"error\":\"Invalid JSON format\"}", "application/json");
        }
    });

    //Post /assign endpoint - generates matches between shuttles and passengers
    svr.Post("/assign", [this](const httplib::Request& req, httplib::Response& res) {
        this->setCorsHeaders(res);
        
        //Reset all matches before generating new ones
        for (auto& s : this->mainShuttleList.getRawList()) s.setOccupied(false);
        for (auto& p : this->mainPassengerList.getRawList()) p.setMatched(false);
        this->plan.clearSchedule();
        
        //Call matching algorithm
        this->plan.generateMatches(this->mainShuttleList.getRawList(), this->mainPassengerList.getRawList());
        
        res.set_content(this->serializeState().dump(), "application/json");
    });

    //Post /add endpoint - adds a new shuttle or passenger
    svr.Post("/add", [this](const httplib::Request& req, httplib::Response& res) {
        this->setCorsHeaders(res);
        try {
            json j = json::parse(req.body);
            std::string type = j["type"];
            std::string id = j["id"];

            auto hasValidPrefix = [](const std::string& entityType, const std::string& entityId) {
                if (entityId.empty()) return false;
                const char prefix = static_cast<char>(std::tolower(static_cast<unsigned char>(entityId.front())));
                if (entityType == "shuttle") return prefix == 's';
                if (entityType == "passenger") return prefix == 'p';
                return false;
            };

            if (!hasValidPrefix(type, id)) {
                res.status = 400;
                res.set_content("{\"error\":\"Shuttle IDs must start with s and passenger IDs must start with p\"}", "application/json");
                return;
            }
            
            bool duplicate = false;
            for (const auto& s : this->mainShuttleList.getRawList()) {
                if (s.getID() == id) duplicate = true;
            }
            for (const auto& p : this->mainPassengerList.getRawList()) {
                if (p.getID() == id) duplicate = true;
            }

            if (duplicate) {
                res.status = 409;
                res.set_content("{\"error\":\"ID already exists\"}", "application/json");
                return;
            }

            //Reset matches
            for (auto& s : this->mainShuttleList.getRawList()) s.setOccupied(false);
            for (auto& p : this->mainPassengerList.getRawList()) p.setMatched(false);
            this->plan.clearSchedule();
            
            if (type == "shuttle") {
                this->mainShuttleList.addShuttle(Shuttle(id, j["destination"], j["time"]));
            } else if (type == "passenger") {
                this->mainPassengerList.addPassenger(Passenger(id, j["destination"], j["time"]));
            }
            res.set_content(this->serializeState().dump(), "application/json");
        } catch (...) {
            res.status = 400;
        }
    });

    svr.Post("/edit", [this](const httplib::Request& req, httplib::Response& res) {
        this->setCorsHeaders(res);
        try {
            json j = json::parse(req.body);
            std::string type = j["type"];
            
            //Reset matches
            for (auto& s : this->mainShuttleList.getRawList()) s.setOccupied(false);
            for (auto& p : this->mainPassengerList.getRawList()) p.setMatched(false);
            this->plan.clearSchedule();
            
            bool success = false;
            if (type == "shuttle") {
                for (auto& s : this->mainShuttleList.getRawList()) {
                    if (s.getID() == j["id"]) {
                        s = Shuttle(j["id"], j["destination"], j["time"]);
                        success = true;
                        break;
                    }
                }
            } else if (type == "passenger") {
                for (auto& p : this->mainPassengerList.getRawList()) {
                    if (p.getID() == j["id"]) {
                        p = Passenger(j["id"], j["destination"], j["time"]);
                        success = true;
                        break;
                    }
                }
            }
            
            if (success) {
                res.set_content(this->serializeState().dump(), "application/json");
            } else {
                res.status = 404;
                res.set_content("{\"error\":\"ID not found\"}", "application/json");
            }
        } catch (...) {
            res.status = 400;
        }
    });

    svr.Post("/delete", [this](const httplib::Request& req, httplib::Response& res) {
        this->setCorsHeaders(res);
        try {
            json j = json::parse(req.body);
            std::string type = j["type"];
            std::string id = j["id"];
            
            //Reset matches
            for (auto& s : this->mainShuttleList.getRawList()) s.setOccupied(false);
            for (auto& p : this->mainPassengerList.getRawList()) p.setMatched(false);
            this->plan.clearSchedule();
            
            bool success = false;
            if (type == "shuttle") {
                for (size_t i = 0; i < this->mainShuttleList.getSize(); ++i) {
                    if (this->mainShuttleList.getCopyShuttle(i).getID() == id) {
                        this->mainShuttleList.deleteShuttle(i);
                        success = true;
                        break;
                    }
                }
            } else if (type == "passenger") {
                for (size_t i = 0; i < this->mainPassengerList.getSize(); ++i) {
                    if (this->mainPassengerList.getCopyPassenger(i).getID() == id) {
                        this->mainPassengerList.deletePassenger(i);
                        success = true;
                        break;
                    }
                }
            }
            
            if (success) {
                res.set_content(this->serializeState().dump(), "application/json");
            } else {
                res.status = 404;
                res.set_content("{\"error\":\"ID not found\"}", "application/json");
            }
        } catch (...) {
            res.status = 400;
        }
    });

    svr.Post("/export", [this](const httplib::Request& req, httplib::Response& res) {
        this->setCorsHeaders(res);
        try {
            //Open file for writing
            std::ofstream outfile("../data/matched.txt");
            if (!outfile.is_open()) {
                res.status = 500;
                res.set_content("{\"error\":\"Could not open file for writing\"}", "application/json");
                return;
            }
            //Write header
            outfile << "Matched Shuttles and Passengers\n";
            outfile << "================================\n\n";
            //Write each matched schedule
            for (const auto& schedule : this->plan.getActiveSchedule()) {
                outfile << "Shuttle ID: " << schedule.getCopyShuttle().getID() 
                        << " | Destination: " << schedule.getCopyShuttle().getDestination() 
                        << " | Time: " << schedule.getCopyShuttle().getTime() << "\n";
                outfile << "Passengers:\n";
                outfile << "  - " << schedule.getCopyPassenger().getID() << "\n\n";
            }
            outfile.close();
            res.set_content("{\"status\":\"success\"}", "application/json");
        } catch (...) {
            res.status = 500;
            res.set_content("{\"error\":\"Internal server error\"}", "application/json");
        }
    });

    //Start HTTP server on port 8080
    std::cout << "Backend server starting on http://localhost:8080" << std::endl;
    svr.listen("0.0.0.0", 8080);

    return 0;
}
