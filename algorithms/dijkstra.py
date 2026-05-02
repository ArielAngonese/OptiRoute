import heapq

def calculate_route(graph, origin_node, destination_node):
    distances = {node: float("inf") for node in graph.nodes} # Dicionário que inicializa as distâncias como infinito
    distances[origin_node] = 0 
    previous = {node: None for node in graph.nodes} # Dicionário que inicializa todos os nós já visitados como None
    priority_queue = [(0, origin_node)] # Fila de prioridade com todos os nós do grafo que não foram visitádos ainda

    while priority_queue:
        current_distance, current = heapq.heappop(priority_queue) # Pega o nó com a menor distância da fila de prioridade

        if current == destination_node: 
            break

        if current_distance > distances[current]: 
            continue

        for neighbor in graph.neighbors(current): # Para cada vizinho do nó atual, calcula a distância até ele
            edge_data = graph[current][neighbor][0] # Pega os dados da aresta entre o nó atual e o vizinho
            weight = edge_data.get("length", 1) # Pega o peso da aresta (distância), se não tiver, assume 1
            new_distance = distances[current] + weight 

            if new_distance < distances[neighbor]:
                distances[neighbor] = new_distance
                previous[neighbor] = current
                heapq.heappush(priority_queue, (new_distance, neighbor))

    path = []
    current = destination_node
    while current is not None:
        path.append(current)
        current = previous[current]

    path.reverse()
    return path