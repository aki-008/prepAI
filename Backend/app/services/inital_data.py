from chromadb import AsyncHttpClient
from chromadb.utils import embedding_functions

async def ingest_start(client: AsyncHttpClient, collection_name:str):

    try:
        await client.get_collection(name=collection_name)
        print(f"Collection '{collection_name}' already exists. Skipping initial ingestion.")
        return
    except Exception:
        print(f"Collection '{collection_name}' not found. Starting initial ingestion...")
        pass


