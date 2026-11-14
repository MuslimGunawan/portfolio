import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src", "data", "projects.json");

export async function GET() {
  try {
    const fileContents = await fs.readFile(dataFilePath, "utf8");
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal membaca data proyek", details: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Format data harus berupa array proyek" },
        { status: 400 }
      );
    }

    await fs.writeFile(dataFilePath, JSON.stringify(body, null, 2), "utf8");
    return NextResponse.json({ success: true, count: body.length });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menyimpan data proyek", details: String(err) },
      { status: 500 }
    );
  }
}
