CREATE DATABASE IF NOT EXISTS escola;
USE escola;

CREATE TABLE IF NOT EXISTS aula (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disciplina VARCHAR(100) NOT NULL,
    professor VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS horario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dia_semana VARCHAR(20) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    aula_id INT NOT NULL,
    CONSTRAINT fk_horario_aula FOREIGN KEY (aula_id) REFERENCES aula(id)
);
