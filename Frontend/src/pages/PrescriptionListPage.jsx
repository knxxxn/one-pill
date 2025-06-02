import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { commonPageStyles } from "../styles/pageStyles";
import { FaSearch } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import { message, Modal } from "antd";

function PrescriptionListPage() {
  const [filteredPrescriptionList, setFilteredPrescriptionList] = useState([]);
  const { authToken, checkAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null);
  const [selectedPrescriptionDetail, setSelectedPrescriptionDetail] =
    useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPills, setFilteredPills] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [medicationStartDate, setMedicationStartDate] = useState("");
  const [medicationEndDate, setMedicationEndDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [medicationDates, setMedicationDates] = useState([]);
  const [medicationMemo, setMedicationMemo] = useState("");
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
      const warningMessage = "로그인이 필요한 서비스입니다";
      warning(warningMessage);
      navigate("/login");
    }
  }, [checkAuth, navigate, warning]);

  const fetchPrescriptions = useCallback(
    async (start = "", end = "") => {
      if (!authToken) {
        warning("로그인이 필요합니다");
        navigate("/login");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let url = "http://172.20.60.157:8081/one/pill/perscription/date";
        if (start || end) {
          const params = new URLSearchParams();
          if (start) params.append("startDate", start);
          if (end) params.append("endDate", end);
          url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.ResultCd === "1000" && data.Contents) {
          const processedContents = data.Contents.map((prescription) => {
            if (prescription.createAt) {
              const date = new Date(prescription.createAt);
              prescription.createAt = date.toISOString();
            }
            return prescription;
          });

          setFilteredPrescriptionList(processedContents);
        } else {
          fail(data.ResultMsg || "처방전 목록 조회 실패");
        }
      } catch (error) {
        console.error("처방전 목록 조회 에러:", error);
        warning("로그인이 만료되어 다시 로그인해주세요");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    },
    [authToken, navigate, warning, fail]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleDeletePrescription = async (perscriptionId) => {
    modal.confirm({
      title: "처방전 삭제 확인",
      content: "이 처방전을 삭제하시겠습니까?",
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      onOk: async () => {
        try {
          const response = await fetch(
            `http://172.20.60.157:8081/one/pill/perscription/${perscriptionId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          const data = await response.json();

          if (response.ok && data.ResultCd === "1000") {
            success("처방전이 삭제되었습니다");
            setFilteredPrescriptionList((prevList) =>
              prevList.filter((p) => p.perscriptionId !== perscriptionId)
            );
          } else {
            fail(data.ResultMsg || "처방전 삭제 실패");
          }
        } catch (error) {
          console.error("처방전 삭제 에러:", error);
          fail("처방전 삭제 중 오류가 발생했습니다");
        }
      },
    });
  };

  const handleSaveMedicationPeriod = async () => {
    if (!selectedPrescriptionId || !medicationStartDate || !medicationEndDate) {
      warning("복용 기간을 모두 입력해주세요");
      return;
    }

    try {
      const startDateTime = new Date(medicationStartDate);
      startDateTime.setHours(0, 0, 0, 0);

      const endDateTime = new Date(medicationEndDate);
      endDateTime.setHours(0, 0, 0, 0);

      const response = await fetch(
        "http://172.20.60.157:8081/one/pill/perscription/period",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            perscriptionId: selectedPrescriptionId,
            startDate: startDateTime.toISOString(),
            endDate: endDateTime.toISOString(),
            perscriptionMemo: medicationMemo,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.ResultCd === "1000") {
        success("복용 기간과 메모가 저장되었습니다");

        const formatDate = (date) => {
          const d = new Date(date);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        setMedicationStartDate(formatDate(startDateTime));
        setMedicationEndDate(formatDate(endDateTime));

        const dates = [];
        let currentDate = new Date(startDateTime);
        while (currentDate <= endDateTime) {
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }

        setMedicationDates(dates);

        fetchPrescriptions();
      } else {
        fail(data.ResultMsg || "복용 기간 저장 실패");
      }
    } catch (error) {
      console.error("복용 기간 저장 에러:", error);
      fail("복용 기간 저장 중 오류가 발생했습니다");
    }
  };

  const fetchPrescriptionDetail = async (perscriptionId) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const prescriptionResponse = await fetch(
        `http://172.20.60.157:8081/one/pill/perscription/detail/${perscriptionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const prescriptionData = await prescriptionResponse.json();

      const periodResponse = await fetch(
        `http://172.20.60.157:8081/one/pill/perscription/period/${perscriptionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const periodData = await periodResponse.json();

      if (
        prescriptionResponse.ok &&
        prescriptionData.ResultCd === "1000" &&
        prescriptionData.Contents
      ) {
        setSelectedPrescriptionDetail(prescriptionData.Contents);
        setSelectedPrescriptionId(perscriptionId);
        setFilteredPills(prescriptionData.Contents.pills || []);

        if (periodData.ResultCd === "1000" && periodData.Contents) {
          const formatDate = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
          };

          setMedicationStartDate(formatDate(periodData.Contents.startDate));
          setMedicationEndDate(formatDate(periodData.Contents.endDate));
          setMedicationMemo(periodData.Contents.perscriptionMemo || "");

          const start = new Date(periodData.Contents.startDate);
          const end = new Date(periodData.Contents.endDate);
          const dates = [];

          let currentDate = new Date(start);
          while (currentDate <= end) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }

          setMedicationDates(dates);
        } else {
          setMedicationStartDate("");
          setMedicationEndDate("");
          setMedicationMemo("");
          setMedicationDates([]);
        }
      } else {
        fail(prescriptionData.ResultMsg || "처방전 상세 정보 조회 실패");
      }
    } catch (error) {
      console.error("처방전 상세 정보 조회 에러:", error);
      fail("처방전 상세 정보 조회 중 오류가 발생했습니다");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleShowDetail = (perscriptionId) => {
    fetchPrescriptionDetail(perscriptionId);
  };

  const handleCloseDetail = () => {
    setSelectedPrescriptionId(null);
    setSelectedPrescriptionDetail(null);
    setDetailError(null);
    setDetailLoading(false);
  };

  const handleGoBack = () => {
    navigate("/user/info");
  };

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (
      selectedPrescriptionDetail &&
      selectedPrescriptionDetail.medicineNames
    ) {
      const filtered = selectedPrescriptionDetail.medicineNames.filter((name) =>
        name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredPills(filtered);
    }
  };

  const handleKeyPress = async (event) => {
    if (event.key === "Enter") {
      const term = event.target.value;
      try {
        const response = await fetch(
          `http://172.20.60.157:8081/one/pill/info?itemName=${encodeURIComponent(
            term
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();

        if (response.ok && data.ResultCd === "1000" && data.Contents) {
          const parsedItems = JSON.parse(data.Contents.items);
          navigate("/prescription/search", { state: { results: parsedItems } });
        } else {
          warning("약 정보를 찾을 수 없습니다");
        }
      } catch (error) {
        console.error("약 정보 조회 에러:", error);
        fail("약 정보 조회 중 오류가 발생했습니다");
      }
    }
  };

  const handlePillClick = async (name) => {
    try {
      const response = await fetch(
        `http://172.20.60.157:8081/one/pill/info?itemName=${encodeURIComponent(
          name
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (response.ok && data.ResultCd === "1000" && data.Contents) {
        const parsedItems = JSON.parse(data.Contents.items);
        navigate("/prescription/search", { state: { results: parsedItems } });
      } else {
        warning("약 정보를 찾을 수 없습니다");
      }
    } catch (error) {
      console.error("약 정보 조회 에러:", error);
      fail("약 정보 조회 중 오류가 발생했습니다");
    }
  };

  const handleDateSearch = () => {
    fetchPrescriptions(startDate, endDate);
  };

  const handleToggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  return (
    <>
      {contextHolder}
      {modalContextHolder}
      <div style={styles.container}>
        <PageHeader title="처방전 목록" onBack={handleGoBack} />
        <div style={styles.content}>
          <div style={styles.dateSearchContainer}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.dateInput}
            />
            <span style={styles.dateSeparator}>~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.dateInput}
            />
            <button onClick={handleDateSearch} style={styles.searchButton}>
              <FaSearch />
            </button>
          </div>

          {loading && <LoadingSpinner />}
          {error && <p style={styles.error}>{error}</p>}

          {selectedPrescriptionId && selectedPrescriptionDetail && (
            <div style={styles.modal}>
              <div style={styles.modalContent}>
                {detailLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    {!detailError &&
                      selectedPrescriptionDetail.perscriptionImage && (
                        <img
                          src={`http://172.20.60.157:8081/one/${selectedPrescriptionDetail.perscriptionImage.replace(
                            /\\/g,
                            "/"
                          )}`}
                          alt={`사진 크게 보기 ${selectedPrescriptionId}`}
                          style={styles.detailImage}
                        />
                      )}

                    <div style={styles.medicationPeriodContainer}>
                      <h3 style={styles.medicationPeriodTitle}>
                        복용 기간 설정
                      </h3>
                      <div style={styles.medicationPeriodInputs}>
                        <div style={styles.medicationPeriodInput}>
                          <label>시작일:</label>
                          <input
                            type="date"
                            value={medicationStartDate}
                            onChange={(e) =>
                              setMedicationStartDate(e.target.value)
                            }
                            style={styles.dateInput}
                          />
                        </div>
                        <div style={styles.medicationPeriodInput}>
                          <label>종료일:</label>
                          <input
                            type="date"
                            value={medicationEndDate}
                            onChange={(e) =>
                              setMedicationEndDate(e.target.value)
                            }
                            style={styles.dateInput}
                          />
                        </div>
                        <div style={styles.medicationMemoInput}>
                          <label>메모:</label>
                          <textarea
                            value={medicationMemo}
                            onChange={(e) => setMedicationMemo(e.target.value)}
                            placeholder="복용에 대한 메모를 입력하세요"
                            style={styles.memoTextarea}
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleSaveMedicationPeriod}
                        style={styles.saveButton}
                      >
                        복용 기간 저장
                      </button>
                      <button
                        onClick={handleToggleCalendar}
                        style={styles.calendarButton}
                      >
                        {showCalendar ? "캘린더 숨기기" : "캘린더 보기"}
                      </button>
                    </div>

                    {showCalendar && (
                      <div style={styles.calendarContainer}>
                        <Calendar
                          tileClassName={({ date }) => {
                            // 복용 기간 날짜인 경우
                            if (
                              medicationDates.some(
                                (medicationDate) =>
                                  medicationDate.getDate() === date.getDate() &&
                                  medicationDate.getMonth() ===
                                    date.getMonth() &&
                                  medicationDate.getFullYear() ===
                                    date.getFullYear()
                              )
                            ) {
                              return "medication-date";
                            }

                            // 토요일인 경우
                            if (date.getDay() === 6) {
                              return "saturday-date";
                            }

                            // 일요일인 경우
                            if (date.getDay() === 0) {
                              return "sunday-date";
                            }

                            return null;
                          }}
                          formatDay={(locale, date) => date.getDate()}
                          formatShortWeekday={(locale, date) => {
                            const days = [
                              "일",
                              "월",
                              "화",
                              "수",
                              "목",
                              "금",
                              "토",
                            ];
                            return days[date.getDay()];
                          }}
                          calendarType="gregory"
                        />
                      </div>
                    )}
                    <div style={styles.searchInputContainer}>
                      <input
                        type="text"
                        placeholder="약 이름으로 검색"
                        value={searchTerm}
                        onChange={handleSearch}
                        onKeyPress={handleKeyPress}
                        style={styles.searchInput}
                      />
                      <FaSearch style={styles.searchIcon} />
                    </div>
                    <ul style={styles.pillList}>
                      {(searchTerm
                        ? filteredPills
                        : selectedPrescriptionDetail.medicineNames
                      ).map((name, index) => (
                        <li
                          key={index}
                          style={styles.pillItem}
                          onClick={() => handlePillClick(name)}
                        >
                          {name}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {detailError && <p style={styles.error}>{detailError}</p>}
                <button style={styles.closeButton} onClick={handleCloseDetail}>
                  X
                </button>
              </div>
            </div>
          )}
          {!loading && !error && filteredPrescriptionList.length > 0 && (
            <ul style={styles.prescriptionList}>
              {filteredPrescriptionList.map((prescription) => (
                <li
                  key={prescription.perscriptionId}
                  style={styles.prescriptionItem}
                >
                  <div style={styles.prescriptionInfo}>
                    <div
                      onClick={() =>
                        handleShowDetail(prescription.perscriptionId)
                      }
                      style={styles.imageContainer}
                    >
                      <img
                        src={`http://172.20.60.157:8081/one/${prescription.perscriptionImage.replace(
                          /\\\\/g,
                          "/"
                        )}`}
                        alt={`처방전 ${prescription.perscriptionId}`}
                        style={styles.prescriptionImage}
                      />
                    </div>
                    <div style={styles.dateContainer}>
                      {prescription.createAt
                        ? new Date(prescription.createAt).toLocaleDateString(
                            "ko-KR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              timeZone: "Asia/Seoul",
                            }
                          )
                        : "날짜 정보 없음"}
                    </div>
                  </div>
                  <button
                    style={styles.deleteButton}
                    onClick={() =>
                      handleDeletePrescription(prescription.perscriptionId)
                    }
                  >
                    X
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!loading && !error && filteredPrescriptionList.length === 0 && (
            <div style={styles.noResultsContainer}>
              <img
                src="/noinfo.png"
                alt="저장된 처방전 없음"
                style={styles.noResultsImage}
              />
              <p style={styles.noResults}>저장된 처방전이 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    ...commonPageStyles.pageContainer,
    paddingTop: "0",
  },
  content: {
    width: "100%",
    maxWidth: "800px",
    padding: "16px",
    paddingLeft: "16px",
    paddingRight: "16px",
  },
  prescriptionList: {
    ...commonPageStyles.contentWrapper,
    listStyle: "none",
    padding: 0,
  },
  prescriptionItem: {
    width: "100%",
    borderRadius: "12px",
    padding: "12px",
    marginBottom: "16px",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    border: "1px solid #00aa9d",
  },
  imageContainer: {
    flex: 1,
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "12px",
  },
  prescriptionImage: {
    width: "100%",
    maxWidth: "100px",
    height: "auto",
    borderRadius: "8px",
    objectFit: "cover",
  },
  deleteButton: {
    width: "32px",
    height: "32px",
    borderRadius: "16px",
    border: "none",
    backgroundColor: "#6c757d",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - 32px)",
    maxWidth: "343px",
    height: "44px",
    backgroundColor: "#00aa9d",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    overflow: "hidden",
  },
  modalContent: {
    width: "90%",
    maxWidth: "500px",
    maxHeight: "90vh",
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    position: "relative",
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
  },
  detailImage: {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
    marginBottom: "16px",
    border: "1px solid #00aa9d",
  },
  closeButton: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "32px",
    height: "32px",
    borderRadius: "16px",
    border: "none",
    backgroundColor: "#6c757d",
    color: "#fff",
    fontSize: "14px",
    cursor: "pointer",
  },
  error: {
    color: "#ff4444",
    textAlign: "center",
    margin: "16px 0",
  },
  searchInputContainer: {
    position: "relative",
    width: "100%",
    marginBottom: "16px",
  },
  searchInput: {
    width: "100%",
    padding: "8px",
    paddingRight: "30px",
    marginBottom: "16px",
    border: "1px solid #00aa9d",
    borderRadius: "4px",
  },
  searchIcon: {
    position: "absolute",
    top: "50%",
    right: "10px",
    transform: "translateY(-100%)",
    color: "#00aa9d",
    fontSize: "16px",
    pointerEvents: "none",
  },
  pillList: {
    listStyle: "none",
    padding: 0,
  },
  pillItem: {
    padding: "8px",
    borderBottom: "1px solid #e0e0e0",
    cursor: "pointer",
  },
  dateSearchContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  dateInput: {
    padding: "8px",
    border: "1px solid #00aa9d",
    borderRadius: "4px",
    fontSize: "14px",
  },
  dateSeparator: {
    color: "#00aa9d",
    fontWeight: "bold",
  },
  searchButton: {
    padding: "8px",
    backgroundColor: "#00aa9d",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "#009688",
    },
  },
  prescriptionInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  dateContainer: {
    fontSize: "14px",
    color: "#666",
  },
  medicationPeriodContainer: {
    width: "100%",
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    border: "1px solid #00aa9d",
  },
  medicationPeriodTitle: {
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#333",
  },
  medicationPeriodInputs: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "12px",
  },
  medicationPeriodInput: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  saveButton: {
    width: "100%",
    padding: "8px",
    backgroundColor: "#00aa9d",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    marginBottom: "8px",
  },
  calendarButton: {
    width: "100%",
    padding: "8px",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  calendarContainer: {
    width: "100%",
    marginBottom: "20px",
    overflow: "visible",
  },
  medicationMemoInput: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "8px",
  },
  memoTextarea: {
    width: "100%",
    minHeight: "80px",
    padding: "8px",
    border: "1px solid #00aa9d",
    borderRadius: "4px",
    resize: "vertical",
    fontFamily: "inherit",
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
};

export default PrescriptionListPage;
