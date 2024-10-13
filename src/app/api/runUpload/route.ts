import { NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'

export async function POST(req: Request) {
  console.log('============POST /api/uploadPdf')
  const formData = await req.formData()
  const pdfFile = formData.get('pdf') as File
  console.log('pdfFile', pdfFile)
  if (!pdfFile) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const arrayBuffer = await pdfFile.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  try {
    // const pdfData = await pdfParse(buffer)
    // console.log('pdfData', pdfData)
    return NextResponse.json({ content: 'heyhey' })
  } catch (error) {
    console.log('error', error)
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 })
  }
}
