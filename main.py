"""Main Entrypoint for AI Projects Suite."""

import argparse
import sys
from src.config import settings
from src.modules.rag import RAGAssistant, DocumentStore
from src.modules.agent import AutonomousAgent
from src.modules.vision import VisionAnalyzer


def run_rag_demo():
    print("\n--- [Demo] RAG Assistant ---")
    store = DocumentStore()
    store.add_document("doc1", "Google Antigravity es una plataforma de desarrollo AI-first.")
    store.add_document("doc2", "Gemini 2.5 Flash ofrece alto rendimiento y soporte multimodal.")
    
    rag = RAGAssistant(doc_store=store)
    query = "Qué es Google Antigravity?"
    res = rag.query(query)
    print(f"Pregunta: {res['question']}")
    print(f"Contexto recuperado:\n{res['context_used']}")
    print(f"Respuesta: {res['answer']}\n")


def run_agent_demo():
    print("\n--- [Demo] Autonomous Agent ---")
    agent = AutonomousAgent(name="AntigravityWorker")
    task = "Investigar dataset y generar reporte de métricas"
    res = agent.run_task(task)
    print(f"Agente: {res['agent']}")
    print(f"Objetivo: {res['objective']}")
    print("Plan de ejecución:")
    for step in res["plan"]:
        print(f"  - {step}")
    print(f"Resultado: {res['summary']}\n")


def run_vision_demo():
    print("\n--- [Demo] Multimodal Vision ---")
    vision = VisionAnalyzer(model_name=settings.gemini_model)
    res = vision.analyze_image("sample.png", "Identifica elementos clave")
    print(f"Modelo: {res['model']}")
    print(f"Estado: {res['message']}\n")


def main():
    parser = argparse.ArgumentParser(description="AI Projects Suite CLI")
    parser.add_argument(
        "--module",
        choices=["rag", "agent", "vision", "all"],
        default="all",
        help="Módulo de IA a ejecutar (default: all)"
    )
    args = parser.parse_args()

    print("=========================================")
    print("🚀 AI Projects Suite & Hub - Antigravity")
    print("=========================================")

    if args.module in ("rag", "all"):
        run_rag_demo()
    if args.module in ("agent", "all"):
        run_agent_demo()
    if args.module in ("vision", "all"):
        run_vision_demo()


if __name__ == "__main__":
    main()
