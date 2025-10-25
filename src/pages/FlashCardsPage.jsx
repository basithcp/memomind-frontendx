// FlashCardsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { contentAPI } from '../api/content';
import styles from "./NotesPage.module.css";

const FlashCardsPage = () => {
  const [fcs, setFCs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : null;
      if (!userId) {
        setError('User not authenticated. Please login again.');
        return;
      }
      const result = await contentAPI.getSavedFCs(userId);
      setFCs(result.data || []);
    } catch (error) {
      console.error('Error loading flashcards:', error);
      setError(error.message || 'Failed to load flashcards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this Flashcard set?")) return;
    
    try {
      const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : null;
      if (!userId) {
        setError('User not authenticated. Please login again.');
        return;
      }
      await contentAPI.deleteSavedFC(userId, itemId);
      setFCs((prev) => prev.filter((n) => n.itemId !== itemId));
    } catch (error) {
      console.error('Error deleting Flashcard set:', error);
      alert('Failed to delete Flashcard set. Please try again.');
    }
  };

  const handleOpen = (fc) => {
    // navigate to the load-flashcards route and pass the note via location.state
    navigate(`/load-flashcards/${fc.itemId}`, { state: { fc } });
  };

  if (loading) {
    return (
      <div className={styles.newNotesContainer}>
        <h1 className={styles.newNotesTitle}>Your Flashcards</h1>
        <div className="text-center p-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your flashcards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.newNotesContainer}>
        <h1 className={styles.newNotesTitle}>Your Flashcards</h1>
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadFlashcards}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.newNotesContainer}>
      <h1 className={styles.newNotesTitle}>Your Flashcards</h1>

      <div className={styles.newNotesList} role="list">
        {fcs.length === 0 ? (
          <div className={styles.newNotesEmpty}>No saved Flashcards found.</div>
        ) : (
          fcs.map((fc) => (
            <article key={fc._id} className={styles.newNotesCard} role="listitem">
              <div className={styles.newNotesCardHeader}>
                <h2 className={styles.newNotesItemName}>{fc.title || fc.itemName}</h2>
                <button
                  className={styles.newNotesDeleteBtn}
                  onClick={() => handleDelete(fc.itemId)}
                  aria-label={`Delete ${fc.title || fc.itemName}`}
                  title="Delete"
                >
                  ✕
                </button>
              </div>

              <div className={styles.newNotesCardBody}>
                <div className={styles.newNotesMetaRow}>
                  <span className={styles.newNotesMetaLabel}>Added:</span>
                  <time className={styles.newNotesMetaValue} dateTime={fc.createdAt}>
                    {new Date(fc.createdAt).toLocaleString()}
                  </time>
                </div>
                {fc.totalCards && (
                  <div className={styles.newNotesMetaRow}>
                    <span className={styles.newNotesMetaLabel}>Cards:</span>
                    <span className={styles.newNotesMetaValue}>{fc.totalCards}</span>
                  </div>
                )}
                {fc.subject && (
                  <div className={styles.newNotesMetaRow}>
                    <span className={styles.newNotesMetaLabel}>Subject:</span>
                    <span className={styles.newNotesMetaValue}>{fc.subject}</span>
                  </div>
                )}
              </div>

              <div className={styles.newNotesCardFooter}>
                <button
                  className={styles.newNotesPrimaryBtn}
                  onClick={() => handleOpen(fc)}
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

export default FlashCardsPage;
