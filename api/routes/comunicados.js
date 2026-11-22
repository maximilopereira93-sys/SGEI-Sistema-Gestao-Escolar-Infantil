import express from "express";
import db, { salvarBanco } from "../database.js";

const router = express.Router();

function validarComunicado(dados) {
  const { titulo, mensagem, categoria } = dados;

  if (
    typeof titulo !== "string" || !titulo.trim() ||
    typeof mensagem !== "string" || !mensagem.trim() ||
    typeof categoria !== "string" || !categoria.trim()
  ) {
    return "Título, mensagem e categoria do comunicado são obrigatórios.";
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
  const erro = validarComunicado(req.body);
  if (erro) return res.status(400).json({ erro });

  const { titulo, mensagem, categoria, data_publicacao } = req.body;
  const dataFinal = data_publicacao && data_publicacao.trim()
    ? data_publicacao.trim()
    : new Date().toISOString().slice(0, 10);

  try {
    db.run(
      `INSERT INTO comunicados (titulo, mensagem, categoria, data_publicacao)
       VALUES (?, ?, ?, ?)`,
      [titulo.trim(), mensagem.trim(), categoria.trim(), dataFinal]
    );
    salvarBanco();
    const resultado = db.exec("SELECT * FROM comunicados ORDER BY id DESC LIMIT 1");
    return res.status(201).json(converterObjeto(resultado));
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível publicar o comunicado." });
  }
});

router.get("/estatisticas", (req, res) => {
  try {
    const resultado = db.exec("SELECT COUNT(*) as total FROM comunicados");
    const total = resultado.length ? resultado[0].values[0][0] : 0;
    return res.json({ total_comunicados: total });
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
        "SELECT * FROM comunicados WHERE titulo LIKE ? OR mensagem LIKE ? OR categoria LIKE ? ORDER BY id DESC",
        [termo, termo, termo]
      );
    } else {
      resultado = db.exec("SELECT * FROM comunicados ORDER BY id DESC");
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
    return res.status(500).json({ erro: "Não foi possível listar os comunicados." });
  }
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "ID inválido." });

  const erro = validarComunicado(req.body);
  if (erro) return res.status(400).json({ erro });

  const { titulo, mensagem, categoria, data_publicacao } = req.body;

  try {
    const consulta = db.exec("SELECT id FROM comunicados WHERE id = ?", [id]);
    if (!consulta.length || !consulta[0].values.length) {
      return res.status(404).json({ erro: "Comunicado não encontrado." });
    }

    db.run(
      `UPDATE comunicados SET titulo = ?, mensagem = ?, categoria = ?, data_publicacao = ? WHERE id = ?`,
      [titulo.trim(), mensagem.trim(), categoria.trim(), data_publicacao, id]
    );
    salvarBanco();
    return res.json({ mensagem: "Comunicado atualizado com sucesso!", id });
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível atualizar o comunicado." });
  }
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "ID inválido." });

  try {
    const consulta = db.exec("SELECT id FROM comunicados WHERE id = ?", [id]);
    if (!consulta.length || !consulta[0].values.length) {
      return res.status(404).json({ erro: "Comunicado não encontrado." });
    }

    db.run("DELETE FROM comunicados WHERE id = ?", [id]);
    salvarBanco();
    return res.json({ mensagem: "Comunicado excluído com sucesso!", id });
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível excluir o comunicado." });
  }
});

export default router;