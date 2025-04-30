cmake_minimum_required(VERSION 3.10)
project(vertex_cover_solver)

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_subdirectory(external/minisat)
include_directories(external/minisat)

add_executable(vertex_cover_main
vertex_cover_main.cpp
)

target_link_libraries(vertex_cover_main 
    minisat-lib-static
    pthread
)