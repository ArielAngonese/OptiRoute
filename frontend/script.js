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

// ═══════════════════════════════════════════
//   NAVEGAÇÃO ENTRE PÁGINAS
// ═══════════════════════════════════════════

// Esconde todas as páginas e mostra apenas a solicitada
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// Esconde todas as seções do app e mostra apenas a solicitada
function showApp(section) {
  document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById('app-' + section).classList.add('active');

  // Marca o item do menu como ativo
  const navEl = document.getElementById('nav-' + section);
  if (navEl) navEl.classList.add('active');

  // Carrega os dados da seção correspondente
  if (section === 'dashboard') carregarDashboard();
  if (section === 'historico') carregarHistorico();
}