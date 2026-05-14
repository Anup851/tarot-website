# Tarot Prediction Website

A modern, fully responsive React application for tarot readings with dark/light theme support.

## Features

- **Dark/Light Theme** - Toggle between themes with persistent preference
- **Tarot Card Display** - Interactive tarot card spreads with flip animations
- **Portfolio** - Showcase tarot reading services
- **Session Booking** - Book personalized tarot reading sessions
- **Customer Reviews** - View and submit client testimonials
- **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop
- **Modern Design** - Beautiful gradient backgrounds and smooth animations
- **Supabase Integration** - Real-time database for bookings, reviews, and portfolio

## Tech Stack

- **React** 18+ - UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend database and authentication
- **React Router** - Client-side routing
- **Lucide Icons** - Beautiful icon library

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   cd "tarot website"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Supabase credentials to `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### Running the Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Database Schema (Supabase SQL)

See `database-schema.sql` for the complete database setup.

## Project Structure

```
src/
├── components/
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── TarotCard.jsx
│   ├── TarotCardSpread.jsx
│   ├── Portfolio.jsx
│   ├── SessionBooking.jsx
│   └── ReviewsSection.jsx
├── pages/
│   ├── Home.jsx
│   ├── PortfolioPage.jsx
│   ├── BookingsPage.jsx
│   └── ReviewsPage.jsx
├── hooks/
│   ├── useTheme.js
│   └── useAuth.js
├── lib/
│   └── supabase.js
├── styles/
│   └── globals.css
├── App.jsx
└── main.jsx
```

## Available Routes

- `/` - Home page with daily tarot spread
- `/portfolio` - View tarot reading services
- `/bookings` - Book a reading session
- `/reviews` - View and submit reviews

## Features in Detail

### Dark/Light Theme
- Automatic detection of system preference
- Manual toggle button in header
- Persistent storage using localStorage

### Tarot Cards
- Interactive flip animation
- 6 card daily spread
- Click to reveal meaning
- Reset button to flip all cards back

### Session Booking
- Multiple reading types with pricing
- Date/time selection
- Contact information form
- Special message field
- Status tracking (pending)

### Reviews System
- 5-star rating system
- Customer testimonials
- Author information
- Real-time data from Supabase

### Responsive Design
- Mobile-first approach
- Hamburger menu for navigation
- Flexible grid layouts
- Optimized images and assets

## Future Enhancements

- User authentication system
- Payment integration (Stripe/PayPal)
- Email notifications
- Admin dashboard
- Blog section
- Live chat support
- Video consultations

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For support, email support@tarot.com or visit our website.
