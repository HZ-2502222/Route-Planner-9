#pragma once
#include <vector>
#include <string>
#include "../models/Shuttle.h"
#include "../models/Passenger.h"
#include "../models/Schedule.h"

class RoutePlanner {
private:
    std::vector<Schedule> activeSchedule;
public:
    RoutePlanner() = default;
    void generateMatches(std::vector<Shuttle>& shuttles, std::vector<Passenger>& passengers); //Using references to update their match/occupation status
    const Schedule getCopySchedule(int index) const;
    int getSize() const;
    bool saveSchedule() const;
    
    //Helper to expose schedule for serialization
    const std::vector<Schedule>& getActiveSchedule() const;
    void clearSchedule();
};
