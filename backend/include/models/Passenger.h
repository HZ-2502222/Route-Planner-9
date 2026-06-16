#pragma once
#include "Entity.h"

class Passenger : public Entity {
private:
    bool isMatched;
public:
    Passenger();
    Passenger(const std::string& id, const std::string& dest, const std::string& t);
    
    std::string getDetails() override;
    bool getIsMatched() const;
    void setMatched(bool match);
};
