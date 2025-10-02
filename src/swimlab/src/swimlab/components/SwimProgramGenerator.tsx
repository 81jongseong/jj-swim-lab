
import React, { useMemo, useState } from 'react';
import { AthleteProfile } from '../types';
import { loadRegistry, saveRegistry } from '../store/registry';
import { generatePlan } from '../logic/rules';
import { parseCSV } from '../utils/csv';

type Pat = 'even'|'threshold'|'vo2'|'sprint'|'descend'|'ascend'|'build'|'ladder'|'pyramid'|'broken'|'fartlek'|'tempo'|'choice'|'kick'|'pull'|'drillswim';
const patterns: Pat[] = ['even','threshold','vo2','sprint','descend','ascend','build','ladder','pyramid','broken','fartlek','tempo','choice','kick','pull','drillswim'];

function Field({label,children}:{label:string,children:any}){
  return <label style={{display:'block', marginBottom:8}}>
    <div style={{fontSize:12, opacity:0.8, marginBottom:4}}>{label}</div>
    {children}
  </label>
}
function Card({title,children}:{title:string,children:any}){
  return <div style={{border:'1px solid #e5e7eb', borderRadius:12, padding:16, background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
    <div style={{fontWeight:700, marginBottom:8}}>{title}</div>
    {children}
  </div>
}
function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>){ return <input {...props} style={{width:'100%', padding:'8px 10px', border:'1px solid #d1d5db', borderRadius:8, background:'#fafafa'}}/> }
function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>){ return <input type="number" {...props} style={{width:'100%', padding:'8px 10px', border:'1px solid #d1d5db', borderRadius:8, background:'#fafafa'}}/> }
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>){ return <select {...props} style={{width:'100%', padding:'8px 10px', border:'1px solid #d1d5db', borderRadius:8, background:'#fafafa'}}/> }

const defaultProfile: AthleteProfile = { name:'회원', gender:'M', age:35, poolLen:25, goals:['endurance'], weeklySessions:3, sessionMinutes:60, cssSec100: 95, healthIds:[] };

function MultiSelect({options, value, onChange}:{options:{id:string; name:string; rules:any[]}[]; value:string[]; onChange:(v:string[])=>void}){
  return <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
    {options.map(h=>{
      const checked = value.includes(h.id);
      const title = (h.rules||[]).map((r:any)=>`${r.axis}: ${r.description}`).join('\n');
      return <label key={h.id} title={title} style={{display:'flex', alignItems:'center', gap:6, border:'1px solid #e5e7eb', borderRadius:8, padding:'6px 8px', background: checked?'#eef2ff':'#fff'}}>
        <input type="checkbox" checked={checked} onChange={e=>{ const v = e.target.checked? [...value, h.id] : value.filter(x=>x!==h.id); onChange(v); }}/>
        <span>{h.name}</span>
      </label>
    })}
  </div>
}

export default function SwimProgramGenerator(){
  const reg = useMemo(()=>loadRegistry(), []);
  const [patternA,setPatternA] = useState<Pat>('threshold');
  const [patternB,setPatternB] = useState<Pat>('vo2');
  const [a, setA] = useState<AthleteProfile>({...defaultProfile, name:'A'});
  const [b, setB] = useState<AthleteProfile>({...defaultProfile, name:'B', cssSec100: 90});

  const planA = useMemo(()=>generatePlan(a, patternA), [a, patternA]);
  const planB = useMemo(()=>generatePlan(b, patternB), [b, patternB]);

  function onUploadMasters(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0]; if(!f) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try {
        const rows = parseCSV(String(reader.result||''));
        const merged = { ...reg, masters:{ rows } };
        saveRegistry(merged);
        alert(`Masters 기준 ${rows.length}행 저장됨(로컬). 새로고침 후 적용됩니다.`);
      } catch(err){ alert('CSV 파싱 실패'); }
    };
    reader.readAsText(f);
  }

  return <div style={{padding:20, background:'#f8fafc', minHeight:'100vh'}}>
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
      <h1 style={{margin:0}}>SwimLab PRO — 프로그램 생성기</h1>
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <input type="file" accept=".csv" onChange={onUploadMasters}/>
        <button onClick={()=>{ saveRegistry(reg); alert('데이터 저장됨(로컬).'); }} style={{padding:'8px 12px', borderRadius:8, border:'1px solid #cbd5e1', background:'#fff'}}>⚙ 데이터 저장</button>
      </div>
    </div>

    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
      {[
        {title:'프로필 A', profile:a, set:setA, pattern:patternA, setPattern:setPatternA, plan:planA},
        {title:'프로필 B', profile:b, set:setB, pattern:patternB, setPattern:setPatternB, plan:planB}
      ].map(({title, profile, set, pattern, setPattern, plan})=>(
        <Card key={title} title={title}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
            <Field label="이름"><TextInput value={profile.name} onChange={e=>set({...profile, name:e.target.value})}/></Field>
            <Field label="성별"><Select value={profile.gender} onChange={e=>set({...profile, gender:e.target.value as any})}><option value="M">M</option><option value="F">F</option><option value="X">X</option></Select></Field>
            <Field label="나이"><NumberInput value={profile.age} onChange={e=>set({...profile, age:Number(e.target.value)})}/></Field>
            <Field label="풀 길이(m)"><Select value={profile.poolLen} onChange={e=>set({...profile, poolLen:Number(e.target.value) as any})}><option value={25}>25</option><option value={50}>50</option></Select></Field>
            <Field label="세션 시간(분)"><NumberInput value={profile.sessionMinutes} onChange={e=>set({...profile, sessionMinutes:Number(e.target.value)})}/></Field>
            <Field label="CSS (초/100m)"><NumberInput value={profile.cssSec100} onChange={e=>set({...profile, cssSec100:Number(e.target.value)})}/></Field>
            <Field label="패턴"><Select value={pattern} onChange={e=>setPattern(e.target.value as Pat)}>{patterns.map(p=><option key={p} value={p}>{p}</option>)}</Select></Field>
            <div/>
          </div>

          <Field label="건강/질환 선택(툴팁: 규칙 요약)">
            <MultiSelect options={reg.conditions as any} value={profile.healthIds} onChange={(v)=>set({...profile, healthIds:v})}/>
          </Field>

          <Card title={`세트(툴팁 포함)`}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8}}>
              {plan.blocks.map(b=>(
                <div key={b.title} style={{border:'1px dashed #e5e7eb', borderRadius:8, padding:10}} title={b.tooltip}>
                  <div style={{fontWeight:600, marginBottom:8}}>{b.title}</div>
                  {b.lines.map((ln,i)=>(<div key={i} style={{fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize:13}}>{ln}</div>))}
                </div>
              ))}
            </div>
            <div style={{marginTop:8, fontSize:12, opacity:0.8}}>총 거리 추정: {plan.totalMeters} m</div>
          </Card>
        </Card>
      ))}
    </div>
  </div>;
}
