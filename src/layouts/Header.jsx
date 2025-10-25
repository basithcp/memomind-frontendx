import { useNavigate } from 'react-router-dom';
const Header = () => {
  const navigate = useNavigate()
  const handleClick = () => {
    delete localStorage.token;
    navigate('/login')
  }
  const userStr = localStorage.getItem('user');
  const name = JSON.parse(userStr).fullName || 'user';
  return (
    <div className="bg-light border-bottom p-3">
      <div className="d-flex justify-content-end align-items-center">
        <div className="d-flex align-items-center">
          <span className="me-3 text-dark fw-semibold">{name}</span>
          <button onClick={handleClick} className="text-danger text-decoration-none me-3 border-0">
            <span className="me-1">→</span>log out
          </button>
          <div className="user-avatar">
            <span className="text-muted">👤</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
