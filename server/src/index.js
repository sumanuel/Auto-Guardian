require("dotenv").config();

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { pool, ensureSchema } = require("./db");

const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const APP_BASE_URL = process.env.APP_BASE_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const createToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "30d",
  });

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.created_at,
});

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderResetPasswordPage = ({
  token = "",
  message = "",
  isError = false,
} = {}) => `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Restablecer contraseña | Auto-Guardian</title>
    <style>
      :root { --bg: #eef4fb; --card: #fff; --text: #15233b; --muted: #5f6f87; --primary: #0f5fd2; --primaryDark: #0a3f8f; --border: #dce6f4; --danger: #d83939; --success: #1b8f5a; }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: linear-gradient(180deg, #f3f7fd 0%, #e8f0fb 100%); color: var(--text); font-family: "Segoe UI", sans-serif; }
      .shell { width: 100%; max-width: 480px; }
      .hero { background: linear-gradient(135deg, var(--primary) 0%, #0c58c3 52%, var(--primaryDark) 100%); border-radius: 28px 28px 20px 20px; padding: 28px; color: #fff; box-shadow: 0 24px 60px rgba(15, 95, 210, 0.24); }
      .eyebrow { font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.76; font-weight: 700; }
      h1 { margin: 10px 0 8px; font-size: 28px; line-height: 1.1; }
      .hero p { margin: 0; color: rgba(255,255,255,0.9); line-height: 1.5; }
      .card { margin-top: -14px; background: var(--card); border: 1px solid var(--border); border-radius: 24px; padding: 24px; box-shadow: 0 18px 48px rgba(14,38,74,0.08); }
      label { display: block; margin-bottom: 8px; font-weight: 700; font-size: 14px; }
      input { width: 100%; border: 1px solid var(--border); border-radius: 14px; padding: 14px 16px; font-size: 15px; margin-bottom: 16px; }
      button { width: 100%; border: 0; border-radius: 14px; padding: 14px 18px; font-size: 15px; font-weight: 700; color: #fff; background: linear-gradient(135deg, var(--primary) 0%, var(--primaryDark) 100%); cursor: pointer; }
      .hint { margin: 0 0 18px; color: var(--muted); line-height: 1.5; font-size: 14px; }
      .message { border-radius: 14px; padding: 14px 16px; margin-bottom: 18px; font-size: 14px; line-height: 1.5; }
      .message.success { background: rgba(27,143,90,0.1); color: var(--success); }
      .message.error { background: rgba(216,57,57,0.1); color: var(--danger); }
      .footer { margin-top: 14px; text-align: center; font-size: 13px; color: var(--muted); }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="hero">
        <div class="eyebrow">Auto-Guardian</div>
        <h1>Nueva contraseña</h1>
        <p>Protege tu historial y recupera el acceso a tu garage inteligente en pocos segundos.</p>
      </div>
      <div class="card">
        ${message ? `<div class="message ${isError ? "error" : "success"}">${escapeHtml(message)}</div>` : ""}
        <p class="hint">Ingresa una nueva contraseña de al menos 6 caracteres para completar la recuperación.</p>
        <form method="POST" action="/reset-password">
          <input type="hidden" name="token" value="${escapeHtml(token)}" />
          <label for="password">Nueva contraseña</label>
          <input id="password" name="password" type="password" minlength="6" required />
          <label for="confirmPassword">Confirmar contraseña</label>
          <input id="confirmPassword" name="confirmPassword" type="password" minlength="6" required />
          <button type="submit">Guardar nueva contraseña</button>
        </form>
        <div class="footer">Si el enlace expiró, solicita una nueva recuperación desde la app.</div>
      </div>
    </div>
    <script>
      document.querySelector('form')?.addEventListener('submit', function (event) {
        const password = document.getElementById('password')?.value || '';
        const confirmPassword = document.getElementById('confirmPassword')?.value || '';
        if (password !== confirmPassword) {
          event.preventDefault();
          alert('Las contraseñas no coinciden.');
        }
      });
    </script>
  </body>
</html>`;

