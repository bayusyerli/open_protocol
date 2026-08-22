#!/usr/bin/env bash
# Ringkasan hasil toko_data/raw/osm.ndjson untuk pemeriksaan cepat.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
RAW="toko_data/raw"

echo "TOTAL BARIS : $(wc -l < "$RAW/osm.ndjson" | tr -d ' ')"
echo
echo "PER PROVINSI"
jq -r '.provinsi' "$RAW/osm.ndjson" | sort | uniq -c | sort -rn | awk '{printf "  %-6s %s\n", $1, substr($0, index($0,$2))}'
echo
echo "PER TAG"
jq -r '.tag' "$RAW/osm.ndjson" | sort | uniq -c | sort -rn | awk '{printf "  %-6s %s\n", $1, substr($0, index($0,$2))}'
echo
echo "PER TIPE ELEMEN"
jq -r '.sumber_id | split("/")[0]' "$RAW/osm.ndjson" | sort | uniq -c
echo
echo "DIBUANG, PER ALASAN  (total $(wc -l < "$RAW/dibuang.ndjson" | tr -d ' '))"
jq -r '.alasan' "$RAW/dibuang.ndjson" | sed 's/=.*//' | sort | uniq -c | sort -rn | awk '{printf "  %-6s %s\n", $1, substr($0, index($0,$2))}'
echo
echo "DIBUANG, rincian tag-bukan-toko"
jq -r 'select(.alasan|startswith("tag-bukan-toko")) | .alasan' "$RAW/dibuang.ndjson" | sort | uniq -c | sort -rn | head -20
echo
echo "CONTOH 5 BARIS"
head -5 "$RAW/osm.ndjson"
