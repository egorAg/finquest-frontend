import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from './hooks/useAuth'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { Finances } from './pages/Finances'
import { Game } from './pages/Game'
import { Knowledge } from './pages/Knowledge'
import { KnowledgeArticle } from './pages/KnowledgeArticle'
import { AddTransaction } from './pages/AddTransaction'
import { Transactions, TransactionDetail } from './pages/Transactions'
import { Goals } from './pages/Goals'
import { Profile } from './pages/Profile'
import { Notifications } from './pages/Notifications'
import { Achievements } from './pages/Achievements'
import { Leaderboard } from './pages/Leaderboard'
import { Settings } from './pages/Settings'
import { Spaces } from './pages/Spaces'
import { Challenges } from './pages/Challenges'
import { LevelProgress } from './pages/LevelProgress'
import { CreateGoal } from './pages/CreateGoal'
import { ContributeGoal } from './pages/ContributeGoal'

const qc = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

function AppRoutes() {
  const { loading, error } = useAuth()

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="text-5xl mb-4">💰</div>
          <div className="text-muted text-sm">Загрузка...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-dvh flex items-center justify-center bg-bg px-8">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <div className="font-bold mb-2">Ошибка</div>
          <div className="text-muted text-sm">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Pages with bottom nav */}
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="finances" element={<Finances />} />
        <Route path="game" element={<Game />} />
        <Route path="knowledge" element={<Knowledge />} />
        <Route path="goals" element={<Goals />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="leaderboard" element={<Leaderboard />} />
      </Route>

      {/* Full-screen pages (no bottom nav) */}
      <Route path="add-transaction" element={<AddTransaction />} />
      <Route path="transactions/:id" element={<TransactionDetail />} />
      <Route path="knowledge/:id" element={<KnowledgeArticle />} />
      <Route path="settings" element={<Settings />} />
      <Route path="spaces" element={<Spaces />} />
      <Route path="challenges" element={<Challenges />} />
      <Route path="level-progress" element={<LevelProgress />} />
      <Route path="goals/create" element={<CreateGoal />} />
      <Route path="goals/:id/contribute" element={<ContributeGoal />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
