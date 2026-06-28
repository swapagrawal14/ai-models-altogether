"use client"

import { useState, useRef, useEffect } from "react"
import useSWR from "swr"

type Provider = "openrouter" | "openai" | "anthropic" | "google" | "xai"

interface Model { id: string; name: string }

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Home() {
  const [provider, setProvider] = useState<Provider>("openrouter")
  const [apiKey, setApiKey] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: models } = useSWR<Model[]>(
    apiKey ? `/api/models?provider=${provider}&apiKey=${encodeURIComponent(apiKey)}` : null,
    fetcher
  )

  useEffect(() => {
    if (models && models.length > 0 && !selectedModel) setSelectedModel(models[0].id)
  }, [models, selectedModel])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !selectedModel || !apiKey) return
    const userMessage = input
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey, model: selectedModel, messages: [...messages, { role: "user", content: userMessage }] })
      })
      const data = await response.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Error: Failed to get response" }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto px-4">
      <header className="flex items-center justify-between py-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AI Model Selector</h1>
      </header>

      <div className="flex gap-4 py-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Provider</label>
          <select value={provider} onChange={e => { setProvider(e.target.value as Provider); setSelectedModel(""); setMessages([]) }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
            <option value="openrouter">OpenRouter</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="google">Google (Gemini)</option>
            <option value="xai">xAI (Grok)</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">API Key</label>
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Enter your API key"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2" />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Model</label>
          <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} disabled={!models?.length}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 disabled:opacity-50">
            {!models && <option>Loading models...</option>}
            {models?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border border-slate-800 rounded-lg p-4 mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 mt-8">Select a provider and model to start chatting</div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === "user" ? "bg-blue-600" : "bg-slate-800"}`}>
                  <p className="text-sm font-medium mb-1">{msg.role === "user" ? "You" : "AI"}</p>
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="flex gap-2 pb-4">
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
          placeholder="Type your message..." rows={2} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 resize-none" />
        <button onClick={sendMessage} disabled={isLoading || !input.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition disabled:opacity-50">
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </div>
  )
}