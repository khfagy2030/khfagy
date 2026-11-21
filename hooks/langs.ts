// Short phrases per language. i18n.ts composes them into every message, so a
// language needs only these words; anything longer (reports, help) stays English.

export type Phrases = {
  ready: string
  empty: string
  activity: string
  recent: string
  hide: string
  unlock: string
  review: string
  reviewBand: string
  reviewOn: string
  reviewOff: string
  blocked: string
  secretFile: string
  destructive: string
  outside: string
  notSent: string
  secretInMsg: string
  withheld: string
  longTurn: string
  budgetNear: string
  budgetOver: string
  restored: string
  nothing: string
  lastTurn: string
  tools: string
  failed: string
  injection: string
  gitSecret: string
  fakePackage: string
  rewound: string
}

export const LANG_NAMES = {
  en: 'English',
  zh: '中文',
  hi: 'हिन्दी',
  es: 'Español',
  ar: 'العربية',
  fr: 'Français',
  bn: 'বাংলা',
  pt: 'Português',
  ru: 'Русский',
  ur: 'اردو',
  id: 'Bahasa Indonesia',
  de: 'Deutsch',
  ja: '日本語',
  tr: 'Türkçe',
  ko: '한국어',
  vi: 'Tiếng Việt',
  it: 'Italiano',
  fa: 'فارسی',
  th: 'ไทย',
  pl: 'Polski',
  nl: 'Nederlands',
  uk: 'Українська',
  ms: 'Bahasa Melayu',
  ta: 'தமிழ்',
  sw: 'Kiswahili',
} as const

export type LangCode = keyof typeof LANG_NAMES

