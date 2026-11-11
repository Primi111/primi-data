#!/usr/bin/env python3
"""Conversión estricta del XLS oficial del INE a JSON para PRIMI DATA.

Genera un fichero solo cuando identifica inequívocamente las cabeceras.
Los datos confidenciales/suprimidos se conservan como null, nunca como cero.
Uso: python scripts/convertir_apellidos.py archivo.xls [ine-apellidos.json]
"""
from __future__ import annotations
import json
import re
import sys
import unicodedata
from pathlib import Path
import xlrd

FUENTE = "https://www.ine.es/daco/daco42/nombyapel/apellidos_frecuencia.xls"
FECHA = "2025-01-01"

def norm(v):
    s = str(v or "").strip().lower()
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")

def count(v):
    if v is None or v == "" or str(v).strip() in (".", "..", "-", "s", "S"):
        return None
    if isinstance(v, float):
        return int(v) if v >= 0 and v.is_integer() else None
    if isinstance(v, int):
        return v if v >= 0 else None
    s = str(v).strip().replace(" ", "")
    if re.fullmatch(r"\d{1,3}(\.\d{3})+", s):
        s = s.replace(".", "")
    elif re.fullmatch(r"\d{1,3}(,\d{3})+", s):
        s = s.replace(",", "")
    if not re.fullmatch(r"\d+", s):
        return None
    return int(s)

def header_indexes(sheet):
    for ri in range(min(sheet.nrows, 28)):
        vals = [norm(x) for x in sheet.row_values(ri)]
        apellido = next((i for i,v in enumerate(vals) if v in ("apellido", "apellidos")), None)
        if apellido is None:
            continue
        primero = next((i for i,v in enumerate(vals) if ("primer" in v or "1" in v) and "apellido" in v), None)
        segundo = next((i for i,v in enumerate(vals) if ("segund" in v or "2" in v) and "apellido" in v), None)
        ambos = next((i for i,v in enumerate(vals) if "ambos" in v and "apellido" in v), None)
        # Cabeceras de dos alturas: buscar también en filas adyacentes.
        if primero is None or segundo is None:
            other=[norm(x) for x in sheet.row_values(ri+1)] if ri+1<sheet.nrows else []
            if primero is None: primero=next((i for i,v in enumerate(other) if v in ("1o", "1º", "primero", "primer apellido", "1er apellido")),None)
            if segundo is None: segundo=next((i for i,v in enumerate(other) if v in ("2o", "2º", "segundo", "segundo apellido", "2º apellido")),None)
            if ambos is None: ambos=next((i for i,v in enumerate(other) if v in ("ambos", "ambos apellidos")),None)
        if apellido is not None and primero is not None and segundo is not None and len({apellido,primero,segundo})==3:
            return ri+1, apellido, primero, segundo, ambos
    raise ValueError("Cabeceras no reconocidas. Revisar informes/estructura-apellidos.json; no se genera un JSON ambiguo.")

def convert(src:Path,dest:Path):
    book=xlrd.open_workbook(str(src))
    if len(book.sheets())!=1:
        raise ValueError("Excel con varias hojas: seleccionar explícitamente la tabla nacional tras inspección.")
    sheet=book.sheet_by_index(0)
    start,apellido_col,primero_col,segundo_col,ambos_col=header_indexes(sheet)
    seen=set();records=[]
    for i in range(start,sheet.nrows):
        r=sheet.row_values(i)
        apellido=str(r[apellido_col]).strip().upper() if apellido_col<len(r) else ""
        if not apellido or not re.fullmatch(r"[A-ZÁÉÍÓÚÜÑÇ' -]{2,85}",apellido) or apellido in ("TOTAL","APELLIDOS"):continue
        a=count(r[primero_col]) if primero_col<len(r) else None
        b=count(r[segundo_col]) if segundo_col<len(r) else None
        if a is None or a<20:continue  # umbral del listado nacional, primer apellido
        if b is not None and b<0:raise ValueError("Frecuencia negativa")
        ambos=count(r[ambos_col]) if ambos_col is not None and ambos_col<len(r) else None
        if ambos is not None and (b is not None and ambos>min(a,b)):
            raise ValueError(f"Incoherencia en el registro {apellido}")
        if apellido in seen:raise ValueError(f"Apellido duplicado: {apellido}")
        seen.add(apellido)
        records.append({"apellido":apellido,"primero":a,"segundo":b,"ambos":ambos})
    if not 5000 < len(records) < 200000:raise ValueError(f"Solo {len(records)} apellidos: comprobar cabeceras antes de publicar")
    records.sort(key=lambda x:(-x["primero"],x["apellido"]))
    dest.write_text(json.dumps({"fuente":FUENTE,"fecha_referencia":FECHA,"alcance":"España. Apellidos nacionales del INE con >=20 como primer apellido.","registros":records},ensure_ascii=False,separators=(",",":")),encoding="utf-8")
    print(f"Generados {len(records)} apellidos en {dest}")

if __name__=="__main__":
    if len(sys.argv) not in (2,3):raise SystemExit("Uso: python scripts/convertir_apellidos.py archivo.xls [salida.json]")
    convert(Path(sys.argv[1]),Path(sys.argv[2] if len(sys.argv)==3 else "ine-apellidos.json"))
