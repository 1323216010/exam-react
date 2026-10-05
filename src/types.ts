export interface ExamInfo {
  title: string
  subject: string
  code: string
  date: string
  kind?: string
  source_files?: string[]
}

export interface ExamListItem {
  file: string
  subject: string
  exam_info: ExamInfo
  question_count: number
}

export interface Question {
  question_number: string
  question_type: string
  content: string
  answer: string
  score?: number
  options?: Record<string, string>
}

export interface Paper {
  exam_info: ExamInfo
  questions: Question[]
}

export interface Grade {
  earned: number
  total: number
  objectiveCorrect: number
  objectiveTotal: number
  subjectiveTotal: number
  details: Record<string, { correct: boolean | null; earned: number }>
}

export type Answers = Record<string, string>
