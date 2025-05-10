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

// Language translations
const translations = {
  en: {
    disclaimer:
      "⚠️ DISCLAIMER: This dashboard is for entertainment purposes only. Betting can be addictive and lead to financial losses. Never bet more than you can afford to lose. If you or someone you know has a gambling problem, please seek help at www.gamblersanonymous.org. This is not financial advice. Bet responsibly. ⚠️",
    dashboardTitle: "Betting Performance Dashboard",
    by: "by",
    exportToPDF: "Export to PDF",
    totalProfitLoss: "Total Profit/Loss",
    roi: "ROI",
    winRate: "Win Rate",
    totalBets: "Total Bets",
    cumulativeProfitEvolution: "Cumulative Profit Evolution",
    profitLossPerBet: "Profit/Loss per Bet",
    winLossDistribution: "Win/Loss Distribution",
    bettingHistory: "Betting History",
    date: "Date",
    match: "Match",
    betType: "Bet Type",
    odds: "Odds",
    stake: "Stake",
    result: "Result",
    profitLoss: "Profit/Loss",
    cumulative: "Cumulative",
    wins: "Wins",
    losses: "Losses",
    win: "Win",
    loss: "Loss",
    viewProof: "View Bet Proof",
    closeImage: "Close",
    tooltips: {
      totalProfitLoss:
        "The net sum of all wins minus losses across all bets placed. A positive number indicates overall profit.",
      roi: "Return on Investment. The percentage return on total stakes. Calculated as (Total Returns - Total Stakes) / Total Stakes × 100%.",
      winRate:
        "The percentage of bets that resulted in a win. Calculated as (Number of Wins / Total Number of Bets) × 100%.",
      totalBets: "The total number of bets placed in this tracking period.",
      cumulativeProfit:
        "Shows how your total profit/loss accumulates over time. Each point represents the running total after each bet.",
      profitLossPerBet:
        "Shows the individual profit or loss for each bet. Green bars indicate winning bets, red bars indicate losing bets.",
      winLossDistribution:
        "The proportion of winning bets (green) versus losing bets (red) shown as a percentage of total bets placed.",
      bettingHistory:
        "A detailed record of all bets placed, including date, match, bet type, odds, stake, result, profit/loss, and running cumulative profit.",
    },
  },
  fr: {
    disclaimer:
      "⚠️ AVERTISSEMENT: Ce tableau de bord est uniquement à des fins de divertissement. Les paris peuvent créer une dépendance et entraîner des pertes financières. Ne pariez jamais plus que ce que vous pouvez vous permettre de perdre. Si vous ou quelqu'un que vous connaissez a un problème de jeu, veuillez consulter www.joueurs-info-service.fr. Ceci n'est pas un conseil financier. Pariez de manière responsable. ⚠️",
    dashboardTitle: "Tableau de Bord des Paris",
    by: "par",
    exportToPDF: "Exporter en PDF",
    totalProfitLoss: "Profit/Perte Total",
    roi: "Retour sur Investissement",
    winRate: "Taux de Réussite",
    totalBets: "Total des Paris",
    cumulativeProfitEvolution: "Évolution du Profit Cumulé",
    profitLossPerBet: "Profit/Perte par Pari",
    winLossDistribution: "Distribution Gains/Pertes",
    bettingHistory: "Historique des Paris",
    date: "Date",
    match: "Match",
    betType: "Type de Pari",
    odds: "Cotes",
    stake: "Mise",
    result: "Résultat",
    profitLoss: "Profit/Perte",
    cumulative: "Cumulatif",
    wins: "Gains",
    losses: "Pertes",
    win: "Gagné",
    loss: "Perdu",
    viewProof: "Voir Preuve du Pari",
    closeImage: "Fermer",
    tooltips: {
      totalProfitLoss:
        "La somme nette de tous les gains moins les pertes sur tous les paris placés. Un nombre positif indique un profit global.",
      roi: "Retour sur Investissement. Le pourcentage de retour sur les mises totales. Calculé comme (Retours Totaux - Mises Totales) / Mises Totales × 100%.",
      winRate:
        "Le pourcentage de paris ayant abouti à un gain. Calculé comme (Nombre de Gains / Nombre Total de Paris) × 100%.",
      totalBets:
        "Le nombre total de paris placés pendant cette période de suivi.",
      cumulativeProfit:
        "Montre comment votre profit/perte total s'accumule au fil du temps. Chaque point représente le total après chaque pari.",
      profitLossPerBet:
        "Montre le profit ou la perte individuel pour chaque pari. Les barres vertes indiquent les paris gagnants, les barres rouges les paris perdants.",
      winLossDistribution:
        "La proportion de paris gagnants (vert) par rapport aux paris perdants (rouge) exprimée en pourcentage du total des paris placés.",
      bettingHistory:
        "Un enregistrement détaillé de tous les paris placés, incluant la date, le match, le type de pari, les cotes, la mise, le résultat, le profit/perte et le profit cumulatif.",
    },
  },
};

