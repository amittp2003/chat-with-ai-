"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState } from "react";
export default function Home() {
  //adding states
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState("");// spinner
  const [streamResponse, setStreamResponse] = useState("");

  //method to collect data and send to backend
  const handleChat = async() =>{
    setLoading(true)
    setResponse("")

    try{
      const res = await fetch("/api/chat",{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({message})
    })

    const data = await res.json()
    setResponse(data.response)
    }catch(error){
      setResponse("Error: "+ error.message)
    }
    setLoading(false)
  };

  const handleStreamChat = async() =>{
    setStreaming(true)
    setStreamResponse("")

    try{
      const res = await fetch("/api/chat-stream",{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({message})
    })
    
    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    
    while(true){
      const {done, value} = await reader.read()
      if(done) break;
      const chunk = decoder.decode(value)
      const lines= chunk.split("\n")
      for(const line of lines){
        console.log(line);
        
        if(line.startsWith("data: ")){
          const data = JSON.parse(line.slice(6))
          setStreamResponse((prev) => prev + data.content)
        }
      }
    }
  }catch(error){
    setStreamResponse("Error: "+ error.message)
    }
    setStreaming(false)
  }
  return( 
    <div className={styles.page}>
  <h1 className={styles.title}>Chat with me!</h1>
  <p className={styles.subtitle}>
    You can ask any questions as your wish but I am good at coding questions!
  </p>

  <textarea
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    placeholder="Enter your message"
    rows={4}
    className={styles.textarea}
  />

  <div>
    <button
      onClick={handleChat}
      className={`${styles.button} ${styles.chatButton}`}
    >
      {loading ? "loading..." : "chat"}
    </button>
  </div>

  <div className={styles.responseBox}>{response}</div>

  <button
    onClick={handleStreamChat}
    className={`${styles.button} ${styles.streamButton}`}
  >
    {streaming ? "streaming..." : "stream chat"}
  </button>

  <div className={styles.responseBox}>{streamResponse}</div>
</div>)
}