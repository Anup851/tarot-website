import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import PortfolioPage from './pages/PortfolioPage'
import BookingsPage from './pages/BookingsPage'
import ReviewsPage from './pages/ReviewsPage'
import AuthPage from './pages/AuthPage'
import OwnerDashboard from './pages/OwnerDashboard'
import OwnerChatsPage from './pages/OwnerChatsPage'
import ChatPage from './pages/ChatPage'

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

function AppContent() {
  const { isDark, toggleTheme } = useTheme()
  const { role } = useAuth()
  const isOwner = role === 'owner'

  return (
    <Router>
      <div className={isDark ? 'dark' : ''}>
        <Header isDark={isDark} toggleTheme={toggleTheme} />
        
        <main className="min-h-screen bg-stone-50 dark:bg-slate-950">
          {isOwner ? (
            <Routes>
              <Route path="/" element={<OwnerDashboard />} />
              <Route path="/chats" element={<OwnerChatsPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<OwnerDashboard />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/owner" element={<OwnerDashboard />} />
              <Route path="*" element={<Home />} />
            </Routes>
          )}
        </main>

        {!isOwner && <Footer />}
      </div>
    </Router>
  )
}
