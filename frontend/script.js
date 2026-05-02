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
// ═══════════════════════════════════════════
//   DASHBOARD
// ═══════════════════════════════════════════

// Carrega os dados do dashboard — data atual e estatísticas
async function carregarDashboard() {
  // Exibe a data atual formatada
  const dias = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
  const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const hoje = new Date();
  document.getElementById('dashboard-date').textContent =
    `${dias[hoje.getDay()]}, ${hoje.getDate()} de ${meses[hoje.getMonth()]}`;

  try {
    // Busca as entregas na API
    const res = await fetch(`${API_URL}/deliveries`);
    entregas = await res.json();
  } catch (e) {
    // Backend indisponível — usa dados de exemplo
    entregas = dadosExemplo();
  }

  // Calcula as estatísticas
  const total = entregas.length;
  const concluidas = entregas.filter(e => e.status === 'concluida').length;
  const kmTotal = entregas.reduce((s, e) => s + (e.distancia || 0), 0);
  const tempoMedio = entregas.length
    ? Math.round(entregas.reduce((s, e) => s + (e.tempo_estimado || 0), 0) / entregas.length)
    : 0;

  // Atualiza os cards de estatísticas na tela
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-concluidas').textContent = concluidas;
  document.getElementById('stat-km').textContent = kmTotal.toFixed(1) + ' km';
  document.getElementById('stat-tempo').textContent = tempoMedio + ' min';

  // Exibe as 4 rotas mais recentes
  const recentes = [...entregas].slice(0, 4);
  const container = document.getElementById('lista-recentes');
  container.innerHTML = recentes.length
    ? recentes.map(e => rotaItemHTML(e)).join('')
    : '<div class="empty-state">Nenhuma rota encontrada.</div>';
}
// ═══════════════════════════════════════════
//   HISTÓRICO
// ═══════════════════════════════════════════

// Carrega as entregas e exibe no histórico
async function carregarHistorico() {
  if (!entregas.length) {
    try {
      // Busca as entregas na API
      const res = await fetch(`${API_URL}/deliveries`);
      entregas = await res.json();
    } catch (e) {
      // Backend indisponível — usa dados de exemplo
      entregas = dadosExemplo();
    }
  }
  renderHistorico();
}

// Renderiza a lista de entregas na tela
function renderHistorico() {
  const busca = document.getElementById('busca-rota').value.toLowerCase();
  let lista = entregas;

  // Aplica filtro de status
  if (filtroAtual !== 'todas') lista = lista.filter(e => e.status === filtroAtual);

  // Aplica filtro de busca por nome
  if (busca) lista = lista.filter(e => (e.nome || '').toLowerCase().includes(busca));

  const container = document.getElementById('lista-historico');
  container.innerHTML = lista.length
    ? lista.map(e => historicoItemHTML(e)).join('')
    : '<div class="empty-state">Nenhuma rota encontrada.</div>';
}
// ═══════════════════════════════════════════
//   FILTROS DO HISTÓRICO
// ═══════════════════════════════════════════

// Filtra o histórico conforme o texto digitado
function filtrarHistorico() {
  renderHistorico();
}

// Define o filtro ativo e atualiza a lista
function setFiltro(filtro, btn) {
  filtroAtual = filtro;

  // Remove o active de todos os botões e coloca no clicado
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  renderHistorico();
}
// ═══════════════════════════════════════════
//   NOVA ROTA — DESTINOS
// ═══════════════════════════════════════════

// Adiciona um novo campo de destino na lista
function addDestino() {
  const lista = document.getElementById('lista-destinos');
  const num = lista.querySelectorAll('.destino-item').length + 1;
  const div = document.createElement('div');
  div.className = 'destino-item';
  div.innerHTML = `
    <span class="destino-num">${num}</span>
    <input type="text" class="form-input destino-input" placeholder="Endereço ${num}" />
    <button class="btn-remove" onclick="removeDestino(this)">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 4h10M5 4V3a1 1 0 0 1 2 0v1M9 4V3a1 1 0 0 0-2 0v1M5 7v4M9 7v4M3 4l.7 7.3A1 1 0 0 0 4.7 12h4.6a1 1 0 0 0 1-.7L11 4"
          stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
    </button>`;
  lista.appendChild(div);
  atualizarContadorDestinos();
}

// Remove um destino da lista
function removeDestino(btn) {
  const item = btn.closest('.destino-item');
  const lista = document.getElementById('lista-destinos');
  if (lista.querySelectorAll('.destino-item').length > 1) {
    item.remove();
    reordenarDestinos();
  } else {
    // Mantém pelo menos um campo — só limpa o valor
    item.querySelector('.destino-input').value = '';
  }
  atualizarContadorDestinos();
}

// Reordena os números dos destinos após remoção
function reordenarDestinos() {
  document.querySelectorAll('.destino-item').forEach((item, i) => {
    item.querySelector('.destino-num').textContent = i + 1;
    item.querySelector('.destino-input').placeholder = `Endereço ${i + 1}`;
  });
}

// Atualiza o contador de endereços
function atualizarContadorDestinos() {
  const n = document.querySelectorAll('.destino-input').length;
  document.getElementById('count-destinos').textContent = `${n} endereço(s)`;
}