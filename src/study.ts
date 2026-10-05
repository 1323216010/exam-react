export interface StudyQuestion { stem: string; options: Record<string,string>; answer: string; explanation?: string; sourcePath?: string; sourceNumber?: string; kind?: string }
export interface StudyUnit { id: string; title: string; chapterTitle?: string; explain: string; examAnswer: string; example?: string; contrast?: string; recallPrompt?: string; checkpoints?: string[]; source?: { label?: string; location?: string }; question?: StudyQuestion }
export interface StudyPack { code: string; name: string; title?: string; notes?: string[]; units: StudyUnit[] }
export const COURSES = [{code:'03333',name:'电子政务概论'},{code:'13672',name:'公共政策导论'},{code:'00040',name:'法学概论'}]
const FILLER = ['用一个政务场景套上这个考点','套本章：','看到案例或新闻时，先判断它属于','和相邻章节混为一谈','与相邻部门法混用','本章按 13672 谢明大纲']
export function useful(text?: string) { return !!text?.trim() && !FILLER.some(x=>text.includes(x)) }
export function mergeUnits(base: StudyPack, curated: StudyPack[]): StudyPack {
  const units = curated.flatMap(p=>p.units.map(u=>({...u,chapterTitle:p.title || u.chapterTitle || u.title})))
  const ids = new Set(units.map(u=>u.id))
  return {...base,units:[...units,...base.units.filter(u=>!ids.has(u.id))]}
}
async function fetchPack(path: string): Promise<StudyPack> { const r=await fetch('/knowledge/'+path); if(!r.ok)throw new Error('学习内容加载失败'); return r.json() }
export async function loadStudy(code: string) {
  const base = await fetchPack('units-'+code+'.json')
  if(code!=='03333')return base
  const curated = await Promise.all(['pilot-03333.json','ch02-03333.json','ch03-03333.json'].map(fetchPack))
  return mergeUnits(base,curated)
}
