/**
 * Minimax Code Review Assistant
 * Main Application JavaScript
 */

// ===============================================
// State Management
// ===============================================
const state = {
    code: '',
    language: 'javascript',
    results: null,
    history: [],
    settings: {
        apiKey: '',
        model: 'MiniMax-M2.1',
        categories: {
            security: true,
            performance: true,
            codeQuality: true,
            minimaxSpecific: true
        }
    }
};

// ===============================================
// Sample Code Examples
// ===============================================
const sampleCodes = {
    javascript: `// ❌ BAD - Keine Error Handling
const callMinimaxAPI = async (messages) => {
  const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY_HERE'
    },
    body: JSON.stringify({
      model: 'MiniMax-M2.1',
      messages: messages
    })
  });
  return response.json();
}

// Usage with hardcoded API key
const messages = [{role: 'user', content: 'Hallo'}];
callMinimaxAPI(messages);

// ❌ BAD - Kein Retry Logic
async function processMessages(msgs) {
  for (const msg of msgs) {
    await callMinimaxAPI(msg);
  }
}

// ❌ BAD - Kein Rate Limiting
for (let i = 0; i < 100; i++) {
  callMinimaxAPI(createMessage(i));
}`,
    typescript: `// ❌ BAD - Fehlende Typisierung
interface Message {
  role: string;
  content: string;
}

const callAPI = async (messages: any[]) => {
  const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({ model: 'MiniMax-M2.1', messages })
  });
  return response.json();
}

// ❌ BAD - Any Type usage
const data: any = await callAPI([]);
console.log(data.result.content);`,
    python: `# ❌ BAD - Keine Error Handling
import requests

API_KEY = "YOUR_API_KEY_HERE"  # Hardcoded secret!

def call_minimax(messages):
    response = requests.post(
        "https://api.minimax.chat/v1/text/chatcompletion_v2",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        },
        json={"model": "MiniMax-M2.1", "messages": messages}
    )
    return response.json()

# ❌ BAD - Kein Retry Logic
def process_batch(messages):
    results = []
    for msg in messages:
        result = call_minimax(msg)
        results.append(result)
    return results`,
    go: `// ❌ BAD - Keine Error Handling
package main

import (
    "fmt"
    "net/http"
    "io/ioutil"
)

const API_KEY = "YOUR_API_KEY_HERE" // Hardcoded!

func callMinimax(messages []map[string]string) {
    jsonData := fmt.Sprintf(\`{"model": "MiniMax-M2.1", "messages": %v}\`, messages)
    resp, _ := http.Post(
        "https://api.minimax.chat/v1/text/chatcompletion_v2",
        "application/json",
        strings.NewReader(jsonData))
    defer resp.Body.Close()
    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}`
};

