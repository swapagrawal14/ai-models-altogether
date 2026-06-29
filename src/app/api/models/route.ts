import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const provider = searchParams.get("provider")
  const apiKey = searchParams.get("apiKey")

  if (!provider) {
    return NextResponse.json({ error: "Provider required" }, { status: 400 })
  }

  try {
    let models: Array<{id: string; name: string}> = []
    const providersWithStaticModels = ["anthropic", "google", "xai"]

    if (!apiKey && !providersWithStaticModels.includes(provider)) {
      return NextResponse.json({ error: "API key required for this provider" }, { status: 400 })
    }

    switch (provider) {
      case "openrouter":
        const orRes = await fetch("https://openrouter.ai/api/v1/models", {
          headers: { "Authorization": `Bearer ${apiKey}` }
        })
        const orData = await orRes.json()
        models = orData.data.map((m: any) => ({ id: m.id, name: m.name || m.id }))
        break
      case "openai":
        const oaRes = await fetch("https://api.openai.com/v1/models", {
          headers: { "Authorization": `Bearer ${apiKey}` }
        })
        const oaData = await oaRes.json()
        models = oaData.data
          .filter((m: any) => m.id.includes("gpt"))
          .map((m: any) => ({ id: m.id, name: m.id }))
        break
      case "anthropic":
        models = [
          { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
          { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet" },
          { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" }
        ]
        break
      case "google":
        models = [
          { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
          { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" }
        ]
        break
      case "xai":
        models = [{ id: "grok-beta", name: "Grok Beta" }]
        break
      default:
        return NextResponse.json({ error: "Unknown provider" }, { status: 400 })
    }

    return NextResponse.json(models)
  } catch {
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}