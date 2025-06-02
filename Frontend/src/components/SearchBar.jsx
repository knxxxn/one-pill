import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

function SearchBar() {
  const [itemName, setItemName] = useState("");
  const [entpName, setEntpName] = useState("");
  const [efcyQesitm, setEfcyQesitm] = useState("");
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const warning = (content) => {
    messageApi.open({
      type: "warning",
      content: <div style={{ whiteSpace: "pre-line" }}>{content}</div>,
      duration: 3,
    });
  };

  const fail = (content) => {
    messageApi.open({
      type: "error",
      content: content,
      duration: 3,
    });
  };

  const handleItemNameChange = (event) => {
    setItemName(event.target.value);
  };

  const handleEntpNameChange = (event) => {
    setEntpName(event.target.value);
  };

  const handleEfcyQesitmChange = (event) => {
    setEfcyQesitm(event.target.value);
  };

  const handleSearchSubmit = async () => {
    let queryParams = "";
    const params = [];

    if (itemName.trim()) {
      params.push(`itemName=${encodeURIComponent(itemName.trim())}`);
    }
    if (entpName.trim()) {
      params.push(`entpName=${encodeURIComponent(entpName.trim())}`);
    }
    if (efcyQesitm.trim()) {
      params.push(`efcyQesitm=${encodeURIComponent(efcyQesitm.trim())}`);
    }

    if (params.length > 0) {
      queryParams = `?${params.join("&")}&page=1`;
    } else {
      queryParams = `?page=1`;
    }

    try {
      const response = await fetch(
        `http://172.20.60.157:8081/one/pill/info${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (response.ok && data.ResultCd === "1000" && data.Contents) {
        navigate("/pill/info", {
          state: {
            results: JSON.parse(data.Contents.items),
            totalPages: data.Contents.totalPages,
            currentPage: data.Contents.currentPage,
          },
        });
      } else {
        warning(`검색 결과가 없습니다`);
      }
    } catch (error) {
      console.error("약 정보 검색 에러:", error);
      fail("약 정보 검색 중 오류가 발생했습니다");
    }
  };

  return (
    <>
      {contextHolder}
      <div style={styles.container}>
        <h2 style={styles.title}>찾고 싶은 약을 검색하세요</h2>
        <div style={styles.searchBarWrapper}>
          <div style={styles.inputContainer}>
            <label style={styles.label}>제품명</label>
            <input
              type="text"
              placeholder="제품명을 검색하세요"
              style={styles.input}
              value={itemName}
              onChange={handleItemNameChange}
              onKeyDown={(event) =>
                event.key === "Enter" && handleSearchSubmit()
              }
            />
          </div>
          <div style={styles.inputContainer}>
            <label style={styles.label}>제약사명</label>
            <input
              type="text"
              placeholder="제약사명을 검색하세요"
              style={styles.input}
              value={entpName}
              onChange={handleEntpNameChange}
              onKeyDown={(event) =>
                event.key === "Enter" && handleSearchSubmit()
              }
            />
          </div>
          <div style={styles.inputContainer}>
            <label style={styles.label}>효능</label>
            <input
              type="text"
              placeholder="효능을 검색하세요"
              style={styles.input}
              value={efcyQesitm}
              onChange={handleEfcyQesitmChange}
              onKeyDown={(event) =>
                event.key === "Enter" && handleSearchSubmit()
              }
            />
          </div>
        </div>
        <button style={styles.searchButton} onClick={handleSearchSubmit}>
          검색
        </button>
      </div>
    </>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: "343px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "0 16px",
    marginTop: "80px",
  },
  title: {
    textAlign: "center",
    marginTop: "-30px",
  },
  searchBarWrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  inputContainer: {
    width: "100%",
  },
  label: {
    display: "block",
    fontSize: "14px",
    color: "#666",
    marginBottom: "8px",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    height: "44px",
    padding: "0 16px",
    borderRadius: "8px",
    border: "1px solid #00aa9d",
    fontSize: "16px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  searchButton: {
    width: "100%",
    height: "44px",
    backgroundColor: "#00aa9d",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  errorText: {
    color: "#ff4444",
    fontSize: "14px",
    marginTop: "8px",
  },
};

export default SearchBar;