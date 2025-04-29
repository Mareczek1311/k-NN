import "./App.css";
import { useState } from "react";
import { Dataset, Sample } from "./interfaces";
import { normalizeSamples, kNearestNeighbors, euclideanDistance,
  cityblockDistance, majorityVote, weightedVote
 } from "./utils";
import InputFile from "./components/InputFile";
import InputNumber from "./components/InputNumber";
import ScatterPlot from "./components/ScatterPlot";

function App() {
  const [dataset, setDataset] = useState<Dataset>({
    trainingSamples: [],
    normalizedTrainingSamples: [],
    newNormalizedSamples: [],
    minX1: 0,
    maxX1: 1,
    minX2: 0,
    maxX2: 1,
  });
  const [distanceFunction, setDistanceFunction] = useState<string>("euclidean");
  const [voteFunction, setVoteFunction] = useState<string>("majorityVote");
  const [k, setK] = useState(5);
  const [lastNeightbours, setLastNeightbours] = useState<Sample[]>([]);

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== "string") return;
      const linesArray = text.split(/\r?\n/);
      const samples: Sample[] = linesArray
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const [x1Str, x2Str, yStr] = line.split(",");
          const x1 = parseFloat(x1Str.trim());
          const x2 = parseFloat(x2Str.trim());
          const y = parseFloat(yStr.trim());
          return { x1, x2, y };
        });

      setDataset((prev) => ({
        ...prev,
        trainingSamples: samples,
        normalizedTrainingSamples: normalizeSamples(samples),
        minX1: Math.min(...samples.map((sample) => sample.x1)),
        maxX1: Math.max(...samples.map((sample) => sample.x1)),
        minX2: Math.min(...samples.map((sample) => sample.x2)),
        maxX2: Math.max(...samples.map((sample) => sample.x2)),
      }));
    };
    reader.readAsText(file);
  };

  const handleSelectNumber = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 3 || value > 20) return;
    setK(value);
  }

  const handleChartClick = (e: any) => {
    var xValue = e.xValue;
    var yValue = e.yValue;
    if (xValue === undefined || yValue === undefined) return;
    const sample: Sample = { x1: xValue, x2: yValue };

    const res = kNearestNeighbors(
      dataset.normalizedTrainingSamples,
      sample,
      k,
      distanceFunction === "euclideanDistance"
        ? euclideanDistance
        : cityblockDistance,
      voteFunction === "majorityVote" ? majorityVote : weightedVote
    );
    const predictedSample = {
      x1: sample.x1,
      x2: sample.x2,
      y: res.prediction,
    };
    setLastNeightbours(res.neightbours);
    if (predictedSample) {
      setDataset((prev) => ({
        ...prev,
        newNormalizedSamples: [
          ...(prev.newNormalizedSamples || []),
          predictedSample,
        ],
      }));
    }
  };

  return (
    <>
      <InputFile
        label="Wybierz plik z danymi:"
        handleSelectFile={handleSelectFile}
      />
      <InputNumber
        label="Wybierz wartość k:"
        handleSelectNumber={handleSelectNumber}
      />
      <div className="distance-function">
        <label>
          <input
            type="radio"
            value="euclidean"
            checked={distanceFunction === "euclideanDistance"}
            onChange={() => setDistanceFunction("euclideanDistance")}
          />
          Odległość euklidesowa
        </label>
        <label>
          <input
            type="radio"
            value="cityblock"
            checked={distanceFunction === "cityblockDistance"}
            onChange={() => setDistanceFunction("cityblockDistance")}
          />
          Odległość Manhattan
        </label>

        <label>
          <input
            type="radio"
            value="majorityVote"
            checked={voteFunction === "majorityVote"}
            onChange={() => setVoteFunction("majorityVote")}
          />
          Głosowanie większościowe
        </label>
        <label>
          <input
            type="radio"
            value="weightedVote"
            checked={voteFunction === "weightedVote"}
            onChange={() => setVoteFunction("weightedVote")}
          />
          Głosowanie ważone
        </label>
      </div>

      <ScatterPlot
        dataset={dataset}
        handleChartClick={handleChartClick}
        lastNeightbours={lastNeightbours}
      />
    </>
  );
}

export default App;
