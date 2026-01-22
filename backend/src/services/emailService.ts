import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import prisma from './db.js';

interface SmtpConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    fromName: string;
}

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

class EmailService {
    private transporter: Transporter | null = null;
    private smtpConfig: SmtpConfig | null = null;

    /**
     * Load SMTP configuration from database settings
     */
    private async loadSmtpConfig(): Promise<SmtpConfig | null> {
        try {
            const settings = await prisma.settings.findMany({
                where: {
                    key: {
                        in: ['notifications']
                    }
                }
            });

            const notificationsSettings = settings.find(s => s.key === 'notifications');
            if (!notificationsSettings || !notificationsSettings.value) {
                console.warn('SMTP settings not found in database');
                return null;
            }

            const notifications = notificationsSettings.value as any;

            // Validate required SMTP fields
            if (!notifications.smtpHost || !notifications.smtpUsername || !notifications.smtpPassword) {
                console.warn('Incomplete SMTP configuration');
                return null;
            }

            return {
                host: notifications.smtpHost,
                port: notifications.smtpPort || 587,
                username: notifications.smtpUsername,
                password: notifications.smtpPassword,
                fromName: notifications.fromName || 'AgriMart'
            };
        } catch (error) {
            console.error('Failed to load SMTP config:', error);
            return null;
        }
    }

    /**
     * Initialize or refresh the email transporter with current settings
     */
    private async initializeTransporter(): Promise<boolean> {
        const config = await this.loadSmtpConfig();

        if (!config) {
            console.error('Cannot initialize email transporter: missing SMTP configuration');
            return false;
        }

        this.smtpConfig = config;

        try {
            this.transporter = nodemailer.createTransport({
                host: config.host,
                port: config.port,
                secure: config.port === 465, // true for 465, false for other ports
                auth: {
                    user: config.username,
                    pass: config.password,
                },
            });

            // Verify connection
            await this.transporter.verify();
            console.log('✅ Email transporter initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize email transporter:', error);
            this.transporter = null;
            return false;
        }
    }

    /**
     * Send an email
     */
    async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            // Initialize transporter if not ready
            if (!this.transporter) {
                const initialized = await this.initializeTransporter();
                if (!initialized) {
                    console.error('Email not sent: transporter initialization failed');
                    return false;
                }
            }

            if (!this.transporter || !this.smtpConfig) {
                console.error('Email not sent: transporter not available');
                return false;
            }

            const mailOptions = {
                from: `"${this.smtpConfig.fromName}" <${this.smtpConfig.username}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for plain text fallback
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ Failed to send email:', error);
            // Try to reinitialize transporter on next send
            this.transporter = null;
            return false;
        }
    }

    /**
     * Check if email notifications are enabled for a specific event
     */
    async isNotificationEnabled(eventKey: string): Promise<boolean> {
        try {
            const settings = await prisma.settings.findUnique({
                where: { key: 'notifications' }
            });

            if (!settings || !settings.value) {
                return false;
            }

            const notifications = settings.value as any;
            return notifications[eventKey] === true;
        } catch (error) {
            console.error('Failed to check notification settings:', error);
            return false;
        }
    }

    /**
     * Refresh transporter (useful after settings update)
     */
    async refresh(): Promise<void> {
        this.transporter = null;
        await this.initializeTransporter();
    }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
