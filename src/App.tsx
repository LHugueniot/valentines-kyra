import { useState, useEffect, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'
import CryptoJS from 'crypto-js'
import encryptedImageData from './encrypted-photo.json'
import encryptedTeaserData from './encrypted-teaser.json'
import './App.css'

const EMOJIS = ['❤️', '💖', '🚴‍♀️', '🏃‍♀️', '🌸', '🏊‍♀️', '🌹', '🥂', '🥟']

const FLOATING_ITEMS = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 5}s`,
  fontSize: `${Math.random() * 20 + 15}px`,
  emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
}))

// This is 'ValentineUnlocked' encrypted with 'sexythang'
const ENCRYPTED_VAL = 'U2FsdGVkX18gnSyugibT/w4EUctH2Ypz+8ecgXYAeCsrXm3106Y5dgV684x7IvaK'

function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [decryptedPhoto, setDecryptedPhoto] = useState<string | null>(null)
  const [decryptedTeaser, setDecryptedTeaser] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [noButtonPosition, setNoButtonPosition] = useState({
    x: window.innerWidth * 0.53,
    y: window.innerHeight * 0.80
  })
  const [noCount, setNoCount] = useState(0)
  const noButtonRef = useRef<HTMLButtonElement>(null)
  const yesButtonRef = useRef<HTMLButtonElement>(null)

  const triggerMove = useCallback((mouseX: number, mouseY: number) => {
    if (!noButtonRef.current) return

    const rect = noButtonRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const dx = centerX - mouseX
    const dy = centerY - mouseY
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < 150) {
      const angle = Math.atan2(dy, dx)
      const basePush = 50
      const randomness = (Math.random() - 0.5) * 2 * (basePush * 0.1)
      const pushAmount = basePush + randomness

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

  const handleYesHover = () => {
    if (noCount === 0 && yesButtonRef.current) {
      const yesRect = yesButtonRef.current.getBoundingClientRect()
      triggerMove(yesRect.left + yesRect.width / 2, yesRect.top + yesRect.height / 2)
    }
  }

  useEffect(() => {
    if (!unlocked) return
    const handleMouseMove = (e: MouseEvent) => triggerMove(e.clientX, e.clientY)
    const handleTouchMove = (e: TouchEvent) => triggerMove(e.touches[0].clientX, e.touches[0].clientY)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [triggerMove, unlocked])

  const handleYesClick = () => {
    setAccepted(true)
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E37A87', '#FBE1D6', '#FFF7F3']
    })
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedPw = password.toLowerCase().trim()
    try {
      const bytes = CryptoJS.AES.decrypt(ENCRYPTED_VAL, trimmedPw)
      const decrypted = bytes.toString(CryptoJS.enc.Utf8)
      
      if (decrypted === 'ValentineUnlocked') {
        const photoBytes = CryptoJS.AES.decrypt(encryptedImageData.data, trimmedPw)
        const photoBase64 = photoBytes.toString(CryptoJS.enc.Utf8)
        
        const teaserBytes = CryptoJS.AES.decrypt(encryptedTeaserData.data, trimmedPw)
        const teaserBase64 = teaserBytes.toString(CryptoJS.enc.Utf8)
        
        if (photoBase64 && teaserBase64) {
          setDecryptedPhoto(`data:image/png;base64,${photoBase64}`)
          setDecryptedTeaser(`data:image/png;base64,${teaserBase64}`)
          setUnlocked(true)
          setError(false)
        } else {
          throw new Error('Failed to decrypt photos')
        }
      } else {
        throw new Error('Invalid password')
      }
    } catch (err) {
      setError(true)
      setPassword('')
    }
  }

  if (!unlocked) {
    return (
      <div className="container-fluid d-flex flex-column align-items-center justify-content-center vh-100 text-center romantic-bg">
        <div className="card p-5 shadow-lg romantic-card" style={{ maxWidth: '400px' }}>
          <h2 className="mb-4">Password Pls ❤️</h2>
          <form onSubmit={handlePasswordSubmit}>
            <input 
              type="password" 
              className={`form-control mb-3 text-center ${error ? 'is-invalid' : ''}`} 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              style={{ borderRadius: '1rem', border: '2px solid #FBE1D6' }}
            />
            {error && <div className="text-danger mb-3 small">Wrong password 😡</div>}
            <button type="submit" className="btn btn-danger yes-button w-100 py-2" style={{ borderRadius: '1rem' }}>
              Enter
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (accepted) {
    return (
      <div className="container-fluid d-flex flex-column align-items-center justify-content-center vh-100 text-center romantic-bg">
        {FLOATING_ITEMS.map(item => (
          <div key={item.id} className="floating-heart" style={{ left: item.left, animationDelay: item.animationDelay, fontSize: item.fontSize }}>
            {item.emoji}
          </div>
        ))}
        <div className="card p-5 shadow-lg romantic-card">
          {decryptedPhoto && (
            <img
              src={decryptedPhoto}
              alt="Valentine's Special" 
              className="img-fluid mb-4 rounded mx-auto d-block shadow" 
              style={{ maxHeight: '350px', objectFit: 'cover' }}
            />
          )}
          <h1 className="display-4 fw-bold text-danger mb-3">I knew you'd say yes! ❤️</h1>
          <p className="lead">I can't wait for Valentines with you Kyra, see you on the 14th! 😘</p>
        </div>
      </div>
    )
  }

  const yesScale = 1 + Math.floor(noCount / 10) * 0.1
  const noScale = Math.max(0.4, 1 - Math.floor(noCount / 20) * 0.1)

  return (
    <div className="container-fluid d-flex flex-column align-items-center justify-content-center vh-100 text-center romantic-bg">
      {FLOATING_ITEMS.map(item => (
        <div key={item.id} className="floating-heart" style={{ left: item.left, animationDelay: item.animationDelay, fontSize: item.fontSize }}>
          {item.emoji}
        </div>
      ))}
      <div className="card p-5 shadow-lg romantic-card">
        {decryptedTeaser && (
          <img
            src={decryptedTeaser}
            alt="Teaser" 
            className="img-fluid mb-4 rounded mx-auto d-block shadow" 
            style={{ maxHeight: '250px', objectFit: 'cover' }}
          />
        )}
        <h1 className="display-3 fw-bold mb-2">Will you be my Valentine, Kyra?</h1>
        <p className="lead italic mb-4">Kyra, you make me cray cray 🦞 for you.</p>
        
        <div className="d-flex justify-content-center align-items-center gap-5 mt-4" style={{ minHeight: '150px' }}>
          <button
            ref={yesButtonRef}
            className="btn btn-danger btn-lg shadow yes-button"
            onMouseEnter={handleYesHover}
            style={{ 
              fontSize: `${1.2 * yesScale}rem`,
              width: `${120 * yesScale}px`,
              height: `${50 * yesScale}px`
            }}
            onClick={handleYesClick}
          >
            Yes!
          </button>
          
          <div style={{ width: '120px' }}></div>
        </div>
      </div>

      <button
        ref={noButtonRef}
        className="btn btn-outline-secondary btn-lg no-button"
        style={{
          position: 'fixed',
          left: `${noButtonPosition.x}px`,
          top: `${noButtonPosition.y}px`,
          fontSize: `${1.2 * noScale}rem`,
          width: `${120 * noScale}px`,
          height: `${50 * noScale}px`,
          zIndex: 1000,
          pointerEvents: 'none',
          overflow: 'visible'
        }}
      >
        No
        {noCount > 0 && (
          <>
            <span className="leg leg-left" style={{ height: `${15 * noScale}px`, bottom: `${-12 * noScale}px` }}></span>
            <span className="leg leg-right" style={{ height: `${15 * noScale}px`, bottom: `${-12 * noScale}px` }}></span>
          </>
        )}
      </button>
    </div>
  )
}

export default App
