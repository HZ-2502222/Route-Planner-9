#include "../../include/models/PassengerList.h"

//Deletes a passenger by index
void PassengerList::deletePassenger(int index) {
    if (index >= 0 && index < totalPassengers.size()) {
        totalPassengers.erase(totalPassengers.begin() + index);
    }
}

//Adds a new passenger
void PassengerList::addPassenger(const Passenger& newPassenger) {
    totalPassengers.push_back(newPassenger);
}

//Edits an existing passenger (matched by ID)
void PassengerList::editPassenger(const Passenger& updatePassenger) {
    for (auto& p : totalPassengers) {
        if (p.getID() == updatePassenger.getID()) {
            p = updatePassenger;
            break;
        }
    }
}

//Gets a copy of passenger at index
const Passenger PassengerList::getCopyPassenger(int index) const {
    if (index >= 0 && index < totalPassengers.size()) {
        return totalPassengers[index];
    }
    return Passenger();
}

//Gets the size of the list
int PassengerList::getSize() const {
    return totalPassengers.size();
}

//Loads passenger logic (as per UML naming)
bool PassengerList::loadPassenger(std::string filename) {
    return true; //Stub implementation
}

//Helper method to get raw list
std::vector<Passenger>& PassengerList::getRawList() {
    return totalPassengers;
}
