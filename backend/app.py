import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from graph import graph
from services.map import get_nearest_node, get_route_coordinates, calculate_distance, calculate_estimated_time
from algorithms.dijkstra import calculate_route
from backend.database import (
    get_address_by_coords,
    get_all_deliveries, 
    get_delivery_by_id,
    get_recipient_by_phone,
    get_user_by_email, 
    insert_delivery,
    insert_delivery_point, 
    insert_address, 
    update_delivery_route, 
    insert_user, 
    validate_login, 
    insert_recipient, 
    update_delivery_status
)

# Criação da aplicação Flask
app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

@app.route('/')
def index():
    return app.send_static_file('index.html')

# ================================
# Rotas de ENTREGAS
# ================================

# Rota para obter todas as entregas
@app.route("/deliveries", methods=["GET"])
def get_deliveries():
    try:
        deliveries = get_all_deliveries()
        return jsonify(deliveries)
    except Exception as e:
        return jsonify({"erro": f"Erro ao buscar entregas: {str(e)}"}), 500

# Rota para obter uma entrega específica por ID
@app.route("/deliveries/<int:id>", methods=["GET"])
def get_delivery(id):
    try:
        delivery = get_delivery_by_id(id)
        if delivery is None:
            return jsonify({"erro": "Entrega não encontrada"}), 404
        return jsonify(delivery)
    except Exception as e:
        return jsonify({"erro": f"Erro ao buscar entrega: {str(e)}"}), 500

# Rota para criar uma nova entrega
@app.route("/deliveries", methods=["POST"])
def create_delivery():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"erro": "Corpo da requisição inválido"}), 400

        required_fields = [
            "origin_street", "origin_number", "origin_city", "origin_lat", "origin_lng",
            "date", "user_id", "points"
        ]
        for field in required_fields:
            if field not in data:
                return jsonify({"erro": f"Campo obrigatório ausente: {field}"}), 400

        if not data["points"] or len(data["points"]) == 0:
            return jsonify({"erro": "Adicione pelo menos um ponto de entrega"}), 400

        # Cria ou reutiliza o endereço de origem
        existing_origin = get_address_by_coords(data["origin_lat"], data["origin_lng"])
        if existing_origin is not None:
            id_origin_address = existing_origin["id_endereco"]
        else:
            id_origin_address = insert_address(
                data["origin_street"],
                data["origin_number"],
                data["origin_city"],
                data["origin_lat"],
                data["origin_lng"]
            )

        # Cria a entrega
        id_delivery = insert_delivery(
            status="pendente",
            data=data["date"],
            id_usuario=data["user_id"],
            id_endereco_origem=id_origin_address
        )

        # Cria os pontos de entrega
        for i, point in enumerate(data["points"]):
            existing_destination = get_address_by_coords(point["destination_lat"], point["destination_lng"])
            if existing_destination is not None:
                id_destination_address = existing_destination["id_endereco"]
            else:
                id_destination_address = insert_address(
                    point["destination_street"],
                    point.get("destination_number", "S/N"),
                    point["destination_city"],
                    point["destination_lat"],
                    point["destination_lng"]
                )

            existing_recipient = get_recipient_by_phone(point.get("recipient_phone"))
            if existing_recipient is not None:
                id_destinatario = existing_recipient["id_destinatario"]
            else:
                id_destinatario = insert_recipient(
                    point["recipient_name"],
                    point.get("recipient_phone")
                )

            insert_delivery_point(
                id_delivery,
                id_destinatario,
                id_destination_address,
                ordem=i + 1
            )

        return jsonify({"delivery_id": id_delivery}), 201

    except Exception as e:
        return jsonify({"erro": f"Erro ao criar entrega: {str(e)}"}), 500

