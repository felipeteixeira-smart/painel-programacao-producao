/**
 * Painel de Programação de Produção
 * Application logic: file parsing, table rendering, data persistence
 */

// ==========================================
// State Management
// ==========================================
const AppState = {
    weeks: {},          // Map of week name -> Array of items: { "Semana 35": [...] }
    currentWeek: '',    // Currently active week name
    data: [],           // Array of production items for active week
    filteredIds: null,  // Set of visible item IDs after filter
};

const STORAGE_WEEKS_KEY = 'producao_dashboard_weeks_data';
const STORAGE_LEGACY_KEY = 'producao_dashboard_data';
const STORAGE_LEGACY_META_KEY = 'producao_dashboard_meta';

// ==========================================
// Product Descriptions Dictionary (IDITEM → DESC_ITEM)
// ==========================================
const PRODUCT_DESCRIPTIONS = {
    "184": "PERFIL FORRO CANTONEIRA 14 X 30 X 0,5 X 3000MM Z275",
    "139": "PERFIL FORRO CANTONEIRA 25 X 30 X 0,5 X 3000MM Z275",
    "138": "PERFIL FORRO F530 0,48 X 3000MM Z120",
    "287": "PERFIL FORRO TABICA BRANCA 0,5 X 3000MM Z275",
    "26351": "DW GUIA 48 X 0,5 X 2750MM Z275",
    "26350": "DW GUIA 48 X 0,5 X 2800MM Z275",
    "135": "DW GUIA 48 X 0,5 X 3000MM Z275",
    "315": "DW GUIA 70 X 0,5 X 3000MM Z275",
    "328": "DW GUIA 90 X 0,5 X 3000MM Z275",
    "11167": "DW MONTANTE 48 X 0,48 X 2000MM Z120",
    "11168": "DW MONTANTE 48 X 0,48 X 2400MM Z120",
    "3113": "DW MONTANTE 48 X 0,48 X 2500MM Z120",
    "29511": "DW MONTANTE 48 X 0,48 X 2530MM Z120",
    "22995": "DW MONTANTE 48 X 0,48 X 2590MM Z120",
    "11111": "DW MONTANTE 48 X 0,48 X 2600MM Z120",
    "22998": "DW MONTANTE 48 X 0,48 X 2610MM Z120",
    "29053": "DW MONTANTE 48 X 0,48 X 2630MM Z120",
    "23000": "DW MONTANTE 48 X 0,48 X 2660MM Z120",
    "23002": "DW MONTANTE 48 X 0,48 X 2680MM Z120",
    "9777": "DW MONTANTE 48 X 0,48 X 2700MM Z120",
    "11384": "DW MONTANTE 48 X 0,48 X 2730MM Z120",
    "29713": "DW MONTANTE 48 X 0,48 X 2730MM Z120",
    "22978": "DW MONTANTE 48 X 0,48 X 2750MM Z120",
    "3626": "DW MONTANTE 48 X 0,48 X 2800MM Z120",
    "24169": "DW MONTANTE 48 X 0,48 X 2820MM Z120",
    "30973": "DW MONTANTE 48 X 0,48 X 2850MM Z120",
    "11385": "DW MONTANTE 48 X 0,48 X 2860MM Z120",
    "134": "DW MONTANTE 48 X 0,48 X 3000MM Z120",
    "31965": "DW MONTANTE 48 X 0,48 X 3100MM Z120",
    "31966": "DW MONTANTE 48 X 0,48 X 3150MM Z120",
    "31423": "DW MONTANTE 48 X 0,48 X 3200MM Z120",
    "31424": "DW MONTANTE 48 X 0,48 X 3500MM Z120",
    "30504": "DW MONTANTE 48 X 0,48 X 4500MM Z120",
    "22979": "DW MONTANTE 70 X 0,48 X 2050MM Z120",
    "22980": "DW MONTANTE 70 X 0,48 X 2250MM Z120",
    "28944": "DW MONTANTE 70 X 0,48 X 2300MM Z120",
    "21822": "DW MONTANTE 70 X 0,48 X 2400MM Z120",
    "3627": "DW MONTANTE 70 X 0,48 X 2500MM Z120",
    "29512": "DW MONTANTE 70 X 0,48 X 2530MM Z120",
    "6905": "DW MONTANTE 70 X 0,48 X 2550MM Z120",
    "22994": "DW MONTANTE 70 X 0,48 X 2590MM Z120",
    "11110": "DW MONTANTE 70 X 0,48 X 2600MM Z120",
    "22997": "DW MONTANTE 70 X 0,48 X 2610MM Z120",
    "10588": "DW MONTANTE 70 X 0,48 X 2620MM Z120",
    "30174": "DW MONTANTE 70 X 0,48 X 2630MM Z120",
    "22999": "DW MONTANTE 70 X 0,48 X 2660MM Z120",
    "23001": "DW MONTANTE 70 X 0,48 X 2680MM Z120",
    "9776": "DW MONTANTE 70 X 0,48 X 2700MM Z120",
    "22981": "DW MONTANTE 70 X 0,48 X 2750MM Z120",
    "3628": "DW MONTANTE 70 X 0,48 X 2800MM Z120",
    "24170": "DW MONTANTE 70 X 0,48 X 2820MM Z120",
    "30974": "DW MONTANTE 70 X 0,48 X 2850MM Z120",
    "11387": "DW MONTANTE 70 X 0,48 X 2860MM Z120",
    "136": "DW MONTANTE 70 X 0,48 X 3000MM Z120",
    "31969": "DW MONTANTE 70 X 0,48 X 3100MM Z120",
    "31970": "DW MONTANTE 70 X 0,48 X 3150MM Z120",
    "31426": "DW MONTANTE 70 X 0,48 X 3200MM Z120",
    "29828": "DW MONTANTE 70 X 0,48 X 3400MM Z120",
    "32008": "DW MONTANTE 70 X 0,48 X 3660MM Z120",
    "33059": "DW MONTANTE 70 X 0,48 X 3750MM Z120",
    "31656": "DW MONTANTE 70 X 0,48 X 4400MM Z120",
    "30092": "DW MONTANTE 70 X 0,48 X 4500MM Z120",
    "29700": "DW MONTANTE 70 X 0,48 X 5600MM Z275",
    "31654": "DW MONTANTE 90 X 0,48 X 2530MM Z120",
    "22996": "DW MONTANTE 90 X 0,48 X 2590MM Z120",
    "28945": "DW MONTANTE 90 X 0,48 X 2600MM Z120",
    "29884": "DW MONTANTE 90 X 0,48 X 2630MM Z120",
    "22916": "DW MONTANTE 90 X 0,48 X 2700MM Z120",
    "29716": "DW MONTANTE 90 X 0,48 X 2730MM Z120",
    "22982": "DW MONTANTE 90 X 0,48 X 2750MM Z120",
    "26089": "DW MONTANTE 90 X 0,48 X 2800MM Z120",
    "31984": "DW MONTANTE 90 X 0,48 X 2850MM Z120",
    "137": "DW MONTANTE 90 X 0,48 X 3000MM Z120",
    "31971": "DW MONTANTE 90 X 0,48 X 3100MM Z120",
    "31972": "DW MONTANTE 90 X 0,48 X 3150MM Z120",
    "31427": "DW MONTANTE 90 X 0,48 X 3200MM Z120",
    "29890": "DW MONTANTE 90 X 0,48 X 3400MM Z120",
    "31216": "DW MONTANTE 90 X 0,48 X 3500MM Z120",
    "32010": "DW MONTANTE 90 X 0,48 X 3800MM Z120",
    "30098": "DW MONTANTE 90 X 0,48 X 4500MM Z120",
    "25939": "LSF RIPA/CARTOLA 0,80 X 30 X 20 X 3000MM (LE230MPAZ275G/M2)",
    "1019": "LSF FITA CONTRAVENTAMENTO 90 X 0,95 X 15000MM (LE230MPA/Z275G/M2)",
    "11369": "LSF ANCORADOR 3,00 - 190 X 50 X 50MM",
    "5455": "LSF KIT TENSIONADOR 40MM",
    "11244": "LSF FITA CONTRAVENTAMENTO 40 X 0,80 X 15000MM (LE230MPA / Z275G/M2)",
    "3089": "LSF CHAPA L 0,95 - 89 X 89 X 3000MM (LE230MPA / Z275G/M2)",
    "825": "LSF FITA CONTRAVENTAMENTO 40 X 0,95 X 15000MM (LE230MPA / Z275G/M2)",
    "11010": "LSF CANTONEIRA 2,00 - 65 X 89 X 65MM",
    "11368": "LSF CHAPA GOUSSET 1,25 150 X 150MM (LE230MPA / Z275G/M2)",
    "2522": "LSF CHAPA ANGULO 135o 0,95 - 89 X 89 X 3000MM (LE230MPA / Z275G/M2)",
    "2523": "LSF CHAPA L 1,25 - 35 X 192 X 3000MM (LE230MPA / Z275G/M2)",
    "2521": "CHAPA DE REFORCO 600 X 300 X 1,25MM Z275 - 28851",
    "27646": "LSF FITA CONTRAVENTAMENTO 90 X 0,80 X 15000MM (LE230MPA / Z275G/M2)",
    "5454": "LSF KIT TENSIONADOR 90MM",
    "3102": "LSF CANTONEIRA L S/ FURO 1,25 - 89 X 89 X 89MM",
    "9763": "LSF GUIA 120 X 0,95 X 6000MM (LE230MPA / Z275G/M2)",
    "31782": "LSF GUIA 140 X 0,80 X 3000MM (LE230MPA / Z275G/M2)",
    "31780": "LSF GUIA 140 X 0,80 X 6000MM (LE230MPA / Z275G/M2)",
    "724": "LSF GUIA 140 X 0,95 X 6000MM (LE230MPA / Z275G/M2)",
    "9300": "LSF GUIA 140 X 0,95 X 6000MM (LE230MPA / Z350G/M2)",
    "985": "LSF GUIA 140 X 1,25 X 6000MM (LE230MPA / Z350G/M2)",
    "1069": "LSF GUIA 200 X 0,95 X 6000MM (LE230MPA / Z275G/M2)",
    "2941": "LSF GUIA 200 X 0,95 X 6000MM (LE230MPA / Z350G/M2)",
    "986": "LSF GUIA 200 X 1,25 X 6000MM (LE230MPA / Z350G/M2)",
    "11137": "LSF GUIA 200 X 2,00 X 6000MM (LE230MPA / Z275G/M2)",
    "11705": "LSF GUIA 200 X 2,00 X 6000MM (LE230MPA / Z350G/M2)",
    "9442": "LSF GUIA 70 X 0,80 X 6000MM (LE230MPA / Z275G/M2)",
    "9443": "LSF GUIA 70 X 0,95 X 6000MM (LE230MPA / Z275G/M2)",
    "2514": "LSF GUIA 90 X 0,80 X 3000MM (LE230MPA / Z275G/M2)",
    "1412": "LSF GUIA 90 X 0,80 X 6000MM (LE230MPA / Z275G/M2)",
    "1402": "LSF GUIA 90 X 0,95 X 3000MM (LE230MPA / Z275G/M2)",
    "298": "LSF GUIA 90 X 0,95 X 6000MM (LE230MPA / Z275G/M2)",
    "2565": "LSF GUIA 90 X 0,95 X 6000MM (LE230MPA / Z350G/M2)",
    "12145": "LSF GUIA 90 X 1,25 X 3000MM (LE230MPA / Z275G/M2)",
    "2581": "LSF GUIA 90 X 1,25 X 6000MM (LE230MPA / Z275G/M2)",
    "28621": "LSF GUIA 90 X 1,25 X 6000MM (LE230MPA / Z350G/M2)",
    "31781": "LSF MONTANTE C/ FURO 140 X 0,80 X 3000MM (LE230MPA / Z275G/M2)",
    "31779": "LSF MONTANTE C/ FURO 140 X 0,80 X 6000MM (LE230MPA / Z275G/M2)",
    "5060": "LSF MONTANTE C/ FURO 140 X 0,95 X 3000MM (LE230MPA / Z275G/M2)",
    "296": "LSF MONTANTE C/ FURO 140 X 0,95 X 6000MM (LE230MPA / Z275G/M2)",
    "9301": "LSF MONTANTE C/ FURO 140 X 0,95 X 6000MM (LE230MPA / Z350G/M2)",
    "987": "LSF MONTANTE C/ FURO 140 X 1,25 X 6000MM (LE230MPA / Z350G/M2)",
    "588": "LSF MONTANTE C/ FURO 200 X 0,95 X 6000MM (LE230MPA / Z275G/M2)",
    "1692": "LSF MONTANTE C/ FURO 200 X 0,95 X 6000MM (LE230MPA / Z350G/M2)",
    "25974": "LSF MONTANTE C/ FURO 200 X 1,25 X 6000MM (LE230MPA / Z275G/M2)",
    "988": "LSF MONTANTE C/ FURO 200 X 1,25 X 6000MM (LE230MPA / Z350G/M2)",
    "5059": "LSF MONTANTE C/ FURO 70 X 0,80 X 6000MM (LE230MPA / Z275G/M2)",
    "3095": "LSF MONTANTE C/ FURO 70 X 0,95 X 6000MM (LE230MPA / Z275G/M2)",
    "3081": "LSF MONTANTE C/ FURO 70 X 0,95 X 6000MM (LE230MPA / Z350G/M2)",
    "2517": "LSF MONTANTE C/ FURO 90 X 0,80 X 3000MM (LE230MPA / Z275G/M2)",
    "1413": "LSF MONTANTE C/ FURO 90 X 0,80 X 6000MM (LE230MPA / Z275G/M2)",
    "2073": "LSF MONTANTE C/ FURO 90 X 0,95 X 3000MM (LE230MPA / Z275G/M2)",
    "297": "LSF MONTANTE C/ FURO 90 X 0,95 X 6000MM (LE230MPA / Z275G/M2)",
    "1691": "LSF MONTANTE C/ FURO 90 X 0,95 X 6000MM (LE230MPA / Z350G/M2)",
    "2560": "LSF MONTANTE C/ FURO 90 X 1,25 X 6000MM (LE230MPA / Z275G/M2)",
    "2580": "LSF MONTANTE C/ FURO 90 X 1,25 X 6000MM (LE230MPA / Z350G/M2)",
    "5981": "LSF MONTANTE S/ FURO 140 X 0,95 X 6000MM (LE230MPA / Z275G/M2)",
    "5984": "LSF MONTANTE S/ FURO 140 X 1,25 X 6000MM (LE230MPA / Z275G/M2)",
    "5980": "LSF MONTANTE S/ FURO 200 X 0,95 X 6000MM (LE230MPA / Z275G/M2)",
    "5995": "LSF MONTANTE S/ FURO 200 X 1,25 X 6000MM (LE230MPA / Z275G/M2)",
    "3092": "LSF MONTANTE S/ FURO 200 X 2,00 X 6000MM (LE230MPA / Z275G/M2)",
    "11704": "LSF MONTANTE S/ FURO 200 X 2,00 X 6000MM (LE230MPA / Z350G/M2)",
    "3099": "LSF MONTANTE S/ FURO 250 X 1,25 X 6000MM (LE230MPA / Z275G/M2)",
    "3085": "LSF MONTANTE S/ FURO 250 X 2,00 X 6000MM (LE230MPA / Z275G/M2)",
    "6001": "LSF MONTANTE S/ FURO 90 X 0,95 X 6000MM (LE230MPA / Z275G/M2)",
    "5999": "LSF MONTANTE S/ FURO 90 X 1,25 X 6000MM (LE230MPA / Z275G/M2)",
    "9762": "LSF MONTANTE S/FURO 120 X 0,95 X 6000MM (LE230MPA / Z275G/M2)",
};

