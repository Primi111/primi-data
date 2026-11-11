#!/usr/bin/env python3
"""Inspección no destructiva del Excel oficial de apellidos del INE.
No publica datos ni construye rankings sin validar su estructura.
"""
from __future__ import annotations
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
import xlrd

URL = "https://www.ine.es/daco/daco42/nombyapel/apellidos_frecuencia.xls"
OUT = Path("informes")
OUT.mkdir(exist_ok=True)
def clean(value):
    if isinstance(value, float) and value.is_integer(): return int(value)
    return str(value).strip() if not isinstance(value, (int, float)) else value
def main():
    req = Request(URL, headers={"User-Agent": "PRIMI-DATA/1.3 (+https://github.com/Primi111/primi-data)", "Accept": "application/vnd.ms-excel,*/*"})
    with urlopen(req, timeout=90) as response:
        data=response.read(40_000_001)
        mime=response.headers.get("content-type", "")
    if len(data)>40_000_000: raise ValueError("El archivo supera el límite de seguridad de 40 MB")
    if not data.startswith(b"\xd0\xcf\x11\xe0"): raise ValueError("El fichero descargado no tiene la cabecera XLS esperada; revisar fuente")
    book=xlrd.open_workbook(file_contents=data)
    info={"fuente":URL,"fecha_descarga_utc":datetime.now(timezone.utc).isoformat(),"tipo":mime,"bytes":len(data),"hojas":[]}
    for s in book.sheets():
        preview=[]
        for i in range(min(20,s.nrows)):
            preview.append({"fila":i+1,"celdas":[clean(v) for v in s.row_values(i)[:12]]})
        info["hojas"].append({"nombre":s.name,"filas":s.nrows,"columnas":s.ncols,"vista_previa":preview})
        print("HOJA:",s.name,"filas:",s.nrows,"columnas:",s.ncols)
        for p in preview[:8]:print(" ",p["fila"],str(p["celdas"])[:250])
    (OUT/"estructura-apellidos.json").write_text(json.dumps(info,ensure_ascii=False,indent=2),encoding="utf-8")
    print("Archivo de diagnóstico generado. NO se ha modificado la base de producción.")
if __name__=="__main__":
    try:main()
    except Exception as exc:
        print(f"ERROR: {exc}",file=sys.stderr)
        raise
