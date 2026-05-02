// ═══════════════════════════════════════════
//   CONFIGURAÇÃO DA API
// ═══════════════════════════════════════════
const API_URL = 'http://localhost:5000';

// ═══════════════════════════════════════════
//   ESTADO GLOBAL
// ═══════════════════════════════════════════

// Usuário logado atualmente
let currentUser = null;

// Lista de entregas carregadas da API
let entregas = [];

// Filtro ativo no histórico
let filtroAtual = 'todas';

// Instância do mapa Leaflet
let mapInstance = null;

// Rota atualmente exibida no mapa
let rotaAtual = null;