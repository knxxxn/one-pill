import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { commonPageStyles } from "../styles/pageStyles";
import { message, Input } from "antd";

function RegisterPage() {
  const [usermadeId, setUsermadeId] = useState("");
  const [userName, setUserName] = useState("");
  const [userPw, setUserPw] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const navigate = useNavigate();
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
      type: 'warning',
      content: (
        <div style={{ whiteSpace: 'pre-line' }}>{content}</div>
      ),
      duration: 3
    });
  };

  const error = (content) => {
    messageApi.open({
      type: "error",
      content: content,
      duration: 3,
    });
  };

  const handleRegister = async () => {
    if (userPw !== passwordConfirm) {
      warning("비밀번호와 비밀번호 확인이 일치하지 않습니다");
      return;
    }
    try {
      const response = await fetch(
        "http://172.20.60.157:8081/one/user/regist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usermadeId: usermadeId,
            userName: userName,
            userPw: userPw,
            phoneNum: phoneNum,
          }),
        }
      );
      const data = await response.json();
      if (response.ok && data.ResultCd === "1000") {
        success("회원가입 성공");
        setTimeout(() => { 
          navigate("/login");
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
          error(
            `${data.ResultMsg || "회원가입에 실패했습니다"}`
          );
        }
      }
    } catch (error) {
      console.error("회원가입 에러:", error);
      error("회원가입 중 오류가 발생했습니다");
    }
  };

  return (
    <>
    {contextHolder}
      <div style={styles.container}>
        <h2>회원가입</h2>
        <Input
          type="text"
          placeholder="ID"
          value={usermadeId}
          onChange={(e) => setUsermadeId(e.target.value)}
          style={styles.input}
        />
        <Input
          type="text"
          placeholder="이름"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={styles.input}
        />
        <Input.Password
          placeholder="비밀번호 (대,소문자/숫자/특수문자 포함)"
          value={userPw}
          onChange={(e) => setUserPw(e.target.value)}
          style={styles.uniformInput}
        />
        <Input.Password 
          placeholder="비밀번호 확인"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          style={styles.uniformInput}
        />
        <Input
          type="text"
          placeholder="전화번호 (010-xxxx-xxxx)"
          value={phoneNum}
          onChange={(e) => setPhoneNum(e.target.value)}
          style={styles.input}
        />
        <button style={styles.button} onClick={handleRegister}>
          회원가입
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
    height: "40px", 
    fontSize: "14px",
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

export default RegisterPage;