import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthGate } from '@/components/auth/AuthGate'
import { MainLayout } from '@/components/layout/MainLayout'
import HomeScreen from '@/pages/HomeScreen'
import FlashcardScreen from '@/pages/FlashcardScreen'
import QuizScreen from '@/pages/QuizScreen'
import WordListScreen from '@/pages/WordListScreen'
import ProgressScreen from '@/pages/ProgressScreen'
import { EtymologyScreen } from '@/pages/EtymologyScreen'

export default function App() {
  return (
    <AuthGate>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/etymology" element={<EtymologyScreen />} />
          <Route path="/flashcard/:weekId" element={<FlashcardScreen />} />
          <Route path="/quiz/:weekId" element={<QuizScreen />} />
          <Route path="/wordlist/:weekId" element={<WordListScreen />} />
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthGate>
  )
}
