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

async function BuscarCep() {
    const cepValue = Cep.value;
    const cepFotmatedValue = cepValue.replace('-', '').trim();
    if (cepFotmatedValue.length !== 8) { 
    }
    const url = `https://viacep.com.br/ws/${cepFormatedValue}/json`;
    const options = {
        method: 'GET',
        mode: 'cors',
        cache: 'default'
    }
    const response = await fetch(url, options);
    const json = await response.json();

    document.getElementById('logradouro').value = json.logradouro;
    document.getElementById('bairro').value = json.bairro;
    document.getElementById('uf').value = json.uf;
    document.getElementById('cidade').value = json.localidade;
} 
const a = async () => {
    const cnpjValue = Cnpj.value;
    console.log(cnpjValue);
    console.log(typeof cnpjValue);
    const cnpjFotmatedValue = cnpjValue
    .replace('.', '')
    .replace('-', '')
    .replace('/', '')
    .trim();
    const url = `https://brasilapi.com.br/api/cnpj/v1/${cnpjFotmatedValue}`;
    const options = {
        method: 'GET',
        mode: 'cors',
        cache: 'default'
    }
    const response = await fetche(url, options);
    const json = await response.json();
    console.log(json.razao_social);
    document.getElementById('razao_social').value = json.razao_social
    Cep.value = json.cep
}

Cep.addEventListener('change', async () => {
    BuscarCep()
});
Cep.addEventListener('change', a);

