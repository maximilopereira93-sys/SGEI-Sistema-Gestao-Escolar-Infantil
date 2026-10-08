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