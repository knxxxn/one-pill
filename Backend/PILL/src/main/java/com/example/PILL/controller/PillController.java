package com.example.PILL.controller;

import com.example.PILL.config.jwt.JwtService;
import com.example.PILL.dto.CommonResDto;
import com.example.PILL.dto.pill.MyPillSaveReqDto;
import com.example.PILL.dto.pill.PerscriptionPeriodReqDto;
import com.example.PILL.dto.pill.PerscriptionPeriodResDto;
import com.example.PILL.dto.pill.PerscriptionResDto;
import com.example.PILL.entity.pill.Perscription;
import com.example.PILL.entity.user.User;
import com.example.PILL.service.PillService;
import com.example.PILL.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pill")
@RequiredArgsConstructor
public class PillController {

    private final PillService pillService;
    private final JwtService jwtService;
    private final UserService userService;
    private final RestTemplate restTemplate;

    @Value("${flask.server.url}")
    private String flaskServerUrl;

    //약 정보 목록 검색
    @GetMapping("/info")
    public ResponseEntity<CommonResDto<Map<String, Object>>> getPillList(
            @RequestParam(value = "entpName", defaultValue = "") String entpName,
            @RequestParam(value = "itemName", defaultValue = "") String itemName,
            @RequestParam(value = "efcyQesitm", defaultValue ="") String efcyQesitm,
            @RequestParam(value = "page", defaultValue = "1") int page
    ) throws IOException {
        CommonResDto<Map<String, Object>> response = pillService.getPillInfoList(entpName, itemName, efcyQesitm, page);
        return ResponseEntity.ok(response);
    }

    //약 상세 정보 검색
    @GetMapping("/detail/{itemSeq}")
    public ResponseEntity<CommonResDto<String>> getPillDetail(@PathVariable String itemSeq) throws IOException {
        CommonResDto<String> response = pillService.getPillInfoDetail(itemSeq);
        return ResponseEntity.ok(response);
    }

    //유저의 약 저장
    @PostMapping("/save")
    public ResponseEntity<CommonResDto<String>> saveMyPill(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader, @RequestBody MyPillSaveReqDto requestDto) {
        String token = authorizationHeader.substring(7);
        CommonResDto<String> response = pillService.saveMyPill(token, requestDto);
        return ResponseEntity.ok(response);
    }

    //유저가 저장한 약 리스트
    @GetMapping("/list")
    public ResponseEntity<CommonResDto<String>> getMyPillList(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader) {
        String token = authorizationHeader.substring(7);
        CommonResDto<String> response = pillService.getMyPillList(token);
        return ResponseEntity.ok(response);
    }

    //유저가 저장한 약 삭제
    @DeleteMapping("/delete/{myPillId}")
    public ResponseEntity<CommonResDto<String>> deleteMyPill(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader, @PathVariable Long myPillId) {
        String token = authorizationHeader.substring(7);
        CommonResDto<String> response = pillService.deleteMyPill(token, myPillId);
        return ResponseEntity.ok(response);
    }