const resetUserPassword = async (token, password) => {
  if (!token || !password) {
    throw new Error("Token y nueva contraseña son obligatorios");
  }

  if (String(password).length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const result = await pool.query(
    `SELECT id, user_id
     FROM password_reset_tokens
     WHERE token_hash = $1
       AND used_at IS NULL
       AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [tokenHash],
  );

  const resetRow = result.rows[0];
  if (!resetRow) {
    throw new Error("Token inválido o vencido");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await pool.query("BEGIN");
  try {
    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [passwordHash, resetRow.user_id],
    );
    await pool.query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1",
      [resetRow.id],
    );
    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
};

const buildTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service:
      host === "smtp.gmail.com" && !process.env.SMTP_SERVICE
        ? "gmail"
        : process.env.SMTP_SERVICE,
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: { user, pass },
  });
};

const authRequired = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Token requerido" });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [payload.sub],
    );

    if (!result.rows[0]) {
      return res.status(401).json({ message: "Sesión inválida" });
    }

    req.user = result.rows[0];
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Sesión expirada o inválida" });
  }
};

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.get("/reset-password", (req, res) => {
  const token = String(req.query.token || "");

  if (!token) {
    return res.status(400).send(
      renderResetPasswordPage({
        message: "El enlace de recuperación no incluye un token válido.",
        isError: true,
      }),
    );
  }

  return res.send(renderResetPasswordPage({ token }));
});

app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Nombre, correo y contraseña son obligatorios" });
  }

  if (String(password).length < 6) {
    return res
      .status(400)
      .json({ message: "La contraseña debe tener al menos 6 caracteres" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, LOWER($2), $3)
       RETURNING id, name, email, created_at`,
      [name.trim(), email.trim(), passwordHash],
    );

    const user = result.rows[0];
    return res.status(201).json({
      token: createToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Ese correo ya está registrado" });
    }
    return res.status(500).json({ message: "No se pudo registrar el usuario" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Correo y contraseña son obligatorios" });
  }

  try {
    const result = await pool.query(
      "SELECT id, name, email, password_hash, created_at FROM users WHERE email = LOWER($1)",
      [email.trim()],
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    return res.json({
      token: createToken(user),
      user: sanitizeUser(user),
    });
  } catch (_error) {
    return res.status(500).json({ message: "No se pudo iniciar sesión" });
  }
});

app.get("/auth/me", authRequired, async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

app.post("/auth/forgot-password", async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ message: "Correo requerido" });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, name FROM users WHERE email = LOWER($1)",
      [email.trim()],
    );
    const user = result.rows[0];

    if (!user) {
      return res.json({ ok: true });
    }

    const rawToken = crypto.randomBytes(24).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt],
    );

    const resetUrl = `${APP_BASE_URL}/reset-password?token=${rawToken}`;
    const transporter = buildTransporter();

    let emailConfigured = false;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: user.email,
          subject: "Recupera tu contraseña de Auto-Guardian",
          text: `Hola ${user.name},\n\nUsa este enlace para restablecer tu contraseña:\n${resetUrl}\n\nEste enlace vence en 30 minutos.`,
        });
        emailConfigured = true;
      } catch (mailError) {
        console.error(
          "No se pudo enviar el correo de recuperación:",
          mailError?.message || mailError,
        );
      }
    }

    if (!emailConfigured) {
      console.log(`Reset password URL for ${user.email}: ${resetUrl}`);
    }

    return res.json({
      ok: true,
      emailConfigured,
      devResetToken:
        process.env.NODE_ENV === "production" ? undefined : rawToken,
    });
  } catch (_error) {
    return res
      .status(500)
      .json({ message: "No se pudo iniciar la recuperación" });
  }
});

app.post("/auth/reset-password", async (req, res) => {
  const { token, password } = req.body || {};

  try {
    await resetUserPassword(token, password);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      message: error?.message || "No se pudo restablecer la contraseña",
    });
  }
});

app.post("/reset-password", async (req, res) => {
  const { token, password, confirmPassword } = req.body || {};

  if (password !== confirmPassword) {
    return res.status(400).send(
      renderResetPasswordPage({
        token,
        message: "Las contraseñas no coinciden.",
        isError: true,
      }),
    );
  }

  try {
    await resetUserPassword(token, password);
    return res.send(
      renderResetPasswordPage({
        message:
          "La contraseña fue actualizada correctamente. Ya puedes volver a la app e iniciar sesión.",
      }),
    );
  } catch (error) {
    return res.status(400).send(
      renderResetPasswordPage({
        token,
        message: error?.message || "No se pudo restablecer la contraseña.",
        isError: true,
      }),
    );
  }
});

app.post("/sync/push", authRequired, async (req, res) => {
  const { snapshot } = req.body || {};

  if (!snapshot || typeof snapshot !== "object") {
    return res.status(400).json({ message: "Snapshot inválido" });
  }

  try {
    await pool.query(
      `INSERT INTO user_data_snapshots (user_id, payload, uploaded_at, source)
       VALUES ($1, $2::jsonb, NOW(), 'mobile-app')
       ON CONFLICT (user_id)
       DO UPDATE SET payload = EXCLUDED.payload, uploaded_at = NOW(), source = EXCLUDED.source`,
      [req.user.id, JSON.stringify(snapshot)],
    );

    return res.json({ ok: true, uploadedAt: new Date().toISOString() });
  } catch (_error) {
    return res
      .status(500)
      .json({ message: "No se pudo sincronizar la información" });
  }
});

app.get("/sync/pull", authRequired, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT payload, uploaded_at
       FROM user_data_snapshots
       WHERE user_id = $1`,
      [req.user.id],
    );

    const row = result.rows[0];
    return res.json({
      snapshot: row?.payload || null,
      uploadedAt: row?.uploaded_at || null,
    });
  } catch (_error) {
    return res
      .status(500)
      .json({ message: "No se pudo obtener el respaldo remoto" });
  }
});

const start = async () => {
  try {
    await ensureSchema();
    app.listen(PORT, () => {
      console.log(`Auto-Guardian server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor:", error);
    process.exit(1);
  }
};

start();
