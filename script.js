// ---------------- Estado inicial ----------------
const inicializarJogo = (palavra) => ({
  palavra: palavra.toUpperCase(),
  tentativas: [],
  maxTentativas: 6
});

// ---------------- Funções puras ----------------
const verificarTentativa = (palavra, tentativa) => {
  const letrasIniciais = palavra.split("");

  // Passo 1: processa corretas
  const { resultadoParcial, letrasRestantes } = tentativa.split("").reduce(
    (acc, letra, i) => {
      if (palavra[i] === letra) {
        acc.resultadoParcial[i] = { letra, status: "correct" };
        acc.letrasRestantes[i] = null;
      }
      return acc;
    },
    { resultadoParcial: [], letrasRestantes: [...letrasIniciais] }
  );

  // Passo 2: processa presentes/ausentes
  return tentativa.split("").map((letra, i) => {
    if (resultadoParcial[i]) return resultadoParcial[i];
    
    const indexPresente = letrasRestantes.indexOf(letra);
    if (indexPresente !== -1) {
      letrasRestantes[indexPresente] = null;
      return { letra, status: "present" };
    }
    
    return { letra, status: "absent" };
  });
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
const palavraEscolhida = "TERMO"; // Substitua pela palavra que desejar

const updateState = (estado, acao) => {
  if (acao.type === "tentar") {
    return tentarPalavra(estado, acao.payload);
  }
  if (acao.type === "reiniciar") {
    return inicializarJogo(palavraEscolhida); // Sempre retorna a palavra fixa
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
app(inicializarJogo(palavraEscolhida));
