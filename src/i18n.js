/**
 * Módulo de Internacionalización (i18n)
 * Soporte para todos los idiomas principales del mundo
 */

const translations = {
    "es": {
        name: "Español",
        native: "Español",
        dir: "ltr",
        ui: {
            title: "PLC Code Generator Pro",
            subtitle: "Generador de código para todos los PLCs del mercado",
            config: "Configuración",
            plcType: "Tipo de PLC",
            inputs: "Entradas (I)",
            outputs: "Salidas (O)",
            generate: "Generar Código",
            generatedCode: "Código Generado",
            copy: "Copiar",
            download: "Descargar .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "Código PLC generado con éxito",
                noIO: "Por favor, define al menos una entrada o salida.",
                copied: "Código copiado al portapapeles",
                downloaded: "Archivo descargado: ",
                noCode: "No hay código para descargar. Genera primero.",
                noCopy: "No hay código para copiar."
            },
            language: "Idioma",
            aiMode: "Modo IA",
            footer: "Compatible con 35+ marcas de PLCs industriales"
        }
    },
    "en": {
        name: "English",
        native: "English",
        dir: "ltr",
        ui: {
            title: "PLC Code Generator Pro",
            subtitle: "Code generator for all market PLCs",
            config: "Configuration",
            plcType: "PLC Type",
            inputs: "Inputs (I)",
            outputs: "Outputs (O)",
            generate: "Generate Code",
            generatedCode: "Generated Code",
            copy: "Copy",
            download: "Download .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "PLC code generated successfully",
                noIO: "Please define at least one input or output.",
                copied: "Code copied to clipboard",
                downloaded: "File downloaded: ",
                noCode: "No code to download. Generate first.",
                noCopy: "No code to copy."
            },
            language: "Language",
            aiMode: "AI Mode",
            footer: "Compatible with 35+ industrial PLC brands"
        }
    },
    "fr": {
        name: "French",
        native: "Français",
        dir: "ltr",
        ui: {
            title: "PLC Code Generator Pro",
            subtitle: "Générateur de code pour tous les API du marché",
            config: "Configuration",
            plcType: "Type d'API",
            inputs: "Entrées (I)",
            outputs: "Sorties (O)",
            generate: "Générer le Code",
            generatedCode: "Code Généré",
            copy: "Copier",
            download: "Télécharger .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "Code API généré avec succès",
                noIO: "Veuillez définir au moins une entrée ou sortie.",
                copied: "Code copié dans le presse-papiers",
                downloaded: "Fichier téléchargé : ",
                noCode: "Aucun code à télécharger. Générez d'abord.",
                noCopy: "Aucun code à copier."
            },
            language: "Langue",
            aiMode: "Mode IA",
            footer: "Compatible avec 35+ marques d'API industriels"
        }
    },
    "de": {
        name: "German",
        native: "Deutsch",
        dir: "ltr",
        ui: {
            title: "PLC Code Generator Pro",
            subtitle: "Codegenerator für alle SPS auf dem Markt",
            config: "Konfiguration",
            plcType: "SPS-Typ",
            inputs: "Eingänge (I)",
            outputs: "Ausgänge (O)",
            generate: "Code Generieren",
            generatedCode: "Generierter Code",
            copy: "Kopieren",
            download: "Herunterladen .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "SPS-Code erfolgreich generiert",
                noIO: "Bitte definieren Sie mindestens einen Ein- oder Ausgang.",
                copied: "Code in die Zwischenablage kopiert",
                downloaded: "Datei heruntergeladen: ",
                noCode: "Kein Code zum Herunterladen. Zuerst generieren.",
                noCopy: "Kein Code zum Kopieren."
            },
            language: "Sprache",
            aiMode: "KI-Modus",
            footer: "Kompatibel mit 35+ industriellen SPS-Marken"
        }
    },
    "pt": {
        name: "Portuguese",
        native: "Português",
        dir: "ltr",
        ui: {
            title: "PLC Code Generator Pro",
            subtitle: "Gerador de código para todos os CLPs do mercado",
            config: "Configuração",
            plcType: "Tipo de CLP",
            inputs: "Entradas (I)",
            outputs: "Saídas (O)",
            generate: "Gerar Código",
            generatedCode: "Código Gerado",
            copy: "Copiar",
            download: "Baixar .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "Código CLP gerado com sucesso",
                noIO: "Por favor, defina pelo menos uma entrada ou saída.",
                copied: "Código copiado para a área de transferência",
                downloaded: "Arquivo baixado: ",
                noCode: "Sem código para baixar. Gere primeiro.",
                noCopy: "Sem código para copiar."
            },
            language: "Idioma",
            aiMode: "Modo IA",
            footer: "Compatível com 35+ marcas de CLPs industriais"
        }
    },
    "it": {
        name: "Italian",
        native: "Italiano",
        dir: "ltr",
        ui: {
            title: "PLC Code Generator Pro",
            subtitle: "Generatore di codice per tutti i PLC del mercato",
            config: "Configurazione",
            plcType: "Tipo di PLC",
            inputs: "Ingressi (I)",
            outputs: "Uscite (O)",
            generate: "Genera Codice",
            generatedCode: "Codice Generato",
            copy: "Copia",
            download: "Scarica .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "Codice PLC generato con successo",
                noIO: "Definire almeno un ingresso o un'uscita.",
                copied: "Codice copiato negli appunti",
                downloaded: "File scaricato: ",
                noCode: "Nessun codice da scaricare. Genera prima.",
                noCopy: "Nessun codice da copiare."
            },
            language: "Lingua",
            aiMode: "Modalità IA",
            footer: "Compatibile con 35+ marchi di PLC industriali"
        }
    },
    "zh": {
        name: "Chinese",
        native: "中文",
        dir: "ltr",
        ui: {
            title: "PLC代码生成器 Pro",
            subtitle: "支持市场上所有PLC的代码生成器",
            config: "配置",
            plcType: "PLC类型",
            inputs: "输入 (I)",
            outputs: "输出 (O)",
            generate: "生成代码",
            generatedCode: "生成的代码",
            copy: "复制",
            download: "下载 .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "PLC代码生成成功",
                noIO: "请至少定义一个输入或输出。",
                copied: "代码已复制到剪贴板",
                downloaded: "文件已下载：",
                noCode: "没有代码可下载。请先生成。",
                noCopy: "没有代码可复制。"
            },
            language: "语言",
            aiMode: "AI模式",
            footer: "兼容35+工业PLC品牌"
        }
    },
    "ja": {
        name: "Japanese",
        native: "日本語",
        dir: "ltr",
        ui: {
            title: "PLCコードジェネレーター Pro",
            subtitle: "市場のすべてのPLCに対応するコードジェネレーター",
            config: "設定",
            plcType: "PLCタイプ",
            inputs: "入力 (I)",
            outputs: "出力 (O)",
            generate: "コード生成",
            generatedCode: "生成されたコード",
            copy: "コピー",
            download: "ダウンロード .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "PLCコードが正常に生成されました",
                noIO: "少なくとも1つの入力または出力を定義してください。",
                copied: "コードがクリップボードにコピーされました",
                downloaded: "ファイルがダウンロードされました：",
                noCode: "ダウンロードするコードがありません。先に生成してください。",
                noCopy: "コピーするコードがありません。"
            },
            language: "言語",
            aiMode: "AIモード",
            footer: "35以上の産業用PLCブランドに対応"
        }
    },
    "ko": {
        name: "Korean",
        native: "한국어",
        dir: "ltr",
        ui: {
            title: "PLC 코드 생성기 Pro",
            subtitle: "시장의 모든 PLC를 위한 코드 생성기",
            config: "설정",
            plcType: "PLC 유형",
            inputs: "입력 (I)",
            outputs: "출력 (O)",
            generate: "코드 생성",
            generatedCode: "생성된 코드",
            copy: "복사",
            download: "다운로드 .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "PLC 코드가 성공적으로 생성되었습니다",
                noIO: "최소 하나의 입력 또는 출력을 정의하십시오.",
                copied: "코드가 클립보드에 복사되었습니다",
                downloaded: "파일 다운로드 완료: ",
                noCode: "다운로드할 코드가 없습니다. 먼저 생성하세요.",
                noCopy: "복사할 코드가 없습니다."
            },
            language: "언어",
            aiMode: "AI 모드",
            footer: "35개 이상의 산업용 PLC 브랜드 호환"
        }
    },
    "ar": {
        name: "Arabic",
        native: "العربية",
        dir: "rtl",
        ui: {
            title: "مولد أكواد PLC Pro",
            subtitle: "مولد أكواد لجميع أجهزة PLC في السوق",
            config: "الإعدادات",
            plcType: "نوع PLC",
            inputs: "المدخلات (I)",
            outputs: "المخرجات (O)",
            generate: "توليد الكود",
            generatedCode: "الكود المُولَّد",
            copy: "نسخ",
            download: "تحميل .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "تم توليد كود PLC بنجاح",
                noIO: "يرجى تحديد مدخل أو مخرج واحد على الأقل.",
                copied: "تم نسخ الكود إلى الحافظة",
                downloaded: "تم تحميل الملف: ",
                noCode: "لا يوجد كود للتحميل. قم بالتوليد أولاً.",
                noCopy: "لا يوجد كود للنسخ."
            },
            language: "اللغة",
            aiMode: "وضع الذكاء الاصطناعي",
            footer: "متوافق مع أكثر من 35 علامة تجارية صناعية"
        }
    },
    "ru": {
        name: "Russian",
        native: "Русский",
        dir: "ltr",
        ui: {
            title: "PLC Code Generator Pro",
            subtitle: "Генератор кода для всех ПЛК на рынке",
            config: "Конфигурация",
            plcType: "Тип ПЛК",
            inputs: "Входы (I)",
            outputs: "Выходы (O)",
            generate: "Сгенерировать код",
            generatedCode: "Сгенерированный код",
            copy: "Копировать",
            download: "Скачать .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "Код ПЛК успешно сгенерирован",
                noIO: "Определите хотя бы один вход или выход.",
                copied: "Код скопирован в буфер обмена",
                downloaded: "Файл загружен: ",
                noCode: "Нет кода для загрузки. Сначала сгенерируйте.",
                noCopy: "Нет кода для копирования."
            },
            language: "Язык",
            aiMode: "Режим ИИ",
            footer: "Совместим с 35+ промышленными марками ПЛК"
        }
    },
    "hi": {
        name: "Hindi",
        native: "हिन्दी",
        dir: "ltr",
        ui: {
            title: "PLC कोड जनरेटर Pro",
            subtitle: "बाज़ार के सभी PLC के लिए कोड जनरेटर",
            config: "कॉन्फ़िगरेशन",
            plcType: "PLC प्रकार",
            inputs: "इनपुट (I)",
            outputs: "आउटपुट (O)",
            generate: "कोड जनरेट करें",
            generatedCode: "जनरेट किया गया कोड",
            copy: "कॉपी",
            download: "डाउनलोड .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "PLC कोड सफलतापूर्वक जनरेट किया गया",
                noIO: "कृपया कम से कम एक इनपुट या आउटपुट परिभाषित करें।",
                copied: "कोड क्लिपबोर्ड पर कॉपी किया गया",
                downloaded: "फ़ाइल डाउनलोड की गई: ",
                noCode: "डाउनलोड करने के लिए कोई कोड नहीं। पहले जनरेट करें।",
                noCopy: "कॉपी करने के लिए कोई कोड नहीं।"
            },
            language: "भाषा",
            aiMode: "AI मोड",
            footer: "35+ औद्योगिक PLC ब्रांडों के साथ संगत"
        }
    },
    "tr": {
        name: "Turkish",
        native: "Türkçe",
        dir: "ltr",
        ui: {
            title: "PLC Kod Üreteci Pro",
            subtitle: "Pazardaki tüm PLC'ler için kod üreteci",
            config: "Yapılandırma",
            plcType: "PLC Tipi",
            inputs: "Girişler (I)",
            outputs: "Çıkışlar (O)",
            generate: "Kod Üret",
            generatedCode: "Üretilen Kod",
            copy: "Kopyala",
            download: "İndir .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "PLC kodu başarıyla üretildi",
                noIO: "Lütfen en az bir giriş veya çıkış tanımlayın.",
                copied: "Kod panoya kopyalandı",
                downloaded: "Dosya indirildi: ",
                noCode: "İndirilecek kod yok. Önce üretin.",
                noCopy: "Kopyalanacak kod yok."
            },
            language: "Dil",
            aiMode: "AI Modu",
            footer: "35+ endüstriyel PLC markasıyla uyumlu"
        }
    },
    "pl": {
        name: "Polish",
        native: "Polski",
        dir: "ltr",
        ui: {
            title: "PLC Code Generator Pro",
            subtitle: "Generator kodu dla wszystkich sterowników PLC",
            config: "Konfiguracja",
            plcType: "Typ PLC",
            inputs: "Wejścia (I)",
            outputs: "Wyjścia (O)",
            generate: "Generuj Kod",
            generatedCode: "Wygenerowany Kod",
            copy: "Kopiuj",
            download: "Pobierz .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "Kod PLC wygenerowany pomyślnie",
                noIO: "Zdefiniuj co najmniej jedno wejście lub wyjście.",
                copied: "Kod skopiowany do schowka",
                downloaded: "Plik pobrany: ",
                noCode: "Brak kodu do pobrania. Najpierw wygeneruj.",
                noCopy: "Brak kodu do skopiowania."
            },
            language: "Język",
            aiMode: "Tryb AI",
            footer: "Kompatybilny z 35+ markami przemysłowych PLC"
        }
    },
    "nl": {
        name: "Dutch",
        native: "Nederlands",
        dir: "ltr",
        ui: {
            title: "PLC Code Generator Pro",
            subtitle: "Codegenerator voor alle PLC's op de markt",
            config: "Configuratie",
            plcType: "PLC Type",
            inputs: "Ingangen (I)",
            outputs: "Uitgangen (O)",
            generate: "Code Genereren",
            generatedCode: "Gegenereerde Code",
            copy: "Kopiëren",
            download: "Downloaden .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "PLC-code succesvol gegenereerd",
                noIO: "Definieer minimaal één ingang of uitgang.",
                copied: "Code gekopieerd naar klembord",
                downloaded: "Bestand gedownload: ",
                noCode: "Geen code om te downloaden. Genereer eerst.",
                noCopy: "Geen code om te kopiëren."
            },
            language: "Taal",
            aiMode: "AI-modus",
            footer: "Compatibel met 35+ industriële PLC-merken"
        }
    },
    "sv": {
        name: "Swedish",
        native: "Svenska",
        dir: "ltr",
        ui: {
            title: "PLC Code Generator Pro",
            subtitle: "Kodgenerator för alla PLC:er på marknaden",
            config: "Konfiguration",
            plcType: "PLC-typ",
            inputs: "Ingångar (I)",
            outputs: "Utgångar (O)",
            generate: "Generera Kod",
            generatedCode: "Genererad Kod",
            copy: "Kopiera",
            download: "Ladda ner .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "PLC-kod genererad framgångsrikt",
                noIO: "Definiera minst en ingång eller utgång.",
                copied: "Kod kopierad till urklipp",
                downloaded: "Fil nedladdad: ",
                noCode: "Ingen kod att ladda ner. Generera först.",
                noCopy: "Ingen kod att kopiera."
            },
            language: "Språk",
            aiMode: "AI-läge",
            footer: "Kompatibel med 35+ industriella PLC-märken"
        }
    },
    "th": {
        name: "Thai",
        native: "ไทย",
        dir: "ltr",
        ui: {
            title: "PLC Code Generator Pro",
            subtitle: "เครื่องมือสร้างโค้ดสำหรับ PLC ทุกยี่ห้อในตลาด",
            config: "การตั้งค่า",
            plcType: "ประเภท PLC",
            inputs: "อินพุต (I)",
            outputs: "เอาต์พุต (O)",
            generate: "สร้างโค้ด",
            generatedCode: "โค้ดที่สร้าง",
            copy: "คัดลอก",
            download: "ดาวน์โหลด .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "สร้างโค้ด PLC สำเร็จ",
                noIO: "กรุณากำหนดอินพุตหรือเอาต์พุตอย่างน้อยหนึ่งรายการ",
                copied: "คัดลอกโค้ดไปยังคลิปบอร์ดแล้ว",
                downloaded: "ดาวน์โหลดไฟล์แล้ว: ",
                noCode: "ไม่มีโค้ดให้ดาวน์โหลด กรุณาสร้างก่อน",
                noCopy: "ไม่มีโค้ดให้คัดลอก"
            },
            language: "ภาษา",
            aiMode: "โหมด AI",
            footer: "รองรับแบรนด์ PLC อุตสาหกรรมมากกว่า 35 แบรนด์"
        }
    },
    "vi": {
        name: "Vietnamese",
        native: "Tiếng Việt",
        dir: "ltr",
        ui: {
            title: "PLC Code Generator Pro",
            subtitle: "Công cụ tạo mã cho tất cả PLC trên thị trường",
            config: "Cấu hình",
            plcType: "Loại PLC",
            inputs: "Đầu vào (I)",
            outputs: "Đầu ra (O)",
            generate: "Tạo Mã",
            generatedCode: "Mã Đã Tạo",
            copy: "Sao chép",
            download: "Tải xuống .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "Đã tạo mã PLC thành công",
                noIO: "Vui lòng xác định ít nhất một đầu vào hoặc đầu ra.",
                copied: "Đã sao chép mã vào bộ nhớ tạm",
                downloaded: "Đã tải xuống tệp: ",
                noCode: "Không có mã để tải xuống. Hãy tạo trước.",
                noCopy: "Không có mã để sao chép."
            },
            language: "Ngôn ngữ",
            aiMode: "Chế độ AI",
            footer: "Tương thích với hơn 35 thương hiệu PLC công nghiệp"
        }
    },
    "id": {
        name: "Indonesian",
        native: "Bahasa Indonesia",
        dir: "ltr",
        ui: {
            title: "PLC Code Generator Pro",
            subtitle: "Generator kode untuk semua PLC di pasar",
            config: "Konfigurasi",
            plcType: "Tipe PLC",
            inputs: "Input (I)",
            outputs: "Output (O)",
            generate: "Generate Kode",
            generatedCode: "Kode yang Dihasilkan",
            copy: "Salin",
            download: "Unduh .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "Kode PLC berhasil dihasilkan",
                noIO: "Silakan tentukan setidaknya satu input atau output.",
                copied: "Kode disalin ke clipboard",
                downloaded: "File diunduh: ",
                noCode: "Tidak ada kode untuk diunduh. Generate dulu.",
                noCopy: "Tidak ada kode untuk disalin."
            },
            language: "Bahasa",
            aiMode: "Mode AI",
            footer: "Kompatibel dengan 35+ merek PLC industri"
        }
    },
    "uk": {
        name: "Ukrainian",
        native: "Українська",
        dir: "ltr",
        ui: {
            title: "PLC Code Generator Pro",
            subtitle: "Генератор коду для всіх ПЛК на ринку",
            config: "Конфігурація",
            plcType: "Тип ПЛК",
            inputs: "Входи (I)",
            outputs: "Виходи (O)",
            generate: "Згенерувати код",
            generatedCode: "Згенерований код",
            copy: "Копіювати",
            download: "Завантажити .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "Код ПЛК успішно згенеровано",
                noIO: "Визначте хоча б один вхід або вихід.",
                copied: "Код скопійовано в буфер обміну",
                downloaded: "Файл завантажено: ",
                noCode: "Немає коду для завантаження. Спочатку згенеруйте.",
                noCopy: "Немає коду для копіювання."
            },
            language: "Мова",
            aiMode: "Режим ШІ",
            footer: "Сумісний з 35+ промисловими марками ПЛК"
        }
    },
    "cs": {
        name: "Czech",
        native: "Čeština",
        dir: "ltr",
        ui: {
            title: "PLC Code Generator Pro",
            subtitle: "Generátor kódu pro všechny PLC na trhu",
            config: "Konfigurace",
            plcType: "Typ PLC",
            inputs: "Vstupy (I)",
            outputs: "Výstupy (O)",
            generate: "Generovat kód",
            generatedCode: "Vygenerovaný kód",
            copy: "Kopírovat",
            download: "Stáhnout .txt",
            platforms: { windows: "Windows", ios: "iOS", android: "Android" },
            notifications: {
                success: "PLC kód úspěšně vygenerován",
                noIO: "Definujte alespoň jeden vstup nebo výstup.",
                copied: "Kód zkopírován do schránky",
                downloaded: "Soubor stažen: ",
                noCode: "Žádný kód ke stažení. Nejprve vygenerujte.",
                noCopy: "Žádný kód ke kopírování."
            },
            language: "Jazyk",
            aiMode: "AI režim",
            footer: "Kompatibilní s 35+ průmyslovými značkami PLC"
        }
    }
};

