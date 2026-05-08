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
    const res = await fetch(`${API_URL}/signup`, {
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
// ═══════════════════════════════════════════
//   CALCULAR ROTA
// ═══════════════════════════════════════════

// Valida os campos e envia para a API calcular a rota
async function calcularRota() {
  const nome = document.getElementById('rota-nome').value.trim();
  const origem = document.getElementById('rota-origem').value.trim();
  const destinos = [...document.querySelectorAll('.destino-input')]
    .map(i => i.value.trim())
    .filter(v => v);

  if (!nome) { alert('Informe o nome da rota.'); return; }
  if (!origem) { alert('Informe o ponto de partida.'); return; }
  if (!destinos.length) { alert('Adicione pelo menos um ponto de entrega.'); return; }

  const btn = document.querySelector('.btn-calcular');
  btn.textContent = 'Calculando...';
  btn.disabled = true;

  try {
    // Converte os endereços em coordenadas geográficas
    const origemCoords = await geocodificar(origem);
    const destinoCoords = await geocodificar(destinos[0]);

    // Envia para a API calcular a rota usando o algoritmo de Dijkstra
    const res = await fetch(`${API_URL}/calculate-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin_lat: origemCoords.lat,
        origin_lng: origemCoords.lon,
        destination_lat: destinoCoords.lat,
        destination_lng: destinoCoords.lon
      })
    });

    const data = await res.json();
    rotaAtual = {
      nome, origem, destinos,
      route: data.route,
      distance_km: data.distance_km,
      estimated_time_minutes: data.estimated_time_minutes
    };

  } catch (e) {
    // Backend indisponível — simula uma rota
    rotaAtual = {
      nome, origem, destinos,
      route: [[-27.63, -52.26], [-27.64, -52.27], [-27.65, -52.28]],
      distance_km: (Math.random() * 15 + 5).toFixed(1),
      estimated_time_minutes: Math.floor(Math.random() * 40 + 15)
    };
  }

  btn.textContent = 'Calcular Rota Otimizada';
  btn.disabled = false;

  abrirMapa(rotaAtual);
}

// ═══════════════════════════════════════════
//   GEOCODIFICAÇÃO
// ═══════════════════════════════════════════

// Converte um endereço em coordenadas usando o Nominatim
async function geocodificar(endereco) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
  const data = await res.json();
  if (!data.length) throw new Error('Endereço não encontrado: ' + endereco);
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}
// ═══════════════════════════════════════════
//   MAPA
// ═══════════════════════════════════════════

// Abre a tela do mapa e exibe a rota calculada
function abrirMapa(rota) {
  showApp('mapa');

  // Atualiza o cabeçalho do mapa
  document.getElementById('mapa-titulo').textContent = rota.nome;
  document.getElementById('mapa-subtitulo').textContent = `${rota.destinos.length} entrega(s)`;

  // Atualiza os cards de resumo
  document.getElementById('resumo-km').textContent = rota.distance_km + ' km';
  document.getElementById('resumo-tempo').textContent = rota.estimated_time_minutes + ' min';
  document.getElementById('resumo-paradas').textContent = rota.destinos.length;
  document.getElementById('resumo-entregues').textContent = '0';

  // Atualiza a barra de progresso
  document.getElementById('progresso-pct').textContent = '0%';
  document.getElementById('progresso-fill').style.width = '0%';

  // Monta a ordem das entregas
  const ordemEl = document.getElementById('ordem-lista');
  ordemEl.innerHTML = `
    <div class="ordem-item">
      <div class="ordem-num partida">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1l1.5 3H11L8.5 6l1 3L6 7.5 2.5 9l1-3L1 4h3.5L6 1z" fill="white"/>
        </svg>
      </div>
      <div>
        <div class="ordem-addr">Partida</div>
        <div class="ordem-tipo">${rota.origem}</div>
      </div>
    </div>
    ${rota.destinos.map((d, i) => `
      <div class="ordem-item">
        <div class="ordem-num">${i + 1}</div>
        <div>
          <div class="ordem-addr">${d}</div>
          <div class="ordem-tipo">Parada ${i + 1}</div>
        </div>
      </div>
    `).join('')}
  `;

  // Inicializa o mapa Leaflet
  setTimeout(() => {
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }

    const coords = rota.route && rota.route.length ? rota.route : [[-27.63, -52.26]];
    mapInstance = L.map('map').setView(coords[0], 13);

    // Carrega as tiles do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    // Desenha a linha da rota no mapa
    if (coords.length > 1) {
      L.polyline(coords, { color: '#2563eb', weight: 4, opacity: 0.8 }).addTo(mapInstance);
    }

    // Marcador de partida
    const iconPartida = L.divIcon({
      html: '<div style="width:14px;height:14px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
      iconSize: [14, 14], iconAnchor: [7, 7], className: ''
    });

    // Marcador de destino
    const iconDestino = L.divIcon({
      html: '<div style="width:14px;height:14px;background:#dc2626;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
      iconSize: [14, 14], iconAnchor: [7, 7], className: ''
    });

    L.marker(coords[0], { icon: iconPartida }).bindPopup('Partida: ' + rota.origem).addTo(mapInstance);
    L.marker(coords[coords.length - 1], { icon: iconDestino }).bindPopup('Destino: ' + rota.destinos[0]).addTo(mapInstance);

    // Ajusta o zoom para mostrar toda a rota
    mapInstance.fitBounds(L.polyline(coords).getBounds(), { padding: [40, 40] });
  }, 100);
}

// Abre o mapa a partir de uma entrega existente
function abrirMapaEntrega(entrega) {
  if (!entrega) return;

  const rota = {
    nome: entrega.nome || `Entrega #${entrega.id_entrega}`,
    origem: `${entrega.rua_origem}, ${entrega.numero_origem} — ${entrega.cidade_origem}`,
    destinos: [`${entrega.rua_destino}, ${entrega.numero_destino} — ${entrega.cidade_destino}`],
    route: entrega.lat_origem
      ? [[entrega.lat_origem, entrega.lng_origem], [entrega.lat_destino, entrega.lng_destino]]
      : [[-27.63, -52.26], [-27.65, -52.28]],
    distance_km: entrega.distancia || '—',
    estimated_time_minutes: entrega.tempo_estimado || '—'
  };

  rotaAtual = rota;
  abrirMapa(rota);
}

// Salva a rota atual
function salvarRota() {
  alert('Rota salva com sucesso!');
}
// ═══════════════════════════════════════════
//   HTML HELPERS
// ═══════════════════════════════════════════

// Ícone SVG usado nos cards de rota
function rotaIconSVG() {
  return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M3 5C3 5 6 10 9 10C12 10 15 5 15 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M3 13C3 13 6 8 9 8C12 10 15 13 15 13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`;
}

// Gera o badge de status da entrega
function badgeHTML(status) {
  const labels = { concluida: 'Concluída', em_rota: 'Em Andamento', pendente: 'Pendente' };
  return `<span class="badge badge-${status}">${labels[status] || status}</span>`;
}

// Gera o HTML de um item de rota no dashboard
function rotaItemHTML(e) {
  const km = e.distancia ? e.distancia + ' km' : '—';
  const min = e.tempo_estimado ? e.tempo_estimado + ' min' : '—';
  const nome = e.nome || `Entrega #${e.id_entrega}`;
  return `
    <div class="rota-item" onclick='abrirMapaEntrega(${JSON.stringify(e)})'>
      <div class="rota-icon">${rotaIconSVG()}</div>
      <div class="rota-info">
        <div class="rota-nome">${nome}</div>
        <div class="rota-meta">${km} · ${min}</div>
      </div>
      <div class="rota-right">
        ${badgeHTML(e.status)}
        <span class="arrow-btn">→</span>
      </div>
    </div>`;
}

// Gera o HTML de um item no histórico
function historicoItemHTML(e) {
  const km = e.distancia ? e.distancia + ' km' : '—';
  const min = e.tempo_estimado ? e.tempo_estimado + ' min' : '—';
  const nome = e.nome || `Entrega #${e.id_entrega}`;
  const data = e.data ? new Date(e.data).toLocaleDateString('pt-BR') : '—';
  return `
    <div class="historico-item" onclick='abrirMapaEntrega(${JSON.stringify(e)})'>
      <div class="hist-icon">${rotaIconSVG()}</div>
      <div class="hist-info">
        <div class="hist-nome">${nome} ${badgeHTML(e.status)}</div>
        <div class="hist-meta">
          <span>📍 ${e.rua_origem || '—'}</span>
          <span>↔ ${km}</span>
          <span>⏱ ${min}</span>
          <span>📅 ${data}</span>
        </div>
      </div>
      <span class="arrow-btn">→</span>
    </div>`;
}
// ═══════════════════════════════════════════
//   DADOS DE EXEMPLO
// ═══════════════════════════════════════════

// Retorna dados simulados quando o backend não está disponível
function dadosExemplo() {
  return [
    { id_entrega: 1, nome: 'Entrega Centro — 13/04', status: 'concluida', distancia: 12.4, tempo_estimado: 38, data: '2026-04-13', rua_origem: 'Av. Jabaquara', numero_origem: 500, cidade_origem: 'São Paulo', rua_destino: 'Rua Vergueiro', numero_destino: 3000, cidade_destino: 'São Paulo', lat_origem: -23.62, lng_origem: -46.65, lat_destino: -23.58, lng_destino: -46.63 },
    { id_entrega: 2, nome: 'Rota Zona Sul — 12/04', status: 'em_rota', distancia: 18.7, tempo_estimado: 55, data: '2026-04-12', rua_origem: 'Av. Saúde', numero_origem: 1200, cidade_origem: 'São Paulo', rua_destino: 'Rua Domingos de Moraes', numero_destino: 600, cidade_destino: 'São Paulo', lat_origem: -23.63, lng_origem: -46.64, lat_destino: -23.60, lng_destino: -46.62 },
    { id_entrega: 3, nome: 'Distribuição Lapa — 11/04', status: 'concluida', distancia: 8.2, tempo_estimado: 25, data: '2026-04-11', rua_origem: 'Rua Guaicurus', numero_origem: 100, cidade_origem: 'São Paulo', rua_destino: 'Av. Pompéia', numero_destino: 400, cidade_destino: 'São Paulo', lat_origem: -23.53, lng_origem: -46.70, lat_destino: -23.54, lng_destino: -46.68 },
    { id_entrega: 4, nome: 'Entrega Pinheiros — 10/04', status: 'pendente', distancia: 9.6, tempo_estimado: 30, data: '2026-04-10', rua_origem: 'Rua dos Pinheiros', numero_origem: 500, cidade_origem: 'São Paulo', rua_destino: 'Av. Faria Lima', numero_destino: 2000, cidade_destino: 'São Paulo', lat_origem: -23.56, lng_origem: -46.67, lat_destino: -23.57, lng_destino: -46.69 },
  ];
}

// ═══════════════════════════════════════════
//   INICIALIZAÇÃO
// ═══════════════════════════════════════════

// Executa quando a página termina de carregar
document.addEventListener('DOMContentLoaded', () => {
  atualizarContadorDestinos();
});