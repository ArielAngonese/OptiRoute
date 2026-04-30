# 🗺️ Sistema de Otimização de Rotas para Entregas Urbanas

> Trabalho desenvolvido para o XIII Seminário de Projetos Integradores 2026 — URI Erechim/RS  
> Curso: Ciência da Computação

**Autores:** Alisson Silva & Ariel Liotto Angonese  
**Instituição:** Universidade Regional Integrada do Alto Uruguai e das Missões (URI)  
**Departamento:** Engenharias e Ciência da Computação — Erechim/RS

---

## 📋 Sobre o Projeto

O crescimento do comércio eletrônico e dos serviços de entrega urbana tem aumentado significativamente a demanda por soluções tecnológicas capazes de otimizar rotas e reduzir custos operacionais. Este projeto apresenta um **sistema web de roteirização** voltado ao cálculo da menor rota entre dois pontos em ambiente urbano.

A solução utiliza dados geográficos reais obtidos do **OpenStreetMap**, representa a malha viária por meio de **grafos ponderados** e aplica o **Algoritmo de Dijkstra** para determinar o caminho mais eficiente entre origem e destino.

O sistema integra conceitos de **banco de dados**, **engenharia de software** e **teoria dos grafos**, demonstrando a viabilidade de algoritmos clássicos combinados com dados reais para a construção de soluções de logística urbana.

---

## ✨ Funcionalidades

- Cálculo da menor rota entre dois pontos em ambiente urbano
- Representação da malha viária como grafo ponderado com dados reais do OpenStreetMap
- Interface web para entrada de pontos de origem e destino
- Visualização da rota calculada
- Suporte a múltiplos pontos de entrega (cálculo sequencial de caminhos mínimos)
- Armazenamento das informações via banco de dados relacional (MySQL)

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|-----------|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Python 3, Flask |
| Banco de Dados | MySQL |
| Algoritmo de Rotas | Dijkstra (implementação própria) |
| Dados Geográficos | OpenStreetMap (via OSMnx) |

---

## 📐 Arquitetura

O sistema modela o ambiente urbano como um **grafo ponderado**, onde:

- **Vértices (nós)** → Interseções e pontos da malha viária
- **Arestas** → Ruas e avenidas conectando os pontos
- **Pesos** → Distância ou tempo de deslocamento entre os pontos

O **Algoritmo de Dijkstra** é executado sobre esse grafo para encontrar o caminho de menor custo entre a origem e o destino. Para múltiplos destinos, o algoritmo é reaplicado sequencialmente, tratando cada destino alcançado como nova origem.

---

## 📁 Estrutura do Projeto

```
.
├── algorithms/
│   └── dijkstra.py       # Cálculo de rotas com Dijkstra
├── backend/
│   ├── app.py            # Servidor Flask e rotas da API
│   ├── config.py         # Configurações do banco de dados (não versionado)
│   └── database.py       # Funções de acesso ao banco de dados
├── docs/
│   ├── article.md        # Artigo científico do projeto
├── frontend/
│   ├── index.html        # Interface web principal
│   ├── script.js         # Lógica de interação do frontend
│   └── style.css         # Estilos da interface
├── services/
│   └── map.py            # Carregamento do mapa, geocodificação e cálculo de distância
├── .gitignore
├── graph.py              # Carregamento do grafo na inicialização
├── LICENSE
├── main.py               # Ponto de entrada do servidor
├── README.md
└── requirements.txt
```

---

## ⚙️ Pré-requisitos

- Python 3.8+
- MySQL
- pip

---

## 🚀 Como Executar

**1. Clone o repositório**
```bash
git clone https://github.com/ArielAngonese/Sistema-de-Otimizacao-de-Rotas-para-Entregas-Urbanas.git
cd Sistema-de-Otimizacao-de-Rotas-para-Entregas-Urbanas
```

**2. Instale os pré-requisitos**
```bash
pip install -r requirements.txt
```

**3. Configure o banco de dados**

Edite o arquivo `config.py` com suas credenciais MySQL:
```python
DB_CONFIG = {
    "host": "seu_host_railway",
    "port": 00000,
    "user": "root",
    "password": "sua_senha",
    "database": "railway"
}
```

**4. Inicie o servidor**
```bash
python main.py
```

**5. Acesse a interface**

Abra o arquivo `index.html` no navegador ou acesse `http://localhost:5000`.

---

## 🧠 Fundamentação Teórica

### Algoritmo de Dijkstra

Proposto por Edsger W. Dijkstra em 1959, é um dos métodos mais conhecidos para resolver o problema do **caminho mínimo em grafos ponderados com pesos não negativos**. Sua lógica baseia-se na exploração progressiva dos vértices, mantendo um conjunto de distâncias mínimas conhecidas a partir do vértice inicial.

- **Complexidade simples:** O(n²)
- **Complexidade otimizada** (com fila de prioridade): O((V + E) log V)

### OpenStreetMap

Plataforma colaborativa e aberta que fornece dados cartográficos detalhados de ruas, avenidas e interseções de cidades ao redor do mundo. Utilizada neste projeto como fonte de dados reais para a construção do grafo da malha viária.

### Vehicle Routing Problem (VRP)

Problema clássico de otimização e logística que envolve a definição de rotas eficientes para atendimento de múltiplos pontos. Este projeto trata uma versão simplificada do VRP, focada no cálculo do menor caminho entre dois pontos.

---

## 📚 Referências

- DIJKSTRA, E. W. A note on two problems in connexion with graphs. *Numerische Mathematik*, 1:269–271, 1959.
- LAPORTE, G. Fifty years of vehicle routing. *Transportation Science*, 43(4):408–416, 2009.
- SOLOMON, M. M. Algorithms for the vehicle routing and scheduling problems with time window constraints. *Operations Research*, 35(2):254–265, 1987.
- OpenStreetMap contributors. OpenStreetMap. Disponível em: https://www.openstreetmap.org. Acesso em: 29 mar. 2026.
- Pallets Projects. Flask Documentation. Disponível em: https://flask.palletsprojects.com. Acesso em: 29 mar. 2026.
- Python Software Foundation. Python Documentation. Disponível em: https://docs.python.org. Acesso em: 29 mar. 2026.
- Oracle Corporation. MySQL Documentation. Disponível em: https://dev.mysql.com/doc. Acesso em: 29 mar. 2026.
