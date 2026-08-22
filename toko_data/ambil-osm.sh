#!/usr/bin/env bash
# Ambil toko sarana pertanian di Pulau Jawa dari OpenStreetMap via Overpass API.
#
#   bash toko_data/ambil-osm.sh            # ambil yang belum ada, lalu olah
#   bash toko_data/ambil-osm.sh --olah     # olah ulang dari respons mentah yang sudah ada
#   bash toko_data/ambil-osm.sh --ulang    # paksa ambil ulang semuanya
#
# Keluaran : toko_data/raw/osm.ndjson              (baris yang lolos saring)
#            toko_data/raw/osm-dibuang.ndjson      (yang dibuang + alasan, untuk audit)
#            toko_data/raw/osm-<prov>.json         (respons mentah bbox per provinsi, gabungan a+b)
#            toko_data/raw/osm-<prov>-a.json       (bagian a: jalur tag + shop&nama)
#            toko_data/raw/osm-<prov>-b.json       (bagian b: pemindaian nama)
#            toko_data/raw/ids-<prov>.json         (id per batas administratif, untuk label provinsi)
#
# Pelajaran yang sudah dibayar mahal, jangan diulang:
#
#   1. Overpass TIDAK mendukung \b pada regex. Diuji: "\btani\b" mengembalikan 0
#      hasil sementara substring "tani" mengembalikan 348 pada bbox yang sama.
#      Maka regex sisi server sengaja longgar (substring) dan penyaringan presisi
#      dikerjakan lokal di toko_data/saring.jq (jq/Oniguruma mendukung \b).
#
#   2. HANYA overpass-api.de yang punya data Indonesia. Cermin lain diuji dan
#      gagal: overpass.osm.ch menjawab HTTP 200 dengan 0 elemen (ekstrak regional
#      Swiss - diam-diam mengosongkan hasil, ini sempat menghapus data Jawa Tengah
#      dan Jawa Timur), kumi.systems dan osm.jp tidak terjangkau, private.coffee
#      menjawab HTTP 500. Karena itu daftar cermin sengaja hanya berisi satu
#      endpoint, dan hasil 0 elemen diperlakukan sebagai KEGAGALAN, bukan sebagai
#      "memang kosong".
#
#   3. Kueri gabungan pemindaian nama pada bbox besar sering kena HTTP 504.
#      Karena itu tiap provinsi dipecah dua permintaan: (a) jalur tag + shop&nama
#      yang memakai indeks tag sehingga cepat, dan (b) pemindaian nama tanpa key
#      yang mahal. Dipecah begini keduanya lolos.
#
#   4. bbox provinsi saling tumpang tindih (DKI di dalam bbox Jabar, DIY di dalam
#      bbox Jateng, Jateng/Jatim beririsan di bujur 110.85-111.75). Label provinsi
#      karena itu diambil dari keanggotaan batas administratif (area); bbox hanya
#      cadangan bila kueri area gagal.

set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

RAW="toko_data/raw"
mkdir -p "$RAW"

# Hanya endpoint yang terbukti menyajikan data Indonesia. Lihat catatan 2 di atas.
ENDPOINT="https://overpass-api.de/api/interpreter"
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
# Jalur A: tag toko yang memang relevan
SHOPTAG='^(agrarian|farm|garden_centre|feed|animal_feed|agricultural_supplies|agricultural)$'
# Jalur B1: punya key shop + nama berpola toko/agri (regex tugas apa adanya)
BROAD='(toko|ud|cv|kios|depo|agro|tani|pertanian|pupuk|saprotan|saprodi|obat pertanian|bibit|benih|pakan|ternak|poultry|hortikultura|agrokimia|agri)'
# Jalur B2: apa pun tanpa key shop, nama mengandung kata agri
AGRI='(tani|pertanian|pupuk|saprotan|saprodi|obat pertanian|bibit|benih|pakan|ternak|poultry|hortikultura|agrokimia|agro|unggas|peternakan|pestisida)'
# Jalur C: kata sarana produksi yang tidak tercakup B2 (tanaman hias, obat-obatan, alsintan)
EKSTRA='(tanaman|hidroponik|perkebunan|palawija|herbisida|insektisida|fungisida|alsintan|traktor|hand sprayer|obat tanaman)'

