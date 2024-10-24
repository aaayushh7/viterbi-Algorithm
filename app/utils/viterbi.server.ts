// app/utils/viterbi.server.ts
import type { Probabilities, ViterbiResult } from "../types/viterbi.types";
import { states } from "../types/viterbi.types";

export const transitionProb: Probabilities = {
  'Noun': { 'Noun': 0.3, 'Verb': 0.5, 'Adjective': 0.2 },
  'Verb': { 'Noun': 0.4, 'Verb': 0.2, 'Adjective': 0.4 },
  'Adjective': { 'Noun': 0.5, 'Verb': 0.3, 'Adjective': 0.2 }
};

export const emissionProb: Probabilities = {
  'Noun': { 'cat': 0.4, 'run': 0.1, 'fast': 0.1, 'dog': 0.3, 'jump': 0.05, 'big': 0.05 },
  'Verb': { 'cat': 0.05, 'run': 0.4, 'fast': 0.1, 'dog': 0.05, 'jump': 0.35, 'big': 0.05 },
  'Adjective': { 'cat': 0.05, 'run': 0.1, 'fast': 0.35, 'dog': 0.05, 'jump': 0.1, 'big': 0.35 }
};

export const initialProb: { [key: string]: number } = {
  'Noun': 0.4,
  'Verb': 0.3,
  'Adjective': 0.3
};

export async function computeViterbi(observationSequence: string[]): Promise<ViterbiResult> {
  if (!observationSequence.length) {
    return { viterbi: [], backpointers: [], bestPath: [] };
  }

  const T = observationSequence.length;
  const V: { [key: string]: number }[] = Array(T).fill(null).map(() => ({}));
  const bp: { [key: string]: string | null }[] = Array(T).fill(null).map(() => ({}));

  // Initialize
  states.forEach(state => {
    const emission = emissionProb[state][observationSequence[0]] || 0.00001;
    V[0][state] = Math.log(initialProb[state]) + Math.log(emission);
    bp[0][state] = null;
  });

  // Recursion
  for (let t = 1; t < T; t++) {
    states.forEach(currentState => {
      let maxProb = -Infinity;
      let bestPrevState = null;

      states.forEach(prevState => {
        const emission = emissionProb[currentState][observationSequence[t]] || 0.00001;
        const prob = V[t-1][prevState] + 
                    Math.log(transitionProb[prevState][currentState]) + 
                    Math.log(emission);
        
        if (prob > maxProb) {
          maxProb = prob;
          bestPrevState = prevState;
        }
      });

      V[t][currentState] = maxProb;
      bp[t][currentState] = bestPrevState;
    });
  }

  // Backtrack
  let bestPathProb = -Infinity;
  let lastState = null;
  states.forEach(state => {
    if (V[T-1][state] > bestPathProb) {
      bestPathProb = V[T-1][state];
      lastState = state;
    }
  });

  const path = Array(T).fill(null);
  path[T-1] = lastState;
  for (let t = T-2; t >= 0; t--) {
    path[t] = path[t+1] ? bp[t+1][path[t+1]] : null;
  }

  return { viterbi: V, backpointers: bp, bestPath: path };
}