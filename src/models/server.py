import os
import uvicorn
import aiofiles

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from src.models.poll_request import PollRequest
from src.models.summarize_manager import SummarizeManager

class Server:
    """
    A class to represent the server.

    Attributes:
        app (FastAPI): The FastAPI instance.
        extractor_manager (ExtractorManager): The ExtractorManager instance.
        upload_dir (str): The temporary upload folder path.
    """
    def __init__(self, extractor_manager: SummarizeManager) -> None:
        """
        Constructs the Server instance.

        Args:
            extractor_manager (ExtractorManager): The ExtractorManager instance.
        """
        self.app = FastAPI()
        self.extractor_manager = extractor_manager
        self.upload_dir = self.__init_upload_folder(self.extractor_manager.upload_folder_path)

        self.__init_routes()

    def __init_upload_folder(self, upload_folder_path: str) -> str:
        """
        Initializes the upload folder.

        Args:
            upload_folder_path (str): The upload folder path.
        Returns:
            str: The upload folder path.
        """
        os.makedirs(upload_folder_path, exist_ok=True)
        return upload_folder_path

    def __init_cors(self) -> None:
        """
        Initializes the CORS of the server.
        """
        origins = ["*"]

        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "DELETE"],
            allow_headers=["X-Custom-Header", "Content-Type"],
        )

    def __init_routes(self) -> None:
        """
        Initializes the routes of the server.
        """
        self.__init_cors()

        @self.app.post("/summarize")
        async def summarize(file: UploadFile = File(...)):
            return await self.__summarize(file)

        @self.app.post("/poll_summarize")
        async def poll_summarize(item: PollRequest):
            return await self.__poll_summarize(item)

    async def __summarize(self, file: UploadFile = File(...)) -> JSONResponse:
        if not file or not file.filename or not file.filename.endswith(".pdf"):
            return JSONResponse(content={"error": "Invalid file"}, status_code=400)

        file_path = os.path.join(self.upload_dir, file.filename)

        try:
            async with aiofiles.open(file_path, "wb") as buffer:
                while chunk := await file.read(1024 * 1024):
                    await buffer.write(chunk)

            request_id = self.extractor_manager.start_summarize(file_path)
            return JSONResponse(content={"data": {"requestId": request_id}}, status_code=200)
        except Exception as e:
            print(f"Error while processing the request: {str(e)}")
            return JSONResponse(content={"error": "Internal server error"}, status_code=500)

    async def __poll_summarize(self, item: PollRequest) -> JSONResponse:
        request_id = item.requestId

        if not request_id:
            return JSONResponse(content={"error": "Invalid request"}, status_code=400)

        status = self.extractor_manager.poll_summarize(request_id)

        if (status["error"]):
            return JSONResponse(content={"error": status["error"]}, status_code=400)

        return JSONResponse(content={"data": status}, status_code=200)

    def start(self) -> None:
        """
        Starts the server.
        """
        uvicorn.run(self.app, host="0.0.0.0", port=8080)