# bagian_a <pembatas> -- pakai indeks tag, cepat
bagian_a() {
  printf '  nwr["shop"~"%s"]%s;\n  nwr["craft"="agricultural_engines"]%s;\n  nwr["shop"]["name"~"%s",i]%s;\n' \
    "$SHOPTAG" "$1" "$1" "$BROAD" "$1"
}
# bagian_b <pembatas> -- pemindaian nama, mahal, sengaja dipisah
bagian_b() {
  printf '  nwr["name"~"%s",i]%s;\n' "$AGRI" "$1"
}
# bagian_c <pembatas> -- pemindaian nama untuk kata sarana produksi tambahan
bagian_c() {
  printf '  nwr["name"~"%s",i]%s;\n' "$EKSTRA" "$1"
}

# ambil <query> <berkas keluaran> -- 0 elemen dihitung GAGAL (lihat catatan 2)
ambil() {
  local q="$1" out="$2" i code n
  if [ "${ULANG:-0}" != "1" ] && [ -f "$out" ]; then
    n=$(jq '.elements|length' "$out" 2>/dev/null || echo 0)
    if [ "${n:-0}" -gt 0 ]; then echo "    lewat (sudah ada, $n elemen)" >&2; return 0; fi
  fi
  for i in 1 2 3 4 5 6 7 8; do
    code=$(curl -s --max-time 900 -A "$UA" -o "$out.tmp" -w '%{http_code}' \
             "$ENDPOINT" --data-urlencode "data=$q" 2>/dev/null)
    if [ "$code" = "200" ] && jq -e 'has("elements")' "$out.tmp" >/dev/null 2>&1; then
      n=$(jq '.elements|length' "$out.tmp")
      if jq -e '(.remark // "") | test("timed out|out of memory")' "$out.tmp" >/dev/null 2>&1; then
        echo "    ! remark: $(jq -r '.remark' "$out.tmp" | head -c 110)" >&2
      elif [ "$n" -eq 0 ]; then
        echo "    ! 0 elemen - dianggap gagal, coba lagi" >&2
      else
        mv "$out.tmp" "$out"; echo "    ok ($n elemen)" >&2; return 0
      fi
    else
      echo "    ! HTTP=$code (percobaan $i)" >&2
    fi
    sleep $(( 20 + 15 * i ))
  done
  rm -f "$out.tmp"; return 1
}

GAGAL=""
[ "${1:-}" = "--ulang" ] && ULANG=1

if [ "${1:-}" != "--olah" ]; then
  for row in "${PROVINSI[@]}"; do
    IFS='|' read -r slug nama bbox areaid <<<"$row"
    echo "== $nama =="
    W="($bbox)"

    echo "  [bbox a] tag + shop&nama"
    ambil "[out:json][timeout:300];
(
$(bagian_a "$W")
);
out tags center;" "$RAW/osm-$slug-a.json" || GAGAL="$GAGAL $nama(bbox-a)"
    sleep 5

    echo "  [bbox b] pemindaian nama"
    ambil "[out:json][timeout:300];
(
$(bagian_b "$W")
);
out tags center;" "$RAW/osm-$slug-b.json" || GAGAL="$GAGAL $nama(bbox-b)"
    sleep 5

    echo "  [bbox c] kata sarana produksi tambahan"
    ambil "[out:json][timeout:300];
(
$(bagian_c "$W")
);
out tags center;" "$RAW/osm-$slug-c.json" || GAGAL="$GAGAL $nama(bbox-c)"
    sleep 5

    echo "  [area a] id, untuk label provinsi"
    ambil "[out:json][timeout:300];
area($areaid)->.a;
(
$(bagian_a "(area.a)")
);
out ids;" "$RAW/ids-$slug-a.json" || GAGAL="$GAGAL $nama(area-a)"
    sleep 5

    echo "  [area b] id, untuk label provinsi"
    ambil "[out:json][timeout:300];
