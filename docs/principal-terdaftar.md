# Principal terdaftar — pupuk & pestisida

> Daftar rujukan. Nama sudah diseragamkan memakai konvensi yang sama dengan sisi benih
> di `proseed_data/pemohon_alias.csv`, supaya repositori ini punya satu cara, bukan dua.

> Sumber: [database pupuk & pestisida terdaftar Kementan](https://ap-simpel.pertanian.go.id/), ditarik 19 Agustus 2026.

## Penyeragaman nama

| | |
|---|---:|
| Nama sebagaimana tertulis di registri | 2.304 |
| Setelah diseragamkan | **1.948** |
| Varian yang digabung | 356 |
| Ditandai perlu ditinjau | 7 |

Nama asli **tidak pernah ditimpa** — tersimpan utuh di `pukpes_data/principal_kanonik.csv`.
Seluruh pemetaan beserta alasannya ada di `pukpes_data/principal_alias.csv`, dengan kolom
`nama_asli, nama_kanonik, dasar, perlu_tinjau, pendaftaran`. Membalik penggabungan berarti
menyunting berkas itu lalu membangkitkan ulang kolom kanoniknya; tidak ada data yang hilang.

Alasan penggabungan: 332 ejaan/kapitalisasi/spasi, 327 kanonik, 16 tanda-baca, 7 beda-bentuk-badan,
1 id-registri-sama.

### Yang ditandai perlu ditinjau

Nama sama tetapi bentuk badan hukumnya berbeda. Digabung karena hampir pasti salah entri,
tetapi ditandai supaya bisa dipisahkan lagi kalau ternyata memang dua badan berbeda.

| Nama asli | Digabung ke | Pendaftaran |
|---|---|---:|
| MULYO TANI MAKMUR | CV. Mulyo Tani Makmur | 21 |
| BUMI INDO RAHARJA | PT Bumi Indo Raharja | 10 |
| PT. CIPTA AGRIFARMERINDO | CV. Cipta Agrifarmerindo | 6 |
| PRIMA AGRO LANCAR | CV. PRIMA AGRO LANCAR | 2 |
| CV. BUMI INDO RAHARJA | PT Bumi Indo Raharja | 2 |
| PT. MULYO TANI MAKMUR | CV. Mulyo Tani Makmur | 1 |
| PT. PRIMA AGRO LANCAR | CV. PRIMA AGRO LANCAR | 1 |

### Yang digabung karena registri menyamakannya

`dasar=id-registri-sama` tidak menimbang ejaan sama sekali. Kedua CSV pupuk membawa UUID
badan dari registri — `perusahaan_id` di `pupuk_terdaftar.csv`, `id_perusahaan` di
`pupuk_terdaftar_legacy.csv` — dan nilainya sepadan lintas kedua basis. Dua ejaan yang
berbagi satu UUID adalah satu badan menurut pihak yang mendaftarkannya, sejauh apa pun
tulisannya berbeda.

| Nama asli | Digabung ke | Pendaftaran | UUID badan |
|---|---|---:|---|
| Perusahaan Perseroan (Persero) PT. Pupuk Indonesia | PT Pupuk Indonesia (Persero) | 20 | `4a4f695d…` |

Keduanya memegang UUID `4a4f695d-430d-417f-83d1-4895100ae731`, dan tidak ada nama ketiga
yang memakainya. Yang membelahnya adalah dua basis: 20 pendaftaran tercatat di SIMPEL
dengan ejaan panjang, 4 di SIMPUK 2020 dengan ejaan pendek. Bentuk kanoniknya jatuh ke
`PT Pupuk Indonesia (Persero)` menurut aturan pertama — ada prefiks badan hukum di depan —
meski ejaan satunya lebih sering muncul.

Empat pasangan ber-UUID sama lainnya masih terpisah dan sengaja dibiarkan; daftarnya
beserta alasannya ada di [`pukpes_data/README.md`](../pukpes_data/README.md). Yang paling
tidak sepele `DGW PUPUK INDONESIA` dan `PT. Hextar Fertilizer Indonesia` — nama badan yang
berganti, bukan salah eja, sehingga menggabungnya berarti memutuskan nama mana yang
berlaku hari ini.

Arah sebaliknya sama mengikatnya: UUID yang berbeda menahan penggabungan yang ejaannya
menggoda. `PUPUK INDONESIA NIAGA`, `PT. Kingenta Pupuk Indonesia`, `PT. DRAGON PUPUK
INDONESIA`, dan `WULAN PUPUK INDONESIA` semuanya memuat kata "Pupuk Indonesia" dan
semuanya badan yang berlainan.

### Singkatan sengaja tidak digabung

Tidak ada singkatan yang berisiko di sisi ini — hanya empat nama pendek (`CV. DMA`, `RILIS`,
`AROMA`, `IJO`) dengan 1–3 pendaftaran, dan tak satu pun punya kandidat nama panjang yang
masuk akal di registri. Bandingkan dengan sisi benih, yang punya `PT BCA`, `PT SHS`, dan
`PT BISI` — ketiganya ambigu dan sengaja dibiarkan terpisah.

## Ringkasan

| | |
|---|---:|
| Principal | **1.948** |
| Total pendaftaran | 14.920 |

**Sebaran.** Sepuluh teratas memegang 1.652 pendaftaran (11%); lima puluh teratas 5.177 (35%). Ekornya panjang — 851 principal hanya memegang satu pendaftaran.

## Daftar lengkap

| # | Principal | Pendaftaran | Ejaan | Sektor |
|---:|---|---:|---:|---|
| 1 | PT. CENTA BRASINDO ABADI CHEMICAL INDUSTRY | 218 | 2 | pestisida, pupuk |
| 2 | PT. RAINBOW AGROSCIENCES | 183 | 2 | pestisida, pupuk |
| 3 | PT. SARI KRESNA KIMIA | 181 | 2 | pestisida, pupuk, pupuk-legacy |
| 4 | PT. MULTI SARANA INDOTANI | 180 | 3 | pestisida, pupuk, pupuk-legacy |
| 5 | PT. SINAR GENERAL INDUSTRIES | 157 | 2 | pestisida, pupuk, pupuk-legacy |
| 6 | CV. SAPROTAN UTAMA | 153 | 2 | pestisida, pupuk, pupuk-legacy |
| 7 | PT. TIGA MUARA EMAS MAKMUR | 151 | 2 | pestisida, pupuk |
| 8 | PT. GODREJ CONSUMER PRODUCTS INDONESIA | 144 | 1 | pestisida |
| 9 | PT. INTI EVERSPRING INDONESIA | 143 | 1 | pestisida |
| 10 | PT. FUMAKILLA INDONESIA | 142 | 1 | pestisida |
| 11 | PT.MEROKE TETAP JAYA | 141 | 2 | pupuk, pupuk-legacy |
| 12 | PT. MEST INDONESIY | 134 | 2 | pupuk, pupuk-legacy |
| 13 | PT. BEHN MEYER AGRICARE | 134 | 2 | pestisida, pupuk, pupuk-legacy |
| 14 | PT. DELTA GIRI WACANA | 133 | 2 | pestisida, pupuk |
| 15 | PT. DALZON CHEMICALS INDONESIA | 132 | 1 | pestisida |
| 16 | PT. Maju Makmur Utomo | 121 | 3 | pestisida, pupuk, pupuk-legacy |
| 17 | PT. PRIMA KARYA BERJAYA | 114 | 2 | pestisida, pupuk |
| 18 | PT. Petrosida Gresik | 108 | 3 | pestisida, pupuk, pupuk-legacy |
| 19 | PT. BASF INDONESIA | 106 | 1 | pestisida |
| 20 | PT. SOLO LOGO INDONESIA | 104 | 1 | pestisida |
| 21 | PT Petrokimia Kayaku | 101 | 3 | pestisida, pupuk, pupuk-legacy |
| 22 | PT. NUFARM INDONESIA | 96 | 1 | pestisida |
| 23 | PT. ADVANSIA INDOTANI | 95 | 2 | pestisida, pupuk |
| 24 | PT. MAXXI AGRI INDONESIA | 93 | 2 | pestisida, pupuk |
| 25 | PT. DELTAGRO MULIA SEJATI | 92 | 2 | pestisida, pupuk |
| 26 | PT. SYNGENTA INDONESIA | 90 | 2 | pestisida, pupuk |
| 27 | CV. AGRO JAYA INDONESIA | 89 | 2 | pestisida, pupuk |
| 28 | PT Petrokimia Gresik | 87 | 2 | pupuk, pupuk-legacy |
| 29 | PT. AGRO JAYA INDUSTRI | 83 | 1 | pestisida |
| 30 | PT. UPL INDONESIA | 82 | 2 | pestisida, pupuk |
| 31 | PT. Permata Agro Persada | 78 | 2 | pupuk, pupuk-legacy |
| 32 | PT. Multi Mas Chemindo | 77 | 1 | pupuk, pupuk-legacy |
| 33 | PT. KENSO INDONESIA | 74 | 2 | pestisida, pupuk |
| 34 | PT. SAPROTAN UTAMA NUSANTARA | 73 | 2 | pestisida, pupuk |
| 35 | PT. INDOIN BUSINESS GROUP | 72 | 2 | pestisida, pupuk |
| 36 | PT. Agro Bumi Timur | 72 | 2 | pestisida, pupuk |
| 37 | PT. BINA GUNA KIMIA | 72 | 2 | pestisida, pupuk |
| 38 | PT. SENTANA ADIDAYA PRATAMA | 72 | 2 | pupuk, pupuk-legacy |
| 39 | PT. REJEKI INDO AGROTEC | 71 | 2 | pestisida, pupuk |
| 40 | PT. INDO-SINO AGROCHEMICAL | 70 | 1 | pestisida |
| 41 | PT. BIOTIS AGRINDO | 70 | 3 | pestisida, pupuk, pupuk-legacy |
| 42 | PT. Sasco Indonesia | 70 | 2 | pupuk, pupuk-legacy |
| 43 | PT. DHARMA GUNA WIBAWA | 69 | 2 | pestisida, pupuk |
| 44 | PT. Bayer Indonesia | 67 | 3 | pestisida, pupuk, pupuk-legacy |
| 45 | PT. CORTEVA AGRISCIENCE MANUFACTURING INDONESIA | 66 | 1 | pestisida |
| 46 | PT. SANLEX MALINDO | 64 | 1 | pupuk, pupuk-legacy |
| 47 | PT. SANTANI SEJAHTERA | 64 | 2 | pestisida, pupuk, pupuk-legacy |
| 48 | PT. BLUE CUBE INDONESIA | 63 | 1 | pestisida |
| 49 | PT. MULTI NIAGA NUSANTARA INDONESIA | 63 | 2 | pupuk, pupuk-legacy |
| 50 | PT. AGRICULTURE CONSTRUCTION | 63 | 2 | pestisida, pupuk |
| 51 | PT. Dharma Ayu Tani | 60 | 3 | pestisida, pupuk, pupuk-legacy |
| 52 | PT. WILMAR CHEMICAL INDONESIA | 60 | 2 | pupuk, pupuk-legacy |
| 53 | PT. Rolimex Kimia Nusamas | 58 | 3 | pestisida, pupuk, pupuk-legacy |
| 54 | PT. ETONG CHEMICAL INDONESIA | 57 | 2 | pestisida, pupuk |
| 55 | PT. CATUR AGRODAYA MANDIRI | 57 | 2 | pestisida, pupuk, pupuk-legacy |
| 56 | PT JADI MAS | 55 | 2 | pupuk, pupuk-legacy |
| 57 | PT. Cipta Makmur Pertiwi | 54 | 2 | pupuk, pupuk-legacy |
| 58 | PT. Kristalindo Karunia Internasional | 53 | 3 | pestisida, pupuk, pupuk-legacy |
| 59 | PT. ROYAL AGRO INDONESIA | 52 | 2 | pestisida, pupuk |
| 60 | CV. Multi Agro Jaya Utama | 52 | 2 | pestisida, pupuk-legacy |
| 61 | PT. DA MING INDONESIA | 51 | 1 | pestisida |
| 62 | DGW PUPUK INDONESIA | 51 | 1 | pupuk |
| 63 | PT. RAJA GROUP INDONESIA | 51 | 2 | pestisida, pupuk |
| 64 | PT. DANKEN INDONESIA | 49 | 1 | pestisida |
| 65 | PT. Asia Pupuk Guna Lestari | 49 | 1 | pupuk, pupuk-legacy |
| 66 | FERTILIZER INTI TECHNOLOGY | 48 | 1 | pupuk |
| 67 | PT. SAMUDRA UTAMA NARAPATI | 47 | 1 | pestisida |
| 68 | PT. YANNO AGRO SCIENCE INDONESIA | 47 | 1 | pestisida |
| 69 | PT. KINGAGROOT BIOTECHNOLOGY INDONESIA | 46 | 1 | pestisida |
| 70 | PT. SANTANI AGRO PERKASA | 46 | 1 | pestisida |
| 71 | PT. HANAMPI SEJAHTERA KAHURIPAN | 46 | 2 | pupuk, pupuk-legacy |
| 72 | PT Pupuk Kalimantan Timur | 45 | 2 | pupuk, pupuk-legacy |
| 73 | PT Kertopaten Kencana | 44 | 2 | pupuk, pupuk-legacy |
| 74 | CV. SARAREA PANEN RAYA | 44 | 2 | pestisida, pupuk, pupuk-legacy |
| 75 | PT. ALBAUGH AGRO INDONESIA | 43 | 1 | pestisida |
| 76 | PT. Hextar Fertilizer Indonesia | 43 | 1 | pupuk-legacy |
| 77 | PT. Agrotama Tunas Sarana | 43 | 2 | pupuk, pupuk-legacy |
| 78 | PT. PRIMA AGRO TECH | 43 | 3 | pestisida, pupuk, pupuk-legacy |
| 79 | PT. ADIL MAKMUR FAJAR | 41 | 1 | pestisida |
| 80 | PT. INDAGRO | 41 | 2 | pestisida, pupuk |
| 81 | PT. TANAMAN MAKMUR MANDIRI | 41 | 2 | pestisida, pupuk |
| 82 | PT. AGRO TRADISI | 41 | 2 | pupuk, pupuk-legacy |
| 83 | PT. TRIDA KIMIA SAKTI | 40 | 1 | pestisida |
| 84 | PT. AGRORISEN INDOMAKMUR CEMERLANG | 40 | 1 | pestisida |
| 85 | UD Primagro | 40 | 2 | pupuk, pupuk-legacy |
| 86 | PT. BERBAK AGRO SEJATI | 39 | 1 | pestisida |
| 87 | PT. JAYA WARINDO ABADI | 39 | 1 | pestisida |
| 88 | PT. FORAGRO MITRA SEJATI | 38 | 1 | pestisida |
| 89 | PT. PERSADA AGRO SUKSES | 38 | 1 | pestisida |
| 90 | PT. MITRA KREASIDHARMA | 38 | 2 | pestisida, pupuk |
| 91 | PT. Agrofarm Nusa Raya | 38 | 2 | pupuk, pupuk-legacy |
| 92 | PT. GLOBAL AGROTECH | 37 | 1 | pestisida |
| 93 | PT. AGRO SENTOSA RAYA | 37 | 1 | pestisida |
| 94 | PT.Antariksa Nusantara Indonesia Group | 37 | 2 | pupuk, pupuk-legacy |
| 95 | PT. MASCO AGRI GENETICS | 36 | 1 | pestisida |
| 96 | PT AGRI HIKAY INDONESIA | 36 | 2 | pupuk, pupuk-legacy |
| 97 | PT. TIARA BUANA MANDIRI | 35 | 1 | pestisida, pupuk-legacy |
| 98 | PT. FUMAKILLA NOMOS | 35 | 1 | pestisida |
| 99 | PT. SINAMYANG INDONESIA | 35 | 1 | pestisida |
| 100 | SARASWANTI ANUGERAH MAKMUR | 35 | 1 | pupuk |
| 101 | PT. AGRO SEJAHTERA INDONESIA | 34 | 1 | pestisida |
| 102 | PT. ARTHA MAKMUR ABADI | 34 | 2 | pestisida, pupuk, pupuk-legacy |
| 103 | PT. EXCEL MEG INDO | 33 | 1 | pestisida |
| 104 | CV. KHARISMA AGRI WIJAYA | 33 | 1 | pestisida |
| 105 | PT. AGROTECH PESTICIDE INDUSTRY | 33 | 2 | pestisida, pupuk |
| 106 | PT Pupuk Kujang | 33 | 3 | pestisida, pupuk, pupuk-legacy |
| 107 | PT. JIRONA AGRITAMA | 32 | 1 | pestisida |
| 108 | PT. PILARQUIM AGROSCIENCE INDONESIA | 32 | 1 | pestisida |
| 109 | PT. PUPUT TANI MANDIRI | 32 | 2 | pupuk, pupuk-legacy |
| 110 | PT. Dupan Anugerah Lestari | 31 | 2 | pupuk, pupuk-legacy |
| 111 | CV. Javamas Agrophos | 31 | 3 | pestisida, pupuk, pupuk-legacy |
| 112 | PT. TRITUNGGAL ARTHAMAKMUR | 30 | 1 | pestisida |
| 113 | PT. AGROMANNA JAYA LESTARI | 30 | 1 | pestisida |
| 114 | PT. TRIBINA TANIKARYA | 30 | 1 | pestisida |
| 115 | PT Exindo Raharja Pratama | 30 | 3 | pestisida, pupuk, pupuk-legacy |
| 116 | PT Bumi Indo Raharja | 30 | 3 | pupuk, pupuk-legacy |
| 117 | PT. SATYA AGRO INDONESIA | 29 | 1 | pestisida |
| 118 | CV. SURYA AGROKEMINDO PERKASA | 29 | 1 | pestisida |
| 119 | PT. DITYA CHEMINDO | 29 | 2 | pestisida, pupuk |
| 120 | PT. ECO AGRO MANDIRI | 29 | 2 | pupuk, pupuk-legacy |
| 121 | CV. ARTHA BUANA MANDIRI | 28 | 2 | pestisida, pupuk |
| 122 | CV. Nusa Nur Agro | 28 | 3 | pestisida, pupuk, pupuk-legacy |
| 123 | PT. CROP CARE INDONESIA | 27 | 1 | pestisida |
| 124 | TUNASHARAPAN MURNI | 27 | 1 | pestisida |
| 125 | PT. AGROKIMINDO KURNIABUANA | 27 | 1 | pestisida |
| 126 | ABADI AGROSINDO PERSADA | 27 | 1 | pupuk |
| 127 | PT.TANINDO INTERTRACO | 27 | 1 | pupuk-legacy |
| 128 | PT. ASIA GALA KIMIA | 27 | 2 | pestisida, pupuk |
| 129 | PT. SANTANI AGRO MANDIRI | 27 | 2 | pestisida, pupuk |
| 130 | PT. NUSA PALAPA GEMILANG | 27 | 2 | pupuk, pupuk-legacy |
| 131 | PT. DYRIZ INDONESIA | 27 | 2 | pestisida, pupuk |
| 132 | PT Greenlife Bioscience | 27 | 3 | pestisida, pupuk, pupuk-legacy |
| 133 | PT. MESTIKA NUSANTARA AGROKIMIA | 27 | 2 | pestisida, pupuk |
| 134 | PT. AGRO GUNA MAKMUR | 27 | 2 | pestisida, pupuk |
| 135 | PT. HERLINA INDAH | 26 | 1 | pestisida |
| 136 | CV. Mulyo Tani Makmur | 26 | 3 | pupuk, pupuk-legacy |
| 137 | PT Kalatham | 26 | 3 | pestisida, pupuk, pupuk-legacy |
| 138 | PT. ARXADA CHEMICALS INDONESIA | 25 | 1 | pestisida |
| 139 | PT. BAHTERA BONIAGA LESTARI | 25 | 1 | pestisida |
| 140 | PT. SARI KIMIA UNGGUL | 25 | 1 | pestisida |
| 141 | INDO ACIDATAMA | 25 | 1 | pupuk |
| 142 | CV. GRAHA AGRO | 25 | 2 | pestisida, pupuk |
| 143 | CV. Raja Grafika | 24 | 1 | pestisida, pupuk |
| 144 | PT. EASTCHEM AGROSCIENCE INDONESIA | 24 | 1 | pestisida |
| 145 | CV. AGRO CHEMICA | 24 | 1 | pestisida |
| 146 | CV. TRUBUS PRIMA | 24 | 2 | pestisida, pupuk, pupuk-legacy |
| 147 | PT Pupuk Indonesia (Persero) | 24 | 2 | pupuk, pupuk-legacy |
| 148 | PT Carlindo Serasi Abadi | 24 | 2 | pupuk, pupuk-legacy |
| 149 | PT. QILU CROP SCIENCE | 23 | 1 | pestisida |
| 150 | AGRI TANIMAS SELARAS | 23 | 1 | pupuk |
| 151 | PT. TANI MAS SUBUR | 23 | 2 | pestisida, pupuk |
| 152 | PT. HANEARL SCIENCE INDONESIA | 23 | 2 | pestisida, pupuk |
| 153 | CV. GRAHA AGRITECH PRIMA | 23 | 2 | pestisida, pupuk, pupuk-legacy |
| 154 | PT. JAWA AGRINDO INTERNASIONAL | 23 | 2 | pestisida, pupuk |
| 155 | PT. RABANA AGRO RESOURCES | 23 | 2 | pestisida, pupuk |
| 156 | PT. Agro Berjaya Nusantara | 23 | 2 | pupuk, pupuk-legacy |
| 157 | PT. Nusa Mandiri Utama | 23 | 2 | pestisida, pupuk-legacy |
| 158 | PT. SUMANS MANDIRI SEJAHTERA | 22 | 2 | pestisida, pupuk |
| 159 | PT ANUGERAH PUPUK MAKMUR | 22 | 2 | pupuk, pupuk-legacy |
| 160 | PT. GOAUTAMA SINARBATUAH | 22 | 2 | pupuk, pupuk-legacy |
| 161 | CV. UNI AGRO CHEMICA | 21 | 1 | pestisida |
| 162 | PT. AGRO TERRUM INDONESIA | 21 | 1 | pestisida |
| 163 | PT. MUTIARA AGRO SEJATI | 21 | 1 | pestisida |
| 164 | PT. TANGGUH AGRO NUSA INDONESIA | 21 | 2 | pestisida, pupuk |
| 165 | PT. ZENITH CROPSCIENCES INDONESIA | 21 | 2 | pestisida, pupuk |
| 166 | CV. MUTIARA KERATON JIMMY&CO TRANS BISNIS INDONESIA | 21 | 2 | pestisida, pupuk |
| 167 | PT. Laku Agung Bahagia Indonesia | 21 | 2 | pupuk, pupuk-legacy |
| 168 | PT. Agritek Tani Indonesia | 20 | 1 | pestisida, pupuk, pupuk-legacy |
| 169 | PT. ZHENGBANG CROP PROTECTION INDONESIA | 20 | 1 | pestisida |
| 170 | YARA INDONESIA | 20 | 1 | pupuk |
| 171 | PT. SUNJOY AGRO INDONESIA | 20 | 2 | pestisida, pupuk |
| 172 | PT. Anugerah Pupuk Lestari | 20 | 2 | pupuk, pupuk-legacy |
| 173 | PT. AGRO NATURAL TECHNOLOGY | 20 | 2 | pestisida, pupuk |
| 174 | PT. Agro Nusantara Indonesia | 20 | 2 | pupuk, pupuk-legacy |
| 175 | PT. Bumi Subur Sentosa | 20 | 2 | pupuk, pupuk-legacy |
| 176 | PT. DOUTA UTAMAN INDONESIA | 19 | 1 | pestisida |
| 177 | PT. SATYA ALAM SEMESTA | 19 | 1 | pestisida |
| 178 | PT. Gemilang Eka Dharma | 19 | 1 | pupuk, pupuk-legacy |
| 179 | PT. Artha Prima Humatindo | 19 | 2 | pupuk, pupuk-legacy |
| 180 | PT. Parama Agroindustri Danapati | 19 | 3 | pestisida, pupuk, pupuk-legacy |
| 181 | CV. BOMA SAKTI TANI | 19 | 2 | pestisida, pupuk, pupuk-legacy |
| 182 | PT. TAPAL KOEDA INDONESIA | 19 | 2 | pestisida, pupuk |
| 183 | PT. CHINA JIANGSU INTERNATIONAL INDONESIA | 18 | 1 | pestisida |
| 184 | PT. BIOTEK SARANATAMA | 18 | 1 | pestisida |
| 185 | PT. INDO HOECHST | 18 | 1 | pestisida |
| 186 | PT. MSR HIJAU LESTARI | 18 | 1 | pestisida |
| 187 | PRIMAGRO PRIMA INDONESIA | 18 | 1 | pupuk |
| 188 | CV. DELTA CHEMICA | 18 | 2 | pestisida, pupuk |
| 189 | PT. ASIA KIMINDO PRIMA | 18 | 2 | pupuk, pupuk-legacy |
| 190 | UD. Mitra Merdeka Tani | 18 | 3 | pupuk, pupuk-legacy |
| 191 | PT. BIOWORLD BIOSCIENCES MANUFACTURING INDUSTRIES | 17 | 1 | pestisida |
| 192 | PT. MITRA INDOTANI ABADI | 17 | 1 | pestisida |
| 193 | PT. FOCUSINDO ASIA PACIFIC | 17 | 1 | pestisida |
| 194 | PT. AGX ASIA INDONESIA | 17 | 1 | pestisida |
| 195 | AGINDA RIAU ABADI | 17 | 1 | pupuk |
| 196 | PT. ARYSTA LIFESCIENCE TIRTA | 17 | 2 | pestisida, pupuk |
| 197 | PT. MESTIKA KARUNIA UTAMA | 17 | 2 | pestisida, pupuk |
| 198 | PT SAFA AGROTEK INDONESIA | 17 | 2 | pupuk, pupuk-legacy |
| 199 | CV. Agro Nusa Indah | 17 | 2 | pupuk, pupuk-legacy |
| 200 | PT PUPUK SRIWIDJAJA PALEMBANG | 17 | 2 | pupuk, pupuk-legacy |
| 201 | PT. FERTA INDONESIA PERSADA | 17 | 2 | pupuk, pupuk-legacy |
| 202 | PT. JOHNSON HOME HYGIENE PRODUCTS | 16 | 1 | pestisida |
| 203 | PT. AGRO DYNAMICS INDO | 16 | 1 | pestisida |
| 204 | PT. NATHANI CHEMICALS | 16 | 1 | pestisida |
| 205 | CV. INDO TANI UTAMA | 16 | 1 | pestisida |
| 206 | PT. DISCOVERY ENVIRONMENTAL SCIENCE INDONESIA | 16 | 1 | pestisida |
| 207 | TAZAR GUNA MANDIRI | 16 | 1 | pupuk |
| 208 | PT. JIVA AGRICULTURE INDONESIA | 16 | 2 | pestisida, pupuk |
| 209 | PT. SAFE CHEMICAL INDONESIA | 16 | 2 | pestisida, pupuk, pupuk-legacy |
| 210 | PT. INTER AGRO INDONESIA | 16 | 2 | pestisida, pupuk |
| 211 | PT. CENTRA BIOTECH INDONESIA | 16 | 2 | pestisida, pupuk |
| 212 | CV. Sinar Surya | 16 | 2 | pupuk |
| 213 | PT. Polowijo Gosari | 16 | 2 | pupuk, pupuk-legacy |
| 214 | PT. UTOMO UTOMO | 16 | 2 | pestisida, pupuk, pupuk-legacy |
| 215 | PT. ANDAFA AGRO INDO | 16 | 2 | pestisida, pupuk |
| 216 | PT. MITRA FINEX ANTARNUSA | 16 | 2 | pupuk, pupuk-legacy |
| 217 | PT. FMC AGRICULTURAL MANUFACTURING | 15 | 1 | pestisida |
| 218 | PT. TRUSTCHEM AGRO INDONESIA | 15 | 1 | pestisida |
| 219 | PT. WINHONOR CONSULTING INDONESIA | 15 | 1 | pestisida |
| 220 | PT. IMCD INDONESIA | 15 | 1 | pestisida |
| 221 | PT. MAKMUR JAYA AGRO | 15 | 2 | pestisida, pupuk |
| 222 | PT. WAHANA PUNDIKARSA ABADI | 15 | 2 | pestisida, pupuk, pupuk-legacy |
| 223 | PT Pupuk Iskandar Muda | 15 | 2 | pupuk, pupuk-legacy |
| 224 | CV. JATI EMAS UNGGUL | 15 | 2 | pestisida, pupuk |
| 225 | PT. EUREEKAGREAT NUSANTARA | 15 | 2 | pestisida, pupuk |
| 226 | PT. SAFEEKO BIO INDONESIA | 15 | 2 | pestisida, pupuk |
| 227 | PT. KEMINDO ARTHA JAYA | 14 | 1 | pestisida |
| 228 | PT. BIOTEK SARANA INDUSTRI | 14 | 1 | pestisida |
| 229 | ADIDAYA NIRBATAS | 14 | 1 | pupuk |
| 230 | CV. Varia Chemika | 14 | 1 | pupuk, pupuk-legacy |
| 231 | PT. SANTANI AGRO LESTARI | 14 | 2 | pestisida, pupuk |
| 232 | PT. TRITAMA WIRAKARSA | 14 | 2 | pestisida, pupuk |
| 233 | CV.MITRA TANI ABADI JAYA | 14 | 2 | pupuk, pupuk-legacy |
| 234 | CV. Sumber Agung Jaya | 14 | 2 | pupuk |
| 235 | PT. AGRO INSANI SEMESTA | 14 | 2 | pestisida, pupuk |
| 236 | PT Gresik Cipta Sejahtera | 14 | 2 | pupuk, pupuk-legacy |
| 237 | PT Bio Sarana Indonesia | 14 | 3 | pestisida, pupuk, pupuk-legacy |
| 238 | CV. AGRO MULIA | 13 | 1 | pestisida |
| 239 | PT. NUSANTARA AGRO SUKSES | 13 | 1 | pestisida |
| 240 | CIPTO LANGGENG JOYO | 13 | 1 | pupuk |
| 241 | AGRI MANDIRI SEJAHTERA | 13 | 1 | pupuk |
| 242 | PT. DWIAGRI MAKMUR INTERTRADE | 13 | 2 | pestisida, pupuk, pupuk-legacy |
| 243 | CV IMEXINDO NUSANTARA | 13 | 2 | pupuk, pupuk-legacy |
| 244 | PT. Agspec Indonesia | 13 | 3 | pestisida, pupuk, pupuk-legacy |
| 245 | PT. ENFARM CROP SCIENCE | 12 | 1 | pestisida |
| 246 | PT. GONGCHENG BIOTECH INDONESIA | 12 | 1 | pestisida |
| 247 | CV. CV. SAKASAKI INDONESIA | 12 | 1 | pestisida |
| 248 | CV PLANET AGRONUSA | 12 | 1 | pestisida, pupuk |
| 249 | PT. AGRO BERJAYA CITRA TANI | 12 | 1 | pestisida |
| 250 | PT. AGRO AFIAT NUSANTARA | 12 | 1 | pupuk |
| 251 | MANO AGRI NUSANTARA | 12 | 1 | pupuk |
| 252 | SABANG MAKMUR SENTOSA | 12 | 1 | pupuk |
| 253 | HAMAS PANDJI INDONESIA | 12 | 1 | pupuk |
| 254 | ANJARI ATHA TANAYA | 12 | 1 | pupuk |
| 255 | MAKMUR JAYA ABADI | 12 | 1 | pupuk |
| 256 | PT Prosper Biotech Indonesia | 12 | 2 | pupuk, pupuk-legacy |
| 257 | PT CHEIL JEDANG INDONESIA | 12 | 2 | pupuk, pupuk-legacy |
| 258 | PT. Multidaya Putra Sejahtera | 12 | 2 | pupuk, pupuk-legacy |
| 259 | PT. AZELIS INDONESIA DISTRIBUSI | 12 | 2 | pestisida, pupuk |
| 260 | CV.Mitra Tani Abadi | 12 | 2 | pupuk, pupuk-legacy |
| 261 | PT. Gemah Ripah Loh Jinawi Industri | 12 | 2 | pupuk, pupuk-legacy |
| 262 | PT Tunas Agro Persada | 12 | 2 | pupuk, pupuk-legacy |
| 263 | WINNER AGROCHEM INTERNUSA | 11 | 1 | pestisida |
| 264 | CV. KUNIMA JAYA SELARAS | 11 | 1 | pestisida |
| 265 | PT. FARMCO KIMIA | 11 | 1 | pestisida |
| 266 | ARINDAMA NAWASENA AMERTA | 11 | 1 | pupuk |
| 267 | PT. KARISMA INDOAGRO UNIVERSAL | 11 | 1 | pupuk, pupuk-legacy |
| 268 | PT. SOJITZ INDONESIA | 11 | 1 | pupuk |
| 269 | PT. ORCHID GLOBAL MAKMUR | 11 | 2 | pestisida, pupuk, pupuk-legacy |
| 270 | PT. GALATTA LESTARINDO | 11 | 2 | pupuk, pupuk-legacy |
| 271 | PT. INDORAYA MITRA PERSADA SERATUS ENAM PULUH DELAPAN | 11 | 2 | pupuk, pupuk-legacy |
| 272 | PT GREEN PLANET INDONESIA | 11 | 2 | pupuk, pupuk-legacy |
| 273 | CV. GOLDEN FARM INDONESIA | 11 | 2 | pestisida, pupuk |
| 274 | CV.BUNGA TANI | 11 | 2 | pupuk, pupuk-legacy |
| 275 | PT. PERMATA NEGERI INDONESIA | 11 | 2 | pupuk, pupuk-legacy |
| 276 | PT. POMAL BEKA MANDIRI | 11 | 2 | pupuk, pupuk-legacy |
| 277 | PT POLARCHEM | 11 | 3 | pestisida, pupuk, pupuk-legacy |
| 278 | PT. Formitra Multi Prakarsa | 11 | 2 | pupuk, pupuk-legacy |
| 279 | PT. MENARA LAUT BERSATU | 10 | 1 | pestisida |
| 280 | PT. SARANA TANI INDONESIA MAKMUR | 10 | 1 | pestisida |
| 281 | PT. JJM INDONESIA | 10 | 1 | pestisida |
| 282 | PT. CORTEVA AGRISCIENCE INDONESIA | 10 | 1 | pestisida |
| 283 | CV. ABADI JAYA | 10 | 1 | pestisida |
| 284 | PT. RECKITT BENCKISER INDONESIA | 10 | 1 | pestisida |
| 285 | AGRIVERE TRANSFORMA INTERNASIONAL | 10 | 1 | pupuk |
| 286 | LABA INDOAGRO NUSANTARA | 10 | 1 | pupuk |
| 287 | YAN UTAMA CORPORATION | 10 | 1 | pupuk |
| 288 | TRIAGRO HIJRAH JAYA | 10 | 1 | pupuk |
| 289 | ANUGERAH MUSTIKA OSTINDO | 10 | 1 | pupuk |
| 290 | AGRO MULYA LESTARI | 10 | 1 | pupuk |
| 291 | ECA TANI BAROKAH | 10 | 1 | pupuk |
| 292 | LOTUS AGROKIMIA INDONESIA | 10 | 1 | pupuk |
| 293 | DRAGON DISTRIBUSI INDONESIA | 10 | 1 | pupuk |
| 294 | SCORLETS | 10 | 1 | pupuk |
| 295 | KAYUAN INFARM INDONESIA | 10 | 1 | pupuk |
| 296 | PT. BYTER AGRICULTURE INDONESIA | 10 | 2 | pestisida, pupuk |
| 297 | PT. Biosindo Mitra Jaya | 10 | 2 | pupuk, pupuk-legacy |
| 298 | PT. Winon International | 10 | 2 | pupuk, pupuk-legacy |
| 299 | PT. BENIH BERKAH BERSERI | 10 | 2 | pestisida, pupuk |
| 300 | PT. SURYA CIPTA PERKASA YOGYAKARTA | 10 | 2 | pupuk, pupuk-legacy |
| 301 | PT SRI REJEKI FERTILIZER | 10 | 2 | pupuk, pupuk-legacy |
| 302 | PT. ALFA BETA AGROCHEMICAL | 10 | 2 | pestisida, pupuk |
| 303 | PT. BESTANI AGRO SEJAHTERA | 10 | 2 | pestisida, pupuk |
| 304 | PT AJINOMOTO INDONESIA | 10 | 2 | pupuk, pupuk-legacy |
| 305 | PT.ALL COSMOS INDONESIA | 10 | 2 | pupuk, pupuk-legacy |
| 306 | PT. SINERGI CHEM INDONESIA | 9 | 1 | pestisida |
| 307 | PT. FORAGRO MAJU SEJAHTERA | 9 | 1 | pestisida |
| 308 | PT. NUGROHO PRATAMA CHEMICA ASIA | 9 | 1 | pestisida |
| 309 | PT. MIO LIFE SCIENCES INDONESIA | 9 | 1 | pestisida |
| 310 | PT. NOVINDO AGRITECH HUTAMA | 9 | 1 | pestisida |
| 311 | PT. GLOBAL AGROTAMA INDONESIA | 9 | 1 | pestisida |
| 312 | PT. BENTZ JAZ INDONESIA | 9 | 1 | pestisida |
| 313 | CV. TANI MEDIA | 9 | 1 | pestisida |
| 314 | NATURAL NUSANTARA | 9 | 1 | pupuk |
| 315 | BIO ENERGI RIMBA | 9 | 1 | pupuk |
| 316 | PT. Sido Muncul Pupuk Nusantara | 9 | 1 | pupuk, pupuk-legacy |
| 317 | SMARTSOFT DIGITAL TEKNOLOGI | 9 | 1 | pupuk |
| 318 | WELLS PRIMA GLOBAL | 9 | 1 | pupuk |
| 319 | EVERCHEM RESOURCES INDONESIA | 9 | 1 | pupuk |
| 320 | AGRO PASTI INDONESIA | 9 | 1 | pupuk |
| 321 | WASTEK AGRO INDONESIA | 9 | 1 | pupuk |
| 322 | BINA AGROSIWI MANDIRI | 9 | 1 | pupuk |
| 323 | FORMULA TOP INDONESIA | 9 | 1 | pupuk |
| 324 | PT. SEMESTA JAYA ABADI | 9 | 1 | pupuk, pupuk-legacy |
| 325 | PT. INDO ACIDATAMA Tbk | 9 | 1 | pupuk-legacy |
| 326 | CV. AGRINDO PERSADATAMA | 9 | 2 | pestisida, pupuk |
| 327 | PT. ALISHAN NUSA INDAH | 9 | 2 | pestisida, pupuk |
| 328 | CV. Cahaya Abadi | 9 | 2 | pupuk, pupuk-legacy |
| 329 | PT. ARENA HORMON INDONUSA | 9 | 2 | pestisida, pupuk |
| 330 | CV. Karya Tani Indonesia | 9 | 2 | pupuk |
| 331 | PT TOYA INDO MANUNGGAL | 9 | 2 | pupuk, pupuk-legacy |
| 332 | PT. Centra Agro Pratama | 9 | 2 | pupuk, pupuk-legacy |
| 333 | PT. KUSUMA DIPA NUGRAHA | 9 | 2 | pupuk, pupuk-legacy |
| 334 | PT. Molindo Raya Industrial | 9 | 2 | pupuk, pupuk-legacy |
| 335 | PT. HARINA CHEMICALS INDUSTRI | 8 | 1 | pestisida |
| 336 | PT. MONAGRO KIMIA | 8 | 1 | pestisida |
| 337 | CV. DUTA TANI | 8 | 1 | pestisida |
| 338 | PT. CROPLINK AGRIKULTUR TEKNOLOGI | 8 | 1 | pestisida |
| 339 | SERUNIANDAL CITRA MANDIRI | 8 | 1 | pupuk |
| 340 | CIPTA GUNA MUKTI | 8 | 1 | pupuk |
| 341 | MEGA ORGANOFERTILISER | 8 | 1 | pupuk |
| 342 | MULIA SUKSES BAHAGIA | 8 | 1 | pupuk |
| 343 | BIO INDUSTRI NUSANTARA | 8 | 1 | pupuk |
| 344 | SARASWANTI ANUGERAH INDONESIA | 8 | 1 | pupuk |
| 345 | MEGA PRIMATANI LESTARI | 8 | 1 | pupuk |
| 346 | CV.TABITA JAYA | 8 | 1 | pupuk, pupuk-legacy |
| 347 | MULTI HARA AGRO | 8 | 1 | pupuk |
| 348 | MITRA TANI INDONESIA | 8 | 1 | pupuk |
| 349 | PT.GEMILANG ANDALAN PRATAMA | 8 | 1 | pupuk, pupuk-legacy |
| 350 | PT. DAMAI AGRO MANUNGGAL | 8 | 1 | pupuk |
| 351 | ULTI GROW NUSANTARA | 8 | 1 | pupuk |
| 352 | UD. Makmur Jaya | 8 | 1 | pupuk, pupuk-legacy |
| 353 | Alwi Konsultan - TEST | 8 | 1 | pupuk-legacy |
| 354 | PT. Kingenta Pupuk Indonesia | 8 | 1 | pupuk-legacy |
| 355 | PT. BERSAMA SATU TEGUH | 8 | 2 | pestisida, pupuk |
| 356 | CV. DANA INDO AGRI | 8 | 2 | pupuk, pupuk-legacy |
| 357 | PT. Agro Tani Marisi | 8 | 2 | pupuk, pupuk-legacy |
| 358 | PT. SOLUSI TANI INDONESIA | 8 | 2 | pestisida, pupuk |
| 359 | PT. BELIRANG KALISARI | 8 | 2 | pestisida, pupuk |
| 360 | PT. MULTIKIMIA AGRO SEJAHTERA | 8 | 2 | pestisida, pupuk, pupuk-legacy |
| 361 | PT. SUMBER AGRO PERKASA | 8 | 2 | pestisida, pupuk |
| 362 | PT. Bandung Inovasi Organik | 8 | 2 | pupuk, pupuk-legacy |
| 363 | PT. BUMI TANI SUBUR | 8 | 2 | pupuk, pupuk-legacy |
| 364 | PT. ANKEWA CHEMICAL INDONESIA | 8 | 2 | pestisida, pupuk |
| 365 | PT. BINGEI AGUNG | 8 | 2 | pestisida, pupuk |
| 366 | PT Nusamas Kimia Persada | 8 | 2 | pestisida, pupuk-legacy |
| 367 | PT. PROPADU KONAIR TARAHUBUN | 8 | 3 | pestisida, pupuk, pupuk-legacy |
| 368 | PT. CEVE SINAR ARAS | 8 | 2 | pupuk |
| 369 | CV. Jaya Tani | 8 | 2 | pupuk, pupuk-legacy |
| 370 | PT.ASIANA CHEMICALINDO LESTARI | 7 | 1 | pestisida |
| 371 | PT. SANBRAND AGRO SEJAHTERA | 7 | 1 | pestisida |
| 372 | PT. FORTUNA MULIA SEJATI | 7 | 1 | pestisida |
| 373 | PT. MAHKOTA AGRO INDUSTRI | 7 | 1 | pestisida |
| 374 | PT. MARGA DWI KENCANA | 7 | 1 | pestisida |
| 375 | PT. GELPI KURNIALESTARI | 7 | 1 | pestisida |
| 376 | PT. VISION CROP PROTECTION | 7 | 1 | pestisida |
| 377 | PT. BUMI MAKMUR LESTARI UTAMA | 7 | 1 | pestisida |
| 378 | PT. MC TRADING INDONESIA | 7 | 1 | pestisida |
| 379 | PT. PUSRI AGRO LESTARI | 7 | 1 | pestisida |
| 380 | TANIKAYA MULTI AGRO | 7 | 1 | pupuk |
| 381 | RUINS SARANA TANI | 7 | 1 | pupuk |
| 382 | GRAHA SIRTU | 7 | 1 | pupuk |
| 383 | LAUTAN LUAS | 7 | 1 | pupuk |
| 384 | SAYAP EMAS CITRA PERSADA | 7 | 1 | pupuk |
| 385 | AZZA MULIA RAHMAN | 7 | 1 | pupuk |
| 386 | BULINDO AGRO TEKNOLOGI | 7 | 1 | pupuk |
| 387 | PT. Agro Indah Permata | 7 | 1 | pupuk, pupuk-legacy |
| 388 | WEHA AGRO SEJAHTERA | 7 | 1 | pupuk |
| 389 | SARI BUMI KEDU | 7 | 1 | pupuk |
| 390 | PT Alam Makmur Anuri | 7 | 1 | pupuk |
| 391 | ENPEKA AGROKIMIA | 7 | 1 | pupuk |
| 392 | PT. Pemohon (DUMMY) | 7 | 1 | pupuk |
| 393 | PANCAPUTRA AGRO NIAGA | 7 | 1 | pupuk |
| 394 | SURYA ARTHA SENTOSA | 7 | 1 | pupuk |
| 395 | SARASWANTI AGRO MAKMUR | 7 | 1 | pupuk |
| 396 | PT. Sumber Agrindo Sejahtera | 7 | 1 | pupuk, pupuk-legacy |
| 397 | cv.nusatani | 7 | 1 | pupuk-legacy |
| 398 | PT. AGROLAND INDO SYNERGY | 7 | 2 | pestisida, pupuk |
| 399 | CV. NOVIE AGRO INDUSTRI | 7 | 2 | pupuk, pupuk-legacy |
| 400 | CV. Cipta Agrifarmerindo | 7 | 2 | pupuk |
| 401 | CV. PRADIPTA PARAMITA | 7 | 2 | pestisida, pupuk |
| 402 | CV. BUMIKITA MAKMUR | 7 | 2 | pupuk, pupuk-legacy |
| 403 | PT.OAT MITOKU AGRIO | 7 | 3 | pestisida, pupuk, pupuk-legacy |
| 404 | CV. JOYO MAKMUR SUKSES | 7 | 2 | pestisida, pupuk |
| 405 | CV. SEMESTA AGRO MAKMUR | 7 | 2 | pestisida, pupuk |
| 406 | CV Alam Hijau | 7 | 2 | pupuk, pupuk-legacy |
| 407 | CV. MITRA AGRO SENTOSA | 7 | 2 | pupuk, pupuk-legacy |
| 408 | CV.UTAMA KARYA TANI | 7 | 2 | pupuk, pupuk-legacy |
| 409 | PT. Agrosid Manunggal Sentosa | 7 | 3 | pestisida, pupuk, pupuk-legacy |
| 410 | PT. BIO AGRITECH NUSANTARA | 7 | 3 | pestisida, pupuk |
| 411 | PT. FADJARPURNAMA PRATAMA INTI | 6 | 1 | pestisida |
| 412 | PT. ANDALL HASA PRIMA | 6 | 1 | pestisida |
| 413 | CV. PRIMA AGRO PERKASA | 6 | 1 | pestisida |
| 414 | PT. TRI AGRO CHEMICALS | 6 | 1 | pestisida |
| 415 | PT. SUPRA TUSAMAN ABADI | 6 | 1 | pestisida |
| 416 | PT. MEKAR WARNA SARI | 6 | 1 | pestisida |
| 417 | PT. INDONESIA BENXING INDUSTRIAL | 6 | 1 | pestisida |
| 418 | PT. AMPUH PERKASA JAYA | 6 | 1 | pestisida |
| 419 | PT. SENTRAL TANI NUSANTARA | 6 | 1 | pestisida |
| 420 | CV. BINANGUN AGRO LESTARI | 6 | 1 | pestisida |
| 421 | PT. BINTANG RAPESTRA ABADI | 6 | 1 | pestisida |
| 422 | PT. SURAT TANI | 6 | 1 | pestisida |
| 423 | PT. AGRINDO SANDARAN MAS | 6 | 1 | pestisida |
| 424 | BROMO INDAH LESTARI | 6 | 1 | pupuk |
| 425 | SINERGI INTI PANEN | 6 | 1 | pupuk |
| 426 | NOUSINDO NUSANTARA AGRI | 6 | 1 | pupuk |
| 427 | PT Agrimas Utama Indonesia | 6 | 1 | pupuk, pupuk-legacy |
| 428 | CV. Bima Agung Sejahtera | 6 | 1 | pupuk, pupuk-legacy |
| 429 | FARMINDO ANN CHEMICAL | 6 | 1 | pupuk |
| 430 | BANGKIT TANI NUSANTARA | 6 | 1 | pupuk |
| 431 | CV. Sumber Buana Perkasa | 6 | 1 | pupuk, pupuk-legacy |
| 432 | CEMPAKA BUMI NUSANTARA | 6 | 1 | pupuk |
| 433 | MANUNGGAL AGRO TANI | 6 | 1 | pupuk |
| 434 | STANLEY AGRO NUSANTARA | 6 | 1 | pupuk |
| 435 | ADITYA TANI PERKASA | 6 | 1 | pupuk |
| 436 | SUMBER SUBUR SEJATI | 6 | 1 | pupuk |
| 437 | ARSISTHA KIMIA CITRA LESTARI | 6 | 1 | pupuk |
| 438 | REDSTONE INDONESIA MAKMUR | 6 | 1 | pupuk |
| 439 | RAJAWALI BUANA KREASI | 6 | 1 | pupuk |
| 440 | MULTIFARM INTI SEJAHTERA | 6 | 1 | pupuk |
| 441 | INDUSTRI KEBUN NUSANTARA | 6 | 1 | pupuk |
| 442 | SENTRA TANI SEJAHTERA | 6 | 1 | pupuk |
| 443 | GREAT GIANT PINEAPPLE | 6 | 1 | pupuk |
| 444 | SUMBER MURNI GRUP | 6 | 1 | pupuk |
| 445 | ALIF RAYA | 6 | 1 | pupuk |
| 446 | SINKA SINYE AGROTAMA | 6 | 1 | pupuk |
| 447 | SUMBER ALAM BAROKAH | 6 | 1 | pupuk |
| 448 | WINNERS AVENUE SURABAYA | 6 | 1 | pupuk |
| 449 | PT. SHADANI INSAN MULIA ABADI | 6 | 1 | pupuk |
| 450 | MZ MEDICAL | 6 | 1 | pupuk |
| 451 | STEFES INDONESIA | 6 | 1 | pupuk |
| 452 | CV. Bintang Asri Arthauly | 6 | 1 | pupuk-legacy |
| 453 | PT. AGROINDO | 6 | 1 | pupuk-legacy |
| 454 | PT. Graha Inti Jaya | 6 | 1 | pupuk-legacy |
| 455 | CV Makmur Jaya Bekasi | 6 | 1 | pupuk-legacy |
| 456 | PT. AGRITANI MAKMUR MANDIRI | 6 | 1 | pupuk-legacy |
| 457 | PT.WONDERINDO PHARMATAMA | 6 | 2 | pupuk, pupuk-legacy |
| 458 | PT. IRQ MAKMUR JAYA | 6 | 2 | pupuk |
| 459 | CV. BUMI NUSANTARA | 6 | 2 | pupuk, pupuk-legacy |
| 460 | CV. Bakti Alam Nusantara | 6 | 2 | pupuk, pupuk-legacy |
| 461 | PT. FAJAR BUANA CHEMICAL | 6 | 2 | pestisida, pupuk-legacy |
| 462 | PT. LUMBUNG AGRO MAKMUR | 6 | 2 | pestisida, pupuk |
| 463 | PT. SEJUK ALAM LESTARI | 6 | 2 | pestisida, pupuk |
| 464 | PT. TUNAS HARMONI ABADI | 6 | 2 | pestisida, pupuk |
| 465 | PT. PRIMA AGRO NETWORK | 6 | 2 | pestisida, pupuk |
| 466 | CV DUTA LIMAS | 6 | 2 | pupuk, pupuk-legacy |
| 467 | PT. Bhadra Cemerlang | 6 | 2 | pupuk, pupuk-legacy |
| 468 | CV. PRIMA BERKAH NUSANTARA | 6 | 2 | pestisida, pupuk |
| 469 | CV. BIMAGRO INDONESIA | 6 | 2 | pestisida, pupuk |
| 470 | PT. Angputra Global Organik | 6 | 2 | pupuk, pupuk-legacy |
| 471 | PT. ARENA AGRO UTAMA | 5 | 1 | pestisida, pupuk |
| 472 | PT. PANEN AGRO PERKASA INDONESIA | 5 | 1 | pestisida |
| 473 | PT. BERKAH SUMBER SUKSES | 5 | 1 | pestisida |
| 474 | PT. OSIMO INDONESIA | 5 | 1 | pestisida |
| 475 | PT. PUTRA TIMUR AGRO NUSANTARA | 5 | 1 | pestisida |
| 476 | PT. ENSYSTEX INTERNATIONAL INDONESIA | 5 | 1 | pestisida |
| 477 | PT. PRIMA LESTARI AGROSCIENCES INDONESIA | 5 | 1 | pestisida |
| 478 | PT Indo Pest Biochem | 5 | 1 | pestisida |
| 479 | PT. SEGORO INTERNASIONAL | 5 | 1 | pestisida |
| 480 | CV. TUNAS SUBUR | 5 | 1 | pestisida |
| 481 | PT. INDO GLOBAL TRADE | 5 | 1 | pestisida |
| 482 | PT. TEXCHEM INDONESIA | 5 | 1 | pestisida |
| 483 | PT. KIMIKA USAHA PRIMA | 5 | 1 | pestisida |
| 484 | PT. TAKBIR SUKMA TRADA INDONESIA | 5 | 1 | pestisida |
| 485 | PT. INTER AGRO TECHNOLOGY INDONESIA | 5 | 1 | pestisida |
| 486 | PT. PERDANA AGRO MANDIRI | 5 | 1 | pestisida |
| 487 | PT. BRILLIANCE AGROSCIENCES INDONESIA | 5 | 1 | pestisida |
| 488 | PT. CATUR MANUNGGAL JAYA ABADI | 5 | 1 | pestisida |
| 489 | PT. ACE BIOCHEM INDONESIA | 5 | 1 | pestisida |
| 490 | PT. NIROGA SUMBER SEJAHTERA | 5 | 1 | pestisida |
| 491 | PT Belirang Perkasa Agro | 5 | 1 | pestisida |
| 492 | GATEWAY INTERNUSA | 5 | 1 | pupuk |
| 493 | GREEN AGRI INDONESIA | 5 | 1 | pupuk |
| 494 | AGRITAMA TUMBUH PERKASA | 5 | 1 | pupuk |
| 495 | RAJA ARTHA AGRO | 5 | 1 | pupuk |
| 496 | MON LEON INDONESIA | 5 | 1 | pupuk |
| 497 | AGRO MAKMUR MANDIRI | 5 | 1 | pupuk |
| 498 | PUPUK SWADAYA PURIMAS | 5 | 1 | pupuk |
| 499 | BINTANG TIMUR PASIFIK | 5 | 1 | pupuk |
| 500 | ALL COSMOS BIOTEK | 5 | 1 | pupuk |
| 501 | ATS INTI SAMPOERNA | 5 | 1 | pupuk |
| 502 | ELIT SOLUSI NIAGA | 5 | 1 | pupuk |
| 503 | MITRA AGUNG SAWITA SEJATI | 5 | 1 | pupuk |
| 504 | AGRO NUSANTARA INTERNASIONAL | 5 | 1 | pupuk |
| 505 | PT. Andalan Chemist Indonesia | 5 | 1 | pupuk |
| 506 | CV. Tiga Tunas Bangsa | 5 | 1 | pupuk |
| 507 | PT ARIGOLD YOOHA CORP | 5 | 1 | pupuk, pupuk-legacy |
| 508 | ANDI JAYA INDUSTRI | 5 | 1 | pupuk |
| 509 | PT. Tranquerah Nusantara Cerah | 5 | 1 | pupuk, pupuk-legacy |
| 510 | MILLENIS MITRA INDONESIA | 5 | 1 | pupuk |
| 511 | PUTERA RAYA ABADI | 5 | 1 | pupuk |
| 512 | BINTANG ASRI ARTHAULI | 5 | 1 | pupuk |
| 513 | DWI JAYA EKAPRIMA | 5 | 1 | pupuk |
| 514 | DMG PHARMA LABORATORIES | 5 | 1 | pupuk |
| 515 | WIKA JAYA MANDIRI | 5 | 1 | pupuk |
| 516 | CV. KUJANG MAS AGRO KENCANA | 5 | 1 | pupuk, pupuk-legacy |
| 517 | FEMU ENVIRO RISORINDO | 5 | 1 | pupuk |
| 518 | BERKAT MITRA MAKMUR | 5 | 1 | pupuk |
| 519 | PT. Triasindo Subur Prima | 5 | 1 | pupuk |
| 520 | AGROLAND MANDIRI UTAMA | 5 | 1 | pupuk |
| 521 | PT. SUMITOMO INDONESIA | 5 | 2 | pestisida, pupuk |
| 522 | PT. UNITED ALACRITY INDONESIA | 5 | 2 | pestisida, pupuk |
| 523 | PT.MITRA CIPTA AGRO | 5 | 2 | pupuk, pupuk-legacy |
| 524 | PT. PLANTSAFE FERTILIZER INDONESIA | 5 | 2 | pupuk, pupuk-legacy |
| 525 | CV. Anugerah Tani Makmur | 5 | 2 | pupuk, pupuk-legacy |
| 526 | PT. Ria Indo Agri | 5 | 2 | pestisida, pupuk-legacy |
| 527 | PT. AGRI KEMIA NATURA | 5 | 2 | pestisida, pupuk |
| 528 | PT. NUSANTARA SURYA BENIH | 5 | 2 | pestisida, pupuk |
| 529 | PT. NATHANI INDONESIA | 5 | 2 | pestisida, pupuk |
| 530 | PT.NOVACHEM ADAMANTINA | 5 | 2 | pupuk |
| 531 | PT.GUNUNG BERKAT SEJAHTERA | 5 | 2 | pupuk, pupuk-legacy |
| 532 | CV. PRIMA TANI MANDIRI | 5 | 2 | pupuk |
| 533 | PT. PRIMA MULIA ABADI | 5 | 2 | pupuk, pupuk-legacy |
| 534 | CV. Sumber Rejeki | 5 | 2 | pupuk, pupuk-legacy |
| 535 | CV. PRIMA AGRO LANCAR | 5 | 3 | pestisida, pupuk, pupuk-legacy |
| 536 | PT. KATAYA ABADI | 4 | 1 | pestisida |
| 537 | PT. WIRAJAYA MITRA SUKSESTAMA | 4 | 1 | pestisida |
| 538 | PT. SOLUSI MAJU AGRO TANI | 4 | 1 | pestisida |
| 539 | PT. MULTI GLOBAL CENTRO | 4 | 1 | pestisida |
| 540 | PT. Spektra Global Intiagro | 4 | 1 | pestisida |
| 541 | PT. MEDION FARMA JAYA | 4 | 1 | pestisida |
| 542 | CV. CENTRAL BUKIT MORIA | 4 | 1 | pestisida |
| 543 | PT. SINGA KIMIA INDONESIA | 4 | 1 | pestisida |
| 544 | PT. LANGGENG MUSTIKA CHEMINDO | 4 | 1 | pestisida |
| 545 | CV. SINAR AGRO KIMIA INDONESIA | 4 | 1 | pestisida |
| 546 | PT. EKA SALA ALFAINDO | 4 | 1 | pestisida |
| 547 | PT. TIENYEN INTERNATIONAL | 4 | 1 | pestisida |
| 548 | PT. KUDA RAYA KARYANUSA | 4 | 1 | pestisida |
| 549 | PT. SEJAHTERA AGRONUSA LESTARI | 4 | 1 | pestisida |
| 550 | PT. MULTIGUNA GEMILANG | 4 | 1 | pestisida |
| 551 | PT. BRAVO DINAMIKA | 4 | 1 | pestisida |
| 552 | PT. SPEKTRUM GEO INAGRO | 4 | 1 | pestisida |
| 553 | PT. PT. Perusahaan Perdagangan Indonesia (Persero) | 4 | 1 | pestisida |
| 554 | PT. PT.BARU TOTAL SOLUSINDO | 4 | 1 | pestisida |
| 555 | PT. AVEL PESTINDO | 4 | 1 | pestisida |
| 556 | CV. SUBUR TANI AGRO RAYA SEJAHTERA | 4 | 1 | pestisida |
| 557 | PT. INDO ASIA TIRTA MANUNGGAL | 4 | 1 | pestisida |
| 558 | PT. SANJAYA SEJAHTERA LESTARI | 4 | 1 | pestisida |
| 559 | PT. CAKRA AGRO INDONESIA | 4 | 1 | pestisida |
| 560 | CV. BUMINDO ABADI MAKMUR | 4 | 1 | pestisida |
| 561 | SINAR EMPAT PILAR UTAMA | 4 | 1 | pupuk |
| 562 | LINTANG MAS AGRO | 4 | 1 | pupuk |
| 563 | PT. Tani Karya Makmur Sejahtera | 4 | 1 | pupuk, pupuk-legacy |
| 564 | GEMA TANI ETAM | 4 | 1 | pupuk |
| 565 | SEA SIX ENERGY INDONESIA | 4 | 1 | pupuk |
| 566 | NUSA TANI | 4 | 1 | pupuk |
| 567 | RISET PERKEBUNAN NUSANTARA | 4 | 1 | pupuk |
| 568 | NICO MANDIRI SEJAHTERA | 4 | 1 | pupuk |
| 569 | PT. Super Tani Indonesia | 4 | 1 | pupuk |
| 570 | GLOBAL MANTEP LESTARI | 4 | 1 | pupuk |
| 571 | GREENTECH INTERNATIONAL | 4 | 1 | pupuk |
| 572 | TANINDO TETAP JAYA | 4 | 1 | pupuk |
| 573 | KERTO KENCANA ABADI | 4 | 1 | pupuk |
| 574 | MISSION TANI | 4 | 1 | pupuk |
| 575 | PT INDMIRA | 4 | 1 | pupuk |
| 576 | MANDIRI DUASATU | 4 | 1 | pupuk |
| 577 | SAKURA FISHERIES | 4 | 1 | pupuk |
| 578 | ESTU SEBA AGRINUSA | 4 | 1 | pupuk |
| 579 | REZEKI BERSAMA INDONESIA | 4 | 1 | pupuk |
| 580 | HABDHI NEGORO MANDIRI | 4 | 1 | pupuk |
| 581 | SOBAT TANI | 4 | 1 | pupuk |
| 582 | PT.CENTRAL ALAM RESOURCES LESTARI | 4 | 1 | pupuk |
| 583 | PT TRIASINDO ROYAL AGRO | 4 | 1 | pupuk, pupuk-legacy |
| 584 | SINAR MAS MALAKA | 4 | 1 | pupuk |
| 585 | SURYA NUSANTARA SEJATI | 4 | 1 | pupuk |
| 586 | TUNAS FOREST GEMILANG | 4 | 1 | pupuk |
| 587 | POSPORINDO NUSANTARA | 4 | 1 | pupuk |
| 588 | ALAM SEMESTA INDONESIA | 4 | 1 | pupuk |
| 589 | PUTRA HAKA PERKASA | 4 | 1 | pupuk |
| 590 | AGRO UNGGUL JAYAMAKMUR | 4 | 1 | pupuk |
| 591 | CV MAKMUR ABADI | 4 | 1 | pupuk |
| 592 | SARIMAKMUR SULTAN NUSANTARA | 4 | 1 | pupuk |
| 593 | MANUNGGAL MERDEKA MAKMUR | 4 | 1 | pupuk |
| 594 | PT. DELAPAN ENAM BERLIAN | 4 | 1 | pupuk |
| 595 | AGRO ZYM JAYA | 4 | 1 | pupuk |
| 596 | MANDIRI PALMERA AGRINDO | 4 | 1 | pupuk |
| 597 | CV. INTI TANI MAKMUR | 4 | 1 | pupuk |
| 598 | SUBUR PERKASA NUSANTARA | 4 | 1 | pupuk |
| 599 | CV. Cahaya Agro Persada | 4 | 1 | pupuk |
| 600 | CV. TUMBUH BERKEMBANG SEJAHTERA | 4 | 1 | pupuk |
| 601 | DELIMA MANDALA SURYA | 4 | 1 | pupuk |
| 602 | KARUNIA NIAGA SEJAHTERA | 4 | 1 | pupuk |
| 603 | BIO KONVERSI INDONESIA | 4 | 1 | pupuk |
| 604 | KERINA MARGA PLANTATION | 4 | 1 | pupuk |
| 605 | NITIS PUSAKA KUSUMA | 4 | 1 | pupuk |
| 606 | BISATANI SUKSES UTAMA | 4 | 1 | pupuk |
| 607 | PT TRI TUNGGAL ABADI MULIA | 4 | 1 | pupuk |
| 608 | NIVIDIA PRATAMA KHATULISTIWA | 4 | 1 | pupuk |
| 609 | TIMURAYA TUNGGAL | 4 | 1 | pupuk |
| 610 | AGRO INDAH PERMATA 21 | 4 | 1 | pupuk |
| 611 | BUMI GEMILANG ARTHA | 4 | 1 | pupuk |
| 612 | PT. RIZKY FAJAR AGRO | 4 | 1 | pupuk-legacy |
| 613 | PT HARVESTMORE MULTITRADE INDONESIA | 4 | 1 | pupuk-legacy |
| 614 | PT Lamandau Subur Sejahtera | 4 | 1 | pupuk-legacy |
| 615 | PT. Indevco Internusa | 4 | 1 | pupuk-legacy |
| 616 | PT. Setia Bersama | 4 | 1 | pupuk-legacy |
| 617 | CV. Ruthani Mandiri | 4 | 1 | pupuk-legacy |
| 618 | CV. SUGI TEKNIK PANGAN | 4 | 2 | pestisida, pupuk |
| 619 | PT. RAWWA ROUNDTEC INDONESIA | 4 | 2 | pestisida, pupuk |
| 620 | CV. Subur Makmur Sejahtera | 4 | 2 | pupuk, pupuk-legacy |
| 621 | CV. Makmur Sembada | 4 | 2 | pupuk, pupuk-legacy |
| 622 | PT. Selaras Alam Sejahtera | 4 | 2 | pupuk, pupuk-legacy |
| 623 | PT Dunia Kimia Jaya | 4 | 2 | pupuk, pupuk-legacy |
| 624 | PT Bursatani Global Niaga | 4 | 2 | pupuk, pupuk-legacy |
| 625 | PT Mitra Sukses Agrindo | 4 | 3 | pestisida, pupuk, pupuk-legacy |
| 626 | CV. SAHABAT TANI MANDIRI | 4 | 2 | pupuk |
| 627 | CV. BUMI AGRO FERTILIZER | 4 | 2 | pupuk |
| 628 | PT. Hasya Jaya Shafadila | 4 | 2 | pupuk |
| 629 | CV. AGRO BIO MAHLIGAI | 4 | 2 | pupuk, pupuk-legacy |
| 630 | PT. Makro Chemindo | 4 | 2 | pupuk, pupuk-legacy |
| 631 | CV. Satria Jaya | 4 | 2 | pupuk, pupuk-legacy |
| 632 | PT. Sarana Utama Lestari Alam | 4 | 2 | pupuk, pupuk-legacy |
| 633 | CV. SARANA TANI MAKMUR | 3 | 1 | pestisida |
| 634 | PT. SYNAGRO PERKASA | 3 | 1 | pestisida |
| 635 | PT. CIPTA KARYA UNGGULAN | 3 | 1 | pestisida |
| 636 | PT. SURYA KARYA ANDALAN | 3 | 1 | pestisida |
| 637 | PT. GLOBAL AGRO MANDIRI | 3 | 1 | pestisida |
| 638 | PT. ZAMRUD LINTAS KATULISTIWA | 3 | 1 | pestisida |
| 639 | PT. Duta Alam Prima | 3 | 1 | pestisida |
| 640 | PT. Guthrie Agri Bio | 3 | 1 | pestisida |
| 641 | CV. FLORA DAN FAUNA | 3 | 1 | pestisida |
| 642 | PT. PUTRISARI KIMIANUSA | 3 | 1 | pestisida |
| 643 | PT. RAGAM MANDIRI | 3 | 1 | pestisida |
| 644 | PT. PHOSPHINDO JAYA UTAMA | 3 | 1 | pestisida |
| 645 | CV. DMA | 3 | 1 | pestisida |
| 646 | PT. AGROW USAHA TANI INDONESIA | 3 | 1 | pestisida |
| 647 | PT. AGRI KIMIA NUSANTARA | 3 | 1 | pestisida |
| 648 | PT. GOLDEN MAKMUR AGRI | 3 | 1 | pestisida |
| 649 | CV. ASRITANI UTAMA | 3 | 1 | pestisida |
| 650 | PT. TOYOTA TSUSHO INDONESIA | 3 | 1 | pestisida |
| 651 | PT. ZAINI MAKMUR SENTOSA | 3 | 1 | pestisida |
| 652 | PT. AGRICULTURE CONSTRUCTION INDONESIA | 3 | 1 | pestisida |
| 653 | PT. VADEL KSATRIA SAMUDRA INDONESIA | 3 | 1 | pestisida |
| 654 | CV. CULTURE AGRITECH INTERZONA | 3 | 1 | pestisida |
| 655 | PT. PESTINDO SOLUTION | 3 | 1 | pestisida |
| 656 | PT. AGRIVA CROPSCIENCE INDONESIA | 3 | 1 | pestisida |
| 657 | PT. AGROSIDA SELARAS BERSAMA | 3 | 1 | pestisida |
| 658 | PT. GOODFARM CHEMICAL INDONESIA | 3 | 1 | pestisida |
| 659 | PT. JUBARO AGRO INDONESIA | 3 | 1 | pestisida |
| 660 | PT. MODERN AGRICULTURE INDONESIA | 3 | 1 | pestisida |
| 661 | PUPUK LAPAN HARSA | 3 | 1 | pupuk |
| 662 | DUA POHON BESAR | 3 | 1 | pupuk |
| 663 | HYDRO FARM INDONESIA | 3 | 1 | pupuk |
| 664 | PUPUK PARIT KITANG | 3 | 1 | pupuk |
| 665 | PT. SOLUSI LINGKUNGAN INDUSTRI NUSANTARA | 3 | 1 | pupuk |
| 666 | AGROMAX MAKMUR SEKAWAN | 3 | 1 | pupuk |
| 667 | INDOFAST AGRO NUSANTARA | 3 | 1 | pupuk |
| 668 | NUGEN CROP INDONESIA | 3 | 1 | pupuk |
| 669 | PT. PERINTIS NIAGA INDONESIA | 3 | 1 | pupuk |
| 670 | RUCI TANI JAYA ABADI | 3 | 1 | pupuk |
| 671 | FERTILINDO AGROLESTARI | 3 | 1 | pupuk |
| 672 | ANARD BUMI SENTOSA | 3 | 1 | pupuk |
| 673 | JASA TAMBANG ACEH | 3 | 1 | pupuk |
| 674 | BERKAH TANI LESTARI | 3 | 1 | pupuk |
| 675 | PT RENER INTI INTERNASIONAL | 3 | 1 | pupuk |
| 676 | SURYA MENTARI SAKTINDO | 3 | 1 | pupuk |
| 677 | INDO BAY BIO | 3 | 1 | pupuk |
| 678 | PT. SERA AGRO NUTRINDO | 3 | 1 | pupuk |
| 679 | REKATANI INDONESIA | 3 | 1 | pupuk |
| 680 | BUMI IMPERIUM INDONESIA | 3 | 1 | pupuk |
| 681 | SARANA GLOBAL PHOSPHORINDO | 3 | 1 | pupuk |
| 682 | KURNIA MAS | 3 | 1 | pupuk |
| 683 | CV. Tani Subur Perkasa | 3 | 1 | pupuk, pupuk-legacy |
| 684 | AGRI PRIME INTERNATIONAL | 3 | 1 | pupuk |
| 685 | BUMI REKAYASA PERSADA | 3 | 1 | pupuk |
| 686 | MAGNESIUM GOSARI INTERNASIONAL | 3 | 1 | pupuk |
| 687 | HIKMAH TANI | 3 | 1 | pupuk |
| 688 | JENAWI SUBURINDO REJEKI | 3 | 1 | pupuk |
| 689 | RAJAWALI CITRA ALAM | 3 | 1 | pupuk |
| 690 | CHEMSTAR AGRO INDONESIA | 3 | 1 | pupuk |
| 691 | SULTAN ISKANDAR MUDA | 3 | 1 | pupuk |
| 692 | RUHISA PERSADA | 3 | 1 | pupuk |
| 693 | TIGA UNGGUL SEJAHTERA | 3 | 1 | pupuk |
| 694 | LAMPOKO TERNAK INDONESIA | 3 | 1 | pupuk |
| 695 | NEO SINAR MEDAN | 3 | 1 | pupuk |
| 696 | NEO CROP SOLUTIONS | 3 | 1 | pupuk |
| 697 | KAKIMAS PRIMA PERKASA | 3 | 1 | pupuk |
| 698 | MULTI ALAM RAYA SEJAHTERAA | 3 | 1 | pupuk |
| 699 | AGRIBISNIS TECHNOLOGY INDONESIA | 3 | 1 | pupuk |
| 700 | PT. NUSANTARA AGRO TAMA | 3 | 1 | pupuk |
| 701 | BAROKAH PRIMA TANI | 3 | 1 | pupuk |
| 702 | SUMBER ALAM UNGGUL | 3 | 1 | pupuk |
| 703 | CV AGRO PERSADA | 3 | 1 | pupuk |
| 704 | BUMI PERSADA SIDAYU | 3 | 1 | pupuk |
| 705 | ASIA MIKRO PUPUK | 3 | 1 | pupuk |
| 706 | SUTERA AGRINDO UTAMA | 3 | 1 | pupuk |
| 707 | CV Arisna Jaya | 3 | 1 | pupuk |
| 708 | PT. JASINDO KREASI MANDIRI | 3 | 1 | pupuk |
| 709 | SANG HYANG SERI | 3 | 1 | pupuk |
| 710 | SARI BUMI SIDAYU | 3 | 1 | pupuk |
| 711 | ARICTON EXIM INDONESIA | 3 | 1 | pupuk |
| 712 | WIRAPUTRA AGRO MANDIRI | 3 | 1 | pupuk |
| 713 | AGRITAMA PRIMA MANDIRI | 3 | 1 | pupuk |
| 714 | INTI MIKRO INDONESIA | 3 | 1 | pupuk |
| 715 | BASISCROP INDONESIA | 3 | 1 | pupuk |
| 716 | REJEKI INDAH MANDIRI | 3 | 1 | pupuk |
| 717 | PINAGO UTAMA | 3 | 1 | pupuk |
| 718 | NUSANTARA GREEN LAND | 3 | 1 | pupuk |
| 719 | AGRO RAYA TIMUR GROUP | 3 | 1 | pupuk |
| 720 | DEWI SRI RAMA I | 3 | 1 | pupuk |
| 721 | PT. DWI AGRO HAYATI | 3 | 1 | pupuk |
| 722 | AGRO LESTARI JAYA | 3 | 1 | pupuk |
| 723 | SIGMA KARYA BUANA | 3 | 1 | pupuk |
| 724 | PT AGRI MULTI LESTARI | 3 | 1 | pupuk |
| 725 | ARTHA CHRISTA | 3 | 1 | pupuk |
| 726 | SUKINDO SUPRASEMESTA | 3 | 1 | pupuk |
| 727 | DELTA GREEN ZONE | 3 | 1 | pupuk |
| 728 | CV. GHANDI PUTRA | 3 | 1 | pupuk, pupuk-legacy |
| 729 | AGRO FARMERY INDONESIA | 3 | 1 | pupuk |
| 730 | PRATAMA AGRO SENTOSA | 3 | 1 | pupuk |
| 731 | ARTHA BUANA | 3 | 1 | pupuk |
| 732 | "CAHYA SEJATI" | 3 | 1 | pupuk |
| 733 | CIPTA AGRO NUSANTARA | 3 | 1 | pupuk |
| 734 | PANEN AGRO NIAGA | 3 | 1 | pupuk |
| 735 | PERMANA AGRO LESTARI | 3 | 1 | pupuk |
| 736 | NELAYAN INDONESIA JAYA | 3 | 1 | pupuk |
| 737 | MABARFEED INDONESIA | 3 | 1 | pupuk |
| 738 | RAHMA JAYA BERSAMA | 3 | 1 | pupuk |
| 739 | SAF AGRO JAYA | 3 | 1 | pupuk |
| 740 | JENGGONG MAGTASIDA GRUP | 3 | 1 | pupuk |
| 741 | BUMI SUBUR RIZQUNA | 3 | 1 | pupuk |
| 742 | CIPTA SARANA INDOTANI | 3 | 1 | pupuk |
| 743 | CV AGRO PETANI MAJU | 3 | 1 | pupuk, pupuk-legacy |
| 744 | PT. Perdagangan Indo Mandiri Sejati | 3 | 1 | pupuk, pupuk-legacy |
| 745 | CV. Agronusa Mandiri | 3 | 1 | pupuk-legacy |
| 746 | CV. Duta Surya Alam | 3 | 1 | pupuk-legacy |
| 747 | PT. DEWARI AGRO SAKTI | 3 | 2 | pestisida, pupuk |
| 748 | PT. INTI TANI NIAGA | 3 | 2 | pestisida, pupuk |
| 749 | CV. CINDE LARAS | 3 | 2 | pestisida, pupuk |
| 750 | CV. BARU INDONESIA | 3 | 2 | pestisida, pupuk |
| 751 | PT. REJEKI AGRO INDONESIA | 3 | 2 | pestisida, pupuk |
| 752 | CV. BERKAT MANNA MAJU | 3 | 2 | pestisida, pupuk |
| 753 | CV. RAJA BENUA MAS | 3 | 2 | pestisida, pupuk |
| 754 | PT. ROJO KOYO MANUNGGAL GROUP | 3 | 2 | pupuk |
| 755 | CV. Agro Santanindo | 3 | 2 | pupuk, pupuk-legacy |
| 756 | CV JAYA SRI BERSAMA | 3 | 2 | pupuk, pupuk-legacy |
| 757 | CV. PESANGGEM MITRA ABADI | 3 | 2 | pupuk, pupuk-legacy |
| 758 | CV Agro Niaga Sejati | 3 | 2 | pupuk, pupuk-legacy |
| 759 | PT. AGRO TANI MAJU SEJAHTERA | 3 | 2 | pupuk, pupuk-legacy |
| 760 | PT. GRESIK NUSANTARA FERTILIZER | 3 | 2 | pupuk |
| 761 | CV. Deka Agro Product | 3 | 2 | pupuk, pupuk-legacy |
| 762 | CV MARZUQ | 3 | 2 | pupuk, pupuk-legacy |
| 763 | PT. AGROABADI MAKMUR PERSADA | 3 | 2 | pupuk, pupuk-legacy |
| 764 | CV. Rahma Jaya | 3 | 2 | pupuk, pupuk-legacy |
| 765 | CV. Jaya Makmur Sentausa | 3 | 2 | pupuk, pupuk-legacy |
| 766 | PT. Agri Jaya Manggala | 3 | 2 | pupuk, pupuk-legacy |
| 767 | PT. NUSA BERKAT ALAM | 3 | 2 | pupuk, pupuk-legacy |
| 768 | PT. Aneka Nutrisi Global Indonesia | 3 | 2 | pupuk, pupuk-legacy |
| 769 | PT. Trubus Mitra Swadaya | 3 | 2 | pupuk, pupuk-legacy |
| 770 | PT. YUDHA PERDANA ANGESTI | 3 | 2 | pupuk, pupuk-legacy |
| 771 | CV. SAKASAKI | 2 | 1 | pestisida |
| 772 | PD. GARUDA | 2 | 1 | pestisida |
| 773 | PT. FLORA FAUNA MANGGALA | 2 | 1 | pestisida |
| 774 | PT. PANCA AGRO NIAGA LESTARI | 2 | 1 | pestisida |
| 775 | CV. AGRO MANDIRI SEJAHTERA | 2 | 1 | pestisida |
| 776 | CV. BANGKIT JAYA | 2 | 1 | pestisida |
| 777 | CV. MULTIGRO MAKMUR ABADI | 2 | 1 | pestisida |
| 778 | PT. INTISUBUR KIMINDO RAYA | 2 | 1 | pestisida |
| 779 | PT. MENARA BERLIAN | 2 | 1 | pestisida |
| 780 | PT. SANITAS | 2 | 1 | pestisida |
| 781 | PT. GEKA MITRA NIAGA | 2 | 1 | pestisida |
| 782 | PT. KENCANA AGRO GOLDENSIDA | 2 | 1 | pestisida |
| 783 | PT. PT BESTAGRO INDO SUKSES | 2 | 1 | pestisida |
| 784 | CV. MASTERGREEN AGROCHEMICAL INDONESIA | 2 | 1 | pestisida |
| 785 | PT. GRAHA AGRO MAKMUR | 2 | 1 | pestisida |
| 786 | PT. PERTIWI INTERTRADE | 2 | 1 | pestisida |
| 787 | PT LION WINGS | 2 | 1 | pestisida |
| 788 | PT. FLORA FAUNA AGRO | 2 | 1 | pestisida |
| 789 | PT. BINTANG CAHAYA AGRO PLANET | 2 | 1 | pestisida |
| 790 | PT. MASTRA INDOKORPORA | 2 | 1 | pestisida |
| 791 | CV. BINTANG TANI SEJAHTERA | 2 | 1 | pestisida |
| 792 | PT. AGRO SENTOSA INDAH KARUNIA | 2 | 1 | pestisida |
| 793 | CV. SURYA AGRO PERKASA | 2 | 1 | pestisida |
| 794 | PT. TRI AYUMON TERPADU | 2 | 1 | pestisida |
| 795 | PT. WIHADIL | 2 | 1 | pestisida |
| 796 | PT. GREEN ORGANIC DAILY | 2 | 1 | pestisida |
| 797 | PT. YASIDA MAKMUR ABADI | 2 | 1 | pestisida |
| 798 | PT. CHEMIFIN JAYA UTAMA | 2 | 1 | pestisida |
| 799 | PT. FAJAR NASIONAL CIPTA | 2 | 1 | pestisida |
| 800 | PT. DAYA MUDA AGUNG | 2 | 1 | pestisida |
| 801 | PT. V MAX ASIA TANI | 2 | 1 | pestisida |
| 802 | PT. SEMESTA HARAPAN INDONESIA | 2 | 1 | pestisida |
| 803 | PT. FABINDO SEJAHTERA | 2 | 1 | pestisida |
| 804 | PATIH GAJAHMADA | 2 | 1 | pestisida, pupuk |
| 805 | PT. AGROCHEM JAYA | 2 | 1 | pestisida |
| 806 | PT. LOTUS GLOBALINDO SENTOSA | 2 | 1 | pestisida |
| 807 | PT. ESSENCE AGRO CHEMICAL | 2 | 1 | pestisida |
| 808 | PT. INTITANI AGROKIMINDO | 2 | 1 | pestisida |
| 809 | PT. TURRIMA AGRO MASS BORNEO | 2 | 1 | pestisida |
| 810 | PT. ANUGRAH SENTANA AGRO | 2 | 1 | pestisida |
| 811 | PT. MAKUTA AGRO SEJATI | 2 | 1 | pestisida |
| 812 | CV. TANI LESTARI | 2 | 1 | pestisida |
| 813 | PT. NOPOSION AGROCHEMICALS INDONESIA | 2 | 1 | pestisida |
| 814 | CV. DITAMA RAYA | 2 | 1 | pestisida, pupuk |
| 815 | CV. ANGKASA DIGITAL NIAGA | 2 | 1 | pestisida |
| 816 | PT. TRIKA SAKA JAYA | 2 | 1 | pestisida |
| 817 | PT. DOVER CHEMICAL | 2 | 1 | pestisida |
| 818 | PT. SANOVA | 2 | 1 | pestisida |
| 819 | PT. GIGA PUTRA TANI | 2 | 1 | pestisida |
| 820 | PT. OGINESIA MULTI TANI | 2 | 1 | pestisida |
| 821 | MAHITALA MIRA INDONESIA | 2 | 1 | pupuk |
| 822 | BASF DISTRIBUTION INDONESIA | 2 | 1 | pupuk |
| 823 | MANIS SPORTIF | 2 | 1 | pupuk |
| 824 | KURNIA AGRO | 2 | 1 | pupuk |
| 825 | SAWIT CENTER INDONESIA | 2 | 1 | pupuk |
| 826 | SELLA SANGIANG ASRI | 2 | 1 | pupuk |
| 827 | PT.Alas Metuah Perdana | 2 | 1 | pupuk |
| 828 | BIO NUSANTARA ALAMI | 2 | 1 | pupuk |
| 829 | BIOTECH FERTILIZER INDONESIA | 2 | 1 | pupuk |
| 830 | TUNAS JAVA MANDIRI | 2 | 1 | pupuk |
| 831 | PANDAWA AGRI INDONESIA | 2 | 1 | pupuk |
| 832 | PT. Pakar Pupuk Nusantara | 2 | 1 | pupuk |
| 833 | BENE PYTO TANI JAYA | 2 | 1 | pupuk |
| 834 | CV. SUMBER MULYO SEJAHTERA | 2 | 1 | pupuk |
| 835 | CV. Intan Permata Dunia | 2 | 1 | pupuk |
| 836 | SURYA DUTA GREENINDO | 2 | 1 | pupuk |
| 837 | RAYON UTAMA KHATULISTIWA | 2 | 1 | pupuk |
| 838 | GLOBALINDO INTI PERSADA | 2 | 1 | pupuk |
| 839 | KIRANI AGRINUSANTARA | 2 | 1 | pupuk |
| 840 | DWI KENCANA ABADI | 2 | 1 | pupuk |
| 841 | SUMATERA MINERAL SEJAHTERA | 2 | 1 | pupuk |
| 842 | ADITYA MANDIRI UTAMA | 2 | 1 | pupuk |
| 843 | PT. Tri Mukti Nusantara Indonesia | 2 | 1 | pupuk |
| 844 | PT. SINAR PERSADA JAYA | 2 | 1 | pupuk |
| 845 | WIRA TANI MAKMUR | 2 | 1 | pupuk |
| 846 | SAGARA PRIMA PERKASA | 2 | 1 | pupuk |
| 847 | ELEVASI AGRI INDONESIA | 2 | 1 | pupuk |
| 848 | PT. VERONA MULTIKIMIA ABADI | 2 | 1 | pupuk |
| 849 | AGUNG PRATAMA INDONESIA | 2 | 1 | pupuk |
| 850 | PT. Balohan Jaya Utama | 2 | 1 | pupuk |
| 851 | MUSTIKA AGRO TANI | 2 | 1 | pupuk |
| 852 | BAHAGIA ALAM SEJATI | 2 | 1 | pupuk |
| 853 | DIAMOND INTEREST INTERNATIONAL | 2 | 1 | pupuk |
| 854 | SUMBER AGUNG PUTRA JAYA | 2 | 1 | pupuk |
| 855 | PUNDI NUSANTARA RAYA | 2 | 1 | pupuk |
| 856 | MESUNJA PRIMA TECH | 2 | 1 | pupuk |
| 857 | PT. REJOSO MANIS INDO | 2 | 1 | pupuk |
| 858 | GEMOLONG SUCI | 2 | 1 | pupuk |
| 859 | KHARISMA MUTIARA AGRO | 2 | 1 | pupuk |
| 860 | PUTRA NUSA | 2 | 1 | pupuk |
| 861 | KARFOS | 2 | 1 | pupuk |
| 862 | CV. SAMI JAYA AGRO | 2 | 1 | pupuk |
| 863 | ANUGRAH CEMERLANG INDONESIA | 2 | 1 | pupuk |
| 864 | GRAHA BIOFARM SOLUSI | 2 | 1 | pupuk |
| 865 | BIO AGRO REVOLUTIONARY UTILITY | 2 | 1 | pupuk |
| 866 | MEDIA BUANA PERSADA | 2 | 1 | pupuk |
| 867 | CIBADAK AGRI | 2 | 1 | pupuk |
| 868 | PENTA AGROCHEM MULIA | 2 | 1 | pupuk |
| 869 | DASTRA KARYA SEMESTA | 2 | 1 | pupuk |
| 870 | BERJAYA INTI PERKASA | 2 | 1 | pupuk |
| 871 | NUSANTARA SEJAHTERA MEDICA | 2 | 1 | pupuk |
| 872 | CV. PARI MAS | 2 | 1 | pupuk |
| 873 | SUAKABUMI | 2 | 1 | pupuk |
| 874 | PT. Inovasi Natural Bio Organik | 2 | 1 | pupuk |
| 875 | REZEKI UTAMA JAYA | 2 | 1 | pupuk |
| 876 | PT. Menara Dwikarya Prima | 2 | 1 | pupuk |
| 877 | ADAMAS MAKMUR SEJAHTERA | 2 | 1 | pupuk |
| 878 | WINDU KENCANA MULYA | 2 | 1 | pupuk |
| 879 | AMANAH JAYA TANI | 2 | 1 | pupuk |
| 880 | CV. BRISH WATE | 2 | 1 | pupuk |
| 881 | CV. SABAR BERSAUDARA | 2 | 1 | pupuk |
| 882 | CV.PETRO INTI PERKASA | 2 | 1 | pupuk, pupuk-legacy |
| 883 | GADASAKTI AGRITEK PRATAMA | 2 | 1 | pupuk |
| 884 | PT.SUBUR ALAM SEJAHTERA | 2 | 1 | pupuk |
| 885 | BUMI SUBUR KHATULISTIWA | 2 | 1 | pupuk |
| 886 | BUMI PARIGI | 2 | 1 | pupuk |
| 887 | PROFARM FERTILINDO | 2 | 1 | pupuk |
| 888 | GAUDY BARCA PUTRA | 2 | 1 | pupuk |
| 889 | AGRO JAYA OKTAVIANT | 2 | 1 | pupuk |
| 890 | CV. Randu Aji | 2 | 1 | pupuk |
| 891 | TRIDI AGENG GEMILANG | 2 | 1 | pupuk |
| 892 | CV REZKI UTAMA MANDIRI | 2 | 1 | pupuk |
| 893 | INDONESIA GREEN INNOVATION | 2 | 1 | pupuk |
| 894 | SETIA USAHA TANI MANDIRI | 2 | 1 | pupuk |
| 895 | AGRO LESTARI MAKMUR NUSANTARA | 2 | 1 | pupuk |
| 896 | GOLDEN SUMMIT JAYA | 2 | 1 | pupuk |
| 897 | MAHESA PANTURA GRESIK | 2 | 1 | pupuk |
| 898 | PT. AGRO NIAGA GLOBALINDO | 2 | 1 | pupuk |
| 899 | BIOMINO INDONESIA PERSADA | 2 | 1 | pupuk |
| 900 | AWM ELITE INTERNATIONAL | 2 | 1 | pupuk |
| 901 | WISH INDONESIA | 2 | 1 | pupuk |
| 902 | DIRA LIMINDO PUTRA | 2 | 1 | pupuk |
| 903 | JOS AGRO MANDIRI | 2 | 1 | pupuk |
| 904 | ANUGERAH DOLOMIT INDONESIA | 2 | 1 | pupuk |
| 905 | SAMUDERA ATLANTIK JAYA ABADI | 2 | 1 | pupuk |
| 906 | SUKSES ABADI TANI INDONESIA | 2 | 1 | pupuk |
| 907 | MANUVERE EGLORY CHEMAGRI | 2 | 1 | pupuk |
| 908 | EKARAYA | 2 | 1 | pupuk |
| 909 | FERTINDO AGRONUSA PERSADA | 2 | 1 | pupuk |
| 910 | CV. Pilar Fasa Mandiri | 2 | 1 | pupuk |
| 911 | ESA DISTRIBUSI NUSANTARA | 2 | 1 | pupuk |
| 912 | JAVA KARLOS INDONESIA | 2 | 1 | pupuk |
| 913 | PT. Satya Agrindo Perkasa | 2 | 1 | pupuk |
| 914 | PRIMA AGRO ORGANIC | 2 | 1 | pupuk |
| 915 | EKA TIMUR RAYA | 2 | 1 | pupuk |
| 916 | PT.PRATAMA SUBUR AGRITAMA | 2 | 1 | pupuk |
| 917 | GRHA FERRY INDUSTRI | 2 | 1 | pupuk |
| 918 | SIDENRENG AGRO INNO TECH | 2 | 1 | pupuk |
| 919 | YIH SHENNINDO MAKMUR JAYA | 2 | 1 | pupuk |
| 920 | CV. Bumi Agro Indonesia | 2 | 1 | pupuk |
| 921 | CV. PUSAKA ALAM | 2 | 1 | pupuk, pupuk-legacy |
| 922 | BORNEO INTECH | 2 | 1 | pupuk |
| 923 | KHANSA CITRA BUANA | 2 | 1 | pupuk |
| 924 | AGRI MAKMUR MEGA PERKASA INDO | 2 | 1 | pupuk |
| 925 | DHARMA GUNA | 2 | 1 | pupuk |
| 926 | PT SATYA PADMA AGRISOL | 2 | 1 | pupuk |
| 927 | CV. Sinar Sejahtera | 2 | 1 | pupuk |
| 928 | PT.MITRA UTAMA MAKMUR | 2 | 1 | pupuk |
| 929 | CV SURYA CITRA PERKASA | 2 | 1 | pupuk |
| 930 | WIBAWA MUKTI | 2 | 1 | pupuk |
| 931 | MITRA TANI GROUP INDONESIA | 2 | 1 | pupuk |
| 932 | MEGARHIZO EGA PERSADA | 2 | 1 | pupuk |
| 933 | MEGAH AGRI MEDIA BAROKAH | 2 | 1 | pupuk |
| 934 | CV. Bambu Emas | 2 | 1 | pupuk |
| 935 | CV. PUPUK AGRI MANDIRI | 2 | 1 | pupuk |
| 936 | BEKTI JOYO SAMPURNO | 2 | 1 | pupuk |
| 937 | AGRO GEMILANG INDONESIA | 2 | 1 | pupuk |
| 938 | MULTI AGRINDO NUSANTARA | 2 | 1 | pupuk |
| 939 | GUANO BERKAH SEJAHTERA | 2 | 1 | pupuk |
| 940 | MENTHOBI HIJAU LESTARI | 2 | 1 | pupuk |
| 941 | TECHNER INDO RAYA | 2 | 1 | pupuk |
| 942 | HUMAN LIFE INDONESIA | 2 | 1 | pupuk |
| 943 | HIMALAYA AGRO INVESTAMA | 2 | 1 | pupuk |
| 944 | NAKULA AGRI JAYA | 2 | 1 | pupuk |
| 945 | ANUGERAH DOLOMIT LESTARI | 2 | 1 | pupuk |
| 946 | PT.BUMI PERKASA AGRINDO | 2 | 1 | pupuk |
| 947 | GREENTRACK TECHNOLOGY INDONESIA | 2 | 1 | pupuk |
| 948 | MERDEKA BAHARI INDONESIA | 2 | 1 | pupuk |
| 949 | INOVASI FERTILIZER GROWPLANT | 2 | 1 | pupuk |
| 950 | ANSELL AGRO INDONESIA | 2 | 1 | pupuk |
| 951 | AGAPE SINAR NUSANTARA | 2 | 1 | pupuk |
| 952 | TIGA DARA JAYA | 2 | 1 | pupuk |
| 953 | INTER ALL | 2 | 1 | pupuk |
| 954 | PILAR LIMA | 2 | 1 | pupuk |
| 955 | RILIS | 2 | 1 | pupuk |
| 956 | PT. MITRA CHEMICAL WISESA | 2 | 1 | pupuk |
| 957 | MAMORA MARTUA JAYA | 2 | 1 | pupuk |
| 958 | Tiara Kurnia, PT | 2 | 1 | pupuk |
| 959 | TANATANI | 2 | 1 | pupuk |
| 960 | KANANITORA | 2 | 1 | pupuk |
| 961 | PT.MYCO AGRO LESTARI | 2 | 1 | pupuk |
| 962 | PT. BIOGREEN AGRO NUSA | 2 | 1 | pupuk |
| 963 | PROSPER MEGA NUSANTARA | 2 | 1 | pupuk |
| 964 | CV. AGRO MITRA BERJAYA | 2 | 1 | pupuk |
| 965 | HABIBI PUTRA TANI | 2 | 1 | pupuk |
| 966 | PT. INDOGAL AGRO TRADING | 2 | 1 | pupuk |
| 967 | CV. BAROKAH ZA | 2 | 1 | pupuk |
| 968 | PT. Catur HIdayah Lestari | 2 | 1 | pupuk |
| 969 | EMPAT LIMA NUSWANTORO | 2 | 1 | pupuk |
| 970 | DHARMA KARTAPURA | 2 | 1 | pupuk |
| 971 | ALAM MANFAAT BERKAH | 2 | 1 | pupuk |
| 972 | PT. Sarana Agro Panata | 2 | 1 | pupuk |
| 973 | BINTANG MARGOMULYA ORGANIK | 2 | 1 | pupuk |
| 974 | PETROKIMIA KEBOMAS GRESIK | 2 | 1 | pupuk |
| 975 | LINTANG BORNEO MANDIRI INDONESIA | 2 | 1 | pupuk |
| 976 | KUTAI AGROLESTARI MAKMUR | 2 | 1 | pupuk |
| 977 | PUTRA KIMIA GRESIK | 2 | 1 | pupuk |
| 978 | PT. Bio Takemi Global | 2 | 1 | pupuk |
| 979 | AGRO MARITIM NUSANTARA | 2 | 1 | pupuk |
| 980 | EKO SUNGKONO | 2 | 1 | pupuk |
| 981 | CV ALAM MAKMUR TANI AGRO | 2 | 1 | pupuk |
| 982 | AGRONIKO NUSANTARA | 2 | 1 | pupuk |
| 983 | PUTRA BARAGE RAYA | 2 | 1 | pupuk |
| 984 | PT. BINTANG CHEMICAL ABADI | 2 | 1 | pupuk |
| 985 | JAKE AGRO JAYA | 2 | 1 | pupuk |
| 986 | CV. CENTRA AGRINUSA | 2 | 1 | pupuk |
| 987 | BIO CYCLE INDO | 2 | 1 | pupuk |
| 988 | SUBUR MAKMUR ORGANIK | 2 | 1 | pupuk |
| 989 | PT Mycotech Agro Asia | 2 | 1 | pupuk |
| 990 | KKI NUSANTARA SUKSES | 2 | 1 | pupuk |
| 991 | PT. TIMUR ALAM RAYA | 2 | 1 | pupuk |
| 992 | CV. Rachma Farm Sejahtera | 2 | 1 | pupuk |
| 993 | TRI MITRA AGRO UTAMA | 2 | 1 | pupuk |
| 994 | MEREK INDAH LESTARI | 2 | 1 | pupuk |
| 995 | SEHAT CEMERLANG SEJAHTERA | 2 | 1 | pupuk |
| 996 | CV Pandu Pratama Karya | 2 | 1 | pupuk |
| 997 | PRIMA AGRO LESTARI | 2 | 1 | pupuk |
| 998 | BAKAPINDO | 2 | 1 | pupuk |
| 999 | PT. SURYA PRATAMA ALAM | 2 | 1 | pupuk |
| 1000 | SONGGOLANGIT PERSADA | 2 | 1 | pupuk |
| 1001 | SARI MAHAPHALA INDONESIA | 2 | 1 | pupuk |
| 1002 | INDOSOL MAKMUR | 2 | 1 | pupuk |
| 1003 | PT. Saribumi Dewatalestari | 2 | 1 | pupuk |
| 1004 | SHINAMJAYA ABADI | 2 | 1 | pupuk |
| 1005 | KRISNA CAKRA CYRILLA | 2 | 1 | pupuk |
| 1006 | AGROCHEM MEGA GLOBALINDO | 2 | 1 | pupuk |
| 1007 | KARUNIA ROTORINDO TANI | 2 | 1 | pupuk |
| 1008 | CV. Bulaksari Farm | 2 | 1 | pupuk, pupuk-legacy |
| 1009 | GEMA MITRA ANDALAN | 2 | 1 | pupuk |
| 1010 | HUSNA AGRO PERKASA | 2 | 1 | pupuk |
| 1011 | LOH JINAWI AKSHAYA | 2 | 1 | pupuk |
| 1012 | PT ISARU TEKNOLOGI NUSANTARA | 2 | 1 | pupuk |
| 1013 | CV. BUMI AGRO MANDIRI | 2 | 1 | pupuk |
| 1014 | META JAYA | 2 | 1 | pupuk |
| 1015 | SEMERU 23 GROUP | 2 | 1 | pupuk |
| 1016 | PT. Soko Tani Sejagad | 2 | 1 | pupuk |
| 1017 | PT. AGROMAX ALAMI SUKSES | 2 | 1 | pupuk |
| 1018 | CV. Casa Farm Hidroponik | 2 | 1 | pupuk |
| 1019 | AGRO BEN INDONESIA | 2 | 1 | pupuk |
| 1020 | BUKIT RAYA | 2 | 1 | pupuk |
| 1021 | MERPORIZAD BERKAH ABADI | 2 | 1 | pupuk |
| 1022 | RESTU MANDIRI INDONESIA | 2 | 1 | pupuk |
| 1023 | KARUNIA PERMATA UTAMA | 2 | 1 | pupuk |
| 1024 | PT DIC Graphics | 2 | 1 | pupuk, pupuk-legacy |
| 1025 | Koperasi Puspa Kencana | 2 | 1 | pupuk |
| 1026 | HSP CITRA GLOBAL | 2 | 1 | pupuk |
| 1027 | CV. PERSADA MAKMUR TANI SENTOSA | 2 | 1 | pupuk-legacy |
| 1028 | PT. BUKIT PRIMA NIAGA | 2 | 1 | pupuk-legacy |
| 1029 | PT. Andalan Usaha Indonesia | 2 | 1 | pupuk-legacy |
| 1030 | PT. Dwi Mitra | 2 | 1 | pupuk-legacy |
| 1031 | PT. Cahaya Inti Tunggal | 2 | 1 | pupuk-legacy |
| 1032 | CV PALUGADA SUKSES BERSAMA | 2 | 1 | pupuk-legacy |
| 1033 | CV.Sekar Sari | 2 | 1 | pupuk-legacy |
| 1034 | C.V. Berkat Eya Pratama | 2 | 1 | pupuk-legacy |
| 1035 | CV. Yoland Tani Indonesia | 2 | 1 | pupuk-legacy |
| 1036 | CV AGRO JAYA OCTAVIANT | 2 | 1 | pupuk-legacy |
| 1037 | Koperasi Karyawan Puspa Kencana | 2 | 1 | pupuk-legacy |
| 1038 | PT. SUBUR INDAH SUKSES GEMILANG | 2 | 1 | pupuk-legacy |
| 1039 | CV. Empat Serangkai | 2 | 1 | pupuk-legacy |
| 1040 | PT Agri Maju Perkasa | 2 | 1 | pupuk-legacy |
| 1041 | CV. Rejeki Lumintu Makmur | 2 | 1 | pupuk-legacy |
| 1042 | PT. Tiara Kurnia | 2 | 1 | pupuk-legacy |
| 1043 | CV. Blessindo Maju Bersama | 2 | 1 | pupuk-legacy |
| 1044 | PT. Alam Lestari Maju Indonesia | 2 | 1 | pupuk-legacy |
| 1045 | PT .PLANETBIRU INDONESIA | 2 | 1 | pupuk-legacy |
| 1046 | PT PRIMASID ANDALAN UTAMA | 2 | 1 | pupuk-legacy |
| 1047 | PT. BIO AGRI LINK | 2 | 2 | pestisida, pupuk |
| 1048 | CV. H.C.S. POWERINDO | 2 | 2 | pestisida, pupuk |
| 1049 | PT. CATUR KARTIKA JAYA | 2 | 2 | pestisida, pupuk |
| 1050 | PT. SINAR MAS AGRO RESOURCES AND TECHNOLOGY | 2 | 2 | pestisida, pupuk |
| 1051 | PT. PRIMASID ANDALANUTAMA | 2 | 2 | pestisida, pupuk |
| 1052 | PT. LABEZAR UTAMA INDONESIA | 2 | 2 | pestisida, pupuk |
| 1053 | PT. DAYA MERRY PERSADA | 2 | 2 | pestisida, pupuk |
| 1054 | CV. EUREEKA INDONESIA | 2 | 2 | pestisida, pupuk |
| 1055 | CV. NAZA AGRO'S | 2 | 2 | pestisida, pupuk |
| 1056 | CV. Hattara Citra Argo | 2 | 2 | pupuk |
| 1057 | PT. Sitosu Agro Cemerlang | 2 | 2 | pupuk |
| 1058 | PT.MANDIRI DASAR UTAMA | 2 | 2 | pupuk |
| 1059 | PT.Vietindo Agro Lestari | 2 | 2 | pupuk, pupuk-legacy |
| 1060 | PT. FORMULA DISTRIBUSI KIMIA | 2 | 2 | pupuk |
| 1061 | PT SASA INTI | 2 | 2 | pupuk, pupuk-legacy |
| 1062 | CV. Bintang Berlian | 2 | 2 | pupuk |
| 1063 | PT Buana Hijau Pratama | 2 | 2 | pupuk |
| 1064 | PT. KK Indonesia | 2 | 2 | pupuk |
| 1065 | CV. Telsap Utama | 2 | 2 | pupuk, pupuk-legacy |
| 1066 | PT. ARTHASIDDHI SUKSES ANUGERAH | 2 | 2 | pupuk |
| 1067 | PT. Sri Dipo Nuswantoro | 2 | 2 | pupuk, pupuk-legacy |
| 1068 | CV. Bunga Agro Lestari | 2 | 2 | pupuk |
| 1069 | CV. Christdo Titian Jaya | 2 | 2 | pupuk, pupuk-legacy |
| 1070 | CV. JAVA INDAH | 2 | 2 | pupuk, pupuk-legacy |
| 1071 | CV. APDIL APDILAH SUPER BUAH | 2 | 2 | pupuk |
| 1072 | PT. NUANSA INDORAYA PERKASA | 2 | 2 | pupuk |
| 1073 | PT. QL Agrofood | 2 | 2 | pupuk, pupuk-legacy |
| 1074 | CV. Arta Putri | 2 | 2 | pupuk, pupuk-legacy |
| 1075 | PT Bukit Mas Murti Persada | 2 | 2 | pupuk, pupuk-legacy |
| 1076 | PT Tunas Makmur Jaya Abadi | 2 | 2 | pupuk, pupuk-legacy |
| 1077 | PT.PRAMUDITA DARYA PARMA | 2 | 2 | pupuk, pupuk-legacy |
| 1078 | PT. Intidaya Agrolestari | 2 | 2 | pupuk, pupuk-legacy |
| 1079 | PT. NUSANTARA AGRO FARMA | 2 | 2 | pupuk |
| 1080 | CV Trubus Mas Lestari | 2 | 2 | pupuk |
| 1081 | CV. Dewi | 2 | 2 | pupuk, pupuk-legacy |
| 1082 | CV.AGROTANI | 2 | 2 | pupuk, pupuk-legacy |
| 1083 | PT. KARYA ALAM SUKSES | 2 | 2 | pupuk |
| 1084 | PT. DAHLIAH DUTA UTAMA | 2 | 2 | pupuk |
| 1085 | CV MANUNGGAL ABADI SENTOSA | 2 | 2 | pupuk, pupuk-legacy |
| 1086 | CV. Gunung Dono Putra | 2 | 2 | pupuk, pupuk-legacy |
| 1087 | CV. DELTA FORTUNA | 2 | 2 | pupuk, pupuk-legacy |
| 1088 | PT. Mitra Gresik Indonesia | 2 | 2 | pupuk, pupuk-legacy |
| 1089 | PT PUPUK KELAPA SAWIT JAYA | 2 | 2 | pupuk, pupuk-legacy |
| 1090 | CV. Sejahtera Abadi | 2 | 2 | pupuk, pupuk-legacy |
| 1091 | PT. Bahagia Jaya Sinergy | 2 | 2 | pupuk, pupuk-legacy |
| 1092 | PT. ANUGRAHA ALAM SENTOSA | 2 | 2 | pupuk |
| 1093 | PT. ADAMAS ASABHUMI | 2 | 2 | pupuk, pupuk-legacy |
| 1094 | CV. Organic Farming Indonesia | 2 | 2 | pupuk, pupuk-legacy |
| 1095 | CV. SUBURI PUTRA MANDIRI | 2 | 2 | pupuk, pupuk-legacy |
| 1096 | PT. Persada Pupuk Indonesia | 2 | 2 | pupuk, pupuk-legacy |
| 1097 | PT. ENVITEC MULTI INDONESIA | 2 | 2 | pupuk, pupuk-legacy |
| 1098 | CV. TANI ABADI | 1 | 1 | pestisida |
| 1099 | PT. NUTRI AGRO INDONESIA | 1 | 1 | pestisida |
| 1100 | CV INDO AGRO CHEMICAL | 1 | 1 | pestisida |
| 1101 | PT. BRENNTAG | 1 | 1 | pestisida |
| 1102 | PT. KAO INDONESIA DISTRIBUTION | 1 | 1 | pestisida |
| 1103 | CV. ALAM NABATI ANACARDIUM | 1 | 1 | pestisida |
| 1104 | PT. BAHANA HANNELA MASSIMA | 1 | 1 | pestisida |
| 1105 | CV. INDO TANI | 1 | 1 | pestisida |
| 1106 | CV. AMARTA BUANA SEJAHTERA | 1 | 1 | pestisida |
| 1107 | PT. PELITA AGUNG | 1 | 1 | pestisida |
| 1108 | PT. GALENIUM PHARMASIA LABORATORIES | 1 | 1 | pestisida |
| 1109 | PT. HALIM SAKTI PRATAMA | 1 | 1 | pestisida |
| 1110 | PT. BINTANG ANUGERAH CAHAYA ABADI | 1 | 1 | pestisida |
| 1111 | PT. SMARTZ AGRO LESTARI | 1 | 1 | pestisida |
| 1112 | SARAYA.LF.MANDIRI | 1 | 1 | pestisida |
| 1113 | CV. INDAH TANI SEJAHTERA | 1 | 1 | pestisida |
| 1114 | PT. GOLDEN STEP INDONESIA | 1 | 1 | pestisida |
| 1115 | PT. DWI PRIMA REZEKY | 1 | 1 | pestisida |
| 1116 | PT. KINGLAB INDONESIA | 1 | 1 | pestisida |
| 1117 | PT. DELITAL LEEFREN AGROINDUSTRI | 1 | 1 | pestisida |
| 1118 | PT. GOENA WAHANA AGRO NIAGA | 1 | 1 | pestisida |
| 1119 | PT. ASTORIA PRIMA | 1 | 1 | pestisida |
| 1120 | PT. Joenoes Ikamulya | 1 | 1 | pestisida |
| 1121 | PT. MALINDO AGROTEK PERKASA | 1 | 1 | pestisida |
| 1122 | PT. Hamka Multi Karya | 1 | 1 | pestisida |
| 1123 | PT. UPI CROPSCIENCE INDONESIA | 1 | 1 | pestisida |
| 1124 | CV. AGRIJAYA | 1 | 1 | pestisida |
| 1125 | PT. PROVIVI PHEROMONES INDONESIA | 1 | 1 | pestisida |
| 1126 | PT. DERAS KARET PRIMA | 1 | 1 | pestisida |
| 1127 | PT. Kiagus Syaiful Anwar | 1 | 1 | pestisida |
| 1128 | CV. TANI ABADI BORNEO | 1 | 1 | pestisida |
| 1129 | PT. PUTRA SWADAYA PERKASA | 1 | 1 | pestisida |
| 1130 | PT. BINTANG KENCANA ANUGRAH | 1 | 1 | pestisida |
| 1131 | CV. BUMI LESTARI KINTAMANI | 1 | 1 | pestisida |
| 1132 | PT. MEDPHOS CITRA MANDIRI | 1 | 1 | pestisida |
| 1133 | PT. LADANG SUBUR SENTOSA | 1 | 1 | pestisida |
| 1134 | PT. AGRO TUNAS RAYA | 1 | 1 | pestisida |
| 1135 | PT. SARI SARANA KIMIATAMA | 1 | 1 | pestisida |
| 1136 | AROMA | 1 | 1 | pestisida |
| 1137 | PT. INTER ANEKA LESTARI KIMIA | 1 | 1 | pestisida |
| 1138 | CV. TANI MUJUR | 1 | 1 | pestisida |
| 1139 | PT. SIFA SAUDARA ABADI | 1 | 1 | pestisida |
| 1140 | PT. MENARA JAYA LESTARI | 1 | 1 | pestisida |
| 1141 | PT. SEJAHTERA EKOLOGIKA DUTA QUEMIKA | 1 | 1 | pestisida |
| 1142 | PT. SML AGRO INDONESIA | 1 | 1 | pestisida |
| 1143 | PT. SURYAMAS MENTARI | 1 | 1 | pestisida |
| 1144 | PT. SINAR HIDUP SATWA | 1 | 1 | pestisida |
| 1145 | PT. TEJA UTAMA INDOPAMENANG | 1 | 1 | pestisida |
| 1146 | PT. PANCA TALENTAMAS | 1 | 1 | pestisida |
| 1147 | PT. BUANA NATURA KIRANA | 1 | 1 | pestisida |
| 1148 | CV. SAHABAT AGRI SEJATI | 1 | 1 | pestisida |
| 1149 | CV. SURYA UTAMA NIAGA TANI | 1 | 1 | pestisida |
| 1150 | PT. NORVUS INDONESIA | 1 | 1 | pestisida |
| 1151 | PT. FARM HANNONG INDONESIA | 1 | 1 | pestisida |
| 1152 | CV. AZKIA BINTANG NUSANTARA | 1 | 1 | pestisida |
| 1153 | PT. MITRA BIOSEKURITI SOLUSI | 1 | 1 | pestisida |
| 1154 | MEGAN GALUS KINANTAN | 1 | 1 | pestisida |
| 1155 | CV. KOLEKTIF SURYA CEMERLANG | 1 | 1 | pestisida |
| 1156 | PT. AVIA AVIAN | 1 | 1 | pestisida |
| 1157 | PT. MULTIKRIDA JAYA UTAMA | 1 | 1 | pestisida |
| 1158 | PT. SINAR RAFLESIA SELATAN | 1 | 1 | pestisida |
| 1159 | PT. LUAS BIRUS UTAMA | 1 | 1 | pestisida |
| 1160 | PT. FADJAR PURNASARANA | 1 | 1 | pestisida |
| 1161 | PT. PT. Anugerah Sarana Hayati | 1 | 1 | pestisida |
| 1162 | PT. SURYA AGROCHEM MITRA ABADI | 1 | 1 | pestisida |
| 1163 | CV. AGRO MIFTAHUL KHISBA | 1 | 1 | pestisida |
| 1164 | PT. WAHANA MAS | 1 | 1 | pestisida |
| 1165 | PT. GERBANG CAHAYA UTAMA | 1 | 1 | pestisida |
| 1166 | CV. MANDIRI ANUGERAH ABADI | 1 | 1 | pestisida |
| 1167 | PT. CITA AGUNG JAYA | 1 | 1 | pestisida |
| 1168 | PT. INDESSO AROMA | 1 | 1 | pestisida |
| 1169 | CV. NUSAGRI | 1 | 1 | pestisida |
| 1170 | PT. MEDION ARDHIKA BHAKTI | 1 | 1 | pestisida |
| 1171 | PT. BUDI MUTU PRIMA | 1 | 1 | pestisida |
| 1172 | PT. DWIJAYA PERKASA ABADI | 1 | 1 | pestisida |
| 1173 | PT. GRAHA ESA | 1 | 1 | pestisida |
| 1174 | PT. BIOJOYO TEKNOLOGI INDUSTRI | 1 | 1 | pestisida |
| 1175 | CV. LIVE ANGKASA | 1 | 1 | pestisida |
| 1176 | PT. KOIN TUNGGAL JAYA | 1 | 1 | pestisida |
| 1177 | PT. ETOS INDONUSA | 1 | 1 | pestisida |
| 1178 | CV. GRAHA FERTICON PERKASA | 1 | 1 | pestisida |
| 1179 | PT. SINAR ANTJOL | 1 | 1 | pestisida |
| 1180 | PT. NATUR AGRI TANI | 1 | 1 | pestisida |
| 1181 | PT. FADJAR AGRO SARANA | 1 | 1 | pestisida |
| 1182 | PT. WAHANA KENCANA INDONESIA | 1 | 1 | pestisida |
| 1183 | PT. TANI PERKASA KIMINDO | 1 | 1 | pestisida |
| 1184 | PT. SANDAR INTERNATIONAL | 1 | 1 | pestisida |
| 1185 | SUMBER UTAMA TANI | 1 | 1 | pupuk |
| 1186 | DAMAI SINERGI NUSANTARA | 1 | 1 | pupuk |
| 1187 | SAMAWA AGRO PERSADA | 1 | 1 | pupuk |
| 1188 | STELLAR AGRI INDONESIA | 1 | 1 | pupuk |
| 1189 | SAWONGGALING NUSANTARA | 1 | 1 | pupuk |
| 1190 | CV. SURYA PETANI | 1 | 1 | pupuk |
| 1191 | FAJAR RIZQY TANI | 1 | 1 | pupuk |
| 1192 | GEMILANG BERKAH USAHA | 1 | 1 | pupuk |
| 1193 | PUTRA SHB SEJAHTERA | 1 | 1 | pupuk |
| 1194 | BERKATINDO NUSANTARA BERSINAR | 1 | 1 | pupuk |
| 1195 | CV.KWADRAN JAYA MANDIRI | 1 | 1 | pupuk |
| 1196 | BENIH ROMAN AGRO | 1 | 1 | pupuk |
| 1197 | CV. SAKINA AGRO INDUSTRI | 1 | 1 | pupuk |
| 1198 | PT.AGRITEK SUKSES INDONESIA | 1 | 1 | pupuk |
| 1199 | BUMI MAKMUR WIDYADHANA | 1 | 1 | pupuk |
| 1200 | RATAMA ELON PERKASA | 1 | 1 | pupuk |
| 1201 | HIDUP TUMBUH BERJAYA | 1 | 1 | pupuk |
| 1202 | ULIE HOPE SO | 1 | 1 | pupuk |
| 1203 | BIOTEK AGRO NUSANTARA | 1 | 1 | pupuk |
| 1204 | ASTINA MEGAH ABADI | 1 | 1 | pupuk |
| 1205 | ANAYA GLOBAL INDONESIA | 1 | 1 | pupuk |
| 1206 | SINAR ADHIKARI ARYASATYA | 1 | 1 | pupuk |
| 1207 | BERKAH ALAM NUSANTARA FERTILIZER | 1 | 1 | pupuk |
| 1208 | JANTHO MAJU TANI | 1 | 1 | pupuk |
| 1209 | ORGANIK KARYA INDONESIA | 1 | 1 | pupuk |
| 1210 | HARMONI INCORPORATION | 1 | 1 | pupuk |
| 1211 | POSCO INTERNATIONAL INDONESIA | 1 | 1 | pupuk |
| 1212 | TOGA CIPTA FLORA | 1 | 1 | pupuk |
| 1213 | CV. DARMAPURI AGRO SEMESTA | 1 | 1 | pupuk |
| 1214 | CV. Agroxplore Indonesia | 1 | 1 | pupuk |
| 1215 | WILDO NATURAL INDONESIA | 1 | 1 | pupuk |
| 1216 | RIZKY AGRO MAKMUR | 1 | 1 | pupuk |
| 1217 | MESS JAYA INDONESIA | 1 | 1 | pupuk |
| 1218 | BIOCARE INDONESIA LANGGENG | 1 | 1 | pupuk |
| 1219 | JENGGONG MULYA JAYA SENTOSA | 1 | 1 | pupuk |
| 1220 | PANEN INTI NUSANTARA | 1 | 1 | pupuk |
| 1221 | GUNUNG MAS MAHRAJA GURAH | 1 | 1 | pupuk |
| 1222 | SINERGI CATALIS INDONESIA | 1 | 1 | pupuk |
| 1223 | SOIL AGRO SOLUTION | 1 | 1 | pupuk |
| 1224 | PELITA SAWIT NUSANTARA | 1 | 1 | pupuk |
| 1225 | TANAHMERAH BERKAT BESTARI | 1 | 1 | pupuk |
| 1226 | JAL SANI | 1 | 1 | pupuk |
| 1227 | MANDIRI SAPROTAN JAYA | 1 | 1 | pupuk |
| 1228 | MINARET CROWN ENERGY INTERNATIONAL | 1 | 1 | pupuk |
| 1229 | BULAN BINTANG JAYA | 1 | 1 | pupuk |
| 1230 | COKRO JOYO MITRA TANI | 1 | 1 | pupuk |
| 1231 | PT. Barokah Pinilih Agrotama | 1 | 1 | pupuk |
| 1232 | FITRIINDO LITE | 1 | 1 | pupuk |
| 1233 | SUPRANUSA INDOGITA | 1 | 1 | pupuk |
| 1234 | JAVANICA AGROSCIENCE INDONESIA | 1 | 1 | pupuk |
| 1235 | KAYA ALAM INDUSTRI | 1 | 1 | pupuk |
| 1236 | PRIMA PANCA AGRO | 1 | 1 | pupuk |
| 1237 | PUPUK INDONESIA NIAGA | 1 | 1 | pupuk |
| 1238 | PUTRA KEMBAR BINJAI | 1 | 1 | pupuk |
| 1239 | DANGIANG SRI | 1 | 1 | pupuk |
| 1240 | PT HIJAU BUMI INDONESIA | 1 | 1 | pupuk |
| 1241 | PABRIK GULA RAJAWALI II | 1 | 1 | pupuk |
| 1242 | RIZQI SEMESTA | 1 | 1 | pupuk |
| 1243 | MAYANGKARA INDO TANAM | 1 | 1 | pupuk |
| 1244 | CAHAYA AGROLEV KENCANA | 1 | 1 | pupuk |
| 1245 | MUTU AGROBIOCHEM NUSANTARA | 1 | 1 | pupuk |
| 1246 | GAHENDRA ABADI JAYA | 1 | 1 | pupuk |
| 1247 | PEKEBUN SWADAYA KELAPA SAWIT LABUHANBATU | 1 | 1 | pupuk |
| 1248 | TAKA SARANA TEKNO | 1 | 1 | pupuk |
| 1249 | BIO AGRO LESTARI INDONESIA | 1 | 1 | pupuk |
| 1250 | MUTIARA BENIH NUSANTARA | 1 | 1 | pupuk |
| 1251 | PETRO BUMI HIJAU GRESIK | 1 | 1 | pupuk |
| 1252 | BARDLIN PRAWARA LOKA | 1 | 1 | pupuk |
| 1253 | TATA TANI INDONESIA | 1 | 1 | pupuk |
| 1254 | MAHAMERU ASTANA SRIYA | 1 | 1 | pupuk |
| 1255 | BERKAH AUTO SUKSES SEJAHTERA | 1 | 1 | pupuk |
| 1256 | SEHAT BUMI SEMESTA | 1 | 1 | pupuk |
| 1257 | CV. BIR ALI JAYA | 1 | 1 | pupuk |
| 1258 | SUMBER MAKMUR AGROINDO | 1 | 1 | pupuk |
| 1259 | PRATAMA BUANA RAYA | 1 | 1 | pupuk |
| 1260 | IRSYAM BINA FLORA | 1 | 1 | pupuk |
| 1261 | SHANI PURA | 1 | 1 | pupuk |
| 1262 | AGRO CULTURE | 1 | 1 | pupuk |
| 1263 | MTW LAM BLANG | 1 | 1 | pupuk |
| 1264 | BUNAYYA AGRI | 1 | 1 | pupuk |
| 1265 | BINTANG WARNA | 1 | 1 | pupuk |
| 1266 | ZPT NATURE INDONESIA | 1 | 1 | pupuk |
| 1267 | PUTRA KRUENG JREU | 1 | 1 | pupuk |
| 1268 | JAYA ABADI JAYA | 1 | 1 | pupuk |
| 1269 | PT. BIO MARAJA NUSANTARA | 1 | 1 | pupuk |
| 1270 | KRT GREEN INDONESIA | 1 | 1 | pupuk |
| 1271 | CV.MITRA FARM MAJU BERSAMA | 1 | 1 | pupuk |
| 1272 | ZEE LORA GLOBAL INTERNASIONAL | 1 | 1 | pupuk |
| 1273 | WASKITA INTI NUSANTARA | 1 | 1 | pupuk |
| 1274 | CV. Flow Utama Nusantara | 1 | 1 | pupuk |
| 1275 | GEMILANG AGRO AGRAMIN | 1 | 1 | pupuk |
| 1276 | SOMPOAN SULAWESI SEJAHTERA | 1 | 1 | pupuk |
| 1277 | PETRO BUMI HIJAU | 1 | 1 | pupuk |
| 1278 | LAWOY BUMI ANUGERAH | 1 | 1 | pupuk |
| 1279 | CAHAYA BUANA ASIA | 1 | 1 | pupuk |
| 1280 | ETHAN GROUP | 1 | 1 | pupuk |
| 1281 | PT. AWAL TIGA MANDIRI | 1 | 1 | pupuk |
| 1282 | BIO SAMURAI JAPKORI | 1 | 1 | pupuk |
| 1283 | SUNAN DRAJAT LAMONGAN | 1 | 1 | pupuk |
| 1284 | CEPOGO AGRO LESTARI | 1 | 1 | pupuk |
| 1285 | KARYA BIRU INOVASI | 1 | 1 | pupuk |
| 1286 | HAYATI MAKMUR INDONESIA | 1 | 1 | pupuk |
| 1287 | CV. GAZALA SEJAHTERA MADANI | 1 | 1 | pupuk |
| 1288 | CIN KOREA NUSANTARA INDONESIA | 1 | 1 | pupuk |
| 1289 | CV JAYA FARMINDO | 1 | 1 | pupuk |
| 1290 | CV. HMS GLOBAL | 1 | 1 | pupuk |
| 1291 | WIJAYA SAKTI ABADI AGRIKULTUR | 1 | 1 | pupuk |
| 1292 | BAROKAH TANI JAYA BERSAMA | 1 | 1 | pupuk |
| 1293 | DAKSA YEKTI PRATAMA | 1 | 1 | pupuk |
| 1294 | DAVIANDRA NIAGA NUSANTARA | 1 | 1 | pupuk |
| 1295 | AGRIMAS CITRA MANDIRI | 1 | 1 | pupuk |
| 1296 | KARUNIA AGRI UTAMA | 1 | 1 | pupuk |
| 1297 | MATAHARI AGRI BERSAMA | 1 | 1 | pupuk |
| 1298 | PT Agri Timur Mas | 1 | 1 | pupuk |
| 1299 | AL HADID DUA PULUH | 1 | 1 | pupuk |
| 1300 | MAULANA WIJAYA MANDIRI | 1 | 1 | pupuk |
| 1301 | PRODUKSI TERNAK MAJU SEJAHTERA | 1 | 1 | pupuk |
| 1302 | AGRO TANI PERTIWI | 1 | 1 | pupuk |
| 1303 | POLARIS ORBIT INDONESIA | 1 | 1 | pupuk |
| 1304 | MEKAR TANI SUKSES | 1 | 1 | pupuk |
| 1305 | HIDAYAH AGRO MULYA | 1 | 1 | pupuk |
| 1306 | PT KREASI SADAWIRA UTAMA | 1 | 1 | pupuk |
| 1307 | GEMA FAJAR NUSANTARA | 1 | 1 | pupuk |
| 1308 | CV. SUMBER USAHA ABADI | 1 | 1 | pupuk |
| 1309 | BIOCHEM INTI GLOBAL | 1 | 1 | pupuk |
| 1310 | ZAHRA INDO GREEN FARMERS | 1 | 1 | pupuk |
| 1311 | WASTEX TECHNOLOGY INDONESIA | 1 | 1 | pupuk |
| 1312 | TANI AGRI SUKSES | 1 | 1 | pupuk |
| 1313 | ANUGRAH LESTARI INDONESIA | 1 | 1 | pupuk |
| 1314 | PT. Zamrud Bumi Indonesia | 1 | 1 | pupuk |
| 1315 | UD. KASIHAN JAYA | 1 | 1 | pupuk |
| 1316 | BINA ZHINOFA INDUSTRI | 1 | 1 | pupuk |
| 1317 | AUMA MAJU JAYA | 1 | 1 | pupuk |
| 1318 | ANEKA FLORA INDONESIA | 1 | 1 | pupuk |
| 1319 | AGRO BERKAH MANDIRI JAYA | 1 | 1 | pupuk |
| 1320 | CV ANANTA WINANGUN | 1 | 1 | pupuk |
| 1321 | CV TOYOPAMA | 1 | 1 | pupuk |
| 1322 | SATRIA GUNUNG SAKTI | 1 | 1 | pupuk |
| 1323 | ZEO BENT AGRO | 1 | 1 | pupuk |
| 1324 | YORIYUSAKIFA YUKI KOMPOS | 1 | 1 | pupuk |
| 1325 | LEMBAH NUSA ALAM | 1 | 1 | pupuk |
| 1326 | SURYA BAHARI PERSADA | 1 | 1 | pupuk |
| 1327 | MAKASSAR AGRO MANDIRI | 1 | 1 | pupuk |
| 1328 | TERRA BARU INDONESIA | 1 | 1 | pupuk |
| 1329 | CIPTA ALAM MUKTI | 1 | 1 | pupuk |
| 1330 | JEMBATAN MERAH INDAH | 1 | 1 | pupuk |
| 1331 | ASRI JAYA RAYA | 1 | 1 | pupuk |
| 1332 | SEKAR SARI JAYA | 1 | 1 | pupuk |
| 1333 | MENARA AGRO PRIMA | 1 | 1 | pupuk |
| 1334 | AGRO MUJIZAT INTEGRASI NUSANTARA | 1 | 1 | pupuk |
| 1335 | LENTERA KENCANA ABADI | 1 | 1 | pupuk |
| 1336 | SAMUDRA PUTRA SEJAHTERA | 1 | 1 | pupuk |
| 1337 | SARI TANI | 1 | 1 | pupuk |
| 1338 | BUMI MAKMUR SEJAHTERA LAMONGAN | 1 | 1 | pupuk |
| 1339 | BLANG RAYA INDO | 1 | 1 | pupuk |
| 1340 | SINAR BUKIT SIAUR | 1 | 1 | pupuk |
| 1341 | AGRI NUSA TANI | 1 | 1 | pupuk |
| 1342 | PUTRA MAKMUR BERJAYA | 1 | 1 | pupuk |
| 1343 | TRASH FORMER INDONESIA | 1 | 1 | pupuk |
| 1344 | PETERNAKAN MAJU BERSAMA | 1 | 1 | pupuk |
| 1345 | SUSIANTO TANUDJAJA | 1 | 1 | pupuk |
| 1346 | ARPINDO PERKASA | 1 | 1 | pupuk |
| 1347 | AGROJAYA LESTARI | 1 | 1 | pupuk |
| 1348 | SUWARNI GLOBAL PERSADA | 1 | 1 | pupuk |
| 1349 | GHM FARM TECH | 1 | 1 | pupuk |
| 1350 | NAGAMAS ARIF SEJATI | 1 | 1 | pupuk |
| 1351 | FERTILE ECOGREEN INDONESIA | 1 | 1 | pupuk |
| 1352 | SARI SUBUR LANGGENG JAYA | 1 | 1 | pupuk |
| 1353 | J.J TIGA PUTRI AGRICA | 1 | 1 | pupuk |
| 1354 | MEGA KARYA GRESIK | 1 | 1 | pupuk |
| 1355 | KOPERASI PRODUSEN KARYA NUGRAHA JAYA KUNINGAN | 1 | 1 | pupuk |
| 1356 | RIAU TANI BERSATU | 1 | 1 | pupuk |
| 1357 | KEMINDO INTERNATIONAL | 1 | 1 | pupuk |
| 1358 | PETROKIMIA GRESIK INDONESIA | 1 | 1 | pupuk |
| 1359 | PT FIRDAUS BERJAYA INDAH | 1 | 1 | pupuk |
| 1360 | FIDEC CIRCLE INDONESIA | 1 | 1 | pupuk |
| 1361 | DUA RODA AGRO TERPADU | 1 | 1 | pupuk |
| 1362 | DJUARA TANI NUSANTARA | 1 | 1 | pupuk |
| 1363 | PUTRA SIHOBON JAYA | 1 | 1 | pupuk |
| 1364 | CV. KIAT AGRO MANDIRI | 1 | 1 | pupuk |
| 1365 | HARVANITA AGRO NUSA | 1 | 1 | pupuk |
| 1366 | ANTASENA TAMBANG MAKMUR | 1 | 1 | pupuk |
| 1367 | DUA POETRA JAYA AGROLINK | 1 | 1 | pupuk |
| 1368 | BERKAH SUKSES TEKNOLOGI | 1 | 1 | pupuk |
| 1369 | WILMA RAGAM INFOPEN | 1 | 1 | pupuk |
| 1370 | RIAU PRIMA ENERGI | 1 | 1 | pupuk |
| 1371 | DUPA WANGI FERTILINDO | 1 | 1 | pupuk |
| 1372 | SUMBER BERKAH AGRO SANTOSA | 1 | 1 | pupuk |
| 1373 | TERRA AGRO PERSADA | 1 | 1 | pupuk |
| 1374 | CV. Mino Tangguh Mandiri | 1 | 1 | pupuk |
| 1375 | DELTA ANUGRAH SUBUR SEJAHTERA | 1 | 1 | pupuk |
| 1376 | ZHEN TIAN WANG SOUTH EAST ASIA BIOLOGICAL TECHNOLOGY | 1 | 1 | pupuk |
| 1377 | SATYALOKA PARAMA SIDHI | 1 | 1 | pupuk |
| 1378 | BIO POLLEN INDONESIA | 1 | 1 | pupuk |
| 1379 | YUKI MINERALINDO PERSADA | 1 | 1 | pupuk |
| 1380 | WIDAYA AGROKIMIA NUSANTARA | 1 | 1 | pupuk |
| 1381 | KENCANA BHUMI SELARAS | 1 | 1 | pupuk |
| 1382 | TRION GENI UTAMA NUSANTARA | 1 | 1 | pupuk |
| 1383 | CV. Anugerah Prima Lestari | 1 | 1 | pupuk |
| 1384 | ARIF FIZAH FERTILIZER | 1 | 1 | pupuk |
| 1385 | AGROSMART | 1 | 1 | pupuk |
| 1386 | HUMUS AGRO LESTARI | 1 | 1 | pupuk |
| 1387 | NIAGA RAYA | 1 | 1 | pupuk |
| 1388 | SANG SURYA INDAH | 1 | 1 | pupuk |
| 1389 | PETROTECH INDO ENGINEERING | 1 | 1 | pupuk |
| 1390 | ALGATROPIA INDONESIA RAYA | 1 | 1 | pupuk |
| 1391 | WIJIMAS AGRI LESTARI | 1 | 1 | pupuk |
| 1392 | PASAROA KREASI ANAK NEGERI | 1 | 1 | pupuk |
| 1393 | EMJ AGRO NUSANTARA | 1 | 1 | pupuk |
| 1394 | GLOBAL ALAM PERKASA GRUP | 1 | 1 | pupuk |
| 1395 | KELAPA NUSANTARA GROP | 1 | 1 | pupuk |
| 1396 | PERFEKTA LINTAS SEMESTA | 1 | 1 | pupuk |
| 1397 | SERASI MAHARAYA INDONESIA | 1 | 1 | pupuk |
| 1398 | SEMESTA ALAM INDO | 1 | 1 | pupuk |
| 1399 | ST UNGGUL JAYA | 1 | 1 | pupuk |
| 1400 | AGRANAS KARYA MANDIRI | 1 | 1 | pupuk |
| 1401 | SULTAN AGRO NUSANTARA | 1 | 1 | pupuk |
| 1402 | PUTRA ABIMANYU UTAMA | 1 | 1 | pupuk |
| 1403 | LIM KOEI HOCK/UD SALIM JAYA | 1 | 1 | pupuk |
| 1404 | PT CENTRANUSA INTI PRIMA INDUSTRY | 1 | 1 | pupuk |
| 1405 | SANG SURYA BERSINAR | 1 | 1 | pupuk |
| 1406 | SARANA DAUN HIJAU | 1 | 1 | pupuk |
| 1407 | PT. HARAKU JAYA SINERGY | 1 | 1 | pupuk |
| 1408 | ABU NAWAS MEU ADAB | 1 | 1 | pupuk |
| 1409 | TEKNO ORGANIK PAPUA | 1 | 1 | pupuk |
| 1410 | CATUR INTI PERSADA | 1 | 1 | pupuk |
| 1411 | TIRTA MITRA PRATAMA | 1 | 1 | pupuk |
| 1412 | GAPOKTAN SUKA MAKMUR | 1 | 1 | pupuk |
| 1413 | MPS ORGANIK SUPER | 1 | 1 | pupuk |
| 1414 | SUMBER RAYA | 1 | 1 | pupuk |
| 1415 | CLAREXINDO MAKMUR SEJAHTERA | 1 | 1 | pupuk |
| 1416 | ALAM KIMIA BLITZ PERKASA | 1 | 1 | pupuk |
| 1417 | NIAGA BERKAH ANUGRAH | 1 | 1 | pupuk |
| 1418 | CV. Subur Makmur Nusantara | 1 | 1 | pupuk |
| 1419 | INTI MINERAL INDUSTRI | 1 | 1 | pupuk |
| 1420 | BATARAGENI KARYA MANDIRI | 1 | 1 | pupuk |
| 1421 | PERDANA AGRO PERSADA | 1 | 1 | pupuk |
| 1422 | AGRO INDO MANDIRI | 1 | 1 | pupuk |
| 1423 | TRI HARMONI ABADI | 1 | 1 | pupuk |
| 1424 | CV.BERNAS ANDALAN SEJATI | 1 | 1 | pupuk |
| 1425 | PANCA MULYA TANIMAS LESTARI | 1 | 1 | pupuk |
| 1426 | AGRO LESTARINDO | 1 | 1 | pupuk |
| 1427 | BAROKAH ABADI TANI | 1 | 1 | pupuk |
| 1428 | DNA TECHNOLOGY INDUSTRI | 1 | 1 | pupuk |
| 1429 | CV AGRO SENTOSA ABADI | 1 | 1 | pupuk |
| 1430 | CV. LESTARI INTI AGRO | 1 | 1 | pupuk |
| 1431 | HIDAYAT BINTANG ASIA | 1 | 1 | pupuk |
| 1432 | MORAWA ORGANIK | 1 | 1 | pupuk |
| 1433 | PT Biodiversitas Bioteknologi Indonesia | 1 | 1 | pupuk |
| 1434 | TIGA KREASI BERSAMA | 1 | 1 | pupuk |
| 1435 | PT. BERKAT KARUNIA DAMAI | 1 | 1 | pupuk |
| 1436 | SAHABAT TANI TV | 1 | 1 | pupuk |
| 1437 | MEKAR SARI JAYA | 1 | 1 | pupuk |
| 1438 | ASPA SEMBILAN TUJUH FARMER INDUSTRY | 1 | 1 | pupuk |
| 1439 | CV. ZEO BENT INDONESIA | 1 | 1 | pupuk |
| 1440 | BHETOCHAR ENERGI NUSANTARA | 1 | 1 | pupuk |
| 1441 | YKB MERAH PUTIH | 1 | 1 | pupuk |
| 1442 | BATARA SUBUR TANI | 1 | 1 | pupuk |
| 1443 | MONTREAL JAYA INDO | 1 | 1 | pupuk |
| 1444 | KUR AGRO LESTARI | 1 | 1 | pupuk |
| 1445 | SURYAPRATAMA CITRALESTARI | 1 | 1 | pupuk |
| 1446 | MUKTI GRAHA PERKASA | 1 | 1 | pupuk |
| 1447 | INDO FERT CORP | 1 | 1 | pupuk |
| 1448 | CV. Rimba Jaya | 1 | 1 | pupuk |
| 1449 | GRESIK GOLD BLESSING | 1 | 1 | pupuk |
| 1450 | LAHAN MAS MEKAR | 1 | 1 | pupuk |
| 1451 | SEMBILAN JAYA ABADI RESOURCES | 1 | 1 | pupuk |
| 1452 | CV. PRIMA SAKTI | 1 | 1 | pupuk |
| 1453 | BERKAH BUMI BARU | 1 | 1 | pupuk |
| 1454 | NS CROPS ORGANIC | 1 | 1 | pupuk |
| 1455 | ALOVE BALI IND | 1 | 1 | pupuk |
| 1456 | JASARESI MANDIRI | 1 | 1 | pupuk |
| 1457 | PT. SETIA ALAM SINERGI | 1 | 1 | pupuk |
| 1458 | TRIASPUTRA AGRO MAJU SEJAHTERA | 1 | 1 | pupuk |
| 1459 | BUMI SRIWIJAYA INDONESIA | 1 | 1 | pupuk |
| 1460 | BERSAMA AGRI MAKMUR | 1 | 1 | pupuk |
| 1461 | PT Cipta Ulang Sumberdaya Indonesia | 1 | 1 | pupuk |
| 1462 | DEWI MURNI SAMPURNA | 1 | 1 | pupuk |
| 1463 | TRANS BUMI SUBUR SEJAHTERA | 1 | 1 | pupuk |
| 1464 | UD Jonhson | 1 | 1 | pupuk |
| 1465 | MAJJAMA AGRO INDUSTRI | 1 | 1 | pupuk |
| 1466 | MEGA KIMIA INDUSTRI | 1 | 1 | pupuk |
| 1467 | MITRA TANINDO | 1 | 1 | pupuk |
| 1468 | DEWADARU KARYAUTAMA JAYA | 1 | 1 | pupuk |
| 1469 | INFINITI SUMBER ALAM | 1 | 1 | pupuk |
| 1470 | TUNAS LESTARI ALAM INDAH | 1 | 1 | pupuk |
| 1471 | LIBO FARMING | 1 | 1 | pupuk |
| 1472 | PT DYNAPHARM NUSANTARA GEMILANG | 1 | 1 | pupuk |
| 1473 | SAMOR ARGA MAKMUR | 1 | 1 | pupuk |
| 1474 | CV.JABAL REZKI | 1 | 1 | pupuk |
| 1475 | ZENTIDE BIOTEKNOLOGI GLOBAL | 1 | 1 | pupuk |
| 1476 | CIWANGI NUTRISI TANAMAN | 1 | 1 | pupuk |
| 1477 | ARJUNA GRESIK BUMI PERKASA | 1 | 1 | pupuk |
| 1478 | CANTIGA | 1 | 1 | pupuk |
| 1479 | MANDIRI CEMERLANG ABADI | 1 | 1 | pupuk |
| 1480 | SEDAYA AGRO | 1 | 1 | pupuk |
| 1481 | PT UNGGUL SEJAHTERA PERTANIAN | 1 | 1 | pupuk |
| 1482 | PELITA SUSUN BENTANG ORGANIK | 1 | 1 | pupuk |
| 1483 | PT GLOBAL GROWTH | 1 | 1 | pupuk |
| 1484 | PRINALTIA JUNTA PERKASA | 1 | 1 | pupuk |
| 1485 | BELERANG GUNUNG KAWAH IJEN | 1 | 1 | pupuk |
| 1486 | INSAN LESTARI | 1 | 1 | pupuk |
| 1487 | MUNCUL BERKAH TANI | 1 | 1 | pupuk |
| 1488 | UD. HARAPAN ABADI | 1 | 1 | pupuk |
| 1489 | PABRIK GULA RAJAWALI I | 1 | 1 | pupuk |
| 1490 | ZAQ INDONESIA | 1 | 1 | pupuk |
| 1491 | SURYA SEMI SENTOSA | 1 | 1 | pupuk |
| 1492 | BIOKLANTEK NUSANTARA | 1 | 1 | pupuk |
| 1493 | GEUSAN WIRA PERKASA | 1 | 1 | pupuk |
| 1494 | DAVARI ANUGERAH SEJAHTERA | 1 | 1 | pupuk |
| 1495 | PT. Kemoza Mandiri Grup | 1 | 1 | pupuk |
| 1496 | WIRA ADHI SATYA PERTIWI | 1 | 1 | pupuk |
| 1497 | BUMI LAVANAA AGRO INDUSTRI | 1 | 1 | pupuk |
| 1498 | BIO BATARA JAYA | 1 | 1 | pupuk |
| 1499 | WILIS MULYO NUSWANTORO JOYO | 1 | 1 | pupuk |
| 1500 | INDOHAYATI AGRO SEJAHTERA | 1 | 1 | pupuk |
| 1501 | PT. BLANG THOEI LUAH | 1 | 1 | pupuk |
| 1502 | CV. Marson Syah | 1 | 1 | pupuk |
| 1503 | HAFISA ANUGERAH MAKMUR | 1 | 1 | pupuk |
| 1504 | IKASHI SABDA AGUNG | 1 | 1 | pupuk |
| 1505 | NAVATI GEMILANG MANDIRI | 1 | 1 | pupuk |
| 1506 | TATANAN ALAM SEGAR | 1 | 1 | pupuk |
| 1507 | ARGO WIRA BUANA | 1 | 1 | pupuk |
| 1508 | IJO | 1 | 1 | pupuk |
| 1509 | SINAR JAYA SAE | 1 | 1 | pupuk |
| 1510 | BIO NUSA LESTARI | 1 | 1 | pupuk |
| 1511 | MUTIARA ZIOSOVIQ | 1 | 1 | pupuk |
| 1512 | RAMBATE RATAHAYU | 1 | 1 | pupuk |
| 1513 | SUMBER PANGAN GRESIK | 1 | 1 | pupuk |
| 1514 | KUDJANG PUTRA PRATAMA | 1 | 1 | pupuk |
| 1515 | ADHI MANGGALA | 1 | 1 | pupuk |
| 1516 | FAN JAYA MANUNGGAL | 1 | 1 | pupuk |
| 1517 | NAWASENA UNGGUL SANTOSA | 1 | 1 | pupuk |
| 1518 | MADUBARU | 1 | 1 | pupuk |
| 1519 | PUTRA JAYA RAHARJA | 1 | 1 | pupuk |
| 1520 | SURYA NUSA PERKASA | 1 | 1 | pupuk |
| 1521 | HERKREASI | 1 | 1 | pupuk |
| 1522 | VALENTA JAYA BERSAMA | 1 | 1 | pupuk |
| 1523 | PT. LAJU PERSADA UTAMA | 1 | 1 | pupuk |
| 1524 | CV. RIAU AGROFERT | 1 | 1 | pupuk |
| 1525 | ANAGATA AGRO ABADI | 1 | 1 | pupuk |
| 1526 | ARINAKI MULIA BERSAMA | 1 | 1 | pupuk |
| 1527 | RIMBA ALAM NUSANTARA | 1 | 1 | pupuk |
| 1528 | CLEAN AND WELL PACK INDONESIA | 1 | 1 | pupuk |
| 1529 | BIN ZEIN AGRICULTURE | 1 | 1 | pupuk |
| 1530 | BERLIAN ANUGERAH JAYA | 1 | 1 | pupuk |
| 1531 | HUMACARE INDONESIA ABADI | 1 | 1 | pupuk |
| 1532 | HERDANIC AFDA DIHESA | 1 | 1 | pupuk |
| 1533 | CV. INDAH PRATAMA SARI | 1 | 1 | pupuk |
| 1534 | SEMANGAT BERSAMA ENTREPRENEURSHIP | 1 | 1 | pupuk |
| 1535 | ARMAFAN BAKTI SESAMA | 1 | 1 | pupuk |
| 1536 | LEGASI ALAM INDONESIA | 1 | 1 | pupuk |
| 1537 | TANI JAYA, UD | 1 | 1 | pupuk |
| 1538 | ALAM SEMESTA TEKHNOVASI | 1 | 1 | pupuk |
| 1539 | BENATA | 1 | 1 | pupuk |
| 1540 | ANDALAS DOLOMIT SEJAHTERA | 1 | 1 | pupuk |
| 1541 | NUSANTARA TETAP JAYA | 1 | 1 | pupuk |
| 1542 | BASIMBAH TANI SYAHDILATA | 1 | 1 | pupuk |
| 1543 | SUMBER MULYA GRAND ORGANIK | 1 | 1 | pupuk |
| 1544 | EMIRA AGRITANI | 1 | 1 | pupuk |
| 1545 | ASIA PACIFIC MARKETING INTERNATIONAL | 1 | 1 | pupuk |
| 1546 | ASIA PACIFIC RAYON | 1 | 1 | pupuk |
| 1547 | CV. PONDANGI | 1 | 1 | pupuk |
| 1548 | DUTA AGRO LESTARI | 1 | 1 | pupuk |
| 1549 | CV. Argo Pundi Lestari | 1 | 1 | pupuk |
| 1550 | MAHKOTA JAYA RAYA | 1 | 1 | pupuk |
| 1551 | PUTRO JOYO GROUP | 1 | 1 | pupuk |
| 1552 | PT. POLOWIJO GRAHA NIAGA | 1 | 1 | pupuk |
| 1553 | TASMA PUJA | 1 | 1 | pupuk |
| 1554 | CV. BINA AGRO PACIFIC | 1 | 1 | pupuk |
| 1555 | BUMI MAKMUR | 1 | 1 | pupuk |
| 1556 | EKOTANI SINAR ANUGERAH | 1 | 1 | pupuk |
| 1557 | LAMPOH LADA | 1 | 1 | pupuk |
| 1558 | GROWING PLANTS INTERNASIONAL | 1 | 1 | pupuk |
| 1559 | ALAMI ORION AGROTAMA | 1 | 1 | pupuk |
| 1560 | CV. Sinar Agro Sejati | 1 | 1 | pupuk |
| 1561 | ENERGI AGRO NUSANTARA | 1 | 1 | pupuk |
| 1562 | DASA VAYU ALAM SARI | 1 | 1 | pupuk |
| 1563 | NETA AGRINDO SANTOSA | 1 | 1 | pupuk |
| 1564 | BIMA JAYA FARM | 1 | 1 | pupuk |
| 1565 | BANGBARA SADULUR MAKMUR | 1 | 1 | pupuk |
| 1566 | KOPERASI PRODUSEN BRAHMAN SEJAHTERA SUBANG | 1 | 1 | pupuk |
| 1567 | JAYA PERKASA | 1 | 1 | pupuk |
| 1568 | EVA SUKSES MAKMUR | 1 | 1 | pupuk |
| 1569 | DARMAWANGSA PUTRA | 1 | 1 | pupuk |
| 1570 | RIZKI FERTILA SEJAHTERA | 1 | 1 | pupuk |
| 1571 | PT Tri Dharma Internasional | 1 | 1 | pupuk |
| 1572 | CV. Putri Gresik | 1 | 1 | pupuk |
| 1573 | RODAME INDONESIA | 1 | 1 | pupuk |
| 1574 | PESONA HERBAL INDONESIA | 1 | 1 | pupuk |
| 1575 | KARYA MANUNGGAL JAYA | 1 | 1 | pupuk |
| 1576 | CV. AL HADID 20 | 1 | 1 | pupuk |
| 1577 | BERKAH ALAM GEMILANG | 1 | 1 | pupuk |
| 1578 | HAYATI MAKMUR NUSANTARA | 1 | 1 | pupuk |
| 1579 | BIOTEK AGRI LESTARI | 1 | 1 | pupuk |
| 1580 | ARWANA TANI MAKMUR | 1 | 1 | pupuk |
| 1581 | TIRTA UTAMA GLOBAL | 1 | 1 | pupuk |
| 1582 | OMTEC PRIMA MANDIRI | 1 | 1 | pupuk |
| 1583 | MULIA REZEKI ABADI | 1 | 1 | pupuk |
| 1584 | NUTRISI INDONESIA RAYA | 1 | 1 | pupuk |
| 1585 | TRIJAYA ANUGRAH SENTOSA | 1 | 1 | pupuk |
| 1586 | Yayasan Pemilahan Sampah Temesi | 1 | 1 | pupuk |
| 1587 | DHARMA PERTIWI | 1 | 1 | pupuk |
| 1588 | PT.LINTAS INDO SEJAHTERA | 1 | 1 | pupuk |
| 1589 | BIO DITA ORGANIK | 1 | 1 | pupuk |
| 1590 | GREEN PHOSKA SEJAHTERA | 1 | 1 | pupuk |
| 1591 | CV. CEMIKA OPTIMA | 1 | 1 | pupuk |
| 1592 | PT. BIO INOVASINDO HAYATI | 1 | 1 | pupuk |
| 1593 | PT.Madura Guano | 1 | 1 | pupuk |
| 1594 | KELOMPOK USAHA BERSAMA SIDO TENTREM | 1 | 1 | pupuk |
| 1595 | KUMISIK BERKAH SEJAHTERA | 1 | 1 | pupuk |
| 1596 | SUPER GRADE ROSINDO | 1 | 1 | pupuk |
| 1597 | MAHAJAYA MULTI SINERGI | 1 | 1 | pupuk |
| 1598 | PT. Hikari Agro Indonesia | 1 | 1 | pupuk |
| 1599 | PT DIANATA ADIKARYA SENTOSA | 1 | 1 | pupuk |
| 1600 | COKRO JOYO PASTI CUAN | 1 | 1 | pupuk |
| 1601 | SOLUSI AGRONUSA PRATAMA | 1 | 1 | pupuk |
| 1602 | MINERAL JAYA ALAM NUSANTARA | 1 | 1 | pupuk |
| 1603 | SURYA BUMI ADILMAKMUR | 1 | 1 | pupuk |
| 1604 | SIMAR ALAM BERKAH | 1 | 1 | pupuk |
| 1605 | CV BIO SENTRATAMA | 1 | 1 | pupuk |
| 1606 | ESA ILHAM PERSADA | 1 | 1 | pupuk |
| 1607 | MARCO JAYA SEJAHTERA | 1 | 1 | pupuk |
| 1608 | MITRA TEMASEK NUSANTARA | 1 | 1 | pupuk |
| 1609 | AURORA SABANGSATIA | 1 | 1 | pupuk |
| 1610 | CIPTA MAKMUR BERSAMA | 1 | 1 | pupuk |
| 1611 | PT.BINTANG ANANDA MANDIRI | 1 | 1 | pupuk |
| 1612 | EMINEN GLOBALINDO RAYA | 1 | 1 | pupuk |
| 1613 | SENTRA PETERNAKAN RAKYAT (SPR) | 1 | 1 | pupuk |
| 1614 | MADA PUTRA NUSANTARA | 1 | 1 | pupuk |
| 1615 | AGROTIS GAIA INDONESIA | 1 | 1 | pupuk |
| 1616 | ULI AGRO MAKMUR | 1 | 1 | pupuk |
| 1617 | EBISU GLOBALTRADING INDONESIA | 1 | 1 | pupuk |
| 1618 | CAKRA DHARMA USAHA | 1 | 1 | pupuk |
| 1619 | SAUNG AGRO NUSANTARA | 1 | 1 | pupuk |
| 1620 | BIAN JAYA MAKMUR | 1 | 1 | pupuk |
| 1621 | MAJU JAYA | 1 | 1 | pupuk |
| 1622 | REGENERASI KEHIDUPAN NUSANTARA | 1 | 1 | pupuk |
| 1623 | PT BANDUNG ECO SINERGI TEKNOLOGI | 1 | 1 | pupuk |
| 1624 | NAZRAH AGRO MANDIRI | 1 | 1 | pupuk |
| 1625 | TIARA AGRO HITA KENCANA | 1 | 1 | pupuk |
| 1626 | PALAPA GRESIK | 1 | 1 | pupuk |
| 1627 | PANGAN INDO MAJU ABADI | 1 | 1 | pupuk |
| 1628 | PT. Anugerah Sarana Hayati | 1 | 1 | pupuk |
| 1629 | PT. Sri Munarti Supakat Indoputra | 1 | 1 | pupuk |
| 1630 | BUKIT KAPUR ALAM RAYA | 1 | 1 | pupuk |
| 1631 | CV. ANUGERAH BERSAMA | 1 | 1 | pupuk |
| 1632 | INOVASI ANAK INDONESIA | 1 | 1 | pupuk |
| 1633 | CITRA ANUGRAH MALINOTAMA | 1 | 1 | pupuk |
| 1634 | AGRO GALBA RABUKA | 1 | 1 | pupuk |
| 1635 | PT. BIOTEK AGRO INDONESIA | 1 | 1 | pupuk |
| 1636 | PERSADA HIJAU | 1 | 1 | pupuk |
| 1637 | SUMINDO | 1 | 1 | pupuk |
| 1638 | HARVEST BERKAH ABADI | 1 | 1 | pupuk |
| 1639 | AGRO INVESTAMA LESTARI | 1 | 1 | pupuk |
| 1640 | PUPUK AGRO JAYA | 1 | 1 | pupuk |
| 1641 | PUTRA KURNIA MAS | 1 | 1 | pupuk |
| 1642 | PT KIBO AGRI JAYA | 1 | 1 | pupuk |
| 1643 | MAHA DWIPA NUSANTARA | 1 | 1 | pupuk |
| 1644 | SEPAKAT GLOBAL | 1 | 1 | pupuk |
| 1645 | MAKMUR BUMI ABADI | 1 | 1 | pupuk |
| 1646 | NIRANKARA MAKMUR AGRO | 1 | 1 | pupuk |
| 1647 | TAWANG AGRO FARM | 1 | 1 | pupuk |
| 1648 | PESONA PETANI NUSANTARA | 1 | 1 | pupuk |
| 1649 | GALIH JATI | 1 | 1 | pupuk |
| 1650 | TIMAN AGUNG | 1 | 1 | pupuk |
| 1651 | BANGKIT SOLUSI AGRINDO | 1 | 1 | pupuk |
| 1652 | HARI AGRO HAYATI | 1 | 1 | pupuk |
| 1653 | LOBO KRIS UNIKKA | 1 | 1 | pupuk |
| 1654 | ASA MANDIRI SEJAHTERA | 1 | 1 | pupuk |
| 1655 | TARUM SINERGI INDONESIA | 1 | 1 | pupuk |
| 1656 | MULIA AGRO SEJAHTERA | 1 | 1 | pupuk |
| 1657 | CIPTA USAHA SANTOSA | 1 | 1 | pupuk |
| 1658 | CV. HANGSON | 1 | 1 | pupuk |
| 1659 | CIHURIP AGRO NUSA | 1 | 1 | pupuk |
| 1660 | TANIKITA BERKAH | 1 | 1 | pupuk |
| 1661 | MITRA TERBAIK NUSANTARA | 1 | 1 | pupuk |
| 1662 | CV.PRATAMA LESTARI | 1 | 1 | pupuk |
| 1663 | BARATAYUDA AGRO TANI | 1 | 1 | pupuk |
| 1664 | SUMBER ALAM REJEKI | 1 | 1 | pupuk |
| 1665 | RJ MANDIRI | 1 | 1 | pupuk |
| 1666 | TAN TJUN HOA/UD. NAGA MAS SAKTI | 1 | 1 | pupuk |
| 1667 | CV. Wahana Putra Mandiri | 1 | 1 | pupuk |
| 1668 | AGRO RIZVIK PRADANA | 1 | 1 | pupuk |
| 1669 | ULTRAMIC INDONESIA | 1 | 1 | pupuk |
| 1670 | SEMULUR JAYA MAKMUR | 1 | 1 | pupuk |
| 1671 | CV. INDO SAMADA | 1 | 1 | pupuk |
| 1672 | BIO HARUN INDONESIA | 1 | 1 | pupuk |
| 1673 | INAMAS ANUGERAH SEMESTA | 1 | 1 | pupuk |
| 1674 | TOKYO DELAPAN INDONESIA | 1 | 1 | pupuk |
| 1675 | ALAMO GREENLIFE INTERNATIONAL | 1 | 1 | pupuk |
| 1676 | INOVASI NAGA LAUT BIRU | 1 | 1 | pupuk |
| 1677 | RICH DIGITAL NATURE | 1 | 1 | pupuk |
| 1678 | MOZAIKS JAYA MAKMUR | 1 | 1 | pupuk |
| 1679 | BERKAH FIQRI KERINCI | 1 | 1 | pupuk |
| 1680 | AGRO MUSTIKA ABADI | 1 | 1 | pupuk |
| 1681 | DAESANG INGREDIENTS INDONESIA | 1 | 1 | pupuk |
| 1682 | DEDANDU UTAMA | 1 | 1 | pupuk |
| 1683 | PADI DAMAI BALI | 1 | 1 | pupuk |
| 1684 | INOVASI TANI ALHIDAYAH GORONTALO | 1 | 1 | pupuk |
| 1685 | OMYA DISTRIBUTION INDONESIA | 1 | 1 | pupuk |
| 1686 | SARI JAYA AGRO | 1 | 1 | pupuk |
| 1687 | BADAN USAHA MILIK PETANI (BUMP) PT. PENGAYOM TANI SEJAGAD | 1 | 1 | pupuk |
| 1688 | IJO INOVASI INDONESIA | 1 | 1 | pupuk |
| 1689 | MITRA SABDA | 1 | 1 | pupuk |
| 1690 | AKHTARINDO CHEMICAL SPECIALIST | 1 | 1 | pupuk |
| 1691 | GLOBAL NUTRI AGRINUSA | 1 | 1 | pupuk |
| 1692 | CV. BERKAH MAKMUR NUSANTARA | 1 | 1 | pupuk |
| 1693 | BUMI ASIH LELUHUR | 1 | 1 | pupuk |
| 1694 | PT. TANCIMAS WISIN JAYA | 1 | 1 | pupuk |
| 1695 | AGRO UNGGUL | 1 | 1 | pupuk |
| 1696 | AGAR SARI JAYA | 1 | 1 | pupuk |
| 1697 | KOPERASI KONSUMEN KSM SEHAT SEJAHTERA | 1 | 1 | pupuk |
| 1698 | TOMATEC INDONESIA | 1 | 1 | pupuk |
| 1699 | TRINITY MULTI | 1 | 1 | pupuk |
| 1700 | BUMI NOTO ROGO | 1 | 1 | pupuk |
| 1701 | CV BINA AGRO JAYA MAKMUR | 1 | 1 | pupuk |
| 1702 | SINAR MUTIARA GRESIK | 1 | 1 | pupuk |
| 1703 | SUMBER INTI CEMERLANG | 1 | 1 | pupuk |
| 1704 | ALAM PERKASA JAYA | 1 | 1 | pupuk |
| 1705 | PT.CITRA GIZEL MANDIRI | 1 | 1 | pupuk |
| 1706 | JASA TANI SUBUR | 1 | 1 | pupuk |
| 1707 | CAHAYA BARU | 1 | 1 | pupuk |
| 1708 | BUMI ALAM JATI | 1 | 1 | pupuk |
| 1709 | ADHIESTA NUGRAHA | 1 | 1 | pupuk |
| 1710 | CV. Maju Dua Sahabat | 1 | 1 | pupuk |
| 1711 | NUVALA MAKMUR SEJAHTERA | 1 | 1 | pupuk |
| 1712 | ARTHA MUARA FERTILIZER | 1 | 1 | pupuk |
| 1713 | CV. Mandiri Massadidu | 1 | 1 | pupuk |
| 1714 | PLANET CHEMICALS | 1 | 1 | pupuk |
| 1715 | ANUGRAH TUNAS MANDIRI | 1 | 1 | pupuk |
| 1716 | INSAN TANI MANDIRI | 1 | 1 | pupuk |
| 1717 | NOGYO ALAM SWASTIKA | 1 | 1 | pupuk |
| 1718 | PT. DUWIPA AGRO PERSADA | 1 | 1 | pupuk |
| 1719 | KARYA KOMPOS ORGANIK | 1 | 1 | pupuk |
| 1720 | MANDALA AGRO MAKMUR | 1 | 1 | pupuk |
| 1721 | CV. INDOZEZAR | 1 | 1 | pupuk |
| 1722 | MUTIARA TIMUR GRESIK | 1 | 1 | pupuk |
| 1723 | PT Pupuk Agung Sentosa | 1 | 1 | pupuk |
| 1724 | SAMRSAR | 1 | 1 | pupuk |
| 1725 | THIA ORGANIK | 1 | 1 | pupuk |
| 1726 | KARWALIP ROCHIS INDONESIA | 1 | 1 | pupuk |
| 1727 | BINANGUN GEMILANG SEMBADA | 1 | 1 | pupuk |
| 1728 | SAMBONG PUTRA MARGO UTOMO | 1 | 1 | pupuk |
| 1729 | NUSANTARA AGRO HAYATI | 1 | 1 | pupuk |
| 1730 | MAS LESTARI INDONESIA | 1 | 1 | pupuk |
| 1731 | TANIRA YASA UTAMA | 1 | 1 | pupuk |
| 1732 | AGRO MAKMUR BERSAMA | 1 | 1 | pupuk |
| 1733 | WULAN PUPUK INDONESIA | 1 | 1 | pupuk |
| 1734 | ENNO CORPORATION | 1 | 1 | pupuk |
| 1735 | ARGA TANI MANDIRI | 1 | 1 | pupuk |
| 1736 | CARIU AGRO NATURA | 1 | 1 | pupuk |
| 1737 | RAJA BORNEO FARM | 1 | 1 | pupuk |
| 1738 | MINERINDO TRIFABUANA | 1 | 1 | pupuk |
| 1739 | LUAS ARUNG SEJAHTERA | 1 | 1 | pupuk |
| 1740 | MITRA TANI MAKMUR | 1 | 1 | pupuk |
| 1741 | PT SURYA JAYA PRAKARSA SELARAS | 1 | 1 | pupuk |
| 1742 | WAHANA ALAM INDONESIA | 1 | 1 | pupuk |
| 1743 | CV. MEISA ADELIA PRIMA PRO | 1 | 1 | pupuk |
| 1744 | SUKA BUMI LESTARI | 1 | 1 | pupuk |
| 1745 | PATAQU USAHA EXELEN | 1 | 1 | pupuk |
| 1746 | ANISA AGRO LESTARI | 1 | 1 | pupuk |
| 1747 | KITA TUMBUH SUBUR | 1 | 1 | pupuk |
| 1748 | PT. Bahra Eco Semesta Tani | 1 | 1 | pupuk |
| 1749 | UNIVERSAL BIOGRO AGRO | 1 | 1 | pupuk |
| 1750 | DIENG AGRO VANJAVA | 1 | 1 | pupuk |
| 1751 | BUMI SUBUR UTAMA | 1 | 1 | pupuk |
| 1752 | RAHMAD JAYA SANTOSO | 1 | 1 | pupuk |
| 1753 | CV. Baraya Maju Bersama | 1 | 1 | pupuk |
| 1754 | PANCARAN DARMA FARMINDO | 1 | 1 | pupuk |
| 1755 | MARGO UTOMO MULYO | 1 | 1 | pupuk |
| 1756 | PT. LINGGA HSB ABADI | 1 | 1 | pupuk |
| 1757 | PT. KAPUR PUTIH LAMPUNG | 1 | 1 | pupuk |
| 1758 | KERAMBITAN AGRO | 1 | 1 | pupuk |
| 1759 | SORIK ANGKOLA SINERGI | 1 | 1 | pupuk |
| 1760 | SUWARNADWIPA GREEN FERTILIZER | 1 | 1 | pupuk |
| 1761 | MULIA SUKSES ABADI SENTOSA | 1 | 1 | pupuk |
| 1762 | PT. ARYA SUPRA NUGRAHA | 1 | 1 | pupuk |
| 1763 | EKADWI SELO UNGGUL | 1 | 1 | pupuk |
| 1764 | CV. KANA MAKMUR | 1 | 1 | pupuk |
| 1765 | AGROBION SEJAHTERA | 1 | 1 | pupuk |
| 1766 | SEKAWAN JAYA BESTINDO | 1 | 1 | pupuk |
| 1767 | NATURAL EVERGREEN ORGANIK | 1 | 1 | pupuk |
| 1768 | DINAR MULIA LESTARI | 1 | 1 | pupuk |
| 1769 | PT. Amory Multi Quality | 1 | 1 | pupuk |
| 1770 | PT JAVA MINING FERTILIZO | 1 | 1 | pupuk |
| 1771 | TUMBUH SUBUR MAKMUR | 1 | 1 | pupuk |
| 1772 | SUBUR INDO AMERTA | 1 | 1 | pupuk |
| 1773 | BENGKEL MIMPI NUSANTARA | 1 | 1 | pupuk |
| 1774 | PT. SEKAWAN MAJU BERSAMA PRIMA | 1 | 1 | pupuk |
| 1775 | SAKTI BERJAYA | 1 | 1 | pupuk |
| 1776 | PT. Pupor Sejahtera Makmur | 1 | 1 | pupuk |
| 1777 | MANDRAGUNA PUSAKA INDONESIA | 1 | 1 | pupuk |
| 1778 | CV. AGRO BIO ORGANIK | 1 | 1 | pupuk |
| 1779 | ANTARES MULTI ENERGI | 1 | 1 | pupuk |
| 1780 | REZKY BERSAUDARA | 1 | 1 | pupuk |
| 1781 | KAMPAR SYNERGI ABADI | 1 | 1 | pupuk |
| 1782 | SINAR AGRI UTAMA | 1 | 1 | pupuk |
| 1783 | PT. Berkah Indonesiaraya Sukses | 1 | 1 | pupuk |
| 1784 | TOBA AGRO CHEMICAL | 1 | 1 | pupuk |
| 1785 | AGRIVEST ALAM ASIA | 1 | 1 | pupuk |
| 1786 | LAKSMANA MULIA SENTOSA | 1 | 1 | pupuk |
| 1787 | PT. VIBEST SUKSES ABADI | 1 | 1 | pupuk |
| 1788 | MUSTIKA TANAH NUSANTARA | 1 | 1 | pupuk |
| 1789 | AJE PRATAMA GEMILANG | 1 | 1 | pupuk |
| 1790 | AGROSINDO UTAMA | 1 | 1 | pupuk |
| 1791 | CV. DUTA MAS PADJADJARAN | 1 | 1 | pupuk |
| 1792 | RESEP MAKMUR JAYA | 1 | 1 | pupuk |
| 1793 | CAHYA TANI INDONESIA | 1 | 1 | pupuk |
| 1794 | PUTRA PATIKALA MAJU | 1 | 1 | pupuk |
| 1795 | PETRO PUPUK KIMIA | 1 | 1 | pupuk |
| 1796 | ANGSA MAS JAYA | 1 | 1 | pupuk |
| 1797 | PT. MANDALA PRATAMA NUSANTARA | 1 | 1 | pupuk |
| 1798 | TRUBUS SWADAYA | 1 | 1 | pupuk |
| 1799 | ARFADA TIGAPUTRA BUDIWIBOWO | 1 | 1 | pupuk |
| 1800 | AZKA MANDIRI | 1 | 1 | pupuk |
| 1801 | ST. MANDIRI | 1 | 1 | pupuk |
| 1802 | CV. SURYA INDAH MULIA | 1 | 1 | pupuk |
| 1803 | CV . Berkah Tani Mandiri | 1 | 1 | pupuk |
| 1804 | TRIJAVA MAJU BERSAMA | 1 | 1 | pupuk |
| 1805 | BINA TANI MULIA | 1 | 1 | pupuk |
| 1806 | BERKAH TANI PERKASA | 1 | 1 | pupuk |
| 1807 | GOPIN TEGAR ABADI | 1 | 1 | pupuk |
| 1808 | BAWANA INDO UNIVERSAL | 1 | 1 | pupuk |
| 1809 | PT. Bilquis Jaya Perkasa | 1 | 1 | pupuk |
| 1810 | ECONOVA PRIMA INTERNATIONAL | 1 | 1 | pupuk |
| 1811 | GLORIENTA MINERAL PERKASA | 1 | 1 | pupuk |
| 1812 | MARIO MARAJA | 1 | 1 | pupuk |
| 1813 | AGRARIA SENTOSA NUSANTARA | 1 | 1 | pupuk |
| 1814 | ERAKARYA PUPUK LESTARI | 1 | 1 | pupuk |
| 1815 | BIO DEMETER SUBUR BERKAH | 1 | 1 | pupuk |
| 1816 | AMINDOWAY JAYA | 1 | 1 | pupuk |
| 1817 | PT. TEKNO INOVASI ASIA | 1 | 1 | pupuk |
| 1818 | MAJULAH SOLUSI PARAGON | 1 | 1 | pupuk |
| 1819 | PASCAL BIOTECH INDONESIA | 1 | 1 | pupuk |
| 1820 | PT. Dewi Samudra Bumi Makmur | 1 | 1 | pupuk |
| 1821 | GANCARGEMILANG JAYASAKTI | 1 | 1 | pupuk |
| 1822 | INOVASI JAYA ORGANIK | 1 | 1 | pupuk |
| 1823 | LESAFFRE SARI NUSA | 1 | 1 | pupuk |
| 1824 | PUTRA ANANDIRI | 1 | 1 | pupuk |
| 1825 | MITRA AGRONIAGA NUSANTARA | 1 | 1 | pupuk |
| 1826 | TION AGRO NUSANTARA | 1 | 1 | pupuk |
| 1827 | ARTHA TANI UNGGUL | 1 | 1 | pupuk |
| 1828 | POESRI RAYA | 1 | 1 | pupuk |
| 1829 | PT. SINAR MAKMUR ORGANIK | 1 | 1 | pupuk |
| 1830 | SETIA AGUNG SINERGI | 1 | 1 | pupuk |
| 1831 | KIMIA KARYANUSA CARAKA | 1 | 1 | pupuk |
| 1832 | PT. WAHANA MAKMUR BERSAMA | 1 | 1 | pupuk |
| 1833 | BERNIAGA SINERGI NUSANTARA | 1 | 1 | pupuk |
| 1834 | BERDI ORGANIK INTERNASIONAL | 1 | 1 | pupuk |
| 1835 | GOLDEN PLANTER INDONESIA | 1 | 1 | pupuk |
| 1836 | MASARO SENTRA MAKMUR | 1 | 1 | pupuk |
| 1837 | TUAH INDATU | 1 | 1 | pupuk |
| 1838 | LENTERA WIJAYA | 1 | 1 | pupuk |
| 1839 | PONDOK PESANTREN ASSALAFIE | 1 | 1 | pupuk |
| 1840 | CENTRAL INDO PRIMA GROUP | 1 | 1 | pupuk |
| 1841 | MULIA AGRO HAYATI | 1 | 1 | pupuk |
| 1842 | CV. AGRO MITRA SEJAHTERA | 1 | 1 | pupuk |
| 1843 | HAYATI FORTUNA INDONESIA | 1 | 1 | pupuk |
| 1844 | PUPUK SUBURKAN NEGERI | 1 | 1 | pupuk |
| 1845 | CV SUNDAG AGRO FERTILIZER | 1 | 1 | pupuk |
| 1846 | KSM SEHAT SEJAHTERA | 1 | 1 | pupuk |
| 1847 | MUTIARA MAS | 1 | 1 | pupuk |
| 1848 | DWI AGRO MANUNGGAL | 1 | 1 | pupuk |
| 1849 | WAHANA ORGANIK MULIAJAYA | 1 | 1 | pupuk |
| 1850 | ORSINIL INDO MITRA PATEN | 1 | 1 | pupuk |
| 1851 | JAVA AGRO SEMESTA | 1 | 1 | pupuk |
| 1852 | BIOPOR SINERGY NUSANTARA | 1 | 1 | pupuk |
| 1853 | UDKHABI BUN NAJAR | 1 | 1 | pupuk |
| 1854 | KOPERASI JASA PUSLIT KELAPA SAWIT | 1 | 1 | pupuk |
| 1855 | KURNIA AGRO LESTARI | 1 | 1 | pupuk |
| 1856 | RASYA RIZKI PRATAMA PHD | 1 | 1 | pupuk |
| 1857 | RAMIN MINERAL JAYA | 1 | 1 | pupuk |
| 1858 | ACE BIO CARE | 1 | 1 | pupuk |
| 1859 | SALIMAS CITRA KENCANA | 1 | 1 | pupuk |
| 1860 | PT. BAHAGIA JAYA INDO | 1 | 1 | pupuk |
| 1861 | PT. Sinar Deli Mandiri | 1 | 1 | pupuk |
| 1862 | JAGAD SUMBER MAKMUR | 1 | 1 | pupuk |
| 1863 | GERDU GENENG SIDAYU | 1 | 1 | pupuk |
| 1864 | POWER NIAGA SUKSES | 1 | 1 | pupuk |
| 1865 | MITRA TANI SEMESTA | 1 | 1 | pupuk |
| 1866 | PT. SEMERU JAYA GEMILANG | 1 | 1 | pupuk |
| 1867 | CV. Semangat Baru Agro | 1 | 1 | pupuk |
| 1868 | SINAR AGRO MULTIHARA | 1 | 1 | pupuk |
| 1869 | MIKHA TANINDO MAKMUR | 1 | 1 | pupuk |
| 1870 | PUPUK KARYA POLOWIJO | 1 | 1 | pupuk |
| 1871 | BERKAT HIJAU SUBUR MELIMPAH | 1 | 1 | pupuk |
| 1872 | SANYO TRADING INDONESIA | 1 | 1 | pupuk |
| 1873 | MAKMUR AGRISARANA | 1 | 1 | pupuk |
| 1874 | AGRO ANDALAS JAYA | 1 | 1 | pupuk |
| 1875 | PT BERKAH MANDIRI SEJATI | 1 | 1 | pupuk |
| 1876 | SUBU GREEN INDONESIA | 1 | 1 | pupuk |
| 1877 | CV. MANDIRI PANGAN SEJAHTERA | 1 | 1 | pupuk-legacy |
| 1878 | CV.TRI MULTI DAYA. | 1 | 1 | pupuk-legacy |
| 1879 | PT. AGRO BIO KEMINDO | 1 | 1 | pupuk-legacy |
| 1880 | PT PALMARIN AGRO INDONESIA | 1 | 1 | pupuk-legacy |
| 1881 | PT Kertopaten Agro Sejahtera | 1 | 1 | pupuk-legacy |
| 1882 | PT BIOZYM PRATAMA | 1 | 1 | pupuk-legacy |
| 1883 | PT. Mega Tri Utama | 1 | 1 | pupuk-legacy |
| 1884 | PT. Agro Max Asia | 1 | 1 | pupuk-legacy |
| 1885 | PT BIO PLANMATE INDONESIA | 1 | 1 | pupuk-legacy |
| 1886 | CV. AGRO BISNIS INDONESIA | 1 | 1 | pupuk-legacy |
| 1887 | PT Ambagiri Nusantara | 1 | 1 | pupuk-legacy |
| 1888 | PT. DRAGON PUPUK INDONESIA | 1 | 1 | pupuk-legacy |
| 1889 | PT.Sumberaya Kendimasindo | 1 | 1 | pupuk-legacy |
| 1890 | CV. Sinar Agung | 1 | 1 | pupuk-legacy |
| 1891 | PT. MITOKU SUKSES MAKMUR | 1 | 1 | pupuk-legacy |
| 1892 | PT Lautan Luas Tbk | 1 | 1 | pupuk-legacy |
| 1893 | PT. Biotrack Technology Indonesia | 1 | 1 | pupuk-legacy |
| 1894 | PT PRIMA AGRO MANDIRI | 1 | 1 | pupuk-legacy |
| 1895 | PT DOBEL F JAYA | 1 | 1 | pupuk-legacy |
| 1896 | CV. HERBASARI | 1 | 1 | pupuk-legacy |
| 1897 | CV. Tani Hijau LestariI | 1 | 1 | pupuk-legacy |
| 1898 | PT.NOVELVAR | 1 | 1 | pupuk-legacy |
| 1899 | CV. Rahayu | 1 | 1 | pupuk-legacy |
| 1900 | PT. Kamar Maeso Harapan | 1 | 1 | pupuk-legacy |
| 1901 | PT NUTRIMAS AGRO INDONESIA | 1 | 1 | pupuk-legacy |
| 1902 | CV. SURYA TANI TIMUR SANTOSA | 1 | 1 | pupuk-legacy |
| 1903 | UD. Primaagro | 1 | 1 | pupuk-legacy |
| 1904 | Ud.sarana tani utama | 1 | 1 | pupuk-legacy |
| 1905 | PT Arindo Utama Perkasa | 1 | 1 | pupuk-legacy |
| 1906 | CV. Tresno Bumi Lestari | 1 | 1 | pupuk-legacy |
| 1907 | CV. Mega Organofertlizer | 1 | 1 | pupuk-legacy |
| 1908 | PT. JNS Sejahtera Bersama | 1 | 1 | pupuk-legacy |
| 1909 | CV MULTIAGRO SARANA CEMERLANG | 1 | 1 | pupuk-legacy |
| 1910 | CV. SASANDO | 1 | 1 | pupuk-legacy |
| 1911 | PT. DAMAI AGRO MANDIRI | 1 | 1 | pupuk-legacy |
| 1912 | PT. ENDRA TANI MAKMUR | 1 | 1 | pupuk-legacy |
| 1913 | CV. Tunggal Tri Panca | 1 | 1 | pupuk-legacy |
| 1914 | CV SUKA AYU BIONITRAT | 1 | 1 | pupuk-legacy |
| 1915 | CV. Jago Jasa | 1 | 1 | pupuk-legacy |
| 1916 | PT. Harvest Ariake Indonesia | 1 | 1 | pupuk-legacy |
| 1917 | PT PUPUK NUTRIFIT INDONESIA | 1 | 1 | pupuk-legacy |
| 1918 | U.D Daun Mas | 1 | 1 | pupuk-legacy |
| 1919 | PT.Silva Tropika Kultura | 1 | 1 | pupuk-legacy |
| 1920 | PT. PERKEBUNAN NUSANTARA XI | 1 | 1 | pupuk-legacy |
| 1921 | PT.BUMI TANI INDONESIA SEJAHTERA | 1 | 1 | pupuk-legacy |
| 1922 | PT Dwitama Agro Makmur | 1 | 1 | pupuk-legacy |
| 1923 | PT.Surya Agung Unggul | 1 | 1 | pupuk-legacy |
| 1924 | PT. UMG INDONESIA | 1 | 1 | pupuk-legacy |
| 1925 | CV. CIPTO LANGGENG | 1 | 1 | pupuk-legacy |
| 1926 | CV MEGAH JAYA SEVENTIES | 1 | 1 | pupuk-legacy |
| 1927 | PT ELKABE BIOTEK INDONESIA | 1 | 1 | pupuk-legacy |
| 1928 | CV. Mutiara Agro Persada | 1 | 1 | pupuk-legacy |
| 1929 | PT.Greenland Agrotech Industries | 1 | 1 | pupuk-legacy |
| 1930 | PT CROP CHECK INDONESIA | 1 | 1 | pupuk-legacy |
| 1931 | CV. Agro Lestari | 1 | 1 | pupuk-legacy |
| 1932 | CV. PANTRAS AGROLESTRI | 1 | 1 | pupuk-legacy |
| 1933 | KOPERASI KARYAWAN RISPA MEDAN | 1 | 1 | pupuk-legacy |
| 1934 | CV. Duta Oreza Indonesia | 1 | 1 | pupuk-legacy |
| 1935 | PT. AGRO PARKIM INDONESIA | 1 | 1 | pupuk-legacy |
| 1936 | CV. Agro Sumber Subur | 1 | 1 | pupuk-legacy |
| 1937 | PT. INDUSTRI JAMU DAN FARMASI SIDO MUNCUL | 1 | 1 | pupuk-legacy |
| 1938 | CV RAJAWALI USAHA NABATI | 1 | 1 | pupuk-legacy |
| 1939 | CV. TERUS JAYA PUTRA | 1 | 1 | pupuk-legacy |
| 1940 | CV Karsa Jaya | 1 | 1 | pupuk-legacy |
| 1941 | PT. Shiraishi Calcium Indonesia | 1 | 1 | pupuk-legacy |
| 1942 | CV. Citra Berlian | 1 | 1 | pupuk-legacy |
| 1943 | CV. PATIH GAJAH MADA | 1 | 1 | pupuk-legacy |
| 1944 | CV. CONS PRIMA SENTOSA | 1 | 1 | pupuk-legacy |
| 1945 | PT. INDOBAY BIO | 1 | 1 | pupuk-legacy |
| 1946 | CV. TUNAS HARAPAN | 1 | 1 | pupuk-legacy |
| 1947 | CV. Multi Guna | 1 | 1 | pupuk-legacy |
| 1948 | CV. Fian Agro Industri | 1 | 1 | pupuk-legacy |
