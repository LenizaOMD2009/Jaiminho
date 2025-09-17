// js/autofill.js
// Comportamento idêntico para campos CNPJ e CEP em múltiplos formulários.
// Expectativa: cada formulário deve ter campos com esses IDs:
// cnpj, nome_fantasia, razao_social, cep, logradouro, bairro, cidade, estado (uf), submit (opcional)
// Além de uma região de feedback com id "feedback" (ou é criada dinamicamente).

(function () {
  'use strict';

  /* ----------------- utilitários ----------------- */
  const onlyDigits = (s='') => (s || '').toString().replace(/\D/g, '');
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function makeFeedbackArea(form) {
    // procura área existente ou cria uma ao final do form
    let fb = form.querySelector('[data-autofill-feedback]');
    if (!fb) {
      fb = document.createElement('div');
      fb.setAttribute('data-autofill-feedback', 'true');
      fb.className = 'feedback';
      fb.setAttribute('aria-live', 'polite');
      fb.setAttribute('aria-atomic', 'true');
      form.appendChild(fb);
    }
    return fb;
  }

  function setLoadingState(form, loading=true) {
    // desabilita todos os buttons do form; adiciona spinner ao primeiro botão principal
    const buttons = Array.from(form.querySelectorAll('button, input[type="submit"]'));
    buttons.forEach(b => b.disabled = loading);

    let spinner = form.querySelector('[data-autofill-spinner]');
    if (loading) {
      if (!spinner) {
        spinner = document.createElement('span');
        spinner.setAttribute('data-autofill-spinner', 'true');
        spinner.className = 'spinner';
        // tenta anexar a um botão primário se existir
        const btn = form.querySelector('button.btn-primary, input[type="submit"].btn-primary') || buttons[0];
        if (btn) btn.after(spinner);
        else form.appendChild(spinner);
      }
    } else {
      if (spinner) spinner.remove();
    }
  }

  function showFeedback(form, type, message) {
    const fb = makeFeedbackArea(form);
    fb.innerHTML = ''; // limpa
    const span = document.createElement('span');
    span.textContent = message;
    span.className = type === 'error' ? 'error' : (type === 'success' ? 'success' : 'small');
    fb.appendChild(span);
  }

  /* ----------------- preenchimento por CEP (BrasilAPI) ----------------- */
  async function fetchCepAndFill(form, cepRaw) {
    const cepDigits = onlyDigits(cepRaw);
    if (cepDigits.length !== 8) {
      showFeedback(form, 'error', 'CEP inválido (deve conter 8 dígitos).');
      return;
    }

    const feedbackMsg = `Buscando endereço para CEP ${cepDigits}...`;
    showFeedback(form, 'info', feedbackMsg);
    setLoadingState(form, true);

    const url = `https://brasilapi.com.br/api/cep/v1/${cepDigits}`;
    try {
      const res = await fetch(url, { method: 'GET', mode: 'cors', cache: 'no-cache' });
      if (res.status === 404) {
        showFeedback(form, 'error', 'CEP não encontrado (404). Verifique o número.');
        return;
      }
      if (!res.ok) {
        showFeedback(form, 'error', `Erro na consulta do CEP (status ${res.status}).`);
        return;
      }
      const data = await res.json();
      // preenche campos se existirem
      const map = {
        logradouro: data.street || data.logradouro || data.address || '',
        bairro: data.neighborhood || data.bairro || '',
        cidade: data.city || data.localidade || data.city_ibge || '',
        estado: data.state || data.uf || data.estado || ''
      };
      // insere valores
      if (map.logradouro) setIfExists(form, 'logradouro', map.logradouro);
      if (map.bairro) setIfExists(form, 'bairro', map.bairro);
      if (map.cidade) setIfExists(form, 'cidade', map.cidade);
      if (map.estado) setIfExists(form, 'estado', map.estado);

      showFeedback(form, 'success', 'Endereço preenchido automaticamente a partir do CEP.');
    } catch (err) {
      console.error('Erro fetch CEP:', err);
      showFeedback(form, 'error', 'Falha na rede ao consultar o CEP. Tente novamente.');
    } finally {
      setLoadingState(form, false);
    }
  }

  /* ----------------- preenchimento por CNPJ (BrasilAPI) ----------------- */
  async function fetchCnpjAndFill(form, cnpjRaw) {
    const cnpjDigits = onlyDigits(cnpjRaw);
    if (cnpjDigits.length !== 14) {
      showFeedback(form, 'error', 'CNPJ inválido (deve conter 14 dígitos).');
      return;
    }

    showFeedback(form, 'info', `Buscando dados do CNPJ ${cnpjDigits}...`);
    setLoadingState(form, true);

    const url = `https://brasilapi.com.br/api/cnpj/v1/${cnpjDigits}`;
    try {
      const res = await fetch(url, { method: 'GET', mode: 'cors', cache: 'no-cache' });
      if (res.status === 404) {
        showFeedback(form, 'error', 'CNPJ não encontrado (404). Verifique o número.');
        return;
      }
      if (!res.ok) {
        showFeedback(form, 'error', `Erro na consulta do CNPJ (status ${res.status}).`);
        return;
      }
      const data = await res.json();
      // Campos comuns retornados pela BrasilAPI (exemplos): razao_social, nome_fantasia, cep, street, neighborhood, city, state
      // Mapeamento flexível:
      if (data.razao_social) setIfExists(form, 'razao_social', data.razao_social);
      if (data.estabelecimento && data.estabelecimento.razao_social) setIfExists(form, 'razao_social', data.estabelecimento.razao_social);
      if (data.nome_fantasia) setIfExists(form, 'nome_fantasia', data.nome_fantasia);
      if (data.fantasia) setIfExists(form, 'nome_fantasia', data.fantasia);

      // CNPJ - garantir formato sem máscara no campo (mas opcionalmente formatar)
      setIfExists(form, 'cnpj', formatCnpj(cnpjDigits));

      // Endereço: BrasilAPI pode trazer vários campos. Tentamos mapear os mais comuns:
      const cepFromApi = data.cep || data.estabelecimento?.cep || data.estabelecimento?.address?.cep || '';
      if (cepFromApi) {
        setIfExists(form, 'cep', formatCep(cepFromApi));
        // automática: também buscar o CEP para preencher logradouro/uf/cidade/bairro
        await sleep(250); // pequeno delay para renderizar feedback
        await fetchCepAndFill(form, cepFromApi);
      } else {
        // Tenta preencher logradouro direto se disponível
        const street = data.logradouro || data.estabelecimento?.logradouro || data.estabelecimento?.address?.street || data.street || '';
        const neighborhood = data.bairro || data.estabelecimento?.bairro || data.estabelecimento?.address?.neighborhood || '';
        const city = data.municipio || data.estabelecimento?.cidade || data.estabelecimento?.address?.city || data.city || '';
        const state = data.uf || data.estabelecimento?.uf || data.estabelecimento?.address?.state || data.state || '';
        if (street) setIfExists(form, 'logradouro', street);
        if (neighborhood) setIfExists(form, 'bairro', neighborhood);
        if (city) setIfExists(form, 'cidade', city);
        if (state) setIfExists(form, 'estado', state);
      }

      showFeedback(form, 'success', 'Dados do CNPJ preenchidos automaticamente.');
    } catch (err) {
      console.error('Erro fetch CNPJ:', err);
      showFeedback(form, 'error', 'Falha na rede ao consultar o CNPJ. Tente novamente.');
    } finally {
      setLoadingState(form, false);
    }
  }

  function setIfExists(form, idOrName, value) {
    if (!value && value !== 0) return;
    let el = form.querySelector(`#${idOrName}`);
    if (!el) el = form.querySelector(`[name="${idOrName}"]`);
    if (el) {
      el.value = value;
      // polida: dispara evento 'input' para que máscaras/observadores reajam
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  /* ----------------- máscaras simples para exibir valores legíveis ----------------- */
  function formatCep(raw) {
    const d = onlyDigits(raw).slice(0,8);
    if (d.length <= 5) return d;
    return d.slice(0,5) + '-' + d.slice(5);
  }
  function formatCnpj(raw) {
    const d = onlyDigits(raw).slice(0,14);
    let v = d;
    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');
    return v;
  }

  /* ----------------- inicialização: registra handlers para cada form na página ----------------- */
  function initForm(form) {
    if (!form) return;

    // encontra elementos (pode não existir todos)
    const cnpjEl = form.querySelector('#cnpj') || form.querySelector('[name="cnpj"]');
    const cepEl = form.querySelector('#cep') || form.querySelector('[name="cep"]');
    // cria feedback se não existir
    makeFeedbackArea(form);

    // máscara simples enquanto digita (não substitui validação)
    if (cepEl) {
      cepEl.addEventListener('input', (e) => {
        const pos = e.target.selectionStart;
        e.target.value = formatCep(e.target.value);
        try { e.target.setSelectionRange(pos, pos); } catch {}
      });
      cepEl.addEventListener('blur', (e) => {
        // ao perder foco, sanitiza e tenta buscar
        const raw = onlyDigits(e.target.value);
        if (raw.length === 8) fetchCepAndFill(form, raw);
        else if (raw.length > 0) showFeedback(form, 'error', 'CEP incompleto (8 dígitos).');
      });
    }

    if (cnpjEl) {
      cnpjEl.addEventListener('input', (e) => {
        const pos = e.target.selectionStart;
        e.target.value = formatCnpj(e.target.value);
        try { e.target.setSelectionRange(pos, pos); } catch {}
      });
      cnpjEl.addEventListener('blur', (e) => {
        const raw = onlyDigits(e.target.value);
        if (raw.length === 14) fetchCnpjAndFill(form, raw);
        else if (raw.length > 0) showFeedback(form, 'error', 'CNPJ incompleto (14 dígitos).');
      });
    }
  }

  // inicializa todos os forms na página
  document.addEventListener('DOMContentLoaded', () => {
    const forms = Array.from(document.querySelectorAll('form.autofill-form'));
    if (forms.length === 0) {
      // se não houver formulários marcados, tenta inicializar o único form
      const single = document.querySelector('form');
      if (single) initForm(single);
      return;
    }
    forms.forEach(initForm);
  });

  // expõe utilitários para depuração
  window.__autofill = { initForm, fetchCepAndFill, fetchCnpjAndFill };
})();
