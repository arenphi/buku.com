// Data Pengguna (Untuk Login Demo)
var dataPengguna = [{
    id: 1,
    nama: "Mahasiswa Demo",
    email: "mahasiswa@example.com", // Kredensial demo sesuai soal
    password: "password123", // Kredensial demo sesuai soal
    role: "User",
}];

// Data Katalog Buku dengan path gambar baru
// PASTIKAN SEMUA FILE GAMBAR BERADA DI FOLDER assets/img/
var dataKatalogBuku = [{
        kodeBarang: "ASIP4301",
        namaBarang: "Pengantar Ilmu Komunikasi",
        jenisBarang: "Buku Ajar",
        edisi: "2",
        stok: 548,
        harga: 180000,
        cover: "assets/img/pengantar_komunikasi.jpg"
    },
    {
        kodeBarang: "EKMA4002",
        namaBarang: "Manajemen Keuangan",
        jenisBarang: "Buku Ajar",
        edisi: "3",
        stok: 392,
        harga: 220000,
        cover: "assets/img/manajemen_keuangan.jpg"
    },
    {
        kodeBarang: "PAUD4203",
        namaBarang: "Perkembangan Anak",
        jenisBarang: "Buku Ajar",
        edisi: "1",
        stok: 120,
        harga: 150000,
        cover: "assets/img/paud_perkembangan.jpg"
    },
    {
        kodeBarang: "ISIP4213",
        namaBarang: "Kepemimpinan",
        jenisBarang: "Buku Ajar",
        edisi: "4",
        stok: 210,
        harga: 175000,
        cover: "assets/img/kepemimpinan.jpg"
    },
    {
        kodeBarang: "BIOL4442",
        namaBarang: "Mikrobiologi",
        jenisBarang: "Buku Ajar",
        edisi: "2",
        stok: 50,
        harga: 250000,
        cover: "assets/img/mikrobiologi.jpg"
    }
];

// Data Sample Delivery Order (DO)
const sampleOrders = [
    { do: "DO001", nama: "Budi Santoso", status: "Dalam pengiriman", ekspedisi: "JNE", tgl: "2025-10-28", paket: "Reguler", total: 250000 },
    { do: "DO002", nama: "Siti Aminah", status: "Dikirim", ekspedisi: "TIKI", tgl: "2025-10-25", paket: "Express", total: 175000 },
    { do: "DO003", nama: "Agus Wiranata", status: "Diterima", ekspedisi: "SiCepat", tgl: "2025-10-20", paket: "Reguler", total: 420000 }
];