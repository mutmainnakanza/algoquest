export type Direction = 'N' | 'E' | 'S' | 'W';

export type SimpleAction = 'MOVE' | 'LEFT' | 'RIGHT';

export type ProgramBlock =
  | { id: string; type: 'MOVE' }
  | { id: string; type: 'LEFT' }
  | { id: string; type: 'RIGHT' }
  | { id: string; type: 'IF_BLOCKED'; action: SimpleAction }
  | { id: string; type: 'REPEAT'; count: number; children: ProgramBlock[] };

export interface QuizQuestion {
  id: string;
  topic: string;
  prompt: string;
  codeOrFlow?: string;
  flowchartType?: 'decision_x' | 'sequence_swap' | 'rect_area' | 'var_trace' | 'kktp_if' | 'loop_for' | 'loop_while' | 'nested_logic';
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  explanation: string;
}

export interface LogicGate {
  id: string;
  x: number;
  y: number;
  quiz: QuizQuestion;
}

export interface StageConfig {
  id: string;
  levelId: 1 | 2 | 3;
  stageNumber: number;
  title: string;
  objective: string;
  hint: string;
  cols: number;
  rows: number;
  start: { x: number; y: number; dir: Direction };
  finish: { x: number; y: number };
  walls: Array<[number, number]>;
  gates: LogicGate[];
  allowedBlocks: Array<'MOVE' | 'LEFT' | 'RIGHT' | 'IF_BLOCKED' | 'REPEAT'>;
  requireIfBlock?: boolean;
  requireRepeatBlock?: boolean;
  optimalBlockCount: number;
}

export interface LevelMeta {
  id: 1 | 2 | 3;
  name: string;
  subtitle: string;
  concept: string;
  description: string;
  accentColor: string;
}

export interface FlashcardItem {
  id: string;
  category: 'Simbol Flowchart' | 'Konsep Algoritma';
  title: string;
  symbolKey: 'terminator' | 'process' | 'decision' | 'sequencing' | 'selection' | 'looping';
  summary: string;
  details: string[];
  exampleCode: string;
}

export const FLASHCARDS: FlashcardItem[] = [
  {
    id: 'terminator',
    category: 'Simbol Flowchart',
    title: 'Terminator (Mulai / Selesai)',
    symbolKey: 'terminator',
    summary:
      'Berbentuk oval atau kapsul. Simbol ini menandai titik awal (Start) dan titik akhir (End) dari sebuah alur algoritma.',
    details: [
      'Setiap flowchart wajib diawali tepat satu simbol Mulai dan diakhiri simbol Selesai.',
      'Di dalam simbol ini biasanya ditulis kata "Mulai" / "Start" atau "Selesai" / "End".',
      'Hanya memiliki satu garis panah keluar (untuk Start) atau satu panah masuk (untuk End).',
    ],
    exampleCode: 'ALGORITMA Mulai_Program\n  // Titik masuk program\nSELESAI',
  },
  {
    id: 'process',
    category: 'Simbol Flowchart',
    title: 'Proses (Process)',
    symbolKey: 'process',
    summary:
      'Berbentuk persegi panjang. Digunakan untuk menyatakan aksi, pengolahan data, perhitungan matematika, atau pemberian nilai variabel.',
    details: [
      'Contoh isi simbol proses: luas = panjang * lebar atau robot.maju().',
      'Proses dieksekusi oleh komputer secara berurutan sesuai arah panah aliran.',
      'Dapat digunakan berulang kali untuk memecah langkah kerja menjadi terstruktur.',
    ],
    exampleCode: 'x <- 10\ny <- 5\nhasil <- x + y',
  },
  {
    id: 'decision',
    category: 'Simbol Flowchart',
    title: 'Keputusan (Decision)',
    symbolKey: 'decision',
    summary:
      'Berbentuk belah ketupat. Menguji suatu kondisi logika yang menghasilkan dua kemungkinan cabang: Ya (True) atau Tidak (False).',
    details: [
      'Di dalamnya selalu berisi pertanyaan atau ekspresi perbandingan seperti x > 5 atau depanTerhalang == True.',
      'Memiliki tepat 1 panah masuk dan 2 panah keluar berlabel Ya/Benar dan Tidak/Salah.',
      'Menjadi dasar pembuatan percabangan If-Else dan syarat berhenti perulangan.',
    ],
    exampleCode: 'IF (depanTerhalang == TRUE) THEN\n  Belok_Kanan()\nEND IF',
  },
  {
    id: 'sequencing',
    category: 'Konsep Algoritma',
    title: 'Runtunan (Sequencing)',
    symbolKey: 'sequencing',
    summary:
      'Struktur paling dasar di mana setiap instruksi dijalankan satu per satu secara berurutan dari baris pertama hingga terakhir.',
    details: [
      'Urutan perintah sangat menentukan hasil akhir; menukar dua langkah dapat mengubah tujuan.',
      'Setiap langkah hanya dijalankan satu kali tanpa melompati atau mengulang baris.',
      'Cocok untuk alur langkah yang pasti dan lurus dari awal hingga tujuan.',
    ],
    exampleCode: '1. Maju()\n2. Maju()\n3. BelokKiri()\n4. Maju()',
  },
  {
    id: 'selection',
    category: 'Konsep Algoritma',
    title: 'Percabangan (If - Else)',
    symbolKey: 'selection',
    summary:
      'Memungkinkan program memilih jalur eksekusi yang berbeda berdasarkan hasil evaluasi kondisi logika (True atau False).',
    details: [
      'Jika kondisi bernilai True, blok perintah di dalam IF dijalankan.',
      'Jika bernilai False, blok IF dilewati atau program menjalankan blok ELSE.',
      'Gunakan operator perbandingan (>, <, ==, !=) dan logika (&&, ||, !) untuk menyusun syarat.',
    ],
    exampleCode: 'IF (nilai >= 75) THEN\n  Cetak("Tuntas KKTP")\nELSE\n  Cetak("Remedial")\nEND IF',
  },
  {
    id: 'looping',
    category: 'Konsep Algoritma',
    title: 'Perulangan (For / While)',
    symbolKey: 'looping',
    summary:
      'Menjalankan sekelompok instruksi secara berulang-ulang selama syarat terpenuhi atau sebanyak jumlah iterasi tertentu.',
    details: [
      'For / Repeat (N kali) digunakan saat jumlah pengulangan sudah diketahui pasti.',
      'While digunakan saat pengulangan bergantung pada kondisi yang dicek terus-menerus.',
      'Membuat kode program jauh lebih ringkas, rapi, dan bebas duplikasi.',
    ],
    exampleCode: 'FOR i <- 1 TO 4 DO\n  Maju()\nEND FOR',
  },
];

