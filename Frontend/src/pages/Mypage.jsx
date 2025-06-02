import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { commonPageStyles } from "../styles/pageStyles";
import LoadingSpinner from "../components/LoadingSpinner";
import { message, Modal } from "antd";

function Mypage() {
  const [userInfo, setUserInfo] = useState(null);
  const [savedPills, setSavedPills] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authToken, logout, checkAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

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

  const error = useCallback(
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
    const fetchData = async () => {
      if (!checkAuth()) {
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const [userInfoResponse, savedPillsResponse] = await Promise.all([
          fetch("http://172.20.60.157:8081/one/user/info", {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }),
          fetch("http://172.20.60.157:8081/one/pill/list", {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
        ]);
        
        const userInfoData = await userInfoResponse.json();
        if (userInfoResponse.ok && userInfoData.ResultCd === "1000") {
          setUserInfo(userInfoData.Contents);
        } else {
          console.error(`회원 정보 조회 실패: ${userInfoData.ResultMsg || "알 수 없는 오류"}`);
          logout();
          navigate("/login");
          return;
        }
        
        const savedPillsData = await savedPillsResponse.json();
        if (savedPillsResponse.ok && savedPillsData.ResultCd === "1000" && savedPillsData.Contents) {
          setSavedPills(JSON.parse(savedPillsData.Contents));
        } else {
          console.error(
            `저장된 약 정보 조회 실패: ${savedPillsData.ResultMsg || "알 수 없는 오류"}`
          );
          setSavedPills([]);
        }
      } catch (error) {
        console.error("데이터 조회 에러:", error);
        error("데이터 조회 중 오류가 발생했습니다");
        setSavedPills([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [authToken, navigate, logout, checkAuth, error]);

  const handleUploadPrescriptionClick = () => {
    if (checkAuth()) {
      navigate("/prescription/upload");
    } else {
      navigate("/login");
    }
  };

  const handleUserModifyClick = () => {
    if (checkAuth()) {
      navigate("/user/modify", { state: { userInfo: userInfo } });
    } else {
      navigate("/login");
    }
  };

  const handleUserDeleteClick = () => {
    if (!checkAuth()) {
      navigate("/login");
      return;
    }

    modal.confirm({
      title: "회원 탈퇴 확인",
      content: (
        <div style={{ whiteSpace: "pre-line" }}>
          정말로 회원 탈퇴하시겠습니까? <br />
          탈퇴하시면 모든 정보가 삭제됩니다
        </div>
      ),
      okText: "탈퇴",
      okType: "danger",
      cancelText: "취소",
      onOk: async () => {
        try {
          const response = await fetch(
            "http://172.20.60.157:8081/one/user/delete",
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          const data = await response.json();
          if (response.ok && data.ResultCd === "1000") {
            success("회원 탈퇴가 완료되었습니다");
            logout();
            navigate("/");
          } else {
            error(`회원 탈퇴 실패: ${data.ResultMsg || "알 수 없는 오류"}`);
          }
        } catch (error) {
          console.error("회원 탈퇴 에러:", error);
          error("회원 탈퇴 중 오류가 발생했습니다");
        }
      },
    });
  };

  const handleDeletePill = (myPillId) => {
    if (!checkAuth()) {
      navigate("/login");
      return;
    }

    modal.confirm({
      title: "약 정보 삭제 확인",
      content: "이 약 정보를 삭제하시겠습니까?",
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      onOk: async () => {
        try {
          const response = await fetch(
            `http://172.20.60.157:8081/one/pill/delete/${myPillId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          const data = await response.json();
          if (response.ok && data.ResultCd === "1000") {
            success("약 정보가 삭제되었습니다");
            try {
              const response = await fetch("http://172.20.60.157:8081/one/pill/list", {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              });
              const data = await response.json();
              if (response.ok && data.ResultCd === "1000" && data.Contents) {
                setSavedPills(JSON.parse(data.Contents));
              } else {
                console.error(
                  `저장된 약 정보 조회 실패: ${data.ResultMsg || "알 수 없는 오류"}`
                );
                setSavedPills([]);
              }
            } catch (error) {
              console.error("저장된 약 정보 조회 에러:", error);
              setSavedPills([]);
            }
          } else {
            error(`약 정보 삭제 실패: ${data.ResultMsg || "알 수 없는 오류"}`);
          }
        } catch (error) {
          console.error("약 정보 삭제 에러:", error);
          error("약 정보 삭제 중 오류가 발생했습니다");
        }
      },
    });
  };

  const handlePillClick = (itemSeq) => {
    if (checkAuth()) {
      navigate(`/pill/detail/${itemSeq}`);
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      {contextHolder}
      {modalContextHolder}
      <div style={styles.container}>
        <h1 style={styles.title}>마이페이지</h1>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {userInfo && (
              <div style={styles.info}>
                <p>
                  <strong>ID: </strong> {userInfo.usermadeId}
                </p>
                <p>
                  <strong>Name: </strong> {userInfo.userName}
                </p>
                <p>
                  <strong>Phone: </strong> {userInfo.phoneNum}
                </p>
              </div>
            )}
            <div style={styles.buttonsContainer}>
              <button
                style={styles.uploadPrescriptionButton}
                onClick={handleUploadPrescriptionClick}
              >
                처방전 업로드
              </button>
              <div style={styles.userButtons}>
                <button
                  style={styles.userModifyButton}
                  onClick={handleUserModifyClick}
                >
                  회원 정보 수정
                </button>
                <button
                  style={styles.userDeleteButton}
                  onClick={handleUserDeleteClick}
                >
                  회원 탈퇴
                </button>
              </div>
            </div>

            <div style={styles.savedPillsContainer}>
              <h3 style={{ marginBottom: "20px" }}>내가 저장한 약</h3>
              {savedPills.length > 0 ? (
                <ul style={styles.savedPillsList}>
                  {savedPills.map((pill) => (
                    <li key={pill.myPillId} style={styles.savedPillItem}>
                      <div
                        style={{ cursor: "pointer", flexGrow: 1 }}
                        onClick={() => handlePillClick(pill.itemSeq)}
                      >
                        <p>{pill.pillName}</p>
                        <p>{pill.pillDesc}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <button
                          style={styles.deleteButton}
                          onClick={() => handleDeletePill(pill.myPillId)}
                        >
                          X
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>저장된 약 정보가 없습니다</p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

const styles = {
  container: {
    ...commonPageStyles.pageContainer,
  },
  content: {
    ...commonPageStyles.contentWrapper,
  },
  title: {
    marginTop: "-30px",
    marginBottom: "10px",
  },
  info: {
    marginTop: "30px",
    marginBottom: "20px",
    padding: "15px",
    border: "1px solid #00aa9d",
    borderRadius: "4px",
    textAlign: "left",
    width: "300px",
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "30px",
    gap: "10px",
    width: "300px",
  },
  uploadPrescriptionButton: {
    backgroundColor: "#00aa9d",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    width: "100%",
  },
  userButtons: {
    display: "flex",
    gap: "10px",
    width: "100%",
  },
  userModifyButton: {
    backgroundColor: "#00aa9d",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    flex: 1,
  },
  userDeleteButton: {
    backgroundColor: "#6c757d",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    flex: 1,
  },
  savedPillsContainer: {
    marginTop: "10px",
    width: "80%",
    maxWidth: "800px",
    padding: "20px",
    border: "1px solid #00aa9d",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  savedPillsList: {
    listStyle: "none",
    padding: 0,
  },
  savedPillItem: {
    marginBottom: "15px",
    padding: "15px",
    border: "1px solid #00aa9d",
    borderRadius: "4px",
    backgroundColor: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#6c757d",
    color: "white",
    padding: "8px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default Mypage;