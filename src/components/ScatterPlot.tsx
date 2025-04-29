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
  Customized
} from "recharts";
import { colors } from "../utils";
import { Dataset, Sample } from "../interfaces";

interface ScatterPlotProps {
  dataset: Dataset;
  handleChartClick: any;
  lastNeightbours: Sample[];
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({
  dataset,
  handleChartClick,
  lastNeightbours,
}) => {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-900 h-[400px] border border-white">
      {dataset.normalizedTrainingSamples?.length > 0 && (
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={1200}
          minHeight={800}
          maxHeight={800}
        >
          <ScatterChart onClick={handleChartClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x1" name="x" domain={[-1.5, 1.5]} />
            <YAxis type="number" dataKey="x2" name="y" domain={[-1.5, 1.5]} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />

            {Object.entries(
              [
                ...dataset.normalizedTrainingSamples,
                ...dataset.newNormalizedSamples,
              ].reduce((acc, sample) => {
                if (sample.y === undefined) {
                  throw new Error("Sample y is undefined");
                }
                const key = sample.y.toString();
                if (!acc[key]) acc[key] = [];
                acc[key].push(sample);
                return acc;
              }, {} as Record<string, Sample[]>)
            ).map(([label, samples]) => (
              <Scatter
                key={label}
                name={`Label ${label}`}
                data={samples}
                fill={colors[label as keyof typeof colors] || "#cccccc"}
              />
            ))}
   <Customized
      component={props => {
        const { xAxisMap, yAxisMap, offset } = props as any;
        // get the scale functions for the first (and only) axes:
        const xScale = xAxisMap[0].scale;
        const yScale = yAxisMap[0].scale;
        const last = dataset.newNormalizedSamples.slice(-1)[0];

        return (
          <g>
            {lastNeightbours.map((nbr, i) => (
              <line
                key={i}
                x1={xScale(last.x1) + offset.left}
                y1={yScale(last.x2) + offset.top}
                x2={xScale(nbr.x1) + offset.left}
                y2={yScale(nbr.x2) + offset.top}
                stroke="blue"
                strokeWidth={2}
              />
            ))}
          </g>
        );
      }}
    />
            {dataset.newNormalizedSamples.length > 0 &&
              (() => {
                const last =
                  dataset.newNormalizedSamples[
                    dataset.newNormalizedSamples.length - 1
                  ];
                const size = 0.05; // rozmiar połowy boku kwadratu
                return (
                  <ReferenceArea
                    x1={last.x1 - size}
                    x2={last.x1 + size}
                    y1={last.x2 - size}
                    y2={last.x2 + size}
                    stroke="red"
                    strokeOpacity={1}
                    fillOpacity={0}
                  />
                );
              })()}
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
export default ScatterPlot;
