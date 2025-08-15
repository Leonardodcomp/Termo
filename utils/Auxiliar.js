// Registro de dados necessários para o jogo iniciar

const InicializarJogo = (palavra) =>  ({

    //Colocar tudo que o jogador digitar em maiusculo para evitar problemas:
    palavra: palavra.toUpperCase(),


    //Definimos que o jogador tem no maximo 6 chances, logo:
    chances: 6,

    //Constante para verificar se o jogador ganhou ou perdeu o jogo
    tentativas: []


});

// Aqui inicia a logica do jogo

const verificarTentativa = (palavra, tentativa) => {

    // O objeitivo do jogo é a leitura das letras de uma palavra, vamos quebrar uma palavra em varias letras:
    const letrasIniciais = palavra.split ("");

//A logica do jogo funcionará da seguinte forma: como o jogo está "preso" em um paradigma funcional, vamos abusar do uso de spreads para realizar cópias a todo momento e do reduce para acumular e armazenar temporariamente nossos resultados, ficando assim:

const { resultadoParcial, letrasRestantes } = tentativa.split("").reduce(


    (acc, letra, i) => {
    // Agora vamos acumular as tentativas dos jogadores em cópias para respeitar o paradigma funcional
    const novoResultado = [...acc.resultadoParcial];
    const novasLetrasRestantes = [...acc.letrasRestantes];

    //Verificando as palavras na condicional. Se ele acertar, vamos colocar no array de acerto e retirar das letras faltantes

    if (palavra[i]=== letra) {
        novoResultado[i] = {letra, status: "correct"};
        novasLetrasRestantes[i] = null;
        } 
        
        return{
            resultadoParcial: novoResultado,
            letrasRestantes: novasLetrasRestantes
        };
},
//Dessa forma terminamos de programar nosso acumulador

//Essas sao as duas listas que vao rodar nosso jogo e fechamos nosso reduce com elas
{ resultadoParcial:[], letrasRestantes: [...letrasIniciais]}
);




// Com o acumulador e o reduce que sao a "alma" do jogo programado, vamos fechar nossa funcao verificarJogada com um return

return tentativa.split("").map(

    (letra,i) => {

        //De forma simples, se for isso, retorne isso.
        //Esse if abiaxo representará o melhor dos casos, letra certa na posição certa
        if(resultadoParcial[i]) return resultadoParcial[i];



        //Se a letra existir, mas estiver na posição errada, precisamos mostrar isso.

        const indexAtual = letrasRestantes.indexOf(letra);
        //Sabemos pelas listas de exercício: lista 5, questão 4 que o index de um elemento inexistente é -1, vamos usar isso.
        if(indexAtual !== -1) {
            //Aqui a logica usada é a seguinte, a letra existe, o jogador acertou, ta na posição errada, mas acertou, então precisamos retirar ela da lista letrasRestantes
            letrasRestantes[indexAtual] = null;
            return {letra, status: "present"};

        }


        // Se nada deu certo é porque a letra nem existe na palavra, então
        return {letra, staus: "absent"};
        });

//Chegamos ao fim da função verificarJogada       
};



//Agora vamos verificar se o jogador venceu ou perdeu o jogo



//Criar uma contante para verificar se uma letra digitada esta em seu lugar correto
const venceu = (situacao) => situacao.tentativas.some(t => t.every(c.status === "correct")); 

//Para o jogador perder o jogador deve exceder 6 chances e a situacao ser diferente de venceu
const perdeu = (situacao) => situacao.tentativas.length >= situacao.chances && !venceu(situacao);


// Vamos formalizar o jogo

const tentarPalavra = (situacao, termo) => {

    //primeiro precisamos que o jogador insira exatamente uma palavra com 5 letras, caso contrario a situacao dele permanece inalterada, dessa forma
    if (palavra.lenght != situacao.palavra.lenght) return situacao;
    ////De forma similar, precisamos que o jogo acabe, ou seja, se o jogador perder ou vencer qualquer outra tentativa é ignorada
    if( venceu(situacao)|| perdeu(situacao)) return situacao;

    
    // Agora vamos fazer o jogo "rodar"!
    // Ela funciona com 2 parametros, entao precisamos adicionar 2 paramentros em verificar tentativa.
    const tentativaVerificada = verificarTentativa(situacao.palavra, palavra.toUpperCase());

    //Por fim o retorno da funcao tentarTermo retornara o valor da lista situacao, visando o paradigma, fara copias das listas para respeitar o paradigma funcional

    return {...situacao, tentativas: [... situacao.tentativas, tentativaVerificada]};
}

// Agora faremos a parte visual do dinamica que aparecera na pagina WEB, faremos via JS

const visualizacaoWEB = (situacao) => 
    
    // A logica da visualizacao WEB é simples, primeiro criamos linhas como máximo de tentativas que temos, ou seja, 6. Depois, criamos colunas com o maximo de letras do nosso termo. O map vai iterar nessas listas de modo funcional!

    // por fim, o join tem a funcao de juntar todo uma uma unica string, formando a palavra visualizada
    `
  <div class="grid">
    ${Array.from({ length: situacao.chances }).map((_, row) => `
      ${Array.from({ length: situacao.palavra.length }).map((_, col) => {
        const tentativa = situacao.tentativas[row];
        const cell = tentativa ? tentativa[col] : { letra: "", status: "" };
        return `<div class="cell ${cell.status}">${cell.letra}</div>`;
      }).join("")}
    `).join("")}
  </div>
  ${venceu(situacao) || perdeu(situacao) ? `
    <p class="mensagem">
      ${venceu(situacao) ? "🎉 Você venceu!" : `💀 Você perdeu! A palavra era: ${situacao.palavra}`}
    </p>
    <button data-action="reiniciar">🔄 Reiniciar</button>
  ` : `
    <input id="entrada" maxlength="${situacao.palavra.length}" placeholder="Digite a palavra">
    <button data-action="tentar">Tentar</button>
  `}
`;

// A segunda metade do codigo de visualizacao é resposavel pelas mensagens de vitória ou derrota, inclusive os botoes de reinicar e tentar



// Visando a dinamicidade do jogo, usamos uma funcão natural não pura, para misturar as palavras e ela não ficar de forma estática
const palavras = ["TERMO", "CRATO", "PLENA", "GRATO"];
const palavraEscolhida = palavras[Math.floor(Math.random() * palavras.length)];


// Vamos criar os botões que chamam as funções
const atualizarSituacao = (situacao, acao) => {

    //Botão tentar, chama a função tentarTermo

  if (acao.type === "tentar") {
    return tentarPalavra(situacao, acao.payload);

  }

  //Botão reiniciar, reinicia o jogo.
  if (acao.type === "reiniciar") {
    return InicializarJogo(palavraEscolhida); // Sempre retorna a palavra fixa
  }
  return situacao;
};



//Agora vamos implementar os codigos auxiliares criados.
const app = (situacao) => {
  document.getElementById("app").innerHTML = visualizacaoWEB(situacao);


//Acionar o addEventListener para os clicks nos botões tentar e reiniciar serem funcionais
  document.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const novaAcao = btn.dataset.action === "tentar"
        ? { type: "tentar", payload: document.getElementById("entrada").value }
        : { type: "reiniciar" };
      app(updateState(situacao, novaAcao));
    });
  });
};

// ---------------- Início ----------------
app(InicializarJogo(palavraEscolhida));

