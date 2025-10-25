import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import styles from './HomePage.module.css'

const HomePage = () => {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold text-dark mb-4">Welcome to MemoMind</h1>
            <p className="lead text-muted mb-5">
              Your intelligent study companion for effective learning and revision
            </p>
          </div>

          {/* FIRST ROW: single centered Upload card */}
          <div className={styles.firstRow}>
            <Link to="/upload" className={styles.cardLink}>
              <div className={`card ${styles.cardCustom} ${styles.firstCard} ${styles.uploadArea}`}>
                <div className="card-body d-flex flex-column justify-content-center">
                  <div className="mb-3">
                    <Icon name="upload" size="xl" />
                  </div>
                  <h5 className="card-title text-dark">Upload File</h5>
                  <p className="card-text text-muted">
                    Start a new session by uploading your study material
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* SECOND ROW: three cards */}
          <div className={styles.cardsGrid}>
            <Link to="/mcqs" className={styles.cardLink}>
              <div className={`card ${styles.cardCustom}`}>
                <div className="card-body d-flex flex-column justify-content-center">
                  <div className="mb-3">
                    <Icon name="mcq" size="xl" />
                  </div>
                  <h5 className="card-title text-dark">MCQs</h5>
                  <p className="card-text text-muted">Practice with multiple choice questions</p>
                </div>
              </div>
            </Link>

            <Link to="/notes" className={styles.cardLink}>
              <div className={`card ${styles.cardCustom}`}>
                <div className="card-body d-flex flex-column justify-content-center">
                  <div className="mb-3">
                    <Icon name="notes" size="xl" />
                  </div>
                  <h5 className="card-title text-dark">Notes</h5>
                  <p className="card-text text-muted">Review your generated study notes</p>
                </div>
              </div>
            </Link>

            <Link to="/flashcards" className={styles.cardLink}>
              <div className={`card ${styles.cardCustom}`}>
                <div className="card-body d-flex flex-column justify-content-center">
                  <div className="mb-3">
                    <Icon name="flashcards" size="xl" />
                  </div>
                  <h5 className="card-title text-dark">Flash Cards</h5>
                  <p className="card-text text-muted">Study with interactive flashcards</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
