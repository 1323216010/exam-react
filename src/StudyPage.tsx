import { useState } from 'react'
import { COURSES, loadStudy, useful } from './study'
import type { StudyPack } from './study'
const KEY='exam-react-study-v1'
function readProgress():Record<string,boolean>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
export default function Study({onPractice}:{onPractice:(path:string)=>void}) {
  const [pack,setPack]=useState<StudyPack|null>(null)
  const [index,setIndex]=useState(0)
  const [progress,setProgress]=useState(readProgress)
  const [revealed,setRevealed]=useState(false)
  const [selected,setSelected]=useState('')
  const [checked,setChecked]=useState(false)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  const unit=pack?.units[index]
  function move(i:number){setIndex(i);setRevealed(false);setSelected('');setChecked(false)}
  async function open(code:string){setBusy(true);setError('');try{setPack(await loadStudy(code));move(0)}catch(e){setError(String(e))}finally{setBusy(false)}}
  function mark(){if(!unit)return;const next={...progress,[unit.id]:!progress[unit.id]};setProgress(next);try{localStorage.setItem(KEY,JSON.stringify(next))}catch{setError('浏览器无法保存学习进度。')}}
  return <section>
    <h1>考点学习</h1><p className="muted">学懂 → 回忆 → 练习。进度为本机自查记录，不是考试成绩。学习内容沿用原站整理，法条与指定教材及考试日前有效法律核对；00318 关联题仅作旧课码练习。</p>
    {error&&<p role="alert" className="error">{error}</p>}{busy&&<p role="status">正在加载学习内容…</p>}
    <nav className="toolbar">{COURSES.map(c=><button key={c.code} className={pack?.code===c.code?'active':''} disabled={busy} onClick={()=>open(c.code)}>{c.name}</button>)}</nav>
    {!pack&&<p>先选择一月要考的科目。</p>}
    {pack&&unit&&<><p>{pack.name} · 已自查 {pack.units.filter(u=>progress[u.id]).length}/{pack.units.length} 单元</p><div className="exam-layout">
      <article className="question"><p className="muted">{unit.chapterTitle}</p><h2>{unit.title}</h2><p>{unit.explain}</p>
      {useful(unit.example)&&<section><h3>应用示例</h3><p>{unit.example}</p></section>}
      {useful(unit.contrast)&&<section><h3>易混点</h3><p>{unit.contrast}</p></section>}
      <section className="reference"><h3>合上讲解，试着回忆</h3><p>{unit.recallPrompt}</p><button onClick={()=>setRevealed(!revealed)}>{revealed?'收起答题要点':'查看答题要点'}</button>{revealed&&<p>{unit.examAnswer}</p>}</section>
      {!!unit.checkpoints?.length&&<><h3>自查要点</h3><ul>{unit.checkpoints.map(x=><li key={x}>{x}</li>)}</ul></>}
      {unit.question&&<section className="reference"><h3>{unit.question.kind?.includes('00318')?'题库练习（00318）':unit.question.kind||'关联练习'}</h3><p>{unit.question.stem}</p><div className="options">{Object.entries(unit.question.options).map(([k,v])=><label key={k}><input type="radio" name="study-answer" checked={selected===k} onChange={()=>{setSelected(k);setChecked(false)}}/>{k} · {v}</label>)}</div><button disabled={!selected} onClick={()=>setChecked(true)}>核对答案</button>{checked&&<p>{selected===unit.question.answer?'回答正确':'再对照要点复习'} · 参考答案：{unit.question.answer}\n{unit.question.explanation}</p>}
      {unit.question.sourcePath&&<button onClick={()=>onPractice(unit.question!.sourcePath!)}>打开来源试卷练习 →</button>}</section>}
      {unit.source?.label&&<p className="muted">来源：{unit.source.label}</p>}
      <div className="toolbar"><button disabled={index===0} onClick={()=>move(index-1)}>上一单元</button><button onClick={mark}>{progress[unit.id]?'撤销自查完成':'标记自查完成'}</button><button disabled={index===pack.units.length-1} onClick={()=>move(index+1)}>下一单元</button></div></article>
      <aside className="answer-card"><h2>学习路线</h2><nav className="study-route">{pack.units.map((u,i)=><button key={u.id} className={index===i?'current':progress[u.id]?'done':''} onClick={()=>move(i)}>{progress[u.id]?'✓ ':''}{u.title}</button>)}</nav></aside>
    </div></>}
  </section>
}
