"""RAG (Retrieval-Augmented Generation) Module.

Provides document indexing, semantic chunking, and contextual answering.
"""

from typing import List, Dict, Any


class DocumentStore:
    """Simple in-memory or persistent document retriever."""

    def __init__(self):
        self.documents: List[Dict[str, Any]] = []

    def add_document(self, doc_id: str, content: str, metadata: Dict[str, Any] = None):
        self.documents.append({
            "id": doc_id,
            "content": content,
            "metadata": metadata or {}
        })

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Basic keyword/semantic search placeholder."""
        query_words = set(query.lower().split())
        scored_docs = []
        for doc in self.documents:
            words = set(doc["content"].lower().split())
            overlap = len(query_words.intersection(words))
            scored_docs.append((overlap, doc))
        
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scored_docs[:top_k]]


class RAGAssistant:
    """Retrieval-Augmented Generation Assistant."""

    def __init__(self, doc_store: DocumentStore = None):
        self.doc_store = doc_store or DocumentStore()

    def query(self, question: str) -> Dict[str, Any]:
        retrieved = self.doc_store.search(question)
        context = "\n---\n".join([doc["content"] for doc in retrieved])
        
        return {
            "question": question,
            "context_used": context,
            "retrieved_count": len(retrieved),
            "answer": f"Respuesta basada en el contexto ({len(retrieved)} documentos encontrados)."
        }
