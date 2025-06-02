import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { AuthContext } from "../contexts/AuthContext";

function SlideMenu({ isOpen, onClose }) {
  const { isLoggedIn, logout, userName } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/");
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 2000,
          display: "flex",
          justifyContent: "flex-end",
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? "visible" : "hidden",
          transition: "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out",
        }}
        onClick={onClose}
      >
        <div
          style={{
            width: "250px",
            height: "100%",
            backgroundColor: "#fff",
            boxShadow: "-2px 0 5px rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
            transform: isOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s ease-in-out",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.menuHeader}>
            <button style={styles.closeButton} onClick={onClose}>
              <FaTimes />
            </button>
          </div>
          {isLoggedIn && (
            <div style={styles.userInfo}>
              <span style={styles.userName}>{userName} 님</span>
            </div>
          )}
          <div style={styles.menuContent}>
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => handleNavigation("/user/info")}
                  style={styles.menuItem}
                >
                  마이페이지
                </button>
                <button
                  onClick={() => handleNavigation("/prescription/upload")}
                  style={styles.menuItem}
                >
                  내 처방전
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigation("/login")}
                  style={styles.menuItem}
                >
                  로그인
                </button>
                <button
                  onClick={() => handleNavigation("/register")}
                  style={styles.menuItem}
                >
                  회원가입
                </button>
              </>
            )}
            <button
              onClick={() => handleNavigation("/pharmacy/map")}
              style={styles.menuItem}
            >
              내 주변 약국
            </button>
            {isLoggedIn && (
              <div style={styles.logoutContainer}>
                <button onClick={handleLogout} style={styles.logoutButton}>
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  menuContainer: {
    width: "250px",
    height: "100%",
    backgroundColor: "#fff",
    boxShadow: "-2px 0 5px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
  },
  menuHeader: {
    padding: "16px",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "flex-end",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#333",
    padding: "4px",
  },
  userInfo: {
    padding: "16px",
    borderBottom: "1px solid #e0e0e0",
    backgroundColor: "#f8f9fa",
  },
  userName: {
    fontSize: "18px",
    fontWeight: "500",
    color: "#333",
  },
  menuContent: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    flex: 1,
  },
  menuItem: {
    textDecoration: "none",
    color: "#333",
    fontSize: "16px",
    padding: "8px 0",
    border: "none",
    background: "none",
    cursor: "pointer",
    textAlign: "left",
    ":hover": {
      color: "#00aa9d",
    },
  },
  logoutContainer: {
    marginTop: "auto",
    paddingTop: "16px",
    borderTop: "1px solid #e0e0e0",
  },
  logoutButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    color: "#dc3545",
    fontSize: "16px",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "#e9ecef",
    },
  },
};

export default SlideMenu;
