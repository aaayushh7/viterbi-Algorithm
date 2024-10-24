// app/types/viterbi.types.ts
export const states = ['Noun', 'Verb', 'Adjective'] as const;
export const observations = ['cat', 'run', 'fast', 'dog', 'jump', 'big'] as const;

export type State = typeof states[number];
export type Observation = typeof observations[number];

export interface Probabilities {
  [key: string]: {
    [key: string]: number;
  };
}

export interface ViterbiResult {
  viterbi: { [key: string]: number }[];
  backpointers: { [key: string]: string | null }[];
  bestPath: (string | null)[];
}