let currentLang = "es";

/**
 * Obtiene la lista de idiomas disponibles.
 * @returns {Array} Lista de {code, name, native}
 */
function getAvailableLanguages() {
    return Object.entries(translations).map(([code, data]) => ({
        code,
        name: data.name,
        native: data.native
    }));
}

/**
 * Establece el idioma actual.
 * @param {string} langCode - Código de idioma (es, en, fr, etc.)
 */
function setLanguage(langCode) {
    if (translations[langCode]) {
        currentLang = langCode;
        return true;
    }
    return false;
}

/**
 * Obtiene el idioma actual.
 * @returns {string} Código de idioma actual
 */
function getCurrentLanguage() {
    return currentLang;
}

/**
 * Obtiene una traducción por clave.
 * @param {string} key - Clave separada por puntos (ej: "notifications.success")
 * @returns {string} Texto traducido
 */
function t(key) {
    const keys = key.split(".");
    let result = translations[currentLang].ui;
    for (const k of keys) {
        if (result && typeof result === "object" && k in result) {
            result = result[k];
        } else {
            // Fallback a español
            result = translations["es"].ui;
            for (const fk of keys) {
                if (result && typeof result === "object" && fk in result) {
                    result = result[fk];
                } else {
                    return key;
                }
            }
            return result;
        }
    }
    return result;
}

/**
 * Obtiene la dirección de texto del idioma actual.
 * @returns {string} "ltr" o "rtl"
 */
function getTextDirection() {
    return translations[currentLang].dir || "ltr";
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { translations, getAvailableLanguages, setLanguage, getCurrentLanguage, t, getTextDirection };
}
