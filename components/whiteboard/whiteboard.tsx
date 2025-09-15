"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Pen, Eraser, Square, Circle, Type, Palette, Save, Download, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { createBrowserClient } from "@supabase/ssr"

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface WhiteboardProps {
  lessonId?: string
  className?: string
}

interface DrawingData {
  tool: "pen" | "eraser" | "rectangle" | "circle" | "text"
  color: string
  size: number
  points: Array<{ x: number; y: number }>
  text?: string
}

const colors = [
  "#000000", // Black
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FFA500", // Orange
  "#800080", // Purple
  "#FFC0CB", // Pink
]

export function Whiteboard({ lessonId, className }: WhiteboardProps) {
  const { user } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<"pen" | "eraser" | "rectangle" | "circle" | "text">("pen")
  const [currentColor, setCurrentColor] = useState("#000000")
  const [currentSize, setCurrentSize] = useState([3])
  const [drawings, setDrawings] = useState<DrawingData[]>([])
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    if (lessonId && user) {
      loadWhiteboard()
    }
  }, [lessonId, user])

  const loadWhiteboard = async () => {
    if (!lessonId || !user) return

    try {
      const { data, error } = await supabase
        .from("whiteboard_saves")
        .select("whiteboard_data")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading whiteboard:", error)
        return
      }

      if (data?.whiteboard_data?.drawings) {
        setDrawings(data.whiteboard_data.drawings)
        redrawCanvas(data.whiteboard_data.drawings)
      }
    } catch (error) {
      console.error("Error loading whiteboard:", error)
    }
  }

  const saveWhiteboard = async () => {
    if (!lessonId || !user) return

    try {
      const { error } = await supabase.from("whiteboard_saves").upsert({
        user_id: user.id,
        lesson_id: lessonId,
        whiteboard_data: { drawings },
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setLastSaved(new Date())
    } catch (error) {
      console.error("Error saving whiteboard:", error)
    }
  }

  const redrawCanvas = useCallback((drawingsData: DrawingData[]) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    drawingsData.forEach((drawing) => {
      ctx.strokeStyle = drawing.color
      ctx.lineWidth = drawing.size
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      if (drawing.tool === "pen" || drawing.tool === "eraser") {
        if (drawing.tool === "eraser") {
          ctx.globalCompositeOperation = "destination-out"
        } else {
          ctx.globalCompositeOperation = "source-over"
        }

        ctx.beginPath()
        drawing.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y)
          } else {
            ctx.lineTo(point.x, point.y)
          }
        })
        ctx.stroke()
      } else if (drawing.tool === "rectangle" && drawing.points.length >= 2) {
        const start = drawing.points[0]
        const end = drawing.points[drawing.points.length - 1]
        ctx.globalCompositeOperation = "source-over"
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y)
      } else if (drawing.tool === "circle" && drawing.points.length >= 2) {
        const start = drawing.points[0]
        const end = drawing.points[drawing.points.length - 1]
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
        ctx.globalCompositeOperation = "source-over"
        ctx.beginPath()
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI)
        ctx.stroke()
      } else if (drawing.tool === "text" && drawing.text && drawing.points.length > 0) {
        ctx.globalCompositeOperation = "source-over"
        ctx.font = `${drawing.size * 4}px Arial`
        ctx.fillStyle = drawing.color
        ctx.fillText(drawing.text, drawing.points[0].x, drawing.points[0].y)
      }
    })
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (currentTool === "text") {
      const text = prompt("أدخل النص:")
      if (text) {
        const newDrawing: DrawingData = {
          tool: currentTool,
          color: currentColor,
          size: currentSize[0],
          points: [{ x, y }],
          text,
        }
        setDrawings((prev) => [...prev, newDrawing])
      }
      return
    }

    setIsDrawing(true)
    const newDrawing: DrawingData = {
      tool: currentTool,
      color: currentColor,
      size: currentSize[0],
      points: [{ x, y }],
    }
    setDrawings((prev) => [...prev, newDrawing])
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setDrawings((prev) => {
      const newDrawings = [...prev]
      const currentDrawing = newDrawings[newDrawings.length - 1]
      if (currentDrawing) {
        if (currentTool === "pen" || currentTool === "eraser") {
          currentDrawing.points.push({ x, y })
        } else {
          // For shapes, update the end point
          currentDrawing.points = [currentDrawing.points[0], { x, y }]
        }
      }
      return newDrawings
    })
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  useEffect(() => {
    redrawCanvas(drawings)
  }, [drawings, redrawCanvas])

  const clearCanvas = () => {
    setDrawings([])
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `whiteboard-${lessonId || "drawing"}-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Pen className="h-5 w-5 text-emerald-600" />
            اللوحة البيضاء
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <Badge variant="secondary" className="text-xs">
                آخر حفظ: {lastSaved.toLocaleTimeString("ar")}
              </Badge>
            )}
            <Button size="sm" variant="outline" onClick={saveWhiteboard} disabled={!lessonId}>
              <Save className="h-4 w-4 mr-1" />
              حفظ
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tools */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={currentTool === "pen" ? "default" : "outline"}
              onClick={() => setCurrentTool("pen")}
            >
              <Pen className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={currentTool === "eraser" ? "default" : "outline"}
              onClick={() => setCurrentTool("eraser")}
            >
              <Eraser className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={currentTool === "rectangle" ? "default" : "outline"}
              onClick={() => setCurrentTool("rectangle")}
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={currentTool === "circle" ? "default" : "outline"}
              onClick={() => setCurrentTool("circle")}
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={currentTool === "text" ? "default" : "outline"}
              onClick={() => setCurrentTool("text")}
            >
              <Type className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Colors */}
          <div className="flex items-center gap-1">
            <Palette className="h-4 w-4 text-gray-600" />
            {colors.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full border-2 ${
                  currentColor === color ? "border-gray-800" : "border-gray-300"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setCurrentColor(color)}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Size */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <span className="text-sm text-gray-600">الحجم:</span>
            <Slider value={currentSize} onValueChange={setCurrentSize} max={20} min={1} step={1} className="flex-1" />
            <span className="text-sm text-gray-600 w-6">{currentSize[0]}</span>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" onClick={clearCanvas}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={downloadCanvas}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-auto cursor-crosshair bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        <div className="text-xs text-gray-500 text-center">
          استخدم الأدوات أعلاه للرسم والكتابة على اللوحة. يتم حفظ عملك تلقائياً مع كل درس.
        </div>
      </CardContent>
    </Card>
  )
}
