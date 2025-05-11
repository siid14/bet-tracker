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
- **CI/CD Integration**: Automatic deployments to Vercel for production and preview environments

## Technologies Used

- **React**: UI framework
- **Recharts**: Data visualization library for creating responsive charts
- **jsPDF & html2canvas**: PDF generation from the dashboard
- **Tailwind CSS**: Styling and responsive design
- **Vercel**: Hosting and continuous deployment
- **GitHub Actions**: CI/CD workflow automationt

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
npm install --legacy-peer-deps
```

### Running the Application

Start the development server:

```
npm start
```

The dashboard will be available at http://localhost:3000

## CI/CD Setup with Vercel

This project uses GitHub Actions to automatically deploy to Vercel.

### Setup Required Secrets

To enable the automatic deployments, you need to add these secrets to your GitHub repository:

1. `VERCEL_TOKEN`: Your Vercel API token

   - Generate from the Vercel dashboard under Account Settings > Tokens

2. `VERCEL_ORG_ID`: Your Vercel organization ID

   - Find in the Vercel dashboard under Settings > General > Your ID

3. `VERCEL_PROJECT_ID`: Your Vercel project ID
   - Find in the project settings in the Vercel dashboard

### Deployment Flow

- **Production Deployment**: Every push to the `main` branch automatically triggers a production deployment
- **Preview Deployment**: Every pull request generates a preview deployment with a unique URL

You can check the status of deployments in the "Actions" tab of your GitHub repository.

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