// ===============================================
// Review Rules Engine
// ===============================================
const reviewRules = {
    security: [
        {
            id: 'SEC-001',
            severity: 'critical',
            title: 'API Key hardcodiert',
            description: 'API Keys oder Secrets sind direkt im Quellcode enthalten. Dies ist ein schwerwiegendes Sicherheitsproblem.',
            pattern: /api[_-]?key\s*[:=]\s*['"'][a-zA-Z0-9_\-]{20,}['"]/gi,
            suggestion: 'Verwenden Sie Umgebungsvariablen oder ein sicheres Secret Management System.'
        },
        {
            id: 'SEC-002',
            severity: 'high',
            title: 'Fehlende Input-Validierung',
            description: 'Benutzereingaben werden nicht validiert oder sanitisiert, was zu Security-Vulnerabilities führen kann.',
            pattern: /function\s+\w+\([^)]*\)\s*\{[^}]*(?:innerHTML|dangerouslySetInnerHTML)/gi,
            suggestion: 'Validieren und escapen Sie alle Benutzereingaben vor der Verwendung.'
        },
        {
            id: 'SEC-003',
            severity: 'high',
            title: 'Unsichere URL-Verarbeitung',
            description: 'Externe URLs werden ohne Validierung verarbeitet, was zu Server-Side Request Forgery führen kann.',
            pattern: /fetch\s*\(\s*['"]https?:\/\/[^'"]*['"]/gi,
            suggestion: 'Validieren und whitelisten Sie alle externen URLs.'
        }
    ],
    performance: [
        {
            id: 'PERF-001',
            severity: 'high',
            title: 'Fehlende Retry Logic',
            description: 'API-Aufrufe ohne Exponential Backoff Retry-Logik können bei temporären Fehlern zu Datenverlust führen.',
            pattern: /async\s+function\s+\w+\([^)]*\)\s*\{[^}]*(?:await\s+\w+\.\w+\([^)]*\)[^}]*){1,}/gi,
            suggestion: 'Implementieren Sie Retry Logic mit Exponential Backoff.'
        },
        {
            id: 'PERF-002',
            severity: 'high',
            title: 'Kein Rate Limiting',
            description: 'Mehrfache API-Aufrufe in einer Schleife ohne Rate Limiting können zu Rate Limit Errors führen.',
            pattern: /for\s*\([^)]*\)\s*\{[^}]*(?:await\s+\w+\([^)]*\)|fetch\()/gi,
            suggestion: 'Implementieren Sie Rate Limiting oder Batch Processing.'
        },
        {
            id: 'PERF-003',
            severity: 'medium',
            title: 'Fehlendes Caching',
            description: 'Häufige Anfragen werden nicht gecached, was zu unnötigen API-Aufrufen und Kosten führt.',
            pattern: /async\s+function\s+\w+\([^)]*\)\s*\{[^}]*\}/gi,
            suggestion: 'Implementieren Sie Caching für häufige oder identische Anfragen.'
        }
    ],
    codeQuality: [
        {
            id: 'QUAL-001',
            severity: 'medium',
            title: 'Fehlende Typisierung',
            description: 'Funktionen oder Variablen haben keine Typdefinitionen, was zu Runtime-Fehlern führen kann.',
            pattern: /(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?function/gi,
            suggestion: 'Verwenden Sie TypeScript oder JSDoc für bessere Type Safety.'
        },
        {
            id: 'QUAL-002',
            severity: 'medium',
            title: 'Magic Numbers',
            description: 'Harckodierte Zahlen ohne Erklärung machen den Code schwer verständlich.',
            pattern: /(?<![0-9])[0-9]{2,}(?![0-9])/g,
            suggestion: 'Ersetzen Sie Magic Numbers durch benannte Konstanten.'
        },
        {
            id: 'QUAL-003',
            severity: 'low',
            title: 'Fehlende Dokumentation',
            description: 'Wichtige Funktionen haben keine Docstrings oder Comments.',
            pattern: /(?:function|const|let)\s+\w+\s*\([^)]*\)\s*\{[^}]*(?![*\/])/gi,
            suggestion: 'Fügen Sie JSDoc/Docstring Kommentare hinzu.'
        }
    ],
    minimaxSpecific: [
        {
            id: 'MINI-001',
            severity: 'high',
            title: 'Falsche API Endpoint URL',
            description: 'Der verwendete API Endpoint entspricht nicht dem aktuellen Minimax API Standard.',
            pattern: /api\.minimax\.(?:com|io|net)\/[^'"]*/gi,
            suggestion: 'Verwenden Sie den aktuellen Endpoint: https://api.minimax.chat/v1/...'
        },
        {
            id: 'MINI-002',
            severity: 'medium',
            title: 'Suboptimales Token Usage',
            description: 'Prompts könnten optimiert werden, um Token-Kosten zu reduzieren.',
            pattern: /content:\s*['"][^'"]{200,}['"]/gi,
            suggestion: 'Kürzen Sie Prompts ohne Informationsverlust.'
        },
        {
            id: 'MINI-003',
            severity: 'medium',
            title: 'Temperature nicht optimiert',
            description: 'Die Temperature-Einstellung ist nicht für den Anwendungsfall optimiert.',
            pattern: /temperature:\s*(?:0\.[0-9]+|1\.[0-9]+)/gi,
            suggestion: 'Verwenden Sie niedrigere Temperature (0.1-0.3) für konsistente Ergebnisse.'
        },
        {
            id: 'MINI-004',
            severity: 'high',
            title: 'Modell nicht spezifiziert',
            description: 'Das Modell ist nicht oder mit veralteter ID spezifiziert.',
            pattern: /(?:model\s*[:=]\s*['"]?)MiniMax-[^'"\s,}]*/gi,
            suggestion: 'Verwenden Sie das aktuelle Modell: MiniMax-M2.1'
        }
    ]
};

// ===============================================
// DOM Elements
// ===============================================
const elements = {
    codeEditor: document.getElementById('codeEditor'),
    languageSelect: document.getElementById('languageSelect'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    clearBtn: document.getElementById('clearBtn'),
    loadSampleBtn: document.getElementById('loadSampleBtn'),
    lineCount: document.getElementById('lineCount'),
    charCount: document.getElementById('charCount'),
    resultsContainer: document.getElementById('resultsContainer'),
    optimizationPanel: document.getElementById('optimizationPanel'),
    diffBody: document.getElementById('diffBody'),
    apiStatus: document.getElementById('apiStatus'),
    settingsModal: document.getElementById('settingsModal'),
    historyModal: document.getElementById('historyModal'),
    historyList: document.getElementById('historyList'),
    toastContainer: document.getElementById('toastContainer')
};

// ===============================================
// Utility Functions
// ===============================================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-message">${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateStatus(status) {
    const statusDot = elements.apiStatus.querySelector('.status-dot');
    const statusText = elements.apiStatus.querySelector('.status-text');

    statusDot.className = 'status-dot';

    switch (status) {
        case 'loading':
            statusDot.classList.add('loading');
            statusText.textContent = 'Analysiere...';
            break;
        case 'connected':
            statusDot.classList.remove('loading');
            statusText.textContent = 'Bereit';
            break;
        case 'error':
            statusDot.classList.add('disconnected');
            statusText.textContent = 'Fehler';
            break;
    }
}

function updateStats() {
    const code = elements.codeEditor.value;
    const lines = code.split('\n').length;
    const chars = code.length;

    elements.lineCount.textContent = `${lines} Zeilen`;
    elements.charCount.textContent = `${chars.toLocaleString()} Zeichen`;
}

// ===============================================
// Analysis Functions
// ===============================================
function analyzeCode(code, language) {
    const issues = [];

    // Security Analysis
    if (state.settings.categories.security) {
        reviewRules.security.forEach(rule => {
            const matches = code.match(rule.pattern);
            if (matches) {
                issues.push({
                    ...rule,
                    matches: matches.slice(0, 3), // Limit to 3 matches
                    category: 'security'
                });
            }
        });
    }

    // Performance Analysis
    if (state.settings.categories.performance) {
        reviewRules.performance.forEach(rule => {
            const matches = code.match(rule.pattern);
            if (matches) {
                issues.push({
                    ...rule,
                    matches: matches.slice(0, 3),
                    category: 'performance'
                });
            }
        });
    }

    // Code Quality Analysis
    if (state.settings.categories.codeQuality) {
        reviewRules.codeQuality.forEach(rule => {
            const matches = code.match(rule.pattern);
            if (matches) {
                issues.push({
                    ...rule,
                    matches: matches.slice(0, 3),
                    category: 'codeQuality'
                });
            }
        });
    }

    // Minimax Specific Analysis
    if (state.settings.categories.minimaxSpecific) {
        reviewRules.minimaxSpecific.forEach(rule => {
            const matches = code.match(rule.pattern);
            if (matches) {
                issues.push({
                    ...rule,
                    matches: matches.slice(0, 3),
                    category: 'minimaxSpecific'
                });
            }
        });
    }

    // Remove duplicates based on rule ID
    const uniqueIssues = issues.reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
            return acc.concat([current]);
        }
        return acc;
    }, []);

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    uniqueIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return uniqueIssues;
}

