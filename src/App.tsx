import "./App.css";
import { useState } from "react";
import { Dataset, Sample, Neighbour } from "./interfaces";
import {
  normalizeSamples,
  kNearestNeighbors,
  euclideanDistance,
  cityblockDistance,
  majorityVote,
  weightedVote,
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
  const [distanceFunction, setDistanceFunction] =
    useState<string>("euclideanDistance");
  const [voteFunction, setVoteFunction] = useState<string>("majorityVote");
  const [k, setK] = useState(5);
  const [lastNeightbours, setLastNeightbours] = useState<Neighbour[]>([]);

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


  const useDefaultFile = async () => {
    try {
      // 1.  Ścieżka jest wpisana na stałe.
      //     W aplikacji React wszystkie pliki z public są serwowane od „/”.
      const response = await fetch("/test_input");
      if (!response.ok) {
        throw new Error(`Nie udało się pobrać pliku (HTTP ${response.status})`);
      }
  
      // 2.  Treść pliku → tekst
      const text = await response.text();
  
      // 3.  Parsowanie na Sample[]
      const linesArray = text.split(/\r?\n/);
      const samples: Sample[] = linesArray
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const [x1Str, x2Str, yStr] = line.split(",");
          return {
            x1: parseFloat(x1Str.trim()),
            x2: parseFloat(x2Str.trim()),
            y:  parseFloat(yStr.trim()),
          };
        });
  
      // 4.  Aktualizacja stanu
      setDataset((prev) => ({
        ...prev,
        trainingSamples: samples,
        normalizedTrainingSamples: normalizeSamples(samples),
        minX1: Math.min(...samples.map((s) => s.x1)),
        maxX1: Math.max(...samples.map((s) => s.x1)),
        minX2: Math.min(...samples.map((s) => s.x2)),
        maxX2: Math.max(...samples.map((s) => s.x2)),
      }));
    } catch (err) {
      console.error("Błąd podczas wczytywania pliku z public:", err);
    }
  };
  const handleSelectNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 3 || value > 20) return;
    setK(value);
  };

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
      {dataset.trainingSamples.length > 0 ? (
        <div className="dataset-info">
  <div className="dataset-controls">
    <InputNumber
      label="Wybierz wartość k:"
      handleSelectNumber={handleSelectNumber}
    />

    <div className="radio-group">
      <p className="radio-group-title">Funkcja odległości:</p>
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

      <p className="radio-group-title">Metoda głosowania:</p>
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
  </div>

  <ScatterPlot
    dataset={dataset}
    handleChartClick={handleChartClick}
    lastNeightbours={lastNeightbours}
  />
</div>
      ) : (
        <div className="start-screen-container">
        <div className="start-screen-card">
          <h1 className="start-screen-heading">Wybierz zbiór danych</h1>
  
          <InputFile label="" handleSelectFile={handleSelectFile} />
  
          <div className="start-screen-divider">
            <div className="start-screen-line"></div>
            <span className="start-screen-or">lub</span>
            <div className="start-screen-line"></div>
          </div>
  
          <button onClick={useDefaultFile} className="start-screen-button">Wybierz przykładowy</button>
        </div>
      </div>

      )}
    </>
  );
}

export default App;
