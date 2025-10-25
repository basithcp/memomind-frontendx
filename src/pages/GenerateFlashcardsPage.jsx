import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contentAPI } from '../api/content';
import ChatPromptBar from '../components/ChatPromptBar';

const GenerateFlashcardsPage = () => {
  const {itemName, itemId } = useParams()
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(true) // true when generating flashcards
  const [isFollowUp, setIsFollowUp] = useState(false) // true when processing follow-up
  const [generatedFlashcards, setGeneratedFlashcards] = useState([])
  const [savedDocument, setSavedDocument] = useState(null) // Saved document for revision
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [error, setError] = useState('')

  const fetchGuardRef = useRef(false)
  const hasCalledRef = useRef(false)
  const currentItemIdRef = useRef(null)

  const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : null;

  // Generate flashcards (single step)
  const generateFlashcards = async () => {
    let mounted = true
    setIsGenerating(true)
    setError('')

    try {
      const rawUser = localStorage.getItem('user')
      const userId = rawUser ? JSON.parse(rawUser).username : null
      if (!userId) throw new Error('User not authenticated. Please login again.')
      if (!itemId) throw new Error('No itemId provided in route.')

      // Call backend to generate flashcards (single API call)
      const options = {
        count: 15,
        difficulty: 'medium',
        includeCategories: true
      }

      const result = await contentAPI.generateFlashcardsStructure(userId, itemId, options)
      console.log("Generate flashcards response:", result);
      
      if (!mounted) return

      // Process the generated flashcards
      const flashcards = result.flashcards || result.questions || result || []
      setGeneratedFlashcards(flashcards)
      setSavedDocument({
        flashcards: flashcards,
        totalCards: flashcards.length,
        subject: 'Generated Flashcards',
        type: 'flashcards'
      })
      setIsGenerating(false)
      
    } catch (err) {
      console.error('Error generating flashcards:', err)
      if (err && err.response) {
        const status = err.response.status
        const body = err.response.data
        const serverMsg = body && (body.error || body.message) ? (body.error || body.message) : JSON.stringify(body)
        setError(`Server error (${status}): ${serverMsg}`)
      } else if (err && err.request) {
        setError('No response from server. Network error or server is unreachable.')
      } else {
        setError(err && err.message ? err.message : 'Failed to generate flashcards.')
      }

      setGeneratedFlashcards([])
      setSavedDocument(null)
      setIsGenerating(false)
    } finally {
      return () => {
        mounted = false
      }
    }
  }

  // Reset flags when itemId changes
  useEffect(() => {
    if (currentItemIdRef.current !== itemId) {
      hasCalledRef.current = false
      fetchGuardRef.current = false
      currentItemIdRef.current = itemId
    }
  }, [itemId])

  useEffect(() => {
    if (hasCalledRef.current) {
      console.log('Already called generateFlashcards for this itemId, skipping...')
      return
    }
    
    hasCalledRef.current = true
    let cancelled = false

    const fetchFlashcards = async () => {
      try {
        await generateFlashcards()
      } catch (error) {
        console.error('Error in fetchFlashcards:', error)
      }
    }

    fetchFlashcards()

    return () => {
      cancelled = true
    }
  }, [itemId])

  const currentCard = generatedFlashcards[currentCardIndex] || {
    question: '',
    answer: '',
  }

  const handleShowAnswer = () => {
    setShowAnswer((s) => !s)
  }

  const handleNextCard = () => {
    if (currentCardIndex < generatedFlashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1)
      setShowAnswer(false)
    }
  }

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1)
      setShowAnswer(false)
    }
  }

  const handleModify = (newFlashcards) => {
    setGeneratedFlashcards(newFlashcards)
  }

  // Follow-up handler for ChatPromptBar
  const handleFollowUp = async (prompt) => {
    try {
      const rawUser = localStorage.getItem('user')
      const userId = rawUser ? JSON.parse(rawUser).username : null
      if (!userId) throw new Error('User not authenticated. Please login again.')
      if (!itemId) throw new Error('No item id available for follow-up.')

      console.log("Follow-up prompt:", prompt);
      
      // Set loading state
      setIsFollowUp(true)
      
      // Call follow-up API for flashcards
      const result = await contentAPI.followUpFlashcards(userId, itemId, prompt)
      console.log("Follow-up response:", result);
      
      // Process the updated flashcards
      const flashcards = result.flashcards || result.questions || result || []
      
      // Replace the current content with follow-up results
      setGeneratedFlashcards(flashcards)
      setSavedDocument({
        flashcards: flashcards,
        totalCards: flashcards.length,
        subject: 'Generated Flashcards',
        type: 'flashcards'
      })
      
      // Reset flashcard state for new cards
      setCurrentCardIndex(0)
      setShowAnswer(false)
      
      // Clear loading state
      setIsFollowUp(false)
      
    } catch (err) {
      console.error('Error in follow-up:', err)
      
      // Clear loading state on error
      setIsFollowUp(false)
      
      if (err && err.response) {
        const status = err.response.status
        const body = err.response.data
        const serverMsg = body && (body.error || body.message) ? (body.error || body.message) : JSON.stringify(body)
        alert(`Follow-up failed (${status}): ${serverMsg}`)
      } else if (err && err.request) {
        alert('No response from server. Network error or server is unreachable.')
      } else {
        alert(err && err.message ? err.message : 'Failed to process follow-up.')
      }
    }
  }

  const handleSave = async (flashcards) => {
    try {
      const rawUser = localStorage.getItem('user')
      const userId = rawUser ? JSON.parse(rawUser).username : null
      if (!userId) throw new Error('User not authenticated. Please login again.')
      if (!itemId) throw new Error('No item id available to save.')

      // Use the saved document (generated flashcards structure) for the revision call
      const documentToSave = savedDocument || {
        flashcards: flashcards,
        totalCards: flashcards.length,
        subject: 'Generated Flashcards',
        type: 'flashcards'
      }
      
      const payload = {
        title: documentToSave.title || 'Generated Flashcards',
        flashcards: documentToSave.flashcards || flashcards,
        totalCards: documentToSave.totalCards || flashcards.length,
        subject: documentToSave.subject || 'Generated Flashcards',
        type: 'flashcards',
        date: new Date().toISOString(),
      }
      
      console.log("Saving flashcards document:", payload);
      
      await contentAPI.saveFlashcard(userId, itemId, itemName, payload);
      alert('Flashcards saved for revision! You can now access them from the revision menu.');
    } catch (error) {
      console.error('Error saving flashcards:', error);
      alert('Failed to save flashcards. Please try again.');
    }
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center">
              <div className="card card-custom p-4">
                <div className="card-body">
                  <h5 className="mb-3 text-danger">Error</h5>
                  <p className="text-muted">{error}</p>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => navigate('/upload')}
                  >
                    Upload New File
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center">
              <div className="card card-custom p-4">
                <div className="card-body">
                  <h5 className="mb-3">Generating flashcards from your document...</h5>
                  <div className="progress mb-3">
                    <div 
                      className="progress-bar progress-bar-custom" 
                      style={{ width: '80%' }}
                    />
                  </div>
                  <p className="text-muted mb-0">Creating flashcards from your document...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isFollowUp) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center">
              <div className="card card-custom p-4">
                <div className="card-body">
                  <h5 className="mb-3">Processing your follow-up request...</h5>
                  <div className="progress mb-3">
                    <div 
                      className="progress-bar progress-bar-custom" 
                      style={{ width: '80%' }}
                    />
                  </div>
                  <p className="text-muted mb-0">Updating flashcards based on your request...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid" style={{ paddingBottom: 96 /* room for prompt bar */ }}>
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-dark">Generated Flashcards</h2>
            <div>
              {/* Replaced Modify Content with Save for Revision */}
              <button className="btn btn-outline-success" onClick={() => handleSave(generatedFlashcards)}>
                Save for Revision
              </button>
            </div>
          </div>

          {/* Flashcard Session */}
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {/* Flashcard */}
              <div className="flashcard mb-4">
                <div className="text-center p-4">
                  <h4 className="fw-bold text-dark mb-4">{showAnswer ? currentCard.answer : currentCard.question}</h4>
                  <button className="btn btn-primary-custom px-4 py-2" onClick={handleShowAnswer}>
                    {showAnswer ? 'Hide' : 'Show'} Answer
                  </button>
                </div>
              </div>

              {/* Navigation Controls — BOOKMARK BUTTON REMOVED and controls aligned to the right */}
              <div className="d-flex justify-content-end align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-outline-primary me-3"
                    onClick={handlePreviousCard}
                    disabled={currentCardIndex === 0}
                  >
                    ←
                  </button>
                  <span className="fw-semibold me-3">
                    {currentCardIndex + 1}/{generatedFlashcards.length}
                  </span>
                  <button
                    className="btn btn-outline-primary"
                    onClick={handleNextCard}
                    disabled={currentCardIndex === generatedFlashcards.length - 1}
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* NOTE: per request, no ChatInterface is added here */}
        </div>
      </div>

      {/* Reused chat bar (ChatPromptBar) with send and dropdown menu */}
      <ChatPromptBar
        onSend={handleFollowUp}
      />
    </div>
  )
}

export default GenerateFlashcardsPage
