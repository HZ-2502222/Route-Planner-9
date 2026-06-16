#include "../../include/models/Schedule.h"

//Default constructor
Schedule::Schedule() : shuttle(), passenger() {}

//Parameterized constructor
Schedule::Schedule(Shuttle shuttle, Passenger passenger)
    : shuttle(shuttle), passenger(passenger) {}

//Checks if the shuttle and passenger are compatible
bool Schedule::isCompatible() const {
    return shuttle.getDestination() == passenger.getDestination() &&
           shuttle.getTime() == passenger.getTime();
}

//Returns a copy of the shuttle
const Shuttle Schedule::getCopyShuttle() const {
    return shuttle;
}

//Returns a copy of the passenger
const Passenger Schedule::getCopyPassenger() const {
    return passenger;
}
