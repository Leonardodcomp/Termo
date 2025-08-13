// ---------------- Estado inicial ----------------
const inicializarJogo = (palavra) => ({
  palavra: palavra.toUpperCase(),
  tentativas: [],
  maxTentativas: 6
});

// ---------------- Funções puras ----------------
const verificarTentativa = (palavra, tentativa) => {
  const resultado = [];
  const letrasRestantes = palavra.split("");

  // Primeiro: marca as corretas
  tentativa.split("").forEach((letra, i) => {
    if (palavra[i] === letra) {
      resultado[i] = { letra, status: "correct" };
      letrasRestantes[i] = null; // remove essa letra
    }
  });

  // Depois: marca presentes e ausentes
  tentativa.split("").forEach((letra, i) => {
    if (!resultado[i]) {
      if (letrasRestantes.includes(letra)) {
        resultado[i] = { letra, status: "present" };
        letrasRestantes[letrasRestantes.indexOf(letra)] = null;
      } else {
        resultado[i] = { letra, status: "absent" };
      }
    }
  });

  return resultado;
};

const jogoVencido = (estado) =>
  estado.tentativas.some(t => t.every(c => c.status === "correct"));

const jogoPerdido = (estado) =>
  estado.tentativas.length >= estado.maxTentativas && !jogoVencido(estado);

const tentarPalavra = (estado, palavra) => {
  if (palavra.length !== estado.palavra.length) return estado;
  if (jogoVencido(estado) || jogoPerdido(estado)) return estado;
  const tentativaVerificada = verificarTentativa(estado.palavra, palavra.toUpperCase());
  return { ...estado, tentativas: [...estado.tentativas, tentativaVerificada] };
};

// ---------------- View pura ----------------
const view = (estado) => `
  <div class="grid">
    ${Array.from({ length: estado.maxTentativas }).map((_, row) => `
      ${Array.from({ length: estado.palavra.length }).map((_, col) => {
        const tentativa = estado.tentativas[row];
        const cell = tentativa ? tentativa[col] : { letra: "", status: "" };
        return `<div class="cell ${cell.status}">${cell.letra}</div>`;
      }).join("")}
    `).join("")}
  </div>
  ${jogoVencido(estado) || jogoPerdido(estado) ? `
    <p class="mensagem">
      ${jogoVencido(estado) ? "🎉 Você venceu!" : `💀 Você perdeu! A palavra era: ${estado.palavra}`}
    </p>
    <button data-action="reiniciar">🔄 Reiniciar</button>
  ` : `
    <input id="entrada" maxlength="${estado.palavra.length}" placeholder="Digite a palavra">
    <button data-action="tentar">Tentar</button>
  `}
`;

// ---------------- Função para atualizar estado ----------------
const palavras = ["VERDE", "TERMO", "CARTA", "PIZZA", "NUVEM"];
const novaPalavra = () => palavras[Math.floor(Math.random() * palavras.length)];

const updateState = (estado, acao) => {
  if (acao.type === "tentar") {
    return tentarPalavra(estado, acao.payload);
  }
  if (acao.type === "reiniciar") {
    return inicializarJogo(novaPalavra());
  }
  return estado;
};

// ---------------- Loop funcional com único efeito colateral ----------------
const app = (estado) => {
  document.getElementById("app").innerHTML = view(estado);

  document.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const novaAcao = btn.dataset.action === "tentar"
        ? { type: "tentar", payload: document.getElementById("entrada").value }
        : { type: "reiniciar" };
      app(updateState(estado, novaAcao));
    });
  });
};

// ---------------- Início ----------------
app(inicializarJogo(novaPalavra()));
