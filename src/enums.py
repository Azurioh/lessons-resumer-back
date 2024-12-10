from enum import Enum

RequestStatus = Enum('RequestStatus', [
    ('PENDING', 1),
    ('EXTRACTING', 2),
    ('FILTERING', 3),
    ('COMPLETED', 4),
    ('FAILED', 5)
])
