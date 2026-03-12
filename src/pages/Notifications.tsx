import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../api'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/layout/PageHeader'
import { fmtDateTime } from '../lib/utils'

export function Notifications() {
  const qc = useQueryClient()
  const { data: notifications = [] } = useQuery({ queryKey: ['notifications'], queryFn: getNotifications })

  const { mutate: readAll } = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const { mutate: readOne } = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const unread = notifications.filter((n) => !n.isRead)

  return (
    <div>
      <PageHeader
        title="Уведомления"
        back
        right={unread.length > 0 ? (
          <button onClick={() => readAll()} className="text-xs text-blue">Всё прочитано</button>
        ) : undefined}
      />
      <div className="px-4 space-y-2">
        {notifications.length === 0 ? (
          <Card className="text-center py-8 text-muted">
            <div className="text-3xl mb-2">🔔</div>
            <div className="text-sm">Нет уведомлений</div>
          </Card>
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              className={`cursor-pointer transition-all ${!n.isRead ? 'border-blue/30 bg-blue/5' : ''}`}
              onClick={() => !n.isRead && readOne(n.id)}
            >
              <div className="flex justify-between mb-1">
                <span className="font-bold text-sm">{n.title}</span>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue mt-1 shrink-0" />}
              </div>
              <div className="text-sm text-muted">{n.text}</div>
              <div className="text-xs text-muted mt-1">{fmtDateTime(n.createdAt)}</div>
            </Card>
          ))
        )}
        <div className="h-4" />
      </div>
    </div>
  )
}
