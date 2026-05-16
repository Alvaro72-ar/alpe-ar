function initGraficosModule() {
  if (window.graficosModuleInitialized) return;
  
  if (typeof Chart === 'undefined') {
    console.error("Chart.js não foi carregado. Adicione o script ao seu HTML.");
    const canvas = document.getElementById('graficoVendas');
    if(canvas) canvas.parentElement.innerHTML = "<p style='color: var(--rose);'>Erro: Biblioteca de gráficos (Chart.js) não encontrada.</p>";
    return;
  }

  const ctx = document.getElementById('graficoVendas')?.getContext('2d');
  if (!ctx) return;

  const data = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
    datasets: [{
      label: 'Vendas (R$)',
      data: [12000, 15000, 14000, 18000, 20000, 22000, 21000],
      backgroundColor: 'rgba(61, 227, 201, 0.2)',
      borderColor: 'rgba(61, 227, 201, 1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 8,
      pointBackgroundColor: 'rgba(61, 227, 201, 1)',
    }]
  };

  const config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            color: 'rgba(255,255,255,0.7)',
            callback: function(value) {
              return 'R$ ' + (value / 1000) + 'k';
            }
          },
          grid: {
            color: 'rgba(255,255,255,0.1)'
          }
        },
        x: {
          ticks: {
            color: 'rgba(255,255,255,0.7)'
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#0B1220',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(61, 227, 201, 1)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
            }
          }
        }
      }
    }
  };

  if (window.myChart instanceof Chart) {
    window.myChart.destroy();
  }
  
  window.myChart = new Chart(ctx, config);
  window.graficosModuleInitialized = true;
}