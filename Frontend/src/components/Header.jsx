import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaArrowLeft } from 'react-icons/fa';
import SlideMenu from './SlideMenu';

function Header({ showBack = true }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <div style={styles.headerContainer}>
        <div style={styles.topHeader}>
          {showBack && (
            <button
              style={styles.backButton}
              onClick={handleBack}
              aria-label="뒤로 가기"
            >
              <FaArrowLeft />
            </button>
          )}
          <Link to="/" style={styles.logoLink}>
            <img src="/logo.png" alt="One-Pill 로고 이미지" style={styles.logo} />
          </Link>
          <button
            style={styles.menuButton}
            onClick={() => setIsMenuOpen(true)}
            aria-label="메뉴 열기"
          >
            <FaBars />
          </button>
        </div>
      </div>
      <SlideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}

const styles = {
  headerContainer: {
    width: '100%',
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: '#fff',
    zIndex: 1000,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  topHeader: {
    width: '100%',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fff',
    padding: '0 16px',
    position: 'relative',
  },
  backButton: {
    background: 'none',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    color: '#000',
    fontSize: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    position: 'absolute',
    left: '16px',
    zIndex: 1,
  },
  menuButton: {
    background: 'none',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    color: '#000',
    fontSize: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    position: 'absolute',
    right: '16px',
    zIndex: 1,
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    width: '100%',
    height: '100%',
  },
  logo: {
    height: '40px',
    objectFit: 'contain',
  },
  navItems: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '16px',
    padding: '0 16px',
  },
};

export default Header;