/**
 * Look up a product description by its code.
 * Falls back to empty string if not found.
 */
/**
 * Look up a product description by its code.
 * Standardizes string keys and numeric lookups.
 */
function getProductDescription(codigo) {
    if (!codigo) return '';
    const keyStr = String(codigo).trim();
    if (PRODUCT_DESCRIPTIONS[keyStr]) {
        return PRODUCT_DESCRIPTIONS[keyStr];
    }
    // Try removing leading zeros if numeric (e.g. "0136" -> "136")
    const keyNum = parseInt(keyStr, 10);
    if (!isNaN(keyNum) && PRODUCT_DESCRIPTIONS[String(keyNum)]) {
        return PRODUCT_DESCRIPTIONS[String(keyNum)];
    }
    return '';
}

// ==========================================
// Week helpers
// ==========================================
function getCurrentWeekLabel() {
    const now = new Date();
    const year = now.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor((now - startOfYear) / 86400000);
    const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `Semana ${weekNum}`;
}

function normalizeWeekName(val, fallback) {
    if (val == null) return fallback || getCurrentWeekLabel();
    let str = String(val).trim();
    if (!str) return fallback || getCurrentWeekLabel();

    // Check if integer like 35 or "35"
    if (/^\d{1,2}$/.test(str)) {
        return `Semana ${parseInt(str, 10)}`;
    }
    // Check if ISO format like "2026-W35"
    const isoMatch = str.match(/^(\d{4})-W(\d{1,2})$/i);
    if (isoMatch) {
        return `Semana ${parseInt(isoMatch[2], 10)}`;
    }
    // Check if "Semana 35", "SEM 35", "SEMANA 35", etc.
    const semMatch = str.match(/^(?:semana|sem\.?)\s*(\d{1,2})(?:\s*[\/\-]\s*(\d{4}))?$/i);
    if (semMatch) {
        const num = parseInt(semMatch[1], 10);
        return `Semana ${num}`;
    }
    return str;
}