area($areaid)->.a;
(
$(bagian_b "(area.a)")
);
out ids;" "$RAW/ids-$slug-b.json" || GAGAL="$GAGAL $nama(area-b)"
    sleep 5

    echo "  [area c] id, untuk label provinsi"
    ambil "[out:json][timeout:300];
area($areaid)->.a;
(
$(bagian_c "(area.a)")
);
out ids;" "$RAW/ids-$slug-c.json" || GAGAL="$GAGAL $nama(area-c)"
    sleep 5

    # gabungkan bagian a+b+c jadi respons mentah per provinsi
    for pre in osm ids; do
      PARTS=""
      for x in a b c; do
        [ -s "$RAW/$pre-$slug-$x.json" ] && PARTS="$PARTS $RAW/$pre-$slug-$x.json"
      done
      if [ -n "$PARTS" ]; then
        # shellcheck disable=SC2086
        jq -s '{elements: (map(.elements // []) | add | unique_by("\(.type)/\(.id)"))}' \
          $PARTS > "$RAW/$pre-$slug.json"
      fi
    done
    echo "  gabung: $(jq '.elements|length' "$RAW/osm-$slug.json" 2>/dev/null || echo 0) elemen bbox, $(jq '.elements|length' "$RAW/ids-$slug.json" 2>/dev/null || echo 0) id area"
  done
fi

# --- olah --------------------------------------------------------------------
echo "== olah =="

# Peta sumber_id -> provinsi dari keanggotaan batas administratif.
: > "$RAW/osm-peta-pairs.ndjson"
for row in "${PROVINSI[@]}"; do
  IFS='|' read -r slug nama bbox areaid <<<"$row"
  [ -f "$RAW/ids-$slug.json" ] || continue
  jq -c --arg p "$nama" '.elements[] | {key:"\(.type)/\(.id)", value:$p}' \
    "$RAW/ids-$slug.json" >> "$RAW/osm-peta-pairs.ndjson"
done
jq -s 'from_entries' "$RAW/osm-peta-pairs.ndjson" > "$RAW/osm-peta-provinsi.json"
echo "  peta provinsi: $(jq 'length' "$RAW/osm-peta-provinsi.json") id"

: > "$RAW/osm-semua.ndjson"
for row in "${PROVINSI[@]}"; do
  IFS='|' read -r slug nama bbox areaid <<<"$row"
  if [ ! -s "$RAW/osm-$slug.json" ]; then
    echo "  lewat $nama (tidak ada respons mentah)"; continue
  fi
  jq -c --arg prov_bbox "$nama" \
        --slurpfile petafile "$RAW/osm-peta-provinsi.json" \
        -f toko_data/saring.jq "$RAW/osm-$slug.json" >> "$RAW/osm-semua.ndjson"
done

# Dedup: kunci utama sumber_id, kunci sekunder nama ternormalkan + koordinat 4 desimal.
jq -s '
  def sec: (.nama | ascii_downcase | gsub("[^a-z0-9]"; ""))
           + "@" + (((.lat*10000)|round)/10000|tostring)
           + ","  + (((.lon*10000)|round)/10000|tostring);
  { simpan: (map(select(.status=="simpan")) | unique_by(.sumber_id) | unique_by(sec)),
    buang:  (map(select(.status=="buang"))  | unique_by(.sumber_id)) }
' "$RAW/osm-semua.ndjson" > "$RAW/osm-dedup.json"

jq -c '.simpan[] | del(.status, .alasan)' "$RAW/osm-dedup.json" > "$RAW/osm.ndjson"
jq -c '.buang[]'                          "$RAW/osm-dedup.json" > "$RAW/osm-dibuang.ndjson"

echo "  simpan : $(wc -l < "$RAW/osm.ndjson" | tr -d ' ') baris"
echo "  dibuang: $(wc -l < "$RAW/osm-dibuang.ndjson" | tr -d ' ') baris"
if [ -n "$GAGAL" ]; then echo "GAGAL:$GAGAL"; else echo "semua provinsi terambil"; fi
exit 0
