import { NextResponse } from 'next/server'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { Document } from '@langchain/core/documents'
export async function POST(req: Request) {
  console.log('============POST /api/uploadPdf')
  const formData = await req.formData()
  const pdfFile = formData.get('pdf') as File
  //Blob of pdfFile
  const pdfBlob = new Blob([pdfFile], { type: pdfFile.type })

  console.log('pdfFile', pdfFile)
  if (!pdfFile) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const arrayBuffer = await pdfFile.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  try {
    const loader = new PDFLoader(pdfBlob)
    const docs: Document<Record<string, any>>[] = await loader.load()

    return NextResponse.json({ content: docs }, { status: 200 })
  } catch (error) {
    console.log('error', error)
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 })
  }
}