// ==========================================
// Column mapping helpers
// ==========================================
const COLUMN_MAPS = {
    codigo: ['codigo_produto', 'codigo', 'código', 'código do produto', 'codigo do produto', 'item', 'iditem', 'cod', 'cod_produto', 'produto', 'code', 'sku'],
    descricao: ['desc_item', 'descricao', 'descrição', 'descricao_produto', 'descrição do produto', 'description'],
    quantidade: ['quantidade_programada', 'quantidade', 'qtd_programada', 'qtd', 'producao', 'produção', 'produção (peças)', 'producao (pecas)', 'peças', 'pecas', 'qty'],
    estab: ['codigo_estab', 'estab', 'estabelecimento', 'codigo_estabelecimento', 'código_estab', 'cod_estab', 'filial', 'unidade', 'plant'],
    observacoes: ['observacoes', 'observações', 'obs', 'observacao', 'observação', 'notes', 'nota', 'notas'],
    semana: ['semana_plano', 'semana do plano', 'semana_do_plano', 'semana plano', 'semana', 'sem', 'week', 'semana_prog', 'semana_programada', 'semana_programacao'],
};

function findColumn(headers, mapKey) {
    const candidates = COLUMN_MAPS[mapKey];
    const normalized = headers.map(h => h.toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    for (const candidate of candidates) {
        const normCandidate = candidate.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const idx = normalized.indexOf(normCandidate);
        if (idx !== -1) return idx;
    }
    // Partial match
    for (const candidate of candidates) {
        const normCandidate = candidate.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const idx = normalized.findIndex(h => h.includes(normCandidate) || normCandidate.includes(h));
        if (idx !== -1) return idx;
    }
    return -1;
}

// ==========================================
// File Parsing
// ==========================================
function parseFile(file, fallbackWeek) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const ext = file.name.split('.').pop().toLowerCase();
        const defaultTargetWeek = fallbackWeek || AppState.currentWeek || getCurrentWeekLabel();

        reader.onload = (e) => {
            try {
                let workbook;
                if (ext === 'csv') {
                    workbook = XLSX.read(e.target.result, { type: 'string', raw: false });
                } else {
                    workbook = XLSX.read(e.target.result, { type: 'array' });
                }
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

                if (jsonData.length < 2) {
                    reject('O arquivo precisa ter pelo menos um cabeçalho e uma linha de dados.');
                    return;
                }

                const headers = jsonData[0];
                const colCodigo = findColumn(headers, 'codigo');
                const colDesc = findColumn(headers, 'descricao');
                const colQtd = findColumn(headers, 'quantidade');
                const colEstab = findColumn(headers, 'estab');
                const colObs = findColumn(headers, 'observacoes');
                const colSemana = findColumn(headers, 'semana');

                if (colCodigo === -1) {
                    reject('Coluna "Código do Produto" não encontrada. Verifique os nomes das colunas.');
                    return;
                }

                const items = [];
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    const codigo = row[colCodigo] != null ? String(row[colCodigo]).trim() : '';
                    if (!codigo) continue; // skip empty rows

                    // Description priority:
                    // 1. Look up in the official catalog (PRODUCT_DESCRIPTIONS)
                    // 2. If catalog returns a value, use it!
                    // 3. Otherwise check if CSV column has a description (and it's not just the code again)
                    let catalogDesc = getProductDescription(codigo);
                    let csvDesc = colDesc !== -1 ? String(row[colDesc] || '').trim() : '';

                    let descricao = catalogDesc;
                    if (!descricao && csvDesc && csvDesc !== codigo) {
                        descricao = csvDesc;
                    }

                    // Week resolution per row:
                    // If row has explicit non-empty week in CSV, respect it.
                    // Otherwise use defaultTargetWeek chosen by user on upload screen.
                    let rawSemana = colSemana !== -1 ? String(row[colSemana] || '').trim() : '';
                    let semanaItem = rawSemana ? normalizeWeekName(rawSemana, defaultTargetWeek) : defaultTargetWeek;

                    items.push({
                        id: generateId(),
                        codigo: codigo,
                        descricao: descricao,
                        quantidade: colQtd !== -1 ? parseNumber(row[colQtd]) : 0,
                        estab: colEstab !== -1 ? String(row[colEstab] || '').trim() : '',
                        observacoes: colObs !== -1 ? String(row[colObs] || '').trim() : '',
                        semana: semanaItem,
                        ordemProducao: '',
                        plano: { seg: 0, ter: 0, qua: 0, qui: 0, sex: 0, sab: 0 },
                        real: { seg: 0, ter: 0, qua: 0, qui: 0, sex: 0, sab: 0 },
                    });
                }

                if (items.length === 0) {
                    reject('Nenhum dado válido encontrado no arquivo.');
                    return;
                }

                resolve(items);
            } catch (err) {
                reject('Erro ao processar o arquivo: ' + err.message);
            }
        };

        reader.onerror = () => reject('Erro ao ler o arquivo.');

        if (ext === 'csv') {
            reader.readAsText(file, 'UTF-8');
        } else {
            reader.readAsArrayBuffer(file);
        }
    });
}

