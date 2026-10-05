import type { ExamListItem, Paper } from './types'

export async function loadExamList(): Promise<ExamListItem[]> {
  const response = await fetch('/json/exam-list.json')
  if (!response.ok) throw new Error(`试卷清单加载失败：${response.status}`)
  return response.json() as Promise<ExamListItem[]>
}

export async function loadPaper(file: string): Promise<Paper> {
  const response = await fetch(`/${file}`)
  if (!response.ok) throw new Error(`试卷加载失败：${response.status}`)
  return response.json() as Promise<Paper>
}
