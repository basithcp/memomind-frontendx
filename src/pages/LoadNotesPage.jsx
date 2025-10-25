import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { contentAPI } from '../api/content';

const LoadNotesPage = () => {
  const { itemId } = useParams();
  const [isGenerating, setIsGenerating] = useState(true); // stay true until API returns
  const [note, setNote] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null); // object URL / data URL if backend returns PDF
  const [error, setError] = useState('');

  // refs to avoid double-fetch in StrictMode and to track latest pdfUrl for cleanup
  const fetchGuardRef = useRef(false);
  const pdfUrlRef = useRef(null);

  // helpers
  const base64ToBlob = (base64, mime = 'application/pdf') => {
    try {
      const cleaned = base64.replace(/^data:[^;]+;base64,/, '');
      const byteChars = atob(cleaned);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mime });
    } catch (e) {
      // rethrow as more descriptive error
      throw new Error('Failed to parse base64 PDF data.');
    }
  };

  const createObjectURLFromBase64 = (base64, mime) => {
    const blob = base64ToBlob(base64, mime);
    return URL.createObjectURL(blob);
  };

  const cleanupPdfUrl = (url) => {
    try {
      if (url && typeof url === 'string' && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      // ignore
    }
  };

  const loadSavedNote = async () => {
    let mounted = true;
    setIsGenerating(true);
    setError('');

    // cleanup any previous pdfUrl (use ref to ensure correct latest value)
    if (pdfUrlRef.current) {
      cleanupPdfUrl(pdfUrlRef.current);
      pdfUrlRef.current = null;
      setPdfUrl(null);
    }

    try {
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).username : null;
      if (!userId) throw new Error('User not authenticated. Please login again.');
      if (!itemId) throw new Error('No note id provided in route.');

      const res = await contentAPI.loadSavedNote(userId, itemId);

      // payload may be: { note: { ... } } or the note object directly
      if (!mounted) return;

      const payload = res;
      
      if (!payload) {
        throw new Error('Server returned empty response when loading the note.');
      }

      // if backend returns a PDF directly (base64 or data URL or URL), try to handle it
      // check several likely keys to be robust
      const possiblePdfString =
        payload?.pdf ??
        payload?.pdfBase64 ??
        payload?.fileBase64 ??
        payload?.dataUrl ??
        payload?.pdfDataUrl ??
        payload?.pdfUrl ??
        null;

      if (possiblePdfString) {
        // If it's a full data URL (data:application/pdf;base64,....) we can use it directly.
        if (typeof possiblePdfString === 'string' && possiblePdfString.startsWith('data:')) {
          setPdfUrl(possiblePdfString);
          pdfUrlRef.current = possiblePdfString;
        } else if (typeof possiblePdfString === 'string' && possiblePdfString.startsWith('http')) {
          // it's a remote url
          setPdfUrl(possiblePdfString);
          pdfUrlRef.current = possiblePdfString;
        } else if (typeof possiblePdfString === 'string') {
          // assume base64 without data prefix
          const url = createObjectURLFromBase64(possiblePdfString, 'application/pdf');
          setPdfUrl(url);
          pdfUrlRef.current = url;
        } else {
          // unknown format - ignore pdf and fall back to JSON note
        }
      }

      // If payload itself looks like a note JSON (has title or sections), keep it
      const hasNoteShape = !!(payload?.title || payload?.sections || payload?.content || payload?.body);
      if (hasNoteShape) {
        setNote(payload);
      } else if (!possiblePdfString) {
        // neither pdf nor note structure -> treat as unexpected
        setNote(null);
        throw new Error('Loaded content is in an unexpected format.');
      }
    } catch (err) {
      console.error('Error loading saved note:', err);
      // axios-style errors
      if (err && err.response) {
        const status = err.response.status;
        const body = err.response.data;
        const serverMsg = body && (body.error || body.message) ? (body.error || body.message) : JSON.stringify(body);
        setError(`Server error (${status}): ${serverMsg}`);
      } else if (err && err.request) {
        setError('No response from server. Network error or server is unreachable.');
      } else {
        setError(err && err.message ? err.message : 'Failed to load the note.');
      }
      setNote(null);

      if (pdfUrlRef.current) {
        cleanupPdfUrl(pdfUrlRef.current);
        pdfUrlRef.current = null;
        setPdfUrl(null);
      }
    } finally {
      if (mounted) setIsGenerating(false);
    }

    // return cleanup closure to be used by effect if necessary
    return () => {
      mounted = false;
    };
  };

  useEffect(() => {
    let cancelled = false;

    // prevent double-running in React StrictMode (dev) or duplicate calls
    if (fetchGuardRef.current) return;
    fetchGuardRef.current = true;

    (async () => {
      await loadSavedNote();
      if (cancelled) return;
    })();

    return () => {
      cancelled = true;
      // allow future re-fetches when component unmounts or itemId changes
      fetchGuardRef.current = false;

      // revoke any created object URL on unmount
      if (pdfUrlRef.current) {
        cleanupPdfUrl(pdfUrlRef.current);
        pdfUrlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  if (isGenerating) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center">
              <div className="card card-custom p-4">
                <div className="card-body">
                  <h5 className="mb-3">Loading saved note...</h5>
                  <div className="progress">
                    <div className="progress-bar progress-bar-custom" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
                <button className="btn btn-primary" onClick={loadSavedNote}>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render PDF if available, otherwise render JSON note
  return (
    <div className="container-fluid" style={{ paddingBottom: 96 }}>
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-dark">{note?.title ?? 'Saved Note'}</h2>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-10">
              {pdfUrl ? (
                // embed PDF; allow fallback link to open in new tab
                <div style={{ height: '80vh', border: '1px solid #e6e6e6' }}>
                  <iframe
                    title="Saved PDF"
                    src={pdfUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                  <div className="mt-2">
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                      Open PDF in new tab
                    </a>
                  </div>
                </div>
              ) : note ? (
                <div>
                  {note.sections && Array.isArray(note.sections) ? (
                    note.sections.map((sec, i) => (
                      <div key={i} className="card mb-3 p-3">
                        {sec.heading && <h5 className="mb-2">{sec.heading}</h5>}
                        {sec.paragraphs &&
                          Array.isArray(sec.paragraphs) &&
                          sec.paragraphs.map((p, idx) => (
                            <p key={idx} className="mb-1">
                              {p}
                            </p>
                          ))}
                        {/* fallback for other shapes */}
                        {!sec.paragraphs && sec.content && <p>{sec.content}</p>}
                      </div>
                    ))
                  ) : note.content ? (
                    <div className="card p-3">
                      <pre style={{ whiteSpace: 'pre-wrap' }}>{note.content}</pre>
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
        </div>
      </div>
    </div>
  );
};

export default LoadNotesPage;
