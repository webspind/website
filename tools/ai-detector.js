// AI Text Detector JavaScript
// Advanced AI detection algorithm with multiple analysis methods

// Sample texts for testing
const sampleTexts = {
    human: `I've been thinking about this problem for a while now, and honestly, I'm not entirely sure what the best approach is. There are so many factors to consider - budget constraints, timeline issues, team dynamics. 

When I first started working on this project, I thought it would be straightforward. Boy, was I wrong! The more I dug into it, the more complex it became. I've had to pivot my approach at least three times already.

What really frustrates me is that every time I think I have a handle on things, something new comes up that throws a wrench in my plans. It's like trying to solve a puzzle where the pieces keep changing shape.

I guess that's just how these things go sometimes. You have to be flexible and willing to adapt. Maybe that's the real lesson here - not everything can be planned perfectly in advance.`,

    ai: `Artificial intelligence represents a transformative technology that has the potential to revolutionize numerous industries and aspects of human life. The development of AI systems has progressed significantly in recent years, with machine learning algorithms becoming increasingly sophisticated and capable of performing complex tasks.

One of the key advantages of AI technology is its ability to process vast amounts of data quickly and efficiently. This capability enables AI systems to identify patterns and make predictions that would be difficult or impossible for humans to achieve manually. Additionally, AI can operate continuously without fatigue, making it particularly valuable for applications that require constant monitoring or analysis.

However, it is important to consider the ethical implications of AI development and deployment. As AI systems become more powerful and autonomous, questions arise regarding accountability, privacy, and the potential for unintended consequences. Responsible AI development requires careful consideration of these factors and the implementation of appropriate safeguards.

The future of AI holds great promise, but it also presents significant challenges that must be addressed through thoughtful research, development, and policy-making.`,

    mixed: `I've been working with AI tools for about six months now, and I have to say, the results have been mixed. On one hand, these systems can generate content incredibly quickly and handle repetitive tasks with impressive efficiency. The quality of output has improved dramatically since I first started using them.

However, there are still significant limitations that become apparent when you use these tools regularly. The content often lacks the personal touch and nuanced understanding that comes from human experience. I find myself having to heavily edit most AI-generated content to make it feel authentic and engaging.

What's interesting is how the technology continues to evolve. Each update seems to bring improvements in understanding context and generating more natural-sounding text. But there's still something distinctly "artificial" about the way AI constructs sentences and organizes ideas.

I think the key is finding the right balance between leveraging AI capabilities and maintaining human oversight. These tools are incredibly powerful when used as assistants rather than replacements for human creativity and judgment.`
};

// AI Detection Algorithm
class AIDetector {
    constructor() {
        this.indicators = {
            // Linguistic patterns
            sentenceLength: { weight: 0.15, threshold: 20 },
            wordComplexity: { weight: 0.12, threshold: 0.3 },
            repetition: { weight: 0.18, threshold: 0.15 },
            formality: { weight: 0.10, threshold: 0.7 },
            
            // Structural patterns
            paragraphStructure: { weight: 0.12, threshold: 0.6 },
            transitionWords: { weight: 0.08, threshold: 0.4 },
            sentenceVariety: { weight: 0.10, threshold: 0.5 },
            
            // Content patterns
            hedging: { weight: 0.08, threshold: 0.3 },
            specificity: { weight: 0.07, threshold: 0.4 }
        };
    }

    analyze(text) {
        const analysis = {
            overallScore: 0,
            confidence: 0,
            indicators: {},
            suggestions: [],
            isAI: false
        };

        // Calculate individual indicator scores
        analysis.indicators.sentenceLength = this.analyzeSentenceLength(text);
        analysis.indicators.wordComplexity = this.analyzeWordComplexity(text);
        analysis.indicators.repetition = this.analyzeRepetition(text);
        analysis.indicators.formality = this.analyzeFormality(text);
        analysis.indicators.paragraphStructure = this.analyzeParagraphStructure(text);
        analysis.indicators.transitionWords = this.analyzeTransitionWords(text);
        analysis.indicators.sentenceVariety = this.analyzeSentenceVariety(text);
        analysis.indicators.hedging = this.analyzeHedging(text);
        analysis.indicators.specificity = this.analyzeSpecificity(text);

        // Calculate weighted overall score
        let totalWeight = 0;
        let weightedScore = 0;

        for (const [indicator, data] of Object.entries(analysis.indicators)) {
            const weight = this.indicators[indicator].weight;
            weightedScore += data.score * weight;
            totalWeight += weight;
        }

        analysis.overallScore = weightedScore / totalWeight;
        analysis.confidence = this.calculateConfidence(analysis.indicators);
        analysis.isAI = analysis.overallScore > 0.5;

        // Generate suggestions
        analysis.suggestions = this.generateSuggestions(analysis.indicators, analysis.isAI);

        return analysis;
    }

