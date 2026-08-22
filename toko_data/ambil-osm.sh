#!/usr/bin/env bash
# Ambil toko sarana pertanian di Pulau Jawa dari OpenStreetMap via Overpass API.
#
#   bash toko_data/ambil-osm.sh            # ambil dari Overpass lalu olah
#   bash toko_data/ambil-osm.sh --olah     # olah ulang dari respons mentah yang sudah ada
#
# Keluaran : toko_data/raw/osm.ndjson          (baris yang lolos saring)
#            toko_data/raw/dibuang.ndjson      (yang dibuang + alasannya, untuk audit)
#            toko_data/raw/osm-<prov>.json     (respons mentah bbox, per provinsi)
#            toko_data/raw/ids-<prov>.json     (id per batas administratif, untuk label provinsi)
#
# Catatan teknis:
#   - Overpass TIDAK mendukung \b pada regex (diuji: mengembalikan 0 hasil untuk
#     "\btani\b" sementara substring "tani" mengembalikan 348). Maka regex sisi
#     server sengaja longgar (substring) dan penyaringan presisi dikerjakan lokal
#     di toko_data/saring.jq dengan jq/Oniguruma yang mendukung \b.
#   - bbox provinsi saling tumpang tindih (DKI di dalam bbox Jabar, DIY di dalam
#     bbox Jateng, Jateng/Jatim beririsan di bujur 110.85-111.75). Label provinsi
#     karena itu diambil dari keanggotaan batas administratif (area); bbox hanya
#     dipakai sebagai cadangan bila kueri area gagal.

set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

RAW="toko_data/raw"
mkdir -p "$RAW"

ENDPOINTS=(
  "https://overpass-api.de/api/interpreter"
  "https://overpass.osm.ch/api/interpreter"
  "https://overpass.kumi.systems/api/interpreter"
  "https://overpass.private.coffee/api/interpreter"
)
UA='open_protocol/toko-sarana-pertanian (kontak: bayusyerli@gmail.com)'

# slug|nama provinsi|bbox|area id (3600000000 + id relasi admin_level=4)
PROVINSI=(
  "banten|Banten|-7.05,105.0,-5.75,106.85|3602388356"
  "dki-jakarta|DKI Jakarta|-6.40,106.60,-5.90,107.05|3606362934"
  "jawa-barat|Jawa Barat|-7.90,106.30,-5.90,108.90|3602388361"
  "jawa-tengah|Jawa Tengah|-8.30,108.45,-6.25,111.75|3602388357"
  "di-yogyakarta|DI Yogyakarta|-8.25,110.00,-7.50,110.90|3605616105"
  "jawa-timur|Jawa Timur|-8.85,110.85,-6.70,114.70|3603438227"
)

# --- regex sisi server (longgar; disaring lagi di saring.jq) ------------------
# Jalur B1: apa pun yang punya key shop + nama berpola toko/agri (regex tugas apa adanya)
BROAD='(toko|ud|cv|kios|depo|agro|tani|pertanian|pupuk|saprotan|saprodi|obat pertanian|bibit|benih|pakan|ternak|poultry|hortikultura|agrokimia|agri)'
# Jalur B2: apa pun (tanpa key shop) yang namanya mengandung kata agri
AGRI='(tani|pertanian|pupuk|saprotan|saprodi|obat pertanian|bibit|benih|pakan|ternak|poultry|hortikultura|agrokimia|agro|unggas|peternakan|pestisida)'
# Jalur A: tag toko yang memang relevan
SHOPTAG='^(agrarian|farm|garden_centre|feed|animal_feed|agricultural_supplies|agricultural)$'

badan_query() { # $1 = pembatas wilayah, mis. "(-7.0,106.0,-6.0,107.0)" atau "(area.a)"
  local W="$1"
  cat <<EOF
  nwr["shop"~"$SHOPTAG"]$W;
  nwr["craft"="agricultural_engines"]$W;
  nwr["shop"]["name"~"$BROAD",i]$W;
  nwr["name"~"$AGRI",i]$W;
EOF
}

