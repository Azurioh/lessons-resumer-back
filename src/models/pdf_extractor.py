import os

from threading import Thread
from dotenv import load_dotenv
from PyPDF2 import PdfReader, PdfWriter
from multiprocessing import Process, Queue
from docling.document_converter import DocumentConverter

load_dotenv()

NB_THREADS = int(os.getenv("NB_THREADS") or '3')

class PdfExtractor:
    def __init__(self, upload_folder_path: str):
        self.upload_folder_path = upload_folder_path

    def __split_pdf(self, pdf_path: str, output_folder_path: str) -> int:
        """
        Splits a PDF file into multiple files.

        Args:
            pdf_path (str): The path of the PDF file.
            output_folder_path (str): The path of the output folder.

        Returns:
            int: The number of pages in the PDF file.
        """
        reader = PdfReader(pdf_path)

        try:
            for i, page in enumerate(reader.pages):
                writer = PdfWriter()
                writer.add_page(page)
                output_file = os.path.join(output_folder_path, f"page_{i + 1}.pdf")
                with open(output_file, "wb") as file:
                    writer.write(file)
            return len(reader.pages)
        except Exception as e:
            print(f"Error while splitting PDF file: {str(e)}")
            return -1

    def _extraction_worker(self, source_file_path: str, output_file_path: str, extraction_queue: Queue) -> None:
        """
        Extract the content of a PDF file and writes it to a markdown file.

        Args:
            source_file_path (str): The path of the PDF file.
            output_file_path (str): The path of the markdown file.
            output_queue (Queue): The queue to send the result.
        """
        try:
            converter = DocumentConverter()
            result = converter.convert(source_file_path)

            with open(output_file_path, "w", encoding="utf-8") as file:
                file.write(result.document.export_to_markdown())
            extraction_queue.put("Success")
        except Exception as e:
            extraction_queue.put(f"Error while extracting PDF content: {str(e)}")

    def __start_extraction_worker(self, source_folder_path: str, page: str, error_queue: Queue) -> None:
        """
        Starts the extraction worker.

        Args:
            source_folder_path (str): The path of the source folder.
            page (str): The name of the PDF file to extract.
            error_queue (Queue): The queue to send the error.
        """
        extraction_queue = Queue()

        source_file_path = os.path.join(source_folder_path, page)
        output_file_path = os.path.join(source_folder_path, f"{page.replace('.pdf', '.md')}")

        process: Process = Process(
            target=self._extraction_worker,
            args=(source_file_path, output_file_path, extraction_queue)
        )

        process.start()
        process.join()

        if not extraction_queue.empty():
            result = extraction_queue.get()
            if result.startswith("Error while extracting PDF content"):
                error_queue.put(result)
        else:
            error_queue.put("No result received from extraction process")

    def convert_pdf_content_to_markdown(self, request_id: str) -> bool:
        """
        Converts the content of a PDF file to markdown.

        Args:
            request_id (str): The request ID.

        Returns:
            bool: True if the conversion was successful, False otherwise.
        """
        source_folder_path: str = f"{self.upload_folder_path}/{request_id}"
        error_queue: Queue = Queue()

        # Split the PDF file into multiple files (1 file per page)
        nb_pages = self.__split_pdf(os.path.join(source_folder_path, "file.pdf"), source_folder_path)
        if nb_pages == -1:
            return False

        # Get the files in the source folder
        sources_files = os.listdir(source_folder_path)

        # Get the PDF files created by the split
        pages = [
            file for file in sources_files
            if file.endswith(".pdf") and file.startswith("page_")
        ]

        # Create a process for each pages
        threads = [
            Thread(target=self.__start_extraction_worker, args=(source_folder_path, page, error_queue))
            for page in pages
        ]

        # Start the threads by batch of NB_THREADS
        for i in range(0, len(threads), NB_THREADS):
            for thread in threads[i:i+NB_THREADS]:
                thread.start()
            for thread in threads[i:i+NB_THREADS]:
                thread.join()

        # Check if there was an error during the extraction
        if not error_queue.empty():
            error = error_queue.get()
            print(f"Error while extracting PDF content: {error}")
            return False

        return True
