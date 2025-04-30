import { GraphInput, SolveResult } from './types';

const API_BASE_URL = 'http://localhost:8000';

export function solveGraphWS(
  input: GraphInput,
  onResult: (result: SolveResult) => void,
  onError: (err: any) => void
) {
  const ws = new WebSocket('ws://localhost:8000/ws/solve');

  ws.onopen = () => {
    ws.send(JSON.stringify(input));
  };

  ws.onmessage = (event) => {
    try {
      const result = JSON.parse(event.data);
      onResult(result);
    } catch (err) {
      onError(err);
    }
    ws.close();
  };

  ws.onerror = (err) => {
    onError(err);
  };

  ws.onclose = () => {
    console.log('[WebSocket] Connection closed');
  };
}