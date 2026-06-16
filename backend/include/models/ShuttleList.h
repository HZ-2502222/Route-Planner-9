#pragma once
#include <vector>
#include <string>
#include "Shuttle.h"

class ShuttleList {
private:
    std::vector<Shuttle> totalShuttle;
public:
    void deleteShuttle(int index);
    void addShuttle(const Shuttle& newShuttle);
    void editShuttle(const Shuttle& updateShuttle);
    const Shuttle getCopyShuttle(int index) const;
    int getSize() const;
    bool loadPassenger(std::string filename);
    
    //Helper method to get raw reference for modifications
    std::vector<Shuttle>& getRawList();
};
