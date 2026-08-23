// OCR memakai Vision.framework bawaan macOS. Dipakai penarik harga TBS Kaltim dan Babel,
// yang menerbitkan penetapannya sebagai JPEG desain dan PNG selebaran.
//
//   swift harga_data/ocr-vision.swift berkas1.jpg berkas2.png …
//
// Keluarannya JSON ke stdout: satu objek per berkas, berisi baris teks beserta kotak
// batasnya dan keyakinan pengenalan.
//
// KENAPA VISION, BUKAN TESSERACT
// Bukan pilihan gaya: tesseract tidak terpasang di mesin ini dan memasangnya menambah
// dependensi sistem untuk alat yang dijalankan sebulan sekali. Vision sudah ada di setiap
// macOS, tidak menambah apa pun ke repositori, dan pada teks infografik yang bersih — yang
// persis bentuk terbitan Kaltim dan Babel — ia lebih akurat daripada tesseract tanpa
// penyetelan. Konsekuensinya alat ini HANYA berjalan di macOS, dan itu dinyatakan alih-alih
// ditemukan sendiri oleh yang menjalankannya di tempat lain.
//
// KOTAK BATAS IKUT DIKELUARKAN, DAN ITU BUKAN HIASAN
// Tabel harga di selebaran tersusun berkolom. Teks yang dibaca berurutan kehilangan
// susunannya — "3" dan "Rp2.409" bisa terpisah sepuluh baris di aliran bacaan padahal
// bersebelahan di gambar. Kotak batasnya yang mengembalikan susunan itu, sehingga pengurai
// bisa memasangkan umur dengan harganya menurut LETAK, bukan menurut urutan.
//
// KEYAKINAN JUGA IKUT. Angka rupiah yang dikenali dengan keyakinan rendah adalah persis
// tempat OCR menukar 3 dengan 8, atau 1 dengan 7. Yang memakainya berhak menyaring.

import Foundation
import Vision
import AppKit
import PDFKit

struct Baris: Codable {
    let teks: String
    let keyakinan: Float
    // Kotak batas dalam koordinat ternormalkan Vision: asal di kiri-BAWAH, 0…1.
    let x: Double
    let y: Double
    let lebar: Double
    let tinggi: Double
}

struct Hasil: Codable {
    let berkas: String
    let lebarPiksel: Int
    let tinggiPiksel: Int
    let baris: [Baris]
    let galat: String?
    // `lapisTeks` bila isinya diambil dari lapisan teks PDF, `ocr` bila dari pengenalan
    // gambar. Yang memakainya berhak tahu bedanya: lapisan teks tepat sampai karakter
    // terakhir, sedangkan OCR menukar 3 dengan 8 sesekali dan tidak pernah mengaku.
    let asal: String
}

// Sebagian penetapan terbit sebagai PDF, dan sebagiannya lagi PDF itu SUDAH BERLAPIS TEKS —
// entah born-digital, entah hasil OCR pihak lain. Memeriksa lapisan itu lebih dulu bukan
// sekadar penghematan: teks yang sudah ada tepat sampai karakter terakhir, sedangkan
// meng-OCR ulang halaman yang sudah punya teks berarti membuang ketepatan yang sudah dimiliki.
//
// Tetapi lapisan teks TIDAK otomatis lebih baik. Babel menerbitkan PDF berlapis teks hasil
// OCR yang rusak — "Pefiardoran", "ProyirEi" — dan di sana meng-OCR ulang gambarnya justru
// benar. Karena itu keputusannya tidak diambil di sini: kedua-duanya dilaporkan lewat medan
// `asal`, dan yang memanggil yang memutuskan mana yang dipakai.
func dariLapisTeks(_ jalur: String) -> Hasil? {
    guard let dok = PDFDocument(url: URL(fileURLWithPath: jalur)), dok.pageCount > 0 else { return nil }
    var baris: [Baris] = []
    for i in 0..<dok.pageCount {
        guard let hal = dok.page(at: i), let teks = hal.string else { continue }
        for potong in teks.split(whereSeparator: \.isNewline) {
            let t = potong.trimmingCharacters(in: .whitespaces)
            if !t.isEmpty { baris.append(Baris(teks: t, keyakinan: 1, x: 0, y: 0, lebar: 0, tinggi: 0)) }
        }
    }
    guard baris.count >= 3 else { return nil }
    let kotak = dok.page(at: 0)?.bounds(for: .mediaBox) ?? .zero
    return Hasil(berkas: jalur, lebarPiksel: Int(kotak.width), tinggiPiksel: Int(kotak.height),
                 baris: baris, galat: nil, asal: "lapisTeks")
}