function parseNumber(val) {
    if (val == null) return 0;
    const str = String(val).replace(/[^\d.,\-]/g, '').replace(',', '.');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : Math.round(num);
}

function generateId() {
    return 'item_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
}

// ==========================================
// Data Persistence (localStorage)
// ==========================================
function saveData(showFeedback = true) {
    try {
        if (AppState.currentWeek) {
            AppState.weeks[AppState.currentWeek] = AppState.data;
        }
        const payload = {
            weeks: AppState.weeks,
            currentWeek: AppState.currentWeek,
            savedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_WEEKS_KEY, JSON.stringify(payload));
        showSaveIndicator();
        if (showFeedback) {
            showToast(`Programação da ${AppState.currentWeek} salva!`, 'success');
        }
    } catch (e) {
        if (showFeedback) {
            showToast('Erro ao salvar dados: ' + e.message, 'error');
        }
    }
}

function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_WEEKS_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.weeks && typeof parsed.weeks === 'object') {
                return parsed;
            }
        }
        // Legacy migration fallback
        const legacyRaw = localStorage.getItem(STORAGE_LEGACY_KEY);
        if (legacyRaw) {
            const legacyData = JSON.parse(legacyRaw);
            const legacyMeta = JSON.parse(localStorage.getItem(STORAGE_LEGACY_META_KEY) || '{}');
            const defaultWeek = normalizeWeekName(legacyMeta.weekLabel, getCurrentWeekLabel());
            const weeks = {};
            weeks[defaultWeek] = legacyData;
            return {
                weeks: weeks,
                currentWeek: defaultWeek,
                savedAt: legacyMeta.savedAt || new Date().toISOString(),
            };
        }
        return null;
    } catch {
        return null;
    }
}

