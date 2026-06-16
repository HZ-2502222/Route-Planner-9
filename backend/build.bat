@echo off
echo Compiling Backend...
g++ -std=c++11 -Wall -O2 -D_WIN32_WINNT=0x0A00 src/main.cpp src/models/Entity.cpp src/models/Passenger.cpp src/models/Shuttle.cpp src/models/ShuttleList.cpp src/models/PassengerList.cpp src/models/Schedule.cpp src/services/RoutePlanner.cpp src/ui/UI.cpp -o server.exe -lws2_32
if %errorlevel% neq 0 (
    echo Compilation failed.
    exit /b %errorlevel%
)
echo Compilation successful. Run server.exe to start.
