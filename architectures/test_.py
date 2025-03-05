import torch
import torch.nn as nn
from utils import accuracy_fn

def test_step(model: nn.Module, loss_fn: nn.Module, test_dataloader, device) -> None:
    
    # Model into evaulation mode
    model.eval()
    test_loss = 0
    test_acc = 0

    with torch.inference_mode():
        for batch, data in enumerate(test_dataloader):
            X = data['vectorized_prompt'].to(device)
            y = data['label'].to(device).float()  

            logits = model(X).squeeze(dim=1)
            loss = loss_fn(logits, y)

            test_loss += loss.item()  
            test_acc += accuracy_fn(y_true=y, y_pred=torch.round(torch.sigmoid(logits)))

    test_loss /= len(test_dataloader)
    test_acc /= len(test_dataloader)

    print(f"Test loss: {test_loss:.5f} | Test acc: {test_acc:.2f}%")

