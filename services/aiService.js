const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

class AIService {
    // Axios instance
    static api = axios.create({
        baseURL: 'https://api-inference.huggingface.co/models',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HF_URI}`
        }
    });

    // Function to query Hugging Face API
    static async queryModel(model, inputs, parameters = {}) {
        try {
            const response = await this.api.post(`/${model}`, { inputs, parameters });
            return response.data;
        } catch (error) {
            console.error("Error calling Hugging Face API:", error.response?.data || error.message);
            return null;
        }
    }

    // Moderate chat message
    static async moderateChatMessage(message) {
        const model = "SamLowe/roberta-base-go_emotions"; // Emotion classification model
        const result = await this.queryModel(model, message);
    
        // Validate response structure
        if (!Array.isArray(result) || result.length === 0 || !Array.isArray(result[0])) {
            return {
                success: false,
                message: "Error in moderation: Invalid response structure"
            };
        }
    
        // Extract emotion scores
        const scores = {};
        result[0].forEach(item => {
            scores[item.label] = item.score;
        });
    
        // Define emotion-to-emoji mapping
        const emojiMap = {
            "fear": "😨",
            "neutral": "😐",
            "anger": "😡",
            "sadness": "😢",
            "annoyance": "😠",
            "disgust": "🤢",
            "optimism": "🌟",
            "nervousness": "😰",
            "surprise": "😲",
            "disappointment": "😞",
            "realization": "💡",
            "curiosity": "🤔",
            "disapproval": "👎",
            "desire": "🔥",
            "caring": "🤗",
            "amusement": "😂",
            "confusion": "😕",
            "grief": "🖤",
            "approval": "👍",
            "joy": "😊",
            "excitement": "🤩",
            "admiration": "👏",
            "embarrassment": "😳",
            "love": "❤️",
            "remorse": "😔",
            "gratitude": "🙏",
            "relief": "😌",
            "pride": "🏆"
        };
    
        // Identify the highest scoring emotion
        const highestEmotion = Object.entries(scores).reduce((max, entry) => entry[1] > max[1] ? entry : max, ["neutral", 0]);
    
        // Get corresponding emoji (default to neutral if none found)
        const emoji = emojiMap[highestEmotion[0]] || "😐";
    
        // Determine how many emojis to add based on the score
        let emojiCount = 1; 
        if (highestEmotion[1] > 0.75) emojiCount = 4;
        else if (highestEmotion[1] > 0.50) emojiCount = 3;
        else if (highestEmotion[1] > 0.25) emojiCount = 2;
    
        // Check if the message already contains the detected emoji
        const emojiPattern = new RegExp(emoji, "g");
        const containsEmoji = emojiPattern.test(message);
    
        // Append emojis if not already present
        const updatedMessage = containsEmoji ? message : `${message} ${emoji.repeat(emojiCount)}`;
    
        // Define offensive emotions and threshold
        const offensiveEmotions = ["anger", "annoyance", "disgust", "disapproval"];
        const offensiveThreshold = 0.5; 
    
        // Check if any offensive emotion exceeds the threshold
        const isOffensive = offensiveEmotions.some(label => scores[label] && scores[label] > offensiveThreshold);
    
        // Check if the message should be flagged for review
        const flaggedForReview = isOffensive;
    
        return {
            success: true,
            tag: highestEmotion[0],  // Example: "tag: angry"
            flaggedForReview,
            data: {
                message: updatedMessage,  // Final message with emojis
                scores,
                detectedEmotion: highestEmotion[0],
                emoji
            }
        };
    }
    
    
    
    
    
    
    

    // Text Generation Function
    static async generateText(prompt, maxLength = 100) {
        const model = "tiiuae/falcon-7b-instruct"; // or "gpt2"
        
        const parameters = {
            max_length: maxLength,
            temperature: 0.5,  // Controls randomness (higher = more creative)
            top_p: 0.9,        // Filters unlikely words
            do_sample: true,
            return_full_text: false
        };

        const result = await this.queryModel(model, prompt, parameters);

        if (!Array.isArray(result) || result.length === 0 || !result[0]?.generated_text) {
            return {
                success: false,
                message: "Error in text generation"
            };
        }

        return {
            success: true,
            message: "Text Generation Successful",
            data: {
                input: prompt,
                output: result[0].generated_text
            }
        };
    }

    // handle sharing of contact details
    static async moderateContactInfo(message, allow = false) {
        const model = "facebook/bart-large-mnli";
        const labels = ["phone number", "email", "link", "domain"];
    
        const result = await this.queryModel(model, message, { candidate_labels: labels });
    
        // Validate response structure
        if (!result || !result.labels || !result.scores || result.labels.length !== result.scores.length) {
            return {
                success: false,
                message: "Error in contact moderation: Invalid response structure"
            };
        }
    
        // Check if any detected label has a score above 0.5
        const flagged = result.labels
            .map((label, index) => ({ label, score: result.scores[index] }))
            .filter(item => item.score > 0.5);
    
        const isAllowed = allow || flagged.length === 0;
    
        return {
            success: true,
            message: isAllowed ? "Message Allowed" : "Message Disallowed: Contains Contact Info",
            data: {
                message,
                detected: allow ? [] : flagged // Show flagged results only if blocking
            }
        };
    }
    

    
    
    
    
    
    
    
    
}

module.exports = AIService;
