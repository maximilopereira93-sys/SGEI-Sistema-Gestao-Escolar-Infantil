import express from "express";
import db, { salvarBanco } from "../database.js";

const router = express.Router();

// VALIDAR CAMPOS OBRIGATÓRIOS DA TURMA
function validarTurma(dados) {
  const { nome, turno, faixa_etaria, professor, capacidade } = dados;

  if (
    typeof nome !== "string" || !nome.trim() ||
    typeof turno !== "string" || !turno.trim() ||
    typeof faixa_etaria !== "string" || !faixa_etaria.trim() ||
    typeof professor !== "string" || !professor.trim()
  ) {
    return "Nome da turma, turno, faixa etária e professor responsável são obrigatórios.";
  }

  const capNum = Number(capacidade);
  if (!Number.isInteger(capNum) || capNum <= 0) {
    return "A capacidade deve ser um número inteiro maior que zero.";
  }

  return null;
}

// CONVERTER RESULTADO DO BANCO EM OBJETO
function converterTurma(resultado) {
  if (!resultado.length || !resultado[0].values.length) {
    return null;
  }

  const colunas = resultado[0].columns;
  const valores = resultado[0].values[0];
  const turma = {};

  colunas.forEach((coluna, indice) => {
    turma[coluna] = valores[indice];
  });

  return turma;
}

// CADASTRAR TURMA (POST /turmas)
router.post("/", (req, res) => {
  const erro = validarTurma(req.body);

  if (erro) {
    return res.status(400).json({ erro });
  }

  const { nome, turno, faixa_etaria, professor, capacidade } = req.body;

  try {
    db.run(
      `INSERT INTO turmas
       (nome, turno, faixa_etaria, professor, capacidade)
       VALUES (?, ?, ?, ?, ?)`,
      [
        nome.trim(),
        turno.trim(),
        faixa_etaria.trim(),
        professor.trim(),
        Number(capacidade)
      ]
    );

    salvarBanco();

    const resultado = db.exec(
      "SELECT * FROM turmas ORDER BY id DESC LIMIT 1"
    );

    return res.status(201).json(converterTurma(resultado));
  } catch (error) {
    return res.status(500).json({
      erro: "Não foi possível cadastrar a turma."
    });
  }
});

// ESTATÍSTICAS DAS TURMAS (GET /turmas/estatisticas)
router.get("/estatisticas", (req, res) => {
  try {
    const resultado = db.exec("SELECT COUNT(*) as total FROM turmas");
    const total = resultado.length ? resultado[0].values[0][0] : 0;
    return res.json({ total_turmas: total });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao calcular estatísticas das turmas." });
  }
});

// LISTAR TURMAS COM FILTRO DE BUSCA (GET /turmas)
router.get("/", (req, res) => {
  const { busca } = req.query;

  try {
    let resultado;
    if (busca && busca.trim()) {
      const termo = `%${busca.trim()}%`;
      resultado = db.exec(
        "SELECT * FROM turmas WHERE nome LIKE ? OR professor LIKE ? OR turno LIKE ? ORDER BY id",
        [termo, termo, termo]
      );
    } else {
      resultado = db.exec("SELECT * FROM turmas ORDER BY id");
    }

    if (!resultado.length) {
      return res.json([]);
    }

    const colunas = resultado[0].columns;
    const turmas = resultado[0].values.map((linha) => {
      const turma = {};
      colunas.forEach((coluna, indice) => {
        turma[coluna] = linha[indice];
      });
      return turma;
    });

    return res.json(turmas);
  } catch (error) {
    return res.status(500).json({
      erro: "Não foi possível listar as turmas."
    });
  }
});

// CONSULTAR TURMA PELO ID (GET /turmas/:id)
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "ID inválido." });
  }

  try {
    const resultado = db.exec("SELECT * FROM turmas WHERE id = ?", [id]);
    const turma = converterTurma(resultado);

    if (!turma) {
      return res.status(404).json({ erro: "Turma não encontrada." });
    }

    return res.json(turma);
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível consultar a turma." });
  }
});

// ATUALIZAR TURMA (PUT /turmas/:id)
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "ID inválido." });
  }

  const erro = validarTurma(req.body);

  if (erro) {
    return res.status(400).json({ erro });
  }

  const { nome, turno, faixa_etaria, professor, capacidade } = req.body;

  try {
    const consulta = db.exec("SELECT id FROM turmas WHERE id = ?", [id]);

    if (!consulta.length || !consulta[0].values.length) {
      return res.status(404).json({ erro: "Turma não encontrada." });
    }

    db.run(
      `UPDATE turmas
       SET nome = ?, turno = ?, faixa_etaria = ?, professor = ?, capacidade = ?
       WHERE id = ?`,
      [
        nome.trim(),
        turno.trim(),
        faixa_etaria.trim(),
        professor.trim(),
        Number(capacidade),
        id
      ]
    );

    salvarBanco();

    return res.json({
      mensagem: "Turma atualizada com sucesso!",
      id,
      nome: nome.trim(),
      turno: turno.trim(),
      faixa_etaria: faixa_etaria.trim(),
      professor: professor.trim(),
      capacidade: Number(capacidade)
    });
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível atualizar a turma." });
  }
});

// EXCLUIR TURMA (DELETE /turmas/:id)
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ erro: "ID inválido." });
  }

  try {
    const consulta = db.exec("SELECT id FROM turmas WHERE id = ?", [id]);

    if (!consulta.length || !consulta[0].values.length) {
      return res.status(404).json({ erro: "Turma não encontrada." });
    }

    db.run("DELETE FROM turmas WHERE id = ?", [id]);
    salvarBanco();

    return res.json({
      mensagem: "Turma excluída com sucesso!",
      id
    });
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível excluir a turma." });
  }
});

export default router;