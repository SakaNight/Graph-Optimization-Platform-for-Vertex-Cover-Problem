#include <vector>
#include <algorithm>

class APPROX2 {
public:
    static std::vector<int> approx_vc_2(int num_v, const std::vector<std::pair<int, int>>& edges) {
        std::vector<int> vertex_cover;
        std::vector<bool> cv_edges(edges.size(), false);
        
        for(size_t i = 0; i < edges.size(); i++) {
            if(!cv_edges[i]) {
                int u = edges[i].first;
                int v = edges[i].second;
                vertex_cover.push_back(u);
                vertex_cover.push_back(v);
                
                for(size_t j = 0; j < edges.size(); j++) {
                    if(edges[j].first == u || edges[j].second == u ||
                       edges[j].first == v || edges[j].second == v) {
                        cv_edges[j] = true;
                    }
                }
            }
        }
        
        std::sort(vertex_cover.begin(), vertex_cover.end());
        vertex_cover.erase(std::unique(vertex_cover.begin(), vertex_cover.end()),
                          vertex_cover.end());
                          
        return vertex_cover;
    }
};