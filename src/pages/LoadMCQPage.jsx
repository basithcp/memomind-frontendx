import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { contentAPI } from '../api/content';

const LoadMCQPage = () => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const { itemId} = useParams();
  const [error, setError] = useState('');

  const loadSavedMCQ = async () => {
    let mounted = true;
    try {
      setIsGenerating(true);
      setError('');

      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).username : null;
      if (!userId) throw new Error('User not authenticated. Please login again.');
      if (!itemId) throw new Error('No MCQ id provided in route.');

      const res = await contentAPI.loadSavedMCQ(userId, itemId);
      if (!mounted) return;

      const payload = res?.mcq ?? res;
      
      let questions = payload.questions;

      if (!questions || questions.length === 0) {
        questions = [];
      }

      setGeneratedQuestions(questions);
    } catch (err) {
      console.error('Error loading saved MCQ:', err);
      setError(err?.message || 'Failed to load MCQ.');
      setGeneratedQuestions([]);
    } finally {
      if (mounted) setIsGenerating(false);
    }

    return () => {
      mounted = false;
    };
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadSavedMCQ();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [itemId]);

  const currentQuestion = generatedQuestions[currentQuestionIndex] || {
    question: '',
    options: [],
    answer: null,
  };

  const handleAnswerSelect = (answerIndex) => {
    if (!showResult) {
      setSelectedAnswer(answerIndex);
      setShowResult(true);
      if (answerIndex === currentQuestion.answer) {
        setScore((prev) => prev + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < generatedQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleModify = (newQuestions) => {
    setGeneratedQuestions(newQuestions);
  };

  const handleSave = (questions) => {
    console.log('Saving MCQs for revision:', questions);
    alert('MCQs saved for revision! You can now access them from the revision menu.');
  };

  if (isGenerating) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center">
              <div className="card card-custom p-4">
                <div className="card-body">
                  <h5 className="mb-3">Generating MCQs from your document...</h5>
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
                <button className="btn btn-primary" onClick={loadSavedMCQ}>Try Again</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ paddingBottom: 96 }}>
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-dark">Generated MCQs</h2>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="question-card p-4 mb-4 rounded">
                <h4 className="fw-bold text-dark mb-0">Q. {currentQuestion.question}</h4>
              </div>

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

              <div className="d-flex justify-content-end align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-outline-primary me-3"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    ←
                  </button>
                  {generatedQuestions.length > 0 && <span className="fw-semibold me-3">
                    {currentQuestionIndex + 1}/{generatedQuestions.length}
                  </span>
                  }
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

        </div>
      </div>
    </div>
  );
};

export default LoadMCQPage;
