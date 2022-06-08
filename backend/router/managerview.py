from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from models.model import QA

from service.manager import completeQAdata, getQAdata, rejectQAdata, acceptQAdata

router = APIRouter()

# 관리자 메인 뷰에서는 상담 내용 보여줘야 함
# 거절, 수락, 완료, next 버튼 있으니 요청을 받아야 함
# 상담 할 때, 상담 내용?을 적는 칸이 있음 해당 정보까지 받아야함
# 
@router.get("/manager/counserting",tags=["manager"])
def managerDataGet():
    result = getQAdata()
    if result is None:
        return JSONResponse(status_code = status.HTTP_404_NOT_FOUND)
    return JSONResponse(content = result, status_code = status.HTTP_200_OK)


@router.post("/manager/{QA_id}/{status}",tags=["manager"])
async def managerPostData(QA_id: str, status: str):
    status = int(status)
    if status == 200:               # 상담사가 상담 완료 했을 경우
        result = completeQAdata(QA_id)
    elif status == 202:             # 상담사가 상담 수락 했을 경우
        result =  acceptQAdata(QA_id)
    elif status == 503:             # 상담사가 상담 거절했을 경우
        result = rejectQAdata(QA_id)
    return JSONResponse(status_code = result)