export const LEVELS: LevelMeta[] = [
  {
    id: 1,
    name: 'Level 1: Runtunan',
    subtitle: 'Sequencing',
    concept: 'Urutan Eksekusi & Simbol Dasar',
    description:
      'Bimbing robot melewati koridor sirkuit dengan menyusun instruksi Maju dan Belok secara berurutan dari awal hingga tujuan.',
    accentColor: '#00F5D4',
  },
  {
    id: 2,
    name: 'Level 2: Percabangan',
    subtitle: 'Branching / If-Else',
    concept: 'Sensor Halangan & Ekspresi Logika',
    description:
      'Gunakan blok keputusan If (Depan Terhalang) agar robot mampu mendeteksi tembok dan mengambil jalur belokan yang tepat.',
    accentColor: '#FEE440',
  },
  {
    id: 3,
    name: 'Level 3: Perulangan',
    subtitle: 'Looping (For / While)',
    concept: 'Efisiensi Pola & Gabungan Logika',
    description:
      'Ringkas pola gerakan panjang menggunakan blok Repeat (N kali) serta kombinasikan dengan sensor percabangan untuk menaklukkan labirin akhir.',
    accentColor: '#00F5D4',
  },
];

function buildWallsExcept(cols: number, rows: number, openCells: Array<[number, number]>): Array<[number, number]> {
  const openSet = new Set(openCells.map(([x, y]) => `${x},${y}`));
  const walls: Array<[number, number]> = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!openSet.has(`${x},${y}`)) {
        walls.push([x, y]);
      }
    }
  }
  return walls;
}

