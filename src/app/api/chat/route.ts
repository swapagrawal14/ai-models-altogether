import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { provider, apiKey, model, messages } = await request.json()

  if (!provider || !apiKey || !model) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    let response: string

    switch (provider) {
      case "openrouter":
        const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model, messages })
        })
        const orData = await orRes.json()
        response = orData.choices?.[0]?.message?.content || "No response"
        break

      case "openai":
        const oaRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model, messages })
        })
        const oaData = await oaRes.json()
        response = oaData.choices?.[0]?.message?.content || "No response"
        break

      case "anthropic":
        const anthRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "x-api-key": apiKey, "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
          body: JSON.stringify({
            model,
            max_tokens: 4096,
            messages: messages.map((m: any) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content
            }))
          })
        })
        const anthData = await anthRes.json()
        response = anthData.content?.[0]?.text || "No response"
        break

      case "google":
        const gemRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: messages.map((m: any) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })) }) }
        )
        const gemData = await gemRes.json()
        response = gemData.candidates?.[0]?.content?.parts?.[0]?.text || "No response"
        break

      case "xai":
        const xaiRes = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model, messages })
        })
        const xaiData = await xaiRes.json()
        response = xaiData.choices?.[0]?.message?.content || "No response"
        break

      default:
        return NextResponse.json({ error: "Unknown provider" }, { status: 400 })
    }

    return NextResponse.json({ response })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 })
  }
}