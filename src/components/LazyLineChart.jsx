import React, { useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const LazyLineChart = ({ data }) => {
  const containerRef = useRef(null);

  // Add fallback for empty data
  if (!data || data.length === 0) {
    return (
      <div className="chart-error">No data available to display the chart.</div>
    );
  }

  // Add window resize handler to fix ResponsiveContainer issues
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // Force re-render of charts on window resize
        const parentWidth = containerRef.current.offsetWidth;
        containerRef.current.style.width = `${parentWidth - 1}px`;
        setTimeout(() => {
          containerRef.current.style.width = `${parentWidth}px`;
        }, 0);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  try {
    return (
      <div ref={containerRef} className="chart-container">
        <ResponsiveContainer width="99%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="shortDate"
              allowDataOverflow={true}
              allowDecimals={false}
            />
            <YAxis allowDataOverflow={true} allowDecimals={true} />
            <Tooltip formatter={(value) => `€${value}`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="cumulativeProfit"
              name="Cumulative Profit"
              stroke="#1e40af"
              strokeWidth={2}
              isAnimationActive={false} // Disable animations to avoid errors
              dot={{ strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (error) {
    console.error("Error rendering LineChart:", error);
    return (
      <div className="chart-error">
        Error rendering chart. Please try refreshing the page.
      </div>
    );
  }
};

export default LazyLineChart;
