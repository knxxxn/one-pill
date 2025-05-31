from flask import Flask, request, jsonify
import os
import re
from google.cloud import vision
from werkzeug.utils import secure_filename

app = Flask(__name__)
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'vision-api-key.json'

UPLOAD_FOLDER = 'uploads'  # 업로드된 파일을 저장할 디렉토리 설정
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def medicine_name(name):
    # 약품 이름에서 괄호와 그 내용 제거
    if '(' in name:
        name = name.split('(')[0]

    # 일반적인 불필요한 문자 제거
    chars_to_remove = [')', '*', '_', '[', ']', ':', ';', ',', '.']
    for char in chars_to_remove:
        name = name.replace(char, '')

    # 용량 정보 제거 시도 (예: "100mg", "500ml" 등)
    # 숫자+단위 패턴 제거
    name = re.sub(r'\d+\s*(mg|ml|g|mcg|IU|정|캡슐|병|갑)', '', name)

    # 앞뒤 공백 제거
    name = name.strip()

    return name


def detect_text(image_path):
    client = vision.ImageAnnotatorClient()  # 객체 생성
    with open(image_path, "rb") as image_file:  # 이미지를 바이너리 모드(rb)로 열고 파일 내용을 읽어 content에 저장
        content = image_file.read()
    image = vision.Image(content=content)
    response = client.text_detection(image=image)
    texts = response.text_annotations

    if texts:
        lines = texts[0].description.split('\n')
        medicine_names = []

        # 필터링할 키워드 목록
        skip_keywords = [
            '환자', '병원', '정보', '·', '-', '▶', '/', '※', '[',
            '흰색', '적색', '황색', '노랑색', '주황색', '주홍', '보라', '백색', '연두색',
            '형', '씩', '호', '명', '생년월일', '진료', '진단', '처방', '발행', '조제',
            '보험', '보험자', '번호', '기관', '담당', '의사', '약사', '서명', '날짜',
            '이름', '성별', '나이', '일수', '용법', '용량', '휴대폰', '전화', '주소',
            '특이사항', '비고', '참고', '문의', '팩스', '이메일', '치료', '코팅정'
        ]

        # 약품 관련 키워드 목록
        medicine_keywords = ['캡슐', '정', '시럽', '셀', '크림', '연고', '겔']

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # 약품 관련 키워드 확인
            is_medicine = any(keyword in line.lower() for keyword in medicine_keywords)

            # 필터링할 키워드 확인
            should_skip = any(keyword in line.lower() for keyword in skip_keywords)

            # 약품 관련 키워드가 있고 필터링할 키워드는 없는 경우에만 추가
            if is_medicine and not should_skip:
                # 숫자로만 이루어진 텍스트 필터링
                if not line.replace(' ', '').isdigit():
                    clean_name = medicine_name(line)
                    # 너무 짧은 이름 필터링
                    if len(clean_name) > 2:
                        medicine_names.append(clean_name)

        if medicine_names:
            # 중복 제거
            medicine_names = list(dict.fromkeys(medicine_names))
            return medicine_names
        return []
    else:
        return []


@app.route('/perscription', methods=['POST'])
def perscription():
    if 'file' not in request.files:
        return jsonify({
            'ResultCd': '4000',
            'ResultMsg': '파일이 없습니다',
            'Medicine_names': []
        }), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({
            'ResultCd': '4000',
            'ResultMsg': '파일 이름이 없습니다',
            'Medicine_names': []
        }), 400
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        try:  # Google Cloud Vision API로 약품명 감지
            medicine_names = detect_text(filepath)
            os.remove(filepath)  # 임시 파일 삭제

            if not medicine_names:
                return jsonify({
                    'ResultCd': '2000',
                    'ResultMsg': '처방전에서 약품명을 찾을 수 없습니다',
                    'Medicine_names': []
                })

            return jsonify({
                'ResultCd': '1000',
                'ResultMsg': '처방전 사진 분석 성공',
                'Medicine_names': medicine_names
            })
        except Exception as e:  # 에러 발생 시 임시 파일 삭제
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({
                'ResultCd': '5000',
                'ResultMsg': f'처리 중 오류가 발생했습니다: {str(e)}',
                'Medicine_names': []
            }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)