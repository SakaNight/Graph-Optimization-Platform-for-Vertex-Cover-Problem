from databases import Database
import sqlalchemy
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

database = Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

vertex_cover_cache = sqlalchemy.Table(
    "vertex_cover_cache",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("vertex_count", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("edges", sqlalchemy.Text, nullable=False),
    sqlalchemy.Column("algorithm", sqlalchemy.Text, nullable=False),
    sqlalchemy.Column("result", sqlalchemy.Text, nullable=False),
    sqlalchemy.Column("time_ms", sqlalchemy.Float, nullable=False),
    sqlalchemy.UniqueConstraint("vertex_count", "edges", "algorithm"),
)

engine = sqlalchemy.create_engine(DATABASE_URL)
metadata.create_all(engine)