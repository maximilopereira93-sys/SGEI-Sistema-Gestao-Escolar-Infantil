import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "sgei.db");

const SQL = await initSqlJs({
  locateFile: (file) =>
    path.join(__dirname, "../node_modules/sql.js/dist", file)
});

let db;

if (fs.existsSync(dbPath)) {
  const fileBuffer = fs.readFileSync(dbPath);
  db = new SQL.Database(fileBuffer);
  console.log("Banco de dados SGEI carregado com sucesso!");
} else {
  db = new SQL.Database();
  console.log("Banco de dados SGEI criado com sucesso!");
}

db.run(`
  CREATE TABLE IF NOT EXISTS alunos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    data_nascimento TEXT NOT NULL,
    responsavel TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS turmas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    turno TEXT NOT NULL,
    faixa_etaria TEXT NOT NULL,
    professor TEXT NOT NULL,
    capacidade INTEGER NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS professores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    formacao TEXT NOT NULL,
    turno TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS comunicados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    categoria TEXT NOT NULL,
    data_publicacao TEXT NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS frequencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_nome TEXT NOT NULL,
    turma_nome TEXT NOT NULL,
    data TEXT NOT NULL,
    status TEXT NOT NULL,
    observacao TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS agenda_diaria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_nome TEXT NOT NULL,
    data TEXT NOT NULL,
    alimentacao TEXT NOT NULL,
    sono TEXT NOT NULL,
    humor TEXT NOT NULL,
    observacao TEXT
  )
`);

fs.writeFileSync(
  dbPath,
  Buffer.from(db.export())
);

export function salvarBanco() {
  fs.writeFileSync(
    dbPath,
    Buffer.from(db.export())
  );
}

export default db;