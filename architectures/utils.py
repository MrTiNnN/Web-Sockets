from nltk.tokenize import word_tokenize 
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
import pandas as pd


def tokenize(input: str) -> str:
    return word_tokenize(input.lower())

def train_vectorizer(dataset: pd.DataFrame, col: str) -> CountVectorizer:
    vectorizer = CountVectorizer(tokenizer=lambda text: tokenize(text))
    return vectorizer.fit(dataset[col])



def text_to_indices(text: str, vectorizer: CountVectorizer):
    tokens = tokenize(text)
    vocab = vectorizer.vocabulary_ 
    return [vocab[word] for word in tokens if word in vocab]  
