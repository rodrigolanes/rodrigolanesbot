# Bot do Telegram - Node.js 22 + TypeScript

Um bot simples do Telegram desenvolvido com Node.js 22 e TypeScript, usando a biblioteca Telegraf.

## 🚀 Funcionalidades

- ✅ Comando `/start` - Mensagem de boas-vindas
- ✅ Comando `/status` - Informações sobre o status do bot
- ✅ Tratamento de erros
- ✅ Logs estruturados
- ✅ Graceful shutdown

## 📋 Pré-requisitos

- Node.js 22.x ou superior
- NPM ou Yarn
- Token do bot do Telegram (obtido através do @BotFather)

## 🛠️ Instalação

1. **Clone o repositório e instale as dependências:**

```bash
npm install
```

2. **Configure as variáveis de ambiente:**

```bash
cp .env.example .env
```

3. **Edite o arquivo `.env` e adicione seu token do bot:**

```env
BOT_TOKEN=seu_token_aqui
NODE_ENV=development
```

## 📱 Como obter o token do bot

1. Abra o Telegram e procure por `@BotFather`
2. Digite `/newbot` e siga as instruções
3. Escolha um nome e username para seu bot
4. O BotFather fornecerá um token - copie este token para o arquivo `.env`

## 🏃‍♂️ Executando

### Modo desenvolvimento (com hot reload):

```bash
npm run dev
```

### Modo produção:

```bash
npm run build
npm start
```

## 📚 Comandos disponíveis

| Comando | Descrição |
|---------|-----------|
| `/start` | Inicia o bot e mostra mensagem de boas-vindas |
| `/status` | Exibe informações sobre o status do bot (uptime, memória, etc.) |

## 🏗️ Estrutura do projeto

```
├── src/
│   └── index.ts          # Código principal do bot
├── dist/                 # Arquivos compilados (gerado após build)
├── .env.example          # Exemplo de variáveis de ambiente
├── .gitignore           # Arquivos ignorados pelo Git
├── package.json         # Dependências e scripts
├── tsconfig.json        # Configuração do TypeScript
└── README.md           # Este arquivo
```

## 📝 Scripts NPM

- `npm run dev` - Executa em modo desenvolvimento com hot reload
- `npm run build` - Compila o TypeScript para JavaScript
- `npm start` - Executa o bot compilado
- `npm run clean` - Remove a pasta `dist/`

## 🔧 Tecnologias utilizadas

- **Node.js 22** - Runtime JavaScript
- **TypeScript** - Linguagem de programação
- **Telegraf** - Framework para bots do Telegram
- **dotenv** - Gerenciamento de variáveis de ambiente
- **tsx** - Executor TypeScript para desenvolvimento

## 📈 Próximos passos

Algumas ideias para expandir o bot:

- [ ] Adicionar banco de dados (SQLite, PostgreSQL)
- [ ] Implementar mais comandos
- [ ] Adicionar middleware de autenticação
- [ ] Implementar webhook ao invés de polling
- [ ] Adicionar testes unitários
- [ ] Dockerizar a aplicação
- [ ] Adicionar logging estruturado com Winston

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## ❓ Suporte

Se encontrar algum problema ou tiver dúvidas:

1. Verifique se o token do bot está correto no arquivo `.env`
2. Certifique-se de que está usando Node.js 22 ou superior
3. Verifique os logs do console para mensagens de erro
4. Abra uma issue neste repositório

---

Desenvolvido com ❤️ usando Node.js 22 + TypeScript