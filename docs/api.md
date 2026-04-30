# 📡 Documentação da API

URL base: `http://localhost:5000`

---

## 📦 Entregas

### Listar todas as entregas
**GET** `/deliveries`

**Resposta de sucesso (200):**
```json
[
    {
        "id_entrega": 1,
        "status": "pendente",
        "data": "2026-04-21 15:00:00",
        "distancia": 0.28,
        "tempo_estimado": 1,
        "nome_usuario": "Ariel",
        "nome_destinatario": "Marcos André Lucas",
        "telefone": "54999999999",
        "rua_origem": "Rua Sete de Setembro",
        "numero_origem": "100",
        "cidade_origem": "Erechim",
        "lat_origem": -27.6339,
        "lng_origem": -52.2744,
        "rua_destino": "Rua Tiradentes",
        "numero_destino": "200",
        "cidade_destino": "Erechim",
        "lat_destino": -27.6350,
        "lng_destino": -52.2755
    }
]
```

**Resposta de erro (500):**
```json
{
    "erro": "Erro ao buscar entregas: ..."
}
```

---

### Buscar entrega por ID
**GET** `/deliveries/<id>`

**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | inteiro | ID da entrega |

**Resposta de sucesso (200):**
```json
{
    "id_entrega": 1,
    "status": "pendente",
    "data": "2026-04-21 15:00:00",
    "distancia": 0.28,
    "tempo_estimado": 1,
    "nome_usuario": "Ariel",
    "nome_destinatario": "Marcos André Lucas",
    ...
}
```

**Respostas de erro:**
```json
{ "erro": "Entrega não encontrada" }
```
```json
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
    "destination_street": "Rua Tiradentes",
    "destination_number": "200",
    "destination_city": "Erechim",
    "destination_lat": -27.6350,
    "destination_lng": -52.2755,
    "date": "2026-04-21 15:00:00",
    "user_id": 1,
    "recipient_id": 1
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
| `destination_street` | string | Rua de destino |
| `destination_number` | string | Número de destino |
| `destination_city` | string | Cidade de destino |
| `destination_lat` | float | Latitude de destino |
| `destination_lng` | float | Longitude de destino |
| `date` | string | Data no formato `YYYY-MM-DD HH:MM:SS` |
| `user_id` | inteiro | ID do usuário responsável |
| `recipient_id` | inteiro | ID do destinatário |

**Resposta de sucesso (201):**
```json
{
    "delivery_id": 1
}
```

**Respostas de erro:**
```json
{ "erro": "Corpo da requisição inválido" }
```
```json
{ "erro": "Campo obrigatório ausente: date" }
```
```json
{ "erro": "Erro ao criar entrega: ..." }
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
    "destination_lat": -27.6350,
    "destination_lng": -52.2755
}
```

**Campos obrigatórios:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `origin_lat` | float | Latitude de origem |
| `origin_lng` | float | Longitude de origem |
| `destination_lat` | float | Latitude de destino |
| `destination_lng` | float | Longitude de destino |

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
    "distance_km": 0.28,
    "estimated_time_minutes": 1
}
```

**Respostas de erro:**
```json
{ "erro": "Corpo da requisição inválido" }
```
```json
{ "erro": "Campo obrigatório ausente: origin_lat" }
```
```json
{ "erro": "Erro ao calcular rota: ..." }
```