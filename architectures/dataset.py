import torch.nn
from torch.utils.data import Dataset
from utils import text_to_indices

class SpamDataset(Dataset):
    def __init__(self, ds, vectorizer, max_seq_len):
        super().__init__()
        self.ds = ds
        self.vectorizer = vectorizer
        self.max_seq_len = max_seq_len

    def __len__(self):
        return len(self.ds)
    
    def __getitem__(self, idx):
        item = self.ds.iloc[idx]
        vectorized_prompt = text_to_indices(item['prompt'], self.vectorizer)[:self.max_seq_len]
        vectorized_prompt += [0] * (self.max_seq_len - len(vectorized_prompt))
        vectorized_prompt = torch.asarray(vectorized_prompt)
        return {
            'prompt': item['prompt'],
            'vectorized_prompt': vectorized_prompt,
            'label': item['label']
        }