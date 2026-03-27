const nodemailer = require('nodemailer');

let transporter = null;

const getMailConfig = () => {
    const emailUser = (process.env.EMAIL_USER || '').trim();
    // Gmail app passwords are often copied with spaces; normalize to raw token.
        const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');
    return { emailUser, emailPass };
};

const getTransporter = () => {
    if (!transporter) {
        const { emailUser, emailPass } = getMailConfig();
        console.log('Attempting to create transporter with user:', emailUser); // Added for debugging
        if (!emailUser || !emailPass) {
            console.error('EMAIL_USER or EMAIL_PASS not set in environment variables');
            return null;
        }
        transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: emailUser,
                pass: emailPass,
            },
        });
    }
    return transporter;
};

const sendOtpEmail = async (to, otp) => {
    const transport = getTransporter();
    const { emailUser } = getMailConfig();
    
    // Demo mode: if email not configured, just log OTP to console
    if (!transport || !emailUser) {
        console.log('\n' + '='.repeat(60));
        console.log('📧 [DEMO MODE] Password Reset OTP');
        console.log('='.repeat(60));
        console.log(`Email: ${to}`);
        console.log(`OTP Code: ${otp}`);
        console.log('Expires in: 10 minutes');
        console.log('='.repeat(60) + '\n');
        return true;
    }

    const mailOptions = {
        from: `"AI Clinic Pro" <${emailUser}>`,
        to,
        subject: 'Password Reset OTP - AI Clinic Pro',
        html: `
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
        `,
    };

    try {
        const info = await transport.sendMail(mailOptions);
        if (!info.accepted || !info.accepted.length) {
            console.error('SMTP did not accept recipient address:', to); // Added for debugging
            throw new Error('SMTP did not accept recipient address');
        }
        console.log('OTP Email sent successfully to:', to); // Added for debugging
        return true;
    } catch (error) {
        console.error('Full email send error:', error); // Modified for detailed error
        throw new Error('Failed to send OTP email. Please verify SMTP credentials and try again.');
    }
};

module.exports = { sendOtpEmail };
