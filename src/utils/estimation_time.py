import json

def add_estimation_time(estimation_file_path: str, nb_pages: int, during_time: float) -> None:
    """
    Add the estimation time of the request

    Args:
        estimation_file_path (str): The path of the estimation file
        nb_pages (int): The number of pages of the request
        during_time (float): The time of the request
    """
    with open(estimation_file_path, "r") as file:
        estimation = json.load(file)

    if str(nb_pages) not in estimation:
        estimation[str(nb_pages)] = []

    estimation[str(nb_pages)].append(during_time)

    with open(estimation_file_path, "w") as file:
        json.dump(estimation, file, indent=2)

def get_estimation_time(estimation_file_path: str, nb_pages: int) -> float:
    """
    Get the estimation time of the request

    Args:
        estimation_file_path (str): The path of the estimation file
        nb_pages (int): The number of pages of the request

    Returns:
        time (float): The estimation time of the request
    """
    with open(estimation_file_path, "r") as file:
        estimation = json.load(file)

    if str(nb_pages) not in estimation:
        return -1

    return sum(estimation[str(nb_pages)]) // len(estimation[str(nb_pages)])
