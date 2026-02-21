/**
 * Templates de Email - PROMA SIGMA
 * Design alinhado com a identidade visual do sistema
 * Paleta navy + accent sky-400 + glassmorphism-inspired
 * Compativel com: Outlook (novo/antigo), Hotmail, Gmail, Yahoo, Apple Mail
 */

const APP_NAME = 'PROMA SIGMA';
// Paleta de cores alinhada com o frontend (navy + sky)
const NAVY_900 = '#0a1628';
const NAVY_700 = '#1e3250';
const NAVY_600 = '#2a4060';
const ACCENT = '#38bdf8';    // sky-400 - accent color do sistema
const ACCENT_DARK = '#0284c7'; // sky-600

// Cores semanticas
const TEXT_PRIMARY = '#1e293b';
const TEXT_BODY = '#475569';
const TEXT_MUTED = '#64748b';
const TEXT_LIGHT = '#94a3b8';
const BG_BODY = '#f0f2f5';
const BG_CARD = '#ffffff';
const BG_SUBTLE = '#f1f5f9';
const BORDER_LIGHT = '#e2e8f0';

// Status colors
const COLOR_SUCCESS = '#059669';
const COLOR_WARNING = '#f59e0b';
const COLOR_ERROR = '#dc2626';
const COLOR_INFO = '#2563eb';

/**
 * Decoracao do header - linha fina accent acima do titulo
 */
const headerDecor = `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 16px auto;">
<tr>
<td style="width:40px;height:2px;background-color:${ACCENT};font-size:0;line-height:0;">&nbsp;</td>
</tr>
</table>
`;

/**
 * Gera botao bulletproof compativel com todos os clientes de email
 * Design alinhado com os botoes do sistema (navy gradient)
 */
const bulletproofButton = (url, text, bgColor = NAVY_600, textColor = '#ffffff') => `
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:52px;v-text-anchor:middle;width:240px;" arcsize="12%" strokecolor="${bgColor}" fillcolor="${bgColor}">
<w:anchorlock/>
<center style="color:${textColor};font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;font-size:15px;font-weight:bold;letter-spacing:0.5px;">
${text}
</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
<tr>
<td style="border-radius:8px;background-color:${bgColor};box-shadow:0 4px 12px rgba(10,22,40,0.18);">
<a href="${url}" target="_blank" style="display:block;padding:16px 48px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;font-size:15px;font-weight:700;color:${textColor};text-decoration:none;text-align:center;border-radius:8px;letter-spacing:0.5px;">
${text}
</a>
</td>
</tr>
</table>
<!--<![endif]-->
`;

/**
 * Layout base para todos os emails
 * Header navy gradient com accent stripe + footer navy
 */
