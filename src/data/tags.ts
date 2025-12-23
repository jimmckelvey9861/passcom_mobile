export interface Tag {
  id: string
  label: string
  color: string
}

export const AVAILABLE_TAGS: Tag[] = [
  { id: 'urgent', label: 'Urgent', color: 'bg-red-200 text-red-800' },
  { id: 'design', label: 'Design', color: 'bg-blue-200 text-blue-800' },
  { id: 'marketing', label: 'Marketing', color: 'bg-purple-200 text-purple-800' },
  { id: 'finance', label: 'Finance', color: 'bg-emerald-200 text-emerald-800' },
  { id: 'personal', label: 'Personal', color: 'bg-slate-200 text-slate-800' },
  { id: 'bugs', label: 'Bugs', color: 'bg-orange-200 text-orange-800' },
  { id: 'feature', label: 'Feature', color: 'bg-cyan-200 text-cyan-800' },
  { id: 'documentation', label: 'Documentation', color: 'bg-violet-200 text-violet-800' },
]

