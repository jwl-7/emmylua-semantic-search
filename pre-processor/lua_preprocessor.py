"""LUA Pre-Processor

This module pre-processes LUA files -> JSON embeddings for RAG db.

Required filetype: .lua
Required format: emmylua metafile
"""

import os
import json
import re
import tkinter as tk
from enum import Enum
from tkinter import filedialog
from sentence_transformers import SentenceTransformer


MODEL_NAME = 'all-MiniLM-L6-v2'
OUTPUT_FILENAME = 'lua_kb.json'

class Color(Enum):
    """Color enums for f-strings."""
    RED = '\033[91m'
    GREEN = '\033[92m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GRAY = '\033[90m'
    YELLOW = '\033[93m'
    RESET = '\033[0m'

    INFO = f'{GRAY}[{BLUE}INFO{GRAY}]{RESET}'
    ERROR = f'{GRAY}[{RED}ERROR{GRAY}]{RESET}'
    SUCCESS = f'{GRAY}[{GREEN}SUCCESS{GRAY}]{RESET}'
    ENTER = f'{GRAY}[{YELLOW}ENTER{GRAY}]{RESET}'

    def __str__(self) -> str:
        return self.value


def chunk_lua_metadata(text: str) -> list[str]:
    """Captures only docstrings (---) and the signature/type definition."""
    text = re.sub(r'--\[\[.*?\]\]', '', text, flags=re.DOTALL)
    text = re.sub(r'(?m)^--\s.*$', '', text)
    pattern = r'(---@.*?\n(?:function|local|ui\.|ac\.|render\.|math\.|table\.|ray:|ref\w+).*?(?:\n|end))'
    chunks = re.findall(pattern, text, re.DOTALL)

    return [c.strip() for c in chunks if len(c.strip()) > 10]

def build_kb(file_path: str, output_file: str, model: SentenceTransformer):
    """
    Converts Lua source files into a JSON-serialized vector database
    by cleaning, chunking, and embedding EmmyLua documentation.
    """
    knowledge_base = []
    filename = os.path.basename(file_path)

    print(f'Reading {Color.CYAN}{filename}{Color.RESET}...')

    with open(file_path, 'r', encoding='utf-8') as f:
        raw_content = f.read()

    if '---@meta' not in raw_content[:100]:
        print(f'{Color.ERROR} Invalid file: Missing {Color.CYAN}---@meta {Color.RESET}tag.')
        return

    chunks = chunk_lua_metadata(raw_content)

    if not chunks:
        print(f'{Color.ERROR} No valid EmmyLua documentation found in file.')
        return

    print(f'Found {Color.CYAN}{len(chunks)} {Color.RESET}chunks. Starting embedding...')
    embeddings = model.encode(chunks, normalize_embeddings=True).tolist()

    for i, (chunk, vec) in enumerate(zip(chunks, embeddings)):
        knowledge_base.append({
            'id': f'{filename}_{i}',
            'file': filename,
            'content': chunk,
            'vector': vec
        })

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(knowledge_base, f)

    print(f'{Color.SUCCESS} Created {Color.CYAN}{output_file} {Color.RESET}from {Color.CYAN}{filename}{Color.RESET}')

if __name__ == '__main__':
    desktop_dir = os.path.join(os.path.expanduser('~'), 'Desktop')

    root = tk.Tk()
    root.withdraw()
    root.attributes('-topmost', True)

    print('Select LUA library file...')

    selected_file = filedialog.askopenfilename(
        title='Select EmmyLua LUA lib File',
        initialdir=desktop_dir,
        filetypes=[('Lua files', '*.lua'), ('All files', '*.*')]
    )
    root.destroy()

    if selected_file:
        print(f'Loading AI model {Color.CYAN}{MODEL_NAME}{Color.RESET}...')
        shared_model = SentenceTransformer(MODEL_NAME)
        build_kb(selected_file, OUTPUT_FILENAME, shared_model)
        input(f'Press {Color.ENTER} to exit...')
    else:
        print(f'{Color.ERROR} File selection cancelled. Exiting...')
