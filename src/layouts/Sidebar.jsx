import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="sidebar p-4">
      {/* Logo Section */}
      <Link to="/" className='nav-link'>
        <div className="d-flex flex-column align-items-center mb-4">
          <div className="logo-icon mb-3">
            <div className="d-flex align-items-center justify-content-center">
              <div 
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  backgroundColor: '#FCD34D', 
                  borderRadius: '50%',
                  marginRight: '8px'
                }}
              />
              <div 
                style={{ 
                  width: '16px', 
                  height: '12px', 
                  backgroundColor: 'white', 
                  borderRadius: '2px'
                }}
              />
            </div>
          </div>
          <h4 className="text-white fw-bold mb-0">MemoMind</h4>
        </div>
      </Link>

      {/* Navigation Menu */}
      <nav className="mt-4">
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <Link 
              to="/upload" 
              className={`nav-link d-flex align-items-center py-2 px-3 rounded ${
                isActive('/upload') ? 'active' : ''
              }`}
            >
              <span className="me-2">📝</span>
              New session
            </Link>
          </li>
          
          <li className="nav-item mb-3">
            <div className="text-light fst-italic small mb-2">Saved Content (Revision)</div>
            <ul className="nav flex-column ms-3">
              <li className="nav-item mb-2">
                <Link 
                  to="/mcqs" 
                  className={`nav-link d-flex align-items-center py-2 px-3 rounded ${
                    isActive('/mcq-session') ? 'active' : ''
                  }`}
                >
                  <span className="me-2">❓</span>
                  Saved MCQs
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link 
                  to="/notes" 
                  className={`nav-link d-flex align-items-center py-2 px-3 rounded ${
                    isActive('/notes') ? 'active' : ''
                  }`}
                >
                  <span className="me-2">📄</span>
                  Saved Notes
                </Link>
              </li>
              <li className="nav-item mb-2">
                <Link 
                  to="/flashcards" 
                  className={`nav-link d-flex align-items-center py-2 px-3 rounded ${
                    isActive('/flashcards') ? 'active' : ''
                  }`}
                >
                  <span className="me-2">🃏</span>
                  Saved Flash Cards
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
