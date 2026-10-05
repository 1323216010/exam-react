import { describe, expect, it } from 'vitest'
import { gradePaper } from './grade'
import type { Question } from './types'
const q = (answer: string, type = '多项选择题'): Question => ({ question_number: '1', question_type: type, content: '测试', answer, score: 2, options: { A: '甲', B: '乙', C: '丙' } })
describe('客观题判分', () => {
  it('兼容连续字母、逗号及顺序', () => { expect(gradePaper([q('AC')], { '1': 'C,A' }).earned).toBe(2) })
  it('少选多选不计分', () => { expect(gradePaper([q('AC')], { '1': 'A' }).earned).toBe(0); expect(gradePaper([q('AC')], { '1': 'A,B,C' }).earned).toBe(0) })
  it('无答案不判正确', () => { expect(gradePaper([q('')], {}).objectiveCorrect).toBe(0) })
  it('案例题即使有 options 也按主观题处理', () => { expect(gradePaper([q('参考答案', '案例分析题')], {}).subjectiveTotal).toBe(1) })
})
