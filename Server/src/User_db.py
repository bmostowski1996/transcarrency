""" This class stores and retrieves user account information"""

import json # JSON module for file handling

from pathlib import Path # Path module for file path handling

file_path = "account_info.json"

class UserDatabase:
    """
    A class to manage user account information, including email, password,
    first name, and last name, with validation for email format
    and password length.
    """

    def __init__(self, account_creation,
                 filename = file_path):
        self.account_creation = account_creation
        self.filename = Path(filename) # Use Path to handle file paths

    def save_user_data(self):
        """
        Save user data to a JSON file.
        """
        user_data = {
            "email": self.account_creation.email,
            "password": self.account_creation.password,
            "first_name": self.account_creation.first_name,
            "last_name": self.account_creation.last_name
        }
        # Create new file with "accounts" key
        # if file doesn't exist or is empty
        with open(self.filename, 'w') as file:
            json.dump(user_data, file)
        print(f"User data saved to {self.filename}")

        # Check if file already exists
        # and print a message if it does
        if self.filename.exists() > 0:
            print(f"File {self.filename} already exists.")


        