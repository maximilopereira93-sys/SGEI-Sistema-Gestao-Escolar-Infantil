
import express from "express";
import db, { salvarBanco } from "../database.js";

const router = express.Router();

// CADASTRAR ALUNO
router.post("/", (req, res) => {
  const {
    nome,
    data_nascimento,
    responsavel,
    telefone,
    email
  } = req.body;

  if (!nome || !data_nascimento || !responsavel || !telefone) {
    return res.status(400).json({
      erro: "Nome, data de nascimento, responsável e telefone são obrigatórios."
    });
  }

  db.run(
    `INSERT INTO alunos
    (nome, data_nascimento, responsavel, telefone, email)
    VALUES (?, ?, ?, ?, ?)`,
    [
      nome,
      data_nascimento,
      responsavel,
      telefone,
      email || null
    ]
  );

  salvarBanco();

  const resultado = db.exec(
    "SELECT * FROM alunos ORDER BY id DESC LIMIT 1"
  );

  const aluno = resultado[0].values[0];

  res.status(201).json({
    id: aluno[0],
    nome: aluno[1],
    data_nascimento: aluno[2],
    responsavel: aluno[3],
    telefone: aluno[4],
    email: aluno[5]
  });
});

// LISTAR ALUNOS
router.get("/", (req, res) => {
  const resultado = db.exec(
    "SELECT * FROM alunos ORDER BY id"
  );

  if (resultado.length === 0) {
    return res.json([]);
  }

  const colunas = resultado[0].columns;
  const valores = resultado[0].values;

  const alunos = valores.map((linha) => {
    const aluno = {};

    colunas.forEach((coluna, indice) => {
      aluno[coluna] = linha[indice];
    });

    return aluno;
  });

  res.json(alunos);
});

// CONSULTAR UM ALUNO PELO ID
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID inválido."
    });
  }

  const resultado = db.exec(
    "SELECT * FROM alunos WHERE id = ?",
    [id]
  );

  if (resultado.length === 0 || resultado[0].values.length === 0) {
    return res.status(404).json({
      erro: "Aluno não encontrado."
    });
  }

  const colunas = resultado[0].columns;
  const valores = resultado[0].values[0];
  const aluno = {};

  colunas.forEach((coluna, indice) => {
    aluno[coluna] = valores[indice];
  });

  res.json(aluno);
});

// ATUALIZAR ALUNO
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);

  const {
    nome,
    data_nascimento,
    responsavel,
    telefone,
    email
  } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID inválido."
    });
  }

  if (!nome || !data_nascimento || !responsavel || !telefone) {
    return res.status(400).json({
      erro: "Nome, data de nascimento, responsável e telefone são obrigatórios."
    });
  }

  const consulta = db.exec(
    "SELECT id FROM alunos WHERE id = ?",
    [id]
  );

  if (consulta.length === 0 || consulta[0].values.length === 0) {
    return res.status(404).json({
      erro: "Aluno não encontrado."
    });
  }

  db.run(
    `UPDATE alunos
     SET nome = ?,
         data_nascimento = ?,
         responsavel = ?,
         telefone = ?,
         email = ?
     WHERE id = ?`,
    [
      nome,
      data_nascimento,
      responsavel,
      telefone,
      email || null,
      id
    ]
  );

  salvarBanco();

  res.json({
    mensagem: "Aluno atualizado com sucesso!",
    id,
    nome,
    data_nascimento,
    responsavel,
    telefone,
    email: email || null
  });
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "ID inválido."
    });
  }

  const consulta = db.exec(
    "SELECT id FROM alunos WHERE id = ?",
    [id]
  );

  if (
    consulta.length === 0 ||
    consulta[0].values.length === 0
  ) {
    return res.status(404).json({
      erro: "Aluno não encontrado."
    });
  }

  db.run("DELETE FROM alunos WHERE id = ?", [id]);

  salvarBanco();

  res.json({
    mensagem: "Aluno excluído com sucesso!",
    id
  });
});


export default router;