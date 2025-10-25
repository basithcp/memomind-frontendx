// NotesPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { contentAPI } from '../api/content';
import styles from "./NotesPage.module.css";

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : null;
      if (!userId) {
        setError('User not authenticated. Please login again.');
        return;
      }
      const result = await contentAPI.getSavedNotes(userId);
      setNotes(result.data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      setError(error.message || 'Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this Notes set?")) return;
    
    try {
      const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : null;
      if (!userId) {
        setError('User not authenticated. Please login again.');
        return;
      }
      await contentAPI.deleteSavedNote(userId, itemId);
      setNotes((prev) => prev.filter((n) => n.itemId !== itemId));
    } catch (error) {
      console.error('Error deleting Notes set:', error);
      alert('Failed to delete Notes set. Please try again.');
    }
  };

  const handleOpen = (note) => {
    navigate(`/load-notes/${note.itemId}`, { state: { note } });
  };

  if (loading) {
    return (
      <div className={styles.newNotesContainer}>
        <h1 className={styles.newNotesTitle}>Your Notes</h1>
        <div className="text-center p-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.newNotesContainer}>
        <h1 className={styles.newNotesTitle}>Your Notes</h1>
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadNotes}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.newNotesContainer}>
      <h1 className={styles.newNotesTitle}>Your Notes</h1>

      <div className={styles.newNotesList} role="list">
        {notes.length === 0 ? (
          <div className={styles.newNotesEmpty}>No saved notes found.</div>
        ) : (
          notes.map((note) => (
            <article key={note._id} className={styles.newNotesCard} role="listitem">
              <div className={styles.newNotesCardHeader}>
                <h2 className={styles.newNotesItemName}>{note.title || note.itemName}</h2>
                <button
                  className={styles.newNotesDeleteBtn}
                  onClick={() => handleDelete(note.itemId)}
                  aria-label={`Delete ${note.title || note.itemName}`}
                  title="Delete"
                >
                  ✕
                </button>
              </div>

              <div className={styles.newNotesCardBody}>
                <div className={styles.newNotesMetaRow}>
                  <span className={styles.newNotesMetaLabel}>Added:</span>
                  <time className={styles.newNotesMetaValue} dateTime={note.createdAt}>
                    {new Date(note.createdAt).toLocaleString()}
                  </time>
                </div>
                {note.subject && (
                  <div className={styles.newNotesMetaRow}>
                    <span className={styles.newNotesMetaLabel}>Subject:</span>
                    <span className={styles.newNotesMetaValue}>{note.subject}</span>
                  </div>
                )}
              </div>

              <div className={styles.newNotesCardFooter}>
                <button
                  className={styles.newNotesPrimaryBtn}
                  onClick={() => handleOpen(note)}
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
};

export default NotesPage;
