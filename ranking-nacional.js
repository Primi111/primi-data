/* PRIMI DATA · Ranking nacional de nombres y apellidos (INE 01/01/2025). */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const norm=s=>String(s||'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
const fmt=n=>Number(n).toLocaleString('es-ES');
let nombres=null,apellidos=null;
const panel=document.createElement('section');panel.className='card';panel.id='ranking-nacional';$('automatic').insertAdjacentElement('afterend',panel);
function elt(tag,text){const x=document.createElement(tag);if(text!==undefined)x.textContent=text;return x}
function draw(){
 panel.replaceChildren();const kind=$('kind').value,term=norm($('term').value),sex=$('sex').value;
 const db=kind==='nombre'?nombres:apellidos,key=kind==='nombre'?'nombre':'apellido',metric=kind==='nombre'?'total':'primero';
 panel.append(elt('h2',kind==='nombre'?'Ranking nacional de nombres':'Ranking nacional de primeros apellidos'));
 if(!db){panel.append(elt('p',kind==='nombre'?'Cargando nombres oficiales…':'La base nacional de apellidos sigue pendiente de validación. No es posible dar un puesto sin el fichero.'));return}
 const rows=db.registros.filter(r=>kind==='apellido'||r.sexo===sex).filter(r=>Number.isSafeInteger(r[metric])&&r[metric]>=0).slice().sort((a,b)=>b[metric]-a[metric]||String(a[key]).localeCompare(String(b[key]),'es'));
 const rank=rows.findIndex(r=>norm(r[key])===term);
 if(rank<0){panel.append(elt('p','No figura en el listado nacional publicado. No significa que no existan personas con este '+(kind==='nombre'?'nombre':'apellido')+'.'));return}
 const summary=elt('p');summary.append(elt('strong','«'+rows[rank][key]+'» ocupa el puesto '+fmt(rank+1)),document.createTextNode(' de '+fmt(rows.length)+' '+(kind==='nombre'?'nombres '+(sex==='H'?'masculinos':'femeninos'):'primeros apellidos')+' publicados por el INE.'));panel.append(summary);
 const desc=elt('p','Ordenado por número de personas como '+(kind==='nombre'?'nombre':'primer apellido')+'. Fuente: INE · '+db.fecha_referencia+'. Los empates se ordenan alfabéticamente; se trata de la posición ordinal en este catálogo, no del ranking oficial con empates.');desc.className='tiny muted';panel.append(desc);
 const start=Math.max(0,rank-4),near=rows.slice(start,Math.min(rows.length,start+9)),max=Math.max(1,...near.map(r=>r[metric]));
 const table=elt('table'),thead=elt('thead'),tr=elt('tr');['Puesto',kind==='nombre'?'Nombre':'Apellido','Personas','Comparación'].forEach(t=>tr.append(elt('th',t)));thead.append(tr);table.append(thead);
 const tbody=elt('tbody');near.forEach((r,i)=>{const row=elt('tr');if(norm(r[key])===term)row.style.background='#e6f3ff';[fmt(start+i+1),r[key],fmt(r[metric])].forEach(value=>row.append(elt('td',value)));const td=elt('td'),bar=elt('div');bar.className='bar';const inner=elt('span');inner.style.width=100*r[metric]/max+'%';bar.append(inner);td.append(bar);row.append(td);tbody.append(row)});table.append(tbody);const wrap=elt('div');wrap.className='tablewrap';wrap.append(table);panel.append(wrap);
 const top=elt('details');top.append(elt('summary','Ver los 20 '+(kind==='nombre'?'nombres':'apellidos')+' más frecuentes'));
 const list=elt('ol');rows.slice(0,20).forEach(r=>list.append(elt('li',r[key]+' · '+fmt(r[metric])+' personas')));top.append(list);panel.append(top);
}
$('search').addEventListener('submit',()=>setTimeout(draw,0));$('kind').addEventListener('change',draw);$('sex').addEventListener('change',draw);
for(const [kind,file] of [['nombre','ine-nombres.json'],['apellido','ine-apellidos.json']]){
 fetch('./'+file,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('No disponible');return r.json()}).then(d=>{if(!Array.isArray(d.registros)||!/^https:\/\/(www\.)?ine\.es\//.test(d.fuente))throw Error('Fuente inválida');if(kind==='nombre')nombres=d;else apellidos=d;draw()}).catch(()=>draw());
}
})();