export const PHRASES: Record<Exclude<LangCode, 'en' | 'ar'>, Phrases> = {
  zh: {
    ready: 'khfagy 已启用', empty: '暂无活动。', activity: '活动', recent: '最近的回合', hide: '隐藏', unlock: '解锁',
    review: '审阅模式', reviewBand: 'Claude 只能读取，不能更改任何内容', reviewOn: '审阅模式已开启', reviewOff: '审阅模式已关闭',
    blocked: '已阻止', secretFile: '受保护的机密文件', destructive: '破坏性命令', outside: '项目之外', notSent: '未发送',
    secretInMsg: '消息中包含密钥', withheld: '输出已对 Claude 隐藏', longTurn: '本回合耗时', budgetNear: '今日令牌预算已用 80%',
    budgetOver: '今日令牌预算已用完', restored: '已恢复', nothing: '没有可撤销的内容', lastTurn: '上一回合', tools: '个工具', failed: '个失败',
    injection: "发现隐藏指令", gitSecret: "提交中包含密钥", fakePackage: "可疑的仿冒软件包", rewound: "已撤回整个回合",
  },
  hi: {
    ready: 'khfagy चालू है', empty: 'अभी कोई गतिविधि नहीं।', activity: 'गतिविधि', recent: 'हाल के टर्न', hide: 'छिपाएँ', unlock: 'अनलॉक',
    review: 'समीक्षा मोड', reviewBand: 'Claude पढ़ सकता है, पर कुछ बदल नहीं सकता', reviewOn: 'समीक्षा मोड चालू', reviewOff: 'समीक्षा मोड बंद',
    blocked: 'रोका गया', secretFile: 'सुरक्षित गोपनीय फ़ाइल', destructive: 'विनाशकारी कमांड', outside: 'प्रोजेक्ट के बाहर', notSent: 'नहीं भेजा गया',
    secretInMsg: 'संदेश में एक गुप्त कुंजी है', withheld: 'आउटपुट Claude से छिपाया गया', longTurn: 'इस टर्न में लगा समय', budgetNear: 'आज के टोकन बजट का 80% उपयोग हुआ',
    budgetOver: 'आज का टोकन बजट समाप्त', restored: 'पुनर्स्थापित', nothing: 'पूर्ववत करने को कुछ नहीं', lastTurn: 'पिछला टर्न', tools: 'टूल', failed: 'विफल',
    injection: "छिपे हुए निर्देश मिले", gitSecret: "कमिट में गुप्त कुंजी है", fakePackage: "संदिग्ध नकली पैकेज", rewound: "पूरा टर्न वापस किया गया",
  },
  es: {
    ready: 'khfagy está activo', empty: 'Aún no hay actividad.', activity: 'Actividad', recent: 'Turnos recientes', hide: 'Ocultar', unlock: 'Desbloquear',
    review: 'Modo revisión', reviewBand: 'Claude puede leer pero no cambiar nada', reviewOn: 'Modo revisión activado', reviewOff: 'Modo revisión desactivado',
    blocked: 'Bloqueado', secretFile: 'archivo secreto protegido', destructive: 'comando destructivo', outside: 'fuera del proyecto', notSent: 'No enviado',
    secretInMsg: 'el mensaje contiene un secreto', withheld: 'Salida ocultada a Claude', longTurn: 'Este turno tardó', budgetNear: '80 % del presupuesto de tokens de hoy usado',
    budgetOver: 'Presupuesto de tokens de hoy agotado', restored: 'Restaurado', nothing: 'Nada que deshacer', lastTurn: 'Último turno', tools: 'herramientas', failed: 'fallidas',
    injection: "Instrucciones ocultas detectadas", gitSecret: "el commit contiene un secreto", fakePackage: "paquete sospechoso que imita a otro", rewound: "Turno completo revertido",
  },
  fr: {
    ready: 'khfagy est actif', empty: 'Aucune activité pour l’instant.', activity: 'Activité', recent: 'Tours récents', hide: 'Masquer', unlock: 'Déverrouiller',
    review: 'Mode revue', reviewBand: 'Claude peut lire mais ne rien modifier', reviewOn: 'Mode revue activé', reviewOff: 'Mode revue désactivé',
    blocked: 'Bloqué', secretFile: 'fichier secret protégé', destructive: 'commande destructrice', outside: 'hors du projet', notSent: 'Non envoyé',
    secretInMsg: 'le message contient un secret', withheld: 'Sortie masquée à Claude', longTurn: 'Ce tour a duré', budgetNear: '80 % du budget de jetons du jour utilisé',
    budgetOver: 'Budget de jetons du jour épuisé', restored: 'Restauré', nothing: 'Rien à annuler', lastTurn: 'Dernier tour', tools: 'outils', failed: 'échecs',
    injection: "Instructions cachées détectées", gitSecret: "le commit contient un secret", fakePackage: "paquet suspect qui en imite un autre", rewound: "Tour entier annulé",
  },
  bn: {
    ready: 'khfagy চালু আছে', empty: 'এখনও কোনো কার্যকলাপ নেই।', activity: 'কার্যকলাপ', recent: 'সাম্প্রতিক টার্ন', hide: 'লুকান', unlock: 'আনলক',
    review: 'পর্যালোচনা মোড', reviewBand: 'Claude পড়তে পারে, কিছু বদলাতে পারে না', reviewOn: 'পর্যালোচনা মোড চালু', reviewOff: 'পর্যালোচনা মোড বন্ধ',
    blocked: 'আটকানো হয়েছে', secretFile: 'সুরক্ষিত গোপন ফাইল', destructive: 'ধ্বংসাত্মক কমান্ড', outside: 'প্রজেক্টের বাইরে', notSent: 'পাঠানো হয়নি',
    secretInMsg: 'বার্তায় একটি গোপন কী আছে', withheld: 'আউটপুট Claude থেকে লুকানো হয়েছে', longTurn: 'এই টার্নে সময় লেগেছে', budgetNear: 'আজকের টোকেন বাজেটের ৮০% ব্যবহৃত',
    budgetOver: 'আজকের টোকেন বাজেট শেষ', restored: 'পুনরুদ্ধার করা হয়েছে', nothing: 'পূর্বাবস্থায় ফেরানোর কিছু নেই', lastTurn: 'শেষ টার্ন', tools: 'টুল', failed: 'ব্যর্থ',
    injection: "লুকানো নির্দেশনা পাওয়া গেছে", gitSecret: "কমিটে গোপন কী আছে", fakePackage: "সন্দেহজনক নকল প্যাকেজ", rewound: "পুরো টার্ন ফিরিয়ে আনা হয়েছে",
  },
  pt: {
    ready: 'khfagy está ativo', empty: 'Ainda sem atividade.', activity: 'Atividade', recent: 'Turnos recentes', hide: 'Ocultar', unlock: 'Desbloquear',
    review: 'Modo revisão', reviewBand: 'Claude pode ler, mas não alterar nada', reviewOn: 'Modo revisão ativado', reviewOff: 'Modo revisão desativado',
    blocked: 'Bloqueado', secretFile: 'arquivo secreto protegido', destructive: 'comando destrutivo', outside: 'fora do projeto', notSent: 'Não enviado',
    secretInMsg: 'a mensagem contém um segredo', withheld: 'Saída ocultada do Claude', longTurn: 'Este turno levou', budgetNear: '80% do orçamento de tokens de hoje usado',
    budgetOver: 'Orçamento de tokens de hoje esgotado', restored: 'Restaurado', nothing: 'Nada para desfazer', lastTurn: 'Último turno', tools: 'ferramentas', failed: 'falhas',
    injection: "Instruções ocultas detectadas", gitSecret: "o commit contém um segredo", fakePackage: "pacote suspeito que imita outro", rewound: "Turno inteiro revertido",
  },
  ru: {
    ready: 'khfagy включён', empty: 'Пока нет активности.', activity: 'Активность', recent: 'Последние ходы', hide: 'Скрыть', unlock: 'Разблокировать',
    review: 'Режим проверки', reviewBand: 'Claude может читать, но ничего не менять', reviewOn: 'Режим проверки включён', reviewOff: 'Режим проверки выключен',
    blocked: 'Заблокировано', secretFile: 'защищённый секретный файл', destructive: 'разрушительная команда', outside: 'вне проекта', notSent: 'Не отправлено',
    secretInMsg: 'сообщение содержит секрет', withheld: 'Вывод скрыт от Claude', longTurn: 'Этот ход занял', budgetNear: 'Использовано 80% дневного бюджета токенов',
    budgetOver: 'Дневной бюджет токенов исчерпан', restored: 'Восстановлено', nothing: 'Нечего отменять', lastTurn: 'Последний ход', tools: 'инструм.', failed: 'ошибок',
    injection: "Обнаружены скрытые инструкции", gitSecret: "в коммите есть секрет", fakePackage: "подозрительный пакет-подделка", rewound: "Весь ход отменён",
  },
  ur: {
    ready: 'khfagy فعال ہے', empty: 'ابھی کوئی سرگرمی نہیں۔', activity: 'سرگرمی', recent: 'حالیہ باریاں', hide: 'چھپائیں', unlock: 'ان لاک',
    review: 'جائزہ موڈ', reviewBand: 'Claude پڑھ سکتا ہے مگر کچھ بدل نہیں سکتا', reviewOn: 'جائزہ موڈ آن', reviewOff: 'جائزہ موڈ آف',
    blocked: 'روک دیا گیا', secretFile: 'محفوظ خفیہ فائل', destructive: 'تباہ کن کمانڈ', outside: 'پروجیکٹ سے باہر', notSent: 'نہیں بھیجا گیا',
    secretInMsg: 'پیغام میں ایک خفیہ کلید ہے', withheld: 'آؤٹ پٹ Claude سے چھپا دیا گیا', longTurn: 'اس باری میں لگا وقت', budgetNear: 'آج کے ٹوکن بجٹ کا 80% استعمال ہو گیا',
    budgetOver: 'آج کا ٹوکن بجٹ ختم', restored: 'بحال کر دیا گیا', nothing: 'واپس کرنے کو کچھ نہیں', lastTurn: 'پچھلی باری', tools: 'ٹولز', failed: 'ناکام',
    injection: "چھپی ہوئی ہدایات ملیں", gitSecret: "کمٹ میں خفیہ کلید ہے", fakePackage: "مشکوک نقلی پیکیج", rewound: "پورا ٹرن واپس کر دیا گیا",
  },
  id: {
    ready: 'khfagy aktif', empty: 'Belum ada aktivitas.', activity: 'Aktivitas', recent: 'Giliran terbaru', hide: 'Sembunyikan', unlock: 'Buka kunci',
    review: 'Mode tinjau', reviewBand: 'Claude bisa membaca tetapi tidak mengubah apa pun', reviewOn: 'Mode tinjau aktif', reviewOff: 'Mode tinjau nonaktif',
    blocked: 'Diblokir', secretFile: 'file rahasia yang dilindungi', destructive: 'perintah merusak', outside: 'di luar proyek', notSent: 'Tidak terkirim',
    secretInMsg: 'pesan berisi rahasia', withheld: 'Output disembunyikan dari Claude', longTurn: 'Giliran ini memakan waktu', budgetNear: '80% anggaran token hari ini terpakai',
    budgetOver: 'Anggaran token hari ini habis', restored: 'Dipulihkan', nothing: 'Tidak ada yang bisa dibatalkan', lastTurn: 'Giliran terakhir', tools: 'alat', failed: 'gagal',
    injection: "Instruksi tersembunyi ditemukan", gitSecret: "commit berisi rahasia", fakePackage: "paket tiruan yang mencurigakan", rewound: "Seluruh giliran dikembalikan",
  },
  de: {
    ready: 'khfagy ist aktiv', empty: 'Noch keine Aktivität.', activity: 'Aktivität', recent: 'Letzte Runden', hide: 'Ausblenden', unlock: 'Entsperren',
    review: 'Prüfmodus', reviewBand: 'Claude kann lesen, aber nichts ändern', reviewOn: 'Prüfmodus an', reviewOff: 'Prüfmodus aus',
    blocked: 'Blockiert', secretFile: 'geschützte geheime Datei', destructive: 'zerstörerischer Befehl', outside: 'außerhalb des Projekts', notSent: 'Nicht gesendet',
    secretInMsg: 'die Nachricht enthält ein Geheimnis', withheld: 'Ausgabe vor Claude verborgen', longTurn: 'Diese Runde dauerte', budgetNear: '80 % des heutigen Token-Budgets verbraucht',
    budgetOver: 'Heutiges Token-Budget aufgebraucht', restored: 'Wiederhergestellt', nothing: 'Nichts rückgängig zu machen', lastTurn: 'Letzte Runde', tools: 'Tools', failed: 'fehlgeschlagen',
    injection: "Versteckte Anweisungen gefunden", gitSecret: "der Commit enthält ein Geheimnis", fakePackage: "verdächtiges nachgeahmtes Paket", rewound: "Ganze Runde zurückgesetzt",
  },
  ja: {
    ready: 'khfagy が有効です', empty: 'まだアクティビティはありません。', activity: 'アクティビティ', recent: '最近のターン', hide: '非表示', unlock: 'ロック解除',
    review: 'レビューモード', reviewBand: 'Claude は読み取りのみで、変更はできません', reviewOn: 'レビューモード オン', reviewOff: 'レビューモード オフ',
    blocked: 'ブロックしました', secretFile: '保護された機密ファイル', destructive: '破壊的なコマンド', outside: 'プロジェクト外', notSent: '送信されませんでした',
    secretInMsg: 'メッセージに秘密情報が含まれています', withheld: '出力を Claude から隠しました', longTurn: 'このターンの所要時間', budgetNear: '本日のトークン予算の 80% を使用',
    budgetOver: '本日のトークン予算を使い切りました', restored: '復元しました', nothing: '取り消せる変更はありません', lastTurn: '前回のターン', tools: 'ツール', failed: '失敗',
    injection: "隠された指示を検出", gitSecret: "コミットに秘密情報が含まれています", fakePackage: "疑わしい偽パッケージ", rewound: "ターン全体を元に戻しました",
  },
  tr: {
    ready: 'khfagy açık', empty: 'Henüz etkinlik yok.', activity: 'Etkinlik', recent: 'Son turlar', hide: 'Gizle', unlock: 'Kilidi aç',
    review: 'İnceleme modu', reviewBand: 'Claude okuyabilir ama hiçbir şeyi değiştiremez', reviewOn: 'İnceleme modu açık', reviewOff: 'İnceleme modu kapalı',
    blocked: 'Engellendi', secretFile: 'korunan gizli dosya', destructive: 'yıkıcı komut', outside: 'proje dışında', notSent: 'Gönderilmedi',
    secretInMsg: 'mesaj bir gizli anahtar içeriyor', withheld: 'Çıktı Claude’dan gizlendi', longTurn: 'Bu tur sürdü', budgetNear: 'Bugünkü token bütçesinin %80’i kullanıldı',
    budgetOver: 'Bugünkü token bütçesi doldu', restored: 'Geri yüklendi', nothing: 'Geri alınacak bir şey yok', lastTurn: 'Son tur', tools: 'araç', failed: 'başarısız',
    injection: "Gizli talimatlar bulundu", gitSecret: "commit gizli bir anahtar içeriyor", fakePackage: "şüpheli taklit paket", rewound: "Tüm tur geri alındı",
  },
  ko: {
    ready: 'khfagy 사용 중', empty: '아직 활동이 없습니다.', activity: '활동', recent: '최근 턴', hide: '숨기기', unlock: '잠금 해제',
    review: '검토 모드', reviewBand: 'Claude는 읽기만 할 수 있고 변경할 수 없습니다', reviewOn: '검토 모드 켜짐', reviewOff: '검토 모드 꺼짐',
    blocked: '차단됨', secretFile: '보호된 비밀 파일', destructive: '파괴적인 명령', outside: '프로젝트 외부', notSent: '전송되지 않음',
    secretInMsg: '메시지에 비밀 키가 포함되어 있습니다', withheld: '출력을 Claude에게서 숨김', longTurn: '이번 턴 소요 시간', budgetNear: '오늘 토큰 예산의 80% 사용',
    budgetOver: '오늘 토큰 예산 소진', restored: '복원됨', nothing: '되돌릴 내용 없음', lastTurn: '지난 턴', tools: '도구', failed: '실패',
    injection: "숨겨진 지시 발견", gitSecret: "커밋에 비밀 키가 있음", fakePackage: "의심스러운 가짜 패키지", rewound: "턴 전체를 되돌렸습니다",
  },
  vi: {
    ready: 'khfagy đang bật', empty: 'Chưa có hoạt động.', activity: 'Hoạt động', recent: 'Lượt gần đây', hide: 'Ẩn', unlock: 'Mở khóa',
    review: 'Chế độ xem xét', reviewBand: 'Claude chỉ đọc được, không thay đổi gì', reviewOn: 'Đã bật chế độ xem xét', reviewOff: 'Đã tắt chế độ xem xét',
    blocked: 'Đã chặn', secretFile: 'tệp bí mật được bảo vệ', destructive: 'lệnh phá hủy', outside: 'ngoài dự án', notSent: 'Chưa gửi',
    secretInMsg: 'tin nhắn chứa thông tin bí mật', withheld: 'Đã ẩn đầu ra khỏi Claude', longTurn: 'Lượt này mất', budgetNear: 'Đã dùng 80% ngân sách token hôm nay',
    budgetOver: 'Đã hết ngân sách token hôm nay', restored: 'Đã khôi phục', nothing: 'Không có gì để hoàn tác', lastTurn: 'Lượt trước', tools: 'công cụ', failed: 'lỗi',
    injection: "Phát hiện chỉ thị ẩn", gitSecret: "commit chứa khóa bí mật", fakePackage: "gói giả mạo đáng ngờ", rewound: "Đã hoàn tác cả lượt",
  },
  it: {
    ready: 'khfagy è attivo', empty: 'Ancora nessuna attività.', activity: 'Attività', recent: 'Turni recenti', hide: 'Nascondi', unlock: 'Sblocca',
    review: 'Modalità revisione', reviewBand: 'Claude può leggere ma non modificare nulla', reviewOn: 'Modalità revisione attiva', reviewOff: 'Modalità revisione disattivata',
    blocked: 'Bloccato', secretFile: 'file segreto protetto', destructive: 'comando distruttivo', outside: 'fuori dal progetto', notSent: 'Non inviato',
    secretInMsg: 'il messaggio contiene un segreto', withheld: 'Output nascosto a Claude', longTurn: 'Questo turno è durato', budgetNear: '80% del budget di token di oggi usato',
    budgetOver: 'Budget di token di oggi esaurito', restored: 'Ripristinato', nothing: 'Niente da annullare', lastTurn: 'Ultimo turno', tools: 'strumenti', failed: 'falliti',
    injection: "Istruzioni nascoste rilevate", gitSecret: "il commit contiene un segreto", fakePackage: "pacchetto sospetto che ne imita un altro", rewound: "Intero turno annullato",
  },
  fa: {
    ready: 'khfagy فعال است', empty: 'هنوز فعالیتی نیست.', activity: 'فعالیت', recent: 'نوبت‌های اخیر', hide: 'پنهان', unlock: 'باز کردن قفل',
    review: 'حالت بازبینی', reviewBand: 'Claude فقط می‌خواند و چیزی را تغییر نمی‌دهد', reviewOn: 'حالت بازبینی روشن', reviewOff: 'حالت بازبینی خاموش',
    blocked: 'مسدود شد', secretFile: 'فایل محرمانهٔ محافظت‌شده', destructive: 'فرمان مخرب', outside: 'خارج از پروژه', notSent: 'ارسال نشد',
    secretInMsg: 'پیام حاوی یک کلید محرمانه است', withheld: 'خروجی از Claude پنهان شد', longTurn: 'مدت این نوبت', budgetNear: '۸۰٪ بودجهٔ توکن امروز مصرف شد',
    budgetOver: 'بودجهٔ توکن امروز تمام شد', restored: 'بازیابی شد', nothing: 'چیزی برای برگرداندن نیست', lastTurn: 'نوبت قبلی', tools: 'ابزار', failed: 'ناموفق',
    injection: "دستورهای پنهان پیدا شد", gitSecret: "کامیت حاوی کلید محرمانه است", fakePackage: "بستهٔ جعلی مشکوک", rewound: "کل نوبت برگردانده شد",
  },
  th: {
    ready: 'khfagy ทำงานอยู่', empty: 'ยังไม่มีกิจกรรม', activity: 'กิจกรรม', recent: 'รอบล่าสุด', hide: 'ซ่อน', unlock: 'ปลดล็อก',
    review: 'โหมดตรวจทาน', reviewBand: 'Claude อ่านได้แต่แก้ไขอะไรไม่ได้', reviewOn: 'เปิดโหมดตรวจทาน', reviewOff: 'ปิดโหมดตรวจทาน',
    blocked: 'ถูกบล็อก', secretFile: 'ไฟล์ลับที่ได้รับการป้องกัน', destructive: 'คำสั่งที่ทำลายข้อมูล', outside: 'อยู่นอกโปรเจกต์', notSent: 'ไม่ได้ส่ง',
    secretInMsg: 'ข้อความมีคีย์ลับ', withheld: 'ซ่อนผลลัพธ์จาก Claude แล้ว', longTurn: 'รอบนี้ใช้เวลา', budgetNear: 'ใช้งบโทเค็นวันนี้ไปแล้ว 80%',
    budgetOver: 'งบโทเค็นวันนี้หมดแล้ว', restored: 'กู้คืนแล้ว', nothing: 'ไม่มีอะไรให้ย้อนกลับ', lastTurn: 'รอบที่แล้ว', tools: 'เครื่องมือ', failed: 'ล้มเหลว',
    injection: "พบคำสั่งที่ซ่อนอยู่", gitSecret: "คอมมิตมีคีย์ลับ", fakePackage: "แพ็กเกจปลอมที่น่าสงสัย", rewound: "ย้อนกลับทั้งรอบแล้ว",
  },
  pl: {
    ready: 'khfagy działa', empty: 'Brak aktywności.', activity: 'Aktywność', recent: 'Ostatnie tury', hide: 'Ukryj', unlock: 'Odblokuj',
    review: 'Tryb przeglądu', reviewBand: 'Claude może czytać, ale niczego nie zmienia', reviewOn: 'Tryb przeglądu włączony', reviewOff: 'Tryb przeglądu wyłączony',
    blocked: 'Zablokowano', secretFile: 'chroniony plik z sekretami', destructive: 'niszczące polecenie', outside: 'poza projektem', notSent: 'Nie wysłano',
    secretInMsg: 'wiadomość zawiera sekret', withheld: 'Wynik ukryty przed Claude', longTurn: 'Ta tura trwała', budgetNear: 'Zużyto 80% dzisiejszego budżetu tokenów',
    budgetOver: 'Dzisiejszy budżet tokenów wyczerpany', restored: 'Przywrócono', nothing: 'Nic do cofnięcia', lastTurn: 'Ostatnia tura', tools: 'narzędzia', failed: 'błędy',
    injection: "Wykryto ukryte instrukcje", gitSecret: "commit zawiera sekret", fakePackage: "podejrzana podróbka pakietu", rewound: "Cała tura cofnięta",
  },
  nl: {
    ready: 'khfagy staat aan', empty: 'Nog geen activiteit.', activity: 'Activiteit', recent: 'Recente beurten', hide: 'Verbergen', unlock: 'Ontgrendelen',
    review: 'Reviewmodus', reviewBand: 'Claude kan lezen maar niets wijzigen', reviewOn: 'Reviewmodus aan', reviewOff: 'Reviewmodus uit',
    blocked: 'Geblokkeerd', secretFile: 'beschermd geheim bestand', destructive: 'destructieve opdracht', outside: 'buiten het project', notSent: 'Niet verzonden',
    secretInMsg: 'het bericht bevat een geheim', withheld: 'Uitvoer verborgen voor Claude', longTurn: 'Deze beurt duurde', budgetNear: '80% van het tokenbudget van vandaag gebruikt',
    budgetOver: 'Tokenbudget van vandaag op', restored: 'Hersteld', nothing: 'Niets om ongedaan te maken', lastTurn: 'Vorige beurt', tools: 'tools', failed: 'mislukt',
    injection: "Verborgen instructies gevonden", gitSecret: "de commit bevat een geheim", fakePackage: "verdacht nagemaakt pakket", rewound: "Hele beurt teruggedraaid",
  },
  uk: {
    ready: 'khfagy увімкнено', empty: 'Поки немає активності.', activity: 'Активність', recent: 'Останні ходи', hide: 'Сховати', unlock: 'Розблокувати',
    review: 'Режим перегляду', reviewBand: 'Claude може читати, але нічого не змінює', reviewOn: 'Режим перегляду увімкнено', reviewOff: 'Режим перегляду вимкнено',
    blocked: 'Заблоковано', secretFile: 'захищений секретний файл', destructive: 'руйнівна команда', outside: 'поза проєктом', notSent: 'Не надіслано',
    secretInMsg: 'повідомлення містить секрет', withheld: 'Вивід приховано від Claude', longTurn: 'Цей хід тривав', budgetNear: 'Використано 80% денного бюджету токенів',
    budgetOver: 'Денний бюджет токенів вичерпано', restored: 'Відновлено', nothing: 'Немає чого скасувати', lastTurn: 'Останній хід', tools: 'інструм.', failed: 'помилок',
    injection: "Виявлено приховані інструкції", gitSecret: "у коміті є секрет", fakePackage: "підозрілий пакет-підробка", rewound: "Увесь хід скасовано",
  },
  ms: {
    ready: 'khfagy aktif', empty: 'Belum ada aktiviti.', activity: 'Aktiviti', recent: 'Giliran terkini', hide: 'Sembunyi', unlock: 'Buka kunci',
    review: 'Mod semakan', reviewBand: 'Claude boleh membaca tetapi tidak boleh mengubah apa-apa', reviewOn: 'Mod semakan dihidupkan', reviewOff: 'Mod semakan dimatikan',
    blocked: 'Disekat', secretFile: 'fail rahsia yang dilindungi', destructive: 'arahan merosakkan', outside: 'di luar projek', notSent: 'Tidak dihantar',
    secretInMsg: 'mesej mengandungi rahsia', withheld: 'Output disembunyikan daripada Claude', longTurn: 'Giliran ini mengambil masa', budgetNear: '80% bajet token hari ini digunakan',
    budgetOver: 'Bajet token hari ini habis', restored: 'Dipulihkan', nothing: 'Tiada apa untuk dibuat asal', lastTurn: 'Giliran lepas', tools: 'alat', failed: 'gagal',
    injection: "Arahan tersembunyi ditemui", gitSecret: "commit mengandungi rahsia", fakePackage: "pakej tiruan yang mencurigakan", rewound: "Seluruh giliran dipulihkan",
  },
  ta: {
    ready: 'khfagy இயக்கத்தில் உள்ளது', empty: 'இன்னும் செயல்பாடு இல்லை.', activity: 'செயல்பாடு', recent: 'சமீபத்திய சுற்றுகள்', hide: 'மறை', unlock: 'பூட்டைத் திற',
    review: 'மதிப்பாய்வு முறை', reviewBand: 'Claude படிக்க மட்டுமே முடியும், எதையும் மாற்ற முடியாது', reviewOn: 'மதிப்பாய்வு முறை இயக்கப்பட்டது', reviewOff: 'மதிப்பாய்வு முறை நிறுத்தப்பட்டது',
    blocked: 'தடுக்கப்பட்டது', secretFile: 'பாதுகாக்கப்பட்ட ரகசியக் கோப்பு', destructive: 'அழிவுகரமான கட்டளை', outside: 'திட்டத்திற்கு வெளியே', notSent: 'அனுப்பப்படவில்லை',
    secretInMsg: 'செய்தியில் ஒரு ரகசிய விசை உள்ளது', withheld: 'வெளியீடு Claude-இடமிருந்து மறைக்கப்பட்டது', longTurn: 'இந்தச் சுற்றுக்கு ஆன நேரம்', budgetNear: 'இன்றைய டோக்கன் பட்ஜெட்டில் 80% பயன்படுத்தப்பட்டது',
    budgetOver: 'இன்றைய டோக்கன் பட்ஜெட் தீர்ந்தது', restored: 'மீட்டமைக்கப்பட்டது', nothing: 'செயல்தவிர்க்க எதுவும் இல்லை', lastTurn: 'கடந்த சுற்று', tools: 'கருவிகள்', failed: 'தோல்வி',
    injection: "மறைந்த கட்டளைகள் கண்டறியப்பட்டன", gitSecret: "கமிட்டில் ரகசிய விசை உள்ளது", fakePackage: "சந்தேகமான போலி தொகுப்பு", rewound: "முழு சுற்று திரும்பப் பெறப்பட்டது",
  },
  sw: {
    ready: 'khfagy imewashwa', empty: 'Bado hakuna shughuli.', activity: 'Shughuli', recent: 'Zamu za hivi karibuni', hide: 'Ficha', unlock: 'Fungua',
    review: 'Hali ya ukaguzi', reviewBand: 'Claude anaweza kusoma lakini hawezi kubadilisha chochote', reviewOn: 'Hali ya ukaguzi imewashwa', reviewOff: 'Hali ya ukaguzi imezimwa',
    blocked: 'Imezuiwa', secretFile: 'faili ya siri iliyolindwa', destructive: 'amri haribifu', outside: 'nje ya mradi', notSent: 'Haijatumwa',
    secretInMsg: 'ujumbe una siri', withheld: 'Matokeo yamefichwa kwa Claude', longTurn: 'Zamu hii ilichukua', budgetNear: '80% ya bajeti ya tokeni ya leo imetumika',
    budgetOver: 'Bajeti ya tokeni ya leo imekwisha', restored: 'Imerejeshwa', nothing: 'Hakuna cha kutendua', lastTurn: 'Zamu iliyopita', tools: 'zana', failed: 'zimeshindwa',
    injection: "Maagizo yaliyofichwa yamepatikana", gitSecret: "commit ina siri", fakePackage: "kifurushi bandia kinachotiliwa shaka", rewound: "Zamu nzima imerudishwa",
  },
}
