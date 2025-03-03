import torch
import torch.nn as nn
import math

class InputEmbeddings(nn.Module):
    def __init__(self, d_model: int, vocab_size: int) -> None:
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.d_model = d_model

    def forward(self, x):
        return self.embedding(x) * math.sqrt(self.d_model)  

class RNNModel(nn.Module):
    def __init__(self, embedding_dim: int, vocab_size: int, n_classes: int):
        super().__init__()
        self.embedding_layer = InputEmbeddings(embedding_dim, vocab_size)
        self.rnn = nn.LSTM(embedding_dim, 64, num_layers=2, bidirectional=True, batch_first=True)
        self.fc = nn.Linear(64 * 2, n_classes) 

    def forward(self, x):
        x = self.embedding_layer(x) 
        
        output, (hn, cn) = self.rnn(x)  
        
        hidden_state = torch.cat((hn[-2], hn[-1]), dim=1) 
        
        print(hn.shape)
        logits = self.fc(hidden_state)
        return logits
