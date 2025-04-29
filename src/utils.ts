import { Sample } from "./interfaces";

export const kNearestNeighbors = (
  normalizedTrainingSample: Sample[],
  newSample: Sample,
  k: number,
  distanceFunction: (sample1: Sample, sample2: Sample) => number,
  voteFunction: (neighbors: { sample: Sample; distance: number }[]) => number
): any => {
  const distances = normalizedTrainingSample.map((trainSample) => ({
    sample: trainSample,
    distance: distanceFunction(trainSample, newSample),
  }));

  const sorted = distances.sort((a, b) => a.distance - b.distance).slice(0, k);

  return {prediction: voteFunction(sorted), neightbours: sorted};
};

export const colors = {
  "0": "#000000",
  "1": "#8884d8",
  "2": "#82ca9d",
  "3": "#ffc658",
  "4": "#ff7300",
  "5": "#ff0000",
};

export const normalizeSamples = (samples: Sample[]) => {
  const minX1 = Math.min(...samples.map((sample) => sample.x1));
  const maxX1 = Math.max(...samples.map((sample) => sample.x1));
  const minX2 = Math.min(...samples.map((sample) => sample.x2));
  const maxX2 = Math.max(...samples.map((sample) => sample.x2));

  return samples.map((sample) => ({
    x1: (2 * (sample.x1 - minX1)) / (maxX1 - minX1) - 1,
    x2: (2 * (sample.x2 - minX2)) / (maxX2 - minX2) - 1,
    y: sample.y,
  }));
};

export const euclideanDistance = (sample1: Sample, sample2: Sample) => {
  return Math.sqrt(
    Math.pow(sample1.x1 - sample2.x1, 2) + Math.pow(sample1.x2 - sample2.x2, 2)
  );
};

export const cityblockDistance = (sample1: Sample, sample2: Sample) => {
  return Math.abs(sample1.x1 - sample2.x1) + Math.abs(sample1.x2 - sample2.x2);
};

export const majorityVote = (neighbors: { sample: Sample; distance: number }[]) => {
  const counts: Record<number, number> = {};

  neighbors.forEach(({ sample }) => {
    if (sample.y !== undefined) {
      counts[sample.y] = (counts[sample.y] || 0) + 1;
    }
  });

  return parseInt(
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
  );
};

export const weightedVote = (neighbors: { sample: Sample; distance: number }[]) => {
  const weights: Record<number, number> = {};

  neighbors.forEach(({ sample, distance }) => {
    if (sample.y !== undefined) {
      const weight = distance === 0 ? Number.MAX_VALUE : 1 / Math.pow(distance, 2);
      weights[sample.y] = (weights[sample.y] || 0) + weight;
    }
  });

  return parseInt(
    Object.entries(weights).sort((a, b) => b[1] - a[1])[0][0]
  );
};
