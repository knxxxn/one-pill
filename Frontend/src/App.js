import React from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Mypage from './pages/Mypage';
import UserModifyPage from './pages/UserModifyPage';
import SearchResultPage from './pages/SearchResultPage';
import PillDetailPage from './pages/PillDetailPage';
import PrescriptionUploadPage from './pages/PrescriptionUploadPage';
import PrescriptionListPage from './pages/PrescriptionListPage';
import PharmacyMapPage from './pages/PharmacyMapPage';
import PrescriptionSearchPage from './pages/PrescriptionSearchPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={
            <>
              <Header showBack={false} />
              <div style={styles.content}><SearchBar /></div>
            </>
          } />
          <Route path="/login" element={
            <>
              <Header showBack={true} />
              <LoginPage />
            </>
          } />
          <Route path="/register" element={
            <>
              <Header showBack={true} />
              <RegisterPage />
            </>
          } />
          <Route path="/user/info" element={
            <>
              <Header showBack={true} />
              <Mypage />
            </>
          } />
          <Route path="/user/modify" element={
            <>
              <Header showBack={true} />
              <UserModifyPage />
            </>
          } />
          <Route path="/pill/info" element={
            <>
              <Header showBack={true} />
              <SearchResultPage />
            </>
          } />
          <Route path="/pill/detail/:itemSeq" element={
            <>
              <Header showBack={true} />
              <PillDetailPage />
            </>
          } />
          <Route path="/prescription/upload" element={
            <>
              <Header showBack={true} />
              <PrescriptionUploadPage />
            </>
          } />
          <Route path="/prescription/list" element={
            <>
              <Header showBack={true} />
              <PrescriptionListPage />
            </>
          } />
          <Route path="/prescription/search" element={
            <>
              <Header showBack={true} />
              <PrescriptionSearchPage />
            </>
          } />
          <Route path="/pharmacy/map" element={
            <>
              <Header showBack={true} />
              <PharmacyMapPage />
            </>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  content: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: '40px',
    width: '100%',
    height: '100%',
  },
};

export default App; 