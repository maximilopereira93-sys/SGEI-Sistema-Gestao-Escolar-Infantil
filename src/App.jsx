import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3000';

export default function App() {
  const [logado, setLogado] = useState(false);
  const [credenciais, setCredenciais] = useState({ usuario: '', senha: '', perfil: 'professor' });
  const [abaAtiva, setAbaAtiva] = useState('frequencias'); // 'dashboard' | 'aulas' | 'frequencias' | 'alunos' | 'turmas' | 'professores' | 'agenda' | 'relatorios' | 'comunicados'

  // Resumo / Estatísticas Gerais
  const [stats, setStats] = useState({
    alunos: 0,
    turmas: 0,
    professores: 0,
    presenca: 100,
    comunicados: 0,
    agenda: 0,
    aulas: 0
  });

  // Estados Chamada em Lote (Exclusivo Professor - igual à imagem)
  const [dataChamada, setDataChamada] = useState(new Date().toISOString().slice(0, 10));
  const [turmaChamada, setTurmaChamada] = useState('Turma Geral');
  const [presencasMarcadas, setPresencasMarcadas] = useState({});

  // Estados Próximas Aulas (Horários)
  const [aulas, setAulas] = useState([]);
  const [buscaAula, setBuscaAula] = useState('');
  const [idEdicaoAula, setIdEdicaoAula] = useState(null);
  const [formAula, setFormAula] = useState({
    hora_inicio: '08:00',
    hora_fim: '09:30',
    turma: '',
    atividade: '',
    sala: '',
    status: 'Em breve'
  });

  // Estados Relatórios
  const [relatorio, setRelatorio] = useState({
    resumo: { total: 0, presentes: 0, ausentes: 0, justificados: 0, taxa_presenca: '0.0' },
    registros: []
  });
  const [filtrosRelatorio, setFiltrosRelatorio] = useState({
    aluno: '',
    status: 'Todos',
    turma: 'Todas',
    data: ''
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

  // Estados Frequências (Histórico)
  const [frequencias, setFrequencias] = useState([]);
  const [buscaFrequencia, setBuscaFrequencia] = useState('');

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

  const carregarRelatorio = async () => {
    try {
      const params = new URLSearchParams();
      if (filtrosRelatorio.aluno.trim()) params.append('aluno', filtrosRelatorio.aluno.trim());
      if (filtrosRelatorio.status !== 'Todos') params.append('status', filtrosRelatorio.status);
      if (filtrosRelatorio.turma !== 'Todas') params.append('turma', filtrosRelatorio.turma);
      if (filtrosRelatorio.data) params.append('data', filtrosRelatorio.data);

      const res = await fetch(`${API_BASE}/frequencias/relatorio?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRelatorio(data);
      }
    } catch (err) {
      console.error('Erro ao carregar relatório:', err);
    }
  };

  const carregarTudo = async () => {
    try {
      const [
        resAlunos, statAlunos,
        resTurmas, statTurmas,
        resProfs, statProfs,
        resFreqs, statFreqs,
        resComs, statComs,
        resAgenda, statAgenda,
        resAulas, statAulas
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
        fetch(`${API_BASE}/agenda/estatisticas`),
        fetch(buscaAula.trim() ? `${API_BASE}/aulas?busca=${encodeURIComponent(buscaAula)}` : `${API_BASE}/aulas`),
        fetch(`${API_BASE}/aulas/estatisticas`)
      ]);

      const [
        dAlunos, sAlunos,
        dTurmas, sTurmas,
        dProfs, sProfs,
        dFreqs, sFreqs,
        dComs, sComs,
        dAgenda, sAgenda,
        dAulas, sAulas
      ] = await Promise.all([
        resAlunos.json(), statAlunos.json(),
        resTurmas.json(), statTurmas.json(),
        resProfs.json(), statProfs.json(),
        resFreqs.json(), statFreqs.json(),
        resComs.json(), statComs.json(),
        resAgenda.json(), statAgenda.json(),
        resAulas.json(), statAulas.json()
      ]);

      if (Array.isArray(dAlunos)) setAlunos(dAlunos);
      if (Array.isArray(dTurmas)) {
        setTurmas(dTurmas);
        if (dTurmas.length > 0 && turmaChamada === 'Turma Geral') {
          setTurmaChamada(dTurmas[0].nome);
        }
      }
      if (Array.isArray(dProfs)) setProfessores(dProfs);
      if (Array.isArray(dFreqs)) setFrequencias(dFreqs);
      if (Array.isArray(dComs)) setComunicados(dComs);
      if (Array.isArray(dAgenda)) setAgenda(dAgenda);
      if (Array.isArray(dAulas)) setAulas(dAulas);

      setStats({
        alunos: sAlunos.total_alunos || 0,
        turmas: sTurmas.total_turmas || 0,
        professores: sProfs.total_professores || 0,
        presenca: sFreqs.percentual_presenca ?? 100,
        comunicados: sComs.total_comunicados || 0,
        agenda: sAgenda.total_agenda || 0,
        aulas: sAulas.total_aulas || 0
      });
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  useEffect(() => {
    if (logado) {
      carregarTudo();
    }
  }, [logado, buscaAluno, buscaTurma, buscaProfessor, buscaFrequencia, buscaComunicado, buscaAgenda, buscaAula]);

  useEffect(() => {
    if (logado) {
      carregarRelatorio();
    }
  }, [logado, filtrosRelatorio, frequencias]);

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

  // Handlers da Chamada em Lote (Exclusivo Professor)
  const togglePresencaAluno = (id) => {
    setPresencasMarcadas((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const totalPresentesMarcados = alunos.filter((a) => presencasMarcadas[a.id]).length;
  const todosMarcados = alunos.length > 0 && totalPresentesMarcados === alunos.length;

  const handleMarcarTodos = () => {
    if (todosMarcados) {
      setPresencasMarcadas({});
    } else {
      const novoMapa = {};
      alunos.forEach((a) => { novoMapa[a.id] = true; });
      setPresencasMarcadas(novoMapa);
    }
  };

  const handleSalvarChamadaEmLote = async () => {
    if (alunos.length === 0) {
      setMensagem({ texto: 'Cadastre alunos antes de realizar a chamada.', tipo: 'erro' });
      return;
    }

    const registros = alunos.map((a) => ({
      aluno_nome: a.nome,
      presente: Boolean(presencasMarcadas[a.id])
    }));

    try {
      const res = await fetch(`${API_BASE}/frequencias/lote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: dataChamada,
          turma_nome: turmaChamada || 'Turma Geral',
          registros
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMensagem({ texto: data.mensagem, tipo: 'sucesso' });
        setPresencasMarcadas({});
        carregarTudo();
      } else {
        setMensagem({ texto: data.erro || 'Erro ao salvar frequência.', tipo: 'erro' });
      }
    } catch (err) {
      setMensagem({ texto: 'Erro de conexão com o servidor.', tipo: 'erro' });
    }
  };

  const exportarCSV = () => {
    const cabecalho = ['Aluno', 'Data', 'Turma', 'Status', 'Observacao'];
    const linhas = relatorio.registros.map((r) => [
      `"${r.aluno_nome}"`,
      `"${formatarDataBR(r.data)}"`,
      `"${r.turma_nome}"`,
      `"${r.status}"`,
      `"${r.observacao || ''}"`
    ]);

    const conteudoCSV = [cabecalho.join(';'), ...linhas.map((l) => l.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_frequencia_sgei_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const renderBadgeStatus = (status) => {
    let bg = '#16a34a';
    let label = status;

    if (status === 'Falta' || status === 'Ausente') {
      bg = '#ef4444';
      label = 'Ausente';
    } else if (status === 'Falta Justificada' || status === 'Justificado') {
      bg = '#eab308';
      label = 'Justificado';
    }

    return (
      <span style={{
        backgroundColor: bg,
        color: '#fff',
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block'
      }}>
        {label}
      </span>
    );
  };

  // Seção Minhas Turmas (Exclusivo Professor)
  const renderSecaoMinhasTurmas = () => {
    if (credenciais.perfil !== 'professor') return null;

    return (
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#090d16' }}>Minhas Turmas</h2>
          <button
            onClick={() => setAbaAtiva('turmas')}
            style={{ background: '#090d16', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            + Nova Turma
          </button>
        </div>

        {turmas.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '14px' }}>
            Nenhuma turma cadastrada ainda. Clique em <strong>+ Nova Turma</strong> para adicionar.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '18px' }}>
            {turmas.map((t) => (
              <div
                key={t.id}
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '22px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '18px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#090d16', lineHeight: '1.25' }}>
                      {t.nome}
                    </h3>
                    <span style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '999px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#0f172a',
                      whiteSpace: 'nowrap'
                    }}>
                      {t.turno}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                    {t.faixa_etaria}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>👥</span>
                    <span>{t.capacidade} alunos</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📅</span>
                    <span>Prof. {t.professor}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                  <button
                    onClick={() => {
                      setTurmaChamada(t.nome);
                      setAbaAtiva('frequencias');
                    }}
                    style={{
                      background: '#090d16',
                      color: '#fff',
                      border: '1px solid #090d16',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Frequência
                  </button>
                  <button
                    onClick={() => {
                      setFormAula({ ...formAula, turma: t.nome });
                      setAbaAtiva('aulas');
                    }}
                    style={{
                      background: '#fff',
                      color: '#090d16',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Atividades
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  // Componente visual "Próximas Aulas / Agenda de hoje"
  const renderCardProximasAulas = (exibirAcoes = false) => (
    <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Próximas Aulas</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '15px', color: '#64748b' }}>Agenda de hoje</p>
        </div>
        {!exibirAcoes && credenciais.perfil === 'professor' && (
          <button
            onClick={() => setAbaAtiva('aulas')}
            style={{ background: '#090d16', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            + Gerenciar Horários
          </button>
        )}
      </div>

      {aulas.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
          Nenhuma aula agendada para hoje.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {aulas.map((aula) => {
            const emBreve = aula.status === 'Em breve';
            return (
              <div
                key={aula.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#fff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                  <div style={{ textAlign: 'center', minWidth: '52px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{aula.hora_inicio}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{aula.hora_fim}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{aula.turma}</div>
                    <div style={{ fontSize: '14px', color: '#64748b', marginTop: '3px' }}>
                      {aula.atividade} - {aula.sala}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: '600',
                    background: emBreve ? '#090d16' : '#fff',
                    color: emBreve ? '#fff' : '#0f172a',
                    border: emBreve ? '1px solid #090d16' : '1px solid #e2e8f0'
                  }}>
                    {aula.status}
                  </span>

                  {exibirAcoes && credenciais.perfil === 'professor' && (
                    <>
                      <button
                        onClick={() => {
                          setIdEdicaoAula(aula.id);
                          setFormAula({
                            hora_inicio: aula.hora_inicio,
                            hora_fim: aula.hora_fim,
                            turma: aula.turma,
                            atividade: aula.atividade,
                            sala: aula.sala,
                            status: aula.status
                          });
                        }}
                        style={{ padding: '6px 10px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => excluirRegistro('aulas', aula.id, 'Remover esta aula da agenda?', 'Aula removida!')}
                        style={{ padding: '6px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (!logado) {
    return (
      <div style={{ minHeight: '100vh', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h2 style={{ marginTop: 0, color: '#0f172a' }}>Sistema Escolar (SGEI)</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Gestão Escolar Infantil</p>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Perfil de Acesso</label>
              <select
                value={credenciais.perfil}
                onChange={(e) => setCredenciais({ ...credenciais, perfil: e.target.value })}
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="professor">Professor(a) / Gestão</option>
                <option value="responsavel">Responsável / Pais</option>
              </select>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Nome / Usuário</label>
              <input
                type="text"
                placeholder="Ex: Maria Silva"
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                value={credenciais.usuario}
                onChange={(e) => setCredenciais({ ...credenciais, usuario: e.target.value })}
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                value={credenciais.senha}
                onChange={(e) => setCredenciais({ ...credenciais, senha: e.target.value })}
                required
              />
            </div>
            <button type="submit" style={{ width: '100%', padding: '11px', background: '#090d16', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              Entrar no Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  const menuLateral = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'aulas', label: 'Horários / Aulas', icon: '🕒' },
    { id: 'frequencias', label: 'Frequência', icon: '📋' },
    { id: 'alunos', label: 'Alunos', icon: '👤+' },
    { id: 'turmas', label: 'Turmas', icon: '🏫' },
    { id: 'professores', label: 'Professores', icon: '👩‍🏫' },
    { id: 'agenda', label: 'Agenda Diária', icon: '📔' },
    { id: 'relatorios', label: 'Relatórios', icon: '📄' },
    { id: 'comunicados', label: 'Comunicados', icon: '🔔' }
  ];

  const turmasUnicas = Array.from(new Set([
    ...turmas.map((t) => t.nome),
    ...frequencias.map((f) => f.turma_nome)
  ])).filter(Boolean);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#0f172a', background: '#eef2ff' }}>
      {/* BARRA SUPERIOR */}
      <header style={{ height: '64px', background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#090d16' }}>Sistema Escolar</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px' }}>
          <span style={{ color: '#64748b' }}>
            {credenciais.perfil === 'professor' ? 'Professor(a): ' : 'Responsável: '}
            <strong style={{ color: '#0f172a' }}>{credenciais.usuario}</strong>
          </span>
          <button
            onClick={() => setLogado(false)}
            style={{ background: 'transparent', border: 'none', color: '#0f172a', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ↪ Sair
          </button>
        </div>
      </header>

      {/* CORPO: SIDEBAR + ÁREA PRINCIPAL */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* MENU LATERAL ESQUERDO */}
        <aside style={{ width: '240px', background: '#fff', borderRight: '1px solid #e2e8f0', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuLateral.map((item) => {
            const ativo = abaAtiva === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setAbaAtiva(item.id); setMensagem({ texto: '', tipo: '' }); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: ativo ? '#090d16' : 'transparent',
                  color: ativo ? '#fff' : '#1e293b',
                  fontWeight: ativo ? '600' : '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <span style={{ width: '20px', textAlign: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <main style={{ flex: 1, padding: '28px' }}>
          {mensagem.texto && (
            <div style={{
              padding: '12px 16px',
              background: mensagem.tipo === 'erro' ? '#fee2e2' : '#dcfce7',
              color: mensagem.tipo === 'erro' ? '#991b1b' : '#166534',
              marginBottom: '18px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {mensagem.texto}
            </div>
          )}

          {/* ==================== TELA: DASHBOARD ==================== */}
          {abaAtiva === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0' }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Resumo Geral</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                    <div style={{ fontSize: '26px', fontWeight: '700', color: '#2563eb' }}>{stats.alunos}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Alunos Matriculados</div>
                  </div>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                    <div style={{ fontSize: '26px', fontWeight: '700', color: '#d97706' }}>{stats.turmas}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Turmas Ativas</div>
                  </div>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                    <div style={{ fontSize: '26px', fontWeight: '700', color: '#16a34a' }}>{stats.presenca}%</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Frequência Média</div>
                  </div>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                    <div style={{ fontSize: '26px', fontWeight: '700', color: '#090d16' }}>{stats.aulas}</div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Aulas Hoje</div>
                  </div>
                </div>
              </div>

              {renderSecaoMinhasTurmas()}
              {renderCardProximasAulas(false)}
            </div>
          )}

          {/* ==================== TELA: FREQUÊNCIA (CHAMADA EM LOTE EXCLUSIVA DO PROFESSOR) ==================== */}
          {abaAtiva === 'frequencias' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {credenciais.perfil === 'professor' && (
                <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                  {/* Cabeçalho igual à imagem */}
                  <div style={{ marginBottom: '22px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#090d16' }}>Registro de Frequência</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '15px', color: '#64748b' }}>
                      Marque a presença dos alunos para a data selecionada
                    </p>
                  </div>

                  {/* Data da Aula + Turma */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
                        Data da Aula
                      </label>
                      <input
                        type="date"
                        value={dataChamada}
                        onChange={(e) => setDataChamada(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          fontSize: '14px',
                          color: '#0f172a',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
                        Turma
                      </label>
                      <select
                        value={turmaChamada}
                        onChange={(e) => setTurmaChamada(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          fontSize: '14px',
                          color: '#0f172a',
                          background: '#fff'
                        }}
                      >
                        {turmasUnicas.length === 0 ? (
                          <option value="Turma Geral">Turma Geral</option>
                        ) : (
                          turmasUnicas.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Barra Cinza: Presentes X / Y + Botão Marcar Todos */}
                  <div style={{
                    background: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '14px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>
                      Presentes: {totalPresentesMarcados} / {alunos.length}
                    </span>
                    <button
                      type="button"
                      onClick={handleMarcarTodos}
                      style={{
                        background: '#fff',
                        color: '#090d16',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {todosMarcados ? 'Desmarcar Todos' : 'Marcar Todos'}
                    </button>
                  </div>

                  {/* Lista de Alunos com Checkboxes e Scroll */}
                  <div style={{ marginBottom: '22px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '10px' }}>
                      Lista de Alunos
                    </div>

                    {alunos.length === 0 ? (
                      <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#64748b', fontSize: '14px' }}>
                        Nenhum aluno cadastrado. Cadastre os alunos na aba <strong>Alunos</strong> para realizar a chamada.
                      </div>
                    ) : (
                      <div style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        maxHeight: '320px',
                        overflowY: 'auto'
                      }}>
                        {alunos.map((aluno, index) => {
                          const marcado = Boolean(presencasMarcadas[aluno.id]);
                          return (
                            <label
                              key={aluno.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                padding: '14px 18px',
                                borderBottom: index < alunos.length - 1 ? '1px solid #f1f5f9' : 'none',
                                cursor: 'pointer',
                                background: marcado ? '#f8fafc' : '#fff',
                                userSelect: 'none'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={marcado}
                                onChange={() => togglePresencaAluno(aluno.id)}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  accentColor: '#090d16',
                                  cursor: 'pointer'
                                }}
                              />
                              <span style={{ fontSize: '15px', fontWeight: '500', color: '#0f172a' }}>
                                {aluno.nome}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Botão Largo Preto: Salvar Frequência */}
                  <button
                    type="button"
                    onClick={handleSalvarChamadaEmLote}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#090d16',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Salvar Frequência
                  </button>
                </div>
              )}

              {/* Histórico de Chamadas Salvas (Visível para Professor e Responsáveis) */}
              <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Histórico de Chamadas Registradas</h3>
                  <input
                    type="text"
                    placeholder="🔍 Buscar aluno ou turma..."
                    value={buscaFrequencia}
                    onChange={(e) => setBuscaFrequencia(e.target.value)}
                    style={{ padding: '8px 12px', width: '260px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '12px' }}>Aluno</th>
                      <th style={{ padding: '12px' }}>Data</th>
                      <th style={{ padding: '12px' }}>Turma</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      {credenciais.perfil === 'professor' && <th style={{ padding: '12px' }}>Ações</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {frequencias.map((f) => (
                      <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{f.aluno_nome}</td>
                        <td style={{ padding: '12px' }}>{formatarDataBR(f.data)}</td>
                        <td style={{ padding: '12px' }}>{f.turma_nome}</td>
                        <td style={{ padding: '12px' }}>{renderBadgeStatus(f.status)}</td>
                        {credenciais.perfil === 'professor' && (
                          <td style={{ padding: '12px' }}>
                            <button
                              onClick={() => excluirRegistro('frequencias', f.id, 'Excluir registro?', 'Excluído!')}
                              style={{ padding: '5px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              Excluir
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TELA: HORÁRIOS / AULAS ==================== */}
          {abaAtiva === 'aulas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {credenciais.perfil === 'professor' && (
                <section style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ marginTop: 0 }}>{idEdicaoAula ? 'Editar Horário de Aula' : 'Agendar Nova Aula / Atividade'}</h3>
                  <form
                    onSubmit={(e) => salvarRegistro(
                      e, 'aulas', idEdicaoAula, formAula,
                      () => { setIdEdicaoAula(null); setFormAula({ hora_inicio: '08:00', hora_fim: '09:30', turma: '', atividade: '', sala: '', status: 'Em breve' }); },
                      idEdicaoAula ? 'Aula atualizada com sucesso!' : 'Aula agendada com sucesso!'
                    )}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}
                  >
                    <div><label>Hora Início:</label><input type="time" value={formAula.hora_inicio} onChange={(e) => setFormAula({ ...formAula, hora_inicio: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    <div><label>Hora Término:</label><input type="time" value={formAula.hora_fim} onChange={(e) => setFormAula({ ...formAula, hora_fim: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    <div>
                      <label>Status:</label>
                      <select value={formAula.status} onChange={(e) => setFormAula({ ...formAula, status: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <option value="Em breve">Em breve</option>
                        <option value="Agendada">Agendada</option>
                      </select>
                    </div>
                    <div><label>Turma:</label><input type="text" value={formAula.turma} onChange={(e) => setFormAula({ ...formAula, turma: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    <div><label>Atividade / Disciplina:</label><input type="text" value={formAula.atividade} onChange={(e) => setFormAula({ ...formAula, atividade: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    <div><label>Sala:</label><input type="text" value={formAula.sala} onChange={(e) => setFormAula({ ...formAula, sala: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    <div style={{ gridColumn: 'span 3', display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <button type="submit" style={{ padding: '10px 18px', background: '#090d16', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                        {idEdicaoAula ? 'Atualizar Aula' : 'Salvar na Agenda de Hoje'}
                      </button>
                      {idEdicaoAula && (
                        <button type="button" onClick={() => { setIdEdicaoAula(null); setFormAula({ hora_inicio: '08:00', hora_fim: '09:30', turma: '', atividade: '', sala: '', status: 'Em breve' }); }} style={{ padding: '10px 18px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </section>
              )}
              {renderCardProximasAulas(true)}
            </div>
          )}

          {/* ==================== TELA: RELATÓRIOS ==================== */}
          {abaAtiva === 'relatorios' && (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Tabela de Frequência</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                    Visualize e gerencie o registro de frequência dos alunos
                  </p>
                </div>
                <button
                  onClick={exportarCSV}
                  style={{
                    background: '#090d16',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  ⬇ Exportar CSV
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '28px' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ fontSize: '26px', fontWeight: '700', color: '#0f172a' }}>{relatorio.resumo.total}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Total de Registros</div>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ fontSize: '26px', fontWeight: '700', color: '#16a34a' }}>{relatorio.resumo.presentes}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Presentes</div>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ fontSize: '26px', fontWeight: '700', color: '#ef4444' }}>{relatorio.resumo.ausentes}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Ausentes</div>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ fontSize: '26px', fontWeight: '700', color: '#d97706' }}>{relatorio.resumo.justificados}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Justificados</div>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ fontSize: '26px', fontWeight: '700', color: '#2563eb' }}>{relatorio.resumo.taxa_presenca}%</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Taxa de Presença</div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>⧩ Filtros</span>
                  <button
                    onClick={() => setFiltrosRelatorio({ aluno: '', status: 'Todos', turma: 'Todas', data: '' })}
                    style={{ background: 'transparent', border: 'none', color: '#0f172a', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Limpar Filtros
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Buscar Aluno</label>
                    <input
                      type="text"
                      placeholder="🔍 Digite o nome..."
                      value={filtrosRelatorio.aluno}
                      onChange={(e) => setFiltrosRelatorio({ ...filtrosRelatorio, aluno: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Status</label>
                    <select
                      value={filtrosRelatorio.status}
                      onChange={(e) => setFiltrosRelatorio({ ...filtrosRelatorio, status: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                    >
                      <option value="Todos">Todos</option>
                      <option value="Presente">Presente</option>
                      <option value="Falta">Ausente (Falta)</option>
                      <option value="Falta Justificada">Justificado</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Turma / Série</label>
                    <select
                      value={filtrosRelatorio.turma}
                      onChange={(e) => setFiltrosRelatorio({ ...filtrosRelatorio, turma: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                    >
                      <option value="Todas">Todas</option>
                      {turmasUnicas.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Data</label>
                    <input
                      type="date"
                      value={filtrosRelatorio.data}
                      onChange={(e) => setFiltrosRelatorio({ ...filtrosRelatorio, data: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
                      <th style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>Aluno</th>
                      <th style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>Data</th>
                      <th style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>Turma</th>
                      <th style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>Observação</th>
                      <th style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.registros.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                          Nenhum registro de frequência encontrado para os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      relatorio.registros.map((r) => (
                        <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>{r.aluno_nome}</td>
                          <td style={{ padding: '14px 16px', color: '#334155' }}>{formatarDataBR(r.data)}</td>
                          <td style={{ padding: '14px 16px', color: '#334155' }}>{r.turma_nome}</td>
                          <td style={{ padding: '14px 16px', color: '#64748b' }}>{r.observacao || 'Rotina Regular'}</td>
                          <td style={{ padding: '14px 16px' }}>{renderBadgeStatus(r.status)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TELA: ALUNOS ==================== */}
          {abaAtiva === 'alunos' && (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', border: '1px solid #e2e8f0' }}>
              {credenciais.perfil === 'professor' && (
                <section style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ marginTop: 0 }}>{idEdicaoAluno ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}</h3>
                  <form
                    onSubmit={(e) => salvarRegistro(
                      e, 'alunos', idEdicaoAluno, formAluno,
                      () => { setIdEdicaoAluno(null); setFormAluno({ nome: '', data_nascimento: '', responsavel: '', telefone: '', email: '' }); },
                      idEdicaoAluno ? 'Aluno atualizado com sucesso!' : 'Aluno cadastrado com sucesso!'
                    )}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
                  >
                    <div><label>Nome Completo:</label><input type="text" value={formAluno.nome} onChange={(e) => setFormAluno({ ...formAluno, nome: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    <div><label>Data de Nascimento:</label><input type="date" value={formAluno.data_nascimento} onChange={(e) => setFormAluno({ ...formAluno, data_nascimento: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    <div><label>Nome do Responsável:</label><input type="text" value={formAluno.responsavel} onChange={(e) => setFormAluno({ ...formAluno, responsavel: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    <div><label>Telefone:</label><input type="text" value={formAluno.telefone} onChange={(e) => setFormAluno({ ...formAluno, telefone: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    <div style={{ gridColumn: 'span 2' }}><label>E-mail (opcional):</label><input type="email" value={formAluno.email} onChange={(e) => setFormAluno({ ...formAluno, email: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                      <button type="submit" style={{ padding: '10px 18px', background: '#090d16', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>{idEdicaoAluno ? 'Atualizar Aluno' : 'Salvar Aluno'}</button>
                      {idEdicaoAluno && <button type="button" onClick={() => { setIdEdicaoAluno(null); setFormAluno({ nome: '', data_nascimento: '', responsavel: '', telefone: '', email: '' }); }} style={{ padding: '10px 18px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>}
                    </div>
                  </form>
                </section>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0 }}>Alunos Cadastrados</h3>
                <input type="text" placeholder="🔍 Buscar aluno..." value={buscaAluno} onChange={(e) => setBuscaAluno(e.target.value)} style={{ padding: '8px 12px', width: '260px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px' }}>Nome</th>
                    <th style={{ padding: '12px' }}>Nascimento</th>
                    <th style={{ padding: '12px' }}>Responsável</th>
                    <th style={{ padding: '12px' }}>Telefone</th>
                    {credenciais.perfil === 'professor' && <th style={{ padding: '12px' }}>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {alunos.map((a) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{a.nome}</td>
                      <td style={{ padding: '12px' }}>{formatarDataBR(a.data_nascimento)}</td>
                      <td style={{ padding: '12px' }}>{a.responsavel}</td>
                      <td style={{ padding: '12px' }}>{a.telefone}</td>
                      {credenciais.perfil === 'professor' && (
                        <td style={{ padding: '12px', display: 'flex', gap: '6px' }}>
                          <button onClick={() => { setIdEdicaoAluno(a.id); setFormAluno({ nome: a.nome, data_nascimento: a.data_nascimento, responsavel: a.responsavel, telefone: a.telefone, email: a.email || '' }); }} style={{ padding: '5px 10px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Editar</button>
                          <button onClick={() => excluirRegistro('alunos', a.id, 'Excluir este aluno?', 'Aluno excluído!')} style={{ padding: '5px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Excluir</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ==================== TELA: TURMAS ==================== */}
          {abaAtiva === 'turmas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {renderSecaoMinhasTurmas()}

              <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', border: '1px solid #e2e8f0' }}>
                {credenciais.perfil === 'professor' && (
                  <section style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ marginTop: 0 }}>{idEdicaoTurma ? 'Editar Turma' : 'Cadastrar Nova Turma'}</h3>
                    <form
                      onSubmit={(e) => salvarRegistro(
                        e, 'turmas', idEdicaoTurma, { ...formTurma, capacidade: Number(formTurma.capacidade) },
                        () => { setIdEdicaoTurma(null); setFormTurma({ nome: '', turno: 'Matutino', faixa_etaria: '', professor: '', capacidade: '' }); },
                        idEdicaoTurma ? 'Turma atualizada!' : 'Turma cadastrada!'
                      )}
                      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
                    >
                      <div><label>Nome da Turma:</label><input type="text" value={formTurma.nome} onChange={(e) => setFormTurma({ ...formTurma, nome: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                      <div>
                        <label>Turno:</label>
                        <select value={formTurma.turno} onChange={(e) => setFormTurma({ ...formTurma, turno: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <option value="Matutino">Matutino</option>
                          <option value="Vespertino">Vespertino</option>
                          <option value="Integral">Integral</option>
                        </select>
                      </div>
                      <div><label>Faixa Etária:</label><input type="text" value={formTurma.faixa_etaria} onChange={(e) => setFormTurma({ ...formTurma, faixa_etaria: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                      <div><label>Professor:</label><input type="text" value={formTurma.professor} onChange={(e) => setFormTurma({ ...formTurma, professor: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                      <div style={{ gridColumn: 'span 2' }}><label>Capacidade:</label><input type="number" min="1" value={formTurma.capacidade} onChange={(e) => setFormTurma({ ...formTurma, capacidade: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                      <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ padding: '10px 18px', background: '#090d16', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>{idEdicaoTurma ? 'Atualizar Turma' : 'Salvar Turma'}</button>
                        {idEdicaoTurma && <button type="button" onClick={() => { setIdEdicaoTurma(null); setFormTurma({ nome: '', turno: 'Matutino', faixa_etaria: '', professor: '', capacidade: '' }); }} style={{ padding: '10px 18px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>}
                      </div>
                    </form>
                  </section>
                )}
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '12px' }}>Turma</th>
                      <th style={{ padding: '12px' }}>Turno</th>
                      <th style={{ padding: '12px' }}>Faixa Etária</th>
                      <th style={{ padding: '12px' }}>Professor</th>
                      <th style={{ padding: '12px' }}>Vagas</th>
                      {credenciais.perfil === 'professor' && <th style={{ padding: '12px' }}>Ações</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {turmas.map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{t.nome}</td>
                        <td style={{ padding: '12px' }}>{t.turno}</td>
                        <td style={{ padding: '12px' }}>{t.faixa_etaria}</td>
                        <td style={{ padding: '12px' }}>{t.professor}</td>
                        <td style={{ padding: '12px' }}>{t.capacidade}</td>
                        {credenciais.perfil === 'professor' && (
                          <td style={{ padding: '12px', display: 'flex', gap: '6px' }}>
                            <button onClick={() => { setIdEdicaoTurma(t.id); setFormTurma({ nome: t.nome, turno: t.turno, faixa_etaria: t.faixa_etaria, professor: t.professor, capacidade: t.capacidade }); }} style={{ padding: '5px 10px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Editar</button>
                            <button onClick={() => excluirRegistro('turmas', t.id, 'Excluir esta turma?', 'Turma excluída!')} style={{ padding: '5px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Excluir</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TELA: PROFESSORES ==================== */}
          {abaAtiva === 'professores' && (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', border: '1px solid #e2e8f0' }}>
              {credenciais.perfil === 'professor' && (
                <section style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ marginTop: 0 }}>{idEdicaoProfessor ? 'Editar Professor' : 'Cadastrar Novo Professor'}</h3>
                  <form
                    onSubmit={(e) => salvarRegistro(
                      e, 'professores', idEdicaoProfessor, formProfessor,
                      () => { setIdEdicaoProfessor(null); setFormProfessor({ nome: '', formacao: '', turno: 'Matutino', telefone: '', email: '' }); },
                      idEdicaoProfessor ? 'Professor atualizado!' : 'Professor cadastrado!'
                    )}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
                  >
                    <div><label>Nome:</label><input type="text" value={formProfessor.nome} onChange={(e) => setFormProfessor({ ...formProfessor, nome: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    <div><label>Formação:</label><input type="text" value={formProfessor.formacao} onChange={(e) => setFormProfessor({ ...formProfessor, formacao: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    <div>
                      <label>Turno:</label>
                      <select value={formProfessor.turno} onChange={(e) => setFormProfessor({ ...formProfessor, turno: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <option value="Matutino">Matutino</option>
                        <option value="Vespertino">Vespertino</option>
                        <option value="Integral">Integral</option>
                      </select>
                    </div>
                    <div><label>Telefone:</label><input type="text" value={formProfessor.telefone} onChange={(e) => setFormProfessor({ ...formProfessor, telefone: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                      <button type="submit" style={{ padding: '10px 18px', background: '#090d16', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>{idEdicaoProfessor ? 'Atualizar Professor' : 'Salvar Professor'}</button>
                    </div>
                  </form>
                </section>
              )}
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px' }}>Nome</th>
                    <th style={{ padding: '12px' }}>Formação</th>
                    <th style={{ padding: '12px' }}>Turno</th>
                    <th style={{ padding: '12px' }}>Telefone</th>
                    {credenciais.perfil === 'professor' && <th style={{ padding: '12px' }}>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {professores.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{p.nome}</td>
                      <td style={{ padding: '12px' }}>{p.formacao}</td>
                      <td style={{ padding: '12px' }}>{p.turno}</td>
                      <td style={{ padding: '12px' }}>{p.telefone}</td>
                      {credenciais.perfil === 'professor' && (
                        <td style={{ padding: '12px', display: 'flex', gap: '6px' }}>
                          <button onClick={() => { setIdEdicaoProfessor(p.id); setFormProfessor({ nome: p.nome, formacao: p.formacao, turno: p.turno, telefone: p.telefone, email: p.email || '' }); }} style={{ padding: '5px 10px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Editar</button>
                          <button onClick={() => excluirRegistro('professores', p.id, 'Excluir este professor?', 'Professor excluído!')} style={{ padding: '5px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Excluir</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ==================== TELA: AGENDA DIÁRIA ==================== */}
          {abaAtiva === 'agenda' && (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', border: '1px solid #e2e8f0' }}>
              {credenciais.perfil === 'professor' && (
                <section style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ marginTop: 0 }}>{idEdicaoAgenda ? 'Editar Agenda Diária' : 'Registrar Rotina da Criança'}</h3>
                  <form
                    onSubmit={(e) => salvarRegistro(
                      e, 'agenda', idEdicaoAgenda, formAgenda,
                      () => { setIdEdicaoAgenda(null); setFormAgenda({ aluno_nome: '', data: new Date().toISOString().slice(0, 10), alimentacao: 'Comeu tudo', sono: 'Dormiu bem (1h30)', humor: 'Alegre / Participativo', observacao: '' }); },
                      idEdicaoAgenda ? 'Agenda atualizada!' : 'Agenda salva!'
                    )}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
                  >
                    <div><label>Aluno:</label><input type="text" value={formAgenda.aluno_nome} onChange={(e) => setFormAgenda({ ...formAgenda, aluno_nome: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    <div><label>Data:</label><input type="date" value={formAgenda.data} onChange={(e) => setFormAgenda({ ...formAgenda, data: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    <div>
                      <label>Alimentação:</label>
                      <select value={formAgenda.alimentacao} onChange={(e) => setFormAgenda({ ...formAgenda, alimentacao: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <option value="Comeu tudo">Comeu tudo</option>
                        <option value="Comeu parcialmente">Comeu parcialmente</option>
                        <option value="Recusou a refeição">Recusou a refeição</option>
                      </select>
                    </div>
                    <div>
                      <label>Sono:</label>
                      <select value={formAgenda.sono} onChange={(e) => setFormAgenda({ ...formAgenda, sono: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <option value="Dormiu bem (1h30)">Dormiu bem (1h30)</option>
                        <option value="Soneca rápida (30min)">Soneca rápida (30min)</option>
                        <option value="Não dormiu">Não dormiu</option>
                      </select>
                    </div>
                    <div>
                      <label>Humor:</label>
                      <select value={formAgenda.humor} onChange={(e) => setFormAgenda({ ...formAgenda, humor: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <option value="Alegre / Participativo">Alegre / Participativo</option>
                        <option value="Calmo / Tranquilo">Calmo / Tranquilo</option>
                        <option value="Agitado / Choroso">Agitado / Choroso</option>
                      </select>
                    </div>
                    <div><label>Observações:</label><input type="text" value={formAgenda.observacao} onChange={(e) => setFormAgenda({ ...formAgenda, observacao: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <button type="submit" style={{ padding: '10px 18px', background: '#090d16', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Salvar na Agenda</button>
                    </div>
                  </form>
                </section>
              )}
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px' }}>Data</th>
                    <th style={{ padding: '12px' }}>Aluno</th>
                    <th style={{ padding: '12px' }}>Alimentação</th>
                    <th style={{ padding: '12px' }}>Sono</th>
                    <th style={{ padding: '12px' }}>Humor</th>
                    <th style={{ padding: '12px' }}>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {agenda.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px' }}>{formatarDataBR(item.data)}</td>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{item.aluno_nome}</td>
                      <td style={{ padding: '12px' }}>{item.alimentacao}</td>
                      <td style={{ padding: '12px' }}>{item.sono}</td>
                      <td style={{ padding: '12px' }}>{item.humor}</td>
                      <td style={{ padding: '12px' }}>{item.observacao || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ==================== TELA: COMUNICADOS ==================== */}
          {abaAtiva === 'comunicados' && (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', border: '1px solid #e2e8f0' }}>
              {credenciais.perfil === 'professor' && (
                <section style={{ background: '#f8fafc', padding: '18px', borderRadius: '10px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ marginTop: 0 }}>Publicar Comunicado</h3>
                  <form
                    onSubmit={(e) => salvarRegistro(
                      e, 'comunicados', idEdicaoComunicado, formComunicado,
                      () => { setIdEdicaoComunicado(null); setFormComunicado({ titulo: '', categoria: 'Aviso Geral', mensagem: '', data_publicacao: new Date().toISOString().slice(0, 10) }); },
                      'Comunicado publicado!'
                    )}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
                  >
                    <div><label>Título:</label><input type="text" value={formComunicado.titulo} onChange={(e) => setFormComunicado({ ...formComunicado, titulo: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    <div>
                      <label>Categoria:</label>
                      <select value={formComunicado.categoria} onChange={(e) => setFormComunicado({ ...formComunicado, categoria: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                        <option value="Aviso Geral">Aviso Geral</option>
                        <option value="Evento Escolar">Evento Escolar</option>
                        <option value="Reunião de Pais">Reunião de Pais</option>
                        <option value="Urgente">Urgente</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}><label>Mensagem:</label><textarea rows="3" value={formComunicado.mensagem} onChange={(e) => setFormComunicado({ ...formComunicado, mensagem: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} /></div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <button type="submit" style={{ padding: '10px 18px', background: '#090d16', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Publicar</button>
                    </div>
                  </form>
                </section>
              )}
              <div style={{ display: 'grid', gap: '12px' }}>
                {comunicados.map((c) => (
                  <div key={c.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{c.titulo} <span style={{ fontSize: '12px', color: '#64748b' }}>({c.categoria})</span></strong>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{formatarDataBR(c.data_publicacao)}</span>
                    </div>
                    <p style={{ margin: '8px 0 0 0', color: '#334155' }}>{c.mensagem}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}