// Halaman PDF dirasterkan sendiri karena NSImage memuat PDF sebagai gambar vektor yang
// `cgImage(forProposedRect:)`-nya menolak. 200 dpi: cukup untuk digit rupiah pada selebaran,
// dan tidak membengkakkan memori untuk berkas yang ratusan jumlahnya.
func rasterPdf(_ jalur: String) -> CGImage? {
    guard let dok = PDFDocument(url: URL(fileURLWithPath: jalur)), let hal = dok.page(at: 0) else { return nil }
    let kotak = hal.bounds(for: .mediaBox)
    let skala: CGFloat = 200.0 / 72.0
    let w = Int(kotak.width * skala), h = Int(kotak.height * skala)
    guard w > 0, h > 0,
          let ruang = CGColorSpace(name: CGColorSpace.sRGB),
          let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8,
                              bytesPerRow: 0, space: ruang,
                              bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else { return nil }
    ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
    ctx.fill(CGRect(x: 0, y: 0, width: w, height: h))
    ctx.scaleBy(x: skala, y: skala)
    ctx.translateBy(x: -kotak.origin.x, y: -kotak.origin.y)
    hal.draw(with: .mediaBox, to: ctx)
    return ctx.makeImage()
}

func ocr(_ jalur: String) -> Hasil {
    let adalahPdf = jalur.lowercased().hasSuffix(".pdf")
        || (try? Data(contentsOf: URL(fileURLWithPath: jalur), options: .mappedIfSafe).prefix(4)) == Data("%PDF".utf8)

    // Lapisan teks diperiksa lebih dulu bila berkasnya PDF — lihat catatan di dariLapisTeks.
    if adalahPdf, let lapis = dariLapisTeks(jalur) { return lapis }

    let cgOpsional: CGImage? = adalahPdf
        ? rasterPdf(jalur)
        : NSImage(contentsOfFile: jalur)?.cgImage(forProposedRect: nil, context: nil, hints: nil)

    guard let cg = cgOpsional else {
        return Hasil(berkas: jalur, lebarPiksel: 0, tinggiPiksel: 0, baris: [],
                     galat: adalahPdf ? "PDF gagal dirasterkan" : "berkas tidak terbaca sebagai gambar",
                     asal: "gagal")
    }

    let permintaan = VNRecognizeTextRequest()
    // `accurate` bukan `fast`: yang dibaca angka rupiah, dan satu digit tertukar mengubah
    // harga sepuluh kali lipat. Waktu tambahannya tidak berarti untuk alat sebulan sekali.
    permintaan.recognitionLevel = .accurate
    permintaan.usesLanguageCorrection = false  // koreksi bahasa merusak angka dan singkatan
    permintaan.recognitionLanguages = ["id-ID", "en-US"]

    let penangan = VNImageRequestHandler(cgImage: cg, options: [:])
    do {
        try penangan.perform([permintaan])
    } catch {
        return Hasil(berkas: jalur, lebarPiksel: cg.width, tinggiPiksel: cg.height, baris: [],
                     galat: "Vision gagal: \(error.localizedDescription)", asal: "gagal")
    }

    let baris: [Baris] = (permintaan.results ?? []).compactMap { amatan in
        guard let atas = amatan.topCandidates(1).first else { return nil }
        let k = amatan.boundingBox
        return Baris(teks: atas.string, keyakinan: atas.confidence,
                     x: Double(k.origin.x), y: Double(k.origin.y),
                     lebar: Double(k.width), tinggi: Double(k.height))
    }
    return Hasil(berkas: jalur, lebarPiksel: cg.width, tinggiPiksel: cg.height,
                 baris: baris, galat: nil, asal: "ocr")
}

let berkas = Array(CommandLine.arguments.dropFirst())
if berkas.isEmpty {
    FileHandle.standardError.write("pakai: swift ocr-vision.swift <gambar>…\n".data(using: .utf8)!)
    exit(2)
}

let semua = berkas.map(ocr)
let enc = JSONEncoder()
enc.outputFormatting = [.sortedKeys]
if let data = try? enc.encode(semua), let s = String(data: data, encoding: .utf8) {
    print(s)
} else {
    FileHandle.standardError.write("gagal menyusun JSON\n".data(using: .utf8)!)
    exit(1)
}
