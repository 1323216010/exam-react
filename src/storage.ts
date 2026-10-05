import type { Answers, Grade } from './types'

const KEY = 'exam-react-progress'

export interface Attempt {
  file: string
  answers: Answers
  grade: Grade | null
  updatedAt: string
}

type Store = Record<string, Attempt>

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Store) : {}
  } catch {
    return {}
  }
}

function write(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store))
}

export function loadAttempt(file: string): Attempt | null {
  return read()[file] ?? null
}

export function saveAttempt(file: string, answers: Answers, grade: Grade | null) {
  const store = read()
  store[file] = { file, answers, grade, updatedAt: new Date().toISOString() }
  write(store)
}

export function clearAttempt(file: string) {
  const store = read()
  delete store[file]
  write(store)
}
