#!/usr/bin/env python3
"""Descarga y transforma la lista oficial de nombres INE 2025 a JSON consultable.
Ejecutar en ordenador con Internet: pip install requests openpyxl && python sync_ine.py
No publica datos si el formato no supera las validaciones.
"""
import requests,io,json,re,datetime,pathlib,sys
from openpyxl import load_workbook
URL='https://ine.es/daco/daco42/nombyapel/nombres_por_edad_media.xlsx'
OUT=pathlib.Path(__file__).parent/'ine-nombres.json'
def norm(x):
 return re.sub(r'\s+',' ',str(x or '').strip().upper())
def num(x):
 if isinstance(x,(int,float)): return int(x) if x>=0 and int(x)==x else None
 if isinstance(x,str):
  t=x.strip().replace('.','').replace(' ','')
  if t.isdigit():return int(t)
 return None

def main():
 r=requests.get(URL,timeout=90,headers={'User-Agent':'PRIMI-DATA/0.6'});r.raise_for_status()
 if not r.content.startswith(b'PK'):raise ValueError('No es XLSX')
 wb=load_workbook(io.BytesIO(r.content),read_only=True,data_only=True)
 print('Hojas:',[(s.title,s.max_row,s.max_column) for s in wb])
 results=[]
 for ws in wb:
  rows=ws.iter_rows(values_only=True)
  header=None
  for row in rows:
   vals=[norm(v) for v in row]
   if header is None:
    name=next((i for i,v in enumerate(vals) if v in ('NOMBRE','NOMBRES')),None)
    freq=next((i for i,v in enumerate(vals) if 'FRECUENCIA' in v or v in ('TOTAL','NUMERO DE PERSONAS','NÚMERO DE PERSONAS')),None)
    sex=next((i for i,v in enumerate(vals) if v in ('SEXO','GENERO','GÉNERO')),None)
    age=next((i for i,v in enumerate(vals) if 'EDAD MEDIA' in v),None)
    if name is not None and freq is not None:header=(name,freq,sex,age)
    continue
   name,freq,sex,age=header
   if len(row)<=max(name,freq):continue
   n=norm(row[name]);f=num(row[freq]);s=norm(row[sex]) if sex is not None and sex<len(row) else norm(ws.title)
   if not n or f is None or f<20 or n.startswith('TOTAL'):continue
   gender='H' if s in ('H','HOMBRE','HOMBRES','VARONES','MASCULINO') else 'M' if s in ('M','MUJER','MUJERES','FEMENINO') else None
   if not gender:continue
   edad=row[age] if age is not None and age<len(row) and isinstance(row[age],(int,float)) else None
   results.append({'nombre':n,'sexo':gender,'total':f,'edad_media':edad})
 if len(results)<100:raise ValueError('Formato inesperado: menos de 100 registros validados. No se genera JSON.')
 seen=set()
 for x in results:
  k=(x['nombre'],x['sexo'])
  if k in seen:raise ValueError('Duplicados: '+str(k))
  seen.add(k)
 data={'fuente':URL,'fecha_referencia':'2025-01-01','descargado_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'alcance':'España, listado nacional de nombres','registros':results}
 OUT.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
 print('OK:',len(results),'registros',OUT)
 print('PRIMITIVO:',[x for x in results if x['nombre']=='PRIMITIVO'])
if __name__=='__main__':
 try:main()
 except Exception as e:sys.exit('ERROR: '+str(e))
