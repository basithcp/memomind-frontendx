import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { contentAPI } from '../api/content';
import ChatPromptBar from '../components/ChatPromptBar';

const GenerateMCQPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(true) // true when generating MCQs
  const [isFollowUp, setIsFollowUp] = useState(false) // true when processing follow-up
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [savedDocument, setSavedDocument] = useState(null) // Saved document for revision
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [error, setError] = useState('')

  const fetchGuardRef = useRef(false)
  const hasCalledRef = useRef(false)
  const currentItemIdRef = useRef(null)

  const {itemName, itemId } = useParams()
  const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : null;

  // Generate MCQs (single step)
  const generateMCQs = async () => {
    let mounted = true
    setIsGenerating(true)
    setError('')

    try {
      const rawUser = localStorage.getItem('user')
      const userId = rawUser ? JSON.parse(rawUser).username : null
      if (!userId) throw new Error('User not authenticated. Please login again.')
      if (!itemId) throw new Error('No itemId provided in route.')

      // Call backend to generate MCQs (single API call)
      const options = {
        count: 10,
        difficulty: 'medium',
        includeExplanation: true
      }

      const result = await contentAPI.generateMCQsStructure(userId, itemId, options)
      console.log("Generate MCQs response:", result);
      
      if (!mounted) return

      // Process the generated MCQs
      const questions = result.questions || result || []
      setGeneratedQuestions(questions)
      setSavedDocument({
        questions: questions,
        totalQuestions: questions.length,
        subject: 'Generated MCQs',
        type: 'mcqs'
      })
      setIsGenerating(false)
      
    } catch (err) {
      console.error('Error generating MCQs:', err)
      if (err && err.response) {
        const status = err.response.status
        const body = err.response.data
        const serverMsg = body && (body.error || body.message) ? (body.error || body.message) : JSON.stringify(body)
        setError(`Server error (${status}): ${serverMsg}`)
      } else if (err && err.request) {
        setError('No response from server. Network error or server is unreachable.')
      } else {
        setError(err && err.message ? err.message : 'Failed to generate MCQs.')
      }

      setGeneratedQuestions([])
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
      console.log('Already called generateMCQs for this itemId, skipping...')
      return
    }
    
    hasCalledRef.current = true
    let cancelled = false

    const fetchMCQs = async () => {
      try {
        await generateMCQs()
      } catch (error) {
        console.error('Error in fetchMCQs:', error)
      }
    }

    fetchMCQs()

    return () => {
      cancelled = true
    }
  }, [itemId])

  const currentQuestion = generatedQuestions[currentQuestionIndex] || {
    question: '',
    options: [],
    answer: null,
  }

  const handleAnswerSelect = (answerIndex) => {
    if (!showResult) {
      setSelectedAnswer(answerIndex)
      setShowResult(true)
      if (answerIndex === currentQuestion.answer) {
        setScore((prev) => prev + 1)
      }
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < generatedQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const handleModify = (newQuestions) => {
    setGeneratedQuestions(newQuestions)
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
      
      // Call follow-up API for MCQs
      const result = await contentAPI.followUpMCQs(userId, itemId, prompt)
      console.log("Follow-up response:", result);
      
      // Process the updated MCQs
      const questions = result.questions || result || []
      
      // Replace the current content with follow-up results
      setGeneratedQuestions(questions)
      setSavedDocument({
        questions: questions,
        totalQuestions: questions.length,
        subject: 'Generated MCQs',
        type: 'mcqs'
      })
      
      // Reset quiz state for new questions
      setCurrentQuestionIndex(0)
      setSelectedAnswer(null)
      setShowResult(false)
      setScore(0)
      
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

  const handleSave = async (questions) => {
    try {
      const rawUser = localStorage.getItem('user')
      const userId = rawUser ? JSON.parse(rawUser).username : null
      if (!userId) throw new Error('User not authenticated. Please login again.')
      if (!itemId) throw new Error('No item id available to save.')

      // Use the saved document (generated MCQs structure) for the revision call
      const documentToSave = savedDocument || {
        questions: questions,
        totalQuestions: questions.length,
        subject: 'Generated MCQs',
        type: 'mcqs'
      }
      
      const payload = {
        title: documentToSave.title || 'Generated MCQs',
        questions: documentToSave.questions || questions,
        totalQuestions: documentToSave.totalQuestions || questions.length,
        subject: documentToSave.subject || 'Generated MCQs',
        type: 'mcqs',
        date: new Date().toISOString(),
      }
      
      console.log("Saving MCQs document:", payload);
      
      await contentAPI.saveMCQ(userId, itemId, itemName, payload);
      alert('MCQs saved for revision! You can now access them from the revision menu.');
    } catch (error) {
      console.error('Error saving MCQs:', error);
      alert('Failed to save MCQs. Please try again.');
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
                  <h5 className="mb-3">Generating MCQs from your document...</h5>
                  <div className="progress mb-3">
                    <div 
                      className="progress-bar progress-bar-custom" 
                      style={{ width: '75%' }}
                    />
                  </div>
                  <p className="text-muted mb-0">Creating MCQs from your document...</p>
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
                      style={{ width: '75%' }}
                    />
                  </div>
                  <p className="text-muted mb-0">Updating MCQs based on your request...</p>
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
            <h2 className="text-dark">Generated MCQs</h2>
            <div>
              {/* Save button (replaces Modify) */}
              <button
                className="btn btn-outline-success"
                onClick={() => handleSave(generatedQuestions)}
              >
                Save for Revision
              </button>
            </div>
          </div>

          {/* MCQ Session */}
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {/* Question Card */}
              <div className="question-card p-4 mb-4 rounded">
                <h4 className="fw-bold text-dark mb-0">Q. {currentQuestion.question}</h4>
              </div>

              {/* Answer Options */}
              <div className="mb-4">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`answer-option p-3 mb-3 rounded ${
                      showResult
                        ? index === currentQuestion.answer
                          ? 'correct'
                          : index === selectedAnswer && index !== currentQuestion.answer
                          ? 'incorrect'
                          : ''
                        : selectedAnswer === index
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                    style={{ cursor: showResult ? 'default' : 'pointer' }}
                  >
                    <span className="fw-semibold me-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </div>
                ))}
              </div>

              {/* Navigation Controls — bookmark removed, controls right-aligned */}
              <div className="d-flex justify-content-end align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-outline-primary me-3"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    ←
                  </button>
                  <span className="fw-semibold me-3">
                    {currentQuestionIndex + 1}/{generatedQuestions.length}
                  </span>
                  <button
                    className="btn btn-outline-primary"
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === generatedQuestions.length - 1}
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* NOTE: per your request, no ChatInterface is added here */}
        </div>
      </div>

      {/* Reused chat bar (NewChatPromptBar) with send and dropdown menu */}
      <ChatPromptBar
        onSend={handleFollowUp}
      />
    </div>
  )
}

export default GenerateMCQPage