function hasSavedData() {
    return localStorage.getItem(STORAGE_WEEKS_KEY) !== null || localStorage.getItem(STORAGE_LEGACY_KEY) !== null;
}

function clearSavedData() {
    localStorage.removeItem(STORAGE_WEEKS_KEY);
    localStorage.removeItem(STORAGE_LEGACY_KEY);
    localStorage.removeItem(STORAGE_LEGACY_META_KEY);
}

// ==========================================
// Status Calculation
// ==========================================
function calcTotal(weekObj) {
    return (weekObj.seg || 0) + (weekObj.ter || 0) + (weekObj.qua || 0) +
        (weekObj.qui || 0) + (weekObj.sex || 0) + (weekObj.sab || 0);
}

function calcStatus(item) {
    const totalPlano = calcTotal(item.plano);
    const totalReal = calcTotal(item.real);
    const qtd = item.quantidade;

    if (totalReal >= totalPlano && totalPlano > 0) return 'concluido';
    if (totalReal > 0 && totalReal < totalPlano) return 'parcial';
    if (totalPlano > 0 && totalReal === 0) return 'pendente';
    return 'nao_produzido';
}

function getStatusLabel(status) {
    const map = {
        concluido: 'Concluído',
        parcial: 'Parcial',
        pendente: 'Pendente',
        nao_produzido: 'Não Produzido',
        entregue: 'Entregue',
    };
    return map[status] || status;
}

function getStatusClass(status) {
    return 'status-' + status.replace('_', '-');
}

// ==========================================
// Table Rendering
// ==========================================
const DAYS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

function renderTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    AppState.data.forEach((item, index) => {
        const status = calcStatus(item);
        const totalPlano = calcTotal(item.plano);
        const totalReal = calcTotal(item.real);

        // Plano row
        const rowPlano = document.createElement('tr');
        rowPlano.className = 'row-plano';
        rowPlano.dataset.itemId = item.id;
        rowPlano.dataset.index = index;

        const descText = getProductDescription(item.codigo) || (item.descricao && item.descricao !== item.codigo ? item.descricao : '');
        const descDisplay = descText || '-';

        let planoHtml = '';
        planoHtml += `<td class="cell-item" rowspan="2">${escapeHtml(item.codigo)}</td>`;
        planoHtml += `<td class="cell-desc" rowspan="2" title="${escapeHtml(descDisplay)}">${escapeHtml(descDisplay)}</td>`;
        planoHtml += `<td class="cell-estab" rowspan="2">${escapeHtml(item.estab)}</td>`;
        planoHtml += `<td class="cell-qty" rowspan="2">${formatNumber(item.quantidade)}</td>`;
        planoHtml += `<td class="cell-obs" rowspan="2" title="${escapeHtml(item.observacoes)}">${escapeHtml(item.observacoes)}</td>`;
        planoHtml += `<td class="cell-op" rowspan="2">
            <input type="text" class="input-op" value="${escapeHtml(item.ordemProducao)}"
                   data-item-id="${item.id}" placeholder="OP"
                   title="Digite o número da Ordem de Produção">
        </td>`;
        planoHtml += `<td class="cell-day"><span class="type-label type-plano">Plano</span></td>`;

        DAYS.forEach(day => {
            planoHtml += `<td class="cell-day">
                <input type="number" class="input-day input-day-plano" min="0"
                       value="${item.plano[day] || ''}"
                       data-item-id="${item.id}" data-type="plano" data-day="${day}"
                       placeholder="0">
            </td>`;
        });

        planoHtml += `<td class="cell-total cell-day">${formatNumber(totalPlano)}</td>`;
        planoHtml += `<td class="cell-status" rowspan="2">
            <span class="status-badge ${getStatusClass(status)}">${getStatusLabel(status)}</span>
        </td>`;

        rowPlano.innerHTML = planoHtml;
        tbody.appendChild(rowPlano);

        // Real row
        const rowReal = document.createElement('tr');
        rowReal.className = 'row-real';
        rowReal.dataset.itemId = item.id;
        rowReal.dataset.index = index;

        let realHtml = '';
        realHtml += `<td class="cell-day"><span class="type-label type-real">Real</span></td>`;

        DAYS.forEach(day => {
            realHtml += `<td class="cell-day">
                <input type="number" class="input-day input-day-real" min="0"
                       value="${item.real[day] || ''}"
                       data-item-id="${item.id}" data-type="real" data-day="${day}"
                       placeholder="0">
            </td>`;
        });

        realHtml += `<td class="cell-total cell-day">${formatNumber(totalReal)}</td>`;

        rowReal.innerHTML = realHtml;
        tbody.appendChild(rowReal);
    });

    updateStats();
    applyFilters();
}

// ==========================================
// Stats & Progress
// ==========================================
function updateStats() {
    let total = AppState.data.length;
    let concluido = 0, parcial = 0, pendente = 0, naoProduzido = 0;
    let totalProgramado = 0, totalPlanejado = 0, totalRealizado = 0;

    AppState.data.forEach(item => {
        const status = calcStatus(item);
        if (status === 'concluido') concluido++;
        else if (status === 'parcial') parcial++;
        else if (status === 'pendente') pendente++;
        else naoProduzido++;

        totalProgramado += item.quantidade || 0;
        totalPlanejado += calcTotal(item.plano);
        totalRealizado += calcTotal(item.real);
    });

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-concluido').textContent = concluido;
    document.getElementById('stat-parcial').textContent = parcial;
    document.getElementById('stat-pendente').textContent = pendente + naoProduzido;

    document.getElementById('footer-total-programado').textContent = formatNumber(totalProgramado);
    document.getElementById('footer-total-planejado').textContent = formatNumber(totalPlanejado);
    document.getElementById('footer-total-realizado').textContent = formatNumber(totalRealizado);

    // Progress
    const pct = total > 0 ? Math.round((concluido / total) * 100) : 0;
    document.getElementById('progress-bar').style.width = pct + '%';
    document.getElementById('progress-text').textContent = pct + '% concluído';
}

