from pydantic import BaseModel

class PollRequest(BaseModel):
    requestId: str
