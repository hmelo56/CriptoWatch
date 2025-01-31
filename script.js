async function fetchCryptoData() {
  // Faz a chamada para a API da CoinGecko para obter as criptomoedas
  const response = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&order=market_cap_desc"
  )
  const data = await response.json()
  return data
}

function createCryptoCard(crypto) {
  // Cria o card de cada criptomoeda com o gráfico de preço
  const container = document.getElementById("cryptoContainer")

  // Cria um div para cada criptomoeda

  const variationClass =
    crypto.price_change_percentage_24h >= 0 ? "positive" : "negative"

  const athDate = formatDateTime(crypto.ath_date)

  const card = document.createElement("div")
  card.classList.add("crypto-card")
  card.innerHTML = `
        <h4>${crypto.market_cap_rank}</h4>
        <img src="${crypto.image}" alt="${crypto.name}">
        <h2>${crypto.name} (${crypto.symbol.toUpperCase()})</h2>
        <p>ID: ${crypto.id}</p>
        <p>Preço Atual: R$ ${crypto.current_price.toLocaleString()}</p>
        <p class="variation ${variationClass}">24h: ${crypto.price_change_percentage_24h.toFixed(
    2
  )}%</p>
        <p>Recorde: R$ ${crypto.ath.toLocaleString()}</p>
        <p>Data: ${athDate}</p>
        <canvas id="${crypto.id}Chart" width="20" height="20"></canvas>
    `
  container.appendChild(card)

  // Configura o gráfico para essa criptomoeda
  createCryptoChart(crypto.id)
}

// Função para formatar a data e hora
function formatDateTime(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

async function createCryptoChart(cryptoId) {
  // Faz uma nova chamada para obter os preços históricos para o gráfico
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=brl&days=7`
  )
  const data = await response.json()

  // Processa os dados para o gráfico
  const labels = data.prices.map((price) =>
    new Date(price[0]).toLocaleTimeString()
  )
  const prices = data.prices.map((price) => price[1])

  // Cria o gráfico usando Chart.js
  const ctx = document.getElementById(`${cryptoId}Chart`).getContext("3d")
  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Preço em BRL",
          data: prices,
          borderColor: "#4CAF50",
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { maxTicksLimit: 10 },
        },
        y: {
          beginAtZero: false,
        },
      },
    },
  })
}

async function init() {
  const cryptos = await fetchCryptoData()
  cryptos.forEach(createCryptoCard)
}

init() // Inicializa a página carregando os dados e criando os gráficos
