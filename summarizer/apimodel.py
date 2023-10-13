from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, BartForConditionalGeneration


model = BartForConditionalGeneration.from_pretrained(
    "./models/")
tokenizer = AutoTokenizer.from_pretrained("./models/")


def summarize(text):
    inputs = tokenizer([text], max_length=1024, return_tensors="pt")
    # Generate Summary max length of 126 tokens as it will be used as input for the sentiment extractor model (FinBERT)
    summary_ids = model.generate(
        inputs["input_ids"],
        num_beams=2,
        min_length=0,
        max_length=126
    )
    return tokenizer.batch_decode(
        summary_ids,
        skip_special_tokens=True,
        clean_up_tokenization_spaces=False
    )[0]

# print(summarize("he last seven days.\n\n\n\n\n\n\n\n\n\n\nAccording to IntoTheBlock data, Shiba Inu is currently seeing a seven-day change, recording a negative netflow of 756% in that time frame.Large Holders Netflow shows the change in the positions of whales and investors with more than 0.1% of the supply. In brief, netflow spikes indicate accumulation from large players, while drops point to reduced positions or selling.The drop in Shiba Inu large-holder netflows coincides with the lackluster trading seen in the crypto market since the start of September.\n\n\n\nAds\n\n\n\n\nAds\n\n\n\nThe crypto sector had its moments in September. However, the story so far has been one of brief rallies, a few isolated cryptocurrency pushes, and little movement at the end of the day. Whales are generally waiting on the sidelines, with a tendency to reduce or trim their positions.RelatedShiba Inu Official Reveals What to Expect From SHIB in Next Bull CycleA look at Shiba Inu's hourly chart depicts the true picture of its trading activity. Shiba Inu is trading in a fairly straight line, depicting consolidation or a price range. Thus, the decline in netflows could be due to whales playing the waiting game in anticipation of higher prices rather than disinterest.Thus, when accumulation picks up once more, it may signal the start of a new price move for Shiba Inu, hence the significance of the large holders' Netflow indicator.Shiba Inu showing on-chain bullish divergenceSHIB was down 0.66% in the last 24 hours to $0.00000734 at the time of writing. Despite the drop in SHIB prices, the total number of addresses holding Shiba Inu (SHIB) is increasing.RelatedOver Half Billion SHIB Burned in Quiet Shiba Inu Week: DetailsThe total number of addresses holding SHIB just hit the milestone of 3.59 million, according to IntoTheBlock data, and is continually growing. Although no clear short-term patterns align with the SHIB price, this long-term uptrend might be a positive indication of increasing adoption."))

app = FastAPI()


class SentenceInput(BaseModel):
    sentence: str


@app.post('/summarize')
async def extract_keywords(input_data: SentenceInput):
    try:

        summary = summarize(input_data.sentence)
        response = {
            'summary': summary
        }

        return response
    except Exception as e:
        return {'error': str(e)}
