# Penyaring hasil Overpass -> NDJSON toko sarana pertanian.
#
# Dipanggil dari toko_data/ambil-osm.sh:
#   jq -c --arg prov_bbox "<nama provinsi>" --slurpfile petafile raw/peta-provinsi.json \
#         -f toko_data/saring.jq raw/osm-<prov>.json
#
# Regex sisi server sengaja longgar (Overpass tidak mendukung \b). Presisi
# dikerjakan di sini: jq memakai Oniguruma yang mendukung \b dengan benar.
#
# Aturan simpan (harus dua-duanya, kecuali jalur tag/kata sempit):
#   1. SINYAL AGRI  - tag toko memang agri, ATAU nama mengandung kata agri.
#   2. BERWUJUD TOKO - punya shop=*/craft=*, office=company, building=retail,
#                      atau namanya berpola toko (TOKO/UD/CV/PT/KIOS/DEPO/AGRO).
# Kata kunci sempit (pupuk, saprotan, saprodi, obat pertanian, toko tani, ...)
# cukup spesifik sehingga syarat (2) tidak diwajibkan.
#
# Setiap elemen tetap dikeluarkan dengan .status + .alasan supaya jumlah yang
# dibuang bisa diaudit (lihat raw/dibuang.ndjson).

def norm: ascii_downcase | gsub("[^a-z0-9]+"; " ") | sub("^ +"; "") | sub(" +$"; "");
def trim: sub("^[[:space:]]+"; "") | sub("[[:space:]]+$"; "");

