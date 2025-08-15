import TelegramBot from 'node-telegram-bot-api';
import { CronJob } from 'cron';
import { logger } from '../utils/logger';
import { CommandHandler } from './CommandHandler';
import { UserSession } from './UserSession';

export class TelegramBotService {
  private bot: TelegramBot;
  private commandHandler: CommandHandler;
  private userSession: UserSession;
  private cronJobs: CronJob[] = [];
  private isActive: boolean = false;
  private startTime: Date = new Date();
  private messageCount: number = 0;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is required');
    }

    this.bot = new TelegramBot(token, { polling: true });
    this.commandHandler = new CommandHandler();
    this.userSession = new UserSession();
    
    this.setupEventHandlers();
    this.setupCronJobs();
    
    logger.info('Telegram Bot Service initialized');
  }

  private setupEventHandlers() {
    // Handle text messages
    this.bot.on('message', async (msg) => {
      if (msg.text) {
        await this.handleMessage(msg);
      }
    });

    // Handle callback queries (inline keyboard buttons)
    this.bot.on('callback_query', async (query) => {
      await this.handleCallbackQuery(query);
    });

    // Handle bot commands
    this.bot.on('polling_error', (error) => {
      logger.error('Telegram polling error:', error);
    });

    // Bot started
    this.bot.getMe().then((botInfo) => {
      logger.info(`Bot connected: @${botInfo.username}`);
      this.isActive = true;
    });
  }

  private async handleMessage(msg: TelegramBot.Message) {
    try {
      this.messageCount++;
      const chatId = msg.chat.id;
      const userId = msg.from?.id;
      const text = msg.text || '';

      logger.info('Message received', {
        chatId,
        userId,
        username: msg.from?.username,
        messageLength: text.length,
        isCommand: text.startsWith('/')
      });

      // Update user session
      if (userId) {
        this.userSession.updateActivity(userId, msg.from);
      }

      // Handle commands
      if (text.startsWith('/')) {
        await this.commandHandler.handleCommand(this.bot, msg);
        return;
      }

      // Handle regular messages
      await this.handleRegularMessage(msg);

    } catch (error) {
      logger.error('Error handling message:', error);
      await this.bot.sendMessage(msg.chat.id, '❌ Ocorreu um erro interno. Tente novamente.');
    }
  }

  private async handleRegularMessage(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const text = msg.text?.toLowerCase() || '';

    // Simple response patterns
    if (text.includes('olá') || text.includes('oi') || text.includes('hello')) {
      await this.bot.sendMessage(chatId, '👋 Olá! Como posso te ajudar hoje?', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🤖 Comandos', callback_data: 'help' },
              { text: '📊 Status', callback_data: 'status' }
            ]
          ]
        }
      });
      return;
    }

    if (text.includes('ajuda') || text.includes('help')) {
      await this.commandHandler.sendHelp(this.bot, chatId);
      return;
    }

    if (text.includes('como você está') || text.includes('tudo bem')) {
      await this.bot.sendMessage(chatId, '😊 Estou funcionando perfeitamente! Obrigado por perguntar. E você, como está?');
      return;
    }

    if (text.includes('hora') || text.includes('horário')) {
      const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      await this.bot.sendMessage(chatId, `🕐 Horário atual: ${now}`);
      return;
    }

    // Default response with suggestions
    await this.bot.sendMessage(chatId, 
      '🤔 Recebi sua mensagem! Ainda estou aprendendo a conversar melhor.\n\n' +
      'Você pode:\n' +
      '• Usar /help para ver comandos\n' +
      '• Perguntar sobre horário\n' +
      '• Dizer olá para mim\n' +
      '• Usar /piada para uma piada',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📋 Ver Comandos', callback_data: 'help' }]
          ]
        }
      }
    );
  }

  private async handleCallbackQuery(query: TelegramBot.CallbackQuery) {
    try {
      const chatId = query.message?.chat.id;
      const data = query.data;

      if (!chatId || !data) return;

      logger.info('Callback query received', { chatId, data });

      // Answer the callback query
      await this.bot.answerCallbackQuery(query.id);

      // Handle different callback data
      switch (data) {
        case 'help':
          await this.commandHandler.sendHelp(this.bot, chatId);
          break;

        case 'status':
          await this.commandHandler.sendStatus(this.bot, chatId, this.getStatus());
          break;

        case 'joke':
          await this.commandHandler.sendJoke(this.bot, chatId);
          break;

        case 'about':
          await this.commandHandler.sendAbout(this.bot, chatId);
          break;

        default:
          await this.bot.sendMessage(chatId, '❌ Comando não reconhecido.');
      }

    } catch (error) {
      logger.error('Error handling callback query:', error);
    }
  }

  private setupCronJobs() {
    // Daily status report (optional)
    if (process.env.ADMIN_CHAT_ID) {
      const dailyReport = new CronJob('0 9 * * *', async () => {
        try {
          const status = this.getStatus();
          const adminChatId = process.env.ADMIN_CHAT_ID;
          
          if (adminChatId) {
            await this.bot.sendMessage(
              parseInt(adminChatId),
              `📊 *Relatório Diário*\n\n` +
              `• Mensagens processadas: ${status.messagesProcessed}\n` +
              `• Tempo ativo: ${Math.floor(status.uptime / (1000 * 60 * 60))}h\n` +
              `• Usuários ativos: ${this.userSession.getActiveUsersCount()}\n` +
              `• Status: ${status.active ? '✅ Ativo' : '❌ Inativo'}`,
              { parse_mode: 'Markdown' }
            );
          }
        } catch (error) {
          logger.error('Error sending daily report:', error);
        }
      }, null, true, 'America/Sao_Paulo');

      this.cronJobs.push(dailyReport);
      logger.info('Daily report cron job scheduled');
    }
  }

  getStatus() {
    return {
      active: this.isActive,
      startTime: this.startTime.toISOString(),
      uptime: Date.now() - this.startTime.getTime(),
      messagesProcessed: this.messageCount,
      activeUsers: this.userSession.getActiveUsersCount(),
      version: '2.0.0'
    };
  }

  stop() {
    logger.info('Stopping Telegram Bot...');
    this.isActive = false;
    
    // Stop cron jobs
    this.cronJobs.forEach(job => job.stop());
    
    // Stop polling
    this.bot.stopPolling();
    
    logger.info('Telegram Bot stopped');
  }

  // Public methods for external API access
  async sendMessage(chatId: number, text: string, options?: TelegramBot.SendMessageOptions) {
    return this.bot.sendMessage(chatId, text, options);
  }

  getBotInfo() {
    return this.bot.getMe();
  }
}