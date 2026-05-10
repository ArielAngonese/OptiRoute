import mysql.connector
from backend.config import DB_CONFIG
import bcrypt

# Abre uma conexão com o banco usando as configurações do config.py
def connect():
    return mysql.connector.connect(**DB_CONFIG)

# ─────────────────────────────────────────────
# ENDERECO
# ─────────────────────────────────────────────

# Insere um novo endereço e retorna seu ID
def insert_address(rua, numero, cidade, latitude, longitude):
    conn = connect()
    cursor = conn.cursor()
    query = """
        INSERT INTO ENDERECO (rua, numero, cidade, latitude, longitude)
        VALUES (%s, %s, %s, %s, %s)
    """
    cursor.execute(query, (rua, numero, cidade, latitude, longitude))
    conn.commit()
    id_endereco = cursor.lastrowid
    cursor.close()
    conn.close()
    return id_endereco

# Busca um endereço pelo ID e retorna seus detalhes
def get_address_by_id(id_endereco):
    conn = connect()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM ENDERECO WHERE id_endereco = %s", (id_endereco,))
    address = cursor.fetchone()
    cursor.close()
    conn.close()
    return address

def get_address_by_coords(latitude, longitude):
    conn = connect()
    cursor = conn.cursor(dictionary=True, buffered=True)
    cursor.execute(
        "SELECT * FROM ENDERECO WHERE latitude = %s AND longitude = %s",
        (latitude, longitude)
    )
    address = cursor.fetchone()
    cursor.close()
    conn.close()
    return address

# ─────────────────────────────────────────────
# USUARIO
# ─────────────────────────────────────────────

# Insere um novo usuário e retorna seu ID
def insert_user(nome, email, senha):
    conn = connect()
    cursor = conn.cursor()
    hashed = bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt())
    query = """
        INSERT INTO USUARIO (nome, email, senha)
        VALUES (%s, %s, %s)
    """
    cursor.execute(query, (nome, email, hashed))
    conn.commit()
    id_usuario = cursor.lastrowid
    cursor.close()
    conn.close()
    return id_usuario


# Busca um usuário pelo ID e retorna seus detalhes
def get_user_by_id(id_usuario):
    conn = connect()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM USUARIO WHERE id_usuario = %s", (id_usuario,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user

# Busca um usuário pelo email e retorna seus detalhes
def get_user_by_email(email):
    conn = connect()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM USUARIO WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user

def validate_login(email, senha):
    user = get_user_by_email(email)

    if user is None:
        return None

    senha_hash = user["senha"]
    if isinstance(senha_hash, str):
        senha_hash = senha_hash.encode("utf-8")
    elif isinstance(senha_hash, bytearray):
        senha_hash = bytes(senha_hash)

    if bcrypt.checkpw(senha.encode("utf-8"), senha_hash):
        return user

    return None

# ─────────────────────────────────────────────
# DESTINATARIO
# ─────────────────────────────────────────────

# Insere um novo destinatário e retorna seu ID
def insert_recipient(nome, telefone=None):
    conn = connect()
    cursor = conn.cursor()
    query = """
        INSERT INTO DESTINATARIO (nome, telefone)
        VALUES (%s, %s)
    """
    cursor.execute(query, (nome, telefone))
    conn.commit()
    id_destinatario = cursor.lastrowid
    cursor.close()
    conn.close()
    return id_destinatario

# Busca um destinatário pelo ID e retorna seus detalhes
def get_recipient_by_id(id_destinatario):
    conn = connect()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM DESTINATARIO WHERE id_destinatario = %s", (id_destinatario,))
    recipient = cursor.fetchone()
    cursor.close()
    conn.close()
    return recipient

def get_recipient_by_phone(telefone):
    conn = connect()
    cursor = conn.cursor(dictionary=True,  buffered=True)
    cursor.execute("SELECT * FROM DESTINATARIO WHERE telefone = %s", (telefone,))
    recipient = cursor.fetchone()
    cursor.close()
    conn.close()
    return recipient


# ─────────────────────────────────────────────
# DISTRIBUIDORA
# ─────────────────────────────────────────────

# Insere uma nova distribuidora e retorna seu ID
def insert_distributor(nome, id_endereco=None):
    conn = connect()
    cursor = conn.cursor()
    query = """
        INSERT INTO DISTRIBUIDORA (nome, id_endereco)
        VALUES (%s, %s)
    """
    cursor.execute(query, (nome, id_endereco))
    conn.commit()
    id_distribuidora = cursor.lastrowid
    cursor.close()
    conn.close()
    return id_distribuidora

# Busca uma distribuidora pelo ID e retorna seus detalhes
def get_distributor_by_id(id_distribuidora):
    conn = connect()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM DISTRIBUIDORA WHERE id_distribuidora = %s", (id_distribuidora,))
    distributor = cursor.fetchone()
    cursor.close()
    conn.close()
    return distributor


