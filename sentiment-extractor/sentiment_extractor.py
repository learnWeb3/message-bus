import torch
from transformers import AutoTokenizer, BertForSequenceClassification
import pandas as pd
from scipy.special import softmax
import numpy as np


tokenizer = AutoTokenizer.from_pretrained("./models")
model = BertForSequenceClassification.from_pretrained(
    "./models",
    problem_type="multi_label_classification"
)

num_labels = len(model.config.id2label)
model = BertForSequenceClassification.from_pretrained(
    "./models",
    num_labels=num_labels,
    problem_type="multi_label_classification"
)


def sentiment_extractor(TEXT):
    labels = {
        0: "positive",
        1: "negative",
        2: "neutral"
    }
    inputs = tokenizer(TEXT, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs).logits
    _, predicted = torch.max(outputs, 1)
    predicted = predicted.item()
    logits = softmax(np.array(outputs.cpu()))
    sentiment_score = pd.Series(logits[:, 0] - logits[:, 1]).item()
    return {
        "label": labels[predicted],
        "score": sentiment_score,
    }


def sentiment_extractor_multiple(sentences=[]):
    labels = {
        0: "positive",
        1: "negative",
        2: "neutral"
    }
    details = []
    scores = []
    for sentence in sentences:
        sentence_extracted_sentiment = sentiment_extractor(sentence)
        details.append(sentence_extracted_sentiment)
        scores.append(sentence_extracted_sentiment["score"])
    global_score = sum(scores) / len(scores)
    global_sentiment = labels[0] if global_score >= 0.5 else labels[2] if global_score < 0.5 and global_score > 0 else labels[1]
    return {
        "global_label": global_sentiment,
        "global_score": global_score,
        "details": details
    }


# predictions = sentiment_extractor(
#     "Stocks rallied and the British pound lost."
# )
# print(predictions)

# predictions = sentiment_extractor_multiple(
#     ["Stocks rallied and the British pound lost.", "markets plumetted when president Biden annouced employment rate"]
# )
# print(predictions)
