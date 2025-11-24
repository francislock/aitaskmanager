import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIResponse, Category, Task } from "@/types";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    let command = "";
    try {
        const body = await req.json();
        command = body.command;
        const lists = body.lists || []; // Array of {id, name, emoji}
        const API_KEY = process.env["GEMINI_API_KEY"];

        console.log("🔥 API Route called with:", command);

        if (!API_KEY) {
            console.warn("⚠️ Missing GEMINI_API_KEY, using mock engine.");
            const mockResponse = await mockProcess(command);
            return NextResponse.json({
                ...mockResponse,
                message: "ℹ️ Using offline mode (no API key configured)"
            });
        }

        console.log("🚀 Initializing Gemini...");
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
            model: "gemini-pro"
        });

        // Build lists description for prompt
        const listsDescription = lists.length > 0
            ? lists.map((l: any) => `- "${l.id}": ${l.emoji} ${l.name}`).join('\n')
            : `- "work_projects": 💼 Work & Projects\n- "personal_home": 🏠 Personal & Home\n- "shopping": 🛒 Shopping List\n- "quick_ideas": 💡 Quick Ideas`;

        const prompt = `
      You are an AI Task Manager. Analyze the following user input and extract tasks.
      
      Input: "${command}"
      
      Available Lists (use list_id in response):
${listsDescription}
      
      Priority Levels: 'high', 'medium', 'low'
      
      Rules:
      1. Identify if the user wants to create a task, modify one, or query.
      2. If creating tasks, split compound requests (e.g., "and", "also").
      3. Assign to the most appropriate list based on content and list name/emoji.
      4. Extract a due date if mentioned (e.g., "tomorrow", "next friday") as a string.
      5. **Detect priority based on urgency and importance:**
         - HIGH: Urgent deadlines (today, tomorrow, ASAP), critical words (urgent, important, critical), client/boss related
         - MEDIUM: Near-term deadlines (this week, next week), standard work tasks
         - LOW: No deadline, future planning, ideas, optional tasks
      6. **Detect complex tasks that need breakdown into subtasks:**
         - Complex tasks: "organizar evento", "preparar presentación", "planificar viaje", "lanzar proyecto"
         - If detected, suggest 3-5 actionable subtasks in logical order
         - Subtasks should be specific, actionable steps
      7. Return valid JSON matching this structure:
      {
        "intent": "create_task" | "modify_task" | "query_list",
        "tasks": [
          {
            "content": "string",
            "list_id": "uuid-of-list",
            "status": "pending",
            "suggested_due_date": "string (optional)",
            "priority": "high" | "medium" | "low",
            "subtasks": [
              { "content": "string", "status": "pending", "order_index": 0 }
            ] (optional, only for complex tasks)
          }
        ]
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Strip markdown code blocks if present
        text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();

        const aiResponse = JSON.parse(text) as AIResponse;

        console.log("✅ Gemini API Success");
        return NextResponse.json(aiResponse);

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        const mockResponse = await mockProcess(command || "error");
        return NextResponse.json({
            ...mockResponse,
            message: `⚠️ AI Error: ${error.message}. Using offline mode.`
        });
    }
}

// Fallback Mock Engine
async function mockProcess(input: string): Promise<AIResponse> {
    const KEYWORDS: Record<Category, string[]> = {
        shopping: ['comprar', 'leche', 'pan', 'supermercado', 'tienda', 'café', 'buy', 'shop'],
        work_projects: ['proyecto', 'revisar', 'informe', 'cliente', 'reunión', 'presupuesto', 'email', 'project', 'work'],
        personal_home: ['mamá', 'casa', 'limpiar', 'llamar', 'cita', 'médico', 'gimnasio', 'call', 'mom', 'home'],
        quick_ideas: ['idea', 'pensar', 'investigar', 'recordar', 'remind', 'note']
    };

    const lowerInput = input.toLowerCase();
    const tasks: Partial<Task>[] = [];

    const segments = lowerInput.split(/ y | también | ademas | and | also /);

    for (const segment of segments) {
        const trimmedSegment = segment.trim();
        if (!trimmedSegment) continue;

        let category: Category = 'quick_ideas';

        for (const [cat, words] of Object.entries(KEYWORDS)) {
            if (words.some(word => trimmedSegment.includes(word))) {
                category = cat as Category;
                break;
            }
        }

        // Detect priority based on keywords
        let priority: 'high' | 'medium' | 'low' = 'medium';
        if (trimmedSegment.match(/urgente|asap|hoy|today|crítico|importante|ya/i)) {
            priority = 'high';
        } else if (trimmedSegment.match(/idea|pensar|quizás|maybe|futuro|algún día/i)) {
            priority = 'low';
        }

        tasks.push({
            content: trimmedSegment.charAt(0).toUpperCase() + trimmedSegment.slice(1),
            list_category: category,
            status: 'pending',
            suggested_due_date: trimmedSegment.includes('mañana') || trimmedSegment.includes('tomorrow') ? 'Tomorrow' : undefined,
            priority
        });
    }

    return {
        intent: 'create_task',
        tasks
    };
}
