# Setup & Installation Guide - Tarot Prediction Website

## Quick Start Guide

### 1. Prerequisites
- Node.js 16+ installed
- npm or yarn
- Supabase account (free at https://supabase.com)

### 2. Installation Steps

#### Step 1: Install Dependencies
```bash
cd "tarot website"
npm install
```

#### Step 2: Create Supabase Project
1. Go to https://supabase.com and sign up
2. Create a new project
3. Wait for the project to initialize
4. Copy your **Project URL** and **Anon Key**

#### Step 3: Configure Environment Variables
1. Open `.env` file in the project root
2. Replace the values:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

#### Step 4: Setup Database
1. In Supabase console, go to SQL Editor
2. Click "New Query"
3. Copy the entire content of `database-schema.sql`
4. Paste it into the SQL editor
5. Click "Run"
6. Wait for all queries to complete

### 3. Run Development Server

```bash
npm run dev
```

The application will automatically open at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

### 5. Deployment Options

#### Option A: Vercel (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set environment variables in Vercel settings
4. Deploy automatically

#### Option B: Netlify
1. Build the project: `npm run build`
2. Connect your repo to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`

#### Option C: Traditional Hosting
1. Run `npm run build` to create production files
2. Upload the `dist` folder to your hosting provider
3. Configure your web server for SPA (Single Page Application)

## Supabase Configuration Details

### Tables Structure

**bookings** - Stores session booking requests
- name, email, phone
- date, time
- reading_type
- message, status, notes

**reviews** - Customer testimonials
- author, email
- rating (1-5)
- comment
- verified, featured flags

**portfolio** - Services offered
- title, description
- icon, price
- duration_minutes

**users** - User profiles (future)
- email, full_name, phone
- profile_image_url, bio
- is_tarot_reader flag

**tarot_cards** - Card reference library
- name, card_number, suit
- symbol, meaning
- upright_meaning, reversed_meaning

**reading_history** - Past readings log
- user_email, reading_type
- cards_drawn (JSON)
- interpretation, notes

## Features Walkthrough

### Dark/Light Theme
- Click the sun/moon icon in the header to toggle
- Preference is automatically saved
- Theme persists on page reload

### Daily Tarot Spread
- Click any card to flip it and see the meaning
- Click "Reset Cards" to flip all cards back
- Click again to flip individual cards

### Book a Session
1. Navigate to "Book Session" from the menu
2. Fill in your details
3. Select a reading type
4. Choose date and time
5. Add optional message
6. Submit the form
7. You'll receive a confirmation

### Submit a Review
1. Go to "Reviews" page
2. Scroll to "Share Your Experience"
3. Enter your name and email
4. Select a rating
5. Write your review
6. Submit
7. Review will be visible after admin approval

## Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  'primary': '#8b5cf6',     // Purple
  'secondary': '#ec4899',   // Pink
  'dark': '#0f172a',        // Dark background
  'light': '#f8fafc',       // Light background
}
```

### Change Logo/Branding
Edit `src/components/Header.jsx`:
```javascript
<div className="text-3xl font-bold gradient-text">✨ Tarot</div>
```

### Change Hero Text
Edit `src/pages/Home.jsx`:
```javascript
<h1 className="text-5xl md:text-6xl font-bold mb-6">
  Your custom text here
</h1>
```

## Troubleshooting

### Issue: "Cannot find module" errors
**Solution:** Run `npm install` again to ensure all dependencies are installed

### Issue: Supabase connection failed
**Solution:** 
- Check `.env` file has correct URLs
- Verify Supabase project is active
- Check anon key is correct

### Issue: Styles not applying
**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server (Ctrl+C and `npm run dev`)
- Check Tailwind CSS is included in files

### Issue: Form not submitting
**Solution:**
- Check browser console for errors (F12)
- Verify Supabase tables are created
- Check RLS policies are enabled
- Verify .env variables are set

## Performance Tips

1. **Images:** Optimize and compress images before uploading
2. **Caching:** Use browser caching headers
3. **CDN:** Deploy static files to CDN for faster loading
4. **Database:** Add indexes for frequently queried columns (already included)

## Security Best Practices

1. Never commit `.env` to git
2. Use Row Level Security (RLS) in Supabase
3. Validate all form inputs on backend
4. Use HTTPS for all requests
5. Regularly update dependencies

## Additional Resources

- Vite Documentation: https://vitejs.dev
- React Documentation: https://react.dev
- Tailwind CSS: https://tailwindcss.com
- Supabase: https://supabase.com/docs
- React Router: https://reactrouter.com

## Support & Contact

For issues or questions:
- Check GitHub Issues
- Visit Supabase Community
- Contact: support@tarotwebsite.com

---

**Happy readings! ✨🔮**
