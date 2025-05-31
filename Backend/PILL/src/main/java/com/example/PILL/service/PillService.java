package com.example.PILL.service;

import com.example.PILL.config.jwt.JwtService;
import com.example.PILL.dto.CommonResDto;
import com.example.PILL.dto.pill.MyPillSaveReqDto;
import com.example.PILL.dto.pill.PerscriptionPeriodReqDto;
import com.example.PILL.dto.pill.PerscriptionPeriodResDto;
import com.example.PILL.entity.pill.MyPill;
import com.example.PILL.entity.pill.Perscription;
import com.example.PILL.entity.pill.PerscriptionItem;
import com.example.PILL.entity.pill.PerscriptionPeriod;
import com.example.PILL.entity.user.User;
import com.example.PILL.repository.MyPillRepository;
import com.example.PILL.repository.PerscriptionItemRepository;
import com.example.PILL.repository.PerscriptionPeriodRepository;
import com.example.PILL.repository.PerscriptionRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PillService {

    private final Logger log = LoggerFactory.getLogger(PillService.class);

    private final MyPillRepository myPillRepository;
    private final JwtService jwtService;
    private final UserService userService;
    private final PerscriptionRepository perscriptionRepository;
    private final PerscriptionItemRepository perscriptionItemRepository;
    private final PerscriptionPeriodRepository perscriptionPeriodRepository;
    private final ObjectMapper objectMapper;

    @Value("${upload.perscription.dir}")
    private String uploadDir;

    private static final String UPLOAD_DIR = "uploads/perscriptions/";

    private final int PAGE_SIZE = 10; // 한 페이지에 10개씩 보여주기

    public CommonResDto<Map<String, Object>> getPillInfoList(String entpName, String itemName, String efcyQesitm, int page) throws IOException {
        log.info("[getPillInfoList] START - Page: {}", page);
        String apiResponse = getPillInfoFromApi(entpName, itemName, efcyQesitm, page);
        try {
            JSONObject jsonResponse = new JSONObject(apiResponse);
            JSONObject body = jsonResponse.getJSONObject("body");
            JSONArray items = body.getJSONArray("items");
            int totalItems = body.getInt("totalCount");
            int totalPages = (int) Math.ceil((double) totalItems / PAGE_SIZE); // 총 페이지 수

            Map<String, Object> result = new HashMap<>();
            result.put("totalPages", totalPages);
            result.put("currentPage", page);
            result.put("items", items.toString()); // JSON 배열 그대로 전달

            log.info("[getPillInfoList] SUCCESS - Total Items: {}, Total Pages: {}, Current Page: {}, Item Count: {}", totalItems, totalPages, page, items.length());
            return new CommonResDto<>("1000", "약 정보 목록 조회 성공", result);

        } catch (JSONException e) {
            e.printStackTrace();
            return new CommonResDto<>("5000", "데이터 파싱 오류", null);
        }
    }
    /**
     * 공공 API를 호출하는 메서드
     */
    private String getPillInfoFromApi(String entpName, String itemName, String efcyQesitm, int page) throws IOException {
        log.info("getPillInfoFromApi - Page: {}", page);
        StringBuilder urlBuilder = new StringBuilder("http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList");
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + "s21Wj2HQKULh%2BIOXkG26Dd1OJhgI024f1w34SrN6QEexH9CQZvD7D2nL5vwP8Hj3FIuZjtYNEMlbqPyOury8Fw%3D%3D");
        urlBuilder.append("&" + URLEncoder.encode("type", "UTF-8") + "=" + URLEncoder.encode("json", "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("pageNo", "UTF-8") + "=" + URLEncoder.encode(String.valueOf(page), "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("numOfRows", "UTF-8") + "=" + URLEncoder.encode(String.valueOf(PAGE_SIZE), "UTF-8"));

        if (!StringUtils.isEmpty(entpName)) {
            urlBuilder.append("&" + URLEncoder.encode("entpName", "UTF-8") + "=" + URLEncoder.encode(entpName, "UTF-8"));
        }
        if (!StringUtils.isEmpty(itemName)) {
            urlBuilder.append("&" + URLEncoder.encode("itemName", "UTF-8") + "=" + URLEncoder.encode(itemName, "UTF-8"));
        }
        if (!StringUtils.isEmpty(efcyQesitm)) {
            urlBuilder.append("&" + URLEncoder.encode("efcyQesitm", "UTF-8") + "=" + URLEncoder.encode(efcyQesitm, "UTF-8"));
        }
        log.info("API 호출 URL: {}", urlBuilder.toString());

        URL url = new URL(urlBuilder.toString());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-type", "application/json");

        BufferedReader rd;
        StringBuilder sb = new StringBuilder();
        try {
            if (conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
                rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            } else {
                rd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
            }
            String line;
            while ((line = rd.readLine()) != null) {
                sb.append(line);
            }
            rd.close();
        } catch (IOException e) {
            log.error("API 통신 오류: {}", e.getMessage());
            return "{\"error\": \"API 통신 오류\"}";
        } finally {
            conn.disconnect();
        }
        log.info("API 응답: {}", sb.toString());
        return sb.toString();
    }
    /**
     * @MethodName getPillInfoDetail
     * @MethodDec 약 상세 정보 조회
     * @Date 2025.04.03
     * @Author nxxxn
     * @return 약 상세 정보 조회 응답 DTO
     * @throws IOException 입출력 예외 발생 시
     */
    public CommonResDto<String> getPillInfoDetail(String itemSeq) throws IOException {
        log.info("[getPillInfoDetail] START");
        StringBuilder urlBuilder = new StringBuilder("http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList");
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + "s21Wj2HQKULh%2BIOXkG26Dd1OJhgI024f1w34SrN6QEexH9CQZvD7D2nL5vwP8Hj3FIuZjtYNEMlbqPyOury8Fw%3D%3D");
        urlBuilder.append("&" + URLEncoder.encode("itemSeq", "UTF-8") + "=" + URLEncoder.encode(itemSeq, "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("type", "UTF-8") + "=" + URLEncoder.encode("json", "UTF-8"));

        URL url = new URL(urlBuilder.toString());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-type", "application/json");

        BufferedReader rd;
        if (conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
            rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        } else {
            rd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
        }

        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = rd.readLine()) != null) {
            sb.append(line);
        }
        rd.close();
        conn.disconnect();

        try {
            JSONObject json = new JSONObject(sb.toString());
            JSONObject body = json.getJSONObject("body");
            JSONArray items = body.getJSONArray("items");

            if (items.length() > 0) {
                JSONObject item = items.getJSONObject(0);
                JSONObject result = new JSONObject();
                result.put("itemSeq", item.optString("itemSeq"));
                result.put("itemName",item.optString("itemName"));
                result.put("efcyQesitm", item.optString("efcyQesitm"));
                result.put("useMethodQesitm", item.optString("useMethodQesitm"));
                result.put("atpnWarnQesitm", item.optString("atpnWarnQesitm"));
                result.put("atpnQesitm", item.optString("atpnQesitm"));
                result.put("intrcQesitm", item.optString("intrcQesitm"));
                result.put("seQesitm", item.optString("seQesitm"));
                result.put("depositMethodQesitm", item.optString("depositMethodQesitm"));
                result.put("itemImage", item.optString("itemImage"));

                log.info("[getPillInfoDetail] SUCCESS");
                return new CommonResDto<>("1000", "약 상세 정보 조회 성공", result.toString());
            } else {
                return new CommonResDto<>("5000", "데이터가 없습니다", "{\"error\": \"데이터가 없습니다\"}");
            }
        } catch (JSONException e) {
            e.printStackTrace();
            return new CommonResDto<>("5000", "데이터가 없습니다", "{\"error\": \"데이터가 없습니다\"}");
        }
    }
    /**
     * @MethodName getPillInfo
     * @MethodDec 약 정보 조회
     * @Date 2025.04.03
     * @Author nxxxn
     * @return 약 정보 조회 결과(json)
     * @throws IOException 입출력 예외 발생 시
     */
    private String getPillInfo(String entpName, String itemName, String efcyQesitm) throws IOException {
        log.info("getPillInfo - itemName received: {}", itemName);
        log.info("getPillInfo - entpName received: {}", entpName);
        log.info("getPillInfo - efcyQesitm received: {}", efcyQesitm);
        StringBuilder urlBuilder = new StringBuilder("http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList");
        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + "s21Wj2HQKULh%2BIOXkG26Dd1OJhgI024f1w34SrN6QEexH9CQZvD7D2nL5vwP8Hj3FIuZjtYNEMlbqPyOury8Fw%3D%3D");
        urlBuilder.append("&" + URLEncoder.encode("type", "UTF-8") + "=" + URLEncoder.encode("json", "UTF-8"));

        if (!StringUtils.isEmpty(entpName)) {
            urlBuilder.append("&" + URLEncoder.encode("entpName", "UTF-8") + "=" + URLEncoder.encode(entpName, "UTF-8"));
        }
        if (!StringUtils.isEmpty(itemName)) {
            urlBuilder.append("&" + URLEncoder.encode("itemName", "UTF-8") + "=" + URLEncoder.encode(itemName, "UTF-8"));
        }
        if (!StringUtils.isEmpty(efcyQesitm)) {
            urlBuilder.append("&" + URLEncoder.encode("efcyQesitm", "UTF-8") + "=" + URLEncoder.encode(efcyQesitm, "UTF-8"));
        }
        log.info("API 호출 URL: {}", urlBuilder.toString());

        URL url = new URL(urlBuilder.toString());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-type", "application/json");

        BufferedReader rd;
        StringBuilder sb = new StringBuilder();
        try {
            if (conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
                rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            } else {
                rd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
            }
            String line;
            while ((line = rd.readLine()) != null) {
                sb.append(line);
            }
            rd.close();
        } catch (IOException e) {
            log.error("API 통신 오류: {}", e.getMessage());
            return "{\"error\": \"API 통신 오류\"}";
        } finally {
            conn.disconnect();
        }
        log.info("API 응답: {}", sb.toString());

        try {
            JSONObject json = new JSONObject(sb.toString());
            JSONObject body = json.getJSONObject("body");
            JSONArray items = body.getJSONArray("items");
            JSONArray result = new JSONArray();

            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.getJSONObject(i);
                result.put(item);
            }
            return result.toString();
        } catch (JSONException e) {
            e.printStackTrace();
            return "{\"error\": \"데이터 파싱 오류\"}";
        }
    }
    /**
     * @MethodName saveMyPill
     * @MethodDec 유저 약 저장
     * @Date 2025.04.03
     * @Author nxxxn
     * @param requestDto 유저 약 저장 요청 DTO
     * @return 유저 약 저장 응답 DTO
     */
    @Transactional
    public CommonResDto<String> saveMyPill(String token, MyPillSaveReqDto requestDto) {
        log.info("[saveMyPill] START");
        String usermadeId = jwtService.extractUsername(token);
        User user = (User) userService.loadUserByUsername(usermadeId);

        // 이미 저장된 약인지 확인
        Optional<MyPill> existingPill = myPillRepository.findByUserAndItemSeq(user, requestDto.getItemSeq());
        if (existingPill.isPresent()) {
            return new CommonResDto<>("2003", "이미 저장된 약입니다", null);
        }

        MyPill myPill = MyPill.builder()
                .user(user)
                .itemSeq(requestDto.getItemSeq())
                .pillName(requestDto.getPillName())
                .pillDesc(requestDto.getPillDesc())
                .createAt(LocalDateTime.now())
                .build();

        myPillRepository.save(myPill);

        log.info("[saveMyPill] SUCCESS userId: {}", user.getUserId());
        return new CommonResDto<>("1000", "약 정보 저장 성공", null);
    }
    /**
     * @MethodName getMyPillList
     * @MethodDec 유저 약 저장 리스트
     * @Date 2025.04.03
     * @Author nxxxn
     * @return 유저 약 저장 리스트 응답 DTO
     */
    @Transactional
    public CommonResDto<String> getMyPillList(String token) {
        log.info("[getMyPillList] START");
        String usermadeId = jwtService.extractUsername(token);
        User user = (User) userService.loadUserByUsername(usermadeId);

        List<MyPill> myPillList = myPillRepository.findByUser(user);

        if (myPillList.isEmpty()) {
            return new CommonResDto<>("2000", "저장된 약 정보가 없습니다", null);
        }
        JSONArray jsonArray = new JSONArray();
        for (MyPill myPill : myPillList) {
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("myPillId", myPill.getMyPillId());
            jsonObject.put("itemSeq", myPill.getItemSeq());
            jsonObject.put("pillName", myPill.getPillName());
            jsonObject.put("pillDesc", myPill.getPillDesc());
            jsonObject.put("createAt", myPill.getCreateAt());
            jsonArray.put(jsonObject);
        }
        log.info("[getMyPillList] SUCCESS");
        return new CommonResDto<>("1000", "저장된 약 정보 조회 성공", jsonArray.toString());
    }
    /**
     * @MethodName deleteMyPill
     * @MethodDec 유저 약 저장 삭제
     * @Date 2025.04.03
     * @Author nxxxn
     * @return 유저 약 저장 삭제 응답 DTO
     */
    @Transactional
    public CommonResDto<String> deleteMyPill(String token, Long myPillId) {
        log.info("[deleteMyPill] START");
        String usermadeId = jwtService.extractUsername(token);
        User user = (User) userService.loadUserByUsername(usermadeId);

        MyPill myPill = myPillRepository.findById(myPillId).orElse(null);

        if (myPill == null) {
            return new CommonResDto<>("2001", "해당 약 정보를 찾을 수 없습니다", null);
        }
        if (!myPill.getUser().equals(user)) {
            return new CommonResDto<>("2002", "약 삭제 권한이 없습니다", null);
        }
        myPillRepository.delete(myPill);
        log.info("[deleteMyPill] SUCCESS");
        return new CommonResDto<>("1000", "약 정보 삭제 성공", null);
    }
    /**
     * @MethodName uploadPerscription
     * @MethodDec 처방전 사진 업로드
     * @Date 2025.04.04
     * @Author nxxxn
     * @return 처방전 사진 업로드 응답 DTO
     */
    @Transactional
    public CommonResDto<String> uploadPerscription(String userId, MultipartFile file) throws IOException {
        log.info("[uploadPerscription] START");
        try {
            // 파일 저장
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR + fileName);
            Files.createDirectories(Paths.get(UPLOAD_DIR)); // 디렉토리 생성
            Files.copy(file.getInputStream(), filePath); // 파일 저장

            // 데이터베이스에 저장
            Perscription perscription = Perscription.builder()
                    .userId(userId)
                    .perscriptionImage(filePath.toString()) // 파일 경로 저장
                    .build();
            perscriptionRepository.save(perscription);

            log.info("[uploadPerscription] SUCCESS userId: {}, fileName: {}", userId, fileName);
            return new CommonResDto<>("1000", "처방전 사진 업로드 성공", null);

        } catch (IOException e) {
            log.error("[uploadPerscription] FAIL userId: {}, error: {}", userId, e.getMessage());
            throw e; // 예외를 다시 던져 트랜잭션 롤백 유도
        }
    }
    /**
     * @MethodName savePerscriptionItems
     * @MethodDec 처방전 정보와 인식된 약품명을 함께 저장
     * @Date 2025.04.11
     * @Author nxxxn
     * @param userId 사용자 ID
     * @param file 업로드된 처방전 이미지 파일
     * @param medicineNames 인식된 약품명 목록
     * @return 저장된 Perscription 엔티티
     * @throws IOException 파일 저장 실패 시
     */
    @Transactional
    public Perscription savePerscriptionItems(String userId, MultipartFile file, List<String> medicineNames) throws IOException {
        log.info("[savePerscriptionWithItems] START - userId: {}, medicineNames: {}", userId, medicineNames);
        // 처방전 이미지 저장
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir + fileName);
        Files.createDirectories(Paths.get(uploadDir));
        Files.copy(file.getInputStream(), filePath);
        // 처방전 저장
        Perscription perscription = Perscription.builder()
                .userId(userId)
                .perscriptionImage(filePath.toString())
                .build();
        Perscription savedPerscription = perscriptionRepository.save(perscription);
        // 인식 결과 저장
        if (medicineNames != null && !medicineNames.isEmpty()) {
            try {
                String medicineNamesJson = objectMapper.writeValueAsString(medicineNames); // JSON 문자열로 변환
                PerscriptionItem perscriptionItem = PerscriptionItem.builder()
                        .perscription(savedPerscription)
                        .perscriptionResult(medicineNamesJson.getBytes()) // JSON 문자열의 바이트 배열 저장
                        .build();
                perscriptionItemRepository.save(perscriptionItem);
                log.info("[savePerscriptionWithItems] 약품 리스트 저장 성공 - prescriptionId: {}, medicineNames: {}", savedPerscription.getPerscriptionId(), medicineNames);
            } catch (Exception e) {
                log.info("[savePerscriptionWithItems] 약품 리스트 JSON 변환 실패");
            }
        }
        return savedPerscription;
    }
    /**
     * @MethodName getPerscriptionList
     * @MethodDec 처방전 사진 리스트 조회
     * @Date 2025.04.04
     * @Author nxxxn
     * @return 처방전 사진 리스트 조회 응답 DTO
     */
    @Transactional(readOnly = true)
    public CommonResDto<List<Perscription>> getPerscriptionList(String userId) {
        log.info("[getPerscriptoinList] START");
        List<Perscription> perscriptionList = perscriptionRepository.findByUserId(userId);
        return new CommonResDto<>("1000", "처방전 사진 목록 조회 성공", perscriptionList);
    }
    /**
     * @MethodName getPerscriptionsByDate
     * @MethodDec 특정 기간 내 처방전 사진 리스트 조회
     * @Date 2025.04.16
     * @Author nxxxn
     * @param startDate 조회 시작 날짜 (YYYY-MM-DD 형식, null이면 전체 기간)
     * @param endDate 조회 종료 날짜 (YYYY-MM-DD 형식, null이면 전체 기간)
     * @return 특정 기간 내 처방전 사진 리스트 조회 응답 DTO
     */
    @Transactional(readOnly = true)
    public CommonResDto<List<Perscription>> getPerscriptionsByDate(String userId, String startDate, String endDate) {
        log.info("[getPerscriptionsByDate] START - userId: {}, startDate: {}, endDate: {}", userId, startDate, endDate);
        List<Perscription> perscriptionList;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        LocalDateTime startDateTime = null;
        LocalDateTime endDateTime = null;

        if (startDate != null && !startDate.isEmpty()) {
            startDateTime = LocalDateTime.parse(startDate + " 00:00:00", formatter);
        }
        if (endDate != null && !endDate.isEmpty()) {
            endDateTime = LocalDateTime.parse(endDate + " 23:59:59", formatter);
        }

        if (startDateTime != null && endDateTime != null) {
            perscriptionList = perscriptionRepository.findByUserIdAndCreateAtBetween(userId, startDateTime, endDateTime);
        } else if (startDateTime != null) {
            perscriptionList = perscriptionRepository.findByUserIdAndCreateAtAfter(userId, startDateTime);
        } else if (endDateTime != null) {
            perscriptionList = perscriptionRepository.findByUserIdAndCreateAtBefore(userId, endDateTime);
        } else {
            perscriptionList = perscriptionRepository.findByUserId(userId);
        }

        return new CommonResDto<>("1000", "기간별 처방전 사진 목록 조회 성공", perscriptionList);
    }
    /**
     * @MethodName getPerscription
     * @MethodDec 처방전 사진 조회
     * @Date 2025.04.04
     * @Author nxxxn
     * @return 처방전 사진 조회 응답 DTO
     */
    @Transactional(readOnly = true)
    public CommonResDto<Perscription> getPerscription(Long perscriptionId) {
        log.info("[getPerscription] START - perscriptionId: {}", perscriptionId);
        Optional<Perscription> perscriptionOptional = perscriptionRepository.findByPerscriptionId(perscriptionId);

        if (perscriptionOptional.isPresent()) {
            Perscription perscription = perscriptionOptional.get();
            List<PerscriptionItem> perscriptionItems = perscriptionItemRepository.findByPerscription_PerscriptionId(perscriptionId);
            if (!perscriptionItems.isEmpty()) {
                try {
                    PerscriptionItem perscriptionItem = perscriptionItems.get(0);
                    byte[] perscriptionResultBytes = perscriptionItem.getPerscriptionResult();
                    if (perscriptionResultBytes != null && perscriptionResultBytes.length > 0) {
                        String medicineNamesJson = new String(perscriptionResultBytes);
                        List<String> medicineNames = objectMapper.readValue(medicineNamesJson, new TypeReference<List<String>>() {});
                        perscription.setMedicineNames(medicineNames);
                        return new CommonResDto<>("1000", "처방전 사진 조회 성공", perscription);
                    }
                } catch (Exception e) {
                    log.error("[getPerscription] 약품명 JSON 파싱 실패 - perscriptionId: {}, error: {}", perscriptionId, e.getMessage());
                    return new CommonResDto<>("5000", "약품명 정보 로딩 실패", perscription);
                }
            }
            return new CommonResDto<>("1000", "처방전 사진 조회 성공", perscription);
        } else {
            return new CommonResDto<>("2001", "해당 처방전 사진을 찾을 수 없습니다", null);
        }
    }
    /**
     * @MethodName deletePerscription
     * @MethodDec 처방전 사진 삭제
     * @Date 2025.04.08
     * @Author nxxxn
     * @param userId 사용자 ID
     * @param perscriptionId 삭제할 처방전 ID
     * @return 처방전 사진 삭제 응답 DTO
     */
    @Transactional
    public CommonResDto<String> deletePerscription(String userId, Long perscriptionId) {
        log.info("[deletePerscription] START");
        Optional<Perscription> perscriptionOptional = perscriptionRepository.findByPerscriptionId(perscriptionId);

        if (perscriptionOptional.isEmpty()) {
            return new CommonResDto<>("2001", "해당 처방전 사진을 찾을 수 없습니다", null);
        }
        Perscription perscription = perscriptionOptional.get();

        if (!perscription.getUserId().equals(userId)) {
            return new CommonResDto<>("2002", "처방전 사진 삭제 권한이 없습니다", null);
        }

        try { // 파일 삭제
            Path filePathToDelete = Paths.get(perscription.getPerscriptionImage());
            Files.deleteIfExists(filePathToDelete);
            perscriptionRepository.delete(perscription);
            log.info("[deletePerscription] SUCCESS userId: {}, perscriptionId: {}", userId, perscriptionId);
            return new CommonResDto<>("1000", "처방전 사진 삭제 성공", null);
        } catch (IOException e) {
            log.error("[deletePerscription] FAIL userId: {}, perscriptionId: {}, error: {}", userId, perscriptionId, e.getMessage());
            return new CommonResDto<>("5000", "처방전 사진 삭제 중 오류가 발생했습니다", null);
        }
    }

    @Transactional
    public void savePerscriptionPeriod(String userId, PerscriptionPeriodReqDto perscriptionPeriodReqDto) {
        log.info("[savePerscriptionPeriod] START - userId: {}, perscriptionPeriodReqDto: {}", userId, perscriptionPeriodReqDto);

        Optional<Perscription> perscriptionOptional = perscriptionRepository.findById(perscriptionPeriodReqDto.getPerscriptionId());
        if (perscriptionOptional.isEmpty()) {
            throw new IllegalArgumentException("해당 처방전 ID가 존재하지 않습니다");
        }
        Perscription perscription = perscriptionOptional.get();

        if (!perscription.getUserId().equals(userId)) {
            throw new IllegalArgumentException("해당 처방전에 대한 접근 권한이 없습니다");
        }

        PerscriptionPeriod perscriptionPeriod = PerscriptionPeriod.builder()
                .perscription(perscription)
                .startDate(perscriptionPeriodReqDto.getStartDate())
                .endDate(perscriptionPeriodReqDto.getEndDate())
                .perscriptionMemo(perscriptionPeriodReqDto.getPerscriptionMemo())
                .build();

        perscriptionPeriodRepository.save(perscriptionPeriod);
        log.info("[savePerscriptionPeriod] SUCCESS - perscriptionPeriodId: {}", perscriptionPeriod.getPerscriptionPeriodId());
    }

    /**
     * @MethodName getLatestPerscriptionPeriod
     * @MethodDec 처방전 약 복용 기간 최신 정보 조회
     * @Date 2025.04.17
     * @Author nxxxn
     * @param userId 사용자 ID
     * @param perscriptionId 처방전 ID
     * @return 최신 복용 기간 정보 응답 DTO
     */
    @Transactional(readOnly = true)
    public CommonResDto<PerscriptionPeriodResDto> getLatestPerscriptionPeriod(String userId, Long perscriptionId) {
        log.info("[getLatestPerscriptionPeriod] START - userId: {}, perscriptionId: {}", userId, perscriptionId);

        Optional<Perscription> perscriptionOptional = perscriptionRepository.findById(perscriptionId);
        if (perscriptionOptional.isEmpty()) {
            log.info("[getLatestPerscriptionPeriod] FAIL - 해당 처방전 ID가 존재하지 않습니다: {}", perscriptionId);
            return new CommonResDto<>("2001", "해당 처방전 ID가 존재하지 않습니다", null);
        }

        Perscription perscription = perscriptionOptional.get();
        if (!perscription.getUserId().equals(userId)) {
            log.info("[getLatestPerscriptionPeriod] FAIL - 해당 처방전에 대한 접근 권한이 없습니다. userId: {}", userId);
            return new CommonResDto<>("2002", "해당 처방전에 대한 접근 권한이 없습니다", null);
        }

        Optional<PerscriptionPeriod> latestPeriodOptional =
                perscriptionPeriodRepository.findTopByPerscription_PerscriptionIdOrderByCreateAtDesc(perscriptionId);

        if (latestPeriodOptional.isEmpty()) {
            log.info("[getLatestPerscriptionPeriod] FAIL - 해당 처방전에 대한 복용 기간 정보가 없습니다. perscriptionId: {}", perscriptionId);
            return new CommonResDto<>("2003", "해당 처방전에 대한 복용 기간 정보가 없습니다", null);
        }

        PerscriptionPeriod latestPeriod = latestPeriodOptional.get();
        PerscriptionPeriodResDto resDto = PerscriptionPeriodResDto.builder()
                .perscriptionPeriodId(latestPeriod.getPerscriptionPeriodId())
                .startDate(latestPeriod.getStartDate())
                .endDate(latestPeriod.getEndDate())
                .perscriptionMemo(latestPeriod.getPerscriptionMemo())
                .build();

        log.info("[getLatestPerscriptionPeriod] SUCCESS - userId: {}, perscriptionId: {}, periodId: {}",
                userId, perscriptionId, resDto.getPerscriptionPeriodId());
        return new CommonResDto<>("1000", "복용 기간 정보 조회 성공", resDto);
    }
}