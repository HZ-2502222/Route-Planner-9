#pragma once
#include "Shuttle.h"
#include "Passenger.h"

class Schedule {
private:
    Shuttle shuttle;
    Passenger passenger;
public:
    Schedule();
    Schedule(Shuttle shuttle, Passenger passenger);
    
    bool isCompatible() const;
    const Shuttle getCopyShuttle() const;
    const Passenger getCopyPassenger() const;
};
