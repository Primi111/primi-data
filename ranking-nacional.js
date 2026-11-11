/* PRIMI DATA · Ranking nacional de nombres (INE 01/01/2025). */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const norm=s=>String(s||'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
const fmt=n=>Number(n).toLocaleString('es-ES');
let db=null;
const panel=document.createElement('section');panel.className='card';panel.id='ranking-nacional';$('automatic').insertAdjacentElement('afterend',panel);
function elt(tag,text){const x=document.createElement(tag);if(text!==undefined)x.textContent=text;return x}
function draw(){
 panel.replaceChildren();panel.append(elt('h2','Ranking nacional de nombres'));
 const term=norm($('term').value),sex=$('sex').value;
 if($('kind').value!=='nombre'){panel.append(elt('p','El ranking nacional de apellidos requiere incorporar el fichero oficial específico del INE. En preparación.'));return}
 if(!db){panel.append(elt('p','Cargando clasificación nacional de nombres…'));return}
 const rows=db.registros.filter(r=>r.sexo===sex).slice().sort((a,b)=>b.total-a.total||a.nombre.localeCompare(b.nombre,'es'));const rank=rows.findIndex(r=>norm(r.nombre)===term);
 if(rank===-1){panel.append(elt('p','Este nombre no aparece entre los registros nacionales publicados. No significa que no exista.'));return}
 const summary=elt('p');const b=elt('strong','«'+rows[rank].nombre+'» ocupa el puesto '+fmt(rank+1));summary.append(b,document.createTextNode(' entre '+fmt(rows.length)+' nombres '+(sex==='H'?'masculinos':'femeninos')+' publicados por el INE.'));panel.append(summary);
 const desc=elt('p','Ranking por número de personas residentes en España. Fuente: INE · '+db.fecha_referencia+'. Los nombres con la misma cifra se muestran ordenados alfabéticamente; la posición es ordinal en este listado publicado.');desc.className='tiny muted';panel.append(desc);
 const start=Math.max(0,rank-4),near=rows.slice(start,Math.min(rows.length,start+9));const max=Math.max(1,...near.map(r=>r.total));const table=elt('table'),thead=elt('thead'),tr=elt('tr');['Puesto','Nombre','Personas','Comparación'].forEach(t=>{const th=elt('th',t);tr.append(th)});thead.append(tr);table.append(thead);
 const tbody=elt('tbody');near.forEach((r,i)=>{const row=elt('tr');if(norm(r.nombre)===term)row.style.background='#e6f3ff';[fmt(start+i+1),r.nombre,fmt(r.total)].forEach(value=>row.append(elt('td',value)));const td=elt('td'),bar=elt('div');bar.className='bar';const inner=elt('span');inner.style.width=100*r.total/max+'%';bar.append(inner);td.append(bar);row.append(td);tbody.append(row)});table.append(tbody);const wrap=elt('div');wrap.className='tablewrap';wrap.append(table);panel.append(wrap);
 const top=elt('details');const summaryTop=elt('summary','Ver los 20 nombres más frecuentes');top.append(summaryTop);
 const list=elt('ol');rows.slice(0,20).forEach(r=>list.append(elt('li',r.nombre+' · '+fmt(r.total)+' personas')));top.append(list);panel.append(top);
}
$('search').addEventListener('submit',()=>setTimeout(draw,0));$('kind').addEventListener('change',draw);$('sex').addEventListener('change',draw);
fetch('./ine-nombres.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('No disponible');return r.json()}).then(d=>{if(!Array.isArray(d.registros)||!/^https:\/\/(www\.)?ine\.es\//.test(d.fuente))throw Error('Fuente inválida');db=d;draw()}).catch(()=>{panel.replaceChildren();panel.append(elt('p','No se pudo cargar el ranking nacional del INE.'))});
})();