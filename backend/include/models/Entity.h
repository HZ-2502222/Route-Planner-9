#pragma once
#include <string>

class Entity {
private:
    std::string ID;
    std::string Destination;
    std::string Time;
public:
    Entity();
    Entity(const std::string& id, const std::string& dest, const std::string& time);
    virtual ~Entity() = default;
    
    //Virtual method for getting details
    virtual std::string getDetails() = 0;
    
    std::string getID() const;
    std::string getDestination() const;
    std::string getTime() const;
};
