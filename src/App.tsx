import { useEffect, useState } from 'react'
import { loadExamList, loadPaper } from './api'
import { subjectName, isObjective, optionKeys } from './subjects'
import { gradePaper } from './grade'
import { loadAttempt, saveAttempt, clearAttempt } from './storage'
import type { Answers, ExamListItem, Grade, Paper } from './types'
import './App.css'
import Study from './StudyPage'

export default function App() {
  const [mode, setMode] = useState<'papers' | 'study'>('papers')
  const [list, setList] = useState<ExamListItem[]>([])
  const [subject, setSubject] = useState('全部')
  const [search, setSearch] = useState('')
  const [file, setFile] = useState('')
  const [paper, setPaper] = useState<Paper | null>(null)
  const [answers, setAnswers] = useState<Answers>({})
  const [grade, setGrade] = useState<Grade | null>(null)
  const [index, setIndex] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => { loadExamList().then(setList).catch(e => setError(String(e))).finally(() => setLoading(false)) }, [])
  async function open(item: ExamListItem) {
    setLoading(true); setError('')
    try {
      const data = await loadPaper(item.file)
      if (!data.questions.length) throw new Error('这份试卷没有题目，暂不能练习。')
      const saved = loadAttempt(item.file)
      setAnswers(saved?.answers ?? {}); setGrade(saved?.grade ?? null)
      setFile(item.file); setPaper(data); setIndex(0)
    } catch (e) { setError(String(e)) } finally { setLoading(false) }
  }
  function answer(value: string) {
    if (grade || !paper) return
    const next = { ...answers, [paper.questions[index].question_number]: value }
    setAnswers(next); saveAttempt(file, next, null)
  }
  function submit() {
    if (!paper || !window.confirm('提交后将显示答案。主观题需对照参考答案自评，是否提交？')) return
    const result = gradePaper(paper.questions, answers)
    setGrade(result); saveAttempt(file, answers, result)
  }
  const names = [...new Set(list.map(x => subjectName(x.subject)))]
  const shown = list.filter(x => (subject === '全部' || subjectName(x.subject) === subject) && `${x.exam_info.title} ${x.exam_info.date} ${x.file}`.includes(search)).sort((a,b) => b.exam_info.date.replace(/\D/g,'').localeCompare(a.exam_info.date.replace(/\D/g,'')))
  const q = paper?.questions[index]
  const selected = q ? answers[q.question_number] ?? '' : ''
  const answered = paper?.questions.filter(q => answers[q.question_number]?.trim()).length ?? 0
  return <><header><div className="wrap"><span className="brand">自考练习 <small>React 版</small></span><p>专科 · 行政管理 / 独立试验版</p></div></header><main className="wrap">
    {error && <p role="alert" className="error">{error}</p>}
    {loading && <p role="status">正在加载题库…</p>}
    {!paper && <nav className="toolbar" aria-label="学习模式"><button className={mode==='papers'?'active':''} onClick={()=>setMode('papers')}>试卷练习</button><button className={mode==='study'?'active':''} onClick={()=>setMode('study')}>考点学习</button></nav>}
    {!paper && mode==='study' ? <Study onPractice={path=>{const item=list.find(x=>x.file===path);if(item)void open(item);else setError('来源试卷未在题库清单中找到。')}} /> : !paper ? <>
      <section className="intro"><h1>选一套，开始练习。</h1><p>一月重点：公共政策导论、电子政务概论、法学概论</p><p className="muted">00318 为旧课码练习资料，不标作 13672 历年真题。</p></section>
      <section className="filters"><nav aria-label="科目筛选">{['全部', ...names].map(name => <button key={name} aria-pressed={subject===name} className={subject===name?'active':''} onClick={()=>setSubject(name)}>{name}</button>)}</nav><label>搜索试卷 <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="年份、试卷名称或章节" /></label></section>
      <p className="muted">共 {shown.length} 套 · 作答进度保存在当前浏览器</p>
      <div className="cards">{shown.map(item => <article className="card" key={item.file}><span className="tag">{subjectName(item.subject)}</span><h2>{item.exam_info.date || item.exam_info.title || item.file.split('/').pop()?.replace('.json','')}</h2><p>{item.exam_info.kind || '题库练习'} · {item.question_count} 题</p>{loadAttempt(item.file) && <small>有本地作答记录</small>}<button disabled={!item.question_count || loading} onClick={()=>open(item)}>{item.question_count ? '开始 / 继续 →' : '空卷 · 暂不可用'}</button></article>)}</div>
    </> : q && <>
      <div className="toolbar"><button onClick={()=>{setPaper(null);setError('')}}>← 返回选卷</button><span>{answered}/{paper.questions.length} 已答 · 自动保存</span><button onClick={()=>{if(window.confirm('清除本卷进度并重新开始？')){clearAttempt(file);setAnswers({});setGrade(null);setIndex(0)}}}>重新开始</button></div>
      <h1 className="paper-title">{paper.exam_info.title || subjectName(paper.exam_info.code)}</h1>
      {grade && <section className="result"><h2>客观题答对 {grade.objectiveCorrect}/{grade.objectiveTotal}</h2><p>客观题得分 {grade.earned}，主观题 {grade.subjectiveTotal} 道请对照参考答案自评。这里不显示未经评定的总成绩。</p></section>}
      <div className="exam-layout"><section className="question"><p className="muted">第 {index+1}/{paper.questions.length} 题 · {q.question_type} · {q.score ?? '未标'} 分</p><h2>{q.content}</h2>
        {isObjective(q) ? <div className="options">{optionKeys(q.options!).map(key => {
          const multi = q.question_type.includes('多项') || q.question_type.includes('多选')
          const checked = selected.split(',').includes(key)
          return <label className={checked?'chosen':''} key={key}><input type={multi?'checkbox':'radio'} name="answer" checked={checked} disabled={!!grade} onChange={()=>answer(multi ? (checked ? selected.split(',').filter(x=>x!==key) : [...selected.split(',').filter(Boolean),key]).sort().join(',') : key)} /><strong>{key}</strong><span>{q.options![key]}</span></label>
        })}</div> : <textarea aria-label="主观题答案" rows={8} value={selected} disabled={!!grade} onChange={e=>answer(e.target.value)} placeholder="写下你的答案，再对照参考答案自评" />}
        {grade && <section className="reference"><h3>{isObjective(q) ? grade.details[q.question_number]?.correct ? '回答正确' : '回答错误 / 未答' : '参考答案 · 请自评'}</h3><p>{q.answer || '原资料未提供答案'}</p></section>}
        <div className="toolbar"><button disabled={index===0} onClick={()=>setIndex(index-1)}>上一题</button><button disabled={index===paper.questions.length-1} onClick={()=>setIndex(index+1)}>下一题</button>{!grade && <button className="primary" onClick={submit}>提交并看答案</button>}</div>
      </section><aside className="answer-card"><h2>答题卡</h2><div>{paper.questions.map((question,i)=><button key={`${question.question_number}-${i}`} aria-label={`第${i+1}题`} aria-current={index===i?'step':undefined} className={index===i?'current':answers[question.question_number]?.trim()?'done':''} onClick={()=>setIndex(i)}>{i+1}</button>)}</div><p className="muted">绿色：已答 / 深色：当前题</p></aside></div>
    </>}
  </main><footer>独立新版试验，不影响原站 · 首版仅迁移核心刷题流程</footer></>
}