function generateOptimizedCode(code, issues) {
    let optimized = code;

    // Replace hardcoded API keys
    const apiKeyIssue = issues.find(i => i.id === 'SEC-001');
    if (apiKeyIssue) {
        optimized = optimized.replace(
            /api[_-]?key\s*[:=]\s*['"][a-zA-Z0-9_\-]{20,}['"]/gi,
            'apiKey: process.env.MINIMAX_API_KEY'
        );
    }

    // Add type annotations for TypeScript
    if (state.language === 'typescript') {
        optimized = optimized.replace(
            /messages:\s*any\[\]/gi,
            'messages: Array<{ role: string; content: string }>'
        );
    }

    // Add proper error handling
    if (!optimized.includes('try {')) {
        optimized = `// ✅ GOOD - With proper error handling
const callMinimaxWithRetry = async (messages, options = {}) => {
  const maxRetries = 3;
  const baseDelay = 250;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${process.env.MINIMAX_API_KEY}\`
        },
        body: JSON.stringify({
          model: 'MiniMax-M2.1',
          messages,
          temperature: 0.8,
          ...options
        })
      });

      if (!response.ok) {
        throw new Error(\`API Error: \${response.status}\`);
      }

      return await response.json();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * baseDelay * 0.2;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

${optimized}`;
    }

    // Add rate limiting
    if (!optimized.includes('rateLimit')) {
        optimized = `\n// ✅ GOOD - Rate limiting implemented
const rateLimit = async (fn, delay) => {
  let lastCall = 0;
  return async (...args) => {
    const now = Date.now();
    if (now - lastCall < delay) {
      await new Promise(resolve => setTimeout(resolve, delay - (now - lastCall)));
    }
    lastCall = Date.now();
    return fn(...args);
  };
};

// ✅ GOOD - Batch processing
const processBatch = async (items, batchSize = 10) => {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => rateLimit(callMinimaxWithRetry, 1000)(item))
    );
    results.push(...batchResults);
  }
  return results;
};

${optimized}`;
    }

    return optimized;
}

// ===============================================
// Render Functions
// ===============================================
function renderResults(issues) {
    if (issues.length === 0) {
        elements.resultsContainer.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <h3>Keine Probleme gefunden</h3>
                <p>Der Code sieht gut aus! Keine kritischen Issues erkannt.</p>
            </div>
        `;
        return;
    }

    // Calculate stats
    const stats = {
        critical: issues.filter(i => i.severity === 'critical').length,
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        passed: 0
    };

    elements.resultsContainer.innerHTML = `
        <div class="summary-stats">
            <div class="stat-card">
                <div class="stat-value critical">${stats.critical}</div>
                <div class="stat-label">Kritisch</div>
            </div>
            <div class="stat-card">
                <div class="stat-value high">${stats.high}</div>
                <div class="stat-label">Hoch</div>
            </div>
            <div class="stat-card">
                <div class="stat-value medium">${stats.medium}</div>
                <div class="stat-label">Mittel</div>
            </div>
            <div class="stat-card">
                <div class="stat-value passed">${stats.critical + stats.high + stats.medium === issues.length ? '0' : issues.length}</div>
                <div class="stat-label">Gesamt</div>
            </div>
        </div>
        ${issues.map(issue => renderIssueCard(issue)).join('')}
    `;

    // Add event listeners to issue cards
    document.querySelectorAll('.issue-header').forEach(header => {
        header.addEventListener('click', () => {
            const card = header.parentElement;
            const body = card.querySelector('.issue-body');
            const isExpanded = card.classList.contains('expanded');

            card.classList.toggle('expanded');

            if (!isExpanded && body) {
                body.style.display = 'block';
            } else if (body) {
                body.style.display = 'none';
            }
        });
    });

    // Filter functionality
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.dataset.filter;
            document.querySelectorAll('.issue-card').forEach(card => {
                if (filter === 'all') {
                    card.classList.remove('hidden');
                } else {
                    const isCritical = card.dataset.severity === filter;
                    card.classList.toggle('hidden', !isCritical);
                }
            });
        });
    });
}

function renderIssueCard(issue) {
    return `
        <div class="issue-card" data-severity="${issue.severity}" data-id="${issue.id}">
            <div class="issue-header">
                <div class="issue-severity ${issue.severity}">
                    ${getSeverityIcon(issue.severity)}
                </div>
                <div class="issue-content">
                    <div class="issue-title">${issue.title}</div>
                    <div class="issue-description">${issue.description}</div>
                    ${issue.matches && issue.matches.length > 0 ? `
                        <div class="issue-location">
                            ${issue.matches.map(m => `<code>${escapeHtml(m.substring(0, 50))}${m.length > 50 ? '...' : ''}</code>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="issue-body" style="display: none;">
                ${issue.matches && issue.matches.length > 0 ? `
                    <div class="issue-code">
                        <pre>${escapeHtml(issue.matches[0])}</pre>
                    </div>
                ` : ''}
                <div class="issue-suggestion">
                    <h4>Empfehlung</h4>
                    <p>${issue.suggestion}</p>
                </div>
            </div>
        </div>
    `;
}

function getSeverityIcon(severity) {
    switch (severity) {
        case 'critical':
            return '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
        case 'high':
            return '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>';
        case 'medium':
            return '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>';
        default:
            return '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderDiff(original, optimized) {
    const originalLines = original.split('\n');
    const optimizedLines = optimized.split('\n');
    const maxLines = Math.max(originalLines.length, optimizedLines.length);

    let diffHTML = '';

    for (let i = 0; i < maxLines; i++) {
        const origLine = originalLines[i] || '';
        const optLine = optimizedLines[i] || '';

        let lineClass = '';
        if (origLine && !optLine) lineClass = 'removed';
        else if (!origLine && optLine) lineClass = 'added';
        else if (origLine !== optLine) {
            // Show both lines for modifications
            diffHTML += `
                <div class="diff-line">
                    <div class="diff-line-number">${i + 1}</div>
                    <div class="diff-line-code removed">${escapeHtml(origLine)}</div>
                    <div class="diff-line-number">${i + 1}</div>
                    <div class="diff-line-code added">${escapeHtml(optLine)}</div>
                </div>
            `;
            continue;
        }

        diffHTML += `
            <div class="diff-line">
                <div class="diff-line-number">${i + 1}</div>
                <div class="diff-line-code ${lineClass}">${escapeHtml(optLine || origLine)}</div>
                <div class="diff-line-number">${i + 1}</div>
                <div class="diff-line-code ${lineClass}">${escapeHtml(optLine || origLine)}</div>
            </div>
        `;
    }

    elements.diffBody.innerHTML = diffHTML;
}

function renderHistory() {
    if (state.history.length === 0) {
        elements.historyList.innerHTML = `
            <div class="empty-history">
                <p>Keine bisherigen Analysen vorhanden.</p>
            </div>
        `;
        return;
    }

    elements.historyList.innerHTML = state.history.map((item, index) => `
        <div class="history-item" data-index="${index}">
            <div class="history-time">${new Date(item.timestamp).toLocaleString('de-DE')}</div>
            <div class="history-summary">${item.summary || 'Code-Analyse'}</div>
            <div class="history-stats">
                ${item.stats.critical > 0 ? `<span class="history-stat critical">${item.stats.critical}</span>` : ''}
                ${item.stats.high > 0 ? `<span class="history-stat high">${item.stats.high}</span>` : ''}
            </div>
        </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            const historyItem = state.history[index];
            elements.codeEditor.value = historyItem.code;
            state.language = historyItem.language;
            elements.languageSelect.value = historyItem.language;
            updateStats();
            performAnalysis();
            closeModal('historyModal');
        });
    });
}

