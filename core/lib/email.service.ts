/**
 * Email Service using Mailsend
 * 
 * Handles all email sending throughout the application:
 * - Welcome emails
 * - Email verification
 * - Password reset
 * - Invitation emails
 * - Tenant approval notifications
 * - System notifications
 */

export interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
    replyTo?: string;
}

export interface WelcomeEmailData {
    name: string;
    email: string;
    loginUrl: string;
}

export interface VerificationEmailData {
    name: string;
    verificationUrl: string;
    expiresIn?: string;
}

export interface InvitationEmailData {
    inviteeName: string;
    inviterName: string;
    organizationName: string;
    role: string;
    invitationUrl: string;
    expiresAt: Date;
}

export interface TenantApprovalEmailData {
    tenantName: string;
    organizationName: string;
    subscriptionTier: string;
    loginUrl: string;
}

export interface TenantRejectionEmailData {
    tenantName: string;
    organizationName: string;
    reason: string;
    supportEmail: string;
}

export interface PasswordResetEmailData {
    name: string;
    resetUrl: string;
    expiresIn?: string;
}

class EmailService {
    private apiKey: string;
    private domain: string;
    private sender: string;
    private apiUrl = 'https://api.mailersend.com/v1/email';

    constructor() {
        this.apiKey = process.env.MAILSEND_TOKEN || '';
        this.domain = process.env.MAILSEND_DOMAIN || '';
        this.sender = `noreply@${this.domain}`;

        if (!this.apiKey || !this.domain) {
            console.warn('⚠️ MAILSEND_TOKEN or MAILSEND_DOMAIN not set. Email sending will fail.');
        }
    }

