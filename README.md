# Betting Performance Dashboard

A responsive web application for tracking and visualizing sports betting performance over time.

## Features

- **Comprehensive Statistics**: Track total profit/loss, ROI, win rate, and total bets
- **Interactive Visualizations**: View your betting performance through charts including:
  - Cumulative profit evolution
  - Profit/loss per bet
  - Win/loss distribution
- **Detailed Bet History**: Complete record of all bets with match details, odds, stake, result, and profit/loss
- **Bet Verification**: View screenshots of original bets for verification
- **Multi-language Support**: Toggle between English and French interfaces
- **PDF Export**: Export dashboard as PDF for record-keeping
- **Mobile Responsive**: Optimized for all device sizes

## Tech Stack

- **Frontend**: React 18
- **UI/Styling**: TailwindCSS 4
- **Charting**: Recharts for data visualization
- **PDF Generation**: jsPDF and html2canvas
- **Image Handling**: Optimized with imagemin
- **Analytics**: Vercel Analytics
- **Testing**: Jest with React Testing Library

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm

### Installation

1. Clone the repository

```bash
git clone https://github.com/siid14/bet-tracker.git
cd bet-tracker
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm start
```

4. Build for production

```bash
npm run build
```

## Usage

- Add new bet entries to the `originalBets` array in `BettingDashboard.jsx`
- Place bet screenshots in the appropriate directory under `public/images/`
- Export dashboard as PDF using the "Export to PDF" button

## Project Structure

- `/src`: React application source files
  - `/components`: Reusable UI components
  - `/utils`: Helper functions and utilities
  - `/hooks`: Custom React hooks
  - `/data`: Data management
- `/public`: Static assets and bet screenshots
- `/public/images`: Organized bet screenshots by month/year

## License

MIT

## Disclaimer

This dashboard is for entertainment purposes only. Betting can be addictive and lead to financial losses. Never bet more than you can afford to lose. This is not financial advice. Bet responsibly.
