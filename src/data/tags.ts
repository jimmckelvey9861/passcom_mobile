export interface Tag {
  id: string
  label: string
  color: string
}

export const AVAILABLE_TAGS: Tag[] = [
  { id: 'urgent', label: 'Urgent', color: 'bg-red-500' },
  { id: 'design', label: 'Design', color: 'bg-blue-500' },
  { id: 'marketing', label: 'Marketing', color: 'bg-purple-500' },
  { id: 'finance', label: 'Finance', color: 'bg-emerald-500' },
  { id: 'personal', label: 'Personal', color: 'bg-gray-500' },
  { id: 'bugs', label: 'Bugs', color: 'bg-orange-500' },
  { id: 'feature', label: 'Feature', color: 'bg-cyan-500' },
  { id: 'documentation', label: 'Documentation', color: 'bg-violet-500' },
]

