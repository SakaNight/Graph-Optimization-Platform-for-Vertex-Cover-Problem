#include <vector>
#include <set>
#include <algorithm>

class APPROX1 {
public:
    static std::vector<int> approx_vc_1(int num_v, const std::vector<std::pair<int, int>>& edges) {
        std::vector<std::set<int>> adj_list(num_v);
        std::vector<int> vertex_cover;
        
        for (const auto& edge : edges) {
            adj_list[edge.first - 1].insert(edge.second - 1);
            adj_list[edge.second - 1].insert(edge.first - 1);
        }
        
        while (true) {
            int max_degree = 0;
            int max_v = -1;
            
            for (int v = 0; v < num_v; v++) {
                if (adj_list[v].size() > max_degree) {
                    max_degree = adj_list[v].size();
                    max_v = v;
                }
            }
            
            if (max_degree == 0) break;
            
            vertex_cover.push_back(max_v + 1);
            
            std::set<int> neighbors = adj_list[max_v];
            for (int neighbor : neighbors) {
                adj_list[neighbor].erase(max_v);
                adj_list[max_v].erase(neighbor);
            }
        }
        
        std::sort(vertex_cover.begin(), vertex_cover.end());
        return vertex_cover;
    }
};