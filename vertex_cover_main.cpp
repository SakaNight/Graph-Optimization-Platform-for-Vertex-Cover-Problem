#include <iostream>
#include <sstream>
#include <pthread.h>
#include <time.h>
#include <vector>
#include <string>
#include <chrono>
#include <iomanip>
#include "cnf-sat-vc.cpp"
#include "approx1.cpp"
#include "approx2.cpp"

struct ThreadData {
    int num_vertices;
    std::vector<std::pair<int, int>> edges;
    std::vector<int> result;
    bool timeout;
    std::chrono::steady_clock::time_point start;
    std::chrono::steady_clock::time_point end;
};

void print_result(const std::string& algo_name, const std::vector<int>& result,
        const std::chrono::steady_clock::time_point& start,
        const std::chrono::steady_clock::time_point& end,
        bool timeout) {
    double milliseconds = std::chrono::duration<double, std::milli>(end - start).count();
                     
    std::cout << algo_name << ": ";
    if (timeout || result.empty()) {
        std::cout << "timeout" << std::endl;
    } else {
        for (size_t i = 0; i < result.size(); ++i) {
            std::cout << result[i];
            if (i < result.size() - 1) std::cout << ",";
        }
        std::cout << std::endl;
    }
    std::cout << "CPU Time: " << std::fixed << std::setprecision(3) << milliseconds << " ms" << std::endl;
}

static void* run_cnf_sat_vc(void* arg) {
    ThreadData* data = static_cast<ThreadData*>(arg);

    data->start = std::chrono::steady_clock::now();

    data->result = CNFSAT::cnf_sat_vc(data->num_vertices, data->edges);

    data->end = std::chrono::steady_clock::now();

    double seconds = std::chrono::duration<double>(data->end - data->start).count();
    if (seconds > 120.0) {
        data->timeout = true;
        data->result.clear();
    }

    return nullptr;
}

static void* run_approx_vc_1(void* arg) {
    ThreadData* data = static_cast<ThreadData*>(arg);

    data->start = std::chrono::steady_clock::now();
    data->result = APPROX1::approx_vc_1(data->num_vertices, data->edges);
    data->end = std::chrono::steady_clock::now();

    return nullptr;
}

static void* run_approx_vc_2(void* arg) {
    ThreadData* data = static_cast<ThreadData*>(arg);

    data->start = std::chrono::steady_clock::now();
    data->result = APPROX2::approx_vc_2(data->num_vertices, data->edges);
    data->end = std::chrono::steady_clock::now();

    return nullptr;
}

std::vector<std::pair<int,int>> parse_edges(const std::string& input) {
    std::vector<std::pair<int,int>> edges;
    size_t pos = 0;
    while ((pos = input.find('<', pos)) != std::string::npos) {
        size_t end = input.find('>', pos);
        if (end == std::string::npos) break;
        
        std::string pair = input.substr(pos + 1, end - pos - 1);
        std::istringstream iss(pair);
        int v1, v2;
        char comma;
        if (iss >> v1 >> comma >> v2) {
            edges.push_back({v1, v2});
        }
        pos = end + 1;
    }
    return edges;
}

int main() {
    std::string line;
    int num_vertices = 0;
    std::vector<std::pair<int,int>> edges;
    
    while (std::getline(std::cin, line)) {
        std::istringstream iss(line);
        char command;
        iss >> command;
        
        if (command == 'V') {
            iss >> num_vertices;
            edges.clear();
        } 
        else if (command == 'E') {
            edges = parse_edges(line);
            
            if (num_vertices > 0) {
                bool valid_edges = true;
                for (const auto& edge : edges) {
                    if (edge.first <= 0 || edge.first > num_vertices ||
                        edge.second <= 0 || edge.second > num_vertices) {
                        valid_edges = false;
                        break;
                    }
                }
                
                if (!valid_edges || edges.empty()) {
                    std::cout << "CNF-SAT-VC:" << std::endl;
                    // std::cout << "CPU Time: 0.000 ms" << std::endl;
                    std::cout << "APPROX-VC-1:" << std::endl;
                    // std::cout << "CPU Time: 0.000 ms" << std::endl;
                    std::cout << "APPROX-VC-2:" << std::endl;
                    // std::cout << "CPU Time: 0.000 ms" << std::endl;
                    continue;
                }
                
                pthread_t threads[3];
                ThreadData thread_data[3];
                
                for (int i = 0; i < 3; ++i) {
                    thread_data[i].num_vertices = num_vertices;
                    thread_data[i].edges = edges;
                    thread_data[i].timeout = false;
                }
                
                pthread_create(&threads[0], nullptr, run_cnf_sat_vc, &thread_data[0]);
                pthread_create(&threads[1], nullptr, run_approx_vc_1, &thread_data[1]);
                pthread_create(&threads[2], nullptr, run_approx_vc_2, &thread_data[2]);
                
                for (int i = 0; i < 3; ++i) {
                    pthread_join(threads[i], nullptr);
                }
                
                print_result("CNF-SAT-VC", thread_data[0].result, 
                    thread_data[0].start, thread_data[0].end,
                    thread_data[0].timeout);
                print_result("APPROX-VC-1", thread_data[1].result,
                    thread_data[1].start, thread_data[1].end,
                    thread_data[1].timeout);
                print_result("APPROX-VC-2", thread_data[2].result,
                    thread_data[2].start, thread_data[2].end,
                    thread_data[2].timeout);
            }
        }
    }
    
    return 0;
}