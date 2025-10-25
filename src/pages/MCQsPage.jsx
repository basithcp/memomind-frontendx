// MCQsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { contentAPI } from '../api/content';
import styles from "./NotesPage.module.css";

const MCQsPage = () => {
  const [mcqs, setMCQs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadMCQs();
  }, []);

  const loadMCQs = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : null;
      if (!userId) {
        setError('User not authenticated. Please login again.');
        return;
      }
      const result = await contentAPI.getSavedMCQs(userId);
      setMCQs(result.data || []);
    } catch (error) {
      console.error('Error loading MCQs:', error);
      setError(error.message || 'Failed to load MCQs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this MCQ set?")) return;
    
    try {
      const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : null;
      if (!userId) {
        setError('User not authenticated. Please login again.');
        return;
      }
      await contentAPI.deleteSavedMCQ(userId, itemId);
      setMCQs((prev) => prev.filter((n) => n.itemId !== itemId));
    } catch (error) {
      console.error('Error deleting MCQ set:', error);
      alert('Failed to delete MCQ set. Please try again.');
    }
  };

  const handleOpen = (mcq) => {
    // navigate to the load-notes route. we include the note id in the path
    // and also pass the note via location.state for convenience.
    // If you prefer just '/load-notes' without the id, change the path accordingly.
    navigate(`/load-mcq/${mcq.itemId}`, { state: { mcq } });
  };

  if (loading) {
    return (
      <div className={styles.newNotesContainer}>
        <h1 className={styles.newNotesTitle}>Your MCQs</h1>
        <div className="text-center p-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your MCQs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.newNotesContainer}>
        <h1 className={styles.newNotesTitle}>Your MCQs</h1>
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadMCQs}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.newNotesContainer}>
      <h1 className={styles.newNotesTitle}>Your MCQs</h1>

      <div className={styles.newNotesList} role="list">
        {mcqs.length === 0 ? (
          <div className={styles.newNotesEmpty}>No saved MCQs found.</div>
        ) : (
          mcqs.map((mcq) => (
            <article key={mcq._id} className={styles.newNotesCard} role="listitem">
              <div className={styles.newNotesCardHeader}>
                <h2 className={styles.newNotesItemName}>{mcq.title || mcq.itemName}</h2>
                <button
                  className={styles.newNotesDeleteBtn}
                  onClick={() => handleDelete(mcq.itemId)}
                  aria-label={`Delete ${mcq.title || mcq.itemName}`}
                  title="Delete"
                >
                  ✕
                </button>
              </div>

              <div className={styles.newNotesCardBody}>
                <div className={styles.newNotesMetaRow}>
                  <span className={styles.newNotesMetaLabel}>Added:</span>
                  <time className={styles.newNotesMetaValue} dateTime={mcq.createdAt}>
                    {new Date(mcq.createdAt).toLocaleString()}
                  </time>
                </div>
                {mcq.totalQuestions && (
                  <div className={styles.newNotesMetaRow}>
                    <span className={styles.newNotesMetaLabel}>Questions:</span>
                    <span className={styles.newNotesMetaValue}>{mcq.totalQuestions}</span>
                  </div>
                )}
                {mcq.subject && (
                  <div className={styles.newNotesMetaRow}>
                    <span className={styles.newNotesMetaLabel}>Subject:</span>
                    <span className={styles.newNotesMetaValue}>{mcq.subject}</span>
                  </div>
                )}
              </div>

              <div className={styles.newNotesCardFooter}>
                <button
                  className={styles.newNotesPrimaryBtn}
                  onClick={() => handleOpen(mcq)}
                >
                  Open
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

export default  MCQsPage;
