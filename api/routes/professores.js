import express from "express";
import db, { salvarBanco } from "../database.js";

const router = express.Router();

function validarProfessor(dados) {
  const { nome, formacao, turno, telefone } = dados;

  if (
    typeof nome !== "string" || !nome.trim() ||
    typeof formacao !== "string" || !formacao.trim() ||
    typeof turno !== "string" || !turno.trim() ||
    typeof telefone !== "string" || !telefone.trim()
  ) {
    return "Nome, formação, turno e telefone são obrigatórios.";
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

router.post("/", (req, res) => {
  const erro = validarProfessor(req.body);
  if (erro) return res.status(400).json({ erro });

  const { nome, formacao, turno, telefone, email } = req.body;

  try {
    db.run(
      `INSERT INTO professores (nome, formacao, turno, telefone, email)
       VALUES (?, ?, ?, ?, ?)`,
      [
        nome.trim(),
        formacao.trim(),
        turno.trim(),
        telefone.trim(),
        typeof email === "string" && email.trim() ? email.trim() : null
      ]
    );
    salvarBanco();
    const resultado = db.exec("SELECT * FROM professores ORDER BY id DESC LIMIT 1");
    return res.status(201).json(converterObjeto(resultado));
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível cadastrar o professor." });
  }
});

router.get("/estatisticas", (req, res) => {
  try {
    const resultado = db.exec("SELECT COUNT(*) as total FROM professores");
    const total = resultado.length ? resultado[0].values[0][0] : 0;
    return res.json({ total_professores: total });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao calcular estatísticas." });
  }
});

router.get("/", (req, res) => {
  const { busca } = req.query;
  try {
    let resultado;
    if (busca && busca.trim()) {
      const termo = `%${busca.trim()}%`;
      resultado = db.exec(
        "SELECT * FROM professores WHERE nome LIKE ? OR formacao LIKE ? OR turno LIKE ? ORDER BY id",
        [termo, termo, termo]
      );
    } else {
      resultado = db.exec("SELECT * FROM professores ORDER BY id");
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
    return res.status(500).json({ erro: "Não foi possível listar os professores." });
  }
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "ID inválido." });

  const erro = validarProfessor(req.body);
  if (erro) return res.status(400).json({ erro });

  const { nome, formacao, turno, telefone, email } = req.body;

  try {
    const consulta = db.exec("SELECT id FROM professores WHERE id = ?", [id]);
    if (!consulta.length || !consulta[0].values.length) {
      return res.status(404).json({ erro: "Professor não encontrado." });
    }

    db.run(
      `UPDATE professores SET nome = ?, formacao = ?, turno = ?, telefone = ?, email = ? WHERE id = ?`,
      [
        nome.trim(),
        formacao.trim(),
        turno.trim(),
        telefone.trim(),
        typeof email === "string" && email.trim() ? email.trim() : null,
        id
      ]
    );
    salvarBanco();
    return res.json({ mensagem: "Professor atualizado com sucesso!", id });
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível atualizar o professor." });
  }
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "ID inválido." });

  try {
    const consulta = db.exec("SELECT id FROM professores WHERE id = ?", [id]);
    if (!consulta.length || !consulta[0].values.length) {
      return res.status(404).json({ erro: "Professor não encontrado." });
    }

    db.run("DELETE FROM professores WHERE id = ?", [id]);
    salvarBanco();
    return res.json({ mensagem: "Professor excluído com sucesso!", id });
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível excluir o professor." });
  }
});

export default router;