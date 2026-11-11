(()=>{'use strict';
let nombres=null,apellidos=null;
const $=id=>document.getElementById(id),status=$('auto-status'),out=$('auto-results'),heading=$('result-heading');
const norm=s=>String(s||'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
const fmt=n=>Number(n).toLocaleString('es-ES');
function stat(grid,label,value){const box=document.createElement('div'),small=document.createElement('small'),strong=document.createElement('strong');box.className='stat';small.textContent=label;strong.textContent=value;box.append(small,strong);grid.append(box)}
function cite(db){const p=document.createElement('p'),a=document.createElement('a');p.className='tiny';p.textContent='Fuente: INE · ';a.href=db.fuente;a.textContent='Datos oficiales';a.target='_blank';a.rel='noopener noreferrer';p.append(a);out.append(p)}
function draw(){
 const name=$('term').value.trim(),kind=$('kind').value,sex=$('sex').value;
 heading.textContent='Resultado de '+(name||'tu búsqueda').toLocaleUpperCase('es');out.replaceChildren();
 const db=kind==='nombre'?nombres:apellidos;
 if(!db){status.textContent=kind==='nombre'?'Cargando base nacional de nombres del INE…':'La base nacional de apellidos todavía está pendiente de importación y validación. Mientras tanto, puedes utilizar el enlace de consulta oficial.';if(kind==='apellido'){const a=document.createElement('a');a.href='https://www.ine.es/apellidos/formGeneral.do?L=0&vista=1';a.textContent='Consultar apellidos directamente en el INE';a.target='_blank';a.rel='noopener noreferrer';out.append(a)}return}
 const match=db.registros.find(x=>norm(kind==='nombre'?x.nombre:x.apellido)===norm(name)&&(kind==='apellido'||x.sexo===sex));
 if(!match){status.textContent='No hay resultado publicado en esta base para la búsqueda. La ausencia no significa que existan cero personas.';return}
 status.textContent='Datos nacionales del INE · referencia '+db.fecha_referencia;
 const grid=document.createElement('div');grid.className='statgrid';
 if(kind==='nombre'){
   stat(grid,'Personas en España',fmt(match.total));
   if(typeof match.edad_media==='number')stat(grid,'Edad media',fmt(match.edad_media)+' años');
 }else{
   [['Primer apellido','primero'],['Segundo apellido','segundo'],['Ambos apellidos','ambos']].forEach(([label,key])=>{
     if(Number.isSafeInteger(match[key])&&match[key]>=0)stat(grid,label,fmt(match[key]));
   });
   const p=document.createElement('p');p.className='notice tiny';p.textContent='La cifra «Ambos» ya está incluida en las otras dos columnas. No se deben sumar como si fueran personas distintas. Un valor no publicado no equivale a cero.';out.append(grid,p);cite(db);return;
 }
 out.append(grid);cite(db);
}
$('search').addEventListener('submit',draw);$('kind').addEventListener('change',draw);
function load(file,kind){fetch('./'+file,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('No disponible');return r.json()}).then(db=>{if(!Array.isArray(db.registros)||!/^https:\/\/(www\.)?ine\.es\//.test(db.fuente))throw Error('Datos inválidos');if(kind==='nombre')nombres=db;else apellidos=db;draw()}).catch(()=>{if(kind==='nombre')nombres=null;else apellidos=null;draw()})}
load('ine-nombres.json','nombre');load('ine-apellidos.json','apellido');
})();