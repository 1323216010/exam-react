import type { Answers, Grade, Question } from './types'
import { isObjective } from './subjects'

function normalize(value: string): string {
  return (value ?? '').toUpperCase().replace(/[^A-Z]/g, '').split('').sort().join('')
}

function sameChoice(expected: string, actual: string): boolean {
  const left = normalize(expected).split(',').filter(Boolean).sort().join(',')
  const right = normalize(actual).split(',').filter(Boolean).sort().join(',')
  return left.length > 0 && left === right
}

export function gradePaper(questions: Question[], answers: Answers): Grade {
  const details: Grade['details'] = {}
  let earned = 0
  let total = 0
  let objectiveCorrect = 0
  let objectiveTotal = 0
  let subjectiveTotal = 0

  questions.forEach((question) => {
    const score = question.score ?? 0
    total += score
    const given = answers[question.question_number] ?? ''
    if (!isObjective(question)) {
      subjectiveTotal += 1
      details[question.question_number] = { correct: null, earned: 0 }
      return
    }
    objectiveTotal += 1
    const correct = sameChoice(question.answer, given)
    if (correct) {
      objectiveCorrect += 1
      earned += score
    }
    details[question.question_number] = { correct, earned: correct ? score : 0 }
  })

  return { earned, total, objectiveCorrect, objectiveTotal, subjectiveTotal, details }
}
