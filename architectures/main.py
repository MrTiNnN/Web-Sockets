import torch
import torch.nn as nn
import pandas as pd
from torch.utils.data import Dataset, DataLoader
from utils import train_vectorizer, tokenize, text_to_indices, data_split
from dataset import SpamDataset
from model import RNNModel

# Device agnostic code
device = "cuda" if torch.cuda.is_available() else "cpu"

# Define the hyperparameters
MAX_LEN = 128
TRAIN_TEST_SPLIT = 0.8
BATCH_SIZE = 64
EMBEDDING_DIM = 128
N_CLASSES = 2

# Read the data
rd = pd.read_csv('reformated_dataset.csv')

# Initiialize the vectorizer (Count vectorizer)
vectorizer = train_vectorizer(rd, 'prompt')
VOCAB_SIZE = len(vectorizer.vocabulary_)

# Load Dataset & DataLoaders
ds = SpamDataset(rd, vectorizer, MAX_LEN)
train_data, test_data = data_split(ds, TRAIN_TEST_SPLIT)
train_dataloader = DataLoader(train_data, BATCH_SIZE, True)
test_dataloder = DataLoader(test_data, BATCH_SIZE, False)

model = RNNModel(embedding_dim=EMBEDDING_DIM, vocab_size=VOCAB_SIZE, n_classes=N_CLASSES)
sample_input = torch.randint(0, VOCAB_SIZE, (1, 128))  # (batch_size=1, seq_len=128)
print(model(sample_input).shape)