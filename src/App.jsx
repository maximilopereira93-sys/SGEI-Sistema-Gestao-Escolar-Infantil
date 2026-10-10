import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000/alunos';

export default function App() {
  const [logado, setLogado] = useState(false);
  const [credenciais, setCredenciais] = useState({ usuario: '', senha: '', perfil: 'professor' });
  
  const [alunos, setAlunos] = useState([]);
  const [idEdicao, setIdEdicao] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    responsavel: '',
    telefone: '',
    email: ''
  });
  const [mensagem, setMensagem] = useState('');

  // Carregar lista de alunos
  const carregarAlunos = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAlunos(data);
      }
    } catch (err) {
      console.error('Erro ao buscar alunos:', err);
    }
  };

  useEffect(() => {
    if (logado) {
      carregarAlunos();
    }
  }, [logado]);

  // Login simples com validação do perfil
  const handleLogin = (e) => {
    e.preventDefault();
    if (credenciais.usuario && credenciais.senha) {
      setLogado(true);
    } else {
      alert('Por favor, preencha o usuário e a senha.');
    }
  };

  // Preencher formulário
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Salvar (POST / PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = idEdicao ? 'PUT' : 'POST';
      const url = idEdicao ? `${API_URL}/${idEdicao}` : API_URL;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMensagem(idEdicao ? 'Aluno atualizado com sucesso!' : 'Aluno cadastrado com sucesso!');
        setFormData({ nome: '', data_nascimento: '', responsavel: '', telefone: '', email: '' });
        setIdEdicao(null);
        carregarAlunos();
      } else {
        setMensagem('Erro ao salvar os dados do aluno.');
      }
    } catch (err) {
      console.error(err);
      setMensagem('Erro de conexão com o servidor.');
    }
  };

  // Preparar edição
  const handleEditar = (aluno) => {
    setIdEdicao(aluno.id);
    setFormData({
      nome: aluno.nome,
      data_nascimento: aluno.data_nascimento,
      responsavel: aluno.responsavel,
      telefone: aluno.telefone,
      email: aluno.email
    });
  };

  // Cancelar edição
  const handleCancelarEdicao = () => {
    setIdEdicao(null);
    setFormData({ nome: '', data_nascimento: '', responsavel: '', telefone: '', email: '' });
  };

  // Excluir (DELETE)
  const handleExcluir = async (id) => {
    if (!confirm('Deseja realmente excluir este aluno?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMensagem('Aluno excluído com sucesso!');
        carregarAlunos();
      }
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao excluir o aluno.');
    }
  };

  // TELA DE LOGIN (UI-02)
  if (!logado) {
    return (
      <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
        <h2>SGEI - Login</h2>
        <p>Sistema de Gestão Escolar Infantil</p>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '12px' }}>
            <label>Perfil de Acesso:</label><br />
            <select 
              value={credenciais.perfil} 
              onChange={(e) => setCredenciais({ ...credenciais, perfil: e.target.value })}
              style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="professor">👨‍🏫 Professor / Gestão</option>
              <option value="responsavel">👨‍👩‍👧 Responsável / Pais</option>
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Usuário:</label><br />
            <input 
              type="text" 
              style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
              value={credenciais.usuario} 
              onChange={(e) => setCredenciais({ ...credenciais, usuario: e.target.value })} 
              required 
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Senha:</label><br />
            <input 
              type="password" 
              style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
              value={credenciais.senha} 
              onChange={(e) => setCredenciais({ ...credenciais, senha: e.target.value })} 
              required 
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Entrar no Sistema
          </button>
        </form>
      </div>
    );
  }

  // DASHBOARD E PAINEL PRINCIPAL
  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>SGEI - Gestão Escolar Infantil</h1>
          <span style={{ fontSize: '14px', color: '#555' }}>
            Perfil: <strong>{credenciais.perfil === 'professor' ? '👨‍🏫 Professor / Gestão' : '👨‍👩‍👧 Responsável / Pais'}</strong>
          </span>
        </div>
        <button onClick={() => setLogado(false)} style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Sair
        </button>
      </header>

      {mensagem && <div style={{ padding: '10px', background: '#e2e3e5', marginBottom: '15px', borderRadius: '4px' }}>{mensagem}</div>}

      {/* FORMULÁRIO - APENAS PARA PROFESSORES */}
      {credenciais.perfil === 'professor' && (
        <section style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
          <h3>{idEdicao ? '✏️ Editar Aluno' : '➕ Cadastrar Novo Aluno'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label>Nome Completo:</label>
              <input type="text" name="nome" value={formData.nome} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label>Data de Nascimento:</label>
              <input type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label>Nome do Responsável:</label>
              <input type="text" name="responsavel" value={formData.responsavel} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label>Telefone:</label>
              <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label>E-mail:</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ padding: '10px 20px', background: idEdicao ? '#28a745' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                {idEdicao ? 'Atualizar Aluno' : 'Salvar Cadastramento'}
              </button>
              {idEdicao && (
                <button type="button" onClick={handleCancelarEdicao} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      {/* LISTAGEM DE ALUNOS */}
      <section>
        <h3>📋 {credenciais.perfil === 'professor' ? 'Alunos Cadastrados' : 'Consulta de Alunos / Turma'}</h3>
        {alunos.length === 0 ? (
          <p>Nenhum aluno cadastrado no momento.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#eee' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>ID</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Nome</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Responsável</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Telefone</th>
                {credenciais.perfil === 'professor' && <th style={{ padding: '8px', border: '1px solid #ddd' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.id}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{aluno.id}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{aluno.nome}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{aluno.responsavel}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{aluno.telefone}</td>
                  {credenciais.perfil === 'professor' && (
                    <td style={{ padding: '8px', border: '1px solid #ddd', display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleEditar(aluno)} style={{ padding: '4px 8px', background: '#ffc107', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Editar</button>
                      <button onClick={() => handleExcluir(aluno.id)} style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Excluir</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}