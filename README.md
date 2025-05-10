# Betting Performance Dashboard

A React-based dashboard for visualizing and analyzing betting performance with PDF export capabilities.

## Features

- **Performance Overview**: Quick summary cards showing total profit/loss, ROI, win rate, and total bets
- **Visual Analytics**:
  - Cumulative profit evolution line chart
  - Profit/loss per bet bar chart
  - Win/Loss distribution pie chart
- **Detailed History**: Complete betting history table with comprehensive data
- **PDF Export**: Export the entire dashboard to a PDF file for sharing or record-keeping
- **Multilingual Support**: Toggle between English and French languages
- **Informative Tooltips**: Helpful explanations for all metrics and charts
- **Bet Proof Images**: View proof of bets with image modal functionality
- **Responsible Gambling Disclaimer**: Important disclaimer banner for responsible gambling

## Technologies Used

- **React**: UI framework
- **Recharts**: Data visualization library for creating responsive charts
- **jsPDF & html2canvas**: PDF generation from the dashboard
- **Tailwind CSS**: Styling and responsive design

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:

```
git clone <repository-url>
```

2. Navigate to the project directory:

```
cd betting-stats
```

3. Install dependencies:

```
npm install
```

### Running the Application

Start the development server:

```
npm start
```

The dashboard will be available at http://localhost:3000

## Usage

- Toggle between English and French using the language buttons
- View your betting performance metrics at a glance with informative tooltips
- Analyze patterns in your betting history through various charts
- View proof of bets by clicking on the image icon next to match names
- Click the "Export to PDF" button to generate and download a PDF version of the dashboard

## Customization

You can customize the dashboard by:

1. Updating the betting data in the `originalBets` array in `BettingDashboard.jsx`
2. Adding new language support by extending the translations object
3. Modifying chart colors and styles
4. Adding additional analytics components as needed

## License

MIT
