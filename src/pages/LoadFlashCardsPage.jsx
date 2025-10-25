import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { contentAPI } from '../api/content';

const LoadFlashCardsPage = () => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedFlashcards, setGeneratedFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const { itemId } = useParams();
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadSavedFC = async () => {
      try {
        setIsGenerating(true);
        setError('');

        const user = localStorage.getItem('user');
        const userId = user ? JSON.parse(user).username : null;
        if (!userId) throw new Error('User not authenticated. Please login again.');
        if (!itemId) throw new Error('No flashcard id provided in route.');

        const res = await contentAPI.loadSavedFC?.(userId, itemId) ?? await contentAPI.loadSavedFlashcard?.(userId, itemId) ?? null;

        if (!mounted) return;

        const payload = res?.fc ?? res ?? {};
        // defensive extraction: try several common shapes
        let flashcards = payload.questions;
        // fallback to local dummy data if API returned nothing useful
        if (!flashcards || flashcards.length === 0) {
          flashcards = [];
        }

        setGeneratedFlashcards(flashcards);
      } catch (err) {
        console.error('Error loading saved Flashcards:', err);
        if (mounted) {
          setError(err?.message || 'Failed to load flashcards.');
          // keep UI usable by setting empty list (or you can fallback to fcs if you prefer)
          setGeneratedFlashcards([]);
        }
      } finally {
        if (mounted) setIsGenerating(false);
      }
    };

    loadSavedFC();

    return () => {
      mounted = false;
    };
  }, [itemId]); // re-run when route param changes

  const currentCard = generatedFlashcards[currentCardIndex] || {
    question: '',
    answer: '',
  };

  const handleShowAnswer = () => {
    setShowAnswer((s) => !s);
  };

  const handleNextCard = () => {
    if (currentCardIndex < generatedFlashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setShowAnswer(false);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setShowAnswer(false);
    }
  };

  const handleModify = (newFlashcards) => {
    setGeneratedFlashcards(newFlashcards);
  };

  const handleSave = (flashcards) => {
    console.log('Saving flashcards for revision:', flashcards);
    alert('Flashcards saved for revision! You can now access them from the revision menu.');
  };

  if (isGenerating) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center">
              <div className="card card-custom p-4">
                <div className="card-body">
                  <h5 className="mb-3">Generating flashcards from your document...</h5>
                  <div className="progress">
                    <div className="progress-bar progress-bar-custom" style={{ width: '80%' }}></div>
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
                <button className="btn btn-primary" onClick={() => {
                  // retry: reload by calling effect again - change key by resetting index and toggling isGenerating
                  setCurrentCardIndex(0);
                  setIsGenerating(true);
                  setError('');
                  // calling load again by temporarily toggling itemId-like behavior is not needed - effect depends on itemId
                  // so we call the loader directly:
                  (async () => {
                    // inline call of loader if necessary (keeps code simple)
                    try {
                      setIsGenerating(true);
                      setError('');
                      const user = localStorage.getItem('user');
                      const userId = user ? JSON.parse(user).username : null;
                      if (!userId) throw new Error('User not authenticated. Please login again.');
                      if (!itemId) throw new Error('No flashcard id provided in route.');

                      const res = await contentAPI.loadSavedFC?.(userId, itemId) ?? await contentAPI.loadSavedFlashcard?.(userId, itemId) ?? null;
                      const payload = res?.data ?? res ?? {};
                      let flashcards =
                        Array.isArray(payload)
                          ? payload
                          : Array.isArray(payload.questions)
                          ? payload.questions
                          : Array.isArray(payload.flashcards)
                          ? payload.flashcards
                          : Array.isArray(payload.fcs)
                          ? payload.fcs
                          : Array.isArray(payload.cards)
                          ? payload.cards
                          : [];

                      if (!flashcards || flashcards.length === 0) flashcards = fcs;
                      setGeneratedFlashcards(flashcards);
                    } catch (err) {
                      console.error('Retry failed:', err);
                      setError(err?.message || 'Failed to load flashcards.');
                      setGeneratedFlashcards(fcs);
                    } finally {
                      setIsGenerating(false);
                    }
                  })();
                }}>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ paddingBottom: 96 /* room for prompt bar */ }}>
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-dark">Generated Flashcards</h2>
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
                  {generatedFlashcards.length > 0 && (
                    <span className="fw-semibold me-3">
                      {currentCardIndex + 1}/{generatedFlashcards.length}
                    </span>
                  )}
                  <button
                    className="btn btn-outline-primary"
                    onClick={handleNextCard}
                    disabled={currentCardIndex === generatedFlashcards.length - 1 || generatedFlashcards.length === 0}
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
    </div>
  );
};

export default LoadFlashCardsPage;
