#include "../../include/models/ShuttleList.h"

//Deletes a shuttle by index
void ShuttleList::deleteShuttle(int index) {
    if (index >= 0 && index < totalShuttle.size()) {
        totalShuttle.erase(totalShuttle.begin() + index);
    }
}

//Adds a new shuttle
void ShuttleList::addShuttle(const Shuttle& newShuttle) {
    totalShuttle.push_back(newShuttle);
}

//Edits an existing shuttle (matched by ID)
void ShuttleList::editShuttle(const Shuttle& updateShuttle) {
    for (auto& s : totalShuttle) {
        if (s.getID() == updateShuttle.getID()) {
            s = updateShuttle;
            break;
        }
    }
}

//Gets a copy of shuttle at index
const Shuttle ShuttleList::getCopyShuttle(int index) const {
    if (index >= 0 && index < totalShuttle.size()) {
        return totalShuttle[index];
    }
    return Shuttle();
}

//Gets the size of the list
int ShuttleList::getSize() const {
    return totalShuttle.size();
}

//Loads passenger logic (as per UML naming)
bool ShuttleList::loadPassenger(std::string filename) {
    return true; //Stub implementation
}

//Helper method to get raw list
std::vector<Shuttle>& ShuttleList::getRawList() {
    return totalShuttle;
}
