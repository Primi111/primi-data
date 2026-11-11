#!/usr/bin/env python3
"""Convierte CSV exportado desde la consulta oficial del INE a JSON provincial.
No realiza scraping. Uso: python3 sync_provincias.py archivo.csv --nombre PRIMITIVO --sexo H --provincia Provincia --frecuencia Personas
Para CSV con todas las provincias, indicar las cabeceras exactas; se rechazan subtotales y duplicados.
"""
import argparse,csv,json,re,datetime,pathlib,sys
from unicodedata import normalize

def norm(s):
 return ''.join(c for c in normalize('NFD',str(s).upper().strip()) if c not in '\u0300\u0301\u0302\u0303\u0308')
def number(s):
 t=str(s).strip().replace(' ','').replace('.','')
 if not t.isdecimal():raise ValueError('Frecuencia no entera: '+repr(s))
 return int(t)
def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('csv');ap.add_argument('--nombre',required=True);ap.add_argument('--sexo',required=True,choices=['H','M']);ap.add_argument('--provincia',required=True,help='Nombre exacto de la columna');ap.add_argument('--frecuencia',required=True,help='Nombre exacto de la columna');ap.add_argument('--fuente',default='https://www.ine.es/tnombres/formGeneral.do?L=0&vista=1');ap.add_argument('--fecha',default='2025-01-01');a=ap.parse_args()
 path=pathlib.Path(a.csv);raw=path.read_text(encoding='utf-8-sig');dialect=csv.Sniffer().sniff(raw[:4096],delimiters=',;\t');reader=csv.DictReader(raw.splitlines(),dialect=dialect)
 if not reader.fieldnames or a.provincia not in reader.fieldnames or a.frecuencia not in reader.fieldnames:raise ValueError('Columnas inexistentes: '+repr(reader.fieldnames))
 rows=[];seen=set()
 for line,row in enumerate(reader,2):
  place=str(row[a.provincia] or '').strip();v=str(row[a.frecuencia] or '').strip()
  if not place and not v:continue
  if not place or norm(place).startswith(('TOTAL','ESPANA','ESPAÑA')):raise ValueError('Fila total o territorio vacío en línea '+str(line))
  n=number(v)
  if n<5:raise ValueError('Frecuencia inferior a 5 en línea '+str(line))
  key=norm(place)
  if key in seen:raise ValueError('Provincia duplicada: '+place)
  seen.add(key);rows.append({'nombre':norm(a.nombre),'sexo':a.sexo,'provincia':place,'personas':n})
 if not rows or len(rows)>53:raise ValueError('Cantidad de provincias inesperada: '+str(len(rows)))
 out=pathlib.Path(__file__).with_name('ine-provincias.json');data={'fuente':a.fuente,'fecha_referencia':a.fecha,'generado_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'alcance':'Provincias de residencia, exportación oficial verificada manualmente','registros':rows}
 out.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8');print('OK:',len(rows),'provincias',out)
if __name__=='__main__':
 try:main()
 except Exception as exc:sys.exit('ERROR: '+str(exc))
