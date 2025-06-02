import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { commonPageStyles } from "../styles/pageStyles";
import LoadingSpinner from "../components/LoadingSpinner";
import { message } from "antd";

function PillDetailPage() {
  const { itemSeq } = useParams();
  const [pillDetail, setPillDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { authToken } = useContext(AuthContext);
  const [isSaved, setIsSaved] = useState(false);
  const [customPillDesc, setCustomPillDesc] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  const success = useCallback(
    (content) => {
      messageApi.open({
        type: "success",
        content: content,
        duration: 3,
      });
    },
    [messageApi]
  );

  const warning = useCallback(
    (content) => {
      messageApi.open({
        type: "warning",
        content: <div style={{ whiteSpace: "pre-line" }}>{content}</div>,
        duration: 3,
      });
    },
    [messageApi]
  );

  const fail = useCallback(
    (content) => {
      messageApi.open({
        type: "error",
        content: content,
        duration: 3,
      });
    },
    [messageApi]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPillDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://172.20.60.157:8081/one/pill/detail/${itemSeq}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();

        if (response.ok && data.ResultCd === "1000" && data.Contents) {
          setPillDetail(JSON.parse(data.Contents));
        } else {
          fail(data.ResultMsg || "약품 상세 정보를 불러오는데 실패했습니다");
        }
      } catch (err) {
        fail("약품 상세 정보를 불러오는 중 오류가 발생했습니다");
      } finally {
        setLoading(false);
      }
    };

    const checkIsSaved = async () => {
      if (authToken && pillDetail?.itemSeq) {
        try {
          const response = await fetch(
            `http://172.20.60.157:8081/one/pill/is-saved?itemSeq=${pillDetail.itemSeq}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            setIsSaved(data.isSaved);
          } else {
            console.error("저장 여부 확인 실패");
          }
        } catch (error) {
          console.error("저장 여부 확인 중 오류 발생", error);
        }
      }
    };

    fetchPillDetail().then(() => {
      checkIsSaved();
    });
  }, [itemSeq, authToken, pillDetail?.itemSeq, fail]);

  const formatTextWithLineBreaks = (text) => {
    if (!text) return "정보 없음";
    return text.split(".").map((sentence, index, array) => (
      <React.Fragment key={index}>
        {sentence.trim()}
        {index < array.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const handleSavePill = async () => {
    if (!authToken) {
      warning("로그인이 필요합니다");
      navigate("/login");
      return;
    }
    if (!pillDetail?.itemName || !pillDetail?.itemSeq) {
      warning("약품 정보가 없습니다");
      return;
    }

    try {
      const response = await fetch("http://172.20.60.157:8081/one/pill/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          itemSeq: pillDetail.itemSeq,
          pillName: pillDetail.itemName,
          pillDesc: customPillDesc,
        }),
      });

      const data = await response.json();
      if (response.ok && data.ResultCd === "1000") {
        setIsSaved(true);
        success("관심 약품에 저장되었습니다");
      } else {
        warning(`${data.ResultMsg || "약품 저장에 실패했습니다"}`);
      }
    } catch (error) {
      console.error("약품 저장 에러:", error);
      fail("약품 저장 중 오류가 발생했습니다");
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <LoadingSpinner
          containerStyle={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <p style={styles.error}>에러: {error}</p>
      </div>
    );
  }

  if (!pillDetail) {
    return (
      <div style={styles.container}>
        <img
          src="/noinfo.png"
          alt="약품 상세 정보 없음"
          style={styles.noResultsImage}
        />
        <p style={styles.error}>약품 상세 정보가 없습니다</p>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div style={styles.container}>
        <h2 style={styles.title}>{pillDetail.itemName}</h2>
        {pillDetail.itemImage && (
          <img
            src={pillDetail.itemImage}
            alt={pillDetail.itemName}
            style={styles.image}
          />
        )}
        <div style={styles.content}>
          <div style={styles.detailSection}>
            <strong
              style={{ ...styles.label, fontSize: "15px", color: "black" }}
            >
              효능:
            </strong>
            <p style={styles.value}>
              {formatTextWithLineBreaks(pillDetail.efcyQesitm)}
            </p>
          </div>
          <div style={styles.detailSection}>
            <strong
              style={{ ...styles.label, fontSize: "15px", color: "black" }}
            >
              복용 방법:
            </strong>
            <p style={styles.value}>
              {formatTextWithLineBreaks(pillDetail.useMethodQesitm)}
            </p>
          </div>
          <div style={styles.detailSection}>
            <strong
              style={{ ...styles.label, fontSize: "15px", color: "black" }}
            >
              사용시 주의사항:
            </strong>
            <p style={styles.value}>
              {formatTextWithLineBreaks(pillDetail.atpnQesitm)}
            </p>
          </div>
          <div style={styles.detailSection}>
            <strong
              style={{ ...styles.label, fontSize: "15px", color: "black" }}
            >
              경고:
            </strong>
            <p style={styles.value}>
              {formatTextWithLineBreaks(pillDetail.atpnWarnQesitm)}
            </p>
          </div>
          <div style={styles.detailSection}>
            <strong
              style={{ ...styles.label, fontSize: "15px", color: "black" }}
            >
              같이 섭취하면 위험한 약/음식:
            </strong>
            <p style={styles.value}>
              {formatTextWithLineBreaks(pillDetail.intrcQesitm)}
            </p>
          </div>
          <div style={styles.detailSection}>
            <strong
              style={{ ...styles.label, fontSize: "15px", color: "black" }}
            >
              부작용:
            </strong>
            <p style={styles.value}>
              {formatTextWithLineBreaks(pillDetail.seQesitm)}
            </p>
          </div>
          <div style={styles.detailSection}>
            <strong
              style={{ ...styles.label, fontSize: "15px", color: "black" }}
            >
              보관방법:
            </strong>
            <p style={styles.value}>
              {formatTextWithLineBreaks(pillDetail.depositMethodQesitm)}
            </p>
          </div>

          {authToken && (
            <div style={styles.customDescSection}>
              <label
                htmlFor="customPillDesc"
                style={{ ...styles.label, fontSize: "15px", color: "black" }}
              >
                나만의 약 설명:
              </label>
              <textarea
                id="customPillDesc"
                value={customPillDesc}
                onChange={(e) => setCustomPillDesc(e.target.value)}
                placeholder="이 약에 대한 나만의 설명을 입력하세요"
                style={{ ...styles.textarea }}
              />
            </div>
          )}

          <div style={styles.buttonContainer}>
            {authToken ? (
              <button style={styles.saveButton} onClick={handleSavePill}>
                {isSaved ? "저장됨" : "관심 약품에 저장"}
              </button>
            ) : (
              <button
                style={styles.loginRequiredButton}
                onClick={() => navigate("/login")}
              >
                저장 (로그인 필요)
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    ...commonPageStyles.pageContainer,
    paddingBottom: "100px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  loadingContainer: {
    minHeight: "calc(100vh - 10px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
  },
  noResultsImage: {
    width: "200px",
    height: "auto",
    marginBottom: "16px",
  },
  error: {
    textAlign: "center",
    color: "#ff4444",
    padding: "20px",
  },
  content: {
    ...commonPageStyles.contentWrapper,
    width: "100%",
    maxWidth: "600px",
  },
  title: {
    ...commonPageStyles.title,
    marginTop: "-30px",
    textAlign: "center",
    fontSize: "20px",
    marginBottom: "20px",
  },
  image: {
    width: "100%",
    maxWidth: "200px",
    height: "auto",
    marginBottom: "16px",
    borderRadius: "8px",
  },
  detailSection: {
    ...commonPageStyles.card,
    marginBottom: "12px",
    border: "1px solid #00aa9d",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#666",
    marginBottom: "8px",
  },
  value: {
    fontSize: "16px",
    lineHeight: "1.5",
    color: "#333",
    whiteSpace: "pre-line",
  },
  customDescSection: {
    width: "100%",
    marginBottom: "80px",
  },
  textarea: {
    width: "100%",
    minHeight: "100px",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #00aa9d",
    fontSize: "16px",
    resize: "vertical",
    marginBottom: "16px",
  },
  buttonContainer: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    padding: "16px",
    backgroundColor: "#fff",
    borderTop: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "center",
    zIndex: 1000,
    maxWidth: "375px",
    left: "50%",
    transform: "translateX(-50%)",
  },
  saveButton: {
    width: "100%",
    height: "44px",
    backgroundColor: "#00aa9d",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
  loginRequiredButton: {
    width: "100%",
    height: "44px",
    backgroundColor: "#ccc",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default PillDetailPage;
