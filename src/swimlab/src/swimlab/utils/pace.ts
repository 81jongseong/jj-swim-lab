
import { Zone } from '../types';
export function paceByZone(cssSec100:number, zone:Zone): number {
  switch(zone){ case 'Z1': return cssSec100 + 20; case 'Z2': return cssSec100 + 8; case 'Z3': return cssSec100 + 2; case 'Z4': return cssSec100 - 3; case 'Z5': return cssSec100 - 8; }
}
export function formatPace(secPer100:number): string { const m = Math.floor(secPer100/60), s = Math.round(secPer100%60); return `${m}:${s.toString().padStart(2,'0')}/100m`; }
