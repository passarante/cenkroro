<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cenk Ro-Ro Doğrulama Kodu</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f1f5f9;
            margin: 0;
            padding: 24px;
            color: #1e293b;
        }
        .container {
            max-width: 520px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }
        .header {
            background-color: #05264b;
            padding: 24px 20px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            font-size: 22px;
            margin: 0;
            letter-spacing: 1px;
            font-weight: 800;
        }
        .header p {
            color: #7dd3fc;
            font-size: 12px;
            margin: 4px 0 0;
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }
        .content {
            padding: 32px 28px;
            text-align: center;
        }
        .greeting {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #0f172a;
        }
        .message {
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
            margin-bottom: 24px;
        }
        .code-box {
            background: #f8fafc;
            border: 2px dashed #0284c7;
            border-radius: 8px;
            padding: 18px 24px;
            margin: 0 auto 24px;
            display: inline-block;
        }
        .code {
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 34px;
            font-weight: 800;
            letter-spacing: 8px;
            color: #0369a1;
            margin: 0;
        }
        .warning {
            font-size: 12px;
            color: #64748b;
            line-height: 1.5;
            background-color: #f8fafc;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 16px 20px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CENK RO-RO</h1>
            <p>Düzenli Ro-Ro Hatları Portalı</p>
        </div>
        <div class="content">
            <div class="greeting">Merhaba,</div>
            <p class="message">
                Cenk Ro-Ro Rezervasyon Portalı'na giriş yapabilmeniz için tek kullanımlık giriş kodunuz (OTP) aşağıdadır:
            </p>
            <div class="code-box">
                <div class="code">{{ $otpCode }}</div>
            </div>
            <div class="warning">
                ⏳ Bu doğrulama kodu güvenliğiniz için <strong>10 dakika</strong> süreyle geçerlidir.<br>
                Eğer bu işlemi siz başlatmadıysanız bu e-postayı güvenle silebilirsiniz.
            </div>
        </div>
        <div class="footer">
            © {{ date('Y') }} Cenk Ro-Ro Taşımacılık A.Ş. Tüm hakları saklıdır.
        </div>
    </div>
</body>
</html>
