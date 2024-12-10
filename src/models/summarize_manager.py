import os
import shutil

from time import time
from uuid import uuid4
from queue import Queue
from PyPDF2 import PdfReader
from threading import Thread, Lock

from src.enums import RequestStatus
from src.models.request import Request
from src.models.llm_summarize import LlmSummarize
from src.models.pdf_extractor import PdfExtractor
from utils.estimation_time import add_estimation_time, get_estimation_time

class SummarizeManager:
    def __init__(self, upload_folder_path: str, estimation_file_path: str):
        self.request_queue = Queue()
        self.requests: list[Request] = []

        self.upload_folder_path = upload_folder_path
        self.estimation_file_path = estimation_file_path

        self.llm_ai = LlmSummarize()
        self.pdf_extractor = PdfExtractor(upload_folder_path)

        self.running = True
        self.processing_lock = Lock()
        self.processing_thread: Thread = Thread(target=self._process_queue)
        self.processing_thread.start()

    def __get_request(self, request_id: str) -> Request | None:
        """
        Get the request by its id

        Args:
            request_id (str): The id of the request

        Returns:
            request (Request | None): The request if found, None otherwise
        """
        for request in self.requests:
            if request.id == request_id:
                return request
        return None

    def __remove_request(self, request_id: str) -> None:
        """
        Remove the request by its id

        Args:
            request_id (str): The id of the request
        """
        for request in self.requests:
            if request.id == request_id:
                return self.requests.remove(request)


    def __update_request_status(self, request_id: str, status: int, error: str = "", results: list[str] = []) -> None:
        """
        Update the status of the request

        Args:
            request_id (str): The id of the request
            status (int): The new status of the request
            error (str): The error message if the status is failed
        """
        for request in self.requests:
            if request.id == request_id:
                request.status = status
                if status == RequestStatus.EXTRACTING.value:
                    request.time_start = time()
                if status == RequestStatus.FAILED.value:
                    request.result = str(error)
                elif status == RequestStatus.COMPLETED.value:
                    request.result = results
                break

    def _process_queue(self) -> None:
        """
        Process the requests in the queue in a thread
        """
        while self.running:
            try:
                request_id = self.request_queue.get(timeout=1)
                try:
                    if request_id:
                        with self.processing_lock:
                            self._summarize_worker(request_id)
                except Exception as e:
                    print(f"Error while processing request: {str(e)}")
                    self.__update_request_status(request_id, RequestStatus.FAILED.value, str(e))
                finally:
                    self.request_queue.task_done()
            except:
                continue

    def __cleanup_request(self, request_id: str) -> None:
        """
        Cleanup the request by removing the folder and the request from the list

        Args:
            request_id (str): The id of the request
        """
        request = self.__get_request(request_id)
        if request is None:
            return

        if request.status != RequestStatus.FAILED.value:
            during_time = time() - request.time_start
            add_estimation_time(self.estimation_file_path, request.nb_pages, during_time)

        shutil.rmtree(f"{self.upload_folder_path}/{request_id}")

    def _summarize_worker(self, request_id: str) -> None:
        """
        Worker function to summarize the PDF file

        Args:
            request_id (str): The id of the request
        """
        request = self.__get_request(request_id)
        if request is None:
            return

        try:
            self.__update_request_status(request_id, RequestStatus.EXTRACTING.value)
            self.pdf_extractor.convert_pdf_content_to_markdown(request_id)

            self.__update_request_status(request_id, RequestStatus.FILTERING.value)
            results = self.llm_ai.summarize_page(self.upload_folder_path, request_id, request.custom_prompt)

            self.__update_request_status(request_id, RequestStatus.COMPLETED.value, results=results)
        except Exception as e:
            print(f"Error while processing request: {str(e)}")
            self.__update_request_status(request_id, RequestStatus.FAILED.value, str(e))
        finally:
            self.__cleanup_request(request_id)


    def start_summarize(self, file_path: str) -> str | None:
        """
        Start the summarize process

        Args:
            file_path (str): The path to the file to summarize
            output_path (str): The path to the output folder

        Returns:
            requestId (str): The id of the request
        """
        # Generate unique request id
        request_id = str(uuid4())

        # Create output folder if not exists
        os.makedirs(f"{self.upload_folder_path}", exist_ok=True)
        os.makedirs(f"{self.upload_folder_path}/{request_id}", exist_ok=True)

        # Move the PDF file to the output folder
        pdf_path = f"{self.upload_folder_path}/{request_id}/file.pdf"
        shutil.copy(file_path, pdf_path)
        os.remove(file_path)

        # Get the number of pages of the PDF file
        try:
            reader = PdfReader(pdf_path)
            nb_pages = len(reader.pages)
        except Exception as e:
            print(f"Error while reading PDF file: {str(e)}")
            return None
        pass

        # Create the request
        request = Request(id=request_id, pdf_path=pdf_path, nb_pages=nb_pages)
        self.requests.append(request)
        self.request_queue.put(request_id)

        return request_id

    def __get_request_remaining_time(self, request: Request) -> float:
        """
        Get the remaining time of the request

        Args:
            request (Request): The request to get the remaining time
        """
        estimation_time = get_estimation_time(self.estimation_file_path, request.nb_pages)
        if (request.status == RequestStatus.PENDING.value):
            return estimation_time
        return max(estimation_time - (time() - request.time_start), -1)

    def __get_queue_estimation_time(self) -> float:
        """
        Get the estimation time of the queue

        Returns:
            queue_time_estimation (float): The estimation time of the queue
        """
        queue_time_estimation = 0
        queue_requests = [r for r in self.requests if r.status == RequestStatus.PENDING.value]
        current_requests = [r for r in self.requests if r.status > RequestStatus.PENDING.value and r.status < RequestStatus.COMPLETED.value]

        for request in queue_requests:
            queue_time_estimation += self.__get_request_remaining_time(request)

        for request in current_requests:
            queue_time_estimation += self.__get_request_remaining_time(request)

        return queue_time_estimation

    def poll_summarize(self, request_id: str) -> dict:
        """
        Poll the status of the summarize request

        Args:
            request_id (str): The id of the request

        Returns:
            response (dict): The response of the request
        """
        request = self.__get_request(request_id)

        if not request:
            return { "error": "Request not found" }

        if request.status == RequestStatus.COMPLETED.value:
            self.__remove_request(request_id)

        request_time_estimation = self.__get_request_remaining_time(request)
        queue_time_estimation = self.__get_queue_estimation_time()

        if request.status == RequestStatus.PENDING.value:
            queue_requests = [r for r in self.requests if r.status == RequestStatus.PENDING.value]
            queue_position = queue_requests.index(request) + 1
            return {
                "id": request.id,
                "status": request.status,
                "result": request.result,
                "queue_position": queue_position,
                "queue_estimation": queue_time_estimation - request_time_estimation,
                "time_estimation": request_time_estimation,
                "error": None
            }

        elif request.status < RequestStatus.COMPLETED.value:
            return {
                "id": request.id,
                "status": request.status,
                "result": request.result,
                "time_estimation": request_time_estimation,
                "error": None
            }

        return {
            "id": request.id,
            "status": request.status,
            "result": request.result,
            "error": None
        }
