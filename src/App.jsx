import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3000';

export default function App() {
  const [logado, setLogado] = useState(false);
  const [credenciais, setCredenciais] = useState({ usuario: '', senha: '', perfil: 'professor' });
  const [abaAtiva, setAbaAtiva] = useState('alunos'); // 'alunos' | 'turmas' | 'professores' | 'frequencias' | 'comunicados' | 'agenda'

  // Resumo / Estatísticas
  const [stats, setStats] = useState({
    alunos: 0,
    turmas: 0,
    professores: 0,
    presenca: 100,
    comunicados: 0,
    agenda: 0
  });

  // Estados Alunos
  const [alunos, setAlunos] = useState([]);
  const [buscaAluno, setBuscaAluno] = useState('');
  const [idEdicaoAluno, setIdEdicaoAluno] = useState(null);
  const [formAluno, setFormAluno] = useState({ nome: '', data_nascimento: '', responsavel: '', telefone: '', email: '' });

  // Estados Turmas
  const [turmas, setTurmas] = useState([]);
  const [buscaTurma, setBuscaTurma] = useState('');
  const [idEdicaoTurma, setIdEdicaoTurma] = useState(null);
  const [formTurma, setFormTurma] = useState({ nome: '', turno: 'Matutino', faixa_etaria: '', professor: '', capacidade: '' });

  // Estados Professores
  const [professores, setProfessores] = useState([]);
  const [buscaProfessor, setBuscaProfessor] = useState('');
  const [idEdicaoProfessor, setIdEdicaoProfessor] = useState(null);
  const [formProfessor, setFormProfessor] = useState({ nome: '', formacao: '', turno: 'Matutino', telefone: '', email: '' });

  // Estados Frequências
  const [frequencias, setFrequencias] = useState([]);
  const [buscaFrequencia, setBuscaFrequencia] = useState('');
  const [idEdicaoFrequencia, setIdEdicaoFrequencia] = useState(null);
  const [formFrequencia, setFormFrequencia] = useState({
    aluno_nome: '',
    turma_nome: '',
    data: new Date().toISOString().slice(0, 10),
    status: 'Presente',
    observacao: ''
  });

  // Estados Comunicados
  const [comunicados, setComunicados] = useState([]);
  const [buscaComunicado, setBuscaComunicado] = useState('');
  const [idEdicaoComunicado, setIdEdicaoComunicado] = useState(null);
  const [formComunicado, setFormComunicado] = useState({
    titulo: '',
    categoria: 'Aviso Geral',
    mensagem: '',
    data_publicacao: new Date().toISOString().slice(0, 10)
  });

  // Estados Agenda Diária
  const [agenda, setAgenda] = useState([]);
  const [buscaAgenda, setBuscaAgenda] = useState('');
  const [idEdicaoAgenda, setIdEdicaoAgenda] = useState(null);
  const [formAgenda, setFormAgenda] = useState({
    aluno_nome: '',
    data: new Date().toISOString().slice(0, 10),
    alimentacao: 'Comeu tudo',
    sono: 'Dormiu bem (1h30)',
    humor: 'Alegre / Participativo',
    observacao: ''
  });

  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });

  const carregarTudo = async () => {
    try {
      const [
        resAlunos, statAlunos,
        resTurmas, statTurmas,
        resProfs, statProfs,
        resFreqs, statFreqs,
        resComs, statComs,
        resAgenda, statAgenda
      ] = await Promise.all([
        fetch(buscaAluno.trim() ? `${API_BASE}/alunos?busca=${encodeURIComponent(buscaAluno)}` : `${API_BASE}/alunos`),
        fetch(`${API_BASE}/alunos/estatisticas`),
        fetch(buscaTurma.trim() ? `${API_BASE}/turmas?busca=${encodeURIComponent(buscaTurma)}` : `${API_BASE}/turmas`),
        fetch(`${API_BASE}/turmas/estatisticas`),
        fetch(buscaProfessor.trim() ? `${API_BASE}/professores?busca=${encodeURIComponent(buscaProfessor)}` : `${API_BASE}/professores`),
        fetch(`${API_BASE}/professores/estatisticas`),
        fetch(buscaFrequencia.trim() ? `${API_BASE}/frequencias?busca=${encodeURIComponent(buscaFrequencia)}` : `${API_BASE}/frequencias`),
        fetch(`${API_BASE}/frequencias/estatisticas`),
        fetch(buscaComunicado.trim() ? `${API_BASE}/comunicados?busca=${encodeURIComponent(buscaComunicado)}` : `${API_BASE}/comunicados`),
        fetch(`${API_BASE}/comunicados/estatisticas`),
        fetch(buscaAgenda.trim() ? `${API_BASE}/agenda?busca=${encodeURIComponent(buscaAgenda)}` : `${API_BASE}/agenda`),
        fetch(`${API_BASE}/agenda/estatisticas`)
      ]);

      const [
        dAlunos, sAlunos,
        dTurmas, sTurmas,
        dProfs, sProfs,
        dFreqs, sFreqs,
        dComs, sComs,
        dAgenda, sAgenda
      ] = await Promise.all([
        resAlunos.json(), statAlunos.json(),
        resTurmas.json(), statTurmas.json(),
        resProfs.json(), statProfs.json(),
        resFreqs.json(), statFreqs.json(),
        resComs.json(), statComs.json(),
        resAgenda.json(), statAgenda.json()
      ]);

      if (Array.isArray(dAlunos)) setAlunos(dAlunos);
      if (Array.isArray(dTurmas)) setTurmas(dTurmas);
      if (Array.isArray(dProfs)) setProfessores(dProfs);
      if (Array.isArray(dFreqs)) setFrequencias(dFreqs);
      if (Array.isArray(dComs)) setComunicados(dComs);
      if (Array.isArray(dAgenda)) setAgenda(dAgenda);

      setStats({
        alunos: sAlunos.total_alunos || 0,
        turmas: sTurmas.total_turmas || 0,
        professores: sProfs.total_professores || 0,
        presenca: sFreqs.percentual_presenca ?? 100,
        comunicados: sComs.total_comunicados || 0,
        agenda: sAgenda.total_agenda || 0
      });
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  useEffect(() => {
    if (logado) {
      carregarTudo();
    }
  }, [logado, buscaAluno, buscaTurma, buscaProfessor, buscaFrequencia, buscaComunicado, buscaAgenda]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (credenciais.usuario && credenciais.senha) {
      setLogado(true);
    } else {
      alert('Por favor, preencha o usuário e a senha.');
    }
  };

  const formatarDataBR = (dataISO) => {
    if (!dataISO) return '-';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  // Função genérica de envio (POST / PUT)
  const salvarRegistro = async (e, endpoint, idEdicao, payload, limparFn, msgSucesso) => {
    e.preventDefault();
    try {
      const method = idEdicao ? 'PUT' : 'POST';
      const url = idEdicao ? `${API_BASE}/${endpoint}/${idEdicao}` : `${API_BASE}/${endpoint}`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setMensagem({ texto: msgSucesso, tipo: 'sucesso' });
        limparFn();
        carregarTudo();
      } else {
        setMensagem({ texto: data.erro || 'Erro ao salvar registro.', tipo: 'erro' });
      }
    } catch (err) {
      setMensagem({ texto: 'Erro de conexão com o servidor.', tipo: 'erro' });
    }
  };

  // Função genérica de exclusão (DELETE)
  const excluirRegistro = async (endpoint, id, msgConfirm, msgSucesso) => {
    if (!confirm(msgConfirm)) return;
    try {
      const res = await fetch(`${API_BASE}/${endpoint}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setMensagem({ texto: msgSucesso, tipo: 'sucesso' });
        carregarTudo();
      } else {
        setMensagem({ texto: data.erro || 'Erro ao excluir registro.', tipo: 'erro' });
      }
    } catch (err) {
      setMensagem({ texto: 'Erro de conexão ao excluir.', tipo: 'erro' });
    }
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

  const abas = [
    { id: 'alunos', label: '👶 Alunos' },
    { id: 'turmas', label: '🏫 Turmas' },
    { id: 'professores', label: '👩‍🏫 Professores' },
    { id: 'frequencias', label: '✅ Frequência' },
    { id: 'comunicados', label: '📢 Comunicados' },
    { id: 'agenda', label: '📔 Agenda Diária' }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
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

      {/* CARDS DE INDICADORES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: '#e9f5ff', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #007bff' }}>
          <span style={{ fontSize: '12px', color: '#555' }}>Alunos</span>
          <h2 style={{ margin: '4px 0 0 0', color: '#0056b3' }}>{stats.alunos}</h2>
        </div>
        <div style={{ background: '#fff8e6', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ffc107' }}>
          <span style={{ fontSize: '12px', color: '#555' }}>Turmas</span>
          <h2 style={{ margin: '4px 0 0 0', color: '#b38600' }}>{stats.turmas}</h2>
        </div>
        <div style={{ background: '#f3e8ff', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #6f42c1' }}>
          <span style={{ fontSize: '12px', color: '#555' }}>Professores</span>
          <h2 style={{ margin: '4px 0 0 0', color: '#4c2889' }}>{stats.professores}</h2>
        </div>
        <div style={{ background: '#eefaf0', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
          <span style={{ fontSize: '12px', color: '#555' }}>Frequência</span>
          <h2 style={{ margin: '4px 0 0 0', color: '#1e7e34' }}>{stats.presenca}%</h2>
        </div>
        <div style={{ background: '#ffeef0', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #dc3545' }}>
          <span style={{ fontSize: '12px', color: '#555' }}>Comunicados</span>
          <h2 style={{ margin: '4px 0 0 0', color: '#a71d2a' }}>{stats.comunicados}</h2>
        </div>
        <div style={{ background: '#e6f7f9', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #17a2b8' }}>
          <span style={{ fontSize: '12px', color: '#555' }}>Agenda Diária</span>
          <h2 style={{ margin: '4px 0 0 0', color: '#117a8b' }}>{stats.agenda}</h2>
        </div>
      </div>

      {/* MENU DE ABAS */}
      <nav style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid #dee2e6', paddingBottom: '10px', flexWrap: 'wrap' }}>
        {abas.map((aba) => (
          <button
            key={aba.id}
            onClick={() => { setAbaAtiva(aba.id); setMensagem({ texto: '', tipo: '' }); }}
            style={{
              padding: '10px 15px',
              background: abaAtiva === aba.id ? '#007bff' : '#e9ecef',
              color: abaAtiva === aba.id ? '#fff' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {aba.label}
          </button>
        ))}
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

      {/* ==================== 1. ABA ALUNOS ==================== */}
      {abaAtiva === 'alunos' && (
        <>
          {credenciais.perfil === 'professor' && (
            <section style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
              <h3>{idEdicaoAluno ? '✏️ Editar Aluno' : '➕ Cadastrar Novo Aluno'}</h3>
              <form
                onSubmit={(e) => salvarRegistro(
                  e, 'alunos', idEdicaoAluno, formAluno,
                  () => { setIdEdicaoAluno(null); setFormAluno({ nome: '', data_nascimento: '', responsavel: '', telefone: '', email: '' }); },
                  idEdicaoAluno ? 'Aluno atualizado com sucesso!' : 'Aluno cadastrado com sucesso!'
                )}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}
              >
                <div><label>Nome Completo:</label><input type="text" value={formAluno.nome} onChange={(e) => setFormAluno({ ...formAluno, nome: e.target.value })} required style={{ width: '100%', padding: '8px' }} /></div>
                <div><label>Data de Nascimento:</label><input type="date" value={formAluno.data_nascimento} onChange={(e) => setFormAluno({ ...formAluno, data_nascimento: e.target.value })} required style={{ width: '100%', padding: '8px' }} /></div>
                <div><label>Nome do Responsável:</label><input type="text" value={formAluno.responsavel} onChange={(e) => setFormAluno({ ...formAluno, responsavel: e.target.value })} required style={{ width: '100%', padding: '8px' }} /></div>
                <div><label>Telefone:</label><input type="text" value={formAluno.telefone} onChange={(e) => setFormAluno({ ...formAluno, telefone: e.target.value })} required style={{ width: '100%', padding: '8px' }} /></div>
                <div style={{ gridColumn: 'span 2' }}><label>E-mail (opcional):</label><input type="email" value={formAluno.email} onChange={(e) => setFormAluno({ ...formAluno, email: e.target.value })} style={{ width: '100%', padding: '8px' }} /></div>
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ padding: '10px 20px', background: idEdicaoAluno ? '#28a745' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{idEdicaoAluno ? 'Atualizar Aluno' : 'Salvar Aluno'}</button>
                  {idEdicaoAluno && <button type="button" onClick={() => { setIdEdicaoAluno(null); setFormAluno({ nome: '', data_nascimento: '', responsavel: '', telefone: '', email: '' }); }} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>}
                </div>
              </form>
            </section>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>📋 Lista de Alunos</h3>
            <input type="text" placeholder="🔍 Buscar aluno ou responsável..." value={buscaAluno} onChange={(e) => setBuscaAluno(e.target.value)} style={{ padding: '8px 12px', width: '280px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

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
              {alunos.map((a) => (
                <tr key={a.id}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{a.id}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{a.nome}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formatarDataBR(a.data_nascimento)}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{a.responsavel}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{a.telefone}</td>
                  {credenciais.perfil === 'professor' && (
                    <td style={{ padding: '8px', border: '1px solid #ddd', display: 'flex', gap: '5px' }}>
                      <button onClick={() => { setIdEdicaoAluno(a.id); setFormAluno({ nome: a.nome, data_nascimento: a.data_nascimento, responsavel: a.responsavel, telefone: a.telefone, email: a.email || '' }); }} style={{ padding: '4px 8px', background: '#ffc107', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Editar</button>
                      <button onClick={() => excluirRegistro('alunos', a.id, 'Excluir este aluno?', 'Aluno excluído com sucesso!')} style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Excluir</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ==================== 2. ABA TURMAS ==================== */}
      {abaAtiva === 'turmas' && (
        <>
          {credenciais.perfil === 'professor' && (
            <section style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
              <h3>{idEdicaoTurma ? '✏️ Editar Turma' : '➕ Cadastrar Nova Turma'}</h3>
              <form
                onSubmit={(e) => salvarRegistro(
                  e, 'turmas', idEdicaoTurma, { ...formTurma, capacidade: Number(formTurma.capacidade) },
                  () => { setIdEdicaoTurma(null); setFormTurma({ nome: '', turno: 'Matutino', faixa_etaria: '', professor: '', capacidade: '' }); },
                  idEdicaoTurma ? 'Turma atualizada com sucesso!' : 'Turma cadastrada com sucesso!'
                )}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}
              >
                <div><label>Nome da Turma:</label><input type="text" value={formTurma.nome} onChange={(e) => setFormTurma({ ...formTurma, nome: e.target.value })} required style={{ width: '100%', padding: '8px' }} /></div>
                <div>
                  <label>Turno:</label>
                  <select value={formTurma.turno} onChange={(e) => setFormTurma({ ...formTurma, turno: e.target.value })} style={{ width: '100%', padding: '8px' }}>
                    <option value="Matutino">Matutino</option>
                    <option value="Vespertino">Vespertino</option>
                    <option value="Integral">Integral</option>
                  </select>
                </div>
                <div><label>Faixa Etária:</label><input type="text" value={formTurma.faixa_etaria} onChange={(e) => setFormTurma({ ...formTurma, faixa_etaria: e.target.value })} required style={{ width: '100%', padding: '8px' }} /></div>
                <div><label>Professor Responsável:</label><input type="text" value={formTurma.professor} onChange={(e) => setFormTurma({ ...formTurma, professor: e.target.value })} required style={{ width: '100%', padding: '8px' }} /></div>
                <div style={{ gridColumn: 'span 2' }}><label>Capacidade:</label><input type="number" min="1" value={formTurma.capacidade} onChange={(e) => setFormTurma({ ...formTurma, capacidade: e.target.value })} required style={{ width: '100%', padding: '8px' }} /></div>
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ padding: '10px 20px', background: idEdicaoTurma ? '#28a745' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{idEdicaoTurma ? 'Atualizar Turma' : 'Salvar Turma'}</button>
                  {idEdicaoTurma && <button type="button" onClick={() => { setIdEdicaoTurma(null); setFormTurma({ nome: '', turno: 'Matutino', faixa_etaria: '', professor: '', capacidade: '' }); }} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>}
                </div>
              </form>
            </section>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>🏫 Turmas Cadastradas</h3>
            <input type="text" placeholder="🔍 Buscar turma ou professor..." value={buscaTurma} onChange={(e) => setBuscaTurma(e.target.value)} style={{ padding: '8px 12px', width: '280px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

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
              {turmas.map((t) => (
                <tr key={t.id}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{t.id}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{t.nome}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{t.turno}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{t.faixa_etaria}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{t.professor}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{t.capacidade}</td>
                  {credenciais.perfil === 'professor' && (
                    <td style={{ padding: '8px', border: '1px solid #ddd', display: 'flex', gap: '5px' }}>
                      <button onClick={() => { setIdEdicaoTurma(t.id); setFormTurma({ nome: t.nome, turno: t.turno, faixa_etaria: t.faixa_etaria, professor: t.professor, capacidade: t.capacidade }); }} style={{ padding: '4px 8px', background: '#ffc107', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Editar</button>
                      <button onClick={() => excluirRegistro('turmas', t.id, 'Excluir esta turma?', 'Turma excluída com sucesso!')} style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Excluir</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ==================== 3. ABA PROFESSORES ==================== */}
      {abaAtiva === 'professores' && (
        <>
          {credenciais.perfil === 'professor' && (
            <section style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
              <h3>{idEdicaoProfessor ? '✏️ Editar Professor' : '➕ Cadastrar Novo Professor'}</h3>
              <form
                onSubmit={(e) => salvarRegistro(
                  e, 'professores', idEdicaoProfessor, formProfessor,
                  () => { setIdEdicaoProfessor(null); setFormProfessor({ nome: '', formacao: '', turno: 'Matutino', telefone: '', email: '' }); },
                  idEdicaoProfessor ? 'Professor atualizado com sucesso!' : 'Professor cadastrado com sucesso!'
                )}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}
              >
                <div><label>Nome Completo:</label><input type="text" value={formProfessor.nome} onChange={(e) => setFormProfessor({ ...formProfessor, nome: e.target.value })} required style={{ width: '100%', padding: '8px' }} /></div>
                <div><label>Formação (ex: Pedagogia):</label><input type="text" value={formProfessor.formacao} onChange={(e) => setFormProfessor({ ...formProfessor, formacao: e.target.value })} required style={{ width: '100%', padding: '8px' }} /></div>
                <div>
                  <label>Turno:</label>
                  <select value={formProfessor.turno} onChange={(e) => setFormProfessor({ ...formProfessor, turno: e.target.value })} style={{ width: '100%', padding: '8px' }}>
                    <option value="Matutino">Matutino</option>
                    <option value="Vespertino">Vespertino</option>
                    <option value="Integral">Integral</option>
                  </select>
                </div>
                <div><label>Telefone:</label><input type="text" value={formProfessor.telefone} onChange={(e) => setFormProfessor({ ...formProfessor, telefone: e.target.value })} required style={{ width: '100%', padding: '8px' }} /></div>
                <div style={{ gridColumn: 'span 2' }}><label>E-mail (opcional):</label><input type="email" value={formProfessor.email} onChange={(e) => setFormProfessor({ ...formProfessor, email: e.target.value })} style={{ width: '100%', padding: '8px' }} /></div>
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ padding: '10px 20px', background: idEdicaoProfessor ? '#28a745' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{idEdicaoProfessor ? 'Atualizar Professor' : 'Salvar Professor'}</button>
                  {idEdicaoProfessor && <button type="button" onClick={() => { setIdEdicaoProfessor(null); setFormProfessor({ nome: '', formacao: '', turno: 'Matutino', telefone: '', email: '' }); }} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>}
                </div>
              </form>
            </section>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>👩‍🏫 Equipe Docente</h3>
            <input type="text" placeholder="🔍 Buscar professor ou formação..." value={buscaProfessor} onChange={(e) => setBuscaProfessor(e.target.value)} style={{ padding: '8px 12px', width: '280px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#eee' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>ID</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Nome</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Formação</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Turno</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Telefone</th>
                {credenciais.perfil === 'professor' && <th style={{ padding: '8px', border: '1px solid #ddd' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {professores.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.id}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.nome}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.formacao}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.turno}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{p.telefone}</td>
                  {credenciais.perfil === 'professor' && (
                    <td style={{ padding: '8px', border: '1px solid #ddd', display: 'flex', gap: '5px' }}>
                      <button onClick={() => { setIdEdicaoProfessor(p.id); setFormProfessor({ nome: p.nome, formacao: p.formacao, turno: p.turno, telefone: p.telefone, email: p.email || '' }); }} style={{ padding: '4px 8px', background: '#ffc107', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Editar</button>
                      <button onClick={() => excluirRegistro('professores', p.id, 'Excluir este professor?', 'Professor excluído com sucesso!')} style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Excluir</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ==================== 4. ABA FREQUÊNCIA ==================== */}
      {abaAtiva === 'frequencias' && (
        <>
          {credenciais.perfil === 'professor' && (
            <section style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
              <h3>{idEdicaoFrequencia ? '✏️ Editar Chamada' : '➕ Registrar Frequência / Chamada'}</h3>
              <form
                onSubmit={(e) => salvarRegistro(
                  e, 'frequencias', idEdicaoFrequencia, formFrequencia,
                  () => { setIdEdicaoFrequencia(null); setFormFrequencia({ aluno_nome: '', turma_nome: '', data: new Date().toISOString().slice(0, 10), status: 'Presente', observacao: '' }); },
                  idEdicaoFrequencia ? 'Frequência atualizada!' : 'Frequência registrada!'
                )}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}
              >
                <div><label>Nome do Aluno:</label><input type="text" value={formFrequencia.aluno_nome} onChange={(e) => setFormFrequencia({ ...formFrequencia, aluno_nome: e.target.value })} required style={{ width: '100%', padding: '8px' }} /></div>
                <div><label>Turma:</label><input type="text" value={formFrequencia.turma_nome} onChange={(e) => setFormFrequencia({ ...formFrequencia, turma_nome: e.target.value })} required style={{ width: '100%', padding: '8px' }} /></div>
                <div><label>Data:</label><input type="date" value={formFrequencia.data} onChange={(e) => setFormFrequencia({ ...formFrequencia, data: e.target.value })} required style={{ width: '100%', padding: '8px' }} /></div>
                <div>
                  <label>Status:</label>
                  <select value={formFrequencia.status} onChange={(e) => setFormFrequencia({ ...formFrequencia, status: e.target.value })} style={{ width: '100%', padding: '8px' }}>
                    <option value="Presente">Presente</option>
                    <option value="Falta">Falta</option>
                    <option value="Falta Justificada">Falta Justificada</option>
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}><label>Observação (opcional):</label><input type="text" value={formFrequencia.observacao} onChange={(e) => setFormFrequencia({ ...formFrequencia, observacao: e.target.value })} style={{ width: '100%', padding: '8px' }} /></div>
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ padding: '10px 20px', background: idEdicaoFrequencia ? '#28a745' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{idEdicaoFrequencia ? 'Atualizar Registro' : 'Salvar Chamada'}</button>
                  {idEdicaoFrequencia && <button type="button" onClick={() => { setIdEdicaoFrequencia(null); setFormFrequencia({ aluno_nome: '', turma_nome: '', data: new Date().toISOString().slice(0, 10), status: 'Presente', observacao: '' }); }} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>}
                </div>
              </form>
            </section>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>✅ Histórico de Frequência</h3>
            <input type="text" placeholder="🔍 Buscar por aluno, turma ou status..." value={buscaFrequencia} onChange={(e) => setBuscaFrequencia(e.target.value)} style={{ padding: '8px 12px', width: '280px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#eee' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Data</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Aluno</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Turma</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Observação</th>
                {credenciais.perfil === 'professor' && <th style={{ padding: '8px', border: '1px solid #ddd' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {frequencias.map((f) => (
                <tr key={f.id}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formatarDataBR(f.data)}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{f.aluno_nome}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{f.turma_nome}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', color: f.status === 'Presente' ? '#1e7e34' : '#dc3545' }}>{f.status}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{f.observacao || '-'}</td>
                  {credenciais.perfil === 'professor' && (
                    <td style={{ padding: '8px', border: '1px solid #ddd', display: 'flex', gap: '5px' }}>
                      <button onClick={() => { setIdEdicaoFrequencia(f.id); setFormFrequencia({ aluno_nome: f.aluno_nome, turma_nome: f.turma_nome, data: f.data, status: f.status, observacao: f.observacao || '' }); }} style={{ padding: '4px 8px', background: '#ffc107', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Editar</button>
                      <button onClick={() => excluirRegistro('frequencias', f.id, 'Excluir este registro?', 'Registro excluído com sucesso!')} style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Excluir</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ==================== 5. ABA COMUNICADOS ==================== */}
      {abaAtiva === 'comunicados' && (
        <>
          {credenciais.perfil === 'professor' && (
            <section style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
              <h3>{idEdicaoComunicado ? '✏️ Editar Comunicado' : '➕ Publicar Novo Comunicado'}</h3>
              <form
                onSubmit={(e) => salvarRegistro(
                  e, 'comunicados', idEdicaoComunicado, formComunicado,
                  () => { setIdEdicaoComunicado(null); setFormComunicado({ titulo: '', categoria: 'Aviso Geral', mensagem: '', data_publicacao: new Date().toISOString().slice(0, 10) }); },
                  idEdicaoComunicado ? 'Comunicado atualizado!' : 'Comunicado publicado com sucesso!'
                )}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}
              >
                <div><label>Título do Aviso:</label><input type="text" value={formComunicado.titulo} onChange={(e) => setFormComunicado({ ...formComunicado, titulo: e.target.value })} required style={{ width: '100%', padding: '8px' }} /></div>
                <div>
                  <label>Categoria:</label>
                  <select value={formComunicado.categoria} onChange={(e) => setFormComunicado({ ...formComunicado, categoria: e.target.value })} style={{ width: '100%', padding: '8px' }}>
                    <option value="Aviso Geral">Aviso Geral</option>
                    <option value="Evento Escolar">Evento Escolar</option>
                    <option value="Reunião de Pais">Reunião de Pais</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label>Mensagem:</label>
                  <textarea rows="3" value={formComunicado.mensagem} onChange={(e) => setFormComunicado({ ...formComunicado, mensagem: e.target.value })} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ padding: '10px 20px', background: idEdicaoComunicado ? '#28a745' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{idEdicaoComunicado ? 'Atualizar Comunicado' : 'Publicar Comunicado'}</button>
                  {idEdicaoComunicado && <button type="button" onClick={() => { setIdEdicaoComunicado(null); setFormComunicado({ titulo: '', categoria: 'Aviso Geral', mensagem: '', data_publicacao: new Date().toISOString().slice(0, 10) }); }} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>}
                </div>
              </form>
            </section>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>📢 Mural de Comunicados para Pais e Professores</h3>
            <input type="text" placeholder="🔍 Buscar comunicado..." value={buscaComunicado} onChange={(e) => setBuscaComunicado(e.target.value)} style={{ padding: '8px 12px', width: '280px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {comunicados.map((c) => (
              <div key={c.id} style={{ border: '1px solid #ddd', borderLeft: c.categoria === 'Urgente' ? '5px solid #dc3545' : '5px solid #007bff', padding: '15px', borderRadius: '6px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '12px', background: '#eee', padding: '3px 8px', borderRadius: '4px', marginRight: '8px' }}>{c.categoria}</span>
                    <strong>{c.titulo}</strong>
                  </div>
                  <span style={{ fontSize: '12px', color: '#666' }}>{formatarDataBR(c.data_publicacao)}</span>
                </div>
                <p style={{ margin: '10px 0', color: '#333' }}>{c.mensagem}</p>
                {credenciais.perfil === 'professor' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setIdEdicaoComunicado(c.id); setFormComunicado({ titulo: c.titulo, categoria: c.categoria, mensagem: c.mensagem, data_publicacao: c.data_publicacao }); }} style={{ padding: '4px 10px', background: '#ffc107', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Editar</button>
                    <button onClick={() => excluirRegistro('comunicados', c.id, 'Excluir este comunicado?', 'Comunicado excluído com sucesso!')} style={{ padding: '4px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Excluir</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ==================== 6. ABA AGENDA DIÁRIA ==================== */}
      {abaAtiva === 'agenda' && (
        <>
          {credenciais.perfil === 'professor' && (
            <section style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
              <h3>{idEdicaoAgenda ? '✏️ Editar Diário do Aluno' : '➕ Registrar Agenda Diária'}</h3>
              <form
                onSubmit={(e) => salvarRegistro(
                  e, 'agenda', idEdicaoAgenda, formAgenda,
                  () => { setIdEdicaoAgenda(null); setFormAgenda({ aluno_nome: '', data: new Date().toISOString().slice(0, 10), alimentacao: 'Comeu tudo', sono: 'Dormiu bem (1h30)', humor: 'Alegre / Participativo', observacao: '' }); },
                  idEdicaoAgenda ? 'Agenda atualizada com sucesso!' : 'Registro adicionado na agenda diária!'
                )}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}
              >
                <div><label>Nome do Aluno:</label><input type="text" value={formAgenda.aluno_nome} onChange={(e) => setFormAgenda({ ...formAgenda, aluno_nome: e.target.value })} required style={{ width: '100%', padding: '8px' }} /></div>
                <div><label>Data:</label><input type="date" value={formAgenda.data} onChange={(e) => setFormAgenda({ ...formAgenda, data: e.target.value })} required style={{ width: '100%', padding: '8px' }} /></div>
                <div>
                  <label>Alimentação:</label>
                  <select value={formAgenda.alimentacao} onChange={(e) => setFormAgenda({ ...formAgenda, alimentacao: e.target.value })} style={{ width: '100%', padding: '8px' }}>
                    <option value="Comeu tudo">Comeu tudo</option>
                    <option value="Comeu parcialmente">Comeu parcialmente</option>
                    <option value="Recusou a refeição">Recusou a refeição</option>
                  </select>
                </div>
                <div>
                  <label>Sono / Descanso:</label>
                  <select value={formAgenda.sono} onChange={(e) => setFormAgenda({ ...formAgenda, sono: e.target.value })} style={{ width: '100%', padding: '8px' }}>
                    <option value="Dormiu bem (1h30)">Dormiu bem (1h30)</option>
                    <option value="Soneca rápida (30min)">Soneca rápida (30min)</option>
                    <option value="Não dormiu">Não dormiu</option>
                  </select>
                </div>
                <div>
                  <label>Humor / Comportamento:</label>
                  <select value={formAgenda.humor} onChange={(e) => setFormAgenda({ ...formAgenda, humor: e.target.value })} style={{ width: '100%', padding: '8px' }}>
                    <option value="Alegre / Participativo">Alegre / Participativo</option>
                    <option value="Calmo / Tranquilo">Calmo / Tranquilo</option>
                    <option value="Agitado / Choroso">Agitado / Choroso</option>
                  </select>
                </div>
                <div><label>Atividades / Observações:</label><input type="text" placeholder="Ex: Pintura com guache, brincou no parque..." value={formAgenda.observacao} onChange={(e) => setFormAgenda({ ...formAgenda, observacao: e.target.value })} style={{ width: '100%', padding: '8px' }} /></div>
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ padding: '10px 20px', background: idEdicaoAgenda ? '#28a745' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{idEdicaoAgenda ? 'Atualizar Agenda' : 'Salvar na Agenda'}</button>
                  {idEdicaoAgenda && <button type="button" onClick={() => { setIdEdicaoAgenda(null); setFormAgenda({ aluno_nome: '', data: new Date().toISOString().slice(0, 10), alimentacao: 'Comeu tudo', sono: 'Dormiu bem (1h30)', humor: 'Alegre / Participativo', observacao: '' }); }} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>}
                </div>
              </form>
            </section>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>📔 Rotina Diária dos Alunos</h3>
            <input type="text" placeholder="🔍 Buscar por aluno ou humor..." value={buscaAgenda} onChange={(e) => setBuscaAgenda(e.target.value)} style={{ padding: '8px 12px', width: '280px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#eee' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Data</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Aluno</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Alimentação</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Sono</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Humor</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Observações</th>
                {credenciais.perfil === 'professor' && <th style={{ padding: '8px', border: '1px solid #ddd' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {agenda.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formatarDataBR(item.data)}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}><strong>{item.aluno_nome}</strong></td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.alimentacao}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.sono}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.humor}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.observacao || '-'}</td>
                  {credenciais.perfil === 'professor' && (
                    <td style={{ padding: '8px', border: '1px solid #ddd', display: 'flex', gap: '5px' }}>
                      <button onClick={() => { setIdEdicaoAgenda(item.id); setFormAgenda({ aluno_nome: item.aluno_nome, data: item.data, alimentacao: item.alimentacao, sono: item.sono, humor: item.humor, observacao: item.observacao || '' }); }} style={{ padding: '4px 8px', background: '#ffc107', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Editar</button>
                      <button onClick={() => excluirRegistro('agenda', item.id, 'Remover este registro da agenda?', 'Registro removido!')} style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Excluir</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}