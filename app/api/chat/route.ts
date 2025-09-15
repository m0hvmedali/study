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
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "StudyForge Educational Platform",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
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
