from dataclasses import dataclass

from src.enums.request_status import RequestStatus

@dataclass
class Request:
    """
    A class to represent a request.

    Attributes:
        id (str): The ID of the request.
        pdf_path (str): The path to the PDF file.
        status (int): The status of the request.
        result (str): The result of the request.
        nb_pages (int): The number of pages of the PDF file.
        time_start (float): The time when the request started.
        custom_prompt (str): The custom prompt for the request.
    """
    id: str
    pdf_path: str
    status: int = RequestStatus.PENDING.value
    result: str | list[str] = ""
    nb_pages: int = 0
    time_start: float = 0
    custom_prompt: str = ""
