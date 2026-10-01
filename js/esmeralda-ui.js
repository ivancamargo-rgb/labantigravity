/**
 * ESMERALDA Studio - UI Controller & Architecture Node Spec Inspector
 */

const NODE_SPECS = {
    "ingress": {
        title: "Client & Ingress Layer (Cloud IAP)",
        stage: "Stage 2 & 5",
        desc: "Punto de entrada seguro a la plataforma mediante Identity-Aware Proxy (IAP) y balanceador de carga global de Google Cloud, garantizando autenticación corporativa sin IPs públicas expuestas.",
        spec: `resource "google_compute_backend_service" "ingress" {
  name                  = "esmeralda-ingress-backend"
  protocol              = "HTTPS"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  iap {
    oauth2_client_id     = var.iap_client_id
    oauth2_client_secret = var.iap_client_secret
  }
}`
    },
    "gateway": {
        title: "Central Agent Gateway & SPIFFE mTLS",
        stage: "Stage 5 Governance",
        desc: "Proxy de egreso centralizado (AGENT_TO_ANYWHERE) que valida identidades criptográficas SPIFFE Workload mTLS y actúa como punto único de observabilidad y control de políticas.",
        spec: `spiffe://esmeralda.gcp/ns/workloads/sa/agent-gateway
Policy: mTLS_STRICT_EVALUATION
Routing: Shared VPC / Internal HTTPS
EgressControl: Authorized Vertex AI & MCP microservices only`
    },
    "model-armor": {
        title: "Model Armor - LLM Guardrails & PII Sanitizer",
        stage: "Stage 5 Security & Governance",
        desc: "Escudo de seguridad que intercepta las cargas útiles antes y después de interactuar con el modelo. Detecta inyecciones de prompts adversarias y enmascara datos sensibles (PII / RFC / SSN).",
        spec: `service: model-armor.googleapis.com
guardrails:
  prompt_injection_filter: ENABLED (Threshold: STRICT)
  pii_masking:
    tax_identifiers: MASK_HASH
    credit_cards: REDACT
    names: TOKENIZE_WITH_SALT
action_on_violation: QUARANTINE_AND_ALERT_SECOPS`
    },
    "root-agent": {
        title: "Root Coordinator Agent (Vertex AI Reasoning Engine)",
        stage: "Stage 4 Workload",
        desc: "Agente principal de razonamiento implementado con Google ADK (Agent Development Kit). Recibe la petición del usuario, planifica la estrategia y delega la ejecución a agentes especialistas mediante A2A.",
        spec: `from vertexai.preview import reasoning_engines

class RootCoordinator(reasoning_engines.ReasoningEngine):
    model = "gemini-3.7-flash"
    specialists = ["mortgage-specialist", "claims-specialist"]
    
    def plan_and_delegate(self, user_goal: str):
        subtask = self.decompose(user_goal)
        return self.a2a_client.send("mortgage-specialist", subtask)`
    },
    "a2a-protocol": {
        title: "A2A Protocol & Private Service Connect (PSC)",
        stage: "Stage 2 & 4 Inter-Agent Bus",
        desc: "Protocolo Agente-a-Agente que estandariza la comunicación asíncrona y síncrona entre agentes. Los paquetes viajan a través de túneles privados PSC sin salir a la red pública de internet.",
        spec: `POST /a2a/v1.2/dispatch HTTP/2
Host: mortgage-agent.psc.internal
Content-Type: application/a2a+json
Authorization: SPIFFE-Bearer <token>

{
  "correlation_id": "a2a_req_7489f30",
  "delegated_by": "root-agent",
  "target_agent": "mortgage-specialist",
  "task": "evaluate_credit_risk"
}`
    },
    "specialist-agent": {
        title: "Mortgage Specialist Agent",
        stage: "Stage 4 Workload",
        desc: "Agente autónomo experto en evaluación de crédito y riesgo. Invoca dinámicamente herramientas de sistemas legados, consulta nóminas y sintetiza el informe final.",
        spec: `class MortgageSpecialistAgent:
    tools = [
        "mcp://legacy-dms/get_credit_policies",
        "mcp://income-verification/verify_payroll",
        "mcp://corporate-email/send_preapproval"
    ]
    orchestration = "ReAct (Reason + Act)"`
    },
    "mcp-dms": {
        title: "MCP Server: Legacy DMS (Cloud Run)",
        stage: "Stage 4 Tools Catalog",
        desc: "Microservicio sin servidor en Cloud Run que expone el gestor documental legacy de la empresa bajo el estándar abierto Model Context Protocol (MCP).",
        spec: `{
  "name": "get_credit_policies",
  "description": "Retrieves mortgage underwriting limits and maximum LTV",
  "inputSchema": {
    "type": "object",
    "properties": { "category": { "type": "string" } }
  }
}`
    },
    "mcp-income": {
        title: "MCP Server: Income Verification (Cloud Run)",
        stage: "Stage 4 Tools Catalog",
        desc: "Microservicio MCP conectado con pasarelas de nómina y base de datos tributaria para verificar la solvencia de solicitantes en tiempo real.",
        spec: `{
  "name": "verify_payroll",
  "description": "Cross-references applicant declared salary with tax records",
  "inputSchema": {
    "type": "object",
    "properties": { "taxIdMasked": { "type": "string" } }
  }
}`
    },
    "mcp-email": {
        title: "MCP Server: Corporate Email Service",
        stage: "Stage 4 Tools Catalog",
        desc: "Servidor MCP encargado del despacho formal y trazabilidad de cartas de resolución y contratos mediante el servidor de correo institucional.",
        spec: `{
  "name": "send_preapproval_letter",
  "description": "Dispatches official encrypted preapproval email",
  "status": "CIRCUIT_BREAKER_PROTECTED"
}`
    },
    "gemini-model": {
        title: "Gemini 3.7 Flash (Vertex AI API)",
        stage: "AI Foundation Models",
        desc: "Modelo multimodal de razonamiento rápido y eficiente de Google Cloud. Analiza los resultados recopilados por las herramientas y formula el dictamen financiero.",
        spec: `endpoint: us-central1-aiplatform.googleapis.com
model: gemini-3.7-flash-001
temperature: 0.1
context_window: 1,000,000 tokens
output_format: structured_json`
    },
    "finops": {
        title: "FinOps Telemetry & BigQuery Audit Sink",
        stage: "Stage 5 Governance",
        desc: "Flujo continuo de auditoría y telemetría de costos. Registra el gasto exacto por token, la latencia y la traza completa de cada agente para gobernanza y chargeback.",
        spec: `CREATE OR REPLACE VIEW esmeralda_finops.v_agent_spend AS
SELECT
  timestamp,
  workflow_id,
  agent_name,
  model_id,
  prompt_tokens,
  completion_tokens,
  (prompt_tokens * 0.00000015 + completion_tokens * 0.0000006) AS total_cost_usd
FROM \`esmeralda-prod.audit_dataset.cloudaudit_googleapis_com_data_access\``
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const engine = window.esmeraldaEngine;
    const logContainer = document.getElementById("log-stream");
    const bqBody = document.getElementById("bq-table-body");
    const modal = document.getElementById("spec-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalDesc = document.getElementById("modal-desc");
    const modalCode = document.getElementById("modal-code");

    // Modal Close button
    document.getElementById("btn-close-modal").addEventListener("click", () => {
        modal.classList.remove("active");
    });

    // Node click to view architecture spec
    document.querySelectorAll(".arch-node").forEach(node => {
        node.addEventListener("click", () => {
            const nodeId = node.dataset.nodeId;
            const specData = NODE_SPECS[nodeId];
            if (specData) {
                modalTitle.textContent = `${specData.title} (${specData.stage})`;
                modalDesc.textContent = specData.desc;
                modalCode.textContent = specData.spec;
                modal.classList.add("active");
            }
        });
    });

    // Tabs navigation
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

            btn.classList.add("active");
            const targetId = btn.dataset.tab;
            const targetContent = document.getElementById(targetId);
            if (targetContent) targetContent.classList.add("active");
        });
    });

    // Scenario Trigger Buttons
    const btnMortgage = document.getElementById("btn-scenario-mortgage");
    const btnAdversarial = document.getElementById("btn-scenario-adversarial");
    const btnCircuit = document.getElementById("btn-scenario-circuit");

    const clearActiveScenarioButtons = () => {
        document.querySelectorAll(".scenario-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".arch-node").forEach(n => {
            n.classList.remove("active", "blocked", "failed");
        });
    };

    btnMortgage.addEventListener("click", () => {
        clearActiveScenarioButtons();
        btnMortgage.classList.add("active");
        engine.runMortgageScenario();
    });

    btnAdversarial.addEventListener("click", () => {
        clearActiveScenarioButtons();
        btnAdversarial.classList.add("active");
        engine.runAdversarialScenario();
    });

    btnCircuit.addEventListener("click", () => {
        clearActiveScenarioButtons();
        btnCircuit.classList.add("active");
        engine.runCircuitBreakerScenario();
    });

    // Engine Event Listeners
    engine.onEvent((event, data) => {
        if (event === "log") {
            const entry = document.createElement("div");
            entry.className = `log-entry ${data.level || "info"}`;
            entry.innerHTML = `
                <div class="log-meta">
                    <span>[${data.stage}] <strong>${data.node.toUpperCase()}</strong></span>
                    <span>${data.timestamp}</span>
                </div>
                <div class="log-msg">${data.message}</div>
                ${data.details ? `<pre class="log-payload">${JSON.stringify(data.details, null, 2)}</pre>` : ""}
            `;
            logContainer.prepend(entry);

            // Add to BigQuery table
            if (bqBody) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${data.timestamp}</td>
                    <td>${data.stage}</td>
                    <td>${data.node}</td>
                    <td>${data.message.substring(0, 45)}...</td>
                    <td style="color: ${data.level === "error" ? "#ff453a" : "#00e599"}">${data.level === "error" ? "BLOCKED" : "OK"}</td>
                `;
                bqBody.prepend(tr);
            }
        }

        if (event === "step_change") {
            const nodeElem = document.querySelector(`[data-node-id="${data.node}"]`);
            if (nodeElem) {
                nodeElem.classList.remove("active", "blocked", "failed");
                nodeElem.classList.add(data.status);
            }
        }

        if (event === "finops_update") {
            const tokenElem = document.getElementById("stat-tokens");
            const costElem = document.getElementById("stat-cost");
            if (tokenElem) tokenElem.textContent = data.tokens.toLocaleString();
            if (costElem) costElem.textContent = `$${data.cost} USD`;
        }

        if (event === "pipeline_complete") {
            // Show outcome banner in log
            const summaryEntry = document.createElement("div");
            summaryEntry.className = `log-entry ${data.status === "BLOCKED" ? "error" : "info"}`;
            summaryEntry.style.borderLeft = `5px solid ${data.status === "BLOCKED" ? "#ff453a" : "#00e599"}`;
            summaryEntry.innerHTML = `
                <div style="font-weight: 800; font-size: 14px; margin-bottom: 4px; color: ${data.status === "BLOCKED" ? "#ff453a" : "#00e599"}">
                    🏁 RESULTADO DEL WORKFLOW: ${data.decision}
                </div>
                <div>${data.summary}</div>
            `;
            logContainer.prepend(summaryEntry);
        }
    });

    // Run mortgage scenario automatically on load for demonstration
    setTimeout(() => {
        btnMortgage.click();
    }, 600);
});
