import { apiClient } from './client'
import type {
  User, Space, Transaction, Goal, Challenge,
  Achievement, Notification, LeaderboardEntry,
  AnalyticsSummary, KnowledgeArticle,
} from '../types'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authTelegram = (initData: string) =>
  apiClient.post<{ user: User; token: string }>('/auth/telegram', { initData }).then((r) => r.data)

// ─── User ─────────────────────────────────────────────────────────────────────

export const getMe = () =>
  apiClient.get<User>('/user/me').then((r) => r.data)

export const updateMe = (data: { firstName?: string; avatarEmoji?: string; settings?: Partial<User['settings']> }) =>
  apiClient.patch<User>('/user/me', data).then((r) => r.data)

// ─── Spaces ───────────────────────────────────────────────────────────────────

export const getSpaces = () =>
  apiClient.get<Space[]>('/spaces').then((r) => r.data)

export const createSpace = (data: { name: string; emoji: string; type: Space['type']; monthlyBudget?: number; color?: string }) =>
  apiClient.post<Space>('/spaces', data).then((r) => r.data)

export const addSpaceMember = (spaceId: string, telegramUsername: string) =>
  apiClient.post<Space>(`/spaces/${spaceId}/members`, { telegramUsername }).then((r) => r.data)

// ─── Transactions ─────────────────────────────────────────────────────────────

export const getTransactions = (params?: { spaceId?: string; month?: string; type?: string; limit?: number; offset?: number }) =>
  apiClient.get<Transaction[]>('/transactions', { params }).then((r) => r.data)

export const createTransaction = (data: {
  spaceId: string; type: 'EXPENSE' | 'INCOME'; amount: number
  category: string; categoryEmoji: string; comment?: string; date: string
}) =>
  apiClient.post<{ transaction: Transaction; xpEarned: number; user: User }>('/transactions', data).then((r) => r.data)

export const deleteTransaction = (id: string) =>
  apiClient.delete<{ ok: boolean }>(`/transactions/${id}`).then((r) => r.data)

// ─── Goals ────────────────────────────────────────────────────────────────────

export const getGoals = (spaceId?: string) =>
  apiClient.get<Goal[]>('/goals', { params: spaceId ? { spaceId } : {} }).then((r) => r.data)

export const createGoal = (data: { spaceId: string; name: string; emoji: string; targetAmount: number; deadline?: string; color?: string }) =>
  apiClient.post<Goal>('/goals', data).then((r) => r.data)

export const updateGoal = (id: string, data: { currentAmount?: number; name?: string; targetAmount?: number; deadline?: string }) =>
  apiClient.patch<Goal>(`/goals/${id}`, data).then((r) => r.data)

// ─── Challenges ───────────────────────────────────────────────────────────────

export const getChallenges = () =>
  apiClient.get<Challenge[]>('/challenges').then((r) => r.data)

export const updateChallengeProgress = (id: string, currentValue: number) =>
  apiClient.post<{ challenge: Challenge; xpEarned?: number; user?: User }>(`/challenges/${id}/progress`, { currentValue }).then((r) => r.data)

// ─── Achievements ─────────────────────────────────────────────────────────────

export const getAchievements = () =>
  apiClient.get<Achievement[]>('/achievements').then((r) => r.data)

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export const getLeaderboard = (params?: { season?: string; limit?: number }) =>
  apiClient.get<LeaderboardEntry[]>('/leaderboard', { params }).then((r) => r.data)

// ─── Notifications ────────────────────────────────────────────────────────────

export const getNotifications = () =>
  apiClient.get<Notification[]>('/notifications').then((r) => r.data)

export const markNotificationRead = (id: string) =>
  apiClient.post<{ ok: boolean }>(`/notifications/${id}/read`).then((r) => r.data)

export const markAllNotificationsRead = () =>
  apiClient.post<{ ok: boolean }>('/notifications/read-all').then((r) => r.data)

// ─── Analytics ────────────────────────────────────────────────────────────────

export const getAnalyticsSummary = (spaceId: string, month: string) =>
  apiClient.get<AnalyticsSummary>('/analytics/summary', { params: { spaceId, month } }).then((r) => r.data)

// ─── Knowledge ────────────────────────────────────────────────────────────────

export const getKnowledgeArticles = (category?: string) =>
  apiClient.get<KnowledgeArticle[]>('/knowledge', { params: category ? { category } : {} }).then((r) => r.data)

export const getKnowledgeArticle = (id: string) =>
  apiClient.get<KnowledgeArticle>(`/knowledge/${id}`).then((r) => r.data)
