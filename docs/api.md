# 📡 Documentação da API

URL base: `http://localhost:5000`

---

## 👤 Usuários

### Cadastrar usuário
**POST** `/signup`

**Corpo da requisição (JSON):**
```json
{
    "name": "Ariel",
    "email": "ariel@email.com",
    "password": "123456"
}
```

**Campos obrigatórios:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | string | Nome do usuário |
| `email` | string | Email do usuário |
| `password` | string | Senha do usuário |

**Resposta de sucesso (201):**
```json
{ "user_id": 1 }
```

**Respostas de erro:**
```json
{ "erro": "Corpo da requisição inválido" }
{ "erro": "Campo obrigatório ausente: password" }
{ "erro": "Email já cadastrado" }
{ "erro": "Erro ao criar usuário: ..." }
```

---

### Login
**POST** `/login`

**Corpo da requisição (JSON):**
```json
{
    "email": "ariel@email.com",
    "password": "123456"
}
```

**Campos obrigatórios:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `email` | string | Email do usuário |
| `password` | string | Senha do usuário |

**Resposta de sucesso (200):**
```json
{
    "user_id": 1,
    "name": "Ariel",
    "email": "ariel@email.com"
}
```

**Respostas de erro:**
```json
{ "erro": "Email ou senha inválidos" }
{ "erro": "Campo obrigatório ausente: email" }
{ "erro": "Erro ao realizar login: ..." }
```

---

## 📦 Entregas

### Listar todas as entregas
**GET** `/deliveries`

**Parâmetro opcional:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `user_id` | inteiro | Filtra entregas de um usuário específico |

**Exemplo:** `GET /deliveries?user_id=1`

**Resposta de sucesso (200):**
```json
[
    {
        "id_entrega": 1,
        "status": "pendente",
        "data": "Tue, 21 Apr 2026 15:00:00 GMT",
        "distancia": 0.45,
        "tempo_estimado": 1,
        "nome_usuario": "Ariel",
        "rua_origem": "Rua Sete de Setembro",
        "numero_origem": "100",
        "cidade_origem": "Erechim",
        "lat_origem": "-27.6339000",
        "lng_origem": "-52.2744000",
        "pontos": [
            {
                "id_ponto": 1,
                "ordem": 1,
                "status_ponto": "pendente",
                "nome_destinatario": "João Silva",
                "telefone": "54999999999",
                "rua_destino": "Rua Tiradentes",
                "numero_destino": "200",
                "cidade_destino": "Erechim",
                "lat_destino": "-27.6350000",
                "lng_destino": "-52.2755000"
            }
        ]
    }
]
```

**Resposta de erro (500):**
```json
{ "erro": "Erro ao buscar entregas: ..." }
```

---

### Buscar entrega por ID
**GET** `/deliveries/<id>`

**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | inteiro | ID da entrega |

**Resposta de sucesso (200):** mesma estrutura do GET /deliveries, mas com um único objeto.

**Respostas de erro:**
```json
{ "erro": "Entrega não encontrada" }
{ "erro": "Erro ao buscar entrega: ..." }
```

---

### Criar nova entrega
**POST** `/deliveries`

**Corpo da requisição (JSON):**
```json
{
    "origin_street": "Rua Sete de Setembro",
    "origin_number": "100",
    "origin_city": "Erechim",
    "origin_lat": -27.6339,
    "origin_lng": -52.2744,
    "date": "2026-04-21 15:00:00",
    "user_id": 1,
    "points": [
        {
            "destination_street": "Rua Tiradentes",
            "destination_number": "200",
            "destination_city": "Erechim",
            "destination_lat": -27.6350,
            "destination_lng": -52.2755,
            "recipient_name": "João Silva",
            "recipient_phone": "54999999999"
        },
        {
            "destination_street": "Rua Alemanha",
            "destination_number": "300",
            "destination_city": "Erechim",
            "destination_lat": -27.6360,
            "destination_lng": -52.2765,
            "recipient_name": "Maria Souza",
            "recipient_phone": "54988888888"
        }
    ]
}
```

**Campos obrigatórios:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `origin_street` | string | Rua de origem |
| `origin_number` | string | Número de origem |
| `origin_city` | string | Cidade de origem |
| `origin_lat` | float | Latitude de origem |
| `origin_lng` | float | Longitude de origem |
| `date` | string | Data no formato `YYYY-MM-DD HH:MM:SS` |
| `user_id` | inteiro | ID do usuário responsável |
| `points` | array | Lista de pontos de entrega |

**Campos de cada ponto:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `destination_street` | string | Rua de destino |
| `destination_number` | string | Número de destino |
| `destination_city` | string | Cidade de destino |
| `destination_lat` | float | Latitude de destino |
| `destination_lng` | float | Longitude de destino |
| `recipient_name` | string | Nome do destinatário |
| `recipient_phone` | string | Telefone do destinatário (opcional) |

**Resposta de sucesso (201):**
```json
{ "delivery_id": 1 }
```

**Respostas de erro:**
```json
{ "erro": "Corpo da requisição inválido" }
{ "erro": "Campo obrigatório ausente: date" }
{ "erro": "Adicione pelo menos um ponto de entrega" }
{ "erro": "Erro ao criar entrega: ..." }
```

---

### Atualizar status da entrega
**PATCH** `/deliveries/<id>/status`

**Corpo da requisição (JSON):**
```json
{ "status": "em_rota" }
```

**Status válidos:** `pendente`, `em_rota`, `concluida`

**Resposta de sucesso (200):**
```json
{ "mensagem": "Status atualizado com sucesso" }
```

**Respostas de erro:**
```json
{ "erro": "Entrega não encontrada" }
{ "erro": "Status inválido. Use: ['pendente', 'em_rota', 'concluida']" }
{ "erro": "Erro ao atualizar status: ..." }
```

---

## 🗺️ Rotas

### Calcular rota
**POST** `/calculate-route`

**Corpo da requisição (JSON):**
```json
{
    "origin_lat": -27.6339,
    "origin_lng": -52.2744,
    "points": [
        { "lat": -27.6350, "lng": -52.2755 },
        { "lat": -27.6360, "lng": -52.2765 }
    ],
    "delivery_id": 1
}
```

**Campos obrigatórios:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `origin_lat` | float | Latitude de origem |
| `origin_lng` | float | Longitude de origem |
| `points` | array | Lista de pontos com `lat` e `lng` |

**Campo opcional:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `delivery_id` | inteiro | Se informado, salva a rota na entrega correspondente |

**Resposta de sucesso (200):**
```json
{
    "route": [
        [-27.6339245, -52.2744271],
        [-27.6346005, -52.2741496],
        [-27.6352739, -52.2760208]
    ],
    "distance_km": 0.45,
    "estimated_time_minutes": 1
}
```

**Respostas de erro:**
```json
{ "erro": "Corpo da requisição inválido" }
{ "erro": "Campo obrigatório ausente: origin_lat" }
{ "erro": "Adicione pelo menos um ponto de entrega" }
{ "erro": "Erro ao calcular rota: ..." }
```

---

### Buscar rota de uma entrega
**GET** `/deliveries/<id>/route`

**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | inteiro | ID da entrega |

**Resposta de sucesso (200):**
```json
{
    "route": [
        [-27.6339245, -52.2744271],
        [-27.6346005, -52.2741496],
        [-27.6352739, -52.2760208]
    ]
}
```

**Respostas de erro:**
```json
{ "erro": "Rota não encontrada" }
{ "erro": "Erro ao buscar rota: ..." }
```