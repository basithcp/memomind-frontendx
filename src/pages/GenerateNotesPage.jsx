// src/pages/GenerateNotesPage.jsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { contentAPI } from '../api/content'
import ChatPromptBar from '../components/ChatPromptBar'

const GenerateNotesPage = () => {
  const {itemName, itemId } = useParams()
  const navigate = useNavigate()

  const [isGenerating, setIsGenerating] = useState(false) // true when generating notes
  const [isCompiling, setIsCompiling] = useState(false) // true when compiling PDF
  const [isFollowUp, setIsFollowUp] = useState(false) // true when processing follow-up
  const [generatedNote, setGeneratedNote] = useState(null) // JSON-shaped note
  const [savedDocument, setSavedDocument] = useState(null) // Saved document for revision
  const [pdfUrl, setPdfUrl] = useState(null) // blob/data/http url if backend returns PDF
  const [showPreparing, setShowPreparing] = useState(true)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState('') // Current step description

  const fetchGuardRef = useRef(false)
  const pdfUrlRef = useRef(null)
  const hasCalledRef = useRef(false)
  const currentItemIdRef = useRef(null)

  const base64ToBlob = (base64, mime = 'application/pdf') => {
    try {
      const cleaned = base64.replace(/^data:[^;]+;base64,/, '')
      const byteChars = atob(cleaned)
      const byteNumbers = new Array(byteChars.length)
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      return new Blob([byteArray], { type: mime })
    } catch (e) {
      throw new Error('Failed to parse base64 PDF data.')
    }
  }

  const createObjectURLFromBase64 = (base64, mime) => {
    const blob = base64ToBlob(base64, mime)
    return URL.createObjectURL(blob)
  }

  const cleanupPdfUrl = (url) => {
    try {
      if (url && typeof url === 'string' && url.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      // ignore
    }
  }

  const arrayBufferToBase64 = (buffer) => {
    // Convert ArrayBuffer -> base64 in chunks to avoid arg length limits
    const bytes = new Uint8Array(buffer)
    const chunkSize = 0x8000 // 32k
    let binary = ''
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize)
      binary += String.fromCharCode.apply(null, chunk)
    }
    return btoa(binary)
  }

  // Step 1: Generate notes (JSON structure)
  const generateNotes = async () => {
    let mounted = true
    setIsGenerating(true)
    setCurrentStep('Generating notes...')
    setError('')

    try {
      const rawUser = localStorage.getItem('user')
      const userId = rawUser ? JSON.parse(rawUser).username : null
      if (!userId) throw new Error('User not authenticated. Please login again.')
      if (!itemId) throw new Error('No itemId provided in route.')

      // Call backend to generate notes (first API call)
      const options = {
        format: 'structured',
        includeSummary: true,
        includeKeyPoints: true,
      }

      // This should call the /generate endpoint
      const generateResponse = await contentAPI.generateNotesStructure(userId, itemId, options)
      console.log("Generate response:", generateResponse);
      
      if (!mounted) return

      // Process the generated notes structure
      const noteObj = {
        title: generateResponse.title || generateResponse?.notesTitle || 'Generated Notes',
        content: generateResponse.content || generateResponse?.notes || generateResponse?.text || null,
        sections: generateResponse.sections || generateResponse?.parts || null,
        summary: generateResponse.summary || null,
        keyPoints: generateResponse.keyPoints || generateResponse.key_points || null,
        subject: generateResponse.subject || null,
      }
      
      setGeneratedNote(noteObj)
      setSavedDocument(noteObj) // Save for revision call
      setIsGenerating(false)
      
      // Automatically proceed to PDF compilation
      await compilePDF()
      
    } catch (err) {
      console.error('Error generating notes:', err)
      if (err && err.response) {
        const status = err.response.status
        const body = err.response.data
        const serverMsg = body && (body.error || body.message) ? (body.error || body.message) : JSON.stringify(body)
        setError(`Server error (${status}): ${serverMsg}`)
      } else if (err && err.request) {
        setError('No response from server. Network error or server is unreachable.')
      } else {
        setError(err && err.message ? err.message : 'Failed to generate notes.')
      }

      setGeneratedNote(null)
      setSavedDocument(null)
      setIsGenerating(false)
    } finally {
      return () => {
        mounted = false
      }
    }
  }

  // Step 2: Compile PDF
  const compilePDF = async () => {
    let mounted = true
    setIsCompiling(true)
    setCurrentStep('Compiling PDF...')

    // cleanup previous pdf if any
    if (pdfUrlRef.current) {
      cleanupPdfUrl(pdfUrlRef.current)
      pdfUrlRef.current = null
      setPdfUrl(null)
    }

    try {
      const rawUser = localStorage.getItem('user')
      const userId = rawUser ? JSON.parse(rawUser).username : null
      if (!userId) throw new Error('User not authenticated. Please login again.')
      if (!itemId) throw new Error('No itemId provided in route.')

      // Call backend to export/compile PDF (second API call)
      const pdfResponse = await contentAPI.exportNotesPDF(userId, itemId)
      console.log("PDF response:", pdfResponse);
      
      if (!mounted) return

      // Handle the PDF response
      if (pdfResponse instanceof ArrayBuffer) {
        // Convert ArrayBuffer to base64 and create blob URL
        const base64 = arrayBufferToBase64(pdfResponse)
        const url = createObjectURLFromBase64(base64, 'application/pdf')
        setPdfUrl(url)
        pdfUrlRef.current = url
      } else if (typeof pdfResponse === 'string' && pdfResponse.length > 100) {
        // Check if it's a base64 string (likely PDF)
        if (pdfResponse.match(/^[A-Za-z0-9+/=]+$/) && pdfResponse.length > 1000) {
          // Looks like base64, try to create PDF
          try {
            const url = createObjectURLFromBase64(pdfResponse, 'application/pdf')
            setPdfUrl(url)
            pdfUrlRef.current = url
          } catch (error) {
            console.error('Failed to process base64 as PDF:', error)
            throw new Error('Failed to process PDF data.')
          }
        } else {
          throw new Error('Invalid PDF data received.')
        }
      } else {
        throw new Error('Unexpected PDF response format.')
      }

      // success
      setIsCompiling(false)
      setCurrentStep('')

      // show small "preparing" animation for a short time before showing content
      setTimeout(() => setShowPreparing(false), 500)
    } catch (err) {
      console.error('Error compiling PDF:', err)
      if (err && err.response) {
        const status = err.response.status
        const body = err.response.data
        const serverMsg = body && (body.error || body.message) ? (body.error || body.message) : JSON.stringify(body)
        setError(`Server error (${status}): ${serverMsg}`)
      } else if (err && err.request) {
        setError('No response from server. Network error or server is unreachable.')
      } else {
        setError(err && err.message ? err.message : 'Failed to compile PDF.')
      }

      if (pdfUrlRef.current) {
        cleanupPdfUrl(pdfUrlRef.current)
        pdfUrlRef.current = null
        setPdfUrl(null)
      }

      setIsCompiling(false)
      setCurrentStep('')
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
    // Only run if we haven't called for this itemId yet
    if (hasCalledRef.current) {
      console.log('Already called generateNotes for this itemId, skipping...')
      return
    }
    
    hasCalledRef.current = true
    
    let cancelled = false

    const fetchNotes = async () => {
      try {
        await generateNotes()
      } catch (error) {
        console.error('Error in fetchNotes:', error)
      }
    }

    fetchNotes()

    return () => {
      cancelled = true
      if (pdfUrlRef.current) {
        cleanupPdfUrl(pdfUrlRef.current)
        pdfUrlRef.current = null
      }
    }
  }, [itemId]) // Keep only itemId as dependency

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
      setCurrentStep('Processing follow-up...')
      
      // Call follow-up API for notes
      const result = await contentAPI.followUpNotes(userId, itemId, prompt)
      console.log("Follow-up response:", result);
      
      // Process the updated notes structure
      const noteObj = {
        title: result.title || result?.notesTitle || generatedNote?.title || 'Generated Notes',
        content: result.content || result?.notes || result?.text || generatedNote?.content || null,
        sections: result.sections || result?.parts || generatedNote?.sections || null,
        summary: result.summary || generatedNote?.summary || null,
        keyPoints: result.keyPoints || result.key_points || generatedNote?.keyPoints || null,
        subject: result.subject || generatedNote?.subject || null,
      }
      
      // Replace the current content with follow-up results
      setGeneratedNote(noteObj)
      setSavedDocument(noteObj)
      
      // Recompile PDF with updated content
      await compilePDF()
      
      // Clear loading state
      setIsFollowUp(false)
      setCurrentStep('')
      
    } catch (err) {
      console.error('Error in follow-up:', err)
      
      // Clear loading state on error
      setIsFollowUp(false)
      setCurrentStep('')
      
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

  // Save for revision handler (wired to save API)
  const handleSave = async (content) => {
    try {
      const rawUser = localStorage.getItem('user')
      const userId = rawUser ? JSON.parse(rawUser).username : null
      if (!userId) throw new Error('User not authenticated. Please login again.')
      if (!itemId) throw new Error('No item id available to save.')

      // Use the saved document (generated note structure) for the revision call
      const documentToSave = savedDocument || content
      const payload = {
        title: documentToSave.title || 'Generated Notes',
        content: documentToSave.content || null,
        sections: documentToSave.sections || null,
        summary: documentToSave.summary || null,
        keyPoints: documentToSave.keyPoints || null,
        subject: documentToSave.subject || null,
        date: documentToSave.date || new Date().toISOString(),
      }
      console.log("Saving document:", payload);
      
      await contentAPI.saveNote(userId, itemId, itemName, payload)

      alert('Content saved for revision! You can now access it from the revision menu.')
    } catch (err) {
      console.error('Error saving generated content:', err)
      let msg = 'Failed to save content. Please try again.'
      if (err && err.response && err.response.data) {
        msg = err.response.data.message || JSON.stringify(err.response.data)
      } else if (err && err.message) {
        msg = err.message
      }
      alert(msg)
    }
  }

  // UI: loading, error, or content (match LoadNotesPage layout)
  if (isGenerating || isCompiling) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center">
              <div className="card card-custom p-4">
                <div className="card-body">
                  <h5 className="mb-3">{currentStep}</h5>
                  <div className="progress mb-3">
                    <div 
                      className="progress-bar progress-bar-custom" 
                      style={{ 
                        width: isGenerating ? '50%' : '100%',
                        transition: 'width 0.5s ease-in-out'
                      }} 
                    />
                  </div>
                  {isGenerating && (
                    <p className="text-muted mb-0">Creating structured notes from your document...</p>
                  )}
                  {isCompiling && (
                    <p className="text-muted mb-0">Compiling notes into PDF format...</p>
                  )}
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
                  <h5 className="mb-3">{currentStep}</h5>
                  <div className="progress mb-3">
                    <div 
                      className="progress-bar progress-bar-custom" 
                      style={{ 
                        width: '75%',
                        transition: 'width 0.5s ease-in-out'
                      }} 
                    />
                  </div>
                  <p className="text-muted mb-0">Processing your follow-up request...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid" style={{ paddingBottom: 96 }}>
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Error</h4>
              <p>{error}</p>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" onClick={generateNotes}>
                  Try Again
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/upload')}>
                  Upload New File
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render: if backend returned a PDF, embed it. Otherwise show structured note.
  return (
    <div className="container-fluid" style={{ paddingBottom: 96 }}>
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-dark">{generatedNote?.title ?? 'Generated Notes'}</h2>
            <div>
              <button className="btn btn-outline-success" onClick={() => handleSave(generatedNote)}>
                Save for Revision
              </button>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-10">
              {pdfUrl ? (
                <div style={{ height: '80vh', border: '1px solid #e6e6e6' }}>
                  <iframe
                    title="Generated PDF"
                    src={pdfUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                  <div className="mt-2">
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                      Open PDF in new tab
                    </a>
                  </div>
                </div>
              ) : generatedNote ? (
                <div>
                  {generatedNote.sections && Array.isArray(generatedNote.sections) ? (
                    generatedNote.sections.map((sec, i) => (
                      <div key={i} className="card mb-3 p-3">
                        {sec.heading && <h5 className="mb-2">{sec.heading}</h5>}
                        {sec.paragraphs &&
                          Array.isArray(sec.paragraphs) &&
                          sec.paragraphs.map((p, idx) => (
                            <p key={idx} className="mb-1">
                              {p}
                            </p>
                          ))}
                        {!sec.paragraphs && sec.content && <p>{sec.content}</p>}
                      </div>
                    ))
                  ) : generatedNote.content ? (
                    <div className="card p-3">
                      <pre style={{ whiteSpace: 'pre-wrap' }}>{generatedNote.content}</pre>
                    </div>
                  ) : (
                    <div className="alert alert-info">No content available for this note.</div>
                  )}
                </div>
              ) : (
                <div className="alert alert-warning">Nothing to display for this item.</div>
              )}
            </div>
          </div>

          {/* keep ChatPromptBar as-is */}
          <div style={{ marginTop: 24 }}>
            <ChatPromptBar
              onSend={handleFollowUp}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default GenerateNotesPage
