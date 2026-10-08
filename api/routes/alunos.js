import express from "express";
import db, { salvarBanco } from "../database.js";

const router = express.Router();

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
    `
    INSERT INTO alunos
    (nome, data_nascimento, responsavel, telefone, email)
    VALUES (?, ?, ?, ?, ?)
    `,
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
router.get("/", (req, res) => {
    const resultado = db.exec("SELECT * FROM alunos ORDER BY id");
  
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
  
export default router;