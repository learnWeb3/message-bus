import spacy
import pytextrank
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
nlp = spacy.load("en_core_web_sm")
nlp.add_pipe("topicrank")


def extract_topics(text):
    topics = []
    doc = nlp(text)
    for phrase in doc._.phrases[:10]:
        topics.append(phrase.text)
    return topics


class SentenceInput(BaseModel):
    sentence: str


@app.post('/keywords')
async def extract_keywords(input_data: SentenceInput):
    try:
        keywords = extract_topics(input_data.sentence)
        response = {
            'keywords': keywords
        }

        return response
    except Exception as e:
        return {'error': str(e)}
