import TelegramBot from 'node-telegram-bot-api';
import { logger } from '../utils/logger';

export class CommandHandler {
  private commands: Map<string, Function> = new Map();

  constructor() {
    this.setupCommands();
  }

  private setupCommands() {
    this.commands.set('start', this.handleStart.bind(this));
    this.commands.set('help', this.handleHelp.bind(this));
    this.commands.set('status', this.handleStatus.bind(this));
    this.commands.set('ping', this.handlePing.bind(this));
    this.commands.set('hora', this.handleTime.bind(this));
    this.commands.set('time', this.handleTime.bind(this));
    this.commands.set('piada', this.handleJoke.bind(this));
    this.commands.set('joke', this.handleJoke.bind(this));
    this.commands.set('sobre', this.handleAbout.bind(this));
    this.commands.set('about', this.handleAbout.bind(this));
    this.commands.set('clima', this.handleWeather.bind(this));
    this.commands.set('config', this.handleConfig.bind(this));
  }

  async handleCommand(bot: TelegramBot, msg: TelegramBot.Message) {
    try {
      const text = msg.text || '';
      const [commandWithSlash, ...args] = text.split(' ');
      const command = commandWithSlash.slice(1).toLowerCase(); // Remove '/'

      logger.info('Command received', { 
        command, 
        args, 
        userId: msg.from?.id,
        chatId: msg.chat.id 
      });

      const handler = this.commands.get(command);
      
      if (handler) {
        await handler(bot, msg, args);
      } else {
        await this.handleUnknownCommand(bot, msg, command);
      }

    } catch (error) {
      logger.error('Error handling command:', error);
      await bot.sendMessage(msg.chat.id, '❌ Erro ao executar comando. Tente novamente.');
    }
  }