export const STAGES: StageConfig[] = [
  // ================= LEVEL 1: RUNTUNAN (5 STAGES) =================
  {
    id: 'L1-S1',
    levelId: 1,
    stageNumber: 1,
    title: 'Langkah Pertama Robot',
    objective: 'Gerakkan robot lurus ke kanan melewati Gerbang Logika menuju portal Finish.',
    hint: 'Susun 4 blok Maju() secara berurutan lalu tekan Jalankan.',
    cols: 5,
    rows: 5,
    start: { x: 0, y: 2, dir: 'E' },
    finish: { x: 4, y: 2 },
    walls: buildWallsExcept(5, 5, [
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2],
      [4, 2],
    ]),
    gates: [
      {
        id: 'G1-1',
        x: 2,
        y: 2,
        quiz: {
          id: 'Q1-1',
          topic: 'Simbol Flowchart',
          prompt: 'Pada sebuah flowchart, simbol berbentuk oval/kapsul (Terminator) berfungsi untuk menandai...',
          flowchartType: 'rect_area',
          options: [
            'A. Titik Mulai (Start) dan Selesai (End) algoritma',
            'B. Pengujian kondisi Ya atau Tidak',
            'C. Proses perhitungan rumus matematika',
          ],
          correctIndex: 0,
          explanation:
            'Simbol Terminator berbentuk oval/kapsul selalu digunakan sebagai penanda awal (Start) dan akhir (End) sebuah flowchart.',
        },
      },
    ],
    allowedBlocks: ['MOVE', 'LEFT', 'RIGHT'],
    optimalBlockCount: 4,
  },
  {
    id: 'L1-S2',
    levelId: 1,
    stageNumber: 2,
    title: 'Belokan Sirkuit Pertama',
    objective: 'Majukan robot hingga ujung lorong, lalu belok ke atas menuju Finish.',
    hint: 'Robot menghadap Timur (kanan). Gunakan Belok Kiri() agar menghadap Utara (atas).',
    cols: 5,
    rows: 5,
    start: { x: 0, y: 4, dir: 'E' },
    finish: { x: 3, y: 1 },
    walls: buildWallsExcept(5, 5, [
      [0, 4],
      [1, 4],
      [2, 4],
      [3, 4],
      [3, 3],
      [3, 2],
      [3, 1],
    ]),
    gates: [
      {
        id: 'G1-2',
        x: 3,
        y: 4,
        quiz: {
          id: 'Q1-2',
          topic: 'Konsep Runtunan',
          prompt: 'Perhatikan pseudocode berikut. Berapa nilai akhir variabel "hasil" setelah semua baris dijalankan berurutan?',
          codeOrFlow: 'a = 5\nb = 3\nhasil = a + b * 2',
          options: ['A. 16', 'B. 11', 'C. 13'],
          correctIndex: 1,
          explanation:
            'Dalam urutan operasi standar pemrograman, perkalian dikerjakan lebih dulu: b * 2 = 3 * 2 = 6, lalu 5 + 6 = 11.',
        },
      },
    ],
    allowedBlocks: ['MOVE', 'LEFT', 'RIGHT'],
    optimalBlockCount: 7,
  },
  {
    id: 'L1-S3',
    levelId: 1,
    stageNumber: 3,
    title: 'Jalur Zig-Zag Lab PPLG',
    objective: 'Navigasi lintasan berbelok dua kali dari kiri bawah hingga kanan tengah.',
    hint: 'Robot mulai menghadap Utara (atas). Maju 2x, Belok Kanan, Maju 2x, Belok Kanan, dst.',
    cols: 6,
    rows: 5,
    start: { x: 0, y: 3, dir: 'N' },
    finish: { x: 5, y: 3 },
    walls: buildWallsExcept(6, 5, [
      [0, 3],
      [0, 2],
      [0, 1],
      [1, 1],
      [2, 1],
      [2, 2],
      [2, 3],
      [3, 3],
      [4, 3],
      [5, 3],
    ]),
    gates: [
      {
        id: 'G1-3',
        x: 2,
        y: 1,
        quiz: {
          id: 'Q1-3',
          topic: 'Membaca Flowchart',
          prompt: 'Jika kita ingin menghitung "luas = panjang * lebar" dalam flowchart, simbol apa yang tepat digunakan?',
          flowchartType: 'rect_area',
          options: [
            'A. Belah Ketupat (Decision)',
            'B. Persegi Panjang (Process)',
            'C. Oval (Terminator)',
          ],
          correctIndex: 1,
          explanation:
            'Perhitungan atau pemberian nilai variabel termasuk operasi pengolahan data, sehingga digambarkan dengan simbol Persegi Panjang (Process).',
        },
      },
    ],
    allowedBlocks: ['MOVE', 'LEFT', 'RIGHT'],
    optimalBlockCount: 12,
  },
  {
    id: 'L1-S4',
    levelId: 1,
    stageNumber: 4,
    title: 'Lorong Berliku Palopo',
    objective: 'Susun runtunan belok kanan dan dua kali belok kiri agar robot mencapai target.',
    hint: 'Perhatikan arah hadap panah di kepala robot sebelum memilih Belok Kiri atau Belok Kanan.',
    cols: 6,
    rows: 6,
    start: { x: 1, y: 5, dir: 'N' },
    finish: { x: 2, y: 1 },
    walls: buildWallsExcept(6, 6, [
      [1, 5],
      [1, 4],
      [1, 3],
      [2, 3],
      [3, 3],
      [4, 3],
      [4, 2],
      [4, 1],
      [3, 1],
      [2, 1],
    ]),
    gates: [
      {
        id: 'G1-4',
        x: 3,
        y: 3,
        quiz: {
          id: 'Q1-4',
          topic: 'Pelacakan Variabel',
          prompt: 'Telusuri runtunan instruksi berikut. Berapakah nilai akhir variabel "x"?',
          codeOrFlow: 'x = 4\ny = x + 3\nx = y * 2',
          options: ['A. 8', 'B. 11', 'C. 14'],
          correctIndex: 2,
          explanation:
            'Langkah 1: x = 4. Langkah 2: y = 4 + 3 = 7. Langkah 3: nilai x diperbarui menjadi 7 * 2 = 14.',
        },
      },
    ],
    allowedBlocks: ['MOVE', 'LEFT', 'RIGHT'],
    optimalBlockCount: 12,
  },
  {
    id: 'L1-S5',
    levelId: 1,
    stageNumber: 5,
    title: 'Misi Gerbang Ganda',
    objective: 'Buka dua Gerbang Logika sekaligus dengan susunan algoritma runtunan yang tepat.',
    hint: 'Jalur: Maju 2x -> Belok Kanan -> Maju 2x -> Belok Kiri -> Maju 3x.',
    cols: 6,
    rows: 6,
    start: { x: 0, y: 1, dir: 'E' },
    finish: { x: 5, y: 3 },
    walls: buildWallsExcept(6, 6, [
      [0, 1],
      [1, 1],
      [2, 1],
      [2, 2],
      [2, 3],
      [3, 3],
      [4, 3],
      [5, 3],
    ]),
    gates: [
      {
        id: 'G1-5A',
        x: 2,
        y: 1,
        quiz: {
          id: 'Q1-5A',
          topic: 'Urutan Pertukaran Nilai',
          prompt: 'Untuk menukar isi gelas A dan gelas B tanpa tumpah, algoritma runtunan membutuhkan...',
          flowchartType: 'sequence_swap',
          options: [
            'A. Langsung menuang A ke B lalu B ke A',
            'B. Satu variabel/gelas sementara (temp) sebagai penampung',
            'C. Perulangan tak terbatas',
          ],
          correctIndex: 1,
          explanation:
            'Menukar nilai dua variabel memerlukan variabel bantu (temp): temp = A; A = B; B = temp agar nilai awal A tidak hilang tertimpa.',
        },
      },
      {
        id: 'G1-5B',
        x: 2,
        y: 3,
        quiz: {
          id: 'Q1-5B',
          topic: 'Evaluasi Pseudocode',
          prompt: 'Apa hasil yang dicetak oleh urutan perintah berikut?',
          codeOrFlow: 'skor = 100\nskor = skor + 50\nskor = skor - 20\nCETAK skor',
          options: ['A. 130', 'B. 150', 'C. 80'],
          correctIndex: 0,
          explanation: 'Nilai skor berubah berurutan: 100 -> 150 -> 130, lalu dicetak 130.',
        },
      },
    ],
    allowedBlocks: ['MOVE', 'LEFT', 'RIGHT'],
    optimalBlockCount: 9,
  },

  // ================= LEVEL 2: PERCABANGAN (5 STAGES) =================
  {
    id: 'L2-S1',
    levelId: 2,
    stageNumber: 1,
    title: 'Deteksi Penghalang Pertama',
    objective: 'Gunakan sensor If (Depan Terhalang) untuk berbelok otomatis saat bertemu tembok.',
    hint: 'Susun: Maju() -> If (Depan Terhalang) { Belok Kiri() } -> Maju() -> Maju().',
    cols: 5,
    rows: 5,
    start: { x: 1, y: 3, dir: 'E' },
    finish: { x: 2, y: 1 },
    walls: buildWallsExcept(5, 5, [
      [1, 3],
      [2, 3],
      [2, 2],
      [2, 1],
    ]),
    gates: [
      {
        id: 'G2-1',
        x: 2,
        y: 3,
        quiz: {
          id: 'Q2-1',
          topic: 'Flowchart Decision',
          prompt: 'Jika nilai x = 10 dan kondisi x > 5 bernilai True, ke arah mana robot melangkah sesuai diagram keputusan?',
          flowchartType: 'decision_x',
          codeOrFlow: 'IF (x > 5) -> Jalur KANAN\nELSE       -> Jalur KIRI',
          options: [
            'A. Robot melangkah ke Jalur KANAN',
            'B. Robot melangkah ke Jalur KIRI',
            'C. Robot berhenti tanpa melangkah',
          ],
          correctIndex: 0,
          explanation:
            'Karena x = 10 lebih besar dari 5 (10 > 5 bernilai True), maka percabangan mengeksekusi cabang Ya / Jalur KANAN.',
        },
      },
    ],
    allowedBlocks: ['MOVE', 'LEFT', 'RIGHT', 'IF_BLOCKED'],
    requireIfBlock: true,
    optimalBlockCount: 4,
  },
  {
    id: 'L2-S2',
    levelId: 2,
    stageNumber: 2,
    title: 'Persimpangan Logika',
    objective: 'Gunakan dua kali blok If (Depan Terhalang) saat menemui tembok dan tepi arena.',
    hint: 'Sensor Depan Terhalang mendeteksi baik tembok sirkuit maupun batas tepi arena.',
    cols: 6,
    rows: 5,
    start: { x: 0, y: 1, dir: 'E' },
    finish: { x: 4, y: 4 },
    walls: buildWallsExcept(6, 5, [
      [0, 1],
      [1, 1],
      [2, 1],
      [2, 2],
      [2, 3],
      [2, 4],
      [3, 4],
      [4, 4],
    ]),
    gates: [
      {
        id: 'G2-2',
        x: 2,
        y: 3,
        quiz: {
          id: 'Q2-2',
          topic: 'Percabangan If-Else',
          prompt: 'Siswa dinyatakan "Tuntas KKTP" jika nilai >= 75. Jika Andi memperoleh nilai 75, apa output program?',
          flowchartType: 'kktp_if',
          codeOrFlow: 'IF (nilai >= 75):\n  status = "Tuntas KKTP"\nELSE:\n  status = "Perlu Pendampingan"',
          options: ['A. Perlu Pendampingan', 'B. Tuntas KKTP', 'C. Error karena nilai sama'],
          correctIndex: 1,
          explanation:
            'Operator >= berarti "lebih besar ATAU sama dengan". Karena 75 >= 75 bernilai True, outputnya adalah "Tuntas KKTP".',
        },
      },
    ],
    allowedBlocks: ['MOVE', 'LEFT', 'RIGHT', 'IF_BLOCKED'],
    requireIfBlock: true,
    optimalBlockCount: 9,
  },
  {
    id: 'L2-S3',
    levelId: 2,
    stageNumber: 3,
    title: 'Sensor Dua Belokan',
    objective: 'Belok kanan otomatis di setiap tembok menggunakan sensor If (Depan Terhalang).',
    hint: 'Robot menghadap Utara. Setelah Maju 2x, gunakan If (Depan Terhalang) { Belok Kanan() }.',
    cols: 6,
    rows: 6,
    start: { x: 1, y: 4, dir: 'N' },
    finish: { x: 4, y: 4 },
    walls: buildWallsExcept(6, 6, [
      [1, 4],
      [1, 3],
      [1, 2],
      [2, 2],
      [3, 2],
      [4, 2],
      [4, 3],
      [4, 4],
    ]),
    gates: [
      {
        id: 'G2-3',
        x: 2,
        y: 2,
        quiz: {
          id: 'Q2-3',
          topic: 'Operator Logika AND (&&)',
          prompt: 'Syarat masuk Lab PPLG: (pakaiSeragam == true && bawaKartu == true). Jika siswa pakai seragam tapi lupa bawa kartu, hasilnya...',
          options: [
            'A. True, karena salah satu syarat terpenuhi',
            'B. False, karena operator && menuntut kedua kondisi True',
            'C. Program otomatis melewati syarat',
          ],
          correctIndex: 1,
          explanation:
            'Operator AND (&&) hanya menghasilkan True apabila SEMUA kondisi bernilai True. True && False menghasilkan False.',
        },
      },
    ],
    allowedBlocks: ['MOVE', 'LEFT', 'RIGHT', 'IF_BLOCKED'],
    requireIfBlock: true,
    optimalBlockCount: 9,
  },
  {
    id: 'L2-S4',
    levelId: 2,
    stageNumber: 4,
    title: 'Gerbang Percabangan Bersarang',
    objective: 'Taklukkan 3 sudut labirin dan 2 Gerbang Logika dengan kombinasi sensor belok kiri & kanan.',
    hint: 'Sudut 1: Belok Kanan, Sudut 2: Belok Kiri, Sudut 3: Belok Kanan.',
    cols: 6,
    rows: 6,
    start: { x: 0, y: 5, dir: 'N' },
    finish: { x: 4, y: 1 },
    walls: buildWallsExcept(6, 6, [
      [0, 5],
      [0, 4],
      [0, 3],
      [1, 3],
      [2, 3],
      [2, 2],
      [2, 1],
      [3, 1],
      [4, 1],
    ]),
    gates: [
      {
        id: 'G2-4A',
        x: 0,
        y: 3,
        quiz: {
          id: 'Q2-4A',
          topic: 'Operator Logika OR (||)',
          prompt: 'Diketahui A = false dan B = true. Berapakah hasil evaluasi ekspresi logika (A || B)?',
          options: ['A. true', 'B. false', 'C. null'],
          correctIndex: 0,
          explanation:
            'Operator OR (||) menghasilkan true jika minimal ada satu kondisi yang bernilai true. Karena B = true, hasilnya true.',
        },
      },
      {
        id: 'G2-4B',
        x: 2,
        y: 1,
        quiz: {
          id: 'Q2-4B',
          topic: 'Percabangan Else-If',
          prompt: 'Jika suhu = 32, pesan apa yang tampil dari kode di bawah ini?',
          codeOrFlow: 'IF (suhu > 35) -> "Panas"\nELSE IF (suhu >= 28) -> "Hangat"\nELSE -> "Sejuk"',
          options: ['A. Panas', 'B. Hangat', 'C. Sejuk'],
          correctIndex: 1,
          explanation:
            '32 > 35 bernilai False, lalu dicek 32 >= 28 bernilai True sehingga mencetak "Hangat".',
        },
      },
    ],
    allowedBlocks: ['MOVE', 'LEFT', 'RIGHT', 'IF_BLOCKED'],
    requireIfBlock: true,
    optimalBlockCount: 11,
  },
  {
    id: 'L2-S5',
    levelId: 2,
    stageNumber: 5,
    title: 'Labirin Sensor Kompleks',
    objective: 'Pecahkan tantangan terakhir Level 2 dengan dua Gerbang Logika dan tiga belokan sensor.',
    hint: 'Gunakan sensor setiap kali robot berhadapan dengan dinding pembatas.',
    cols: 7,
    rows: 6,
    start: { x: 0, y: 2, dir: 'E' },
    finish: { x: 5, y: 1 },
    walls: buildWallsExcept(7, 6, [
      [0, 2],
      [1, 2],
      [2, 2],
      [2, 3],
      [2, 4],
      [3, 4],
      [4, 4],
      [5, 4],
      [5, 3],
      [5, 2],
      [5, 1],
    ]),
    gates: [
      {
        id: 'G2-5A',
        x: 1,
        y: 2,
        quiz: {
          id: 'Q2-5A',
          topic: 'Negasi & Gabungan Logika',
          prompt: 'Diketahui a = 8 dan b = 5. Apakah nilai dari ekspresi: !(a > 10) && (b == 5)?',
          options: ['A. False', 'B. True', 'C. Error sintaks'],
          correctIndex: 1,
          explanation:
            '(a > 10) adalah False, dinegasikan (!) menjadi True. (b == 5) adalah True. True && True menghasilkan True.',
        },
      },
      {
        id: 'G2-5B',
        x: 4,
        y: 4,
        quiz: {
          id: 'Q2-5B',
          topic: 'Logika Percabangan Bertingkat',
          prompt: 'Berapa nilai akhir variabel "bonus" setelah blok logika berikut dieksekusi?',
          codeOrFlow: 'level = 2; poin = 80;\nIF (level == 2) {\n  IF (poin >= 75) bonus = 50;\n  ELSE bonus = 20;\n}',
          options: ['A. 20', 'B. 50', 'C. 0'],
          correctIndex: 1,
          explanation:
            'Kondisi luar (level == 2) bernilai True, dan kondisi dalam (80 >= 75) juga True, sehingga bonus = 50.',
        },
      },
    ],
    allowedBlocks: ['MOVE', 'LEFT', 'RIGHT', 'IF_BLOCKED'],
    requireIfBlock: true,
    optimalBlockCount: 13,
  },

  // ================= LEVEL 3: PERULANGAN (5 STAGES) =================
  {
    id: 'L3-S1',
    levelId: 3,
    stageNumber: 1,
    title: 'Lintasan Lurus Efisien',
    objective: 'Gunakan 1 blok Repeat (N kali) untuk menggerakkan robot 5 petak tanpa menulis Maju() berulang kali.',
    hint: 'Tambahkan blok Repeat (5 kali) lalu masukkan 1 blok Maju() ke dalamnya.',
    cols: 7,
    rows: 5,
    start: { x: 0, y: 2, dir: 'E' },
    finish: { x: 5, y: 2 },
    walls: buildWallsExcept(7, 5, [
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2],
      [4, 2],
      [5, 2],
    ]),
    gates: [
      {
        id: 'G3-1',
        x: 3,
        y: 2,
        quiz: {
          id: 'Q3-1',
          topic: 'Perulangan For',
          prompt: 'Berapa kali perintah "Maju()" dijalankan pada struktur perulangan berikut?',
          flowchartType: 'loop_for',
          codeOrFlow: 'for (let i = 1; i <= 5; i++) {\n  Maju();\n}',
          options: ['A. 4 kali', 'B. 5 kali', 'C. 6 kali'],
          correctIndex: 1,
          explanation:
            'Variabel i dimulai dari 1 hingga kurang dari atau sama dengan 5 (1, 2, 3, 4, 5), jadi dieksekusi tepat 5 kali.',
        },
      },
    ],
    allowedBlocks: ['MOVE', 'LEFT', 'RIGHT', 'IF_BLOCKED', 'REPEAT'],
    requireRepeatBlock: true,
    optimalBlockCount: 2,
  },
  {
    id: 'L3-S2',
    levelId: 3,
    stageNumber: 2,
    title: 'Tangga Sirkuit Berulang',
    objective: 'Temukan pola anak tangga yang berulang 3 kali dan bungkus dalam 1 blok Repeat (3 kali).',
    hint: 'Satu pola tangga: Maju() -> Belok Kanan() -> Maju() -> Belok Kiri(). Ulangi 3 kali!',
    cols: 6,
    rows: 6,
    start: { x: 0, y: 5, dir: 'N' },
    finish: { x: 3, y: 2 },
    walls: buildWallsExcept(6, 6, [
      [0, 5],
      [0, 4],
      [1, 4],
      [1, 3],
      [2, 3],
      [2, 2],
      [3, 2],
    ]),
    gates: [
      {
        id: 'G3-2',
        x: 1,
        y: 3,
        quiz: {
          id: 'Q3-2',
          topic: 'Perulangan While',
          prompt: 'Apa perbedaan utama perulangan WHILE dibanding FOR?',
          flowchartType: 'loop_while',
          options: [
            'A. WHILE hanya berjalan maksimal 2 kali',
            'B. WHILE mengulang selama kondisi bernilai True (cocok jika jumlah ulang belum pasti)',
            'C. WHILE tidak membutuhkan kondisi berhenti',
          ],
          correctIndex: 1,
          explanation:
            'Perulangan While terus berjalan selama syarat logika bernilai True, sangat ideal saat jumlah iterasi bergantung kondisi dinamis.',
        },
      },
    ],
    allowedBlocks: ['MOVE', 'LEFT', 'RIGHT', 'IF_BLOCKED', 'REPEAT'],
    requireRepeatBlock: true,
    optimalBlockCount: 5,
  },
  {
    id: 'L3-S3',
    levelId: 3,
    stageNumber: 3,
    title: 'Patroli Kotak Otomatis',
    objective: 'Gerakkan robot menelusuri 3 sisi koridor dengan satu pola Repeat (3 kali).',
    hint: 'Di dalam Repeat (3 kali): Maju 3x lalu Belok Kanan() (atau pakai If Depan Terhalang).',
    cols: 6,
    rows: 6,
    start: { x: 1, y: 4, dir: 'N' },
    finish: { x: 4, y: 4 },
    walls: buildWallsExcept(6, 6, [
      [1, 4],
      [1, 3],
      [1, 2],
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
      [4, 2],
      [4, 3],
      [4, 4],
    ]),
    gates: [
      {
        id: 'G3-3',
        x: 3,
        y: 1,
        quiz: {
          id: 'Q3-3',
          topic: 'Akumulasi Dalam Loop',
          prompt: 'Berapakah nilai akhir variabel "total" setelah perulangan berikut selesai?',
          codeOrFlow: 'total = 0;\nfor (i = 1; i <= 4; i++) {\n  total = total + i;\n}',
          options: ['A. 6', 'B. 10', 'C. 14'],
          correctIndex: 1,
          explanation:
            'Nilai i yang dijumlahkan adalah 1 + 2 + 3 + 4 = 10.',
        },
      },
    ],
    allowedBlocks: ['MOVE', 'LEFT', 'RIGHT', 'IF_BLOCKED', 'REPEAT'],
    requireRepeatBlock: true,
    optimalBlockCount: 5,
  },
  {
    id: 'L3-S4',
    levelId: 3,
    stageNumber: 4,
    title: 'Gelombang Labirin Ganda',
    objective: 'Temukan pola gelombang naik-kanan yang berulang 2 kali untuk menembus dua Gerbang Logika.',
    hint: 'Pola: Maju, Maju, Belok Kiri, Maju, Maju, Belok Kanan — ulangi 2 kali.',
    cols: 7,
    rows: 6,
    start: { x: 0, y: 5, dir: 'E' },
    finish: { x: 4, y: 1 },
    walls: buildWallsExcept(7, 6, [
      [0, 5],
      [1, 5],
      [2, 5],
      [2, 4],
      [2, 3],
      [3, 3],
      [4, 3],
      [4, 2],
      [4, 1],
    ]),
    gates: [
      {
        id: 'G3-4A',
        x: 2,
        y: 3,
        quiz: {
          id: 'Q3-4A',
          topic: 'Debugging Infinite Loop',
          prompt: 'Mengapa kode "while (x < 5) { cetak(x); }" berisiko mengalami Infinite Loop (perulangan tak berhenti)?',
          options: [
            'A. Karena kondisi x < 5 salah sintaks',
            'B. Karena nilai x tidak pernah diubah/ditambah di dalam blok loop',
            'C. Karena perintah cetak tidak boleh di dalam while',
          ],
          correctIndex: 1,
          explanation:
            'Jika variabel pengendali (x) tidak diubah di dalam tubuh loop, kondisi x < 5 akan terus True selamanya.',
        },
      },
      {
        id: 'G3-4B',
        x: 4,
        y: 2,
        quiz: {
          id: 'Q3-4B',
          topic: 'Terminasi Loop',
          prompt: 'Pada kode "for (i = 10; i > 0; i -= 3)", urutan nilai i yang tercetak adalah...',
          options: ['A. 10, 7, 4, 1', 'B. 10, 7, 4, 1, -2', 'C. 10, 8, 6, 4, 2'],
          correctIndex: 0,
          explanation:
            'Nilai i berkurang 3 tiap iterasi selama i > 0: 10, 7, 4, 1. Saat menjadi -2, syarat (-2 > 0) False sehingga loop berhenti.',
        },
      },
    ],
    allowedBlocks: ['MOVE', 'LEFT', 'RIGHT', 'IF_BLOCKED', 'REPEAT'],
    requireRepeatBlock: true,
    optimalBlockCount: 7,
  },
  {
    id: 'L3-S5',
    levelId: 3,
    stageNumber: 5,
    title: 'Ujian Akhir Cyber Master',
    objective: 'Gabungkan Repeat (12 kali) dan If (Depan Terhalang) { Belok Kanan() } + Maju() untuk menyusuri seluruh koridor otomatis!',
    hint: 'Masukkan 2 blok ke dalam Repeat (12 kali): pertama If (Depan Terhalang) { Belok Kanan() }, kedua Maju().',
    cols: 7,
    rows: 7,
    start: { x: 1, y: 5, dir: 'N' },
    finish: { x: 5, y: 5 },
    walls: buildWallsExcept(7, 7, [
      [1, 5],
      [1, 4],
      [1, 3],
      [1, 2],
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
      [5, 1],
      [5, 2],
      [5, 3],
      [5, 4],
      [5, 5],
    ]),
    gates: [
      {
        id: 'G3-5A',
        x: 3,
        y: 1,
        quiz: {
          id: 'Q3-5A',
          topic: 'Kombinasi Loop & If',
          prompt: 'Berapa kali "counter" bertambah dalam kode gabungan Loop + Percabangan berikut?',
          flowchartType: 'nested_logic',
          codeOrFlow: 'counter = 0;\nfor (i = 1; i <= 6; i++) {\n  if (i % 2 == 0) counter++;\n}',
          options: ['A. 2 kali', 'B. 3 kali', 'C. 6 kali'],
          correctIndex: 1,
          explanation:
            'Operator % adalah sisa bagi. Bilangan 1..6 yang habis dibagi 2 (genap) adalah 2, 4, dan 6 — berjumlah 3 kali.',
        },
      },
      {
        id: 'G3-5B',
        x: 5,
        y: 3,
        quiz: {
          id: 'Q3-5B',
          topic: 'Analisis Algoritma',
          prompt: 'Mengapa menggabungkan Repeat (Loop) dan If (Percabangan) membuat program robot lebih cerdas?',
          options: [
            'A. Karena program jadi punya lebih banyak baris kode',
            'B. Karena robot dapat mengulang langkah secara ringkas sekaligus beradaptasi saat ada halangan',
            'C. Karena robot tidak lagi membutuhkan titik Start',
          ],
          correctIndex: 1,
          explanation:
            'Looping menjaga efisiensi kode dari pengulangan manual, sedangkan percabangan membuat program adaptif terhadap kondisi lingkungan.',
        },
      },
    ],
    allowedBlocks: ['MOVE', 'LEFT', 'RIGHT', 'IF_BLOCKED', 'REPEAT'],
    requireIfBlock: true,
    requireRepeatBlock: true,
    optimalBlockCount: 3,
  },
];
