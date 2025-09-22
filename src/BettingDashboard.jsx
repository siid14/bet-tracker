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
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import ImageModal from "./components/ImageModal";
import LazyImage from "./components/LazyImage";
import { compressImage } from "./utils/ImageCompression";
import useMobileDetection from "./hooks/useMobileDetection";

// Language translations
const translations = {
  en: {
    disclaimer:
      "⚠️ DISCLAIMER: This dashboard is for entertainment purposes only. Betting can be addictive and lead to financial losses. Never bet more than you can afford to lose. If you or someone you know has a gambling problem, please seek help at www.gamblersanonymous.org. This is not financial advice. Bet responsibly. ⚠️",
    dashboardTitle: "Betting Performance Dashboard",
    by: "by",
    exportToPDF: "Export to PDF",
    exportError:
      "PDF export may not work on all mobile devices. Please try on desktop.",
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
    loadingImage: "Loading image...",
    imageError: "Unable to load image",
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
    exportError:
      "L'export PDF peut ne pas fonctionner sur tous les appareils mobiles. Veuillez essayer sur ordinateur.",
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
    loadingImage: "Chargement de l'image...",
    imageError: "Impossible de charger l'image",
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
  "Double chance Inter ou match nul": "Double chance Inter or draw",
  "Nombre de buts de PSG Plus de 0,5": "PSG Over 0.5 Goals",
  "Nombre de buts Plus de 1,5": "Total goals Over 1.5",
  "Qualification Manchester City": "Qualification Manchester City",
  "Double chance R. Madrid ou match nul": "Double chance R. Madrid or draw",
  "Double chance PSG ou match nul": "Double chance PSG or draw",
  "Résultat Liverpool": "Liverpool Win",
  "Résultat FC Barcelone": "FC Barcelona to Win",
  "Vainqueur de la finale B. Munich": "Bayern Munich to Win",
  "Double chance FC Barcelone ou match nul":
    "Double chance FC Barcelona or draw",
};

// Image Icon Component
const ImageIcon = ({ onClick }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="image-icon"
    onClick={onClick}
    role="button"
    tabIndex={0}
    aria-label="View bet image"
    onKeyDown={(e) => e.key === "Enter" && onClick()}
  >
    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
  </svg>
);

const LazyImageIcon = ({ onClick }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="image-icon"
    onClick={onClick}
    role="button"
    tabIndex={0}
    aria-label="View bet image"
    onKeyDown={(e) => e.key === "Enter" && onClick()}
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
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      setShowTooltip(!showTooltip);
      e.preventDefault();
    }
  };

  return (
    <div className="info-tooltip-container">
      <div
        className="info-icon"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={showTooltip}
        aria-describedby={tooltipId}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
      </div>
      {showTooltip && (
        <div className="info-tooltip" id={tooltipId} role="tooltip">
          {text}
        </div>
      )}
    </div>
  );
};

const LanguageToggle = ({ language, setLanguage }) => {
  return (
    <div
      className="language-toggle"
      role="radiogroup"
      aria-label="Language selection"
    >
      <button
        className={`language-btn ${language === "en" ? "active" : ""}`}
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        tabIndex={0}
      >
        EN 🇬🇧
      </button>
      <button
        className={`language-btn ${language === "fr" ? "active" : ""}`}
        onClick={() => setLanguage("fr")}
        aria-pressed={language === "fr"}
        tabIndex={0}
      >
        FR 🇫🇷
      </button>
    </div>
  );
};

