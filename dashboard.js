/* PRIMI DATA · Panel de estadísticas territoriales v1.3
 * Los rankings representan exclusivamente registros oficiales incorporados.
 * No se deducen datos municipales de totales provinciales o nacionales.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase();
const fmt=n=>Number(n).toLocaleString('es-ES');
const datasets={provincia:null,municipio:null};
const container=document.createElement('section');
container.className='card';container.id='explorador-territorial';
$('automatic').insertAdjacentElement('afterend',container);
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
const bar=(value,max)=>{const outer=el('div',undefined,'bar');outer.style.minWidth='90px';const inner=el('span');inner.style.width=(max?100*value/max:0)+'%';outer.append(inner);return outer};
function draw(){
 container.replaceChildren();container.append(el('span','Explorador geográfico · datos incorporados','tag'));
 container.append(el('h2','Rankings y gráficas'));
 const name=norm($('term').value),kind=$('kind').value,sex=$('sex').value;
 const intro=el('p',kind==='nombre'?'Distribución publicada del nombre «'+name+'».':'Para apellidos, la consulta oficial del INE permite obtener frecuencias de primer y segundo apellido. Estamos preparando su incorporación automática.','muted');container.append(intro);
 if(kind==='apellido'){
   const a=el('a','Consultar el apellido «'+name+'» en el INE ↗');a.href='https://www.ine.es/apellidos/';a.target='_blank';a.rel='noopener noreferrer';container.append(a);
   container.append(el('p','Aún no hay una base local de apellidos validada. No se muestra ningún ranking sin datos.','notice tiny'));return;
 }
 const options=el('div',undefined,'pd-controls');
 const levelLabel=el('label','Ámbito');const level=el('select');[['provincia','Provincias'],['municipio','Municipios']].forEach(([v,label])=>level.add(new Option(label,v)));
 const sortLabel=el('label','Ordenar por');const sort=el('select');[['personas','Número de personas'],['por_mil','Por mil habitantes']].forEach(([v,label])=>sort.add(new Option(label,v)));
 const qLabel=el('label','Filtrar por territorio');const q=el('input');q.type='search';q.placeholder='Buscar provincia o municipio';q.setAttribute('aria-label','Filtrar territorio');
 const limitLabel=el('label','Mostrar');const limit=el('select');[10,20,50,100,1000].forEach(n=>limit.add(new Option(n===1000?'Todos':String(n),String(n))));
 [[levelLabel,level],[sortLabel,sort],[qLabel,q],[limitLabel,limit]].forEach(([label,control])=>{const box=el('div');box.append(label,control);options.append(box)});
 container.append(options);
 const note=el('p','','tiny muted'),chartTitle=el('h3','Gráfico: 10 territorios destacados'),svgBox=el('div',undefined,'pd-chart'),tableBox=el('div',undefined,'tablewrap');container.append(note,chartTitle,svgBox,tableBox);
 const render=()=>{
   const db=datasets[level.value];tableBox.replaceChildren();svgBox.replaceChildren();
   if(!db){note.textContent='No se ha cargado el fichero territorial de '+level.value+'.';return}
   const all=(db.registros||[]).filter(x=>(level.value==='municipio'?norm(x.nombre||db.nombre):norm(x.nombre))===name&&(x.sexo||db.sexo)===sex);
   if(!all.length){note.textContent='No hay datos de '+level.value+' publicados en nuestra base para este nombre. No significa que haya cero personas.';return}
   const geo=level.value==='provincia'?'provincia':'municipio';
   const ranked=all.filter(x=>Number.isFinite(x.personas)&&Number.isFinite(x.por_mil)).filter(x=>norm(x[geo]).includes(norm(q.value))).sort((a,b)=>Number(b[sort.value])-Number(a[sort.value])||String(a[geo]).localeCompare(String(b[geo]),'es'));
   const visible=ranked.slice(0,Number(limit.value));const sum=all.reduce((n,x)=>n+x.personas,0);
   note.textContent=all.length+' territorios publicados para '+name+' · '+fmt(sum)+' personas en las filas disponibles · INE '+(db.fecha_referencia||'01/01/2025')+'. No equivale al total nacional. Los territorios no publicados no son ceros.';
   const chart=ranked.slice(0,10),max=Math.max(1,...chart.map(x=>Number(x[sort.value])));const width=800,left=240,right=85,row=36,height=Math.max(62,chart.length*row+16);
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 '+width+' '+height);svg.setAttribute('role','img');svg.setAttribute('aria-label','Gráfico de barras de los territorios ordenados por '+sort.options[sort.selectedIndex].text);svg.style.width='100%';
   const drawSvg=(tag,attrs,txt)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,String(v)));if(txt!==undefined)n.textContent=txt;svg.append(n)};
   chart.forEach((x,i)=>{const y=i*row+12,v=Number(x[sort.value]);drawSvg('text',{x:4,y:y+16,'font-size':13,fill:'#16304a'},String(x[geo]).slice(0,31));drawSvg('rect',{x:left,y,width:(width-left-right)*v/max,height:23,rx:5,fill:'#1267a3'});drawSvg('text',{x:width-right+7,y:y+16,'font-size':13,fill:'#16304a'},sort.value==='personas'?fmt(v):fmt(v)+' ‰')});svgBox.append(svg);
   const table=el('table'),thead=el('thead'),tr=el('tr');['#',level.value==='provincia'?'Provincia':'Municipio','Personas','Por mil','Gráfico'].forEach(t=>tr.append(el('th',t)));thead.append(tr);table.append(thead);const tbody=el('tbody');visible.forEach((x,i)=>{const tr=el('tr');[i+1,x[geo],fmt(x.personas),fmt(x.por_mil)+' ‰'].forEach(t=>tr.append(el('td',t)));const td=el('td');td.append(bar(Number(x[sort.value]),max));tr.append(td);tbody.append(tr)});table.append(tbody);tableBox.append(table);
 };
 [level,sort,limit].forEach(s=>s.addEventListener('change',render));q.addEventListener('input',render);render();
 container.append(el('p','Solo datos oficiales incorporados. Para nombres y apellidos sin desglose territorial cargado, la aplicación no calcula clasificaciones ficticias.','tiny muted'));
}
$('search').addEventListener('submit',()=>setTimeout(draw,0));
$('kind').addEventListener('change',draw);
Promise.allSettled([['provincia','ine-provincias.json'],['municipio','ine-municipios.json']].map(async ([key,file])=>{const r=await fetch('./'+file,{cache:'no-store'});if(!r.ok)throw Error(file);const db=await r.json();if(!Array.isArray(db.registros)||!/^https:\/\/(www\.)?ine\.es\//.test(db.fuente))throw Error('Origen no validado');if(db.registros.some(x=>!Number.isInteger(x.personas)||x.personas<5||!Number.isFinite(x.por_mil)))throw Error('Registros no válidos');datasets[key]=db})).then(draw);
})();