// ==========================================
// Filtering
// ==========================================
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    const statusFilter = document.getElementById('filter-status').value;
    const estabFilter = document.getElementById('filter-estab').value;

    const rows = document.querySelectorAll('#table-body tr');
    const visibleIds = new Set();

    AppState.data.forEach(item => {
        const status = calcStatus(item);
        let visible = true;

        // Search
        if (searchTerm) {
            const desc = item.descricao || getProductDescription(item.codigo);
            const haystack = [item.codigo, desc, item.observacoes, item.estab, item.ordemProducao]
                .join(' ').toLowerCase();
            if (!haystack.includes(searchTerm)) visible = false;
        }

        // Status filter
        if (statusFilter !== 'todos') {
            if (statusFilter === 'pendente' && status !== 'pendente') visible = false;
            else if (statusFilter === 'concluido' && status !== 'concluido') visible = false;
            else if (statusFilter === 'parcial' && status !== 'parcial') visible = false;
            else if (statusFilter === 'nao_produzido' && status !== 'nao_produzido') visible = false;
        }

        // Estab filter
        if (estabFilter !== 'todos') {
            if (item.estab !== estabFilter) visible = false;
        }

        if (visible) visibleIds.add(item.id);
    });

    rows.forEach(row => {
        const itemId = row.dataset.itemId;
        if (visibleIds.has(itemId)) {
            row.classList.remove('row-hidden');
        } else {
            row.classList.add('row-hidden');
        }
    });
}

function populateEstabFilter() {
    const select = document.getElementById('filter-estab');
    const estabs = [...new Set(AppState.data.map(i => i.estab).filter(Boolean))].sort();
    select.innerHTML = '<option value="todos">Todos</option>';
    estabs.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e;
        opt.textContent = e;
        select.appendChild(opt);
    });
}

// ==========================================
// Event Handlers
// ==========================================
function setupEventListeners() {
    // File input
    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', handleFileSelect);

    // Drag & Drop
    const dropzone = document.getElementById('dropzone');
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) processFile(files[0]);
    });

    // Table event delegation
    document.getElementById('table-body').addEventListener('input', handleTableInput);

    // Search & Filters
    document.getElementById('search-input').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('filter-status').addEventListener('change', applyFilters);
    document.getElementById('filter-estab').addEventListener('change', applyFilters);

    // Week selector dropdown
    const weekSelect = document.getElementById('week-select');
    if (weekSelect) {
        weekSelect.addEventListener('change', (e) => {
            switchWeek(e.target.value);
        });
    }

    // Week navigation buttons
    const btnPrevWeek = document.getElementById('btn-prev-week');
    if (btnPrevWeek) {
        btnPrevWeek.addEventListener('click', () => navigateWeek(-1));
    }

    const btnNextWeek = document.getElementById('btn-next-week');
    if (btnNextWeek) {
        btnNextWeek.addEventListener('click', () => navigateWeek(1));
    }

    // Add new week button
    const btnAddWeek = document.getElementById('btn-add-week');
    if (btnAddWeek) {
        btnAddWeek.addEventListener('click', createNewWeek);
    }

    // Delete current week button
    const btnDelWeek = document.getElementById('btn-del-week');
    if (btnDelWeek) {
        btnDelWeek.addEventListener('click', deleteCurrentWeek);
    }

    // Calendar week picker button and input
    const btnCalendarWeek = document.getElementById('btn-calendar-week');
    const weekInput = document.getElementById('week-input');
    if (btnCalendarWeek && weekInput) {
        btnCalendarWeek.addEventListener('click', () => {
            if (weekInput.showPicker) {
                weekInput.showPicker();
            } else {
                weekInput.style.display = weekInput.style.display === 'none' ? 'inline-block' : 'none';
            }
        });
        weekInput.addEventListener('change', (e) => {
            if (e.target.value) {
                const normalized = normalizeWeekName(e.target.value);
                if (!AppState.weeks[normalized]) {
                    AppState.weeks[normalized] = [];
                }
                switchWeek(normalized);
                weekInput.style.display = 'none';
            }
        });
    }

    // Header buttons
    document.getElementById('btn-save').addEventListener('click', () => saveData(true));
    document.getElementById('btn-export').addEventListener('click', exportData);
    document.getElementById('btn-new-import').addEventListener('click', () => {
        showUploadScreen();
    });

    // Load saved button in upload screen
    const btnSaved = document.getElementById('btn-load-saved');
    btnSaved.addEventListener('click', () => {
        const saved = loadData();
        if (saved && saved.weeks) {
            AppState.weeks = saved.weeks;
            const weekKeys = Object.keys(AppState.weeks);
            AppState.currentWeek = saved.currentWeek && AppState.weeks[saved.currentWeek]
                ? saved.currentWeek
                : (weekKeys[0] || getCurrentWeekLabel());
            AppState.data = AppState.weeks[AppState.currentWeek] || [];
            showDashboard();
            showToast('Dados de todas as semanas carregados com sucesso!', 'success');
        }
    });

    // Initial check for saved data
    if (hasSavedData()) {
        btnSaved.style.display = 'inline-block';
        const saved = loadData();
        if (saved && saved.weeks) {
            AppState.weeks = saved.weeks;
            if (saved.currentWeek) AppState.currentWeek = saved.currentWeek;
        }
    }

    // Setup upload week controls & return button
    setupUploadWeekControls();
    const btnReturnDash = document.getElementById('btn-return-dashboard');
    if (btnReturnDash) {
        btnReturnDash.addEventListener('click', () => {
            if (AppState.data && AppState.data.length > 0) {
                showDashboard();
            }
        });
    }

    // Auto-save every 60s
    setInterval(() => {
        if (AppState.currentWeek && AppState.data.length > 0) {
            saveData(false);
        }
    }, 60000);
}

