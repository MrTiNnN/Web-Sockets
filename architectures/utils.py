from nltk.tokenize import word_tokenize 
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from torch.utils.data import random_split
from torch.utils.data import Dataset
import pandas as pd


def tokenize(input: str) -> str:
    return word_tokenize(input.lower())

def train_vectorizer(dataset: pd.DataFrame, col: str) -> CountVectorizer:
    vectorizer = CountVectorizer(tokenizer=lambda text: tokenize(text))
    return vectorizer.fit(dataset[col])

def text_to_indices(text: str, vectorizer: CountVectorizer) -> list:
    tokens = tokenize(text)
    vocab = vectorizer.vocabulary_ 
    return [vocab[word] for word in tokens if word in vocab]  


def data_split(dataset: Dataset, split_ratio: float):
    split_index = int(split_ratio * len(dataset))
    
    split_index = max(1, min(split_index, len(dataset) - 1))

    train_data, test_data = random_split(dataset, [split_index, len(dataset) - split_index])
    
    return train_data, test_data