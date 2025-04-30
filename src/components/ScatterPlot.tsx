import React from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  LabelList,
} from "recharts";
import { colors } from "../utils";
import { Dataset, Sample, Neighbour } from "../interfaces";


interface ScatterPlotProps {
  dataset: Dataset;
  handleChartClick: (e: unknown) => void;
  lastNeightbours: Neighbour[];
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({
  dataset,
  handleChartClick,
  lastNeightbours,
}) => {
  const hasTrainingData = (dataset.normalizedTrainingSamples?.length ?? 0) > 0;

  const samplesGroupedByLabel = React.useMemo(() => {
    return [
      ...(dataset.normalizedTrainingSamples ?? []),
      ...(dataset.newNormalizedSamples ?? []),
    ].reduce<Record<string, Sample[]>>((acc, sample) => {
      if (sample.y === undefined) throw new Error("Sample y is undefined");
      const key = sample.y.toString();
      (acc[key] ??= []).push(sample);
      return acc;
    }, {});
  }, [dataset.normalizedTrainingSamples, dataset.newNormalizedSamples]);

  const lastSample = dataset.newNormalizedSamples
    ? dataset.newNormalizedSamples[dataset.newNormalizedSamples.length - 1]
    : undefined;

  const neighbourData = lastNeightbours.map(({ sample, distance }) => ({
    ...sample,
    distanceLabel: distance.toFixed(2),
  }));

  if (!hasTrainingData) {
    return (
      <div className="flex h-[400px] items-center justify-center border border-white bg-gray-900 text-white">
        Brak danych treningowych
      </div>
    );
  }

  return (
    <div className="flex h-[400px] flex-col items-center justify-center border border-white bg-gray-900">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={1200}
        minHeight={800}
        maxHeight={800}
      >
        <ScatterChart
          onClick={handleChartClick}
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="x1" name="x" domain={[-1.5, 1.5]} />
          <YAxis type="number" dataKey="x2" name="y" domain={[-1.5, 1.5]} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Legend />

          {Object.entries(samplesGroupedByLabel).map(([label, samples]) => (
            <Scatter
              key={`class-${label}`}
              name={`Label ${label}`}
              data={samples}
              fill={colors[label as keyof typeof colors] ?? "#cccccc"}
            />
          ))}

          <Scatter
            data={neighbourData}
            fill="#ffffff"
            legendType="none"
          >
            <LabelList
              dataKey="distanceLabel"
              position="right"
              stroke="#ffffff"
              offset={4}
            />
          </Scatter>

          {lastSample &&
            lastNeightbours.map(({ sample }, i) => (
              <Scatter
                key={`neighbour-line-${i}`}
                data={[lastSample, sample]}
                fill={colors[sample.y?.toString() as keyof typeof colors] ?? "#cccccc"}
                line={{
                  stroke: colors[sample.y?.toString() as keyof typeof colors] ?? "#cccccc",
                  strokeWidth: 2,
                }}
                legendType="none"
              />
            ))}

          {lastSample && (
            <ReferenceArea
              x1={lastSample.x1 - 0.05}
              x2={lastSample.x1 + 0.05}
              y1={lastSample.x2 - 0.05}
              y2={lastSample.x2 + 0.05}
              stroke="red"
              strokeOpacity={1}
              fillOpacity={0}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterPlot;
