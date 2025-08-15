import { Telegraf, Context } from 'telegraf';
import * as dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Interface para estender o contexto se necessário
interface BotContext extends Context {
  // Adicione propriedades customizadas aqui se precisar
}

// Verifica se o token foi fornecido
const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  console.error('❌ Token do bot não encontrado! Verifique o arquivo .env');
  process.exit(1);
}

// Cria a instância do bot
const bot = new Telegraf<BotContext>(botToken);

// Middleware para log de mensagens (opcional)
bot.use((ctx, next) => {
  const user = ctx.from;
  const chat = ctx.chat;
  console.log(`📝 Mensagem recebida de ${user?.username || user?.first_name} (ID: ${user?.id}) no chat ${chat?.id}`);
  return next();
});

// Comando /start
bot.start(async (ctx) => {
  const user = ctx.from;
  const welcomeMessage = `
🎉 *Olá, ${user.first_name}!*

Bem-vindo ao bot! 🤖

*Comandos disponíveis:*
• /start - Inicia o bot
• /status - Verifica o status do bot

Desenvolvido com ❤️ usando Node.js 22 + TypeScript
  `;
  
  try {
    await ctx.replyWithMarkdown(welcomeMessage);
    console.log(`✅ Comando /start executado para ${user.username || user.first_name}`);
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem de boas-vindas:', error);
  }
});

// Comando /status
bot.command('status', async (ctx) => {
  const uptime = process.uptime();
  const uptimeHours = Math.floor(uptime / 3600);
  const uptimeMinutes = Math.floor((uptime % 3600) / 60);
  const uptimeSeconds = Math.floor(uptime % 60);
  
  const memoryUsage = process.memoryUsage();
  const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  
  const statusMessage = `
🤖 *Status do Bot*

✅ *Status:* Online e funcionando
⏰ *Uptime:* ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s
🧠 *Memória:* ${memoryMB}MB
🔧 *Node.js:* ${process.version}
📦 *Ambiente:* ${process.env.NODE_ENV || 'development'}
📅 *Data/Hora:* ${new Date().toLocaleString('pt-BR')}

Tudo funcionando perfeitamente! 🚀
  `;
  
  try {
    await ctx.replyWithMarkdown(statusMessage);
    console.log(`📊 Status solicitado por ${ctx.from.username || ctx.from.first_name}`);
  } catch (error) {
    console.error('❌ Erro ao enviar status:', error);
  }
});

// Tratamento de comandos não reconhecidos
bot.on('text', async (ctx) => {
  const message = ctx.message.text;
  
  // Ignora se for um comando conhecido
  if (message.startsWith('/start') || message.startsWith('/status')) {
    return;
  }
  
  // Responde para mensagens que não são comandos válidos
  if (message.startsWith('/')) {
    await ctx.reply('❓ Comando não reconhecido. Use /start para ver os comandos disponíveis.');
    return;
  }
  
  // Resposta amigável para mensagens normais
  await ctx.reply('👋 Olá! Sou um bot simples. Use /start para ver os comandos disponíveis!');
});

// Tratamento de erros
bot.catch((err, ctx) => {
  console.error('❌ Erro no bot:', err);
  console.error('Contexto:', ctx.update);
});

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, parando o bot...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, parando o bot...');
  bot.stop('SIGTERM');
});

// Inicia o bot
async function startBot() {
  try {
    console.log('🚀 Iniciando bot do Telegram...');
    
    // Obtém informações do bot
    const botInfo = await bot.telegram.getMe();
    console.log(`✅ Bot conectado: @${botInfo.username} (${botInfo.first_name})`);
    
    // Inicia o polling
    await bot.launch();
    console.log('🟢 Bot está rodando! Pressione Ctrl+C para parar.');
    
  } catch (error) {
    console.error('❌ Erro ao iniciar o bot:', error);
    process.exit(1);
  }
}

// Inicia o bot
startBot();