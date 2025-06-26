'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

export default function Home() {
  const [agent1Name, setAgent1Name] = useState('Alex')
  const [agent1Prompt, setAgent1Prompt] = useState(
    "You are a very curious 4-year-old child named Alex. You know a few simple things about the world: you know what colors, animals, and food are, but you don't know much else. You speak in very simple, short sentences. You are talking to another child just like you. Your goal is to learn new things. When you don't know something, you should ask questions. If you are really stuck, you can try to 'look it up' to find an answer. You are friendly and love to learn."
  )
  const [agent2Name, setAgent2Name] = useState('Benny')
  const [agent2Prompt, setAgent2Prompt] = useState(
    "You are a very curious 4-year-old child named Benny. You know a few simple things about the world: you know what colors, animals, and food are, but you don't know much else. You speak in very simple, short sentences. You are talking to another child just like you. Your goal is to learn new things. When you don't know something, you should ask questions. If you are really stuck, you can try to 'look it up' to find an answer. You are friendly and love to learn."
  )
  const [initialMessage, setInitialMessage] = useState('Hi Benny! What is a... cloud?')
  const [conversation, setConversation] = useState<string[]>([])
  const [isChatting, setIsChatting] = useState(false)
  const [thinkingVisibility, setThinkingVisibility] = useState<boolean[]>([])
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const downloadChat = () => {
    const chat = conversation.map((msg) => parseMessage(msg).message).join('\n')
    const blob = new Blob([chat], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chat.txt'
    a.click()
  }

  const startChat = async () => {
    setIsChatting(true)
    setConversation([])
    setThinkingVisibility([])

    const response = await fetch('/api/start-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agent1Name,
        agent1Prompt,
        agent2Name,
        agent2Prompt,
        initialMessage
      })
    })

    if (!response.ok) {
      setIsChatting(false)
      throw new Error('Failed to start chat')
    }

    const reader = response.body?.getReader()
    if (!reader) {
      setIsChatting(false)
      throw new Error('Failed to get reader')
    }

    const decoder = new TextDecoder()

    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        setIsChatting(false)
        break
      }
      const chunk = decoder.decode(value)
      setConversation((prev: string[]) => [...prev, chunk])
      setThinkingVisibility((prev) => [...prev, false])
    }
  }

  const stopChat = async () => {
    await fetch('/api/stop-chat')
    setIsChatting(false)
  }

  useEffect(() => {
    if (chatContainerRef.current && conversation.length > 0) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [conversation])

  const parseMessage = (msg: string) => {
    const speakerMatch = msg.match(/^(.*?)\s*\(to chat_manager\):/)
    const thinkMatch = msg.match(/<think>(.*?)<\/think>/s)

    const speaker = speakerMatch ? speakerMatch[1] : 'System'
    const thinking = thinkMatch ? thinkMatch[1].trim() : ''
    const message = msg
      .replace(/^(.*?)\s*\(to chat_manager\):/, '')
      .replace(/<think>(.*?)<\/think>/s, '')
      .trim()

    return { speaker, thinking, message }
  }

  const toggleThinking = (index: number) => {
    setThinkingVisibility((prev) => {
      const newVisibility = [...prev]
      newVisibility[index] = !newVisibility[index]
      return newVisibility
    })
  }

  return (
    <div className='flex flex-col items-center min-h-screen bg-gray-100 text-gray-700'>
      <h1 className='text-4xl font-bold text-gray-800 my-8'>Toddler Experiment</h1>
      <div className='w-full max-w-4xl p-8 bg-white rounded-lg shadow-md'>
        <div className='grid grid-cols-2 gap-8'>
          <div>
            <h2 className='text-2xl font-semibold text-gray-700 mb-4'>Agent 1</h2>
            <input
              type='text'
              value={agent1Name}
              onChange={(e) => setAgent1Name(e.target.value)}
              className='w-full p-2 mb-4 border rounded'
              placeholder='Agent 1 Name'
            />
            <textarea
              value={agent1Prompt}
              onChange={(e) => setAgent1Prompt(e.target.value)}
              className='w-full p-2 mb-4 border rounded h-48'
              placeholder='Agent 1 System Prompt'
            />
          </div>
          <div>
            <h2 className='text-2xl font-semibold text-gray-700 mb-4'>Agent 2</h2>
            <input
              type='text'
              value={agent2Name}
              onChange={(e) => setAgent2Name(e.target.value)}
              className='w-full p-2 mb-4 border rounded'
              placeholder='Agent 2 Name'
            />
            <textarea
              value={agent2Prompt}
              onChange={(e) => setAgent2Prompt(e.target.value)}
              className='w-full p-2 mb-4 border rounded h-48'
              placeholder='Agent 2 System Prompt'
            />
          </div>
        </div>
        <textarea
          value={initialMessage}
          onChange={(e) => setInitialMessage(e.target.value)}
          className='w-full p-2 mb-4 border rounded'
          placeholder='Initial Message'
        />
        <div className='flex gap-4'>
          <button
            type='button'
            onClick={startChat}
            disabled={isChatting}
            className='cursor-pointer w-full p-4 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-400'
          >
            Start Chat
          </button>
          <button
            type='button'
            onClick={stopChat}
            disabled={!isChatting}
            className='cursor-pointer w-full p-4 text-white bg-red-500 rounded hover:bg-red-600 disabled:bg-gray-400'
          >
            Stop Chat
          </button>
          <button
            type='button'
            onClick={() => {
              setConversation([])
              setThinkingVisibility([])
            }}
            disabled={conversation.length === 0}
            className='cursor-pointer w-full p-4 text-white bg-gray-500 rounded hover:bg-gray-600 disabled:bg-gray-400'
          >
            Clear Chat
          </button>
          <button
            type='button'
            onClick={() => {
              downloadChat()
            }}
            className='cursor-pointer w-full p-4 text-white bg-gray-500 rounded hover:bg-gray-600 disabled:bg-gray-400'
          >
            Save Chat
          </button>
        </div>
      </div>
      <div className='w-full max-w-4xl p-8 mt-8 bg-white rounded-lg shadow-md'>
        <h2 className='text-2xl font-semibold text-gray-700 mb-4'>Conversation</h2>
        <div ref={chatContainerRef} className='h-96 overflow-y-auto'>
          {conversation.map((msg, i) => {
            const { speaker, thinking, message } = parseMessage(msg)
            return (
              <div key={`${i}-${speaker}`} className='mb-4'>
                <div className='font-bold'>{speaker}:</div>
                {thinking && (
                  <div className='mt-2'>
                    <button type='button' onClick={() => toggleThinking(i)} className='text-blue-500'>
                      {thinkingVisibility[i] ? '[-]' : '[+]'} Thinking
                    </button>
                    {thinkingVisibility[i] && <div className='p-2 mt-1 bg-gray-200 rounded'>{thinking}</div>}
                  </div>
                )}
                <div className='mt-2'>
                  <ReactMarkdown>{message}</ReactMarkdown>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
