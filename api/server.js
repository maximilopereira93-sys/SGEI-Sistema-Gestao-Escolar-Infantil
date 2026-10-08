import express from "express";
import cors from "cors";
import db from "./database.js";
import alunosRoutes from "./routes/alunos.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    mensagem: "API do Sistema de Gestão Escolar Infantil (SGEI) funcionando!"
  });
});

app.use("/alunos", alunosRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`API SGEI funcionando na porta ${PORT}`);
});