// ==========================================
// Upload Screen Week Configuration
// ==========================================
function setupUploadWeekControls() {
    const input = document.getElementById('upload-week-input');
    const prevBtn = document.getElementById('btn-quick-prev-week');
    const nextBtn = document.getElementById('btn-quick-next-week');

    if (input) {
        input.addEventListener('blur', () => {
            if (input.value.trim()) {
                input.value = normalizeWeekName(input.value.trim());
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => stepUploadWeek(-1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => stepUploadWeek(1));
    }

    updateUploadWeekUI();
}

function stepUploadWeek(delta) {
    const input = document.getElementById('upload-week-input');
    if (!input) return;
    const currentVal = input.value.trim() || getCurrentWeekLabel();
    const match = currentVal.match(/\d+/);
    let num = match ? parseInt(match[0], 10) : 1;
    num = Math.max(1, num + delta);
    input.value = `Semana ${num}`;
}

function updateUploadWeekUI() {
    const input = document.getElementById('upload-week-input');
    const datalist = document.getElementById('upload-week-list');
    if (!input || !datalist) return;

    // Fill datalist with all known saved weeks
    const existing = Object.keys(AppState.weeks);
    datalist.innerHTML = '';
    existing.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w;
        datalist.appendChild(opt);
    });

    // Suggest default week if empty
    if (!input.value.trim()) {
        input.value = AppState.currentWeek || getCurrentWeekLabel();
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) processFile(file);
}

async function processFile(file) {
    const errorDiv = document.getElementById('upload-error');
    const errorText = document.getElementById('upload-error-text');
    errorDiv.style.display = 'none';

    try {
        const weekInput = document.getElementById('upload-week-input');
        const chosenWeek = (weekInput && weekInput.value.trim())
            ? normalizeWeekName(weekInput.value.trim())
            : (AppState.currentWeek || getCurrentWeekLabel());

        const items = await parseFile(file, chosenWeek);

        // Group items by their week
        const importedWeeks = {};
        items.forEach(item => {
            const w = item.semana || chosenWeek;
            if (!importedWeeks[w]) importedWeeks[w] = [];
            importedWeeks[w].push(item);
        });

        const weekKeys = Object.keys(importedWeeks);

        // Merge into AppState.weeks
        weekKeys.forEach(w => {
            AppState.weeks[w] = importedWeeks[w];
        });

        // Set active week: prefer chosenWeek if in file, otherwise first week in file
        AppState.currentWeek = importedWeeks[chosenWeek] ? chosenWeek : weekKeys[0];
        AppState.data = AppState.weeks[AppState.currentWeek] || [];

        // Save state
        saveData(false);

        // Transition to dashboard
        showDashboard();

        if (weekKeys.length > 1) {
            showToast(`${items.length} itens importados e distribuídos em ${weekKeys.length} semanas!`, 'success');
        } else {
            showToast(`${items.length} itens importados para a ${AppState.currentWeek}!`, 'success');
        }
    } catch (err) {
        errorText.textContent = err;
        errorDiv.style.display = 'block';
        showToast('Erro na importação', 'error');
    }
}

function handleTableInput(e) {
    const target = e.target;

    // Ordem de Produção input
    if (target.classList.contains('input-op')) {
        const itemId = target.dataset.itemId;
        const item = AppState.data.find(i => i.id === itemId);
        if (item) {
            item.ordemProducao = target.value;
        }
        return;
    }

    // Day input (plano or real)
    if (target.classList.contains('input-day')) {
        const itemId = target.dataset.itemId;
        const type = target.dataset.type;
        const day = target.dataset.day;
        const item = AppState.data.find(i => i.id === itemId);
        if (item) {
            item[type][day] = parseNumber(target.value);
            updateRowTotalsAndStatus(itemId);
            updateStats();
        }
    }
}

function updateRowTotalsAndStatus(itemId) {
    const item = AppState.data.find(i => i.id === itemId);
    if (!item) return;

    const totalPlano = calcTotal(item.plano);
    const totalReal = calcTotal(item.real);
    const status = calcStatus(item);

    // Find rows for this item
    const rows = document.querySelectorAll(`tr[data-item-id="${itemId}"]`);
    rows.forEach(row => {
        // Update total cells
        const totalCells = row.querySelectorAll('.cell-total');
        totalCells.forEach(cell => {
            if (row.classList.contains('row-plano')) {
                cell.textContent = formatNumber(totalPlano);
            } else {
                cell.textContent = formatNumber(totalReal);
            }
        });

        // Update status badge
        const statusCell = row.querySelector('.cell-status');
        if (statusCell) {
            statusCell.innerHTML = `<span class="status-badge ${getStatusClass(status)}">${getStatusLabel(status)}</span>`;
        }
    });
}

// ==========================================
// Week Navigation & Management
// ==========================================
function populateWeekDropdown() {
    const select = document.getElementById('week-select');
    if (!select) return;

    const weekNames = Object.keys(AppState.weeks);
    if (weekNames.length === 0) {
        const defaultWeek = AppState.currentWeek || getCurrentWeekLabel();
        AppState.weeks[defaultWeek] = [];
        AppState.currentWeek = defaultWeek;
        weekNames.push(defaultWeek);
    }

    // Sort weeks by week number
    weekNames.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
    });

    select.innerHTML = '';
    weekNames.forEach(w => {
        const count = (AppState.weeks[w] || []).length;
        const opt = document.createElement('option');
        opt.value = w;
        opt.textContent = `${w} (${count} itens)`;
        if (w === AppState.currentWeek) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });

    // Toggle delete button
    const btnDel = document.getElementById('btn-del-week');
    if (btnDel) {
        btnDel.style.display = weekNames.length > 1 ? 'inline-flex' : 'none';
    }
}

