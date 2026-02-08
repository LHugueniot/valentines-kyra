import { useState, useEffect, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'
import './App.css'

const HEARTS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 5}s`,
  fontSize: `${Math.random() * 20 + 10}px`
}))

function App() {
  const [accepted, setAccepted] = useState(false)
  // Initialize with a calculated center-ish position to avoid any measurement jumps
  const [noButtonPosition, setNoButtonPosition] = useState({
    x: window.innerWidth / 2 + 50,
    y: window.innerHeight * 0.73
  })
  const [noCount, setNoCount] = useState(0)
  const noButtonRef = useRef<HTMLButtonElement>(null)

  const moveButton = useCallback((mouseX: number, mouseY: number) => {
    if (!noButtonRef.current) return

    const rect = noButtonRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const dx = centerX - mouseX
    const dy = centerY - mouseY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < 150) {
      const angle = Math.atan2(dy, dx)
      const pushAmount = 50

      let newX = rect.left + Math.cos(angle) * pushAmount
      let newY = rect.top + Math.sin(angle) * pushAmount

      const padding = 30
      const winW = window.innerWidth
      const winH = window.innerHeight

      if (newX < padding) newX = padding
      if (newX > winW - rect.width - padding) newX = winW - rect.width - padding
      if (newY < padding) newY = padding
      if (newY > winH - rect.height - padding) newY = winH - rect.height - padding

      setNoButtonPosition({ x: newX, y: newY })
      setNoCount(prev => prev + 1)
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => moveButton(e.clientX, e.clientY)
    const handleTouchMove = (e: TouchEvent) => moveButton(e.touches[0].clientX, e.touches[0].clientY)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [moveButton])

  const handleYesClick = () => {
    setAccepted(true)
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff0000', '#ff69b4', '#ffffff']
    })
  }

  const getNoButtonText = () => {
    const phrases = [
      "No"
    ]
    return phrases[Math.min(Math.floor(noCount / 10), phrases.length - 1)]
  }

  if (accepted) {
    return (
      <div className="container d-flex flex-column align-items-center justify-content-center vh-100 text-center">
        <img
          src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHpobjZndmZ2ZndmZ2ZndmZ2ZndmZ2ZndmZ2ZndmZ2ZndmZ2ZndmZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/K6WfC6P9Cg4M/giphy.gif"
          alt="Celebrating cat"
          className="img-fluid mb-4 rounded shadow"
          style={{ maxHeight: '300px' }}
        />
        <h1 className="display-4 fw-bold text-danger mb-3">Yay! I knew you'd say yes! ❤️</h1>
        <p className="lead">I love you so much, Kyra! See you on the 14th!</p>
      </div>
    )
  }

  return (
    <div className="container-fluid d-flex flex-column align-items-center justify-content-center vh-100 text-center romantic-bg">
      {HEARTS.map(heart => (
        <div key={heart.id} className="floating-heart" style={{ left: heart.left, animationDelay: heart.animationDelay, fontSize: heart.fontSize }}>
          ❤️
        </div>
      ))}
      <div className="card p-5 shadow-lg romantic-card">
        <img
          src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3pwa3N6Z3Z2ZndmZ2ZndmZ2ZndmZ2ZndmZ2ZndmZ2ZndmZ2ZndmZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/c76IJLufpNUMo/giphy.gif"
          alt="Cute cat" className="img-fluid mb-4 rounded mx-auto d-block" style={{ maxHeight: '200px' }}
        />
        <h1 className="display-3 fw-bold mb-4">Will you be my Valentine, Kyra?</h1>
        <div className="d-flex gap-3 justify-items" style={{ minHeight: '80px' }}>
          <div className="justify-content align-items-center"/>
          <button
            className="btn btn-danger btn-lg px-5 py-3 shadow yes-button"
            style={{ fontSize: `${1.2 + Math.floor(noCount / 5) * 0.1}rem` }}
            onClick={handleYesClick}
          >
            Yes!
          </button>
          <div className="justify-content align-items-center"/>
          <div className="justify-content align-items-center"/>
        </div>
      </div>
      <button
        ref={noButtonRef}
        className="btn btn-outline-secondary btn-lg no-button"
        style={{
          position: 'fixed',
          left: `${noButtonPosition.x}px`,
          top: `${noButtonPosition.y}px`,
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      >
        {getNoButtonText()}
      </button>
    </div>
  )
}

export default App