  private async handleStart(bot: TelegramBot, msg: TelegramBot.Message) {
    const welcomeMessage = 
      '🤖 *Bem-vindo ao Rodrigo Lanes Bot!*\n\n' +
      '👋 Olá! Eu sou um bot inteligente criado para te ajudar.\n\n' +
      '*O que posso fazer:*\n' +
      '• Responder comandos úteis\n' +
      '• Contar piadas\n' +
      '• Informar horário\n' +
      '• Conversar contigo\n\n' +
      'Digite /help para ver todos os comandos disponíveis!';

    await bot.sendMessage(msg.chat.id, welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📋 Comandos', callback_data: 'help' },
            { text: '📊 Status', callback_data: 'status' }
          ],
          [
            { text: '😄 Piada', callback_data: 'joke' },
            { text: 'ℹ️ Sobre', callback_data: 'about' }
          ]
        ]
      }
    });
  }

  private async handleHelp(bot: TelegramBot, msg: TelegramBot.Message) {
    await this.sendHelp(bot, msg.chat.id);
  }

  async sendHelp(bot: TelegramBot, chatId: number) {
    const helpMessage = 
      '📋 *Comandos Disponíveis:*\n\n' +
      '🚀 */start* - Inicializar o bot\n' +
      '📋 */help* - Mostrar esta ajuda\n' +
      '📊 */status* - Status do bot\n' +
      '🏓 */ping* - Testar conectividade\n' +
      '🕐 */hora* - Horário atual\n' +
      '😄 */piada* - Piada aleatória\n' +
      'ℹ️ */sobre* - Sobre o bot\n' +
      '🌤️ */clima* - Informações do clima\n' +
      '⚙️ */config* - Configurações\n\n' +
      '*Dica:* Você também pode conversar comigo normalmente!';

    await bot.sendMessage(chatId, helpMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📊 Ver Status', callback_data: 'status' },
            { text: '😄 Contar Piada', callback_data: 'joke' }
          ]
        ]
      }
    });
  }

  private async handleStatus(bot: TelegramBot, msg: TelegramBot.Message) {
    // This will be called from the main bot service
    await bot.sendMessage(msg.chat.id, '📊 Obtendo status...');
  }

  async sendStatus(bot: TelegramBot, chatId: number, status: any) {
    const uptimeHours = Math.floor(status.uptime / (1000 * 60 * 60));
    const uptimeMinutes = Math.floor((status.uptime % (1000 * 60 * 60)) / (1000 * 60));

    const statusMessage = 
      '📊 *Status do Bot*\n\n' +
      `🟢 Status: ${status.active ? 'Ativo' : 'Inativo'}\n` +
      `⏰ Tempo ativo: ${uptimeHours}h ${uptimeMinutes}m\n` +
      `📨 Mensagens processadas: ${status.messagesProcessed}\n` +
      `👥 Usuários ativos: ${status.activeUsers || 0}\n` +
      `🔖 Versão: ${status.version}\n` +
      `📅 Iniciado: ${new Date(status.startTime).toLocaleString('pt-BR')}`;

    await bot.sendMessage(chatId, statusMessage, {
      parse_mode: 'Markdown'
    });
  }

  private async handlePing(bot: TelegramBot, msg: TelegramBot.Message) {
    const start = Date.now();
    const sentMessage = await bot.sendMessage(msg.chat.id, '🏓 Pong!');
    const latency = Date.now() - start;

    await bot.editMessageText(
      `🏓 Pong!\n⚡ Latência: ${latency}ms`,
      {
        chat_id: msg.chat.id,
        message_id: sentMessage.message_id
      }
    );
  }

  private async handleTime(bot: TelegramBot, msg: TelegramBot.Message) {
    const now = new Date();
    const timeString = now.toLocaleString('pt-BR', { 
      timeZone: 'America/Sao_Paulo',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    await bot.sendMessage(msg.chat.id, `🕐 *Horário atual:*\n${timeString}`, {
      parse_mode: 'Markdown'
    });
  }

  private async handleJoke(bot: TelegramBot, msg: TelegramBot.Message) {
    await this.sendJoke(bot, msg.chat.id);
  }

  async sendJoke(bot: TelegramBot, chatId: number) {
    const jokes = [
      'Por que os pássaros voam para o sul no inverno? 🐦\nPorque é longe demais para ir andando! 😂',
      'O que a impressora falou para a outra impressora? 🖨️\nEssa folha é sua ou é impressão minha? 😄',
      'Por que o livro de matemática estava triste? 📚\nPorque tinha muitos problemas! 😅',
      'O que o pato disse para a pata? 🦆\nVem quá! 😂',
      'Por que o café foi à polícia? ☕\nPorque foi muído! 😄',
      'O que o oceano falou para a praia? 🌊\nNada, ele apenas acenou! 👋',
      'Por que o computador foi ao médico? 💻\nPorque estava com vírus! 🦠'
    ];

    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    
    await bot.sendMessage(chatId, `😄 *Piada do dia:*\n\n${randomJoke}`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Outra piada', callback_data: 'joke' }]
        ]
      }
    });
  }

  private async handleAbout(bot: TelegramBot, msg: TelegramBot.Message) {
    await this.sendAbout(bot, msg.chat.id);
  }

  async sendAbout(bot: TelegramBot, chatId: number) {
    const aboutMessage = 
      'ℹ️ *Sobre o Rodrigo Lanes Bot*\n\n' +
      '🤖 import { Router } from 'express';
import { BotService } from '../services/BotService';
import { logger } from '../utils/logger';

export const botRouter = Router();
const botService = new BotService();

// Bot status endpoint
botRouter.get('/status', (req, res) => {
  try {
    const status = botService.getStatus();
    res.json(status);
  } catch (error) {
    logger.error('Error getting bot status:', error);
    res.status(500).json({ error: 'Failed to get bot status' });
  }
});

// Process message endpoint
botRouter.post('/message', async (req, res) => {
  try {
    const { message, userId, channelId } = req.body;

    if (!message || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: message and userId' 
      });
    }

    const response = await botService.processMessage({
      message,
      userId,
      channelId: channelId || 'default'
    });

    logger.info('Message processed', { 
      userId, 
      channelId, 
      messageLength: message.length 
    });

    res.json(response);
  } catch (error) {
    logger.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Bot commands endpoint
botRouter.get('/commands', (req, res) => {
  try {
    const commands = botService.getAvailableCommands();
    res.json({ commands });
  } catch (error) {
    logger.error('Error getting commands:', error);
    res.status(500).json({ error: 'Failed to get commands' });
  }
});

// Execute specific command
botRouter.post('/commands/:command', async (req, res) => {
  try {
    const { command } = req.params;
    const { userId, args } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        error: 'Missing required field: userId' 
      });
    }

    const response = await botService.executeCommand(command, {
      userId,
      args: args || []
    });

    logger.info('Command executed', { command, userId });
    res.json(response);
  } catch (error) {
    logger.error('Error executing command:', error);
    res.status(500).json({ error: 'Failed to execute command' });
  }
});