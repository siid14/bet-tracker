import React, { useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const LazyBarChart = ({ data, colors }) => {
  const containerRef = useRef(null);

  // Add fallback for empty data or missing colors
  if (!data || data.length === 0) {
    return (
      <div className="chart-error">No data available to display the chart.</div>
    );
  }

  if (!colors || colors.length < 2) {
    colors = ["#047857", "#b91c1c"]; // Fallback colors if not provided
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
        <ResponsiveContainer width="99%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="shortDate"
              allowDataOverflow={true}
              allowDecimals={false}
            />
            <YAxis allowDataOverflow={true} allowDecimals={true} />
            <Tooltip formatter={(value) => `€${value}`} />
            <Bar
              dataKey="profitLoss"
              name="Profit/Loss"
              isAnimationActive={false} // Disable animations to avoid errors
              fill={(data) => (data > 0 ? colors[0] : colors[1])}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.profitLoss >= 0 ? colors[0] : colors[1]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (error) {
    console.error("Error rendering BarChart:", error);
    return (
      <div className="chart-error">
        Error rendering chart. Please try refreshing the page.
      </div>
    );
  }
};

export default LazyBarChart;