    /**
     * Send a raw email
     */
    async send(options: EmailOptions): Promise<boolean> {
        if (!this.apiKey || !this.domain) {
            console.warn('⚠️ Email service not configured. Email would be sent to:', options.to);
            console.log('📧 Email subject:', options.subject);
            if (process.env.NODE_ENV === 'development') {
                console.log('📝 Email preview (development mode):');
                console.log('-----------------------------------');
                console.log('To:', options.to);
                console.log('Subject:', options.subject);
                console.log('Text:', options.text || 'N/A');
                console.log('-----------------------------------');
            }
            return false;
        }

        try {
            const toRecipients = Array.isArray(options.to) 
                ? options.to.map(email => ({ email }))
                : [{ email: options.to }];

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    from: {
                        email: options.from || this.sender,
                        name: 'Multi-Tenant PM SaaS'
                    },
                    to: toRecipients,
                    subject: options.subject,
                    html: options.html,
                    text: options.text || options.subject,
                    reply_to: options.replyTo ? { email: options.replyTo } : undefined,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('Email sending failed:', error);
                return false;
            }

            console.log('✅ Email sent successfully to:', options.to);
            return true;
        } catch (error) {
            console.error('⚠️ Error sending email:', error instanceof Error ? error.message : error);
            return false;
        }
    }

    /**
     * Send welcome email to new user
     */
    async sendWelcomeEmail(to: string, data: WelcomeEmailData): Promise<boolean> {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our Platform</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Welcome to Our Platform! 🎉</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Hi <strong>${data.name}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Thank you for signing up! We're excited to have you on board.
                            </p>
                            
                            <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Your account has been created with the email: <strong>${data.email}</strong>
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 0 0 30px;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                        <a href="${data.loginUrl}" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                                            Get Started
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 10px; color: #666666; font-size: 14px; line-height: 1.6;">
                                If you didn't create this account, please ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; color: #6c757d; font-size: 12px; line-height: 1.6; text-align: center;">
                                © ${new Date().getFullYear()} Multi-Tenant PM SaaS. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        return this.send({
            to,
            subject: 'Welcome to Our Platform! 🎉',
            html,
            text: `Hi ${data.name},\n\nThank you for signing up! Your account has been created with the email: ${data.email}\n\nGet started: ${data.loginUrl}`,
        });
    }

    /**
     * Send email verification email
     */
    async sendVerificationEmail(to: string, data: VerificationEmailData): Promise<boolean> {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Verify Your Email Address ✉️</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Hi <strong>${data.name}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Please verify your email address to complete your registration and access all features.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 0 0 30px;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                        <a href="${data.verificationUrl}" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0 0 30px; color: #667eea; font-size: 14px; word-break: break-all;">
                                ${data.verificationUrl}
                            </p>
                            
                            ${data.expiresIn ? `
                            <p style="margin: 0 0 20px; color: #dc3545; font-size: 14px; line-height: 1.6;">
                                ⏰ This verification link will expire in <strong>${data.expiresIn}</strong>.
                            </p>
                            ` : ''}
                            
                            <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                If you didn't create this account, please ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; color: #6c757d; font-size: 12px; line-height: 1.6; text-align: center;">
                                © ${new Date().getFullYear()} Multi-Tenant PM SaaS. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        return this.send({
            to,
            subject: 'Verify Your Email Address',
            html,
            text: `Hi ${data.name},\n\nPlease verify your email address: ${data.verificationUrl}\n\n${data.expiresIn ? `This link expires in ${data.expiresIn}.` : ''}`,
        });
    }

    /**
     * Send employee invitation email
     */
    async sendInvitationEmail(to: string, data: InvitationEmailData): Promise<boolean> {
        const expiryDate = new Date(data.expiresAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">You're Invited! 🎊</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Hi <strong>${data.inviteeName}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                <strong>${data.inviterName}</strong> has invited you to join <strong>${data.organizationName}</strong> as a <strong>${data.role}</strong>.
                            </p>
                            
                            <table role="presentation" style="margin: 0 0 30px; width: 100%; background-color: #f8f9fa; border-radius: 6px; padding: 20px;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                                            <strong>Organization:</strong> ${data.organizationName}
                                        </p>
                                        <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                                            <strong>Role:</strong> ${data.role}
                                        </p>
                                        <p style="margin: 0; color: #666666; font-size: 14px;">
                                            <strong>Invited by:</strong> ${data.inviterName}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 0 0 30px;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                        <a href="${data.invitationUrl}" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                                            Accept Invitation
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0 0 30px; color: #667eea; font-size: 14px; word-break: break-all;">
                                ${data.invitationUrl}
                            </p>
                            
                            <p style="margin: 0 0 20px; color: #dc3545; font-size: 14px; line-height: 1.6;">
                                ⏰ This invitation will expire on <strong>${expiryDate}</strong>.
                            </p>
                            
                            <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                If you weren't expecting this invitation, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; color: #6c757d; font-size: 12px; line-height: 1.6; text-align: center;">
                                © ${new Date().getFullYear()} Multi-Tenant PM SaaS. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        return this.send({
            to,
            subject: `You've been invited to join ${data.organizationName}`,
            html,
            text: `Hi ${data.inviteeName},\n\n${data.inviterName} has invited you to join ${data.organizationName} as a ${data.role}.\n\nAccept invitation: ${data.invitationUrl}\n\nThis invitation expires on ${expiryDate}.`,
        });
    }

    /**
     * Send tenant approval notification
     */
    async sendTenantApprovalEmail(to: string, data: TenantApprovalEmailData): Promise<boolean> {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Approved</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Your Account is Approved! ✅</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Hi <strong>${data.tenantName}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Great news! Your account for <strong>${data.organizationName}</strong> has been approved and is now active.
                            </p>
                            
                            <table role="presentation" style="margin: 0 0 30px; width: 100%; background-color: #d4edda; border-radius: 6px; padding: 20px; border-left: 4px solid #28a745;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 10px; color: #155724; font-size: 16px; font-weight: bold;">
                                            🎉 You now have full access to all features!
                                        </p>
                                        <p style="margin: 0; color: #155724; font-size: 14px;">
                                            <strong>Subscription Plan:</strong> ${data.subscriptionTier}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                                You can now:
                            </p>
                            
                            <ul style="margin: 0 0 30px; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
                                <li>Create and manage projects</li>
                                <li>Invite team members</li>
                                <li>Access all premium features</li>
                                <li>Customize your workspace</li>
                            </ul>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 0 0 30px;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
                                        <a href="${data.loginUrl}" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                                            Go to Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                If you have any questions, feel free to reach out to our support team.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; color: #6c757d; font-size: 12px; line-height: 1.6; text-align: center;">
                                © ${new Date().getFullYear()} Multi-Tenant PM SaaS. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        return this.send({
            to,
            subject: '🎉 Your Account Has Been Approved!',
            html,
            text: `Hi ${data.tenantName},\n\nGreat news! Your account for ${data.organizationName} has been approved.\n\nSubscription Plan: ${data.subscriptionTier}\n\nLogin now: ${data.loginUrl}`,
        });
    }

    /**
     * Send tenant rejection notification
     */
    async sendTenantRejectionEmail(to: string, data: TenantRejectionEmailData): Promise<boolean> {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Review Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Account Review Update</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Hi <strong>${data.tenantName}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Thank you for your interest in joining our platform. After careful review, we're unable to approve your account for <strong>${data.organizationName}</strong> at this time.
                            </p>
                            
                            <table role="presentation" style="margin: 0 0 30px; width: 100%; background-color: #f8d7da; border-radius: 6px; padding: 20px; border-left: 4px solid #dc3545;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 10px; color: #721c24; font-size: 14px; font-weight: bold;">
                                            Reason:
                                        </p>
                                        <p style="margin: 0; color: #721c24; font-size: 14px; line-height: 1.6;">
                                            ${data.reason}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                If you believe this was a mistake or would like to discuss this decision, please contact our support team at <a href="mailto:${data.supportEmail}" style="color: #667eea;">${data.supportEmail}</a>
                            </p>
                            
                            <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                We appreciate your understanding.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; color: #6c757d; font-size: 12px; line-height: 1.6; text-align: center;">
                                © ${new Date().getFullYear()} Multi-Tenant PM SaaS. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        return this.send({
            to,
            subject: 'Account Review Update',
            html,
            text: `Hi ${data.tenantName},\n\nThank you for your interest. After review, we're unable to approve your account for ${data.organizationName}.\n\nReason: ${data.reason}\n\nContact us: ${data.supportEmail}`,
        });
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(to: string, data: PasswordResetEmailData): Promise<boolean> {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Reset Your Password 🔐</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Hi <strong>${data.name}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                                We received a request to reset your password. Click the button below to create a new password:
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 0 0 30px;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                        <a href="${data.resetUrl}" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0 0 30px; color: #667eea; font-size: 14px; word-break: break-all;">
                                ${data.resetUrl}
                            </p>
                            
                            ${data.expiresIn ? `
                            <p style="margin: 0 0 20px; color: #dc3545; font-size: 14px; line-height: 1.6;">
                                ⏰ This password reset link will expire in <strong>${data.expiresIn}</strong>.
                            </p>
                            ` : ''}
                            
                            <table role="presentation" style="margin: 0 0 20px; width: 100%; background-color: #fff3cd; border-radius: 6px; padding: 15px; border-left: 4px solid #ffc107;">
                                <tr>
                                    <td>
                                        <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                                            <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact support if you're concerned about your account security.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; color: #6c757d; font-size: 12px; line-height: 1.6; text-align: center;">
                                © ${new Date().getFullYear()} Multi-Tenant PM SaaS. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        return this.send({
            to,
            subject: 'Reset Your Password',
            html,
            text: `Hi ${data.name},\n\nWe received a request to reset your password.\n\nReset your password: ${data.resetUrl}\n\n${data.expiresIn ? `This link expires in ${data.expiresIn}.` : ''}\n\nIf you didn't request this, please ignore this email.`,
        });
    }
}

// Export singleton instance
export const emailService = new EmailService();