const baseLayout = (content) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<!--[if gte mso 9]>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${APP_NAME}</title>
<!--[if mso]>
<style type="text/css">
body, table, td {font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif !important;}
</style>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
<style type="text/css">
body {
margin: 0 !important;
padding: 0 !important;
-webkit-text-size-adjust: 100% !important;
-ms-text-size-adjust: 100% !important;
}
table {
border-collapse: collapse !important;
mso-table-lspace: 0pt !important;
mso-table-rspace: 0pt !important;
}
img {
-ms-interpolation-mode: bicubic;
border: 0;
height: auto;
line-height: 100%;
outline: none;
text-decoration: none;
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important;
}
@media only screen and (max-width: 620px) {
.email-container { width: 100% !important; }
.email-content { padding: 28px 20px !important; }
.email-header-inner { padding: 28px 20px !important; }
.email-footer-inner { padding: 20px !important; }
}
</style>
</head>
<body style="margin:0;padding:0;background-color:${BG_BODY};font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;-webkit-font-smoothing:antialiased;">
<!--[if mso]>
<style type="text/css">
body, table, td, p, a, span {font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif !important;}
</style>
<![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${BG_BODY};">
<tr>
<td align="center" style="padding:32px 16px;">
<!--[if mso]>
<table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="600">
<tr>
<td>
<![endif]-->
<table role="presentation" class="email-container" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;margin:0 auto;">

<!-- Outer shadow wrapper (non-Outlook) -->
<!--[if !mso]><!-->
<tr>
<td style="border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,22,40,0.12);">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<!--<![endif]-->

<!-- Header com gradiente navy -->
<tr>
<td align="center" style="background-color:${NAVY_900};">
<!--[if gte mso 9]>
<v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;">
<v:fill type="gradient" color="${NAVY_700}" color2="${NAVY_900}" angle="135"/>
<v:textbox inset="0,0,0,0">
<![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr>
<td align="center" valign="middle" class="email-header-inner" style="padding:36px 40px 32px 40px;">

${headerDecor}

<!--[if mso]>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
<tr>
<td align="center" style="padding:0 0 4px 0;">
<![endif]-->
<h1 style="margin:0;font-size:28px;font-weight:800;letter-spacing:3px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;line-height:1.2;">
<span style="color:#ffffff;">PROMA</span>
<span style="color:${ACCENT};">&nbsp;SIGMA</span>
</h1>
<!--[if mso]>
</td>
</tr>
</table>
<![endif]-->

<p style="margin:8px 0 0 0;color:${TEXT_LIGHT};font-size:13px;letter-spacing:0.5px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
Sistema de Gestao de Contratos
</p>
</td>
</tr>
</table>
<!--[if gte mso 9]>
</v:textbox>
</v:rect>
<![endif]-->
</td>
</tr>

<!-- Accent stripe -->
<tr>
<td style="height:4px;background-color:${ACCENT};font-size:0;line-height:0;">&nbsp;</td>
</tr>

<!-- Content -->
<tr>
<td class="email-content" style="padding:40px 44px;background-color:${BG_CARD};">
${content}
</td>
</tr>

<!-- Footer accent line -->
<tr>
<td style="height:2px;background-color:${ACCENT};font-size:0;line-height:0;opacity:0.4;">&nbsp;</td>
</tr>

<!-- Footer navy -->
<tr>
<td style="background-color:${NAVY_900};">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr>
<td class="email-footer-inner" align="center" style="padding:22px 40px;">
<p style="margin:0 0 4px 0;color:${TEXT_LIGHT};font-size:11px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
Este email foi enviado automaticamente pelo sistema ${APP_NAME}.
</p>
<p style="margin:0;color:#516785;font-size:11px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
&copy; ${new Date().getFullYear()} PROMA Group &mdash; Todos os direitos reservados.
</p>
</td>
</tr>
</table>
</td>
</tr>

<!--[if !mso]><!-->
</table>
</td>
</tr>
<!--<![endif]-->

</table>
<!--[if mso]>
</td>
</tr>
</table>
<![endif]-->
</td>
</tr>
</table>
</body>
</html>
`;

/**
 * Heading com barra accent inferior
 */
const sectionHeading = (text, accentColor = NAVY_600) => `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 24px 0;">
<tr>
<td style="padding-bottom:14px;border-bottom:2px solid ${BORDER_LIGHT};">
<h2 style="margin:0;color:${TEXT_PRIMARY};font-size:21px;font-weight:700;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;line-height:1.3;">
<span style="border-bottom:3px solid ${accentColor};padding-bottom:12px;">${text}</span>
</h2>
</td>
</tr>
</table>
`;

/**
 * Saudacao padrao
 */
const greeting = (nome) => `
<p style="margin:0 0 18px 0;color:${TEXT_BODY};font-size:15px;line-height:1.7;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
Ola, <strong style="color:${TEXT_PRIMARY};">${nome}</strong>
</p>
`;

/**
 * Paragrafo padrao
 */
const paragraph = (text) => `
<p style="margin:0 0 20px 0;color:${TEXT_BODY};font-size:15px;line-height:1.7;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
${text}
</p>
`;

/**
 * Texto secundario / nota de rodape
 */
const footnote = (text) => `
<p style="margin:24px 0 0 0;color:${TEXT_MUTED};font-size:13px;line-height:1.6;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
${text}
</p>
`;

/**
 * Caixa de informacoes com borda e icone (compativel com Outlook)
 */
const infoBox = (type, content) => {
    const themes = {
        warning: { bg: '#fef9ec', border: COLOR_WARNING, text: '#78350f', icon: '&#9888;' },
        error:   { bg: '#fef2f2', border: COLOR_ERROR, text: '#991b1b', icon: '&#10006;' },
        success: { bg: '#ecfdf5', border: COLOR_SUCCESS, text: '#065f46', icon: '&#10004;' },
        info:    { bg: '#eff6ff', border: COLOR_INFO, text: '#1e40af', icon: '&#8505;' },
    };
    const t = themes[type] || themes.info;
    return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;">
<tr>
<!--[if !mso]><!-->
<td style="background-color:${t.bg};border-left:4px solid ${t.border};border-radius:0 8px 8px 0;padding:14px 18px;">
<!--<![endif]-->
<!--[if mso]>
<td style="background-color:${t.bg};border-left:4px solid ${t.border};padding:14px 18px;">
<![endif]-->
<p style="margin:0;color:${t.text};font-size:14px;line-height:1.6;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
${content}
</p>
</td>
</tr>
</table>
`;
};

/**
 * Caixa de credenciais (design navy accent)
 */
const credentialsBox = (items) => `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
<!--[if !mso]><!-->
<tr>
<td style="background-color:${BG_SUBTLE};border:1px solid ${BORDER_LIGHT};border-radius:12px;border-left:4px solid ${NAVY_600};padding:0;">
<!--<![endif]-->
<!--[if mso]>
<tr>
<td style="background-color:${BG_SUBTLE};border:1px solid ${BORDER_LIGHT};border-left:4px solid ${NAVY_600};padding:0;">
<![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr>
<td style="padding:20px 24px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
${items.map((item, i) => `
<tr>
<td style="padding:${i > 0 ? '10px' : '0'} 0 0 0;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0">
<tr>
<td style="vertical-align:top;padding-right:8px;">
<span style="color:${TEXT_MUTED};font-size:13px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">${item.label}:</span>
</td>
<td style="vertical-align:top;">
<strong style="color:${NAVY_700};font-size:14px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">${item.value}</strong>
</td>
</tr>
</table>
</td>
</tr>
`).join('')}
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
`;

/**
 * Caixa de codigo OTP (design premium com accent navy)
 */
const otpBox = (codigo, variant = 'default') => {
    const variants = {
        default:  { bg: BG_SUBTLE, accent: NAVY_600, text: NAVY_900, label: TEXT_MUTED },
        success:  { bg: '#ecfdf5', accent: COLOR_SUCCESS, text: '#065f46', label: '#6b7280' },
    };
    const v = variants[variant] || variants.default;
    return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0;">
<tr>
<td align="center">
<!--[if !mso]><!-->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-radius:14px;overflow:hidden;">
<!--<![endif]-->
<!--[if mso]>
<table role="presentation" cellspacing="0" cellpadding="0" border="0">
<![endif]-->
<tr>
<td align="center" style="background-color:${v.bg};padding:28px 48px;">
<p style="margin:0 0 14px 0;color:${v.label};font-size:12px;text-transform:uppercase;letter-spacing:2px;font-weight:600;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
Codigo de verificacao
</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0">
<tr>
<!--[if !mso]><!-->
<td style="background-color:${BG_CARD};border:2px solid ${v.accent};border-radius:10px;padding:14px 32px;">
<!--<![endif]-->
<!--[if mso]>
<td style="background-color:${BG_CARD};border:2px solid ${v.accent};padding:14px 32px;">
<![endif]-->
<span style="font-size:34px;font-weight:700;color:${v.text};letter-spacing:10px;font-family:Courier New,monospace;">
${codigo}
</span>
</td>
</tr>
</table>
<p style="margin:14px 0 0 0;color:${v.label};font-size:12px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
Insira este codigo no sistema para continuar
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
`;
};

/**
 * Bloco de link alternativo (para copiar/colar)
 */
const linkFallback = (url) => `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:4px 0 24px 0;">
<tr>
<td align="center" style="padding:0 0 8px 0;">
<span style="color:${TEXT_LIGHT};font-size:11px;text-transform:uppercase;letter-spacing:1px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
Ou copie e cole o link abaixo
</span>
</td>
</tr>
<tr>
<!--[if !mso]><!-->
<td align="center" style="padding:10px 16px;background-color:${BG_SUBTLE};border:1px solid ${BORDER_LIGHT};border-radius:6px;word-break:break-all;">
<!--<![endif]-->
<!--[if mso]>
<td align="center" style="padding:10px 16px;background-color:${BG_SUBTLE};border:1px solid ${BORDER_LIGHT};word-break:break-all;">
<![endif]-->
<a href="${url}" style="color:${ACCENT_DARK};font-size:12px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;text-decoration:none;">
${url}
</a>
</td>
</tr>
</table>
`;

/**
 * Wrapper de botao centralizado com margem
 */
const buttonBlock = (url, text, bgColor = NAVY_600) => `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0;">
<tr>
<td align="center">
${bulletproofButton(url, text, bgColor)}
</td>
</tr>
</table>
`;

// =============================================================================
// TEMPLATES
// =============================================================================

/**
 * Template para codigo OTP de redefinicao de senha
 */
const templateOtpResetSenha = (nomeUsuario, codigoOtp) => {
    const content = `
${sectionHeading('Redefinicao de Senha', COLOR_WARNING)}

${greeting(nomeUsuario)}

${paragraph(`Recebemos uma solicitacao para redefinir a senha da sua conta no ${APP_NAME}. Utilize o codigo abaixo para concluir o processo:`)}

${otpBox(codigoOtp)}

${infoBox('warning', '<strong>Importante:</strong> Este codigo expira em <strong>15 minutos</strong>. Nao compartilhe este codigo com ninguem.')}

${footnote('Se voce nao solicitou a redefinicao de senha, ignore este email. Sua senha permanecera inalterada.')}
    `;
    return baseLayout(content);
};

/**
 * Template para novo usuario criado pelo admin (deprecado, mantido por compatibilidade)
 */
const templateNovoUsuario = (nomeUsuario, email, senhaTemporaria) => {
    const urlLogin = process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/login`
        : 'http://localhost:3000/login';

    const content = `
${sectionHeading(`Bem-vindo ao ${APP_NAME}!`)}

${greeting(nomeUsuario)}

${paragraph(`Uma conta foi criada para voce no sistema ${APP_NAME} - Sistema de Gestao de Contratos. Abaixo estao suas credenciais de acesso:`)}

${credentialsBox([
    { label: 'Usuario', value: nomeUsuario },
    { label: 'Email', value: email },
    { label: 'Senha temporaria', value: `<code style="background-color:${NAVY_900};color:${ACCENT};padding:3px 10px;border-radius:4px;font-family:Courier New,monospace;font-size:14px;">${senhaTemporaria}</code>` }
])}

${buttonBlock(urlLogin, 'Acessar o Sistema')}

${infoBox('error', '<strong>Seguranca:</strong> Recomendamos que voce altere sua senha apos o primeiro login.')}

${footnote('Em caso de duvidas, entre em contato com o administrador do sistema.')}
    `;
    return baseLayout(content);
};

/**
 * Template para verificacao de email
 */
const templateVerificacaoEmail = (nomeUsuario, urlVerificacao) => {
    const content = `
${sectionHeading('Verifique seu Email', COLOR_SUCCESS)}

${greeting(nomeUsuario)}

${paragraph(`Obrigado por se registrar no ${APP_NAME}! Para ativar sua conta, clique no botao abaixo para verificar seu endereco de email:`)}

${buttonBlock(urlVerificacao, 'Verificar Email', COLOR_SUCCESS)}

${linkFallback(urlVerificacao)}

${infoBox('info', '<strong>Atencao:</strong> Este link expira em <strong>24 horas</strong>.')}

${footnote('Se voce nao solicitou este registro, ignore este email.')}
    `;
    return baseLayout(content);
};

/**
 * Template para alerta de login
 */
const templateAlertaLogin = (nomeUsuario, info) => {
    const content = `
${sectionHeading('Novo Login Detectado', COLOR_ERROR)}

${greeting(nomeUsuario)}

${paragraph(`Detectamos um novo acesso a sua conta no ${APP_NAME}. Confira os detalhes abaixo:`)}

<!-- Detalhes do login -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
<tr>
<!--[if !mso]><!-->
<td style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:12px;border-left:4px solid ${COLOR_ERROR};padding:0;">
<!--<![endif]-->
<!--[if mso]>
<td style="background-color:#fef2f2;border:1px solid #fecaca;border-left:4px solid ${COLOR_ERROR};padding:0;">
<![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr>
<td style="padding:20px 24px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
<tr>
<td style="padding:6px 0;">
<span style="color:${TEXT_MUTED};font-size:13px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">Endereco IP:</span>
<strong style="color:#991b1b;font-size:14px;margin-left:8px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">${info.ip}</strong>
</td>
</tr>
<tr>
<td style="padding:6px 0;">
<span style="color:${TEXT_MUTED};font-size:13px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">Navegador:</span>
<strong style="color:#991b1b;font-size:14px;margin-left:8px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">${info.userAgent}</strong>
</td>
</tr>
<tr>
<td style="padding:6px 0;">
<span style="color:${TEXT_MUTED};font-size:13px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">Data/Hora:</span>
<strong style="color:#991b1b;font-size:14px;margin-left:8px;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">${info.dataHora}</strong>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>

${infoBox('error', '<strong>Nao foi voce?</strong> Altere sua senha imediatamente e entre em contato com o administrador.')}
    `;
    return baseLayout(content);
};

/**
 * Template para redefinicao de senha com link
 */
const templateResetSenhaLink = (nomeUsuario, urlReset) => {
    const content = `
${sectionHeading('Redefinicao de Senha', COLOR_WARNING)}

${greeting(nomeUsuario)}

${paragraph(`Recebemos uma solicitacao para redefinir a senha da sua conta no ${APP_NAME}. Clique no botao abaixo para criar uma nova senha:`)}

${buttonBlock(urlReset, 'Redefinir Minha Senha', NAVY_600)}

${linkFallback(urlReset)}

${infoBox('warning', '<strong>Importante:</strong> Este link expira em <strong>1 hora</strong>. Apos esse periodo, voce precisara solicitar um novo link.')}

${footnote('Se voce nao solicitou a redefinicao de senha, ignore este email. Sua senha permanecera inalterada.')}
    `;
    return baseLayout(content);
};

/**
 * Template para codigo OTP de verificacao de email
 */
const templateOtpVerificacaoEmail = (nomeUsuario, codigoOtp) => {
    const content = `
${sectionHeading('Verificacao de Email', COLOR_SUCCESS)}

${greeting(nomeUsuario)}

${paragraph(`Para verificar seu email no ${APP_NAME}, utilize o codigo abaixo:`)}

${otpBox(codigoOtp, 'success')}

${infoBox('warning', '<strong>Importante:</strong> Este codigo expira em <strong>15 minutos</strong>. Nao compartilhe este codigo com ninguem.')}

${footnote('Apos a verificacao, seu email estara confirmado e voce tera acesso completo ao sistema.')}
    `;
    return baseLayout(content);
};

/**
 * Template para ativacao de conta (novo usuario criado pelo admin)
 */
const templateAtivacaoConta = (nomeUsuario, email, urlAtivacao) => {
    const content = `
${sectionHeading(`Bem-vindo ao ${APP_NAME}!`)}

${greeting(nomeUsuario)}

${paragraph(`Uma conta foi criada para voce no sistema ${APP_NAME} - Sistema de Gestao de Contratos. Para ativar sua conta e comecar a usar o sistema, clique no botao abaixo para definir sua senha:`)}

${credentialsBox([
    { label: 'Usuario', value: nomeUsuario },
    { label: 'Email', value: email }
])}

${buttonBlock(urlAtivacao, 'Definir Minha Senha', COLOR_SUCCESS)}

${linkFallback(urlAtivacao)}

${infoBox('warning', '<strong>Importante:</strong> Este link expira em <strong>72 horas</strong>. Apos esse periodo, solicite ao administrador o reenvio do convite.')}

${footnote('Em caso de duvidas, entre em contato com o administrador do sistema.')}
    `;
    return baseLayout(content);
};

/**
 * Template para confirmacao de alteracao de senha
 */
const templateSenhaAlterada = (nomeUsuario) => {
    const content = `
${sectionHeading('Senha Alterada com Sucesso', COLOR_SUCCESS)}

${greeting(nomeUsuario)}

${paragraph(`Sua senha no ${APP_NAME} foi alterada com sucesso em <strong>${new Date().toLocaleString('pt-BR')}</strong>.`)}

${infoBox('success', 'Se voce realizou esta alteracao, nenhuma acao adicional e necessaria.')}

${infoBox('error', '<strong>Nao foi voce?</strong> Entre em contato imediatamente com o administrador do sistema.')}
    `;
    return baseLayout(content);
};

/**
 * Template para notificacao de nova solicitacao de atualizacao (enviado para Compras)
 */
const templateSolicitacaoCriada = (solicitanteNome, contratoNr, fornecedorNome, urlCompras) => {
    const content = `
${sectionHeading('Nova Solicitacao de Atualizacao', COLOR_INFO)}

${paragraph(`<strong style="color:${TEXT_PRIMARY};">${solicitanteNome}</strong> enviou uma solicitacao de atualizacao de contrato:`)}

${credentialsBox([
    { label: 'Contrato', value: contratoNr },
    { label: 'Fornecedor', value: fornecedorNome }
])}

${buttonBlock(urlCompras, 'Visualizar Solicitacao', COLOR_INFO)}

${linkFallback(urlCompras)}

${infoBox('info', 'Acesse a tela de Compras para avaliar esta solicitacao.')}
    `;
    return baseLayout(content);
};

module.exports = {
    templateOtpResetSenha,
    templateOtpVerificacaoEmail,
    templateNovoUsuario,
    templateVerificacaoEmail,
    templateAlertaLogin,
    templateSenhaAlterada,
    templateResetSenhaLink,
    templateAtivacaoConta,
    templateSolicitacaoCriada,
    APP_NAME
};
