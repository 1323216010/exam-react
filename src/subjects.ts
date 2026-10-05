/** 显示名按个人刷题站的习惯，不把课程全称铺在卡片上。 */
export const SUBJECTS: Record<string, string> = {
  '00040': '法学概论',
  '00292': '市政学',
  '00312': '政治学概论',
  '00318': '公共政策导论',
  '00341': '公文写作与处理',
  '03333': '电子政务概论',
  '12656': '毛概',
  '15041': '毛概',
}

export function subjectName(code: string, fallback = code): string {
  return SUBJECTS[code] ?? fallback
}

export function isObjective(question: { options?: Record<string, string>; question_type?: string }): boolean {
  return Boolean(question.options && Object.keys(question.options).length && (!question.question_type || /选择|单选|多选/.test(question.question_type)))
}

export function optionKeys(options: Record<string, string>): string[] {
  return Object.keys(options).sort()
}
