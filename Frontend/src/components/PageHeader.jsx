import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBars } from 'react-icons/fa';
import SlideMenu from './SlideMenu';

function PageHeader({ title, onBack, showBack = true }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.leftSection}>
            {showBack && (
              <button 
                style={styles.backIconButton} 
                onClick={handleBack}
                aria-label="뒤로 가기"
              >
                <FaArrowLeft />
              </button>
            )}
            <button
              style={styles.menuButton}
              onClick={() => setIsMenuOpen(true)}
              aria-label="메뉴 열기"
            >
              <FaBars />
            </button>
          </div>
          <h1 style={styles.title}>{title}</h1>
        </div>
      </div>
      <SlideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}

const styles = {
  header: {
    width: '100%',
    backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    maxWidth: '800px',
    margin: '0 auto',
    position: 'relative',
    height: '48px',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  backIconButton: {
    background: 'none',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    color: '#000',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    background: 'none',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    color: '#000',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
};

export default PageHeader; 