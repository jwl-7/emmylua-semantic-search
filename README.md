<div align="center">
    <img alt="Demo" src="https://github.com/user-attachments/assets/9ef3584d-dcfc-4a3e-939e-e8073b66cec1" />
</div>
<br/>

# 🔍 emmylua-semantic-search
AI semantic search for EmmyLua library files

🕹️ *By Default, the live demo is indexed to support the search of the [CSP Lua SDK](https://github.com/ac-custom-shaders-patch/acc-lua-sdk) for Assetto Corsa.*

## 🧠 How It Works
This project implements a local [RAG](https://en.wikipedia.org/wiki/Retrieval-augmented_generation)-esque pipeline to provide fast, accurate search results without the need for a backend server.

#### Vectorization (Offline)
The python [pre-processor](./pre-processor/) uses [sentence-transformers](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2) to convert EmmyLua meta file (.lua) -> vector embeddings (.json).

#### Semantic Retrieval (Client-Side)
The frontend [emmylua-search](./emmylua-search/) uses [Transformers.js](https://huggingface.co/docs/transformers.js/en/index) to perform local inference. When a user searches, the query is vectorized in-browser using the mini AI model [all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2). A cosine similarity calculation is performed against the local index to find the most contextually relevant matches.

## ⚖️ License
This project is released under the GNU GPL License - see the [LICENSE](LICENSE) file for details
