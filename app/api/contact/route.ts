import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import type { TransportOptions } from 'nodemailer'

const DESTINATION_EMAIL = 'londontubespropertyfinder@gmail.com'
const MAX_WORDS = 500

function sanitize(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input.trim()
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
  }

  const name = sanitize(body.name)
  const email = sanitize(body.email)
  const category = sanitize(body.category)
  const description = sanitize(body.description)

  if (!name || !email || !description || countWords(description) === 0) {
    return NextResponse.json({ message: 'Name, email, and description are required.' }, { status: 400 })
  }

  if (countWords(description) > MAX_WORDS) {
    return NextResponse.json({ message: `Description must not exceed ${MAX_WORDS} words.` }, { status: 400 })
  }

  const transportConfig: TransportOptions = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
  }

  if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    transportConfig.auth = {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    }
  }

  const transporter = nodemailer.createTransport(transportConfig)

  const fromEmail = process.env.EMAIL_FROM || email

  const mailOptions = {
    from: fromEmail,
    to: DESTINATION_EMAIL,
    replyTo: email,
    subject: `Contact form ${category || 'message'} from ${name}`,
    text: `New contact form submission:\n\nName: ${name}\nEmail: ${email}\nCategory: ${category || 'feedback'}\n\n${description}`,
  }

  try {
    await transporter.verify()
    await transporter.sendMail(mailOptions)
    return NextResponse.json({ message: 'Message sent' }, { status: 200 })
  } catch (error) {
    console.error('Unable to deliver contact form message', error)
    return NextResponse.json({ message: 'Unable to deliver your message right now.' }, { status: 500 })
  }
}
