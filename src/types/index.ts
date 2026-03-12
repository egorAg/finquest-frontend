export interface UserSettings {
  currency: string
  notifications: boolean
  botNotifications: boolean
  theme: 'dark' | 'light'
}

export interface User {
  id: string
  telegramId: number | null
  firstName: string
  lastName: string
  username: string
  avatarEmoji: string
  level: number
  xp: number
  xpToNext: number
  streakDays: number
  lastActiveDate: string | null
  totalXpEarned: number
  achievements: string[]
  onboardingDone: boolean
  settings: UserSettings
  createdAt: string
}

export interface SpaceMember {
  userId: string
  role: 'OWNER' | 'MEMBER'
  joinedAt: string
}

export interface Space {
  id: string
  name: string
  emoji: string
  type: 'PERSONAL' | 'FAMILY' | 'WORK'
  ownerId: string
  members: SpaceMember[]
  monthlyBudget: number | null
  color: string
  createdAt: string
}

export interface Transaction {
  id: string
  spaceId: string
  userId: string
  type: 'EXPENSE' | 'INCOME'
  amount: number
  category: string
  categoryEmoji: string
  comment: string
  date: string
  createdAt: string
  xpEarned: number
}

export interface Goal {
  id: string
  spaceId: string
  name: string
  emoji: string
  targetAmount: number
  currentAmount: number
  deadline: string | null
  color: string
  isCompleted: boolean
  completedAt: string | null
  createdAt: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  emoji: string
  xpReward: number
  type: 'SPENDING_LIMIT' | 'MIN_SPENDING' | 'CATEGORY_AVOID' | 'STREAK' | 'GOAL_COMPLETE'
  targetValue: number
  currentValue: number
  categoryKey: string | null
  periodType: string | null
  periodDays: number | null
  deadline: string
  joined: boolean
  isCompleted: boolean
  isFailed: boolean
  completedAt: string | null
  joinedAt: string | null
  spaceId: string | null
  createdAt: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  emoji: string
  xpReward: number
  triggerType: string
  triggerValue: number | null
  isUnlocked: boolean
  unlockedAt: string | null
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  text: string
  isRead: boolean
  createdAt: string
}

export interface LeaderboardEntry {
  rank: number
  user: Pick<User, 'id' | 'firstName' | 'username' | 'avatarEmoji' | 'level'>
  xp: number
}

export interface AnalyticsSummary {
  income: number
  expense: number
  balance: number
  byCategory: { category: string; emoji: string; amount: number; percent: number }[]
  byDay: { date: string; income: number; expense: number }[]
}

export interface KnowledgeArticle {
  id: string
  title: string
  emoji: string
  category: string
  readTime: number
  xpReward: number
  content?: string
}
