import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { message } from "antd";

function SearchResultPage() {
  const location = useLocation();
  const [searchResults, setSearchResults] = useState(
    location.state?.results || []
  );
  const [totalPages, setTotalPages] = useState(location.state?.totalPages || 1);
  const [currentPage, setCurrentPage] = useState(
    location.state?.currentPage || 1
  );
  const [visiblePages, setVisiblePages] = useState([]);

  const queryParams = new URLSearchParams(location.search);
  const itemName = queryParams.get("itemName") || "";
  const entpName = queryParams.get("entpName") || "";
  const efcyQesitm = queryParams.get("efcyQesitm") || "";

  const [messageApi, contextHolder] = message.useMessage();

  const error = (content) => {
    messageApi.open({
      type: "error",
      content: content,
      duration: 3,
    });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const calculateVisiblePages = () => {
      const pages = [];
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (totalPages <= 5) {
        startPage = 1;
        endPage = totalPages;
      } else if (currentPage <= 3) {
        endPage = 5;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 4;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      setVisiblePages(pages);
    };

    calculateVisiblePages();
  }, [currentPage, totalPages]);

  const fetchPillList = async (pageNumber) => {
    let query = "";
    const params = [];
    if (itemName) params.push(`itemName=${encodeURIComponent(itemName)}`);
    if (entpName) params.push(`entpName=${encodeURIComponent(entpName)}`);
    if (efcyQesitm) params.push(`efcyQesitm=${encodeURIComponent(efcyQesitm)}`);
    params.push(`page=${pageNumber}`);
    if (params.length > 0) {
      query = `?${params.join("&")}`;
    }

    try {
      const response = await fetch(
        `http://172.20.60.157:8081/one/pill/info${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (response.ok && data.ResultCd === "1000" && data.Contents) {
        setSearchResults(JSON.parse(data.Contents.items));
        setTotalPages(data.Contents.totalPages);
        setCurrentPage(data.Contents.currentPage);
      } else {
        error(`${data.ResultMsg || "약품 정보를 불러올 수 없습니다"}`);
      }
    } catch (error) {
      console.error("약 정보 로딩 에러:", error);
      error("약 정보 로딩 중 오류가 발생했습니다");
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      fetchPillList(pageNumber);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = Math.max(1, currentPage - 5);
      handlePageChange(newPage);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = Math.min(totalPages, currentPage + 5);
      handlePageChange(newPage);
    }
  };

  return (
    <>
      {contextHolder}
      <div style={styles.container}>
        <h2 style={styles.title}>검색 결과</h2>
        {searchResults.length > 0 ? (
          <>
            <ul style={styles.resultList}>
              {searchResults.map((pill) => (
                <li key={pill.itemSeq} style={styles.resultItem}>
                  <p>
                    <strong>제품명:</strong> {pill.itemName}
                  </p>
                  <p>
                    <strong>제약사:</strong> {pill.entpName}
                  </p>
                  <p>
                    <strong>효능:</strong> {pill.efcyQesitm}
                  </p>
                  <Link
                    to={`/pill/detail/${pill.itemSeq}`}
                    style={styles.detailButton}
                  >
                    상세 정보 보기
                  </Link>
                </li>
              ))}
            </ul>
            <div style={styles.pagination}>
              <button
                style={styles.paginationButton}
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                이전
              </button>
              {visiblePages.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={currentPage === page ? styles.activeButton : ""}
                  style={{
                    ...styles.paginationButton,
                    borderColor: "#00aa9d",
                    backgroundColor:
                      currentPage === page ? "rgba(0, 170, 156, 0.4)" : "white",
                    color: currentPage === page ? "#fff" : "black",
                  }}
                  disabled={currentPage === page}
                >
                  {page}
                </button>
              ))}
              <button
                style={styles.paginationButton}
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
              다음
              </button>
            </div>
          </>
        ) : (
          <div style={styles.noResultsContainer}>
            <img
              src="/noinfo.png"
              alt="검색 결과 없음"
              style={styles.noResultsImage}
            />
            <p style={styles.noResults}>검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    paddingTop: "80px",
    paddingBottom: "30px",
    paddingLeft: "16px",
    paddingRight: "16px",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    marginBottom: "10px",
  },
  resultList: {
    width: "100%",
    maxWidth: "350px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    listStyle: "none",
    padding: 0,
    marginBottom: "20px",
  },
  resultItem: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "15px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    border: "1px solid #00aa9d",
    transition: "transform 0.2s ease",
  },
  pagination: {
    display: "flex",
    gap: "6px",
    marginTop: "20px",
  },
  paginationButton: {
    padding: "6px 10px",
    border: "1px solid #00aa9d",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    backgroundColor: "white",
    color: "black",
  },
  activeButton: {
    backgroundColor: "rgba(0, 170, 156, 0.4)",
    color: "#fff",
    borderColor: "#00aa9d",
  },
  "pagination button:disabled": {
    cursor: "default",
    color: "#fff",
    backgroundColor: "#00aa9d",
    borderColor: "#00aa9d",
  },
  noResultsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "100px",
  },
  noResultsImage: {
    width: "200px",
    height: "auto",
    marginBottom: "16px",
  },
  noResults: {
    textAlign: "center",
    color: "#666",
    fontSize: "16px",
  },
  detailButton: {
    display: "block",
    width: "100%",
    padding: "8px",
    backgroundColor: "#00aa9d",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    marginTop: "12px",
    fontSize: "14px",
    textAlign: "center",
    textDecoration: "none",
    cursor: "pointer",
  },
};

export default SearchResultPage;