// ===============================================
// Modal Functions
// ===============================================
function openModal(modalId) {
    document.getElementById(modalId).classList.add('open');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('open');
}

// ===============================================
// Event Handlers
// ===============================================
function performAnalysis() {
    const code = elements.codeEditor.value.trim();

    if (!code) {
        showToast('Bitte geben Sie zuerst Code ein.', 'error');
        return;
    }

    updateStatus('loading');
    elements.analyzeBtn.disabled = true;
    elements.analyzeBtn.innerHTML = '<span class="loading-spinner"></span> Analysiere...';

    // Simulate analysis time for better UX
    setTimeout(() => {
        const issues = analyzeCode(code, state.language);
        state.results = issues;

        renderResults(issues);

        // Generate optimized code
        const optimized = generateOptimizedCode(code, issues);
        renderDiff(code, optimized);

        // Save to history
        const historyItem = {
            timestamp: new Date().toISOString(),
            code: code,
            language: state.language,
            summary: code.substring(0, 50) + '...',
            stats: {
                critical: issues.filter(i => i.severity === 'critical').length,
                high: issues.filter(i => i.severity === 'high').length,
                medium: issues.filter(i => i.severity === 'medium').length
            }
        };

        state.history.unshift(historyItem);
        if (state.history.length > 20) {
            state.history.pop();
        }

        localStorage.setItem('mcra_history', JSON.stringify(state.history));

        updateStatus('connected');
        elements.analyzeBtn.disabled = false;
        elements.analyzeBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
            </svg>
            Code analysieren
        `;

        // Show optimization panel if issues found
        if (issues.length > 0) {
            elements.optimizationPanel.classList.add('open');
        }

        showToast(`Analyse abgeschlossen: ${issues.length} Issues gefunden.`, issues.length > 0 ? 'error' : 'success');
    }, 800);
}

function setupEventListeners() {
    // Editor input
    elements.codeEditor.addEventListener('input', updateStats);

    // Language change
    elements.languageSelect.addEventListener('change', (e) => {
        state.language = e.target.value;
    });

    // Analyze button
    elements.analyzeBtn.addEventListener('click', performAnalysis);

    // Clear button
    elements.clearBtn.addEventListener('click', () => {
        elements.codeEditor.value = '';
        elements.resultsContainer.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 12h6m-3-3v6m9 2V7a2 2 0 00-2-2h-4.586a1 1 0 01-.707-.293l-4.586-4.586a1 1 0 00-1.414 0L6.586 5A2 2 0 005 7v10a2 2 0 002 2h12a2 2 0 002-2z"/>
                </svg>
                <h3>Keine Analyse vorhanden</h3>
                <p>Fügen Sie Code ein und klicken Sie auf "Analysieren", um das Review zu starten.</p>
            </div>
        `;
        elements.optimizationPanel.classList.remove('open');
        updateStats();
    });

    // Load sample button
    elements.loadSampleBtn.addEventListener('click', () => {
        elements.codeEditor.value = sampleCodes[state.language] || sampleCodes.javascript;
        updateStats();
        showToast('Beispiel-Code geladen.', 'info');
    });

    // Settings modal
    document.getElementById('settingsBtn').addEventListener('click', () => {
        document.getElementById('apiKeyInput').value = state.settings.apiKey;
        document.getElementById('modelSelect').value = state.settings.model;
        document.getElementById('checkSecurity').checked = state.settings.categories.security;
        document.getElementById('checkPerformance').checked = state.settings.categories.performance;
        document.getElementById('checkCodeQuality').checked = state.settings.categories.codeQuality;
        document.getElementById('checkMinimaxSpecific').checked = state.settings.categories.minimaxSpecific;
        openModal('settingsModal');
    });

    document.getElementById('closeSettingsBtn').addEventListener('click', () => closeModal('settingsModal'));
    document.getElementById('cancelSettingsBtn').addEventListener('click', () => closeModal('settingsModal'));
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
        state.settings.apiKey = document.getElementById('apiKeyInput').value;
        state.settings.model = document.getElementById('modelSelect').value;
        state.settings.categories.security = document.getElementById('checkSecurity').checked;
        state.settings.categories.performance = document.getElementById('checkPerformance').checked;
        state.settings.categories.codeQuality = document.getElementById('checkCodeQuality').checked;
        state.settings.categories.minimaxSpecific = document.getElementById('checkMinimaxSpecific').checked;
        localStorage.setItem('mcra_settings', JSON.stringify(state.settings));
        closeModal('settingsModal');
        showToast('Einstellungen gespeichert.', 'success');
    });

    // History modal
    document.getElementById('historyBtn').addEventListener('click', () => {
        renderHistory();
        openModal('historyModal');
    });

    document.getElementById('closeHistoryBtn').addEventListener('click', () => closeModal('historyModal'));
    document.getElementById('closeHistoryModalBtn').addEventListener('click', () => closeModal('historyModal'));
    document.getElementById('clearHistoryBtn').addEventListener('click', () => {
        state.history = [];
        localStorage.removeItem('mcra_history');
        renderHistory();
        showToast('Verlauf gelöscht.', 'info');
    });

    // Optimization panel
    document.getElementById('closeOptimizationBtn').addEventListener('click', () => {
        elements.optimizationPanel.classList.remove('open');
    });

    document.getElementById('copyOptimizedBtn').addEventListener('click', () => {
        const optimized = generateOptimizedCode(elements.codeEditor.value, state.results || []);
        navigator.clipboard.writeText(optimized).then(() => {
            showToast('Optimierter Code in Zwischenablage kopiert.', 'success');
        });
    });

    document.getElementById('applyFixesBtn').addEventListener('click', () => {
        const optimized = generateOptimizedCode(elements.codeEditor.value, state.results || []);
        elements.codeEditor.value = optimized;
        updateStats();
        elements.optimizationPanel.classList.remove('open');
        showToast('Fixes angewendet. Analysieren Sie den Code erneut.', 'info');
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('open');
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            performAnalysis();
        }
    });
}

// ===============================================
// Initialization
// ===============================================
function init() {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('mcra_settings');
    if (savedSettings) {
        state.settings = JSON.parse(savedSettings);
    }

    // Load history from localStorage
    const savedHistory = localStorage.getItem('mcra_history');
    if (savedHistory) {
        state.history = JSON.parse(savedHistory);
    }

    // Setup event listeners
    setupEventListeners();

    // Initial stats update
    updateStats();

    console.log('Minimax Code Review Assistant initialized');
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
