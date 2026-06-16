#pragma once
#include <vector>
#include <string>
#include "Passenger.h"

class PassengerList {
private:
    std::vector<Passenger> totalPassengers;
public:
    void deletePassenger(int index);
    void addPassenger(const Passenger& newPassenger);
    void editPassenger(const Passenger& updatePassenger);
    const Passenger getCopyPassenger(int index) const;
    int getSize() const;
    bool loadPassenger(std::string filename);
    
    //Helper method to get raw reference for modifications
    std::vector<Passenger>& getRawList();
};