// English translations of bet types
const betTypeTranslations = {
  "Résultat R. Madrid": "R. Madrid Win",
  "Double chance et nombre de buts R. Madrid/match nul et moins de 3,5":
    "Double chance R. Madrid/draw and under 3.5 goals",
  "Les 2 équipes marquent Oui": "Both teams to score Yes",
  "Résultat Naples": "Napoli Win",
};

// Image Modal Component
const ImageModal = ({ isOpen, imageUrl, onClose, language }) => {
  if (!isOpen) return null;

  console.log("Opening modal with image:", imageUrl);

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-modal-close" onClick={onClose}>
          {translations[language].closeImage} &times;
        </button>
        <img
          src={imageUrl}
          alt="Bet Proof"
          className="image-modal-img"
          onError={(e) => {
            console.error("Error loading image:", imageUrl);
            console.error(
              "Full URL attempted:",
              `${window.location.origin}/${imageUrl}`
            );
            console.error("Browser error:", e.target.error);
            e.target.onerror = null;
            e.target.src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YxZjFmMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=";
          }}
        />
      </div>
    </div>
  );
};

// Image Icon Component
const ImageIcon = ({ onClick }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="image-icon"
    onClick={onClick}
  >
    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
  </svg>
);

const DisclaimerBanner = ({ language }) => {
  return (
    <div className="disclaimer-banner">
      <div className="disclaimer-content">
        <span>{translations[language].disclaimer}</span>
        <span>{translations[language].disclaimer}</span>
      </div>
    </div>
  );
};

const InfoTooltip = ({ text }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="info-tooltip-container">
      <div
        className="info-icon"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
      </div>
      {showTooltip && <div className="info-tooltip">{text}</div>}
    </div>
  );
};

const LanguageToggle = ({ language, setLanguage }) => {
  return (
    <div className="language-toggle">
      <button
        className={`language-btn ${language === "en" ? "active" : ""}`}
        onClick={() => setLanguage("en")}
      >
        EN
      </button>
      <button
        className={`language-btn ${language === "fr" ? "active" : ""}`}
        onClick={() => setLanguage("fr")}
      >
        FR
      </button>
    </div>
  );
};

