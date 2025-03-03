import torch
import torch.nn as nn
import pandas as pd
from torch.utils.data import Dataset, DataLoader
from utils import train_vectorizer, tokenize, text_to_indices
from dataset import SpamDataset

MAX_LEN = 128

rd = pd.read_csv('reformated_dataset.csv')
vectorizer = train_vectorizer(rd, 'prompt')

ds = SpamDataset(rd, vectorizer, MAX_LEN)
first_item = ds[0]
print(len(first_item['vectorized_prompt']))
