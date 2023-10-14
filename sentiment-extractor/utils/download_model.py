from transformers import AutoModelForSequenceClassification, AutoTokenizer

# download the model
MODEL = "ProsusAI/finbert"
tokenizer = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForSequenceClassification.from_pretrained(MODEL)
# save the model
save_dir = "./models/"
tokenizer.save_pretrained(save_dir)
model.save_pretrained(save_dir)
