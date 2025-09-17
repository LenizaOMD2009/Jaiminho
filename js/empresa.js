const Cep = document.getElementById('cep');
const Cnpj = document.getElementById('cnpj');

function mostrarCarregando() {
  document.getElementById('loading').style.display = 'inline-block';
  document.querySelectorAll('input, button, a.cadastrar').forEach(el => el.disabled = true);
}

function esconderCarregando() {
  document.getElementById('loading').style.display = 'none';
  document.querySelectorAll('input, button, a.cadastrar').forEach(el => el.disabled = false);
}

function onlyDigits(s = '') {
  return (s || '').toString().replace(/\D/g, '');
}

function formatCep(raw) {
  const d = onlyDigits(raw).slice(0, 8);
  if (d.length <= 5) return d;
  return d.slice(0, 5) + '-' + d.slice(5);
}

function formatCnpj(raw) {
  const d = onlyDigits(raw).slice(0, 14);
  let v = d;
  v = v.replace(/^(\d{2})(\d)/, '$1.$2');
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
  v = v.replace(/(\d{4})(\d)/, '$1-$2');
  return v;
}

function showFeedback(message, type = 'info') {
  // Exemplo básico, pode ser adaptado para criar/usar div na página
  alert(`${type.toUpperCase()}: ${message}`);
}

async function BuscarCep() {
  const cepRaw = Cep.value;
  const cep = onlyDigits(cepRaw);

  if (cep.length !== 8) {
    showFeedback('CEP inválido (deve conter 8 dígitos).', 'error');
    return;
  }

  mostrarCarregando();
  try {
    // requisição e preenchimento
  } catch (error) {
    // tratamento de erro
  } finally {
    esconderCarregando();
  }


  const url = `https://viacep.com.br/ws/${cep}/json/`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.erro) {
      showFeedback('CEP não encontrado.', 'error');
      return;
    }

    document.getElementById('logradouro').value = data.logradouro || '';
    document.getElementById('bairro').value = data.bairro || '';
    document.getElementById('cidade').value = data.localidade || '';
    document.getElementById('uf').value = data.uf || '';

    showFeedback('Endereço preenchido automaticamente a partir do CEP.', 'success');
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    showFeedback('Erro ao buscar CEP. Tente novamente.', 'error');
  }
}

async function BuscarCnpj() {
  const cnpjRaw = Cnpj.value;
  const cnpj = onlyDigits(cnpjRaw);

  mostrarCarregando();
  try {
    // requisição e preenchimento
  } catch (error) {
    // tratamento de erro
  } finally {
    esconderCarregando();
  }

  if (cnpj.length !== 14) {
    showFeedback('CNPJ inválido (deve conter 14 dígitos).', 'error');
    return;
  }

  const url = `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`;

  try {
    const response = await fetch(url);
    if (response.status === 404) {
      showFeedback('CNPJ não encontrado.', 'error');
      return;
    }
    if (!response.ok) {
      showFeedback(`Erro na consulta do CNPJ (status ${response.status}).`, 'error');
      return;
    }

    const data = await response.json();

    document.getElementById('razao_social').value = data.razao_social || '';
    document.getElementById('nome_fantasia').value = data.nome_fantasia || '';

    // Atualiza o campo CNPJ com a máscara correta
    Cnpj.value = formatCnpj(cnpj);

    // Se a API retornar cep, atualiza e busca endereço automático
    const cepFromApi = data.cep || '';
    if (cepFromApi) {
      Cep.value = formatCep(cepFromApi);
      await BuscarCep();
    }

    showFeedback('Dados do CNPJ preenchidos automaticamente.', 'success');

  } catch (error) {
    console.error('Erro ao buscar CNPJ:', error);
    showFeedback('Erro ao buscar CNPJ. Tente novamente.', 'error');
  }
}

// Máscaras simples enquanto digita para melhorar UX
Cep.addEventListener('input', (e) => {
  const pos = e.target.selectionStart;
  e.target.value = formatCep(e.target.value);
  try { e.target.setSelectionRange(pos, pos); } catch {}
});

Cnpj.addEventListener('input', (e) => {
  const pos = e.target.selectionStart;
  e.target.value = formatCnpj(e.target.value);
  try { e.target.setSelectionRange(pos, pos); } catch {}
});

// Eventos no blur para disparar busca só após o usuário terminar de digitar
Cep.addEventListener('blur', BuscarCep);
Cnpj.addEventListener('blur', BuscarCnpj);
