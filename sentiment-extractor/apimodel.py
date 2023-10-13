from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from sentiment_extractor import sentiment_extractor_multiple

app = FastAPI()

class SentenceInput(BaseModel):
    sentences:  List[str]


@app.post('/sentiment')
async def extract_sentiment(input_data: SentenceInput):
    try:
        response = sentiment_extractor_multiple(
            input_data.sentences
        )
        return response
    except Exception as e:
        return {'error': str(e)}
