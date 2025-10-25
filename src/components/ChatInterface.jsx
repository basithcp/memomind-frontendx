import React, { useState } from 'react'

const ChatInterface = ({ onModify, onSave, content, type }) => {
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSendMessage = async () => {
    if (!message.trim()) return

    const userMessage = { role: 'user', content: message }
    setChatHistory(prev => [...prev, userMessage])
    setMessage('')
    setIsProcessing(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant',
        content: `I understand you want to modify the ${type}. Here's an updated version based on your request: "${message}". [This would be the actual modified content in a real implementation.]`
      }
      setChatHistory(prev => [...prev, aiResponse])
      setIsProcessing(false)
    }, 1000)
  }

  const handleSave = () => {
    onSave(content)
  }

  return (
    <div className="chat-interface">
      <div className="card card-custom">
        <div className="card-header">
          <h6 className="mb-0">Modify Content</h6>
        </div>
        <div className="card-body">
          {/* Chat History */}
          <div className="chat-history mb-3" style={{ height: '300px', overflowY: 'auto', border: '1px solid #dee2e6', padding: '10px', borderRadius: '5px' }}>
            {chatHistory.map((msg, index) => (
              <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-end' : 'text-start'}`}>
                <div className={`d-inline-block p-2 rounded ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-light'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="text-start">
                <div className="d-inline-block p-2 rounded bg-light">
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing your request...
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Type your modification request..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isProcessing}
            />
            <button
              className="btn btn-primary"
              onClick={handleSendMessage}
              disabled={isProcessing || !message.trim()}
            >
              Send
            </button>
          </div>
        </div>
        <div className="card-footer">
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setChatHistory([])}
            >
              Clear Chat
            </button>
            <button
              className="btn btn-success"
              onClick={handleSave}
            >
              Save for Revision
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
