import express from "express";
import db, { salvarBanco } from "../database.js";

const router = express.Router();

function validarFrequencia(dados) {
  const { aluno_nome, turma_nome, data, status } = dados;

  if (
    typeof aluno_nome !== "string" || !aluno_nome.trim() ||
    typeof turma_nome !== "string" || !turma_nome.trim() ||
    typeof data !== "string" || !data.trim() ||
    typeof status !== "string" || !status.trim()
  ) {
    return "Aluno, turma, data e status da presença são obrigatórios.";
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
  const erro = validarFrequencia(req.body);
  if (erro) return res.status(400).json({ erro });

  const { aluno_nome, turma_nome, data, status, observacao } = req.body;

  try {
    db.run(
      `INSERT INTO frequencias (aluno_nome, turma_nome, data, status, observacao)
       VALUES (?, ?, ?, ?, ?)`,
      [
        aluno_nome.trim(),
        turma_nome.trim(),
        data.trim(),
        status.trim(),
        typeof observacao === "string" && observacao.trim() ? observacao.trim() : null
      ]
    );
    salvarBanco();
    const resultado = db.exec("SELECT * FROM frequencias ORDER BY id DESC LIMIT 1");
    return res.status(201).json(converterObjeto(resultado));
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível registrar a frequência." });
  }
});

router.get("/estatisticas", (req, res) => {
  try {
    const resTotal = db.exec("SELECT COUNT(*) FROM frequencias");
    const resPresentes = db.exec("SELECT COUNT(*) FROM frequencias WHERE status = 'Presente'");
    const total = resTotal.length ? resTotal[0].values[0][0] : 0;
    const presentes = resPresentes.length ? resPresentes[0].values[0][0] : 0;
    const percentual = total > 0 ? Math.round((presentes / total) * 100) : 100;

    return res.json({ total_registros: total, percentual_presenca: percentual });
  } catch (error) {
    return res.status(500).json({ erro: "Erro ao calcular estatísticas de frequência." });
  }
});

router.get("/", (req, res) => {
  const { busca } = req.query;
  try {
    let resultado;
    if (busca && busca.trim()) {
      const termo = `%${busca.trim()}%`;
      resultado = db.exec(
        "SELECT * FROM frequencias WHERE aluno_nome LIKE ? OR turma_nome LIKE ? OR status LIKE ? ORDER BY data DESC, id DESC",
        [termo, termo, termo]
      );
    } else {
      resultado = db.exec("SELECT * FROM frequencias ORDER BY data DESC, id DESC");
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
    return res.status(500).json({ erro: "Não foi possível listar as frequências." });
  }
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "ID inválido." });

  const erro = validarFrequencia(req.body);
  if (erro) return res.status(400).json({ erro });

  const { aluno_nome, turma_nome, data, status, observacao } = req.body;

  try {
    const consulta = db.exec("SELECT id FROM frequencias WHERE id = ?", [id]);
    if (!consulta.length || !consulta[0].values.length) {
      return res.status(404).json({ erro: "Registro de frequência não encontrado." });
    }

    db.run(
      `UPDATE frequencias SET aluno_nome = ?, turma_nome = ?, data = ?, status = ?, observacao = ? WHERE id = ?`,
      [
        aluno_nome.trim(),
        turma_nome.trim(),
        data.trim(),
        status.trim(),
        typeof observacao === "string" && observacao.trim() ? observacao.trim() : null,
        id
      ]
    );
    salvarBanco();
    return res.json({ mensagem: "Frequência atualizada com sucesso!", id });
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível atualizar a frequência." });
  }
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ erro: "ID inválido." });

  try {
    const consulta = db.exec("SELECT id FROM frequencias WHERE id = ?", [id]);
    if (!consulta.length || !consulta[0].values.length) {
      return res.status(404).json({ erro: "Registro de frequência não encontrado." });
    }

    db.run("DELETE FROM frequencias WHERE id = ?", [id]);
    salvarBanco();
    return res.json({ mensagem: "Registro excluído com sucesso!", id });
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível excluir o registro." });
  }
});

export default router;