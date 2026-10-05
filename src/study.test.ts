import { describe, expect, it } from 'vitest'
import { mergeUnits, useful } from './study'
import type { StudyPack, StudyUnit } from './study'
const unit=(id:string,title:string):StudyUnit=>({id,title,explain:'讲解',examAnswer:'要点'})
describe('考点学习兼容原站规则',()=>{
 it('手写精讲优先且按 ID 去重',()=>{const base:StudyPack={code:'03333',name:'电子政务',units:[unit('a','旧内容'),unit('b','第四章')]};const curated:StudyPack={code:'03333',name:'电子政务',title:'第一章',units:[unit('a','精讲')]};const p=mergeUnits(base,[curated]);expect(p.units.map(x=>x.title)).toEqual(['精讲','第四章']);expect(p.units[0].chapterTitle).toBe('第一章')})
 it('跳过模板填充，保留实质讲解',()=>{expect(useful('用一个政务场景套上这个考点')).toBe(false);expect(useful('G2G 的服务对象是政府。')).toBe(true);expect(useful('')).toBe(false)})
})
