import React, { useEffect, useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const LazyPieChart = ({ data, colors }) => {
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
    // Validate data before rendering
    if (
      !data.every(
        (item) => item.value !== undefined && typeof item.value === "number"
      )
    ) {
      return (
        <div className="chart-error">Invalid data format for pie chart.</div>
      );
    }

    return (
      <div ref={containerRef} className="chart-container">
        <ResponsiveContainer width="99%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              isAnimationActive={false} // Disable animations to avoid errors
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => value} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (error) {
    console.error("Error rendering PieChart:", error);
    return (
      <div className="chart-error">
        Error rendering chart. Please try refreshing the page.
      </div>
    );
  }
};

export default LazyPieChart;
