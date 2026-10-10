
import express from "express";
import db, { salvarBanco } from "../database.js";

const router = express.Router();

// VALIDAR CAMPOS OBRIGATÓRIOS
function validarAluno(dados) {
  const { nome, data_nascimento, responsavel, telefone } = dados;

  if (
    typeof nome !== "string" || !nome.trim() ||
    typeof data_nascimento !== "string" ||
    !data_nascimento.trim() ||
    typeof responsavel !== "string" ||
    !responsavel.trim() ||
    typeof telefone !== "string" ||
    !telefone.trim()
  ) {
    return "Nome, data de nascimento, responsável e telefone são obrigatórios.";
  }

  const dataValida =
    /^\d{4}-\d{2}-\d{2}$/.test(data_nascimento) &&
    !Number.isNaN(Date.parse(data_nascimento)) &&
    new Date(data_nascimento).toISOString().slice(0, 10) === data_nascimento;

  if (!dataValida) {
    return "A data de nascimento deve ser válida no formato AAAA-MM-DD.";
  }

  return null;
}

// CONVERTER RESULTADO DO BANCO EM OBJETO
function converterAluno(resultado) {
  if (!resultado.length || !resultado[0].values.length) {
    return null;
  }

  const colunas = resultado[0].columns;
  const valores = resultado[0].values[0];
  const aluno = {};

  colunas.forEach((coluna, indice) => {
    aluno[coluna] = valores[indice];
  });

  return aluno;
}

// CADASTRAR ALUNO
router.post("/", (req, res) => {
  const erro = validarAluno(req.body);

  if (erro) {
    return res.status(400).json({ erro });
  }

  const {
    nome,
    data_nascimento,
    responsavel,
    telefone,
    email
  } = req.body;

  try {
    db.run(
      `INSERT INTO alunos
       (nome, data_nascimento, responsavel, telefone, email)
       VALUES (?, ?, ?, ?, ?)`,
      [
        nome.trim(),
        data_nascimento,
        responsavel.trim(),
        telefone.trim(),
        typeof email === "string" && email.trim()
          ? email.trim()
          : null
      ]
    );

    salvarBanco();

    const resultado = db.exec(
      "SELECT * FROM alunos ORDER BY id DESC LIMIT 1"
    );

    return res.status(201).json(converterAluno(resultado));
  } catch (error) {
    return res.status(500).json({
      erro: "Não foi possível cadastrar o aluno."
    });
  }
});

// LISTAR ALUNOS
router.get("/", (req, res) => {
  try {
    const resultado = db.exec(
      "SELECT * FROM alunos ORDER BY id"
    );

    if (!resultado.length) {
      return res.json([]);
    }

    const colunas = resultado[0].columns;
    const alunos = resultado[0].values.map((linha) => {
      const aluno = {};

      colunas.forEach((coluna, indice) => {
        aluno[coluna] = linha[indice];
      });

      return aluno;
    });

    return res.json(alunos);
  } catch (error) {
    return res.status(500).json({
      erro: "Não foi possível listar os alunos."
    });
  }
});

// CONSULTAR ALUNO PELO ID
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "ID inválido." });
  }

  try {
    const resultado = db.exec(
      "SELECT * FROM alunos WHERE id = ?",
      [id]
    );

    const aluno = converterAluno(resultado);

    if (!aluno) {
      return res.status(404).json({
        erro: "Aluno não encontrado."
      });
    }

    return res.json(aluno);
  } catch (error) {
    return res.status(500).json({
      erro: "Não foi possível consultar o aluno."
    });
  }
});

// ATUALIZAR ALUNO
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "ID inválido." });
  }

  const erro = validarAluno(req.body);

  if (erro) {
    return res.status(400).json({ erro });
  }

  const {
    nome,
    data_nascimento,
    responsavel,
    telefone,
    email
  } = req.body;

  try {
    const consulta = db.exec(
      "SELECT id FROM alunos WHERE id = ?",
      [id]
    );

    if (!consulta.length || !consulta[0].values.length) {
      return res.status(404).json({
        erro: "Aluno não encontrado."
      });
    }

    db.run(
      `UPDATE alunos
       SET nome = ?, data_nascimento = ?, responsavel = ?,
           telefone = ?, email = ?
       WHERE id = ?`,
      [
        nome.trim(),
        data_nascimento,
        responsavel.trim(),
        telefone.trim(),
        typeof email === "string" && email.trim()
          ? email.trim()
          : null,
        id
      ]
    );

    salvarBanco();

    return res.json({
      mensagem: "Aluno atualizado com sucesso!",
      id,
      nome: nome.trim(),
      data_nascimento,
      responsavel: responsavel.trim(),
      telefone: telefone.trim(),
      email: typeof email === "string" && email.trim()
        ? email.trim()
        : null
    });
  } catch (error) {
    return res.status(500).json({
      erro: "Não foi possível atualizar o aluno."
    });
  }
});

// EXCLUIR ALUNO
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "ID inválido." });
  }

  try {
    const consulta = db.exec(
      "SELECT id FROM alunos WHERE id = ?",
      [id]
    );

    if (!consulta.length || !consulta[0].values.length) {
      return res.status(404).json({
        erro: "Aluno não encontrado."
      });
    }

    db.run("DELETE FROM alunos WHERE id = ?", [id]);

    salvarBanco();

    return res.json({
      mensagem: "Aluno excluído com sucesso!",
      id
    });
  } catch (error) {
    return res.status(500).json({
      erro: "Não foi possível excluir o aluno."
    });
  }
});

export default router;
