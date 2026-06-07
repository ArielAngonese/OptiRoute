CREATE DATABASE IF NOT EXISTS projeto_rotas;
USE projeto_rotas;

CREATE TABLE USUARIO (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE ENDERECO (
    id_endereco INT PRIMARY KEY AUTO_INCREMENT,
    rua VARCHAR(150),
    numero VARCHAR(10),
    cidade VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL
);

CREATE TABLE DESTINATARIO (
    id_destinatario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20)
);

CREATE TABLE ENTREGA (
    id_entrega INT PRIMARY KEY AUTO_INCREMENT,
    status VARCHAR(50) NOT NULL,
    data DATETIME NOT NULL,
    distancia DECIMAL(10, 2),
    tempo_estimado INT,
    id_usuario INT NOT NULL,
    id_endereco_origem INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id_usuario),
    FOREIGN KEY (id_endereco_origem) REFERENCES ENDERECO(id_endereco)
);

CREATE TABLE PONTO_ENTREGA (
    id_ponto INT PRIMARY KEY AUTO_INCREMENT,
    id_entrega INT NOT NULL,
    id_destinatario INT NOT NULL,
    id_endereco INT NOT NULL,
    ordem INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente',
    FOREIGN KEY (id_entrega) REFERENCES ENTREGA(id_entrega),
    FOREIGN KEY (id_destinatario) REFERENCES DESTINATARIO(id_destinatario),
    FOREIGN KEY (id_endereco) REFERENCES ENDERECO(id_endereco)
);

CREATE TABLE ROTA (
    id_rota INT PRIMARY KEY AUTO_INCREMENT,
    id_entrega INT NOT NULL,
    coordenadas LONGTEXT NOT NULL,
    FOREIGN KEY (id_entrega) REFERENCES ENTREGA(id_entrega)
);