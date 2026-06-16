#pragma once
#ifndef _WIN32_WINNT
#define _WIN32_WINNT 0x0A00
#endif
#include "../models/ShuttleList.h"
#include "../models/PassengerList.h"
#include "../services/RoutePlanner.h"
#include "../json.hpp"
#include "../httplib.h"

class UI {
private:
    ShuttleList mainShuttleList;
    ShuttleList unassignedShuttleList;
    PassengerList mainPassengerList;
    PassengerList unassignedPassengerList;
    RoutePlanner plan;
    
    nlohmann::json serializeState();
    void setCorsHeaders(httplib::Response& res);

public:
    int main();
    void displaySchedule();
};
