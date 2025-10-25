// src/pages/UploadPage.jsx  (or wherever your UploadPage lives)
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fileAPI as contentAPI } from '../services/apiService';

const UploadPage = () => {
  const navigate = useNavigate()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showPostUploadOptions, setShowPostUploadOptions] = useState(false)
  const [uploadedItemId, setUploadedItemId] = useState(null)
  const [uploadedItemName, setUploadedItemName] = useState(null)
  const [error, setError] = useState('')

  const handleFileUpload = async (event) => {
    const file = event.target.files && event.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF file only.')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB.')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError('')

    try {
      const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : null;
      if (!userId) {
        setError('User not authenticated. Please login again.');
        return;
      }
      // Show upload progress until the backend acknowledges
      const result = await contentAPI.processFile(userId, file, (progress) => {
        setUploadProgress(progress)
      })

      // --- ADJUST HERE if backend returns id in a different key ---
      // Example shapes you might get:
      // 1) { itemId: 'abc123', message: 'ok' }
      // 2) { document: { id: 'abc123', name: 'file.pdf' } }
      // Here we try common keys and fall back to null.
      const itemId =
        result?.itemId ??
        result?.id ??
        result?.document?.id ??
        result?.document?._id ??
        result?.data?.itemId ??
        null

      const itemName = result?.itemName;


      if (!itemId) {
        // If backend didn't send a recognized id, keep the raw result for debugging
        console.warn('Upload succeeded but no itemId found in response:', result)
        setError('Upload succeeded but server response was unexpected. Check console.')
        setIsUploading(false)
        setUploadProgress(0)
        return
      }

      setUploadedItemId(itemId)
      setUploadedItemName(itemName)
      // persist for future pages / reloads
      try {
        localStorage.setItem('uploadedItemId', itemId)
      } catch (e) {
        // localStorage may fail in some environments; ignore
      }

      setIsUploading(false)
      setShowPostUploadOptions(true)
    } catch (err) {
      console.error('Upload error:', err)
      // try to get a friendly message
      const msg = err?.response?.data?.message || err?.message || 'Failed to upload file. Please try again.'
      setError(msg)
      setIsUploading(false)
      setUploadProgress(0)
    } finally {
      // reset the file input value so same-file re-upload is allowed
      if (event.target) event.target.value = ''
    }
  }

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="text-center">
            <h2 className="mb-4 text-dark">Upload your file to start a session :)</h2>

            {isUploading && (
              <div className="card card-custom p-4">
                <div className="card-body text-center">
                  <h5 className="mb-3">Uploading...</h5>
                  <div className="progress mb-3" style={{ height: '8px' }}>
                    <div
                      className="progress-bar progress-bar-custom"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-muted">{uploadProgress}% complete</p>
                </div>
              </div>
            )}

            {!isUploading && !showPostUploadOptions && (
              <div className="upload-area p-5 mb-4">
                <input
                  type="file"
                  id="file-upload"
                  className="d-none"
                  onChange={handleFileUpload}
                  accept=".pdf"
                />
                <label htmlFor="file-upload" className="btn btn-primary-custom btn-lg px-5 py-3">
                  <span className="me-2">☁️</span>
                  Upload
                </label>
                <p className="text-muted mt-3">Supported format: PDF (max 10MB)</p>
                {error && (
                  <div className="alert alert-danger mt-3" role="alert">
                    {error}
                  </div>
                )}
              </div>
            )}

            {!isUploading && showPostUploadOptions && (
              <div className="card card-custom p-4">
                <div className="card-body">
                  <h5 className="mb-3">Choose what you want to create from your upload</h5>
                  <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
                    <Link to={`/generate-notes/${uploadedItemName}/${uploadedItemId}`} className="btn btn-outline-primary px-4 py-2">
                      📄 Generate Notes
                    </Link>
                    <Link to={`/generate-mcq/${uploadedItemName}/${uploadedItemId}`} className="btn btn-outline-primary px-4 py-2">
                      ❓ Generate MCQs
                    </Link>
                    <Link to={`/generate-flashcards/${uploadedItemName}/${uploadedItemId}`} className="btn btn-outline-primary px-4 py-2">
                      🃏 Generate Flashcards
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadPage
