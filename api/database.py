import os
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()

client = MongoClient(os.getenv("DB_CONNECTION_STRING"))
db = client.get_database("SecureChat")