#include "../../include/services/RoutePlanner.h"
#include <iostream>

//Generates matches between shuttles and passengers
void RoutePlanner::generateMatches(std::vector<Shuttle>& shuttles, std::vector<Passenger>& passengers) {
    std::cout << "Starting Route Planning..." << std::endl;
    
    for (auto& passenger : passengers) {
        if (passenger.getIsMatched()) continue;
        
        for (auto& shuttle : shuttles) {
            if (shuttle.getIsOccupied()) continue;
            
            //Match based on destination and time
            if (shuttle.getDestination() == passenger.getDestination() && 
                shuttle.getTime() == passenger.getTime()) {
                
                shuttle.setOccupied(true);
                passenger.setMatched(true);
                
                activeSchedule.push_back(Schedule(shuttle, passenger));
                std::cout << "Assigned " << passenger.getDetails() << " to " << shuttle.getID() << std::endl;
                break; //Shuttle is now occupied, passenger is matched
            }
        }
    }
}

//Returns a copy of the schedule at index
const Schedule RoutePlanner::getCopySchedule(int index) const {
    if (index >= 0 && index < activeSchedule.size()) {
        return activeSchedule[index];
    }
    return Schedule();
}

//Returns the size of the active schedule
int RoutePlanner::getSize() const {
    return activeSchedule.size();
}

//Saves the schedule
bool RoutePlanner::saveSchedule() const {
    //The actual file saving logic can be placed here or in export handler
    return true; 
}

//Returns the raw active schedule for serialization
const std::vector<Schedule>& RoutePlanner::getActiveSchedule() const {
    return activeSchedule;
}

//Clears the schedule
void RoutePlanner::clearSchedule() {
    activeSchedule.clear();
}