    // 처방전 사진 업로드
    @PostMapping("/perscription")
    public ResponseEntity<CommonResDto<PerscriptionResDto>> uploadAndDetectPerscription(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader,
            @RequestParam("file") MultipartFile file) throws IOException {
        String token = authorizationHeader.substring(7);
        String usermadeId = jwtService.extractUsername(token);
        User user = (User) userService.loadUserByUsername(usermadeId);
        String userId = user.getUserId();

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new CommonResDto<>("4000", "업로드된 파일이 없습니다.", null));
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new MultipartFileResource(file.getBytes(), file.getOriginalFilename()));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        System.out.println("File content type: " + file.getContentType());
        System.out.println("File size: " + file.getSize());

        try {
            ResponseEntity<Map> flaskResponse = restTemplate.exchange(
                    flaskServerUrl + "/perscription",
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            if (flaskResponse.getStatusCode().is2xxSuccessful() && flaskResponse.getBody() != null) {
                Map<String, Object> responseBody = flaskResponse.getBody();
                String resultCd = (String) responseBody.get("ResultCd");
                String resultMsg = (String) responseBody.get("ResultMsg");
                List<String> medicineNames = (List<String>) responseBody.get("Medicine_names");

                if ("1000".equals(resultCd)) {
                    Perscription perscription = pillService.savePerscriptionItems(userId, file, medicineNames);
                    PerscriptionResDto resDto = new PerscriptionResDto(perscription.getPerscriptionId(), perscription.getPerscriptionImage(), medicineNames);
                    return ResponseEntity.ok(new CommonResDto<>("1000", "처방전 저장 및 약품명 인식 성공", resDto));
                } else {
                    return ResponseEntity.internalServerError().body(new CommonResDto<>("5001", "Flask 서버 분석 실패: " + resultMsg, null));
                }
            } else {
                return ResponseEntity.internalServerError().body(new CommonResDto<>("5002", "Flask 서버 통신 실패", null));
            }

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new CommonResDto<>("5003", "Flask 서버 연동 오류: " + e.getMessage(), null));
        }
    }

    //처방전 사진 리스트 불러오기
    @GetMapping("/perscription")
    public ResponseEntity<CommonResDto<List<Perscription>>> getPerscriptionList(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader) {
        String token = authorizationHeader.substring(7);
        String usermadeId = jwtService.extractUsername(token);
        User user = (User) userService.loadUserByUsername(usermadeId);
        String userId = String.valueOf(user.getUserId());

        CommonResDto<List<Perscription>> response = pillService.getPerscriptionList(userId);
        return ResponseEntity.ok(response);
    }

    //처방전 사진 리스트 날짜 필터링
    @GetMapping("/perscription/date")
    public ResponseEntity<CommonResDto<List<Perscription>>> getPrescriptionsByDate(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        String token = authorizationHeader.substring(7);
        String usermadeId = jwtService.extractUsername(token);
        User user = (User) userService.loadUserByUsername(usermadeId);
        String userId = user.getUserId();

        CommonResDto<List<Perscription>> response = pillService.getPerscriptionsByDate(userId, startDate, endDate);
        return ResponseEntity.ok(response);
    }

    //처방전 사진 불러오기
    @GetMapping("/perscription/detail/{perscriptionId}")
    public ResponseEntity<CommonResDto<Perscription>> getPerscriptionDetail(
            @PathVariable Long perscriptionId) {
        CommonResDto<Perscription> response = pillService.getPerscription(perscriptionId);
        return ResponseEntity.ok(response);
    }

    //처방전 사진 삭제
    @DeleteMapping("/perscription/{perscriptionId}")
    public ResponseEntity<CommonResDto<String>> deletePerscription(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader,
            @PathVariable Long perscriptionId) {
        String token = authorizationHeader.substring(7);
        String usermadeId = jwtService.extractUsername(token);
        User user = (User) userService.loadUserByUsername(usermadeId);
        String userId = String.valueOf(user.getUserId());

        CommonResDto<String> response = pillService.deletePerscription(userId, perscriptionId);
        return ResponseEntity.ok(response);
    }

    //처방전 약 복용 기간 설정 저장
    @PostMapping("/perscription/period")
    public ResponseEntity<CommonResDto<String>> savePerscriptionPeriod(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader,
            @RequestBody PerscriptionPeriodReqDto perscriptionPeriodReqDto) {
        String token = authorizationHeader.substring(7);
        String usermadeId = jwtService.extractUsername(token);
        User user = (User) userService.loadUserByUsername(usermadeId);
        String userId = user.getUserId();

        pillService.savePerscriptionPeriod(userId, perscriptionPeriodReqDto);
        return ResponseEntity.ok(new CommonResDto<>("1000", "복용 기간이 저장되었습니다", null));
    }

    @GetMapping("/perscription/period/{perscriptionId}")
    public ResponseEntity<CommonResDto<PerscriptionPeriodResDto>> getLatestPerscriptionPeriod(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader,
            @PathVariable Long perscriptionId) {

        String token = authorizationHeader.substring(7);
        String usermadeId = jwtService.extractUsername(token);
        User user = (User) userService.loadUserByUsername(usermadeId);
        String userId = user.getUserId();

        CommonResDto<PerscriptionPeriodResDto> result = pillService.getLatestPerscriptionPeriod(userId, perscriptionId);

        return ResponseEntity.ok(result);
    }

    //유효성 검사시 발생하는 예외 처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<CommonResDto<Map<String, String>>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        BindingResult bindingResult = ex.getBindingResult();
        Map<String, String> errors = new HashMap<>();
        bindingResult.getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        CommonResDto<Map<String, String>> response = CommonResDto.<Map<String, String>>builder()
                .resultCd("1001")
                .resultMsg("필수값 누락")
                .contents(errors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}