from nltk.tokenize import word_tokenize 
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
import torch
from torch.utils.data import random_split
from torch.utils.data import Dataset
import pandas as pd


def tokenize(input: str) -> list:
    """
    Tokenizes the input string into lowercase words.

    Args:
    - input (str): The text input that needs to be tokenized.

    Returns:
    - list: A list of lowercase tokens (words).
    """
    return word_tokenize(input.lower())

def train_vectorizer(dataset: pd.DataFrame, col: str) -> CountVectorizer:
    """
    Trains a CountVectorizer on a specific column of the dataset.

    Args:
    - dataset (pd.DataFrame): The pandas DataFrame containing the text data.
    - col (str): The name of the column in the DataFrame to use for vectorization.

    Returns:
    - CountVectorizer: The trained CountVectorizer instance.
    """
    vectorizer = CountVectorizer(tokenizer=tokenize)
    return vectorizer.fit(dataset[col])

def text_to_indices(text: str, vectorizer: CountVectorizer) -> list:
    """
    Converts a text string into a list of indices based on the trained vectorizer's vocabulary.

    Args:
    - text (str): The input text to be converted into indices.
    - vectorizer (CountVectorizer): The trained CountVectorizer instance used for vocabulary.

    Returns:
    - list: A list of indices corresponding to the words in the input text, based on the vectorizer's vocabulary.
    """
    tokens = tokenize(text)
    vocab = vectorizer.vocabulary_ 
    return [vocab[word] for word in tokens if word in vocab]  


def data_split(dataset: Dataset, split_ratio: float) -> tuple:
    """
    Splits a dataset into training and testing subsets based on the provided split ratio.

    Args:
    - dataset (Dataset): The dataset to be split.
    - split_ratio (float): The ratio of the dataset to be used for training (e.g., 0.8 for an 80%/20% split).

    Returns:
    - tuple: A tuple containing two elements:
        - train_data (Dataset): The training subset of the dataset.
        - test_data (Dataset): The testing subset of the dataset.
    """
    split_index = int(split_ratio * len(dataset))
    split_index = max(1, min(split_index, len(dataset) - 1))
    train_data, test_data = random_split(dataset, [split_index, len(dataset) - split_index])
    return train_data, test_data

def accuracy_fn(y_true, y_pred):
    """
    Calculates accuracy between truth labels and predictions.

    Args:
        y_true (torch.Tensor): Truth labels for predictions.
        y_pred (torch.Tensor): Predictions to be compared to predictions.

    Returns:
        [torch.float]: Accuracy value between y_true and y_pred, e.g. 78.45
    """
    correct = torch.eq(y_true, y_pred).sum().item()
    acc = (correct / len(y_pred)) * 100
    return acc