($petafile[0] // {})                                                    as $peta

# --- sinyal agri pada nama ---
| ("\\btani\\b|\\bpertanian\\b|\\bpupuk\\b|\\bsaprotan\\b|\\bsaprodi\\b"
  + "|\\bbibit\\b|\\bbenih\\b|\\bpakan\\b|\\bternak\\b|\\bpeternakan\\b"
  + "|\\bpoultry\\b|\\bhortikultura\\b|\\bagrokimia\\b|\\bagro|\\bagri\\b"
  + "|\\bunggas\\b|\\bpestisida\\b|\\btanaman\\b|\\bperkebunan\\b"
  + "|\\bpalawija\\b|\\bhidroponik\\b|\\bpembibitan\\b|\\bpenggilingan padi\\b") as $AGRI

# --- kata kunci sempit: cukup spesifik untuk dipakai tanpa bukti "toko" ---
| ("\\bpupuk\\b|\\bsaprotan\\b|\\bsaprodi\\b|obat pertanian|toko tani|kios tani"
  + "|toko pertanian|kios pertanian|sarana pertanian|\\bagrokimia\\b|pakan ternak"
  + "|poultry shop|toko benih|toko bibit|kios pupuk|depo pupuk|\\bpestisida\\b") as $SEMPIT

# --- nama berpola toko ---
| ("^(toko|tk|ud|u d|cv|c v|pt|kios|depo|tb)\\b|^agro")                 as $POLA_TOKO

# --- nama yang jelas bukan toko ---
| ("^(jl|jalan|jln|gg|gang|desa|kelurahan|kecamatan|dusun|kampung|perumahan|blok|rt|rw)\\b") as $NAMA_JALAN
| ("kelompok tani|gabungan kelompok|gapoktan|\\bpoktan\\b|kelompok wanita tani"
  + "|kelompok ternak|kelompok peternak|\\bbank\\b|balai penyuluh|penyuluh pertanian"
  + "|\\bbpp\\b|dinas pertanian|\\bdinas\\b|\\bupt\\b|\\buptd\\b|balai benih|\\bbptp\\b"
  + "|puskeswan|puskesmas|posyandu|poskesdes|\\bkantor\\b|balai desa|\\bkelompok\\b"
  + "|\\bsmk\\b|\\bsma\\b|\\bsmp\\b|\\bsdn\\b|\\bmts\\b|\\bman\\b|madrasah|universitas"
  + "|fakultas|politeknik|pesantren|sekolah|kampus|akademi|laboratorium|penelitian"
  + "|masjid|mushola|musholla|surau|gereja|\\bpura\\b|vihara|klenteng"
  + "|agrowisata|\\bwisata\\b|kebun raya|\\bhutan\\b|\\bvilla\\b|\\bhotel\\b"
  + "|penginapan|homestay|rumah makan|warung makan|restoran|\\bkafe\\b|\\bcafe\\b"
  + "|lapangan|stadion|terminal|stasiun|bandara|pelabuhan|\\bmakam\\b"
  + "|\\btpu\\b|\\btpa\\b|\\btps\\b")                                    as $INSTANSI

# --- amenity yang pasti bukan toko sarana pertanian ---
| ("^(school|kindergarten|college|university|place_of_worship|restaurant|cafe"
  + "|fast_food|food_court|bar|pub|nightclub|bank|atm|bureau_de_change|fuel"
  + "|charging_station|hospital|clinic|doctors|dentist|pharmacy|veterinary"
  + "|police|fire_station|townhall|toilets|parking|parking_space|bicycle_parking"
  + "|bus_station|community_centre|social_facility|grave_yard|prison|courthouse"
  + "|post_office|library|shelter|drinking_water|waste_disposal|recycling"
  + "|theatre|cinema|car_wash|driving_school|childcare|research_institute"
  + "|public_bath|water_point|fountain|ferry_terminal)$")                as $AMENITY_TOLAK

| .elements[]
| . as $e
| (.tags // {})                                                         as $t
| (if ($t.name | type) == "string" then ($t.name | trim) else "" end)    as $nama
| ($nama | norm)                                                        as $n
| (.lat // (.center.lat // null))                                       as $lat
| (.lon // (.center.lon // null))                                       as $lon
| "\(.type)/\(.id)"                                                     as $sid

# tag yang paling menjelaskan wujud elemen, untuk jejak asal
| (if   $t.shop              then "shop=\($t.shop)"
   elif $t.craft             then "craft=\($t.craft)"
   elif ($t.office // "") == "company" then "office=company"
   elif ($t.building // "") == "retail" then "building=retail"
   elif $t.office            then "office=\($t.office)"
   elif $t.amenity           then "amenity=\($t.amenity)"
   elif $t.landuse           then "landuse=\($t.landuse)"
   elif $t.place             then "place=\($t.place)"
   elif $t.highway           then "highway=\($t.highway)"
   elif $t.man_made          then "man_made=\($t.man_made)"
   elif $t.building          then "building=\($t.building)"
   else "tanpa-tag"
   end)                                                                 as $tag

| ($peta[$sid] // $prov_bbox)                                           as $prov
| ($t.shop == null and $t.craft == null)                                as $tanpa_shop

# jalur A: tag toko yang memang relevan
| ((($t.shop // "") | test("^(agrarian|farm|garden_centre|feed|animal_feed|agricultural_supplies|agricultural)$"))
   or (($t.craft // "") == "agricultural_engines"))                     as $tag_agri

| ($n | test($AGRI))                                                    as $agri_nama
| ($n | test($SEMPIT))                                                  as $sempit
| (($t.shop != null) or ($t.craft != null)
   or (($t.office // "") == "company") or (($t.building // "") == "retail")
   or ($n | test($POLA_TOKO)))                                          as $berwujud_toko

| (if   ($nama | length) == 0                       then "nama-kosong"
   elif ($lat == null or $lon == null)              then "tanpa-koordinat"

   # --- tolak berdasarkan tag wujud (hanya bila tidak ada shop/craft) ---
   elif $tanpa_shop and $t.place                    then "tag-bukan-toko:place=\($t.place)"
   elif $tanpa_shop and $t.highway                  then "tag-bukan-toko:highway=\($t.highway)"
   elif $tanpa_shop and $t.railway                  then "tag-bukan-toko:railway"
   elif $tanpa_shop and $t.waterway                 then "tag-bukan-toko:waterway"
   elif $tanpa_shop and $t.aeroway                  then "tag-bukan-toko:aeroway"
   elif $tanpa_shop and $t.natural                  then "tag-bukan-toko:natural"
   elif $tanpa_shop and $t.boundary                 then "tag-bukan-toko:boundary"
   elif $tanpa_shop and $t.landuse                  then "tag-bukan-toko:landuse=\($t.landuse)"
   elif $tanpa_shop and $t.leisure                  then "tag-bukan-toko:leisure"
   elif $tanpa_shop and $t.tourism                  then "tag-bukan-toko:tourism"
   elif $tanpa_shop and $t.healthcare               then "tag-bukan-toko:healthcare"
   elif $tanpa_shop and $t.historic                 then "tag-bukan-toko:historic"
   elif $tanpa_shop and $t.military                 then "tag-bukan-toko:military"
   elif $tanpa_shop and $t.power                    then "tag-bukan-toko:power"
   elif $tanpa_shop and $t.public_transport         then "tag-bukan-toko:public_transport"
   elif $tanpa_shop and ($t.office != null and $t.office != "company")
                                                    then "tag-bukan-toko:office=\($t.office)"
   elif ($t.shop == null) and (($t.amenity // "") | test($AMENITY_TOLAK))
                                                    then "tag-bukan-toko:amenity=\($t.amenity)"

   # --- tolak berdasarkan nama (tag agri jelas mengalahkan nama) ---
   elif (($tag_agri | not) and ($n | test($NAMA_JALAN)))  then "nama-jalan-atau-wilayah"
   elif (($tag_agri | not) and ($n | test($INSTANSI)))    then "nama-instansi-atau-bukan-toko"

   # --- syarat isi & wujud ---
   elif (($tag_agri | not) and ($agri_nama | not))        then "tanpa-sinyal-agri"
   elif (($tag_agri | not) and ($sempit | not) and ($berwujud_toko | not))
                                                          then "bukan-wujud-toko"
   else ""
   end)                                                                 as $alasan

| { nama: $nama, lat: $lat, lon: $lon, sumber: "osm", sumber_id: $sid,
    tag: $tag, provinsi: $prov,
    status: (if $alasan == "" then "simpan" else "buang" end) }
  + (if $alasan == "" then {} else { alasan: $alasan } end)
