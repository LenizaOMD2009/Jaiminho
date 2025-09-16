const form = document.getElementById("formCliente");

function mostrarCarregando() {
  document.getElementById('loading').style.display = 'inline-block';
  document.querySelectorAll('input, button, a.cadastrar').forEach(el => el.disabled = true);
}

function esconderCarregando() {
  document.getElementById('loading').style.display = 'none';
  document.querySelectorAll('input, button, a.cadastrar').forEach(el => el.disabled = false);
}

// Recupera clientes do localStorage
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let proximoCodigo = clientes.length ? clientes[clientes.length - 1].codigo + 1 : 1;

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const agora = new Date().toLocaleString();

  const cliente = {
    codigo: proximoCodigo++,
    nome,
    email,
    telefone,
    dataCriacao: agora,
    dataAtualizacao: agora
  };

  clientes.push(cliente);
  localStorage.setItem("clientes", JSON.stringify(clientes));
  alert("Cliente cadastrado com sucesso!");

  form.reset();
});
