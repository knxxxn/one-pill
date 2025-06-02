import React, { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { commonPageStyles } from "../styles/pageStyles";
import { message } from "antd";

function PrescriptionUploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const { authToken, checkAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const success = useCallback((content) => {
    messageApi.open({
      type: "success",
      content: content,
      duration: 3,
    });
  }, [messageApi]);

  const warning = useCallback((content) => {
    messageApi.open({
      type: "warning",
      content: <div style={{ whiteSpace: "pre-line" }}>{content}</div>,
      duration: 3,
    });
  }, [messageApi]);

  const error = useCallback((content) => {
    messageApi.open({
      type: "error",
      content: content,
      duration: 3,
    });
  }, [messageApi]);


  useEffect(() => {
    if (!checkAuth()) {
      const warningMessage = "로그인이 필요한 서비스입니다";
      warning(warningMessage);
      navigate("/login");
    }
  }, [checkAuth, navigate, warning]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      warning("사진 파일을 선택해주세요");
      return;
    }

    if (!checkAuth()) {
      warning("로그인이 만료되어 다시 로그인해주세요");
      navigate("/login");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        "http://172.20.60.157:8081/one/pill/perscription",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok && data.ResultCd === "1000") {
        setUploadSuccess(true);
        success("처방전 사진 저장 성공");
      } else {
        if (data.ResultCd === "401" || data.ResultCd === "403") {
          warning("세션이 만료되어 다시 로그인해주세요");
          navigate("/login");
          return;
        }
        
        setUploadError("처방전 사진 저장 실패");
        console.log(data.ResultMsg);
        error("처방전 사진 저장 실패");
      }
    } catch (error) {
      console.error("처방전 사진 업로드 에러");
      setUploadError("처방전 사진 업로드 중 오류");
      error("처방전 사진 업로드 중 오류가 발생");
    } finally {
      setUploading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/user/info");
  };

  const handleViewListClick = () => {
    if (checkAuth()) {
      navigate("/prescription/list");
    } else {
      warning("세션이 만료되어 다시 로그인해주세요");
      navigate("/login");
    }
  };

  return (
    <>
      {contextHolder}
      <div style={styles.container}>
        <h1 style={styles.title}>처방전 업로드</h1>
        <div style={styles.uploadContainer}>
          <div style={styles.uploadSection}>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          <button style={styles.viewListButton} onClick={handleViewListClick}>
            내 처방전 목록 보기
          </button>
          <div style={styles.buttonRow}>
            <button
              style={styles.uploadButton}
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? "저장 중..." : "저장"}
            </button>
            <button style={styles.backButton} onClick={handleGoBack}>
              뒤로 가기
            </button>
          </div>
          {uploadError && <p style={styles.error}>{uploadError}</p>}
          {uploadSuccess && <p style={styles.success}>저장 성공</p>}
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    ...commonPageStyles.pageContainer,
  },
  title: {
    marginTop: "-30px",
    marginBottom: "30px",
  },
  uploadContainer: {
    ...commonPageStyles.contentWrapper,
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
    border: "1px solid #00aa9d",
  },
  uploadSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "20px",
    padding: "20px",
    border: "1px solid #00aa9d",
    borderRadius: "5px",
  },
  viewListButton: {
    backgroundColor: "#00aa9d",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginBottom: "10px",
    width: "300px",
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
    width: "300px",
    justifyContent: "center",
  },
  uploadButton: {
    backgroundColor: "#00aa9d",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    flex: 1,
  },
  backButton: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    flex: 1,
  },
  error: {
    color: "#6c757d",
    marginTop: "10px",
    textAlign: "center",
    width: "100%",
  },
  success: {
    color: "#00aa9d",
    marginTop: "10px",
    textAlign: "center",
    width: "100%",
  },
};

export default PrescriptionUploadPage;