/* ============================================
   CONFIRMAÇÃO DO PEDIDO - LÓGICA DA PÁGINA
   ============================================ */

(function initConfirmacao() {
  const pedidos = window.PizzaStore?.getPedidos() ?? [];
  const pedido = pedidos[pedidos.length - 1] ?? null;

  if (pedido) {
    renderizarNumero(pedido);
    renderizarItens(pedido);
    renderizarEndereco(pedido);
    renderizarAviso(pedido);
    renderizarRastreio(pedido);

    // Botão "Confirmar Entrega"
    document
      .getElementById("btnConfirmDelivery")
      ?.addEventListener("click", () => confirmarEntrega(pedido));
  } else {
    document.querySelector(".confirmation").style.display = "none";
    document.querySelector(".tracking").style.display = "none";
    document.getElementById("emptyState").style.display = "block";
    document
      .querySelector("main")
      .classList.remove("page-wrapper--confirmation");
  }
})();

function renderizarNumero(pedido) {
  const pedidoP = document.getElementById("orderNumber");
  if (!pedidoP) return;
  pedidoP.textContent = pedido ? `Pedido ${pedido.id}` : "Pedido #—";
}

function renderizarItens(pedido) {
  const pedidoLista = document.getElementById("listItems");
  const pedidoTotal = document.getElementById("orderTotal");

  if (!pedidoLista) return;

  if (!pedido || !pedido.itens?.length) {
    pedidoLista.innerHTML = `
      <li class="confirmation__item">
        <span class="confirmation__item-name">Nenhum item encontrado</span>
      </li>`;
    return;
  }

  pedidoLista.innerHTML = pedido.itens
    .map(
      (item) => `
    <li class="confirmation__item">
      <span class="confirmation__item-name">${item.nome}</span>
      <span class="confirmation__item-quantity">x${item.quantidade}</span>
      <span class="confirmation__item-price">
        ${window.Formatters.moeda(item.valor * item.quantidade)}
      </span>
    </li>`,
    )
    .join("");

  if (pedidoTotal) {
    const total = pedido.itens.reduce(
      (soma, item) => soma + item.valor * item.quantidade,
      0,
    );
    pedidoTotal.textContent = window.Formatters.moeda(total);
  }
}

function renderizarEndereco(pedido) {
  const enderecoP = document.getElementById("deliveryAddress");

  if (!enderecoP) return;

  if (pedido?.endereco) {
    const endereco = pedido.endereco;
    enderecoP.textContent = `${endereco.rua}, ${endereco.numero} - ${endereco.bairro} - CEP: ${endereco.CEP}`;
  } else {
    enderecoP.textContent = "Endereço não informado";
  }
}

function renderizarAviso(pedido) {
  const prazoEntrega = document.getElementById("deliveryForecast");
  if (!prazoEntrega) return;

  if (pedido?.data_pedido) {
    const [data, hora] = pedido.data_pedido.split(" ");
    const [dia, mes, ano] = data.split("/");
    const [horas, minutos, segundos] = hora.split(":");

    const dataPedido = new Date(ano, mes - 1, dia, horas, minutos, segundos);
    dataPedido.setMinutes(dataPedido.getMinutes() + 35);

    prazoEntrega.textContent = dataPedido.toLocaleTimeString("pt-BR", {
      timeStyle: "short",
    });
  }
}

function confirmarEntrega(pedido) {
  const btn = document.getElementById("btnConfirmDelivery");
  if (btn) {
    btn.textContent = "Entrega Confirmada ✓";
    btn.disabled = true;
    btn.classList.add("btn--secondary");
    btn.classList.remove("btn--outline");

    pedido.status = "entregue";
    window.PizzaStore.savePedido(pedido); //Atualizar localstorage

    numeroPedidoAtual = Array.from(
      document.querySelectorAll(".tracking__number"),
    ).find((li) => li.textContent == pedido.id_pedido);
    numeroPedidoAtual.classList.add("hidden__number");

    adicionarPedidoLista(pedido.id_pedido, "delivered");
  }
}

function renderizarRastreio(pedidos) {
  if (!pedidos) {
    const orderElement = document.createElement("li");
    orderElement.classList.add("tracking__number", "tracking__number--client");
    orderElement.textContent = "11";

    const trackingList = document.querySelector(
      ".tracking__column--preparing ul",
    );
    trackingList.appendChild(orderElement);
  } else {
    pedidos.forEach((pedido) => {
      switch (pedido.status) {
        case "preparando":
          adicionarPedidoLista(pedido.id_pedido, "preparing");
          break;
        case "a caminho":
          adicionarPedidoLista(pedido.id_pedido, "underway");
          break;
        case "entregue":
          adicionarPedidoLista(pedido.id_pedido, "delivered");
          break;
        default:
          break;
      }
    });
  }
}

function adicionarPedidoLista(pedidoId, status) {
  const orderElement = document.createElement("li");
  orderElement.classList.add("tracking__number", "tracking__number--client");
  orderElement.textContent = pedidoId;

  const trackingList = document.querySelector(
    `.tracking__column--${status} ul`,
  );
  trackingList.appendChild(orderElement);
}
