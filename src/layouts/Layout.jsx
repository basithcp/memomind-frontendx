import Header from './Header'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      {/* Sidebar - Fixed Left Column */}
      <Sidebar />
      
      {/* Main Content Area - Right Column */}
      <div className="main-content-wrapper">
        <Header />
        <main className="main-content flex-grow-1 p-4 children-container">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
