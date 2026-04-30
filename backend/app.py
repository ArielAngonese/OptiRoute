from flask import Flask, request, jsonify
from flask_cors import CORS
from graph import graph
from services.map import get_nearest_node, get_route_coordinates, calculate_distance, calculate_estimated_time
from algorithms.dijkstra import calculate_route
from backend.database import get_all_deliveries, get_delivery_by_id, insert_delivery, insert_address, update_delivery_route

# Criação da aplicação Flask
app = Flask(__name__)
CORS(app)

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
            "destination_street", "destination_number", "destination_city", "destination_lat", "destination_lng",
            "date", "user_id", "recipient_id"
        ]
        for field in required_fields:
            if field not in data:
                return jsonify({"erro": f"Campo obrigatório ausente: {field}"}), 400

        id_origin_address = insert_address(
            data["origin_street"],
            data["origin_number"],
            data["origin_city"],
            data["origin_lat"],
            data["origin_lng"]
        )

        id_destination_address = insert_address(
            data["destination_street"],
            data["destination_number"],
            data["destination_city"],
            data["destination_lat"],
            data["destination_lng"]
        )

        id_delivery = insert_delivery(
            status="pendente",
            data=data["date"],
            id_usuario=data["user_id"],
            id_destinatario=data["recipient_id"],
            id_endereco_origem=id_origin_address,
            id_endereco_destino=id_destination_address
        )

        return jsonify({"delivery_id": id_delivery}), 201
    
    except Exception as e:
        return jsonify({"erro": f"Erro ao criar entrega: {str(e)}"}), 500
    
# Rota para calcular a rota mais curta entre origem e destino
@app.route("/calculate-route", methods=["POST"])
def calculate_route_api():
    try: 

        data = request.get_json()

        # Validação básica dos dados de entrada
        if not data:
            return jsonify({"erro": "Corpo da requisição inválido"}), 400
        
        # Verificação de campos obrigatórios
        required_fields = ["origin_lat", "origin_lng", "destination_lat", "destination_lng"]
        for field in required_fields:
            if field not in data:
                return jsonify({"erro": f"Campo obrigatório ausente: {field}"}), 400

        origin_lat = data["origin_lat"]
        origin_lng = data["origin_lng"]
        destination_lat = data["destination_lat"]
        destination_lng = data["destination_lng"]

        origin_node = get_nearest_node(graph, origin_lat, origin_lng)
        destination_node = get_nearest_node(graph, destination_lat, destination_lng)

        path = calculate_route(graph, origin_node, destination_node)
        coordinates = get_route_coordinates(graph, path)

        distance = calculate_distance(graph, path)
        estimated_time = calculate_estimated_time(distance)

        if "delivery_id" in data:
            update_delivery_route(
                data["delivery_id"],
                distance,
                estimated_time
            )           

        return jsonify({
            "route": coordinates,
            "distance_km": distance,
            "estimated_time_minutes": estimated_time
        })

    # Tratamento de erros em caso de falhas na rota ou dados inválidos
    except Exception as e:
        return jsonify({"erro": f"Erro ao calcular rota: {str(e)}"}), 500