# ambil <query> <berkas keluaran> -- coba beberapa endpoint, mundur bertahap
ambil() {
  local q="$1" out="$2" i ep code
  for i in 1 2 3 4 5 6 7 8; do
    ep="${ENDPOINTS[$(( (i-1) % ${#ENDPOINTS[@]} ))]}"
    code=$(curl -s --max-time 600 -A "$UA" -o "$out.tmp" -w '%{http_code}' \
             "$ep" --data-urlencode "data=$q" 2>/dev/null)
    if [ "$code" = "200" ] && jq -e 'has("elements")' "$out.tmp" >/dev/null 2>&1; then
      if jq -e '(.remark // "") | test("timed out|out of memory")' "$out.tmp" >/dev/null 2>&1; then
        echo "    ! remark: $(jq -r '.remark' "$out.tmp" | head -c 120)" >&2
      else
        mv "$out.tmp" "$out"
        echo "    ok  ($(jq '.elements|length' "$out") elemen) via ${ep#https://}" >&2
        return 0
      fi
    else
      echo "    ! HTTP=$code via ${ep#https://}" >&2
    fi
    sleep $(( 10 * i ))
  done
  rm -f "$out.tmp"
  return 1
}

GAGAL=""

if [ "${1:-}" != "--olah" ]; then
  for row in "${PROVINSI[@]}"; do
    IFS='|' read -r slug nama bbox areaid <<<"$row"
    echo "== $nama =="

    echo "  [bbox] data + tag"
    Q="[out:json][timeout:600][maxsize:1073741824];
(
$(badan_query "($bbox)")
);
out tags center;"
    ambil "$Q" "$RAW/osm-$slug.json" || GAGAL="$GAGAL $nama(bbox)"
    sleep 6

    echo "  [area] id saja, untuk label provinsi"
    QA="[out:json][timeout:600][maxsize:1073741824];
area($areaid)->.a;
(
$(badan_query "(area.a)")
);
out ids;"
    ambil "$QA" "$RAW/ids-$slug.json" || GAGAL="$GAGAL $nama(area)"
    sleep 6
  done
fi

# --- olah --------------------------------------------------------------------
echo "== olah =="

# Peta sumber_id -> provinsi, dari keanggotaan batas administratif.
: > "$RAW/peta-pairs.ndjson"
for row in "${PROVINSI[@]}"; do
  IFS='|' read -r slug nama bbox areaid <<<"$row"
  [ -f "$RAW/ids-$slug.json" ] || continue
  jq -c --arg p "$nama" '.elements[] | {key:"\(.type)/\(.id)", value:$p}' \
    "$RAW/ids-$slug.json" >> "$RAW/peta-pairs.ndjson"
done
jq -s 'from_entries' "$RAW/peta-pairs.ndjson" > "$RAW/peta-provinsi.json"
echo "  peta provinsi: $(jq 'length' "$RAW/peta-provinsi.json") id"

: > "$RAW/semua.ndjson"
for row in "${PROVINSI[@]}"; do
  IFS='|' read -r slug nama bbox areaid <<<"$row"
  if [ ! -f "$RAW/osm-$slug.json" ]; then
    echo "  lewat $nama (tidak ada respons mentah)"
    continue
  fi
  jq -c --arg prov_bbox "$nama" \
        --slurpfile petafile "$RAW/peta-provinsi.json" \
        -f toko_data/saring.jq "$RAW/osm-$slug.json" >> "$RAW/semua.ndjson"
done

# Dedup: kunci utama sumber_id, kunci sekunder nama ternormalkan + koordinat 4 desimal.
jq -s '
  def sec: (.nama | ascii_downcase | gsub("[^a-z0-9]"; ""))
           + "@" + (((.lat*10000)|round)/10000|tostring)
           + ","  + (((.lon*10000)|round)/10000|tostring);
  { simpan: (map(select(.status=="simpan")) | unique_by(.sumber_id) | unique_by(sec)),
    buang:  (map(select(.status=="buang"))  | unique_by(.sumber_id)) }
' "$RAW/semua.ndjson" > "$RAW/dedup.json"

jq -c '.simpan[] | del(.status, .alasan)' "$RAW/dedup.json" > "$RAW/osm.ndjson"
jq -c '.buang[]'                          "$RAW/dedup.json" > "$RAW/dibuang.ndjson"

echo "  simpan : $(wc -l < "$RAW/osm.ndjson" | tr -d ' ') baris"
echo "  dibuang: $(wc -l < "$RAW/dibuang.ndjson" | tr -d ' ') baris"
if [ -n "$GAGAL" ]; then echo "GAGAL:$GAGAL"; fi
exit 0