    analyzeSentenceLength(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
        
        // AI tends to use longer, more complex sentences
        const score = Math.min(avgLength / 25, 1);
        return {
            score: score,
            value: avgLength.toFixed(1),
            description: `Average sentence length: ${avgLength.toFixed(1)} words`,
            confidence: Math.min(sentences.length / 10, 1)
        };
    }

    analyzeWordComplexity(text) {
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const complexWords = words.filter(word => 
            word.length > 6 && 
            !['however', 'therefore', 'although', 'because', 'through', 'without'].includes(word)
        );
        
        const complexity = complexWords.length / words.length;
        return {
            score: complexity,
            value: `${(complexity * 100).toFixed(1)}%`,
            description: `Complex word ratio: ${(complexity * 100).toFixed(1)}%`,
            confidence: Math.min(words.length / 100, 1)
        };
    }

    analyzeRepetition(text) {
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const wordCounts = {};
        
        words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });

        const totalWords = words.length;
        const uniqueWords = Object.keys(wordCounts).length;
        const repetition = 1 - (uniqueWords / totalWords);

        return {
            score: repetition,
            value: `${(repetition * 100).toFixed(1)}%`,
            description: `Word repetition rate: ${(repetition * 100).toFixed(1)}%`,
            confidence: Math.min(totalWords / 50, 1)
        };
    }

    analyzeFormality(text) {
        const formalWords = [
            'furthermore', 'moreover', 'consequently', 'therefore', 'nevertheless',
            'additionally', 'specifically', 'particularly', 'significantly', 'substantially',
            'comprehensive', 'implementation', 'utilization', 'facilitate', 'demonstrate'
        ];
        
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const formalCount = words.filter(word => formalWords.includes(word)).length;
        const formality = formalCount / words.length;

        return {
            score: formality,
            value: `${(formality * 100).toFixed(1)}%`,
            description: `Formal language usage: ${(formality * 100).toFixed(1)}%`,
            confidence: Math.min(words.length / 100, 1)
        };
    }

    analyzeParagraphStructure(text) {
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        let uniformLengths = 0;
        
        if (paragraphs.length > 1) {
            const lengths = paragraphs.map(p => p.split(' ').length);
            const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
            const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
            const coefficient = Math.sqrt(variance) / avgLength;
            
            // Low coefficient of variation suggests uniform paragraph lengths (AI-like)
            uniformLengths = Math.max(0, 1 - coefficient);
        }

        return {
            score: uniformLengths,
            value: `${(uniformLengths * 100).toFixed(1)}%`,
            description: `Paragraph uniformity: ${(uniformLengths * 100).toFixed(1)}%`,
            confidence: Math.min(paragraphs.length / 3, 1)
        };
    }

    analyzeTransitionWords(text) {
        const transitions = [
            'however', 'therefore', 'moreover', 'furthermore', 'nevertheless',
            'consequently', 'additionally', 'specifically', 'particularly',
            'meanwhile', 'subsequently', 'accordingly', 'hence', 'thus'
        ];
        
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const transitionCount = words.filter(word => transitions.includes(word)).length;
        const transitionRatio = transitionCount / words.length;

        return {
            score: transitionRatio,
            value: `${(transitionRatio * 100).toFixed(1)}%`,
            description: `Transition word usage: ${(transitionRatio * 100).toFixed(1)}%`,
            confidence: Math.min(words.length / 100, 1)
        };
    }

    analyzeSentenceVariety(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const lengths = sentences.map(s => s.split(' ').length);
        
        if (lengths.length < 2) return { score: 0, value: 'N/A', description: 'Insufficient sentences', confidence: 0 };
        
        const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
        const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
        const coefficient = Math.sqrt(variance) / avgLength;
        
        // High variety (low coefficient) suggests human writing
        const variety = Math.max(0, 1 - coefficient);

        return {
            score: 1 - variety, // Invert for AI score
            value: `${(variety * 100).toFixed(1)}%`,
            description: `Sentence variety: ${(variety * 100).toFixed(1)}%`,
            confidence: Math.min(sentences.length / 10, 1)
        };
    }

    analyzeHedging(text) {
        const hedgeWords = [
            'might', 'could', 'possibly', 'perhaps', 'maybe', 'likely',
            'probably', 'appears', 'seems', 'suggests', 'indicates',
            'tends to', 'generally', 'typically', 'usually', 'often'
        ];
        
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const hedgeCount = words.filter(word => hedgeWords.includes(word)).length;
        const hedging = hedgeCount / words.length;

        return {
            score: hedging,
            value: `${(hedging * 100).toFixed(1)}%`,
            description: `Hedging language: ${(hedging * 100).toFixed(1)}%`,
            confidence: Math.min(words.length / 100, 1)
        };
    }

    analyzeSpecificity(text) {
        const specificWords = [
            'exactly', 'precisely', 'specifically', 'particularly', 'specifically',
            'concrete', 'definite', 'clear', 'obvious', 'evident'
        ];
        
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const specificCount = words.filter(word => specificWords.includes(word)).length;
        const specificity = specificCount / words.length;

        return {
            score: 1 - specificity, // Invert for AI score (AI tends to be less specific)
            value: `${(specificity * 100).toFixed(1)}%`,
            description: `Specific language: ${(specificity * 100).toFixed(1)}%`,
            confidence: Math.min(words.length / 100, 1)
        };
    }

    calculateConfidence(indicators) {
        const confidences = Object.values(indicators).map(ind => ind.confidence);
        return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    }

    generateSuggestions(indicators, isAI) {
        const suggestions = [];
        
        if (isAI) {
            suggestions.push("This text shows characteristics typical of AI-generated content.");
            suggestions.push("Consider adding more personal anecdotes or specific examples.");
            suggestions.push("Try varying sentence lengths and structures more.");
        } else {
            suggestions.push("This text appears to be human-written with natural language patterns.");
            suggestions.push("The writing shows good variety in sentence structure and vocabulary.");
        }

        // Add specific suggestions based on indicators
        if (indicators.sentenceLength.score > 0.7) {
            suggestions.push("Consider using shorter, more varied sentence lengths.");
        }
        
        if (indicators.repetition.score > 0.3) {
            suggestions.push("Try to reduce repetitive word usage for more engaging content.");
        }
        
        if (indicators.formality.score > 0.6) {
            suggestions.push("Consider using more conversational language to sound more natural.");
        }

        return suggestions;
    }
}

