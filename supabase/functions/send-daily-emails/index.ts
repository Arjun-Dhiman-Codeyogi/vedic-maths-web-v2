import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY")!;
const SENDER_EMAIL = Deno.env.get("GMAIL_USER")!; // your gmail used as sender
const APP_URL = "https://vedic-math-web-app.netlify.app";

const ALL_CATEGORIES = ["vedic", "finger", "brain"];
const CAT_LABELS: Record<string, string> = {
  vedic: "Vedic Math",
  finger: "Finger Math",
  brain: "Brain Dev",
};

async function sendEmail(to: string, toName: string, subject: string, html: string) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "MathGenius", email: SENDER_EMAIL },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent: html,
    }),
  });
  return res;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200 });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Today's date in IST (UTC+5:30)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const todayIST = new Date(now.getTime() + istOffset).toISOString().split("T")[0];

    // 1. All students
    const { data: students, error: studentsErr } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "student");

    if (studentsErr) throw studentsErr;
    if (!students?.length) {
      return new Response(JSON.stringify({ sent: 0, message: "No students found" }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    const ids = students.map((s) => s.id);

    // 2. Student progress
    const { data: profiles } = await supabase
      .from("student_profiles")
      .select("user_id, total_xp, current_level, daily_streak, last_activity_date")
      .in("user_id", ids);

    // 3. Today's activity
    const { data: todayActivity } = await supabase
      .from("user_activity_log")
      .select("user_id, activity_value")
      .in("user_id", ids)
      .eq("activity_type", "question_result")
      .gte("created_at", `${todayIST}T00:00:00+05:30`)
      .lte("created_at", `${todayIST}T23:59:59+05:30`);

    let sent = 0;
    const errors: string[] = [];

    for (const student of students) {
      if (!student.email) continue;

      const prog = profiles?.find((p) => p.user_id === student.id);
      const entries = (todayActivity || []).filter((a) => a.user_id === student.id);
      const isActive = prog?.last_activity_date === todayIST || entries.length > 0;

      const catStats: Record<string, { correct: number; total: number }> = {};
      for (const e of entries) {
        const parts = (e.activity_value as string).split(":");
        const result = parts[0];
        const cat = parts[1];
        if (!cat) continue;
        if (!catStats[cat]) catStats[cat] = { correct: 0, total: 0 };
        catStats[cat].total++;
        if (result === "correct") catStats[cat].correct++;
      }
      const missedCats = ALL_CATEGORIES.filter((c) => !catStats[c]);

      const firstName = student.full_name?.split(" ")[0] || "Student";
      const html = isActive
        ? buildActiveEmail(firstName, prog, catStats, missedCats)
        : buildInactiveEmail(firstName, prog);
      const subject = isActive
        ? `🌟 Aaj ka progress — shabash ${firstName}!`
        : `⚡ Aaj practice nahi ki — streak khatam hone wali hai!`;

      const res = await sendEmail(student.email, student.full_name || firstName, subject, html);

      if (res.ok) {
        sent++;
      } else {
        const errText = await res.text();
        errors.push(`${student.email}: ${errText}`);
        console.error(`Failed: ${student.email}: ${errText}`);
      }
    }

    return new Response(
      JSON.stringify({ sent, total: students.length, errors }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-daily-emails error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// ─── Email builders ───────────────────────────────────────────────────────────

function buildActiveEmail(
  name: string,
  prog: Record<string, unknown> | undefined,
  catStats: Record<string, { correct: number; total: number }>,
  missedCats: string[]
) {
  const streak = (prog?.daily_streak as number) ?? 0;
  const xp = (prog?.total_xp as number) ?? 0;
  const level = (prog?.current_level as number) ?? 1;
  const totalToday = Object.values(catStats).reduce((s, c) => s + c.total, 0);
  const correctToday = Object.values(catStats).reduce((s, c) => s + c.correct, 0);

  const catRows = Object.entries(catStats).map(([cat, s]) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6">${CAT_LABELS[cat] || cat}</td>
      <td style="padding:8px 12px;text-align:center;border-bottom:1px solid #f3f4f6">${s.total}</td>
      <td style="padding:8px 12px;text-align:center;border-bottom:1px solid #f3f4f6;color:#22c55e;font-weight:700">${s.correct}</td>
      <td style="padding:8px 12px;text-align:center;border-bottom:1px solid #f3f4f6;font-weight:700;color:#6366f1">
        ${s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0}%
      </td>
    </tr>`).join("");

  const missedSection = missedCats.length > 0
    ? `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin:16px 0">
        <p style="margin:0 0 8px;font-weight:700;color:#ea580c;font-size:14px">⚠️ Ye topics aaj chhoote reh gaye — inhe jaldi pura karo!</p>
        <ul style="margin:0;padding-left:20px;color:#92400e;font-size:13px">
          ${missedCats.map((c) => `<li style="margin-bottom:4px">${CAT_LABELS[c]}</li>`).join("")}
        </ul>
      </div>`
    : `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:12px;margin:16px 0;text-align:center">
        <p style="color:#15803d;font-weight:700;margin:0;font-size:14px">🎉 Aaj tumne saari categories practice ki — kamaal!</p>
      </div>`;

  const body = `
    <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:12px;padding:16px;margin-bottom:16px;text-align:center">
      <p style="font-size:32px;margin:0">🔥 ${streak} Day Streak!</p>
      <p style="color:#6b7280;margin:6px 0 0;font-size:13px">⚡ ${xp} XP total &nbsp;•&nbsp; Level ${level}</p>
    </div>
    <p style="font-size:15px;color:#374151;margin:0 0 12px">
      Aaj tumne <strong>${totalToday} problems</strong> solve kiye — ${correctToday} correct! Dekho aaj ki performance:
    </p>
    <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:10px;overflow:hidden;font-size:13px">
      <thead>
        <tr style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white">
          <th style="padding:10px 12px;text-align:left;font-weight:600">Category</th>
          <th style="padding:10px 12px;text-align:center;font-weight:600">Problems</th>
          <th style="padding:10px 12px;text-align:center;font-weight:600">Correct</th>
          <th style="padding:10px 12px;text-align:center;font-weight:600">Accuracy</th>
        </tr>
      </thead>
      <tbody>${catRows}</tbody>
    </table>
    ${missedSection}
    <div style="text-align:center;margin-top:20px">
      <a href="${APP_URL}/go?to=practice" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:13px 36px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block">🚀 Aur Practice Karo</a>
      <br>
      <a href="${APP_URL}" style="display:inline-block;margin-top:10px;background:#f3f4f6;color:#6366f1;padding:10px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;border:2px solid #e5e7eb">🌐 Website Kholo</a>
    </div>`;

  return emailWrapper(name, body);
}

function buildInactiveEmail(name: string, prog: Record<string, unknown> | undefined) {
  const streak = (prog?.daily_streak as number) ?? 0;

  const streakSection = streak > 0
    ? `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;margin:16px 0;text-align:center">
        <p style="font-size:28px;margin:0">🔥 ${streak} Day Streak</p>
        <p style="color:#ea580c;font-weight:700;margin:6px 0 0;font-size:14px">Aaj practice nahi ki to ye streak toot jayegi!</p>
      </div>`
    : `<div style="background:#eff6ff;border-radius:12px;padding:16px;margin:16px 0;text-align:center">
        <p style="color:#1d4ed8;font-weight:700;margin:0;font-size:14px">Aaj practice karke apni streak shuru karo! 🚀</p>
      </div>`;

  const body = `
    <p style="font-size:15px;color:#374151;margin:0 0 12px">Aaj abhi tak koi practice nahi hui. Thodi der nikaalo aur apni skills badhaao!</p>
    ${streakSection}
    <div style="background:#f5f3ff;border-radius:12px;padding:16px;margin:16px 0">
      <p style="font-weight:700;margin:0 0 10px;color:#7c3aed;font-size:14px">📚 Aaj ye topics practice karo:</p>
      <ul style="color:#5b21b6;margin:0;padding-left:20px;font-size:13px">
        <li style="margin-bottom:6px"><strong>Vedic Math</strong> — fast multiplication tricks</li>
        <li style="margin-bottom:6px"><strong>Finger Math</strong> — abacus techniques</li>
        <li style="margin-bottom:6px"><strong>Brain Dev</strong> — mental math challenges</li>
      </ul>
    </div>
    <div style="text-align:center;margin-top:20px">
      <a href="${APP_URL}/go?to=practice" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:13px 36px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block">⚡ Abhi Practice Shuru Karo</a>
      <br>
      <a href="${APP_URL}" style="display:inline-block;margin-top:10px;background:#f3f4f6;color:#6366f1;padding:10px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;border:2px solid #e5e7eb">🌐 Website Kholo</a>
    </div>`;

  return emailWrapper(name, body);
}

function emailWrapper(name: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f3f4f6;margin:0;padding:20px 16px">
  <div style="max-width:520px;margin:0 auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10)">
    <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px;text-align:center">
      <p style="color:white;font-size:22px;font-weight:800;margin:0;letter-spacing:-0.3px">🧮 MathGenius</p>
      <p style="color:rgba(255,255,255,0.80);margin:4px 0 0;font-size:12px;font-weight:500">Vedic Mathematics Learning Platform</p>
    </div>
    <div style="padding:24px">
      <p style="font-size:18px;font-weight:700;color:#1f2937;margin:0 0 16px">Namaste ${name}! 👋</p>
      ${body}
    </div>
    <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb">
      <p style="color:#9ca3af;font-size:11px;margin:0;line-height:1.6">
        MathGenius — Vedic Math Learning Platform<br>
        <a href="${APP_URL}" style="color:#6366f1;text-decoration:none">${APP_URL}</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
