import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getActiveAnnouncement } from '../../api'
import { BottomNav } from './BottomNav'

function AnnouncementBanner() {
  const { data: announcement } = useQuery({
    queryKey: ['announcement'],
    queryFn: getActiveAnnouncement,
    staleTime: 60_000,
  })

  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('dismissed-announcements')
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch { return new Set() }
  })

  if (!announcement || dismissed.has(announcement.id)) return null

  const dismiss = () => {
    const next = new Set(dismissed).add(announcement.id)
    setDismissed(next)
    localStorage.setItem('dismissed-announcements', JSON.stringify([...next]))
  }

  return (
    <div className="mx-[18px] mt-2 px-3 py-2.5 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl flex items-start gap-2">
      <span className="text-base flex-shrink-0">{announcement.emoji}</span>
      <p className="text-xs text-yellow-200 flex-1 leading-relaxed">{announcement.text}</p>
      <button onClick={dismiss} className="text-yellow-400/60 text-sm flex-shrink-0 px-1">✕</button>
    </div>
  )
}

export function AppLayout() {
  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-bg">
      <main className="flex-1 overflow-y-auto pb-[80px]">
        <AnnouncementBanner />
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
