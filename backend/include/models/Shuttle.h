#pragma once
#include "Entity.h"

class Shuttle : public Entity {
private:
    bool isOccupied;
public:
    Shuttle();
    Shuttle(const std::string& id, const std::string& dest, const std::string& t);
    
    std::string getDetails() override;
    bool getIsOccupied() const;
    void setOccupied(bool status);
};
