import express from "express";
import db, { salvarBanco } from "../database.js";

const router = express.Router();

function validarAula(dados) {
  const { hora_inicio, hora_fim, turma, atividade, sala, status } = dados;

  if (
    typeof hora_inicio !== "string" || !hora_inicio.trim() ||
    typeof hora_fim !== "string" || !hora_fim.trim() ||
    typeof turma !== "string" || !turma.trim() ||
    typeof atividade !== "string" || !atividade.trim() ||
    typeof sala !== "string" || !sala.trim() ||
    typeof status !== "string" || !status.trim()
  ) {
    return "Horário de início, término, turma, atividade, sala e status são obrigatórios.";
  }

  return null;
}

function converterObjeto(resultado) {
  if (!resultado.length || !resultado[0].values.length) return null;
  const colunas = resultado[0].columns;
  const valores = resultado[0].values[0];
  const obj = {};
  colunas.forEach((col, i) => { obj[col] = valores[i]; });
  return obj;
}

// POST /aulas
router.post("/", (req, res) => {
  const erro = validarAula(req.body);
  if (erro) return res.status(400).json({ erro });

  const { hora_inicio, hora_fim, turma, atividade, sala, status } = req.body;

  try {
    db.run(
      `INSERT INTO aulas (hora_inicio, hora_fim, turma, atividade, sala, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        hora_inicio.trim(),
        hora_fim.trim(),
        turma.trim(),
        atividade.trim(),
        sala.trim(),
        status.trim()
      ]
    );
    salvarBanco();
    const resultado = db.exec("SELECT * FROM aulas ORDER BY id DESC LIMIT 1");
    return res.status(201).json(converterObjeto(resultado));
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível agendar a aula." });
  }
});

// GET /aulas/estatisticas
router.get("/estatisticas", (req, res) => {
  try {
    const resultado = db.exec("SELECT COUNT(*) as total FROM aulas");
    const total = resultado.length ? resultado[0].values[0][0] : 0;
    return res.json({ total_aulas: total });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao calcular estatísticas de aulas." });
  }
});

// GET /aulas
router.get("/", (req, res) => {
  const { busca } = req.query;
  try {
    let resultado;
    if (busca && busca.trim()) {
      const termo = `%${busca.trim()}%`;
      resultado = db.exec(
        "SELECT * FROM aulas WHERE turma LIKE ? OR atividade LIKE ? OR sala LIKE ? ORDER BY hora_inicio ASC",
        [termo, termo, termo]
      );
    } else {
      resultado = db.exec("SELECT * FROM aulas ORDER BY hora_inicio ASC");
    }

    if (!resultado.length) return res.json([]);

    const colunas = resultado[0].columns;
    const lista = resultado[0].values.map((linha) => {
      const item = {};
      colunas.forEach((col, i) => { item[col] = linha[i]; });
      return item;
    });
    return res.json(lista);
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível listar as aulas." });
  }
});

// PUT /aulas/:id
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "ID inválido." });

  const erro = validarAula(req.body);
  if (erro) return res.status(400).json({ erro });

  const { hora_inicio, hora_fim, turma, atividade, sala, status } = req.body;

  try {
    const consulta = db.exec("SELECT id FROM aulas WHERE id = ?", [id]);
    if (!consulta.length || !consulta[0].values.length) {
      return res.status(404).json({ erro: "Aula não encontrada." });
    }

    db.run(
      `UPDATE aulas SET hora_inicio = ?, hora_fim = ?, turma = ?, atividade = ?, sala = ?, status = ? WHERE id = ?`,
      [hora_inicio.trim(), hora_fim.trim(), turma.trim(), atividade.trim(), sala.trim(), status.trim(), id]
    );
    salvarBanco();
    return res.json({ mensagem: "Aula atualizada com sucesso!", id });
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível atualizar a aula." });
  }
});

// DELETE /aulas/:id
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "ID inválido." });

  try {
    const consulta = db.exec("SELECT id FROM aulas WHERE id = ?", [id]);
    if (!consulta.length || !consulta[0].values.length) {
      return res.status(404).json({ erro: "Aula não encontrada." });
    }

    db.run("DELETE FROM aulas WHERE id = ?", [id]);
    salvarBanco();
    return res.json({ mensagem: "Aula removida com sucesso!", id });
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível remover a aula." });
  }
});

export default router;