import torch
import torch.nn as nn
from utils import text_to_indices
import joblib
from typing import Dict


def predict_sentence(sentecne: str, device: str = 'cpu', max_seq_len: int = 128) -> Dict[str, float]:
    """
    Predicts whether a given sentence is spam or ham (non-spam) using a pre-trained model and vectorizer.

    Args:
    - sentence (str): The input sentence to be predicted.
    - device (str): The device to run the model on, either 'cpu' or 'cuda'. Defaults to 'cpu'.
    - max_seq_len (int): The maximum length of the sequence for padding/truncating the sentence. Defaults to 128.

    Returns:
    - dict: A dictionary with:
        - 'sequence_type' (str): The predicted type ('spam' or 'ham').
        - 'likelyhood' (float): The likelihood of the prediction being correct.
    """

    # Load the model
    PATH = './spam-detection'
    model = torch.load(PATH, weights_only=False).to(device)
    model.eval()

    # Load the vectorizer
    vectorizer = joblib.load('vectorizer.joblib')

    # Preprocess the sentence
    sentecne = text_to_indices(sentecne, vectorizer)[:max_seq_len]
    sentecne += [0] * (max_seq_len - len(sentecne))
    sentecne = torch.asarray(sentecne).unsqueeze(dim = 0)

    # Make a prediction
    pred = torch.sigmoid(model(sentecne))
    
    if pred > 0.5:
        return {
            "sequence_type": "spam",
            "likelyhood": pred.item()
        }
    else:
        return {
            "sequence_type": "ham",
            "likelyhood": 1 - pred.item()
        }

    
    
