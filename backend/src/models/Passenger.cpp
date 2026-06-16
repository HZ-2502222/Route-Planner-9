#include "../../include/models/Passenger.h"

//Default constructor
Passenger::Passenger() : Entity(), isMatched(false) {}

//Parameterized constructor
Passenger::Passenger(const std::string& id, const std::string& dest, const std::string& t)
    : Entity(id, dest, t), isMatched(false) {}

//Returns details of the passenger
std::string Passenger::getDetails() {
    return "Passenger [ID: " + getID() + ", Dest: " + getDestination() + ", Time: " + getTime() + "]";
}

//Returns match status
bool Passenger::getIsMatched() const {
    return isMatched;
}

//Sets the match status
void Passenger::setMatched(bool match) {
    isMatched = match;
}
