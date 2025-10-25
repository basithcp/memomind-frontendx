import { useState, useEffect } from 'react'
import { sessionAPI } from '../api/sessions'

// Custom hook for managing study sessions
export const useSession = () => {
  const [currentSession, setCurrentSession] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load current session on mount
  useEffect(() => {
    loadCurrentSession()
  }, [])

  const loadCurrentSession = async () => {
    setIsLoading(true)
    try {
      const session = await sessionAPI.getCurrentSession()
      setCurrentSession(session)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const createSession = async (sessionData) => {
    setIsLoading(true)
    try {
      const newSession = await sessionAPI.createSession(sessionData)
      setCurrentSession(newSession)
      return newSession
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateProgress = async (progress) => {
    if (!currentSession) return
    
    try {
      await sessionAPI.updateSessionProgress(currentSession.id, progress)
      setCurrentSession(prev => ({ ...prev, progress }))
    } catch (err) {
      setError(err.message)
    }
  }

  const endSession = async () => {
    if (!currentSession) return
    
    try {
      await sessionAPI.endSession(currentSession.id)
      setCurrentSession(null)
    } catch (err) {
      setError(err.message)
    }
  }

  return {
    currentSession,
    isLoading,
    error,
    createSession,
    updateProgress,
    endSession,
    loadCurrentSession
  }
}