const BettingDashboard = () => {
  const dashboardRef = useRef(null);
  const [language, setLanguage] = useState("en");
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mobile detection hook
  const { isMobile, isSmallMobile, isTouch } = useMobileDetection();

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
    {
      date: "9 mai 2025",
      shortDate: "09/05",
      match: "FC Barcelone 4 - 3 Real Madrid",
      bet: "Les 2 équipes marquent Oui",
      odds: 1.31,
      stake: 100,
      gains: 131,
      result: "Win",
      profitLoss: 31,
      cumulativeProfit: 165,
      imageUrl: "/images/may2025/FCBarcelonaVSRMadrid-05112025.jpeg",
    },
    {
      date: "15 mai 2025",
      shortDate: "15/05",
      match: "Espanyol Barcelone 0 - 2 FC Barcelone",
      bet: "Résultat FC Barcelone",
      odds: 1.34,
      stake: 100,
      gains: 134,
      result: "Win",
      profitLoss: 34,
      cumulativeProfit: 199,
      imageUrl: "/images/may2025/EspanyolVSBarcelona-05152025.jpeg",
    },
    {
      date: "22 mai 2025",
      shortDate: "22/05",
      match: "Côme 0 - 2 Inter Milan",
      bet: "Double chance Inter ou match nul",
      odds: 1.16,
      stake: 150,
      gains: 174,
      result: "Win",
      profitLoss: 24,
      cumulativeProfit: 223,
      imageUrl: "/images/may2025/ComoVSInterMilan-05242025.jpeg",
    },
    {
      date: "31 mai 2025",
      shortDate: "31/05",
      match: "Paris SG 5 - 0 Inter Milan",
      bet: "Nombre de buts de PSG Plus de 0,5",
      odds: 1.18,
      stake: 150,
      gains: 177,
      result: "Win",
      profitLoss: 27,
      cumulativeProfit: 250,
      imageUrl: "/images/may2025/PSGVSInterMilan-05212025.jpeg",
    },
    {
      date: "16 juin 2025",
      shortDate: "16/06",
      match: "Monterrey 1 - 1 Inter Milan",
      bet: "Double chance Inter ou match nul",
      odds: 1.08,
      stake: 150,
      gains: 162,
      result: "Win",
      profitLoss: 12,
      cumulativeProfit: 262,
      imageUrl: "/images/june2025/MonterreyVSInterMilan-06172025.jpeg",
    },
    {
      date: "17 juin 2025",
      shortDate: "17/06",
      match: "Manchester City 2 - 0 Wydad Casablanca",
      bet: "Nombre de buts Plus de 1,5",
      odds: 1.1,
      stake: 150,
      gains: 165,
      result: "Win",
      profitLoss: 15,
      cumulativeProfit: 277,
      imageUrl: "/images/june2025/ManCityVSCasablanca-06182025.jpeg",
    },
    {
      date: "19 juin 2025",
      shortDate: "19/06",
      match: "Manchester City 6 - 0 Al Ain",
      bet: "Nombre de buts Plus de 1,5",
      odds: 1.1,
      stake: 150,
      gains: 165,
      result: "Win",
      profitLoss: 15,
      cumulativeProfit: 292,
      imageUrl: "/images/june2025/ManCityVSAlAin-06192025.jpeg",
    },
    {
      date: "29 juin 2025",
      shortDate: "29/06",
      match: "Manchester City 3 - 4 Al-Hilal (reg 2-2)",
      bet: "Qualification Manchester City",
      odds: 1.11,
      stake: 200.0,
      gains: 0.0,
      result: "Loss",
      profitLoss: -200.0,
      cumulativeProfit: 92.0,
      imageUrl: "/images/june2025/ManCityVSAlHilal-06292025.jpeg",
    },
    {
      date: "1 juillet 2025",
      shortDate: "01/07",
      match: "Real Madrid 1 - 0 Juventus Turin",
      bet: "Double chance R. Madrid ou match nul",
      odds: 1.2,
      stake: 108.0,
      gains: 129.6,
      result: "Win",
      profitLoss: 21.6,
      cumulativeProfit: 113.6,
      imageUrl: "/images/may2025/RealMadridVSJuventus-07012025.jpeg",
    },
    // NEW BET: Chelsea vs PSG, 9 juillet 2025 (Lost bet)
    {
      date: "9 juillet 2025",
      shortDate: "09/07",
      match: "Chelsea 3 - 0 Paris SG",
      bet: "Double chance PSG ou match nul",
      odds: 1.14,
      stake: 150.34,
      gains: 0,
      result: "Loss",
      profitLoss: -150.34,
      cumulativeProfit: -15.68,
      imageUrl: "/images/may2025/ChelseaVSPSG-07092025.jpeg",
    },
    // NEW BET: Real Madrid vs Borussia Dortmund, 4 juillet 2025
    {
      date: "4 juillet 2025",
      shortDate: "04/07",
      match: "Real Madrid 3 - 2 Borussia Dortmund",
      bet: "Double chance R. Madrid ou match nul",
      odds: 1.16,
      stake: 129.6,
      gains: 150.34,
      result: "Win",
      profitLoss: 20.74,
      cumulativeProfit: 5.06,
      imageUrl: "/images/may2025/RealMadridVSBorussiaDortmund-06042025.jpeg",
    },
    // NEW BET: Liverpool vs Bournemouth, 15 août 2025 (Won bet)
    {
      date: "15 août 2025",
      shortDate: "15/08",
      match: "Liverpool 4 - 2 Bournemouth",
      bet: "Résultat Liverpool",
      odds: 1.28,
      stake: 100.0,
      gains: 128.0,
      result: "Win",
      profitLoss: 28.0,
      cumulativeProfit: 33.06,
      imageUrl: "/images/august2025/LiverpoolVSBournemouth-08152025.jpeg",
    },
    // NEW BET: Bayern Munich vs VfB Stuttgart, 16 août 2025 (Won bet)
    {
      date: "16 août 2025",
      shortDate: "16/08",
      match: "VfB Stuttgart 1 - 2 Bayern Munich",
      bet: "Vainqueur de la finale B. Munich",
      odds: 1.25,
      stake: 100.0,
      gains: 125.0,
      result: "Win",
      profitLoss: 25.0,
      cumulativeProfit: 58.06,
      imageUrl: "/images/august2025/StugarttVSBMunich-08162025.jpeg",
    },
    // NEW BET: Real Madrid vs Osasuna, 18 août 2025 (Won bet)
    {
      date: "18 août 2025",
      shortDate: "18/08",
      match: "Real Madrid 1 - 0 Osasuna",
      bet: "Résultat R. Madrid",
      odds: 1.21,
      stake: 100.0,
      gains: 121.0,
      result: "Win",
      profitLoss: 21.0,
      cumulativeProfit: 79.06,
      imageUrl: "/images/august2025/RMadridVSOsasuna-08182025.jpeg",
    },
    // NEW BET: Levante vs FC Barcelona, 23 août 2025 (Won bet)
    {
      date: "23 août 2025",
      shortDate: "23/08",
      match: "Levante 2 - 3 FC Barcelone",
      bet: "Résultat FC Barcelone",
      odds: 1.22,
      stake: 100.0,
      gains: 122.0,
      result: "Win",
      profitLoss: 22.0,
      cumulativeProfit: 101.06,
      imageUrl: "/images/august2025/LevanteVSFCBarcelona-08232025.jpeg",
    },
    // NEW BET: Real Oviedo vs Real Madrid, 24 août 2025 (Won bet)
    {
      date: "24 août 2025",
      shortDate: "24/08",
      match: "Real Oviedo 0 - 3 Real Madrid",
      bet: "Résultat R. Madrid",
      odds: 1.28,
      stake: 100.0,
      gains: 128.0,
      result: "Win",
      profitLoss: 28.0,
      cumulativeProfit: 129.06,
      imageUrl: "/images/august2025/R.OviedoVSR.Madrid-08242025.jpeg",
    },
    // NEW BET: Real Madrid vs Mallorca, 30 août 2025 (Won bet)
    {
      date: "30 août 2025",
      shortDate: "30/08",
      match: "Real Madrid 2 - 1 Majorque",
      bet: "Résultat R. Madrid",
      odds: 1.17,
      stake: 100.0,
      gains: 117.0,
      result: "Win",
      profitLoss: 17.0,
      cumulativeProfit: 146.06,
      imageUrl: "/images/august2025/RMadridVSMallorca-08302025.jpeg",
    },
    // NEW BET: Rayo Vallecano vs FC Barcelona, 31 août 2025 (Won bet)
    {
      date: "31 août 2025",
      shortDate: "31/08",
      match: "Rayo Vallecano 1 - 1 FC Barcelone",
      bet: "Double chance FC Barcelone ou match nul",
      odds: 1.08,
      stake: 100.0,
      gains: 108.0,
      result: "Win",
      profitLoss: 8.0,
      cumulativeProfit: 154.06,
      imageUrl: "/images/august2025/RayoVallecanoVSFCBarcelona-08312025.jpeg",
    },
    // NEW BET: Heidenheim vs Borussia Dortmund, 12 septembre 2025 (Won bet)
    {
      date: "12 septembre 2025",
      shortDate: "12/09",
      match: "Heidenheim 0 - 2 Borussia Dortmund",
      bet: "Nombre de buts Plus de 1,5",
      odds: 1.14,
      stake: 100.0,
      gains: 114.0,
      result: "Win",
      profitLoss: 14.0,
      cumulativeProfit: 168.06,
      imageUrl: "/images/sept2025/HeidenhemVSBVB-09132025.jpeg",
    },
    // NEW BET: Burnley vs Liverpool, 14 septembre 2025 (Lost bet)
    {
      date: "14 septembre 2025",
      shortDate: "14/09",
      match: "Burnley 0 - 1 Liverpool",
      bet: "Nombre de buts Plus de 1,5",
      odds: 1.14,
      stake: 100.0,
      gains: 0.0,
      result: "Loss",
      profitLoss: -100.0,
      cumulativeProfit: 68.06,
      imageUrl: "/images/sept2025/BurnleyVSLiverpool-09142025.jpeg",
    },
    // NEW BET: Manchester City vs Manchester United, 14 septembre 2025 (Lost bet)
    {
      date: "14 septembre 2025",
      shortDate: "14/09",
      match: "Manchester City 3 - 0 Manchester United",
      bet: "Les 2 équipes marquent Oui",
      odds: 1.52,
      stake: 75.8,
      gains: 0.0,
      result: "Loss",
      profitLoss: -75.8,
      cumulativeProfit: -7.74,
      imageUrl: "/images/sept2025/ManCityVSManUtd-09142025.jpeg",
    },
    // NEW BET: Real Madrid vs Marseille, 15 septembre 2025 (Won bet)
    {
      date: "15 septembre 2025",
      shortDate: "15/09",
      match: "Real Madrid 2 - 1 Marseille",
      bet: "Résultat R. Madrid",
      odds: 1.34,
      stake: 100.0,
      gains: 134.0,
      result: "Win",
      profitLoss: 34.0,
      cumulativeProfit: 26.26,
      imageUrl: "/images/sept2025/RMadridVSOM-09162025.jpeg",
    },
    // NEW BET: Newcastle vs FC Barcelona, 17 septembre 2025 (Won bet)
    {
      date: "17 septembre 2025",
      shortDate: "17/09",
      match: "Newcastle 1 - 2 FC Barcelone",
      bet: "Double chance FC Barcelone ou match nul",
      odds: 1.48,
      stake: 100.0,
      gains: 148.0,
      result: "Win",
      profitLoss: 48.0,
      cumulativeProfit: 74.26,
      imageUrl: "/images/sept2025/NewcastleVSBarcelona-09182025.jpeg",
    },
    // NEW BET: FC Barcelona vs Getafe, 21 septembre 2025 (Won bet)
    {
      date: "21 septembre 2025",
      shortDate: "21/09",
      match: "FC Barcelone 3 - 0 Getafe",
      bet: "Résultat FC Barcelone",
      odds: 1.2,
      stake: 100.0,
      gains: 120.0,
      result: "Win",
      profitLoss: 20.0,
      cumulativeProfit: 94.26,
      imageUrl: "/images/sept2025/FCBarcelonaVSGetafe-09212025.jpeg",
    },
    // NEW BET: Naples vs Pisa, 22 septembre 2025 (Won bet)
    {
      date: "22 septembre 2025",
      shortDate: "22/09",
      match: "Naples 3 - 2 Pisa",
      bet: "Résultat Naples",
      odds: 1.22,
      stake: 100.0,
      gains: 122.0,
      result: "Win",
      profitLoss: 22.0,
      cumulativeProfit: 116.26,
      imageUrl: "/images/sept2025/NaplesVSPisa-09212025.jpeg",
    },
  ];

  // Function to calculate cumulative profits correctly
  const calculateCumulativeProfits = (bets) => {
    let runningTotal = 0;
    return bets.map((bet) => {
      runningTotal += bet.profitLoss;
      return {
        ...bet,
        cumulativeProfit: Math.round(runningTotal * 100) / 100, // Round to 2 decimal places
      };
    });
  };

  // Function to sort bets chronologically
  const sortBetsChronologically = (bets) => {
    const monthOrder = {
      avril: 4,
      mai: 5,
      juin: 6,
      juillet: 7,
      août: 8,
      septembre: 9,
    };

    return bets.sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split(" ");
      const [dayB, monthB, yearB] = b.date.split(" ");

      const dateA = new Date(
        parseInt(yearA),
        monthOrder[monthA] - 1,
        parseInt(dayA)
      );
      const dateB = new Date(
        parseInt(yearB),
        monthOrder[monthB] - 1,
        parseInt(dayB)
      );

      return dateA - dateB;
    });
  };

  // Apply sorting and cumulative profit calculation
  const sortedBets = sortBetsChronologically(originalBets);
  const originalBetsWithCorrectCumulative =
    calculateCumulativeProfits(sortedBets);

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
      return originalBetsWithCorrectCumulative.map((bet) => ({
        ...bet,
        date: bet.date
          .replace("avril", "April")
          .replace("mai", "May")
          .replace("juin", "June")
          .replace("juillet", "July")
          .replace("août", "August")
          .replace("septembre", "September"),
        bet: betTypeTranslations[bet.bet] || bet.bet,
        result:
          bet.result === "Win" ? translations.en.win : translations.en.loss,
      }));
    } else {
      return originalBetsWithCorrectCumulative.map((bet) => ({
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

  const COLORS = ["#047857", "#b91c1c"];

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

    // Mobile-optimized canvas options
    const canvasOptions = {
      scale: isMobile ? 0.8 : 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: isMobile ? input.scrollWidth * 0.8 : input.scrollWidth,
      height: isMobile ? input.scrollHeight * 0.8 : input.scrollHeight,
    };

    html2canvas(input, canvasOptions)
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png", 0.9);
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

        // Add mobile indicator to filename if on mobile
        const filename = isMobile
          ? "betting-dashboard-mobile.pdf"
          : "betting-dashboard.pdf";
        pdf.save(filename);
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
        // Fallback for mobile devices that might have issues with PDF generation
        if (isMobile) {
          alert(
            translations[language].exportError ||
              "PDF export may not work on all mobile devices. Please try on desktop."
          );
        }
      });
  };

  const openModal = (imageUrl) => {
    console.log("Attempting to open image:", imageUrl);
    // Show modal with loading state first
    setIsModalOpen(true);
    setModalImage(imageUrl);

    // Compression happens in the modal component itself
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
  };

  return (
    <div className="dashboard-main-container flex flex-col min-h-screen">
      <DisclaimerBanner language={language} />

      <div className="dashboard-header">
        <LanguageToggle language={language} setLanguage={setLanguage} />
        <div className="flex justify-between items-center mb-6">
          <div className="dashboard-title">
            <h1>
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
            aria-label="Export dashboard to PDF"
            tabIndex={0}
          >
            {translations[language].exportToPDF}
          </button>
        </div>
      </div>

      <div ref={dashboardRef} className="flex flex-col">
        {/* Summary Cards */}
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <div className="dashboard-card-label flex items-center mb-2">
              {translations[language].totalProfitLoss}
              <div className="ml-2">
                <InfoTooltip
                  text={translations[language].tooltips.totalProfitLoss}
                />
              </div>
            </div>
            <div
              className={`dashboard-card-value ${
                totalProfit >= 0 ? "positive" : "negative"
              }`}
            >
              €{totalProfit.toFixed(2)}
            </div>
          </div>
          <div className="dashboard-card green">
            <div className="dashboard-card-label flex items-center mb-2">
              {translations[language].roi}
              <div className="ml-2">
                <InfoTooltip text={translations[language].tooltips.roi} />
              </div>
            </div>
            <div
              className={`dashboard-card-value ${
                roi >= 0 ? "positive" : "negative"
              }`}
            >
              {roi.toFixed(2)}%
            </div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-label flex items-center mb-2">
              {translations[language].winRate}
              <div className="ml-2">
                <InfoTooltip text={translations[language].tooltips.winRate} />
              </div>
            </div>
            <div className="dashboard-card-value" style={{ color: "#fff" }}>
              {winRate.toFixed(2)}%
            </div>
          </div>
          <div className="dashboard-card accent">
            <div className="dashboard-card-label flex items-center mb-2">
              {translations[language].totalBets}
              <div className="ml-2">
                <InfoTooltip text={translations[language].tooltips.totalBets} />
              </div>
            </div>
            <div className="dashboard-card-value" style={{ color: "#fff" }}>
              {totalBets}
            </div>
          </div>
        </div>

        {/* Accent Section (optional, e.g. for ROI explanation) */}
        {/* <div className="dashboard-accent-section">
          <span className="gradient-text" style={{ fontWeight: 600, fontSize: '1.1em' }}>
            {translations[language].tooltips.roi}
          </span>
        </div> */}

        {/* Charts Section */}
        <div className="dashboard-charts">
          {/* Profit Evolution Chart */}
          <div
            className="bg-white p-4 rounded shadow"
            style={{
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 10px 20px rgba(0,0,0,0.10)",
              borderRadius: "18px",
            }}
          >
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
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <LineChart data={bets}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="shortDate"
                  fontSize={isMobile ? 10 : 12}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  height={isMobile ? 60 : 30}
                />
                <YAxis fontSize={isMobile ? 10 : 12} />
                <Tooltip
                  formatter={(value) => `€${value}`}
                  labelStyle={{ fontSize: isMobile ? "12px" : "14px" }}
                  contentStyle={{ fontSize: isMobile ? "12px" : "14px" }}
                />
                <Legend iconSize={isMobile ? 12 : 18} />
                <Line
                  type="monotone"
                  dataKey="cumulativeProfit"
                  name="Cumulative Profit"
                  stroke="#1e40af"
                  strokeWidth={isMobile ? 1.5 : 2}
                  dot={{ r: isMobile ? 3 : 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Win/Loss Ratio & Bet Profit/Loss */}
          <div className="flex flex-col gap-6">
            {/* Individual Bet Profit/Loss */}
            <div
              className="bg-white p-4 rounded shadow mb-6"
              style={{
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.10)",
                borderRadius: "18px",
              }}
            >
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
              <ResponsiveContainer width="100%" height={isMobile ? 100 : 120}>
                <BarChart data={bets}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="shortDate"
                    fontSize={isMobile ? 8 : 10}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 40 : 30}
                  />
                  <YAxis fontSize={isMobile ? 8 : 10} />
                  <Tooltip
                    formatter={(value) => `€${value}`}
                    labelStyle={{ fontSize: isMobile ? "10px" : "12px" }}
                    contentStyle={{ fontSize: isMobile ? "10px" : "12px" }}
                  />
                  <Bar dataKey="profitLoss" name="Profit/Loss">
                    {bets.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.profitLoss >= 0 ? "#51cf66" : "#ff6b6b"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Win/Loss Ratio */}
            <div
              className="bg-white p-4 rounded shadow"
              style={{
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 10px 20px rgba(0,0,0,0.10)",
                borderRadius: "18px",
              }}
            >
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
              <ResponsiveContainer width="100%" height={isMobile ? 100 : 120}>
                <PieChart>
                  <Pie
                    data={resultData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={
                      isMobile
                        ? false
                        : ({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={isMobile ? 35 : 50}
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
                  <Tooltip
                    formatter={(value) => value}
                    labelStyle={{ fontSize: isMobile ? "10px" : "12px" }}
                    contentStyle={{ fontSize: isMobile ? "10px" : "12px" }}
                  />
                  {isMobile && (
                    <Legend iconSize={10} wrapperStyle={{ fontSize: "10px" }} />
                  )}
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Betting Details Table */}
        <div className="dashboard-table-container">
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
            <table
              className="dashboard-table"
              aria-label={translations[language].bettingHistory}
            >
              <thead>
                <tr>
                  <th scope="col">{translations[language].date}</th>
                  <th scope="col">{translations[language].match}</th>
                  <th scope="col">{translations[language].betType}</th>
                  <th scope="col">{translations[language].odds}</th>
                  <th scope="col">{translations[language].stake}</th>
                  <th scope="col">{translations[language].result}</th>
                  <th scope="col">{translations[language].profitLoss}</th>
                  <th scope="col">{translations[language].cumulative}</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet, index) => (
                  <tr key={index}>
                    <td>{bet.date}</td>
                    <td>
                      <div className="flex items-center">
                        {bet.match}
                        {bet.imageUrl && (
                          <div
                            className="ml-2"
                            title={translations[language].viewProof}
                          >
                            <LazyImageIcon
                              onClick={() => openModal(bet.imageUrl)}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{bet.bet}</td>
                    <td>{bet.odds.toFixed(2)}</td>
                    <td>€{bet.stake.toFixed(2)}</td>
                    <td
                      className={`font-medium ${
                        bet.result === "Win" || bet.result === "Gagné"
                          ? "positive"
                          : "negative"
                      }`}
                      aria-label={`${translations[language].result}: ${bet.result}`}
                    >
                      {bet.result}
                    </td>
                    <td
                      className={`font-medium ${
                        bet.profitLoss >= 0 ? "positive" : "negative"
                      }`}
                      aria-label={`${
                        translations[language].profitLoss
                      }: €${bet.profitLoss.toFixed(2)}`}
                    >
                      €{bet.profitLoss.toFixed(2)}
                    </td>
                    <td
                      className={`font-medium ${
                        bet.cumulativeProfit >= 0 ? "positive" : "negative"
                      }`}
                      aria-label={`${
                        translations[language].cumulative
                      }: €${bet.cumulativeProfit.toFixed(2)}`}
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

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        imageUrl={modalImage}
        onClose={closeModal}
        language={language}
        translations={translations[language]}
      />
    </div>
  );
};

export default BettingDashboard;
