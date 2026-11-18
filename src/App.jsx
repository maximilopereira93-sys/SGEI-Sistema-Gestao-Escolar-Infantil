import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3000';

export default function App() {
  const [logado, setLogado] = useState(false);
  const [credenciais, setCredenciais] = useState({ usuario: '', senha: '', perfil: 'professor' });
  const [abaAtiva, setAbaAtiva] = useState('alunos'); // 'alunos' ou 'turmas'

  // Estados de Alunos
  const [alunos, setAlunos] = useState([]);
  const [buscaAluno, setBuscaAluno] = useState('');
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [idEdicaoAluno, setIdEdicaoAluno] = useState(null);
  const [formAluno, setFormAluno] = useState({
    nome: '',
    data_nascimento: '',
    responsavel: '',
    telefone: '',
    email: ''
  });

  // Estados de Turmas
  const [turmas, setTurmas] = useState([]);
  const [buscaTurma, setBuscaTurma] = useState('');
  const [totalTurmas, setTotalTurmas] = useState(0);
  const [idEdicaoTurma, setIdEdicaoTurma] = useState(null);
  const [formTurma, setFormTurma] = useState({
    nome: '',
    turno: 'Matutino',
    faixa_etaria: '',
    professor: '',
    capacidade: ''
  });

  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  // Carregar dados de Alunos
  const carregarAlunos = async (termo = buscaAluno) => {
    try {
      const url = termo.trim()
        ? `${API_BASE}/alunos?busca=${encodeURIComponent(termo)}`
        : `${API_BASE}/alunos`;

      const [resLista, resStats] = await Promise.all([
        fetch(url),
        fetch(`${API_BASE}/alunos/estatisticas`)
      ]);

      const dataLista = await resLista.json();
      if (Array.isArray(dataLista)) setAlunos(dataLista);

      if (resStats.ok) {
        const dataStats = await resStats.json();
        setTotalAlunos(dataStats.total_alunos || 0);
      }
    } catch (err) {
      console.error('Erro ao buscar alunos:', err);
    }
  };

  // Carregar dados de Turmas
  const carregarTurmas = async (termo = buscaTurma) => {
    try {
      const url = termo.trim()
        ? `${API_BASE}/turmas?busca=${encodeURIComponent(termo)}`
        : `${API_BASE}/turmas`;

      const [resLista, resStats] = await Promise.all([
        fetch(url),
        fetch(`${API_BASE}/turmas/estatisticas`)
      ]);

      const dataLista = await resLista.json();
      if (Array.isArray(dataLista)) setTurmas(dataLista);

      if (resStats.ok) {
        const dataStats = await resStats.json();
        setTotalTurmas(dataStats.total_turmas || 0);
      }
    } catch (err) {
      console.error('Erro ao buscar turmas:', err);
    }
  };

  useEffect(() => {
    if (logado) {
      carregarAlunos();
      carregarTurmas();
    }
  }, [logado, buscaAluno, buscaTurma]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (credenciais.usuario && credenciais.senha) {
      setLogado(true);
    } else {
      alert('Por favor, preencha o usuário e a senha.');
    }
  };

  // Handlers de Alunos
  const handleSubmitAluno = async (e) => {
    e.preventDefault();
    try {
      const method = idEdicaoAluno ? 'PUT' : 'POST';
      const url = idEdicaoAluno
        ? `${API_BASE}/alunos/${idEdicaoAluno}`
        : `${API_BASE}/alunos`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formAluno)
      });

      const data = await res.json();

      if (res.ok) {
        setMensagem({
          texto: idEdicaoAluno ? 'Aluno atualizado com sucesso!' : 'Aluno cadastrado com sucesso!',
          tipo: 'sucesso'
        });
        setFormAluno({ nome: '', data_nascimento: '', responsavel: '', telefone: '', email: '' });
        setIdEdicaoAluno(null);
        carregarAlunos();
      } else {
        setMensagem({ texto: data.erro || 'Erro ao salvar aluno.', tipo: 'erro' });
      }
    } catch (err) {
      setMensagem({ texto: 'Erro de conexão com o servidor.', tipo: 'erro' });
    }
  };

  const handleEditarAluno = (aluno) => {
    setIdEdicaoAluno(aluno.id);
    setFormAluno({
      nome: aluno.nome,
      data_nascimento: aluno.data_nascimento,
      responsavel: aluno.responsavel,
      telefone: aluno.telefone,
      email: aluno.email || ''
    });
  };

  const handleExcluirAluno = async (id) => {
    if (!confirm('Deseja realmente excluir este aluno?')) return;
    try {
      const res = await fetch(`${API_BASE}/alunos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setMensagem({ texto: 'Aluno excluído com sucesso!', tipo: 'sucesso' });
        carregarAlunos();
      } else {
        setMensagem({ texto: data.erro || 'Erro ao excluir aluno.', tipo: 'erro' });
      }
    } catch (err) {
      setMensagem({ texto: 'Erro de conexão ao excluir aluno.', tipo: 'erro' });
    }
  };

  // Handlers de Turmas
  const handleSubmitTurma = async (e) => {
    e.preventDefault();
    try {
      const method = idEdicaoTurma ? 'PUT' : 'POST';
      const url = idEdicaoTurma
        ? `${API_BASE}/turmas/${idEdicaoTurma}`
        : `${API_BASE}/turmas`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formTurma,
          capacidade: Number(formTurma.capacidade)
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMensagem({
          texto: idEdicaoTurma ? 'Turma atualizada com sucesso!' : 'Turma cadastrada com sucesso!',
          tipo: 'sucesso'
        });
        setFormTurma({ nome: '', turno: 'Matutino', faixa_etaria: '', professor: '', capacidade: '' });
        setIdEdicaoTurma(null);
        carregarTurmas();
      } else {
        setMensagem({ texto: data.erro || 'Erro ao salvar turma.', tipo: 'erro' });
      }
    } catch (err) {
      setMensagem({ texto: 'Erro de conexão com o servidor.', tipo: 'erro' });
    }
  };

  const handleEditarTurma = (turma) => {
    setIdEdicaoTurma(turma.id);
    setFormTurma({
      nome: turma.nome,
      turno: turma.turno,
      faixa_etaria: turma.faixa_etaria,
      professor: turma.professor,
      capacidade: turma.capacidade
    });
  };

  const handleExcluirTurma = async (id) => {
    if (!confirm('Deseja realmente excluir esta turma?')) return;
    try {
      const res = await fetch(`${API_BASE}/turmas/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setMensagem({ texto: 'Turma excluída com sucesso!', tipo: 'sucesso' });
        carregarTurmas();
      } else {
        setMensagem({ texto: data.erro || 'Erro ao excluir turma.', tipo: 'erro' });
      }
    } catch (err) {
      setMensagem({ texto: 'Erro de conexão ao excluir turma.', tipo: 'erro' });
    }
  };

  const formatarDataBR = (dataISO) => {
    if (!dataISO) return '-';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  };

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

  return (
    <div style={{ maxWidth: '980px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
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

      {/* CARDS DE RESUMO */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        <div style={{ background: '#e9f5ff', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #007bff' }}>
          <span style={{ fontSize: '13px', color: '#555' }}>Alunos Matriculados</span>
          <h2 style={{ margin: '5px 0 0 0', color: '#0056b3' }}>{totalAlunos}</h2>
        </div>
        <div style={{ background: '#fff8e6', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ffc107' }}>
          <span style={{ fontSize: '13px', color: '#555' }}>Turmas Ativas</span>
          <h2 style={{ margin: '5px 0 0 0', color: '#b38600' }}>{totalTurmas}</h2>
        </div>
        <div style={{ background: '#eefaf0', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
          <span style={{ fontSize: '13px', color: '#555' }}>Status do Sistema</span>
          <h2 style={{ margin: '5px 0 0 0', color: '#1e7e34', fontSize: '18px' }}>API Conectada</h2>
        </div>
      </div>

      {/* MENU DE NAVEGAÇÃO POR ABAS (UI-T01) */}
      <nav style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #dee2e6', paddingBottom: '10px' }}>
        <button
          onClick={() => { setAbaAtiva('alunos'); setMensagem({ texto: '', tipo: '' }); }}
          style={{
            padding: '10px 20px',
            background: abaAtiva === 'alunos' ? '#007bff' : '#e9ecef',
            color: abaAtiva === 'alunos' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          👶 Gestão de Alunos
        </button>
        <button
          onClick={() => { setAbaAtiva('turmas'); setMensagem({ texto: '', tipo: '' }); }}
          style={{
            padding: '10px 20px',
            background: abaAtiva === 'turmas' ? '#007bff' : '#e9ecef',
            color: abaAtiva === 'turmas' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🏫 Gestão de Turmas
        </button>
      </nav>

      {mensagem.texto && (
        <div style={{
          padding: '10px',
          background: mensagem.tipo === 'erro' ? '#f8d7da' : '#d4edda',
          color: mensagem.tipo === 'erro' ? '#721c24' : '#155724',
          marginBottom: '15px',
          borderRadius: '4px'
        }}>
          {mensagem.texto}
        </div>
      )}

      {/* ==================== ABA DE ALUNOS ==================== */}
      {abaAtiva === 'alunos' && (
        <>
          {credenciais.perfil === 'professor' && (
            <section style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
              <h3>{idEdicaoAluno ? '✏️ Editar Aluno' : '➕ Cadastrar Novo Aluno'}</h3>
              <form onSubmit={handleSubmitAluno} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label>Nome Completo:</label>
                  <input type="text" value={formAluno.nome} onChange={(e) => setFormAluno({ ...formAluno, nome: e.target.value })} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                  <label>Data de Nascimento:</label>
                  <input type="date" value={formAluno.data_nascimento} onChange={(e) => setFormAluno({ ...formAluno, data_nascimento: e.target.value })} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                  <label>Nome do Responsável:</label>
                  <input type="text" value={formAluno.responsavel} onChange={(e) => setFormAluno({ ...formAluno, responsavel: e.target.value })} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                  <label>Telefone:</label>
                  <input type="text" value={formAluno.telefone} onChange={(e) => setFormAluno({ ...formAluno, telefone: e.target.value })} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label>E-mail (opcional):</label>
                  <input type="email" value={formAluno.email} onChange={(e) => setFormAluno({ ...formAluno, email: e.target.value })} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" style={{ padding: '10px 20px', background: idEdicaoAluno ? '#28a745' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {idEdicaoAluno ? 'Atualizar Aluno' : 'Salvar Cadastramento'}
                  </button>
                  {idEdicaoAluno && (
                    <button type="button" onClick={() => { setIdEdicaoAluno(null); setFormAluno({ nome: '', data_nascimento: '', responsavel: '', telefone: '', email: '' }); }} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </section>
          )}

          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>📋 Lista de Alunos</h3>
              <input
                type="text"
                placeholder="🔍 Buscar aluno ou responsável..."
                value={buscaAluno}
                onChange={(e) => setBuscaAluno(e.target.value)}
                style={{ padding: '8px 12px', width: '280px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            {alunos.length === 0 ? (
              <p>Nenhum aluno encontrado.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#eee' }}>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>ID</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Nome</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Nascimento</th>
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
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formatarDataBR(aluno.data_nascimento)}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{aluno.responsavel}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{aluno.telefone}</td>
                      {credenciais.perfil === 'professor' && (
                        <td style={{ padding: '8px', border: '1px solid #ddd', display: 'flex', gap: '5px' }}>
                          <button onClick={() => handleEditarAluno(aluno)} style={{ padding: '4px 8px', background: '#ffc107', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Editar</button>
                          <button onClick={() => handleExcluirAluno(aluno.id)} style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Excluir</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}

      {/* ==================== ABA DE TURMAS ==================== */}
      {abaAtiva === 'turmas' && (
        <>
          {credenciais.perfil === 'professor' && (
            <section style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
              <h3>{idEdicaoTurma ? '✏️ Editar Turma' : '➕ Cadastrar Nova Turma'}</h3>
              <form onSubmit={handleSubmitTurma} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label>Nome da Turma (ex: Maternal I):</label>
                  <input type="text" value={formTurma.nome} onChange={(e) => setFormTurma({ ...formTurma, nome: e.target.value })} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                  <label>Turno:</label>
                  <select value={formTurma.turno} onChange={(e) => setFormTurma({ ...formTurma, turno: e.target.value })} style={{ width: '100%', padding: '8px' }}>
                    <option value="Matutino">Matutino</option>
                    <option value="Vespertino">Vespertino</option>
                    <option value="Integral">Integral</option>
                  </select>
                </div>
                <div>
                  <label>Faixa Etária (ex: 2 a 3 anos):</label>
                  <input type="text" value={formTurma.faixa_etaria} onChange={(e) => setFormTurma({ ...formTurma, faixa_etaria: e.target.value })} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                  <label>Professor Responsável:</label>
                  <input type="text" value={formTurma.professor} onChange={(e) => setFormTurma({ ...formTurma, professor: e.target.value })} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label>Capacidade Máxima de Alunos:</label>
                  <input type="number" min="1" value={formTurma.capacidade} onChange={(e) => setFormTurma({ ...formTurma, capacidade: e.target.value })} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" style={{ padding: '10px 20px', background: idEdicaoTurma ? '#28a745' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {idEdicaoTurma ? 'Atualizar Turma' : 'Salvar Turma'}
                  </button>
                  {idEdicaoTurma && (
                    <button type="button" onClick={() => { setIdEdicaoTurma(null); setFormTurma({ nome: '', turno: 'Matutino', faixa_etaria: '', professor: '', capacidade: '' }); }} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </section>
          )}

          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>🏫 Turmas Cadastradas</h3>
              <input
                type="text"
                placeholder="🔍 Buscar turma, professor ou turno..."
                value={buscaTurma}
                onChange={(e) => setBuscaTurma(e.target.value)}
                style={{ padding: '8px 12px', width: '280px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            {turmas.length === 0 ? (
              <p>Nenhuma turma cadastrada no momento.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#eee' }}>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>ID</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Turma</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Turno</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Faixa Etária</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Professor</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Vagas</th>
                    {credenciais.perfil === 'professor' && <th style={{ padding: '8px', border: '1px solid #ddd' }}>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {turmas.map((turma) => (
                    <tr key={turma.id}>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{turma.id}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{turma.nome}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{turma.turno}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{turma.faixa_etaria}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{turma.professor}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{turma.capacidade}</td>
                      {credenciais.perfil === 'professor' && (
                        <td style={{ padding: '8px', border: '1px solid #ddd', display: 'flex', gap: '5px' }}>
                          <button onClick={() => handleEditarTurma(turma)} style={{ padding: '4px 8px', background: '#ffc107', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Editar</button>
                          <button onClick={() => handleExcluirTurma(turma.id)} style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Excluir</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}