function switchWeek(newWeek, saveCurrent = true) {
    if (!newWeek || (newWeek === AppState.currentWeek && AppState.data.length > 0)) return;

    // Save previous week before switching
    if (saveCurrent && AppState.currentWeek) {
        AppState.weeks[AppState.currentWeek] = AppState.data;
        saveData(false);
    }

    AppState.currentWeek = newWeek;
    if (!AppState.weeks[newWeek]) {
        AppState.weeks[newWeek] = [];
    }
    AppState.data = AppState.weeks[newWeek];

    populateWeekDropdown();
    populateEstabFilter();
    updateHeaderSubtitle();
    renderTable();
    showToast(`Alternado para ${newWeek}`, 'info');
}

function navigateWeek(direction) {
    const weekNames = Object.keys(AppState.weeks);
    if (weekNames.length <= 1) return;

    weekNames.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
    });

    const currentIndex = weekNames.indexOf(AppState.currentWeek);
    let targetIndex = currentIndex + direction;

    if (targetIndex < 0) targetIndex = weekNames.length - 1;
    if (targetIndex >= weekNames.length) targetIndex = 0;

    switchWeek(weekNames[targetIndex]);
}

function createNewWeek() {
    const weekNames = Object.keys(AppState.weeks);
    let nextNum = 35;
    if (weekNames.length > 0) {
        const numbers = weekNames.map(w => parseInt(w.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
        if (numbers.length > 0) {
            nextNum = Math.max(...numbers) + 1;
        }
    }
    const defaultName = `Semana ${nextNum}`;
    const name = prompt('Informe a identificação da nova semana (ex: Semana 36):', defaultName);
    if (!name || !name.trim()) return;

    const cleanName = normalizeWeekName(name.trim());
    if (AppState.weeks[cleanName]) {
        showToast(`A ${cleanName} já existe. Alternando para ela.`, 'info');
        switchWeek(cleanName);
        return;
    }

    AppState.weeks[cleanName] = [];
    switchWeek(cleanName);
    showToast(`${cleanName} criada! Importe uma planilha ou monte o plano para esta semana.`, 'success');
}

function deleteCurrentWeek() {
    const weekNames = Object.keys(AppState.weeks);
    if (weekNames.length <= 1) {
        alert('Não é possível excluir a única semana restante.');
        return;
    }

    if (!confirm(`Tem certeza que deseja excluir a programação da "${AppState.currentWeek}"?`)) {
        return;
    }

    const weekToDelete = AppState.currentWeek;
    delete AppState.weeks[weekToDelete];

    const remaining = Object.keys(AppState.weeks);
    AppState.currentWeek = remaining[0];
    AppState.data = AppState.weeks[AppState.currentWeek] || [];

    saveData(false);
    populateWeekDropdown();
    populateEstabFilter();
    updateHeaderSubtitle();
    renderTable();
    showToast(`${weekToDelete} excluída com sucesso!`, 'info');
}

// ==========================================
// Export
// ==========================================
function exportData() {
    const exportRows = [];

    // Header
    exportRows.push([
        'Semana', 'Código Produto', 'Descrição', 'Estabelecimento', 'Qtd Programada', 'Observações',
        'Ordem de Produção',
        'Plano Seg', 'Plano Ter', 'Plano Qua', 'Plano Qui', 'Plano Sex', 'Plano Sáb', 'Total Plano',
        'Real Seg', 'Real Ter', 'Real Qua', 'Real Qui', 'Real Sex', 'Real Sáb', 'Total Real',
        'Status'
    ]);

    AppState.data.forEach(item => {
        const totalPlano = calcTotal(item.plano);
        const totalReal = calcTotal(item.real);
        const status = getStatusLabel(calcStatus(item));
        const desc = item.descricao || getProductDescription(item.codigo);
        const sem = item.semana || AppState.currentWeek;

        exportRows.push([
            sem, item.codigo, desc, item.estab, item.quantidade, item.observacoes,
            item.ordemProducao,
            item.plano.seg, item.plano.ter, item.plano.qua, item.plano.qui, item.plano.sex, item.plano.sab, totalPlano,
            item.real.seg, item.real.ter, item.real.qua, item.real.qui, item.real.sex, item.real.sab, totalReal,
            status
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Programação');

    const cleanWeekStr = (AppState.currentWeek || 'geral').replace(/[^a-zA-Z0-9_-]/g, '_');
    XLSX.writeFile(wb, `programacao_producao_${cleanWeekStr}.xlsx`);
    showToast(`Arquivo exportado para ${AppState.currentWeek}!`, 'success');
}

// ==========================================
// Screen Navigation
// ==========================================
function showUploadScreen() {
    document.getElementById('upload-screen').style.display = 'flex';
    document.getElementById('dashboard-screen').style.display = 'none';
    updateUploadWeekUI();

    const btnReturn = document.getElementById('btn-return-dashboard');
    if (btnReturn) {
        btnReturn.style.display = (AppState.data && AppState.data.length > 0) ? 'inline-flex' : 'none';
    }
}

function showDashboard() {
    document.getElementById('upload-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'flex';
    populateWeekDropdown();
    populateEstabFilter();
    updateHeaderSubtitle();
    renderTable();
}

function updateHeaderSubtitle() {
    const subtitle = document.getElementById('header-subtitle');
    if (!subtitle) return;

    const count = AppState.data.length;
    const weekName = AppState.currentWeek || getCurrentWeekLabel();
    subtitle.textContent = `${count} itens · ${weekName}`;
}

// ==========================================
// Utility Functions
// ==========================================
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatNumber(num) {
    if (num == null || isNaN(num)) return '0';
    return num.toLocaleString('pt-BR');
}

function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const iconMap = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas ${iconMap[type]}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showSaveIndicator() {
    const el = document.getElementById('save-indicator');
    el.style.display = 'inline-block';
    setTimeout(() => { el.style.display = 'none'; }, 3000);
}

// ==========================================
// Init
// ==========================================
document.addEventListener('DOMContentLoaded', setupEventListeners);
