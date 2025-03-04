import torch
import torch.nn as nn
from tqdm import tqdm
from utils import accuracy_fn
from test_ import test_step

def train_step(model: nn.Module, loss_fn, optimizer, epochs: int, train_dataloader, test_dataloader, device):

    for epoch in tqdm(range(epochs)):
        model.train()
        train_loss = 0
        train_acc = 0
        for batch, data in enumerate(train_dataloader):
            X = data['vectorized_prompt'].to(device)
            y = data['label'].to(device).float()  

            # Forward pass
            logits = model(X).squeeze(dim=1)
            loss = loss_fn(logits, y) 
            
            train_loss += loss.item()
            train_acc += accuracy_fn(y, torch.round(torch.sigmoid(logits)))  
            
            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        # Averaging the loss and accuracy
        train_loss /= len(train_dataloader)
        train_acc /= len(train_dataloader)

        print(f"\nEpoch {epoch+1}/{epochs} - Train loss: {train_loss:.5f} | Train acc: {train_acc:.2f}%")
        test_step(model, loss_fn, test_dataloader, device)