# ─────────────────────────────────────────────
# ENTREGA
# ─────────────────────────────────────────────

# Insere uma nova entrega e retorna seu ID
def insert_delivery(status, data, id_usuario, id_endereco_origem, distancia=None, tempo_estimado=None):
    conn = connect()
    cursor = conn.cursor()
    query = """
        INSERT INTO ENTREGA (status, data, distancia, tempo_estimado, id_usuario, id_endereco_origem)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    cursor.execute(query, (status, data, distancia, tempo_estimado, id_usuario, id_endereco_origem))
    conn.commit()
    id_entrega = cursor.lastrowid
    cursor.close()
    conn.close()
    return id_entrega

# Insere um ponto de entrega (destinatário + endereço) para uma entrega específica
def insert_delivery_point(id_entrega, id_destinatario, id_endereco, ordem, status="pendente"):
    conn = connect()
    cursor = conn.cursor()
    query = """
        INSERT INTO PONTO_ENTREGA (id_entrega, id_destinatario, id_endereco, ordem, status)
        VALUES (%s, %s, %s, %s, %s)
    """
    cursor.execute(query, (id_entrega, id_destinatario, id_endereco, ordem, status))
    conn.commit()
    id_ponto = cursor.lastrowid
    cursor.close()
    conn.close()
    return id_ponto

# Busca todas as entregas e retorna uma lista de detalhes
def get_all_deliveries():
    conn = connect()
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT 
            e.id_entrega, e.status, e.data, e.distancia, e.tempo_estimado,
            u.nome AS nome_usuario,
            orig.rua AS rua_origem, orig.numero AS numero_origem,
            orig.cidade AS cidade_origem,
            orig.latitude AS lat_origem, orig.longitude AS lng_origem,
            p.id_ponto, p.ordem, p.status AS status_ponto,
            d.nome AS nome_destinatario, d.telefone,
            dest.rua AS rua_destino, dest.numero AS numero_destino,
            dest.cidade AS cidade_destino,
            dest.latitude AS lat_destino, dest.longitude AS lng_destino
        FROM ENTREGA e
        JOIN USUARIO u ON e.id_usuario = u.id_usuario
        JOIN ENDERECO orig ON e.id_endereco_origem = orig.id_endereco
        JOIN PONTO_ENTREGA p ON e.id_entrega = p.id_entrega
        JOIN DESTINATARIO d ON p.id_destinatario = d.id_destinatario
        JOIN ENDERECO dest ON p.id_endereco = dest.id_endereco
        ORDER BY e.data DESC, p.ordem ASC
    """
    cursor.execute(query)
    deliveries = cursor.fetchall()
    cursor.close()
    conn.close()
    return deliveries

# Busca uma entrega pelo ID e retorna seus detalhes
def get_delivery_by_id(id_entrega):
    conn = connect()
    cursor = conn.cursor(dictionary=True)
    query = """
        SELECT 
            e.id_entrega, e.status, e.data, e.distancia, e.tempo_estimado,
            u.nome AS nome_usuario,
            orig.rua AS rua_origem, orig.numero AS numero_origem,
            orig.cidade AS cidade_origem,
            orig.latitude AS lat_origem, orig.longitude AS lng_origem,
            p.id_ponto, p.ordem, p.status AS status_ponto,
            d.nome AS nome_destinatario, d.telefone,
            dest.rua AS rua_destino, dest.numero AS numero_destino,
            dest.cidade AS cidade_destino,
            dest.latitude AS lat_destino, dest.longitude AS lng_destino
        FROM ENTREGA e
        JOIN USUARIO u ON e.id_usuario = u.id_usuario
        JOIN ENDERECO orig ON e.id_endereco_origem = orig.id_endereco
        JOIN PONTO_ENTREGA p ON e.id_entrega = p.id_entrega
        JOIN DESTINATARIO d ON p.id_destinatario = d.id_destinatario
        JOIN ENDERECO dest ON p.id_endereco = dest.id_endereco
        WHERE e.id_entrega = %s
        ORDER BY p.ordem ASC
    """
    cursor.execute(query, (id_entrega,))
    delivery = cursor.fetchall()
    cursor.close()
    conn.close()
    return delivery

# Atualiza a rota de uma entrega 
def update_delivery_route(id_entrega, distancia, tempo_estimado, status="em_rota"):
    conn = connect()
    cursor = conn.cursor()
    query = """
        UPDATE ENTREGA
        SET distancia = %s, tempo_estimado = %s, status = %s
        WHERE id_entrega = %s
    """
    cursor.execute(query, (distancia, tempo_estimado, status, id_entrega))
    conn.commit()
    cursor.close()
    conn.close()

# Atualiza o status de uma entrega
def update_delivery_status(id_entrega, status):
    conn = connect()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE ENTREGA SET status = %s WHERE id_entrega = %s",
        (status, id_entrega)
    )
    conn.commit()
    cursor.close()
    conn.close()