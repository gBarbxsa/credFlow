USE MASTER IF EXISTS(
SELECT * FROM SYS.databases WHERE NAME = 'credFlow')
Drop database credFlow
GO
CREATE DATABASE credFlow
GO
USE credFlow


CREATE TABLE Usuario
(
 id    INT                  IDENTITY,
 nome  VARCHAr(100)         NOT NULL,
 email VARCHAR(100) UNIQUE  NOT NULL,
 senha VARCHAR(100)         NOT NULL,
 fotoPerfil VARBINARY(MAX)      NULL,
 statusUsuario VARCHAR(20)  NOT NULL, -- ATIVO OU INATIVO

 PRIMARY KEY(id)
)

CREATE TABLE Transacao
(
 id         INT               IDENTITY,
 id_usuario INT               NOT NULL,
 valor      INT               NOT NULL,
 descricao  VARCHAR(300)      NOT NULL,
 dataTransacao DATE           NOT NULL,
 statusTransacao VARCHAR(20)  NOT NULL, -- ATIVO OU INATIVO

 PRIMARY KEY(id),
 FOREIGN KEY(id_usuario) REFERENCES Usuario(id)
)