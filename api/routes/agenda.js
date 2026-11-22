import express from "express";
import db, { salvarBanco } from "../database.js";

const router = express.Router();

function validarAgenda(dados) {
  const { aluno_nome, data, alimentacao, sono, humor } = dados;

  if (
    typeof aluno_nome !== "string" || !aluno_nome.trim() ||
    typeof data !== "string" || !data.trim() ||
    typeof alimentacao !== "string" || !alimentacao.trim() ||
    typeof sono !== "string" || !sono.trim() ||
    typeof humor !== "string" || !humor.trim()
  ) {
    return "Aluno, data, alimentação, sono e humor são obrigatórios.";
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

// POST /agenda
router.post("/", (req, res) => {
  const erro = validarAgenda(req.body);
  if (erro) return res.status(400).json({ erro });

  const { aluno_nome, data, alimentacao, sono, humor, observacao } = req.body;

  try {
    db.run(
      `INSERT INTO agenda_diaria (aluno_nome, data, alimentacao, sono, humor, observacao)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        aluno_nome.trim(),
        data.trim(),
        alimentacao.trim(),
        sono.trim(),
        humor.trim(),
        typeof observacao === "string" && observacao.trim() ? observacao.trim() : null
      ]
    );
    salvarBanco();
    const resultado = db.exec("SELECT * FROM agenda_diaria ORDER BY id DESC LIMIT 1");
    return res.status(201).json(converterObjeto(resultado));
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível salvar o registro na agenda." });
  }
});

// GET /agenda/estatisticas
router.get("/estatisticas", (req, res) => {
  try {
    const resultado = db.exec("SELECT COUNT(*) as total FROM agenda_diaria");
    const total = resultado.length ? resultado[0].values[0][0] : 0;
    return res.json({ total_agenda: total });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao calcular estatísticas da agenda." });
  }
});

// GET /agenda
router.get("/", (req, res) => {
  const { busca } = req.query;
  try {
    let resultado;
    if (busca && busca.trim()) {
      const termo = `%${busca.trim()}%`;
      resultado = db.exec(
        "SELECT * FROM agenda_diaria WHERE aluno_nome LIKE ? OR data LIKE ? OR humor LIKE ? ORDER BY data DESC, id DESC",
        [termo, termo, termo]
      );
    } else {
      resultado = db.exec("SELECT * FROM agenda_diaria ORDER BY data DESC, id DESC");
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
    return res.status(500).json({ erro: "Não foi possível listar a agenda diária." });
  }
});

// GET /agenda/:id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "ID inválido." });

  try {
    const resultado = db.exec("SELECT * FROM agenda_diaria WHERE id = ?", [id]);
    const item = converterObjeto(resultado);
    if (!item) return res.status(404).json({ erro: "Registro não encontrado." });
    return res.json(item);
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao consultar registro." });
  }
});

// PUT /agenda/:id
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "ID inválido." });

  const erro = validarAgenda(req.body);
  if (erro) return res.status(400).json({ erro });

  const { aluno_nome, data, alimentacao, sono, humor, observacao } = req.body;

  try {
    const consulta = db.exec("SELECT id FROM agenda_diaria WHERE id = ?", [id]);
    if (!consulta.length || !consulta[0].values.length) {
      return res.status(404).json({ erro: "Registro não encontrado." });
    }

    db.run(
      `UPDATE agenda_diaria SET aluno_nome = ?, data = ?, alimentacao = ?, sono = ?, humor = ?, observacao = ? WHERE id = ?`,
      [
        aluno_nome.trim(),
        data.trim(),
        alimentacao.trim(),
        sono.trim(),
        humor.trim(),
        typeof observacao === "string" && observacao.trim() ? observacao.trim() : null,
        id
      ]
    );
    salvarBanco();
    return res.json({ mensagem: "Agenda atualizada com sucesso!", id });
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível atualizar a agenda." });
  }
});

// DELETE /agenda/:id
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "ID inválido." });

  try {
    const consulta = db.exec("SELECT id FROM agenda_diaria WHERE id = ?", [id]);
    if (!consulta.length || !consulta[0].values.length) {
      return res.status(404).json({ erro: "Registro não encontrado." });
    }

    db.run("DELETE FROM agenda_diaria WHERE id = ?", [id]);
    salvarBanco();
    return res.json({ mensagem: "Registro removido da agenda!", id });
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível remover o registro." });
  }
});

export default router;