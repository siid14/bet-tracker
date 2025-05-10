import React, { useRef, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const DisclaimerBanner = () => {
  return (
    <div className="disclaimer-banner">
      <div className="disclaimer-content">
        <span>
          ⚠️ DISCLAIMER: This dashboard is for entertainment purposes only.
          Betting can be addictive and lead to financial losses. Never bet more
          than you can afford to lose. If you or someone you know has a gambling
          problem, please seek help at www.gamblersanonymous.org. This is not
          financial advice. Bet responsibly. ⚠️
        </span>
        <span>
          ⚠️ DISCLAIMER: This dashboard is for entertainment purposes only.
          Betting can be addictive and lead to financial losses. Never bet more
          than you can afford to lose. If you or someone you know has a gambling
          problem, please seek help at www.gamblersanonymous.org. This is not
          financial advice. Bet responsibly. ⚠️
        </span>
      </div>
    </div>
  );
};

const BettingDashboard = () => {
  const dashboardRef = useRef(null);

  // Betting data from screenshots
  const bets = [
    {
      date: "16 avril 2025",
      shortDate: "16/04",
      match: "Real Madrid 1 - 2 Arsenal",
      bet: "Résultat R. Madrid",
      odds: 1.84,
      stake: 100,
      gains: 0,
      result: "Loss",
      profitLoss: -100,
      cumulativeProfit: -100,
    },
    {
      date: "20 avril 2025",
      shortDate: "20/04",
      match: "Real Madrid 1 - 0 Athletic Bilbao",
      bet: "Double chance et nombre de buts R. Madrid/match nul et moins de 3,5",
      odds: 1.6,
      stake: 100,
      gains: 160,
      result: "Win",
      profitLoss: 60,
      cumulativeProfit: -40,
    },
    {
      date: "23 avril 2025",
      shortDate: "23/04",
      match: "Getafe 0 - 1 Real Madrid",
      bet: "Double chance et nombre de buts R. Madrid/match nul et moins de 3,5",
      odds: 1.44,
      stake: 100,
      gains: 144,
      result: "Win",
      profitLoss: 44,
      cumulativeProfit: 4,
    },
    {
      date: "26 avril 2025",
      shortDate: "26/04",
      match: "FC Barcelone 3 - 2 Real Madrid (reg 2-2)",
      bet: "Les 2 équipes marquent Oui",
      odds: 1.34,
      stake: 100,
      gains: 134,
      result: "Win",
      profitLoss: 34,
      cumulativeProfit: 38,
    },
    {
      date: "3 mai 2025",
      shortDate: "03/05",
      match: "Lecce 0 - 1 Naples",
      bet: "Résultat Naples",
      odds: 1.5,
      stake: 100,
      gains: 150,
      result: "Win",
      profitLoss: 50,
      cumulativeProfit: 88,
    },
    {
      date: "6 mai 2025",
      shortDate: "06/05",
      match: "Inter Milan 4 - 3 FC Barcelone (reg 3-3)",
      bet: "Les 2 équipes marquent Oui",
      odds: 1.46,
      stake: 100,
      gains: 146,
      result: "Win",
      profitLoss: 46,
      cumulativeProfit: 134,
    },
  ];

  // Calculate statistics
  const totalBets = bets.length;
  const winCount = bets.filter((bet) => bet.result === "Win").length;
  const lossCount = totalBets - winCount;
  const winRate = (winCount / totalBets) * 100;
  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalReturns = bets.reduce((sum, bet) => sum + bet.gains, 0);
  const totalProfit = totalReturns - totalStake;
  const roi = (totalProfit / totalStake) * 100;

  // Data for pie chart
  const resultData = [
    { name: "Wins", value: winCount },
    { name: "Losses", value: lossCount },
  ];

  const COLORS = ["#4CAF50", "#F44336"];

  // Data for bet type distribution
  const betTypes = {};
  bets.forEach((bet) => {
    if (!betTypes[bet.bet]) {
      betTypes[bet.bet] = 0;
    }
    betTypes[bet.bet]++;
  });

  const betTypeData = Object.keys(betTypes).map((type) => ({
    name: type.length > 15 ? type.substring(0, 15) + "..." : type,
    fullName: type,
    count: betTypes[type],
  }));

  const exportToPDF = () => {
    const input = dashboardRef.current;
    html2canvas(input, { scale: 1 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );
      pdf.save("betting-dashboard.pdf");
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DisclaimerBanner />

      <div className="p-4 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-center">
            Betting Performance Dashboard
          </h1>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={exportToPDF}
          >
            Export to PDF
          </button>
        </div>

        <div ref={dashboardRef} className="flex flex-col">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">Total Profit/Loss</h2>
              <p
                className={`text-2xl font-bold ${
                  totalProfit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                €{totalProfit.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">ROI</h2>
              <p
                className={`text-2xl font-bold ${
                  roi >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {roi.toFixed(2)}%
              </p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">Win Rate</h2>
              <p className="text-2xl font-bold text-blue-600">
                {winRate.toFixed(2)}%
              </p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">Total Bets</h2>
              <p className="text-2xl font-bold">{totalBets}</p>
            </div>
          </div>

          {/* Profit Evolution Chart */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Cumulative Profit Evolution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bets}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="shortDate" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cumulativeProfit"
                  name="Cumulative Profit"
                  stroke="#2196F3"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Individual Bet Profit/Loss */}
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-4">
                Profit/Loss per Bet
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bets}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="shortDate" />
                  <YAxis />
                  <Tooltip formatter={(value) => `€${value}`} />
                  <Bar
                    dataKey="profitLoss"
                    name="Profit/Loss"
                    fill={(data) => (data > 0 ? "#4CAF50" : "#F44336")}
                  >
                    {bets.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.profitLoss >= 0 ? "#4CAF50" : "#F44336"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Win/Loss Ratio */}
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-4">
                Win/Loss Distribution
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={resultData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {resultData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Betting Details Table */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Betting History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="py-2 px-4 text-left">Date</th>
                    <th className="py-2 px-4 text-left">Match</th>
                    <th className="py-2 px-4 text-left">Bet Type</th>
                    <th className="py-2 px-4 text-left">Odds</th>
                    <th className="py-2 px-4 text-left">Stake</th>
                    <th className="py-2 px-4 text-left">Result</th>
                    <th className="py-2 px-4 text-left">Profit/Loss</th>
                    <th className="py-2 px-4 text-left">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {bets.map((bet, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="py-2 px-4">{bet.date}</td>
                      <td className="py-2 px-4">{bet.match}</td>
                      <td className="py-2 px-4">{bet.bet}</td>
                      <td className="py-2 px-4">{bet.odds.toFixed(2)}</td>
                      <td className="py-2 px-4">€{bet.stake.toFixed(2)}</td>
                      <td
                        className={`py-2 px-4 font-medium ${
                          bet.result === "Win"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {bet.result}
                      </td>
                      <td
                        className={`py-2 px-4 font-medium ${
                          bet.profitLoss >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        €{bet.profitLoss.toFixed(2)}
                      </td>
                      <td
                        className={`py-2 px-4 font-medium ${
                          bet.cumulativeProfit >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        €{bet.cumulativeProfit.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BettingDashboard;
