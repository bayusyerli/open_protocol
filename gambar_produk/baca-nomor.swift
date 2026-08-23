// Membaca teks dari gambar kemasan/brosur dengan Vision milik macOS, supaya nomor
// pendaftaran tidak perlu dibaca mata satu per satu.
//
//   swiftc -O baca-nomor.swift -o baca-nomor
//   ./baca-nomor brosur/*.jpg > teks.tsv
//
// Keluaran TSV dua kolom: FILE <path>, lalu TXT <baris> untuk tiap baris teks.
//
// KENAPA INI SAH DIPAKAI, PADAHAL PASAL 4b MELARANG MENEBAK NOMOR
// Yang dilarang menanam tebakan sebagai fakta. OCR di sini tidak pernah jadi fakta
// sendirian: tiap nomor yang keluar WAJIB dicocokkan ke registri lebih dulu, dan
// pencocokan itulah yang menyaringnya. Salah baca satu digit membuat nomornya tidak
// ketemu — jadi kekeliruan OCR gagal dengan berisik, bukan diam-diam. Diuji pada 56
// brosur katalogcba.com: 52 nomor cocok ke registri DAN ke merek yang dipetakan, 2
// menunjuk merek lain (perlu dilihat mata), 2 kehilangan satu digit sehingga tidak
// ketemu sama sekali. Nol yang lolos salah.
//
// Kenapa Vision dan bukan tesseract: tidak ada mesin OCR terpasang di lingkungan ini,
// sedangkan Vision sudah ada di tiap macOS dan tidak menuntut pemasangan apa pun.
// `usesLanguageCorrection = false` disengaja — koreksi bahasa justru merusak deret
// angka panjang, dan yang dicari di sini justru deret angka.

import Foundation
import Vision
import AppKit

let args = CommandLine.arguments.dropFirst()
for path in args {
    guard let img = NSImage(contentsOfFile: path),
          let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        print("ERR\t\(path)"); continue
    }
    let req = VNRecognizeTextRequest()
    req.recognitionLevel = .accurate
    req.usesLanguageCorrection = false
    req.recognitionLanguages = ["id-ID", "en-US"]
    let handler = VNImageRequestHandler(cgImage: cg, options: [:])
    do { try handler.perform([req]) } catch { print("ERR\t\(path)"); continue }
    let lines = (req.results ?? []).compactMap { $0.topCandidates(1).first?.string }
    print("FILE\t\(path)")
    for l in lines { print("TXT\t\(l)") }
}
