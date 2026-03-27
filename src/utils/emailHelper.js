const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (to, otp) => {
    const apiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || 'ai-clinic-pro@kamran.dev';

    if (!apiKey) {
        console.error('RESEND_API_KEY is not set in environment variables.');
        // Fallback to demo mode if Resend is not configured
        console.log('\n' + '='.repeat(60));
        console.log('📧 [DEMO MODE] Password Reset OTP');
        console.log('='.repeat(60));
        console.log(`Email: ${to}`);
        console.log(`OTP Code: ${otp}`);
        console.log('Expires in: 10 minutes');
        console.log('='.repeat(60) + '\n');
        return true;
    }

    const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; font-weight: bold; font-size: 18px; padding: 12px 20px; border-radius: 12px;">
                    AI Clinic Pro
                </div>
            </div>
            <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <h2 style="color: #1e293b; margin: 0 0 16px 0;">Password Reset</h2>
                <p style="color: #64748b; margin: 0 0 24px 0;">Use the OTP below to reset your password. This code expires in 10 minutes.</p>
                <div style="text-align: center; margin: 24px 0;">
                    <span style="display: inline-block; background: #f1f5f9; color: #4f46e5; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px 32px; border-radius: 8px; border: 2px dashed #4f46e5;">
                        ${otp}
                    </span>
                </div>
                <p style="color: #94a3b8; font-size: 13px; margin: 24px 0 0 0;">If you didn't request this, please ignore this email.</p>
            </div>
        </div>
    `;

    try {
        const { data, error } = await resend.emails.send({
            from: `"AI Clinic Pro" <${emailFrom}>`,
            to: [to],
            subject: 'Password Reset OTP - AI Clinic Pro',
            html: htmlBody,
        });

        if (error) {
            console.error('Resend API Error:', error);
            throw new Error('Failed to send OTP email via Resend.');
        }

        console.log('OTP Email sent successfully via Resend:', data);
        return true;
    } catch (error) {
        console.error('Full email send error:', error);
        throw new Error('Failed to send OTP email. Please verify your Resend configuration and try again.');
    }
};

module.exports = { sendOtpEmail };