const BettingDashboard = () => {
  const dashboardRef = useRef(null);
  const [language, setLanguage] = useState("en");
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Betting data from screenshots
  const originalBets = [
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
      imageUrl: "/images/april2025/RMadridVSArsenal-04162025.jpeg",
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
      imageUrl: "/images/april2025/RMadridVSATBilbao-04202025.jpeg",
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
      imageUrl: "/images/april2025/GetafeVSRMadrid-04232025.jpeg",
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
      imageUrl: "/images/april2025/FCBarcelonaVSRMadrid-04262025.jpeg",
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
      imageUrl: "/images/may2025/LecceVSNapoli-05032025.jpeg",
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
      imageUrl: "/images/may2025/InterMilanVSFCBarcelona-05062025.jpeg",
    },
  ];

  // English date format
  const frenchToEnglishDate = (frenchDate) => {
    const months = {
      janvier: "January",
      février: "February",
      mars: "March",
      avril: "April",
      mai: "May",
      juin: "June",
      juillet: "July",
      août: "August",
      septembre: "September",
      octobre: "October",
      novembre: "November",
      décembre: "December",
    };

    const parts = frenchDate.split(" ");
    if (parts.length === 3) {
      return `${parts[0]} ${months[parts[1]]} ${parts[2]}`;
    }
    return frenchDate;
  };

  // Get translated betting data
  const getBets = () => {
    if (language === "en") {
      return originalBets.map((bet) => ({
        ...bet,
        date: bet.date.replace("avril", "April").replace("mai", "May"),
        bet: betTypeTranslations[bet.bet] || bet.bet,
        result:
          bet.result === "Win" ? translations.en.win : translations.en.loss,
      }));
    } else {
      return originalBets.map((bet) => ({
        ...bet,
        result:
          bet.result === "Win" ? translations.fr.win : translations.fr.loss,
      }));
    }
  };

  const bets = getBets();

  // Calculate statistics
  const totalBets = bets.length;
  const winCount = bets.filter(
    (bet) => bet.result === "Win" || bet.result === "Gagné"
  ).length;
  const lossCount = totalBets - winCount;
  const winRate = (winCount / totalBets) * 100;
  const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalReturns = bets.reduce((sum, bet) => sum + bet.gains, 0);
  const totalProfit = totalReturns - totalStake;
  const roi = (totalProfit / totalStake) * 100;

  // Data for pie chart
  const resultData = [
    { name: translations[language].wins, value: winCount },
    { name: translations[language].losses, value: lossCount },
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

  const openModal = (imageUrl) => {
    console.log("Attempting to open image:", imageUrl);
    console.log("Full image path:", `${window.location.origin}/${imageUrl}`);
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DisclaimerBanner language={language} />

      <div className="p-4 bg-white">
        <div className="dashboard-header">
          <LanguageToggle language={language} setLanguage={setLanguage} />

          <div className="flex justify-between items-center mb-6">
            <div className="dashboard-title">
              <h1 className="text-2xl font-bold text-center">
                {translations[language].dashboardTitle}
                <span className="dashboard-author">
                  {translations[language].by}{" "}
                  <a
                    href="https://sidneydev.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Sidney
                  </a>
                </span>
              </h1>
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={exportToPDF}
            >
              {translations[language].exportToPDF}
            </button>
          </div>
        </div>

        <div ref={dashboardRef} className="flex flex-col">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center mb-2">
                <h2 className="text-lg font-semibold">
                  {translations[language].totalProfitLoss}
                </h2>
                <div className="ml-2">
                  <InfoTooltip
                    text={translations[language].tooltips.totalProfitLoss}
                  />
                </div>
              </div>
              <p
                className={`text-2xl font-bold ${
                  totalProfit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                €{totalProfit.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center mb-2">
                <h2 className="text-lg font-semibold">
                  {translations[language].roi}
                </h2>
                <div className="ml-2">
                  <InfoTooltip text={translations[language].tooltips.roi} />
                </div>
              </div>
              <p
                className={`text-2xl font-bold ${
                  roi >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {roi.toFixed(2)}%
              </p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center mb-2">
                <h2 className="text-lg font-semibold">
                  {translations[language].winRate}
                </h2>
                <div className="ml-2">
                  <InfoTooltip text={translations[language].tooltips.winRate} />
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {winRate.toFixed(2)}%
              </p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center mb-2">
                <h2 className="text-lg font-semibold">
                  {translations[language].totalBets}
                </h2>
                <div className="ml-2">
                  <InfoTooltip
                    text={translations[language].tooltips.totalBets}
                  />
                </div>
              </div>
              <p className="text-2xl font-bold">{totalBets}</p>
            </div>
          </div>

          {/* Profit Evolution Chart */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <div className="flex items-center mb-4">
              <h2 className="text-lg font-semibold">
                {translations[language].cumulativeProfitEvolution}
              </h2>
              <div className="ml-2">
                <InfoTooltip
                  text={translations[language].tooltips.cumulativeProfit}
                />
              </div>
            </div>
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
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {translations[language].profitLossPerBet}
                </h2>
                <div className="ml-2">
                  <InfoTooltip
                    text={translations[language].tooltips.profitLossPerBet}
                  />
                </div>
              </div>
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
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {translations[language].winLossDistribution}
                </h2>
                <div className="ml-2">
                  <InfoTooltip
                    text={translations[language].tooltips.winLossDistribution}
                  />
                </div>
              </div>
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
            <div className="flex items-center mb-4">
              <h2 className="text-lg font-semibold">
                {translations[language].bettingHistory}
              </h2>
              <div className="ml-2">
                <InfoTooltip
                  text={translations[language].tooltips.bettingHistory}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="py-2 px-4 text-left">
                      {translations[language].date}
                    </th>
                    <th className="py-2 px-4 text-left">
                      {translations[language].match}
                    </th>
                    <th className="py-2 px-4 text-left">
                      {translations[language].betType}
                    </th>
                    <th className="py-2 px-4 text-left">
                      {translations[language].odds}
                    </th>
                    <th className="py-2 px-4 text-left">
                      {translations[language].stake}
                    </th>
                    <th className="py-2 px-4 text-left">
                      {translations[language].result}
                    </th>
                    <th className="py-2 px-4 text-left">
                      {translations[language].profitLoss}
                    </th>
                    <th className="py-2 px-4 text-left">
                      {translations[language].cumulative}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bets.map((bet, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="py-2 px-4">{bet.date}</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center">
                          {bet.match}
                          {bet.imageUrl && (
                            <div
                              className="ml-2"
                              title={translations[language].viewProof}
                            >
                              <ImageIcon
                                onClick={() => openModal(bet.imageUrl)}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-4">{bet.bet}</td>
                      <td className="py-2 px-4">{bet.odds.toFixed(2)}</td>
                      <td className="py-2 px-4">€{bet.stake.toFixed(2)}</td>
                      <td
                        className={`py-2 px-4 font-medium ${
                          bet.result === "Win" || bet.result === "Gagné"
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

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        imageUrl={modalImage}
        onClose={closeModal}
        language={language}
      />
    </div>
  );
};

export default BettingDashboard;
