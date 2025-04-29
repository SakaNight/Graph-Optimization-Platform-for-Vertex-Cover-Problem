#include <iostream>
#include <vector>
#include <algorithm>
#include <minisat/core/Solver.h>
#include <minisat/core/SolverTypes.h>
#include <memory>
#include <cmath>

using namespace std;

class CNFSAT {
private:
    // Create variables for each vertex
    static std::vector<typename Minisat::Lit> create_variables(int V, std::unique_ptr<typename Minisat::Solver>& solver) {
        std::vector<typename Minisat::Lit> vars(V);
        for(int i = 0; i < V; i++) {
            vars[i] = Minisat::mkLit(solver->newVar());
        }
        return vars;
    }

    // Add sequential counter constraints
    static void add_sequential_counter(std::unique_ptr<typename Minisat::Solver>& solver,
                                     const std::vector<typename Minisat::Lit>& vars,
                                     int k) {
        int n = vars.size();
        
        // Create counter variables
        std::vector<std::vector<typename Minisat::Lit>> s(n+1);
        for(int i = 0; i <= n; i++) {
            s[i].resize(k+1);
            for(int j = 0; j <= k; j++) {
                s[i][j] = Minisat::mkLit(solver->newVar());
            }
        }

        // s[0][0] must be true
        solver->addClause(s[0][0]);
        
        // s[i][0] must be true (i > 0)
        for(int i = 1; i <= n; i++) {
            solver->addClause(s[i][0]);
        }
        
        // s[0][j] must be false (j > 0)
        for(int j = 1; j <= k; j++) {
            solver->addClause(~s[0][j]);
        }

        // Add main constraints
        for(int i = 1; i <= n; i++) {
            for(int j = 1; j <= k; j++) {
                // If current variable is true, s[i][j] = s[i-1][j-1] || s[i-1][j]
                // If current variable is false, s[i][j] = s[i-1][j]
                solver->addClause(~vars[i-1], ~s[i-1][j-1], s[i][j]);
                solver->addClause(~s[i-1][j], s[i][j]);
                solver->addClause(vars[i-1], s[i-1][j], ~s[i][j]);
                solver->addClause(s[i-1][j-1], ~s[i][j]);
            }
        }

        // Final counting constraint
        solver->addClause(~s[n][k]);
    }
    
    // Add edge coverage constraints
    static void add_edge_constraints(std::vector<typename Minisat::Lit>& vars, 
                                   const std::vector<std::pair<int,int>>& edges,
                                   std::unique_ptr<typename Minisat::Solver>& solver) {
        for(const auto& edge : edges) {
            Minisat::vec<typename Minisat::Lit> clause;
            clause.push(vars[edge.first-1]);
            clause.push(vars[edge.second-1]);
            solver->addClause(clause);
        }
    }
    
    // Try to solve for a specific vertex cover size
    static std::vector<int> solve_for_size(int V, const std::vector<std::pair<int,int>>& edges, int k) {
        std::unique_ptr<typename Minisat::Solver> solver(new Minisat::Solver());
        
        auto vars = create_variables(V, solver);
        add_edge_constraints(vars, edges, solver);
        add_sequential_counter(solver, vars, k);
        
        bool is_sat = solver->solve();
        if(!is_sat) return std::vector<int>();
        
        std::vector<int> cover;
        for(int i = 0; i < V; i++) {
            if(Minisat::toInt(solver->modelValue(vars[i])) == 0) {
                cover.push_back(i + 1);
            }
        }
        
        return cover;
    }

public:
    // Main static interface method
    static std::vector<int> cnf_sat_vc(int V, const std::vector<std::pair<int,int>>& edges) {
        // Return empty set if there are no edges
        if(edges.empty()) return std::vector<int>();
        
        // Use binary search to find minimum vertex cover
        int left = 1, right = V;
        std::vector<int> best_cover;
        
        while(left <= right) {
            int mid = left + (right - left) / 2;
            std::vector<int> cover = solve_for_size(V, edges, mid);
            
            if(!cover.empty()) {
                best_cover = cover;
                // Try to find a smaller solution
                right = mid - 1;
            } else {
                // Need a larger cover
                left = mid + 1;
            }
        }
        
        // Sort the result
        std::sort(best_cover.begin(), best_cover.end());
        return best_cover;
    }
};
