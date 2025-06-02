import React, { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { message, Input } from "antd";

function UserModifyPage() {
  const [userPw, setUserPw] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [originalPhoneNum, setOriginalPhoneNum] = useState(""); 
  const { authToken, checkAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();
  const userInfoFromMypage = location.state?.userInfo; 

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
      if (!checkAuth()) {
        warning("로그인이 필요한 서비스입니다.");
        navigate("/login");
        return;
      }
    }, [checkAuth, navigate, warning]);
  

  useEffect(() => {
    if (userInfoFromMypage && userInfoFromMypage.phoneNum) {
      setOriginalPhoneNum(userInfoFromMypage.phoneNum);
      setPhoneNum(userInfoFromMypage.phoneNum); 
    } else {
      const fetchExistingUserInfo = async () => {
        if (authToken) {
          try {
            const response = await fetch(
              "http://172.20.60.157:8081/one/user/info",
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              }
            );
            const data = await response.json();
            if (response.ok && data.ResultCd === "1000" && data.Contents) {
              setOriginalPhoneNum(data.Contents.phoneNum);
              setPhoneNum(data.Contents.phoneNum); 
            } else {
              console.error("기존 회원 정보 조회 실패:", data);
              fail("기존 회원 정보 조회에 실패했습니다.");
            }
          } catch (error) {
            console.error("기존 회원 정보 조회 에러:", error);
            fail("기존 회원 정보 조회 중 오류가 발생했습니다.");
          }
        } else {
          warning("로그인이 필요합니다.");
          navigate("/login");
        }
      };
      fetchExistingUserInfo();
    }
  }, [authToken, navigate, fail, warning, userInfoFromMypage]);

  const handleUserModify = async () => {
    if (!authToken) {
      warning("로그인이 필요합니다");
      navigate("/login");
      return;
    }

    const updatedPhoneNum = phoneNum === "" ? originalPhoneNum : phoneNum;

    try {
      const response = await fetch(
        "http://172.20.60.157:8081/one/user/modify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            userPw: userPw,
            phoneNum: updatedPhoneNum,
          }),
        }
      );
      const data = await response.json();
      if (response.ok && data.ResultCd === "1000") {
        success("회원 정보 수정 성공");
        setTimeout(() => {
          navigate("/user/info");
        }, 1000);
      } else {
        if (
          data.ResultCd === "1001" &&
          data.ResultMsg === "필수값 누락" &&
          data.Contents
        ) {
          const errorMessages = Object.values(data.Contents).join("\n");
          warning(`${errorMessages}`);
        } else {
          fail(`${data.ResultMsg || "회원 정보 수정에 실패했습니다"}`);
        }
      }
    } catch (error) {
      console.error("회원 정보 수정 에러:", error);
      fail("회원 정보 수정 중 오류가 발생했습니다");
    }
  };

  return (
    <>
      {contextHolder}
      <div style={styles.container}>
        <h2>회원 정보 수정</h2>
        <div style={styles.inputGroup}>
          <label htmlFor="userPw" style={styles.label}>
            비밀번호
          </label>
          <Input.Password
            id="userPw"
            value={userPw}
            onChange={(e) => setUserPw(e.target.value)}
            placeholder="대,소문자/숫자/특수문자 포함"
            style={styles.uniformInput}
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="phoneNum" style={styles.label}>
            전화번호
          </label>
          <Input
            type="text"
            id="phoneNum"
            value={phoneNum}
            onChange={(e) => setPhoneNum(e.target.value)}
            placeholder="010-xxxx-xxxx"
            style={styles.uniformInput}
          />
        </div>
        <div style={styles.buttons}>
          <button style={styles.userModifyButton} onClick={handleUserModify}>
            수정
          </button>
          <button
            style={styles.cancelButton}
            onClick={() => navigate("/user/info")}
          >
            취소
          </button>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    marginTop: "100px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "15px",
    width: "300px",
    marginTop: "30px",
    color: "#666",
  },
  label: {
    marginBottom: "5px",
    fontWeight: "bold",
  },
  uniformInput: {
    padding: "10px",
    border: "1px solid #00aa9d",
    borderRadius: "4px",
    width: "100%",
    boxSizing: "border-box",
    height: "40px",
    fontSize: "14px",
  },
  buttons: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },
  userModifyButton: {
    backgroundColor: "#00aa9d",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default UserModifyPage;
