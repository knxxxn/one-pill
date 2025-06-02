import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { commonPageStyles } from '../styles/pageStyles';

function PrescriptionSearchPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchResults = useMemo(() => location.state?.results || [], [location.state?.results]);

  useEffect(() => {
    if (searchResults.length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
  }, [searchResults]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>검색 결과</h1>
      {searchResults.length > 0 ? (
        <ul style={styles.resultList}>
          {searchResults.map(pill => (
            <li key={pill.itemSeq} style={styles.resultItem}>
              <p style={styles.pillName}>{pill.itemName}</p>
              <p style={styles.pillInfo}><strong>제약사:</strong> {pill.entpName}</p>
              <p style={styles.pillInfo}><strong>효능:</strong> {pill.efcyQesitm}</p>
              <button 
                style={styles.detailButton}
                onClick={() => navigate(`/pill/detail/${pill.itemSeq}`)}
              >
                상세 정보 보기
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p style={styles.noResults}>검색 결과가 없습니다</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    ...commonPageStyles.pageContainer,
    paddingBottom: '100px',
  },
  title: {
    ...commonPageStyles.title,
    textAlign: 'center',
    fontSize: '25px',
    marginBottom: '24px',
  },
  resultList: {
    width: '100%',
    maxWidth: '343px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    listStyle: 'none',
    padding: 0,
  },
  resultItem: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: '1px solid #00aa9d',
  },
  pillName: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '8px',
  },
  pillInfo: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px',
  },
  detailButton: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#00aa9d',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    marginTop: '12px',
    cursor: 'pointer',
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    marginTop: '24px',
    fontSize: '16px',
  },
};

export default PrescriptionSearchPage; 