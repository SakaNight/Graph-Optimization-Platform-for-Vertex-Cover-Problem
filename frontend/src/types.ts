export interface GraphInput {
    num_vertices: number;
    edges: [number, number][];
    algorithms?: string[]; // optional in case we support selective run later
  }
  
  export interface SolveResult {
    cnf_vc: number[];
    approx_vc_1: number[];
    approx_vc_2: number[];
    times: {
      cnf_sat_vc: number;
      approx_vc_1: number;
      approx_vc_2: number;
    };
  }