// Global variables
let detector = new AIDetector();
let isAnalyzing = false;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeAIDetector();
    setupEventListeners();
});

function initializeAIDetector() {
    // Initialize text input monitoring
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.addEventListener('input', updateTextStats);
        textInput.addEventListener('paste', function() {
            setTimeout(updateTextStats, 100);
        });
    }
}

function setupEventListeners() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

function updateTextStats() {
    const textInput = document.getElementById('textInput');
    const wordCount = document.getElementById('wordCount');
    const charCount = document.getElementById('charCount');
    
    if (!textInput || !wordCount || !charCount) return;
    
    const text = textInput.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    
    wordCount.textContent = `${words} words`;
    charCount.textContent = `${chars} characters`;
    
    // Enable/disable analyze button based on word count
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = words < 10;
        analyzeBtn.style.opacity = words < 10 ? '0.5' : '1';
    }
}

async function analyzeText() {
    if (isAnalyzing) return;
    
    const textInput = document.getElementById('textInput');
    const text = textInput.value.trim();
    
    if (text.length < 50) {
        WebspindUtils.showMessage('Please enter at least 50 words for accurate analysis.', 'error');
        return;
    }
    
    // Check credits
    if (!WebspindUtils.hasEnoughCredits(1)) {
        WebspindUtils.showMessage('You need 1 credit to analyze text. You have ' + WebspindUtils.userCredits() + ' credits remaining.', 'error');
        return;
    }
    
    isAnalyzing = true;
    
    // Use credit
    if (!WebspindUtils.useCredits(1)) {
        isAnalyzing = false;
        return;
    }
    
    // Show progress
    showProgress();
    
    try {
        // Simulate analysis time for better UX
        await simulateAnalysis();
        
        // Perform actual analysis
        const analysis = detector.analyze(text);
        
        // Display results
        displayResults(analysis);
        
        // Track usage
        WebspindUtils.trackEvent('AI Detector', 'Analysis Complete', analysis.isAI ? 'AI Detected' : 'Human Written');
        
    } catch (error) {
        console.error('Analysis error:', error);
        WebspindUtils.showMessage('An error occurred during analysis. Please try again.', 'error');
    } finally {
        isAnalyzing = false;
        hideProgress();
    }
}

