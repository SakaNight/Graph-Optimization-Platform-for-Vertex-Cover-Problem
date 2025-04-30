import axios from 'axios';
import { GraphInput, SolveResult } from './types';

const API_BASE_URL = 'http://localhost:8000';

export async function solveGraph(graph: GraphInput): Promise<SolveResult> {
  const response = await axios.post<SolveResult>(
    '/solve',
    graph,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}