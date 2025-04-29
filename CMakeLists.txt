cmake_minimum_required(VERSION 2.8)
project(ece650-project)

if (EXISTS "${CMAKE_SOURCE_DIR}/minisat")
    add_subdirectory(minisat)
else()
    message(FATAL_ERROR "MiniSat not found. Please place minisat in ${CMAKE_SOURCE_DIR}/minisat")
endif()

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(ece650-prj
    ece650-prj.cpp
)

target_include_directories(ece650-prj PRIVATE ${CMAKE_SOURCE_DIR}/minisat)
target_link_libraries(ece650-prj minisat-lib-static pthread)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O2")