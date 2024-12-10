import os

from time import sleep
from threading import Thread
from dotenv import load_dotenv
from mistralai import Mistral
from typing import List

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_ASSISTANT_ID = os.getenv("MISTRAL_ASSISTANT_ID")

class LlmSummarize:
    """
    A class to represent the LLM Summarize model.

    Attributes:
        client (Mistral): The Mistral client.
        agent_id (str): The Mistral agent ID.
    """
    def __init__(self):
        self.client = Mistral(api_key=MISTRAL_API_KEY)
        self.agent_id = MISTRAL_ASSISTANT_ID

    def __get_file_content(self, file_path: str) -> str:
        """
        Reads the content of a file.

        Args:
            file_path (str): The path of the file.

        Returns:
            str: The content of the file.
        """
        with open(file_path, "r", encoding="utf-8") as file:
            return file.read()

    def __summarize_page_worker(self, page_content: str, index: int, results: list, prompt: str, custom_prompt: str = "") -> None:
        """
        Summarizes a page content.

        Args:
            page_content (str): The content of the page.
            index (int): The index of the page.
            results (list): The list of results.
            prompt (str): The prompt.
            custom_prompt (str): The custom prompt.
        """
        if (not self.client or not self.agent_id):
            return
        try:
            response = self.client.agents.complete(
                messages=[
                    {
                        "role": "user",
                        "content": page_content
                    },
                    {
                        "role": "system",
                        "content": prompt
                    },
                ],
                agent_id=self.agent_id
            )

            if response is None:
                results[index] = "Error while summarizing page: No response from Mistral"
                return

            res = str(response.choices[0].message.content)

            if (res.startswith('Résumé: ')):
                res = res[8:]

            results[index] = res
        except Exception as e:
            print(e)
            results[index] = f"Error while summarizing page: {str(e)}"

    def summarize_page(self, upload_dir: str, request_id: str, custom_prompt: str = "") -> List[str]:
        """
        Starts the summarize page worker.

        Args:
            upload_dir (str): The upload directory.
            request_id (str): The request ID.
            custom_prompt (str): The custom prompt.

        Returns:
            results (list): The list of results.
        """
        prompt = self.__get_file_content("./src/utils/prompt.txt")

        # Get all markdown files in the directory
        files = os.listdir(f"{upload_dir}/{request_id}")
        markdown_files = sorted([file for file in files if file.endswith(".md")])

        tmp_results = [None] * len(markdown_files)
        results = []
        threads = []

        # Start a thread for each markdown file
        for i, file in enumerate(markdown_files):
            file_content = self.__get_file_content(f"{upload_dir}/{request_id}/{file}")
            threads.append(Thread(target=self.__summarize_page_worker, args=(file_content, i, tmp_results, prompt, custom_prompt)))

        # Start thread with a delay to avoid Mistral rate limit
        for thread in threads:
            thread.start()
            sleep(3)

        for thread in threads:
            thread.join()

        # Check if there is any error
        for i, result in enumerate(tmp_results):
            if (result and result.startswith("Error during filtering")):
                results.append(f"Error while summarizing page {i + 1}: {result}")
            else:
                results.append(result)

        return results
