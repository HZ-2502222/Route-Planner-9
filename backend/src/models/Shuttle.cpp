#include "../../include/models/Shuttle.h"

//Default constructor
Shuttle::Shuttle() : Entity(), isOccupied(false) {}

//Parameterized constructor
Shuttle::Shuttle(const std::string& id, const std::string& dest, const std::string& t)
    : Entity(id, dest, t), isOccupied(false) {}

//Returns details of the shuttle
std::string Shuttle::getDetails() {
    return "Shuttle [ID: " + getID() + ", Dest: " + getDestination() + ", Time: " + getTime() + "]";
}

//Returns occupation status
bool Shuttle::getIsOccupied() const {
    return isOccupied;
}

//Sets the occupation status
void Shuttle::setOccupied(bool status) {
    isOccupied = status;
}
