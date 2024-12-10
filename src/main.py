from src.models.summarize_manager import SummarizeManager
from src.models.server import Server

def main() -> None:
    """
    The main function of the application.
    """
    upload_folder_path = 'tmp'
    estimation_file_path = 'estimation_time.json'

    manager = SummarizeManager(upload_folder_path, estimation_file_path)
    server = Server(manager)

    server.start()


if __name__ == '__main__':
    main()
