"""
A class to manage user account information, including email, password,
first name, and last name, with validation for email format
and password length.
"""

class UserData:
    """
    A class to represent a user account.

    Attributes:
        email (str): The email address of the user.
        password (str): The password of the user.
        first_name (str): The first name of the user.
        last_name (str): The last name of the user.
    """

    def __init__(self, email: str, password: str, first_name: str, last_name: str):
        self.email = email
        self.password = password
        self.first_name = first_name
        self.last_name = last_name

        @property
        def email(self):
            return self._email
        
        @email.setter
        def email(self, value):
            if not isinstance(value, str):
                raise ValueError("Email must be a string.")
            if "@" not in value or "." not in value.split("@")[-1]:
                raise ValueError("Invalid email format.")
            self._email = value

        @property
        def password(self):
            return self._password
        @password.setter
        def password(self, value):
            if not isinstance(value, str):
                raise ValueError("Password must be a string.")
            if len(value) < 8:
                raise ValueError("Password must be at least 8 characters long.")
            self._password = value

        @property
        def first_name(self):
            return self._first_name
        @first_name.setter
        def first_name(self, value):
            if not isinstance(value, str):
                raise ValueError("First name must be a string.")
            self._first_name = value

        @property
        def last_name(self):
            return self._last_name
        @last_name.setter
        def last_name(self, value):
            if not isinstance(value, str):
                raise ValueError("Last name must be a string.")
            self._last_name = value