# Card Score Keeper

A digital scorekeeper for card games like Hearts and President. This application enables players to easily start a game, track scores round by round, assign points based on game rules, and manage player history.

## Features

- **Start a new game** with defined rules
- **Set an end score** to determine when the game finishes
- **Add or remove players** dynamically
- **Track scores per round**
- **Assign points per position** for games like President
- **Store player and game history** for future reference
- **Add game notes** (e.g., debts, special conditions, penalties)
- **Support dark and light mode** for better usability

## Tech Stack

- **Frontend:** Next.js (React), TypeScript, Tailwind CSS, ShadCN UI
- **Backend:** Next.js API routes
- **Database:** MongoDB (via Mongoose)
- **State Management:** Zustand
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS with ShadCN UI components

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mandozza/card-score-keeper.git
   cd card-score-keeper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/card-score-keeper
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `/src/app` - Next.js App Router pages
- `/src/components` - React components
- `/src/lib/db` - Database models and connection
- `/src/lib/store` - Zustand state management
- `/src/app/api` - API routes

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Repository

The source code is available on GitHub at [https://github.com/mandozza/card-score-keeper](https://github.com/mandozza/card-score-keeper).
