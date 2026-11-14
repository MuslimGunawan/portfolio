import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { message } = await request.json().catch(() => ({ message: "update: portfolio data via admin dashboard" }));
    const commitMsg = message || "update: portfolio data via admin dashboard";

    // 1. Stage all changes
    await execAsync('git add src/data/projects.json');

    // 2. Check if there are changes to commit
    const { stdout: statusOut } = await execAsync('git status --porcelain');
    if (!statusOut.trim()) {
      return NextResponse.json({
        success: true,
        message: "Tidak ada perubahan baru untuk di-commit.",
        synced: true,
      });
    }

    // 3. Commit
    await execAsync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);

    // 4. Try git push (if remote origin exists)
    let pushSuccess = false;
    let pushOutput = "";
    try {
      const { stdout: pOut, stderr: pErr } = await execAsync('git push origin main');
      pushSuccess = true;
      pushOutput = pOut || pErr;
    } catch (pushErr) {
      pushOutput = String(pushErr);
    }

    return NextResponse.json({
      success: true,
      message: pushSuccess
        ? "Berhasil di-commit dan otomatis di-push ke GitHub! Vercel akan otomatis mendeploy versi terbaru."
        : "Berhasil di-commit ke Git lokal. (Remote push: " + (pushOutput.includes("fatal: 'origin'") ? "Belum ada remote origin GitHub yang dihubungkan" : pushOutput.slice(0, 150)) + ")",
      pushed: pushSuccess,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menjalankan git sync", details: String(err) },
      { status: 500 }
    );
  }
}
