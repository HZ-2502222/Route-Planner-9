#include "../../include/models/Entity.h"

//Default constructor
Entity::Entity() : ID(""), Destination(""), Time("") {}

//Parameterized constructor
Entity::Entity(const std::string& id, const std::string& dest, const std::string& time)
    : ID(id), Destination(dest), Time(time) {}

std::string Entity::getID() const {
    return ID;
}

std::string Entity::getDestination() const {
    return Destination;
}

std::string Entity::getTime() const {
    return Time;
}
