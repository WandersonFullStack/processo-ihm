# 🏭 Processo Industrial - Supervisão e Controle via Web

Este projeto é uma solução de supervisão e controle para processos industriais, integrando tecnologias web modernas com automação industrial via protocolo Modbus TCP.

## ✨ Visão Geral

A aplicação permite monitorar, em tempo real, o status de sensores, atuadores e a contagem de itens em uma linha de produção, tudo através de uma interface web intuitiva.

- **Backend:** Python + Flask, comunicação com CLP via Modbus TCP.
- **Frontend:** HTML, CSS, Bootstrap e JavaScript.
- **Comunicação em tempo real** para rápida resposta a eventos críticos.

## 🚀 Funcionalidades

- Visualização do status de sensores e atuadores (item pronto, entrada, saída, esteiras, emergência, reset).
- Contador de itens processados.
- Botão de parada de emergência e reset.
- Comunicação direta com CLP industrial via Modbus TCP.

## 🛠️ Tecnologias Utilizadas

- [Python](https://www.python.org/)
- [Flask](https://flask.palletsprojects.com/)
- [pymodbus](https://pymodbus.readthedocs.io/)
- [HTML5](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
- [CSS3](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
- [Bootstrap](https://getbootstrap.com/)
- [JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)

## ⚙️ Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/WandersonFullStack/processo-ihm
cd processo-ihm
```

### 2. Instale as dependências do backend

```bash
cd server
pip install -r requirements.txt
```

### 3. Configure o endereço do CLP

No arquivo `server/app.py`, ajuste as variáveis `HOST`, `PORT` e `UNIT` conforme o seu ambiente industrial.

### 4. Execute o backend

```bash
python app.py
```

O backend estará disponível em `http://localhost:3000`.

### 5. Execute o frontend

Abra o arquivo `client/index.html` no seu navegador.

## 📊 Demonstração

![Demonstração da interface](link-para-screenshot-ou-gif)

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

---

Desenvolvido com 💡 por [Seu Nome](https://www.linkedin.com/in/seu-perfil)
