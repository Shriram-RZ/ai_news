from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load the Fake News Detection Model
MODEL_NAME = "jy46604790/Fake-News-Bert-Detect"
clf = pipeline("text-classification", model=MODEL_NAME, tokenizer=MODEL_NAME)

# Request Model
class NewsInput(BaseModel):
    text: str

@app.post("/predict")
def predict(news: NewsInput):
    result = clf(news.text)[0]  # Get the first result
    label = "Real" if result["label"] == "LABEL_1" else "Fake"  # Convert to readable labels
    return {"credibility": label, "score": result["score"]}

# Run the FastAPI server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)