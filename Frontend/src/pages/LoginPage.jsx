import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { commonPageStyles } from "../styles/pageStyles";
import { message, Input } from "antd";

function LoginPage() {
  const [usermadeId, setUsermadeId] = useState("");
  const [userPw, setUserPw] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [messageApi, contextHolder] = message.useMessage();

  const success = (content) => {
    messageApi.open({
      type: "success",
      content: content,
      duration: 3,
    });
  };

  const warning = (content) => {
    messageApi.open({
      type: "warning",
      content: <div style={{ whiteSpace: "pre-line" }}>{content}</div>,
      duration: 3,
    });
  };

  const error = (content) => {
    messageApi.open({
      type: "error",
      content: content,
      duration: 3,
    });
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("http://172.20.60.157:8081/one/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usermadeId: usermadeId,
          userPw: userPw,
        }),
      });
      const data = await response.json();
      if (response.ok && data.ResultCd === "1000") {
        success("로그인 성공");
        const token = data.Contents;
        let decodedUserName = "유저";
        try {
          const payloadBase64 = token.split(".")[1];
          if (payloadBase64) {
            const payloadJson = atob(
              payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
            );
            const payload = JSON.parse(payloadJson);
            decodedUserName = payload.userName || payload.sub || "유저";
          }
        } catch (error) {
          console.error("토큰 디코딩 에러:", error);
        }
        login(token, decodedUserName);
        setTimeout(() => {
          navigate("/");
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
          error(`${data.ResultMsg || "아이디 또는 비밀번호를 확인하세요"}`);
        }
      }
    } catch (error) {
      console.error("로그인 에러:", error);
      error("로그인 중 오류가 발생했습니다");
    }
  };

  return (
    <>
      {contextHolder}
      <div style={styles.container}>
        <h2>로그인</h2>
        <Input
          type="text"
          placeholder="ID"
          value={usermadeId}
          onChange={(e) => setUsermadeId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={styles.input}
        />
        <Input.Password
          type="password"
          placeholder="비밀번호"
          value={userPw}
          onChange={(e) => setUserPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={styles.uniformInput}
        />
        <button style={styles.button} onClick={handleLogin}>
          로그인
        </button>
      </div>
    </>
  );
}

const styles = {
  container: {
    ...commonPageStyles.pageContainer,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%",
    maxWidth: "343px",
  },
  input: {
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #00aa9d",
    borderRadius: "4px",
    width: "300px",
    boxSizing: "border-box",
    fontSize: "14px",
    height: "40px",
  },
  uniformInput: {
    padding: "4px 11px",
    margin: "10px 0",
    border: "1px solid #00aa9d",
    borderRadius: "4px",
    width: "300px",
    boxSizing: "border-box",
    fontSize: "14px",
    height: "40px",
  },
  button: {
    backgroundColor: "#00aa9d",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    margin: "10px 0",
  },
};

export default LoginPage;