function showProgress() {
    const progressSection = document.getElementById('progressSection');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressSection) {
        progressSection.style.display = 'block';
    }
    
    // Animate progress
    let progress = 0;
    const steps = [
        { progress: 20, text: 'Preprocessing text...' },
        { progress: 40, text: 'Analyzing linguistic patterns...' },
        { progress: 60, text: 'Checking structural features...' },
        { progress: 80, text: 'Calculating confidence scores...' },
        { progress: 100, text: 'Finalizing results...' }
    ];
    
    let stepIndex = 0;
    const interval = setInterval(() => {
        if (stepIndex < steps.length) {
            const step = steps[stepIndex];
            progress = step.progress;
            
            if (progressFill) {
                progressFill.style.width = progress + '%';
            }
            if (progressText) {
                progressText.textContent = step.text;
            }
            
            stepIndex++;
        } else {
            clearInterval(interval);
        }
    }, 400);
}

function hideProgress() {
    const progressSection = document.getElementById('progressSection');
    if (progressSection) {
        progressSection.style.display = 'none';
    }
}

function displayResults(analysis) {
    const resultSection = document.getElementById('resultSection');
    const analysisResults = document.getElementById('analysisResults');
    
    if (!resultSection || !analysisResults) return;
    
    // Show result section
    resultSection.style.display = 'block';
    
    // Generate results HTML
    const resultsHTML = generateResultsHTML(analysis);
    analysisResults.innerHTML = resultsHTML;
    
    // Scroll to results
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

function generateResultsHTML(analysis) {
    const isAI = analysis.isAI;
    const confidence = Math.round(analysis.confidence * 100);
    const score = Math.round(analysis.overallScore * 100);
    
    const badgeClass = isAI ? 'ai-detected' : 'human-written';
    const badgeIcon = isAI ? 'fas fa-robot' : 'fas fa-user';
    const badgeText = isAI ? 'AI-Generated' : 'Human-Written';
    const badgeColor = isAI ? '#ef4444' : '#10b981';
    
    let indicatorsHTML = '';
    for (const [name, data] of Object.entries(analysis.indicators)) {
        const indicatorName = name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        const confidence = Math.round(data.confidence * 100);
        const score = Math.round(data.score * 100);
        
        indicatorsHTML += `
            <div class="indicator-item">
                <div class="indicator-header">
                    <span class="indicator-name">${indicatorName}</span>
                    <span class="indicator-score">${score}%</span>
                </div>
                <div class="indicator-bar">
                    <div class="indicator-fill" style="width: ${score}%"></div>
                </div>
                <div class="indicator-details">
                    <span class="indicator-value">${data.value}</span>
                    <span class="indicator-confidence">Confidence: ${confidence}%</span>
                </div>
                <p class="indicator-description">${data.description}</p>
            </div>
        `;
    }
    
    let suggestionsHTML = '';
    analysis.suggestions.forEach(suggestion => {
        suggestionsHTML += `<li>${suggestion}</li>`;
    });
    
    return `
        <div class="result-badge ${badgeClass}" style="background-color: ${badgeColor}">
            <i class="${badgeIcon}"></i>
        </div>
        <h3 class="result-text">${badgeText}</h3>
        <p class="result-confidence">Confidence: ${confidence}% | Score: ${score}%</p>
        
        <div class="analysis-stats">
            <div class="stat-card">
                <div class="stat-value">${score}%</div>
                <div class="stat-label">AI Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${confidence}%</div>
                <div class="stat-label">Confidence</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Object.keys(analysis.indicators).length}</div>
                <div class="stat-label">Indicators</div>
            </div>
        </div>
        
        <div class="indicators-section">
            <h4>Detailed Analysis</h4>
            <div class="indicators-grid">
                ${indicatorsHTML}
            </div>
        </div>
        
        <div class="suggestions-section">
            <h4>Suggestions</h4>
            <ul class="suggestions-list">
                ${suggestionsHTML}
            </ul>
        </div>
    `;
}

function clearText() {
    const textInput = document.getElementById('textInput');
    const resultSection = document.getElementById('resultSection');
    
    if (textInput) {
        textInput.value = '';
        updateTextStats();
    }
    
    if (resultSection) {
        resultSection.style.display = 'none';
    }
}

function loadSampleText(type) {
    const textInput = document.getElementById('textInput');
    if (textInput && sampleTexts[type]) {
        textInput.value = sampleTexts[type];
        updateTextStats();
        
        // Clear any existing results
        const resultSection = document.getElementById('resultSection');
        if (resultSection) {
            resultSection.style.display = 'none';
        }
        
        WebspindUtils.showMessage(`Loaded ${type} sample text. Click "Analyze Text" to see the results.`, 'info');
    }
}

async function simulateAnalysis() {
    return new Promise(resolve => {
        setTimeout(resolve, 2000);
    });
}

// Export for global access
window.AIDetector = AIDetector;
window.analyzeText = analyzeText;
window.clearText = clearText;
window.loadSampleText = loadSampleText;
