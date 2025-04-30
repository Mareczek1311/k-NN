export interface Sample {
  x1: number;
  x2: number;
  y?: number;
}

export interface Dataset {
  trainingSamples: Sample[];
  normalizedTrainingSamples: Sample[];
  newNormalizedSamples: Sample[];
  minX1: number;
  maxX1: number;
  minX2: number;
  maxX2: number;
}

export interface Neighbour {
  sample: Sample;
  distance: number;
}