@app.route("/deliveries/<int:id>/status", methods=["PATCH"])
def update_status(id):
    try:
        data = request.get_json()

        if not data:
            return jsonify({"erro": "Corpo da requisição inválido"}), 400

        if "status" not in data:
            return jsonify({"erro": "Campo obrigatório ausente: status"}), 400

        valid_statuses = ["pendente", "em_rota", "concluida"]
        if data["status"] not in valid_statuses:
            return jsonify({"erro": f"Status inválido. Use: {valid_statuses}"}), 400

        delivery = get_delivery_by_id(id)
        if delivery is None:
            return jsonify({"erro": "Entrega não encontrada"}), 404

        update_delivery_status(id, data["status"])

        return jsonify({"mensagem": "Status atualizado com sucesso"})

    except Exception as e:
        return jsonify({"erro": f"Erro ao atualizar status: {str(e)}"}), 500

# ================================
# Rotas de CALCULO DE ROTA
# ================================

# Rota para calcular a rota mais curta entre origem e destino
@app.route("/calculate-route", methods=["POST"])
def calculate_route_api():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"erro": "Corpo da requisição inválido"}), 400

        required_fields = ["origin_lat", "origin_lng", "points"]
        for field in required_fields:
            if field not in data:
                return jsonify({"erro": f"Campo obrigatório ausente: {field}"}), 400

        if not data["points"] or len(data["points"]) == 0:
            return jsonify({"erro": "Adicione pelo menos um ponto de entrega"}), 400

        # Monta a lista de coordenadas — origem + todos os pontos
        coords = [(data["origin_lat"], data["origin_lng"])]
        for point in data["points"]:
            coords.append((point["lat"], point["lng"]))

        # Calcula a rota entre cada par de pontos consecutivos
        full_route = []
        total_distance = 0

        for i in range(len(coords) - 1):
            origin_node = get_nearest_node(graph, coords[i][0], coords[i][1])
            destination_node = get_nearest_node(graph, coords[i + 1][0], coords[i + 1][1])

            path = calculate_route(graph, origin_node, destination_node)
            coordinates = get_route_coordinates(graph, path)
            distance = calculate_distance(graph, path)

            # Evita duplicar o ponto de conexão entre segmentos
            if full_route:
                coordinates = coordinates[1:]

            full_route.extend(coordinates)
            total_distance += distance

        estimated_time = calculate_estimated_time(total_distance)

        if "delivery_id" in data:
            update_delivery_route(
                data["delivery_id"],
                round(total_distance, 2),
                estimated_time
            )

        return jsonify({
            "route": full_route,
            "distance_km": round(total_distance, 2),
            "estimated_time_minutes": estimated_time
        })

    except Exception as e:
        return jsonify({"erro": f"Erro ao calcular rota: {str(e)}"}), 500

# ================================
# Rotas de LOGIN E CADASTRO
# ================================

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"erro": "Corpo da requisição inválido"}), 400

        required_fields = ["email", "password"]
        for field in required_fields:
            if field not in data:
                return jsonify({"erro": f"Campo obrigatório ausente: {field}"}), 400

        user = validate_login(data["email"], data["password"])

        if user is None:
            return jsonify({"erro": "Email ou senha inválidos"}), 401

        return jsonify({
            "user_id": user["id_usuario"],
            "name": user["nome"],
            "email": user["email"]
        })

    except Exception as e:
        return jsonify({"erro": f"Erro ao realizar login: {str(e)}"}), 500


@app.route("/signup", methods=["POST"])
def create_user():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"erro": "Corpo da requisição inválido"}), 400

        required_fields = ["name", "email", "password"]
        for field in required_fields:
            if field not in data:
                return jsonify({"erro": f"Campo obrigatório ausente: {field}"}), 400
            
        existing_user = get_user_by_email(data["email"])
        if existing_user is not None:
            return jsonify({"erro": "Email já cadastrado"}), 409

        id_usuario = insert_user(data["name"], data["email"], data["password"])

        return jsonify({"user_id": id_usuario}), 201

    except Exception as e:
        return jsonify({"erro": f"Erro ao criar usuário: {str(e)}"}), 500

