from fastapi import FastAPI, File, UploadFile, HTTPException
import os
import shutil
from typing import List, Optional
from pydantic import BaseModel
from google.cloud import vision
import uuid

app = FastAPI(title="처방전 이미지 분석 API")

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'vision-api-key.json'

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


class MedicineResponse(BaseModel):
    ResultCd: str
    ResultMsg: str
    Medicine_names: List[str]


def medicine_name(name: str) -> str:
    if '(' in name:
        name = name.split('(')[0]
    name = name.replace(')', '').strip()
    name = name.replace('*', '').strip()
    name = name.replace('_', '').strip()

    return name


def detect_text(image_path: str) -> List[str]:
    client = vision.ImageAnnotatorClient()

    with open(image_path, "rb") as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    response = client.text_detection(image=image)
    texts = response.text_annotations

    if texts:
        lines = texts[0].description.split('\n')
        medicine_names = []

        for line in lines:
            line = line.strip()
            if not line:
                continue

            if any(x in line.lower() for x in ['캡슐', '정', '시럽', '셀']):
                if not any(line.startswith(x) for x in
                           ['-', '▶', '·', '/', '흰색', '적색', '황색', '노랑색', '주황색', '주홍/황색', '보라/백색', 'AMG', 'DWE',
                            '환자정보 :']):
                    clean_name = medicine_name(line)
                    if len(clean_name) > 5:
                        medicine_names.append(clean_name)

        if medicine_names:
            medicine_names = list(dict.fromkeys(medicine_names))
            return medicine_names
        return []
    else:
        return []


@app.post("/prescription", response_model=MedicineResponse)
async def analyze_prescription(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="파일이 없습니다")

    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    temp_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_FOLDER, temp_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        medicine_names = detect_text(file_path)

        return MedicineResponse(
            ResultCd="1000",
            ResultMsg="처방전 사진 분석 성공",
            Medicine_names=medicine_names
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"처리 중 오류가 발생했습니다: {str(e)}"
        )

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5001)