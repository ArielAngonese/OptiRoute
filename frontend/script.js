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
// ═══════════════════════════════════════════
//   AUTH — LOGIN
// ═══════════════════════════════════════════

// Valida os campos e faz o login do usuário
async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-password').value;

  if (!email || !senha) {
    alert('Preencha email e senha.');
    return;
  }

  // Simulação de login — integração com backend em desenvolvimento
  currentUser = { id: 1, nome: 'Alisson', email };
  showPage('page-app');
  showApp('dashboard');
}

// ═══════════════════════════════════════════
//   AUTH — CADASTRO
// ═══════════════════════════════════════════

// Valida os campos e cria uma nova conta
async function handleRegister() {
  const email = document.getElementById('reg-email').value.trim();
  const senha = document.getElementById('reg-password').value;
  const confirmar = document.getElementById('reg-confirm').value;
  const msg = document.getElementById('reg-msg');

  if (!email || !senha || !confirmar) { msg.textContent = 'Preencha todos os campos.'; return; }
  if (senha.length < 8) { msg.textContent = 'A senha deve ter no mínimo 8 caracteres.'; return; }
  if (senha !== confirmar) { msg.textContent = 'As senhas não coincidem.'; return; }

  try {
    // Envia os dados para a API de cadastro
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    if (res.ok) {
      alert('Conta criada com sucesso!');
      showPage('page-login');
    } else {
      msg.textContent = 'Erro ao criar conta. Tente novamente.';
    }
  } catch (e) {
    // Backend indisponível — modo simulado
    alert('Conta criada com sucesso! (modo simulado)');
    showPage('page-login');
  }
}