import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer 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`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "StudyForge Educational Platform",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b:free",
        messages: [
          {
            role: "system",
            content: `أنت مساعد تعليمي ذكي في منصة StudyForge. مهمتك مساعدة الطلاب في فهم المواد الدراسية التالية:
            - الكيمياء
            - الفيزياء
            - اللغة العربية
            - اللغة الإنجليزية
            - الرياضيات
            
            يجب أن تجيب باللغة العربية بشكل واضح ومفيد. اشرح المفاهيم بطريقة بسيطة ومناسبة للطلاب.
            إذا كان لديك سياق عن الدرس الحالي، استخدمه لتقديم إجابات أكثر دقة.
            
            ${context ? `السياق الحالي: ${context}` : ""}`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    const aiMessage = data.choices?.[0]?.message?.content

    if (!aiMessage) {
      throw new Error("No response from AI")
    }

    return NextResponse.json({ message: aiMessage })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "حدث خطأ في الاتصال بالمساعد الذكي" }, { status: 500 })
  }
}
