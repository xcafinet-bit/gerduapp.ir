import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import type { IScannerControls } from '@zxing/browser'
import TrazinoBook from './TrazinoBook'
import './App.css'

declare global {
  interface Window {
    Goftino?: {
      open: () => void
    }
  }
}

const icons: Record<string, ReactNode> = {
  shop: <><path d="M12 25h40v29H12z" fill="#D9F2EB" /><path d="M9 25 14 12h36l5 13v5a7 7 0 0 1-12 4 7 7 0 0 1-12 0 7 7 0 0 1-12 0 7 7 0 0 1-10-4z" fill="#16A085" /><path d="M18 18h28v5H18z" fill="#fff" opacity=".8" /><path d="M17 37h30v17H17z" fill="#EFFAF6" /><path d="M25 42h14v12H25z" fill="#F2B84B" /><path d="M29 46h6" stroke="#fff" strokeWidth="2" /></>,
  settings: <><path d="m27 7 10 0 2 7 6 3 6-2 5 9-5 5v7l5 5-5 9-7-2-6 4-2 7H26l-2-7-6-3-7 2-5-9 5-5v-7l-5-5 5-9 7 2 6-4z" fill="#DCD6FF" /><path d="m29 12 6 0 2 6 5 2 5-2 3 5-4 4v6l4 4-3 5-6-2-4 3-2 6h-6l-2-6-5-2-5 2-3-5 4-5v-5l-4-4 3-5 6 2 4-3z" fill="#7162D9" /><circle cx="32" cy="31" r="8" fill="#F7F5FF" /><circle cx="32" cy="31" r="4" fill="#7162D9" /></>,
  note: <><path d="M16 8h26l9 9v35H16a5 5 0 0 1-5-5V13a5 5 0 0 1 5-5" fill="#DDF5F2" /><path d="M40 8v11h11" fill="#8DDAD1" /><path d="M21 27h19M21 34h15M21 41h10" stroke="#249E9A" strokeWidth="3" strokeLinecap="round" /><path d="m35 45 3-8 12-12 6 6-12 12-8 2z" fill="#F3B44E" /><path d="m47 27 6 6" stroke="#fff" strokeWidth="2" /></>,
  bell: <><path d="M19 11h26a5 5 0 0 1 5 5v38H14V16a5 5 0 0 1 5-5" fill="#E0F2EA" /><rect x="24" y="7" width="16" height="9" rx="3" fill="#36A77C" /><path d="m20 27 3 3 5-6m4 3h10m-22 9 3 3 5-6m4 3h10" fill="none" stroke="#42A781" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M38 43h12v10H38z" fill="#F1B348" /><path d="m41 48 2 2 4-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>,
  cart: <><path d="M8 13h7l5 25h25l7-18H18" fill="#BDE9F2" /><path d="M18 21h34l-6 16H21z" fill="#42A9C6" /><path d="M23 27h22M25 32h18" stroke="#DDF8FC" strokeWidth="2" strokeLinecap="round" /><circle cx="25" cy="46" r="5" fill="#315B72" /><circle cx="43" cy="46" r="5" fill="#315B72" /><circle cx="25" cy="46" r="2" fill="#D9F5FA" /><circle cx="43" cy="46" r="2" fill="#D9F5FA" /></>,
  box: <><path d="m32 8 22 12v25L32 57 10 45V20z" fill="#F2BE75" /><path d="m32 8 22 12-22 13-22-13z" fill="#FFD99C" /><path d="M10 20v25l22 12V33z" fill="#E5A952" /><path d="M32 33v24l22-12V20z" fill="#D98D40" /><path d="m25 12 22 12" stroke="#FFF1D6" strokeWidth="3" /></>,
  returnSale: <><path d="M36 15H20a8 8 0 0 0 0 16h6" fill="none" stroke="#4699C7" strokeWidth="6" strokeLinecap="round" /><path d="m34 8 10 7-10 8" fill="none" stroke="#4699C7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /><path d="M29 31h22v20H29z" fill="#D8EFF7" /><path d="M29 37h22v14H29z" fill="#74BBD6" /><path d="m29 37 11 7 11-7" fill="none" stroke="#fff" strokeWidth="2.5" /></>,
  returnPurchase: <><path d="M28 15h16a8 8 0 0 1 0 16h-6" fill="none" stroke="#5AA78D" strokeWidth="6" strokeLinecap="round" /><path d="m30 8-10 7 10 8" fill="none" stroke="#5AA78D" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /><path d="M13 31h22v20H13z" fill="#E0F2E9" /><path d="M13 37h22v14H13z" fill="#83C9A6" /><path d="m13 37 11 7 11-7" fill="none" stroke="#fff" strokeWidth="2.5" /></>,
  receive: <><path d="M10 18h39v27H10z" fill="#BFE9D3" /><path d="M10 23h39v22H10z" fill="#39A976" /><path d="M16 29h9v10h-9z" fill="#E9FFF2" /><path d="M32 28h11m-11 5h8" stroke="#E9FFF2" strokeWidth="2" strokeLinecap="round" /><path d="M29 8v15m-7-7 7 7 7-7" fill="none" stroke="#2587C1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="49" cy="45" r="9" fill="#F4BE45" /><path d="M49 40v10m3-8h-4a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4h-4" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" /></>,
  pay: <><path d="M11 18h39v27H11z" fill="#C5E7F4" /><path d="M11 23h39v22H11z" fill="#438EB8" /><path d="M17 29h9v10h-9z" fill="#F3FCFF" /><path d="M33 28h11m-11 5h8" stroke="#F3FCFF" strokeWidth="2" strokeLinecap="round" /><path d="M29 9v14m-7-7 7-7 7 7" fill="none" stroke="#E6A544" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></>,
  expense: <><path d="M13 12h34a4 4 0 0 1 4 4v32H13a5 5 0 0 1-5-5V17a5 5 0 0 1 5-5" fill="#F5D6C7" /><path d="M8 20h43v23H8z" fill="#E88362" /><path d="M38 26h15v12H38a6 6 0 0 1 0-12" fill="#FFF2E9" /><circle cx="41" cy="32" r="2" fill="#D9684A" /><path d="M18 8h19" stroke="#D9684A" strokeWidth="3" strokeLinecap="round" /><path d="M23 32h7" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></>,
  income: <><path d="M13 12h34a4 4 0 0 1 4 4v32H13a5 5 0 0 1-5-5V17a5 5 0 0 1 5-5" fill="#CDEEDB" /><path d="M8 20h43v23H8z" fill="#36A979" /><path d="M38 26h15v12H38a6 6 0 0 1 0-12" fill="#E8FFF0" /><circle cx="41" cy="32" r="2" fill="#279668" /><path d="M22 9h12m-6-6v12" stroke="#E4AC39" strokeWidth="3" strokeLinecap="round" /></>,
  check: <><path d="M15 8h29l7 7v38H15a5 5 0 0 1-5-5V13a5 5 0 0 1 5-5" fill="#FFF0C8" /><path d="M43 8v9h8" fill="#F1C05B" /><path d="M19 24h18M19 31h18M19 38h9" stroke="#D49A37" strokeWidth="2.5" strokeLinecap="round" /><circle cx="43" cy="42" r="9" fill="#40AA78" /><path d="m39 42 3 3 5-6" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></>,
  pen: <><path d="M11 15h28l9 9v29H11z" fill="#D9F0E7" /><path d="M39 15v10h9" fill="#9DD7C0" /><path d="M17 30h17m-17 6h11" stroke="#51A985" strokeWidth="2.5" strokeLinecap="round" /><path d="m30 43 4-9 14-14 7 7-14 14-9 2z" fill="#E9A93F" /><path d="m44 23 7 7" stroke="#FFF3D1" strokeWidth="2" /><path d="M18 45h7m-2-3 3 3-3 3" fill="none" stroke="#3B91BB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></>,
  refresh: <><path d="M49 25a18 18 0 0 0-31-10l-5 5" fill="none" stroke="#49A4C8" strokeWidth="5" strokeLinecap="round" /><path d="M13 12v9h9" fill="none" stroke="#49A4C8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 39a18 18 0 0 0 31 10l5-5" fill="none" stroke="#75C8D6" strokeWidth="5" strokeLinecap="round" /><path d="M51 52v-9h-9" fill="none" stroke="#75C8D6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="32" cy="32" r="8" fill="#EAF8F8" /><path d="M28 32h8m-4-4v8" stroke="#4797B4" strokeWidth="2.5" strokeLinecap="round" /></>,
  tool: <><path d="M38 9a15 15 0 0 0-17 19L9 40a6 6 0 0 0 8 8l12-12a15 15 0 0 0 19-17l-9 9-9-9z" fill="#E6C994" /><path d="m21 28 11 11" stroke="#B48742" strokeWidth="4" strokeLinecap="round" /><path d="m35 9 10 10" stroke="#F9E8C4" strokeWidth="3" strokeLinecap="round" /></>,
  chart: <><path d="M10 10h44v42H10z" fill="#E0F2F1" /><path d="M17 43h8V30h-8zm12 0h8V21h-8zm12 0h8V15h-8z" fill="#45A9A2" /><path d="m17 25 11-7 9 4 12-11" fill="none" stroke="#F1A744" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="49" cy="11" r="3" fill="#F1A744" /></>,
  accounts: <><path d="M9 17h46v34H9z" fill="#D9E8F4" /><path d="M9 22h46v29H9z" fill="#4B779B" /><path d="M15 29h13v15H15z" fill="#EAF5FB" /><path d="M34 30h15m-15 6h12m-12 6h9" stroke="#EAF5FB" strokeWidth="2.5" strokeLinecap="round" /><path d="M15 11h34" stroke="#D9A54C" strokeWidth="4" strokeLinecap="round" /></>,
  inventory: <><path d="m31 8 21 11v25L31 56 10 44V19z" fill="#BCE4D1" /><path d="m31 8 21 11-21 12L10 19z" fill="#E3F6EC" /><path d="M10 19v25l21 12V31z" fill="#8CC9A8" /><path d="M31 31v25l21-12V19z" fill="#43A77A" /><path d="m22 13 21 12" stroke="#fff" strokeWidth="3" /></>,
  people: <><circle cx="25" cy="23" r="10" fill="#F1C36D" /><circle cx="43" cy="25" r="8" fill="#75BFD0" /><path d="M7 51a18 18 0 0 1 36 0z" fill="#716AC8" /><path d="M37 38a15 15 0 0 1 20 13H43" fill="#48A99A" /><circle cx="25" cy="23" r="4" fill="#FFF4D8" /><circle cx="43" cy="25" r="3" fill="#E5F8FC" /></>,
  fingerprint: <><path d="M18 27a14 14 0 0 1 28 0c0 12-3 21-7 27M24 28a8 8 0 0 1 16 0c0 10-1 17-4 23M30 29c0 9-1 16-3 21M12 30c0 8-1 14-3 18M52 30c0 6 1 11 3 15" fill="none" stroke="#168B7E" strokeWidth="3.2" strokeLinecap="round" /></>,
  lock: <><rect x="14" y="27" width="36" height="28" rx="6" fill="#DDF3E9" stroke="#168B7E" strokeWidth="3" /><path d="M22 27v-8a10 10 0 0 1 20 0v8" fill="none" stroke="#168B7E" strokeWidth="4" strokeLinecap="round" /><circle cx="32" cy="39" r="3" fill="#168B7E" /><path d="M32 42v5" stroke="#168B7E" strokeWidth="3" strokeLinecap="round" /></>,
  camera: <><path d="M10 21h10l4-6h16l4 6h10a4 4 0 0 1 4 4v26a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V25a4 4 0 0 1 4-4z" fill="#E1F0FA" stroke="#438EB8" strokeWidth="3" /><circle cx="32" cy="37" r="11" fill="#fff" stroke="#438EB8" strokeWidth="3" /><circle cx="32" cy="37" r="5" fill="#74BBD6" /></>,
  folder: <><path d="M7 18a5 5 0 0 1 5-5h15l6 7h19a5 5 0 0 1 5 5v25a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5z" fill="#FFF0D4" stroke="#D99B35" strokeWidth="3" /><path d="M8 27h45" stroke="#D99B35" strokeWidth="3" /></>,
  sms: <><path d="M9 13h46v33H30l-13 9v-9H9z" fill="#E4F6F2" stroke="#249E9A" strokeWidth="3" strokeLinejoin="round" /><path d="M18 25h28m-28 9h20" stroke="#249E9A" strokeWidth="3" strokeLinecap="round" /></>,
  phone: <><path d="M20 9h24a5 5 0 0 1 5 5v36a5 5 0 0 1-5 5H20a5 5 0 0 1-5-5V14a5 5 0 0 1 5-5z" fill="#E7F3FA" stroke="#438EB8" strokeWidth="3" /><path d="M25 15h14m-8 33h2" stroke="#438EB8" strokeWidth="3" strokeLinecap="round" /><path d="M8 27c0-7 5-12 11-12m37 21c0 7-5 12-11 12" fill="none" stroke="#168B7E" strokeWidth="3" strokeLinecap="round" /></>,
  keypad: <><rect x="12" y="9" width="40" height="46" rx="7" fill="#EEE7FB" stroke="#7455AA" strokeWidth="3" /><circle cx="23" cy="22" r="3" fill="#7455AA" /><circle cx="32" cy="22" r="3" fill="#7455AA" /><circle cx="41" cy="22" r="3" fill="#7455AA" /><circle cx="23" cy="32" r="3" fill="#7455AA" /><circle cx="32" cy="32" r="3" fill="#7455AA" /><circle cx="41" cy="32" r="3" fill="#7455AA" /><circle cx="23" cy="42" r="3" fill="#7455AA" /><circle cx="32" cy="42" r="3" fill="#7455AA" /><circle cx="41" cy="42" r="3" fill="#7455AA" /></>,
  pattern: <><path d="M16 16h32M16 32h32M16 48h32M16 16v32m16-32v32m16-32v32" stroke="#438EB8" strokeWidth="2" opacity=".5" /><circle cx="16" cy="16" r="5" fill="#438EB8" /><circle cx="32" cy="32" r="5" fill="#438EB8" /><circle cx="48" cy="48" r="5" fill="#438EB8" /></>,
  backup: <><path d="M12 12h40v40H12z" fill="#DDF3E9" stroke="#168B7E" strokeWidth="3" /><path d="M20 20h24v7H20zm0 15h24v9H20z" fill="#fff" stroke="#168B7E" strokeWidth="2" /><path d="M27 35v9m10-9v9" stroke="#168B7E" strokeWidth="2" /><path d="m25 31 7-5 7 5" fill="none" stroke="#E5A544" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></>,
  cloud: <><path d="M17 46h31a10 10 0 0 0 1-20 17 17 0 0 0-33-3 12 12 0 0 0 1 23z" fill="#E5F3FA" stroke="#438EB8" strokeWidth="3" /><path d="M32 29v15m-6-6 6 6 6-6" fill="none" stroke="#168B7E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></>,
  home: <><path d="m7 29 25-21 25 21-5 6-4-3v21H16V32l-4 3z" fill="#E9D7BB" /><path d="M14 29 32 13l18 16v22H14z" fill="#F3B06A" /><path d="M26 51V36h12v15" fill="#FFF4DF" /><path d="m7 29 25-21 25 21" fill="none" stroke="#C98954" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></>,
  calendar: <><rect x="10" y="14" width="44" height="39" rx="6" fill="#E4F4F0" /><path d="M10 23h44" stroke="#3AA68C" strokeWidth="5" /><path d="M21 9v10m22-10v10" stroke="#16836F" strokeWidth="4" strokeLinecap="round" /><path d="M19 31h6m7 0h6m7 0h4m-30 9h6m7 0h6m7 0h4m-30 8h6m7 0h6" stroke="#45A58D" strokeWidth="3" strokeLinecap="round" /></>,
  clock: <><circle cx="32" cy="32" r="23" fill="#E5F3FA" /><circle cx="32" cy="32" r="18" fill="#4B9FC2" /><path d="M32 20v13l9 6" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /><path d="M27 6h10" stroke="#397F9E" strokeWidth="4" strokeLinecap="round" /></>,
  support: <><path d="M12 34v-4a20 20 0 0 1 40 0v4" fill="none" stroke="#3B91BB" strokeWidth="5" strokeLinecap="round" /><path d="M12 33h9v16h-5a4 4 0 0 1-4-4zm40 0h-9v16h5a4 4 0 0 0 4-4z" fill="#7BC2D3" /><path d="M43 49a12 12 0 0 1-11 7h-5" fill="none" stroke="#E4A84C" strokeWidth="4" strokeLinecap="round" /><circle cx="25" cy="56" r="3" fill="#E4A84C" /></>,
  moon: <><path d="M48 40A21 21 0 0 1 24 12a22 22 0 1 0 24 28Z" fill="#F2B84B" /><circle cx="44" cy="17" r="3" fill="#F2B84B" /><circle cx="51" cy="27" r="2" fill="#F2B84B" /></>,
  sun: <><circle cx="32" cy="32" r="11" fill="#F2B84B" /><path d="M32 7v8m0 34v8M7 32h8m34 0h8M14.3 14.3l5.7 5.7m24 24 5.7 5.7m0-35.4L44 20m-24 24-5.7 5.7" stroke="#F2B84B" strokeWidth="4" strokeLinecap="round" /></>,
}

const IRAN_TIME_ZONE = 'Asia/Tehran'
const DEMO_SUBSCRIPTION_EXPIRY = new Date(Date.UTC(2026, 11, 3, 12))
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: IRAN_TIME_ZONE,
}

type CalendarSystem = 'persian' | 'islamic-umalqura' | 'gregory'

const invoiceCalendars: { id: CalendarSystem; label: string }[] = [
  { id: 'persian', label: 'شمسی' },
  { id: 'islamic-umalqura', label: 'قمری' },
  { id: 'gregory', label: 'میلادی' },
]

function getIranDateValue(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA-u-ca-gregory-nu-latn', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: IRAN_TIME_ZONE,
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? ''

  return `${part('year')}-${part('month')}-${part('day')}`
}

function formatCalendarDate(date: Date, calendar: string, withWeekday = false) {
  if (Number.isNaN(date.getTime())) return ''

  const parts = new Intl.DateTimeFormat(`fa-IR-u-ca-${calendar}-nu-arabext`, {
    ...DATE_FORMAT_OPTIONS,
    timeZone: 'UTC',
    ...(withWeekday ? { weekday: 'long' as const } : {}),
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value

  return [
    part('weekday'),
    part('day'),
    part('month'),
    part('year'),
  ].filter(Boolean).join(' ')
}

function getCalendarParts(date: Date, calendar: CalendarSystem) {
  const parts = new Intl.DateTimeFormat(`en-US-u-ca-${calendar}-nu-latn`, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((item) => item.type === type)?.value)

  return { year: part('year'), month: part('month'), day: part('day') }
}

function normalizeUtcDate(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12))
}

function shiftUtcDate(date: Date, days: number) {
  const shifted = normalizeUtcDate(date)
  shifted.setUTCDate(shifted.getUTCDate() + days)
  return shifted
}

function calendarMonthKey(date: Date, calendar: CalendarSystem) {
  const { year, month } = getCalendarParts(date, calendar)
  return `${year}-${month}`
}

function getCalendarMonthDates(anchor: Date, calendar: CalendarSystem) {
  const monthKey = calendarMonthKey(anchor, calendar)
  let firstDate = normalizeUtcDate(anchor)

  for (let offset = 0; offset < 35; offset += 1) {
    const previousDate = shiftUtcDate(firstDate, -1)
    if (calendarMonthKey(previousDate, calendar) !== monthKey) break
    firstDate = previousDate
  }

  const dates: Date[] = []
  for (let offset = 0; offset < 35; offset += 1) {
    const date = shiftUtcDate(firstDate, offset)
    if (calendarMonthKey(date, calendar) !== monthKey) break
    dates.push(date)
  }

  return dates
}

function getAdjacentCalendarMonthDate(anchor: Date, calendar: CalendarSystem, direction: -1 | 1) {
  const monthKey = calendarMonthKey(anchor, calendar)
  let date = normalizeUtcDate(anchor)

  for (let offset = 0; offset < 35; offset += 1) {
    date = shiftUtcDate(date, direction)
    if (calendarMonthKey(date, calendar) !== monthKey) return date
  }

  return normalizeUtcDate(anchor)
}

function getIranTime(date: Date) {
  return new Intl.DateTimeFormat('fa-IR-u-nu-arabext', {
    timeZone: IRAN_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(date)
}

function getIranClockParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB-u-nu-latn', {
    timeZone: IRAN_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((item) => item.type === type)?.value)

  return { hours: part('hour'), minutes: part('minute') }
}

function formatClockNumber(value: number) {
  return new Intl.NumberFormat('fa-IR-u-nu-arabext', { useGrouping: false }).format(value)
}

function parseClockNumber(value: string) {
  const normalized = value.replace(/[۰-۹]/g, (digit) =>
    String(digit.charCodeAt(0) - 0x06f0),
  ).replace(/[٠-٩]/g, (digit) =>
    String(digit.charCodeAt(0) - 0x0660),
  )
  const parsed = Number(normalized)
  return Number.isInteger(parsed) ? parsed : null
}

function getClockMinuteFromPoint(x: number, y: number, width: number, height: number) {
  const angle = (Math.atan2(y - height / 2, x - width / 2) * 180 / Math.PI + 450) % 360
  return Math.round(angle / 6) % 60
}

function Icon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  return (
    <svg
      className={`icon-art ${className ?? ''}`}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {icons[name]}
    </svg>
  )
}

function PeopleToolbarIcon({ name }: { name: 'sort' | 'reports' | 'chart' }) {
  if (name === 'sort') {
    return (
      <svg className="people-toolbar-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6h9M4 12h6M4 18h3M18 4v16m0-16-3 3m3-3 3 3m-6 10 3 3 3-3" />
      </svg>
    )
  }

  if (name === 'chart') {
    return (
      <svg className="people-toolbar-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 20V5m0 15h17" />
        <path d="M7 16h3v-4H7zm6 0h3V8h-3zm6 0h3V5h-3z" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  return (
    <svg className="people-toolbar-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20V5m0 15h17M8 16v-4m5 4V8m5 8v-7" />
    </svg>
  )
}

const quickLinks = [
  { icon: 'bell', label: 'پیش‌سفارش', tone: 'green' },
  { icon: 'note', label: 'یادداشت', tone: 'cyan' },
  { icon: 'settings', label: 'تنظیمات', tone: 'violet' },
  { icon: 'shop', label: 'فروشگاه', tone: 'amber' },
  { icon: 'support', label: 'پشتیبانی', tone: 'blue' },
]

const settingsSections = [
  { icon: 'shop', label: 'مشخصات فروشگاه', description: 'اطلاعات و مشخصات فروشگاه', tone: 'amber' },
  { icon: 'people', label: 'کاربران', description: 'مدیریت کاربران و دسترسی‌ها', tone: 'green' },
  { icon: 'settings', label: 'امنیت', description: 'تنظیمات امنیت و ورود', tone: 'violet' },
  { icon: 'refresh', label: 'پشتیبانگیری', description: 'مدیریت نسخه‌های پشتیبان', tone: 'cyan' },
  { icon: 'cart', label: 'تنظیمات فاکتور', description: 'شخصی‌سازی ثبت و نمایش فاکتور', tone: 'blue' },
  { icon: 'note', label: 'معرفی به دوستان', description: 'دعوت از دوستان برای آشنایی با ترازینو', tone: 'pink' },
  { icon: 'sun', label: 'انتخاب تم', description: 'انتخاب رنگ‌بندی برنامه', tone: 'slate' },
]

const invoiceSettingsSections = [
  { icon: 'settings', label: 'تنظیمات', description: 'تنظیمات ثبت و محاسبهٔ فاکتور', tone: 'blue' },
  { icon: 'note', label: 'طرح فاکتور', description: 'انتخاب چیدمان و ظاهر فاکتور', tone: 'cyan' },
  { icon: 'sun', label: 'رنگ فاکتور', description: 'شخصی‌سازی رنگ‌های فاکتور', tone: 'amber' },
  { icon: 'check', label: 'مهر، امضاء', description: 'افزودن مهر و امضای فروشگاه', tone: 'violet' },
  { icon: 'shop', label: 'لوگو فروشگاه', description: 'نمایش لوگو روی فاکتورها', tone: 'green' },
]

const appColorThemes = [
  {
    id: 'gerdoo',
    name: 'گردویی',
    description: 'سبز طبیعی و آرام',
    accent: '#168b7e',
    deep: '#115f58',
    soft: '#e5f4ed',
    wash: '#f2f8f4',
    ink: '#285148',
  },
  {
    id: 'ocean',
    name: 'اقیانوسی',
    description: 'آبی خنک و مطمئن',
    accent: '#347db5',
    deep: '#24567f',
    soft: '#e3f0fa',
    wash: '#f2f7fc',
    ink: '#294e6b',
  },
  {
    id: 'lavender',
    name: 'یاسی',
    description: 'بنفش لطیف و مدرن',
    accent: '#8062bd',
    deep: '#5d438e',
    soft: '#eee8fa',
    wash: '#f7f4fc',
    ink: '#51416f',
  },
  {
    id: 'sunset',
    name: 'کهربایی',
    description: 'گرم و پرانرژی',
    accent: '#cb7b32',
    deep: '#99541f',
    soft: '#fff0dc',
    wash: '#fcf7ef',
    ink: '#72502f',
  },
  {
    id: 'rose',
    name: 'رز',
    description: 'صورتی ملایم و دلنشین',
    accent: '#c45e79',
    deep: '#914357',
    soft: '#f9e8ed',
    wash: '#fcf4f6',
    ink: '#704653',
  },
  {
    id: 'material-blue',
    name: 'آبی متریال',
    description: 'آبی شفاف با الهام از گوگل متریال',
    accent: '#1a73e8',
    deep: '#1558b0',
    soft: '#e8f0fe',
    wash: '#f1f5fe',
    ink: '#24466f',
  },
  {
    id: 'material-indigo',
    name: 'نیلی متریال',
    description: 'نیلی عمیق و متعادل',
    accent: '#3f51b5',
    deep: '#303f9f',
    soft: '#e8eaf6',
    wash: '#f1f2fa',
    ink: '#3d4678',
  },
  {
    id: 'material-cyan',
    name: 'فیروزه‌ای متریال',
    description: 'فیروزه‌ای روشن و امروزی',
    accent: '#0097a7',
    deep: '#006978',
    soft: '#e0f7fa',
    wash: '#ecfbfc',
    ink: '#28545a',
  },
  {
    id: 'apple-graphite',
    name: 'گرافیتی اپل',
    description: 'خاکستری مینیمال و خنثی',
    accent: '#636366',
    deep: '#48484a',
    soft: '#ebebf0',
    wash: '#f5f5f7',
    ink: '#45454a',
  },
  {
    id: 'apple-green',
    name: 'سبز اپل',
    description: 'سبز زنده با الهام از رابط اپل',
    accent: '#34c759',
    deep: '#208a3e',
    soft: '#e4f8e9',
    wash: '#f0fbf2',
    ink: '#315a3a',
  },
  {
    id: 'coral',
    name: 'مرجانی',
    description: 'مرجانی گرم و پرنشاط',
    accent: '#e76f51',
    deep: '#b94a36',
    soft: '#fde9e3',
    wash: '#fff5f1',
    ink: '#75483d',
  },
  {
    id: 'emerald',
    name: 'زمردی',
    description: 'سبز زمردی عمیق و آرام',
    accent: '#16804a',
    deep: '#0d6036',
    soft: '#e5f4e9',
    wash: '#f2f8f3',
    ink: '#28513a',
  },
] as const
type AppColorTheme = (typeof appColorThemes)[number]['id']
const COLOR_THEME_STORAGE_KEY = 'gerdoo-color-theme-v1'

const securityLoginMethodOptions: Array<{
  id: SecurityLoginMethod
  title: string
  description: string
  icon: string
}> = [
  { id: 'pin', title: 'پین', description: 'ورود با کد عددی', icon: 'keypad' },
  { id: 'pattern', title: 'الگو', description: 'ورود با رسم الگو', icon: 'pattern' },
  { id: 'password', title: 'رمز عبور', description: 'ورود با رمز دلخواه', icon: 'lock' },
]

type Store = {
  id: number
  name: string
  address: string
  phone: string
  code: string
  currency: string
}

type StoreFields = Omit<Store, 'id'>
type StoredStoreState = {
  stores: Store[]
  activeStoreId: number | null
  error: string
}

const emptyStoreFields: StoreFields = {
  name: '',
  address: '',
  phone: '',
  code: '',
  currency: 'ریال',
}

const STORE_STORAGE_KEY = 'trazino-store-workspace-v1'

function isStore(value: unknown): value is Store {
  if (!value || typeof value !== 'object') return false
  const store = value as Record<string, unknown>
  return Number.isSafeInteger(store.id)
    && typeof store.name === 'string'
    && typeof store.address === 'string'
    && typeof store.phone === 'string'
    && typeof store.code === 'string'
    && typeof store.currency === 'string'
}

function readStoredStoreState(): StoredStoreState {
  try {
    const raw = localStorage.getItem(STORE_STORAGE_KEY)
    if (!raw) return { stores: [], activeStoreId: null, error: '' }

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid store state')
    const saved = parsed as Record<string, unknown>
    if (
      saved.format !== 'trazino-store-workspace'
      || saved.version !== 1
      || !Array.isArray(saved.stores)
      || !saved.stores.every(isStore)
      || !(saved.activeStoreId === null || Number.isSafeInteger(saved.activeStoreId))
    ) {
      throw new Error('Invalid store state')
    }

    const stores = saved.stores
    const savedActiveId = saved.activeStoreId as number | null
    const activeStoreId = stores.some((store) => store.id === savedActiveId)
      ? savedActiveId
      : stores[0]?.id ?? null
    return { stores, activeStoreId, error: '' }
  } catch {
    return {
      stores: [],
      activeStoreId: null,
      error: 'اطلاعات فروشگاه‌ها قابل خواندن نیست؛ برای جلوگیری از پاک‌شدن داده‌ها، ذخیرهٔ خودکار متوقف شد.',
    }
  }
}

const entries = [
  { icon: 'cart', label: 'فاکتور فروش', hint: 'ثبت فروش کالا و خدمات' },
  { icon: 'box', label: 'فاکتور خرید', hint: 'ثبت خریدهای کسب‌وکار' },
  { icon: 'returnSale', label: 'برگشت از فروش', hint: 'ثبت کالای مرجوعی مشتری' },
  { icon: 'returnPurchase', label: 'برگشت به خرید', hint: 'ثبت مرجوعی به فروشنده' },
  { icon: 'receive', label: 'دریافت', hint: 'ثبت وجه دریافتی' },
  { icon: 'pay', label: 'پرداخت', hint: 'ثبت وجه پرداختی' },
  { icon: 'expense', label: 'هزینه', hint: 'ثبت هزینه‌های جاری' },
  { icon: 'income', label: 'درآمد', hint: 'ثبت درآمدهای متفرقه' },
  { icon: 'check', label: 'دریافت چک', hint: 'ثبت چک دریافتی' },
  { icon: 'pen', label: 'پرداخت چک', hint: 'ثبت چک پرداختی' },
  { icon: 'refresh', label: 'خرج چک', hint: 'ثبت واگذاری یا خرج چک' },
  { icon: 'tool', label: 'ابزار', hint: 'سایر عملیات مالی' },
]

const documents = [
  { icon: 'cart', label: 'فاکتورهای فروش' },
  { icon: 'box', label: 'فاکتورهای خرید' },
  { icon: 'returnSale', label: 'برگشت از فروش' },
  { icon: 'returnPurchase', label: 'برگشت به خرید' },
  { icon: 'receive', label: 'دریافت‌ها' },
  { icon: 'pay', label: 'پرداخت‌ها' },
  { icon: 'check', label: 'چک‌های دریافتی' },
  { icon: 'pen', label: 'چک‌های پرداختی' },
  { icon: 'expense', label: 'هزینه‌ها' },
  { icon: 'income', label: 'درآمدها' },
  { icon: 'cart', label: 'پیش‌فاکتور' },
]

const reports = [
  { icon: 'chart', label: 'گزارش روزانه' },
  { icon: 'chart', label: 'ریز گزارش روزانه' },
  { icon: 'chart', label: 'گزارش دوره‌ای' },
  { icon: 'chart', label: 'گزارش دارایی‌ها' },
  { icon: 'chart', label: 'محاسبه سود فاکتور' },
  { icon: 'chart', label: 'مجموع سود فاکتورها' },
  { icon: 'chart', label: 'سود و زیان' },
]

const navigation = [
  { icon: 'home', label: 'خانه' },
  { icon: 'people', label: 'اشخاص' },
  { icon: 'inventory', label: 'کالا و انبار' },
  { icon: 'chart', label: 'گزارش‌ها' },
  { icon: 'accounts', label: 'حساب‌ها' },
]

const peopleFilters = ['همه']
const peopleSortOptions = [
  { value: 'highestCredit', label: 'بیشترین بستانکاری', direction: 'desc' },
  { value: 'highestDebit', label: 'بیشترین بدهکاری', direction: 'desc' },
  { value: 'code', label: 'کد اشخاص', direction: 'asc' },
  { value: 'createdAt', label: 'تاریخ ایجاد', direction: 'desc' },
  { value: 'activity', label: 'فعالیت طرف حساب', direction: 'desc' },
  { value: 'name', label: 'نام طرف حساب', direction: 'asc' },
] as const
type PeopleSortBy = (typeof peopleSortOptions)[number]['value']
const allAccountReportGroups = 'همه گروه‌ها'
const PEOPLE_GROUPS_STORAGE_KEY = 'trazino-people-groups-v1'
const PEOPLE_STORAGE_KEY = 'trazino-people-list-v1'

type PersonRecord = {
  id: string
  code: string
  name: string
  group?: string
  role: string
  phone: string
  address: string
  accountNumber: string
  accountStatus: 'بدهکاران' | 'بستانکاران' | 'تسویه شده'
  balance: number
  tone: string
  createdAt?: string
  transactionCount?: number
}

type AccountKind = 'صندوق' | 'بانکی'

type AccountRecord = {
  id: string
  kind: AccountKind
  name: string
  bankName: string
  accountNumber: string
  iban?: string
  ownerName?: string
  cardNumber?: string
  smsNumber?: string
  balance: number
  createdAt: string
}

type AccountFormFields = {
  kind: AccountKind
  name: string
  bankName: string
  accountNumber: string
  iban: string
  cardNumberParts: [string, string, string, string]
  balance: string
  smsNumber: string
}

type AccountTransfer = {
  id: string
  sourceAccountId: string
  destinationAccountId: string
  amount: number
  date: string
  time: string
  calendar?: CalendarSystem
  note: string
  attachment?: AccountTransferAttachment
  createdAt: string
}

type AccountTransferAttachment = {
  name: string
  type: string
  dataUrl: string
}

type AccountTransferFormFields = {
  amount: string
  sourceAccountId: string
  destinationAccountId: string
  date: string
  time: string
  calendar: CalendarSystem
  note: string
  attachment: AccountTransferAttachment | null
}

type BankOption = {
  name: string
  logoFile: string
  cardPrefixes: string[]
}

const bankOptions: BankOption[] = [
  { name: 'بانک صادرات ایران', logoFile: 'Saderat.svg', cardPrefixes: ['603769', '903769'] },
  { name: 'بانک ملت', logoFile: 'Mellat.svg', cardPrefixes: ['610433', '991975'] },
  { name: 'بانک تجارت', logoFile: 'Tejarat.svg', cardPrefixes: ['627353', '585983'] },
  { name: 'بانک ملی ایران', logoFile: 'Melli.svg', cardPrefixes: ['603799'] },
  { name: 'بانک سپه', logoFile: 'Sepah.svg', cardPrefixes: ['589210'] },
  { name: 'بانک کشاورزی', logoFile: 'Keshavarzi.svg', cardPrefixes: ['603770', '639217'] },
  { name: 'بانک پارسیان', logoFile: 'Parsian.svg', cardPrefixes: ['622106', '639194', '627884'] },
  { name: 'بانک مسکن', logoFile: 'Maskan.svg', cardPrefixes: ['628023'] },
  { name: 'بانک رفاه کارگران', logoFile: 'Refah.svg', cardPrefixes: ['589463'] },
  { name: 'بانک اقتصاد نوین', logoFile: 'Eghtesad_Novin.svg', cardPrefixes: ['627412'] },
  { name: 'بانک پاسارگاد', logoFile: 'Pasargad.svg', cardPrefixes: ['502229', '639347'] },
  { name: 'بانک سامان', logoFile: 'Saman.svg', cardPrefixes: ['621986'] },
  { name: 'بانک سینا', logoFile: 'Sina.svg', cardPrefixes: ['639346'] },
  { name: 'پست بانک ایران', logoFile: 'Postbank.svg', cardPrefixes: ['627760'] },
  { name: 'بانک قرض‌الحسنه مهر ایران', logoFile: 'Mehr_Iran.svg', cardPrefixes: ['606373'] },
  { name: 'بانک توسعه تعاون', logoFile: 'Tosee_Taavon.svg', cardPrefixes: ['502908'] },
  { name: 'بانک شهر', logoFile: 'Shahr.svg', cardPrefixes: ['502806', '504706'] },
  { name: 'بانک سرمایه', logoFile: 'Sarmayeh.svg', cardPrefixes: ['639607'] },
  { name: 'بانک دی', logoFile: 'Dey.svg', cardPrefixes: ['502938'] },
  { name: 'بانک حکمت ایرانیان', logoFile: 'Hekmat.svg', cardPrefixes: ['636949'] },
  { name: 'بانک ایران زمین', logoFile: 'Iran_Zamin.svg', cardPrefixes: ['505785'] },
  { name: 'بانک کارآفرین', logoFile: 'Karafarin.svg', cardPrefixes: ['627488', '502910'] },
  { name: 'بانک گردشگری', logoFile: 'Gardeshgari.svg', cardPrefixes: ['505416'] },
  { name: 'بانک صنعت و معدن', logoFile: 'Sanat_Madan.svg', cardPrefixes: ['627961'] },
  { name: 'بانک توسعه صادرات ایران', logoFile: 'Tosee_Saderat.svg', cardPrefixes: ['627648', '207177'] },
  { name: 'بانک خاورمیانه', logoFile: 'Khavar_Mianeh.svg', cardPrefixes: [] },
  { name: 'بانک قرض‌الحسنه رسالت', logoFile: 'Resalat.svg', cardPrefixes: ['504172'] },
  { name: 'بانک مشترک ایران و ونزوئلا', logoFile: 'Iran_Venezuela.svg', cardPrefixes: [] },
  { name: 'مؤسسه اعتباری ملل', logoFile: 'Melall.svg', cardPrefixes: ['606256'] },
]

function getAccountCardDetectedBank(cardNumber: string) {
  if (cardNumber.length < 6) return undefined

  return [
    ...bankOptions.flatMap((bank) => bank.cardPrefixes.map((prefix) => ({ name: bank.name, prefix }))),
    { name: 'بلو بانک', prefix: '62198618' },
    { name: 'بلو بانک', prefix: '62198619' },
  ]
    .filter(({ prefix }) => cardNumber.startsWith(prefix))
    .sort((first, second) => second.prefix.length - first.prefix.length)[0]?.name
}

function getAccountCardAutoSelectedBank(currentBankName: string, cardNumber: string) {
  const detectedBank = getAccountCardDetectedBank(cardNumber)
  return bankOptions.find((bank) => bank.name === detectedBank)?.name ?? currentBankName
}

function getAccountCardBankMismatch(bankName: string, cardNumber: string) {
  if (cardNumber.length < 6) return ''

  const selectedBank = bankOptions.find((bank) => bank.name === bankName)
  const detectedBank = getAccountCardDetectedBank(cardNumber)

  if (detectedBank && detectedBank !== bankName) {
    return `این شماره کارت متعلق به ${detectedBank} است، نه ${bankName}.`
  }
  if (selectedBank?.cardPrefixes.length && !selectedBank.cardPrefixes.some((prefix) => cardNumber.startsWith(prefix))) {
    return `پیش‌شمارهٔ این کارت با ${bankName} همخوانی ندارد.`
  }
  return ''
}

type StoredAccounts = {
  accounts: AccountRecord[]
  error: string
}

const ACCOUNTS_STORAGE_KEY = 'trazino-accounts-v1'
const ACCOUNT_TRANSFERS_STORAGE_KEY = 'trazino-account-transfers-v1'
const emptyAccountForm: AccountFormFields = {
  kind: 'صندوق',
  name: '',
  bankName: '',
  accountNumber: '',
  iban: '',
  cardNumberParts: ['', '', '', ''],
  balance: '0',
  smsNumber: '',
}

function emptyAccountTransferForm(accounts: AccountRecord[] = []) {
  const now = new Date()
  const time = getIranClockParts(now)
  return {
    amount: '',
    sourceAccountId: accounts[0]?.id ?? '',
    destinationAccountId: accounts[1]?.id ?? '',
    date: getIranDateValue(now),
    time: `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`,
    calendar: 'persian',
    note: '',
    attachment: null,
  } satisfies AccountTransferFormFields
}

type SalesInvoiceLine = {
  id: string
  itemId: string
  warehouse?: string
  quantity: number
  discount: number
  unitPrice?: number
  description?: string
}

type SavedSalesInvoiceLine = {
  itemId: string
  warehouse?: string
  description: string
  kind: InventoryKind
  unit: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

type SavedSalesInvoiceReceipt = {
  id: string
  accountId: string
  personId: string | null
  amount: number
  date: string
  calendar: CalendarSystem
  time: { hours: number; minutes: number }
  note: string
  createdAt: string
  attachment?: { name: string; type: string; dataUrl: string }
}

type SalesInvoiceAdjustmentKind = 'addition' | 'deduction'

type SalesInvoiceAdjustment = {
  id: string
  kind: SalesInvoiceAdjustmentKind
  description: string
  mode: 'percent' | 'amount'
  value: number
  affectsProfit: boolean
}

type SalesInvoiceSettings = {
  prefixCategoryName: boolean
  enableItemDiscount: boolean
  enableItemDescription: boolean
  showPurchasePrice: boolean
  updateInventoryPrice: boolean
  autoSalesPricePercent: boolean
  salePriceMarkupPercent: number
}

type SavedSalesInvoice = {
  id: string
  number: string
  date: string
  calendar: CalendarSystem
  time: { hours: number; minutes: number }
  personId: string | null
  buyerName: string
  lines: SavedSalesInvoiceLine[]
  adjustments: SalesInvoiceAdjustment[]
  subtotal: number
  total: number
  note: string
  attachment?: { name: string; type: string; dataUrl: string }
  receipts?: SavedSalesInvoiceReceipt[]
  createdAt: string
}

const SALES_INVOICE_SETTINGS_STORAGE_KEY = 'trazino-sales-invoice-settings-v1'
const SALES_INVOICES_STORAGE_KEY = 'trazino-sales-invoices-v1'
const PURCHASE_INVOICES_STORAGE_KEY = 'trazino-purchase-invoices-v1'
const RETURN_SALES_INVOICES_STORAGE_KEY = 'trazino-return-sales-invoices-v1'
const RETURN_PURCHASE_INVOICES_STORAGE_KEY = 'trazino-return-purchase-invoices-v1'
const MONEY_DOCUMENTS_STORAGE_KEY = 'trazino-money-documents-v1'
const RECEIVED_CHECKS_STORAGE_KEY = 'trazino-received-checks-v1'
const PAID_CHECKS_STORAGE_KEY = 'trazino-paid-checks-v1'
const defaultSalesInvoiceSettings: SalesInvoiceSettings = {
  prefixCategoryName: false,
  enableItemDiscount: true,
  enableItemDescription: true,
  showPurchasePrice: true,
  updateInventoryPrice: true,
  autoSalesPricePercent: false,
  salePriceMarkupPercent: 20,
}

type StoredSalesInvoices = {
  invoices: SavedSalesInvoice[]
  error: string
}

type StoredPurchaseInvoices = {
  invoices: SavedSalesInvoice[]
  error: string
}

type StoredReturnInvoices = {
  invoices: SavedSalesInvoice[]
  error: string
}

type ReturnInvoiceKind = 'sales' | 'purchase'

type ReturnInvoiceDetail = {
  kind: ReturnInvoiceKind
  invoice: SavedSalesInvoice
}

function getInventoryItemActivity(
  item: InventoryRecord,
  salesInvoices: SavedSalesInvoice[],
  purchaseInvoices: SavedSalesInvoice[],
  returnSalesInvoices: SavedSalesInvoice[],
  returnPurchaseInvoices: SavedSalesInvoice[],
): InventoryDetailMovement[] {
  const activity: InventoryDetailMovement[] = []
  for (const invoice of purchaseInvoices) {
    for (const [index, line] of invoice.lines.entries()) {
      if (line.itemId !== item.id) continue
      activity.push({
        id: `${invoice.id}-${line.itemId}-${index}-purchase`,
        source: 'invoice',
        direction: item.kind === 'خدمات' ? 'info' : 'in',
        label: item.kind === 'خدمات' ? 'ثبت خدمات در فاکتور خرید' : 'ورود از خرید',
        date: invoice.date,
        calendar: invoice.calendar,
        createdAt: invoice.createdAt,
        number: invoice.number,
        party: invoice.buyerName,
        quantity: line.quantity,
        unit: line.unit,
        unitPrice: line.unitPrice,
        total: line.total,
        warehouse: line.warehouse ?? item.warehouse,
      })
    }
  }
  for (const invoice of salesInvoices) {
    for (const [index, line] of invoice.lines.entries()) {
      if (line.itemId !== item.id) continue
      activity.push({
        id: `${invoice.id}-${line.itemId}-${index}-sale`,
        source: 'invoice',
        direction: item.kind === 'خدمات' ? 'info' : 'out',
        label: item.kind === 'خدمات' ? 'ارائهٔ خدمات در فاکتور فروش' : 'خروج از فروش',
        date: invoice.date,
        calendar: invoice.calendar,
        createdAt: invoice.createdAt,
        number: invoice.number,
        party: invoice.buyerName,
        quantity: line.quantity,
        unit: line.unit,
        unitPrice: line.unitPrice,
        total: line.total,
        warehouse: line.warehouse ?? item.warehouse,
      })
    }
  }
  for (const [invoices, kind] of [
    [returnSalesInvoices, 'sales-return'],
    [returnPurchaseInvoices, 'purchase-return'],
  ] as const) {
    for (const invoice of invoices) {
      for (const [index, line] of invoice.lines.entries()) {
        if (line.itemId !== item.id) continue
        const isSalesReturn = kind === 'sales-return'
        activity.push({
          id: `${invoice.id}-${line.itemId}-${index}-${kind}`,
          source: 'invoice',
          direction: item.kind === 'خدمات' ? 'info' : isSalesReturn ? 'in' : 'out',
          label: item.kind === 'خدمات'
            ? `ثبت خدمات در ${isSalesReturn ? 'برگشت از فروش' : 'برگشت به خرید'}`
            : isSalesReturn ? 'ورود از برگشت فروش' : 'خروج از برگشت خرید',
          date: invoice.date,
          calendar: invoice.calendar,
          createdAt: invoice.createdAt,
          number: invoice.number,
          party: invoice.buyerName,
          quantity: line.quantity,
          unit: line.unit,
          unitPrice: line.unitPrice,
          total: line.total,
          warehouse: line.warehouse ?? item.warehouse,
        })
      }
    }
  }
  for (const movement of item.stockMovements ?? []) {
    const isIn = movement.kind === 'opening'
      || movement.kind === 'count-in'
      || movement.kind === 'transfer-in'
    activity.push({
      id: movement.id,
      source: 'stock',
      direction: isIn ? 'in' : 'out',
      label: movement.kind === 'opening'
        ? 'موجودی اولیه'
        : movement.kind === 'count-in'
          ? 'افزایش بر اساس انبارگردانی'
          : movement.kind === 'count-out'
            ? 'کاهش بر اساس انبارگردانی'
            : movement.kind === 'transfer-in'
              ? `انتقال از ${movement.warehouse ?? 'انبار دیگر'}`
              : `انتقال به ${movement.warehouse ?? 'انبار دیگر'}`,
      date: movement.createdAt.slice(0, 10),
      calendar: 'persian',
      createdAt: movement.createdAt,
      quantity: movement.quantity,
      unit: item.unit,
      warehouse: item.warehouse,
    })
  }
  return activity.sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
}

type MoneyDocumentKind = 'دریافت' | 'پرداخت' | 'هزینه' | 'درآمد'
type MoneyDocumentFormKind = MoneyDocumentKind | 'دریافت چک' | 'پرداخت چک' | 'خرج چک'
type MoneyDocument = {
  id: string
  number: string
  kind: MoneyDocumentKind
  personId: string | null
  personName: string
  accountId: string
  amount: number
  description: string
  date: string
  calendar: CalendarSystem
  time: string
  note: string
  attachment?: { name: string; type: string; dataUrl: string }
  createdAt: string
}

type StoredMoneyDocuments = {
  documents: MoneyDocument[]
  error: string
}

type CheckRecord = {
  id: string
  number: string
  personId: string
  personName: string
  sayadiId: string
  leafNumber: string
  serial: string
  nationalId: string
  dueDate: string
  amount: number
  bankName: string
  date: string
  calendar: CalendarSystem
  time: string
  note: string
  attachment?: { name: string; type: string; dataUrl: string }
  createdAt: string
  transfer?: {
    personId: string
    personName: string
    date: string
    calendar: CalendarSystem
    time: string
    note: string
    createdAt: string
  }
  clearedAt?: string
}

type StoredReceivedChecks = {
  checks: CheckRecord[]
  error: string
}

type StoredPaidChecks = {
  checks: CheckRecord[]
  error: string
}

type SalesInvoiceListFilter = 'all' | 'current' | 'closed'
type CheckListFilter = 'all' | 'uncleared' | 'overdue' | 'cleared'
type CheckListKind = 'received' | 'paid'
type CheckDetail = { kind: CheckListKind; checkId: string }

function isSalesInvoiceTime(value: unknown): value is { hours: number; minutes: number } {
  if (!value || typeof value !== 'object') return false
  const time = value as Record<string, unknown>
  const hours = time.hours
  const minutes = time.minutes
  return typeof hours === 'number'
    && Number.isInteger(hours)
    && hours >= 0
    && hours <= 23
    && typeof minutes === 'number'
    && Number.isInteger(minutes)
    && minutes >= 0
    && minutes <= 59
}

function isImageDataAttachment(value: unknown): value is { name: string; type: string; dataUrl: string } {
  if (!value || typeof value !== 'object') return false
  const attachment = value as Record<string, unknown>
  const name = attachment.name
  const type = attachment.type
  const dataUrl = attachment.dataUrl
  return typeof name === 'string'
    && typeof type === 'string'
    && type.startsWith('image/')
    && typeof dataUrl === 'string'
    && dataUrl.startsWith('data:image/')
}

function isSavedSalesInvoiceReceipt(value: unknown): value is SavedSalesInvoiceReceipt {
  if (!value || typeof value !== 'object') return false
  const receipt = value as Record<string, unknown>
  const attachment = receipt.attachment
  return typeof receipt.id === 'string'
    && typeof receipt.accountId === 'string'
    && (receipt.personId === null || typeof receipt.personId === 'string')
    && typeof receipt.amount === 'number'
    && Number.isSafeInteger(receipt.amount)
    && receipt.amount > 0
    && typeof receipt.date === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(receipt.date)
    && (receipt.calendar === 'persian'
      || receipt.calendar === 'islamic-umalqura'
      || receipt.calendar === 'gregory')
    && isSalesInvoiceTime(receipt.time)
    && typeof receipt.note === 'string'
    && typeof receipt.createdAt === 'string'
    && Number.isFinite(Date.parse(receipt.createdAt))
    && (attachment === undefined || isImageDataAttachment(attachment))
}

function isSavedSalesInvoice(value: unknown): value is SavedSalesInvoice {
  if (!value || typeof value !== 'object') return false
  const invoice = value as Record<string, unknown>
  const attachment = invoice.attachment
  return typeof invoice.id === 'string'
    && typeof invoice.number === 'string'
    && typeof invoice.date === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(invoice.date)
    && (invoice.calendar === 'persian'
      || invoice.calendar === 'islamic-umalqura'
      || invoice.calendar === 'gregory')
    && isSalesInvoiceTime(invoice.time)
    && (invoice.personId === null || typeof invoice.personId === 'string')
    && typeof invoice.buyerName === 'string'
    && Array.isArray(invoice.lines)
    && invoice.lines.length > 0
    && invoice.lines.every((line) => {
      if (!line || typeof line !== 'object') return false
      const record = line as Record<string, unknown>
      return typeof record.itemId === 'string'
        && (record.warehouse === undefined || typeof record.warehouse === 'string')
        && typeof record.description === 'string'
        && isInventoryKind(String(record.kind))
        && typeof record.unit === 'string'
        && typeof record.quantity === 'number'
        && Number.isFinite(record.quantity)
        && record.quantity > 0
        && typeof record.unitPrice === 'number'
        && Number.isFinite(record.unitPrice)
        && typeof record.discount === 'number'
        && Number.isFinite(record.discount)
        && typeof record.total === 'number'
        && Number.isFinite(record.total)
    })
    && Array.isArray(invoice.adjustments)
    && invoice.adjustments.every((adjustment) => (
      Boolean(adjustment)
      && typeof adjustment === 'object'
      && typeof (adjustment as Record<string, unknown>).id === 'string'
      && ((adjustment as Record<string, unknown>).kind === 'addition'
        || (adjustment as Record<string, unknown>).kind === 'deduction')
      && typeof (adjustment as Record<string, unknown>).description === 'string'
      && ((adjustment as Record<string, unknown>).mode === 'percent'
        || (adjustment as Record<string, unknown>).mode === 'amount')
      && typeof (adjustment as Record<string, unknown>).value === 'number'
      && Number.isFinite((adjustment as Record<string, unknown>).value)
      && typeof (adjustment as Record<string, unknown>).affectsProfit === 'boolean'
    ))
    && typeof invoice.subtotal === 'number'
    && Number.isFinite(invoice.subtotal)
    && typeof invoice.total === 'number'
    && Number.isFinite(invoice.total)
    && typeof invoice.note === 'string'
    && (invoice.receipts === undefined
      || (Array.isArray(invoice.receipts) && invoice.receipts.every(isSavedSalesInvoiceReceipt)))
    && (attachment === undefined || isImageDataAttachment(attachment))
    && typeof invoice.createdAt === 'string'
    && Number.isFinite(Date.parse(invoice.createdAt))
}

function readStoredSalesInvoices(storeId: number | null = null): StoredSalesInvoices {
  try {
    const raw = readStoreData(SALES_INVOICES_STORAGE_KEY, storeId)
    if (!raw) return { invoices: [], error: '' }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isSavedSalesInvoice)) {
      throw new Error('Invalid sales invoices')
    }
    return { invoices: parsed, error: '' }
  } catch {
    return {
      invoices: [],
      error: 'فاکتورهای ذخیره‌شده قابل خواندن نیستند؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.',
    }
  }
}

function readStoredPurchaseInvoices(storeId: number | null = null): StoredPurchaseInvoices {
  try {
    const raw = readStoreData(PURCHASE_INVOICES_STORAGE_KEY, storeId)
    if (!raw) return { invoices: [], error: '' }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isSavedSalesInvoice)) {
      throw new Error('Invalid purchase invoices')
    }
    return { invoices: parsed, error: '' }
  } catch {
    return {
      invoices: [],
      error: 'فاکتورهای خرید ذخیره‌شده قابل خواندن نیستند؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.',
    }
  }
}

function readStoredReturnInvoices(
  key: typeof RETURN_SALES_INVOICES_STORAGE_KEY | typeof RETURN_PURCHASE_INVOICES_STORAGE_KEY,
  kind: ReturnInvoiceKind,
  storeId: number | null = null,
): StoredReturnInvoices {
  try {
    const raw = readStoreData(key, storeId)
    if (!raw) return { invoices: [], error: '' }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isSavedSalesInvoice)) {
      throw new Error(`Invalid ${kind} return invoices`)
    }
    return { invoices: parsed, error: '' }
  } catch {
    return {
      invoices: [],
      error: kind === 'sales'
        ? 'فاکتورهای برگشت از فروش قابل خواندن نیستند؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.'
        : 'فاکتورهای برگشت به خرید قابل خواندن نیستند؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.',
    }
  }
}

function isMoneyDocumentKind(value: unknown): value is MoneyDocumentKind {
  return value === 'دریافت' || value === 'پرداخت' || value === 'هزینه' || value === 'درآمد'
}

function isMoneyDocument(value: unknown): value is MoneyDocument {
  if (!value || typeof value !== 'object') return false
  const document = value as Record<string, unknown>
  return typeof document.id === 'string'
    && typeof document.number === 'string'
    && isMoneyDocumentKind(document.kind)
    && (document.personId === null || typeof document.personId === 'string')
    && typeof document.personName === 'string'
    && typeof document.accountId === 'string'
    && typeof document.amount === 'number'
    && Number.isSafeInteger(document.amount)
    && document.amount > 0
    && typeof document.description === 'string'
    && typeof document.date === 'string'
    && (document.calendar === 'persian' || document.calendar === 'islamic-umalqura' || document.calendar === 'gregory')
    && typeof document.time === 'string'
    && typeof document.note === 'string'
    && (document.attachment === undefined || isImageDataAttachment(document.attachment))
    && typeof document.createdAt === 'string'
    && Number.isFinite(Date.parse(document.createdAt))
}

function readStoredMoneyDocuments(storeId: number | null = null): StoredMoneyDocuments {
  try {
    const raw = readStoreData(MONEY_DOCUMENTS_STORAGE_KEY, storeId)
    if (!raw) return { documents: [], error: '' }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isMoneyDocument)) {
      throw new Error('Invalid money documents')
    }
    return { documents: parsed, error: '' }
  } catch {
    return {
      documents: [],
      error: 'سندهای دریافت و پرداخت ذخیره‌شده قابل خواندن نیستند؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.',
    }
  }
}

function isCheckRecord(value: unknown): value is CheckRecord {
  if (!value || typeof value !== 'object') return false
  const check = value as Record<string, unknown>
  const transfer = check.transfer as Record<string, unknown> | undefined
  return typeof check.id === 'string'
    && typeof check.number === 'string'
    && typeof check.personId === 'string'
    && typeof check.personName === 'string'
    && typeof check.sayadiId === 'string'
    && typeof check.leafNumber === 'string'
    && typeof check.serial === 'string'
    && typeof check.nationalId === 'string'
    && typeof check.dueDate === 'string'
    && typeof check.amount === 'number'
    && Number.isSafeInteger(check.amount)
    && check.amount > 0
    && typeof check.bankName === 'string'
    && typeof check.date === 'string'
    && (check.calendar === 'persian' || check.calendar === 'islamic-umalqura' || check.calendar === 'gregory')
    && typeof check.time === 'string'
    && typeof check.note === 'string'
    && (check.attachment === undefined || isImageDataAttachment(check.attachment))
    && (check.clearedAt === undefined
      || (typeof check.clearedAt === 'string' && Number.isFinite(Date.parse(check.clearedAt))))
    && (transfer === undefined || (
      transfer !== null
      && typeof transfer === 'object'
      && typeof transfer.personId === 'string'
      && typeof transfer.personName === 'string'
      && typeof transfer.date === 'string'
      && (transfer.calendar === 'persian' || transfer.calendar === 'islamic-umalqura' || transfer.calendar === 'gregory')
      && typeof transfer.time === 'string'
      && typeof transfer.note === 'string'
      && typeof transfer.createdAt === 'string'
      && Number.isFinite(Date.parse(transfer.createdAt))
    ))
    && typeof check.createdAt === 'string'
    && Number.isFinite(Date.parse(check.createdAt))
}

function readStoredReceivedChecks(storeId: number | null = null): StoredReceivedChecks {
  try {
    const raw = readStoreData(RECEIVED_CHECKS_STORAGE_KEY, storeId)
    if (!raw) return { checks: [], error: '' }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isCheckRecord)) {
      throw new Error('Invalid received checks')
    }
    return { checks: parsed, error: '' }
  } catch {
    return {
      checks: [],
      error: 'چک‌های دریافتی ذخیره‌شده قابل خواندن نیستند؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.',
    }
  }
}

function readStoredPaidChecks(storeId: number | null = null): StoredPaidChecks {
  try {
    const raw = readStoreData(PAID_CHECKS_STORAGE_KEY, storeId)
    if (!raw) return { checks: [], error: '' }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isCheckRecord)) {
      throw new Error('Invalid paid checks')
    }
    return { checks: parsed, error: '' }
  } catch {
    return {
      checks: [],
      error: 'چک‌های پرداختی ذخیره‌شده قابل خواندن نیستند؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.',
    }
  }
}

function readSalesInvoiceSettings(storeId: number | null = null): SalesInvoiceSettings {
  try {
    const raw = readStoreData(SALES_INVOICE_SETTINGS_STORAGE_KEY, storeId)
    if (!raw) return defaultSalesInvoiceSettings
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return defaultSalesInvoiceSettings
    const settings = parsed as Partial<SalesInvoiceSettings>
    return {
      prefixCategoryName: typeof settings.prefixCategoryName === 'boolean'
        ? settings.prefixCategoryName : defaultSalesInvoiceSettings.prefixCategoryName,
      enableItemDiscount: typeof settings.enableItemDiscount === 'boolean'
        ? settings.enableItemDiscount : defaultSalesInvoiceSettings.enableItemDiscount,
      enableItemDescription: typeof settings.enableItemDescription === 'boolean'
        ? settings.enableItemDescription : defaultSalesInvoiceSettings.enableItemDescription,
      showPurchasePrice: typeof settings.showPurchasePrice === 'boolean'
        ? settings.showPurchasePrice : defaultSalesInvoiceSettings.showPurchasePrice,
      updateInventoryPrice: typeof settings.updateInventoryPrice === 'boolean'
        ? settings.updateInventoryPrice : defaultSalesInvoiceSettings.updateInventoryPrice,
      autoSalesPricePercent: typeof settings.autoSalesPricePercent === 'boolean'
        ? settings.autoSalesPricePercent : defaultSalesInvoiceSettings.autoSalesPricePercent,
      salePriceMarkupPercent: typeof settings.salePriceMarkupPercent === 'number'
        && Number.isFinite(settings.salePriceMarkupPercent)
        && settings.salePriceMarkupPercent >= 0
        ? settings.salePriceMarkupPercent : defaultSalesInvoiceSettings.salePriceMarkupPercent,
    }
  } catch {
    return defaultSalesInvoiceSettings
  }
}

type InventoryKind = 'کالا' | 'خدمات' | 'تولید'
type InventoryShareSetting = {
  scope: 'all' | 'group'
  kind: InventoryKind
  group: string
  category: string
  categoryEnabled: boolean
  includeZeroStock: boolean
  includePrices: boolean
  includeStock: boolean
}

const inventoryKinds: InventoryKind[] = ['کالا', 'خدمات', 'تولید']

type InventoryRecord = {
  id: string
  catalogId?: string
  warehouse?: string
  stockMovements?: InventoryStockMovement[]
  code?: string
  name: string
  createdAt: string
  lastMovementAt: string
  group: string
  category: string
  kind: InventoryKind
  brand: string
  unit: string
  stock: number
  purchasePrice: number
  salePrice: number
  barcode?: string
  secondaryUnit?: string
  conversionRatio?: number
}

type InventoryStockMovement = {
  id: string
  kind: 'opening' | 'count-in' | 'count-out' | 'transfer-in' | 'transfer-out'
  quantity: number
  createdAt: string
  warehouse?: string
}

type InventoryDetailMovement = {
  id: string
  source: 'invoice' | 'stock'
  direction: 'in' | 'out' | 'info'
  label: string
  date: string
  calendar: CalendarSystem
  createdAt: string
  number?: string
  party?: string
  quantity: number
  unit: string
  unitPrice?: number
  total?: number
  warehouse?: string
}

type InventoryProductFormFields = {
  code: string
  name: string
  brand: string
  unit: string
  secondaryUnit: string
  conversionRatio: string
  barcode: string
  stock: string
  purchasePrice: string
  salePrice: string
}

type InventoryServiceFormFields = {
  code: string
  description: string
  price: string
  unit: string
}

type InventoryUnitTarget = 'product' | 'secondary' | 'service'

type StoredInventoryRecords = {
  items: InventoryRecord[]
  error: string
}

type PersonFormFields = {
  code: string
  name: string
  group: string
  phone: string
  address: string
  accountNumber: string
  balance: string
  balanceDirection: 'debit' | 'credit'
}

type StoredPeopleState = {
  people: PersonRecord[]
  error: string
}

type StoredPeopleGroups = {
  groups: string[]
  error: string
}

type InventoryTaxonomy = {
  groupsByKind: Record<InventoryKind, string[]>
  categoriesByGroup: Record<string, string[]>
}

type StoredInventoryOptions = InventoryTaxonomy & {
  warehouses: string[]
  warehouseTaxonomies?: Record<string, InventoryTaxonomy>
  serviceWarehouses?: string[]
  serviceTaxonomy?: InventoryTaxonomy
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry: unknown) => typeof entry === 'string')
}

function isInventoryKind(value: string): value is InventoryKind {
  return inventoryKinds.includes(value as InventoryKind)
}

function isInventoryTaxonomy(value: unknown): value is InventoryTaxonomy {
  if (
    typeof value !== 'object'
    || value === null
    || !('groupsByKind' in value)
    || typeof value.groupsByKind !== 'object'
    || value.groupsByKind === null
    || Array.isArray(value.groupsByKind)
    || !('categoriesByGroup' in value)
    || typeof value.categoriesByGroup !== 'object'
    || value.categoriesByGroup === null
    || Array.isArray(value.categoriesByGroup)
  ) return false

  return Object.entries(value.groupsByKind).every(([kind, groups]) => isInventoryKind(kind) && isStringArray(groups))
    && Object.values(value.categoriesByGroup).every(isStringArray)
}

function isStoredInventoryOptions(value: unknown): value is StoredInventoryOptions {
  if (
    !isInventoryTaxonomy(value)
    || ('warehouses' in value && !isStringArray(value.warehouses))
    || ('warehouseTaxonomies' in value && (
      typeof value.warehouseTaxonomies !== 'object'
      || value.warehouseTaxonomies === null
      || Array.isArray(value.warehouseTaxonomies)
      || !Object.values(value.warehouseTaxonomies).every(isInventoryTaxonomy)
    ))
    || ('serviceWarehouses' in value && !isStringArray(value.serviceWarehouses))
    || ('serviceTaxonomy' in value && !isInventoryTaxonomy(value.serviceTaxonomy))
  ) return false

  return true
}

type PeopleGroupMenu = {
  group: string
  x: number
  y: number
}

type PeopleFilterDrag = {
  pointerId: number
  startX: number
  startScrollLeft: number
  isDragging: boolean
}

type InventoryActionTarget =
  | { type: 'warehouse'; name: string; kind?: 'کالا' | 'خدمات' | 'تولید' }
  | { type: 'group'; name: string; kind: InventoryKind }
  | { type: 'category'; name: string; group: string; kind: InventoryKind }
  | { type: 'product'; name: string; id: string }
  | { type: 'service'; name: string; id: string }

type InventoryActionItem = InventoryActionTarget & { x: number; y: number }

type EditingInventoryTaxonomy =
  | { type: 'group'; name: string; kind: InventoryKind }
  | { type: 'category'; name: string; group: string; kind: InventoryKind }

function readStoredPeopleGroups(storeId: number | null = null): StoredPeopleGroups {
  try {
    const raw = readStoreData(PEOPLE_GROUPS_STORAGE_KEY, storeId)
    if (!raw) return { groups: [], error: '' }

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every((group) => typeof group === 'string')) {
      throw new Error('Invalid people groups')
    }

    const groups = [...new Set(parsed.map((group) => group.trim()).filter(Boolean))]
      .filter((group) => !peopleFilters.includes(group))
    return { groups, error: '' }
  } catch {
    return {
      groups: [],
      error: 'گروه‌های اشخاص قابل خواندن نیستند؛ گروه تازه ذخیره نخواهد شد.',
    }
  }
}

function isPersonRecord(value: unknown): value is PersonRecord {
  if (!value || typeof value !== 'object') return false
  const person = value as Record<string, unknown>
  return typeof person.id === 'string'
    && typeof person.code === 'string'
    && typeof person.name === 'string'
    && (person.group === undefined || typeof person.group === 'string')
    && typeof person.role === 'string'
    && typeof person.phone === 'string'
    && typeof person.address === 'string'
    && typeof person.accountNumber === 'string'
    && (person.accountStatus === 'بدهکاران'
      || person.accountStatus === 'بستانکاران'
      || person.accountStatus === 'تسویه شده')
    && typeof person.balance === 'number'
    && Number.isFinite(person.balance)
    && (person.createdAt === undefined || typeof person.createdAt === 'string')
    && (person.transactionCount === undefined
      || (typeof person.transactionCount === 'number'
        && Number.isSafeInteger(person.transactionCount)
        && person.transactionCount >= 0))
    && typeof person.tone === 'string'
}

function readStoredPeople(storeId: number | null = null): StoredPeopleState {
  try {
    const raw = readStoreData(PEOPLE_STORAGE_KEY, storeId)
    if (!raw) return { people: [], error: '' }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isPersonRecord)) {
      throw new Error('Invalid people data')
    }
    return { people: parsed, error: '' }
  } catch {
    return {
      people: [],
      error: 'اطلاعات اشخاص ذخیره‌شده قابل خواندن نیست؛ قبل از افزودن شخص، فضای ذخیره‌سازی را بررسی کنید.',
    }
  }
}

function isAccountRecord(value: unknown): value is AccountRecord {
  if (!value || typeof value !== 'object') return false
  const account = value as Record<string, unknown>
  return typeof account.id === 'string'
    && (account.kind === 'صندوق' || account.kind === 'بانکی')
    && typeof account.name === 'string'
    && typeof account.bankName === 'string'
    && typeof account.accountNumber === 'string'
    && (account.iban === undefined || typeof account.iban === 'string')
    && (account.ownerName === undefined || typeof account.ownerName === 'string')
    && (account.cardNumber === undefined || typeof account.cardNumber === 'string')
    && (account.smsNumber === undefined || typeof account.smsNumber === 'string')
    && typeof account.balance === 'number'
    && Number.isSafeInteger(account.balance)
    && account.balance >= 0
    && typeof account.createdAt === 'string'
}

function readStoredAccounts(storeId: number | null = null): StoredAccounts {
  try {
    const raw = readStoreData(ACCOUNTS_STORAGE_KEY, storeId)
    if (!raw) return { accounts: [], error: '' }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isAccountRecord)) {
      throw new Error('Invalid accounts data')
    }
    return { accounts: parsed, error: '' }
  } catch {
    return {
      accounts: [],
      error: 'حساب‌های ذخیره‌شده قابل خواندن نیستند؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.',
    }
  }
}

type StoredAccountTransfers = {
  transfers: AccountTransfer[]
  error: string
}

function isAccountTransfer(value: unknown): value is AccountTransfer {
  if (!value || typeof value !== 'object') return false
  const transfer = value as Record<string, unknown>
  const attachment = transfer.attachment
  return typeof transfer.id === 'string'
    && typeof transfer.sourceAccountId === 'string'
    && typeof transfer.destinationAccountId === 'string'
    && transfer.sourceAccountId !== transfer.destinationAccountId
    && typeof transfer.amount === 'number'
    && Number.isSafeInteger(transfer.amount)
    && transfer.amount > 0
    && typeof transfer.date === 'string'
    && /^\d{4}-\d{2}-\d{2}$/.test(transfer.date)
    && typeof transfer.time === 'string'
    && /^\d{2}:\d{2}$/.test(transfer.time)
    && (transfer.calendar === undefined
      || transfer.calendar === 'persian'
      || transfer.calendar === 'islamic-umalqura'
      || transfer.calendar === 'gregory')
    && typeof transfer.note === 'string'
    && (attachment === undefined || isImageDataAttachment(attachment))
    && typeof transfer.createdAt === 'string'
}

function readStoredAccountTransfers(storeId: number | null = null): StoredAccountTransfers {
  try {
    const raw = readStoreData(ACCOUNT_TRANSFERS_STORAGE_KEY, storeId)
    if (!raw) return { transfers: [], error: '' }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isAccountTransfer)) {
      throw new Error('Invalid account transfer data')
    }
    return { transfers: parsed, error: '' }
  } catch {
    return {
      transfers: [],
      error: 'سابقهٔ انتقال‌ها قابل خواندن نیست؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.',
    }
  }
}

const emptyInventoryProductForm: InventoryProductFormFields = {
  code: '',
  name: '',
  brand: '',
  unit: 'عدد',
  secondaryUnit: '',
  conversionRatio: '',
  barcode: '',
  stock: '0',
  purchasePrice: '0',
  salePrice: '0',
}

const emptyInventoryServiceForm: InventoryServiceFormFields = {
  code: '',
  description: '',
  price: '',
  unit: 'عدد',
}

const INVENTORY_UNITS_STORAGE_KEY = 'trazino-inventory-units-v1'
const defaultInventoryUnits = ['عدد', 'متر', 'کیلوگرم', 'گرم', 'بسته', 'کارتن', 'ساعت', 'روز', 'سرویس', 'برگ']

function readStoredInventoryUnits(storeId: number | null = null) {
  try {
    const raw = readStoreData(INVENTORY_UNITS_STORAGE_KEY, storeId)
    if (!raw) return { units: defaultInventoryUnits, error: '' }
    const parsed: unknown = JSON.parse(raw)
    if (!isStringArray(parsed)) throw new Error('Invalid inventory units')
    return {
      units: [...new Set([...defaultInventoryUnits, ...parsed.map((unit) => unit.trim()).filter(Boolean)])],
      error: '',
    }
  } catch {
    return {
      units: defaultInventoryUnits,
      error: 'واحدهای ذخیره‌شده قابل خواندن نیستند؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.',
    }
  }
}

const INVENTORY_OPTIONS_STORAGE_KEY = 'trazino-inventory-options-v1'
const INVENTORY_ITEMS_STORAGE_KEY = 'trazino-inventory-items-v1'
const DEFAULT_INVENTORY_WAREHOUSE = 'انبار مرکزی'
const DEFAULT_SERVICE_WAREHOUSE = 'انبار خدمات'
const STORE_USERS_STORAGE_KEY = 'trazino-store-users-v1'
const SECURITY_SETTINGS_STORAGE_KEY = 'gerdoo-security-settings-v1'
const STORE_DATA_MIGRATION_KEY = 'trazino-store-data-owner-v1'
const STORE_DATA_KEYS = [
  PEOPLE_GROUPS_STORAGE_KEY,
  PEOPLE_STORAGE_KEY,
  ACCOUNTS_STORAGE_KEY,
  ACCOUNT_TRANSFERS_STORAGE_KEY,
  SALES_INVOICE_SETTINGS_STORAGE_KEY,
  SALES_INVOICES_STORAGE_KEY,
  PURCHASE_INVOICES_STORAGE_KEY,
  RETURN_SALES_INVOICES_STORAGE_KEY,
  RETURN_PURCHASE_INVOICES_STORAGE_KEY,
  MONEY_DOCUMENTS_STORAGE_KEY,
  RECEIVED_CHECKS_STORAGE_KEY,
  PAID_CHECKS_STORAGE_KEY,
  INVENTORY_UNITS_STORAGE_KEY,
  INVENTORY_OPTIONS_STORAGE_KEY,
  INVENTORY_ITEMS_STORAGE_KEY,
  STORE_USERS_STORAGE_KEY,
] as const

type BackupStoreData = Record<(typeof STORE_DATA_KEYS)[number], string | null>
type AccountingBackup = {
  format: 'gerdoo-accounting-backup'
  version: 1
  createdAt: string
  activeStoreId: number | null
  legacyDataOwnerStoreId?: number | null
  stores: Array<{
    store: Store
    data: BackupStoreData
  }>
}

function isAccountingBackup(value: unknown): value is AccountingBackup {
  if (!value || typeof value !== 'object') return false
  const backup = value as Record<string, unknown>
  const activeStoreId = backup.activeStoreId
  const legacyDataOwnerStoreId = backup.legacyDataOwnerStoreId
  if (
    backup.format !== 'gerdoo-accounting-backup'
    || backup.version !== 1
    || typeof backup.createdAt !== 'string'
    || !Number.isFinite(Date.parse(backup.createdAt))
    || !Array.isArray(backup.stores)
    || !(activeStoreId === null
      || (typeof activeStoreId === 'number' && Number.isSafeInteger(activeStoreId) && activeStoreId > 0))
    || (
      legacyDataOwnerStoreId !== undefined
      && !(legacyDataOwnerStoreId === null
        || (typeof legacyDataOwnerStoreId === 'number'
          && Number.isSafeInteger(legacyDataOwnerStoreId)
          && legacyDataOwnerStoreId > 0))
    )
  ) return false

  const storeIds = new Set<number>()
  for (const entry of backup.stores) {
    if (!entry || typeof entry !== 'object') return false
    const record = entry as Record<string, unknown>
    if (!isStore(record.store) || record.store.id <= 0 || storeIds.has(record.store.id)) return false
    if (!record.data || typeof record.data !== 'object') return false
    const data = record.data as Record<string, unknown>
    for (const key of STORE_DATA_KEYS) {
      const raw = data[key]
      if ((
        key === ACCOUNTS_STORAGE_KEY
        || key === ACCOUNT_TRANSFERS_STORAGE_KEY
        || key === SALES_INVOICES_STORAGE_KEY
        || key === PURCHASE_INVOICES_STORAGE_KEY
        || key === RETURN_SALES_INVOICES_STORAGE_KEY
        || key === RETURN_PURCHASE_INVOICES_STORAGE_KEY
        || key === MONEY_DOCUMENTS_STORAGE_KEY
        || key === RECEIVED_CHECKS_STORAGE_KEY
        || key === PAID_CHECKS_STORAGE_KEY
      ) && raw === undefined) continue
      if (raw !== null && typeof raw !== 'string') return false
      if (typeof raw === 'string') {
        try {
          JSON.parse(raw)
        } catch {
          return false
        }
      }
    }
    storeIds.add(record.store.id)
  }

  return (activeStoreId === null || (
    typeof activeStoreId === 'number' && storeIds.has(activeStoreId)
  ))
    && (legacyDataOwnerStoreId === undefined
      || legacyDataOwnerStoreId === null
      || (typeof legacyDataOwnerStoreId === 'number' && storeIds.has(legacyDataOwnerStoreId)))
}

const userTones = ['mint', 'blue', 'amber', 'violet', 'coral'] as const
type UserTone = (typeof userTones)[number]

type StoreUser = {
  id: string
  name: string
  phone: string
  tone: UserTone
  active: boolean
}

type StoredStoreUsers = {
  users: StoreUser[]
  error: string
}

type StoreUserFields = Omit<StoreUser, 'id'>

const emptyStoreUserFields: StoreUserFields = {
  name: '',
  phone: '',
  tone: 'mint',
  active: true,
}

function isStoreUser(value: unknown): value is StoreUser {
  if (!value || typeof value !== 'object') return false
  const user = value as Record<string, unknown>
  return typeof user.id === 'string'
    && typeof user.name === 'string'
    && typeof user.phone === 'string'
    && userTones.some((tone) => tone === user.tone)
    && typeof user.active === 'boolean'
}

function readStoredStoreUsers(storeId: number | null): StoredStoreUsers {
  try {
    const raw = readStoreData(STORE_USERS_STORAGE_KEY, storeId)
    if (!raw) return { users: [], error: '' }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isStoreUser)) {
      throw new Error('Invalid store users')
    }
    return { users: parsed, error: '' }
  } catch {
    return {
      users: [],
      error: 'اطلاعات کاربران این فروشگاه قابل خواندن نیست؛ برای جلوگیری از پاک‌شدن داده‌ها، ذخیرهٔ کاربران متوقف شد.',
    }
  }
}

const securityLoginMethods = ['pin', 'pattern', 'password'] as const
type SecurityLoginMethod = (typeof securityLoginMethods)[number]

type StoredSecuritySettings = {
  loginMethod: SecurityLoginMethod
  notificationAccessEnabled: boolean
  cameraAccessEnabled: boolean
  error: string
}

function readSecuritySettings(): StoredSecuritySettings {
  try {
    const raw = localStorage.getItem(SECURITY_SETTINGS_STORAGE_KEY)
    if (!raw) {
      return {
        loginMethod: 'pin',
        notificationAccessEnabled: false,
        cameraAccessEnabled: false,
        error: '',
      }
    }
    const parsed: unknown = JSON.parse(raw)
    if (
      !parsed
      || typeof parsed !== 'object'
      || !securityLoginMethods.some((method) => method === (parsed as Record<string, unknown>).loginMethod)
      || (
        (parsed as Record<string, unknown>).notificationAccessEnabled !== undefined
        && typeof (parsed as Record<string, unknown>).notificationAccessEnabled !== 'boolean'
      )
      || (
        (parsed as Record<string, unknown>).cameraAccessEnabled !== undefined
        && typeof (parsed as Record<string, unknown>).cameraAccessEnabled !== 'boolean'
      )
    ) {
      throw new Error('Invalid security settings')
    }
    const settings = parsed as Record<string, unknown>
    return {
      loginMethod: settings.loginMethod as SecurityLoginMethod,
      notificationAccessEnabled: settings.notificationAccessEnabled === true,
      cameraAccessEnabled: settings.cameraAccessEnabled === true,
      error: '',
    }
  } catch {
    return {
      loginMethod: 'pin',
      notificationAccessEnabled: false,
      cameraAccessEnabled: false,
      error: 'تنظیمات امنیتی ذخیره‌شده قابل خواندن نیست.',
    }
  }
}

type BrowserPermissionStatus = 'unknown' | 'granted' | 'denied' | 'unsupported'

function getStoreDataStorageKey(key: string, storeId: number) {
  return `${key}:store:${storeId}`
}

function claimLegacyStoreData(storeId: number) {
  const owner = localStorage.getItem(STORE_DATA_MIGRATION_KEY)
  if (owner !== null) {
    if (!/^\d+$/.test(owner)) throw new Error('Invalid store data owner')
    return
  }

  for (const key of STORE_DATA_KEYS) {
    const legacyValue = localStorage.getItem(key)
    if (legacyValue !== null) {
      localStorage.setItem(getStoreDataStorageKey(key, storeId), legacyValue)
    }
  }
  localStorage.setItem(STORE_DATA_MIGRATION_KEY, String(storeId))
}

function readStoreData(key: string, storeId: number | null) {
  if (storeId === null) return null
  claimLegacyStoreData(storeId)
  return localStorage.getItem(getStoreDataStorageKey(key, storeId))
}

function getActiveStoreDataStorageKey(key: string, storeId: number | null) {
  if (storeId === null) throw new Error('ابتدا یک فروشگاه را انتخاب کنید.')
  return getStoreDataStorageKey(key, storeId)
}

function isInventoryRecord(value: unknown): value is InventoryRecord {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string'
    && (item.catalogId === undefined || typeof item.catalogId === 'string')
    && (item.warehouse === undefined || typeof item.warehouse === 'string')
    && (item.code === undefined || typeof item.code === 'string')
    && typeof item.name === 'string'
    && typeof item.createdAt === 'string'
    && typeof item.lastMovementAt === 'string'
    && typeof item.group === 'string'
    && typeof item.category === 'string'
    && typeof item.kind === 'string'
    && isInventoryKind(item.kind)
    && typeof item.brand === 'string'
    && typeof item.unit === 'string'
    && typeof item.stock === 'number'
    && Number.isFinite(item.stock)
    && typeof item.purchasePrice === 'number'
    && Number.isFinite(item.purchasePrice)
    && typeof item.salePrice === 'number'
    && Number.isFinite(item.salePrice)
    && (item.barcode === undefined || typeof item.barcode === 'string')
    && (item.secondaryUnit === undefined || typeof item.secondaryUnit === 'string')
    && (item.conversionRatio === undefined
      || (typeof item.conversionRatio === 'number' && Number.isFinite(item.conversionRatio)))
    && (item.stockMovements === undefined
      || (Array.isArray(item.stockMovements) && item.stockMovements.every(isInventoryStockMovement)))
}

function isInventoryStockMovement(value: unknown): value is InventoryStockMovement {
  if (!value || typeof value !== 'object') return false
  const movement = value as Record<string, unknown>
  return typeof movement.id === 'string'
    && ['opening', 'count-in', 'count-out', 'transfer-in', 'transfer-out'].includes(String(movement.kind))
    && typeof movement.quantity === 'number'
    && Number.isFinite(movement.quantity)
    && movement.quantity > 0
    && typeof movement.createdAt === 'string'
    && Number.isFinite(Date.parse(movement.createdAt))
    && (movement.warehouse === undefined || typeof movement.warehouse === 'string')
}

function synchronizeInventoryCatalog(
  items: InventoryRecord[],
  warehouses: string[],
  serviceWarehouses: string[] = [DEFAULT_SERVICE_WAREHOUSE],
) {
  const allWarehouses = [...new Set([DEFAULT_INVENTORY_WAREHOUSE, ...warehouses])]
  const allServiceWarehouses = [...new Set([DEFAULT_SERVICE_WAREHOUSE, ...serviceWarehouses])]
  const serviceItems: InventoryRecord[] = []
  const warehouseItems: InventoryRecord[] = []
  for (const item of items) {
    if (item.kind !== 'خدمات') {
      warehouseItems.push(item)
      continue
    }

    const catalogId = item.catalogId ?? item.id
    const itemWarehouse = item.warehouse ?? DEFAULT_SERVICE_WAREHOUSE
    const warehouse = allServiceWarehouses.includes(itemWarehouse)
      ? itemWarehouse
      : DEFAULT_SERVICE_WAREHOUSE
    serviceItems.push({ ...item, catalogId, warehouse })
  }
  const centralByIdentity = new Map<string, InventoryRecord[]>()
  const getIdentity = (item: InventoryRecord) => [
    item.kind,
    item.code?.trim() ?? '',
    item.name.trim().toLocaleLowerCase(),
    item.brand.trim().toLocaleLowerCase(),
    item.unit.trim().toLocaleLowerCase(),
  ].join('\u0000')
  for (const item of warehouseItems) {
    if ((item.warehouse ?? DEFAULT_INVENTORY_WAREHOUSE) !== DEFAULT_INVENTORY_WAREHOUSE) continue
    const key = getIdentity(item)
    centralByIdentity.set(key, [...(centralByIdentity.get(key) ?? []), item])
  }

  const catalogRecords: InventoryRecord[] = [
    ...warehouseItems.map((item) => {
      const warehouse = item.warehouse ?? DEFAULT_INVENTORY_WAREHOUSE
      const matches = item.catalogId || warehouse === DEFAULT_INVENTORY_WAREHOUSE
        ? []
        : centralByIdentity.get(getIdentity(item)) ?? []
      const centralMatch = matches.length === 1 ? matches[0] : undefined
      return {
        ...item,
        catalogId: item.catalogId ?? centralMatch?.catalogId ?? centralMatch?.id ?? item.id,
        warehouse,
      }
    }),
    ...serviceItems,
  ]
  const canonicalByCatalog = new Map<string, InventoryRecord>()
  for (const item of catalogRecords) {
    const catalogId = item.catalogId ?? item.id
    const current = canonicalByCatalog.get(catalogId)
    if (!current
      || (item.warehouse === DEFAULT_INVENTORY_WAREHOUSE && current.warehouse !== DEFAULT_INVENTORY_WAREHOUSE)) {
      canonicalByCatalog.set(catalogId, item)
    }
  }

  const normalized = catalogRecords.map((item) => {
    const canonical = canonicalByCatalog.get(item.catalogId ?? item.id) ?? item
    return {
      ...item,
      ...canonical,
      id: item.id,
      catalogId: item.catalogId ?? item.id,
      warehouse: item.warehouse ?? (
        item.kind === 'خدمات' ? DEFAULT_SERVICE_WAREHOUSE : DEFAULT_INVENTORY_WAREHOUSE
      ),
      stock: item.stock,
      lastMovementAt: item.lastMovementAt,
      stockMovements: item.stockMovements ?? [],
    }
  })
  const existingCatalogWarehouses = new Set(
    normalized.map((item) => `${item.catalogId ?? item.id}\u0000${item.warehouse ?? DEFAULT_INVENTORY_WAREHOUSE}`),
  )
  const existingIds = new Set(normalized.map((item) => item.id))

  for (const [catalogId, canonical] of canonicalByCatalog) {
    const catalogWarehouses = canonical.kind === 'خدمات' ? allServiceWarehouses : allWarehouses
    for (const warehouse of catalogWarehouses) {
      const key = `${catalogId}\u0000${warehouse}`
      if (existingCatalogWarehouses.has(key)) continue
      let id = `${canonical.id}::${encodeURIComponent(warehouse)}`
      let suffix = 1
      while (existingIds.has(id)) {
        id = `${canonical.id}::${encodeURIComponent(warehouse)}:${suffix}`
        suffix += 1
      }
      normalized.push({
        ...canonical,
        id,
        catalogId,
        warehouse,
        stock: 0,
        lastMovementAt: canonical.createdAt,
        stockMovements: [],
      })
      existingCatalogWarehouses.add(key)
      existingIds.add(id)
    }
  }

  return normalized
}

function updateInventoryCatalogPrices(
  items: InventoryRecord[],
  itemId: string,
  prices: Partial<Pick<InventoryRecord, 'purchasePrice' | 'salePrice'>>,
) {
  const selectedItem = items.find((item) => item.id === itemId)
  if (!selectedItem) return items
  const catalogId = selectedItem.catalogId ?? selectedItem.id
  return items.map((item) => (item.catalogId ?? item.id) === catalogId
    ? { ...item, ...prices }
    : item)
}

function readStoredInventoryRecords(storeId: number | null = null): StoredInventoryRecords {
  try {
    const raw = readStoreData(INVENTORY_ITEMS_STORAGE_KEY, storeId)
    if (!raw) return { items: [], error: '' }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isInventoryRecord)) {
      throw new Error('Invalid inventory records')
    }
    const options = readStoredInventoryOptions(storeId)
    const items = synchronizeInventoryCatalog(
      parsed,
      options.warehouses,
      options.serviceWarehouses,
    )
    if (JSON.stringify(items) !== JSON.stringify(parsed)) {
      try {
        localStorage.setItem(
          getActiveStoreDataStorageKey(INVENTORY_ITEMS_STORAGE_KEY, storeId),
          JSON.stringify(items),
        )
      } catch {
        return {
          items: parsed,
          error: 'همگام‌سازی فهرست کالاها با انبارها انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.',
        }
      }
    }
    return { items, error: '' }
  } catch {
    return {
      items: [],
      error: 'کالاهای ذخیره‌شده قابل خواندن نیستند؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.',
    }
  }
}

function readStoredInventoryOptions(storeId: number | null = null): StoredInventoryOptions {
  const defaultGroupsByKind: Record<InventoryKind, string[]> = { کالا: [], خدمات: [], تولید: [] }
  const defaultCategoriesByGroup: Record<string, string[]> = {}
  const defaultWarehouses = [DEFAULT_INVENTORY_WAREHOUSE]
  const defaultServiceWarehouses = [DEFAULT_SERVICE_WAREHOUSE]
  const defaultTaxonomy: InventoryTaxonomy = {
    groupsByKind: defaultGroupsByKind,
    categoriesByGroup: defaultCategoriesByGroup,
  }
  try {
    const raw = readStoreData(INVENTORY_OPTIONS_STORAGE_KEY, storeId)
    if (!raw) {
      return {
        ...defaultTaxonomy,
        warehouses: defaultWarehouses,
        serviceWarehouses: defaultServiceWarehouses,
        serviceTaxonomy: defaultTaxonomy,
        warehouseTaxonomies: { [DEFAULT_INVENTORY_WAREHOUSE]: defaultTaxonomy },
      }
    }

    const parsed: unknown = JSON.parse(raw)
    if (!isStoredInventoryOptions(parsed)) throw new Error('Invalid inventory options')

    const serviceGroups = new Set(parsed.groupsByKind.خدمات ?? [])
    for (const taxonomy of Object.values(parsed.warehouseTaxonomies ?? {})) {
      for (const group of taxonomy.groupsByKind.خدمات ?? []) serviceGroups.add(group)
    }
    const serviceTaxonomySource = parsed.serviceTaxonomy ?? {
      groupsByKind: {
        ...defaultGroupsByKind,
        خدمات: [...serviceGroups],
      },
      categoriesByGroup: Object.fromEntries([...serviceGroups].map((group) => [
        group,
        parsed.categoriesByGroup[group] ?? [],
      ])),
    }
    const serviceTaxonomy: InventoryTaxonomy = {
      groupsByKind: {
        ...defaultGroupsByKind,
        ...serviceTaxonomySource.groupsByKind,
        کالا: [],
        تولید: [],
      },
      categoriesByGroup: serviceTaxonomySource.categoriesByGroup,
    }
    const groupsByKind = { ...defaultGroupsByKind }
    for (const [kind, groups] of Object.entries(parsed.groupsByKind)) {
      if (isInventoryKind(kind)) {
        if (kind === 'خدمات') continue
        groupsByKind[kind] = [...new Set([
          ...groupsByKind[kind],
          ...groups.map((group) => group.trim()).filter(Boolean),
        ])]
      }
    }

    const categoriesByGroup = { ...defaultCategoriesByGroup }
    for (const [group, categories] of Object.entries(parsed.categoriesByGroup)) {
      categoriesByGroup[group] = [...new Set([
        ...(categoriesByGroup[group] ?? []),
        ...categories.map((category) => category.trim()).filter(Boolean),
      ])]
    }

    const warehouses = [...new Set([
      ...defaultWarehouses,
      ...('warehouses' in parsed && Array.isArray(parsed.warehouses)
        ? parsed.warehouses
          .map((warehouse) => warehouse.trim())
          .filter(Boolean)
          .map((warehouse) => warehouse === 'انبار اصلی' ? DEFAULT_INVENTORY_WAREHOUSE : warehouse)
        : []),
    ])]
    for (const taxonomy of Object.values(parsed.warehouseTaxonomies ?? {})) {
      for (const kind of inventoryKinds.filter((itemKind) => itemKind !== 'خدمات')) {
        groupsByKind[kind] = [...new Set([
          ...groupsByKind[kind],
          ...taxonomy.groupsByKind[kind],
        ])]
      }
      for (const [group, categories] of Object.entries(taxonomy.categoriesByGroup)) {
        categoriesByGroup[group] = [...new Set([
          ...(categoriesByGroup[group] ?? []),
          ...categories,
        ])]
      }
    }

    const sharedTaxonomy = { groupsByKind, categoriesByGroup }
    const serviceWarehouses = [...new Set([
      ...defaultServiceWarehouses,
      ...(parsed.serviceWarehouses ?? [])
        .map((warehouse) => warehouse.trim())
        .filter(Boolean),
    ])]
    return {
      ...sharedTaxonomy,
      warehouses,
      serviceWarehouses,
      serviceTaxonomy,
      warehouseTaxonomies: Object.fromEntries(
        warehouses.map((warehouse) => [warehouse, sharedTaxonomy]),
      ),
    }
  } catch {
    return {
      ...defaultTaxonomy,
      warehouses: defaultWarehouses,
      serviceWarehouses: defaultServiceWarehouses,
      serviceTaxonomy: defaultTaxonomy,
      warehouseTaxonomies: { [DEFAULT_INVENTORY_WAREHOUSE]: defaultTaxonomy },
    }
  }
}

const inventorySortOptions = [
  { value: 'created', label: 'ایجاد کالا' },
  { value: 'name', label: 'نام کالا' },
  { value: 'salePrice', label: 'قیمت فروش' },
  { value: 'purchasePrice', label: 'قیمت خرید' },
  { value: 'stockAsc', label: 'موجودی کم' },
  { value: 'stockDesc', label: 'موجودی زیاد' },
  { value: 'lastMovement', label: 'آخرین ورود و خروج' },
] as const

const serviceSortOptions = [
  { value: 'created', label: 'ایجاد خدمات' },
  { value: 'name', label: 'نام خدمات' },
  { value: 'salePrice', label: 'قیمت خدمات' },
] as const

const emptyPersonForm: PersonFormFields = {
  code: '',
  name: '',
  group: '',
  phone: '',
  address: '',
  accountNumber: '',
  balance: '0',
  balanceDirection: 'debit',
}

const formatPersonBalance = (amount: number) => new Intl.NumberFormat('fa-IR').format(amount)
const formatPersonCode = (code: number) => new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(code)
const normalizeInventorySearchText = (value: string) => value
  .replace(/[۰-۹٠-٩]/g, (digit) => {
    const code = digit.charCodeAt(0)
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660)
  })
  .toLocaleLowerCase()

function parsePersonCode(value: string) {
  const normalized = value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const code = digit.charCodeAt(0)
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660)
  })
  const code = Number(normalized)
  return Number.isSafeInteger(code) && code >= 0 ? code : 0
}

function normalizeAccountDigits(value: string) {
  return value
    .replace(/[۰-۹٠-٩]/g, (digit) => {
      const code = digit.charCodeAt(0)
      return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660)
    })
    .replace(/\D/g, '')
}

function normalizeAccountIban(value: string) {
  return value
    .replace(/[۰-۹٠-٩]/g, (digit) => {
      const code = digit.charCodeAt(0)
      return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660)
    })
    .toUpperCase()
    .replace(/[\s-]/g, '')
    .slice(0, 26)
}

function formatAccountBalanceInput(value: string) {
  return normalizeAccountDigits(value)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '٬')
    .replace(/\d/g, (digit) => String.fromCharCode(0x06f0 + Number(digit)))
}

function formatDecimalInput(value: string) {
  const normalized = value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const code = digit.charCodeAt(0)
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660)
  }).replace(/[٬\s]/g, '')
  const separatorIndex = normalized.search(/[.,]/)
  const integer = separatorIndex === -1 ? normalized : normalized.slice(0, separatorIndex)
  const fraction = separatorIndex === -1 ? '' : normalized.slice(separatorIndex + 1).replace(/[.,]/g, '')
  const separator = separatorIndex === -1 ? '' : normalized[separatorIndex]
  return `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, '٬')}${separator}${fraction}`
    .replace(/\d/g, (digit) => String.fromCharCode(0x06f0 + Number(digit)))
}

function parseStocktakeQuantity(value: string) {
  const normalized = value
    .replace(/[۰-۹٠-٩]/g, (digit) => {
      const code = digit.charCodeAt(0)
      return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660)
    })
    .replace(/[−﹣]/g, '-')
    .replace(/[\u200e\u200f]/g, '')
    .replace(/[٬\s]/g, '')
    .replace(/[٫,]/g, '.')
  if (!normalized.trim()) return null
  const quantity = Number(normalized)
  return Number.isFinite(quantity) ? quantity : null
}

function formatStocktakeQuantity(quantity: number) {
  return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 3 })
    .format(quantity)
    .replace(/[−﹣]/g, '-')
    .replace(/[\u200e\u200f]/g, '')
}

function currentIsoTimestamp() {
  return new Date().toISOString()
}

function parsePersonBalance(value: string) {
  const normalized = value
    .replace(/[۰-۹٠-٩]/g, (digit) => {
      const code = digit.charCodeAt(0)
      return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660)
    })
    .replace(/[,\u066b\u066c٬\s]/g, '')
  if (!normalized) return 0
  const amount = Number(normalized)
  return Number.isSafeInteger(amount) && amount >= 0 ? amount : null
}

function App() {
  const [storeState, setStoreState] = useState(readStoredStoreState)
  const { stores, activeStoreId } = storeState
  const [activeTab, setActiveTab] = useState('خانه')
  const homeContentRef = useRef<HTMLElement | null>(null)
  const homeScrollPositionRef = useRef<number | null>(null)
  const [activeSettingsSection, setActiveSettingsSection] = useState('')
  const [supportOpen, setSupportOpen] = useState(false)
  const [supportFaqOpen, setSupportFaqOpen] = useState(false)
  const [invoiceDesignOpen, setInvoiceDesignOpen] = useState(false)
  const [salesInvoiceLines, setSalesInvoiceLines] = useState<SalesInvoiceLine[]>([])
  const [salesInvoicePerson, setSalesInvoicePerson] = useState('')
  const [salesInvoicePartyError, setSalesInvoicePartyError] = useState('')
  const [salesInvoicePersonSearch, setSalesInvoicePersonSearch] = useState('')
  const [storedSalesInvoices, setStoredSalesInvoices] = useState<StoredSalesInvoices>(() => readStoredSalesInvoices(activeStoreId))
  const [storedPurchaseInvoices, setStoredPurchaseInvoices] = useState<StoredPurchaseInvoices>(
    () => readStoredPurchaseInvoices(activeStoreId),
  )
  const [storedReturnSalesInvoices, setStoredReturnSalesInvoices] = useState<StoredReturnInvoices>(
    () => readStoredReturnInvoices(RETURN_SALES_INVOICES_STORAGE_KEY, 'sales', activeStoreId),
  )
  const [storedReturnPurchaseInvoices, setStoredReturnPurchaseInvoices] = useState<StoredReturnInvoices>(
    () => readStoredReturnInvoices(RETURN_PURCHASE_INVOICES_STORAGE_KEY, 'purchase', activeStoreId),
  )
  const [storedMoneyDocuments, setStoredMoneyDocuments] = useState<StoredMoneyDocuments>(
    () => readStoredMoneyDocuments(activeStoreId),
  )
  const [storedReceivedChecks, setStoredReceivedChecks] = useState<StoredReceivedChecks>(
    () => readStoredReceivedChecks(activeStoreId),
  )
  const [storedPaidChecks, setStoredPaidChecks] = useState<StoredPaidChecks>(
    () => readStoredPaidChecks(activeStoreId),
  )
  const [checkListFilter, setCheckListFilter] = useState<CheckListFilter>('all')
  const [checkListSearchOpen, setCheckListSearchOpen] = useState(false)
  const [checkListSearch, setCheckListSearch] = useState('')
  const [checkDetail, setCheckDetail] = useState<CheckDetail | null>(null)
  const [moneyDocumentKind, setMoneyDocumentKind] = useState<MoneyDocumentFormKind | null>(null)
  const [moneyDocumentSelectedCheckId, setMoneyDocumentSelectedCheckId] = useState('')
  const [moneyDocumentCheckPickerOpen, setMoneyDocumentCheckPickerOpen] = useState(false)
  const [moneyDocumentFields, setMoneyDocumentFields] = useState({
    personId: '',
    accountId: '',
    amount: '',
    description: '',
    sayadiId: '',
    leafNumber: '',
    serial: '',
    nationalId: '',
    dueDate: getIranDateValue(new Date()),
    bankName: '',
    date: getIranDateValue(new Date()),
    time: (() => {
      const { hours, minutes } = getIranClockParts(new Date())
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    })(),
    note: '',
    attachment: null as { name: string; type: string; dataUrl: string } | null,
  })
  const [moneyDocumentError, setMoneyDocumentError] = useState('')
  const [moneyDocumentSaving, setMoneyDocumentSaving] = useState(false)
  const [moneyDocumentNoteOpen, setMoneyDocumentNoteOpen] = useState(false)
  const [moneyDocumentDatePickerOpen, setMoneyDocumentDatePickerOpen] = useState(false)
  const [moneyDocumentDateTarget, setMoneyDocumentDateTarget] = useState<'document' | 'dueDate'>('document')
  const [moneyDocumentDraftDate, setMoneyDocumentDraftDate] = useState(() => new Date())
  const [moneyDocumentCalendar, setMoneyDocumentCalendar] = useState<CalendarSystem>('persian')
  const [moneyDocumentDraftCalendar, setMoneyDocumentDraftCalendar] = useState<CalendarSystem>('persian')
  const [moneyDocumentVisibleMonth, setMoneyDocumentVisibleMonth] = useState(() => new Date())
  const [moneyDocumentToday, setMoneyDocumentToday] = useState(() => getIranDateValue(new Date()))
  const [moneyDocumentTimePickerOpen, setMoneyDocumentTimePickerOpen] = useState(false)
  const [moneyDocumentDraftTime, setMoneyDocumentDraftTime] = useState(() => getIranClockParts(new Date()))
  const [moneyDocumentTimeField, setMoneyDocumentTimeField] = useState<'hour' | 'minute'>('hour')
  const [moneyDocumentTimeMode, setMoneyDocumentTimeMode] = useState<'clock' | 'keyboard'>('clock')
  const [moneyDocumentAttachmentPickerOpen, setMoneyDocumentAttachmentPickerOpen] = useState(false)
  const [moneyDocumentDraftAttachment, setMoneyDocumentDraftAttachment] = useState<{
    name: string
    type: string
    dataUrl: string
  } | null>(null)
  const moneyDocumentSavingRef = useRef(false)
  const moneyDocumentAttachmentInputRef = useRef<HTMLInputElement>(null)
  const moneyDocumentCameraInputRef = useRef<HTMLInputElement>(null)
  const [salesInvoiceListFilter, setSalesInvoiceListFilter] = useState<SalesInvoiceListFilter>('all')
  const [salesInvoiceListSearchOpen, setSalesInvoiceListSearchOpen] = useState(false)
  const [salesInvoiceListSearch, setSalesInvoiceListSearch] = useState('')
  const [purchaseInvoiceListSearchOpen, setPurchaseInvoiceListSearchOpen] = useState(false)
  const [purchaseInvoiceListSearch, setPurchaseInvoiceListSearch] = useState('')
  const [returnInvoiceListSearchOpen, setReturnInvoiceListSearchOpen] = useState(false)
  const [returnInvoiceListSearch, setReturnInvoiceListSearch] = useState('')
  const [incomeListSearchOpen, setIncomeListSearchOpen] = useState(false)
  const [incomeListSearch, setIncomeListSearch] = useState('')
  const [expenseListSearchOpen, setExpenseListSearchOpen] = useState(false)
  const [expenseListSearch, setExpenseListSearch] = useState('')
  const [cashDocumentListSearchOpen, setCashDocumentListSearchOpen] = useState(false)
  const [cashDocumentListSearch, setCashDocumentListSearch] = useState('')
  const [returnInvoiceDetail, setReturnInvoiceDetail] = useState<ReturnInvoiceDetail | null>(null)
  const [salesInvoiceConfirmation, setSalesInvoiceConfirmation] = useState<SavedSalesInvoice | null>(null)
  const [salesInvoiceOpenedFromList, setSalesInvoiceOpenedFromList] = useState(false)
  const [salesInvoiceMoreOpen, setSalesInvoiceMoreOpen] = useState(false)
  const [salesInvoicePaymentMenuOpen, setSalesInvoicePaymentMenuOpen] = useState(false)
  const [salesInvoiceShareOpen, setSalesInvoiceShareOpen] = useState(false)
  const [salesInvoiceEditingId, setSalesInvoiceEditingId] = useState<string | null>(null)
  const [salesInvoiceReceiptOpen, setSalesInvoiceReceiptOpen] = useState(false)
  const [salesInvoiceReceiptFields, setSalesInvoiceReceiptFields] = useState({
    amount: '',
    accountId: '',
    date: '',
    time: '',
    calendar: 'persian' as CalendarSystem,
    note: '',
  })
  const [salesInvoiceReceiptDatePickerOpen, setSalesInvoiceReceiptDatePickerOpen] = useState(false)
  const [salesInvoiceReceiptDraftDate, setSalesInvoiceReceiptDraftDate] = useState(() => new Date())
  const [salesInvoiceReceiptDraftCalendar, setSalesInvoiceReceiptDraftCalendar] = useState<CalendarSystem>('persian')
  const [salesInvoiceReceiptVisibleMonth, setSalesInvoiceReceiptVisibleMonth] = useState(() => new Date())
  const [salesInvoiceReceiptTimePickerOpen, setSalesInvoiceReceiptTimePickerOpen] = useState(false)
  const [salesInvoiceReceiptDraftTime, setSalesInvoiceReceiptDraftTime] = useState(() => getIranClockParts(new Date()))
  const [salesInvoiceReceiptTimeField, setSalesInvoiceReceiptTimeField] = useState<'hour' | 'minute'>('hour')
  const [salesInvoiceReceiptTimeMode, setSalesInvoiceReceiptTimeMode] = useState<'clock' | 'keyboard'>('clock')
  const [salesInvoiceReceiptNoteOpen, setSalesInvoiceReceiptNoteOpen] = useState(false)
  const [salesInvoiceReceiptAttachment, setSalesInvoiceReceiptAttachment] = useState<File | null>(null)
  const [salesInvoiceReceiptAttachmentDataUrl, setSalesInvoiceReceiptAttachmentDataUrl] = useState('')
  const [salesInvoiceReceiptDraftAttachment, setSalesInvoiceReceiptDraftAttachment] = useState<File | null>(null)
  const [salesInvoiceReceiptDraftAttachmentDataUrl, setSalesInvoiceReceiptDraftAttachmentDataUrl] = useState('')
  const [salesInvoiceReceiptAttachmentPickerOpen, setSalesInvoiceReceiptAttachmentPickerOpen] = useState(false)
  const [salesInvoiceReceiptError, setSalesInvoiceReceiptError] = useState('')
  const [salesInvoiceReceiptSaving, setSalesInvoiceReceiptSaving] = useState(false)
  const salesInvoiceReceiptSavingRef = useRef(false)
  const [salesInvoiceSaveError, setSalesInvoiceSaveError] = useState('')
  const [salesInvoiceSaving, setSalesInvoiceSaving] = useState(false)
  const salesInvoiceSavingRef = useRef(false)
  const [salesInvoicePersonOptionsOpen, setSalesInvoicePersonOptionsOpen] = useState(false)
  const [salesInvoicePersonPickerOpen, setSalesInvoicePersonPickerOpen] = useState(false)
  const [salesInvoicePersonPickerSearch, setSalesInvoicePersonPickerSearch] = useState('')
  const [salesInvoicePersonPickerStatus, setSalesInvoicePersonPickerStatus] = useState<
    'همه' | 'بدهکاران' | 'بستانکاران'
  >('همه')
  const [salesInvoicePersonPickerGroup, setSalesInvoicePersonPickerGroup] = useState(allAccountReportGroups)
  const [salesInvoicePersonPickerGroupFormOpen, setSalesInvoicePersonPickerGroupFormOpen] = useState(false)
  const [salesInvoicePersonPickerGroupName, setSalesInvoicePersonPickerGroupName] = useState('')
  const [salesInvoicePersonPickerGroupError, setSalesInvoicePersonPickerGroupError] = useState('')
  const [salesInvoicePersonPickerReturnTab, setSalesInvoicePersonPickerReturnTab] = useState<string | null>(null)
  const [personFormRole, setPersonFormRole] = useState('شخص')
  const [todayInvoiceDate, setTodayInvoiceDate] = useState(
    () => new Date(`${getIranDateValue(new Date())}T12:00:00Z`),
  )
  const [salesInvoiceDate, setSalesInvoiceDate] = useState(
    () => new Date(`${getIranDateValue(new Date())}T12:00:00Z`),
  )
  const [salesInvoiceCalendar, setSalesInvoiceCalendar] = useState<CalendarSystem>('persian')
  const [salesInvoiceDatePickerOpen, setSalesInvoiceDatePickerOpen] = useState(false)
  const [salesInvoiceDraftDate, setSalesInvoiceDraftDate] = useState(() => new Date())
  const [salesInvoiceDraftCalendar, setSalesInvoiceDraftCalendar] = useState<CalendarSystem>('persian')
  const [salesInvoiceVisibleMonth, setSalesInvoiceVisibleMonth] = useState(() => new Date())
  const [salesInvoiceTime, setSalesInvoiceTime] = useState(() => getIranClockParts(new Date()))
  const [salesInvoiceTimePickerOpen, setSalesInvoiceTimePickerOpen] = useState(false)
  const [salesInvoiceDraftTime, setSalesInvoiceDraftTime] = useState(() => getIranClockParts(new Date()))
  const [salesInvoiceTimeMode, setSalesInvoiceTimeMode] = useState<'clock' | 'keyboard'>('clock')
  const [salesInvoiceTimeField, setSalesInvoiceTimeField] = useState<'hour' | 'minute'>('hour')
  const [salesInvoiceSettingsOpen, setSalesInvoiceSettingsOpen] = useState(false)
  const [salesInvoiceSettings, setSalesInvoiceSettings] = useState(() => readSalesInvoiceSettings(activeStoreId))
  const [salesInvoiceDraftSettings, setSalesInvoiceDraftSettings] = useState(() => readSalesInvoiceSettings(activeStoreId))
  const [salesInvoiceItemPickerOpen, setSalesInvoiceItemPickerOpen] = useState(false)
  const [salesInvoiceCatalogOpen, setSalesInvoiceCatalogOpen] = useState(false)
  const [salesInvoiceCatalogKind, setSalesInvoiceCatalogKind] = useState<InventoryKind | null>(null)
  const [salesInvoiceCatalogGroup, setSalesInvoiceCatalogGroup] = useState('همه')
  const [salesInvoiceCatalogCategory, setSalesInvoiceCatalogCategory] = useState('همه')
  const [salesInvoiceCatalogSearch, setSalesInvoiceCatalogSearch] = useState('')
  const [salesInvoiceItemSearch, setSalesInvoiceItemSearch] = useState('')
  const [salesInvoiceBarcodeMode, setSalesInvoiceBarcodeMode] = useState(false)
  const [salesInvoiceBarcodeScannerOpen, setSalesInvoiceBarcodeScannerOpen] = useState(false)
  const [salesInvoiceBarcodeScannerError, setSalesInvoiceBarcodeScannerError] = useState('')
  const [salesInvoiceItemOptionsOpen, setSalesInvoiceItemOptionsOpen] = useState(true)
  const [salesInvoiceDraftItem, setSalesInvoiceDraftItem] = useState<InventoryRecord | null>(null)
  const [salesInvoiceDraftDescription, setSalesInvoiceDraftDescription] = useState('')
  const [salesInvoiceDraftWarehouse, setSalesInvoiceDraftWarehouse] = useState(DEFAULT_INVENTORY_WAREHOUSE)
  const [salesInvoiceDraftQuantity, setSalesInvoiceDraftQuantity] = useState(1)
  const [salesInvoiceDraftPrice, setSalesInvoiceDraftPrice] = useState(0)
  const [salesInvoiceDraftDiscountPercent, setSalesInvoiceDraftDiscountPercent] = useState(0)
  const [salesInvoiceDraftDiscountAmount, setSalesInvoiceDraftDiscountAmount] = useState(0)
  const [salesInvoiceAdjustments, setSalesInvoiceAdjustments] = useState<SalesInvoiceAdjustment[]>([])
  const [salesInvoiceAdjustmentKind, setSalesInvoiceAdjustmentKind] = useState<SalesInvoiceAdjustmentKind | null>(null)
  const [salesInvoiceAdjustmentDescription, setSalesInvoiceAdjustmentDescription] = useState('')
  const [salesInvoiceAdjustmentMode, setSalesInvoiceAdjustmentMode] = useState<'percent' | 'amount'>('percent')
  const [salesInvoiceAdjustmentValue, setSalesInvoiceAdjustmentValue] = useState(0)
  const [salesInvoiceAdjustmentAffectsProfit, setSalesInvoiceAdjustmentAffectsProfit] = useState(true)
  const [salesInvoiceNote, setSalesInvoiceNote] = useState('')
  const [salesInvoiceAttachment, setSalesInvoiceAttachment] = useState<{ file: File; previewUrl: string } | null>(null)
  const [salesInvoiceDraftAttachment, setSalesInvoiceDraftAttachment] = useState<{ file: File; previewUrl: string } | null>(null)
  const [salesInvoiceAttachmentPickerOpen, setSalesInvoiceAttachmentPickerOpen] = useState(false)
  const [salesInvoiceAttachmentError, setSalesInvoiceAttachmentError] = useState('')
  const salesInvoiceBarcodeVideoRef = useRef<HTMLVideoElement>(null)
  const lastScannedBarcodeRef = useRef('')
  const [peopleSearch, setPeopleSearch] = useState('')
  const [peopleFilter, setPeopleFilter] = useState('همه')
  const [accountReportGroup, setAccountReportGroup] = useState(allAccountReportGroups)
  const [accountReportGroupPickerOpen, setAccountReportGroupPickerOpen] = useState(false)
  const [storedAccounts, setStoredAccounts] = useState(() => readStoredAccounts(activeStoreId))
  const [accountListFilter, setAccountListFilter] = useState<AccountKind>('بانکی')
  const [accountToolbarMenuOpen, setAccountToolbarMenuOpen] = useState(false)
  const [accountActionMenuId, setAccountActionMenuId] = useState<string | null>(null)
  const [storedAccountTransfers, setStoredAccountTransfers] = useState(() => readStoredAccountTransfers(activeStoreId))
  const [accountTransferOpen, setAccountTransferOpen] = useState(false)
  const [accountTransferFields, setAccountTransferFields] = useState<AccountTransferFormFields>(() => emptyAccountTransferForm())
  const [accountTransferError, setAccountTransferError] = useState('')
  const [accountTransferDatePickerOpen, setAccountTransferDatePickerOpen] = useState(false)
  const [accountTransferDraftDate, setAccountTransferDraftDate] = useState(() => normalizeUtcDate(new Date()))
  const [accountTransferDraftCalendar, setAccountTransferDraftCalendar] = useState<CalendarSystem>('persian')
  const [accountTransferVisibleMonth, setAccountTransferVisibleMonth] = useState(() => normalizeUtcDate(new Date()))
  const [accountTransferTimePickerOpen, setAccountTransferTimePickerOpen] = useState(false)
  const [accountTransferDraftTime, setAccountTransferDraftTime] = useState(() => getIranClockParts(new Date()))
  const [accountTransferAttachmentPickerOpen, setAccountTransferAttachmentPickerOpen] = useState(false)
  const [accountTransferDraftAttachment, setAccountTransferDraftAttachment] = useState<AccountTransferAttachment | null>(null)
  const [accountTransferAttachmentError, setAccountTransferAttachmentError] = useState('')
  const [accountFormOpen, setAccountFormOpen] = useState(false)
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null)
  const [accountFormFields, setAccountFormFields] = useState(emptyAccountForm)
  const [accountFormError, setAccountFormError] = useState('')
  const [visibleAccountCardIds, setVisibleAccountCardIds] = useState<Set<string>>(() => new Set())
  const [accountBankPickerOpen, setAccountBankPickerOpen] = useState(false)
  const [accountBankSearch, setAccountBankSearch] = useState('')
  const accountCardNumberRefs = useRef<Array<HTMLInputElement | null>>([])
  const [inventoryKind, setInventoryKind] = useState<InventoryKind>('کالا')
  const [selectedWarehouse, setSelectedWarehouse] = useState(DEFAULT_INVENTORY_WAREHOUSE)
  const [selectedServiceWarehouse, setSelectedServiceWarehouse] = useState(DEFAULT_SERVICE_WAREHOUSE)
  const [storedInventoryRecords, setStoredInventoryRecords] = useState(() => readStoredInventoryRecords(activeStoreId))
  const [inventoryProductOpen, setInventoryProductOpen] = useState(false)
  const [editingInventoryProductId, setEditingInventoryProductId] = useState<string | null>(null)
  const [inventoryProductTab, setInventoryProductTab] = useState<'basic' | 'extra'>('basic')
  const [inventoryProductFields, setInventoryProductFields] = useState(emptyInventoryProductForm)
  const [inventoryProductError, setInventoryProductError] = useState('')
  const [inventoryDetailItemId, setInventoryDetailItemId] = useState<string | null>(null)
  const [inventoryServiceOpen, setInventoryServiceOpen] = useState(false)
  const [editingInventoryServiceId, setEditingInventoryServiceId] = useState<string | null>(null)
  const [inventoryServiceFields, setInventoryServiceFields] = useState(emptyInventoryServiceForm)
  const [inventoryServiceError, setInventoryServiceError] = useState('')
  const [storedInventoryUnits, setStoredInventoryUnits] = useState(() => readStoredInventoryUnits(activeStoreId))
  const [inventoryUnitMenu, setInventoryUnitMenu] = useState<InventoryUnitTarget | null>(null)
  const [inventoryUnitMenuPosition, setInventoryUnitMenuPosition] = useState<{
    top: number
    left: number
    width: number
    maxHeight: number
  } | null>(null)
  const [inventoryUnitFormOpen, setInventoryUnitFormOpen] = useState(false)
  const [inventoryUnitFormTarget, setInventoryUnitFormTarget] = useState<InventoryUnitTarget>('product')
  const [inventoryUnitInput, setInventoryUnitInput] = useState('')
  const [inventoryUnitError, setInventoryUnitError] = useState('')
  const [inventoryGroup, setInventoryGroup] = useState('همه')
  const [inventoryCategory, setInventoryCategory] = useState('همه')
  const [inventoryOptions, setInventoryOptions] = useState(() => readStoredInventoryOptions(activeStoreId))
  const [inventoryTaxonomyForm, setInventoryTaxonomyForm] = useState<'group' | 'category' | null>(null)
  const [inventoryTaxonomyInput, setInventoryTaxonomyInput] = useState('')
  const [inventoryTaxonomyError, setInventoryTaxonomyError] = useState('')
  const [editingInventoryTaxonomy, setEditingInventoryTaxonomy] = useState<EditingInventoryTaxonomy | null>(null)
  const [inventoryActionItem, setInventoryActionItem] = useState<InventoryActionItem | null>(null)
  const [inventoryWarehousesOpen, setInventoryWarehousesOpen] = useState(false)
  const [inventoryWarehouseFormOpen, setInventoryWarehouseFormOpen] = useState(false)
  const [inventoryWarehouseInput, setInventoryWarehouseInput] = useState('')
  const [inventoryWarehouseError, setInventoryWarehouseError] = useState('')
  const [editingInventoryWarehouse, setEditingInventoryWarehouse] = useState<string | null>(null)
  const [editingServiceWarehouse, setEditingServiceWarehouse] = useState<string | null>(null)
  const [inventorySearch, setInventorySearch] = useState('')
  const [inventorySort, setInventorySort] = useState<(typeof inventorySortOptions)[number]['value']>('created')
  const [inventoryToolbarMenu, setInventoryToolbarMenu] = useState<'sort' | 'more' | null>(null)
  const [inventoryNoStockOnly, setInventoryNoStockOnly] = useState(false)
  const [inventoryStocktakeOpen, setInventoryStocktakeOpen] = useState(false)
  const [inventoryWarehouseStatsOpen, setInventoryWarehouseStatsOpen] = useState(false)
  const [inventoryWarehouseStatsSearch, setInventoryWarehouseStatsSearch] = useState('')
  const [inventoryStocktakeSearch, setInventoryStocktakeSearch] = useState('')
  const [inventoryStocktakeCounts, setInventoryStocktakeCounts] = useState<Record<string, string>>({})
  const [inventoryStocktakeError, setInventoryStocktakeError] = useState('')
  const [inventoryTransferOpen, setInventoryTransferOpen] = useState(false)
  const [inventoryTransferSourceWarehouse, setInventoryTransferSourceWarehouse] = useState('')
  const [inventoryTransferWarehouse, setInventoryTransferWarehouse] = useState('')
  const [inventoryTransferItemId, setInventoryTransferItemId] = useState('')
  const [inventoryTransferSearch, setInventoryTransferSearch] = useState('')
  const [inventoryTransferProductPickerOpen, setInventoryTransferProductPickerOpen] = useState(false)
  const [inventoryTransferQuantity, setInventoryTransferQuantity] = useState('')
  const [inventoryTransferError, setInventoryTransferError] = useState('')
  const [inventoryShareOpen, setInventoryShareOpen] = useState(false)
  const [inventoryShareSetting, setInventoryShareSetting] = useState<InventoryShareSetting>({
    scope: 'all',
    kind: 'کالا',
    group: 'همه',
    category: 'همه',
    categoryEnabled: false,
    includeZeroStock: true,
    includePrices: true,
    includeStock: true,
  })
  const [peopleSortBy, setPeopleSortBy] = useState<PeopleSortBy>('name')
  const [peopleSortDirection, setPeopleSortDirection] = useState<'asc' | 'desc'>('asc')
  const [peopleToolbarMenu, setPeopleToolbarMenu] = useState<'export' | 'sort' | null>(null)
  const [storedPeopleState, setStoredPeopleState] = useState(() => readStoredPeople(activeStoreId))
  const [personFormOpen, setPersonFormOpen] = useState(false)
  const [personFormTab, setPersonFormTab] = useState<'basic' | 'extra'>('basic')
  const [personFormFields, setPersonFormFields] = useState<PersonFormFields>(emptyPersonForm)
  const [personFormError, setPersonFormError] = useState('')
  const [personGroupPickerOpen, setPersonGroupPickerOpen] = useState(false)
  const [peopleGroupState, setPeopleGroupState] = useState(() => readStoredPeopleGroups(activeStoreId))
  const [peopleGroupInput, setPeopleGroupInput] = useState('')
  const [isAddingPeopleGroup, setIsAddingPeopleGroup] = useState(false)
  const [editingPeopleGroup, setEditingPeopleGroup] = useState<string | null>(null)
  const [peopleGroupMenu, setPeopleGroupMenu] = useState<PeopleGroupMenu | null>(null)
  const [peopleGroupError, setPeopleGroupError] = useState('')
  const closePersonForm = useCallback(() => {
    setPersonFormOpen(false)
    if (!salesInvoicePersonPickerReturnTab) return
    setActiveTab(salesInvoicePersonPickerReturnTab)
    setSalesInvoicePersonPickerReturnTab(null)
    setSalesInvoicePersonPickerOpen(true)
  }, [salesInvoicePersonPickerReturnTab])
  const peopleFiltersRef = useRef<HTMLDivElement>(null)
  const inventoryGroupsRef = useRef<HTMLDivElement>(null)
  const inventoryCategoriesRef = useRef<HTMLDivElement>(null)
  const inventoryActionsRef = useRef<HTMLDivElement>(null)
  const accountActionsRef = useRef<HTMLDivElement>(null)
  const salesInvoiceHourInputRef = useRef<HTMLInputElement>(null)
  const salesInvoiceMinuteInputRef = useRef<HTMLInputElement>(null)
  const salesInvoiceReceiptHourInputRef = useRef<HTMLInputElement>(null)
  const salesInvoiceReceiptMinuteInputRef = useRef<HTMLInputElement>(null)
  const salesInvoiceReceiptGalleryInputRef = useRef<HTMLInputElement>(null)
  const salesInvoiceReceiptCameraInputRef = useRef<HTMLInputElement>(null)
  const salesInvoiceGalleryInputRef = useRef<HTMLInputElement>(null)
  const salesInvoiceCameraInputRef = useRef<HTMLInputElement>(null)
  const salesInvoiceAttachmentUrlsRef = useRef(new Set<string>())
  const accountTransferGalleryInputRef = useRef<HTMLInputElement>(null)
  const accountTransferCameraInputRef = useRef<HTMLInputElement>(null)
  const peopleToolbarRef = useRef<HTMLDivElement>(null)
  const personGroupPickerRef = useRef<HTMLDivElement>(null)
  const accountReportGroupPickerRef = useRef<HTMLDivElement>(null)
  const accountActionPressTimer = useRef<number | null>(null)
  const accountActionPressOrigin = useRef<{ x: number; y: number } | null>(null)
  const peopleGroupPressTimer = useRef<number | null>(null)
  const peopleGroupPressOrigin = useRef<{ x: number; y: number } | null>(null)
  const suppressPeopleGroupClick = useRef(false)
  const peopleFilterDrag = useRef<PeopleFilterDrag | null>(null)
  const suppressPeopleFilterClick = useRef(false)
  const inventoryFilterDrag = useRef<(PeopleFilterDrag & { container: 'groups' | 'categories' }) | null>(null)
  const suppressInventoryFilterClick = useRef(false)
  const inventoryActionPressTimer = useRef<number | null>(null)
  const inventoryActionPressOrigin = useRef<{ x: number; y: number } | null>(null)
  const suppressInventoryActionClick = useRef(false)
  const inventoryDetailCloseButtonRef = useRef<HTMLButtonElement>(null)
  const [notice, setNotice] = useState('')
  const [authNotice, setAuthNotice] = useState('')
  const backNavigationHandlerRef = useRef<() => boolean>(() => false)
  const lastBackPressRef = useRef(0)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const attachmentUrls = salesInvoiceAttachmentUrlsRef.current
    return () => {
      attachmentUrls.forEach((url) => URL.revokeObjectURL(url))
      attachmentUrls.clear()
    }
  }, [])

  useEffect(() => {
    if (
      !salesInvoiceDatePickerOpen
      && !salesInvoiceTimePickerOpen
      && !salesInvoiceAttachmentPickerOpen
      && !salesInvoiceBarcodeScannerOpen
      && !salesInvoiceReceiptOpen
      && !moneyDocumentKind
      && !salesInvoiceReceiptDatePickerOpen
      && !salesInvoiceReceiptTimePickerOpen
      && !salesInvoiceReceiptAttachmentPickerOpen
      && !salesInvoiceSettingsOpen
      && !salesInvoicePersonPickerOpen
      && !salesInvoiceShareOpen
      && !salesInvoiceConfirmation
      && !accountTransferDatePickerOpen
      && !accountTransferTimePickerOpen
      && !accountTransferAttachmentPickerOpen
    ) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSalesInvoiceDatePickerOpen(false)
        setSalesInvoiceTimePickerOpen(false)
        setSalesInvoiceAttachmentPickerOpen(false)
        setSalesInvoiceBarcodeScannerOpen(false)
        setSalesInvoiceReceiptOpen(false)
        setMoneyDocumentKind(null)
        setMoneyDocumentError('')
        setSalesInvoiceReceiptDatePickerOpen(false)
        setSalesInvoiceReceiptTimePickerOpen(false)
        setSalesInvoiceReceiptAttachmentPickerOpen(false)
        setSalesInvoiceSettingsOpen(false)
        setSalesInvoicePersonPickerOpen(false)
        setSalesInvoiceMoreOpen(false)
        setSalesInvoicePaymentMenuOpen(false)
        setSalesInvoiceShareOpen(false)
        setAccountTransferDatePickerOpen(false)
        setAccountTransferTimePickerOpen(false)
        setAccountTransferAttachmentPickerOpen(false)
        setAccountTransferDraftAttachment(null)
        setAccountTransferAttachmentError('')
        if (
          salesInvoiceDraftAttachment
          && salesInvoiceDraftAttachment.previewUrl !== salesInvoiceAttachment?.previewUrl
        ) {
          URL.revokeObjectURL(salesInvoiceDraftAttachment.previewUrl)
          salesInvoiceAttachmentUrlsRef.current.delete(salesInvoiceDraftAttachment.previewUrl)
        }
        setSalesInvoiceDraftAttachment(null)
        setSalesInvoiceAttachmentError('')
      }
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [
    salesInvoiceDatePickerOpen,
    salesInvoiceTimePickerOpen,
    salesInvoiceAttachmentPickerOpen,
    salesInvoiceBarcodeScannerOpen,
    salesInvoiceReceiptOpen,
    moneyDocumentKind,
    salesInvoiceReceiptDatePickerOpen,
    salesInvoiceReceiptTimePickerOpen,
    salesInvoiceReceiptAttachmentPickerOpen,
    salesInvoiceSettingsOpen,
    salesInvoicePersonPickerOpen,
    salesInvoiceShareOpen,
    salesInvoiceConfirmation,
    accountTransferDatePickerOpen,
    accountTransferTimePickerOpen,
    accountTransferAttachmentPickerOpen,
    salesInvoiceDraftAttachment,
    salesInvoiceAttachment,
  ])

  useEffect(() => {
    if (!salesInvoiceTimePickerOpen || salesInvoiceTimeMode !== 'keyboard') return

    const input = salesInvoiceTimeField === 'hour'
      ? salesInvoiceHourInputRef.current
      : salesInvoiceMinuteInputRef.current
    input?.focus({ preventScroll: true })
  }, [salesInvoiceTimeField, salesInvoiceTimeMode, salesInvoiceTimePickerOpen])

  useEffect(() => {
    if (!salesInvoiceReceiptTimePickerOpen || salesInvoiceReceiptTimeMode !== 'keyboard') return

    const input = salesInvoiceReceiptTimeField === 'hour'
      ? salesInvoiceReceiptHourInputRef.current
      : salesInvoiceReceiptMinuteInputRef.current
    input?.focus({ preventScroll: true })
  }, [salesInvoiceReceiptTimeField, salesInvoiceReceiptTimeMode, salesInvoiceReceiptTimePickerOpen])

  const [theme, setTheme] = useState<'light' | 'dark'>(() => (
    localStorage.getItem('trazino-theme') === 'dark' ? 'dark' : 'light'
  ))
  const [colorTheme, setColorTheme] = useState<AppColorTheme>(() => {
    const storedTheme = appColorThemes.find(
      (option) => option.id === localStorage.getItem(COLOR_THEME_STORAGE_KEY),
    )
    return storedTheme?.id ?? 'gerdoo'
  })
  const [securitySettings, setSecuritySettings] = useState(readSecuritySettings)
  const [securityPermissionStatus, setSecurityPermissionStatus] = useState({
    notifications: 'unknown' as BrowserPermissionStatus,
    camera: 'unknown' as BrowserPermissionStatus,
  })
  const [securityNotice, setSecurityNotice] = useState('')
  const [deviceAuthenticatorAvailable, setDeviceAuthenticatorAvailable] = useState<boolean | null>(null)
  const [backupNotice, setBackupNotice] = useState('')
  const [backupImportError, setBackupImportError] = useState('')
  const [backupImport, setBackupImport] = useState<{
    backup: AccountingBackup
    filename: string
    mode: 'replace' | 'merge' | null
  } | null>(null)
  const [serverComparisonNotice, setServerComparisonNotice] = useState('')
  const backupImportInputRef = useRef<HTMLInputElement>(null)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [demoEntered, setDemoEntered] = useState(false)
  const [authFields, setAuthFields] = useState({ name: '', phone: '', password: '' })
  const iranToday = new Date(`${getIranDateValue(new Date())}T00:00:00Z`)
  const subscriptionExpiryDay = Date.UTC(
    DEMO_SUBSCRIPTION_EXPIRY.getUTCFullYear(),
    DEMO_SUBSCRIPTION_EXPIRY.getUTCMonth(),
    DEMO_SUBSCRIPTION_EXPIRY.getUTCDate(),
  )
  const subscriptionDaysRemaining = Math.max(
    0,
    Math.ceil((subscriptionExpiryDay - iranToday.getTime()) / 86_400_000),
  )
  const [storeFormOpen, setStoreFormOpen] = useState(false)
  const [editingStoreId, setEditingStoreId] = useState<number | null>(null)
  const [deleteConfirmStoreId, setDeleteConfirmStoreId] = useState<number | null>(null)
  const [expandedStoreAddressId, setExpandedStoreAddressId] = useState<number | null>(null)
  const [storeFields, setStoreFields] = useState<StoreFields>(emptyStoreFields)
  const [storedStoreUsers, setStoredStoreUsers] = useState(() => readStoredStoreUsers(activeStoreId))
  const [storeUserFormOpen, setStoreUserFormOpen] = useState(false)
  const [storeUserFormError, setStoreUserFormError] = useState('')
  const [storeUserFields, setStoreUserFields] = useState<StoreUserFields>(emptyStoreUserFields)
  const [deleteConfirmUserId, setDeleteConfirmUserId] = useState<string | null>(null)
  const supportLoading = useRef(false)
  const activeStore = stores.find((store) => store.id === activeStoreId) ?? null
  const allPeople = storedPeopleState.people
  const accountReportPeople = accountReportGroup === allAccountReportGroups
    ? allPeople
    : allPeople.filter((person) => person.group === accountReportGroup)
  const accountReportTotals = accountReportPeople.reduce((totals, person) => {
    if (person.accountStatus === 'بدهکاران') totals.debit += person.balance
    if (person.accountStatus === 'بستانکاران') totals.credit += person.balance
    return totals
  }, { debit: 0, credit: 0 })
  const accountReportStatusCounts = accountReportPeople.reduce((counts, person) => {
    counts[person.accountStatus] += 1
    return counts
  }, { بدهکاران: 0, بستانکاران: 0, 'تسویه شده': 0 })
  const accountReportRankedPeople = [...accountReportPeople]
    .sort((first, second) => second.balance - first.balance)
    .slice(0, 8)
  const netBalance = accountReportTotals.debit - accountReportTotals.credit
  const accountReportChartGroups = [
    {
      status: 'بدهکاران' as const,
      tone: 'debit',
      description: 'اشخاصی که از آن‌ها طلب دارید',
      total: accountReportTotals.debit,
      people: accountReportPeople
        .filter((person) => person.accountStatus === 'بدهکاران')
        .sort((first, second) => second.balance - first.balance)
        .slice(0, 5),
      count: accountReportPeople.filter((person) => person.accountStatus === 'بدهکاران').length,
    },
    {
      status: 'بستانکاران' as const,
      tone: 'credit',
      description: 'اشخاصی که به آن‌ها بدهکار هستید',
      total: accountReportTotals.credit,
      people: accountReportPeople
        .filter((person) => person.accountStatus === 'بستانکاران')
        .sort((first, second) => second.balance - first.balance)
        .slice(0, 5),
      count: accountReportPeople.filter((person) => person.accountStatus === 'بستانکاران').length,
    },
  ]
  const activeWarehouseOptions = inventoryKind === 'خدمات'
    ? inventoryOptions.serviceWarehouses ?? [DEFAULT_SERVICE_WAREHOUSE]
    : inventoryOptions.warehouses
  const selectedActiveWarehouse = inventoryKind === 'خدمات'
    ? selectedServiceWarehouse
    : selectedWarehouse
  const activeWarehouse = activeWarehouseOptions.includes(selectedActiveWarehouse)
    ? selectedActiveWarehouse
    : activeWarehouseOptions[0] ?? (
      inventoryKind === 'خدمات' ? DEFAULT_SERVICE_WAREHOUSE : DEFAULT_INVENTORY_WAREHOUSE
    )
  const activeWarehouseTaxonomy: InventoryTaxonomy = inventoryKind === 'خدمات'
    ? inventoryOptions.serviceTaxonomy ?? {
        groupsByKind: { کالا: [], خدمات: [], تولید: [] },
        categoriesByGroup: {},
      }
    : inventoryOptions
  const inventoryGroups = activeWarehouseTaxonomy.groupsByKind[inventoryKind]
  const inventoryServiceItems = useMemo(() => {
    const itemsByCatalog = new Map<string, InventoryRecord>()
    for (const item of storedInventoryRecords.items) {
      if (item.kind !== 'خدمات') continue
      const catalogId = item.catalogId ?? item.id
      const current = itemsByCatalog.get(catalogId)
      if (!current || item.warehouse === DEFAULT_SERVICE_WAREHOUSE) {
        itemsByCatalog.set(catalogId, item)
      }
    }
    return [...itemsByCatalog.values()]
  }, [storedInventoryRecords.items])
  const inventoryProductionItemsByCatalog = new Map<string, InventoryRecord>()
  for (const item of storedInventoryRecords.items) {
    if (item.kind !== 'تولید') continue
    const catalogId = item.catalogId ?? item.id
    const current = inventoryProductionItemsByCatalog.get(catalogId)
    if (!current || (item.warehouse ?? DEFAULT_INVENTORY_WAREHOUSE) === DEFAULT_INVENTORY_WAREHOUSE) {
      inventoryProductionItemsByCatalog.set(catalogId, item)
    }
  }
  const inventoryItems = inventoryKind === 'خدمات'
    ? inventoryServiceItems
    : inventoryKind === 'تولید'
      ? [...inventoryProductionItemsByCatalog.values()]
      : storedInventoryRecords.items.filter(
          (item) => (item.warehouse ?? DEFAULT_INVENTORY_WAREHOUSE) === activeWarehouse,
        )
  const salesInvoiceDraftInventoryKind = salesInvoiceDraftItem?.kind ?? salesInvoiceCatalogKind ?? 'کالا'
  const salesInvoiceWarehouseOptions = salesInvoiceDraftInventoryKind === 'خدمات'
    ? [...new Set([DEFAULT_SERVICE_WAREHOUSE, ...(inventoryOptions.serviceWarehouses ?? [])])]
    : [...new Set([DEFAULT_INVENTORY_WAREHOUSE, ...inventoryOptions.warehouses])]
  const salesInvoiceInventoryItems = storedInventoryRecords.items.filter((item) => (
    (item.warehouse ?? (
      item.kind === 'خدمات' ? DEFAULT_SERVICE_WAREHOUSE : DEFAULT_INVENTORY_WAREHOUSE
    )) === salesInvoiceDraftWarehouse
  ))
  const salesInvoicePickerItems = useMemo(() => [
    ...storedInventoryRecords.items.filter((item) => (
      item.kind === 'کالا'
      && (item.warehouse ?? DEFAULT_INVENTORY_WAREHOUSE) === salesInvoiceDraftWarehouse
    )),
    ...inventoryServiceItems,
  ], [storedInventoryRecords.items, salesInvoiceDraftWarehouse, inventoryServiceItems])
  const inventoryStocktakeRecords = storedInventoryRecords.items.filter((item) => (
    item.kind === inventoryKind
    && (item.warehouse ?? (
      inventoryKind === 'خدمات' ? DEFAULT_SERVICE_WAREHOUSE : DEFAULT_INVENTORY_WAREHOUSE
    )) === activeWarehouse
  ))
  const inventoryWarehouseStatsWarehouses = [...new Set([
    DEFAULT_INVENTORY_WAREHOUSE,
    ...inventoryOptions.warehouses,
  ])]
  const inventoryWarehouseStatsCatalog = new Map<string, InventoryRecord>()
  for (const item of storedInventoryRecords.items) {
    if (item.kind !== 'کالا') continue
    const catalogId = item.catalogId ?? item.id
    const current = inventoryWarehouseStatsCatalog.get(catalogId)
    if (!current || item.warehouse === DEFAULT_INVENTORY_WAREHOUSE) {
      inventoryWarehouseStatsCatalog.set(catalogId, item)
    }
  }
  const inventoryWarehouseStatsQuery = inventoryWarehouseStatsSearch.trim().toLocaleLowerCase()
  const inventoryWarehouseStatsItems = [...inventoryWarehouseStatsCatalog.entries()]
    .map(([catalogId, item]) => ({
      catalogId,
      item,
      stockByWarehouse: inventoryWarehouseStatsWarehouses.map((warehouse) => ({
        warehouse,
        item: storedInventoryRecords.items.find((record) => (
          record.kind === 'کالا'
          && (record.catalogId ?? record.id) === catalogId
          && (record.warehouse ?? DEFAULT_INVENTORY_WAREHOUSE) === warehouse
        )),
      })),
    }))
    .filter(({ item }) => !inventoryWarehouseStatsQuery || (
      `${item.name} ${item.code ?? ''} ${item.barcode ?? ''}`
        .toLocaleLowerCase()
        .includes(inventoryWarehouseStatsQuery)
    ))
    .sort((first, second) => first.item.name.localeCompare(second.item.name, 'fa'))
  const inventoryStocktakeItems = inventoryStocktakeRecords.filter((item) => {
    const query = inventoryStocktakeSearch.trim().toLocaleLowerCase()
    return !query
      || item.name.toLocaleLowerCase().includes(query)
      || (item.code ?? '').toLocaleLowerCase().includes(query)
      || (item.barcode ?? '').toLocaleLowerCase().includes(query)
  })
  const inventoryTransferAllWarehouses = [...new Set([
    DEFAULT_INVENTORY_WAREHOUSE,
    ...inventoryOptions.warehouses,
  ])]
  const inventoryTransferWarehouses = inventoryTransferAllWarehouses.filter(
    (warehouse) => warehouse !== inventoryTransferSourceWarehouse,
  )
  const inventoryTransferSourceItems = storedInventoryRecords.items.filter((item) => (
    item.kind === 'کالا'
    && (item.warehouse ?? DEFAULT_INVENTORY_WAREHOUSE) === inventoryTransferSourceWarehouse
  ))
  const inventoryTransferSearchQuery = inventoryTransferSearch.trim().toLocaleLowerCase()
  const inventoryTransferItems = inventoryTransferSourceItems.filter((item) => (
    !inventoryTransferSearchQuery
    || item.name.toLocaleLowerCase().includes(inventoryTransferSearchQuery)
    || (item.code ?? '').toLocaleLowerCase().includes(inventoryTransferSearchQuery)
    || (item.barcode ?? '').toLocaleLowerCase().includes(inventoryTransferSearchQuery)
  ))
  const inventoryTransferSelectedItem = inventoryTransferSourceItems.find(
    (item) => item.id === inventoryTransferItemId,
  )
  const inventoryStocktakeDifferences = inventoryStocktakeRecords.reduce((total, item) => {
    const count = parseStocktakeQuantity(
      inventoryStocktakeCounts[item.id] ?? formatStocktakeQuantity(item.stock),
    )
    return count !== null && Math.abs(count - item.stock) > 0.000001 ? total + 1 : total
  }, 0)
  const inventoryStocktakeNoDifferences = inventoryStocktakeRecords.reduce((total, item) => {
    const count = parseStocktakeQuantity(
      inventoryStocktakeCounts[item.id] ?? formatStocktakeQuantity(item.stock),
    )
    return count !== null && Math.abs(count - item.stock) <= 0.000001 ? total + 1 : total
  }, 0)
  const inventoryStocktakeValue = inventoryStocktakeRecords.reduce((total, item) => {
    const count = parseStocktakeQuantity(
      inventoryStocktakeCounts[item.id] ?? formatStocktakeQuantity(item.stock),
    )
    return count === null
      ? total
      : total + Math.abs(count - item.stock) * item.purchasePrice
  }, 0)
  const salesInvoiceEditingInvoice = salesInvoiceEditingId
    ? storedSalesInvoices.invoices.find((invoice) => invoice.id === salesInvoiceEditingId) ?? null
    : null
  const salesInvoiceNumber = salesInvoiceConfirmation?.number
    ?? salesInvoiceEditingInvoice?.number
    ?? `۱۳۰۰۰۰${formatPersonCode(345 + storedSalesInvoices.invoices.length)}`
  const purchaseInvoiceMode = activeTab === 'فاکتور خرید'
  const returnSalesInvoiceMode = activeTab === 'برگشت از فروش'
  const returnPurchaseInvoiceMode = activeTab === 'برگشت به خرید'
  const returnInvoiceMode = returnSalesInvoiceMode || returnPurchaseInvoiceMode
  const purchaseInvoicePartyMode = purchaseInvoiceMode || returnPurchaseInvoiceMode
  const returnSalesInvoiceNumber = `۲۳۰۰۰۰۰${formatPersonCode(storedReturnSalesInvoices.invoices.length + 1)}`
  const returnPurchaseInvoiceNumber = `۲۵۰۰۰۰۰${formatPersonCode(storedReturnPurchaseInvoices.invoices.length + 1)}`
  const purchaseInvoiceNumber = `۲۴۰۰۰۰${formatPersonCode(storedPurchaseInvoices.invoices.length + 1)}`
  const salesInvoiceListRows = [...storedSalesInvoices.invoices]
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
    .filter(() => salesInvoiceListFilter !== 'current')
    .filter((invoice) => {
      const query = salesInvoiceListSearch.trim().toLocaleLowerCase()
      return !query || `${invoice.number} ${invoice.buyerName}`.toLocaleLowerCase().includes(query)
    })
  const purchaseInvoiceListRows = [...storedPurchaseInvoices.invoices]
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
    .filter((invoice) => {
      const query = purchaseInvoiceListSearch.trim().toLocaleLowerCase()
      return !query || `${invoice.number} ${invoice.buyerName}`.toLocaleLowerCase().includes(query)
    })
  const returnInvoiceListRows = activeTab === 'فهرست برگشت از فروش'
    ? [...storedReturnSalesInvoices.invoices]
    : [...storedReturnPurchaseInvoices.invoices]
  const filteredReturnInvoiceListRows = returnInvoiceListRows
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
    .filter((invoice) => {
      const query = returnInvoiceListSearch.trim().toLocaleLowerCase()
      return !query || `${invoice.number} ${invoice.buyerName}`.toLocaleLowerCase().includes(query)
    })
  const checkListKind: CheckListKind = activeTab === 'فهرست چک‌های پرداختی' ? 'paid' : 'received'
  const checkListState = checkListKind === 'received' ? storedReceivedChecks : storedPaidChecks
  const checkListToday = todayInvoiceDate.toISOString().slice(0, 10)
  const filteredCheckListRows = [...checkListState.checks]
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
    .filter((check) => {
      const isOverdue = !check.clearedAt && check.dueDate < checkListToday
      if (checkListFilter === 'cleared' && !check.clearedAt) return false
      if (checkListFilter === 'overdue' && !isOverdue) return false
      if (checkListFilter === 'uncleared' && (check.clearedAt || isOverdue)) return false
      const query = checkListSearch.trim().toLocaleLowerCase()
      return !query || `${check.number} ${check.sayadiId} ${check.bankName} ${check.personName} ${check.dueDate}`
        .toLocaleLowerCase()
        .includes(query)
    })
  const incomeListRows = storedMoneyDocuments.documents
    .filter((document) => document.kind === 'درآمد')
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
    .filter((document) => {
      const accountName = storedAccounts.accounts.find((account) => account.id === document.accountId)?.name ?? ''
      const query = incomeListSearch.trim().toLocaleLowerCase()
      return !query || `${document.number} ${document.description} ${document.amount} ${accountName}`
        .toLocaleLowerCase()
        .includes(query)
    })
  const expenseListRows = storedMoneyDocuments.documents
    .filter((document) => document.kind === 'هزینه')
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
    .filter((document) => {
      const accountName = storedAccounts.accounts.find((account) => account.id === document.accountId)?.name ?? ''
      const query = expenseListSearch.trim().toLocaleLowerCase()
      return !query || `${document.number} ${document.description} ${document.amount} ${accountName}`
        .toLocaleLowerCase()
        .includes(query)
    })
  const cashDocumentListKind = activeTab === 'فهرست پرداخت‌ها' ? 'پرداخت' : 'دریافت'
  const cashDocumentListRows = storedMoneyDocuments.documents
    .filter((document) => document.kind === cashDocumentListKind)
    .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt))
    .filter((document) => {
      const accountName = storedAccounts.accounts.find((account) => account.id === document.accountId)?.name ?? ''
      const query = cashDocumentListSearch.trim().toLocaleLowerCase()
      return !query || `${document.number} ${document.personName} ${document.description} ${document.amount} ${accountName}`
        .toLocaleLowerCase()
        .includes(query)
    })
  const selectedCheckDetail = checkDetail
    ? (checkDetail.kind === 'received' ? storedReceivedChecks.checks : storedPaidChecks.checks)
      .find((check) => check.id === checkDetail.checkId) ?? null
    : null
  const salesInvoiceReceivedTotal = (salesInvoiceConfirmation?.receipts ?? [])
    .reduce((total, receipt) => total + receipt.amount, 0)
  const salesInvoiceRemainingTotal = Math.max(
    0,
    (salesInvoiceConfirmation?.total ?? 0) - salesInvoiceReceivedTotal,
  )
  const invoicePeople = purchaseInvoicePartyMode
    ? allPeople.filter((person) => person.role === 'تأمین‌کننده')
    : allPeople
  const filteredSalesInvoicePeople = invoicePeople.filter((person) => (
    `${person.name} ${person.phone} ${person.code}`
      .toLocaleLowerCase()
      .includes(salesInvoicePersonSearch.trim().toLocaleLowerCase())
  ))
  const filteredSalesInvoicePickerPeople = invoicePeople.filter((person) => (
    (salesInvoicePersonPickerStatus === 'همه' || person.accountStatus === salesInvoicePersonPickerStatus)
    && (salesInvoicePersonPickerGroup === allAccountReportGroups || person.group === salesInvoicePersonPickerGroup)
    && `${person.name} ${person.phone} ${person.code}`
      .toLocaleLowerCase()
      .includes(salesInvoicePersonPickerSearch.trim().toLocaleLowerCase())
  ))
  const selectedSalesInvoicePerson = invoicePeople.find((person) => person.id === salesInvoicePerson)
  const salesInvoiceSubtotal = salesInvoiceLines.reduce((total, line) => {
    const item = storedInventoryRecords.items.find((inventoryItem) => inventoryItem.id === line.itemId)
    if (!item) return total
    return total + Math.max(0, (line.unitPrice ?? item.salePrice) * line.quantity - line.discount)
  }, 0)
  const salesInvoiceAdjustmentTotal = salesInvoiceAdjustments.reduce((total, adjustment) => {
    const amount = adjustment.mode === 'percent'
      ? Math.round(salesInvoiceSubtotal * adjustment.value / 100)
      : adjustment.value
    return total + (adjustment.kind === 'addition' ? amount : -amount)
  }, 0)
  const salesInvoiceTotal = Math.max(0, salesInvoiceSubtotal + salesInvoiceAdjustmentTotal)
  const filteredSalesInvoiceItems = salesInvoicePickerItems
    .filter((item) => normalizeInventorySearchText(
      `${item.name} ${item.brand} ${item.code ?? ''} ${item.barcode ?? ''}`,
    ).includes(normalizeInventorySearchText(salesInvoiceItemSearch.trim())))
  const salesInvoiceCatalogTaxonomy = salesInvoiceCatalogKind === 'خدمات'
    ? inventoryOptions.serviceTaxonomy ?? inventoryOptions
    : inventoryOptions
  const salesInvoiceCatalogGroups = salesInvoiceCatalogKind
    ? [...new Set([
      ...salesInvoiceCatalogTaxonomy.groupsByKind[salesInvoiceCatalogKind],
      ...salesInvoiceInventoryItems.filter((item) => item.kind === salesInvoiceCatalogKind).map((item) => item.group),
    ])]
    : []
  const salesInvoiceCatalogCategories = salesInvoiceCatalogKind
    ? salesInvoiceCatalogGroup === 'همه'
      ? [...new Set([
        ...salesInvoiceCatalogGroups.flatMap((group) => salesInvoiceCatalogTaxonomy.categoriesByGroup[group] ?? []),
        ...salesInvoiceInventoryItems.filter((item) => item.kind === salesInvoiceCatalogKind).map((item) => item.category),
      ])]
      : [...new Set([
        ...(salesInvoiceCatalogTaxonomy.categoriesByGroup[salesInvoiceCatalogGroup] ?? []),
        ...salesInvoiceInventoryItems
          .filter((item) => item.kind === salesInvoiceCatalogKind && item.group === salesInvoiceCatalogGroup)
          .map((item) => item.category),
      ])]
    : []
  const filteredSalesInvoiceCatalogItems = salesInvoiceCatalogKind
    ? salesInvoiceInventoryItems
      .filter((item) => item.kind === salesInvoiceCatalogKind)
      .filter((item) => salesInvoiceCatalogGroup === 'همه' || item.group === salesInvoiceCatalogGroup)
      .filter((item) => salesInvoiceCatalogCategory === 'همه' || item.category === salesInvoiceCatalogCategory)
      .filter((item) => !salesInvoiceCatalogSearch.trim()
        || normalizeInventorySearchText(
          `${item.name} ${item.brand} ${item.code ?? ''} ${item.barcode ?? ''}`,
        ).includes(normalizeInventorySearchText(salesInvoiceCatalogSearch.trim())))
    : []
  const inventoryCategories = inventoryGroup === 'همه'
    ? [...new Set(Object.values(activeWarehouseTaxonomy.categoriesByGroup).flat())]
    : activeWarehouseTaxonomy.categoriesByGroup[inventoryGroup] ?? []
  const filteredInventory = inventoryItems
    .filter((item) => item.kind === inventoryKind)
    .filter((item) => inventoryKind === 'خدمات' || !inventoryNoStockOnly || item.stock <= 0)
    .filter((item) => inventoryGroup === 'همه' || item.group === inventoryGroup)
    .filter((item) => inventoryCategory === 'همه' || item.category === inventoryCategory)
    .filter((item) => `${item.name} ${item.brand} ${item.group} ${item.category}`.includes(inventorySearch.trim()))
    .sort((first, second) => {
      if (inventorySort === 'name') return first.name.localeCompare(second.name, 'fa')
      if (inventorySort === 'salePrice') return second.salePrice - first.salePrice
      if (inventorySort === 'purchasePrice') return second.purchasePrice - first.purchasePrice
      if (inventorySort === 'stockAsc') return first.stock - second.stock
      if (inventorySort === 'stockDesc') return second.stock - first.stock
      if (inventorySort === 'lastMovement') return second.lastMovementAt.localeCompare(first.lastMovementAt)
      return second.createdAt.localeCompare(first.createdAt)
    })
  const inventoryDetailItem = inventoryDetailItemId
    ? storedInventoryRecords.items.find((item) => item.id === inventoryDetailItemId)
    : undefined
  const inventoryDetailActivity = inventoryDetailItem
    ? getInventoryItemActivity(
        inventoryDetailItem,
        storedSalesInvoices.invoices,
        storedPurchaseInvoices.invoices,
        storedReturnSalesInvoices.invoices,
        storedReturnPurchaseInvoices.invoices,
      )
    : []
  const inventoryShareTaxonomy = inventoryShareSetting.kind === 'خدمات'
    ? inventoryOptions.serviceTaxonomy ?? inventoryOptions
    : inventoryOptions
  const inventoryShareGroups = inventoryShareTaxonomy.groupsByKind[inventoryShareSetting.kind]
  const inventoryShareCategories = inventoryShareSetting.scope === 'all'
    ? [...new Set(Object.values(inventoryShareTaxonomy.categoriesByGroup).flat())]
    : inventoryShareSetting.group === 'همه'
    ? [...new Set(inventoryShareGroups.flatMap((group) => inventoryShareTaxonomy.categoriesByGroup[group] ?? []))]
    : inventoryShareTaxonomy.categoriesByGroup[inventoryShareSetting.group] ?? []
  const inventoryShareItems = inventoryItems
    .filter((item) => inventoryShareSetting.scope === 'all' || item.kind === inventoryShareSetting.kind)
    .filter((item) => inventoryShareSetting.scope !== 'group' || inventoryShareSetting.group === 'همه' || item.group === inventoryShareSetting.group)
    .filter((item) => !inventoryShareSetting.categoryEnabled || inventoryShareSetting.category === 'همه' || item.category === inventoryShareSetting.category)
    .filter((item) => inventoryShareSetting.includeZeroStock || item.stock > 0)

  useEffect(() => {
    const timerId = window.setInterval(() => {
      const currentTime = new Date()
      setNow(currentTime)
      setTodayInvoiceDate(new Date(`${getIranDateValue(currentTime)}T12:00:00Z`))
    }, 1000)
    return () => window.clearInterval(timerId)
  }, [])

  useEffect(() => {
    if (!demoEntered || stores.length > 0 || activeTab === 'فروشگاه') return
    setActiveSettingsSection('')
    setActiveTab('فروشگاه')
  }, [activeTab, demoEntered, stores.length])

  useEffect(() => {
    localStorage.setItem('trazino-theme', theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, colorTheme)
    document.documentElement.dataset.colorTheme = colorTheme
  }, [colorTheme])

  useEffect(() => {
    if (activeSettingsSection !== 'امنیت') return

    const secureContext = window.isSecureContext
    const notificationStatus: BrowserPermissionStatus = !secureContext || typeof Notification === 'undefined'
      ? 'unsupported'
      : Notification.permission === 'granted'
      ? 'granted'
      : Notification.permission === 'denied'
      ? 'denied'
      : 'unknown'
    setSecurityPermissionStatus((current) => ({
      ...current,
      notifications: notificationStatus,
      camera: secureContext && typeof navigator.mediaDevices?.getUserMedia === 'function'
        ? current.camera
        : 'unsupported',
    }))

    if (!secureContext || typeof PublicKeyCredential === 'undefined') {
      setDeviceAuthenticatorAvailable(false)
      return
    }

    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== 'function') {
      setDeviceAuthenticatorAvailable(false)
      return
    }

    let active = true
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then((available) => {
        if (active) setDeviceAuthenticatorAvailable(available)
      })
      .catch(() => {
        if (!active) return
        setDeviceAuthenticatorAvailable(null)
        setSecurityNotice('بررسی پشتیبانی احراز هویت دستگاه انجام نشد.')
      })

    return () => {
      active = false
    }
  }, [activeSettingsSection])

  useEffect(() => {
    if (!accountReportGroupPickerOpen) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !accountReportGroupPickerRef.current?.contains(event.target)) {
        setAccountReportGroupPickerOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountReportGroupPickerOpen(false)
    }

    window.addEventListener('pointerdown', closeOnOutsideClick)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('pointerdown', closeOnOutsideClick)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [accountReportGroupPickerOpen])

  useEffect(() => {
    if (!accountFormOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (accountBankPickerOpen) {
        setAccountBankPickerOpen(false)
        return
      }
      setAccountFormOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [accountFormOpen, accountBankPickerOpen])

  useEffect(() => {
    if (!accountActionMenuId) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      const card = event.target instanceof Element
        ? event.target.closest<HTMLElement>('[data-account-card]')
        : null
      if (card?.dataset.accountCard !== accountActionMenuId) setAccountActionMenuId(null)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountActionMenuId(null)
    }
    window.addEventListener('pointerdown', closeOnOutsideClick)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('pointerdown', closeOnOutsideClick)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [accountActionMenuId])

  useEffect(() => {
    const activeFilter = peopleFiltersRef.current?.querySelector<HTMLButtonElement>(
      '.people-filter[aria-pressed="true"]',
    )
    activeFilter?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }, [peopleFilter, peopleGroupState.groups])

  useEffect(() => {
    if (!peopleToolbarMenu) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      const activeAction = peopleToolbarRef.current
        ?.querySelector('.people-toolbar-menu')
        ?.parentElement
      if (event.target instanceof Node && !activeAction?.contains(event.target)) {
        setPeopleToolbarMenu(null)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPeopleToolbarMenu(null)
    }

    window.addEventListener('pointerdown', closeOnOutsideClick)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('pointerdown', closeOnOutsideClick)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [peopleToolbarMenu])

  useEffect(() => {
    if (!inventoryToolbarMenu) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !inventoryActionsRef.current?.contains(event.target)) {
        setInventoryToolbarMenu(null)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setInventoryToolbarMenu(null)
    }

    window.addEventListener('pointerdown', closeOnOutsideClick)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('pointerdown', closeOnOutsideClick)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [inventoryToolbarMenu])

  useEffect(() => {
    if (!accountToolbarMenuOpen) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !accountActionsRef.current?.contains(event.target)) {
        setAccountToolbarMenuOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountToolbarMenuOpen(false)
    }

    window.addEventListener('pointerdown', closeOnOutsideClick)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('pointerdown', closeOnOutsideClick)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [accountToolbarMenuOpen])

  useEffect(() => {
    if (!accountTransferOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountTransferOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [accountTransferOpen])

  useEffect(() => {
    if (!inventoryShareOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setInventoryShareOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [inventoryShareOpen])

  useEffect(() => {
    if (!inventoryProductOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (inventoryUnitFormOpen) {
        setInventoryUnitFormOpen(false)
        return
      }
      if (inventoryUnitMenu) {
        setInventoryUnitMenu(null)
        return
      }
      setInventoryProductOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [inventoryProductOpen, inventoryUnitFormOpen, inventoryUnitMenu])

  useEffect(() => {
    if (!inventoryServiceOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (inventoryUnitFormOpen) {
        setInventoryUnitFormOpen(false)
        return
      }
      if (inventoryUnitMenu) {
        setInventoryUnitMenu(null)
        return
      }
      setInventoryServiceOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [inventoryServiceOpen, inventoryUnitFormOpen, inventoryUnitMenu])

  useEffect(() => {
    if (!inventoryUnitMenu) return
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        !(event.target instanceof Element)
        || !event.target.closest('.inventory-unit-selector, .inventory-unit-menu')
      ) {
        setInventoryUnitMenu(null)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setInventoryUnitMenu(null)
    }
    window.addEventListener('pointerdown', closeOnOutsideClick)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('pointerdown', closeOnOutsideClick)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [inventoryUnitMenu])

  useEffect(() => {
    const container = peopleFiltersRef.current
    if (!container) return

    const handlePointerMove = (event: PointerEvent) => {
      const drag = peopleFilterDrag.current
      if (!drag || drag.pointerId !== event.pointerId) return

      const distance = event.clientX - drag.startX
      if (!drag.isDragging && Math.abs(distance) < 5) return
      drag.isDragging = true
      suppressPeopleFilterClick.current = true
      event.preventDefault()
      container.scrollLeft = drag.startScrollLeft - distance
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (peopleFilterDrag.current?.pointerId !== event.pointerId) return
      const wasDragging = peopleFilterDrag.current.isDragging
      peopleFilterDrag.current = null
      container.classList.remove('is-dragging')
      if (wasDragging) {
        window.setTimeout(() => {
          suppressPeopleFilterClick.current = false
        }, 250)
      }
    }

    const handlePointerCancel = (event: PointerEvent) => {
      if (peopleFilterDrag.current?.pointerId !== event.pointerId) return
      peopleFilterDrag.current = null
      container.classList.remove('is-dragging')
    }

    const handleWheel = (event: WheelEvent) => {
      if (container.scrollWidth <= container.clientWidth) return
      event.preventDefault()
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY
      container.scrollBy({ left: -delta, behavior: 'auto' })
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerCancel)
    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
      container.removeEventListener('wheel', handleWheel)
    }
  }, [activeTab, demoEntered])

  useEffect(() => {
    const groups = inventoryGroupsRef.current
    const categories = inventoryCategoriesRef.current
    if (!groups || !categories) return
    const containers = {
      groups,
      categories,
    }

    const handlePointerMove = (event: PointerEvent) => {
      const drag = inventoryFilterDrag.current
      if (!drag || drag.pointerId !== event.pointerId) return
      const container = containers[drag.container]
      const distance = event.clientX - drag.startX
      if (!drag.isDragging && Math.abs(distance) < 5) return
      drag.isDragging = true
      suppressInventoryFilterClick.current = true
      container.classList.add('is-dragging')
      event.preventDefault()
      container.scrollLeft = drag.startScrollLeft - distance
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (inventoryFilterDrag.current?.pointerId !== event.pointerId) return
      const drag = inventoryFilterDrag.current
      inventoryFilterDrag.current = null
      containers[drag.container].classList.remove('is-dragging')
      if (drag.isDragging) {
        window.setTimeout(() => {
          suppressInventoryFilterClick.current = false
        }, 250)
      }
    }

    const handlePointerCancel = (event: PointerEvent) => {
      if (inventoryFilterDrag.current?.pointerId !== event.pointerId) return
      const drag = inventoryFilterDrag.current
      inventoryFilterDrag.current = null
      containers[drag.container].classList.remove('is-dragging')
      suppressInventoryFilterClick.current = false
    }

    const handleWheel = (event: WheelEvent) => {
      const container = event.currentTarget as HTMLDivElement
      if (container.scrollWidth <= container.clientWidth) return
      event.preventDefault()
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY
      container.scrollBy({ left: -delta, behavior: 'auto' })
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerCancel)
    containers.groups.addEventListener('wheel', handleWheel, { passive: false })
    containers.categories.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
      containers.groups?.removeEventListener('wheel', handleWheel)
      containers.categories?.removeEventListener('wheel', handleWheel)
      containers.groups?.classList.remove('is-dragging')
      containers.categories?.classList.remove('is-dragging')
      inventoryFilterDrag.current = null
      suppressInventoryFilterClick.current = false
    }
  }, [activeTab, demoEntered])

  useEffect(() => {
    if (!peopleGroupMenu) return

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return
      if (event.target.closest('.people-group-menu, .people-filter')) return
      setPeopleGroupMenu(null)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPeopleGroupMenu(null)
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [peopleGroupMenu])

  useEffect(() => {
    if (!inventoryActionItem) return

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return
      if (event.target.closest('.inventory-action-menu, .inventory-action-trigger')) return
      setInventoryActionItem(null)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setInventoryActionItem(null)
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [inventoryActionItem])

  useEffect(() => {
    if (!inventoryDetailItemId) return
    inventoryDetailCloseButtonRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setInventoryDetailItemId(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [inventoryDetailItemId])

  useEffect(() => {
    if (!inventoryStocktakeOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (inventoryWarehouseStatsOpen) {
          setInventoryWarehouseStatsOpen(false)
        } else {
          setInventoryStocktakeOpen(false)
        }
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [inventoryStocktakeOpen, inventoryWarehouseStatsOpen])

  useEffect(() => {
    if (!personFormOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePersonForm()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [personFormOpen, closePersonForm])

  useEffect(() => {
    if (!backupImport) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setBackupImport(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [backupImport])

  useEffect(() => {
    if (!storeUserFormOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setStoreUserFormOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [storeUserFormOpen])

  useEffect(() => {
    if (!personGroupPickerOpen) return

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !personGroupPickerRef.current?.contains(event.target)) {
        setPersonGroupPickerOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPersonGroupPickerOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [personGroupPickerOpen])

  useEffect(() => () => {
    if (peopleGroupPressTimer.current !== null) {
      window.clearTimeout(peopleGroupPressTimer.current)
    }
  }, [])

  const loadStoreWorkspace = (storeId: number | null) => {
    setStoredInventoryRecords(readStoredInventoryRecords(storeId))
    setStoredAccounts(readStoredAccounts(storeId))
    setStoredAccountTransfers(readStoredAccountTransfers(storeId))
    setStoredSalesInvoices(readStoredSalesInvoices(storeId))
    setStoredPurchaseInvoices(readStoredPurchaseInvoices(storeId))
    setStoredReturnSalesInvoices(readStoredReturnInvoices(RETURN_SALES_INVOICES_STORAGE_KEY, 'sales', storeId))
    setStoredReturnPurchaseInvoices(readStoredReturnInvoices(RETURN_PURCHASE_INVOICES_STORAGE_KEY, 'purchase', storeId))
    setStoredMoneyDocuments(readStoredMoneyDocuments(storeId))
    setStoredReceivedChecks(readStoredReceivedChecks(storeId))
    setStoredPaidChecks(readStoredPaidChecks(storeId))
    setStoredInventoryUnits(readStoredInventoryUnits(storeId))
    setInventoryOptions(readStoredInventoryOptions(storeId))
    setSelectedWarehouse(DEFAULT_INVENTORY_WAREHOUSE)
    setSelectedServiceWarehouse(DEFAULT_SERVICE_WAREHOUSE)
    setStoredPeopleState(readStoredPeople(storeId))
    setPeopleGroupState(readStoredPeopleGroups(storeId))
    setStoredStoreUsers(readStoredStoreUsers(storeId))
    setSalesInvoiceSettings(readSalesInvoiceSettings(storeId))
    setSalesInvoiceDraftSettings(readSalesInvoiceSettings(storeId))
    setInventoryGroup('همه')
    setInventoryCategory('همه')
    setInventorySearch('')
    setPeopleSearch('')
    setPeopleFilter('همه')
    setAccountReportGroup(allAccountReportGroups)
    setPersonFormOpen(false)
    setStoreUserFormOpen(false)
    setAccountFormOpen(false)
    setAccountTransferOpen(false)
    setDeleteConfirmUserId(null)
    setInventoryProductOpen(false)
    setInventoryServiceOpen(false)
    setSalesInvoiceSettingsOpen(false)
    setSalesInvoiceLines([])
    setSalesInvoiceAdjustments([])
    setSalesInvoicePerson('')
    setSalesInvoicePartyError('')
    setSalesInvoiceNote('')
    setSalesInvoiceBarcodeScannerOpen(false)
    setSalesInvoiceBarcodeScannerError('')
    setSalesInvoicePersonPickerOpen(false)
    setSalesInvoicePersonPickerStatus('همه')
    setSalesInvoicePersonPickerGroup(allAccountReportGroups)
    setSalesInvoicePersonPickerGroupFormOpen(false)
    setSalesInvoicePersonPickerGroupName('')
    setSalesInvoicePersonPickerGroupError('')
    setSalesInvoicePersonPickerReturnTab(null)
    setSalesInvoiceConfirmation(null)
    setSalesInvoiceMoreOpen(false)
    setSalesInvoicePaymentMenuOpen(false)
    setSalesInvoiceEditingId(null)
    setSalesInvoiceSaveError('')
  }

  const updateStoreState = (update: (current: StoredStoreState) => StoredStoreState) => {
    const next = update(storeState)
    if (next.error) {
      setStoreState(next)
      return false
    }

    try {
      if (next.activeStoreId !== storeState.activeStoreId) {
        if (next.activeStoreId !== null) claimLegacyStoreData(next.activeStoreId)
        localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify({
          format: 'trazino-store-workspace',
          version: 1,
          stores: next.stores,
          activeStoreId: next.activeStoreId,
        }))
        loadStoreWorkspace(next.activeStoreId)
      } else {
        localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify({
          format: 'trazino-store-workspace',
          version: 1,
          stores: next.stores,
          activeStoreId: next.activeStoreId,
        }))
      }
      setStoreState(next)
      return true
    } catch {
      setStoreState({
        ...storeState,
        error: 'ذخیره یا تغییر فروشگاه انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.',
      })
      return false
    }
  }

  const openStoreUserForm = () => {
    setStoreUserFields(emptyStoreUserFields)
    setStoreUserFormError('')
    setStoreUserFormOpen(true)
  }

  const openAccountForm = () => {
    setEditingAccountId(null)
    setAccountFormFields({ ...emptyAccountForm, kind: 'بانکی' })
    setAccountFormError('')
    setAccountBankSearch('')
    setAccountBankPickerOpen(false)
    setAccountFormOpen(true)
  }

  const openAccountEditForm = (account: AccountRecord) => {
    const cardNumber = account.cardNumber ?? ''
    setEditingAccountId(account.id)
    setAccountFormFields({
      kind: account.kind,
      name: account.ownerName ?? account.name,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      iban: account.iban ?? '',
      cardNumberParts: [
        cardNumber.slice(0, 4),
        cardNumber.slice(4, 8),
        cardNumber.slice(8, 12),
        cardNumber.slice(12, 16),
      ],
      balance: formatAccountBalanceInput(String(account.balance)),
      smsNumber: account.smsNumber ?? '',
    })
    setAccountFormError('')
    setAccountBankSearch('')
    setAccountBankPickerOpen(false)
    setAccountActionMenuId(null)
    setAccountFormOpen(true)
  }

  const clearAccountActionPress = () => {
    if (accountActionPressTimer.current !== null) {
      window.clearTimeout(accountActionPressTimer.current)
      accountActionPressTimer.current = null
    }
    accountActionPressOrigin.current = null
  }

  const startAccountActionPress = (event: ReactPointerEvent<HTMLElement>, account: AccountRecord) => {
    clearAccountActionPress()
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
    if ((event.target as Element).closest('.account-card-action-trigger, .account-bank-card-visibility')) return
    const { clientX, clientY } = event
    accountActionPressOrigin.current = { x: clientX, y: clientY }
    accountActionPressTimer.current = window.setTimeout(() => {
      setAccountActionMenuId(account.id)
      accountActionPressTimer.current = null
      accountActionPressOrigin.current = null
    }, 550)
  }

  const moveAccountActionPress = (event: ReactPointerEvent<HTMLElement>) => {
    const origin = accountActionPressOrigin.current
    if (origin && Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 10) {
      clearAccountActionPress()
    }
  }

  const deleteAccount = (account: AccountRecord) => {
    if (!activeStoreId) {
      setNotice('برای حذف حساب ابتدا یک فروشگاه را انتخاب کنید.')
      return
    }
    const accounts = storedAccounts.accounts.filter((item) => item.id !== account.id)
    try {
      localStorage.setItem(
        getActiveStoreDataStorageKey(ACCOUNTS_STORAGE_KEY, activeStoreId),
        JSON.stringify(accounts),
      )
      setStoredAccounts({ accounts, error: '' })
      setVisibleAccountCardIds((current) => {
        const next = new Set(current)
        next.delete(account.id)
        return next
      })
      setAccountActionMenuId(null)
      setNotice('حساب حذف شد.')
      window.setTimeout(() => setNotice(''), 2600)
    } catch {
      setNotice('حذف حساب انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
    }
  }

  const openAccountTransferForm = () => {
    setAccountTransferFields(emptyAccountTransferForm(storedAccounts.accounts))
    setAccountTransferError(storedAccounts.error || storedAccountTransfers.error)
    setAccountTransferAttachmentError('')
    setAccountTransferDatePickerOpen(false)
    setAccountTransferTimePickerOpen(false)
    setAccountTransferAttachmentPickerOpen(false)
    setAccountToolbarMenuOpen(false)
    setAccountTransferOpen(true)
  }

  const openAccountTransferDatePicker = () => {
    const selectedDate = normalizeUtcDate(new Date(`${accountTransferFields.date}T12:00:00Z`))
    setAccountTransferDraftDate(selectedDate)
    setAccountTransferDraftCalendar(accountTransferFields.calendar)
    setAccountTransferVisibleMonth(selectedDate)
    setAccountTransferDatePickerOpen(true)
  }

  const saveAccountTransferDate = () => {
    setAccountTransferFields((fields) => ({
      ...fields,
      date: normalizeUtcDate(accountTransferDraftDate).toISOString().slice(0, 10),
      calendar: accountTransferDraftCalendar,
    }))
    setAccountTransferDatePickerOpen(false)
  }

  const openAccountTransferTimePicker = () => {
    const [hours, minutes] = accountTransferFields.time.split(':').map(Number)
    setAccountTransferDraftTime({ hours, minutes })
    setAccountTransferTimePickerOpen(true)
  }

  const saveAccountTransferTime = () => {
    setAccountTransferFields((fields) => ({
      ...fields,
      time: `${String(accountTransferDraftTime.hours).padStart(2, '0')}:${String(accountTransferDraftTime.minutes).padStart(2, '0')}`,
    }))
    setAccountTransferTimePickerOpen(false)
  }

  const openAccountTransferAttachmentPicker = () => {
    setAccountTransferDraftAttachment(accountTransferFields.attachment)
    setAccountTransferAttachmentError('')
    setAccountTransferAttachmentPickerOpen(true)
  }

  const closeAccountTransferAttachmentPicker = () => {
    setAccountTransferAttachmentPickerOpen(false)
    setAccountTransferDraftAttachment(null)
    setAccountTransferAttachmentError('')
  }

  const handleAccountTransferAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setAccountTransferAttachmentError('فقط فایل تصویری را می‌توان پیوست کرد.')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setAccountTransferAttachmentError('حجم تصویر پیوست نباید بیشتر از ۳ مگابایت باشد.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setAccountTransferAttachmentError('خواندن تصویر پیوست انجام نشد؛ دوباره تلاش کنید.')
        return
      }
      setAccountTransferDraftAttachment({
        name: file.name || 'تصویر پیوست',
        type: file.type,
        dataUrl: reader.result,
      })
      setAccountTransferAttachmentError('')
    }
    reader.onerror = () => {
      setAccountTransferAttachmentError('خواندن تصویر پیوست انجام نشد؛ دوباره تلاش کنید.')
    }
    reader.readAsDataURL(file)
  }

  const confirmAccountTransferAttachment = () => {
    setAccountTransferFields((fields) => ({ ...fields, attachment: accountTransferDraftAttachment }))
    setAccountTransferAttachmentPickerOpen(false)
    setAccountTransferDraftAttachment(null)
    setAccountTransferAttachmentError('')
  }

  const saveAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const ownerName = accountFormFields.name.trim()
    if (accountFormFields.kind === 'بانکی' && !accountFormFields.bankName) {
      setAccountFormError('بانک را انتخاب کنید.')
      return
    }
    if (!ownerName) {
      setAccountFormError(accountFormFields.kind === 'بانکی'
        ? 'نام صاحب حساب را وارد کنید.'
        : 'نام حساب را وارد کنید.')
      return
    }
    if (storedAccounts.error) {
      setAccountFormError(storedAccounts.error)
      return
    }
    const cardNumber = accountFormFields.cardNumberParts.join('')
    if (accountFormFields.kind === 'بانکی' && !/^\d{16}$/.test(cardNumber)) {
      setAccountFormError('شماره کارت را در چهار بخش چهاررقمی کامل کنید.')
      return
    }
    if (accountFormFields.kind === 'بانکی') {
      const cardBankMismatch = getAccountCardBankMismatch(accountFormFields.bankName, cardNumber)
      if (cardBankMismatch) {
        setAccountFormError(cardBankMismatch)
        return
      }
    }
    const enteredIban = normalizeAccountIban(accountFormFields.iban)
    if (accountFormFields.kind === 'بانکی' && enteredIban && !/^(?:IR)?\d{24}$/.test(enteredIban)) {
      setAccountFormError('شماره شبا باید با IR و ۲۴ رقم وارد شود.')
      return
    }
    const balance = parsePersonBalance(accountFormFields.balance)
    if (balance === null) {
      setAccountFormError('موجودی اولیه باید یک عدد صحیح و نامنفی باشد.')
      return
    }
    if (!activeStoreId) {
      setAccountFormError('برای افزودن حساب ابتدا یک فروشگاه را انتخاب کنید.')
      return
    }

    const existingAccount = editingAccountId
      ? storedAccounts.accounts.find((item) => item.id === editingAccountId)
      : undefined
    if (editingAccountId && !existingAccount) {
      setAccountFormError('حساب موردنظر برای ویرایش پیدا نشد.')
      return
    }
    const account: AccountRecord = {
      id: existingAccount?.id ?? `account-${Date.now()}`,
      kind: accountFormFields.kind,
      name: ownerName,
      bankName: accountFormFields.kind === 'بانکی' ? accountFormFields.bankName : '',
      accountNumber: accountFormFields.kind === 'بانکی'
        ? normalizeAccountDigits(accountFormFields.accountNumber)
        : '',
      iban: accountFormFields.kind === 'بانکی' && enteredIban
        ? enteredIban.startsWith('IR') ? enteredIban : `IR${enteredIban}`
        : undefined,
      ownerName: accountFormFields.kind === 'بانکی' ? ownerName : undefined,
      cardNumber: accountFormFields.kind === 'بانکی' ? cardNumber : undefined,
      smsNumber: accountFormFields.kind === 'بانکی' ? accountFormFields.smsNumber.trim() : undefined,
      balance,
      createdAt: existingAccount?.createdAt ?? new Date().toISOString(),
    }
    const accounts = existingAccount
      ? storedAccounts.accounts.map((item) => item.id === existingAccount.id ? account : item)
      : [...storedAccounts.accounts, account]
    try {
      localStorage.setItem(
        getActiveStoreDataStorageKey(ACCOUNTS_STORAGE_KEY, activeStoreId),
        JSON.stringify(accounts),
      )
      setStoredAccounts({ accounts, error: '' })
      setAccountFormOpen(false)
      setEditingAccountId(null)
      setNotice(existingAccount ? 'تغییرات حساب ذخیره شد.' : 'حساب جدید اضافه شد.')
      window.setTimeout(() => setNotice(''), 2600)
    } catch {
      setAccountFormError('ذخیرهٔ حساب انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
    }
  }

  const saveAccountTransfer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (storedAccounts.error || storedAccountTransfers.error) {
      setAccountTransferError(storedAccounts.error || storedAccountTransfers.error)
      return
    }
    if (!activeStoreId) {
      setAccountTransferError('برای انتقال وجه ابتدا یک فروشگاه را انتخاب کنید.')
      return
    }

    const amount = parsePersonBalance(accountTransferFields.amount)
    if (amount === null || amount <= 0) {
      setAccountTransferError('مبلغ انتقال باید عددی صحیح و بیشتر از صفر باشد.')
      return
    }
    const parsedDate = new Date(`${accountTransferFields.date}T12:00:00Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(accountTransferFields.date)
      || Number.isNaN(parsedDate.getTime())
      || parsedDate.toISOString().slice(0, 10) !== accountTransferFields.date) {
      setAccountTransferError('تاریخ انتقال را به‌درستی وارد کنید.')
      return
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(accountTransferFields.time)) {
      setAccountTransferError('ساعت انتقال را به‌درستی وارد کنید.')
      return
    }
    if (accountTransferFields.sourceAccountId === accountTransferFields.destinationAccountId) {
      setAccountTransferError('حساب مبدأ و مقصد باید متفاوت باشند.')
      return
    }

    const source = storedAccounts.accounts.find((account) => account.id === accountTransferFields.sourceAccountId)
    const destination = storedAccounts.accounts.find((account) => account.id === accountTransferFields.destinationAccountId)
    if (!source || !destination) {
      setAccountTransferError('حساب مبدأ یا مقصد دیگر در فهرست موجود نیست.')
      return
    }
    if (source.balance < amount) {
      setAccountTransferError('موجودی حساب مبدأ برای این انتقال کافی نیست.')
      return
    }
    if (!Number.isSafeInteger(destination.balance + amount)) {
      setAccountTransferError('موجودی مقصد پس از انتقال از محدودهٔ مجاز بیشتر می‌شود.')
      return
    }

    const accounts = storedAccounts.accounts.map((account) => {
      if (account.id === source.id) return { ...account, balance: account.balance - amount }
      if (account.id === destination.id) return { ...account, balance: account.balance + amount }
      return account
    })
    const transfer: AccountTransfer = {
      id: `transfer-${Date.now()}`,
      sourceAccountId: source.id,
      destinationAccountId: destination.id,
      amount,
      date: accountTransferFields.date,
      time: accountTransferFields.time,
      calendar: accountTransferFields.calendar,
      note: accountTransferFields.note.trim(),
      ...(accountTransferFields.attachment ? { attachment: accountTransferFields.attachment } : {}),
      createdAt: new Date().toISOString(),
    }
    const transfers = [...storedAccountTransfers.transfers, transfer]
    let previousAccounts: string | null
    let previousTransfers: string | null
    let accountsKey: string
    let transfersKey: string

    try {
      accountsKey = getActiveStoreDataStorageKey(ACCOUNTS_STORAGE_KEY, activeStoreId)
      transfersKey = getActiveStoreDataStorageKey(ACCOUNT_TRANSFERS_STORAGE_KEY, activeStoreId)
      previousAccounts = localStorage.getItem(accountsKey)
      previousTransfers = localStorage.getItem(transfersKey)
    } catch {
      setAccountTransferError('ذخیره‌سازی انتقال انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
      return
    }

    try {
      localStorage.setItem(accountsKey, JSON.stringify(accounts))
      localStorage.setItem(transfersKey, JSON.stringify(transfers))
    } catch {
      let rollbackFailed = false
      try {
        if (previousAccounts === null) localStorage.removeItem(accountsKey)
        else localStorage.setItem(accountsKey, previousAccounts)
      } catch {
        rollbackFailed = true
      }
      try {
        if (previousTransfers === null) localStorage.removeItem(transfersKey)
        else localStorage.setItem(transfersKey, previousTransfers)
      } catch {
        rollbackFailed = true
      }
      setAccountTransferError(rollbackFailed
        ? 'ذخیرهٔ انتقال کامل نشد و بازگردانی خودکار اطلاعات هم انجام نشد؛ موجودی حساب‌ها را بررسی کنید.'
        : 'ذخیرهٔ انتقال انجام نشد؛ تغییر موجودی‌ها بازگردانده شد. فضای ذخیره‌سازی دستگاه را بررسی کنید.')
      return
    }

    setStoredAccounts({ accounts, error: '' })
    setStoredAccountTransfers({ transfers, error: '' })
    setAccountTransferOpen(false)
    setAccountTransferError('')
    setNotice('انتقال بین حساب‌ها ثبت شد.')
    window.setTimeout(() => setNotice(''), 2600)
  }

  const openMoneyDocumentForm = (kind: MoneyDocumentFormKind) => {
    const now = new Date()
    const { hours, minutes } = getIranClockParts(now)
    const defaultPerson = storedPeopleState.people.find((person) => (
      kind === 'دریافت' || kind === 'دریافت چک'
        ? person.role !== 'تأمین‌کننده'
        : person.role === 'تأمین‌کننده'
    )) ?? storedPeopleState.people[0]
    setMoneyDocumentKind(kind)
    if (kind === 'خرج چک') setStoredReceivedChecks(readStoredReceivedChecks(activeStoreId))
    setMoneyDocumentSelectedCheckId('')
    setMoneyDocumentCheckPickerOpen(false)
    setMoneyDocumentCalendar('persian')
    setMoneyDocumentFields({
      personId: kind !== 'خرج چک' && (kind === 'دریافت' || kind === 'پرداخت'
        || kind === 'دریافت چک' || kind === 'پرداخت چک'
        ) ? defaultPerson?.id ?? '' : '',
      accountId: storedAccounts.accounts[0]?.id ?? '',
      amount: '',
      description: '',
      sayadiId: '',
      leafNumber: '',
      serial: '',
      nationalId: '',
      dueDate: getIranDateValue(now),
      bankName: '',
      date: getIranDateValue(now),
      time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      note: '',
      attachment: null,
    })
    setMoneyDocumentError('')
    setMoneyDocumentNoteOpen(false)
    setMoneyDocumentDatePickerOpen(false)
    setMoneyDocumentTimePickerOpen(false)
    setMoneyDocumentAttachmentPickerOpen(false)
  }

  const openMoneyDocumentDatePicker = (target: 'document' | 'dueDate' = 'document') => {
    const dateValue = target === 'dueDate' ? moneyDocumentFields.dueDate : moneyDocumentFields.date
    const selectedDate = new Date(`${dateValue}T12:00:00Z`)
    const validDate = Number.isNaN(selectedDate.getTime()) ? normalizeUtcDate(new Date()) : selectedDate
    setMoneyDocumentDateTarget(target)
    setMoneyDocumentToday(getIranDateValue(new Date()))
    setMoneyDocumentDraftDate(validDate)
    setMoneyDocumentDraftCalendar(moneyDocumentCalendar)
    setMoneyDocumentVisibleMonth(validDate)
    setMoneyDocumentDatePickerOpen(true)
  }

  const saveMoneyDocumentDate = () => {
    const selectedDate = normalizeUtcDate(moneyDocumentDraftDate).toISOString().slice(0, 10)
    setMoneyDocumentFields((fields) => ({
      ...fields,
      [moneyDocumentDateTarget === 'dueDate' ? 'dueDate' : 'date']: selectedDate,
    }))
    if (moneyDocumentDateTarget === 'document') setMoneyDocumentCalendar(moneyDocumentDraftCalendar)
    setMoneyDocumentDatePickerOpen(false)
  }

  const openMoneyDocumentTimePicker = () => {
    const [hours, minutes] = moneyDocumentFields.time.split(':').map(Number)
    setMoneyDocumentDraftTime({
      hours: Number.isInteger(hours) ? hours : 0,
      minutes: Number.isInteger(minutes) ? minutes : 0,
    })
    setMoneyDocumentTimeField('hour')
    setMoneyDocumentTimeMode('clock')
    setMoneyDocumentTimePickerOpen(true)
  }

  const saveMoneyDocumentTime = () => {
    setMoneyDocumentFields((fields) => ({
      ...fields,
      time: `${String(moneyDocumentDraftTime.hours).padStart(2, '0')}:${String(moneyDocumentDraftTime.minutes).padStart(2, '0')}`,
    }))
    setMoneyDocumentTimePickerOpen(false)
  }

  const updateMoneyDocumentTimeField = (field: 'hour' | 'minute', value: string) => {
    const parsed = parseClockNumber(value)
    if (parsed === null) return
    const boundedValue = Math.max(0, Math.min(field === 'hour' ? 23 : 59, parsed))
    setMoneyDocumentDraftTime((time) => ({
      ...time,
      [field === 'hour' ? 'hours' : 'minutes']: boundedValue,
    }))
  }

  const openMoneyDocumentAttachmentPicker = () => {
    setMoneyDocumentDraftAttachment(moneyDocumentFields.attachment)
    setMoneyDocumentError('')
    setMoneyDocumentAttachmentPickerOpen(true)
  }

  const closeMoneyDocumentAttachmentPicker = () => {
    setMoneyDocumentDraftAttachment(moneyDocumentFields.attachment)
    setMoneyDocumentError('')
    setMoneyDocumentAttachmentPickerOpen(false)
  }

  const handleMoneyDocumentAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 3 * 1024 * 1024) {
      setMoneyDocumentError('پیوست باید تصویر و حداکثر ۳ مگابایت باشد.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setMoneyDocumentError('خواندن تصویر پیوست انجام نشد.')
        return
      }
      setMoneyDocumentDraftAttachment({ name: file.name, type: file.type, dataUrl: reader.result })
      setMoneyDocumentError('')
    }
    reader.onerror = () => setMoneyDocumentError('خواندن تصویر پیوست انجام نشد.')
    reader.readAsDataURL(file)
  }

  const confirmMoneyDocumentAttachment = () => {
    setMoneyDocumentFields((fields) => ({ ...fields, attachment: moneyDocumentDraftAttachment }))
    setMoneyDocumentError('')
    setMoneyDocumentAttachmentPickerOpen(false)
  }

  const saveMoneyDocument = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (moneyDocumentSavingRef.current || !moneyDocumentKind) return
    moneyDocumentSavingRef.current = true
    setMoneyDocumentSaving(true)
    setMoneyDocumentError('')

    try {
      if (!activeStoreId) throw new Error('برای ثبت سند ابتدا یک فروشگاه را انتخاب کنید.')
      if (moneyDocumentKind === 'خرج چک') {
        if (storedPeopleState.error) throw new Error(storedPeopleState.error)
        const person = storedPeopleState.people.find((item) => item.id === moneyDocumentFields.personId)
        if (!person) throw new Error('شخص مقصد واگذاری را انتخاب کنید.')

        const date = new Date(`${moneyDocumentFields.date}T12:00:00Z`)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(moneyDocumentFields.date)
          || Number.isNaN(date.getTime())
          || date.toISOString().slice(0, 10) !== moneyDocumentFields.date) {
          throw new Error('تاریخ واگذاری را به‌درستی وارد کنید.')
        }
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(moneyDocumentFields.time)) {
          throw new Error('ساعت واگذاری را به‌درستی وارد کنید.')
        }

        const receivedChecks = readStoredReceivedChecks(activeStoreId)
        if (receivedChecks.error) throw new Error(receivedChecks.error)
        const checkIndex = receivedChecks.checks.findIndex((check) => (
          check.id === moneyDocumentSelectedCheckId && !check.transfer
        ))
        if (checkIndex === -1) throw new Error('یک چک دریافتیِ آمادهٔ واگذاری انتخاب کنید.')

        const selectedCheck = receivedChecks.checks[checkIndex]
        const checks = receivedChecks.checks.map((check, index) => index === checkIndex
          ? {
            ...check,
            transfer: {
              personId: person.id,
              personName: person.name,
              date: moneyDocumentFields.date,
              calendar: moneyDocumentCalendar,
              time: moneyDocumentFields.time,
              note: moneyDocumentFields.note.trim(),
              createdAt: new Date().toISOString(),
            },
          }
          : check)
        const storageKey = getActiveStoreDataStorageKey(RECEIVED_CHECKS_STORAGE_KEY, activeStoreId)
        localStorage.setItem(storageKey, JSON.stringify(checks))
        setStoredReceivedChecks({ checks, error: '' })
        setMoneyDocumentKind(null)
        setMoneyDocumentCheckPickerOpen(false)
        setNotice(`چک شمارهٔ ${selectedCheck.number} به ${person.name} واگذار شد.`)
        window.setTimeout(() => setNotice(''), 3000)
        return
      }

      if (moneyDocumentKind === 'دریافت چک' || moneyDocumentKind === 'پرداخت چک') {
        const isReceivedCheck = moneyDocumentKind === 'دریافت چک'
        if (storedPeopleState.error) throw new Error(storedPeopleState.error)
        const person = storedPeopleState.people.find((item) => item.id === moneyDocumentFields.personId)
        if (!person) throw new Error('طرف حساب را انتخاب کنید.')

        const sayadiId = normalizeAccountDigits(moneyDocumentFields.sayadiId)
        if (sayadiId.length !== 16) throw new Error('شناسهٔ صیادی باید ۱۶ رقم باشد.')
        const dueDate = new Date(`${moneyDocumentFields.dueDate}T12:00:00Z`)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(moneyDocumentFields.dueDate)
          || Number.isNaN(dueDate.getTime())
          || dueDate.toISOString().slice(0, 10) !== moneyDocumentFields.dueDate) {
          throw new Error('تاریخ سررسید چک را به‌درستی وارد کنید.')
        }

        const amount = parsePersonBalance(moneyDocumentFields.amount)
        if (amount === null || amount <= 0) throw new Error('مبلغ باید عددی صحیح و بیشتر از صفر باشد.')
        if (!moneyDocumentFields.bankName.trim()) throw new Error('نام بانک را وارد کنید.')
        const date = new Date(`${moneyDocumentFields.date}T12:00:00Z`)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(moneyDocumentFields.date)
          || Number.isNaN(date.getTime())
          || date.toISOString().slice(0, 10) !== moneyDocumentFields.date) {
          throw new Error('تاریخ سند را به‌درستی وارد کنید.')
        }
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(moneyDocumentFields.time)) {
          throw new Error('ساعت سند را به‌درستی وارد کنید.')
        }

        const existingChecks = isReceivedCheck
          ? readStoredReceivedChecks(activeStoreId)
          : readStoredPaidChecks(activeStoreId)
        if (existingChecks.error) throw new Error(existingChecks.error)
        const check: CheckRecord = {
          id: `${isReceivedCheck ? 'received' : 'paid'}-check-${activeStoreId}-${Date.now()}`,
          number: formatPersonCode(existingChecks.checks.length + 1),
          personId: person.id,
          personName: person.name,
          sayadiId,
          leafNumber: moneyDocumentFields.leafNumber.trim(),
          serial: moneyDocumentFields.serial.trim(),
          nationalId: normalizeAccountDigits(moneyDocumentFields.nationalId),
          dueDate: moneyDocumentFields.dueDate,
          amount,
          bankName: moneyDocumentFields.bankName.trim(),
          date: moneyDocumentFields.date,
          calendar: moneyDocumentCalendar,
          time: moneyDocumentFields.time,
          note: moneyDocumentFields.note.trim(),
          ...(moneyDocumentFields.attachment ? { attachment: moneyDocumentFields.attachment } : {}),
          createdAt: new Date().toISOString(),
        }
        const checks = [...existingChecks.checks, check]
        const storageKey = getActiveStoreDataStorageKey(
          isReceivedCheck ? RECEIVED_CHECKS_STORAGE_KEY : PAID_CHECKS_STORAGE_KEY,
          activeStoreId,
        )
        localStorage.setItem(storageKey, JSON.stringify(checks))
        if (isReceivedCheck) setStoredReceivedChecks({ checks, error: '' })
        else setStoredPaidChecks({ checks, error: '' })
        setMoneyDocumentKind(null)
        setNotice(isReceivedCheck
          ? `چک دریافتی از ${person.name} ثبت شد.`
          : `چک پرداختی به ${person.name} ثبت شد.`)
        window.setTimeout(() => setNotice(''), 3000)
        return
      }

      if (storedMoneyDocuments.error) throw new Error(storedMoneyDocuments.error)
      if (storedAccounts.error) throw new Error(storedAccounts.error)
      const needsPerson = moneyDocumentKind === 'دریافت' || moneyDocumentKind === 'پرداخت'
      if (needsPerson && storedPeopleState.error) throw new Error(storedPeopleState.error)

      const amount = parsePersonBalance(moneyDocumentFields.amount)
      if (amount === null || amount <= 0) throw new Error('مبلغ باید عددی صحیح و بیشتر از صفر باشد.')
      const date = new Date(`${moneyDocumentFields.date}T12:00:00Z`)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(moneyDocumentFields.date)
        || Number.isNaN(date.getTime())
        || date.toISOString().slice(0, 10) !== moneyDocumentFields.date) {
        throw new Error('تاریخ سند را به‌درستی وارد کنید.')
      }
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(moneyDocumentFields.time)) {
        throw new Error('ساعت سند را به‌درستی وارد کنید.')
      }
      if ((moneyDocumentKind === 'هزینه' || moneyDocumentKind === 'درآمد')
        && !moneyDocumentFields.description.trim()) {
        throw new Error(`شرح ${moneyDocumentKind} را وارد کنید.`)
      }

      const account = storedAccounts.accounts.find((item) => item.id === moneyDocumentFields.accountId)
      if (!account) throw new Error('حساب را انتخاب کنید.')
      const isInflow = moneyDocumentKind === 'دریافت' || moneyDocumentKind === 'درآمد'
      if (!isInflow && account.balance < amount) {
        throw new Error('موجودی حساب برای ثبت این مبلغ کافی نیست.')
      }
      const nextAccountBalance = account.balance + (isInflow ? amount : -amount)
      if (!Number.isSafeInteger(nextAccountBalance) || nextAccountBalance < 0) {
        throw new Error('موجودی حساب پس از ثبت سند از محدودهٔ مجاز خارج می‌شود.')
      }
      const accounts = storedAccounts.accounts.map((item) => (
        item.id === account.id ? { ...item, balance: nextAccountBalance } : item
      ))

      const person = needsPerson
        ? storedPeopleState.people.find((item) => item.id === moneyDocumentFields.personId)
        : undefined
      if (needsPerson && !person) throw new Error('شخص سند را انتخاب کنید.')
      let people = storedPeopleState.people
      if (person) {
        const signedBalance = person.accountStatus === 'بدهکاران'
          ? person.balance
          : person.accountStatus === 'بستانکاران' ? -person.balance : 0
        const nextBalance = signedBalance + (moneyDocumentKind === 'دریافت' ? -amount : amount)
        const transactionCount = (person.transactionCount ?? 0) + 1
        if (!Number.isSafeInteger(nextBalance) || !Number.isSafeInteger(transactionCount)) {
          throw new Error('ماندهٔ شخص پس از ثبت سند از محدودهٔ مجاز خارج می‌شود.')
        }
        people = storedPeopleState.people.map((item) => item.id === person.id
          ? {
              ...item,
              accountStatus: nextBalance > 0
                ? 'بدهکاران'
                : nextBalance < 0 ? 'بستانکاران' : 'تسویه شده',
              balance: Math.abs(nextBalance),
              transactionCount,
            }
          : item)
      }

      const existingDocuments = readStoredMoneyDocuments(activeStoreId)
      if (existingDocuments.error) throw new Error(existingDocuments.error)
      const document: MoneyDocument = {
        id: `money-document-${activeStoreId}-${Date.now()}`,
        number: formatPersonCode(existingDocuments.documents.filter((item) => item.kind === moneyDocumentKind).length + 1),
        kind: moneyDocumentKind,
        personId: person?.id ?? null,
        personName: person?.name ?? '',
        accountId: account.id,
        amount,
        description: moneyDocumentFields.description.trim(),
        date: moneyDocumentFields.date,
        calendar: 'gregory',
        time: moneyDocumentFields.time,
        note: moneyDocumentFields.note.trim(),
        ...(moneyDocumentFields.attachment ? { attachment: moneyDocumentFields.attachment } : {}),
        createdAt: new Date().toISOString(),
      }
      const documents = [...existingDocuments.documents, document]
      const keys = {
        documents: getActiveStoreDataStorageKey(MONEY_DOCUMENTS_STORAGE_KEY, activeStoreId),
        accounts: getActiveStoreDataStorageKey(ACCOUNTS_STORAGE_KEY, activeStoreId),
        people: getActiveStoreDataStorageKey(PEOPLE_STORAGE_KEY, activeStoreId),
      }
      const previousValues = new Map<string, string | null>()
      for (const key of [keys.documents, keys.accounts, ...(person ? [keys.people] : [])]) {
        previousValues.set(key, localStorage.getItem(key))
      }

      try {
        localStorage.setItem(keys.documents, JSON.stringify(documents))
        localStorage.setItem(keys.accounts, JSON.stringify(accounts))
        if (person) localStorage.setItem(keys.people, JSON.stringify(people))
      } catch {
        let rollbackFailed = false
        for (const [key, value] of previousValues) {
          try {
            if (value === null) localStorage.removeItem(key)
            else localStorage.setItem(key, value)
          } catch {
            rollbackFailed = true
          }
        }
        throw new Error(rollbackFailed
          ? 'ثبت سند کامل نشد و بازگردانی اطلاعات هم انجام نشد؛ ماندهٔ حساب‌ها را بررسی کنید.'
          : 'ذخیرهٔ سند انجام نشد؛ تغییرات حساب و شخص بازگردانده شد.')
      }

      setStoredMoneyDocuments({ documents, error: '' })
      setStoredAccounts({ accounts, error: '' })
      if (person) setStoredPeopleState({ people, error: '' })
      setMoneyDocumentKind(null)
      setNotice(`سند ${moneyDocumentKind} ثبت شد.`)
      window.setTimeout(() => setNotice(''), 3000)
    } catch (error) {
      setMoneyDocumentError(error instanceof Error ? error.message : 'ثبت سند انجام نشد؛ دوباره تلاش کنید.')
    } finally {
      moneyDocumentSavingRef.current = false
      setMoneyDocumentSaving(false)
    }
  }

  const persistStoreUsers = (users: StoreUser[]) => {
    if (storedStoreUsers.error) {
      setStoreUserFormError(storedStoreUsers.error)
      return false
    }

    try {
      localStorage.setItem(
        getActiveStoreDataStorageKey(STORE_USERS_STORAGE_KEY, activeStoreId),
        JSON.stringify(users),
      )
      setStoredStoreUsers({ users, error: '' })
      setStoreUserFormError('')
      return true
    } catch {
      const error = 'ذخیرهٔ کاربران انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.'
      setStoredStoreUsers((current) => ({ ...current, error }))
      setStoreUserFormError(error)
      return false
    }
  }

  const saveStoreUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = storeUserFields.name.trim()
    const phone = storeUserFields.phone.trim()
    if (!activeStoreId) {
      setStoreUserFormError('برای افزودن کاربر ابتدا یک فروشگاه را انتخاب کنید.')
      return
    }
    if (!name || !phone) {
      setStoreUserFormError('نام کاربر و شماره تلفن را وارد کنید.')
      return
    }
    if (storedStoreUsers.users.some((user) => user.phone.replace(/\s/g, '') === phone.replace(/\s/g, ''))) {
      setStoreUserFormError('این شماره تلفن در فهرست کاربران فروشگاه وجود دارد.')
      return
    }

    const user: StoreUser = {
      ...storeUserFields,
      name,
      phone,
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }
    if (persistStoreUsers([...storedStoreUsers.users, user])) {
      setStoreUserFormOpen(false)
      setStoreUserFields(emptyStoreUserFields)
    }
  }

  const toggleStoreUser = (userId: string) => {
    persistStoreUsers(storedStoreUsers.users.map((user) => (
      user.id === userId ? { ...user, active: !user.active } : user
    )))
  }

  const deleteStoreUser = (userId: string) => {
    if (persistStoreUsers(storedStoreUsers.users.filter((user) => user.id !== userId))) {
      setDeleteConfirmUserId(null)
    }
  }

  const selectSecurityLoginMethod = (loginMethod: SecurityLoginMethod) => {
    try {
      const next = { ...securitySettings, loginMethod, error: '' }
      localStorage.setItem(SECURITY_SETTINGS_STORAGE_KEY, JSON.stringify({
        loginMethod: next.loginMethod,
        notificationAccessEnabled: next.notificationAccessEnabled,
        cameraAccessEnabled: next.cameraAccessEnabled,
      }))
      setSecuritySettings(next)
      setSecurityNotice('روش ورود انتخابی ذخیره شد؛ برای فعال‌شدن ورود واقعی باید سامانهٔ احراز هویت برنامه راه‌اندازی شود.')
    } catch {
      const error = 'ذخیرهٔ روش ورود انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.'
      setSecuritySettings((current) => ({ ...current, error }))
      setSecurityNotice(error)
    }
  }

  const setSecurityAccessPreference = (permission: 'notifications' | 'camera', enabled: boolean) => {
    const next = {
      ...securitySettings,
      notificationAccessEnabled: permission === 'notifications'
        ? enabled
        : securitySettings.notificationAccessEnabled,
      cameraAccessEnabled: permission === 'camera'
        ? enabled
        : securitySettings.cameraAccessEnabled,
      error: '',
    }

    try {
      localStorage.setItem(SECURITY_SETTINGS_STORAGE_KEY, JSON.stringify({
        loginMethod: next.loginMethod,
        notificationAccessEnabled: next.notificationAccessEnabled,
        cameraAccessEnabled: next.cameraAccessEnabled,
      }))
      setSecuritySettings(next)
      return true
    } catch {
      const error = 'ذخیرهٔ اجازهٔ برنامه انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.'
      setSecuritySettings((current) => ({ ...current, error }))
      setSecurityNotice(error)
      return false
    }
  }

  const requestNotificationAccess = async () => {
    if (!window.isSecureContext || typeof Notification === 'undefined') {
      setSecurityPermissionStatus((current) => ({ ...current, notifications: 'unsupported' }))
      setSecurityNotice('درخواست اعلان در این مرورگر یا نشانی امن پشتیبانی نمی‌شود.')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      const status: BrowserPermissionStatus = permission === 'granted'
        ? 'granted'
        : permission === 'denied'
        ? 'denied'
        : 'unknown'
      setSecurityPermissionStatus((current) => ({ ...current, notifications: status }))
      if (!setSecurityAccessPreference('notifications', permission === 'granted')) return
      setSecurityNotice(permission === 'granted'
        ? 'اجازهٔ نمایش اعلان برای این دستگاه ثبت شد.'
        : permission === 'denied'
        ? 'اجازهٔ اعلان رد شد؛ آن را از تنظیمات مرورگر تغییر بده.'
        : 'درخواست اعلان هنوز تأیید نشده است.')
    } catch {
      setSecurityNotice('درخواست اجازهٔ اعلان انجام نشد؛ تنظیمات مرورگر را بررسی کن.')
    }
  }

  const requestCameraAccess = async () => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setSecurityPermissionStatus((current) => ({ ...current, camera: 'unsupported' }))
      setSecurityNotice('دسترسی دوربین در این مرورگر یا نشانی امن پشتیبانی نمی‌شود.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach((track) => track.stop())
      setSecurityPermissionStatus((current) => ({ ...current, camera: 'granted' }))
      if (!setSecurityAccessPreference('camera', true)) return
      setSecurityNotice('اجازهٔ دوربین ثبت شد. دسترسی فقط هنگام استفاده از دوربین به‌کار می‌رود.')
    } catch (error) {
      const denied = error instanceof DOMException
        && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError')
      setSecurityPermissionStatus((current) => ({
        ...current,
        camera: denied ? 'denied' : 'unknown',
      }))
      if (!setSecurityAccessPreference('camera', false)) return
      setSecurityNotice(denied
        ? 'اجازهٔ دوربین رد شد؛ آن را از تنظیمات مرورگر تغییر بده.'
        : 'درخواست دوربین انجام نشد؛ اتصال امن و تنظیمات دستگاه را بررسی کن.')
    }
  }

  const createLocalBackup = () => {
    try {
      const legacyOwner = localStorage.getItem(STORE_DATA_MIGRATION_KEY)
      const backup = {
        format: 'gerdoo-accounting-backup',
        version: 1,
        createdAt: new Date().toISOString(),
        source: 'local-device',
        activeStoreId,
        legacyDataOwnerStoreId: legacyOwner === null ? null : Number(legacyOwner),
        stores: stores.map((store) => {
          const data: Record<string, string | null> = {}
          for (const key of STORE_DATA_KEYS) {
            data[key] = localStorage.getItem(getStoreDataStorageKey(key, store.id))
              ?? (legacyOwner === String(store.id) ? localStorage.getItem(key) : null)
          }
          return {
            store: {
              id: store.id,
              name: store.name,
              address: store.address,
              phone: store.phone,
              code: store.code,
              currency: store.currency,
            },
            data,
          }
        }),
      }
      const content = JSON.stringify(backup, null, 2)
      const url = URL.createObjectURL(new Blob([content], { type: 'application/json;charset=utf-8' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `gerdoo-backup-${getIranDateValue(now)}.json`
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setBackupNotice(`نسخهٔ پشتیبان ${stores.length} فروشگاه برای دریافت آماده شد. فایل را در جای امن نگهداری کن.`)
    } catch {
      setBackupNotice('ساخت نسخهٔ پشتیبان انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کن.')
    }
  }

  const readBackupFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return

    setBackupImportError('')
    setBackupNotice('')
    if (file.size > 50 * 1024 * 1024) {
      setBackupImportError('حجم فایل پشتیبان بیشتر از حد مجاز ۵۰ مگابایت است.')
      return
    }

    try {
      const content = await file.text()
      const parsed: unknown = JSON.parse(content)
      if (!isAccountingBackup(parsed)) {
        setBackupImportError('ساختار فایل معتبر نیست یا فایل پشتیبان حسابداری گردو نیست.')
        return
      }

      setBackupImport({
        backup: parsed,
        filename: file.name,
        mode: null,
      })
    } catch {
      setBackupImportError('خواندن فایل پشتیبان انجام نشد؛ از سالم‌بودن و قالب JSON فایل مطمئن شو.')
    }
  }

  const restoreImportedBackup = () => {
    if (!backupImport || !backupImport.mode) return

    const { backup, mode } = backupImport
    const importedById = new Map(backup.stores.map((entry) => [entry.store.id, entry]))
    const nextStores = mode === 'replace'
      ? backup.stores.map((entry) => entry.store)
      : [
          ...stores.filter((store) => !importedById.has(store.id)),
          ...backup.stores.map((entry) => entry.store),
        ]
    const nextActiveStoreId = mode === 'replace'
      ? backup.activeStoreId ?? nextStores[0]?.id ?? null
      : backup.activeStoreId ?? (stores.some((store) => store.id === activeStoreId) ? activeStoreId : null) ?? nextStores[0]?.id ?? null
    const plannedChanges = new Map<string, string | null>()

    plannedChanges.set(STORE_STORAGE_KEY, JSON.stringify({
      format: 'trazino-store-workspace',
      version: 1,
      stores: nextStores,
      activeStoreId: nextActiveStoreId,
    }))

    const targetStoreIds = mode === 'replace'
      ? new Set([...stores, ...backup.stores.map((entry) => entry.store)].map((store) => store.id))
      : new Set(backup.stores.map((entry) => entry.store.id))

    if (mode === 'replace') {
      for (const storeId of targetStoreIds) {
        for (const key of STORE_DATA_KEYS) {
          plannedChanges.set(getStoreDataStorageKey(key, storeId), null)
        }
      }
      for (const key of STORE_DATA_KEYS) plannedChanges.set(key, null)
    }

    for (const entry of backup.stores) {
      for (const key of STORE_DATA_KEYS) {
        const value = entry.data[key] ?? null
        plannedChanges.set(
          getStoreDataStorageKey(key, entry.store.id),
          value,
        )
      }
    }

    try {
      const currentMigrationOwner = localStorage.getItem(STORE_DATA_MIGRATION_KEY)
      if (currentMigrationOwner !== null && !/^\d+$/.test(currentMigrationOwner)) {
        throw new Error('Invalid local store data owner')
      }

      if (mode === 'replace') {
        const restoredOwner = backup.legacyDataOwnerStoreId ?? nextStores[0]?.id ?? null
        plannedChanges.set(
          STORE_DATA_MIGRATION_KEY,
          restoredOwner === null ? null : String(restoredOwner),
        )
      } else if (currentMigrationOwner === null) {
        const migrationOwner = activeStoreId !== null && nextStores.some((store) => store.id === activeStoreId)
          ? activeStoreId
          : backup.activeStoreId ?? nextStores[0]?.id ?? null
        if (migrationOwner !== null) {
          const ownerIsImported = importedById.has(migrationOwner)
          if (!ownerIsImported) {
            for (const key of STORE_DATA_KEYS) {
              const legacyValue = localStorage.getItem(key)
              const ownerStoreKey = getStoreDataStorageKey(key, migrationOwner)
              if (legacyValue !== null && localStorage.getItem(ownerStoreKey) === null) {
                plannedChanges.set(ownerStoreKey, legacyValue)
              }
            }
          }
          plannedChanges.set(STORE_DATA_MIGRATION_KEY, String(migrationOwner))
        }
      }

      const previousValues = new Map<string, string | null>()
      for (const key of plannedChanges.keys()) previousValues.set(key, localStorage.getItem(key))

      try {
        for (const [key, value] of plannedChanges) {
          if (value === null) localStorage.removeItem(key)
          else localStorage.setItem(key, value)
        }
      } catch {
        let rollbackFailed = false
        for (const [key, value] of [...previousValues].reverse()) {
          try {
            if (value === null) localStorage.removeItem(key)
            else localStorage.setItem(key, value)
          } catch {
            rollbackFailed = true
          }
        }
        throw new Error(rollbackFailed ? 'restore-and-rollback-failed' : 'restore-failed')
      }

      const nextState: StoredStoreState = {
        stores: nextStores,
        activeStoreId: nextActiveStoreId,
        error: '',
      }
      setStoreState(nextState)
      loadStoreWorkspace(nextActiveStoreId)
      setBackupImport(null)
      setBackupImportError('')
      setBackupNotice(mode === 'replace'
        ? `نسخهٔ پشتیبان «${backupImport.filename}» با ${backup.stores.length} فروشگاه بازیابی شد.`
        : `اطلاعات ${backup.stores.length} فروشگاه از «${backupImport.filename}» ادغام شد.`)
    } catch (error) {
      const rollbackFailed = error instanceof Error && error.message === 'restore-and-rollback-failed'
      setBackupImportError(rollbackFailed
        ? 'بازیابی انجام نشد و بازگردانی کامل اطلاعات قبلی ممکن نبود؛ برنامه را نبند و وضعیت فضای ذخیره‌سازی دستگاه را بررسی کن.'
        : 'بازیابی نسخهٔ پشتیبان انجام نشد؛ اطلاعات قبلی حفظ شدند. فضای ذخیره‌سازی دستگاه را بررسی کن.')
    }
  }

  const checkServerDiscrepancies = () => {
    setServerComparisonNotice('سرور حسابداری هنوز به برنامه متصل نشده است؛ بنابراین بررسی مغایرت ممکن نیست. اطلاعات فعلاً فقط روی این دستگاه ذخیره می‌شود.')
  }

  useEffect(() => {
    let widgetObserver: ResizeObserver | undefined
    const observeWidget = () => {
      const widget = document.getElementById('goftino_w')
      if (!widget || widget.dataset.trazinoObserved === 'true') return

      widget.dataset.trazinoObserved = 'true'
      const updateLauncherVisibility = () => {
        const { width, height } = widget.getBoundingClientRect()
        widget.classList.toggle(
          'trazino-launcher-hidden',
          width <= 100 && height <= 100,
        )
      }

      widgetObserver = new ResizeObserver(updateLauncherVisibility)
      widgetObserver.observe(widget)
      updateLauncherVisibility()
    }

    const widgetListObserver = new MutationObserver(observeWidget)
    widgetListObserver.observe(document.body, { childList: true })
    observeWidget()

    return () => {
      widgetListObserver.disconnect()
      widgetObserver?.disconnect()
    }
  }, [])

  const showComingSoon = (label: string) => {
    setNotice(`بخش «${label}» در مرحلهٔ بعدی طراحی می‌شود`)
    window.setTimeout(() => setNotice(''), 2600)
  }

  const setCheckClearedStatus = (kind: CheckListKind, checkId: string, cleared: boolean) => {
    try {
      if (!activeStoreId) throw new Error('برای به‌روزرسانی چک ابتدا یک فروشگاه را انتخاب کنید.')
      const current = kind === 'received'
        ? readStoredReceivedChecks(activeStoreId)
        : readStoredPaidChecks(activeStoreId)
      if (current.error) throw new Error(current.error)
      const existingCheck = current.checks.find((check) => check.id === checkId)
      if (!existingCheck) throw new Error('چک در فهرست پیدا نشد؛ فهرست را به‌روزرسانی کنید.')
      const updatedCheck: CheckRecord = { ...existingCheck }
      if (cleared) updatedCheck.clearedAt = new Date().toISOString()
      else delete updatedCheck.clearedAt
      const checks = current.checks.map((check) => check.id === checkId ? updatedCheck : check)
      const storageKey = getActiveStoreDataStorageKey(
        kind === 'received' ? RECEIVED_CHECKS_STORAGE_KEY : PAID_CHECKS_STORAGE_KEY,
        activeStoreId,
      )
      localStorage.setItem(storageKey, JSON.stringify(checks))
      if (kind === 'received') setStoredReceivedChecks({ checks, error: '' })
      else setStoredPaidChecks({ checks, error: '' })
      setNotice(cleared ? 'وضعیت چک به «پاس شده» تغییر کرد.' : 'چک دوباره به فهرست پاس‌نشده‌ها برگشت.')
      window.setTimeout(() => setNotice(''), 3000)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'به‌روزرسانی وضعیت چک انجام نشد.')
      window.setTimeout(() => setNotice(''), 4000)
    }
  }

  const releaseSalesInvoiceAttachmentUrl = (url: string) => {
    URL.revokeObjectURL(url)
    salesInvoiceAttachmentUrlsRef.current.delete(url)
  }

  const openSalesInvoice = () => {
    setSalesInvoiceEditingId(null)
    setSalesInvoiceConfirmation(null)
    setSalesInvoiceOpenedFromList(false)
    setSalesInvoiceMoreOpen(false)
    setSalesInvoicePaymentMenuOpen(false)
    setSalesInvoiceSaveError('')
    setSalesInvoicePartyError('')
    if (salesInvoiceAttachment) {
      releaseSalesInvoiceAttachmentUrl(salesInvoiceAttachment.previewUrl)
    }
    if (
      salesInvoiceDraftAttachment
      && salesInvoiceDraftAttachment.previewUrl !== salesInvoiceAttachment?.previewUrl
    ) {
      releaseSalesInvoiceAttachmentUrl(salesInvoiceDraftAttachment.previewUrl)
    }
    setSalesInvoiceLines([])
    setSalesInvoiceAdjustments([])
    setSalesInvoicePerson('')
    setSalesInvoiceNote('')
    setSalesInvoiceAttachment(null)
    setSalesInvoiceDraftAttachment(null)
    setSalesInvoiceAttachmentPickerOpen(false)
    setSalesInvoiceAttachmentError('')
    setSalesInvoiceItemSearch('')
    setSalesInvoiceDraftItem(null)
    setSalesInvoiceDate(todayInvoiceDate)
    setSalesInvoiceCalendar('persian')
    setSalesInvoiceTime(getIranClockParts(now))
    setActiveTab('فاکتور فروش')
  }

  const openPurchaseInvoice = () => {
    openSalesInvoice()
    setActiveTab('فاکتور خرید')
  }

  const openReturnSalesInvoice = () => {
    openSalesInvoice()
    setActiveTab('برگشت از فروش')
  }

  const openReturnPurchaseInvoice = () => {
    openSalesInvoice()
    setActiveTab('برگشت به خرید')
  }

  const openSalesInvoiceDatePicker = () => {
    const selectedDate = normalizeUtcDate(salesInvoiceDate)
    setSalesInvoiceDraftDate(selectedDate)
    setSalesInvoiceDraftCalendar(salesInvoiceCalendar)
    setSalesInvoiceVisibleMonth(selectedDate)
    setSalesInvoiceDatePickerOpen(true)
  }

  const moveSalesInvoiceCalendarMonth = (direction: -1 | 1) => {
    setSalesInvoiceVisibleMonth((month) =>
      getAdjacentCalendarMonthDate(month, salesInvoiceDraftCalendar, direction))
  }

  const selectSalesInvoiceCalendar = (calendar: CalendarSystem) => {
    setSalesInvoiceDraftCalendar(calendar)
    setSalesInvoiceVisibleMonth(salesInvoiceDraftDate)
  }

  const saveSalesInvoiceDate = () => {
    setSalesInvoiceDate(normalizeUtcDate(salesInvoiceDraftDate))
    setSalesInvoiceCalendar(salesInvoiceDraftCalendar)
    setSalesInvoiceDatePickerOpen(false)
  }

  const openSalesInvoiceTimePicker = () => {
    setSalesInvoiceDraftTime(salesInvoiceTime)
    setSalesInvoiceTimeField('hour')
    setSalesInvoiceTimeMode('clock')
    setSalesInvoiceTimePickerOpen(true)
  }

  const openSalesInvoiceAttachmentPicker = () => {
    setSalesInvoiceDraftAttachment(salesInvoiceAttachment)
    setSalesInvoiceAttachmentError('')
    setSalesInvoiceAttachmentPickerOpen(true)
  }

  const closeSalesInvoiceAttachmentPicker = () => {
    if (
      salesInvoiceDraftAttachment
      && salesInvoiceDraftAttachment.previewUrl !== salesInvoiceAttachment?.previewUrl
    ) {
      releaseSalesInvoiceAttachmentUrl(salesInvoiceDraftAttachment.previewUrl)
    }
    setSalesInvoiceAttachmentPickerOpen(false)
    setSalesInvoiceDraftAttachment(null)
    setSalesInvoiceAttachmentError('')
  }

  const handleSalesInvoiceAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setSalesInvoiceAttachmentError('فقط فایل تصویری را می‌توان پیوست کرد.')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setSalesInvoiceAttachmentError('حجم تصویر پیوست نباید بیشتر از ۳ مگابایت باشد.')
      return
    }

    const previewUrl = URL.createObjectURL(file)
    salesInvoiceAttachmentUrlsRef.current.add(previewUrl)
    if (
      salesInvoiceDraftAttachment
      && salesInvoiceDraftAttachment.previewUrl !== salesInvoiceAttachment?.previewUrl
    ) {
      releaseSalesInvoiceAttachmentUrl(salesInvoiceDraftAttachment.previewUrl)
    }
    setSalesInvoiceDraftAttachment({ file, previewUrl })
    setSalesInvoiceAttachmentError('')
  }

  const confirmSalesInvoiceAttachment = () => {
    if (
      salesInvoiceAttachment
      && salesInvoiceAttachment.previewUrl !== salesInvoiceDraftAttachment?.previewUrl
    ) {
      releaseSalesInvoiceAttachmentUrl(salesInvoiceAttachment.previewUrl)
    }
    setSalesInvoiceAttachment(salesInvoiceDraftAttachment)
    setSalesInvoiceDraftAttachment(null)
    setSalesInvoiceAttachmentPickerOpen(false)
    setSalesInvoiceAttachmentError('')
  }

  const updateSalesInvoiceTimeField = (field: 'hour' | 'minute', value: string) => {
    const parsed = parseClockNumber(value)
    if (parsed === null) return
    const boundedValue = Math.max(0, Math.min(field === 'hour' ? 23 : 59, parsed))
    setSalesInvoiceDraftTime((time) => ({
      ...time,
      [field === 'hour' ? 'hours' : 'minutes']: boundedValue,
    }))
  }

  const saveSalesInvoiceTime = () => {
    setSalesInvoiceTime(salesInvoiceDraftTime)
    setSalesInvoiceTimePickerOpen(false)
  }

  const openSalesInvoiceSettings = () => {
    setSalesInvoiceDraftSettings({ ...salesInvoiceSettings })
    setSalesInvoiceSettingsOpen(true)
  }

  const saveSalesInvoiceSettings = () => {
    try {
      localStorage.setItem(
        getActiveStoreDataStorageKey(SALES_INVOICE_SETTINGS_STORAGE_KEY, activeStoreId),
        JSON.stringify(salesInvoiceDraftSettings),
      )
      setSalesInvoiceSettings(salesInvoiceDraftSettings)
      if (!salesInvoiceDraftSettings.enableItemDiscount) {
        setSalesInvoiceLines((lines) => lines.map((line) => ({ ...line, discount: 0 })))
      }
      setSalesInvoiceSettingsOpen(false)
    } catch {
      setNotice('ذخیرهٔ تنظیمات فاکتور انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
      window.setTimeout(() => setNotice(''), 2600)
    }
  }

  const getSalesInvoicePrintDocument = (
    autoPrint: boolean,
    savedInvoice?: SavedSalesInvoice,
    documentTitle = 'فاکتور فروش',
  ) => {
    const printNumber = savedInvoice?.number ?? salesInvoiceNumber
    const printDate = savedInvoice
      ? new Date(`${savedInvoice.date}T12:00:00Z`)
      : salesInvoiceDate
    const printCalendar = savedInvoice?.calendar ?? salesInvoiceCalendar
    const printTime = savedInvoice?.time ?? salesInvoiceTime
    const printPerson = savedInvoice
      ? allPeople.find((person) => person.id === savedInvoice.personId)
      : selectedSalesInvoicePerson
    const printNote = savedInvoice?.note ?? salesInvoiceNote
    const printAttachment = savedInvoice ? savedInvoice.attachment : salesInvoiceAttachment
    const printSubtotal = savedInvoice?.subtotal ?? salesInvoiceSubtotal
    const printTotal = savedInvoice?.total ?? salesInvoiceTotal
    const printAdjustments = savedInvoice?.adjustments ?? salesInvoiceAdjustments
    const printLines = savedInvoice
      ? savedInvoice.lines.map((line) => ({
        description: line.description,
        unit: line.unit,
        kind: line.kind,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discount: line.discount,
        total: line.total,
      }))
      : salesInvoiceLines.flatMap((line) => {
        const item = storedInventoryRecords.items.find((inventoryItem) => inventoryItem.id === line.itemId)
        if (!item) return []
        const unitPrice = line.unitPrice ?? item.salePrice
        return [{
          description: line.description || item.name,
          unit: item.unit,
          kind: item.kind,
          quantity: line.quantity,
          unitPrice,
          discount: line.discount,
          total: Math.max(0, unitPrice * line.quantity - line.discount),
        }]
      })
    const escapeHtml = (value: string) => value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
    const appFrame = document.querySelector('.app-frame')
    const invoiceAccent = getComputedStyle(appFrame ?? document.documentElement)
      .getPropertyValue('--app-color-accent').trim() || '#168b7e'
    const invoiceDeep = getComputedStyle(appFrame ?? document.documentElement)
      .getPropertyValue('--app-color-deep').trim() || '#115f58'
    const itemRows = printLines.map((line, index) => {
      return `<tr><td>${formatPersonCode(index + 1)}</td><td><strong>${escapeHtml(line.description)}</strong><small>${escapeHtml(line.unit)} · ${escapeHtml(line.kind)}</small></td><td>${formatPersonBalance(line.quantity)}</td><td>${formatPersonBalance(line.unitPrice)}</td><td>${formatPersonBalance(line.discount)}</td><td>${formatPersonBalance(line.total)}</td></tr>`
    }).join('')
    const blankRows = Array.from({ length: Math.max(0, 8 - printLines.length) }, () => (
      '<tr class="blank-row"><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>'
    )).join('')
    const adjustmentRows = printAdjustments.map((adjustment) => {
      const amount = adjustment.mode === 'percent'
        ? Math.round(printSubtotal * adjustment.value / 100)
        : adjustment.value
      const kind = adjustment.kind === 'addition' ? 'اضافه' : 'کسر'
      const sign = adjustment.kind === 'addition' ? '+' : '−'
      return `<div><span>${escapeHtml(kind)}: ${escapeHtml(adjustment.description)}</span><strong>${sign}${formatPersonBalance(amount)} ریال</strong></div>`
    }).join('')

    return `<!doctype html>
      <html lang="fa" dir="rtl" class="${autoPrint ? 'invoice-print-document' : 'invoice-preview-document'}">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${escapeHtml(documentTitle)} ${escapeHtml(printNumber)}</title>
          <style>
            @page{size:A4 portrait;margin:0}
            *{box-sizing:border-box}
            body{margin:0;background:#eee;color:#201b26;font-family:Vazirmatn,Tahoma,Arial,sans-serif;font-size:10px}
            .invoice-preview-document,.invoice-preview-document body{width:100%;height:100%;min-height:100%;margin:0;overflow:auto;background:#fff}
            .invoice-preview-document .sheet{width:100%;min-height:100%;margin:0;padding:24px 22px 34px;box-shadow:none}
            .sheet{position:relative;width:210mm;min-height:297mm;margin:12px auto;padding:19mm 12mm 18mm;background:#fff;overflow:hidden}
            .ornament{position:absolute;right:0;left:0;height:11mm;background:linear-gradient(110deg,${invoiceAccent}55 0 75%,${invoiceDeep} 75% 100%);overflow:hidden}
            .ornament:before{position:absolute;inset:0 auto 0 0;width:25mm;content:"";background:repeating-linear-gradient(130deg,transparent 0 5px,#fff 5px 8px,transparent 8px 13px)}
            .ornament.top{top:0;clip-path:polygon(5% 0,100% 0,96% 100%,0 100%)}
            .ornament.bottom{bottom:0;transform:rotate(180deg);clip-path:polygon(5% 0,100% 0,96% 100%,0 100%)}
            .head{height:22mm;display:grid;grid-template-columns:1fr 2.2fr 1fr;border:1px solid #25202a}
            .head>div{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:4px;padding:5px;border-left:1px solid #25202a}
            .head>div:last-child{border:0}.head h1{margin:0;font-size:20px}
            .brand{color:${invoiceDeep};font-size:14px;font-weight:800}
            .meta{display:grid;grid-template-columns:1fr 1fr;height:100%}
            .meta span{font-size:8px;color:#625b69}.meta strong{font-size:10px}
            .party{position:relative;margin-top:3mm;padding:7mm 4mm 3mm;border:1px solid #302c35;line-height:1.9}
            .party:before{position:absolute;top:0;right:0;left:0;height:2mm;content:"";background:#f2d77e}
            .party-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
            .party-row .party-contact{flex:0 1 auto;text-align:center}
            .party-address{text-align:right}
            .table-wrap{margin-top:4mm}
            table{width:100%;border-collapse:collapse;table-layout:fixed}
            th,td{border:1px solid #302c35;padding:5px 4px;text-align:center;vertical-align:middle}
            th{height:14mm;background:${invoiceAccent}18;font-size:9px}
            th small{display:block;color:#716b76;font-size:7px;font-weight:400}
            td{height:9mm;font-size:9px}
            td:nth-child(2){text-align:right}
            td small{display:block;color:#716b76;font-size:7px}
            .blank-row td{height:8mm}
            .summary{display:grid;grid-template-columns:1fr 1fr;margin-top:4mm;border:1px solid #302c35}
            .summary>section{min-height:40mm;padding:4mm}
            .summary>section+section{border-right:1px solid #302c35}
            .summary h2{margin:0 0 3mm;font-size:10px}
            .summary p{margin:2mm 0;line-height:1.8}
            .total{display:flex;justify-content:space-between;gap:6px;margin-top:2mm;padding-top:2mm;border-top:1px solid ${invoiceAccent};color:${invoiceDeep};font-weight:800}
            .adjustments div{display:flex;justify-content:space-between;margin:1.5mm 0}
            .signatures{display:grid;grid-template-columns:1fr 1fr;margin-top:5mm;border:1px solid #302c35}
            .signatures div{height:24mm;padding:4mm;text-align:center}
            .signatures div+div{border-right:1px solid #302c35}
            .signatures strong{display:block;margin-bottom:12mm}
            @media print{body{background:#fff}.sheet{margin:0;box-shadow:none}.ornament{-webkit-print-color-adjust:exact;print-color-adjust:exact}th,.party:before{ -webkit-print-color-adjust:exact;print-color-adjust:exact}}
            @media screen{.sheet{box-shadow:0 4px 24px #0002}}
            @media screen and (max-width:500px){.invoice-preview-document .sheet{padding:24px 12px 30px}.head{grid-template-columns:.8fr 1.4fr 1fr}.head h1{font-size:14px}.head>div{padding:3px;gap:2px}.brand{font-size:10px}.party{padding:7mm 3mm 3mm;font-size:8px}.party-row{flex-wrap:wrap;justify-content:flex-start}.party-row>*{flex:1 1 45%}.table-wrap{overflow:hidden}th,td{padding:3px 2px;font-size:7px}th small,td small{font-size:6px}.summary{grid-template-columns:1fr}.summary>section{min-height:0;padding:3mm}.summary>section+section{border-top:1px solid #302c35;border-right:0}.signatures div{height:20mm}.signatures strong{margin-bottom:9mm}}
          </style>
        </head>
        <body>
          <main class="sheet">
            <div class="ornament top"></div>
            <header class="head">
              <div><span class="brand">${escapeHtml(activeStore?.name || 'حسابداری گردو')}</span><span>محل لوگو فروشگاه</span></div>
              <div><h1>${escapeHtml(documentTitle)}</h1><span>نسخهٔ فروشنده</span></div>
              <div class="meta"><span>شماره<strong>${escapeHtml(printNumber)}</strong></span><span>تاریخ<strong>${escapeHtml(formatCalendarDate(printDate, printCalendar))}</strong></span><span>ساعت<strong>${formatClockNumber(printTime.hours).padStart(2, '۰')}:${formatClockNumber(printTime.minutes).padStart(2, '۰')}</strong></span></div>
            </header>
            <section class="party">
              <div class="party-row"><strong>ارائه‌دهنده: ${escapeHtml(activeStore?.name || '—')}</strong><span class="party-contact">شماره تماس: ${escapeHtml(activeStore?.phone || '—')}</span><span>کد اقتصادی: ${escapeHtml(activeStore?.code || '—')}</span></div>
              <div class="party-address">نشانی: ${escapeHtml(activeStore?.address || '—')}</div>
            </section>
            <section class="party">
              <div class="party-row"><strong>خریدار: ${escapeHtml(printPerson?.name || savedInvoice?.buyerName || 'خریدار آزاد')}</strong><span class="party-contact">شماره تماس: ${escapeHtml(printPerson?.phone || '—')}</span><span>کد طرف حساب: ${escapeHtml(printPerson?.code || '—')}</span></div>
              <div class="party-address">نشانی: ${escapeHtml(printPerson?.address || '—')}</div>
            </section>
            <div class="table-wrap">
              <table>
                <colgroup><col style="width:7%"><col style="width:35%"><col style="width:10%"><col style="width:17%"><col style="width:13%"><col style="width:18%"></colgroup>
                <thead><tr><th>ردیف<small>No.</small></th><th>شرح کالا و خدمات<small>Description</small></th><th>تعداد<small>QTY</small></th><th>فی (ریال)<small>Unit price</small></th><th>تخفیف<small>Discount</small></th><th>مبلغ کل (ریال)<small>Amount</small></th></tr></thead>
                <tbody>${itemRows}${blankRows}</tbody>
              </table>
            </div>
            <section class="summary">
              <section>
                <h2>توضیحات و شرایط</h2>
                <p>${escapeHtml(printNote.trim() || '—')}</p>
                ${printAttachment ? '<p>پیوست: فایل همراه فاکتور ثبت شده است.</p>' : ''}
              </section>
              <section>
                <h2>خلاصهٔ مالی</h2>
                <div class="adjustments">${adjustmentRows}</div>
                <div class="total"><span>مبلغ قابل پرداخت</span><span>${formatPersonBalance(printTotal)} ریال</span></div>
              </section>
            </section>
            <section class="signatures"><div><strong>مهر و امضای فروشنده</strong></div><div><strong>مهر و امضای خریدار</strong></div></section>
            <div class="ornament bottom"></div>
          </main>
          ${autoPrint ? '<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},300)})</script>' : ''}
        </body>
      </html>`
  }

  const printSalesInvoice = (documentTitle = 'فاکتور فروش') => {
    if (salesInvoiceLines.length === 0) {
      setNotice('برای چاپ فاکتور، ابتدا کالا یا خدمات اضافه کنید.')
      window.setTimeout(() => setNotice(''), 2600)
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      setNotice('پنجرهٔ چاپ باز نشد. اجازهٔ بازشدن پنجرهٔ جدید را بررسی کنید.')
      window.setTimeout(() => setNotice(''), 3000)
      return
    }
    printWindow.document.write(getSalesInvoicePrintDocument(true, undefined, documentTitle))
    printWindow.document.close()
  }

  const printReturnInvoice = (detail: ReturnInvoiceDetail) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      setNotice('پنجرهٔ چاپ باز نشد. اجازهٔ بازشدن پنجرهٔ جدید را بررسی کنید.')
      window.setTimeout(() => setNotice(''), 3000)
      return
    }
    const title = detail.kind === 'sales' ? 'فاکتور برگشت از فروش' : 'فاکتور برگشت به خرید'
    printWindow.document.write(getSalesInvoicePrintDocument(true, detail.invoice, title))
    printWindow.document.close()
  }

  const closeSavedSalesInvoice = () => {
    setSalesInvoiceShareOpen(false)
    if (salesInvoiceAttachment) releaseSalesInvoiceAttachmentUrl(salesInvoiceAttachment.previewUrl)
    if (
      salesInvoiceDraftAttachment
      && salesInvoiceDraftAttachment.previewUrl !== salesInvoiceAttachment?.previewUrl
    ) {
      releaseSalesInvoiceAttachmentUrl(salesInvoiceDraftAttachment.previewUrl)
    }
    setSalesInvoiceConfirmation(null)
    setSalesInvoiceEditingId(null)
    setSalesInvoiceMoreOpen(false)
    setSalesInvoicePaymentMenuOpen(false)
    setSalesInvoiceAttachment(null)
    setSalesInvoiceDraftAttachment(null)
    setSalesInvoiceLines([])
    setSalesInvoiceAdjustments([])
    setSalesInvoicePerson('')
    setSalesInvoiceNote('')
    setActiveTab(salesInvoiceOpenedFromList ? 'فاکتورهای فروش' : 'خانه')
    setSalesInvoiceOpenedFromList(false)
  }

  const handleBackNavigation = (): boolean => {
    if (document.querySelector('[role="dialog"]')) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      lastBackPressRef.current = 0
      return false
    }

    if (activeTab !== 'خانه') {
      if (activeTab === 'فاکتور فروش' && salesInvoiceConfirmation) {
        closeSavedSalesInvoice()
      } else {
        setActiveTab('خانه')
      }
      lastBackPressRef.current = 0
      return false
    }

    const pressedAt = now.getTime()
    if (pressedAt - lastBackPressRef.current <= 2000) {
      lastBackPressRef.current = 0
      setNotice('')
      if (Capacitor.isNativePlatform()) void CapacitorApp.exitApp()
      return true
    }

    lastBackPressRef.current = pressedAt
    const message = 'برای خروج، یک بار دیگر دکمهٔ بازگشت را بزنید.'
    setNotice(message)
    window.setTimeout(() => {
      setNotice((current) => current === message ? '' : current)
    }, 2000)
    return false
  }

  const openSavedSalesInvoice = (invoice: SavedSalesInvoice) => {
    setSalesInvoiceConfirmation(invoice)
    setSalesInvoiceOpenedFromList(true)
    setSalesInvoiceMoreOpen(false)
    setSalesInvoicePaymentMenuOpen(false)
    setSalesInvoiceEditingId(null)
    setSalesInvoiceReceiptOpen(false)
    setActiveTab('فاکتور فروش')
  }

  const editSavedSalesInvoice = (invoice: SavedSalesInvoice) => {
    const unavailableItem = invoice.lines.find((line) => (
      !storedInventoryRecords.items.some((item) => item.id === line.itemId)
    ))
    if (unavailableItem) {
      setNotice(`کالای «${unavailableItem.description}» دیگر در فهرست انبار نیست؛ اصلاح فاکتور ممکن نیست.`)
      window.setTimeout(() => setNotice(''), 3500)
      return
    }

    setSalesInvoiceConfirmation(null)
    setSalesInvoiceEditingId(invoice.id)
    setSalesInvoiceLines(invoice.lines.map((line, index) => ({
      id: `${invoice.id}-edit-${index}`,
      itemId: line.itemId,
      warehouse: line.warehouse
        ?? storedInventoryRecords.items.find((item) => item.id === line.itemId)?.warehouse
        ?? DEFAULT_INVENTORY_WAREHOUSE,
      quantity: line.quantity,
      discount: line.discount,
      unitPrice: line.unitPrice,
      description: line.description,
    })))
    setSalesInvoicePerson(invoice.personId ?? '')
    setSalesInvoicePersonSearch('')
    setSalesInvoiceAdjustments(invoice.adjustments)
    setSalesInvoiceNote(invoice.note)
    setSalesInvoiceDate(new Date(`${invoice.date}T12:00:00Z`))
    setSalesInvoiceCalendar(invoice.calendar)
    setSalesInvoiceTime(invoice.time)
    if (salesInvoiceAttachment) releaseSalesInvoiceAttachmentUrl(salesInvoiceAttachment.previewUrl)
    if (
      salesInvoiceDraftAttachment
      && salesInvoiceDraftAttachment.previewUrl !== salesInvoiceAttachment?.previewUrl
    ) {
      releaseSalesInvoiceAttachmentUrl(salesInvoiceDraftAttachment.previewUrl)
    }
    setSalesInvoiceAttachment(null)
    setSalesInvoiceDraftAttachment(null)
    setSalesInvoiceSaveError('')
    setSalesInvoiceMoreOpen(false)
    setSalesInvoicePaymentMenuOpen(false)
    setActiveTab('فاکتور فروش')
  }

  const openSalesInvoiceReceiptForm = () => {
    if (!salesInvoiceConfirmation || salesInvoiceRemainingTotal <= 0) return
    const time = getIranClockParts(now)
    const date = getIranDateValue(now)
    const formattedTime = `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`
    setSalesInvoiceReceiptFields({
      amount: formatAccountBalanceInput(String(salesInvoiceRemainingTotal)),
      accountId: storedAccounts.accounts[0]?.id ?? '',
      date,
      time: formattedTime,
      calendar: 'persian',
      note: '',
    })
    setSalesInvoiceReceiptDraftDate(new Date(`${date}T12:00:00Z`))
    setSalesInvoiceReceiptDraftCalendar('persian')
    setSalesInvoiceReceiptVisibleMonth(new Date(`${date}T12:00:00Z`))
    setSalesInvoiceReceiptDraftTime(time)
    setSalesInvoiceReceiptNoteOpen(false)
    setSalesInvoiceReceiptAttachment(null)
    setSalesInvoiceReceiptAttachmentDataUrl('')
    setSalesInvoiceReceiptDraftAttachment(null)
    setSalesInvoiceReceiptDraftAttachmentDataUrl('')
    setSalesInvoiceReceiptAttachmentPickerOpen(false)
    setSalesInvoiceReceiptError('')
    setSalesInvoiceReceiptOpen(true)
  }

  const openSalesInvoiceReceiptDatePicker = () => {
    const selectedDate = salesInvoiceReceiptFields.date
      ? new Date(`${salesInvoiceReceiptFields.date}T12:00:00Z`)
      : normalizeUtcDate(now)
    setSalesInvoiceReceiptDraftDate(selectedDate)
    setSalesInvoiceReceiptDraftCalendar(salesInvoiceReceiptFields.calendar)
    setSalesInvoiceReceiptVisibleMonth(selectedDate)
    setSalesInvoiceReceiptDatePickerOpen(true)
  }

  const saveSalesInvoiceReceiptDate = () => {
    setSalesInvoiceReceiptFields((fields) => ({
      ...fields,
      date: normalizeUtcDate(salesInvoiceReceiptDraftDate).toISOString().slice(0, 10),
      calendar: salesInvoiceReceiptDraftCalendar,
    }))
    setSalesInvoiceReceiptDatePickerOpen(false)
  }

  const openSalesInvoiceReceiptTimePicker = () => {
    const [hours, minutes] = salesInvoiceReceiptFields.time.split(':').map(Number)
    setSalesInvoiceReceiptDraftTime({
      hours: Number.isInteger(hours) ? hours : 0,
      minutes: Number.isInteger(minutes) ? minutes : 0,
    })
    setSalesInvoiceReceiptTimeField('hour')
    setSalesInvoiceReceiptTimeMode('clock')
    setSalesInvoiceReceiptTimePickerOpen(true)
  }

  const saveSalesInvoiceReceiptTime = () => {
    setSalesInvoiceReceiptFields((fields) => ({
      ...fields,
      time: `${String(salesInvoiceReceiptDraftTime.hours).padStart(2, '0')}:${String(salesInvoiceReceiptDraftTime.minutes).padStart(2, '0')}`,
    }))
    setSalesInvoiceReceiptTimePickerOpen(false)
  }

  const updateSalesInvoiceReceiptTimeField = (field: 'hour' | 'minute', value: string) => {
    const parsed = parseClockNumber(value)
    if (parsed === null) return
    const boundedValue = Math.max(0, Math.min(field === 'hour' ? 23 : 59, parsed))
    setSalesInvoiceReceiptDraftTime((time) => ({
      ...time,
      [field === 'hour' ? 'hours' : 'minutes']: boundedValue,
    }))
  }

  const handleSalesInvoiceReceiptAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setSalesInvoiceReceiptError('فقط فایل تصویری را می‌توانید پیوست کنید.')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setSalesInvoiceReceiptError('حجم تصویر پیوست نباید بیشتر از ۳ مگابایت باشد.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setSalesInvoiceReceiptError('خواندن تصویر پیوست دریافتی انجام نشد.')
        return
      }
      setSalesInvoiceReceiptDraftAttachment(file)
      setSalesInvoiceReceiptDraftAttachmentDataUrl(reader.result)
      setSalesInvoiceReceiptError('')
    }
    reader.onerror = () => setSalesInvoiceReceiptError('خواندن تصویر پیوست دریافتی انجام نشد.')
    reader.readAsDataURL(file)
  }

  const closeSalesInvoiceReceiptAttachmentPicker = () => {
    setSalesInvoiceReceiptDraftAttachment(salesInvoiceReceiptAttachment)
    setSalesInvoiceReceiptDraftAttachmentDataUrl(salesInvoiceReceiptAttachmentDataUrl)
    setSalesInvoiceReceiptAttachmentPickerOpen(false)
    setSalesInvoiceReceiptError('')
  }

  const confirmSalesInvoiceReceiptAttachment = () => {
    setSalesInvoiceReceiptAttachment(salesInvoiceReceiptDraftAttachment)
    setSalesInvoiceReceiptAttachmentDataUrl(salesInvoiceReceiptDraftAttachmentDataUrl)
    setSalesInvoiceReceiptAttachmentPickerOpen(false)
    setSalesInvoiceReceiptError('')
  }

  const saveSalesInvoiceReceipt = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (salesInvoiceReceiptSavingRef.current) return
    salesInvoiceReceiptSavingRef.current = true
    setSalesInvoiceReceiptSaving(true)
    setSalesInvoiceReceiptError('')

    try {
      if (!activeStoreId) throw new Error('برای ثبت دریافتی ابتدا یک فروشگاه را انتخاب کنید.')
      if (!salesInvoiceConfirmation) throw new Error('فاکتور برای ثبت دریافتی انتخاب نشده است.')

      const currentInvoices = readStoredSalesInvoices(activeStoreId)
      if (currentInvoices.error) throw new Error(currentInvoices.error)
      const invoice = currentInvoices.invoices.find((item) => item.id === salesInvoiceConfirmation.id)
      if (!invoice) throw new Error('فاکتور در اطلاعات ذخیره‌شده پیدا نشد؛ فهرست را به‌روزرسانی کنید.')

      const amount = parsePersonBalance(salesInvoiceReceiptFields.amount)
      if (amount === null || amount <= 0) throw new Error('مبلغ دریافتی باید عددی صحیح و بیشتر از صفر باشد.')
      const receivedTotal = (invoice.receipts ?? []).reduce((total, receipt) => total + receipt.amount, 0)
      const remainingTotal = Math.max(0, invoice.total - receivedTotal)
      if (remainingTotal <= 0) throw new Error('این فاکتور قبلاً تسویه شده است.')
      if (amount > remainingTotal) {
        throw new Error(`مبلغ دریافتی نمی‌تواند بیشتر از ماندهٔ ${formatPersonBalance(remainingTotal)} ریال باشد.`)
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(salesInvoiceReceiptFields.date)
        || !Number.isFinite(Date.parse(`${salesInvoiceReceiptFields.date}T12:00:00Z`))) {
        throw new Error('تاریخ دریافتی معتبر نیست.')
      }
      const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(salesInvoiceReceiptFields.time)
      if (!timeMatch) throw new Error('ساعت دریافتی معتبر نیست.')

      const currentAccounts = readStoredAccounts(activeStoreId)
      if (currentAccounts.error) throw new Error(currentAccounts.error)
      const account = currentAccounts.accounts.find((item) => item.id === salesInvoiceReceiptFields.accountId)
      if (!account) throw new Error('حساب مقصد را انتخاب کنید.')
      const nextAccountBalance = account.balance + amount
      if (!Number.isSafeInteger(nextAccountBalance)) {
        throw new Error('موجودی حساب پس از ثبت دریافتی از محدودهٔ مجاز بیشتر می‌شود.')
      }
      const updatedAccounts = currentAccounts.accounts.map((item) => (
        item.id === account.id ? { ...item, balance: nextAccountBalance } : item
      ))

      let updatedPeople: PersonRecord[] | null = null
      if (invoice.personId) {
        const currentPeople = readStoredPeople(activeStoreId)
        if (currentPeople.error) throw new Error(currentPeople.error)
        const person = currentPeople.people.find((item) => item.id === invoice.personId)
        if (!person) throw new Error('طرف‌حساب این فاکتور در فهرست اشخاص پیدا نشد.')
        const signedBalance = person.accountStatus === 'بدهکاران'
          ? person.balance
          : person.accountStatus === 'بستانکاران'
            ? -person.balance
            : 0
        const nextBalance = signedBalance - amount
        const transactionCount = (person.transactionCount ?? 0) + 1
        if (!Number.isSafeInteger(nextBalance) || !Number.isSafeInteger(transactionCount)) {
          throw new Error('ماندهٔ طرف‌حساب پس از ثبت دریافتی از محدودهٔ مجاز بیشتر می‌شود.')
        }
        const updatedPerson: PersonRecord = {
          ...person,
          accountStatus: nextBalance > 0
            ? 'بدهکاران'
            : nextBalance < 0 ? 'بستانکاران' : 'تسویه شده',
          balance: Math.abs(nextBalance),
          transactionCount,
        }
        updatedPeople = [
          ...currentPeople.people.filter((item) => item.id !== updatedPerson.id),
          updatedPerson,
        ]
      }

      const attachment = salesInvoiceReceiptAttachment
        ? {
          name: salesInvoiceReceiptAttachment.name || 'تصویر دریافتی',
          type: salesInvoiceReceiptAttachment.type,
          dataUrl: salesInvoiceReceiptAttachmentDataUrl,
        }
        : undefined

      const createdAt = new Date().toISOString()
      const receipt: SavedSalesInvoiceReceipt = {
        id: `${invoice.id}-receipt-${Date.now()}-${(invoice.receipts ?? []).length + 1}`,
        accountId: account.id,
        personId: invoice.personId,
        amount,
        date: salesInvoiceReceiptFields.date,
        calendar: salesInvoiceReceiptFields.calendar,
        time: { hours: Number(timeMatch[1]), minutes: Number(timeMatch[2]) },
        note: salesInvoiceReceiptFields.note.trim(),
        createdAt,
        ...(attachment ? { attachment } : {}),
      }
      const updatedInvoice: SavedSalesInvoice = {
        ...invoice,
        receipts: [...(invoice.receipts ?? []), receipt],
      }
      const updatedInvoices = currentInvoices.invoices.map((item) => (
        item.id === invoice.id ? updatedInvoice : item
      ))

      const invoiceKey = getActiveStoreDataStorageKey(SALES_INVOICES_STORAGE_KEY, activeStoreId)
      const accountsKey = getActiveStoreDataStorageKey(ACCOUNTS_STORAGE_KEY, activeStoreId)
      const peopleKey = invoice.personId
        ? getActiveStoreDataStorageKey(PEOPLE_STORAGE_KEY, activeStoreId)
        : null
      const previousValues = new Map<string, string | null>()
      try {
        previousValues.set(invoiceKey, localStorage.getItem(invoiceKey))
        previousValues.set(accountsKey, localStorage.getItem(accountsKey))
        if (peopleKey) previousValues.set(peopleKey, localStorage.getItem(peopleKey))
      } catch {
        throw new Error('خواندن اطلاعات قبلی برای ثبت دریافتی انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
      }

      try {
        localStorage.setItem(invoiceKey, JSON.stringify(updatedInvoices))
        localStorage.setItem(accountsKey, JSON.stringify(updatedAccounts))
        if (peopleKey && updatedPeople) localStorage.setItem(peopleKey, JSON.stringify(updatedPeople))
      } catch {
        let rollbackFailed = false
        for (const [key, value] of previousValues) {
          try {
            if (value === null) localStorage.removeItem(key)
            else localStorage.setItem(key, value)
          } catch {
            rollbackFailed = true
          }
        }
        throw new Error(rollbackFailed
          ? 'ثبت دریافتی کامل نشد و بازگردانی خودکار همهٔ اطلاعات ممکن نبود؛ موجودی حساب و ماندهٔ طرف‌حساب را بررسی کنید.'
          : 'ذخیرهٔ دریافتی انجام نشد؛ تغییرات حساب و ماندهٔ طرف‌حساب بازگردانده شد.')
      }

      const newRemainingTotal = remainingTotal - amount
      setStoredSalesInvoices({ invoices: updatedInvoices, error: '' })
      setStoredAccounts({ accounts: updatedAccounts, error: '' })
      if (updatedPeople) setStoredPeopleState({ people: updatedPeople, error: '' })
      setSalesInvoiceConfirmation(updatedInvoice)
      setSalesInvoiceReceiptOpen(false)
      setSalesInvoiceReceiptAttachment(null)
      setSalesInvoiceReceiptAttachmentDataUrl('')
      setSalesInvoiceReceiptDraftAttachment(null)
      setSalesInvoiceReceiptDraftAttachmentDataUrl('')
      setSalesInvoiceReceiptDatePickerOpen(false)
      setSalesInvoiceReceiptTimePickerOpen(false)
      setSalesInvoiceReceiptAttachmentPickerOpen(false)
      setNotice(newRemainingTotal === 0
        ? 'دریافتی ثبت شد و فاکتور تسویه شد.'
        : `دریافتی ثبت شد؛ ماندهٔ فاکتور ${formatPersonBalance(newRemainingTotal)} ریال است.`)
      window.setTimeout(() => setNotice(''), 3500)
    } catch (error) {
      setSalesInvoiceReceiptError(error instanceof Error
        ? error.message
        : 'ثبت دریافتی انجام نشد؛ دوباره تلاش کنید.')
    } finally {
      salesInvoiceReceiptSavingRef.current = false
      setSalesInvoiceReceiptSaving(false)
    }
  }

  const shareSavedSalesInvoice = async () => {
    const invoiceNumber = salesInvoiceConfirmation?.number ?? salesInvoiceNumber
    const invoiceTotal = salesInvoiceConfirmation?.total ?? salesInvoiceTotal
    const text = `فاکتور فروش ${invoiceNumber} به مبلغ ${formatPersonBalance(invoiceTotal)} ریال`
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `فاکتور فروش ${invoiceNumber}`,
          text,
        })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setNotice('ارسال فاکتور انجام نشد؛ دوباره تلاش کنید.')
        window.setTimeout(() => setNotice(''), 3000)
      }
      return
    }
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        setNotice('خلاصهٔ فاکتور کپی شد؛ می‌توانید آن را ارسال کنید.')
      } catch {
        setNotice('ارسال این فاکتور در مرورگر فعلی پشتیبانی نمی‌شود.')
      }
      window.setTimeout(() => setNotice(''), 3000)
      return
    }
    setNotice('ارسال این فاکتور در مرورگر فعلی پشتیبانی نمی‌شود.')
    window.setTimeout(() => setNotice(''), 3000)
  }

  const printSavedSalesInvoice = () => {
    if (!salesInvoiceConfirmation) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      setNotice('پنجرهٔ چاپ باز نشد. اجازهٔ بازشدن پنجرهٔ جدید را بررسی کنید.')
      window.setTimeout(() => setNotice(''), 3000)
      return
    }
    printWindow.document.write(getSalesInvoicePrintDocument(true, salesInvoiceConfirmation))
    printWindow.document.close()
  }

  const showSalesInvoiceShareNotice = (message: string) => {
    setSalesInvoiceShareOpen(false)
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3000)
  }

  const savePurchaseInvoice = async () => {
    if (salesInvoiceSavingRef.current) return
    salesInvoiceSavingRef.current = true
    setSalesInvoiceSaving(true)
    setSalesInvoiceSaveError('')

    try {
      if (!activeStoreId) throw new Error('برای ثبت فاکتور خرید ابتدا یک فروشگاه را انتخاب کنید.')
      if (storedPurchaseInvoices.error) throw new Error(storedPurchaseInvoices.error)
      if (storedInventoryRecords.error) throw new Error(storedInventoryRecords.error)
      if (storedPeopleState.error) throw new Error(storedPeopleState.error)
      if (!selectedSalesInvoicePerson || selectedSalesInvoicePerson.role !== 'تأمین‌کننده') {
        throw new Error('برای ثبت فاکتور خرید، انتخاب تأمین‌کننده الزامی است.')
      }
      if (!salesInvoiceLines.length) throw new Error('برای ثبت فاکتور خرید، ابتدا کالا یا خدمات اضافه کنید.')
      if (!Number.isSafeInteger(salesInvoiceTotal)) {
        throw new Error('مبلغ فاکتور خرید باید عدد صحیح و معتبر باشد.')
      }

      const nowIso = now.toISOString()
      const itemById = new Map(storedInventoryRecords.items.map((item) => [item.id, item]))
      const purchaseLines: SavedSalesInvoiceLine[] = salesInvoiceLines.map((line) => {
        const item = itemById.get(line.itemId)
        if (!item) throw new Error('یکی از کالاها یا خدمات فاکتور دیگر در فهرست موجود نیست.')
        const unitPrice = line.unitPrice ?? item.purchasePrice
        const total = Math.max(0, unitPrice * line.quantity - line.discount)
        if (!Number.isFinite(total)) throw new Error(`مبلغ «${item.name}» معتبر نیست.`)
        return {
          itemId: item.id,
          warehouse: item.warehouse ?? (
            item.kind === 'خدمات' ? DEFAULT_SERVICE_WAREHOUSE : DEFAULT_INVENTORY_WAREHOUSE
          ),
          description: line.description || item.name,
          kind: item.kind,
          unit: item.unit,
          quantity: line.quantity,
          unitPrice,
          discount: line.discount,
          total,
        }
      })

      const updatedItemById = new Map<string, InventoryRecord>()
      for (const line of purchaseLines) {
        if (line.kind === 'خدمات') continue
        const item = itemById.get(line.itemId)
        if (!item) throw new Error('یکی از کالاهای فاکتور دیگر در فهرست موجود نیست.')
        const previous = updatedItemById.get(item.id) ?? item
        const nextStock = previous.stock + line.quantity
        if (!Number.isFinite(nextStock) || nextStock < 0) {
          throw new Error(`موجودی «${item.name}» پس از ثبت خرید معتبر نیست.`)
        }
        updatedItemById.set(item.id, {
          ...previous,
          stock: nextStock,
          purchasePrice: line.unitPrice,
          lastMovementAt: nowIso,
        })
      }
      const updatedInventoryRows = [
        ...storedInventoryRecords.items.filter((item) => !updatedItemById.has(item.id)),
        ...storedInventoryRecords.items
          .filter((item) => updatedItemById.has(item.id))
          .map((item) => updatedItemById.get(item.id)!),
        ...[...updatedItemById.values()].filter((item) => (
          !storedInventoryRecords.items.some((storedItem) => storedItem.id === item.id)
        )),
      ]
      const updatedInventory = [...updatedItemById.values()].reduce(
        (items, item) => updateInventoryCatalogPrices(items, item.id, { purchasePrice: item.purchasePrice }),
        updatedInventoryRows,
      )

      const attachment = salesInvoiceAttachment
        ? await new Promise<{ name: string; type: string; dataUrl: string }>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve({
                name: salesInvoiceAttachment.file.name || 'تصویر فاکتور خرید',
                type: salesInvoiceAttachment.file.type,
                dataUrl: reader.result,
              })
            } else {
              reject(new Error('خواندن تصویر پیوست فاکتور خرید انجام نشد.'))
            }
          }
          reader.onerror = () => reject(new Error('خواندن تصویر پیوست فاکتور خرید انجام نشد.'))
          reader.readAsDataURL(salesInvoiceAttachment.file)
        })
        : undefined

      const invoice: SavedSalesInvoice = {
        id: `purchase-invoice-${activeStoreId}-${purchaseInvoiceNumber}`,
        number: purchaseInvoiceNumber,
        date: getIranDateValue(salesInvoiceDate),
        calendar: salesInvoiceCalendar,
        time: salesInvoiceTime,
        personId: selectedSalesInvoicePerson.id,
        buyerName: selectedSalesInvoicePerson.name,
        lines: purchaseLines,
        adjustments: salesInvoiceAdjustments,
        subtotal: salesInvoiceSubtotal,
        total: salesInvoiceTotal,
        note: salesInvoiceNote.trim(),
        ...(attachment ? { attachment } : {}),
        createdAt: nowIso,
      }

      const signedSupplierBalance = selectedSalesInvoicePerson.accountStatus === 'بدهکاران'
        ? selectedSalesInvoicePerson.balance
        : selectedSalesInvoicePerson.accountStatus === 'بستانکاران'
          ? -selectedSalesInvoicePerson.balance
          : 0
      const nextSupplierBalance = signedSupplierBalance - invoice.total
      const nextTransactionCount = (selectedSalesInvoicePerson.transactionCount ?? 0) + 1
      if (!Number.isSafeInteger(nextSupplierBalance) || !Number.isSafeInteger(nextTransactionCount)) {
        throw new Error('ماندهٔ تأمین‌کننده پس از ثبت فاکتور معتبر نیست.')
      }
      const updatedSupplier: PersonRecord = {
        ...selectedSalesInvoicePerson,
        accountStatus: nextSupplierBalance > 0
          ? 'بدهکاران'
          : nextSupplierBalance < 0 ? 'بستانکاران' : 'تسویه شده',
        balance: Math.abs(nextSupplierBalance),
        transactionCount: nextTransactionCount,
      }
      const updatedPeople = [
        ...storedPeopleState.people.filter((person) => person.id !== updatedSupplier.id),
        updatedSupplier,
      ]
      const currentInvoices = readStoredPurchaseInvoices(activeStoreId)
      if (currentInvoices.error) throw new Error(currentInvoices.error)
      const invoices = [...currentInvoices.invoices, invoice]
      const purchaseInvoiceKey = getActiveStoreDataStorageKey(PURCHASE_INVOICES_STORAGE_KEY, activeStoreId)
      const inventoryKey = getActiveStoreDataStorageKey(INVENTORY_ITEMS_STORAGE_KEY, activeStoreId)
      const peopleKey = getActiveStoreDataStorageKey(PEOPLE_STORAGE_KEY, activeStoreId)
      const previousValues = new Map<string, string | null>()
      try {
        previousValues.set(purchaseInvoiceKey, localStorage.getItem(purchaseInvoiceKey))
        previousValues.set(inventoryKey, localStorage.getItem(inventoryKey))
        previousValues.set(peopleKey, localStorage.getItem(peopleKey))
      } catch {
        throw new Error('خواندن اطلاعات قبلی برای ثبت فاکتور خرید انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
      }

      try {
        localStorage.setItem(purchaseInvoiceKey, JSON.stringify(invoices))
        localStorage.setItem(inventoryKey, JSON.stringify(updatedInventory))
        localStorage.setItem(peopleKey, JSON.stringify(updatedPeople))
      } catch {
        let rollbackFailed = false
        for (const [key, value] of previousValues) {
          try {
            if (value === null) localStorage.removeItem(key)
            else localStorage.setItem(key, value)
          } catch {
            rollbackFailed = true
          }
        }
        throw new Error(rollbackFailed
          ? 'ثبت فاکتور خرید کامل نشد و بازگردانی همهٔ اطلاعات ممکن نبود؛ موجودی و مانده‌ها را بررسی کنید.'
          : 'ذخیرهٔ فاکتور خرید انجام نشد؛ تغییرات موجودی و ماندهٔ تأمین‌کننده بازگردانده شد.')
      }

      setStoredPurchaseInvoices({ invoices, error: '' })
      setStoredInventoryRecords({ items: updatedInventory, error: '' })
      setStoredPeopleState({ people: updatedPeople, error: '' })
      setSalesInvoiceLines([])
      setSalesInvoicePerson('')
      setSalesInvoiceNote('')
      setSalesInvoiceAdjustments([])
      setSalesInvoiceAttachment(null)
      setSalesInvoiceDraftAttachment(null)
      setSalesInvoiceConfirmation(null)
      setActiveTab('خانه')
      setNotice('فاکتور خرید ثبت شد؛ موجودی انبار و ماندهٔ تأمین‌کننده به‌روز شد.')
      window.setTimeout(() => setNotice(''), 3500)
    } catch (error) {
      setSalesInvoiceSaveError(error instanceof Error
        ? error.message
        : 'ثبت فاکتور خرید انجام نشد؛ دوباره تلاش کنید.')
    } finally {
      salesInvoiceSavingRef.current = false
      setSalesInvoiceSaving(false)
    }
  }

  const saveReturnInvoice = async () => {
    if (salesInvoiceSavingRef.current) return
    salesInvoiceSavingRef.current = true
    setSalesInvoiceSaving(true)
    setSalesInvoiceSaveError('')

    try {
      if (!activeStoreId) throw new Error('برای ثبت فاکتور برگشت ابتدا یک فروشگاه را انتخاب کنید.')
      if (storedInventoryRecords.error) throw new Error(storedInventoryRecords.error)
      if (storedPeopleState.error) throw new Error(storedPeopleState.error)
      if (!salesInvoiceLines.length) throw new Error('برای ثبت فاکتور برگشت، ابتدا کالا یا خدمات اضافه کنید.')
      if (!Number.isSafeInteger(salesInvoiceTotal)) throw new Error('مبلغ فاکتور برگشت معتبر نیست.')
      if (!selectedSalesInvoicePerson) {
        throw new Error(returnPurchaseInvoiceMode
          ? 'برای ثبت برگشت به خرید، تأمین‌کننده را انتخاب کنید.'
          : 'برای ثبت برگشت از فروش، طرف‌حساب را انتخاب کنید.')
      }
      if (returnPurchaseInvoiceMode && selectedSalesInvoicePerson.role !== 'تأمین‌کننده') {
        throw new Error('برای برگشت به خرید، انتخاب تأمین‌کننده الزامی است.')
      }

      const returnKind: ReturnInvoiceKind = returnPurchaseInvoiceMode ? 'purchase' : 'sales'
      const returnStorageKey = returnPurchaseInvoiceMode
        ? RETURN_PURCHASE_INVOICES_STORAGE_KEY
        : RETURN_SALES_INVOICES_STORAGE_KEY
      const existingReturns = readStoredReturnInvoices(
        returnStorageKey,
        returnKind,
        activeStoreId,
      )
      if (existingReturns.error) throw new Error(existingReturns.error)

      const nowIso = now.toISOString()
      const itemById = new Map(storedInventoryRecords.items.map((item) => [item.id, item]))
      const returnLines: SavedSalesInvoiceLine[] = salesInvoiceLines.map((line) => {
        const item = itemById.get(line.itemId)
        if (!item) throw new Error('یکی از کالاها یا خدمات فاکتور دیگر در فهرست موجود نیست.')
        const unitPrice = line.unitPrice ?? (
          returnPurchaseInvoiceMode ? item.purchasePrice : item.salePrice
        )
        const total = Math.max(0, unitPrice * line.quantity - line.discount)
        if (!Number.isFinite(total)) throw new Error(`مبلغ «${item.name}» معتبر نیست.`)
        return {
          itemId: item.id,
          warehouse: line.warehouse ?? item.warehouse ?? (
            item.kind === 'خدمات' ? DEFAULT_SERVICE_WAREHOUSE : DEFAULT_INVENTORY_WAREHOUSE
          ),
          description: line.description || item.name,
          kind: item.kind,
          unit: item.unit,
          quantity: line.quantity,
          unitPrice,
          discount: line.discount,
          total,
        }
      })

      const quantityDeltas = new Map<string, number>()
      for (const line of returnLines) {
        if (line.kind === 'خدمات') continue
        const signedQuantity = line.quantity * (returnPurchaseInvoiceMode ? -1 : 1)
        quantityDeltas.set(line.itemId, (quantityDeltas.get(line.itemId) ?? 0) + signedQuantity)
      }
      const updatedItemById = new Map<string, InventoryRecord>()
      for (const [itemId, quantityDelta] of quantityDeltas) {
        const item = itemById.get(itemId)
        if (!item) throw new Error('یکی از کالاهای فاکتور دیگر در فهرست موجود نیست.')
        const nextStock = item.stock + quantityDelta
        if (!Number.isFinite(nextStock) || nextStock < 0) {
          throw new Error(`موجودی «${item.name}» برای ثبت این برگشت کافی نیست.`)
        }
        updatedItemById.set(itemId, { ...item, stock: nextStock, lastMovementAt: nowIso })
      }
      const updatedInventory = [
        ...storedInventoryRecords.items.filter((item) => !updatedItemById.has(item.id)),
        ...storedInventoryRecords.items
          .filter((item) => updatedItemById.has(item.id))
          .map((item) => updatedItemById.get(item.id)!),
      ]

      const attachment = salesInvoiceAttachment
        ? await new Promise<{ name: string; type: string; dataUrl: string }>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve({
                name: salesInvoiceAttachment.file.name || 'تصویر فاکتور برگشت',
                type: salesInvoiceAttachment.file.type,
                dataUrl: reader.result,
              })
            } else {
              reject(new Error('خواندن تصویر پیوست فاکتور برگشت انجام نشد.'))
            }
          }
          reader.onerror = () => reject(new Error('خواندن تصویر پیوست فاکتور برگشت انجام نشد.'))
          reader.readAsDataURL(salesInvoiceAttachment.file)
        })
        : undefined

      const invoice: SavedSalesInvoice = {
        id: `return-${returnKind}-invoice-${activeStoreId}-${returnKind === 'sales'
          ? returnSalesInvoiceNumber
          : returnPurchaseInvoiceNumber}`,
        number: returnKind === 'sales' ? returnSalesInvoiceNumber : returnPurchaseInvoiceNumber,
        date: getIranDateValue(salesInvoiceDate),
        calendar: salesInvoiceCalendar,
        time: salesInvoiceTime,
        personId: selectedSalesInvoicePerson.id,
        buyerName: selectedSalesInvoicePerson.name,
        lines: returnLines,
        adjustments: salesInvoiceAdjustments,
        subtotal: salesInvoiceSubtotal,
        total: salesInvoiceTotal,
        note: salesInvoiceNote.trim(),
        ...(attachment ? { attachment } : {}),
        createdAt: nowIso,
      }

      const signedBalance = selectedSalesInvoicePerson.accountStatus === 'بدهکاران'
        ? selectedSalesInvoicePerson.balance
        : selectedSalesInvoicePerson.accountStatus === 'بستانکاران'
          ? -selectedSalesInvoicePerson.balance
          : 0
      const nextBalance = signedBalance + invoice.total * (returnPurchaseInvoiceMode ? 1 : -1)
      const nextTransactionCount = (selectedSalesInvoicePerson.transactionCount ?? 0) + 1
      if (!Number.isSafeInteger(nextBalance) || !Number.isSafeInteger(nextTransactionCount)) {
        throw new Error('ماندهٔ طرف‌حساب پس از ثبت فاکتور برگشت معتبر نیست.')
      }
      const updatedPerson: PersonRecord = {
        ...selectedSalesInvoicePerson,
        accountStatus: nextBalance > 0
          ? 'بدهکاران'
          : nextBalance < 0 ? 'بستانکاران' : 'تسویه شده',
        balance: Math.abs(nextBalance),
        transactionCount: nextTransactionCount,
      }
      const updatedPeople = [
        ...storedPeopleState.people.filter((person) => person.id !== updatedPerson.id),
        updatedPerson,
      ]
      const invoiceKey = getActiveStoreDataStorageKey(returnStorageKey, activeStoreId)
      const inventoryKey = getActiveStoreDataStorageKey(INVENTORY_ITEMS_STORAGE_KEY, activeStoreId)
      const peopleKey = getActiveStoreDataStorageKey(PEOPLE_STORAGE_KEY, activeStoreId)
      const previousValues = new Map<string, string | null>()
      try {
        previousValues.set(invoiceKey, localStorage.getItem(invoiceKey))
        previousValues.set(inventoryKey, localStorage.getItem(inventoryKey))
        previousValues.set(peopleKey, localStorage.getItem(peopleKey))
      } catch {
        throw new Error('خواندن اطلاعات قبلی برای ثبت فاکتور برگشت انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
      }

      try {
        localStorage.setItem(invoiceKey, JSON.stringify([...existingReturns.invoices, invoice]))
        localStorage.setItem(inventoryKey, JSON.stringify(updatedInventory))
        localStorage.setItem(peopleKey, JSON.stringify(updatedPeople))
      } catch {
        let rollbackFailed = false
        for (const [key, value] of previousValues) {
          try {
            if (value === null) localStorage.removeItem(key)
            else localStorage.setItem(key, value)
          } catch {
            rollbackFailed = true
          }
        }
        throw new Error(rollbackFailed
          ? 'ثبت فاکتور برگشت کامل نشد و بازگردانی همهٔ اطلاعات ممکن نبود؛ موجودی و مانده‌ها را بررسی کنید.'
          : 'ذخیرهٔ فاکتور برگشت انجام نشد؛ موجودی و ماندهٔ طرف‌حساب بازگردانده شد.')
      }

      setStoredInventoryRecords({ items: updatedInventory, error: '' })
      setStoredPeopleState({ people: updatedPeople, error: '' })
      if (returnKind === 'sales') {
        setStoredReturnSalesInvoices({ invoices: [...existingReturns.invoices, invoice], error: '' })
        setActiveTab('فهرست برگشت از فروش')
      } else {
        setStoredReturnPurchaseInvoices({ invoices: [...existingReturns.invoices, invoice], error: '' })
        setActiveTab('فهرست برگشت به خرید')
      }
      setSalesInvoiceLines([])
      setSalesInvoicePerson('')
      setSalesInvoiceNote('')
      setSalesInvoiceAdjustments([])
      setSalesInvoiceAttachment(null)
      setSalesInvoiceDraftAttachment(null)
      setNotice(returnKind === 'sales'
        ? 'فاکتور برگشت از فروش ثبت شد؛ موجودی و ماندهٔ طرف‌حساب به‌روز شد.'
        : 'فاکتور برگشت به خرید ثبت شد؛ موجودی و ماندهٔ تأمین‌کننده به‌روز شد.')
      window.setTimeout(() => setNotice(''), 3500)
    } catch (error) {
      setSalesInvoiceSaveError(error instanceof Error
        ? error.message
        : 'ثبت فاکتور برگشت انجام نشد؛ دوباره تلاش کنید.')
    } finally {
      salesInvoiceSavingRef.current = false
      setSalesInvoiceSaving(false)
    }
  }

  const saveSalesInvoice = async () => {
    if (salesInvoiceSavingRef.current) return
    salesInvoiceSavingRef.current = true
    setSalesInvoiceSaving(true)
    setSalesInvoiceSaveError('')

    try {
      if (!activeStoreId) throw new Error('برای ثبت فاکتور ابتدا یک فروشگاه را انتخاب کنید.')
      if (storedSalesInvoices.error) throw new Error(storedSalesInvoices.error)
      if (storedInventoryRecords.error) throw new Error(storedInventoryRecords.error)
      if (storedPeopleState.error) {
        throw new Error(storedPeopleState.error)
      }
      if (!selectedSalesInvoicePerson) {
        throw new Error('برای ثبت فاکتور، انتخاب طرف‌حساب الزامی است.')
      }
      if (!salesInvoiceLines.length) throw new Error('برای ثبت فاکتور، ابتدا کالا یا خدمات اضافه کنید.')
      if (salesInvoiceEditingId && !salesInvoiceEditingInvoice) {
        throw new Error('فاکتور برای اصلاح پیدا نشد؛ فهرست را به‌روزرسانی کنید.')
      }

      const nowIso = now.toISOString()
      const itemById = new Map(storedInventoryRecords.items.map((item) => [item.id, item]))
      const saleLines: SavedSalesInvoiceLine[] = salesInvoiceLines.map((line) => {
        const item = itemById.get(line.itemId)
        if (!item) throw new Error('یکی از کالاها یا خدمات فاکتور دیگر در فهرست موجود نیست.')
        const unitPrice = line.unitPrice ?? item.salePrice
        const total = Math.max(0, unitPrice * line.quantity - line.discount)
        return {
          itemId: item.id,
          warehouse: item.warehouse ?? (
            item.kind === 'خدمات' ? DEFAULT_SERVICE_WAREHOUSE : DEFAULT_INVENTORY_WAREHOUSE
          ),
          description: line.description || item.name,
          kind: item.kind,
          unit: item.unit,
          quantity: line.quantity,
          unitPrice,
          discount: line.discount,
          total,
        }
      })

      const newInventoryDeductions = new Map<string, number>()
      for (const line of saleLines) {
        if (line.kind !== 'خدمات') {
          newInventoryDeductions.set(line.itemId, (newInventoryDeductions.get(line.itemId) ?? 0) + line.quantity)
        }
      }

      const previousInventoryDeductions = new Map<string, number>()
      for (const line of salesInvoiceEditingInvoice?.lines ?? []) {
        if (line.kind !== 'خدمات') {
          previousInventoryDeductions.set(
            line.itemId,
            (previousInventoryDeductions.get(line.itemId) ?? 0) + line.quantity,
          )
        }
      }
      const changedInventoryIds = new Set([
        ...newInventoryDeductions.keys(),
        ...previousInventoryDeductions.keys(),
      ])
      const updatedItemById = new Map<string, InventoryRecord>()
      for (const itemId of changedInventoryIds) {
        const quantityDelta = (newInventoryDeductions.get(itemId) ?? 0)
          - (previousInventoryDeductions.get(itemId) ?? 0)
        if (quantityDelta === 0) continue
        const item = itemById.get(itemId)
        if (!item) throw new Error('یکی از کالاهای فاکتور دیگر در فهرست موجود نیست.')
        if (item.stock < quantityDelta) {
          throw new Error(`موجودی «${item.name}» برای ثبت این فاکتور کافی نیست.`)
        }
        const nextStock = item.stock - quantityDelta
        if (!Number.isFinite(nextStock) || nextStock < 0) {
          throw new Error(`موجودی «${item.name}» پس از اصلاح فاکتور معتبر نیست.`)
        }
        updatedItemById.set(itemId, {
          ...item,
          stock: nextStock,
          lastMovementAt: nowIso,
        })
      }
      const updatedInventory = [
        ...storedInventoryRecords.items.filter((item) => !updatedItemById.has(item.id)),
        ...storedInventoryRecords.items
          .filter((item) => updatedItemById.has(item.id))
          .map((item) => updatedItemById.get(item.id)!),
        ...[...updatedItemById.values()].filter((item) => (
          !storedInventoryRecords.items.some((storedItem) => storedItem.id === item.id)
        )),
      ]

      const invoiceAttachment = salesInvoiceAttachment
        ? await new Promise<{ name: string; type: string; dataUrl: string }>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve({
                name: salesInvoiceAttachment.file.name || 'تصویر فاکتور',
                type: salesInvoiceAttachment.file.type,
                dataUrl: reader.result,
              })
            } else {
              reject(new Error('خواندن تصویر پیوست فاکتور انجام نشد.'))
            }
          }
          reader.onerror = () => reject(new Error('خواندن تصویر پیوست فاکتور انجام نشد.'))
          reader.readAsDataURL(salesInvoiceAttachment.file)
        })
        : undefined

      const editingInvoice = salesInvoiceEditingInvoice
      const invoice: SavedSalesInvoice = {
        id: editingInvoice?.id ?? `sales-invoice-${activeStoreId}-${salesInvoiceNumber}`,
        number: editingInvoice?.number ?? salesInvoiceNumber,
        date: getIranDateValue(salesInvoiceDate),
        calendar: salesInvoiceCalendar,
        time: salesInvoiceTime,
        personId: selectedSalesInvoicePerson?.id ?? null,
        buyerName: selectedSalesInvoicePerson?.name || 'خریدار آزاد',
        lines: saleLines,
        adjustments: salesInvoiceAdjustments,
        subtotal: salesInvoiceSubtotal,
        total: salesInvoiceTotal,
        note: salesInvoiceNote.trim(),
        ...((invoiceAttachment ?? editingInvoice?.attachment)
          ? { attachment: invoiceAttachment ?? editingInvoice?.attachment }
          : {}),
        ...(editingInvoice?.receipts ? { receipts: editingInvoice.receipts } : {}),
        createdAt: editingInvoice?.createdAt ?? nowIso,
      }
      const receivedTotal = (editingInvoice?.receipts ?? [])
        .reduce((total, receipt) => total + receipt.amount, 0)
      if (salesInvoiceTotal < receivedTotal) {
        throw new Error(`مبلغ فاکتور نمی‌تواند از دریافتی ثبت‌شدهٔ ${formatPersonBalance(receivedTotal)} ریال کمتر باشد.`)
      }
      if (
        receivedTotal > 0
        && editingInvoice?.personId !== (selectedSalesInvoicePerson?.id ?? null)
      ) {
        throw new Error('برای حفظ سوابق دریافتی، طرف‌حساب فاکتور تسویه‌نشده را نمی‌توان تغییر داد.')
      }

      const invoices = editingInvoice
        ? storedSalesInvoices.invoices.map((savedInvoice) => (
          savedInvoice.id === editingInvoice.id ? invoice : savedInvoice
        ))
        : [...storedSalesInvoices.invoices, invoice]
      const personBalanceDeltas = new Map<string, number>()
      const personTransactionDeltas = new Map<string, number>()
      if (editingInvoice?.personId) {
        personBalanceDeltas.set(editingInvoice.personId, -editingInvoice.total)
      }
      if (selectedSalesInvoicePerson) {
        personBalanceDeltas.set(
          selectedSalesInvoicePerson.id,
          (personBalanceDeltas.get(selectedSalesInvoicePerson.id) ?? 0) + salesInvoiceTotal,
        )
      }
      if (!editingInvoice && selectedSalesInvoicePerson) {
        personTransactionDeltas.set(selectedSalesInvoicePerson.id, 1)
      } else if (editingInvoice?.personId !== (selectedSalesInvoicePerson?.id ?? null)) {
        if (editingInvoice?.personId) personTransactionDeltas.set(editingInvoice.personId, -1)
        if (selectedSalesInvoicePerson) personTransactionDeltas.set(selectedSalesInvoicePerson.id, 1)
      }

      let updatedPeople = [...storedPeopleState.people]
      for (const personId of new Set([
        ...personBalanceDeltas.keys(),
        ...personTransactionDeltas.keys(),
      ])) {
        const person = allPeople.find((record) => record.id === personId)
        if (!person) throw new Error('طرف‌حساب فاکتور در فهرست اشخاص پیدا نشد.')
        const signedBalance = person.accountStatus === 'بدهکاران'
          ? person.balance
          : person.accountStatus === 'بستانکاران' ? -person.balance : 0
        const nextBalance = signedBalance + (personBalanceDeltas.get(personId) ?? 0)
        const nextTransactionCount = (person.transactionCount ?? 0) + (personTransactionDeltas.get(personId) ?? 0)
        if (!Number.isSafeInteger(nextBalance) || !Number.isSafeInteger(nextTransactionCount) || nextTransactionCount < 0) {
          throw new Error('مانده یا تعداد تراکنش‌های طرف‌حساب پس از اصلاح فاکتور معتبر نیست.')
        }
        const updatedPerson: PersonRecord = {
          ...person,
          accountStatus: nextBalance > 0
            ? 'بدهکاران'
            : nextBalance < 0 ? 'بستانکاران' : 'تسویه شده',
          balance: Math.abs(nextBalance),
          transactionCount: nextTransactionCount,
        }
        updatedPeople = [
          ...updatedPeople.filter((record) => record.id !== updatedPerson.id),
          updatedPerson,
        ]
      }

      const invoiceKey = getActiveStoreDataStorageKey(SALES_INVOICES_STORAGE_KEY, activeStoreId)
      const inventoryKey = getActiveStoreDataStorageKey(INVENTORY_ITEMS_STORAGE_KEY, activeStoreId)
      const peopleKey = getActiveStoreDataStorageKey(PEOPLE_STORAGE_KEY, activeStoreId)
      const previousValues = new Map<string, string | null>()
      try {
        previousValues.set(invoiceKey, localStorage.getItem(invoiceKey))
        if (updatedItemById.size) previousValues.set(inventoryKey, localStorage.getItem(inventoryKey))
        if (personBalanceDeltas.size || personTransactionDeltas.size) {
          previousValues.set(peopleKey, localStorage.getItem(peopleKey))
        }
      } catch {
        throw new Error('خواندن اطلاعات قبلی برای ثبت فاکتور انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
      }

      try {
        localStorage.setItem(invoiceKey, JSON.stringify(invoices))
        if (updatedItemById.size) localStorage.setItem(inventoryKey, JSON.stringify(updatedInventory))
        if (personBalanceDeltas.size || personTransactionDeltas.size) {
          localStorage.setItem(peopleKey, JSON.stringify(updatedPeople))
        }
      } catch {
        let rollbackFailed = false
        for (const [key, value] of previousValues) {
          try {
            if (value === null) localStorage.removeItem(key)
            else localStorage.setItem(key, value)
          } catch {
            rollbackFailed = true
          }
        }
        throw new Error(rollbackFailed
          ? 'ثبت فاکتور کامل نشد و بازگردانی خودکار همهٔ اطلاعات ممکن نبود؛ موجودی و مانده‌ها را بررسی کنید.'
          : 'ذخیرهٔ فاکتور انجام نشد؛ تغییرات موجودی و ماندهٔ طرف‌حساب بازگردانده شد.')
      }

      setStoredSalesInvoices({ invoices, error: '' })
      if (updatedItemById.size) setStoredInventoryRecords({ items: updatedInventory, error: '' })
      if (personBalanceDeltas.size || personTransactionDeltas.size) {
        setStoredPeopleState({ people: updatedPeople, error: '' })
      }
      setSalesInvoiceConfirmation(invoice)
      setSalesInvoiceEditingId(null)
      setSalesInvoiceMoreOpen(false)
      setSalesInvoicePaymentMenuOpen(false)
      setNotice(editingInvoice
        ? 'اصلاح فاکتور ذخیره شد و موجودی و ماندهٔ طرف‌حساب به‌روز شد.'
        : 'فاکتور فروش ذخیره شد و موجودی و ماندهٔ طرف‌حساب به‌روز شد.')
      window.setTimeout(() => setNotice(''), 3000)
    } catch (error) {
      setSalesInvoiceSaveError(error instanceof Error
        ? error.message
        : 'ثبت فاکتور فروش انجام نشد؛ دوباره تلاش کنید.')
    } finally {
      salesInvoiceSavingRef.current = false
      setSalesInvoiceSaving(false)
    }
  }

  const openSalesInvoiceItemPicker = () => {
    setSalesInvoiceBarcodeMode(false)
    setSalesInvoiceItemSearch('')
    setSalesInvoiceItemOptionsOpen(false)
    setSalesInvoiceDraftItem(null)
    setSalesInvoiceDraftDescription('')
    setSalesInvoiceDraftWarehouse(salesInvoiceWarehouseOptions.includes(activeWarehouse)
      ? activeWarehouse
      : DEFAULT_INVENTORY_WAREHOUSE)
    setSalesInvoiceDraftQuantity(1)
    setSalesInvoiceDraftPrice(0)
    setSalesInvoiceDraftDiscountPercent(0)
    setSalesInvoiceDraftDiscountAmount(0)
    setSalesInvoiceItemPickerOpen(true)
  }

  const openSalesInvoiceBarcodePicker = () => {
    setSalesInvoiceBarcodeMode(false)
    setSalesInvoiceBarcodeScannerError('')
    lastScannedBarcodeRef.current = ''
    setSalesInvoiceBarcodeScannerOpen(true)
  }

  const selectSalesInvoiceItem = useCallback((item: InventoryRecord) => {
    setSalesInvoiceBarcodeMode(false)
    setSalesInvoiceDraftItem(item)
    setSalesInvoiceDraftWarehouse(item.warehouse ?? (
      item.kind === 'خدمات' ? DEFAULT_SERVICE_WAREHOUSE : DEFAULT_INVENTORY_WAREHOUSE
    ))
    setSalesInvoiceItemSearch(item.name)
    setSalesInvoiceItemOptionsOpen(false)
    setSalesInvoiceCatalogOpen(false)
    setSalesInvoiceDraftDescription(item.name)
    setSalesInvoiceDraftQuantity(1)
    setSalesInvoiceDraftPrice(purchaseInvoicePartyMode
      ? item.purchasePrice
      : salesInvoiceSettings.autoSalesPricePercent && item.purchasePrice > 0
        ? Math.round(item.purchasePrice * (1 + salesInvoiceSettings.salePriceMarkupPercent / 100))
        : item.salePrice)
    setSalesInvoiceDraftDiscountPercent(0)
    setSalesInvoiceDraftDiscountAmount(0)
  }, [purchaseInvoicePartyMode, salesInvoiceSettings])

  useEffect(() => {
    if (!salesInvoiceBarcodeScannerOpen) return

    const video = salesInvoiceBarcodeVideoRef.current
    if (!video) {
      setSalesInvoiceBarcodeScannerError('نمایشگر دوربین آماده نشد. پنجره را ببندید و دوباره تلاش کنید.')
      return
    }

    let disposed = false
    let resultHandled = false
    let controls: IScannerControls | null = null
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setSalesInvoiceBarcodeScannerError('برای استفاده از دوربین، برنامه باید در بستر امن (HTTPS) باز شود.')
      return
    }

    const handleScanError = (error: unknown) => {
      if (disposed) return
      const errorName = error instanceof Error ? error.name : ''
      setSalesInvoiceBarcodeScannerError(
        errorName === 'NotAllowedError'
          ? 'دسترسی به دوربین رد شد. اجازهٔ استفاده از دوربین را در تنظیمات مرورگر فعال کنید.'
          : errorName === 'NotFoundError' || errorName === 'OverconstrainedError'
            ? 'دوربینی برای اسکن بارکد پیدا نشد.'
            : errorName === 'NotReadableError'
              ? 'دوربین در حال استفاده است. برنامه‌های دیگرِ استفاده‌کننده از دوربین را ببندید.'
              : errorName === 'SecurityError'
                ? 'برای استفاده از دوربین، برنامه باید در بستر امن (HTTPS) باز شود.'
                : 'راه‌اندازی دوربین انجام نشد. دسترسی دوربین را بررسی و دوباره تلاش کنید.',
      )
    }

    const startScanner = async () => {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        if (disposed) return
        const reader = new BrowserMultiFormatReader()
        controls = await reader.decodeFromVideoDevice(undefined, video, (result) => {
          if (!result || disposed || resultHandled) return

          const barcode = result.getText().trim()
          if (!barcode) return
          const normalizedBarcode = normalizeInventorySearchText(barcode)
          const item = salesInvoicePickerItems.find((inventoryItem) => (
            [inventoryItem.barcode, inventoryItem.code]
              .some((value) => value && normalizeInventorySearchText(value.trim()) === normalizedBarcode)
          ))

          if (!item) {
            if (lastScannedBarcodeRef.current !== barcode) {
              lastScannedBarcodeRef.current = barcode
              setSalesInvoiceBarcodeScannerError(`کالایی با بارکد «${barcode}» در فهرست کالاها پیدا نشد.`)
            }
            return
          }

          resultHandled = true
          controls?.stop()
          setSalesInvoiceBarcodeScannerError('')
          setSalesInvoiceBarcodeScannerOpen(false)
          setSalesInvoiceItemPickerOpen(true)
          selectSalesInvoiceItem(item)
        })
        if (disposed) controls.stop()
      } catch (error) {
        handleScanError(error)
      }
    }

    void startScanner()

    return () => {
      disposed = true
      controls?.stop()
    }
  }, [
    salesInvoicePickerItems,
    salesInvoiceBarcodeScannerOpen,
    selectSalesInvoiceItem,
  ])

  const openSalesInvoiceCatalog = () => {
    setSalesInvoiceCatalogKind('کالا')
    setSalesInvoiceCatalogGroup('همه')
    setSalesInvoiceCatalogCategory('همه')
    setSalesInvoiceCatalogSearch('')
    setSalesInvoiceItemSearch('')
    if (!inventoryOptions.warehouses.includes(salesInvoiceDraftWarehouse)) {
      setSalesInvoiceDraftWarehouse(inventoryOptions.warehouses[0] ?? DEFAULT_INVENTORY_WAREHOUSE)
    }
    setSalesInvoiceCatalogOpen(true)
  }

  const commitSalesInvoiceDraftItem = (closeAfter: boolean) => {
    if (!salesInvoiceDraftItem) {
      setNotice('ابتدا کالا یا خدمات را انتخاب کنید.')
      window.setTimeout(() => setNotice(''), 2600)
      return
    }
    const grossAmount = salesInvoiceDraftPrice * salesInvoiceDraftQuantity
    const discount = salesInvoiceSettings.enableItemDiscount
      ? Math.min(grossAmount,
        Math.round(grossAmount * salesInvoiceDraftDiscountPercent / 100) + salesInvoiceDraftDiscountAmount)
      : 0
    const description = salesInvoiceSettings.enableItemDescription
      ? salesInvoiceDraftDescription.trim() || salesInvoiceDraftItem.name
      : salesInvoiceDraftItem.name

    if (
      !returnInvoiceMode
      && salesInvoiceSettings.updateInventoryPrice
      && salesInvoiceDraftPrice !== salesInvoiceDraftItem.salePrice
    ) {
      if (storedInventoryRecords.error) {
        setNotice(storedInventoryRecords.error)
        window.setTimeout(() => setNotice(''), 2600)
        return
      }
      const updatedItem = {
        ...salesInvoiceDraftItem,
        salePrice: salesInvoiceDraftPrice,
      }
      const updatedInventoryRows = storedInventoryRecords.items.some((item) => item.id === updatedItem.id)
        ? storedInventoryRecords.items.map((item) => item.id === updatedItem.id ? updatedItem : item)
        : [...storedInventoryRecords.items, updatedItem]
      const updatedItems = updateInventoryCatalogPrices(
        updatedInventoryRows,
        updatedItem.id,
        { salePrice: updatedItem.salePrice },
      )
      try {
        localStorage.setItem(
          getActiveStoreDataStorageKey(INVENTORY_ITEMS_STORAGE_KEY, activeStoreId),
          JSON.stringify(updatedItems),
        )
        setStoredInventoryRecords({ items: updatedItems, error: '' })
      } catch {
        setNotice('به‌روزرسانی قیمت کالا در انبار انجام نشد؛ فاکتور ثبت نشد.')
        window.setTimeout(() => setNotice(''), 2600)
        return
      }
    }

    setSalesInvoiceLines((lines) => {
      const existing = lines.find((line) => (
        line.itemId === salesInvoiceDraftItem.id
        && (line.unitPrice ?? salesInvoiceDraftItem.salePrice) === salesInvoiceDraftPrice
        && (line.description ?? salesInvoiceDraftItem.name) === description
        && (line.warehouse ?? salesInvoiceDraftWarehouse) === salesInvoiceDraftWarehouse
      ))
      if (existing) {
        return lines.map((line) => line.id === existing.id
          ? {
            ...line,
            quantity: line.quantity + salesInvoiceDraftQuantity,
            discount: line.discount + discount,
            unitPrice: salesInvoiceDraftPrice,
            description,
            warehouse: salesInvoiceDraftWarehouse,
          }
          : line)
      }
      return [...lines, {
        id: `${salesInvoiceDraftItem.id}-${Date.now()}`,
        itemId: salesInvoiceDraftItem.id,
        warehouse: salesInvoiceDraftWarehouse,
        quantity: salesInvoiceDraftQuantity,
        discount,
        unitPrice: salesInvoiceDraftPrice,
        description,
      }]
    })
    setSalesInvoiceDraftItem(null)
    setSalesInvoiceDraftDescription('')
    if (closeAfter) {
      setSalesInvoiceItemPickerOpen(false)
      setSalesInvoiceItemSearch('')
    } else {
      setSalesInvoiceItemSearch('')
      setSalesInvoiceItemOptionsOpen(true)
      setSalesInvoiceDraftQuantity(1)
      setSalesInvoiceDraftPrice(0)
      setSalesInvoiceDraftDiscountPercent(0)
      setSalesInvoiceDraftDiscountAmount(0)
    }
  }

  const openSalesInvoiceAdjustment = (kind: SalesInvoiceAdjustmentKind) => {
    setSalesInvoiceAdjustmentDescription(returnInvoiceMode
      ? kind === 'addition' ? 'مالیات' : 'تخفیف'
      : '')
    setSalesInvoiceAdjustmentMode('percent')
    setSalesInvoiceAdjustmentValue(0)
    setSalesInvoiceAdjustmentAffectsProfit(true)
    setSalesInvoiceAdjustmentKind(kind)
  }

  const saveSalesInvoiceAdjustment = () => {
    if (!salesInvoiceAdjustmentDescription.trim() || salesInvoiceAdjustmentValue <= 0) {
      setNotice('شرح و مبلغ یا درصد را وارد کنید.')
      window.setTimeout(() => setNotice(''), 2600)
      return
    }
    setSalesInvoiceAdjustments((adjustments) => [...adjustments, {
      id: `${Date.now()}`,
      kind: salesInvoiceAdjustmentKind ?? 'addition',
      description: salesInvoiceAdjustmentDescription.trim(),
      mode: salesInvoiceAdjustmentMode,
      value: salesInvoiceAdjustmentValue,
      affectsProfit: salesInvoiceAdjustmentAffectsProfit,
    }])
    setSalesInvoiceAdjustmentKind(null)
  }

  const handleAuthSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthNotice('ورود و ثبت‌نام واقعی بعد از اتصال سرور فعال می‌شود. فعلاً می‌توانی نسخهٔ نمایشی را باز کنی.')
  }

  const enterDemo = () => {
    setDemoEntered(true)
    setActiveSettingsSection('')
    setActiveTab(stores.length === 0 ? 'فروشگاه' : 'خانه')
    setAuthNotice('')
  }

  const openStoreForm = (store?: Store) => {
    setEditingStoreId(store?.id ?? null)
    setStoreFields(store ? {
      name: store.name,
      address: store.address,
      phone: store.phone,
      code: store.code,
      currency: store.currency,
    } : emptyStoreFields)
    setStoreFormOpen(true)
  }

  const saveStore = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    if (editingStoreId === null) {
      const newStore = { ...storeFields, id: Date.now() }
      const creatingFirstStore = stores.length === 0
      const saved = updateStoreState((current) => ({
        ...current,
        stores: [...current.stores, newStore],
        activeStoreId: newStore.id,
      }))
      if (saved && creatingFirstStore && demoEntered) setActiveTab('خانه')
    } else {
      updateStoreState((current) => ({
        ...current,
        stores: current.stores.map((store) => (
          store.id === editingStoreId ? { ...store, ...storeFields } : store
        )),
      }))
    }
    setStoreFormOpen(false)
  }

  const deleteStore = (storeId: number) => {
    updateStoreState((current) => {
      const remainingStores = current.stores.filter((store) => store.id !== storeId)
      return {
        ...current,
        stores: remainingStores,
        activeStoreId: current.activeStoreId === storeId
          ? remainingStores[0]?.id ?? null
          : current.activeStoreId,
      }
    })
    setDeleteConfirmStoreId(null)
  }

  const openSupportChat = () => {
    if (window.Goftino && document.getElementById('goftino_w')) {
      setNotice('')
      window.Goftino.open()
      return
    }

    if (supportLoading.current) return
    supportLoading.current = true
    setNotice('در حال اتصال به پشتیبانی…')

    let timeoutId = 0
    const cleanup = () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener('goftino_ready', handleReady)
      supportLoading.current = false
    }
    const handleReady = () => {
      cleanup()
      if (window.Goftino && document.getElementById('goftino_w')) {
        setNotice('')
        window.Goftino.open()
      } else {
        handleError()
      }
    }
    const handleError = () => {
      cleanup()
      document.querySelector('[data-goftino-widget]')?.remove()
      document.getElementById('goftino_w')?.remove()
      Reflect.deleteProperty(window, 'Goftino')
      setNotice('اتصال به گفتینو برقرار نشد. اینترنت را بررسی و دوباره تلاش کنید.')
    }

    window.addEventListener('goftino_ready', handleReady, { once: true })
    timeoutId = window.setTimeout(handleError, 15000)

    document.querySelector('[data-goftino-widget]')?.remove()
    document.getElementById('goftino_w')?.remove()
    Reflect.deleteProperty(window, 'Goftino')

    let script = document.querySelector<HTMLScriptElement>('[data-goftino-widget]')
    if (!script) {
      const widgetId = '5qkMYj'
      const widgetUrl = `https://www.goftino.com/widget/${widgetId}`
      const savedOption = localStorage.getItem(`goftino_${widgetId}`)
      script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.src = savedOption ? `${widgetUrl}?o=${savedOption}` : widgetUrl
      script.dataset.goftinoWidget = 'true'
      script.addEventListener('error', handleError, { once: true })
      document.head.appendChild(script)
    } else {
      script.addEventListener('error', handleError, { once: true })
    }
  }

  const filteredPeople = allPeople
    .filter((person) => peopleFilter === 'همه'
      || person.accountStatus === peopleFilter
      || person.role === peopleFilter
      || person.group === peopleFilter)
    .filter((person) => `${person.name} ${person.phone}`.includes(peopleSearch.trim()))
    .sort((first, second) => {
      const byName = () => first.name.localeCompare(second.name, 'fa', { numeric: true, sensitivity: 'base' })
      if (peopleSortBy === 'createdAt' && Boolean(first.createdAt) !== Boolean(second.createdAt)) {
        return first.createdAt ? -1 : 1
      }
      const comparison = peopleSortBy === 'name'
        ? byName()
        : peopleSortBy === 'code'
          ? parsePersonCode(first.code) - parsePersonCode(second.code)
          : peopleSortBy === 'highestCredit'
            ? Number(first.accountStatus === 'بستانکاران') - Number(second.accountStatus === 'بستانکاران')
              || (first.accountStatus === 'بستانکاران' ? first.balance : 0)
                - (second.accountStatus === 'بستانکاران' ? second.balance : 0)
              || byName()
            : peopleSortBy === 'highestDebit'
              ? Number(first.accountStatus === 'بدهکاران') - Number(second.accountStatus === 'بدهکاران')
                || (first.accountStatus === 'بدهکاران' ? first.balance : 0)
                  - (second.accountStatus === 'بدهکاران' ? second.balance : 0)
                || byName()
              : peopleSortBy === 'createdAt'
                  ? (Date.parse(first.createdAt ?? '') || 0) - (Date.parse(second.createdAt ?? '') || 0)
                    || byName()
                : peopleSortBy === 'activity'
                  ? (first.transactionCount ?? 0) - (second.transactionCount ?? 0)
                    || byName()
                  : 0
      return peopleSortDirection === 'asc' ? comparison : -comparison
    })

  const downloadPeopleCsv = () => {
    const csvCell = (value: string | number) => {
      const text = String(value)
      const safeText = /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text
      return `"${safeText.replace(/"/g, '""')}"`
    }
    const rows = [
      ['کد شخص', 'نام', 'شماره تماس', 'گروه', 'نشانی', 'شماره حساب', 'مانده', 'وضعیت'],
      ...filteredPeople.map((person) => [
        person.code,
        person.name,
        person.phone,
        person.group || person.role,
        person.address,
        person.accountNumber,
        person.balance,
        person.accountStatus,
      ]),
    ]
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`
      downloadPeopleFile(csv, 'text/csv;charset=utf-8', 'csv')
  }

  const downloadPeopleExcel = () => {
      const xmlEscape = (value: string | number) => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
      const xmlCell = (value: string | number, type: 'String' | 'Number' = 'String') => (
        `<Cell><Data ss:Type="${type}">${xmlEscape(value)}</Data></Cell>`
      )
      const headers = ['کد شخص', 'نام', 'شماره تماس', 'گروه', 'نشانی', 'شماره حساب', 'مانده', 'وضعیت']
      const dataRows = filteredPeople.map((person) => [
        person.code,
        person.name,
        person.phone,
        person.group || person.role,
        person.address,
        person.accountNumber,
        person.balance,
        person.accountStatus,
      ])
      const rows = [
        `<Row>${headers.map((header) => xmlCell(header)).join('')}</Row>`,
        ...dataRows.map((row) => (
          `<Row>${row.map((value) => xmlCell(value, typeof value === 'number' ? 'Number' : 'String')).join('')}</Row>`
        )),
      ]
      const workbook = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="اشخاص"><Table>${rows.join('')}</Table></Worksheet></Workbook>`
      downloadPeopleFile(workbook, 'application/vnd.ms-excel;charset=utf-8', 'xls')
  }

  const downloadPeopleFile = (content: string, type: string, extension: 'csv' | 'xls') => {
      const url = URL.createObjectURL(new Blob([content], { type }))
      const link = document.createElement('a')
      link.href = url
      link.download = `trazino-people-${getIranDateValue(now)}.${extension}`
      document.body.appendChild(link)
      link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setPeopleToolbarMenu(null)
  }

  const downloadInventoryExcel = () => {
    const xmlEscape = (value: string | number) => String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
    const xmlCell = (value: string | number, type: 'String' | 'Number' = 'String') => (
      `<Cell><Data ss:Type="${type}">${xmlEscape(value)}</Data></Cell>`
    )
    const headers = inventoryKind === 'خدمات'
      ? ['کد خدمات', 'شرح خدمات', 'گروه', 'دسته‌بندی', 'واحد', 'قیمت']
      : ['نام کالا', 'نوع', 'گروه', 'دسته‌بندی', 'برند', 'موجودی', 'واحد', 'قیمت خرید', 'قیمت فروش']
    const rows = [
      `<Row>${headers.map((header) => xmlCell(header)).join('')}</Row>`,
      ...filteredInventory.map((item) => (
        `<Row>${(item.kind === 'خدمات'
        ? [
            xmlCell(item.code ?? ''),
            xmlCell(item.name),
            xmlCell(item.group),
            xmlCell(item.category),
            xmlCell(item.unit),
            xmlCell(item.salePrice, 'Number'),
            ]
          : [
              xmlCell(item.name),
              xmlCell(item.kind),
              xmlCell(item.group),
              xmlCell(item.category),
              xmlCell(item.brand),
              xmlCell(item.stock, 'Number'),
              xmlCell(item.unit),
              xmlCell(item.purchasePrice, 'Number'),
              xmlCell(item.salePrice, 'Number'),
            ]).join('')}</Row>`
      )),
    ]
    const sheetName = inventoryKind === 'خدمات' ? 'خدمات' : 'انبار'
    const workbook = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="${sheetName}"><Table>${rows.join('')}</Table></Worksheet></Workbook>`
    const url = URL.createObjectURL(new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `trazino-${inventoryKind === 'خدمات' ? 'services' : 'inventory'}-${getIranDateValue(now)}.xls`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice(inventoryKind === 'خدمات'
      ? 'خروجی اکسل فهرست خدمات آماده شد.'
      : 'خروجی اکسل فهرست انبار آماده شد.')
    window.setTimeout(() => setNotice(''), 2600)
  }

  const inventoryShareRows = () => inventoryShareItems.map((item) => {
    const priceDetails = item.kind === 'خدمات'
      ? `قیمت: ${formatPersonBalance(item.salePrice)} ریال`
      : `خرید: ${formatPersonBalance(item.purchasePrice)} ریال | فروش: ${formatPersonBalance(item.salePrice)} ریال`
    const details = [
      inventoryShareSetting.includeStock ? `موجودی: ${formatPersonBalance(item.stock)} ${item.unit}` : '',
      inventoryShareSetting.includePrices ? priceDetails : '',
    ].filter(Boolean).join(' | ')
    return { name: item.name, details, group: item.group, category: item.category }
  })

  const setInventoryUnitValue = (target: InventoryUnitTarget, value: string) => {
    if (target === 'product') {
      setInventoryProductFields((fields) => ({ ...fields, unit: value }))
    } else if (target === 'secondary') {
      setInventoryProductFields((fields) => ({ ...fields, secondaryUnit: value }))
    } else {
      setInventoryServiceFields((fields) => ({ ...fields, unit: value }))
    }
    setInventoryUnitMenu(null)
    setInventoryUnitMenuPosition(null)
  }

  const renderInventoryUnitSelector = (
    target: InventoryUnitTarget,
    value: string,
    label: string,
    allowEmpty = false,
  ) => {
    const unitMenu = inventoryUnitMenu === target && (
      <div
        className="inventory-unit-menu inventory-unit-menu--portal"
        role="listbox"
        aria-label={`واحدهای ${label}`}
        style={inventoryUnitMenuPosition ? {
          top: inventoryUnitMenuPosition.top,
          left: inventoryUnitMenuPosition.left,
          width: inventoryUnitMenuPosition.width,
          maxHeight: inventoryUnitMenuPosition.maxHeight,
        } : undefined}
      >
        {allowEmpty && (
          <button
            type="button"
            role="option"
            aria-selected={!value}
            onClick={() => setInventoryUnitValue(target, '')}
          >
            بدون واحد دوم
          </button>
        )}
        {storedInventoryUnits.units.map((unit) => (
          <button
            type="button"
            role="option"
            aria-selected={value === unit}
            key={unit}
            onClick={() => setInventoryUnitValue(target, unit)}
          >
            {unit}
          </button>
        ))}
      </div>
    )

    return (
      <div className="inventory-unit-selector">
        <div className="inventory-unit-control">
          <button
            className="inventory-unit-select"
            type="button"
            aria-label={`انتخاب ${label}`}
            aria-haspopup="listbox"
            aria-expanded={inventoryUnitMenu === target}
            onClick={(event) => {
              if (inventoryUnitMenu === target) {
                setInventoryUnitMenu(null)
                setInventoryUnitMenuPosition(null)
                return
              }
              const rect = event.currentTarget.getBoundingClientRect()
              const spaceAbove = rect.top - 12
              const spaceBelow = window.innerHeight - rect.bottom - 12
              const openAbove = spaceAbove >= 150 || spaceAbove >= spaceBelow
              const availableSpace = openAbove ? spaceAbove : spaceBelow
              const maxHeight = Math.min(220, Math.max(80, availableSpace - 8))
              const optionCount = storedInventoryUnits.units.length + Number(allowEmpty)
              const contentHeight = optionCount * 42 + Math.max(0, optionCount - 1) * 4 + 16
              const menuHeight = Math.min(maxHeight, contentHeight)
              setInventoryUnitMenuPosition({
                top: openAbove ? rect.top - menuHeight - 6 : rect.bottom + 6,
                left: rect.left,
                width: rect.width,
                maxHeight,
              })
              setInventoryUnitMenu(target)
            }}
          >
            <span>{value || (allowEmpty ? 'انتخاب واحد دوم' : 'انتخاب واحد')}</span>
            <span className="dropdown-chevron inventory-unit-chevron" aria-hidden="true">⌄</span>
          </button>
          <button
            className="inventory-unit-add"
            type="button"
            aria-label={`افزودن واحد برای ${label}`}
            title="افزودن واحد جدید"
            onClick={() => {
              setInventoryUnitFormTarget(target)
              setInventoryUnitInput('')
              setInventoryUnitError(storedInventoryUnits.error)
              setInventoryUnitMenu(null)
              setInventoryUnitMenuPosition(null)
              setInventoryUnitFormOpen(true)
            }}
          >
            +
          </button>
        </div>
        {unitMenu && createPortal(unitMenu, document.body)}
      </div>
    )
  }

  const saveInventoryUnit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const unit = inventoryUnitInput.trim()
    if (!unit) {
      setInventoryUnitError('نام واحد را وارد کنید.')
      return
    }
    if (storedInventoryUnits.error) {
      setInventoryUnitError(storedInventoryUnits.error)
      return
    }
    if (storedInventoryUnits.units.some((existing) => existing.toLocaleLowerCase() === unit.toLocaleLowerCase())) {
      setInventoryUnitError('این واحد از قبل وجود دارد.')
      return
    }
    const units = [...storedInventoryUnits.units, unit]
    try {
      localStorage.setItem(
        getActiveStoreDataStorageKey(INVENTORY_UNITS_STORAGE_KEY, activeStoreId),
        JSON.stringify(units),
      )
      setStoredInventoryUnits({ units, error: '' })
      setInventoryUnitValue(inventoryUnitFormTarget, unit)
      setInventoryUnitFormOpen(false)
      setInventoryUnitError('')
    } catch {
      setInventoryUnitError('ذخیرهٔ واحد انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
    }
  }

  const openInventoryProductForm = () => {
    const nextCode = Math.max(0, ...inventoryItems
      .filter((item) => item.kind !== 'خدمات')
      .map((item, index) => (
      parsePersonCode(item.code ?? String(index + 1))
    ))) + 1
    setEditingInventoryProductId(null)
    setInventoryProductFields({
      ...emptyInventoryProductForm,
      code: formatPersonCode(nextCode),
    })
    setInventoryProductTab('basic')
    setInventoryProductError('')
    setInventoryProductOpen(true)
  }

  const saveInventoryProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!inventoryProductFields.name.trim()) {
      setInventoryProductTab('basic')
      setInventoryProductError('نام کالا را وارد کنید.')
      return
    }
    if (inventoryProductTab === 'basic') {
      if (!inventoryProductFields.unit.trim()) {
        setInventoryProductError('واحد کالا را وارد کنید.')
        return
      }
      setInventoryProductError('')
      setInventoryProductTab('extra')
      return
    }

    const stock = parsePersonBalance(inventoryProductFields.stock)
    const purchasePrice = parsePersonBalance(inventoryProductFields.purchasePrice)
    const salePrice = parsePersonBalance(inventoryProductFields.salePrice)
    const conversionRatio = inventoryProductFields.conversionRatio.trim()
      ? Number(inventoryProductFields.conversionRatio
        .replace(/[۰-۹٠-٩]/g, (digit) => {
          const code = digit.charCodeAt(0)
          return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660)
        })
        .replace(/[٬\s]/g, '')
        .replace(',', '.'))
      : undefined
    if (stock === null || purchasePrice === null || salePrice === null) {
      setInventoryProductError('موجودی و قیمت‌ها باید عدد صحیح و نامنفی باشند.')
      return
    }
    if (conversionRatio !== undefined && (!Number.isFinite(conversionRatio) || conversionRatio <= 0)) {
      setInventoryProductError('ضریب تبدیل باید عددی بزرگ‌تر از صفر باشد.')
      return
    }

    const editedItem = editingInventoryProductId
      ? inventoryItems.find((item) => item.id === editingInventoryProductId)
      : undefined
    const selectedGroup = inventoryGroup !== 'همه'
      ? inventoryGroup
      : editedItem?.group ?? inventoryGroups[0] ?? 'بدون گروه'
    const selectedCategory = inventoryCategory !== 'همه'
      ? inventoryCategory
      : editedItem?.group === selectedGroup
        ? editedItem.category
        : activeWarehouseTaxonomy.categoriesByGroup[selectedGroup]?.[0] ?? 'بدون دسته‌بندی'
    if (storedInventoryRecords.error) {
      setInventoryProductError(storedInventoryRecords.error)
      return
    }
    const now = new Date().toISOString()
    if (editingInventoryProductId && !editedItem) {
      setInventoryProductError('کالای موردنظر برای ویرایش پیدا نشد.')
      return
    }
    const sharedFields: Pick<InventoryRecord,
      'code' | 'name' | 'group' | 'category' | 'brand' | 'unit' | 'purchasePrice' | 'salePrice' |
      'barcode' | 'secondaryUnit' | 'conversionRatio'
    > = {
      code: inventoryProductFields.code,
      name: inventoryProductFields.name.trim(),
      group: selectedGroup,
      category: selectedCategory,
      brand: inventoryProductFields.brand.trim() || '—',
      unit: inventoryProductFields.unit.trim(),
      purchasePrice,
      salePrice,
      barcode: inventoryProductFields.barcode.trim(),
      secondaryUnit: inventoryProductFields.secondaryUnit.trim(),
      conversionRatio,
    }
    const nextRecords = editedItem
      ? storedInventoryRecords.items.map((item) =>
          (item.catalogId ?? item.id) === (editedItem.catalogId ?? editedItem.id)
            ? {
                ...item,
                ...sharedFields,
                stock: item.id === editedItem.id ? stock : item.stock,
                ...(item.id === editedItem.id && Math.abs(stock - item.stock) > 0.000001
                  ? {
                      stockMovements: [
                        ...(item.stockMovements ?? []),
                        {
                          id: `stock-adjustment-${Date.now()}`,
                          kind: stock > item.stock ? 'count-in' as const : 'count-out' as const,
                          quantity: Math.abs(stock - item.stock),
                          createdAt: now,
                        },
                      ],
                    }
                  : {}),
              }
            : item)
      : (() => {
          const catalogId = `item-${Date.now()}`
          const item: InventoryRecord = {
            id: catalogId,
            catalogId,
            ...sharedFields,
            createdAt: now,
            lastMovementAt: now,
            kind: 'کالا',
            stock,
            warehouse: activeWarehouse,
            stockMovements: stock > 0
              ? [{
                  id: `stock-opening-${catalogId}`,
                  kind: 'opening',
                  quantity: stock,
                  createdAt: now,
                }]
              : [],
          }
          return [...storedInventoryRecords.items, item]
        })()
    const items = synchronizeInventoryCatalog(
      nextRecords,
      inventoryOptions.warehouses,
      inventoryOptions.serviceWarehouses,
    )
    try {
      persistInventoryChanges(inventoryOptions, items)
      setInventoryProductOpen(false)
      setEditingInventoryProductId(null)
      setNotice(editedItem ? 'تغییرات کالا ذخیره شد.' : 'کالای جدید به فهرست اضافه شد.')
      window.setTimeout(() => setNotice(''), 2600)
    } catch {
      setInventoryProductError('ذخیرهٔ کالا انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
    }
  }

  const openInventoryServiceForm = () => {
    const nextCode = Math.max(0, ...inventoryServiceItems.map((item, index) => (
      parsePersonCode(item.code ?? String(index + 1))
    ))) + 1
    setEditingInventoryServiceId(null)
    setInventoryServiceFields({
      ...emptyInventoryServiceForm,
      code: formatPersonCode(nextCode),
    })
    setInventoryServiceError('')
    setInventoryServiceOpen(true)
  }

  const saveInventoryService = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const description = inventoryServiceFields.description.trim()
    if (!description) {
      setInventoryServiceError('شرح خدمات را وارد کنید.')
      return
    }
    if (!inventoryServiceFields.unit.trim()) {
      setInventoryServiceError('واحد خدمات را وارد کنید.')
      return
    }
    const price = parsePersonBalance(inventoryServiceFields.price)
    if (price === null || price === 0) {
      setInventoryServiceError('قیمت هر واحد را به‌صورت عددی بزرگ‌تر از صفر وارد کنید.')
      return
    }
    if (storedInventoryRecords.error) {
      setInventoryServiceError(storedInventoryRecords.error)
      return
    }

    const selectedGroup = inventoryGroup !== 'همه'
      ? inventoryGroup
      : activeWarehouseTaxonomy.groupsByKind.خدمات[0] ?? 'بدون گروه'
    const selectedCategory = inventoryCategory !== 'همه'
      ? inventoryCategory
      : activeWarehouseTaxonomy.categoriesByGroup[selectedGroup]?.[0] ?? 'بدون دسته‌بندی'
    const createdAt = new Date().toISOString()
    const editedItem = editingInventoryServiceId
      ? inventoryServiceItems.find((item) => item.id === editingInventoryServiceId)
      : undefined
    if (editingInventoryServiceId && !editedItem) {
      setInventoryServiceError('خدمت موردنظر برای ویرایش پیدا نشد.')
      return
    }
    const sharedFields: Pick<InventoryRecord,
      'code' | 'name' | 'group' | 'category' | 'brand' | 'unit' | 'salePrice'
    > = {
      code: inventoryServiceFields.code,
      name: description,
      group: selectedGroup,
      category: selectedCategory,
      brand: 'خدمات',
      unit: inventoryServiceFields.unit.trim(),
      salePrice: price,
    }
    const nextRecords = editedItem
      ? storedInventoryRecords.items.map((item) =>
          (item.catalogId ?? item.id) === (editedItem.catalogId ?? editedItem.id)
            ? { ...item, ...sharedFields }
            : item)
      : (() => {
          const catalogId = `service-${Date.now()}`
          const item: InventoryRecord = {
            id: catalogId,
            catalogId,
            ...sharedFields,
            createdAt,
            lastMovementAt: createdAt,
            kind: 'خدمات',
            stock: 0,
            purchasePrice: 0,
            warehouse: DEFAULT_SERVICE_WAREHOUSE,
          }
          return [...storedInventoryRecords.items, item]
        })()
    const items = synchronizeInventoryCatalog(
      nextRecords,
      inventoryOptions.warehouses,
      inventoryOptions.serviceWarehouses,
    )
    try {
      persistInventoryChanges(inventoryOptions, items)
      setInventoryServiceOpen(false)
      setEditingInventoryServiceId(null)
      setNotice(editedItem ? 'تغییرات خدمات ذخیره شد.' : 'خدمت جدید به فهرست اضافه شد.')
      window.setTimeout(() => setNotice(''), 2600)
    } catch {
      setInventoryServiceError('ذخیرهٔ خدمات انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
    }
  }

  const shareInventoryImage = async () => {
    try {
      const rows = inventoryShareRows()
      const canvas = document.createElement('canvas')
      const rowHeight = 76
      canvas.width = 1080
      canvas.height = Math.max(360, 240 + rows.length * rowHeight)
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas rendering is unavailable.')

      context.fillStyle = '#f5f8f7'
      context.fillRect(0, 0, canvas.width, canvas.height)
      const header = context.createLinearGradient(0, 0, canvas.width, 0)
      header.addColorStop(0, '#173b50')
      header.addColorStop(1, '#11665f')
      context.fillStyle = header
      context.fillRect(0, 0, canvas.width, 155)
      context.direction = 'rtl'
      context.textAlign = 'right'
      context.fillStyle = '#8ed9c4'
      context.font = '700 24px "Vazirmatn Variable", Tahoma, sans-serif'
      context.fillText('گزارش انبار', canvas.width - 44, 48)
      context.fillStyle = '#ffffff'
      context.font = '800 34px "Vazirmatn Variable", Tahoma, sans-serif'
      context.fillText('فهرست کالاها', canvas.width - 44, 99)
      context.fillStyle = '#d7e8e5'
      context.font = '500 20px "Vazirmatn Variable", Tahoma, sans-serif'
      context.fillText(`${formatPersonBalance(rows.length)} مورد`, canvas.width - 44, 134)

      rows.forEach((row, index) => {
        const top = 178 + index * rowHeight
        context.fillStyle = '#ffffff'
        context.fillRect(32, top, canvas.width - 64, rowHeight - 10)
        context.strokeStyle = '#dfe9e7'
        context.strokeRect(32, top, canvas.width - 64, rowHeight - 10)
        context.fillStyle = '#193847'
        context.font = '700 24px "Vazirmatn Variable", Tahoma, sans-serif'
        context.fillText(row.name, canvas.width - 58, top + 30)
        context.fillStyle = '#647b80'
        context.font = '500 17px "Vazirmatn Variable", Tahoma, sans-serif'
        context.fillText(row.details || `${row.group} | ${row.category}`, canvas.width - 58, top + 57)
      })

      const base64 = canvas.toDataURL('image/png').split(',')[1]
      if (!base64) throw new Error('Could not encode inventory image.')
      const binary = window.atob(base64)
      const imageBytes = new Uint8Array(binary.length)
      for (let index = 0; index < binary.length; index += 1) {
        imageBytes[index] = binary.charCodeAt(index)
      }
      const blob = new Blob([imageBytes.buffer], { type: 'image/png' })
      const file = new File([blob], `trazino-inventory-${getIranDateValue(now)}.png`, { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        const sharePromise = navigator.share({ title: 'فهرست کالاهای انبار', files: [file] })
        await sharePromise
        setInventoryShareOpen(false)
      } else {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.setTimeout(() => URL.revokeObjectURL(url), 1000)
        setInventoryShareOpen(false)
        setNotice('تصویر فهرست انبار ذخیره شد.')
        window.setTimeout(() => setNotice(''), 2600)
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setNotice('ساخت یا ارسال تصویر فهرست انجام نشد.')
      window.setTimeout(() => setNotice(''), 2600)
    }
  }

  const printInventoryShare = (pdf: boolean) => {
    const rows = inventoryShareRows()
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      setNotice('پنجرهٔ چاپ باز نشد. اجازهٔ بازشدن پنجرهٔ جدید را بررسی کنید.')
      window.setTimeout(() => setNotice(''), 3000)
      return
    }

    const escapeHtml = (value: string) => value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
    const rowMarkup = rows.map((row) => (
      `<tr><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.group)}</td><td>${escapeHtml(row.category)}</td><td>${escapeHtml(row.details || '—')}</td></tr>`
    )).join('')

    printWindow.document.write(`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>فهرست کالاهای انبار</title><style>
      @page{size:auto;margin:16mm}*{box-sizing:border-box}body{font-family:Tahoma,Arial,sans-serif;color:#193847;margin:0;padding:24px;background:#fff}
      header{padding:18px 22px;margin-bottom:20px;border-radius:16px;background:linear-gradient(115deg,#173b50,#11665f);color:#fff}
      h1{font-size:22px;margin:0 0 7px}p{margin:0;color:#d7e8e5;font-size:12px}
      table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:10px 8px;border-bottom:1px solid #dfe9e7;text-align:right}
      th{background:#edf7f3;color:#147d71;font-weight:700}tbody tr:nth-child(even){background:#f8fbf9}
      @media print{body{padding:0}header{-webkit-print-color-adjust:exact;print-color-adjust:exact}th{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body><header><h1>فهرست کالاهای انبار</h1><p>${formatPersonBalance(rows.length)} مورد</p></header>
      <table><thead><tr><th>نام کالا</th><th>گروه</th><th>دسته‌بندی</th><th>اطلاعات</th></tr></thead><tbody>${rowMarkup || '<tr><td colspan="4">موردی برای نمایش وجود ندارد.</td></tr>'}</tbody></table>
      <script>window.addEventListener('load',function(){setTimeout(function(){window.print()},250)})</script></body></html>`)
    printWindow.document.close()
    setInventoryShareOpen(false)
    if (pdf) {
      setNotice('در پنجرهٔ چاپ، «ذخیره به‌صورت PDF» را انتخاب کنید.')
      window.setTimeout(() => setNotice(''), 4000)
    }
  }

  const openPersonForm = (role = 'شخص', groupOverride?: string) => {
    const nextCode = Math.max(999, ...allPeople.map((person) => parsePersonCode(person.code))) + 1
    const selectedGroup = peopleGroupState.groups.includes(groupOverride ?? '')
      ? groupOverride ?? ''
      : peopleGroupState.groups.includes(peopleFilter)
        ? peopleFilter
      : peopleGroupState.groups.length === 1 ? peopleGroupState.groups[0] : ''
    setPersonFormRole(role)
    setPersonFormFields({
      ...emptyPersonForm,
      code: formatPersonCode(nextCode),
      group: selectedGroup,
    })
    setPersonFormTab('basic')
    setPersonFormError('')
    setPersonFormOpen(true)
  }

  const savePerson = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (personFormTab === 'basic') {
      if (!personFormFields.name.trim()) {
        setPersonFormError('نام شخص را وارد کنید.')
        return
      }
      setPersonFormError('')
      setPersonFormTab('extra')
      return
    }
    if (storedPeopleState.error) {
      setPersonFormError(storedPeopleState.error)
      return
    }
    if (peopleGroupState.groups.length > 0 && !peopleGroupState.groups.includes(personFormFields.group)) {
      setPersonFormTab('basic')
      setPersonFormError('گروه این شخص را انتخاب کنید.')
      return
    }

    const name = personFormFields.name.trim()
    const balance = parsePersonBalance(personFormFields.balance)
    if (!name) {
      setPersonFormTab('basic')
      setPersonFormError('نام شخص را وارد کنید.')
      return
    }
    if (balance === null) {
      setPersonFormTab('extra')
      setPersonFormError('ماندهٔ حساب باید عدد صحیح و نامنفی باشد.')
      return
    }

    const person: PersonRecord = {
      id: `person-${Date.now()}`,
      code: personFormFields.code,
      name,
      group: personFormFields.group,
      role: personFormRole,
      phone: personFormFields.phone.trim(),
      address: personFormFields.address.trim(),
      accountNumber: personFormFields.accountNumber.trim(),
      accountStatus: balance === 0
        ? 'تسویه شده'
        : personFormFields.balanceDirection === 'debit' ? 'بدهکاران' : 'بستانکاران',
      balance,
      tone: ['mint', 'blue', 'amber', 'violet', 'coral'][storedPeopleState.people.length % 5],
      createdAt: new Date().toISOString(),
      transactionCount: 0,
    }
    const people = [...storedPeopleState.people, person]
    try {
      localStorage.setItem(
        getActiveStoreDataStorageKey(PEOPLE_STORAGE_KEY, activeStoreId),
        JSON.stringify(people),
      )
      setStoredPeopleState({ people, error: '' })
      setPeopleSearch('')
      setPeopleFilter('همه')
      setPersonFormOpen(false)
      setPersonFormError('')
      if (salesInvoicePersonPickerReturnTab) {
        setSalesInvoicePerson(person.id)
        setSalesInvoicePartyError('')
        setSalesInvoicePersonSearch('')
        setSalesInvoicePersonPickerSearch('')
        setSalesInvoicePersonPickerReturnTab(null)
        setSalesInvoicePersonPickerOpen(false)
        setActiveTab(salesInvoicePersonPickerReturnTab)
      }
    } catch {
      setPersonFormError('ذخیرهٔ شخص انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
    }
  }

  const openPeopleGroupMenu = (group: string, x: number, y: number) => {
    const positionX = Number.isFinite(x) ? x : window.innerWidth / 2
    const positionY = Number.isFinite(y) ? y : window.innerHeight / 2
    setPeopleGroupMenu({
      group,
      x: Math.max(8, Math.min(positionX, window.innerWidth - 188)),
      y: Math.max(8, Math.min(positionY, window.innerHeight - 108)),
    })
  }

  const clearPeopleGroupPressTimer = () => {
    if (peopleGroupPressTimer.current !== null) {
      window.clearTimeout(peopleGroupPressTimer.current)
      peopleGroupPressTimer.current = null
    }
    peopleGroupPressOrigin.current = null
  }

  const addPeopleGroup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const group = peopleGroupInput.trim()
    if (!group) {
      setPeopleGroupError('نام گروه را وارد کنید.')
      return
    }
    if ([...peopleFilters, ...peopleGroupState.groups].some((existing) => (
      existing !== editingPeopleGroup && existing.toLocaleLowerCase() === group.toLocaleLowerCase()
    ))) {
      setPeopleGroupError('این گروه از قبل وجود دارد.')
      return
    }

    const groups = editingPeopleGroup
      ? peopleGroupState.groups.map((existing) => existing === editingPeopleGroup ? group : existing)
      : [...peopleGroupState.groups, group]
    try {
      localStorage.setItem(
        getActiveStoreDataStorageKey(PEOPLE_GROUPS_STORAGE_KEY, activeStoreId),
        JSON.stringify(groups),
      )
      setPeopleGroupState({ groups, error: '' })
      if (accountReportGroup === editingPeopleGroup) setAccountReportGroup(group)
      if (peopleFilter === editingPeopleGroup || !editingPeopleGroup) setPeopleFilter(group)
      setPeopleGroupInput('')
      setIsAddingPeopleGroup(false)
      setEditingPeopleGroup(null)
      setPeopleGroupError('')
    } catch {
      setPeopleGroupError('ذخیرهٔ تغییر گروه انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
    }
  }

  const addSalesInvoicePickerGroup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const group = salesInvoicePersonPickerGroupName.trim()
    if (!group) {
      setSalesInvoicePersonPickerGroupError('نام گروه را وارد کنید.')
      return
    }
    if (peopleGroupState.error) {
      setSalesInvoicePersonPickerGroupError(peopleGroupState.error)
      return
    }
    if (group.toLocaleLowerCase() === allAccountReportGroups.toLocaleLowerCase()
      || [...peopleFilters, ...peopleGroupState.groups].some((existing) => (
        existing.toLocaleLowerCase() === group.toLocaleLowerCase()
      ))) {
      setSalesInvoicePersonPickerGroupError('این گروه از قبل وجود دارد.')
      return
    }

    const groups = [...peopleGroupState.groups, group]
    try {
      localStorage.setItem(
        getActiveStoreDataStorageKey(PEOPLE_GROUPS_STORAGE_KEY, activeStoreId),
        JSON.stringify(groups),
      )
      setPeopleGroupState({ groups, error: '' })
      setSalesInvoicePersonPickerGroup(group)
      setSalesInvoicePersonPickerGroupName('')
      setSalesInvoicePersonPickerGroupFormOpen(false)
      setSalesInvoicePersonPickerGroupError('')
    } catch {
      setSalesInvoicePersonPickerGroupError('ذخیرهٔ گروه انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
    }
  }

  const deletePeopleGroup = (group: string) => {
    const groups = peopleGroupState.groups.filter((existing) => existing !== group)
    try {
      localStorage.setItem(
        getActiveStoreDataStorageKey(PEOPLE_GROUPS_STORAGE_KEY, activeStoreId),
        JSON.stringify(groups),
      )
      setPeopleGroupState({ groups, error: '' })
      if (accountReportGroup === group) setAccountReportGroup(allAccountReportGroups)
      if (peopleFilter === group) setPeopleFilter('همه')
      setPeopleGroupMenu(null)
      setPeopleGroupError('')
    } catch {
      setPeopleGroupError('حذف گروه ذخیره نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
      setPeopleGroupMenu(null)
    }
  }

  const clearInventoryActionPressTimer = () => {
    if (inventoryActionPressTimer.current !== null) {
      window.clearTimeout(inventoryActionPressTimer.current)
      inventoryActionPressTimer.current = null
    }
    inventoryActionPressOrigin.current = null
  }

  const openInventoryActionMenu = (item: InventoryActionItem) => {
    setInventoryActionItem({
      ...item,
      x: Math.max(8, Math.min(item.x, window.innerWidth - 190)),
      y: Math.max(8, Math.min(item.y, window.innerHeight - 120)),
    })
  }

  const startInventoryActionPress = (event: ReactPointerEvent<HTMLElement>, item: InventoryActionTarget) => {
    clearInventoryActionPressTimer()
    suppressInventoryActionClick.current = false
    if (item.type === 'warehouse'
      && item.name === (item.kind === 'خدمات' ? DEFAULT_SERVICE_WAREHOUSE : DEFAULT_INVENTORY_WAREHOUSE)) return
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
    if ((event.target as Element).closest('.inventory-action-trigger')) return
    const { clientX, clientY } = event
    inventoryActionPressOrigin.current = { x: clientX, y: clientY }
    inventoryActionPressTimer.current = window.setTimeout(() => {
      suppressInventoryActionClick.current = true
      openInventoryActionMenu({ ...item, x: clientX, y: clientY })
      inventoryActionPressTimer.current = null
    }, 550)
  }

  const moveInventoryActionPress = (event: ReactPointerEvent<HTMLElement>) => {
    const origin = inventoryActionPressOrigin.current
    if (!origin) return
    if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 10) {
      clearInventoryActionPressTimer()
    }
  }

  const activateInventoryActionItem = (event: ReactMouseEvent<HTMLButtonElement>, item: InventoryActionTarget) => {
    if (suppressInventoryActionClick.current) {
      suppressInventoryActionClick.current = false
      event.preventDefault()
      return
    }
    const bounds = event.currentTarget.getBoundingClientRect()
    openInventoryActionMenu({ ...item, x: bounds.left, y: bounds.bottom + 5 })
  }

  const persistInventoryChanges = (
    nextOptions: StoredInventoryOptions,
    nextItems: InventoryRecord[] = storedInventoryRecords.items,
  ) => {
    const optionsKey = getActiveStoreDataStorageKey(INVENTORY_OPTIONS_STORAGE_KEY, activeStoreId)
    const itemsKey = getActiveStoreDataStorageKey(INVENTORY_ITEMS_STORAGE_KEY, activeStoreId)
    const previousOptions = localStorage.getItem(optionsKey)
    const previousItems = localStorage.getItem(itemsKey)
    try {
      localStorage.setItem(optionsKey, JSON.stringify(nextOptions))
      if (nextItems !== storedInventoryRecords.items) localStorage.setItem(itemsKey, JSON.stringify(nextItems))
    } catch (error) {
      try {
        if (previousOptions === null) localStorage.removeItem(optionsKey)
        else localStorage.setItem(optionsKey, previousOptions)
        if (nextItems !== storedInventoryRecords.items) {
          if (previousItems === null) localStorage.removeItem(itemsKey)
          else localStorage.setItem(itemsKey, previousItems)
        }
      } catch {
        throw new Error('ذخیره‌سازی کامل نشد و بازگردانی اطلاعات قبلی نیز ممکن نبود.')
      }
      throw error
    }
    setInventoryOptions(nextOptions)
    if (nextItems !== storedInventoryRecords.items) setStoredInventoryRecords({ items: nextItems, error: '' })
  }

  const openInventoryStocktake = () => {
    setInventoryStocktakeCounts(Object.fromEntries(
      inventoryStocktakeRecords.map((item) => [item.id, formatStocktakeQuantity(item.stock)]),
    ))
    setInventoryStocktakeSearch('')
    setInventoryStocktakeError('')
    setInventoryWarehousesOpen(false)
    setInventoryStocktakeOpen(true)
  }

  const saveInventoryStocktake = () => {
    const countedStocks = new Map<string, number>()
    for (const item of inventoryStocktakeRecords) {
      const count = parseStocktakeQuantity(
        inventoryStocktakeCounts[item.id] ?? formatStocktakeQuantity(item.stock),
      )
      if (count === null) {
        setInventoryStocktakeError(`مقدار شمارش‌شدهٔ «${item.name}» را به‌صورت عدد وارد کنید.`)
        return
      }
      countedStocks.set(item.id, count)
    }

    const changedAt = currentIsoTimestamp()
    const nextItems = storedInventoryRecords.items.map((item) => {
      const countedStock = countedStocks.get(item.id)
      return countedStock === undefined || countedStock === item.stock
        ? item
        : {
            ...item,
            stock: countedStock,
            lastMovementAt: changedAt,
            stockMovements: [
              ...(item.stockMovements ?? []),
              {
                id: `stock-count-${item.id}-${Date.now()}`,
                kind: countedStock > item.stock ? 'count-in' as const : 'count-out' as const,
                quantity: Math.abs(countedStock - item.stock),
                createdAt: changedAt,
              },
            ],
          }
    })
    try {
      if (nextItems.some((item, index) => item !== storedInventoryRecords.items[index])) {
        persistInventoryChanges(inventoryOptions, nextItems)
      }
      setInventoryStocktakeOpen(false)
      setInventoryStocktakeError('')
      setNotice(`انبارگردانی ${inventoryKind} در «${activeWarehouse}» ثبت شد.`)
      window.setTimeout(() => setNotice(''), 2600)
    } catch {
      setInventoryStocktakeError('ثبت انبارگردانی انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
    }
  }

  const openInventoryTransfer = () => {
    const sourceWarehouse = inventoryTransferAllWarehouses.includes(activeWarehouse)
      ? activeWarehouse
      : inventoryTransferAllWarehouses[0] ?? ''
    const sourceItems = storedInventoryRecords.items.filter((item) => (
      item.kind === 'کالا'
      && (item.warehouse ?? DEFAULT_INVENTORY_WAREHOUSE) === sourceWarehouse
    ))
    setInventoryTransferSourceWarehouse(sourceWarehouse)
    setInventoryTransferWarehouse(
      inventoryTransferAllWarehouses.find((warehouse) => warehouse !== sourceWarehouse) ?? '',
    )
    setInventoryTransferItemId(sourceItems[0]?.id ?? '')
    setInventoryTransferSearch('')
    setInventoryTransferProductPickerOpen(false)
    setInventoryTransferQuantity('')
    setInventoryTransferError('')
    setInventoryTransferOpen(true)
  }

  const saveInventoryTransfer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const quantity = parseStocktakeQuantity(inventoryTransferQuantity)
    if (!inventoryTransferSourceWarehouse
      || !inventoryTransferAllWarehouses.includes(inventoryTransferSourceWarehouse)) {
      setInventoryTransferError('انبار مبدا را انتخاب کنید.')
      return
    }
    if (!inventoryTransferWarehouse
      || inventoryTransferWarehouse === inventoryTransferSourceWarehouse
      || !inventoryTransferWarehouses.includes(inventoryTransferWarehouse)) {
      setInventoryTransferError('انبار مقصد را انتخاب کنید.')
      return
    }
    if (quantity === null || quantity <= 0) {
      setInventoryTransferError('مقدار انتقال باید عددی بزرگ‌تر از صفر باشد.')
      return
    }

    const sourceItem = inventoryTransferSourceItems.find((item) => item.id === inventoryTransferItemId)
    if (!sourceItem) {
      setInventoryTransferError('کالای موردنظر برای انتقال پیدا نشد.')
      return
    }
    if (quantity > sourceItem.stock) {
      setInventoryTransferError(`موجودی قابل انتقال ${formatStocktakeQuantity(sourceItem.stock)} ${sourceItem.unit} است.`)
      return
    }

    const catalogId = sourceItem.catalogId ?? sourceItem.id
    const destinationItem = storedInventoryRecords.items.find((item) => (
      item.kind === 'کالا'
      && (item.warehouse ?? DEFAULT_INVENTORY_WAREHOUSE) === inventoryTransferWarehouse
      && (item.catalogId ?? item.id) === catalogId
    ))
    if (!destinationItem) {
      setInventoryTransferError('نسخهٔ این کالا در انبار مقصد پیدا نشد؛ فهرست انبارها را همگام‌سازی کنید.')
      return
    }

    const changedAt = currentIsoTimestamp()
    const sourceStock = sourceItem.stock - quantity
    const destinationStock = destinationItem.stock + quantity
    const nextItems = storedInventoryRecords.items.map((item) => {
      if (item.id === sourceItem.id) {
        return {
          ...item,
          stock: sourceStock,
          lastMovementAt: changedAt,
          stockMovements: [
            ...(item.stockMovements ?? []),
            {
              id: `stock-transfer-out-${sourceItem.id}-${Date.now()}`,
              kind: 'transfer-out' as const,
              quantity,
              createdAt: changedAt,
              warehouse: inventoryTransferWarehouse,
            },
          ],
        }
      }
      if (item.id === destinationItem.id) {
        return {
          ...item,
          stock: destinationStock,
          lastMovementAt: changedAt,
          stockMovements: [
            ...(item.stockMovements ?? []),
            {
              id: `stock-transfer-in-${destinationItem.id}-${Date.now()}`,
              kind: 'transfer-in' as const,
              quantity,
              createdAt: changedAt,
              warehouse: sourceItem.warehouse ?? DEFAULT_INVENTORY_WAREHOUSE,
            },
          ],
        }
      }
      return item
    })

    try {
      persistInventoryChanges(inventoryOptions, nextItems)
      setInventoryStocktakeCounts((counts) => ({
        ...counts,
        [sourceItem.id]: formatStocktakeQuantity(sourceStock),
        [destinationItem.id]: formatStocktakeQuantity(destinationStock),
      }))
      setInventoryTransferOpen(false)
      setInventoryTransferError('')
      setNotice(
        `${formatStocktakeQuantity(quantity)} ${sourceItem.unit} «${sourceItem.name}» به «${inventoryTransferWarehouse}» منتقل شد.`,
      )
      window.setTimeout(() => setNotice(''), 3000)
    } catch {
      setInventoryTransferError('انتقال کالا ذخیره نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
    }
  }

  const addInventoryTaxonomy = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = inventoryTaxonomyInput.trim()
    if (!value) {
      setInventoryTaxonomyError(
        editingInventoryTaxonomy?.type === 'group' || inventoryTaxonomyForm === 'group'
          ? 'نام گروه را وارد کنید.'
          : 'نام دسته‌بندی را وارد کنید.',
      )
      return
    }

    const edit = editingInventoryTaxonomy
    const formType = edit?.type ?? inventoryTaxonomyForm
    const selectedGroup = edit?.type === 'category' ? edit.group : inventoryGroup
    const selectedKind = edit?.type === 'group' ? edit.kind : inventoryKind
    const originalName = edit?.name

    if (formType === 'category' && selectedGroup === 'همه') {
      setInventoryTaxonomyError('برای افزودن دسته‌بندی، ابتدا یک گروه کالا را انتخاب کنید.')
      return
    }

    const values = formType === 'group'
      ? activeWarehouseTaxonomy.groupsByKind[selectedKind]
      : activeWarehouseTaxonomy.categoriesByGroup[selectedGroup] ?? []
    const alreadyExists = formType === 'group'
      ? Object.entries(activeWarehouseTaxonomy.groupsByKind).some(([kind, groups]) =>
          groups.some((existing) =>
            existing.toLocaleLowerCase() === value.toLocaleLowerCase()
            && !(kind === selectedKind && existing === originalName)))
      : values.some((existing) =>
          existing.toLocaleLowerCase() === value.toLocaleLowerCase()
          && existing !== originalName)
    if (alreadyExists) {
      setInventoryTaxonomyError('این مورد از قبل وجود دارد.')
      return
    }

    let nextTaxonomy = activeWarehouseTaxonomy
    let nextItems = storedInventoryRecords.items
    if (edit?.type === 'group') {
      const groupsByKind = {
        ...activeWarehouseTaxonomy.groupsByKind,
        [edit.kind]: activeWarehouseTaxonomy.groupsByKind[edit.kind]
          .map((group) => group === edit.name ? value : group),
      }
      const categoriesByGroup = { ...activeWarehouseTaxonomy.categoriesByGroup }
      const existingCategories = categoriesByGroup[edit.name] ?? []
      if (!Object.values(groupsByKind).some((groups) => groups.includes(edit.name))) {
        delete categoriesByGroup[edit.name]
      }
      categoriesByGroup[value] = [...new Set([...(categoriesByGroup[value] ?? []), ...existingCategories])]
      nextTaxonomy = {
        ...activeWarehouseTaxonomy,
        groupsByKind,
        categoriesByGroup,
      }
      nextItems = storedInventoryRecords.items.map((item) =>
        item.kind === edit.kind
        && item.group === edit.name
          ? { ...item, group: value }
          : item)
    } else if (edit?.type === 'category') {
      nextTaxonomy = {
        ...activeWarehouseTaxonomy,
        categoriesByGroup: {
          ...activeWarehouseTaxonomy.categoriesByGroup,
          [edit.group]: (activeWarehouseTaxonomy.categoriesByGroup[edit.group] ?? []).map((category) =>
            category === edit.name ? value : category),
        }
      }
      nextItems = storedInventoryRecords.items.map((item) =>
        item.kind === edit.kind
        && item.group === edit.group
        && item.category === edit.name
          ? { ...item, category: value }
          : item)
    } else if (formType === 'group') {
      nextTaxonomy = {
          ...activeWarehouseTaxonomy,
          groupsByKind: {
            ...activeWarehouseTaxonomy.groupsByKind,
            [selectedKind]: [...activeWarehouseTaxonomy.groupsByKind[selectedKind], value],
          },
          categoriesByGroup: {
            ...activeWarehouseTaxonomy.categoriesByGroup, [value]: [],
          },
        }
    } else {
      nextTaxonomy = {
        ...activeWarehouseTaxonomy,
        categoriesByGroup: {
          ...activeWarehouseTaxonomy.categoriesByGroup,
          [selectedGroup]: [...values, value],
        },
      }
    }
    const nextOptions: StoredInventoryOptions = inventoryKind === 'خدمات'
      ? { ...inventoryOptions, serviceTaxonomy: nextTaxonomy }
      : {
          ...inventoryOptions,
          ...nextTaxonomy,
          warehouseTaxonomies: Object.fromEntries(
            inventoryOptions.warehouses.map((warehouse) => [warehouse, nextTaxonomy]),
          ),
        }
    try {
      persistInventoryChanges(nextOptions, nextItems)
      if (edit?.type === 'group' && inventoryGroup === edit.name) {
        setInventoryGroup(value)
        setInventoryCategory('همه')
      } else if (!edit && formType === 'group') {
        setInventoryGroup(value)
        setInventoryCategory('همه')
      } else if (edit?.type === 'category' && inventoryCategory === edit.name) {
        setInventoryCategory(value)
      } else if (!edit && formType === 'category') {
        setInventoryCategory(value)
      }
      setInventoryTaxonomyInput('')
      setInventoryTaxonomyForm(null)
      setEditingInventoryTaxonomy(null)
      setInventoryTaxonomyError('')
    } catch {
      setInventoryTaxonomyError('ذخیرهٔ تغییر انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
    }
  }

  const addInventoryWarehouse = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = inventoryWarehouseInput.trim()
    if (!name) {
      setInventoryWarehouseError('نام انبار را وارد کنید.')
      return
    }
    const isServiceWarehouse = inventoryKind === 'خدمات'
    const currentWarehouses = isServiceWarehouse
      ? inventoryOptions.serviceWarehouses ?? [DEFAULT_SERVICE_WAREHOUSE]
      : inventoryOptions.warehouses
    const editingWarehouse = isServiceWarehouse ? editingServiceWarehouse : editingInventoryWarehouse
    if (currentWarehouses.some((warehouse) =>
      warehouse.toLocaleLowerCase() === name.toLocaleLowerCase()
      && warehouse !== editingWarehouse
    )) {
      setInventoryWarehouseError('این انبار از قبل ثبت شده است.')
      return
    }

    const isEditing = editingWarehouse !== null
    const warehouses = isEditing
      ? currentWarehouses.map((warehouse) => warehouse === editingWarehouse ? name : warehouse)
      : [...currentWarehouses, name]
    const nextOptions: StoredInventoryOptions = isServiceWarehouse
      ? { ...inventoryOptions, serviceWarehouses: warehouses }
      : {
          ...inventoryOptions,
          warehouses,
          warehouseTaxonomies: Object.fromEntries(
            warehouses.map((warehouse) => [warehouse, inventoryOptions]),
          ),
        }
    const defaultWarehouse = isServiceWarehouse ? DEFAULT_SERVICE_WAREHOUSE : DEFAULT_INVENTORY_WAREHOUSE
    const renamedItems = isEditing
      ? storedInventoryRecords.items.map((item) =>
          item.kind === (isServiceWarehouse ? 'خدمات' : inventoryKind)
          && (item.warehouse ?? defaultWarehouse) === editingWarehouse
            ? { ...item, warehouse: name }
            : item)
      : storedInventoryRecords.items
    const nextItems = synchronizeInventoryCatalog(
      renamedItems,
      nextOptions.warehouses,
      nextOptions.serviceWarehouses,
    )
    try {
      persistInventoryChanges(nextOptions, nextItems)
      if (isServiceWarehouse) {
        setSelectedServiceWarehouse(name)
        setEditingServiceWarehouse(null)
      } else {
        setSelectedWarehouse(name)
        setEditingInventoryWarehouse(null)
      }
      setInventoryGroup('همه')
      setInventoryCategory('همه')
      setInventorySearch('')
      setInventoryWarehouseInput('')
      setInventoryWarehouseError('')
      setInventoryWarehouseFormOpen(false)
      setInventoryWarehousesOpen(false)
    } catch {
      setInventoryWarehouseError('ذخیرهٔ انبار انجام نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
    }
  }

  const performInventoryAction = (action: 'edit' | 'delete') => {
    const target = inventoryActionItem
    if (!target) return

    if (action === 'edit') {
      if (target.type === 'warehouse') {
        if (target.kind === 'خدمات') setEditingServiceWarehouse(target.name)
        else setEditingInventoryWarehouse(target.name)
        setInventoryWarehouseInput(target.name)
        setInventoryWarehouseError('')
        setInventoryWarehousesOpen(false)
        setInventoryWarehouseFormOpen(true)
      } else if (target.type === 'product') {
        const item = inventoryItems.find((candidate) => candidate.id === target.id)
        if (!item) {
          setNotice('کالای موردنظر برای ویرایش پیدا نشد.')
          setInventoryActionItem(null)
          return
        }
        setEditingInventoryProductId(item.id)
        setInventoryProductFields({
          code: item.code ?? '',
          name: item.name,
          brand: item.brand === '—' ? '' : item.brand,
          unit: item.unit,
          secondaryUnit: item.secondaryUnit ?? '',
          conversionRatio: item.conversionRatio === undefined ? '' : String(item.conversionRatio),
          barcode: item.barcode ?? '',
          stock: formatAccountBalanceInput(String(item.stock)),
          purchasePrice: formatAccountBalanceInput(String(item.purchasePrice)),
          salePrice: formatAccountBalanceInput(String(item.salePrice)),
        })
        setInventoryProductTab('basic')
        setInventoryProductError('')
        setInventoryProductOpen(true)
      } else if (target.type === 'service') {
        const item = inventoryServiceItems.find((candidate) => candidate.id === target.id)
        if (!item) {
          setNotice('خدمت موردنظر برای ویرایش پیدا نشد.')
          setInventoryActionItem(null)
          return
        }
        setEditingInventoryServiceId(item.id)
        setInventoryServiceFields({
          code: item.code ?? '',
          description: item.name,
          price: formatAccountBalanceInput(String(item.salePrice)),
          unit: item.unit,
        })
        setInventoryServiceError('')
        setInventoryServiceOpen(true)
      } else {
        setEditingInventoryTaxonomy(
          target.type === 'group'
            ? { type: 'group', name: target.name, kind: target.kind }
            : { type: 'category', name: target.name, group: target.group, kind: target.kind },
        )
        setInventoryTaxonomyForm(target.type)
        setInventoryTaxonomyInput(target.name)
        setInventoryTaxonomyError('')
      }
      setInventoryActionItem(null)
      return
    }

    if (target.type === 'warehouse'
      && target.name === (target.kind === 'خدمات' ? DEFAULT_SERVICE_WAREHOUSE : DEFAULT_INVENTORY_WAREHOUSE)) return

    try {
      let nextOptions = inventoryOptions
      let nextItems = storedInventoryRecords.items

      if (target.type === 'product' || target.type === 'service') {
        const item = inventoryItems.find((candidate) => candidate.id === target.id)
        if (!item) {
          setNotice('کالای موردنظر برای حذف پیدا نشد.')
          setInventoryActionItem(null)
          return
        }
        const catalogId = item.catalogId ?? item.id
        nextItems = storedInventoryRecords.items.filter(
          (candidate) => (candidate.catalogId ?? candidate.id) !== catalogId,
        )
      } else if (target.type === 'warehouse' && target.kind === 'خدمات') {
        const serviceWarehouses = (inventoryOptions.serviceWarehouses ?? [DEFAULT_SERVICE_WAREHOUSE])
          .filter((warehouse) => warehouse !== target.name)
        const defaultCatalogs = new Set(storedInventoryRecords.items
          .filter((item) => item.kind === 'خدمات'
            && (item.warehouse ?? DEFAULT_SERVICE_WAREHOUSE) === DEFAULT_SERVICE_WAREHOUSE)
          .map((item) => item.catalogId ?? item.id))
        nextItems = storedInventoryRecords.items.flatMap((item) => {
          if (item.kind !== 'خدمات' || item.warehouse !== target.name) return [item]
          if (defaultCatalogs.has(item.catalogId ?? item.id)) return []
          return [{ ...item, warehouse: DEFAULT_SERVICE_WAREHOUSE }]
        })
        nextOptions = { ...inventoryOptions, serviceWarehouses }
        nextItems = synchronizeInventoryCatalog(nextItems, nextOptions.warehouses, serviceWarehouses)
      } else if (target.type === 'warehouse') {
        const warehouses = inventoryOptions.warehouses.filter((warehouse) => warehouse !== target.name)
        const centralItems = storedInventoryRecords.items.filter(
          (item) => item.kind !== 'خدمات'
            && (item.warehouse ?? DEFAULT_INVENTORY_WAREHOUSE) === DEFAULT_INVENTORY_WAREHOUSE,
        )
        const centralIndexByCatalog = new Map(
          centralItems.map((item, index) => [item.catalogId ?? item.id, index]),
        )
        nextItems = storedInventoryRecords.items.filter(
          (item) => item.kind === 'خدمات'
            || (item.warehouse ?? DEFAULT_INVENTORY_WAREHOUSE) !== target.name,
        )
        for (const item of storedInventoryRecords.items.filter(
          (candidate) => candidate.kind !== 'خدمات'
            && (candidate.warehouse ?? DEFAULT_INVENTORY_WAREHOUSE) === target.name,
        )) {
          const centralIndex = centralIndexByCatalog.get(item.catalogId ?? item.id)
          if (centralIndex === undefined) {
            const movedItem = { ...item, warehouse: DEFAULT_INVENTORY_WAREHOUSE }
            centralIndexByCatalog.set(movedItem.catalogId ?? movedItem.id, centralItems.length)
            centralItems.push(movedItem)
            nextItems.push(movedItem)
            continue
          }
          const centralItem = centralItems[centralIndex]
          centralItems[centralIndex] = {
            ...centralItem,
            stock: centralItem.stock + item.stock,
            stockMovements: [
              ...(centralItem.stockMovements ?? []),
              ...(item.stockMovements ?? []),
            ],
            lastMovementAt: centralItem.lastMovementAt > item.lastMovementAt
              ? centralItem.lastMovementAt
              : item.lastMovementAt,
          }
          nextItems = nextItems.map((candidate) => (
            candidate.id === centralItem.id ? centralItems[centralIndex] : candidate
          ))
        }
        const sharedTaxonomy: InventoryTaxonomy = inventoryOptions
        nextOptions = {
          ...inventoryOptions,
          warehouses,
          warehouseTaxonomies: Object.fromEntries(
            warehouses.map((warehouse) => [warehouse, sharedTaxonomy]),
          ),
        }
        nextItems = synchronizeInventoryCatalog(nextItems, warehouses, nextOptions.serviceWarehouses)
      } else {
        let taxonomy = target.kind === 'خدمات'
          ? inventoryOptions.serviceTaxonomy ?? activeWarehouseTaxonomy
          : inventoryOptions
        if (target.type === 'group') {
          const categoriesByGroup = { ...taxonomy.categoriesByGroup }
          const groupsByKind = {
            ...taxonomy.groupsByKind,
            [target.kind]: taxonomy.groupsByKind[target.kind].filter((group) => group !== target.name),
          }
          if (!Object.values(groupsByKind).some((groups) => groups.includes(target.name))) {
            delete categoriesByGroup[target.name]
          }
          taxonomy = { ...taxonomy, groupsByKind, categoriesByGroup }
          nextOptions = target.kind === 'خدمات'
            ? { ...inventoryOptions, serviceTaxonomy: taxonomy }
            : {
                ...inventoryOptions,
                ...taxonomy,
                warehouseTaxonomies: Object.fromEntries(
                  inventoryOptions.warehouses.map((warehouse) => [warehouse, taxonomy]),
                ),
              }
          nextItems = storedInventoryRecords.items.map((item) =>
            item.kind === target.kind
            && item.group === target.name
              ? { ...item, group: 'بدون گروه', category: 'بدون دسته‌بندی' }
              : item)
          if (inventoryGroup === target.name) {
            setInventoryGroup('همه')
            setInventoryCategory('همه')
          }
        } else {
          taxonomy = {
            ...taxonomy,
            categoriesByGroup: {
              ...taxonomy.categoriesByGroup,
              [target.group]: (taxonomy.categoriesByGroup[target.group] ?? [])
                .filter((category) => category !== target.name),
            },
          }
          nextOptions = {
            ...(target.kind === 'خدمات'
              ? { ...inventoryOptions, serviceTaxonomy: taxonomy }
              : {
                  ...inventoryOptions,
                  ...taxonomy,
                  warehouseTaxonomies: Object.fromEntries(
                    inventoryOptions.warehouses.map((warehouse) => [warehouse, taxonomy]),
                  ),
                }),
          }
          nextItems = storedInventoryRecords.items.map((item) =>
            item.kind === target.kind
            && item.group === target.group
            && item.category === target.name
              ? { ...item, category: 'بدون دسته‌بندی' }
              : item)
          if (inventoryCategory === target.name) setInventoryCategory('همه')
        }
      }

      persistInventoryChanges(nextOptions, nextItems)
      if (target.type === 'product' || target.type === 'service') {
        setNotice(target.type === 'service'
          ? 'خدمت از فهرست خدمات حذف شد.'
          : 'کالا از فهرست همهٔ انبارها حذف شد.')
      }
      if (target.type === 'warehouse') {
        if (target.kind === 'خدمات') {
          if (selectedServiceWarehouse === target.name) {
            setSelectedServiceWarehouse(DEFAULT_SERVICE_WAREHOUSE)
            setInventoryGroup('همه')
            setInventoryCategory('همه')
          }
        } else if (selectedWarehouse === target.name) {
          setSelectedWarehouse(DEFAULT_INVENTORY_WAREHOUSE)
          setInventoryGroup('همه')
          setInventoryCategory('همه')
        }
        setInventoryWarehousesOpen(false)
      }
    } catch {
      setNotice('تغییر ذخیره نشد؛ فضای ذخیره‌سازی دستگاه را بررسی کنید.')
    }
    setInventoryActionItem(null)
  }

  useEffect(() => {
    backNavigationHandlerRef.current = handleBackNavigation
  })

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    let disposed = false
    let removeBackButtonListener: (() => void) | undefined
    void CapacitorApp.addListener('backButton', () => backNavigationHandlerRef.current())
      .then((listener) => {
        const removeListener = () => {
          void listener.remove()
        }
        if (disposed) removeListener()
        else removeBackButtonListener = removeListener
      })

    return () => {
      disposed = true
      removeBackButtonListener?.()
    }
  }, [])

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return

    const handlePopState = () => {
      const shouldExit = backNavigationHandlerRef.current()
      if (!shouldExit) {
        window.history.pushState({ trazinoBackGuard: true }, '')
      }
    }

    window.history.pushState({ trazinoBackGuard: true }, '')
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useLayoutEffect(() => {
    if (activeTab !== 'خانه' || homeScrollPositionRef.current === null) return
    const homeContent = homeContentRef.current
    if (!homeContent) return

    homeContent.scrollTop = homeScrollPositionRef.current
    homeScrollPositionRef.current = null
  }, [activeTab])

  const visibleAccounts = storedAccounts.accounts.filter((account) => account.kind === accountListFilter)

  return (
    <div className={`app-frame ${demoEntered ? '' : 'auth-mode'} ${[
      'فاکتور فروش',
      'فاکتور خرید',
      'برگشت از فروش',
      'برگشت به خرید',
      'فهرست برگشت از فروش',
      'فهرست برگشت به خرید',
      'جزئیات فاکتور برگشت',
      'فهرست چک‌های دریافتی',
      'فهرست چک‌های پرداختی',
      'جزئیات چک',
      'فهرست درآمدها',
      'فهرست هزینه‌ها',
      'فهرست دریافت‌ها',
      'فهرست پرداخت‌ها',
    ].includes(activeTab) ? 'sales-invoice-mode' : ''} ${[
      'فاکتور فروش',
      'فاکتور خرید',
      'برگشت از فروش',
      'برگشت به خرید',
    ].includes(activeTab) ? 'sales-invoice-entry-mode' : ''}`} data-theme={theme} data-color-theme={colorTheme} dir="rtl">
      <header className="topbar">
        <div className="brand">
          <img
            className="brand-logo"
            src="/gerdoo-mark.svg"
            alt=""
            aria-hidden="true"
          />
          <span className="brand-name">حسابداری <strong>گردو</strong></span>
        </div>
        <div className="topbar-actions">
          {demoEntered ? (
            <>
              <button
                className="auth-shortcut"
                type="button"
                onClick={() => {
                  setAuthNotice('')
                  setDemoEntered(false)
                }}
              >
                ورود / ثبت‌نام
              </button>
              <button
                className="logout-button"
                type="button"
                onClick={() => {
                  setAuthMode('login')
                  setAuthFields({ name: '', phone: '', password: '' })
                  setAuthNotice('')
                  setDemoEntered(false)
                  setActiveTab('خانه')
                }}
              >
                خروج از حساب
              </button>
            </>
          ) : (
            <button
              className="auth-shortcut"
              type="button"
              onClick={enterDemo}
            >
              ورود به نسخهٔ نمایشی
            </button>
          )}
          <button
            className="theme-toggle"
            type="button"
            aria-label={theme === 'light' ? 'فعال‌کردن حالت شب' : 'فعال‌کردن حالت روز'}
            title={theme === 'light' ? 'حالت شب' : 'حالت روز'}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            <Icon name={theme === 'light' ? 'moon' : 'sun'} />
          </button>
        </div>
      </header>

      <main ref={homeContentRef} className={demoEntered ? 'home-content' : 'auth-content'}>
        {!demoEntered ? (
          <section className="auth-layout">
            <div className="auth-visual">
              <span className="auth-visual-orbit orbit-one" />
              <span className="auth-visual-orbit orbit-two" />
              <div className="auth-3d-scene" aria-hidden="true">
                <TrazinoBook />
                <span className="auth-3d-coin">٪</span>
                <span className="auth-3d-cube"><i /><b /></span>
                <span className="auth-3d-spark spark-one">✦</span>
                <span className="auth-3d-spark spark-two">✧</span>
              </div>
              <div className="auth-visual-copy">
                <h1>مدیریت مالی هوشمند</h1>
                <p>فروشگاه‌ها و امور مالی کسب‌وکارت را یک‌جا مدیریت کن.</p>
              </div>
            </div>

            <div className="auth-panel">
              <div className="auth-form-heading">
                <span className="auth-eyebrow">به حسابداری گردو خوش آمدی</span>
                {authMode === 'register' && <h2>ساخت حساب کاربری</h2>}
                <p>
                  {authMode === 'login'
                    ? 'برای ادامه، اطلاعات حساب خود را وارد کن.'
                    : 'برای شروع مدیریت مالی، اطلاعاتت را ثبت کن.'}
                </p>
              </div>

              <div className="auth-mode-tabs" role="tablist" aria-label="ورود یا ثبت‌نام">
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMode === 'login'}
                  className={authMode === 'login' ? 'selected' : ''}
                  onClick={() => {
                    setAuthMode('login')
                    setAuthNotice('')
                  }}
                >
                  ورود
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMode === 'register'}
                  className={authMode === 'register' ? 'selected' : ''}
                  onClick={() => {
                    setAuthMode('register')
                    setAuthNotice('')
                  }}
                >
                  ثبت‌نام
                </button>
              </div>

              <form className="auth-form" onSubmit={handleAuthSubmit}>
                {authMode === 'register' && (
                  <label className="auth-field">
                    <span>نام و نام خانوادگی</span>
                    <input
                      autoComplete="name"
                      required
                      maxLength={80}
                      value={authFields.name}
                      onChange={(event) => setAuthFields({ ...authFields, name: event.target.value })}
                      placeholder="نام شما"
                    />
                  </label>
                )}
                <label className="auth-field">
                  <span>شماره موبایل</span>
                  <input
                    autoComplete="tel"
                    type="tel"
                    inputMode="tel"
                    dir="ltr"
                    required
                    maxLength={20}
                    value={authFields.phone}
                    onChange={(event) => setAuthFields({ ...authFields, phone: event.target.value })}
                    placeholder="09xx xxx xxxx"
                  />
                </label>
                <label className="auth-field">
                  <span>رمز عبور</span>
                  <input
                    autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                    type="password"
                    required
                    minLength={8}
                    maxLength={128}
                    value={authFields.password}
                    onChange={(event) => setAuthFields({ ...authFields, password: event.target.value })}
                    placeholder="حداقل ۸ کاراکتر"
                  />
                </label>
                {authMode === 'login' && (
                  <button
                    className="auth-forgot"
                    type="button"
                    onClick={() => setAuthNotice('بازیابی رمز عبور بعد از اتصال سامانهٔ ورود فعال می‌شود.')}
                  >
                    رمز عبور را فراموش کرده‌ام
                  </button>
                )}
                <button className="auth-submit" type="submit">
                  {authMode === 'login' ? 'ورود به حساب' : 'ایجاد حساب کاربری'}
                  <span aria-hidden="true">‹</span>
                </button>
                {authNotice && <p className="auth-notice" role="status">{authNotice}</p>}
              </form>

              <div className="auth-separator"><span>یا برای آشنایی</span></div>
              <button
                className="auth-demo-button"
                type="button"
                onClick={enterDemo}
              >
                ورود به نسخهٔ نمایشی
              </button>
              <p className="auth-disclaimer">
                ورود و ثبت‌نام فعلاً نمایشی است و پس از آماده‌شدن سرور فعال می‌شود.
              </p>
            </div>
          </section>
        ) : activeTab === 'تنظیمات' ? (
          <div className="settings-page">
            <header className="settings-page-heading">
              <button
                type="button"
                aria-label={activeSettingsSection ? 'بازگشت به تنظیمات' : 'بازگشت به داشبورد'}
                onClick={() => {
                  if (activeSettingsSection) {
                    setActiveSettingsSection('')
                  } else {
                    setActiveTab('خانه')
                  }
                }}
              >
                ‹
              </button>
              <div>
                <span>شخصی‌سازی حسابداری گردو</span>
                <h1>{activeSettingsSection || 'تنظیمات'}</h1>
              </div>
            </header>
            {activeSettingsSection === 'مشخصات فروشگاه' ? (
              <section className="settings-stores" aria-label="مدیریت مشخصات فروشگاه">
                <header className="settings-stores-heading">
                  <div>
                    <h2>فروشگاه‌های ثبت‌شده</h2>
                    <p>مشخصات فروشگاه‌ها را ببین، ویرایش یا حذف کن.</p>
                  </div>
                  <span>{formatPersonBalance(stores.length)} فروشگاه</span>
                </header>
                {storeState.error && <p className="store-storage-error" role="alert">{storeState.error}</p>}
                {stores.length > 0 ? (
                  <div className="settings-store-list">
                    {stores.map((store) => (
                      <article
                        className={`settings-store-card${activeStoreId === store.id ? ' active' : ''}`}
                        key={store.id}
                      >
                        <header>
                          <span className="settings-store-icon"><Icon name="shop" /></span>
                          <div>
                            <h3>{store.name}</h3>
                            {activeStoreId === store.id && <small>فروشگاه فعال</small>}
                          </div>
                        </header>
                        <dl>
                          <div><dt>کد اقتصادی</dt><dd>{store.code || 'ثبت نشده'}</dd></div>
                          <div><dt>تلفن</dt><dd dir="ltr">{store.phone || 'ثبت نشده'}</dd></div>
                          <div><dt>واحد پول</dt><dd>{store.currency}</dd></div>
                          <div className="settings-store-address">
                            <dt>آدرس</dt>
                            <dd>
                              <button
                                className={`settings-store-address-trigger${expandedStoreAddressId === store.id ? ' expanded' : ''}`}
                                type="button"
                                aria-label={`نمایش آدرس کامل: ${store.address || 'ثبت نشده'}`}
                                aria-expanded={expandedStoreAddressId === store.id}
                                onClick={() => setExpandedStoreAddressId((current) => current === store.id ? null : store.id)}
                              >
                                <span>{store.address || 'ثبت نشده'}</span>
                                <span className="settings-store-address-tip" aria-hidden="true">{store.address || 'ثبت نشده'}</span>
                              </button>
                            </dd>
                          </div>
                        </dl>
                        {deleteConfirmStoreId === store.id ? (
                          <div className="settings-store-delete-confirm" role="group" aria-label={`تأیید حذف ${store.name}`}>
                            <span>از حذف «{store.name}» مطمئنی؟</span>
                            <button type="button" onClick={() => deleteStore(store.id)}>حذف فروشگاه</button>
                            <button type="button" onClick={() => setDeleteConfirmStoreId(null)}>انصراف</button>
                          </div>
                        ) : (
                          <footer>
                            <div className="settings-store-actions">
                              {activeStoreId !== store.id && (
                                <button
                                  className="settings-store-select"
                                  type="button"
                                  onClick={() => {
                                    const entered = updateStoreState((current) => ({
                                      ...current,
                                      activeStoreId: store.id,
                                    }))
                                    if (entered) {
                                      setActiveSettingsSection('')
                                      setActiveTab('خانه')
                                    }
                                  }}
                                >
                                  ورود به فروشگاه
                                </button>
                              )}
                              <button type="button" onClick={() => openStoreForm(store)}>ویرایش</button>
                              <button
                                className="delete"
                                type="button"
                                aria-label={`حذف ${store.name}`}
                                onClick={() => setDeleteConfirmStoreId(store.id)}
                              >
                                حذف
                              </button>
                            </div>
                            {activeStoreId === store.id && (
                              <aside className="settings-subscription-card" aria-label="اشتراک باقی‌مانده">
                                <span className="settings-subscription-icon"><Icon name="clock" /></span>
                                <div className="settings-subscription-details">
                                  <strong>
                                    {subscriptionDaysRemaining > 0
                                      ? `${formatPersonBalance(subscriptionDaysRemaining)} روز باقی‌مانده`
                                      : 'اشتراک به پایان رسیده'}
                                  </strong>
                                  <small>تا {formatCalendarDate(DEMO_SUBSCRIPTION_EXPIRY, 'persian')}</small>
                                </div>
                              </aside>
                            )}
                          </footer>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="settings-stores-empty">
                    <span><Icon name="shop" /></span>
                    <strong>هنوز فروشگاهی ثبت نشده</strong>
                    <small>برای شروع، مشخصات فروشگاهت را اضافه کن.</small>
                  </div>
                )}
                <button className="settings-store-create" type="button" onClick={() => openStoreForm()}>
                  <span aria-hidden="true">+</span>
                  افزودن فروشگاه
                </button>
                {storeFormOpen && (
                  <div
                    className="store-modal-backdrop"
                    onMouseDown={(event) => {
                      if (event.target === event.currentTarget) setStoreFormOpen(false)
                    }}
                  >
                    <section className="store-modal" role="dialog" aria-modal="true" aria-labelledby="settings-store-form-title">
                      <div className="store-modal-heading">
                        <span className="store-modal-icon"><Icon name="shop" /></span>
                        <div>
                          <h2 id="settings-store-form-title">{editingStoreId === null ? 'ایجاد فروشگاه' : 'ویرایش فروشگاه'}</h2>
                          <p>مشخصات فروشگاه را وارد کن</p>
                        </div>
                        <button className="store-modal-close" type="button" aria-label="بستن فرم" onClick={() => setStoreFormOpen(false)}>×</button>
                      </div>
                      <form className="store-form" onSubmit={saveStore}>
                        <label className="store-field">
                          <span>نام فروشگاه</span>
                          <input required maxLength={80} value={storeFields.name} onChange={(event) => setStoreFields({ ...storeFields, name: event.target.value })} />
                        </label>
                        <label className="store-field">
                          <span>آدرس</span>
                          <input required maxLength={180} value={storeFields.address} onChange={(event) => setStoreFields({ ...storeFields, address: event.target.value })} />
                        </label>
                        <label className="store-field">
                          <span>تلفن</span>
                          <input required type="tel" maxLength={20} value={storeFields.phone} onChange={(event) => setStoreFields({ ...storeFields, phone: event.target.value })} />
                        </label>
                        <label className="store-field">
                          <span>کد اقتصادی <small>(اختیاری)</small></span>
                          <input maxLength={40} value={storeFields.code} onChange={(event) => setStoreFields({ ...storeFields, code: event.target.value })} />
                        </label>
                        <label className="store-field">
                          <span>واحد پول</span>
                          <select value={storeFields.currency} onChange={(event) => setStoreFields({ ...storeFields, currency: event.target.value })}>
                            <option value="ریال">ریال</option>
                            <option value="تومان">تومان</option>
                          </select>
                        </label>
                        <div className="store-form-actions">
                          <button className="store-cancel-button" type="button" onClick={() => setStoreFormOpen(false)}>انصراف</button>
                          <button className="store-save-button" type="submit">ذخیره اطلاعات</button>
                        </div>
                      </form>
                    </section>
                  </div>
                )}
              </section>
            ) : activeSettingsSection === 'پشتیبانگیری' ? (
              <section className="settings-backup-page" aria-labelledby="settings-backup-title">
                <header className="settings-backup-intro">
                  <span className="settings-backup-intro-icon"><Icon name="backup" /></span>
                  <div>
                    <h2 id="settings-backup-title">پشتیبانگیری و همگام‌سازی</h2>
                    <p>از اطلاعات فروشگاه‌ها نسخهٔ پشتیبان بگیر و وضعیت تطبیق با سرور را بررسی کن.</p>
                  </div>
                </header>

                <section className="backup-panel" aria-labelledby="backup-local-title">
                  <header className="backup-panel-heading">
                    <span className="backup-panel-icon local"><Icon name="backup" /></span>
                    <div>
                      <h3 id="backup-local-title">پشتیبانگیری از اطلاعات</h3>
                      <p>یک فایل پشتیبان از اطلاعات ذخیره‌شده روی این دستگاه دریافت کن.</p>
                    </div>
                  </header>
                  <div className="backup-includes">
                    <strong>اطلاعاتی که در نسخهٔ پشتیبان قرار می‌گیرند</strong>
                    <span>مشخصات همهٔ فروشگاه‌ها، اشخاص، گروه‌ها، کالاها و تنظیمات فاکتور و کاربران ذخیره‌شده روی این دستگاه.</span>
                  </div>
                  <p className="backup-privacy-note">
                    فایل شامل اطلاعات خصوصی فروشگاه‌هاست؛ آن را فقط در محل امن نگهداری و با افراد مورد اعتماد به اشتراک بگذار.
                  </p>
                  {backupNotice && <p className="backup-action-notice" role="status">{backupNotice}</p>}
                  {backupImportError && <p className="backup-action-notice unavailable" role="alert">{backupImportError}</p>}
                  <div className="backup-transfer-actions">
                    <button className="backup-primary-button" type="button" onClick={createLocalBackup}>
                      <Icon name="backup" />
                      دریافت نسخهٔ پشتیبان
                    </button>
                    <button className="backup-import-button" type="button" onClick={() => backupImportInputRef.current?.click()}>
                      <Icon name="folder" />
                      واردکردن نسخهٔ پشتیبان
                    </button>
                    <input
                      ref={backupImportInputRef}
                      className="backup-hidden-file-input"
                      type="file"
                      accept=".json,application/json"
                      aria-label="انتخاب فایل نسخهٔ پشتیبان"
                      aria-hidden="true"
                      tabIndex={-1}
                      onChange={(event) => void readBackupFile(event)}
                    />
                  </div>
                  {backupImport && (
                    <div
                      className="store-modal-backdrop"
                      onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setBackupImport(null)
                      }}
                    >
                      <section className="store-modal backup-restore-modal" role="dialog" aria-modal="true" aria-labelledby="backup-restore-title">
                        <div className="store-modal-heading">
                          <span className="store-modal-icon backup-restore-modal-icon"><Icon name="backup" /></span>
                          <div>
                            <h2 id="backup-restore-title">بازیابی نسخهٔ پشتیبان</h2>
                            <p>{backupImport.filename}</p>
                          </div>
                          <button className="store-modal-close" type="button" aria-label="بستن پنجره" onClick={() => setBackupImport(null)}>×</button>
                        </div>
                        <div className="backup-restore-summary">
                          <strong>{backupImport.backup.stores.length} فروشگاه در فایل شناسایی شد</strong>
                          <span>تاریخ نسخهٔ پشتیبان: {formatCalendarDate(new Date(backupImport.backup.createdAt), 'persian')}</span>
                        </div>
                        <fieldset className="backup-restore-options">
                          <legend>روش واردکردن را انتخاب کن</legend>
                          <label>
                            <input
                              type="radio"
                              name="backup-restore-mode"
                              value="replace"
                              checked={backupImport.mode === 'replace'}
                              onChange={() => setBackupImport({ ...backupImport, mode: 'replace' })}
                            />
                            <span>
                              <strong>جایگزینی کامل اطلاعات</strong>
                              <small>همهٔ فروشگاه‌ها و داده‌های فعلی این دستگاه با اطلاعات فایل جایگزین می‌شوند.</small>
                            </span>
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="backup-restore-mode"
                              value="merge"
                              checked={backupImport.mode === 'merge'}
                              onChange={() => setBackupImport({ ...backupImport, mode: 'merge' })}
                            />
                            <span>
                              <strong>ادغام فروشگاه‌ها</strong>
                              <small>فروشگاه‌های هم‌شناسه در فایل جایگزین می‌شوند؛ بقیهٔ فروشگاه‌های فعلی می‌مانند.</small>
                            </span>
                          </label>
                        </fieldset>
                        <p className="backup-restore-warning">
                          قبل از ادامه مطمئن شو فایل متعلق به حسابداری گردو و قابل اعتماد است.
                        </p>
                        {backupImportError && <p className="backup-action-notice unavailable" role="alert">{backupImportError}</p>}
                        <div className="store-form-actions">
                          <button className="store-cancel-button" type="button" onClick={() => setBackupImport(null)}>انصراف</button>
                          <button className="store-save-button" type="button" disabled={!backupImport.mode} onClick={restoreImportedBackup}>بازیابی اطلاعات</button>
                        </div>
                      </section>
                    </div>
                  )}
                </section>

                <section className="backup-panel" aria-labelledby="backup-server-title">
                  <header className="backup-panel-heading">
                    <span className="backup-panel-icon server"><Icon name="cloud" /></span>
                    <div>
                      <h3 id="backup-server-title">بررسی مغایرت اطلاعات با سرور</h3>
                      <p>اطلاعات محلی را با نسخهٔ سرور مقایسه کن تا موارد ناسازگار مشخص شوند.</p>
                    </div>
                  </header>
                  <div className="backup-server-state">
                    <span className="backup-server-indicator" aria-hidden="true" />
                    <div>
                      <strong>سرور متصل نیست</strong>
                      <span>زیرساخت همگام‌سازی سرور هنوز به برنامه متصل نشده است.</span>
                    </div>
                  </div>
                  {serverComparisonNotice && <p className="backup-action-notice unavailable" role="status">{serverComparisonNotice}</p>}
                  <button className="backup-secondary-button" type="button" onClick={checkServerDiscrepancies}>
                    <Icon name="cloud" />
                    بررسی مغایرت با سرور
                  </button>
                </section>
              </section>
            ) : activeSettingsSection === 'کاربران' ? (
              <section className="settings-users-page" aria-labelledby="settings-users-title">
                <header className="settings-users-heading">
                  <div>
                    <h2 id="settings-users-title">کاربران این فروشگاه</h2>
                    <p>کاربران هر فروشگاه جداگانه نگهداری می‌شوند.</p>
                  </div>
                  <button className="settings-user-add-button" type="button" onClick={openStoreUserForm}>
                    <span aria-hidden="true">+</span>
                    افزودن کاربر
                  </button>
                </header>

                {storedStoreUsers.error && (
                  <p className="settings-users-error" role="alert">{storedStoreUsers.error}</p>
                )}

                {storedStoreUsers.users.length > 0 ? (
                  <div className="settings-user-list">
                    {storedStoreUsers.users.map((user) => (
                      <article className={`settings-user-card ${user.active ? '' : 'is-inactive'}`} key={user.id}>
                        <span className={`settings-user-avatar ${user.tone}`} aria-hidden="true">
                          {user.name.trim().charAt(0)}
                        </span>
                        <div className="settings-user-details">
                          <strong>{user.name}</strong>
                          <span dir="ltr">{user.phone}</span>
                        </div>
                        <span className={`settings-user-status ${user.active ? 'active' : 'inactive'}`}>
                          {user.active ? 'فعال' : 'غیرفعال'}
                        </span>
                        <div className="settings-user-actions">
                          <button
                            type="button"
                            className="settings-user-toggle"
                            aria-pressed={user.active}
                            onClick={() => toggleStoreUser(user.id)}
                          >
                            {user.active ? 'غیرفعال‌کردن' : 'فعال‌کردن'}
                          </button>
                          <button
                            type="button"
                            className="settings-user-delete"
                            onClick={() => setDeleteConfirmUserId(user.id)}
                          >
                            حذف
                          </button>
                        </div>
                        {deleteConfirmUserId === user.id && (
                          <div className="settings-user-confirm" role="alertdialog" aria-label="تأیید حذف کاربر">
                            <span>کاربر «{user.name}» حذف شود؟</span>
                            <button type="button" onClick={() => deleteStoreUser(user.id)}>حذف کاربر</button>
                            <button type="button" onClick={() => setDeleteConfirmUserId(null)}>انصراف</button>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="settings-users-empty">
                    <span className="settings-users-empty-icon"><Icon name="people" /></span>
                    <strong>هنوز کاربری اضافه نشده</strong>
                    <p>برای مدیریت کاربران این فروشگاه، اولین کاربر را اضافه کن.</p>
                  </div>
                )}

                <p className="settings-users-note">
                  جزئیات سطح دسترسی کاربران را در مرحلهٔ بعد تنظیم می‌کنیم.
                </p>

                {storeUserFormOpen && (
                  <div
                    className="store-modal-backdrop"
                    onMouseDown={(event) => {
                      if (event.target === event.currentTarget) setStoreUserFormOpen(false)
                    }}
                  >
                    <section className="store-modal settings-user-modal" role="dialog" aria-modal="true" aria-labelledby="settings-user-form-title">
                      <div className="store-modal-heading">
                        <span className="store-modal-icon settings-user-modal-icon"><Icon name="people" /></span>
                        <div>
                          <h2 id="settings-user-form-title">افزودن کاربر</h2>
                          <p>کاربر جدید را برای این فروشگاه تعریف کن</p>
                        </div>
                        <button className="store-modal-close" type="button" aria-label="بستن فرم" onClick={() => setStoreUserFormOpen(false)}>×</button>
                      </div>
                      <form className="store-form" onSubmit={saveStoreUser}>
                        <label className="store-field">
                          <span>نام و نام خانوادگی</span>
                          <input autoFocus required maxLength={80} value={storeUserFields.name} onChange={(event) => setStoreUserFields({ ...storeUserFields, name: event.target.value })} />
                        </label>
                        <label className="store-field">
                          <span>شماره تلفن</span>
                          <input required type="tel" inputMode="tel" maxLength={20} dir="ltr" value={storeUserFields.phone} onChange={(event) => setStoreUserFields({ ...storeUserFields, phone: event.target.value })} />
                        </label>
                        <fieldset className="settings-user-colors">
                          <legend>رنگ نماد کاربر</legend>
                          {userTones.map((tone) => (
                            <label className={`settings-user-color-option ${tone}`} key={tone}>
                              <input
                                type="radio"
                                name="store-user-tone"
                                value={tone}
                                checked={storeUserFields.tone === tone}
                                onChange={() => setStoreUserFields({ ...storeUserFields, tone })}
                                aria-label={`رنگ ${tone}`}
                              />
                              <span aria-hidden="true" />
                            </label>
                          ))}
                        </fieldset>
                        <label className="settings-user-active-field">
                          <input type="checkbox" checked={storeUserFields.active} onChange={(event) => setStoreUserFields({ ...storeUserFields, active: event.target.checked })} />
                          <span>کاربر فعال باشد</span>
                        </label>
                        <p className="settings-user-permissions-hint">
                          تنظیم دسترسی‌ها پس از مشخص‌شدن جزئیات در مرحلهٔ بعد اضافه می‌شود.
                        </p>
                        {storeUserFormError && <p className="settings-user-form-error" role="alert">{storeUserFormError}</p>}
                        <div className="store-form-actions">
                          <button className="store-cancel-button" type="button" onClick={() => setStoreUserFormOpen(false)}>انصراف</button>
                          <button className="store-save-button" type="submit">ذخیره کاربر</button>
                        </div>
                      </form>
                    </section>
                  </div>
                )}
              </section>
            ) : activeSettingsSection === 'تنظیمات فاکتور' ? (
              <section
                className="invoice-settings-hub"
                aria-labelledby={invoiceDesignOpen ? 'invoice-design-title' : 'invoice-settings-hub-title'}
              >
                {invoiceDesignOpen ? (
                  <section className="invoice-design-page" aria-labelledby="invoice-design-title">
                    <header className="invoice-design-heading">
                      <button type="button" onClick={() => setInvoiceDesignOpen(false)}>‹ بازگشت</button>
                      <div>
                        <h2 id="invoice-design-title">طرح فاکتور</h2>
                        <p>قالب رسمی بنفش، هماهنگ با اطلاعات ثبت‌شده در فاکتور فروش.</p>
                      </div>
                    </header>
                    <div className="invoice-template-card">
                      <div className="invoice-template-card-heading">
                        <div>
                          <strong>فاکتور رسمی گردو</strong>
                          <span>فروشنده، خریدار، اقلام، تخفیف، جمع و امضا</span>
                        </div>
                        <span className="invoice-template-active">قالب فعال</span>
                      </div>
                      <div className="invoice-template-preview">
                        <iframe
                          className="invoice-template-image"
                          srcDoc={getSalesInvoicePrintDocument(false)}
                          title="پیش‌نمایش زندهٔ فاکتور فروش"
                          scrolling="no"
                        />
                      </div>
                      <button
                        className="invoice-template-download"
                        type="button"
                        onClick={() => printSalesInvoice()}
                      >
                        چاپ همین فاکتور
                      </button>
                      <p className="invoice-template-note">
                        این پیش‌نمایش زنده دقیقاً از همان قالب چاپ ساخته می‌شود؛ با تغییر فاکتور، مشخصات خریدار، اقلام و مبالغ اینجا هم به‌روز می‌شوند.
                      </p>
                    </div>
                  </section>
                ) : (
                  <>
                    <header className="settings-page-intro">
                      <span className="settings-page-intro-icon" aria-hidden="true">
                        <Icon name="cart" />
                      </span>
                      <div>
                        <h2 id="invoice-settings-hub-title">شخصی‌سازی فاکتور فروش</h2>
                        <p>بخشی را برای تنظیم ظاهر و اطلاعات فاکتور انتخاب کن.</p>
                      </div>
                    </header>
                    <nav className="settings-section-list" aria-label="گزینه‌های تنظیمات فاکتور">
                      {invoiceSettingsSections.map((section) => (
                        <button
                          className="settings-section-button"
                          key={section.label}
                          type="button"
                          onClick={() => {
                            if (section.label === 'تنظیمات') {
                              openSalesInvoiceSettings()
                            } else if (section.label === 'طرح فاکتور') {
                              setInvoiceDesignOpen(true)
                            } else {
                              showComingSoon(section.label)
                            }
                          }}
                        >
                          <span className={`settings-section-icon ${section.tone}`}>
                            <Icon name={section.icon} />
                          </span>
                          <span className="settings-section-copy">
                            <strong>{section.label}</strong>
                            <span>{section.description}</span>
                          </span>
                          <span className="settings-section-arrow" aria-hidden="true">‹</span>
                        </button>
                      ))}
                    </nav>
                  </>
                )}
                {salesInvoiceSettingsOpen && (
                  <div
                    className="sales-invoice-settings-backdrop"
                    onMouseDown={(event) => {
                      if (event.target === event.currentTarget) setSalesInvoiceSettingsOpen(false)
                    }}
                  >
                    <section
                      className="sales-invoice-settings-dialog"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="sales-invoice-settings-title"
                    >
                      <header>
                        <div>
                          <span>شخصی‌سازی ثبت فاکتور</span>
                          <h2 id="sales-invoice-settings-title">
                            {returnPurchaseInvoiceMode
                              ? 'تنظیمات فاکتور برگشت به خرید'
                              : purchaseInvoiceMode ? 'تنظیمات فاکتور خرید' : 'تنظیمات فاکتور فروش'}
                          </h2>
                        </div>
                        <button
                          type="button"
                          aria-label="بستن تنظیمات"
                          onClick={() => setSalesInvoiceSettingsOpen(false)}
                        >
                          ×
                        </button>
                      </header>
                      <div className="sales-invoice-settings-content">
                        {([
                          ['prefixCategoryName', 'نمایش نام دسته قبل از نام کالا', 'نام دسته‌بندی در شرح ردیف فاکتور نمایش داده می‌شود.'],
                          ['enableItemDiscount', 'فعال‌سازی تخفیف برای هر کالا', 'درصد و مبلغ تخفیف در فرم و ردیف‌های فاکتور فعال می‌شود.'],
                          ['enableItemDescription', 'فعال‌سازی توضیحات کالا', 'امکان ویرایش شرح کالا هنگام افزودن به فاکتور فراهم می‌شود.'],
                          ['showPurchasePrice', 'نمایش قیمت خرید در انتخاب کالا', 'قیمت خرید در کنار قیمت فروش، فقط در فهرست انتخاب کالا نمایش داده می‌شود.'],
                          ['updateInventoryPrice', 'به‌روزرسانی قیمت فروش کالا در انبار', 'با ثبت کالا در فاکتور، قیمت فروش ویرایش‌شده در فهرست انبار نیز ذخیره می‌شود.'],
                          ['autoSalesPricePercent', 'محاسبهٔ خودکار قیمت فروش بر اساس درصد روی خرید', 'هنگام انتخاب کالا، قیمت پیشنهادی از قیمت خرید و درصد سود محاسبه می‌شود.'],
                        ] as const).map(([key, title, description]) => (
                          <label className="sales-invoice-setting-option" key={key}>
                            <span className="sales-invoice-setting-copy">
                              <strong>{title}</strong>
                              <small>{description}</small>
                            </span>
                            <input
                              type="checkbox"
                              checked={salesInvoiceDraftSettings[key]}
                              onChange={(event) => setSalesInvoiceDraftSettings((settings) => ({
                                ...settings,
                                [key]: event.target.checked,
                              }))}
                              aria-label={title}
                            />
                          </label>
                        ))}
                        {salesInvoiceDraftSettings.autoSalesPricePercent && (
                          <label className="sales-invoice-settings-markup">
                            <span>درصد روی قیمت خرید</span>
                            <div>
                              <input
                                inputMode="numeric"
                                aria-label="درصد سود روی قیمت خرید"
                                value={formatPersonBalance(salesInvoiceDraftSettings.salePriceMarkupPercent)}
                                onChange={(event) => {
                                  const percent = parsePersonBalance(event.target.value)
                                  if (percent !== null) {
                                    setSalesInvoiceDraftSettings((settings) => ({
                                      ...settings,
                                      salePriceMarkupPercent: percent,
                                    }))
                                  }
                                }}
                              />
                              <small>٪</small>
                            </div>
                          </label>
                        )}
                      </div>
                      <footer className="sales-invoice-settings-actions">
                        <button type="button" onClick={() => setSalesInvoiceSettingsOpen(false)}>لغو</button>
                        <button className="confirm" type="button" onClick={saveSalesInvoiceSettings}>تأیید</button>
                      </footer>
                    </section>
                  </div>
                )}
              </section>
            ) : activeSettingsSection === 'انتخاب تم' ? (
              <section className="color-theme-settings" aria-labelledby="color-theme-title">
                <header className="color-theme-heading">
                  <span className="color-theme-heading-icon"><Icon name="sun" /></span>
                  <div>
                    <h2 id="color-theme-title">رنگ دلخواهت را انتخاب کن</h2>
                    <p>رنگ‌ها فوراً در برنامه اعمال می‌شوند و حالت روشن یا تاریک جداگانه باقی می‌ماند.</p>
                  </div>
                </header>
                <div className="color-theme-options" role="group" aria-label="انتخاب رنگ برنامه">
                  {appColorThemes.map((option) => (
                    <button
                      className={`color-theme-option${colorTheme === option.id ? ' selected' : ''}`}
                      key={option.id}
                      type="button"
                      aria-pressed={colorTheme === option.id}
                      onClick={() => setColorTheme(option.id)}
                    >
                      <span className="color-theme-preview" style={{ background: option.wash }} aria-hidden="true">
                        <span className="color-theme-preview-top" style={{ background: option.deep }}>
                          <i style={{ background: option.accent }} />
                          <i />
                          <i />
                        </span>
                        <span className="color-theme-preview-body">
                          <i style={{ background: option.soft, borderColor: option.soft }} />
                          <i style={{ background: option.accent, borderColor: option.accent }} />
                          <i style={{ background: option.soft, borderColor: option.soft }} />
                        </span>
                      </span>
                      <span className="color-theme-option-copy">
                        <strong>{option.name}</strong>
                        <small>{option.description}</small>
                      </span>
                      <span className="color-theme-swatch" style={{ background: option.accent }} aria-hidden="true" />
                      <span className="color-theme-selected" aria-hidden="true"><Icon name="check" /></span>
                    </button>
                  ))}
                </div>
                <p className="color-theme-status" role="status">
                  تم انتخاب تم {appColorThemes.find((option) => option.id === colorTheme)?.name}.
                </p>
              </section>
            ) : activeSettingsSection === 'امنیت' ? (
              <section className="settings-security-page" aria-labelledby="settings-security-title">
                <header className="settings-security-intro">
                  <span className="settings-security-intro-icon"><Icon name="lock" /></span>
                  <div>
                    <h2 id="settings-security-title">امنیت و دسترسی‌ها</h2>
                    <p>روش ورود و اجازه‌هایی را که برنامه برای کارکردهایش نیاز دارد مدیریت کن.</p>
                  </div>
                </header>

                {securitySettings.error && <p className="settings-security-error" role="alert">{securitySettings.error}</p>}
                {securityNotice && <p className="settings-security-notice" role="status">{securityNotice}</p>}

                <section className="security-panel" aria-labelledby="security-biometric-title">
                  <header className="security-panel-heading">
                    <span className="security-panel-icon biometric"><Icon name="fingerprint" /></span>
                    <div>
                      <h3 id="security-biometric-title">ورود با اثر انگشت یا تشخیص چهره</h3>
                      <p>برای دستگاه‌هایی که احراز هویت بیومتریک امن را پشتیبانی می‌کنند.</p>
                    </div>
                  </header>
                  <div className="security-biometric-status">
                    <span className={`security-status-pill ${deviceAuthenticatorAvailable ? 'available' : deviceAuthenticatorAvailable === false ? 'unavailable' : 'checking'}`}>
                      {deviceAuthenticatorAvailable === null
                        ? 'در حال بررسی دستگاه…'
                        : deviceAuthenticatorAvailable
                        ? 'قابلیت بیومتریک دستگاه شناسایی شد'
                        : 'قابلیت بیومتریک وب شناسایی نشد'}
                    </span>
                    <button className="security-disabled-action" type="button" disabled>
                      {deviceAuthenticatorAvailable ? 'پس از راه‌اندازی ورود امن فعال می‌شود' : 'در این دستگاه در دسترس نیست'}
                    </button>
                  </div>
                  <p className="security-explainer">
                    در iPhone ممکن است Face ID یا Touch ID و در دستگاه‌های دیگر اثر انگشت یا قفل امن دستگاه استفاده شود. فعال‌سازی واقعی به ورود امن و تأیید سمت سرور نیاز دارد که هنوز به برنامه متصل نیست.
                  </p>
                </section>

                <section className="security-panel" aria-labelledby="security-password-title">
                  <header className="security-panel-heading">
                    <span className="security-panel-icon passcode"><Icon name="lock" /></span>
                    <div>
                      <h3 id="security-password-title">ورود با رمز</h3>
                      <p>روش دلخواه برای ورود امن را انتخاب کن.</p>
                    </div>
                  </header>
                  <div className="security-login-methods" role="radiogroup" aria-label="روش ورود با رمز">
                    {securityLoginMethodOptions.map((method) => (
                      <label
                        className={`security-login-method ${securitySettings.loginMethod === method.id ? 'selected' : ''}`}
                        key={method.id}
                      >
                        <input
                          type="radio"
                          name="security-login-method"
                          value={method.id}
                          checked={securitySettings.loginMethod === method.id}
                          onChange={() => selectSecurityLoginMethod(method.id)}
                        />
                        <span className="security-login-method-icon"><Icon name={method.icon} /></span>
                        <span className="security-login-method-copy">
                          <strong>{method.title}</strong>
                          <small>{method.description}</small>
                        </span>
                        <span className="security-login-method-check" aria-hidden="true" />
                      </label>
                    ))}
                  </div>
                  <p className="security-explainer">
                    انتخاب روش روی این دستگاه ذخیره می‌شود؛ تنظیم و بررسی PIN، الگو یا رمز هنگام ورود پس از راه‌اندازی سامانهٔ احراز هویت فعال خواهد شد.
                  </p>
                </section>

                <section className="security-panel" aria-labelledby="security-permissions-title">
                  <header className="security-panel-heading">
                    <span className="security-panel-icon permissions"><Icon name="settings" /></span>
                    <div>
                      <h3 id="security-permissions-title">دسترسی‌های برنامه</h3>
                      <p>هر دسترسی فقط هنگام نیاز و با تأیید خودت درخواست می‌شود.</p>
                    </div>
                  </header>

                  <div className="security-permission-list">
                    <article className="security-permission-card">
                      <span className="security-permission-icon notification"><Icon name="bell" /></span>
                      <div className="security-permission-copy">
                        <strong>نمایش اعلان</strong>
                        <span>
                          {securitySettings.notificationAccessEnabled && securityPermissionStatus.notifications !== 'denied' && securityPermissionStatus.notifications !== 'unsupported'
                            ? 'اجازهٔ برنامه فعال است'
                            : securityPermissionStatus.notifications === 'granted'
                            ? 'اجازهٔ دستگاه موجود است؛ برنامه خاموش است'
                            : securityPermissionStatus.notifications === 'denied'
                            ? 'اجازه رد شده؛ از تنظیمات مرورگر تغییر بده'
                            : securityPermissionStatus.notifications === 'unsupported'
                            ? 'در این مرورگر یا اتصال ناامن پشتیبانی نمی‌شود'
                            : 'برای یادآورها و اعلان‌های برنامه'}
                        </span>
                      </div>
                      <label className="security-switch">
                        <input
                          type="checkbox"
                          role="switch"
                          aria-label="اجازهٔ نمایش اعلان"
                          checked={securitySettings.notificationAccessEnabled && securityPermissionStatus.notifications !== 'denied' && securityPermissionStatus.notifications !== 'unsupported'}
                          disabled={securityPermissionStatus.notifications === 'denied' || securityPermissionStatus.notifications === 'unsupported'}
                          onChange={(event) => {
                            if (event.currentTarget.checked) {
                              void requestNotificationAccess()
                            } else if (setSecurityAccessPreference('notifications', false)) {
                              setSecurityNotice(securityPermissionStatus.notifications === 'granted'
                                ? 'اعلان برای برنامه خاموش شد؛ برای لغو مجوز سیستم از تنظیمات دستگاه استفاده کن.'
                                : 'اعلان برای برنامه خاموش شد.')
                            }
                          }}
                        />
                        <span className="security-switch-track" aria-hidden="true" />
                      </label>
                    </article>

                    <article className="security-permission-card">
                      <span className="security-permission-icon messages"><Icon name="sms" /></span>
                      <div className="security-permission-copy">
                        <strong>خواندن پیامک‌های بانکی</strong>
                        <span>خواندن پیامک در PWA مرورگر ممکن نیست؛ نیازمند نسخهٔ بومی اندروید و مجوز جداگانه است.</span>
                      </div>
                      <label className="security-switch disabled" aria-label="خواندن پیامک‌های بانکی در نسخه وب پشتیبانی نمی‌شود">
                        <input type="checkbox" role="switch" disabled />
                        <span className="security-switch-track" aria-hidden="true" />
                      </label>
                    </article>

                    <article className="security-permission-card">
                      <span className="security-permission-icon files"><Icon name="folder" /></span>
                      <div className="security-permission-copy">
                        <strong>انتخاب فایل برای پیوست</strong>
                        <span>انتخاب فایل در پنجرهٔ سیستم انجام می‌شود و به مجوز دائمی یا کلید دسترسی نیاز ندارد.</span>
                      </div>
                      <label className="security-switch disabled" aria-label="فایل‌ها از طریق انتخاب‌گر سیستم باز می‌شوند">
                        <input type="checkbox" role="switch" disabled />
                        <span className="security-switch-track" aria-hidden="true" />
                      </label>
                    </article>

                    <article className="security-permission-card">
                      <span className="security-permission-icon camera"><Icon name="camera" /></span>
                      <div className="security-permission-copy">
                        <strong>دوربین برای عکس و بارکدخوان</strong>
                        <span>
                          {securitySettings.cameraAccessEnabled && securityPermissionStatus.camera !== 'denied' && securityPermissionStatus.camera !== 'unsupported'
                            ? 'اجازهٔ برنامه فعال است'
                            : securityPermissionStatus.camera === 'granted'
                            ? 'اجازهٔ دستگاه موجود است؛ برنامه خاموش است'
                            : securityPermissionStatus.camera === 'denied'
                            ? 'اجازه رد شده؛ از تنظیمات مرورگر تغییر بده'
                            : securityPermissionStatus.camera === 'unsupported'
                            ? 'در این مرورگر یا اتصال ناامن پشتیبانی نمی‌شود'
                            : 'درخواست اجازه هنگام استفاده از دوربین'}
                        </span>
                      </div>
                      <label className="security-switch">
                        <input
                          type="checkbox"
                          role="switch"
                          aria-label="اجازهٔ دوربین برای عکس و بارکدخوان"
                          checked={securitySettings.cameraAccessEnabled && securityPermissionStatus.camera !== 'denied' && securityPermissionStatus.camera !== 'unsupported'}
                          disabled={securityPermissionStatus.camera === 'denied' || securityPermissionStatus.camera === 'unsupported'}
                          onChange={(event) => {
                            if (event.currentTarget.checked) {
                              void requestCameraAccess()
                            } else if (setSecurityAccessPreference('camera', false)) {
                              setSecurityNotice(securityPermissionStatus.camera === 'granted'
                                ? 'دوربین برای برنامه خاموش شد؛ برای لغو مجوز سیستم از تنظیمات دستگاه استفاده کن.'
                                : 'دوربین برای برنامه خاموش شد.')
                            }
                          }}
                        />
                        <span className="security-switch-track" aria-hidden="true" />
                      </label>
                    </article>

                    <article className="security-permission-card">
                      <span className="security-permission-icon messages"><Icon name="sms" /></span>
                      <div className="security-permission-copy">
                        <strong>پیامک برای ارسال فاکتور</strong>
                        <span>ارسال مستقیم پیامک از PWA ممکن نیست؛ نسخهٔ بومی می‌تواند با تأیید کاربر برنامهٔ پیامک را باز کند.</span>
                      </div>
                      <label className="security-switch disabled" aria-label="ارسال پیامک از نسخه وب پشتیبانی نمی‌شود">
                        <input type="checkbox" role="switch" disabled />
                        <span className="security-switch-track" aria-hidden="true" />
                      </label>
                    </article>

                    <article className="security-permission-card">
                      <span className="security-permission-icon calls"><Icon name="phone" /></span>
                      <div className="security-permission-copy">
                        <strong>دسترسی به تماس‌ها</strong>
                        <span>مشاهدهٔ تماس‌ها یا گزارش تماس در PWA پشتیبانی نمی‌شود و به قابلیت بومی نیاز دارد.</span>
                      </div>
                      <label className="security-switch disabled" aria-label="دسترسی به تماس‌ها در نسخه وب پشتیبانی نمی‌شود">
                        <input type="checkbox" role="switch" disabled />
                        <span className="security-switch-track" aria-hidden="true" />
                      </label>
                    </article>
                  </div>
                </section>
              </section>
            ) : activeSettingsSection ? (
              <section className="settings-section-placeholder" aria-live="polite">
                <span className="settings-section-placeholder-icon" aria-hidden="true">
                  <Icon name={settingsSections.find((section) => section.label === activeSettingsSection)?.icon ?? 'settings'} />
                </span>
                <h2>{activeSettingsSection}</h2>
                <p>امکانات این بخش را در مرحلهٔ بعد، بر اساس جزئیاتی که می‌گویی اضافه می‌کنیم.</p>
                <button type="button" onClick={() => setActiveSettingsSection('')}>
                  بازگشت به تنظیمات
                </button>
              </section>
            ) : (
              <>
                <section className="settings-page-intro">
                  <span className="settings-page-intro-icon" aria-hidden="true">
                    <Icon name="settings" />
                  </span>
                  <div>
                    <h2>تنظیمات برنامه</h2>
                    <p>بخشی را برای مدیریت و شخصی‌سازی برنامه انتخاب کن.</p>
                  </div>
                </section>
                <nav className="settings-section-list" aria-label="بخش‌های تنظیمات">
                  {settingsSections.map((section) => (
                    <button
                      className="settings-section-button"
                      key={section.label}
                      type="button"
                      onClick={() => setActiveSettingsSection(section.label)}
                    >
                      <span className={`settings-section-icon ${section.tone}`}>
                        <Icon name={section.icon} />
                      </span>
                      <span className="settings-section-copy">
                        <strong>{section.label}</strong>
                        <span>{section.description}</span>
                      </span>
                      <span className="settings-section-arrow" aria-hidden="true">‹</span>
                    </button>
                  ))}
                </nav>
              </>
            )}
          </div>
        ) : activeTab === 'گزارشات' ? (
          <div className="counterparty-report-page counterparty-chart-page">
            <section className="counterparty-report counterparty-chart-report" aria-labelledby="counterparty-chart-title">
              <button
                className="counterparty-report-back"
                type="button"
                onClick={() => setActiveTab('اشخاص')}
              >
                <span aria-hidden="true">→</span>
                بازگشت به اشخاص
              </button>
              <header className="counterparty-report-header">
                <h1 id="counterparty-chart-title">گزارشات اشخاص</h1>
                <p>نمای کلی مانده و وضعیت حساب طرف‌حساب‌ها</p>
                <label className="counterparty-report-group">
                  <span>گروه موردنظر را برای فیلتر گزارش انتخاب کنید.</span>
                  <div className="person-group-picker" ref={accountReportGroupPickerRef}>
                    <button
                      className="person-group-picker-trigger"
                      type="button"
                      role="combobox"
                      aria-label="انتخاب گروه گزارش"
                      aria-haspopup="listbox"
                      aria-expanded={accountReportGroupPickerOpen}
                      aria-controls="account-report-group-options"
                      onClick={() => setAccountReportGroupPickerOpen(!accountReportGroupPickerOpen)}
                    >
                      <span>{accountReportGroup}</span>
                      <span className="dropdown-chevron person-group-picker-chevron" aria-hidden="true">⌄</span>
                    </button>
                    {accountReportGroupPickerOpen && (
                      <div
                        className="person-group-picker-options"
                        id="account-report-group-options"
                        role="listbox"
                        aria-label="گروه‌های گزارش"
                      >
                        {[allAccountReportGroups, ...peopleGroupState.groups].map((group) => (
                          <button
                            className={accountReportGroup === group ? 'selected' : ''}
                            key={group}
                            type="button"
                            role="option"
                            aria-selected={accountReportGroup === group}
                            onClick={() => {
                              setAccountReportGroup(group)
                              setAccountReportGroupPickerOpen(false)
                            }}
                          >
                            {group}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </label>
              </header>

              <section className="counterparty-chart-grid" aria-label="نمودار بدهکاران و بستانکاران">
                {accountReportChartGroups.map((group) => {
                  const maxBalance = Math.max(1, ...group.people.map((person) => person.balance))
                  return (
                    <article className={`counterparty-chart-card ${group.tone}`} key={group.status}>
                      <header className="counterparty-chart-card-header">
                        <div className="counterparty-chart-card-title">
                          <span className="counterparty-chart-card-icon" aria-hidden="true">
                            {group.tone === 'debit' ? '↓' : '↑'}
                          </span>
                          <div>
                            <h2>{group.status}</h2>
                            <p>{group.description}</p>
                          </div>
                        </div>
                        <span className="counterparty-chart-count">
                          {formatPersonBalance(group.count)} شخص
                        </span>
                      </header>

                      <div className="counterparty-chart-total">
                        <span>جمع مانده</span>
                        <strong>{formatPersonBalance(group.total)} <small>ریال</small></strong>
                      </div>

                      <div className="counterparty-chart-list-heading">
                        <h3>بیشترین مانده‌ها</h3>
                        <span>تا ۵ شخص</span>
                      </div>

                      <div className="counterparty-chart-people">
                        {group.people.map((person, index) => (
                          <div
                            className="counterparty-chart-person"
                            key={person.id}
                            aria-label={`${person.name}: ${formatPersonBalance(person.balance)} ریال`}
                          >
                            <div className="counterparty-chart-person-label">
                              <span className="counterparty-chart-rank">{formatPersonBalance(index + 1)}</span>
                              <strong>{person.name}</strong>
                              <span className="counterparty-chart-person-balance">
                                {formatPersonBalance(person.balance)}
                              </span>
                            </div>
                            <div className="counterparty-chart-track" aria-hidden="true">
                              <span style={{ width: `${person.balance / maxBalance * 100}%` }} />
                            </div>
                          </div>
                        ))}
                        {group.people.length === 0 && (
                          <p className="counterparty-chart-empty">موردی برای نمایش نیست.</p>
                        )}
                      </div>
                    </article>
                  )
                })}
              </section>

              <section className="counterparty-chart-extras" aria-label="سایر اطلاعات حساب‌ها">
                <article className="counterparty-chart-settled">
                  <span className="counterparty-chart-settled-icon" aria-hidden="true">✓</span>
                  <div>
                    <strong>تسویه‌شده‌ها</strong>
                    <small>بدون ماندهٔ بدهی یا بستانکاری</small>
                  </div>
                  <b>{formatPersonBalance(accountReportStatusCounts['تسویه شده'])} <small>شخص</small></b>
                </article>

                <section className="counterparty-chart-ranked" aria-labelledby="counterparty-chart-ranked-title">
                  <header className="counterparty-chart-list-heading">
                    <h2 id="counterparty-chart-ranked-title">فهرست اشخاص بر اساس مانده</h2>
                    <span>تا ۸ شخص</span>
                  </header>
                  <div className="counterparty-chart-ranked-list">
                    {accountReportRankedPeople.map((person) => (
                      <article
                        className={`counterparty-chart-ranked-row ${person.accountStatus === 'بدهکاران' ? 'debit' : person.accountStatus === 'بستانکاران' ? 'credit' : 'settled'}`}
                        key={person.id}
                      >
                        <div>
                          <strong>{person.name}</strong>
                          <span>{person.accountStatus}</span>
                        </div>
                        <b>{formatPersonBalance(person.balance)} <small>ریال</small></b>
                      </article>
                    ))}
                    {accountReportRankedPeople.length === 0 && (
                      <p className="counterparty-chart-empty">برای این گروه هنوز شخصی ثبت نشده است.</p>
                    )}
                  </div>
                </section>
              </section>
            </section>
          </div>
        ) : activeTab === 'گزارشات طرف حساب‌ها' ? (
          <div className="counterparty-report-page">
            <section className="counterparty-report" aria-labelledby="counterparty-report-title">
              <button
                className="counterparty-report-back"
                type="button"
                onClick={() => setActiveTab('اشخاص')}
              >
                <span aria-hidden="true">→</span>
                بازگشت به اشخاص
              </button>
              <header className="counterparty-report-header">
                <h1 id="counterparty-report-title">گزارشات طرف حساب‌ها</h1>
                <p>گزارش‌ها بر اساس گروه انتخاب‌شده نمایش داده می‌شوند.</p>
                <label className="counterparty-report-group">
                  <span>برای مشاهدهٔ گزارش کلی، همهٔ گروه‌ها را انتخاب کنید.</span>
                  <div className="person-group-picker" ref={accountReportGroupPickerRef}>
                    <button
                      className="person-group-picker-trigger"
                      type="button"
                      role="combobox"
                      aria-label="انتخاب گروه گزارش"
                      aria-haspopup="listbox"
                      aria-expanded={accountReportGroupPickerOpen}
                      aria-controls="account-report-group-options"
                      onClick={() => setAccountReportGroupPickerOpen(!accountReportGroupPickerOpen)}
                    >
                      <span>{accountReportGroup}</span>
                      <span className="dropdown-chevron person-group-picker-chevron" aria-hidden="true">⌄</span>
                    </button>
                    {accountReportGroupPickerOpen && (
                      <div
                        className="person-group-picker-options"
                        id="account-report-group-options"
                        role="listbox"
                        aria-label="گروه‌های گزارش"
                      >
                        {[allAccountReportGroups, ...peopleGroupState.groups].map((group) => (
                          <button
                            className={accountReportGroup === group ? 'selected' : ''}
                            key={group}
                            type="button"
                            role="option"
                            aria-selected={accountReportGroup === group}
                            onClick={() => {
                              setAccountReportGroup(group)
                              setAccountReportGroupPickerOpen(false)
                            }}
                          >
                            {group}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </label>
              </header>

              <section className="counterparty-report-totals" aria-label="جمع حساب‌ها">
                <div className="counterparty-total debit">
                  <span>مجموع بدهکاران</span>
                  <strong>{formatPersonBalance(accountReportTotals.debit)} <small>ریال</small></strong>
                </div>
                <div className="counterparty-total credit">
                  <span>مجموع بستانکاران</span>
                  <strong>{formatPersonBalance(accountReportTotals.credit)} <small>ریال</small></strong>
                </div>
                <div className={`counterparty-total net ${netBalance > 0 ? 'debit' : netBalance < 0 ? 'credit' : 'settled'}`}>
                  <span>{netBalance > 0 ? 'خالص بدهکار' : netBalance < 0 ? 'خالص بستانکار' : 'خالص'}</span>
                  <strong>{formatPersonBalance(Math.abs(netBalance))} <small>ریال</small></strong>
                </div>
              </section>

              <section className="counterparty-report-list" aria-label="ماندهٔ طرف حساب‌ها">
                {accountReportPeople.map((person) => (
                  <article
                    className={`counterparty-report-row ${person.accountStatus === 'بدهکاران' ? 'debit' : person.accountStatus === 'بستانکاران' ? 'credit' : 'settled'}`}
                    key={person.id}
                  >
                    <strong>{person.name}</strong>
                    <span>
                      {formatPersonBalance(person.balance)}
                      <small>ریال</small>
                    </span>
                  </article>
                ))}
                {accountReportPeople.length === 0 && (
                  <p className="counterparty-report-empty">هنوز شخصی ثبت نشده است.</p>
                )}
              </section>
            </section>
          </div>
        ) : activeTab === 'جزئیات چک' && checkDetail && selectedCheckDetail ? (
          <div className="check-detail-page">
            <header className="sales-invoice-list-header">
              <button
                type="button"
                aria-label="بازگشت به فهرست چک‌ها"
                onClick={() => setActiveTab(checkDetail.kind === 'received'
                  ? 'فهرست چک‌های دریافتی'
                  : 'فهرست چک‌های پرداختی')}
              >
                ‹
              </button>
              <h1>{checkDetail.kind === 'received' ? 'جزئیات چک دریافتی' : 'جزئیات چک پرداختی'}</h1>
              <span />
            </header>
            <main className="check-detail-content">
              <section className={`check-detail-card${selectedCheckDetail.clearedAt ? ' cleared' : ''}`}>
                <div className="check-detail-card-heading">
                  <span className="check-detail-icon" aria-hidden="true">▤</span>
                  <div>
                    <small>{selectedCheckDetail.bankName}</small>
                    <h2>چک شمارهٔ {selectedCheckDetail.number}</h2>
                  </div>
                  <span className={`check-status-badge ${selectedCheckDetail.clearedAt
                    ? 'cleared'
                    : selectedCheckDetail.dueDate < checkListToday ? 'overdue' : 'uncleared'}`}>
                    {selectedCheckDetail.clearedAt
                      ? 'پاس شده'
                      : selectedCheckDetail.dueDate < checkListToday ? 'عقب افتاده' : 'پاس نشده'}
                  </span>
                </div>
                <strong className="check-detail-amount">
                  {formatPersonBalance(selectedCheckDetail.amount)}
                  <small>ریال</small>
                </strong>
                <dl className="check-detail-grid">
                  <div><dt>طرف حساب</dt><dd>{selectedCheckDetail.personName}</dd></div>
                  <div><dt>شناسهٔ صیادی</dt><dd>{selectedCheckDetail.sayadiId}</dd></div>
                  <div><dt>تاریخ ثبت</dt><dd>{formatCalendarDate(
                    new Date(`${selectedCheckDetail.date}T12:00:00Z`),
                    selectedCheckDetail.calendar,
                  )}</dd></div>
                  <div><dt>تاریخ سررسید</dt><dd>{formatCalendarDate(
                    new Date(`${selectedCheckDetail.dueDate}T12:00:00Z`),
                    selectedCheckDetail.calendar,
                  )}</dd></div>
                  {selectedCheckDetail.transfer && (
                    <>
                      <div><dt>واگذار شده به</dt><dd>{selectedCheckDetail.transfer.personName}</dd></div>
                      <div><dt>تاریخ واگذاری</dt><dd>{formatCalendarDate(
                        new Date(`${selectedCheckDetail.transfer.date}T12:00:00Z`),
                        selectedCheckDetail.transfer.calendar,
                      )}</dd></div>
                    </>
                  )}
                  {selectedCheckDetail.note && (
                    <div className="check-detail-note"><dt>یادداشت</dt><dd>{selectedCheckDetail.note}</dd></div>
                  )}
                </dl>
              </section>
            </main>
            <footer className="sales-invoice-list-footer check-detail-footer" aria-label="عملیات چک">
              <button
                type="button"
                onClick={() => setActiveTab(checkDetail.kind === 'received'
                  ? 'فهرست چک‌های دریافتی'
                  : 'فهرست چک‌های پرداختی')}
              >
                <span aria-hidden="true">↶</span>
                بازگشت
              </button>
              <button
                type="button"
                onClick={() => setCheckClearedStatus(
                  checkDetail.kind,
                  selectedCheckDetail.id,
                  !selectedCheckDetail.clearedAt,
                )}
              >
                <span aria-hidden="true">{selectedCheckDetail.clearedAt ? '↶' : '✓'}</span>
                {selectedCheckDetail.clearedAt ? 'بازگرداندن به پاس‌نشده' : 'ثبت پاس شدن چک'}
              </button>
            </footer>
          </div>
        ) : activeTab === 'فهرست چک‌های دریافتی' || activeTab === 'فهرست چک‌های پرداختی' ? (
          <section className="sales-invoice-list-page check-list-page" aria-labelledby="check-list-title">
            <header className="sales-invoice-list-header">
              <button
                type="button"
                aria-label="به‌روزرسانی فهرست چک‌ها"
                onClick={() => {
                  if (checkListKind === 'received') setStoredReceivedChecks(readStoredReceivedChecks(activeStoreId))
                  else setStoredPaidChecks(readStoredPaidChecks(activeStoreId))
                }}
              >
                ↻
              </button>
              <h1 id="check-list-title">
                لیست چک‌های {checkListKind === 'received' ? 'دریافتی' : 'پرداختی'}
              </h1>
              <button
                type="button"
                aria-label={checkListSearchOpen ? 'بستن جستجوی چک' : 'جستجوی چک'}
                aria-expanded={checkListSearchOpen}
                onClick={() => {
                  setCheckListSearchOpen((open) => !open)
                  setCheckListSearch('')
                }}
              >
                ⌕
              </button>
            </header>
            {checkListSearchOpen && (
              <label className="sales-invoice-list-search">
                <span className="sr-only">جستجو بر اساس شماره، شناسه، بانک یا طرف حساب</span>
                <input
                  type="search"
                  autoFocus
                  value={checkListSearch}
                  onChange={(event) => setCheckListSearch(event.target.value)}
                  placeholder="شماره، شناسهٔ چک، بانک یا طرف حساب"
                />
              </label>
            )}
            <div className="sales-invoice-list-filters check-list-filters" role="tablist" aria-label="وضعیت چک‌ها">
              {([
                { id: 'all', label: 'همه' },
                { id: 'uncleared', label: 'پاس نشده' },
                { id: 'overdue', label: 'عقب افتاده' },
                { id: 'cleared', label: 'پاس شده' },
              ] as const).map((filter) => (
                <button
                  className={checkListFilter === filter.id ? 'selected' : ''}
                  key={filter.id}
                  type="button"
                  role="tab"
                  aria-selected={checkListFilter === filter.id}
                  onClick={() => setCheckListFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="sales-invoice-list-table check-list-table" aria-label={`چک‌های ${checkListKind === 'received' ? 'دریافتی' : 'پرداختی'}`}>
              <div className="sales-invoice-list-table-head">
                <span>شماره چک</span>
                <span>سررسید</span>
                <span>طرف حساب</span>
                <span>مبلغ</span>
              </div>
              {checkListState.error ? (
                <p className="sales-invoice-list-message error" role="alert">{checkListState.error}</p>
              ) : filteredCheckListRows.length ? (
                filteredCheckListRows.map((check) => {
                  const isOverdue = !check.clearedAt && check.dueDate < checkListToday
                  const status = check.clearedAt ? 'cleared' : isOverdue ? 'overdue' : 'uncleared'
                  const statusLabel = status === 'cleared'
                    ? 'پاس شده'
                    : status === 'overdue' ? 'عقب افتاده' : 'پاس نشده'
                  return (
                    <button
                      className="sales-invoice-list-row check-list-row"
                      key={check.id}
                      type="button"
                      aria-label={`نمایش چک ${check.number} از ${check.personName}`}
                      onClick={() => {
                        setCheckDetail({ kind: checkListKind, checkId: check.id })
                        setActiveTab('جزئیات چک')
                      }}
                    >
                      <span className="check-list-number">
                        <strong>{check.number}</strong>
                        <small>{check.bankName}</small>
                      </span>
                      <span className="sales-invoice-list-date">
                        {formatCalendarDate(
                          new Date(`${check.dueDate}T12:00:00Z`),
                          check.calendar,
                        )}
                        <small>سررسید</small>
                      </span>
                      <span className="sales-invoice-list-buyer">{check.transfer?.personName ?? check.personName}</span>
                      <span className="sales-invoice-list-amount">
                        <strong>{formatPersonBalance(check.amount)}</strong>
                        <small className={`check-status-badge ${status}`}>{statusLabel}</small>
                      </span>
                    </button>
                  )
                })
              ) : (
                <p className="sales-invoice-list-message">
                  {checkListSearch.trim()
                    ? 'چکی با این مشخصات پیدا نشد.'
                    : checkListFilter === 'all'
                      ? `هنوز چک ${checkListKind === 'received' ? 'دریافتی' : 'پرداختی'} ثبت نشده است.`
                      : 'چکی با این وضعیت وجود ندارد.'}
                </p>
              )}
            </div>
            <footer className="sales-invoice-list-footer check-list-footer" aria-label="عملیات فهرست چک‌ها">
              <button type="button" onClick={() => setActiveTab('خانه')}>
                <span aria-hidden="true">↶</span>
                بازگشت
              </button>
              <button type="button" onClick={() => setActiveTab('گزارش‌ها')}>
                <span aria-hidden="true">▥</span>
                گزارشات
              </button>
              <button
                type="button"
                onClick={() => openMoneyDocumentForm(checkListKind === 'received' ? 'دریافت چک' : 'پرداخت چک')}
              >
                <span aria-hidden="true">⊕</span>
                سند جدید
              </button>
            </footer>
          </section>
        ) : activeTab === 'فهرست دریافت‌ها' || activeTab === 'فهرست پرداخت‌ها' ? (
          <section className="sales-invoice-list-page cash-document-list-page" aria-labelledby="cash-document-list-title">
            <header className="sales-invoice-list-header">
              <button
                type="button"
                aria-label={`به‌روزرسانی فهرست ${cashDocumentListKind}‌ها`}
                onClick={() => setStoredMoneyDocuments(readStoredMoneyDocuments(activeStoreId))}
              >
                ↻
              </button>
              <h1 id="cash-document-list-title">لیست {cashDocumentListKind}‌ها</h1>
              <button
                type="button"
                aria-label={cashDocumentListSearchOpen ? 'بستن جستجوی اسناد' : 'جستجوی اسناد'}
                aria-expanded={cashDocumentListSearchOpen}
                onClick={() => {
                  setCashDocumentListSearchOpen((open) => !open)
                  setCashDocumentListSearch('')
                }}
              >
                ⌕
              </button>
            </header>
            {cashDocumentListSearchOpen && (
              <label className="sales-invoice-list-search">
                <span className="sr-only">جستجو بر اساس شماره سند، طرف حساب یا مبلغ</span>
                <input
                  type="search"
                  autoFocus
                  value={cashDocumentListSearch}
                  onChange={(event) => setCashDocumentListSearch(event.target.value)}
                  placeholder="شماره سند، طرف حساب یا مبلغ"
                />
              </label>
            )}
            <div className="sales-invoice-list-table money-document-list-table" aria-label={`فهرست ${cashDocumentListKind}‌ها`}>
              <div className="sales-invoice-list-table-head">
                <span>سند</span>
                <span>تاریخ</span>
                <span>طرف حساب</span>
                <span>مبلغ</span>
              </div>
              {storedMoneyDocuments.error ? (
                <p className="sales-invoice-list-message error" role="alert">{storedMoneyDocuments.error}</p>
              ) : cashDocumentListRows.length ? (
                cashDocumentListRows.map((document) => {
                  const date = new Date(`${document.date}T12:00:00Z`)
                  const [hours, minutes] = document.time.split(':').map(Number)
                  const time = Number.isFinite(hours) && Number.isFinite(minutes)
                    ? `${formatClockNumber(hours).padStart(2, '۰')}:${formatClockNumber(minutes).padStart(2, '۰')}`
                    : document.time
                  return (
                    <div className="sales-invoice-list-row money-document-list-row" key={document.id}>
                      <strong>
                        {document.number}
                        {document.note && (
                          <span
                            className="money-document-note-indicator"
                            title={document.note}
                            aria-label="این سند یادداشت دارد"
                          >
                            …
                          </span>
                        )}
                      </strong>
                      <span className="sales-invoice-list-date">
                        {formatCalendarDate(date, 'persian')}
                        <small>{time}</small>
                      </span>
                      <span className="money-document-list-description">
                        {document.personName || document.description || '—'}
                      </span>
                      <span className="sales-invoice-list-amount">
                        <strong>{formatPersonBalance(document.amount)}</strong>
                        <small className="money-document-saved-indicator" aria-label="سند ثبت شده" title="سند ثبت شده">✓</small>
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className="sales-invoice-list-message">
                  {cashDocumentListSearch.trim()
                    ? `سند ${cashDocumentListKind} با این مشخصات پیدا نشد.`
                    : `هنوز سند ${cashDocumentListKind} ثبت نشده است.`}
                </p>
              )}
            </div>
            <footer className="sales-invoice-list-footer" aria-label={`عملیات فهرست ${cashDocumentListKind}‌ها`}>
              <button type="button" onClick={() => setActiveTab('خانه')}>
                <span aria-hidden="true">↶</span>
                بازگشت
              </button>
              <button type="button" onClick={() => setActiveTab('گزارش‌ها')}>
                <span aria-hidden="true">▥</span>
                گزارشات
              </button>
              <button type="button" onClick={() => openMoneyDocumentForm(cashDocumentListKind)}>
                <span aria-hidden="true">⊕</span>
                سند جدید
              </button>
            </footer>
          </section>
        ) : activeTab === 'فهرست هزینه‌ها' ? (
          <section className="sales-invoice-list-page expense-list-page" aria-labelledby="expense-list-title">
            <header className="sales-invoice-list-header">
              <button
                type="button"
                aria-label="به‌روزرسانی فهرست هزینه‌ها"
                onClick={() => setStoredMoneyDocuments(readStoredMoneyDocuments(activeStoreId))}
              >
                ↻
              </button>
              <h1 id="expense-list-title">لیست هزینه‌ها</h1>
              <button
                type="button"
                aria-label={expenseListSearchOpen ? 'بستن جستجوی هزینه‌ها' : 'جستجوی هزینه‌ها'}
                aria-expanded={expenseListSearchOpen}
                onClick={() => {
                  setExpenseListSearchOpen((open) => !open)
                  setExpenseListSearch('')
                }}
              >
                ⌕
              </button>
            </header>
            {expenseListSearchOpen && (
              <label className="sales-invoice-list-search">
                <span className="sr-only">جستجو بر اساس شماره سند، شرح یا حساب</span>
                <input
                  type="search"
                  autoFocus
                  value={expenseListSearch}
                  onChange={(event) => setExpenseListSearch(event.target.value)}
                  placeholder="شماره سند، شرح هزینه یا حساب"
                />
              </label>
            )}
            <div className="sales-invoice-list-table money-document-list-table" aria-label="فهرست هزینه‌ها">
              <div className="sales-invoice-list-table-head">
                <span>سند</span>
                <span>تاریخ</span>
                <span>شرح هزینه</span>
                <span>مبلغ</span>
              </div>
              {storedMoneyDocuments.error ? (
                <p className="sales-invoice-list-message error" role="alert">{storedMoneyDocuments.error}</p>
              ) : expenseListRows.length ? (
                expenseListRows.map((document) => {
                  const date = new Date(`${document.date}T12:00:00Z`)
                  const [hours, minutes] = document.time.split(':').map(Number)
                  const time = Number.isFinite(hours) && Number.isFinite(minutes)
                    ? `${formatClockNumber(hours).padStart(2, '۰')}:${formatClockNumber(minutes).padStart(2, '۰')}`
                    : document.time
                  return (
                    <div className="sales-invoice-list-row money-document-list-row" key={document.id}>
                      <strong>
                        {document.number}
                        {document.note && (
                          <span
                            className="money-document-note-indicator"
                            title={document.note}
                            aria-label="این سند یادداشت دارد"
                          >
                            …
                          </span>
                        )}
                      </strong>
                      <span className="sales-invoice-list-date">
                        {formatCalendarDate(date, 'persian')}
                        <small>{time}</small>
                      </span>
                      <span className="money-document-list-description">{document.description}</span>
                      <span className="sales-invoice-list-amount">
                        <strong>{formatPersonBalance(document.amount)}</strong>
                        <small className="money-document-saved-indicator" aria-label="سند ثبت شده" title="سند ثبت شده">✓</small>
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className="sales-invoice-list-message">
                  {expenseListSearch.trim()
                    ? 'هزینه‌ای با این مشخصات پیدا نشد.'
                    : 'هنوز هزینه‌ای ثبت نشده است.'}
                </p>
              )}
            </div>
            <footer className="sales-invoice-list-footer" aria-label="عملیات فهرست هزینه‌ها">
              <button type="button" onClick={() => setActiveTab('خانه')}>
                <span aria-hidden="true">↶</span>
                بازگشت
              </button>
              <button type="button" onClick={() => setActiveTab('گزارش‌ها')}>
                <span aria-hidden="true">▥</span>
                گزارشات
              </button>
              <button type="button" onClick={() => openMoneyDocumentForm('هزینه')}>
                <span aria-hidden="true">⊕</span>
                سند جدید
              </button>
            </footer>
          </section>
        ) : activeTab === 'فهرست درآمدها' ? (
          <section className="sales-invoice-list-page income-list-page" aria-labelledby="income-list-title">
            <header className="sales-invoice-list-header">
              <button
                type="button"
                aria-label="به‌روزرسانی فهرست درآمدها"
                onClick={() => setStoredMoneyDocuments(readStoredMoneyDocuments(activeStoreId))}
              >
                ↻
              </button>
              <h1 id="income-list-title">لیست درآمدها</h1>
              <button
                type="button"
                aria-label={incomeListSearchOpen ? 'بستن جستجوی درآمدها' : 'جستجوی درآمدها'}
                aria-expanded={incomeListSearchOpen}
                onClick={() => {
                  setIncomeListSearchOpen((open) => !open)
                  setIncomeListSearch('')
                }}
              >
                ⌕
              </button>
            </header>
            {incomeListSearchOpen && (
              <label className="sales-invoice-list-search">
                <span className="sr-only">جستجو بر اساس شماره سند، شرح یا حساب</span>
                <input
                  type="search"
                  autoFocus
                  value={incomeListSearch}
                  onChange={(event) => setIncomeListSearch(event.target.value)}
                  placeholder="شماره سند، شرح درآمد یا حساب"
                />
              </label>
            )}
            <div className="sales-invoice-list-table money-document-list-table" aria-label="فهرست درآمدها">
              <div className="sales-invoice-list-table-head">
                <span>سند</span>
                <span>تاریخ</span>
                <span>شرح درآمد</span>
                <span>مبلغ</span>
              </div>
              {storedMoneyDocuments.error ? (
                <p className="sales-invoice-list-message error" role="alert">{storedMoneyDocuments.error}</p>
              ) : incomeListRows.length ? (
                incomeListRows.map((document) => {
                  const date = new Date(`${document.date}T12:00:00Z`)
                  const accountName = storedAccounts.accounts.find(
                    (account) => account.id === document.accountId,
                  )?.name
                  const [hours, minutes] = document.time.split(':').map(Number)
                  const time = Number.isFinite(hours) && Number.isFinite(minutes)
                    ? `${formatClockNumber(hours).padStart(2, '۰')}:${formatClockNumber(minutes).padStart(2, '۰')}`
                    : document.time
                  return (
                    <div className="sales-invoice-list-row money-document-list-row" key={document.id}>
                      <strong>{document.number}</strong>
                      <span className="sales-invoice-list-date">
                        {formatCalendarDate(date, 'persian')}
                        <small>{time}</small>
                      </span>
                      <span className="money-document-list-description">{document.description}</span>
                      <span className="sales-invoice-list-amount">
                        <strong>{formatPersonBalance(document.amount)}</strong>
                        {accountName && <small className="money-document-list-account">{accountName}</small>}
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className="sales-invoice-list-message">
                  {incomeListSearch.trim()
                    ? 'درآمدی با این مشخصات پیدا نشد.'
                    : 'هنوز درآمدی ثبت نشده است.'}
                </p>
              )}
            </div>
            <footer className="sales-invoice-list-footer" aria-label="عملیات فهرست درآمدها">
              <button type="button" onClick={() => setActiveTab('خانه')}>
                <span aria-hidden="true">↶</span>
                بازگشت
              </button>
              <button type="button" onClick={() => setActiveTab('گزارش‌ها')}>
                <span aria-hidden="true">▥</span>
                گزارشات
              </button>
              <button type="button" onClick={() => openMoneyDocumentForm('درآمد')}>
                <span aria-hidden="true">⊕</span>
                سند جدید
              </button>
            </footer>
          </section>
        ) : activeTab === 'جزئیات فاکتور برگشت' && returnInvoiceDetail ? (
          <div className="sales-invoice-confirmation-page">
            <header className="sales-invoice-confirmation-header">
              <h1>{returnInvoiceDetail.kind === 'sales' ? 'فاکتور برگشت از فروش' : 'فاکتور برگشت به خرید'}</h1>
              <div className="sales-invoice-saved-badge" role="status">
                <span aria-hidden="true">✓</span>
                فاکتور برگشت ثبت شده
              </div>
            </header>
            <main className="sales-invoice-confirmation-content">
              <iframe
                className="sales-invoice-preview-frame"
                title={returnInvoiceDetail.kind === 'sales' ? 'فاکتور برگشت از فروش ثبت‌شده' : 'فاکتور برگشت به خرید ثبت‌شده'}
                srcDoc={getSalesInvoicePrintDocument(
                  false,
                  returnInvoiceDetail.invoice,
                  returnInvoiceDetail.kind === 'sales' ? 'فاکتور برگشت از فروش' : 'فاکتور برگشت به خرید',
                )}
              />
            </main>
            <footer className="sales-invoice-confirmation-footer" aria-label="عملیات فاکتور برگشت">
              <button
                type="button"
                onClick={() => {
                  setReturnInvoiceDetail(null)
                  setActiveTab(returnInvoiceDetail.kind === 'sales' ? 'فهرست برگشت از فروش' : 'فهرست برگشت به خرید')
                }}
              >
                <span aria-hidden="true">↶</span>
                بازگشت به فهرست
              </button>
              <button type="button" onClick={() => printReturnInvoice(returnInvoiceDetail)}>
                <span aria-hidden="true">▤</span>
                چاپ فاکتور
              </button>
            </footer>
          </div>
        ) : activeTab === 'فهرست برگشت از فروش' || activeTab === 'فهرست برگشت به خرید' ? (
          (() => {
            const isSalesReturn = activeTab === 'فهرست برگشت از فروش'
            const returnState = isSalesReturn ? storedReturnSalesInvoices : storedReturnPurchaseInvoices
            const title = isSalesReturn ? 'برگشت از فروش' : 'برگشت به خرید'
            const searchPlaceholder = isSalesReturn
              ? 'شماره فاکتور یا طرف حساب'
              : 'شماره فاکتور یا تأمین‌کننده'
            const openNewReturn = isSalesReturn ? openReturnSalesInvoice : openReturnPurchaseInvoice
            const refreshReturns = () => {
              if (isSalesReturn) {
                setStoredReturnSalesInvoices(
                  readStoredReturnInvoices(RETURN_SALES_INVOICES_STORAGE_KEY, 'sales', activeStoreId),
                )
              } else {
                setStoredReturnPurchaseInvoices(
                  readStoredReturnInvoices(RETURN_PURCHASE_INVOICES_STORAGE_KEY, 'purchase', activeStoreId),
                )
              }
            }
            return (
              <section className="sales-invoice-list-page" aria-labelledby="return-invoice-list-title">
                <header className="sales-invoice-list-header">
                  <button type="button" aria-label={`به‌روزرسانی ${title}`} onClick={refreshReturns}>↻</button>
                  <h1 id="return-invoice-list-title">{title}</h1>
                  <button
                    type="button"
                    aria-label={returnInvoiceListSearchOpen ? 'بستن جستجوی فاکتورهای برگشت' : 'جستجوی فاکتورهای برگشت'}
                    aria-expanded={returnInvoiceListSearchOpen}
                    onClick={() => {
                      setReturnInvoiceListSearchOpen((open) => !open)
                      setReturnInvoiceListSearch('')
                    }}
                  >
                    ⌕
                  </button>
                </header>
                {returnInvoiceListSearchOpen && (
                  <label className="sales-invoice-list-search">
                    <span className="sr-only">جستجو بر اساس شماره فاکتور یا طرف حساب</span>
                    <input
                      type="search"
                      autoFocus
                      value={returnInvoiceListSearch}
                      onChange={(event) => setReturnInvoiceListSearch(event.target.value)}
                      placeholder={searchPlaceholder}
                    />
                  </label>
                )}
                <div className="sales-invoice-list-table" aria-label={`فهرست فاکتورهای ${title}`}>
                  <div className="sales-invoice-list-table-head">
                    <span>فاکتور</span>
                    <span>تاریخ</span>
                    <span>{isSalesReturn ? 'طرف حساب' : 'تأمین‌کننده'}</span>
                    <span>مبلغ</span>
                  </div>
                  {returnState.error ? (
                    <p className="sales-invoice-list-message error" role="alert">{returnState.error}</p>
                  ) : filteredReturnInvoiceListRows.length ? (
                    filteredReturnInvoiceListRows.map((invoice) => {
                      const quantity = invoice.lines.reduce((total, line) => total + line.quantity, 0)
                      const invoiceDate = new Date(`${invoice.date}T12:00:00Z`)
                      const time = `${formatClockNumber(invoice.time.hours).padStart(2, '۰')}:${formatClockNumber(invoice.time.minutes).padStart(2, '۰')}`
                      return (
                        <button
                          className="sales-invoice-list-row"
                          key={invoice.id}
                          type="button"
                          aria-label={`نمایش فاکتور ${title} شماره ${invoice.number}`}
                          onClick={() => {
                            setReturnInvoiceDetail({ kind: isSalesReturn ? 'sales' : 'purchase', invoice })
                            setActiveTab('جزئیات فاکتور برگشت')
                          }}
                        >
                          <strong>{invoice.number}</strong>
                          <span className="sales-invoice-list-date">
                            {formatCalendarDate(invoiceDate, invoice.calendar)}
                            <small>{time}</small>
                          </span>
                          <span className="sales-invoice-list-buyer">{invoice.buyerName}</span>
                          <span className="sales-invoice-list-amount">
                            <strong>{formatPersonBalance(invoice.total)}</strong>
                            <small>{formatPersonBalance(quantity)} قلم</small>
                          </span>
                        </button>
                      )
                    })
                  ) : (
                    <p className="sales-invoice-list-message">
                      {returnInvoiceListSearch.trim()
                        ? `فاکتور ${title} با این مشخصات پیدا نشد.`
                        : `هنوز فاکتور ${title} ثبت نشده است.`}
                    </p>
                  )}
                </div>
                <footer className="sales-invoice-list-footer" aria-label={`عملیات ${title}`}>
                  <button type="button" onClick={() => setActiveTab('خانه')}>
                    <span aria-hidden="true">↶</span>
                    بازگشت
                  </button>
                  <button type="button" onClick={() => setActiveTab('گزارش‌ها')}>
                    <span aria-hidden="true">▥</span>
                    گزارشات
                  </button>
                  <button type="button" onClick={openNewReturn}>
                    <span aria-hidden="true">＋</span>
                    ثبت برگشت جدید
                  </button>
                </footer>
              </section>
            )
          })()
        ) : activeTab === 'فاکتورهای خرید' ? (
          <section className="sales-invoice-list-page" aria-labelledby="purchase-invoice-list-title">
            <header className="sales-invoice-list-header">
              <button
                type="button"
                aria-label="به‌روزرسانی فاکتورهای خرید"
                onClick={() => setStoredPurchaseInvoices(readStoredPurchaseInvoices(activeStoreId))}
              >
                ↻
              </button>
              <h1 id="purchase-invoice-list-title">فاکتورهای خرید</h1>
              <button
                type="button"
                aria-label={purchaseInvoiceListSearchOpen ? 'بستن جستجوی فاکتورهای خرید' : 'جستجوی فاکتورهای خرید'}
                aria-expanded={purchaseInvoiceListSearchOpen}
                onClick={() => {
                  setPurchaseInvoiceListSearchOpen((open) => !open)
                  setPurchaseInvoiceListSearch('')
                }}
              >
                ⌕
              </button>
            </header>
            {purchaseInvoiceListSearchOpen && (
              <label className="sales-invoice-list-search">
                <span className="sr-only">جستجو بر اساس شماره فاکتور خرید یا تأمین‌کننده</span>
                <input
                  type="search"
                  autoFocus
                  value={purchaseInvoiceListSearch}
                  onChange={(event) => setPurchaseInvoiceListSearch(event.target.value)}
                  placeholder="شماره فاکتور خرید یا تأمین‌کننده"
                />
              </label>
            )}
            <div className="sales-invoice-list-table" aria-label="فهرست فاکتورهای خرید">
              <div className="sales-invoice-list-table-head">
                <span>فاکتور</span>
                <span>تاریخ</span>
                <span>تأمین‌کننده</span>
                <span>مبلغ</span>
              </div>
              {storedPurchaseInvoices.error ? (
                <p className="sales-invoice-list-message error" role="alert">{storedPurchaseInvoices.error}</p>
              ) : purchaseInvoiceListRows.length ? (
                purchaseInvoiceListRows.map((invoice) => {
                  const quantity = invoice.lines.reduce((total, line) => total + line.quantity, 0)
                  const invoiceDate = new Date(`${invoice.date}T12:00:00Z`)
                  const time = `${formatClockNumber(invoice.time.hours).padStart(2, '۰')}:${formatClockNumber(invoice.time.minutes).padStart(2, '۰')}`
                  return (
                    <div className="sales-invoice-list-row purchase-invoice-list-row" key={invoice.id}>
                      <strong>{invoice.number}</strong>
                      <span className="sales-invoice-list-date">
                        {formatCalendarDate(invoiceDate, invoice.calendar)}
                        <small>{time}</small>
                      </span>
                      <span className="sales-invoice-list-buyer">{invoice.buyerName}</span>
                      <span className="sales-invoice-list-amount">
                        <strong>{formatPersonBalance(invoice.total)}</strong>
                        <small>{formatPersonBalance(quantity)} قلم</small>
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className="sales-invoice-list-message">
                  {purchaseInvoiceListSearch.trim()
                    ? 'فاکتور خریدی با این مشخصات پیدا نشد.'
                    : 'هنوز فاکتور خریدی ثبت نشده است.'}
                </p>
              )}
            </div>
            <footer className="sales-invoice-list-footer" aria-label="عملیات فاکتورهای خرید">
              <button type="button" onClick={() => setActiveTab('خانه')}>
                <span aria-hidden="true">↶</span>
                بازگشت
              </button>
              <button type="button" onClick={() => setActiveTab('گزارش‌ها')}>
                <span aria-hidden="true">▥</span>
                گزارشات
              </button>
              <button type="button" onClick={openPurchaseInvoice}>
                <span aria-hidden="true">＋</span>
                فاکتور خرید جدید
              </button>
            </footer>
          </section>
        ) : activeTab === 'فاکتورهای فروش' ? (
          <section className="sales-invoice-list-page" aria-labelledby="sales-invoice-list-title">
            <header className="sales-invoice-list-header">
              <button
                type="button"
                aria-label="به‌روزرسانی فاکتورها"
                onClick={() => setStoredSalesInvoices(readStoredSalesInvoices(activeStoreId))}
              >
                ↻
              </button>
              <h1 id="sales-invoice-list-title">فاکتورهای فروش</h1>
              <button
                type="button"
                aria-label={salesInvoiceListSearchOpen ? 'بستن جستجو' : 'جستجوی فاکتور'}
                aria-expanded={salesInvoiceListSearchOpen}
                onClick={() => {
                  setSalesInvoiceListSearchOpen((open) => !open)
                  setSalesInvoiceListSearch('')
                }}
              >
                ⌕
              </button>
            </header>
            {salesInvoiceListSearchOpen && (
              <label className="sales-invoice-list-search">
                <span className="sr-only">جستجو بر اساس شماره فاکتور یا طرف حساب</span>
                <input
                  type="search"
                  autoFocus
                  value={salesInvoiceListSearch}
                  onChange={(event) => setSalesInvoiceListSearch(event.target.value)}
                  placeholder="شماره فاکتور یا طرف حساب"
                />
              </label>
            )}
            <div className="sales-invoice-list-filters" role="tablist" aria-label="وضعیت فاکتورها">
              {([
                { id: 'all', label: 'همه فاکتورها' },
                { id: 'current', label: 'فاکتورهای جاری' },
                { id: 'closed', label: 'بسته‌شده' },
              ] as const).map((filter) => (
                <button
                  className={salesInvoiceListFilter === filter.id ? 'selected' : ''}
                  key={filter.id}
                  type="button"
                  role="tab"
                  aria-selected={salesInvoiceListFilter === filter.id}
                  onClick={() => setSalesInvoiceListFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="sales-invoice-list-table" aria-label="فهرست فاکتورهای فروش">
              <div className="sales-invoice-list-table-head">
                <span>فاکتور</span>
                <span>تاریخ</span>
                <span>طرف حساب</span>
                <span>مبلغ</span>
              </div>
              {storedSalesInvoices.error ? (
                <p className="sales-invoice-list-message error" role="alert">{storedSalesInvoices.error}</p>
              ) : salesInvoiceListRows.length ? (
                salesInvoiceListRows.map((invoice) => {
                  const quantity = invoice.lines.reduce((total, line) => total + line.quantity, 0)
                  const invoiceDate = new Date(`${invoice.date}T12:00:00Z`)
                  const time = `${formatClockNumber(invoice.time.hours).padStart(2, '۰')}:${formatClockNumber(invoice.time.minutes).padStart(2, '۰')}`
                  return (
                    <button
                      className="sales-invoice-list-row"
                      key={invoice.id}
                      type="button"
                      aria-label={`نمایش و پرداخت فاکتور شماره ${invoice.number}`}
                      onClick={() => openSavedSalesInvoice(invoice)}
                    >
                      <strong>{invoice.number}</strong>
                      <span className="sales-invoice-list-date">
                        {formatCalendarDate(invoiceDate, invoice.calendar)}
                        <small>{time}</small>
                      </span>
                      <span className="sales-invoice-list-buyer">{invoice.buyerName}</span>
                      <span className="sales-invoice-list-amount">
                        <strong>{formatPersonBalance(invoice.total)}</strong>
                        <small>{formatPersonBalance(quantity)} قلم</small>
                      </span>
                    </button>
                  )
                })
              ) : (
                <p className="sales-invoice-list-message">
                  {salesInvoiceListFilter === 'current'
                    ? 'فاکتور جاری برای نمایش وجود ندارد.'
                    : salesInvoiceListSearch.trim()
                      ? 'فاکتوری با این مشخصات پیدا نشد.'
                      : 'هنوز فاکتور فروشی ثبت نشده است.'}
                </p>
              )}
            </div>
            <footer className="sales-invoice-list-footer" aria-label="عملیات فاکتورهای فروش">
              <button type="button" onClick={() => setActiveTab('خانه')}>
                <span aria-hidden="true">↶</span>
                بازگشت
              </button>
              <button type="button" onClick={() => setActiveTab('گزارش‌ها')}>
                <span aria-hidden="true">▥</span>
                گزارشات
              </button>
              <button type="button" onClick={openSalesInvoice}>
                <span aria-hidden="true">＋</span>
                فاکتور جدید
              </button>
            </footer>
          </section>
        ) : activeTab === 'فاکتور فروش' || activeTab === 'فاکتور خرید' || activeTab === 'برگشت از فروش' || activeTab === 'برگشت به خرید' ? (
          salesInvoiceConfirmation ? (
            <div className="sales-invoice-confirmation-page">
              <header className="sales-invoice-confirmation-header">
                <h1>فاکتور فروش</h1>
                <div className="sales-invoice-confirmation-header-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setNotice('ارسال پیامک فاکتور پس از اتصال سرویس پیامک فعال می‌شود.')
                      window.setTimeout(() => setNotice(''), 3000)
                    }}
                  >
                    <span aria-hidden="true">▣</span>
                    ارسال پیامک
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNotice('تنظیمات این فاکتور از بخش تنظیمات فاکتور قابل تغییر است.')
                      window.setTimeout(() => setNotice(''), 3000)
                    }}
                  >
                    تنظیمات
                  </button>
                </div>
                <div className="sales-invoice-saved-badge" role="status">
                  <span aria-hidden="true">{salesInvoiceRemainingTotal === 0 ? '✓' : '◷'}</span>
                  {salesInvoiceRemainingTotal === 0
                    ? 'فاکتور تسویه شد'
                    : salesInvoiceReceivedTotal > 0 ? 'دریافت بخشی از فاکتور' : 'فاکتور ثبت شد'}
                </div>
              </header>
              <section className="sales-invoice-payment-summary" aria-label="وضعیت پرداخت فاکتور">
                <span>دریافت‌شده: <strong>{formatPersonBalance(salesInvoiceReceivedTotal)} ریال</strong></span>
                <span>مانده: <strong>{formatPersonBalance(salesInvoiceRemainingTotal)} ریال</strong></span>
              </section>
              <main className="sales-invoice-confirmation-content">
                <iframe
                  className="sales-invoice-preview-frame"
                  title="فاکتور فروش ثبت‌شده"
                  srcDoc={getSalesInvoicePrintDocument(false, salesInvoiceConfirmation)}
                />
              </main>
              <footer className="sales-invoice-confirmation-footer" aria-label="عملیات فاکتور ثبت‌شده">
                <button type="button" onClick={closeSavedSalesInvoice}>
                  <span aria-hidden="true">×</span>
                  بستن
                </button>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-controls="sales-invoice-share-sheet"
                  aria-expanded={salesInvoiceShareOpen}
                  onClick={() => setSalesInvoiceShareOpen(true)}
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <circle cx="18" cy="5" r="2.5" />
                    <circle cx="6" cy="12" r="2.5" />
                    <circle cx="18" cy="19" r="2.5" />
                    <path d="m8.2 10.8 7.5-4.4m-7.5 6.8 7.5 4.4" />
                  </svg>
                  ارسال
                </button>
                <button
                  type="button"
                  onClick={() => editSavedSalesInvoice(salesInvoiceConfirmation)}
                >
                  <span aria-hidden="true">✎</span>
                  اصلاح فاکتور
                </button>
                <div className="sales-invoice-confirm-payment">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-controls="sales-invoice-payment-menu"
                    aria-expanded={salesInvoicePaymentMenuOpen}
                    onClick={() => setSalesInvoicePaymentMenuOpen((open) => !open)}
                  >
                    <span aria-hidden="true">＋</span>
                    ثبت پرداختی
                  </button>
                  {salesInvoicePaymentMenuOpen && (
                    <div
                      id="sales-invoice-payment-menu"
                      className="sales-invoice-payment-menu"
                      role="menu"
                      aria-label="روش ثبت پرداختی"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        disabled={salesInvoiceRemainingTotal === 0}
                        onClick={() => {
                          setSalesInvoicePaymentMenuOpen(false)
                          openSalesInvoiceReceiptForm()
                        }}
                      >
                        <span aria-hidden="true">▱</span>
                        ثبت دریافتی
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setSalesInvoicePaymentMenuOpen(false)
                          setNotice('ثبت چک از فاکتور فروش در مرحلهٔ بعدی فعال می‌شود.')
                          window.setTimeout(() => setNotice(''), 3000)
                        }}
                      >
                        <span aria-hidden="true">▤</span>
                        ثبت چک
                      </button>
                    </div>
                  )}
                </div>
                <div className="sales-invoice-confirm-more">
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    aria-controls="sales-invoice-more-menu"
                    aria-expanded={salesInvoiceMoreOpen}
                    onClick={() => setSalesInvoiceMoreOpen((open) => !open)}
                  >
                    <span aria-hidden="true">⋮</span>
                    بیشتر
                  </button>
                </div>
              </footer>
              {salesInvoiceShareOpen && (
                <div
                  className="sales-invoice-share-backdrop"
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) setSalesInvoiceShareOpen(false)
                  }}
                >
                  <section
                    id="sales-invoice-share-sheet"
                    className="sales-invoice-share-sheet"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="sales-invoice-share-title"
                  >
                    <div className="sales-invoice-share-handle" aria-hidden="true" />
                    <header className="sales-invoice-share-header">
                      <span className="sales-invoice-share-mark" aria-hidden="true">↗</span>
                      <div>
                        <h2 id="sales-invoice-share-title">اشتراک‌گذاری فاکتور</h2>
                        <p>فاکتور {salesInvoiceConfirmation.number}</p>
                      </div>
                      <button
                        type="button"
                        aria-label="بستن پنجرهٔ اشتراک‌گذاری"
                        onClick={() => setSalesInvoiceShareOpen(false)}
                      >
                        ×
                      </button>
                    </header>
                    <div className="sales-invoice-share-options">
                      <button
                        type="button"
                        onClick={() => {
                          setSalesInvoiceShareOpen(false)
                          void shareSavedSalesInvoice()
                        }}
                      >
                        <span className="share-icon image" aria-hidden="true">➤</span>
                        <span>اشتراک‌گذاری خلاصهٔ فاکتور</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showSalesInvoiceShareNotice('ارسال فاکتور به‌صورت تصویر هنوز فعال نشده است.')}
                      >
                        <span className="share-icon attachment" aria-hidden="true">⌁</span>
                        <span>ارسال به‌صورت تصویر</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showSalesInvoiceShareNotice('ارسال تصویر با کیفیت اصلی هنوز فعال نشده است.')}
                      >
                        <span className="share-icon attachment" aria-hidden="true">♧</span>
                        <span>ارسال به‌صورت تصویر (با کیفیت)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSalesInvoiceShareOpen(false)
                          printSavedSalesInvoice()
                        }}
                      >
                        <span className="share-icon pdf" aria-hidden="true">PDF</span>
                        <span>چاپ یا ذخیرهٔ فاکتور به‌صورت PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showSalesInvoiceShareNotice('ارسال PDF تک‌صفحه‌ای هنوز فعال نشده است.')}
                      >
                        <span className="share-icon page" aria-hidden="true">▣</span>
                        <span>ارسال PDF در یک صفحه</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showSalesInvoiceShareNotice('چاپ مستقیم با دستگاه فیش‌پرینتر هنوز فعال نشده است.')}
                      >
                        <span className="share-icon printer" aria-hidden="true">▣</span>
                        <span>چاپ با دستگاه فیش‌پرینتر</span>
                      </button>
                    </div>
                    <footer className="sales-invoice-share-footer">
                      <button
                        type="button"
                        onClick={() => showSalesInvoiceShareNotice('ارسال پیامک فاکتور پس از اتصال سرویس پیامک فعال می‌شود.')}
                      >
                        <span aria-hidden="true">▣</span>
                        ارسال به‌صورت پیامک
                      </button>
                      <button
                        type="button"
                        onClick={() => showSalesInvoiceShareNotice('تنظیمات ارسال از بخش تنظیمات فاکتور قابل تغییر است.')}
                      >
                        تنظیمات
                      </button>
                    </footer>
                  </section>
                </div>
              )}
              {salesInvoiceMoreOpen && (
                <div
                  className="sales-invoice-more-backdrop"
                  onClick={() => setSalesInvoiceMoreOpen(false)}
                >
                  <section
                    id="sales-invoice-more-menu"
                    className="sales-invoice-more-sheet"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="sales-invoice-more-title"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <header className="sales-invoice-more-sheet-header">
                      <h2 id="sales-invoice-more-title">عملیات فاکتور</h2>
                      <button
                          type="button"
                          aria-label="بستن گزینه‌های فاکتور"
                          onClick={() => setSalesInvoiceMoreOpen(false)}
                      >
                          ×
                      </button>
                    </header>
                    {[
                      { label: 'محاسبه سود فاکتور', icon: '▣' },
                      { label: 'حذف فاکتور', icon: '▤' },
                    ].map((option) => (
                      <button
                          className="sales-invoice-more-option"
                          key={option.label}
                          type="button"
                          onClick={() => {
                            setSalesInvoiceMoreOpen(false)
                            setNotice(`«${option.label}» هنوز فعال نشده است.`)
                            window.setTimeout(() => setNotice(''), 3000)
                          }}
                      >
                          <span aria-hidden="true">{option.icon}</span>
                          {option.label}
                      </button>
                    ))}
                  </section>
                </div>
              )}
              {salesInvoiceReceiptOpen && (
                <div
                  className="sales-invoice-receipt-backdrop"
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget && !salesInvoiceReceiptSaving) {
                      setSalesInvoiceReceiptOpen(false)
                    }
                  }}
                >
                  <section
                    className="sales-invoice-receipt-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="sales-invoice-receipt-title"
                  >
                    <header className="sales-invoice-receipt-header">
                      <h2 id="sales-invoice-receipt-title">ثبت دریافت وجه</h2>
                      <p>فاکتور {salesInvoiceConfirmation.number}</p>
                    </header>
                    <form onSubmit={saveSalesInvoiceReceipt}>
                      <div className="sales-invoice-receipt-tools">
                        <div className="sales-invoice-receipt-tool-group">
                          <button
                            className="sales-invoice-receipt-date"
                            type="button"
                            aria-label="انتخاب تاریخ دریافت"
                            onClick={openSalesInvoiceReceiptDatePicker}
                          >
                            <span aria-hidden="true">▦</span>
                            <span className="sales-invoice-receipt-control-copy">
                              <small>
                                تاریخ دریافت · {invoiceCalendars.find((calendar) => (
                                  calendar.id === salesInvoiceReceiptFields.calendar
                                ))?.label}
                              </small>
                              <strong>{formatCalendarDate(
                                new Date(`${salesInvoiceReceiptFields.date}T12:00:00Z`),
                                salesInvoiceReceiptFields.calendar,
                              )}</strong>
                            </span>
                            <span className="dropdown-chevron sales-invoice-receipt-control-chevron" aria-hidden="true">⌄</span>
                          </button>
                          <button
                            className="sales-invoice-receipt-time"
                            type="button"
                            aria-label="انتخاب ساعت دریافت"
                            onClick={openSalesInvoiceReceiptTimePicker}
                          >
                            <span aria-hidden="true">◷</span>
                            <span className="sales-invoice-receipt-control-copy">
                              <small>ساعت دریافت</small>
                              <strong>
                                {salesInvoiceReceiptFields.time
                                  .replace(/\d/g, (digit) => String.fromCharCode(0x06f0 + Number(digit)))}
                              </strong>
                            </span>
                            <span className="dropdown-chevron sales-invoice-receipt-control-chevron" aria-hidden="true">⌄</span>
                          </button>
                        </div>
                        <div className="sales-invoice-receipt-tool-group secondary">
                          <button
                            type="button"
                            aria-label={salesInvoiceReceiptNoteOpen ? 'بستن یادداشت' : 'افزودن یادداشت'}
                            aria-pressed={salesInvoiceReceiptNoteOpen}
                            onClick={() => setSalesInvoiceReceiptNoteOpen((open) => !open)}
                          >
                            <span aria-hidden="true">▤</span>
                            <span>توضیحات</span>
                          </button>
                          <button
                            type="button"
                            className={salesInvoiceReceiptAttachment ? 'active' : ''}
                            aria-label={salesInvoiceReceiptAttachment ? 'مدیریت پیوست دریافتی' : 'افزودن پیوست دریافتی'}
                            onClick={() => {
                              setSalesInvoiceReceiptDraftAttachment(salesInvoiceReceiptAttachment)
                              setSalesInvoiceReceiptDraftAttachmentDataUrl(salesInvoiceReceiptAttachmentDataUrl)
                              setSalesInvoiceReceiptError('')
                              setSalesInvoiceReceiptAttachmentPickerOpen(true)
                            }}
                          >
                            <span aria-hidden="true">{salesInvoiceReceiptAttachment ? '✓' : '↗'}</span>
                            <span>پیوست</span>
                          </button>
                        </div>
                      </div>
                      <div className="sales-invoice-receipt-fields">
                        <div className="sales-invoice-receipt-field">
                          <span className="sales-invoice-receipt-field-icon" aria-hidden="true">♙</span>
                          <span className="sales-invoice-receipt-field-label">شخص:</span>
                          <div className="sales-invoice-receipt-person">
                            <strong>{salesInvoiceConfirmation.buyerName}</strong>
                            <small>
                              {salesInvoiceConfirmation.personId
                                ? `ماندهٔ حساب: ${formatPersonBalance(
                                  allPeople.find((person) => person.id === salesInvoiceConfirmation.personId)?.balance ?? 0,
                                )} ریال`
                                : 'فاکتور بدون طرف‌حساب ثبت شده است'}
                            </small>
                          </div>
                        </div>
                        <label className="sales-invoice-receipt-field">
                          <span className="sales-invoice-receipt-field-icon money" aria-hidden="true">＄</span>
                          <span className="sales-invoice-receipt-field-label">مبلغ:</span>
                          <span className="sales-invoice-receipt-input-wrap">
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="off"
                              aria-label="مبلغ دریافتی به ریال"
                              value={formatAccountBalanceInput(salesInvoiceReceiptFields.amount)}
                              onChange={(event) => setSalesInvoiceReceiptFields((fields) => ({
                                ...fields,
                                amount: formatAccountBalanceInput(event.target.value),
                              }))}
                              required
                            />
                            <small>ریال</small>
                          </span>
                        </label>
                        <label className="sales-invoice-receipt-field">
                          <span className="sales-invoice-receipt-field-icon bank" aria-hidden="true">▤</span>
                          <span className="sales-invoice-receipt-field-label">واریز به:</span>
                          <span className="sales-invoice-receipt-account-wrap">
                            <select
                              aria-label="حساب مقصد"
                              value={salesInvoiceReceiptFields.accountId}
                              onChange={(event) => setSalesInvoiceReceiptFields((fields) => ({
                                ...fields,
                                accountId: event.target.value,
                              }))}
                              required
                            >
                              <option value="">انتخاب حساب مقصد</option>
                              {storedAccounts.accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                  {account.kind === 'بانکی' ? account.bankName || account.name : account.name}
                                </option>
                              ))}
                            </select>
                            {storedAccounts.accounts.length > 0 ? (
                              <small>
                                موجودی:{' '}
                                {formatPersonBalance(
                                  storedAccounts.accounts.find((account) => account.id === salesInvoiceReceiptFields.accountId)?.balance ?? 0,
                                )} ریال
                              </small>
                            ) : (
                              <small className="sales-invoice-receipt-no-account">
                                برای ثبت دریافتی، ابتدا در بخش حساب‌ها یک حساب یا صندوق اضافه کنید.
                              </small>
                            )}
                          </span>
                        </label>
                        {salesInvoiceReceiptNoteOpen && (
                          <label className="sales-invoice-receipt-note">
                            <span>یادداشت دریافتی</span>
                            <textarea
                              maxLength={500}
                              value={salesInvoiceReceiptFields.note}
                              onChange={(event) => setSalesInvoiceReceiptFields((fields) => ({
                                ...fields,
                                note: event.target.value,
                              }))}
                              placeholder="توضیحات دریافت وجه..."
                              rows={2}
                            />
                          </label>
                        )}
                        {salesInvoiceReceiptAttachment && (
                          <p className="sales-invoice-receipt-attachment-name">
                            پیوست: {salesInvoiceReceiptAttachment.name}
                            <button
                              type="button"
                              aria-label="حذف پیوست"
                              onClick={() => {
                                setSalesInvoiceReceiptAttachment(null)
                                setSalesInvoiceReceiptAttachmentDataUrl('')
                              }}
                            >
                              ×
                            </button>
                          </p>
                        )}
                        {salesInvoiceReceiptError && (
                          <p className="sales-invoice-receipt-error" role="alert">
                            {salesInvoiceReceiptError}
                          </p>
                        )}
                      </div>
                      <footer className="sales-invoice-receipt-actions">
                        <button
                          className="cancel"
                          type="button"
                          disabled={salesInvoiceReceiptSaving}
                          onClick={() => setSalesInvoiceReceiptOpen(false)}
                        >
                          <span aria-hidden="true">×</span>
                          لغو
                        </button>
                        <button
                          className="confirm"
                          type="submit"
                          disabled={salesInvoiceReceiptSaving || storedAccounts.accounts.length === 0}
                        >
                          <span aria-hidden="true">{salesInvoiceReceiptSaving ? '◌' : '✓'}</span>
                          {salesInvoiceReceiptSaving ? 'در حال ثبت…' : 'تأیید و ثبت دریافتی'}
                        </button>
                      </footer>
                    </form>
                  </section>
                </div>
              )}
              {salesInvoiceReceiptDatePickerOpen && (
                <div
                  className="sales-invoice-date-backdrop sales-invoice-receipt-picker-backdrop"
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) setSalesInvoiceReceiptDatePickerOpen(false)
                  }}
                >
                  <section
                    className="sales-invoice-date-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="sales-invoice-receipt-date-title"
                  >
                    <header className="sales-invoice-date-heading">
                      <div>
                        <span>تاریخ ثبت دریافتی</span>
                        <h2 id="sales-invoice-receipt-date-title">انتخاب تاریخ</h2>
                      </div>
                      <button
                        type="button"
                        aria-label="بستن انتخاب تاریخ دریافتی"
                        onClick={() => setSalesInvoiceReceiptDatePickerOpen(false)}
                      >
                        ×
                      </button>
                    </header>
                    <div className="sales-invoice-date-previews" aria-label="تاریخ در سه تقویم">
                      {invoiceCalendars.map((calendar) => (
                        <div key={calendar.id}>
                          <span>{calendar.label}</span>
                          <strong>{formatCalendarDate(salesInvoiceReceiptDraftDate, calendar.id)}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="sales-invoice-calendar-tabs" role="tablist" aria-label="نوع تقویم">
                      {invoiceCalendars.map((calendar) => (
                        <button
                          key={calendar.id}
                          type="button"
                          role="tab"
                          aria-selected={salesInvoiceReceiptDraftCalendar === calendar.id}
                          className={salesInvoiceReceiptDraftCalendar === calendar.id ? 'active' : ''}
                          onClick={() => {
                            setSalesInvoiceReceiptDraftCalendar(calendar.id)
                            setSalesInvoiceReceiptVisibleMonth(salesInvoiceReceiptDraftDate)
                          }}
                        >
                          {calendar.label}
                        </button>
                      ))}
                    </div>
                    <div className="sales-invoice-calendar-month">
                      <button
                        type="button"
                        aria-label="ماه قبل"
                        onClick={() => setSalesInvoiceReceiptVisibleMonth((month) => (
                          getAdjacentCalendarMonthDate(month, salesInvoiceReceiptDraftCalendar, -1)
                        ))}
                      >
                        ‹
                      </button>
                      <strong>
                        {new Intl.DateTimeFormat(`fa-IR-u-ca-${salesInvoiceReceiptDraftCalendar}-nu-arabext`, {
                          month: 'long',
                          year: 'numeric',
                          timeZone: 'UTC',
                        }).format(salesInvoiceReceiptVisibleMonth)}
                      </strong>
                      <button
                        type="button"
                        aria-label="ماه بعد"
                        onClick={() => setSalesInvoiceReceiptVisibleMonth((month) => (
                          getAdjacentCalendarMonthDate(month, salesInvoiceReceiptDraftCalendar, 1)
                        ))}
                      >
                        ›
                      </button>
                    </div>
                    <div className="sales-invoice-calendar-grid" role="grid" aria-label="روزهای ماه">
                      {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day, index) => (
                        <span className="weekday" role="columnheader" key={`${day}-${index}`}>{day}</span>
                      ))}
                      {(() => {
                        const dates = getCalendarMonthDates(
                          salesInvoiceReceiptVisibleMonth,
                          salesInvoiceReceiptDraftCalendar,
                        )
                        const firstDayOffset = (dates[0].getUTCDay() + 1) % 7
                        const today = getIranDateValue(now)
                        const selectedDate = normalizeUtcDate(salesInvoiceReceiptDraftDate)
                          .toISOString()
                          .slice(0, 10)

                        return (
                          <>
                            {Array.from({ length: firstDayOffset }, (_, index) => (
                              <span className="empty-day" role="gridcell" key={`empty-${index}`} />
                            ))}
                            {dates.map((date) => {
                              const dateKey = date.toISOString().slice(0, 10)
                              const isSelected = dateKey === selectedDate
                              return (
                                <button
                                  className={[
                                    dateKey === today ? 'today' : '',
                                    isSelected ? 'selected' : '',
                                  ].filter(Boolean).join(' ')}
                                  type="button"
                                  role="gridcell"
                                  aria-label={formatCalendarDate(date, salesInvoiceReceiptDraftCalendar, true)}
                                  aria-pressed={isSelected}
                                  key={dateKey}
                                  onClick={() => setSalesInvoiceReceiptDraftDate(date)}
                                >
                                  {new Intl.DateTimeFormat(
                                    `fa-IR-u-ca-${salesInvoiceReceiptDraftCalendar}-nu-arabext`,
                                    { day: 'numeric', timeZone: 'UTC' },
                                  ).format(date)}
                                </button>
                              )
                            })}
                          </>
                        )
                      })()}
                    </div>
                    <div className="sales-invoice-date-actions">
                      <button
                        className="today-action"
                        type="button"
                        onClick={() => {
                          const today = normalizeUtcDate(now)
                          setSalesInvoiceReceiptDraftDate(today)
                          setSalesInvoiceReceiptVisibleMonth(today)
                        }}
                      >
                        امروز
                      </button>
                      <div>
                        <button type="button" onClick={() => setSalesInvoiceReceiptDatePickerOpen(false)}>
                          انصراف
                        </button>
                        <button className="confirm" type="button" onClick={saveSalesInvoiceReceiptDate}>
                          تأیید تاریخ
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              )}
              {salesInvoiceReceiptTimePickerOpen && (
                <div
                  className="sales-invoice-date-backdrop sales-invoice-time-backdrop sales-invoice-receipt-picker-backdrop"
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) setSalesInvoiceReceiptTimePickerOpen(false)
                  }}
                >
                  <section
                    className={`sales-invoice-date-dialog sales-invoice-time-dialog ${salesInvoiceReceiptTimeMode === 'keyboard' ? 'keyboard-mode' : ''}`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="sales-invoice-receipt-time-title"
                  >
                    <header className="sales-invoice-date-heading">
                      <div>
                        <span>زمان ثبت دریافتی · ۲۴ ساعته</span>
                        <h2 id="sales-invoice-receipt-time-title">انتخاب ساعت</h2>
                      </div>
                      <button
                        type="button"
                        aria-label="بستن انتخاب ساعت دریافتی"
                        onClick={() => setSalesInvoiceReceiptTimePickerOpen(false)}
                      >
                        ×
                      </button>
                    </header>
                    {salesInvoiceReceiptTimeMode === 'clock' && (
                      <div className="sales-invoice-time-display" aria-label="زمان انتخاب‌شده">
                        <button
                          className={salesInvoiceReceiptTimeField === 'hour' ? 'active' : ''}
                          type="button"
                          aria-label="انتخاب ساعت"
                          onClick={() => setSalesInvoiceReceiptTimeField('hour')}
                        >
                          {formatClockNumber(salesInvoiceReceiptDraftTime.hours).padStart(2, '۰')}
                        </button>
                        <span aria-hidden="true">:</span>
                        <button
                          className={salesInvoiceReceiptTimeField === 'minute' ? 'active' : ''}
                          type="button"
                          aria-label="انتخاب دقیقه"
                          onClick={() => setSalesInvoiceReceiptTimeField('minute')}
                        >
                          {formatClockNumber(salesInvoiceReceiptDraftTime.minutes).padStart(2, '۰')}
                        </button>
                      </div>
                    )}
                    {salesInvoiceReceiptTimeMode === 'clock' ? (
                      <div className={`sales-invoice-clock-face ${salesInvoiceReceiptTimeField === 'minute' ? 'minute-mode' : ''}`}>
                        {salesInvoiceReceiptTimeField === 'hour'
                          ? Array.from({ length: 24 }, (_, hour) => {
                            const clockValue = hour % 12
                            const ring = hour < 12 ? 41 : 26
                            const angle = (clockValue * 30 - 90) * Math.PI / 180
                            const isSelected = salesInvoiceReceiptDraftTime.hours === hour
                            return (
                              <button
                                className={`${hour >= 12 ? 'inner' : ''} ${isSelected ? 'selected' : ''}`}
                                type="button"
                                aria-label={`${formatClockNumber(hour).padStart(2, '۰')} ساعت`}
                                aria-pressed={isSelected}
                                key={hour}
                                style={{
                                  left: `${50 + Math.cos(angle) * ring}%`,
                                  top: `${50 + Math.sin(angle) * ring}%`,
                                }}
                                onClick={() => {
                                  setSalesInvoiceReceiptDraftTime((time) => ({ ...time, hours: hour }))
                                  setSalesInvoiceReceiptTimeField('minute')
                                }}
                              >
                                {formatClockNumber(hour).padStart(2, '۰')}
                              </button>
                            )
                          })
                          : (
                            <div
                              className="sales-invoice-minute-dial"
                              role="slider"
                              tabIndex={0}
                              aria-label="انتخاب دقیقه"
                              aria-valuemin={0}
                              aria-valuemax={59}
                              aria-valuenow={salesInvoiceReceiptDraftTime.minutes}
                              aria-valuetext={`${formatClockNumber(salesInvoiceReceiptDraftTime.minutes).padStart(2, '۰')} دقیقه`}
                              onPointerDown={(event) => {
                                const bounds = event.currentTarget.getBoundingClientRect()
                                const minutes = getClockMinuteFromPoint(
                                  event.clientX - bounds.left,
                                  event.clientY - bounds.top,
                                  bounds.width,
                                  bounds.height,
                                )
                                setSalesInvoiceReceiptDraftTime((time) => ({ ...time, minutes }))
                                event.currentTarget.focus()
                              }}
                              onPointerMove={(event) => {
                                if (event.buttons === 0) return
                                const bounds = event.currentTarget.getBoundingClientRect()
                                const minutes = getClockMinuteFromPoint(
                                  event.clientX - bounds.left,
                                  event.clientY - bounds.top,
                                  bounds.width,
                                  bounds.height,
                                )
                                setSalesInvoiceReceiptDraftTime((time) => (
                                  time.minutes === minutes ? time : { ...time, minutes }
                                ))
                              }}
                              onKeyDown={(event) => {
                                const minute = salesInvoiceReceiptDraftTime.minutes
                                let nextMinute: number | null = null
                                if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
                                  nextMinute = (minute + 1) % 60
                                } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
                                  nextMinute = (minute + 59) % 60
                                } else if (event.key === 'Home') {
                                  nextMinute = 0
                                } else if (event.key === 'End') {
                                  nextMinute = 59
                                }
                                if (nextMinute !== null) {
                                  event.preventDefault()
                                  setSalesInvoiceReceiptDraftTime((time) => ({ ...time, minutes: nextMinute }))
                                }
                              }}
                            >
                              {Array.from({ length: 60 }, (_, minute) => {
                                const angle = (minute * 6 - 90) * Math.PI / 180
                                const isSelected = salesInvoiceReceiptDraftTime.minutes === minute
                                return (
                                  <span
                                    aria-hidden="true"
                                    className={[
                                      'sales-invoice-clock-minute-tick',
                                      minute % 5 === 0 ? 'major' : '',
                                      isSelected ? 'selected' : '',
                                    ].filter(Boolean).join(' ')}
                                    key={minute}
                                    style={{
                                      left: `${50 + Math.cos(angle) * 43}%`,
                                      top: `${50 + Math.sin(angle) * 43}%`,
                                    }}
                                  >
                                    {minute % 5 === 0 ? formatClockNumber(minute).padStart(2, '۰') : ''}
                                  </span>
                                )
                              })}
                              <span
                                className="sales-invoice-minute-hand"
                                aria-hidden="true"
                                style={{
                                  transform: `translateX(-50%) rotate(${salesInvoiceReceiptDraftTime.minutes * 6}deg)`,
                                }}
                              />
                            </div>
                          )}
                        <span className="sales-invoice-clock-center" aria-hidden="true" />
                      </div>
                    ) : (
                      <div className="sales-invoice-time-keyboard" aria-label="ورود زمان با صفحه‌کلید">
                        <label className={salesInvoiceReceiptTimeField === 'hour' ? 'active' : ''}>
                          <input
                            ref={salesInvoiceReceiptHourInputRef}
                            aria-label="ساعت دریافتی"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9۰-۹٠-٩]*"
                            maxLength={2}
                            value={formatClockNumber(salesInvoiceReceiptDraftTime.hours).padStart(2, '۰')}
                            onFocus={(event) => {
                              setSalesInvoiceReceiptTimeField('hour')
                              event.currentTarget.select()
                            }}
                            onChange={(event) => updateSalesInvoiceReceiptTimeField('hour', event.target.value)}
                          />
                          <span>ساعت</span>
                        </label>
                        <span className="separator" aria-hidden="true">:</span>
                        <label className={salesInvoiceReceiptTimeField === 'minute' ? 'active' : ''}>
                          <input
                            ref={salesInvoiceReceiptMinuteInputRef}
                            aria-label="دقیقه دریافتی"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9۰-۹٠-٩]*"
                            maxLength={2}
                            value={formatClockNumber(salesInvoiceReceiptDraftTime.minutes).padStart(2, '۰')}
                            onFocus={(event) => {
                              setSalesInvoiceReceiptTimeField('minute')
                              event.currentTarget.select()
                            }}
                            onChange={(event) => updateSalesInvoiceReceiptTimeField('minute', event.target.value)}
                          />
                          <span>دقیقه</span>
                        </label>
                      </div>
                    )}
                    <div className="sales-invoice-date-actions sales-invoice-time-actions">
                      <button
                        className="sales-invoice-time-mode"
                        type="button"
                        aria-label={salesInvoiceReceiptTimeMode === 'clock' ? 'ورود با صفحه‌کلید' : 'نمایش ساعت عقربه‌ای'}
                        onClick={() => setSalesInvoiceReceiptTimeMode((mode) => (
                          mode === 'clock' ? 'keyboard' : 'clock'
                        ))}
                      >
                        {salesInvoiceReceiptTimeMode === 'clock' ? '⌨' : '◷'}
                      </button>
                      <div>
                        <button type="button" onClick={() => setSalesInvoiceReceiptTimePickerOpen(false)}>
                          انصراف
                        </button>
                        <button className="confirm" type="button" onClick={saveSalesInvoiceReceiptTime}>
                          تأیید ساعت
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              )}
              {salesInvoiceReceiptAttachmentPickerOpen && (
                <div
                  className="sales-invoice-date-backdrop sales-invoice-attachment-backdrop sales-invoice-receipt-picker-backdrop"
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) closeSalesInvoiceReceiptAttachmentPicker()
                  }}
                >
                  <section
                    className="sales-invoice-date-dialog sales-invoice-attachment-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="sales-invoice-receipt-attachment-title"
                  >
                    <header className="sales-invoice-date-heading">
                      <div>
                        <span>تصویر سند دریافتی</span>
                        <h2 id="sales-invoice-receipt-attachment-title">پیوست عکس</h2>
                      </div>
                      <button
                        type="button"
                        aria-label="بستن پنجره پیوست دریافتی"
                        onClick={closeSalesInvoiceReceiptAttachmentPicker}
                      >
                        ×
                      </button>
                    </header>
                    <div className="sales-invoice-attachment-content">
                      <div className="sales-invoice-attachment-choices">
                        <button type="button" onClick={() => salesInvoiceReceiptGalleryInputRef.current?.click()}>
                          <span aria-hidden="true">▧</span>
                          <strong>انتخاب از گالری</strong>
                          <small>عکس موجود در گوشی یا دستگاه</small>
                        </button>
                        <button type="button" onClick={() => salesInvoiceReceiptCameraInputRef.current?.click()}>
                          <span aria-hidden="true">◎</span>
                          <strong>گرفتن عکس</strong>
                          <small>باز کردن دوربین دستگاه</small>
                        </button>
                      </div>
                      <input
                        ref={salesInvoiceReceiptGalleryInputRef}
                        className="sales-invoice-file-input"
                        type="file"
                        accept="image/*"
                        aria-label="انتخاب عکس دریافتی از گالری"
                        onChange={handleSalesInvoiceReceiptAttachmentChange}
                      />
                      <input
                        ref={salesInvoiceReceiptCameraInputRef}
                        className="sales-invoice-file-input"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        aria-label="گرفتن عکس پیوست دریافتی با دوربین"
                        onChange={handleSalesInvoiceReceiptAttachmentChange}
                      />
                      {salesInvoiceReceiptError && (
                        <p className="sales-invoice-attachment-error" role="alert">
                          {salesInvoiceReceiptError}
                        </p>
                      )}
                      {salesInvoiceReceiptDraftAttachment && salesInvoiceReceiptDraftAttachmentDataUrl ? (
                        <div className="sales-invoice-attachment-preview">
                          <img
                            src={salesInvoiceReceiptDraftAttachmentDataUrl}
                            alt={`پیش‌نمایش ${salesInvoiceReceiptDraftAttachment.name}`}
                          />
                          <div className="sales-invoice-attachment-file">
                            <strong>{salesInvoiceReceiptDraftAttachment.name || 'تصویر پیوست'}</strong>
                            <small>
                              {new Intl.NumberFormat('fa-IR').format(
                                Math.max(1, Math.ceil(salesInvoiceReceiptDraftAttachment.size / 1024)),
                              )} کیلوبایت
                            </small>
                          </div>
                        </div>
                      ) : (
                        <div className="sales-invoice-attachment-empty">
                          <span aria-hidden="true">▧</span>
                          <strong>هنوز عکسی انتخاب نشده</strong>
                          <small>از گالری انتخاب کن یا با دوربین عکس بگیر.</small>
                        </div>
                      )}
                    </div>
                    <div className="sales-invoice-date-actions sales-invoice-attachment-actions">
                      <button
                        className="sales-invoice-attachment-remove"
                        type="button"
                        aria-label="حذف عکس پیوست دریافتی"
                        disabled={!salesInvoiceReceiptDraftAttachment}
                        onClick={() => {
                          setSalesInvoiceReceiptDraftAttachment(null)
                          setSalesInvoiceReceiptDraftAttachmentDataUrl('')
                          setSalesInvoiceReceiptError('')
                        }}
                      >
                        <span aria-hidden="true">×</span>
                        حذف
                      </button>
                      <div className="sales-invoice-attachment-actions-group">
                        <button
                          className="sales-invoice-attachment-cancel"
                          type="button"
                          onClick={closeSalesInvoiceReceiptAttachmentPicker}
                        >
                          لغو
                        </button>
                        <button
                          className="confirm"
                          type="button"
                          disabled={Boolean(salesInvoiceReceiptDraftAttachment && !salesInvoiceReceiptDraftAttachmentDataUrl)}
                          onClick={confirmSalesInvoiceReceiptAttachment}
                        >
                          تأیید پیوست
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>
          ) : (
          <div className="sales-invoice-page">
            <header className="sales-invoice-header">
              <button
                className="sales-invoice-back"
                type="button"
                aria-label={salesInvoiceEditingInvoice
                  ? 'لغو اصلاح فاکتور'
                  : 'بازگشت به داشبورد'}
                onClick={() => {
                  if (salesInvoiceEditingInvoice) {
                    setSalesInvoiceConfirmation(salesInvoiceEditingInvoice)
                    setSalesInvoiceEditingId(null)
                    setSalesInvoiceSaveError('')
                  } else {
                    setActiveTab('خانه')
                  }
                }}
              >
                ‹
              </button>
              <div className="sales-invoice-heading">
                <span>
                  {purchaseInvoiceMode
                    ? 'ثبت سند خرید'
                    : returnSalesInvoiceMode
                      ? 'ثبت سند برگشت از فروش'
                      : returnPurchaseInvoiceMode
                        ? 'ثبت سند برگشت به خرید'
                      : salesInvoiceEditingInvoice ? 'اصلاح سند فروش' : 'ثبت سند فروش'}
                </span>
                <h1>
                  {purchaseInvoiceMode
                    ? 'فاکتور خرید'
                    : returnSalesInvoiceMode
                      ? 'فاکتور برگشت از فروش'
                      : returnPurchaseInvoiceMode
                        ? 'فاکتور برگشت به خرید'
                      : salesInvoiceEditingInvoice ? 'اصلاح فاکتور فروش' : 'فاکتور فروش'}
                </h1>
              </div>
              <div className="sales-invoice-number">
                <span>شماره</span>
                <strong>
                  {purchaseInvoiceMode
                    ? purchaseInvoiceNumber
                    : returnSalesInvoiceMode
                      ? returnSalesInvoiceNumber
                      : returnPurchaseInvoiceMode ? returnPurchaseInvoiceNumber : salesInvoiceNumber}
                </strong>
              </div>
              <button
                className="sales-invoice-settings"
                type="button"
                aria-label="تنظیمات فاکتور"
                onClick={openSalesInvoiceSettings}
              >
                ⚙
              </button>
            </header>

            <div className="sales-invoice-content">
              <section
                className="sales-invoice-party"
                aria-label={returnSalesInvoiceMode
                    ? 'طرف حساب فاکتور برگشت از فروش'
                    : returnPurchaseInvoiceMode
                      ? 'تأمین‌کننده فاکتور برگشت به خرید'
                      : purchaseInvoiceMode ? 'تأمین‌کننده فاکتور خرید' : 'طرف حساب فاکتور'}
              >
                <span className="sales-invoice-party-label">
                  {purchaseInvoicePartyMode ? 'تأمین‌کننده' : 'طرف حساب'}
                </span>
                <div className="sales-invoice-party-control">
                  <label className="sales-invoice-party-search">
                    <input
                      type="search"
                      role="combobox"
                      aria-label={purchaseInvoicePartyMode
                        ? 'جست‌وجو و انتخاب تأمین‌کننده'
                        : returnSalesInvoiceMode
                          ? 'جست‌وجو و انتخاب مشتری فاکتور برگشت'
                          : 'جست‌وجو و انتخاب طرف حساب'}
                      aria-required="true"
                      aria-invalid={Boolean(salesInvoicePartyError)}
                      aria-describedby={salesInvoicePartyError ? 'sales-invoice-party-error' : undefined}
                      aria-autocomplete="list"
                      aria-expanded={salesInvoicePersonOptionsOpen}
                      aria-controls="sales-invoice-person-options"
                      value={salesInvoicePersonSearch || selectedSalesInvoicePerson?.name || ''}
                      placeholder={purchaseInvoicePartyMode
                        ? 'نام، شماره تماس یا کد تأمین‌کننده'
                        : returnSalesInvoiceMode
                          ? 'نام، شماره تماس یا کد مشتری'
                          : 'نام، شماره تماس یا کد طرف حساب'}
                      onFocus={() => {
                        setSalesInvoicePersonSearch('')
                        setSalesInvoicePersonOptionsOpen(true)
                      }}
                      onChange={(event) => {
                        setSalesInvoicePerson('')
                        setSalesInvoicePersonSearch(event.target.value)
                        setSalesInvoicePersonOptionsOpen(true)
                      }}
                      onBlur={() => window.setTimeout(() => setSalesInvoicePersonOptionsOpen(false), 120)}
                    />
                    {salesInvoicePersonOptionsOpen && (
                      <div
                        className="sales-invoice-person-options"
                        id="sales-invoice-person-options"
                        role="listbox"
                        aria-label={purchaseInvoicePartyMode
                          ? 'نتایج جست‌وجوی تأمین‌کننده'
                          : returnSalesInvoiceMode
                            ? 'نتایج جست‌وجوی مشتری'
                            : 'نتایج جست‌وجوی طرف حساب'}
                      >
                        {filteredSalesInvoicePeople.map((person) => (
                          <button
                            key={person.id}
                            type="button"
                            role="option"
                            aria-selected={salesInvoicePerson === person.id}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                              setSalesInvoicePerson(person.id)
                              setSalesInvoicePartyError('')
                              setSalesInvoicePersonSearch('')
                              setSalesInvoicePersonOptionsOpen(false)
                              setSalesInvoiceSaveError('')
                            }}
                          >
                            <strong>{person.name}</strong>
                            <small>{person.phone || 'بدون شماره تماس'} · کد {person.code}</small>
                          </button>
                        ))}
                        {filteredSalesInvoicePeople.length === 0 && (
                          <p>
                            {purchaseInvoicePartyMode
                              ? 'تأمین‌کننده‌ای با این مشخصات پیدا نشد.'
                              : returnSalesInvoiceMode
                                ? 'مشتری‌ای با این مشخصات پیدا نشد.'
                                : 'طرف حسابی با این مشخصات پیدا نشد.'}
                          </p>
                        )}
                      </div>
                    )}
                  </label>
                  <button
                    type="button"
                    aria-label={purchaseInvoicePartyMode
                      ? 'نمایش فهرست تأمین‌کنندگان'
                      : returnSalesInvoiceMode ? 'نمایش فهرست مشتریان' : 'نمایش فهرست اشخاص'}
                    aria-haspopup="dialog"
                    aria-expanded={salesInvoicePersonPickerOpen}
                    onClick={() => {
                      setSalesInvoicePersonPickerSearch('')
                      setSalesInvoicePersonPickerStatus('همه')
                      setSalesInvoicePersonPickerGroup(allAccountReportGroups)
                      setSalesInvoicePersonPickerGroupFormOpen(false)
                      setSalesInvoicePersonPickerGroupName('')
                      setSalesInvoicePersonPickerGroupError('')
                      setSalesInvoicePersonPickerOpen(true)
                    }}
                  >
                    +
                  </button>
                </div>
                {salesInvoicePartyError && (
                  <small id="sales-invoice-party-error" className="sales-invoice-party-error" role="alert">
                    {salesInvoicePartyError}
                  </small>
                )}
              </section>

              <section
                className="sales-invoice-meta"
                aria-label={returnSalesInvoiceMode
                    ? 'اطلاعات فاکتور برگشت از فروش'
                    : returnPurchaseInvoiceMode
                      ? 'اطلاعات فاکتور برگشت به خرید'
                      : purchaseInvoiceMode ? 'اطلاعات فاکتور خرید' : 'اطلاعات فاکتور فروش'}
              >
                <button
                  className="sales-invoice-meta-pill sales-invoice-date-trigger"
                  type="button"
                  aria-label={returnPurchaseInvoiceMode
                    ? 'انتخاب تاریخ فاکتور برگشت به خرید'
                    : returnSalesInvoiceMode
                      ? 'انتخاب تاریخ فاکتور برگشت از فروش'
                      : purchaseInvoiceMode ? 'انتخاب تاریخ فاکتور خرید' : 'انتخاب تاریخ فاکتور'}
                  onClick={openSalesInvoiceDatePicker}
                >
                  <span aria-hidden="true">▦</span>
                  <strong>{formatCalendarDate(salesInvoiceDate, salesInvoiceCalendar)}</strong>
                  <small>{invoiceCalendars.find((calendar) => calendar.id === salesInvoiceCalendar)?.label}</small>
                </button>
                <button
                  className="sales-invoice-meta-pill sales-invoice-time-trigger"
                  type="button"
                  aria-label={returnPurchaseInvoiceMode
                    ? 'انتخاب ساعت فاکتور برگشت به خرید'
                    : returnSalesInvoiceMode
                      ? 'انتخاب ساعت فاکتور برگشت از فروش'
                      : purchaseInvoiceMode ? 'انتخاب ساعت فاکتور خرید' : 'انتخاب ساعت فاکتور'}
                  onClick={openSalesInvoiceTimePicker}
                >
                  <span aria-hidden="true">◷</span>
                  <strong>{formatClockNumber(salesInvoiceTime.hours).padStart(2, '۰')}:{formatClockNumber(salesInvoiceTime.minutes).padStart(2, '۰')}</strong>
                </button>
                <button
                  className={salesInvoiceNote ? 'active' : ''}
                  type="button"
                  aria-label={returnSalesInvoiceMode
                    ? 'یادداشت فاکتور برگشت از فروش'
                    : returnPurchaseInvoiceMode
                      ? 'یادداشت فاکتور برگشت به خرید'
                      : purchaseInvoiceMode ? 'یادداشت فاکتور خرید' : 'یادداشت فاکتور فروش'}
                  aria-expanded={Boolean(salesInvoiceNote)}
                  onClick={() => setSalesInvoiceNote(salesInvoiceNote ? '' : ' ')}
                >
                  <span aria-hidden="true">▤</span>
                  یادداشت
                </button>
                <button
                  className={salesInvoiceAttachment ? 'active' : ''}
                  type="button"
                  aria-label={returnInvoiceMode
                    ? salesInvoiceAttachment
                      ? `مدیریت پیوست فاکتور ${returnSalesInvoiceMode ? 'برگشت از فروش' : 'برگشت به خرید'}`
                      : `افزودن پیوست به فاکتور ${returnSalesInvoiceMode ? 'برگشت از فروش' : 'برگشت به خرید'}`
                    : salesInvoiceAttachment ? 'مدیریت پیوست' : 'افزودن پیوست'}
                  aria-haspopup="dialog"
                  aria-expanded={salesInvoiceAttachmentPickerOpen}
                  onClick={openSalesInvoiceAttachmentPicker}
                >
                  <span aria-hidden="true">{salesInvoiceAttachment ? '✓' : '↗'}</span>
                  {salesInvoiceAttachment ? 'پیوست شد' : 'پیوست'}
                </button>
              </section>

              {salesInvoiceNote !== '' && (
                <textarea
                  className="sales-invoice-note"
                  aria-label={returnSalesInvoiceMode
                    ? 'یادداشت فاکتور برگشت از فروش'
                    : returnPurchaseInvoiceMode
                      ? 'یادداشت فاکتور برگشت به خرید'
                      : purchaseInvoiceMode ? 'یادداشت فاکتور خرید' : 'یادداشت فاکتور فروش'}
                  placeholder={returnSalesInvoiceMode
                    ? 'یادداشت فاکتور برگشت از فروش را بنویسید...'
                    : returnPurchaseInvoiceMode
                      ? 'یادداشت فاکتور برگشت به خرید را بنویسید...'
                      : purchaseInvoiceMode
                        ? 'یادداشت فاکتور خرید را بنویسید...'
                        : 'یادداشت فاکتور فروش را بنویسید...'}
                  value={salesInvoiceNote.trimStart()}
                  onChange={(event) => setSalesInvoiceNote(event.target.value)}
                  rows={2}
                />
              )}

              <section
                className={`sales-invoice-lines${salesInvoiceLines.length === 0 ? ' is-empty' : ''}`}
                aria-label="اقلام فاکتور"
              >
                <div className="sales-invoice-table-scroll">
                  <table className={salesInvoiceSettings.enableItemDiscount ? '' : 'without-discount'}>
                    <thead>
                      <tr>
                        <th>شرح</th>
                        <th>انبار</th>
                        <th>مقدار</th>
                        <th>فی</th>
                        {salesInvoiceSettings.enableItemDiscount && <th>تخفیف</th>}
                        <th>جمع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesInvoiceLines.length === 0 ? (
                        <tr>
                          <td colSpan={salesInvoiceSettings.enableItemDiscount ? 6 : 5}>
                            <div className="sales-invoice-empty-state">
                              <span aria-hidden="true">▤</span>
                              <strong>هنوز کالایی به فاکتور اضافه نشده</strong>
                              <small>برای شروع، از دکمهٔ «افزودن کالا» استفاده کنید.</small>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        salesInvoiceLines.map((line) => {
                          const item = storedInventoryRecords.items.find((inventoryItem) => inventoryItem.id === line.itemId)
                          if (!item) return null
                          const lineTotal = Math.max(0, (line.unitPrice ?? item.salePrice) * line.quantity - line.discount)
                          return (
                            <tr key={line.id}>
                              <td>
                                <button
                                  className="sales-invoice-remove-line"
                                  type="button"
                                  aria-label={`حذف ${item.name}`}
                                  onClick={() => setSalesInvoiceLines((lines) => lines.filter((current) => current.id !== line.id))}
                                >
                                  ×
                                </button>
                                <strong>
                                  {salesInvoiceSettings.prefixCategoryName ? `${item.category} · ` : ''}
                                  {line.description || item.name}
                                </strong>
                                <small>{item.unit} · {item.kind}</small>
                              </td>
                              <td className="sales-invoice-line-warehouse">
                                {line.warehouse ?? item.warehouse ?? (
                                  item.kind === 'خدمات' ? DEFAULT_SERVICE_WAREHOUSE : DEFAULT_INVENTORY_WAREHOUSE
                                )}
                              </td>
                              <td>
                                <div className="sales-invoice-line-quantity">
                                  <button
                                    type="button"
                                    aria-label={`کاهش مقدار ${item.name}`}
                                    disabled={line.quantity <= 1}
                                    onClick={() => setSalesInvoiceLines((lines) => lines.map((current) => (
                                      current.id === line.id
                                        ? { ...current, quantity: Math.max(1, current.quantity - 1) }
                                        : current
                                    )))}
                                  >
                                    −
                                  </button>
                                  <input
                                    aria-label={`مقدار ${item.name}`}
                                    inputMode="decimal"
                                    value={formatPersonBalance(line.quantity)}
                                    onChange={(event) => {
                                      const quantity = parsePersonBalance(event.target.value)
                                      if (quantity === null) return
                                      setSalesInvoiceLines((lines) => lines.map((current) => current.id === line.id
                                        ? { ...current, quantity: Math.max(1, quantity) }
                                        : current))
                                    }}
                                  />
                                  <button
                                    type="button"
                                    aria-label={`افزایش مقدار ${item.name}`}
                                    onClick={() => setSalesInvoiceLines((lines) => lines.map((current) => (
                                      current.id === line.id
                                        ? { ...current, quantity: current.quantity + 1 }
                                        : current
                                    )))}
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td>{formatPersonBalance(line.unitPrice ?? item.salePrice)}</td>
                              {salesInvoiceSettings.enableItemDiscount && (
                                <td>
                                  <input
                                    aria-label={`تخفیف ${item.name}`}
                                    inputMode="numeric"
                                    value={formatPersonBalance(line.discount)}
                                    onChange={(event) => {
                                      const discount = parsePersonBalance(event.target.value)
                                      if (discount === null) return
                                      setSalesInvoiceLines((lines) => lines.map((current) => current.id === line.id
                                        ? { ...current, discount }
                                        : current))
                                    }}
                                  />
                                </td>
                              )}
                              <td>{formatPersonBalance(lineTotal)}</td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {salesInvoiceAdjustments.length > 0 && (
                <section className="sales-invoice-adjustments" aria-label="اضافات و کسورات فاکتور">
                  {salesInvoiceAdjustments.map((adjustment) => {
                    const amount = adjustment.mode === 'percent'
                      ? Math.round(salesInvoiceSubtotal * adjustment.value / 100)
                      : adjustment.value
                    return (
                      <div key={adjustment.id} className={adjustment.kind}>
                        <span>
                          <strong>{adjustment.description}</strong>
                          <small>
                            {adjustment.kind === 'addition' ? 'اضافه' : 'کسر'}
                            {' · '}
                            {adjustment.mode === 'percent'
                              ? `${formatPersonBalance(adjustment.value)}٪`
                              : 'مبلغ ثابت'}
                          </small>
                        </span>
                        <b>
                          {adjustment.kind === 'deduction' ? '−' : '+'}
                          {formatPersonBalance(amount)} {returnInvoiceMode ? (activeStore?.currency ?? 'ریال') : 'ریال'}
                        </b>
                        <button
                          type="button"
                          aria-label={`حذف ${adjustment.description}`}
                          onClick={() => setSalesInvoiceAdjustments((adjustments) => (
                            adjustments.filter((current) => current.id !== adjustment.id)
                          ))}
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                </section>
              )}

              <div className="sales-invoice-total">
                <span>
                  {returnInvoiceMode ? 'مبلغ فاکتور' : 'جمع فاکتور'}
                  {salesInvoiceAdjustments.length > 0 && (
                    <small>جمع اقلام {formatPersonBalance(salesInvoiceSubtotal)} ریال</small>
                  )}
                </span>
                <strong>
                  {formatPersonBalance(salesInvoiceTotal)}
                  <small> {returnInvoiceMode ? (activeStore?.currency ?? 'ریال') : 'ریال'}</small>
                </strong>
              </div>
            </div>

            {salesInvoiceSaveError && (
              <p className="sales-invoice-form-error" role="alert">{salesInvoiceSaveError}</p>
            )}
            <footer
              className="sales-invoice-actions"
              aria-label={returnInvoiceMode
                ? `عملیات فاکتور ${returnSalesInvoiceMode ? 'برگشت از فروش' : 'برگشت به خرید'}`
                : 'عملیات فاکتور'}
            >
              <button type="button" onClick={() => openSalesInvoiceAdjustment('deduction')}>
                <span aria-hidden="true">↓</span>
                کسورات
              </button>
              <button type="button" onClick={() => openSalesInvoiceAdjustment('addition')}>
                <span aria-hidden="true">↑</span>
                اضافات
              </button>
              <button type="button" onClick={openSalesInvoiceItemPicker}>
                <span aria-hidden="true">＋</span>
                افزودن کالا
              </button>
              <button type="button" onClick={openSalesInvoiceBarcodePicker}>
                <span aria-hidden="true">▦</span>
                بارکدخوان
              </button>
              <button
                className="finish"
                type="button"
                disabled={salesInvoiceSaving}
                onClick={() => {
                  if (returnInvoiceMode) {
                    if (!selectedSalesInvoicePerson) {
                      setSalesInvoicePartyError(returnPurchaseInvoiceMode
                        ? 'برای بستن فاکتور، ابتدا تأمین‌کننده را انتخاب کنید.'
                        : 'برای بستن فاکتور، ابتدا طرف‌حساب را انتخاب کنید.')
                      return
                    }
                    setSalesInvoicePartyError('')
                    void saveReturnInvoice()
                  } else if (purchaseInvoiceMode) {
                    savePurchaseInvoice()
                  } else {
                    saveSalesInvoice()
                  }
                }}
              >
                <span aria-hidden="true">✓</span>
                {returnInvoiceMode
                  ? salesInvoiceSaving
                    ? 'در حال ثبت…'
                    : 'ثبت فاکتور برگشت'
                  : salesInvoiceSaving
                    ? 'در حال ذخیره…'
                    : purchaseInvoiceMode
                      ? 'ثبت فاکتور خرید'
                      : salesInvoiceEditingInvoice ? 'ذخیره اصلاحات' : 'ثبت فاکتور'}
              </button>
            </footer>

            {salesInvoiceDatePickerOpen && (
              <div
                className="sales-invoice-date-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setSalesInvoiceDatePickerOpen(false)
                }}
              >
                <section
                  className="sales-invoice-date-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="sales-invoice-date-title"
                >
                  <header className="sales-invoice-date-heading">
                    <div>
                      <span>
                        {returnSalesInvoiceMode
                          ? 'تاریخ ثبت فاکتور برگشت از فروش'
                          : returnPurchaseInvoiceMode
                            ? 'تاریخ ثبت فاکتور برگشت به خرید'
                            : purchaseInvoiceMode ? 'تاریخ ثبت فاکتور خرید' : 'تاریخ ثبت فاکتور'}
                      </span>
                      <h2 id="sales-invoice-date-title">
                        {returnSalesInvoiceMode
                          ? 'انتخاب تاریخ فاکتور برگشت از فروش'
                          : returnPurchaseInvoiceMode
                            ? 'انتخاب تاریخ فاکتور برگشت به خرید'
                            : purchaseInvoiceMode ? 'انتخاب تاریخ فاکتور خرید' : 'انتخاب تاریخ'}
                      </h2>
                    </div>
                    <button
                      type="button"
                      aria-label="بستن انتخاب تاریخ"
                      onClick={() => setSalesInvoiceDatePickerOpen(false)}
                    >
                      ×
                    </button>
                  </header>

                  <div className="sales-invoice-date-previews" aria-label="تاریخ در سه تقویم">
                    {invoiceCalendars.map((calendar) => (
                      <div key={calendar.id}>
                        <span>{calendar.label}</span>
                        <strong>{formatCalendarDate(salesInvoiceDraftDate, calendar.id)}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="sales-invoice-calendar-tabs" role="tablist" aria-label="نوع تقویم">
                    {invoiceCalendars.map((calendar) => (
                      <button
                        key={calendar.id}
                        type="button"
                        role="tab"
                        aria-selected={salesInvoiceDraftCalendar === calendar.id}
                        className={salesInvoiceDraftCalendar === calendar.id ? 'active' : ''}
                        onClick={() => selectSalesInvoiceCalendar(calendar.id)}
                      >
                        {calendar.label}
                      </button>
                    ))}
                  </div>

                  <div className="sales-invoice-calendar-month">
                    <button
                      type="button"
                      aria-label="ماه قبل"
                      onClick={() => moveSalesInvoiceCalendarMonth(-1)}
                    >
                      ‹
                    </button>
                    <strong>
                      {new Intl.DateTimeFormat(`fa-IR-u-ca-${salesInvoiceDraftCalendar}-nu-arabext`, {
                        month: 'long',
                        year: 'numeric',
                        timeZone: 'UTC',
                      }).format(salesInvoiceVisibleMonth)}
                    </strong>
                    <button
                      type="button"
                      aria-label="ماه بعد"
                      onClick={() => moveSalesInvoiceCalendarMonth(1)}
                    >
                      ›
                    </button>
                  </div>

                  <div className="sales-invoice-calendar-grid" role="grid" aria-label="روزهای ماه">
                    {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day, index) => (
                      <span className="weekday" role="columnheader" key={`${day}-${index}`}>{day}</span>
                    ))}
                    {(() => {
                      const dates = getCalendarMonthDates(salesInvoiceVisibleMonth, salesInvoiceDraftCalendar)
                      const firstDayOffset = (dates[0].getUTCDay() + 1) % 7
                      const today = todayInvoiceDate.toISOString().slice(0, 10)
                      const selectedDate = normalizeUtcDate(salesInvoiceDraftDate).toISOString().slice(0, 10)

                      return (
                        <>
                          {Array.from({ length: firstDayOffset }, (_, index) => (
                            <span className="empty-day" role="gridcell" key={`empty-${index}`} />
                          ))}
                          {dates.map((date) => {
                            const dateKey = date.toISOString().slice(0, 10)
                            const isSelected = dateKey === selectedDate

                            return (
                              <button
                                className={[
                                  dateKey === today ? 'today' : '',
                                  isSelected ? 'selected' : '',
                                ].filter(Boolean).join(' ')}
                                type="button"
                                role="gridcell"
                                aria-label={formatCalendarDate(date, salesInvoiceDraftCalendar, true)}
                                aria-pressed={isSelected}
                                key={dateKey}
                                onClick={() => setSalesInvoiceDraftDate(date)}
                              >
                                {new Intl.DateTimeFormat(`fa-IR-u-ca-${salesInvoiceDraftCalendar}-nu-arabext`, {
                                  day: 'numeric',
                                  timeZone: 'UTC',
                                }).format(date)}
                              </button>
                            )
                          })}
                        </>
                      )
                    })()}
                  </div>

                  <div className="sales-invoice-date-actions">
                    <button
                      className="today-action"
                      type="button"
                      onClick={() => {
                        setSalesInvoiceDraftDate(todayInvoiceDate)
                        setSalesInvoiceVisibleMonth(todayInvoiceDate)
                      }}
                    >
                      امروز
                    </button>
                    <div>
                      <button type="button" onClick={() => setSalesInvoiceDatePickerOpen(false)}>انصراف</button>
                      <button className="confirm" type="button" onClick={saveSalesInvoiceDate}>تأیید تاریخ</button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {salesInvoiceTimePickerOpen && (
              <div
                className="sales-invoice-date-backdrop sales-invoice-time-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setSalesInvoiceTimePickerOpen(false)
                }}
              >
                <section
                  className={`sales-invoice-date-dialog sales-invoice-time-dialog ${salesInvoiceTimeMode === 'keyboard' ? 'keyboard-mode' : ''}`}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="sales-invoice-time-title"
                >
                  <header className="sales-invoice-date-heading">
                    <div>
                      <span>
                        {returnSalesInvoiceMode
                          ? 'زمان ثبت فاکتور برگشت از فروش'
                          : returnPurchaseInvoiceMode
                            ? 'زمان ثبت فاکتور برگشت به خرید'
                            : purchaseInvoiceMode ? 'زمان ثبت فاکتور خرید' : 'زمان ثبت فاکتور'} · ۲۴ ساعته
                      </span>
                      <h2 id="sales-invoice-time-title">انتخاب ساعت</h2>
                    </div>
                    <button
                      type="button"
                      aria-label="بستن انتخاب ساعت"
                      onClick={() => setSalesInvoiceTimePickerOpen(false)}
                    >
                      ×
                    </button>
                  </header>

                  {salesInvoiceTimeMode === 'clock' && (
                    <div className="sales-invoice-time-display" aria-label="زمان انتخاب‌شده">
                      <button
                        className={salesInvoiceTimeField === 'hour' ? 'active' : ''}
                        type="button"
                        aria-label="انتخاب ساعت"
                        onClick={() => setSalesInvoiceTimeField('hour')}
                      >
                        {formatClockNumber(salesInvoiceDraftTime.hours).padStart(2, '۰')}
                      </button>
                      <span aria-hidden="true">:</span>
                      <button
                        className={salesInvoiceTimeField === 'minute' ? 'active' : ''}
                        type="button"
                        aria-label="انتخاب دقیقه"
                        onClick={() => setSalesInvoiceTimeField('minute')}
                      >
                        {formatClockNumber(salesInvoiceDraftTime.minutes).padStart(2, '۰')}
                      </button>
                    </div>
                  )}

                  {salesInvoiceTimeMode === 'clock' ? (
                    <div className={`sales-invoice-clock-face ${salesInvoiceTimeField === 'minute' ? 'minute-mode' : ''}`}>
                      {salesInvoiceTimeField === 'hour'
                        ? Array.from({ length: 24 }, (_, hour) => {
                          const clockValue = hour % 12
                          const ring = hour < 12 ? 41 : 26
                          const angle = (clockValue * 30 - 90) * Math.PI / 180
                          const isSelected = salesInvoiceDraftTime.hours === hour

                          return (
                            <button
                              className={`${hour >= 12 ? 'inner' : ''} ${isSelected ? 'selected' : ''}`}
                              type="button"
                              aria-label={`${formatClockNumber(hour).padStart(2, '۰')} ساعت`}
                              aria-pressed={isSelected}
                              key={hour}
                              style={{
                                left: `${50 + Math.cos(angle) * ring}%`,
                                top: `${50 + Math.sin(angle) * ring}%`,
                              }}
                              onClick={() => {
                                setSalesInvoiceDraftTime((time) => ({ ...time, hours: hour }))
                                setSalesInvoiceTimeField('minute')
                              }}
                            >
                              {formatClockNumber(hour).padStart(2, '۰')}
                            </button>
                          )
                        })
                        : (
                          <div
                            className="sales-invoice-minute-dial"
                            role="slider"
                            tabIndex={0}
                            aria-label="انتخاب دقیقه"
                            aria-valuemin={0}
                            aria-valuemax={59}
                            aria-valuenow={salesInvoiceDraftTime.minutes}
                            aria-valuetext={`${formatClockNumber(salesInvoiceDraftTime.minutes).padStart(2, '۰')} دقیقه`}
                            onPointerDown={(event) => {
                              const bounds = event.currentTarget.getBoundingClientRect()
                              const minute = getClockMinuteFromPoint(
                                event.clientX - bounds.left,
                                event.clientY - bounds.top,
                                bounds.width,
                                bounds.height,
                              )
                              setSalesInvoiceDraftTime((time) => ({ ...time, minutes: minute }))
                              event.currentTarget.focus()
                            }}
                            onPointerMove={(event) => {
                              if (event.buttons === 0) return
                              const bounds = event.currentTarget.getBoundingClientRect()
                              const minute = getClockMinuteFromPoint(
                                event.clientX - bounds.left,
                                event.clientY - bounds.top,
                                bounds.width,
                                bounds.height,
                              )
                              setSalesInvoiceDraftTime((time) => (
                                time.minutes === minute ? time : { ...time, minutes: minute }
                              ))
                            }}
                            onKeyDown={(event) => {
                              const minute = salesInvoiceDraftTime.minutes
                              let nextMinute: number | null = null
                              if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
                                nextMinute = (minute + 1) % 60
                              } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
                                nextMinute = (minute + 59) % 60
                              } else if (event.key === 'Home') {
                                nextMinute = 0
                              } else if (event.key === 'End') {
                                nextMinute = 59
                              }

                              if (nextMinute !== null) {
                                event.preventDefault()
                                setSalesInvoiceDraftTime((time) => ({ ...time, minutes: nextMinute }))
                              }
                            }}
                          >
                            {Array.from({ length: 60 }, (_, minute) => {
                              const angle = (minute * 6 - 90) * Math.PI / 180
                              const isSelected = salesInvoiceDraftTime.minutes === minute

                              return (
                                <span
                                  aria-hidden="true"
                                  className={[
                                    'sales-invoice-clock-minute-tick',
                                    minute % 5 === 0 ? 'major' : '',
                                    isSelected ? 'selected' : '',
                                  ].filter(Boolean).join(' ')}
                                  key={minute}
                                  style={{
                                    left: `${50 + Math.cos(angle) * 43}%`,
                                    top: `${50 + Math.sin(angle) * 43}%`,
                                  }}
                                >
                                  {minute % 5 === 0
                                    ? formatClockNumber(minute).padStart(2, '۰')
                                    : ''}
                                </span>
                              )
                            })}
                            <span
                              className="sales-invoice-minute-hand"
                              aria-hidden="true"
                              style={{ transform: `translateX(-50%) rotate(${salesInvoiceDraftTime.minutes * 6}deg)` }}
                            />
                          </div>
                        )}
                      <span className="sales-invoice-clock-center" aria-hidden="true" />
                    </div>
                  ) : (
                    <div className="sales-invoice-time-keyboard" aria-label="ورود زمان با صفحه‌کلید">
                      <label className={salesInvoiceTimeField === 'hour' ? 'active' : ''}>
                        <input
                          ref={salesInvoiceHourInputRef}
                          aria-label={returnInvoiceMode
                            ? `ساعت ${returnSalesInvoiceMode ? 'برگشت از فروش' : 'برگشت به خرید'}`
                            : purchaseInvoiceMode ? 'ساعت فاکتور خرید' : 'ساعت فاکتور'}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9۰-۹٠-٩]*"
                          maxLength={2}
                          value={formatClockNumber(salesInvoiceDraftTime.hours).padStart(2, '۰')}
                          onFocus={(event) => {
                            setSalesInvoiceTimeField('hour')
                            event.currentTarget.select()
                          }}
                          onChange={(event) => updateSalesInvoiceTimeField('hour', event.target.value)}
                        />
                        <span>ساعت</span>
                      </label>
                      <span className="separator" aria-hidden="true">:</span>
                      <label className={salesInvoiceTimeField === 'minute' ? 'active' : ''}>
                        <input
                          ref={salesInvoiceMinuteInputRef}
                          aria-label={returnInvoiceMode
                            ? `دقیقه ${returnSalesInvoiceMode ? 'برگشت از فروش' : 'برگشت به خرید'}`
                            : purchaseInvoiceMode ? 'دقیقه فاکتور خرید' : 'دقیقه فاکتور'}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9۰-۹٠-٩]*"
                          maxLength={2}
                          value={formatClockNumber(salesInvoiceDraftTime.minutes).padStart(2, '۰')}
                          onFocus={(event) => {
                            setSalesInvoiceTimeField('minute')
                            event.currentTarget.select()
                          }}
                          onChange={(event) => updateSalesInvoiceTimeField('minute', event.target.value)}
                        />
                        <span>دقیقه</span>
                      </label>
                    </div>
                  )}

                  <div className="sales-invoice-date-actions sales-invoice-time-actions">
                    <button
                      className="sales-invoice-time-mode"
                      type="button"
                      aria-label={salesInvoiceTimeMode === 'clock' ? 'ورود با صفحه‌کلید' : 'نمایش ساعت عقربه‌ای'}
                      onClick={() => setSalesInvoiceTimeMode((mode) => mode === 'clock' ? 'keyboard' : 'clock')}
                    >
                      <span aria-hidden="true">{salesInvoiceTimeMode === 'clock' ? '▦' : '◷'}</span>
                    </button>
                    <div>
                      <button type="button" onClick={() => setSalesInvoiceTimePickerOpen(false)}>لغو</button>
                      <button className="confirm" type="button" onClick={saveSalesInvoiceTime}>تأیید</button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {salesInvoiceAttachmentPickerOpen && (
              <div
                className="sales-invoice-date-backdrop sales-invoice-attachment-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) closeSalesInvoiceAttachmentPicker()
                }}
              >
                <section
                  className="sales-invoice-date-dialog sales-invoice-attachment-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="sales-invoice-attachment-title"
                >
                  <header className="sales-invoice-date-heading">
                    <div>
                      <span>
                        {returnSalesInvoiceMode
                          ? 'تصویر سند برگشت از فروش'
                          : returnPurchaseInvoiceMode
                            ? 'تصویر سند برگشت به خرید'
                            : purchaseInvoiceMode ? 'تصویر سند خرید' : 'تصویر سند فروش'}
                      </span>
                      <h2 id="sales-invoice-attachment-title">پیوست عکس</h2>
                    </div>
                    <button
                      type="button"
                      aria-label="بستن پنجره پیوست"
                      onClick={closeSalesInvoiceAttachmentPicker}
                    >
                      ×
                    </button>
                  </header>

                  <div className="sales-invoice-attachment-content">
                    <div className="sales-invoice-attachment-choices">
                      <button
                        type="button"
                        onClick={() => salesInvoiceGalleryInputRef.current?.click()}
                      >
                        <span aria-hidden="true">▧</span>
                        <strong>انتخاب از گالری</strong>
                        <small>عکس موجود در گوشی یا دستگاه</small>
                      </button>
                      <button
                        type="button"
                        onClick={() => salesInvoiceCameraInputRef.current?.click()}
                      >
                        <span aria-hidden="true">◎</span>
                        <strong>گرفتن عکس</strong>
                        <small>باز کردن دوربین دستگاه</small>
                      </button>
                    </div>
                    <input
                      ref={salesInvoiceGalleryInputRef}
                      className="sales-invoice-file-input"
                      type="file"
                      accept="image/*"
                      aria-label="انتخاب عکس از گالری"
                      onChange={handleSalesInvoiceAttachmentChange}
                    />
                    <input
                      ref={salesInvoiceCameraInputRef}
                      className="sales-invoice-file-input"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      aria-label="گرفتن عکس با دوربین"
                      onChange={handleSalesInvoiceAttachmentChange}
                    />

                    {salesInvoiceAttachmentError && (
                      <p className="sales-invoice-attachment-error" role="alert">
                        {salesInvoiceAttachmentError}
                      </p>
                    )}

                    {salesInvoiceDraftAttachment ? (
                      <div className="sales-invoice-attachment-preview">
                        <img
                          src={salesInvoiceDraftAttachment.previewUrl}
                          alt={`پیش‌نمایش ${salesInvoiceDraftAttachment.file.name}`}
                        />
                        <div className="sales-invoice-attachment-file">
                          <strong>{salesInvoiceDraftAttachment.file.name || 'تصویر پیوست'}</strong>
                          <small>
                            {new Intl.NumberFormat('fa-IR').format(
                              Math.max(1, Math.ceil(salesInvoiceDraftAttachment.file.size / 1024)),
                            )} کیلوبایت
                          </small>
                        </div>
                      </div>
                    ) : (
                      <div className="sales-invoice-attachment-empty">
                        <span aria-hidden="true">▧</span>
                        <strong>هنوز عکسی انتخاب نشده</strong>
                        <small>از گالری انتخاب کن یا با دوربین عکس بگیر.</small>
                      </div>
                    )}
                  </div>

                  <div className="sales-invoice-date-actions sales-invoice-attachment-actions">
                    <button
                      className="sales-invoice-attachment-remove"
                      type="button"
                      aria-label="حذف عکس پیوست"
                      disabled={!salesInvoiceDraftAttachment}
                      onClick={() => {
                        if (
                          salesInvoiceDraftAttachment
                          && salesInvoiceDraftAttachment.previewUrl !== salesInvoiceAttachment?.previewUrl
                        ) {
                          releaseSalesInvoiceAttachmentUrl(salesInvoiceDraftAttachment.previewUrl)
                        }
                        setSalesInvoiceDraftAttachment(null)
                        setSalesInvoiceAttachmentError('')
                      }}
                    >
                      <span aria-hidden="true">×</span>
                      حذف
                    </button>
                    <div className="sales-invoice-attachment-actions-group">
                      <button
                        className="sales-invoice-attachment-cancel"
                        type="button"
                        onClick={closeSalesInvoiceAttachmentPicker}
                      >
                        لغو
                      </button>
                      <button
                        className="confirm"
                        type="button"
                        onClick={confirmSalesInvoiceAttachment}
                      >
                        تأیید پیوست
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {salesInvoicePersonPickerOpen && (
              <div
                className="sales-invoice-person-picker-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setSalesInvoicePersonPickerOpen(false)
                }}
              >
                <section
                  className="sales-invoice-person-picker-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="sales-invoice-person-picker-title"
                >
                  <header>
                    <div>
                      <span>انتخاب از فهرست اشخاص</span>
                      <h2 id="sales-invoice-person-picker-title">
                        {returnPurchaseInvoiceMode
                          ? 'تأمین‌کننده فاکتور برگشت به خرید'
                          : purchaseInvoicePartyMode ? 'تأمین‌کننده فاکتور خرید' : 'طرف حساب فاکتور'}
                      </h2>
                      <small className="sales-invoice-person-picker-count">
                        {formatPersonBalance(filteredSalesInvoicePickerPeople.length)} مورد
                      </small>
                    </div>
                    <button
                      type="button"
                      aria-label="بستن فهرست اشخاص"
                      onClick={() => setSalesInvoicePersonPickerOpen(false)}
                    >
                      ×
                    </button>
                  </header>
                  <div className="sales-invoice-person-picker-content">
                    <div className="sales-invoice-person-picker-filters">
                      <div
                        className="sales-invoice-person-picker-status"
                        role="group"
                        aria-label="فیلتر وضعیت حساب اشخاص"
                      >
                        {(['همه', 'بدهکاران', 'بستانکاران'] as const).map((status) => (
                          <button
                            key={status}
                            type="button"
                            aria-pressed={salesInvoicePersonPickerStatus === status}
                            className={salesInvoicePersonPickerStatus === status ? 'active' : ''}
                            onClick={() => setSalesInvoicePersonPickerStatus(status)}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                      <div className="sales-invoice-person-picker-group">
                        <button
                          className="sales-invoice-person-picker-add-group"
                          type="button"
                          aria-expanded={salesInvoicePersonPickerGroupFormOpen}
                          onClick={() => {
                            setSalesInvoicePersonPickerGroupFormOpen((isOpen) => !isOpen)
                            setSalesInvoicePersonPickerGroupError('')
                          }}
                        >
                          {salesInvoicePersonPickerGroupFormOpen ? 'انصراف' : 'گروه جدید'}
                        </button>
                        <label>
                          <span className="sr-only">فیلتر گروه اشخاص</span>
                          <select
                            aria-label="فیلتر گروه اشخاص"
                            value={salesInvoicePersonPickerGroup}
                            onChange={(event) => setSalesInvoicePersonPickerGroup(event.target.value)}
                          >
                            <option value={allAccountReportGroups}>همه</option>
                            {peopleGroupState.groups.map((group) => (
                              <option key={group} value={group}>{group}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      {salesInvoicePersonPickerGroupFormOpen && (
                        <form
                          className="sales-invoice-person-picker-group-form"
                          onSubmit={addSalesInvoicePickerGroup}
                        >
                          <input
                            autoFocus
                            aria-label="نام گروه جدید"
                            maxLength={40}
                            value={salesInvoicePersonPickerGroupName}
                            onChange={(event) => {
                              setSalesInvoicePersonPickerGroupName(event.target.value)
                              setSalesInvoicePersonPickerGroupError('')
                            }}
                            placeholder="نام گروه جدید"
                          />
                          <button type="submit">افزودن گروه</button>
                          {salesInvoicePersonPickerGroupError && (
                            <small role="alert">{salesInvoicePersonPickerGroupError}</small>
                          )}
                        </form>
                      )}
                    </div>
                    <label className="sales-invoice-person-picker-search">
                      <span>{purchaseInvoicePartyMode ? 'جست‌وجوی تأمین‌کننده' : 'جست‌وجوی شخص'}</span>
                      <input
                        type="search"
                        autoFocus
                        aria-label={purchaseInvoicePartyMode ? 'جست‌وجوی تأمین‌کنندگان' : 'جست‌وجوی اشخاص'}
                        value={salesInvoicePersonPickerSearch}
                        onChange={(event) => setSalesInvoicePersonPickerSearch(event.target.value)}
                        placeholder="نام، شماره تماس یا کد"
                      />
                    </label>
                    <div
                      className="sales-invoice-person-picker-list"
                      role="listbox"
                      aria-label={purchaseInvoicePartyMode ? 'فهرست تأمین‌کنندگان' : 'فهرست اشخاص'}
                    >
                      {filteredSalesInvoicePickerPeople.map((person) => (
                        <button
                          key={person.id}
                          type="button"
                          role="option"
                          aria-selected={salesInvoicePerson === person.id}
                          onClick={() => {
                            setSalesInvoicePerson(person.id)
                            setSalesInvoicePartyError('')
                            setSalesInvoicePersonSearch('')
                            setSalesInvoicePersonOptionsOpen(false)
                            setSalesInvoicePersonPickerOpen(false)
                            setSalesInvoiceSaveError('')
                          }}
                        >
                          <span className="sales-invoice-person-avatar" aria-hidden="true">
                            {person.name.trim().charAt(0)}
                          </span>
                          <span>
                            <strong>{person.name}</strong>
                            <small>{person.phone || 'بدون شماره تماس'} · کد {person.code}</small>
                          </span>
                          {salesInvoicePerson === person.id && <b aria-label="انتخاب شده">✓</b>}
                        </button>
                      ))}
                      {filteredSalesInvoicePickerPeople.length === 0 && (
                        <p>
                          {purchaseInvoicePartyMode
                            ? 'تأمین‌کننده‌ای با این مشخصات پیدا نشد.'
                            : 'شخصی با این مشخصات پیدا نشد.'}
                        </p>
                      )}
                    </div>
                  </div>
                  <footer>
                    <button
                      className="sales-invoice-person-picker-add-person"
                      type="button"
                      onClick={() => {
                        const returnTab = activeTab
                        const groupOverride = salesInvoicePersonPickerGroup === allAccountReportGroups
                          ? undefined
                          : salesInvoicePersonPickerGroup
                        setSalesInvoicePersonPickerReturnTab(returnTab)
                        setSalesInvoicePersonPickerOpen(false)
                        setSalesInvoicePersonPickerGroupFormOpen(false)
                        setSalesInvoicePersonPickerGroupError('')
                        openPersonForm(purchaseInvoicePartyMode ? 'تأمین‌کننده' : 'شخص', groupOverride)
                        setActiveTab('اشخاص')
                      }}
                    >
                      <span aria-hidden="true">♙+</span>
                      افزودن {purchaseInvoicePartyMode ? 'تأمین‌کننده' : 'شخص'}
                    </button>
                    <button type="button" onClick={() => setSalesInvoicePersonPickerOpen(false)}>بستن</button>
                  </footer>
                </section>
              </div>
            )}

            {salesInvoiceSettingsOpen && (
              <div
                className="sales-invoice-settings-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setSalesInvoiceSettingsOpen(false)
                }}
              >
                <section
                  className="sales-invoice-settings-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="sales-invoice-settings-title"
                >
                  <header>
                    <div>
                      <span>شخصی‌سازی ثبت فاکتور</span>
                      <h2 id="sales-invoice-settings-title">تنظیمات فاکتور فروش</h2>
                    </div>
                    <button
                      type="button"
                      aria-label="بستن تنظیمات"
                      onClick={() => setSalesInvoiceSettingsOpen(false)}
                    >
                      ×
                    </button>
                  </header>
                  <div className="sales-invoice-settings-content">
                    {([
                      ['prefixCategoryName', 'نمایش نام دسته قبل از نام کالا', 'نام دسته‌بندی در شرح ردیف فاکتور نمایش داده می‌شود.'],
                      ['enableItemDiscount', 'فعال‌سازی تخفیف برای هر کالا', 'درصد و مبلغ تخفیف در فرم و ردیف‌های فاکتور فعال می‌شود.'],
                      ['enableItemDescription', 'فعال‌سازی توضیحات کالا', 'امکان ویرایش شرح کالا هنگام افزودن به فاکتور فراهم می‌شود.'],
                      ['showPurchasePrice', 'نمایش قیمت خرید در انتخاب کالا', 'قیمت خرید در کنار قیمت فروش، فقط در فهرست انتخاب کالا نمایش داده می‌شود.'],
                      ['updateInventoryPrice', 'به‌روزرسانی قیمت فروش کالا در انبار', 'با ثبت کالا در فاکتور، قیمت فروش ویرایش‌شده در فهرست انبار نیز ذخیره می‌شود.'],
                      ['autoSalesPricePercent', 'محاسبهٔ خودکار قیمت فروش بر اساس درصد روی خرید', 'هنگام انتخاب کالا، قیمت پیشنهادی از قیمت خرید و درصد سود محاسبه می‌شود.'],
                    ] as const).map(([key, title, description]) => (
                      <label className="sales-invoice-setting-option" key={key}>
                        <span className="sales-invoice-setting-copy">
                          <strong>{title}</strong>
                          <small>{description}</small>
                        </span>
                        <input
                          type="checkbox"
                          checked={salesInvoiceDraftSettings[key]}
                          onChange={(event) => setSalesInvoiceDraftSettings((settings) => ({
                            ...settings,
                            [key]: event.target.checked,
                          }))}
                          aria-label={title}
                        />
                      </label>
                    ))}
                    {salesInvoiceDraftSettings.autoSalesPricePercent && (
                      <label className="sales-invoice-settings-markup">
                        <span>درصد روی قیمت خرید</span>
                        <div>
                          <input
                            inputMode="numeric"
                            aria-label="درصد سود روی قیمت خرید"
                            value={formatPersonBalance(salesInvoiceDraftSettings.salePriceMarkupPercent)}
                            onChange={(event) => {
                              const percent = parsePersonBalance(event.target.value)
                              if (percent !== null) {
                                setSalesInvoiceDraftSettings((settings) => ({
                                  ...settings,
                                  salePriceMarkupPercent: percent,
                                }))
                              }
                            }}
                          />
                          <small>٪</small>
                        </div>
                      </label>
                    )}
                  </div>
                  <footer className="sales-invoice-settings-actions">
                    <button type="button" onClick={() => setSalesInvoiceSettingsOpen(false)}>لغو</button>
                    <button className="confirm" type="button" onClick={saveSalesInvoiceSettings}>تأیید</button>
                  </footer>
                </section>
              </div>
            )}

            {salesInvoiceAdjustmentKind && (
              <div
                className="sales-invoice-form-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setSalesInvoiceAdjustmentKind(null)
                }}
              >
                <section
                  className="sales-invoice-form-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="sales-invoice-adjustment-title"
                >
                  <header className="sales-invoice-form-heading">
                    <span className="sales-invoice-form-icon" aria-hidden="true">
                      {salesInvoiceAdjustmentKind === 'addition' ? '↑' : '↓'}
                    </span>
                    <div>
                      <small>تنظیم مبلغ فاکتور</small>
                      <h2 id="sales-invoice-adjustment-title">
                        ثبت {salesInvoiceAdjustmentKind === 'addition' ? 'اضافات' : 'کسورات'}
                      </h2>
                    </div>
                    <button
                      type="button"
                      aria-label="بستن پنجره"
                      onClick={() => setSalesInvoiceAdjustmentKind(null)}
                    >
                      ×
                    </button>
                  </header>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault()
                      saveSalesInvoiceAdjustment()
                    }}
                  >
                    <label className="sales-invoice-form-field">
                      <span>شرح</span>
                      <input
                        autoFocus
                        value={salesInvoiceAdjustmentDescription}
                        onChange={(event) => setSalesInvoiceAdjustmentDescription(event.target.value)}
                        placeholder={salesInvoiceAdjustmentKind === 'addition' ? 'مثلاً: هزینهٔ ارسال' : 'مثلاً: تخفیف ویژه'}
                        required
                      />
                    </label>
                    <div className="sales-invoice-adjustment-mode" role="group" aria-label="نوع محاسبه">
                      <button
                        className={salesInvoiceAdjustmentMode === 'percent' ? 'active' : ''}
                        type="button"
                        aria-pressed={salesInvoiceAdjustmentMode === 'percent'}
                        onClick={() => setSalesInvoiceAdjustmentMode('percent')}
                      >
                        درصد فاکتور
                      </button>
                      <button
                        className={salesInvoiceAdjustmentMode === 'amount' ? 'active' : ''}
                        type="button"
                        aria-pressed={salesInvoiceAdjustmentMode === 'amount'}
                        onClick={() => setSalesInvoiceAdjustmentMode('amount')}
                      >
                        مبلغ ثابت
                      </button>
                    </div>
                    <label className="sales-invoice-form-field">
                      <span>
                        {salesInvoiceAdjustmentMode === 'percent' ? 'درصد' : 'مبلغ'}
                        <small>
                          {salesInvoiceAdjustmentMode === 'percent'
                            ? '٪'
                            : returnInvoiceMode ? (activeStore?.currency ?? 'ریال') : 'ریال'}
                        </small>
                      </span>
                      <input
                        inputMode="numeric"
                        value={formatPersonBalance(salesInvoiceAdjustmentValue)}
                        onChange={(event) => {
                          const value = parsePersonBalance(event.target.value)
                          if (value !== null) setSalesInvoiceAdjustmentValue(value)
                        }}
                        aria-label={salesInvoiceAdjustmentMode === 'percent' ? 'درصد فاکتور' : 'مبلغ ثابت'}
                      />
                    </label>
                    <div className="sales-invoice-adjustment-preview">
                      <span>مبلغ محاسبه‌شده</span>
                      <strong>
                        {formatPersonBalance(salesInvoiceAdjustmentMode === 'percent'
                          ? Math.round(salesInvoiceSubtotal * salesInvoiceAdjustmentValue / 100)
                          : salesInvoiceAdjustmentValue)}
                        <small> {returnInvoiceMode ? (activeStore?.currency ?? 'ریال') : 'ریال'}</small>
                      </strong>
                      {salesInvoiceAdjustmentMode === 'percent' && (
                        <small>بر اساس جمع کالاها و خدمات فاکتور</small>
                      )}
                    </div>
                    <label className="sales-invoice-profit-check">
                      <input
                        type="checkbox"
                        checked={salesInvoiceAdjustmentAffectsProfit}
                        onChange={(event) => setSalesInvoiceAdjustmentAffectsProfit(event.target.checked)}
                      />
                      <span>
                        {salesInvoiceAdjustmentKind === 'addition'
                          ? 'در محاسبهٔ سود فاکتور لحاظ شود'
                          : 'از سود فاکتور کسر شود'}
                      </span>
                    </label>
                    <footer className="sales-invoice-form-actions">
                      <button type="button" onClick={() => setSalesInvoiceAdjustmentKind(null)}>لغو</button>
                      <button className="confirm" type="submit">تأیید و ثبت</button>
                    </footer>
                  </form>
                </section>
              </div>
            )}

            {salesInvoiceBarcodeScannerOpen && (
              <div
                className="sales-invoice-barcode-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setSalesInvoiceBarcodeScannerOpen(false)
                }}
              >
                <section
                  className="sales-invoice-barcode-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="sales-invoice-barcode-title"
                >
                  <header>
                    <div>
                      <span>اسکن با دوربین</span>
                      <h2 id="sales-invoice-barcode-title">بارکد کالا را مقابل دوربین بگیرید</h2>
                    </div>
                    <button
                      type="button"
                      aria-label="بستن بارکدخوان"
                      onClick={() => setSalesInvoiceBarcodeScannerOpen(false)}
                    >
                      ×
                    </button>
                  </header>
                  <div className="sales-invoice-barcode-preview">
                    <video
                      ref={salesInvoiceBarcodeVideoRef}
                      autoPlay
                      muted
                      playsInline
                      aria-label="پیش‌نمایش دوربین برای اسکن بارکد"
                    />
                    <span className="sales-invoice-barcode-target" aria-hidden="true" />
                  </div>
                  <p
                    className={salesInvoiceBarcodeScannerError ? 'error' : ''}
                    role={salesInvoiceBarcodeScannerError ? 'alert' : 'status'}
                  >
                    {salesInvoiceBarcodeScannerError || 'بارکد را داخل کادر قرار دهید؛ اسکن به‌صورت خودکار انجام می‌شود.'}
                  </p>
                  <footer>
                    <button type="button" onClick={() => setSalesInvoiceBarcodeScannerOpen(false)}>
                      بستن دوربین
                    </button>
                  </footer>
                </section>
              </div>
            )}

            {salesInvoiceItemPickerOpen && (
              <div
                className="sales-invoice-picker-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) {
                    setSalesInvoiceItemPickerOpen(false)
                    setSalesInvoiceDraftItem(null)
                  }
                }}
              >
                <section
                  className="sales-invoice-picker"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="sales-invoice-picker-title"
                >
                  <header>
                    <div>
                      <span>
                        {returnSalesInvoiceMode
                          ? 'ثبت قلم فاکتور برگشت از فروش'
                          : returnPurchaseInvoiceMode
                            ? 'ثبت قلم فاکتور برگشت به خرید'
                            : purchaseInvoiceMode ? 'ثبت قلم فاکتور خرید' : 'ثبت قلم فاکتور فروش'}
                      </span>
                      <h2 id="sales-invoice-picker-title">افزودن کالا یا خدمات</h2>
                    </div>
                    <button
                      type="button"
                      aria-label="بستن پنجره"
                      onClick={() => {
                        setSalesInvoiceItemPickerOpen(false)
                        setSalesInvoiceDraftItem(null)
                      }}
                    >
                      ×
                    </button>
                  </header>
                  <div className="sales-invoice-item-form">
                    <div className="sales-invoice-item-search-row">
                      <label className="sales-invoice-form-field">
                        <span>نام کالا یا خدمات:</span>
                        <div className="sales-invoice-item-search-control">
                          <input
                            autoFocus={salesInvoiceBarcodeMode}
                            aria-label={salesInvoiceBarcodeMode
                              ? 'اسکن یا جست‌وجوی بارکد، نام یا کد کالا و خدمات'
                              : 'نام کالا یا خدمات'}
                            value={salesInvoiceItemSearch}
                            onFocus={() => setSalesInvoiceItemOptionsOpen(Boolean(salesInvoiceItemSearch.trim()))}
                            onChange={(event) => {
                              setSalesInvoiceItemSearch(event.target.value)
                              setSalesInvoiceDraftItem(null)
                              setSalesInvoiceDraftDescription('')
                              setSalesInvoiceDraftQuantity(1)
                              setSalesInvoiceDraftPrice(0)
                              setSalesInvoiceDraftDiscountPercent(0)
                              setSalesInvoiceDraftDiscountAmount(0)
                              setSalesInvoiceItemOptionsOpen(Boolean(event.target.value.trim()))
                              if (salesInvoiceBarcodeMode && event.target.value.trim()) {
                                const scannedValue = event.target.value.trim()
                                const normalizedScannedValue = normalizeInventorySearchText(scannedValue)
                                const matchedItem = salesInvoicePickerItems.find((item) => (
                                  [item.barcode, item.code]
                                    .some((value) => value
                                      && normalizeInventorySearchText(value.trim()) === normalizedScannedValue)
                                ))
                                if (matchedItem) selectSalesInvoiceItem(matchedItem)
                              }
                            }}
                            placeholder={salesInvoiceBarcodeMode
                              ? 'نام، کد یا بارکد کالا و خدمات را وارد یا اسکن کنید'
                              : 'نام یا کد کالا یا خدمات را جست‌وجو کنید'}
                          />
                          <button
                            type="button"
                            aria-label={salesInvoiceDraftItem ? 'تغییر کالای انتخاب‌شده' : 'نمایش فهرست کالاها'}
                            onClick={() => {
                              if (salesInvoiceDraftItem) {
                                setSalesInvoiceDraftItem(null)
                                setSalesInvoiceDraftDescription('')
                                setSalesInvoiceItemSearch('')
                                setSalesInvoiceDraftQuantity(1)
                                setSalesInvoiceDraftPrice(0)
                                setSalesInvoiceDraftDiscountPercent(0)
                                setSalesInvoiceDraftDiscountAmount(0)
                                setSalesInvoiceItemOptionsOpen(false)
                                return
                              }
                              openSalesInvoiceCatalog()
                            }}
                          >
                            {salesInvoiceDraftItem ? '×' : '+'}
                          </button>
                        </div>
                      </label>
                      {salesInvoiceItemOptionsOpen && (
                        <div className="sales-invoice-picker-list" role="listbox" aria-label="نتایج جست‌وجوی کالا یا خدمات">
                          {filteredSalesInvoiceItems.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              role="option"
                              aria-selected={salesInvoiceDraftItem?.id === item.id}
                              onClick={() => selectSalesInvoiceItem(item)}
                            >
                              <span className="sales-invoice-picker-icon">{item.kind === 'خدمات' ? '✦' : '▦'}</span>
                              <span>
                                <strong>{item.name}</strong>
                                <small>{item.kind} · {item.unit} · موجودی {formatPersonBalance(item.stock)}</small>
                              </span>
                              <b>
                                {formatPersonBalance(purchaseInvoicePartyMode ? item.purchasePrice : item.salePrice)}
                                <small> {returnInvoiceMode ? (activeStore?.currency ?? 'ریال') : 'ریال'}</small>
                                {salesInvoiceSettings.showPurchasePrice && (
                                  <small className="sales-invoice-purchase-price">
                                    خرید {formatPersonBalance(item.purchasePrice)}
                                  </small>
                                )}
                              </b>
                            </button>
                          ))}
                          {filteredSalesInvoiceItems.length === 0 && (
                            <p className="sales-invoice-picker-empty">موردی با این مشخصات پیدا نشد.</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="sales-invoice-item-identification">
                      <label className="sales-invoice-form-field">
                        <span>کد:</span>
                        <input
                          aria-label="کد کالا"
                          value={salesInvoiceDraftItem?.code ?? salesInvoiceDraftItem?.barcode ?? ''}
                          placeholder="پس از انتخاب کالا نمایش داده می‌شود"
                          readOnly
                        />
                      </label>
                      <label className="sales-invoice-form-field">
                        <span>انبار:</span>
                        <select
                          aria-label="انتخاب انبار کالا"
                          value={salesInvoiceDraftWarehouse}
                          onChange={(event) => {
                            const warehouse = event.target.value
                            if (salesInvoiceDraftItem) {
                              const catalogId = salesInvoiceDraftItem.catalogId ?? salesInvoiceDraftItem.id
                              const warehouseItem = storedInventoryRecords.items.find((item) => (
                                item.kind === salesInvoiceDraftItem.kind
                                && (item.catalogId ?? item.id) === catalogId
                                && (item.warehouse ?? (
                                  item.kind === 'خدمات' ? DEFAULT_SERVICE_WAREHOUSE : DEFAULT_INVENTORY_WAREHOUSE
                                )) === warehouse
                              ))
                              if (!warehouseItem) {
                                setNotice(`نسخهٔ «${salesInvoiceDraftItem.name}» در «${warehouse}» پیدا نشد.`)
                                window.setTimeout(() => setNotice(''), 2600)
                                return
                              }
                              setSalesInvoiceDraftItem(warehouseItem)
                            }
                            setSalesInvoiceDraftWarehouse(warehouse)
                          }}
                          dir="rtl"
                        >
                          {salesInvoiceWarehouseOptions.map((warehouse) => {
                            const warehouseItem = salesInvoiceDraftItem
                              ? storedInventoryRecords.items.find((item) => (
                                  item.kind === salesInvoiceDraftItem.kind
                                  && (item.catalogId ?? item.id)
                                    === (salesInvoiceDraftItem.catalogId ?? salesInvoiceDraftItem.id)
                                  && (item.warehouse ?? (
                                    item.kind === 'خدمات' ? DEFAULT_SERVICE_WAREHOUSE : DEFAULT_INVENTORY_WAREHOUSE
                                  )) === warehouse
                                ))
                              : undefined
                            const stockLabel = salesInvoiceDraftItem
                              ? `${formatStocktakeQuantity(warehouseItem?.stock ?? 0)} ${warehouseItem?.unit ?? salesInvoiceDraftItem.unit}`
                              : ''
                            return (
                              <option key={warehouse} value={warehouse} dir="rtl">
                                {stockLabel ? `${warehouse}　　${stockLabel}` : warehouse}
                              </option>
                            )
                          })}
                        </select>
                      </label>
                      </div>

                    <label className="sales-invoice-form-field sales-invoice-item-quantity">
                      <span>مقدار:</span>
                      <div className="sales-invoice-quantity-control">
                        <button
                          type="button"
                          aria-label="کاهش مقدار کالا"
                          disabled={!salesInvoiceDraftItem || salesInvoiceDraftQuantity <= 1}
                          onClick={() => setSalesInvoiceDraftQuantity((quantity) => Math.max(1, quantity - 1))}
                        >
                          −
                        </button>
                        <input
                          inputMode="numeric"
                          value={formatPersonBalance(salesInvoiceDraftQuantity)}
                          onChange={(event) => {
                            const quantity = parsePersonBalance(event.target.value)
                            if (quantity !== null) setSalesInvoiceDraftQuantity(Math.max(1, quantity))
                          }}
                          aria-label="مقدار کالا"
                          disabled={!salesInvoiceDraftItem}
                        />
                        <button
                          type="button"
                          aria-label="افزایش مقدار کالا"
                          disabled={!salesInvoiceDraftItem}
                          onClick={() => setSalesInvoiceDraftQuantity((quantity) => quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </label>

                    <div className="sales-invoice-item-price-panel">
                      <label className="sales-invoice-form-field">
                        <span>فی:</span>
                        <div className="sales-invoice-item-number-control">
                          <input
                            inputMode="numeric"
                            value={formatPersonBalance(salesInvoiceDraftPrice)}
                            onChange={(event) => {
                              const price = parsePersonBalance(event.target.value)
                              if (price !== null) setSalesInvoiceDraftPrice(price)
                            }}
                            aria-label="قیمت هر واحد"
                            disabled={!salesInvoiceDraftItem}
                          />
                          <small>قیمت هر واحد</small>
                          <em>{returnInvoiceMode ? (activeStore?.currency ?? 'ریال') : 'ریال'}</em>
                        </div>
                      </label>
                      {salesInvoiceSettings.enableItemDiscount && (
                        <div className="sales-invoice-item-discount-row">
                          <label className="sales-invoice-form-field">
                            <span>تخفیف:</span>
                            <div className="sales-invoice-item-number-control">
                              <input
                                inputMode="numeric"
                                value={formatPersonBalance(salesInvoiceDraftDiscountPercent)}
                                onChange={(event) => {
                                  const percent = parsePersonBalance(event.target.value)
                                  if (percent !== null) setSalesInvoiceDraftDiscountPercent(Math.min(100, percent))
                                }}
                                aria-label="درصد تخفیف کالا"
                                disabled={!salesInvoiceDraftItem}
                              />
                              <em>درصد٪</em>
                            </div>
                          </label>
                          <label className="sales-invoice-form-field">
                            <span aria-hidden="true">&nbsp;</span>
                            <div className="sales-invoice-item-number-control">
                              <input
                                inputMode="numeric"
                                value={formatPersonBalance(salesInvoiceDraftDiscountAmount)}
                                onChange={(event) => {
                                  const amount = parsePersonBalance(event.target.value)
                                  if (amount !== null) setSalesInvoiceDraftDiscountAmount(amount)
                                }}
                                aria-label="مبلغ تخفیف کالا"
                                disabled={!salesInvoiceDraftItem}
                              />
                              <em>مبلغ</em>
                              <em>{returnInvoiceMode ? (activeStore?.currency ?? 'ریال') : 'ریال'}</em>
                            </div>
                          </label>
                        </div>
                      )}
                      <div className="sales-invoice-item-total-row">
                        <span>جمع:</span>
                        <strong>
                          {formatPersonBalance(Math.max(0,
                            salesInvoiceDraftPrice * salesInvoiceDraftQuantity
                            - (salesInvoiceSettings.enableItemDiscount ? Math.min(
                              salesInvoiceDraftPrice * salesInvoiceDraftQuantity,
                              Math.round(
                                salesInvoiceDraftPrice * salesInvoiceDraftQuantity
                                * salesInvoiceDraftDiscountPercent / 100,
                              ) + salesInvoiceDraftDiscountAmount,
                            ) : 0),
                          ))}
                        </strong>
                        <small>{returnInvoiceMode ? (activeStore?.currency ?? 'ریال') : 'ریال'}</small>
                      </div>
                    </div>

                    {salesInvoiceSettings.enableItemDescription && (
                      <label className="sales-invoice-form-field">
                        <span>توضیحات کالا:</span>
                        <input
                          aria-label="توضیحات کالا"
                          value={salesInvoiceDraftDescription}
                          onChange={(event) => setSalesInvoiceDraftDescription(event.target.value)}
                          placeholder="توضیحات کالا..."
                          disabled={!salesInvoiceDraftItem}
                        />
                      </label>
                    )}

                    <footer className="sales-invoice-item-actions">
                      <button type="button" onClick={() => commitSalesInvoiceDraftItem(false)}>بعدی <span aria-hidden="true">✓</span></button>
                      <button type="button" onClick={() => commitSalesInvoiceDraftItem(true)}>اتمام <span aria-hidden="true">×</span></button>
                    </footer>
                  </div>
                </section>
              </div>
            )}
            {salesInvoiceCatalogOpen && (
              <div
                className="sales-invoice-catalog-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setSalesInvoiceCatalogOpen(false)
                }}
              >
                <section
                  className="sales-invoice-catalog-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="sales-invoice-catalog-title"
                >
                  <header>
                    <div>
                      <span>انتخاب از فهرست انبار</span>
                      <h2 id="sales-invoice-catalog-title">فهرست کالا و خدمات</h2>
                    </div>
                    <button
                      type="button"
                      aria-label="بستن فهرست"
                      onClick={() => setSalesInvoiceCatalogOpen(false)}
                    >
                      ×
                    </button>
                  </header>
                  <div className="sales-invoice-catalog-content">
                    <div className="sales-invoice-catalog-kinds" role="group" aria-label="نوع فهرست">
                      {inventoryKinds.map((kind) => (
                        <button
                          key={kind}
                          className={salesInvoiceCatalogKind === kind ? 'active' : ''}
                          type="button"
                          aria-pressed={salesInvoiceCatalogKind === kind}
                          onClick={() => {
                            setSalesInvoiceCatalogKind(kind)
                            setSalesInvoiceCatalogGroup('همه')
                            setSalesInvoiceCatalogCategory('همه')
                            setSalesInvoiceCatalogSearch('')
                            const warehouses = kind === 'خدمات'
                              ? [DEFAULT_SERVICE_WAREHOUSE, ...(inventoryOptions.serviceWarehouses ?? [])]
                              : [DEFAULT_INVENTORY_WAREHOUSE, ...inventoryOptions.warehouses]
                            if (!warehouses.includes(salesInvoiceDraftWarehouse)) {
                              setSalesInvoiceDraftWarehouse(warehouses[0] ?? (
                                kind === 'خدمات' ? DEFAULT_SERVICE_WAREHOUSE : DEFAULT_INVENTORY_WAREHOUSE
                              ))
                            }
                          }}
                        >
                          <span aria-hidden="true">{kind === 'خدمات' ? '✦' : kind === 'تولید' ? '⚙' : '▦'}</span>
                          {kind}
                        </button>
                      ))}
                    </div>
                    {salesInvoiceCatalogKind && (
                      <>
                        <label className="sales-invoice-catalog-search">
                          <span aria-hidden="true">⌕</span>
                          <input
                            autoFocus
                            aria-label={`نام یا کد ${salesInvoiceCatalogKind}`}
                            value={salesInvoiceCatalogSearch}
                            onChange={(event) => setSalesInvoiceCatalogSearch(event.target.value)}
                            placeholder={`جست‌وجوی نام، کد یا بارکد ${salesInvoiceCatalogKind}`}
                          />
                        </label>
                        <div className="sales-invoice-catalog-filters">
                          <section className="sales-invoice-catalog-taxonomy" aria-label="گروه‌ها">
                            <span>گروه {salesInvoiceCatalogKind}</span>
                            <div role="group" aria-label={`گروه‌های ${salesInvoiceCatalogKind}`}>
                              <button
                                className={salesInvoiceCatalogGroup === 'همه' ? 'active' : ''}
                                type="button"
                                aria-pressed={salesInvoiceCatalogGroup === 'همه'}
                                onClick={() => {
                                  setSalesInvoiceCatalogGroup('همه')
                                  setSalesInvoiceCatalogCategory('همه')
                                }}
                              >
                                همه
                              </button>
                              {salesInvoiceCatalogGroups.map((group) => (
                                <button
                                  className={salesInvoiceCatalogGroup === group ? 'active' : ''}
                                  key={group}
                                  type="button"
                                  aria-pressed={salesInvoiceCatalogGroup === group}
                                  onClick={() => {
                                    setSalesInvoiceCatalogGroup(group)
                                    setSalesInvoiceCatalogCategory('همه')
                                  }}
                                >
                                  {group}
                                </button>
                              ))}
                            </div>
                          </section>
                          <section className="sales-invoice-catalog-taxonomy" aria-label="دسته‌بندی‌ها">
                            <span>
                              دسته‌بندی {salesInvoiceCatalogGroup === 'همه' ? 'همهٔ گروه‌ها' : salesInvoiceCatalogGroup}
                            </span>
                            <div role="group" aria-label={`دسته‌بندی‌های ${salesInvoiceCatalogKind}`}>
                              <button
                                className={salesInvoiceCatalogCategory === 'همه' ? 'active' : ''}
                                type="button"
                                aria-pressed={salesInvoiceCatalogCategory === 'همه'}
                                onClick={() => setSalesInvoiceCatalogCategory('همه')}
                              >
                                همه
                              </button>
                              {salesInvoiceCatalogCategories.map((category) => (
                                <button
                                  className={salesInvoiceCatalogCategory === category ? 'active' : ''}
                                  key={category}
                                  type="button"
                                  aria-pressed={salesInvoiceCatalogCategory === category}
                                  onClick={() => setSalesInvoiceCatalogCategory(category)}
                                >
                                  {category}
                                </button>
                              ))}
                            </div>
                          </section>
                        </div>
                        <div className="sales-invoice-catalog-results">
                          {filteredSalesInvoiceCatalogItems.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => selectSalesInvoiceItem(item)}
                            >
                              <span className="sales-invoice-picker-icon" aria-hidden="true">
                                {item.kind === 'خدمات' ? '✦' : '▦'}
                              </span>
                              <span>
                                <strong>{item.name}</strong>
                                <small>{item.group} · {item.category} · {item.unit}</small>
                              </span>
                              <b>
                                {formatPersonBalance(item.salePrice)} <small>ریال</small>
                                {salesInvoiceSettings.showPurchasePrice && (
                                  <small className="sales-invoice-purchase-price">
                                    خرید {formatPersonBalance(item.purchasePrice)}
                                  </small>
                                )}
                              </b>
                            </button>
                          ))}
                          {salesInvoiceCatalogSearch.trim()
                            && filteredSalesInvoiceCatalogItems.length === 0 && (
                            <p className="sales-invoice-catalog-empty">موردی با این نام پیدا نشد.</p>
                          )}
                          {!salesInvoiceCatalogSearch.trim()
                            && filteredSalesInvoiceCatalogItems.length === 0 && (
                            <p className="sales-invoice-catalog-empty">در این فهرست کالایی ثبت نشده است.</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </section>
              </div>
            )}
          </div>
          )
        ) : activeTab === 'حساب‌ها' ? (
          <div className="accounts-page">
            <section className="accounts-hero" aria-labelledby="accounts-title">
              <div className="accounts-hero-top">
                <span className="accounts-hero-icon" aria-hidden="true">
                  <Icon name="accounts" />
                </span>
                <span className="accounts-hero-caption">مدیریت مالی</span>
              </div>
              <h1 id="accounts-title">حساب‌های من</h1>
              <p>موجودی صندوق و حساب‌های بانکی فروشگاه</p>
            </section>

            <div className="accounts-total">
              <span>موجودی کل حساب‌ها</span>
              <strong>{formatPersonBalance(storedAccounts.accounts.reduce((total, account) => total + account.balance, 0))} <small>ریال</small></strong>
            </div>
            <div className="accounts-category-tabs" role="group" aria-label="دسته‌بندی حساب‌ها">
              {([
                { kind: 'بانکی', label: 'حساب‌ها' },
                { kind: 'صندوق', label: 'صندوق نقدی' },
              ] as const).map(({ kind, label }) => (
                <button
                  aria-pressed={accountListFilter === kind}
                  className={`accounts-category-tab ${accountListFilter === kind ? 'active' : ''}`}
                  key={kind}
                  onClick={() => setAccountListFilter(kind)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>

            <section className="accounts-toolbar" aria-label="ابزارهای حساب‌ها">
              <div className="inventory-actions accounts-actions" ref={accountActionsRef}>
                <button
                  aria-expanded={accountToolbarMenuOpen}
                  aria-label="گزینه‌های بیشتر حساب‌ها"
                  className="inventory-action more"
                  onClick={() => setAccountToolbarMenuOpen((isOpen) => !isOpen)}
                  type="button"
                >
                  <span className="inventory-action-icon" aria-hidden="true">⋮</span>
                </button>
                <button
                  aria-label="انتقال بین حساب‌ها"
                  className="inventory-action"
                  onClick={openAccountTransferForm}
                  title="انتقال بین حساب‌ها"
                  type="button"
                >
                  <svg className="accounts-toolbar-action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 7h15m0 0-4-4m4 4-4 4M20 17H5m0 0 4 4m-4-4 4-4" />
                  </svg>
                </button>
                <button
                  aria-label="پیامک بانک"
                  className="inventory-action"
                  onClick={() => showComingSoon('پیامک بانک')}
                  title="پیامک بانک"
                  type="button"
                >
                  <svg className="accounts-toolbar-action-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v9a2.5 2.5 0 0 1-2.5 2.5h-7l-4.5 4v-4.2A2.5 2.5 0 0 1 4 14.5z" />
                    <path d="M8 9h8m-8 4h5" />
                  </svg>
                </button>
                {accountToolbarMenuOpen && (
                  <div className="inventory-toolbar-menu accounts-toolbar-menu" role="menu" aria-label="گزینه‌های حساب‌ها">
                    {[{ label: 'گزارشات', icon: '▤' }].map((item) => (
                      <button
                        key={item.label}
                        role="menuitem"
                        type="button"
                        onClick={() => {
                          setAccountToolbarMenuOpen(false)
                          showComingSoon(item.label)
                        }}
                      >
                        <span className="accounts-toolbar-menu-icon" aria-hidden="true">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="accounts-list-section" aria-labelledby="accounts-list-title">
              <div className="accounts-list-heading">
                <div>
                  <span>مدیریت موجودی</span>
                  <h2 id="accounts-list-title">{accountListFilter === 'بانکی' ? 'حساب‌ها' : 'صندوق نقدی'}</h2>
                </div>
                <span className="accounts-count">{formatPersonBalance(visibleAccounts.length)} حساب</span>
              </div>
              {storedAccounts.error && (
                <p className="accounts-storage-error" role="alert">{storedAccounts.error}</p>
              )}
              {visibleAccounts.length > 0 ? (
                <div className="accounts-cards">
                  {visibleAccounts.map((account) => {
                    const bank = bankOptions.find((option) => option.name === account.bankName)
                    const accountActionMenu = accountActionMenuId === account.id ? (
                      <div className="account-card-action-menu" role="menu" aria-label={`عملیات حساب ${account.name}`}>
                        <button type="button" role="menuitem" onClick={() => openAccountEditForm(account)}>ویرایش</button>
                        <button className="delete" type="button" role="menuitem" onClick={() => deleteAccount(account)}>حذف</button>
                      </div>
                    ) : null
                    const accountActionTrigger = (
                      <button
                        className="account-card-action-trigger"
                        type="button"
                        aria-label={`عملیات حساب ${account.name}`}
                        aria-expanded={accountActionMenuId === account.id}
                        onClick={() => setAccountActionMenuId((current) => current === account.id ? null : account.id)}
                      >
                        <span aria-hidden="true">⋮</span>
                      </button>
                    )
                    const accountVisibilityToggle = (account.cardNumber || account.accountNumber || account.iban) ? (
                      <button
                        className="account-bank-card-visibility"
                        type="button"
                        aria-label={visibleAccountCardIds.has(account.id)
                          ? 'پنهان کردن اطلاعات بانکی'
                          : 'نمایش اطلاعات بانکی'}
                        aria-pressed={visibleAccountCardIds.has(account.id)}
                        onClick={() => setVisibleAccountCardIds((current) => {
                          const next = new Set(current)
                          if (next.has(account.id)) next.delete(account.id)
                          else next.add(account.id)
                          return next
                        })}
                      >
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          {visibleAccountCardIds.has(account.id) ? (
                            <>
                              <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                              <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.2 0 10 7 10 7a15.7 15.7 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.8 7 10 7a10.5 10.5 0 0 0 3-.4" />
                            </>
                          ) : (
                            <>
                              <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12Z" />
                              <circle cx="12" cy="12" r="3" />
                            </>
                          )}
                        </svg>
                      </button>
                    ) : null
                    const accountActionPressHandlers = {
                      onContextMenu: (event: React.MouseEvent<HTMLElement>) => event.preventDefault(),
                      onPointerDown: (event: ReactPointerEvent<HTMLElement>) => startAccountActionPress(event, account),
                      onPointerMove: moveAccountActionPress,
                      onPointerUp: clearAccountActionPress,
                      onPointerCancel: clearAccountActionPress,
                    }

                    return account.kind === 'بانکی' ? (
                      <article
                        className="account-card bank"
                        data-account-card={account.id}
                        key={account.id}
                        {...accountActionPressHandlers}
                      >
                        <div className="account-bank-card-content">
                          <div className="account-bank-card-top">
                            <div className="account-bank-card-brand">
                              <span className="account-bank-card-logo" aria-hidden="true">
                                {bank
                                  ? <img src={`/bank-logos/banks/${bank.logoFile}`} alt="" />
                                  : <span>بانک</span>}
                              </span>
                              <div className="account-bank-card-title">
                                <strong>{account.bankName || 'حساب بانکی'}</strong>
                                <span>حساب بانکی</span>
                              </div>
                            </div>
                            <div className="account-bank-card-actions">
                              {accountActionTrigger}
                              {accountVisibilityToggle}
                              {accountActionMenu}
                            </div>
                          </div>

                          {bank && (
                            <img
                              className="account-bank-card-watermark"
                              src={`/bank-logos/banks/${bank.logoFile}`}
                              alt=""
                              aria-hidden="true"
                            />
                          )}

                          {account.iban && (
                            <div className="account-bank-card-iban">
                              <span>شماره شبا</span>
                              <strong dir="ltr">{visibleAccountCardIds.has(account.id)
                                ? account.iban.replace(/(.{4})(?=.)/g, '$1 ')
                                : `IR •••• •••• •••• •••• •••• ${account.iban.slice(-4)}`}</strong>
                            </div>
                          )}

                          <div className="account-bank-card-number" dir="ltr">
                            <span className="account-bank-card-number-value">
                              {account.cardNumber
                                ? visibleAccountCardIds.has(account.id)
                                  ? account.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
                                  : `•••• •••• •••• ${account.cardNumber.slice(-4)}`
                                : 'شماره کارت ثبت نشده'}
                            </span>
                          </div>

                          {account.accountNumber && (
                            <div className="account-bank-card-account-number" dir="rtl">
                                <span>شماره حساب</span>
                                <strong dir="ltr">{visibleAccountCardIds.has(account.id)
                                  ? account.accountNumber.replace(/(.{4})(?=.)/g, '$1 ')
                                  : `•••• ${account.accountNumber.slice(-4)}`}</strong>
                            </div>
                          )}

                          <div className="account-bank-card-bottom">
                            <div className="account-bank-card-detail">
                                <span>نام صاحب حساب</span>
                                <strong>{account.ownerName ?? account.name}</strong>
                            </div>
                            <div className="account-bank-card-detail balance">
                              <span>موجودی</span>
                              <strong>{formatPersonBalance(account.balance)} <small>ریال</small></strong>
                            </div>
                          </div>
                        </div>
                      </article>
                    ) : (
                      <article
                        className="account-card cash"
                        data-account-card={account.id}
                        key={account.id}
                        {...accountActionPressHandlers}
                      >
                        <div className="account-cash-card-content">
                          <div className="account-cash-card-top">
                            <div className="account-cash-card-brand">
                              <span className="account-cash-card-icon" aria-hidden="true">
                                <svg viewBox="0 0 32 32" fill="none">
                                  <rect x="4" y="9" width="23" height="16" rx="3" />
                                  <path d="M7 12h2m13 10h2" />
                                  <circle cx="15.5" cy="17" r="4" />
                                  <path d="M22 6v8m-2.5-6h3a1.5 1.5 0 0 1 0 3h-2a1.5 1.5 0 0 0 0 3h3" />
                                </svg>
                              </span>
                              <div className="account-cash-card-title">
                                <strong>{account.name}</strong>
                                <span>صندوق نقدی</span>
                              </div>
                            </div>
                            <div className="account-cash-card-actions">
                              {accountActionTrigger}
                              {accountActionMenu}
                            </div>
                          </div>
                          <div className="account-cash-card-balance">
                            <span>موجودی صندوق</span>
                            <strong>{formatPersonBalance(account.balance)} <small>ریال</small></strong>
                          </div>
                          <div className="account-cash-card-footer">
                            <span>حساب نقدی</span>
                            <span className="account-cash-card-status"><i aria-hidden="true" /> فعال</span>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="accounts-empty">
                  <span className="accounts-empty-icon" aria-hidden="true">
                    <Icon name="accounts" />
                  </span>
                  <strong>
                    {accountListFilter === 'بانکی'
                      ? 'هنوز حساب بانکی اضافه نشده است'
                      : 'هنوز صندوق نقدی اضافه نشده است'}
                  </strong>
                  <p>
                    {accountListFilter === 'بانکی'
                      ? 'کارت‌ها و حساب‌های بانکی ثبت‌شده در این بخش نمایش داده می‌شوند.'
                      : 'صندوق‌های نقدی ثبت‌شده در این بخش نمایش داده می‌شوند.'}
                  </p>
                </div>
              )}
            </section>

            <button
              className="accounts-add-button"
              type="button"
              aria-label="افزودن حساب"
              title="افزودن حساب"
              onClick={openAccountForm}
            >
              <span className="accounts-add-icon accounts-add-icon-bank" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="2.5" />
                  <path d="M3 9h18M7 15h4" />
                </svg>
              </span>
              <span className="accounts-add-icon accounts-add-icon-cash" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="2.5" y="7" width="15" height="11" rx="1.8" />
                  <path d="M5 9.5h.01M15 15.5h.01" />
                  <circle cx="10" cy="12.5" r="2.4" />
                  <circle cx="18" cy="7" r="3.5" />
                  <path d="M18 5.2v3.6m1.1-2.7h-1.6a.9.9 0 1 0 0 1.8h1a.9.9 0 1 1 0 1.8h-1.6" />
                </svg>
              </span>
            </button>
            {accountFormOpen && (
              <div
                className="account-form-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setAccountFormOpen(false)
                }}
              >
                <section
                  className="account-form-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="account-form-title"
                >
                  <header className="account-form-heading">
                    <div>
                      <span>مدیریت مالی <i aria-hidden="true">•</i> حساب‌ها</span>
                      <h2 id="account-form-title">{editingAccountId ? 'ویرایش حساب' : 'افزودن حساب جدید'}</h2>
                      <p>مشخصات حساب صندوق یا بانکی را وارد کنید.</p>
                    </div>
                    <button
                      type="button"
                      aria-label="بستن پنجره"
                      onClick={() => {
                        setAccountFormOpen(false)
                        setEditingAccountId(null)
                      }}
                    >
                      ×
                    </button>
                  </header>
                  <form className="account-form" onSubmit={saveAccount}>
                    <fieldset className="account-kind-options">
                      <legend>نوع حساب</legend>
                      {(['بانکی', 'صندوق'] as const).map((kind) => (
                        <label className={accountFormFields.kind === kind ? 'selected' : ''} key={kind}>
                          <input
                            type="radio"
                            name="account-kind"
                            value={kind}
                            checked={accountFormFields.kind === kind}
                            onChange={() => {
                              setAccountFormFields((fields) => ({ ...fields, kind }))
                              setAccountBankPickerOpen(false)
                              setAccountFormError('')
                            }}
                          />
                          <span>{kind === 'صندوق' ? '▣' : '▤'}</span>
                          <strong>{kind}</strong>
                        </label>
                      ))}
                    </fieldset>
                    {accountFormFields.kind === 'بانکی' && (
                      <>
                        <div className="account-form-field">
                          <span>انتخاب بانک</span>
                          <div className="account-bank-picker">
                            <button
                              className={`account-bank-trigger ${accountBankPickerOpen ? 'open' : ''}`}
                              type="button"
                              aria-expanded={accountBankPickerOpen}
                              aria-controls="account-bank-options"
                              onClick={() => {
                                setAccountBankPickerOpen(!accountBankPickerOpen)
                                setAccountBankSearch('')
                              }}
                            >
                              <span className="account-bank-choice-logo" aria-hidden="true">
                                {bankOptions.find((bank) => bank.name === accountFormFields.bankName)
                                  ? <img src={`/bank-logos/banks/${bankOptions.find((bank) => bank.name === accountFormFields.bankName)?.logoFile}`} alt="" />
                                  : '▤'}
                              </span>
                              <span>{accountFormFields.bankName || 'بانک را انتخاب کنید'}</span>
                              <span className="dropdown-chevron account-bank-chevron" aria-hidden="true">⌄</span>
                            </button>
                            {accountBankPickerOpen && (
                              <div className="account-bank-menu" id="account-bank-options">
                                <input
                                  autoFocus
                                  className="account-bank-search"
                                  type="search"
                                  value={accountBankSearch}
                                  onChange={(event) => setAccountBankSearch(event.target.value)}
                                  placeholder="جست‌وجوی بانک"
                                  aria-label="جست‌وجوی بانک"
                                />
                                <div className="account-bank-options" role="listbox" aria-label="بانک‌ها">
                                  {bankOptions
                                    .filter((bank) => bank.name.includes(accountBankSearch.trim()))
                                    .map((bank) => (
                                      <button
                                        className={`account-bank-option ${accountFormFields.bankName === bank.name ? 'selected' : ''}`}
                                        key={bank.name}
                                        type="button"
                                        role="option"
                                        aria-selected={accountFormFields.bankName === bank.name}
                                        onClick={() => {
                                          setAccountFormFields((fields) => ({ ...fields, bankName: bank.name }))
                                          setAccountBankPickerOpen(false)
                                          setAccountBankSearch('')
                                          setAccountFormError(getAccountCardBankMismatch(
                                            bank.name,
                                            accountFormFields.cardNumberParts.join(''),
                                          ))
                                        }}
                                      >
                                        <span className="account-bank-choice-logo" aria-hidden="true">
                                          <img src={`/bank-logos/banks/${bank.logoFile}`} alt="" />
                                        </span>
                                        <span>{bank.name}</span>
                                      </button>
                                    ))}
                                  {bankOptions.filter((bank) => bank.name.includes(accountBankSearch.trim())).length === 0 && (
                                    <p className="account-bank-empty">بانکی با این نام پیدا نشد.</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <label className="account-form-field">
                          <span>نام صاحب حساب</span>
                          <input
                            value={accountFormFields.name}
                            onChange={(event) => setAccountFormFields({ ...accountFormFields, name: event.target.value })}
                            placeholder="نام و نام خانوادگی صاحب حساب"
                          />
                        </label>
                        <fieldset className="account-card-number-field">
                          <legend>شماره کارت بانکی</legend>
                          <div className="account-card-number-parts" dir="ltr">
                            {accountFormFields.cardNumberParts.map((part, index) => (
                              <input
                                key={index}
                                ref={(element) => { accountCardNumberRefs.current[index] = element }}
                                inputMode="numeric"
                                autoComplete="cc-number"
                                maxLength={4}
                                aria-label={`بخش ${index + 1} از ۴ شماره کارت`}
                                value={part}
                                onChange={(event) => {
                                  const digits = normalizeAccountDigits(event.target.value).slice(0, 4)
                                  const cardNumberParts = [...accountFormFields.cardNumberParts] as AccountFormFields['cardNumberParts']
                                  cardNumberParts[index] = digits
                                  const cardNumber = cardNumberParts.join('')
                                  const bankName = getAccountCardAutoSelectedBank(accountFormFields.bankName, cardNumber)
                                  setAccountFormFields({ ...accountFormFields, bankName, cardNumberParts })
                                  setAccountFormError(getAccountCardBankMismatch(
                                    bankName,
                                    cardNumber,
                                  ))
                                  if (digits.length === 4 && index < 3) accountCardNumberRefs.current[index + 1]?.focus()
                                }}
                                onPaste={(event) => {
                                  const pastedDigits = normalizeAccountDigits(event.clipboardData.getData('text'))
                                  if (pastedDigits.length < 4) return
                                  event.preventDefault()
                                  const digits = pastedDigits.slice(0, 16).padEnd(16, '')
                                  const cardNumberParts = [
                                    digits.slice(0, 4),
                                    digits.slice(4, 8),
                                    digits.slice(8, 12),
                                    digits.slice(12, 16),
                                  ] as AccountFormFields['cardNumberParts']
                                  const cardNumber = cardNumberParts.join('')
                                  const bankName = getAccountCardAutoSelectedBank(accountFormFields.bankName, cardNumber)
                                  setAccountFormFields((fields) => ({ ...fields, bankName, cardNumberParts }))
                                  setAccountFormError(getAccountCardBankMismatch(
                                    bankName,
                                    cardNumber,
                                  ))
                                  accountCardNumberRefs.current[3]?.focus()
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === 'Backspace' && !part && index > 0) {
                                    accountCardNumberRefs.current[index - 1]?.focus()
                                  }
                                  if (event.key === 'ArrowLeft' && index < 3) accountCardNumberRefs.current[index + 1]?.focus()
                                  if (event.key === 'ArrowRight' && index > 0) accountCardNumberRefs.current[index - 1]?.focus()
                                }}
                                placeholder="••••"
                              />
                            ))}
                          </div>
                        </fieldset>
                        <label className="account-form-field">
                          <span>شماره حساب <small>اختیاری</small></span>
                          <input
                            inputMode="numeric"
                            maxLength={30}
                            value={accountFormFields.accountNumber}
                            onChange={(event) => setAccountFormFields((fields) => ({
                              ...fields,
                              accountNumber: normalizeAccountDigits(event.target.value).slice(0, 30),
                            }))}
                            placeholder="شماره حساب بانکی"
                          />
                        </label>
                        <label className="account-form-field">
                          <span>شماره شبا <small>اختیاری</small></span>
                          <input
                            dir="ltr"
                            inputMode="text"
                            maxLength={26}
                            value={accountFormFields.iban}
                            onChange={(event) => setAccountFormFields((fields) => ({
                              ...fields,
                              iban: normalizeAccountIban(event.target.value),
                            }))}
                            placeholder="IR و ۲۴ رقم"
                          />
                        </label>
                        {accountFormFields.bankName && !bankOptions.find(
                          (bank) => bank.name === accountFormFields.bankName,
                        )?.cardPrefixes.length && (
                          <p className="account-card-prefix-note" role="note">
                            پیش‌شمارهٔ تأییدشده‌ای برای این بانک در فهرست موجود نیست؛ کارت‌های شناخته‌شدهٔ سایر بانک‌ها رد می‌شوند.
                          </p>
                        )}
                      </>
                    )}
                    {accountFormFields.kind === 'صندوق' && (
                      <label className="account-form-field">
                        <span>نام حساب</span>
                        <input
                          autoFocus
                          value={accountFormFields.name}
                          onChange={(event) => setAccountFormFields({ ...accountFormFields, name: event.target.value })}
                          placeholder="مثلاً صندوق فروشگاه"
                        />
                      </label>
                    )}
                    <label className="account-form-field">
                      <span>موجودی اولیه <small>ریال</small></span>
                      <input
                        inputMode="numeric"
                        value={formatAccountBalanceInput(accountFormFields.balance)}
                        onChange={(event) => {
                          const input = event.currentTarget
                          const rawValue = input.value
                          const cursor = input.selectionStart ?? rawValue.length
                          const digitsBeforeCursor = normalizeAccountDigits(rawValue.slice(0, cursor)).length
                          const balance = formatAccountBalanceInput(rawValue)
                          let nextCursor = 0
                          let digitsSeen = 0
                          while (nextCursor < balance.length && digitsSeen < digitsBeforeCursor) {
                            if (/[۰-۹]/.test(balance[nextCursor])) digitsSeen += 1
                            nextCursor += 1
                          }
                          setAccountFormFields((fields) => ({ ...fields, balance }))
                          requestAnimationFrame(() => input.setSelectionRange(nextCursor, nextCursor))
                        }}
                        placeholder="۰"
                      />
                    </label>
                    {accountFormFields.kind === 'بانکی' && (
                      <label className="account-form-field">
                        <span>شماره پیامک بانک <small>اختیاری</small></span>
                        <input
                          inputMode="tel"
                          value={accountFormFields.smsNumber}
                          onChange={(event) => setAccountFormFields({ ...accountFormFields, smsNumber: event.target.value })}
                          placeholder="شمارهٔ فرستندهٔ پیامک بانکی"
                        />
                      </label>
                    )}
                    {accountFormError && <p className="account-form-error" role="alert">{accountFormError}</p>}
                    <footer className="account-form-actions">
                      <button type="button" onClick={() => {
                        setAccountFormOpen(false)
                        setEditingAccountId(null)
                      }}>انصراف</button>
                      <button type="submit">{editingAccountId ? 'ذخیرهٔ تغییرات' : 'تأیید و افزودن حساب'}</button>
                    </footer>
                  </form>
                </section>
              </div>
            )}
            {accountTransferOpen && (
              <div
                className="account-transfer-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setAccountTransferOpen(false)
                }}
              >
                <section
                  aria-labelledby="account-transfer-title"
                  aria-modal="true"
                  className="account-transfer-dialog"
                  role="dialog"
                >
                  <header className="account-transfer-heading">
                    <div>
                      <span>مدیریت مالی <i aria-hidden="true">•</i> حساب‌ها</span>
                      <h2 id="account-transfer-title">انتقال بین حساب‌ها</h2>
                    </div>
                    <button
                      aria-label="بستن پنجره"
                      onClick={() => setAccountTransferOpen(false)}
                      type="button"
                    >
                      ×
                    </button>
                  </header>
                  <form className="account-transfer-form" onSubmit={saveAccountTransfer}>
                    <div className="sales-invoice-meta account-transfer-meta" aria-label="اطلاعات انتقال">
                      <button
                        className="sales-invoice-meta-pill sales-invoice-date-trigger"
                        type="button"
                        aria-label="انتخاب تاریخ انتقال"
                        onClick={openAccountTransferDatePicker}
                      >
                        <span aria-hidden="true">▦</span>
                        <strong>
                          {formatCalendarDate(
                            new Date(`${accountTransferFields.date}T12:00:00Z`),
                            accountTransferFields.calendar,
                          )}
                        </strong>
                        <small>
                          {invoiceCalendars.find((calendar) => calendar.id === accountTransferFields.calendar)?.label}
                        </small>
                      </button>
                      <button
                        className="sales-invoice-meta-pill sales-invoice-time-trigger"
                        type="button"
                        aria-label="انتخاب ساعت انتقال"
                        onClick={openAccountTransferTimePicker}
                      >
                        <span aria-hidden="true">◷</span>
                        <strong>
                          {accountTransferFields.time.split(':')
                            .map((part) => formatClockNumber(Number(part)).padStart(2, '۰'))
                            .join(':')}
                        </strong>
                      </button>
                      <button
                        className={accountTransferFields.attachment ? 'active' : ''}
                        type="button"
                        aria-label={accountTransferFields.attachment ? 'مدیریت پیوست انتقال' : 'افزودن پیوست انتقال'}
                        aria-expanded={accountTransferAttachmentPickerOpen}
                        onClick={openAccountTransferAttachmentPicker}
                      >
                        <span aria-hidden="true">{accountTransferFields.attachment ? '✓' : '↗'}</span>
                        {accountTransferFields.attachment ? 'پیوست شد' : 'پیوست'}
                      </button>
                    </div>
                    <label className="account-transfer-amount">
                      <span>مبلغ انتقال <small>ریال</small></span>
                      <span className="account-transfer-amount-input">
                        <b aria-hidden="true">ریال</b>
                        <input
                          aria-label="مبلغ انتقال به ریال"
                          autoFocus
                          inputMode="numeric"
                          onChange={(event) => setAccountTransferFields((fields) => ({
                            ...fields,
                            amount: formatAccountBalanceInput(event.target.value),
                          }))}
                          placeholder="۰"
                          value={formatAccountBalanceInput(accountTransferFields.amount)}
                        />
                      </span>
                    </label>
                    <label className="account-transfer-account">
                      <span>مبدأ</span>
                      <select
                        aria-label="حساب مبدأ"
                        onChange={(event) => setAccountTransferFields((fields) => ({
                          ...fields,
                          sourceAccountId: event.target.value,
                        }))}
                        value={accountTransferFields.sourceAccountId}
                      >
                        <option value="">انتخاب حساب مبدأ</option>
                        {storedAccounts.accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.kind === 'بانکی' ? account.bankName || account.name : account.name}
                          </option>
                        ))}
                      </select>
                      <small>
                        موجودی: {formatPersonBalance(
                          storedAccounts.accounts.find((account) => account.id === accountTransferFields.sourceAccountId)?.balance ?? 0,
                        )} ریال
                      </small>
                    </label>
                    <span className="account-transfer-direction" aria-hidden="true">↓</span>
                    <label className="account-transfer-account">
                      <span>مقصد</span>
                      <select
                        aria-label="حساب مقصد"
                        onChange={(event) => setAccountTransferFields((fields) => ({
                          ...fields,
                          destinationAccountId: event.target.value,
                        }))}
                        value={accountTransferFields.destinationAccountId}
                      >
                        <option value="">انتخاب حساب مقصد</option>
                        {storedAccounts.accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.kind === 'بانکی' ? account.bankName || account.name : account.name}
                          </option>
                        ))}
                      </select>
                      <small>
                        موجودی: {formatPersonBalance(
                          storedAccounts.accounts.find((account) => account.id === accountTransferFields.destinationAccountId)?.balance ?? 0,
                        )} ریال
                      </small>
                    </label>
                    <label className="account-transfer-note">
                      <span>توضیحات <small>اختیاری</small></span>
                      <textarea
                        maxLength={240}
                        onChange={(event) => setAccountTransferFields((fields) => ({ ...fields, note: event.target.value }))}
                        placeholder="توضیح کوتاهی برای این انتقال بنویسید"
                        rows={2}
                        value={accountTransferFields.note}
                      />
                    </label>
                    {storedAccounts.accounts.length < 2 && (
                      <p className="account-transfer-hint" role="note">برای انتقال، دست‌کم دو حساب ثبت‌شده لازم است.</p>
                    )}
                    {accountTransferError && <p className="account-transfer-error" role="alert">{accountTransferError}</p>}
                    <footer className="account-transfer-actions">
                      <button onClick={() => setAccountTransferOpen(false)} type="button">
                        <span aria-hidden="true">×</span>
                        لغو
                      </button>
                      <button disabled={storedAccounts.accounts.length < 2} type="submit">
                        تأیید
                        <span aria-hidden="true">✓</span>
                      </button>
                    </footer>
                  </form>
                </section>
              </div>
            )}
            {accountTransferDatePickerOpen && (
              <div
                className="sales-invoice-date-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setAccountTransferDatePickerOpen(false)
                }}
              >
                <section
                  className="sales-invoice-date-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="account-transfer-date-title"
                >
                  <header className="sales-invoice-date-heading">
                    <div>
                      <span>تاریخ ثبت انتقال</span>
                      <h2 id="account-transfer-date-title">انتخاب تاریخ</h2>
                    </div>
                    <button
                      type="button"
                      aria-label="بستن انتخاب تاریخ"
                      onClick={() => setAccountTransferDatePickerOpen(false)}
                    >
                      ×
                    </button>
                  </header>
                  <div className="sales-invoice-date-previews" aria-label="تاریخ در سه تقویم">
                    {invoiceCalendars.map((calendar) => (
                      <div key={calendar.id}>
                        <span>{calendar.label}</span>
                        <strong>{formatCalendarDate(accountTransferDraftDate, calendar.id)}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="sales-invoice-calendar-tabs" role="tablist" aria-label="نوع تقویم">
                    {invoiceCalendars.map((calendar) => (
                      <button
                        key={calendar.id}
                        type="button"
                        role="tab"
                        aria-selected={accountTransferDraftCalendar === calendar.id}
                        className={accountTransferDraftCalendar === calendar.id ? 'active' : ''}
                        onClick={() => {
                          setAccountTransferDraftCalendar(calendar.id)
                          setAccountTransferVisibleMonth(accountTransferDraftDate)
                        }}
                      >
                        {calendar.label}
                      </button>
                    ))}
                  </div>
                  <div className="sales-invoice-calendar-month">
                    <button
                      type="button"
                      aria-label="ماه قبل"
                      onClick={() => setAccountTransferVisibleMonth((month) =>
                        getAdjacentCalendarMonthDate(month, accountTransferDraftCalendar, -1))}
                    >
                      ‹
                    </button>
                    <strong>
                      {new Intl.DateTimeFormat(`fa-IR-u-ca-${accountTransferDraftCalendar}-nu-arabext`, {
                        month: 'long',
                        year: 'numeric',
                        timeZone: 'UTC',
                      }).format(accountTransferVisibleMonth)}
                    </strong>
                    <button
                      type="button"
                      aria-label="ماه بعد"
                      onClick={() => setAccountTransferVisibleMonth((month) =>
                        getAdjacentCalendarMonthDate(month, accountTransferDraftCalendar, 1))}
                    >
                      ›
                    </button>
                  </div>
                  <div className="sales-invoice-calendar-grid" role="grid" aria-label="روزهای ماه">
                    {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day, index) => (
                      <span className="weekday" role="columnheader" key={`${day}-${index}`}>{day}</span>
                    ))}
                    {(() => {
                      const dates = getCalendarMonthDates(accountTransferVisibleMonth, accountTransferDraftCalendar)
                      const firstDayOffset = (dates[0].getUTCDay() + 1) % 7
                      const selectedDate = normalizeUtcDate(accountTransferDraftDate).toISOString().slice(0, 10)
                      const today = todayInvoiceDate.toISOString().slice(0, 10)
                      return (
                        <>
                          {Array.from({ length: firstDayOffset }, (_, index) => (
                            <span className="empty-day" role="gridcell" key={`empty-${index}`} />
                          ))}
                          {dates.map((date) => {
                            const dateKey = date.toISOString().slice(0, 10)
                            const isSelected = dateKey === selectedDate
                            return (
                              <button
                                className={[
                                  dateKey === today ? 'today' : '',
                                  isSelected ? 'selected' : '',
                                ].filter(Boolean).join(' ')}
                                type="button"
                                role="gridcell"
                                aria-label={formatCalendarDate(date, accountTransferDraftCalendar, true)}
                                aria-pressed={isSelected}
                                key={dateKey}
                                onClick={() => setAccountTransferDraftDate(date)}
                              >
                                {new Intl.DateTimeFormat(`fa-IR-u-ca-${accountTransferDraftCalendar}-nu-arabext`, {
                                  day: 'numeric',
                                  timeZone: 'UTC',
                                }).format(date)}
                              </button>
                            )
                          })}
                        </>
                      )
                    })()}
                  </div>
                  <div className="sales-invoice-date-actions">
                    <button
                      className="today-action"
                      type="button"
                      onClick={() => {
                        setAccountTransferDraftDate(todayInvoiceDate)
                        setAccountTransferVisibleMonth(todayInvoiceDate)
                      }}
                    >
                      امروز
                    </button>
                    <div>
                      <button type="button" onClick={() => setAccountTransferDatePickerOpen(false)}>انصراف</button>
                      <button className="confirm" type="button" onClick={saveAccountTransferDate}>تأیید تاریخ</button>
                    </div>
                  </div>
                </section>
              </div>
            )}
            {accountTransferTimePickerOpen && (
              <div
                className="sales-invoice-date-backdrop sales-invoice-time-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setAccountTransferTimePickerOpen(false)
                }}
              >
                <section
                  className="sales-invoice-date-dialog sales-invoice-time-dialog keyboard-mode"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="account-transfer-time-title"
                >
                  <header className="sales-invoice-date-heading">
                    <div>
                      <span>ساعت ثبت انتقال</span>
                      <h2 id="account-transfer-time-title">انتخاب ساعت</h2>
                    </div>
                    <button
                      type="button"
                      aria-label="بستن انتخاب ساعت"
                      onClick={() => setAccountTransferTimePickerOpen(false)}
                    >
                      ×
                    </button>
                  </header>
                  <div className="sales-invoice-time-keyboard" aria-label="ورود زمان با صفحه‌کلید">
                    <label className="active">
                      <input
                        aria-label="ساعت انتقال"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9۰-۹٠-٩]*"
                        maxLength={2}
                        value={formatClockNumber(accountTransferDraftTime.hours).padStart(2, '۰')}
                        onChange={(event) => {
                          const parsed = parseClockNumber(event.target.value)
                          if (parsed !== null) {
                            setAccountTransferDraftTime((time) => ({ ...time, hours: Math.max(0, Math.min(23, parsed)) }))
                          }
                        }}
                      />
                      <span>ساعت</span>
                    </label>
                    <span className="separator" aria-hidden="true">:</span>
                    <label className="active">
                      <input
                        aria-label="دقیقه انتقال"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9۰-۹٠-٩]*"
                        maxLength={2}
                        value={formatClockNumber(accountTransferDraftTime.minutes).padStart(2, '۰')}
                        onChange={(event) => {
                          const parsed = parseClockNumber(event.target.value)
                          if (parsed !== null) {
                            setAccountTransferDraftTime((time) => ({ ...time, minutes: Math.max(0, Math.min(59, parsed)) }))
                          }
                        }}
                      />
                      <span>دقیقه</span>
                    </label>
                  </div>
                  <div className="sales-invoice-date-actions sales-invoice-time-actions">
                    <span className="sales-invoice-time-mode" aria-hidden="true">◷</span>
                    <div>
                      <button type="button" onClick={() => setAccountTransferTimePickerOpen(false)}>لغو</button>
                      <button className="confirm" type="button" onClick={saveAccountTransferTime}>تأیید</button>
                    </div>
                  </div>
                </section>
              </div>
            )}
            {accountTransferAttachmentPickerOpen && (
              <div
                className="sales-invoice-date-backdrop sales-invoice-attachment-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) closeAccountTransferAttachmentPicker()
                }}
              >
                <section
                  className="sales-invoice-date-dialog sales-invoice-attachment-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="account-transfer-attachment-title"
                >
                  <header className="sales-invoice-date-heading">
                    <div>
                      <span>تصویر سند انتقال</span>
                      <h2 id="account-transfer-attachment-title">پیوست عکس</h2>
                    </div>
                    <button
                      type="button"
                      aria-label="بستن پنجره پیوست"
                      onClick={closeAccountTransferAttachmentPicker}
                    >
                      ×
                    </button>
                  </header>
                  <div className="sales-invoice-attachment-content">
                    <div className="sales-invoice-attachment-choices">
                      <button type="button" onClick={() => accountTransferGalleryInputRef.current?.click()}>
                        <span aria-hidden="true">▧</span>
                        <strong>انتخاب از گالری</strong>
                        <small>عکس موجود در گوشی یا دستگاه</small>
                      </button>
                      <button type="button" onClick={() => accountTransferCameraInputRef.current?.click()}>
                        <span aria-hidden="true">◎</span>
                        <strong>گرفتن عکس</strong>
                        <small>باز کردن دوربین دستگاه</small>
                      </button>
                    </div>
                    <input
                      ref={accountTransferGalleryInputRef}
                      className="sales-invoice-file-input"
                      type="file"
                      accept="image/*"
                      aria-label="انتخاب عکس از گالری"
                      onChange={handleAccountTransferAttachmentChange}
                    />
                    <input
                      ref={accountTransferCameraInputRef}
                      className="sales-invoice-file-input"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      aria-label="گرفتن عکس با دوربین"
                      onChange={handleAccountTransferAttachmentChange}
                    />
                    {accountTransferAttachmentError && (
                      <p className="sales-invoice-attachment-error" role="alert">{accountTransferAttachmentError}</p>
                    )}
                    {accountTransferDraftAttachment ? (
                      <div className="sales-invoice-attachment-preview">
                        <img
                          src={accountTransferDraftAttachment.dataUrl}
                          alt={`پیش‌نمایش ${accountTransferDraftAttachment.name}`}
                        />
                        <div className="sales-invoice-attachment-file">
                          <strong>{accountTransferDraftAttachment.name}</strong>
                          <small>تصویر پیوست</small>
                        </div>
                      </div>
                    ) : (
                      <div className="sales-invoice-attachment-empty">
                        <span aria-hidden="true">▧</span>
                        <strong>هنوز عکسی انتخاب نشده</strong>
                        <small>از گالری انتخاب کن یا با دوربین عکس بگیر.</small>
                      </div>
                    )}
                  </div>
                  <div className="sales-invoice-date-actions sales-invoice-attachment-actions">
                    <button
                      className="sales-invoice-attachment-remove"
                      type="button"
                      aria-label="حذف عکس پیوست"
                      disabled={!accountTransferDraftAttachment}
                      onClick={() => {
                        setAccountTransferDraftAttachment(null)
                        setAccountTransferAttachmentError('')
                      }}
                    >
                      <span aria-hidden="true">×</span>
                      حذف
                    </button>
                    <div className="sales-invoice-attachment-actions-group">
                      <button
                        className="sales-invoice-attachment-cancel"
                        type="button"
                        onClick={closeAccountTransferAttachmentPicker}
                      >
                        لغو
                      </button>
                      <button
                        className="confirm"
                        type="button"
                        onClick={confirmAccountTransferAttachment}
                      >
                        تأیید پیوست
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        ) : activeTab === 'کالا و انبار' ? (
          <div className="inventory-page">
            {inventoryStocktakeOpen && (
              <section
                className="inventory-stocktake-page"
                role="dialog"
                aria-modal="true"
                aria-labelledby="inventory-stocktake-title"
              >
                {inventoryWarehouseStatsOpen && (
                  <section
                    className="inventory-warehouse-stats-page"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="inventory-warehouse-stats-title"
                  >
                    <header className="inventory-stocktake-header">
                      <div className="inventory-stocktake-title-row">
                        <div>
                          <span className="inventory-stocktake-step">نمای کلی موجودی کالا</span>
                          <h1 id="inventory-warehouse-stats-title">آمارگیری انبارها تفکیکی</h1>
                        </div>
                        <button
                          type="button"
                          aria-label="بازگشت به انبارگردانی"
                          onClick={() => setInventoryWarehouseStatsOpen(false)}
                        >
                          <span aria-hidden="true">←</span>
                        </button>
                      </div>
                      <p>موجودی هر کالا را به تفکیک تمام انبارها ببینید.</p>
                    </header>
                    <div className="inventory-warehouse-stats-content">
                      <label className="inventory-warehouse-stats-search">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="10.8" cy="10.8" r="6.8" />
                          <path d="m16 16 5 5" />
                        </svg>
                        <input
                          type="search"
                          aria-label="جست‌وجوی کالا در همهٔ انبارها"
                          placeholder="جست‌وجو بر اساس نام یا کد کالا"
                          value={inventoryWarehouseStatsSearch}
                          onChange={(event) => setInventoryWarehouseStatsSearch(event.target.value)}
                        />
                      </label>
                      <div className="inventory-warehouse-stats-summary" aria-live="polite">
                        {inventoryWarehouseStatsItems.length
                          ? `${formatPersonBalance(inventoryWarehouseStatsItems.length)} کالا`
                          : inventoryWarehouseStatsQuery
                            ? 'کالایی با این نام یا کد پیدا نشد'
                            : 'هنوز کالایی در فهرست ثبت نشده است'}
                      </div>
                      <div className="inventory-warehouse-stats-list">
                        {inventoryWarehouseStatsItems.map(({ catalogId, item, stockByWarehouse }) => (
                          <article className="inventory-warehouse-stats-card" key={catalogId}>
                            <header>
                              <div>
                                <strong>{item.name}</strong>
                                <span>کد کالا: {item.code || '—'}</span>
                              </div>
                              {item.barcode && <small>بارکد: {item.barcode}</small>}
                            </header>
                            <ul>
                              {stockByWarehouse.map(({ warehouse, item: warehouseItem }) => (
                                <li key={warehouse}>
                                  <span>{warehouse}</span>
                                  <strong>
                                    {formatStocktakeQuantity(warehouseItem?.stock ?? 0)}
                                    {' '}
                                    {warehouseItem?.unit ?? item.unit}
                                  </strong>
                                </li>
                              ))}
                            </ul>
                          </article>
                        ))}
                      </div>
                    </div>
                  </section>
                )}
                <header className="inventory-stocktake-header">
                  <div className="inventory-stocktake-title-row">
                    <div>
                      <span className="inventory-stocktake-step">انبار {inventoryKind}</span>
                      <h1 id="inventory-stocktake-title">
                        انبارگردانی {inventoryKind === 'کالا' ? 'کالاها' : inventoryKind}
                      </h1>
                    </div>
                    <button
                      type="button"
                      aria-label="بازگشت به فهرست"
                      onClick={() => {
                        setInventoryStocktakeOpen(false)
                      }}
                    >
                      <span aria-hidden="true">←</span>
                    </button>
                  </div>
                  <p>تعداد واقعی هر مورد را وارد کنید تا اختلاف با موجودی سیستم مشخص شود.</p>
                </header>

                <div className="inventory-stocktake-content">
                  <div className="inventory-stocktake-toolbar">
                    {inventoryKind === 'کالا' && (
                      <button
                        className="inventory-stocktake-transfer-button inventory-warehouse-stats-button"
                        type="button"
                        onClick={() => {
                          setInventoryWarehouseStatsSearch('')
                          setInventoryWarehouseStatsOpen(true)
                        }}
                      >
                        <span aria-hidden="true">▤</span>
                        آمارگیری انبارها تفکیکی
                      </button>
                    )}
                    {inventoryKind === 'کالا' && (
                      <button
                        className="inventory-stocktake-transfer-button"
                        type="button"
                        disabled={inventoryTransferAllWarehouses.length < 2
                          || !storedInventoryRecords.items.some((item) => item.kind === 'کالا')}
                        onClick={openInventoryTransfer}
                      >
                        <span aria-hidden="true">⇄</span>
                        انتقال کالا بین انبارها
                      </button>
                    )}
                  </div>

                  <label className="inventory-stocktake-search">
                    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
                      <circle cx="13.5" cy="13.5" r="8.5" />
                      <path d="m20 20 7 7" />
                    </svg>
                    <input
                      type="search"
                      aria-label={`جست‌وجو در انبارگردانی ${inventoryKind}`}
                      placeholder="جست‌وجو نام، کد یا بارکد"
                      value={inventoryStocktakeSearch}
                      onChange={(event) => setInventoryStocktakeSearch(event.target.value)}
                    />
                  </label>

                  <div className="inventory-stocktake-summary" aria-live="polite">
                    <span className="inventory-stocktake-no-difference">
                      بدون اختلاف: {formatPersonBalance(inventoryStocktakeNoDifferences)}
                    </span>
                    <span className="inventory-stocktake-has-difference">
                      دارای اختلاف: {formatPersonBalance(inventoryStocktakeDifferences)}
                    </span>
                  </div>

                  <div className="inventory-stocktake-list">
                    {inventoryStocktakeItems.map((item) => {
                      const countedValue = inventoryStocktakeCounts[item.id]
                        ?? formatStocktakeQuantity(item.stock)
                      const countedQuantity = parseStocktakeQuantity(countedValue)
                      const hasDifference = countedQuantity !== null
                        && Math.abs(countedQuantity - item.stock) > 0.000001
                      return (
                        <article className="inventory-stocktake-card" key={item.id}>
                          <div className="inventory-stocktake-card-heading">
                            <strong>{item.name}</strong>
                            <span>کد: {item.code || '—'}</span>
                          </div>
                          <div className="inventory-stocktake-card-details">
                            <div className="inventory-stocktake-system">
                              <span>موجودی سیستم</span>
                              <strong>{formatStocktakeQuantity(item.stock)} {item.unit}</strong>
                            </div>
                            <div className="inventory-stocktake-count">
                              <label htmlFor={`stocktake-count-${item.id}`}>مقدار شمارش‌شده</label>
                              <div className="inventory-stocktake-count-controls">
                                <button
                                  type="button"
                                  aria-label={`افزایش موجودی شمارش‌شدهٔ ${item.name}`}
                                  onClick={() => {
                                    const current = countedQuantity ?? item.stock
                                    setInventoryStocktakeCounts((counts) => ({
                                      ...counts,
                                      [item.id]: formatStocktakeQuantity(current + 1),
                                    }))
                                    setInventoryStocktakeError('')
                                  }}
                                >
                                  +
                                </button>
                                <input
                                  id={`stocktake-count-${item.id}`}
                                  type="text"
                                  inputMode="decimal"
                                  value={countedValue}
                                  onChange={(event) => {
                                    setInventoryStocktakeCounts((counts) => ({
                                      ...counts,
                                      [item.id]: formatDecimalInput(event.target.value),
                                    }))
                                    setInventoryStocktakeError('')
                                  }}
                                />
                                <button
                                  type="button"
                                  aria-label={`کاهش موجودی شمارش‌شدهٔ ${item.name}`}
                                  onClick={() => {
                                    const current = countedQuantity ?? item.stock
                                    setInventoryStocktakeCounts((counts) => ({
                                      ...counts,
                                      [item.id]: formatStocktakeQuantity(current - 1),
                                    }))
                                    setInventoryStocktakeError('')
                                  }}
                                >
                                  −
                                </button>
                              </div>
                            </div>
                          </div>
                          <span className={`inventory-stocktake-status${hasDifference ? ' has-difference' : ''}`}>
                            {countedQuantity === null
                              ? 'مقدار شمارش‌شده را بررسی کنید'
                              : hasDifference
                                ? `اختلاف: ${formatStocktakeQuantity(countedQuantity - item.stock)} ${item.unit}`
                                : 'موجودی شمارش‌شده درست است'}
                          </span>
                        </article>
                      )
                    })}
                    {inventoryStocktakeItems.length === 0 && (
                      <div className="inventory-stocktake-empty">
                        {inventoryStocktakeRecords.length === 0
                          ? `در ${activeWarehouse} موردی برای شمارش ثبت نشده است.`
                          : 'موردی با این نام، کد یا بارکد پیدا نشد.'}
                      </div>
                    )}
                  </div>
                </div>

                <footer className="inventory-stocktake-footer">
                  <div>
                    <span>ارزش اختلاف بر اساس قیمت خرید:</span>
                    <strong>{formatPersonBalance(Math.round(inventoryStocktakeValue))} ریال</strong>
                  </div>
                  {inventoryStocktakeError && (
                    <p role="alert">{inventoryStocktakeError}</p>
                  )}
                  <button
                    type="button"
                    disabled={inventoryStocktakeRecords.length === 0}
                    onClick={saveInventoryStocktake}
                  >
                    بررسی اختلاف‌ها و ثبت نهایی
                  </button>
                </footer>
                {inventoryTransferOpen && (
                  <div className="inventory-transfer-backdrop">
                    <form
                      className="inventory-transfer-dialog"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="inventory-transfer-title"
                      onSubmit={saveInventoryTransfer}
                    >
                      <header>
                        <div>
                          <span>انتقال موجودی</span>
                          <h2 id="inventory-transfer-title">انتقال کالا بین انبارها</h2>
                        </div>
                        <button
                          type="button"
                          aria-label="بستن پنجره انتقال"
                          onClick={() => setInventoryTransferOpen(false)}
                        >
                          ×
                        </button>
                      </header>
                      <div className="inventory-transfer-fields">
                        <label>
                          <span>انبار مبدا</span>
                          <select
                            value={inventoryTransferSourceWarehouse}
                            onChange={(event) => {
                              const sourceWarehouse = event.target.value
                              const sourceItems = storedInventoryRecords.items.filter((item) => (
                                item.kind === 'کالا'
                                && (item.warehouse ?? DEFAULT_INVENTORY_WAREHOUSE) === sourceWarehouse
                              ))
                              setInventoryTransferSourceWarehouse(sourceWarehouse)
                              setInventoryTransferItemId(sourceItems[0]?.id ?? '')
                              if (inventoryTransferWarehouse === sourceWarehouse) {
                                setInventoryTransferWarehouse(
                                  inventoryTransferAllWarehouses.find((warehouse) => warehouse !== sourceWarehouse) ?? '',
                                )
                              }
                              setInventoryTransferSearch('')
                              setInventoryTransferProductPickerOpen(false)
                              setInventoryTransferError('')
                            }}
                          >
                            {inventoryTransferAllWarehouses.map((warehouse) => (
                              <option key={warehouse} value={warehouse}>{warehouse}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>انبار مقصد</span>
                          <select
                            value={inventoryTransferWarehouse}
                            onChange={(event) => {
                              setInventoryTransferWarehouse(event.target.value)
                              setInventoryTransferError('')
                            }}
                          >
                            {inventoryTransferWarehouses.map((warehouse) => (
                              <option key={warehouse} value={warehouse}>{warehouse}</option>
                            ))}
                          </select>
                        </label>
                        <div className="inventory-transfer-product-picker">
                          <label id="inventory-transfer-product-label">کالا</label>
                          <button
                            className="inventory-transfer-product-trigger"
                            type="button"
                            aria-labelledby="inventory-transfer-product-label"
                            aria-expanded={inventoryTransferProductPickerOpen}
                            aria-controls="inventory-transfer-product-picker-panel"
                            onClick={() => {
                              setInventoryTransferProductPickerOpen((open) => !open)
                              setInventoryTransferSearch('')
                            }}
                          >
                            <span className="inventory-transfer-product-icon" aria-hidden="true">▦</span>
                            <span className="inventory-transfer-product-info">
                              <strong>
                                {inventoryTransferSelectedItem?.name ?? 'انتخاب کالا برای انتقال'}
                              </strong>
                              <small>
                                {inventoryTransferSelectedItem
                                  ? `کد کالا: ${inventoryTransferSelectedItem.code || '—'} · موجودی ${formatStocktakeQuantity(inventoryTransferSelectedItem.stock)} ${inventoryTransferSelectedItem.unit}`
                                  : 'برای جست‌وجو و انتخاب کالا بزنید'}
                              </small>
                            </span>
                            <span className="dropdown-chevron inventory-transfer-product-chevron" aria-hidden="true">
                              {inventoryTransferProductPickerOpen ? '⌃' : '⌄'}
                            </span>
                          </button>
                          {inventoryTransferProductPickerOpen && (
                            <div className="inventory-transfer-product-picker-panel" id="inventory-transfer-product-picker-panel">
                              <div className="inventory-transfer-search">
                                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                  <circle cx="10.8" cy="10.8" r="6.8" />
                                  <path d="m16 16 5 5" />
                                </svg>
                                <input
                                  id="inventory-transfer-product-search"
                                  type="search"
                                  aria-label="جست‌وجوی کالا بر اساس نام یا کد"
                                  aria-controls="inventory-transfer-product-list"
                                  autoComplete="off"
                                  placeholder="جست‌وجو بر اساس نام یا کد کالا"
                                  value={inventoryTransferSearch}
                                  onChange={(event) => setInventoryTransferSearch(event.target.value)}
                                />
                              </div>
                              <div
                                className="inventory-transfer-product-list"
                                id="inventory-transfer-product-list"
                                role="listbox"
                                aria-label="کالاهای انبار مبدا"
                              >
                                {inventoryTransferItems.length ? inventoryTransferItems.map((item) => (
                                  <button
                                    className={`inventory-transfer-product-option${item.id === inventoryTransferItemId ? ' selected' : ''}`}
                                    key={item.id}
                                    type="button"
                                    role="option"
                                    aria-selected={item.id === inventoryTransferItemId}
                                    onClick={() => {
                                      setInventoryTransferItemId(item.id)
                                      setInventoryTransferProductPickerOpen(false)
                                      setInventoryTransferSearch('')
                                      setInventoryTransferError('')
                                    }}
                                  >
                                    <span className="inventory-transfer-product-icon" aria-hidden="true">▦</span>
                                    <span className="inventory-transfer-product-info">
                                      <strong>{item.name}</strong>
                                      <small>کد کالا: {item.code || '—'}</small>
                                    </span>
                                    <span className="inventory-transfer-product-stock">
                                      <strong>{formatStocktakeQuantity(item.stock)}</strong>
                                      <small>{item.unit}</small>
                                    </span>
                                  </button>
                                )) : (
                                  <p className="inventory-transfer-no-products" aria-live="polite">
                                    {inventoryTransferSearchQuery
                                      ? 'کالایی با این نام یا کد پیدا نشد.'
                                      : 'در این انبار کالایی برای انتقال وجود ندارد.'}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <label>
                          <span>مقدار انتقال</span>
                          <input
                            autoFocus
                            inputMode="decimal"
                            value={inventoryTransferQuantity}
                            onChange={(event) => {
                              setInventoryTransferQuantity(formatDecimalInput(event.target.value))
                              setInventoryTransferError('')
                            }}
                            placeholder={`حداکثر ${formatStocktakeQuantity(
                              inventoryTransferSourceItems.find((item) => item.id === inventoryTransferItemId)?.stock ?? 0,
                            )}`}
                          />
                        </label>
                      </div>
                      {inventoryTransferError && <p role="alert">{inventoryTransferError}</p>}
                      <div className="inventory-transfer-actions">
                        <button type="button" onClick={() => setInventoryTransferOpen(false)}>انصراف</button>
                        <button type="submit" disabled={!inventoryTransferSourceItems.length || !inventoryTransferWarehouses.length}>
                          تأیید انتقال
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </section>
            )}
            <section className="inventory-hero" aria-labelledby="inventory-title">
              <button
                className="inventory-refresh"
                type="button"
                aria-label="بازنشانی فیلترهای انبار"
                title="بازنشانی فیلترها"
                onClick={() => {
                  setInventoryKind('کالا')
                  setInventoryGroup('همه')
                  setInventoryCategory('همه')
                  setInventorySearch('')
                  setInventorySort('created')
                  setInventoryNoStockOnly(false)
                  setInventoryToolbarMenu(null)
                }}
              >
                <Icon name="refresh" />
              </button>
              <div className="inventory-title">
                <span className="inventory-title-icon"><Icon name="inventory" /></span>
                <div className="inventory-title-copy">
                  <span className="inventory-eyebrow">مدیریت موجودی</span>
                  <h1 id="inventory-title">کالا و انبار</h1>
                  <p>کالاها، خدمات و تولیداتت را یک‌جا ببین.</p>
                </div>
              </div>
            </section>

            <section
              className="inventory-list-section"
              aria-label={inventoryKind === 'خدمات'
                ? 'مدیریت فهرست خدمات'
                : inventoryKind === 'تولید' ? 'مدیریت فهرست تولید' : 'مدیریت فهرست انبار'}
            >
              <div className="people-list-heading inventory-list-heading">
                <div>
                  <h2>فهرست {inventoryKind}</h2>
                </div>
                {inventoryKind === 'کالا' && <div className="inventory-warehouse-actions">
                  <button
                    className="inventory-warehouses-button"
                    type="button"
                    aria-expanded={inventoryWarehousesOpen}
                    aria-controls="inventory-warehouses-panel"
                    onClick={() => {
                      setInventoryWarehouseFormOpen(false)
                      setEditingServiceWarehouse(null)
                      setInventoryWarehousesOpen(!inventoryWarehousesOpen)
                    }}
                  >
                    <Icon name="shop" />
                    <span>{activeWarehouse}</span>
                    <span className="dropdown-chevron inventory-warehouses-chevron" aria-hidden="true">⌄</span>
                  </button>
                  <button
                    className="inventory-warehouse-add"
                    type="button"
                    aria-label="افزودن انبار"
                    title="افزودن انبار"
                    aria-expanded={inventoryWarehouseFormOpen}
                    onClick={() => {
                      setInventoryWarehousesOpen(false)
                      setInventoryWarehouseFormOpen(true)
                      setEditingInventoryWarehouse(null)
                      setEditingServiceWarehouse(null)
                      setInventoryWarehouseInput('')
                      setInventoryWarehouseError('')
                    }}
                  >
                    +
                  </button>
                </div>}
              </div>
              {inventoryKind === 'کالا' && inventoryWarehousesOpen && (
                <section className="inventory-warehouses-panel" id="inventory-warehouses-panel" aria-label="مدیریت انبارها">
                  <div className="inventory-warehouses-heading">
                    <div>
                      <strong>انتخاب انبار</strong>
                      <span>{formatPersonBalance(activeWarehouseOptions.length)} انبار ثبت‌شده</span>
                    </div>
                    <button
                      type="button"
                      aria-label="بستن فهرست انبارها"
                      onClick={() => setInventoryWarehousesOpen(false)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="inventory-warehouses-list">
                    <button
                      className="inventory-stocktake-button"
                      type="button"
                      onClick={openInventoryStocktake}
                    >
                      <Icon name="check" />
                      انبارگردانی
                    </button>
                    {activeWarehouseOptions.map((warehouse) => (
                      <span
                        className="inventory-action-chip-wrap"
                        key={warehouse}
                        onPointerDown={(event) => startInventoryActionPress(event, { type: 'warehouse', name: warehouse })}
                        onPointerMove={moveInventoryActionPress}
                        onPointerUp={clearInventoryActionPressTimer}
                        onPointerCancel={clearInventoryActionPressTimer}
                      >
                        <button
                          className={`inventory-warehouse-chip${activeWarehouse === warehouse ? ' active' : ''}`}
                          type="button"
                          aria-pressed={activeWarehouse === warehouse}
                          onClick={(event) => {
                            if (suppressInventoryActionClick.current) {
                              suppressInventoryActionClick.current = false
                              event.preventDefault()
                              return
                            }
                            setSelectedWarehouse(warehouse)
                            setInventoryGroup('همه')
                            setInventoryCategory('همه')
                            setInventorySearch('')
                            setInventoryWarehousesOpen(false)
                          }}
                        >
                          <Icon name="shop" />
                          {warehouse}
                        </button>
                        {warehouse !== DEFAULT_INVENTORY_WAREHOUSE && (
                          <button
                            className="inventory-action-trigger"
                            type="button"
                            aria-label={`گزینه‌های انبار ${warehouse}`}
                            title={`گزینه‌های انبار ${warehouse}`}
                            onClick={(event) => activateInventoryActionItem(event, { type: 'warehouse', name: warehouse })}
                          >
                            <span aria-hidden="true">⋮</span>
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </section>
              )}
              {inventoryKind === 'کالا' && inventoryWarehouseFormOpen && (
                <section className="inventory-warehouses-panel" id="inventory-warehouses-panel" aria-label="افزودن انبار">
                  <div className="inventory-warehouses-heading">
                    <div>
                      <strong>{editingInventoryWarehouse ? 'ویرایش انبار' : 'افزودن انبار جدید'}</strong>
                      <span>پس از افزودن، انبار جدید به‌صورت خودکار انتخاب می‌شود.</span>
                    </div>
                    <button
                      type="button"
                      aria-label="بستن فرم افزودن انبار"
                      onClick={() => {
                        setInventoryWarehouseFormOpen(false)
                        setEditingInventoryWarehouse(null)
                        setEditingServiceWarehouse(null)
                        setInventoryWarehouseError('')
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <form className="inventory-warehouse-form" onSubmit={addInventoryWarehouse}>
                    <input
                      autoFocus
                      maxLength={50}
                      value={inventoryWarehouseInput}
                      onChange={(event) => {
                        setInventoryWarehouseInput(event.target.value)
                        setInventoryWarehouseError('')
                      }}
                      placeholder={editingInventoryWarehouse ? 'نام جدید انبار' : 'نام انبار جدید'}
                      aria-label={editingInventoryWarehouse ? 'نام جدید انبار' : 'نام انبار جدید'}
                      aria-invalid={Boolean(inventoryWarehouseError)}
                    />
                    <button type="submit">{editingInventoryWarehouse ? 'ذخیره' : 'افزودن انبار'}</button>
                    <button className="inventory-warehouse-cancel" type="button" onClick={() => {
                      setInventoryWarehouseFormOpen(false)
                      setEditingInventoryWarehouse(null)
                      setEditingServiceWarehouse(null)
                      setInventoryWarehouseError('')
                    }}>
                      انصراف
                    </button>
                  </form>
                  {inventoryWarehouseError && (
                    <p className="inventory-warehouse-error" role="alert">{inventoryWarehouseError}</p>
                  )}
                </section>
              )}
              {storedInventoryRecords.error && (
                <p className="inventory-storage-error" role="alert">{storedInventoryRecords.error}</p>
              )}
              <section className="inventory-toolbar" aria-label="ابزارهای کالا و انبار">
                <div className="inventory-kind-switch" role="group" aria-label="نوع مورد">
                  {(['کالا', 'خدمات', 'تولید'] as const).map((kind) => (
                    <button
                      className={inventoryKind === kind ? 'active' : ''}
                      type="button"
                      aria-pressed={inventoryKind === kind}
                      key={kind}
                      onClick={() => {
                        setInventoryKind(kind)
                        setInventoryGroup('همه')
                        setInventoryCategory('همه')
                        setInventoryTaxonomyForm(null)
                        setEditingInventoryTaxonomy(null)
                        setInventoryActionItem(null)
                        setInventoryWarehousesOpen(false)
                        setInventoryWarehouseFormOpen(false)
                      }}
                    >
                      {kind}
                    </button>
                  ))}
                </div>
              </section>

              <section className="inventory-category-section" aria-label="گروه‌های کالا">
                <span className="inventory-category-label">{inventoryKind === 'خدمات' ? 'گروه خدمات' : 'گروه کالا'}</span>
                <div
                  className="inventory-category-list"
                  ref={inventoryGroupsRef}
                  onPointerDown={(event) => {
                    if (event.pointerType !== 'mouse' || event.button !== 0) return
                    suppressInventoryFilterClick.current = false
                    inventoryFilterDrag.current = {
                      container: 'groups',
                      pointerId: event.pointerId,
                      startX: event.clientX,
                      startScrollLeft: event.currentTarget.scrollLeft,
                      isDragging: false,
                    }
                  }}
                  onClickCapture={(event) => {
                    if (!suppressInventoryFilterClick.current) return
                    suppressInventoryFilterClick.current = false
                    event.preventDefault()
                    event.stopPropagation()
                  }}
                >
                  <button
                    className="inventory-taxonomy-add"
                    type="button"
                    aria-expanded={inventoryTaxonomyForm === 'group'}
                    onClick={() => {
                      setInventoryTaxonomyForm(inventoryTaxonomyForm === 'group' ? null : 'group')
                      setEditingInventoryTaxonomy(null)
                      setInventoryTaxonomyInput('')
                      setInventoryTaxonomyError('')
                    }}
                  >
                    گروه <span aria-hidden="true">+</span>
                  </button>
                  <button
                    className={inventoryGroup === 'همه' ? 'active' : ''}
                    type="button"
                    aria-pressed={inventoryGroup === 'همه'}
                    onClick={() => {
                      setInventoryGroup('همه')
                      setInventoryCategory('همه')
                    }}
                  >
                    همه
                  </button>
                  {inventoryGroups.map((group) => (
                    <span
                      className="inventory-action-chip-wrap"
                      key={group}
                      onPointerDown={(event) => startInventoryActionPress(event, { type: 'group', name: group, kind: inventoryKind })}
                      onPointerMove={moveInventoryActionPress}
                      onPointerUp={clearInventoryActionPressTimer}
                      onPointerCancel={clearInventoryActionPressTimer}
                    >
                      <button
                        className={inventoryGroup === group ? 'active' : ''}
                        type="button"
                        aria-pressed={inventoryGroup === group}
                        onClick={(event) => {
                          if (suppressInventoryActionClick.current) {
                            suppressInventoryActionClick.current = false
                            event.preventDefault()
                            return
                          }
                          setInventoryGroup(group)
                          setInventoryCategory('همه')
                        }}
                      >
                        {group}
                      </button>
                      <button
                        className="inventory-action-trigger"
                        type="button"
                        aria-label={`گزینه‌های گروه ${group}`}
                        title={`گزینه‌های گروه ${group}`}
                        onClick={(event) => activateInventoryActionItem(event, { type: 'group', name: group, kind: inventoryKind })}
                      >
                        <span aria-hidden="true">⋮</span>
                      </button>
                    </span>
                  ))}
                </div>
                {inventoryTaxonomyForm === 'group' && (
                  <form className="inventory-taxonomy-form" onSubmit={addInventoryTaxonomy}>
                    <input
                      autoFocus
                      maxLength={50}
                      value={inventoryTaxonomyInput}
                      onChange={(event) => {
                        setInventoryTaxonomyInput(event.target.value)
                        setInventoryTaxonomyError('')
                      }}
                      placeholder={editingInventoryTaxonomy ? 'نام جدید گروه' : 'نام گروه جدید'}
                      aria-label={editingInventoryTaxonomy ? 'نام جدید گروه' : 'نام گروه جدید'}
                    />
                    <button type="submit">{editingInventoryTaxonomy ? 'ذخیره' : 'افزودن'}</button>
                    {editingInventoryTaxonomy && (
                      <button className="inventory-taxonomy-cancel" type="button" onClick={() => {
                        setEditingInventoryTaxonomy(null)
                        setInventoryTaxonomyForm(null)
                        setInventoryTaxonomyInput('')
                        setInventoryTaxonomyError('')
                      }}>
                        انصراف
                      </button>
                    )}
                  </form>
                )}
                {inventoryTaxonomyForm === 'group' && inventoryTaxonomyError && (
                  <p className="inventory-taxonomy-error" role="alert">{inventoryTaxonomyError}</p>
                )}
              </section>

              <section className="inventory-category-section inventory-secondary-categories" aria-label={inventoryKind === 'خدمات' ? 'دسته‌بندی خدمات' : 'دسته‌بندی گروه'}>
                <span className="inventory-category-label">{inventoryKind === 'خدمات' ? 'دسته‌بندی خدمات' : 'دسته‌بندی گروه'}</span>
                <div
                  className="inventory-category-list"
                  ref={inventoryCategoriesRef}
                  onPointerDown={(event) => {
                    if (event.pointerType !== 'mouse' || event.button !== 0) return
                    suppressInventoryFilterClick.current = false
                    inventoryFilterDrag.current = {
                      container: 'categories',
                      pointerId: event.pointerId,
                      startX: event.clientX,
                      startScrollLeft: event.currentTarget.scrollLeft,
                      isDragging: false,
                    }
                  }}
                  onClickCapture={(event) => {
                    if (!suppressInventoryFilterClick.current) return
                    suppressInventoryFilterClick.current = false
                    event.preventDefault()
                    event.stopPropagation()
                  }}
                >
                  <button
                    className="inventory-taxonomy-add"
                    type="button"
                    aria-expanded={inventoryTaxonomyForm === 'category'}
                    onClick={() => {
                      setInventoryTaxonomyForm(inventoryTaxonomyForm === 'category' ? null : 'category')
                      setEditingInventoryTaxonomy(null)
                      setInventoryTaxonomyInput('')
                      setInventoryTaxonomyError('')
                    }}
                  >
                    دسته‌بندی <span aria-hidden="true">+</span>
                  </button>
                  <button
                    className={inventoryCategory === 'همه' ? 'active' : ''}
                    type="button"
                    aria-pressed={inventoryCategory === 'همه'}
                    onClick={() => setInventoryCategory('همه')}
                  >
                    همه
                  </button>
                  {inventoryCategories.map((category) => (
                    <span
                      className="inventory-action-chip-wrap"
                      key={category}
                      onPointerDown={(event) => startInventoryActionPress(event, { type: 'category', name: category, group: inventoryGroup, kind: inventoryKind })}
                      onPointerMove={moveInventoryActionPress}
                      onPointerUp={clearInventoryActionPressTimer}
                      onPointerCancel={clearInventoryActionPressTimer}
                    >
                      <button
                        className={inventoryCategory === category ? 'active' : ''}
                        type="button"
                        aria-pressed={inventoryCategory === category}
                        onClick={(event) => {
                          if (suppressInventoryActionClick.current) {
                            suppressInventoryActionClick.current = false
                            event.preventDefault()
                            return
                          }
                          setInventoryCategory(category)
                        }}
                      >
                        {category}
                      </button>
                      <button
                        className="inventory-action-trigger"
                        type="button"
                        aria-label={`گزینه‌های دسته‌بندی ${category}`}
                        title={`گزینه‌های دسته‌بندی ${category}`}
                        onClick={(event) => activateInventoryActionItem(event, { type: 'category', name: category, group: inventoryGroup, kind: inventoryKind })}
                      >
                        <span aria-hidden="true">⋮</span>
                      </button>
                    </span>
                  ))}
                </div>
                {inventoryTaxonomyForm === 'category' && (
                  <form className="inventory-taxonomy-form" onSubmit={addInventoryTaxonomy}>
                    <input
                      autoFocus
                      maxLength={50}
                      value={inventoryTaxonomyInput}
                      onChange={(event) => {
                        setInventoryTaxonomyInput(event.target.value)
                        setInventoryTaxonomyError('')
                      }}
                      placeholder={editingInventoryTaxonomy ? 'نام جدید دسته‌بندی' : 'نام دسته‌بندی جدید'}
                      aria-label={editingInventoryTaxonomy ? 'نام جدید دسته‌بندی' : 'نام دسته‌بندی جدید'}
                    />
                    <button type="submit">{editingInventoryTaxonomy ? 'ذخیره' : 'افزودن'}</button>
                    {editingInventoryTaxonomy && (
                      <button className="inventory-taxonomy-cancel" type="button" onClick={() => {
                        setEditingInventoryTaxonomy(null)
                        setInventoryTaxonomyForm(null)
                        setInventoryTaxonomyInput('')
                        setInventoryTaxonomyError('')
                      }}>
                        انصراف
                      </button>
                    )}
                  </form>
                )}
                {inventoryTaxonomyForm === 'category' && inventoryTaxonomyError && (
                  <p className="inventory-taxonomy-error" role="alert">{inventoryTaxonomyError}</p>
                )}
              </section>

              {inventoryActionItem && (
                <div
                  className="inventory-action-menu"
                  role="menu"
                  aria-label={`عملیات ${inventoryActionItem.type === 'warehouse' ? 'انبار' : inventoryActionItem.type === 'group' ? 'گروه' : inventoryActionItem.type === 'category' ? 'دسته‌بندی' : inventoryActionItem.type === 'service' ? 'خدمت' : 'کالا'} ${inventoryActionItem.name}`}
                  style={{ left: inventoryActionItem.x, top: inventoryActionItem.y }}
                >
                  <span className="inventory-action-menu-title">{inventoryActionItem.name}</span>
                  <button type="button" role="menuitem" onClick={() => performInventoryAction('edit')}>
                    ویرایش
                  </button>
                  <button className="delete" type="button" role="menuitem" onClick={() => performInventoryAction('delete')}>
                    حذف
                  </button>
                </div>
              )}

              <div className="inventory-search-row">
                <div className="inventory-actions" ref={inventoryActionsRef}>
                  <button
                    className="inventory-action more"
                    type="button"
                    aria-label="گزینه‌های بیشتر"
                    aria-expanded={inventoryToolbarMenu === 'more'}
                    onClick={() => setInventoryToolbarMenu(inventoryToolbarMenu === 'more' ? null : 'more')}
                  >
                    <span className="inventory-action-icon">⋮</span>
                  </button>
                  <button
                    className="inventory-action sort"
                    type="button"
                    aria-label={inventoryKind === 'خدمات' ? 'مرتب‌سازی خدمات' : 'مرتب‌سازی کالاها'}
                    aria-expanded={inventoryToolbarMenu === 'sort'}
                    onClick={() => setInventoryToolbarMenu(inventoryToolbarMenu === 'sort' ? null : 'sort')}
                  >
                    <PeopleToolbarIcon name="sort" />
                  </button>
                  <button
                    className="inventory-action reports"
                    type="button"
                    aria-label={inventoryKind === 'خدمات' ? 'گزارشات خدمات' : 'گزارشات کالا و انبار'}
                    onClick={() => showComingSoon(inventoryKind === 'خدمات' ? 'گزارشات خدمات' : 'گزارشات کالا و انبار')}
                  >
                    <PeopleToolbarIcon name="chart" />
                  </button>

                  {inventoryToolbarMenu && (
                    <div className="inventory-toolbar-menu" role="menu">
                      {inventoryToolbarMenu === 'sort' ? (
                        (inventoryKind === 'خدمات' ? serviceSortOptions : inventorySortOptions).map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            role="menuitemradio"
                            aria-checked={inventorySort === option.value}
                            onClick={() => {
                              setInventorySort(option.value)
                              setInventoryToolbarMenu(null)
                            }}
                          >
                            <span className="people-sort-radio" aria-hidden="true"><span /></span>
                            {option.label}
                          </button>
                        ))
                      ) : (
                        <>
                          {inventoryKind !== 'خدمات' && (
                            <>
                              <button
                                type="button"
                                role="menuitemcheckbox"
                                aria-checked={inventoryNoStockOnly}
                                onClick={() => {
                                  setInventoryNoStockOnly(!inventoryNoStockOnly)
                                }}
                              >
                                <span className="people-sort-radio" aria-hidden="true"><span /></span>
                                نمایش کالاهای بدون موجودی
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setInventoryToolbarMenu(null)
                                  setInventoryShareOpen(true)
                                }}
                              >
                                ارسال لیست کالاهای انبار
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setInventoryToolbarMenu(null)
                              downloadInventoryExcel()
                            }}
                          >
                            {inventoryKind === 'خدمات' ? 'خروجی اکسل از فهرست خدمات' : 'خروجی اکسل از انبار'}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <label className="inventory-search people-search">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="10.8" cy="10.8" r="6.8" />
                    <path d="m16 16 5 5" />
                  </svg>
                  <input
                    type="search"
                    value={inventorySearch}
                    onChange={(event) => setInventorySearch(event.target.value)}
                    placeholder="جست‌وجو..."
                    aria-label={inventoryKind === 'خدمات' ? 'جست‌وجو در خدمات' : 'جست‌وجو در کالا و انبار'}
                  />
                </label>
              </div>

              <section className="inventory-list" aria-label={`فهرست ${inventoryKind}`}>
                {filteredInventory.map((item) => (
                  <article
                    className="inventory-item"
                    key={item.id}
                    tabIndex={0}
                    aria-label={`جزئیات ${item.kind === 'خدمات' ? 'خدمت' : 'کالا'} ${item.name}`}
                    onClick={(event) => {
                      if (suppressInventoryActionClick.current) {
                        suppressInventoryActionClick.current = false
                        event.preventDefault()
                        return
                      }
                      if (event.target instanceof Element && event.target.closest('button')) return
                      setInventoryDetailItemId(item.id)
                    }}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return
                      if (event.key !== 'Enter' && event.key !== ' ') return
                      event.preventDefault()
                      setInventoryDetailItemId(item.id)
                    }}
                    onContextMenu={item.kind !== 'تولید' ? (event) => event.preventDefault() : undefined}
                    onPointerDown={item.kind !== 'تولید'
                      ? (event) => startInventoryActionPress(event, {
                          type: item.kind === 'خدمات' ? 'service' : 'product',
                          name: item.name,
                          id: item.id,
                        })
                      : undefined}
                    onPointerMove={item.kind !== 'تولید' ? moveInventoryActionPress : undefined}
                    onPointerUp={item.kind !== 'تولید' ? clearInventoryActionPressTimer : undefined}
                    onPointerCancel={item.kind !== 'تولید' ? clearInventoryActionPressTimer : undefined}
                  >
                    <div className={`inventory-item-prices${item.kind === 'خدمات' ? ' service' : ''}`}>
                      {item.kind !== 'خدمات' && (
                        <div className="inventory-price-row">
                          <span className="inventory-price-label">خرید</span>
                          <span className="inventory-price-tag purchase">{formatPersonBalance(item.purchasePrice)} <small>ریال</small></span>
                        </div>
                      )}
                      <div className="inventory-price-row">
                        <span className="inventory-price-label">فروش</span>
                        <span className="inventory-price-tag sale">{formatPersonBalance(item.salePrice)} <small>ریال</small></span>
                      </div>
                    </div>
                    {item.kind !== 'تولید' && (
                      <button
                        className="inventory-item-menu-trigger inventory-action-trigger"
                        type="button"
                        aria-label={`عملیات ${item.kind === 'خدمات' ? 'خدمت' : 'کالای'} ${item.name}`}
                        aria-haspopup="menu"
                        aria-expanded={(inventoryActionItem?.type === 'product' || inventoryActionItem?.type === 'service')
                          && inventoryActionItem.id === item.id}
                        onClick={(event) => {
                          event.stopPropagation()
                          activateInventoryActionItem(event, {
                            type: item.kind === 'خدمات' ? 'service' : 'product',
                            name: item.name,
                            id: item.id,
                          })
                        }}
                      >
                        <span aria-hidden="true">⋮</span>
                      </button>
                    )}
                    <div className="inventory-item-copy">
                      <h2>{item.name}</h2>
                      {item.code && (
                        <small className="inventory-item-code">کد: {item.code}</small>
                      )}
                      <p>{item.brand}</p>
                      <span>{formatPersonBalance(item.stock)} {item.unit}</span>
                    </div>
                    <span className="inventory-item-image" aria-hidden="true"><Icon name="inventory" /></span>
                  </article>
                ))}
                {filteredInventory.length === 0 && (
                  <div className="inventory-empty">
                    <Icon name="inventory" />
                    <strong>{inventoryKind === 'خدمات' ? 'خدمتی ثبت نشده است' : 'موردی پیدا نشد'}</strong>
                    <span>{inventoryKind === 'خدمات'
                      ? 'برای شروع، خدمت جدید را ثبت کنید.'
                      : 'جست‌وجو یا گروه انتخابی را تغییر دهید.'}</span>
                  </div>
                )}
              </section>
              {inventoryDetailItem && (
                <div
                  className="inventory-detail-backdrop"
                  role="presentation"
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) setInventoryDetailItemId(null)
                  }}
                  onTouchStart={(event) => {
                    if (event.target === event.currentTarget) setInventoryDetailItemId(null)
                  }}
                >
                  <section
                    className="inventory-detail-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="inventory-detail-title"
                    onMouseDown={(event) => event.stopPropagation()}
                    onTouchStart={(event) => event.stopPropagation()}
                  >
                    <header className="inventory-detail-header">
                      <div>
                        <span>{inventoryDetailItem.kind === 'کالا'
                          ? `${inventoryDetailItem.kind} · ${inventoryDetailItem.warehouse ?? activeWarehouse}`
                          : inventoryDetailItem.kind}</span>
                        <h2 id="inventory-detail-title">{inventoryDetailItem.name}</h2>
                      </div>
                      <button
                        ref={inventoryDetailCloseButtonRef}
                        type="button"
                        aria-label="بستن جزئیات"
                        onClick={() => setInventoryDetailItemId(null)}
                      >
                        ×
                      </button>
                    </header>
                    <dl className="inventory-detail-properties">
                      <div><dt>کد کالا</dt><dd>{inventoryDetailItem.code || '—'}</dd></div>
                      <div><dt>گروه</dt><dd>{inventoryDetailItem.group || '—'}</dd></div>
                      <div><dt>دسته‌بندی</dt><dd>{inventoryDetailItem.category || '—'}</dd></div>
                      <div><dt>برند</dt><dd>{inventoryDetailItem.brand || '—'}</dd></div>
                      <div><dt>بارکد</dt><dd>{inventoryDetailItem.barcode || '—'}</dd></div>
                      <div><dt>واحد</dt><dd>{inventoryDetailItem.unit || '—'}</dd></div>
                      {inventoryDetailItem.secondaryUnit && (
                        <div>
                          <dt>واحد دوم</dt>
                          <dd>{inventoryDetailItem.secondaryUnit}{inventoryDetailItem.conversionRatio
                            ? ` · هر ${inventoryDetailItem.secondaryUnit} برابر ${formatStocktakeQuantity(inventoryDetailItem.conversionRatio)} ${inventoryDetailItem.unit}`
                            : ''}</dd>
                        </div>
                      )}
                      {inventoryDetailItem.kind !== 'خدمات' && (
                        <div><dt>موجودی فعلی</dt><dd>{formatStocktakeQuantity(inventoryDetailItem.stock)} {inventoryDetailItem.unit}</dd></div>
                      )}
                      {inventoryDetailItem.kind !== 'خدمات' && (
                        <div><dt>قیمت خرید</dt><dd>{formatPersonBalance(inventoryDetailItem.purchasePrice)} ریال</dd></div>
                      )}
                      <div><dt>قیمت فروش</dt><dd>{formatPersonBalance(inventoryDetailItem.salePrice)} ریال</dd></div>
                      <div><dt>تاریخ ثبت</dt><dd>{formatCalendarDate(new Date(`${inventoryDetailItem.createdAt.slice(0, 10)}T12:00:00Z`), 'persian')}</dd></div>
                    </dl>
                    <section className="inventory-detail-history" aria-labelledby="inventory-detail-history-title">
                      <div className="inventory-detail-history-heading">
                        <h3 id="inventory-detail-history-title">سوابق ورود و خروج</h3>
                        <span>{inventoryDetailActivity.length} مورد</span>
                      </div>
                      {inventoryDetailActivity.length ? (
                        <ol>
                          {inventoryDetailActivity.map((activity) => (
                            <li className={`inventory-detail-movement ${activity.direction}`} key={activity.id}>
                              <span className="inventory-detail-movement-mark" aria-hidden="true">
                                {activity.direction === 'in' ? '↓' : activity.direction === 'out' ? '↑' : '•'}
                              </span>
                              <div className="inventory-detail-movement-main">
                                <strong>{activity.label}</strong>
                                <span>
                                  {formatCalendarDate(
                                    new Date(`${activity.date}T12:00:00Z`),
                                    activity.calendar,
                                  )}
                                  {activity.number ? ` · فاکتور ${activity.number}` : ''}
                                  {activity.party ? ` · ${activity.party}` : ''}
                                </span>
                                {activity.warehouse && activity.source === 'stock' && (
                                  <span>{activity.warehouse}</span>
                                )}
                              </div>
                              <div className="inventory-detail-movement-value">
                                <strong>
                                  {activity.direction === 'in' ? '+' : activity.direction === 'out' ? '−' : ''}
                                  {formatStocktakeQuantity(activity.quantity)} {activity.unit}
                                </strong>
                                {activity.total !== undefined && (
                                  <span>{formatPersonBalance(activity.total)} ریال</span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="inventory-detail-history-empty">برای این مورد هنوز گردش ثبت‌شده‌ای وجود ندارد.</p>
                      )}
                    </section>
                  </section>
                </div>
              )}
            </section>

            <button
              className="inventory-add-button"
              type="button"
              aria-label={inventoryKind === 'کالا' ? 'کالای جدید' : inventoryKind === 'خدمات' ? 'خدمت جدید' : 'تولید جدید'}
              title={inventoryKind === 'کالا' ? 'کالای جدید' : inventoryKind === 'خدمات' ? 'خدمت جدید' : 'تولید جدید'}
              onClick={() => {
                if (inventoryKind === 'کالا') {
                  openInventoryProductForm()
                  return
                }
                if (inventoryKind === 'خدمات') {
                  openInventoryServiceForm()
                  return
                }
                showComingSoon(`فرم ثبت ${inventoryKind} در طراحی جداگانه آماده می‌شود.`)
              }}
            >
              {inventoryKind === 'کالا' ? (
                <svg className="inventory-add-icon inventory-add-icon--product" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                  <path className="inventory-box-body" d="m7 14 13 8 13-8v15l-13 7-13-7V14Z" />
                  <path className="inventory-box-seam" d="M20 22v14M7 14l13 8 13-8" />
                  <path className="inventory-box-lid-closed" d="m7 14 13-8 13 8-13 8-13-8Z" />
                  <g className="inventory-box-lid-open">
                    <path d="m7 14 1-9 12-3v12l-13 8v-8Z" />
                    <path d="m20 14 12-9 1 9-13 8v-8Z" />
                  </g>
                </svg>
              ) : inventoryKind === 'خدمات' ? (
                <svg className="inventory-add-icon inventory-add-icon--service" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                  <path d="M23.5 8.5a9.2 9.2 0 0 0-11.8 11.8L5.5 26.5a4.2 4.2 0 0 0 5.9 5.9l6.2-6.2a9.2 9.2 0 0 0 11.8-11.8l-5.8 5.8-5.9-5.9 5.8-5.8Z" />
                  <path d="m16.2 23.8 4 4M31 5v5m-2.5-2.5h5" />
                </svg>
              ) : (
                <svg className="inventory-add-icon inventory-add-icon--production" viewBox="0 0 40 40" aria-hidden="true">
                  <text className="inventory-formula-main" x="19" y="26" textAnchor="middle">Σ</text>
                  <text className="inventory-formula-symbol inventory-formula-symbol--plus" x="7" y="12">+</text>
                  <text className="inventory-formula-symbol inventory-formula-symbol--multiply" x="28" y="13">×</text>
                  <text className="inventory-formula-symbol inventory-formula-symbol--equals" x="29" y="34">=</text>
                </svg>
              )}
            </button>
            {inventoryProductOpen && (
              <div
                className="inventory-product-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) {
                    setInventoryProductOpen(false)
                    setEditingInventoryProductId(null)
                  }
                }}
              >
                <section
                  className="inventory-product-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="inventory-product-title"
                >
                  <header className="inventory-product-heading">
                    <div className="inventory-product-title-block">
                      <span className="inventory-product-eyebrow">مدیریت کالا <span>•</span> انبار</span>
                      <h2 id="inventory-product-title">{editingInventoryProductId ? 'ویرایش کالا' : 'معرفی کالای جدید'}</h2>
                      <p>{editingInventoryProductId
                        ? 'مشخصات کالا را ویرایش کنید؛ موجودی هر انبار مستقل ذخیره می‌شود.'
                        : 'مشخصات کالا را وارد کنید تا به فهرست انبار اضافه شود.'}</p>
                    </div>
                    <div className="inventory-product-header-actions">
                      <span>{inventoryProductTab === 'basic' ? 'مرحله ۱ از ۲' : 'مرحله ۲ از ۲'}</span>
                      <button
                        type="button"
                        aria-label="بستن پنجره"
                        onClick={() => {
                          setInventoryProductOpen(false)
                          setEditingInventoryProductId(null)
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </header>
                  <div className="inventory-product-tabs" role="tablist" aria-label="بخش‌های فرم کالا">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={inventoryProductTab === 'basic'}
                      onClick={() => {
                        setInventoryProductTab('basic')
                        setInventoryProductError('')
                      }}
                    >
                      <span className="inventory-product-step-number">۱</span>
                      <span className="inventory-product-step-copy">
                        <strong>مشخصات اصلی</strong>
                        <small>نام، کد و واحد کالا</small>
                      </span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={inventoryProductTab === 'extra'}
                      onClick={() => {
                        setInventoryProductTab('extra')
                        setInventoryProductError('')
                      }}
                    >
                      <span className="inventory-product-step-number">۲</span>
                      <span className="inventory-product-step-copy">
                        <strong>اطلاعات تکمیلی</strong>
                        <small>قیمت، موجودی و بارکد</small>
                      </span>
                    </button>
                  </div>
                  <form className="inventory-product-form" onSubmit={saveInventoryProduct}>
                    {inventoryProductTab === 'basic' ? (
                      <div className="inventory-product-panel" role="tabpanel">
                        <label>
                          <span>کد</span>
                          <input value={inventoryProductFields.code} readOnly aria-label="کد کالا" />
                        </label>
                        <label>
                          <span>نام</span>
                          <input
                            autoFocus
                            value={inventoryProductFields.name}
                            onChange={(event) => setInventoryProductFields({ ...inventoryProductFields, name: event.target.value })}
                            placeholder="نام کالا"
                            aria-label="نام کالا"
                          />
                        </label>
                        <label>
                          <span>مدل</span>
                          <input
                            value={inventoryProductFields.brand}
                            onChange={(event) => setInventoryProductFields({ ...inventoryProductFields, brand: event.target.value })}
                            placeholder="اختیاری"
                            aria-label="مدل کالا"
                          />
                        </label>
                        <label>
                          <span>واحد</span>
                          {renderInventoryUnitSelector('product', inventoryProductFields.unit, 'کالا')}
                        </label>
                        <label>
                          <span>واحد دوم</span>
                          {renderInventoryUnitSelector('secondary', inventoryProductFields.secondaryUnit, 'واحد دوم کالا', true)}
                        </label>
                        <label>
                          <span>ضریب</span>
                          <input
                            inputMode="decimal"
                            value={formatDecimalInput(inventoryProductFields.conversionRatio)}
                            onChange={(event) => setInventoryProductFields({
                              ...inventoryProductFields,
                              conversionRatio: formatDecimalInput(event.target.value),
                            })}
                            placeholder="اختیاری"
                            aria-label="ضریب تبدیل"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="inventory-product-panel" role="tabpanel">
                        <label>
                          <span>بارکد</span>
                          <input
                            value={inventoryProductFields.barcode}
                            onChange={(event) => setInventoryProductFields({ ...inventoryProductFields, barcode: event.target.value })}
                            placeholder="اسکن بارکد"
                            aria-label="بارکد کالا"
                          />
                        </label>
                        <label>
                          <span>موجودی</span>
                          <input
                            inputMode="numeric"
                            value={formatAccountBalanceInput(inventoryProductFields.stock)}
                            onChange={(event) => setInventoryProductFields({
                              ...inventoryProductFields,
                              stock: formatAccountBalanceInput(event.target.value),
                            })}
                            aria-label="موجودی اولیه"
                          />
                        </label>
                        <label>
                          <span>قیمت خرید</span>
                          <input
                            inputMode="numeric"
                            value={formatAccountBalanceInput(inventoryProductFields.purchasePrice)}
                            onChange={(event) => setInventoryProductFields({
                              ...inventoryProductFields,
                              purchasePrice: formatAccountBalanceInput(event.target.value),
                            })}
                            aria-label="قیمت خرید"
                          />
                          <small>ریال</small>
                        </label>
                        <label>
                          <span>قیمت فروش</span>
                          <input
                            inputMode="numeric"
                            value={formatAccountBalanceInput(inventoryProductFields.salePrice)}
                            onChange={(event) => setInventoryProductFields({
                              ...inventoryProductFields,
                              salePrice: formatAccountBalanceInput(event.target.value),
                            })}
                            aria-label="قیمت فروش"
                          />
                          <small>ریال</small>
                        </label>
                      </div>
                    )}
                    {inventoryProductError && <p className="inventory-product-error" role="alert">{inventoryProductError}</p>}
                    <footer className="inventory-product-actions">
                      <button type="button" onClick={() => {
                        setInventoryProductOpen(false)
                        setEditingInventoryProductId(null)
                      }}>لغو</button>
                      <button type="submit">{editingInventoryProductId ? 'ذخیره تغییرات' : 'تایید'}</button>
                    </footer>
                  </form>
                </section>
              </div>
            )}
            {inventoryServiceOpen && (
              <div
                className="inventory-service-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setInventoryServiceOpen(false)
                }}
              >
                <section
                  className="inventory-service-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="inventory-service-title"
                >
                  <header className="inventory-service-heading">
                    <div className="inventory-service-title-block">
                      <span className="inventory-service-eyebrow">مدیریت خدمات <span>•</span> فهرست مستقل</span>
                      <h2 id="inventory-service-title">{editingInventoryServiceId ? 'ویرایش خدمات' : 'معرفی خدمات جدید'}</h2>
                      <p>{editingInventoryServiceId
                        ? 'مشخصات و گروه‌بندی خدمات را به‌روزرسانی کنید.'
                        : 'شرح و قیمت خدمات را وارد کنید تا به فهرست انتخاب‌شده اضافه شود.'}</p>
                    </div>
                    <button
                      className="inventory-service-close"
                      type="button"
                      aria-label="بستن پنجره"
                      onClick={() => {
                        setInventoryServiceOpen(false)
                        setEditingInventoryServiceId(null)
                      }}
                    >
                      ×
                    </button>
                  </header>
                  <form className="inventory-service-form" onSubmit={saveInventoryService}>
                    <div className="inventory-service-fields">
                      <label className="inventory-service-description">
                        <span>شرح خدمات</span>
                        <input
                          autoFocus
                          value={inventoryServiceFields.description}
                          onChange={(event) => setInventoryServiceFields({ ...inventoryServiceFields, description: event.target.value })}
                          placeholder="مثلاً تعمیر یا نصب دستگاه"
                          aria-label="شرح خدمات"
                        />
                      </label>
                      <label>
                        <span>قیمت هر واحد</span>
                        <div className="inventory-service-price">
                          <input
                            inputMode="numeric"
                            value={formatAccountBalanceInput(inventoryServiceFields.price)}
                            onChange={(event) => setInventoryServiceFields({
                              ...inventoryServiceFields,
                              price: formatAccountBalanceInput(event.target.value),
                            })}
                            placeholder="مبلغ را وارد کنید"
                            aria-label="قیمت هر واحد خدمات"
                          />
                          <small>ریال</small>
                        </div>
                      </label>
                      <label>
                        <span>واحد</span>
                        {renderInventoryUnitSelector('service', inventoryServiceFields.unit, 'خدمات')}
                      </label>
                    </div>
                    {inventoryServiceError && <p className="inventory-service-error" role="alert">{inventoryServiceError}</p>}
                    <footer className="inventory-service-actions">
                      <button type="button" onClick={() => {
                        setInventoryServiceOpen(false)
                        setEditingInventoryServiceId(null)
                      }}>لغو</button>
                      <button type="submit">{editingInventoryServiceId ? 'ذخیره تغییرات' : 'تایید و افزودن خدمات'}</button>
                    </footer>
                  </form>
                </section>
              </div>
            )}
            {inventoryUnitFormOpen && (
              <div
                className="inventory-unit-modal-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setInventoryUnitFormOpen(false)
                }}
              >
                <section
                  className="inventory-unit-modal"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="inventory-unit-modal-title"
                >
                  <header>
                    <span className="inventory-unit-modal-icon" aria-hidden="true">＋</span>
                    <div>
                      <span className="inventory-unit-modal-eyebrow">تنظیمات انبار</span>
                      <h2 id="inventory-unit-modal-title">افزودن واحد جدید</h2>
                    </div>
                    <button
                      type="button"
                      aria-label="بستن پنجره"
                      onClick={() => setInventoryUnitFormOpen(false)}
                    >
                      ×
                    </button>
                  </header>
                  <form onSubmit={saveInventoryUnit}>
                    <label>
                      <span>نام واحد</span>
                      <input
                        autoFocus
                        maxLength={30}
                        value={inventoryUnitInput}
                        onChange={(event) => {
                          setInventoryUnitInput(event.target.value)
                          setInventoryUnitError('')
                        }}
                        placeholder="مثلاً متر"
                        aria-label="نام واحد جدید"
                      />
                    </label>
                    <p>واحد تازه به فهرست واحدهای کالا و خدمات اضافه می‌شود.</p>
                    {inventoryUnitError && <p className="inventory-unit-modal-error" role="alert">{inventoryUnitError}</p>}
                    <footer>
                      <button type="button" onClick={() => setInventoryUnitFormOpen(false)}>لغو</button>
                      <button type="submit">تایید و افزودن</button>
                    </footer>
                  </form>
                </section>
              </div>
            )}
            {inventoryShareOpen && (
              <div
                className="inventory-share-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setInventoryShareOpen(false)
                }}
              >
                <section
                  className="inventory-share-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="inventory-share-title"
                >
                  <header className="inventory-share-heading">
                    <div className="inventory-share-heading-icon"><Icon name="inventory" /></div>
                    <div>
                      <span>گزارش و اشتراک‌گذاری</span>
                      <h2 id="inventory-share-title">اشتراک‌گذاری لیست کالاها</h2>
                    </div>
                    <button
                      className="inventory-share-close"
                      type="button"
                      aria-label="بستن پنجره"
                      onClick={() => setInventoryShareOpen(false)}
                    >
                      ×
                    </button>
                  </header>

                  <div className="inventory-share-content">
                    <section className="inventory-share-section" aria-label="محدودهٔ ارسال">
                      <h3>محدودهٔ ارسال</h3>
                      <div className="inventory-share-choice-card" role="radiogroup" aria-label="محدودهٔ کالاها">
                        <button
                          className="inventory-share-choice"
                          type="button"
                          role="radio"
                          aria-checked={inventoryShareSetting.scope === 'all'}
                          onClick={() => setInventoryShareSetting((current) => ({ ...current, scope: 'all' }))}
                        >
                          <span className="inventory-share-radio" aria-hidden="true" />
                          <span>ارسال همه کالاهای انبار</span>
                        </button>
                        <button
                          className="inventory-share-choice"
                          type="button"
                          role="radio"
                          aria-checked={inventoryShareSetting.scope === 'group'}
                          onClick={() => setInventoryShareSetting((current) => ({ ...current, scope: 'group' }))}
                        >
                          <span className="inventory-share-radio" aria-hidden="true" />
                          <span>انتخاب گروه کالا</span>
                        </button>
                      </div>
                      {inventoryShareSetting.scope === 'group' && (
                        <div className="inventory-share-filter-fields">
                          <div className="inventory-share-kind" role="group" aria-label="نوع گروه کالا">
                            {inventoryKinds.map((kind) => (
                              <button
                                className={inventoryShareSetting.kind === kind ? 'active' : ''}
                                key={kind}
                                type="button"
                                aria-pressed={inventoryShareSetting.kind === kind}
                                onClick={() => setInventoryShareSetting((current) => ({
                                  ...current,
                                  kind,
                                  group: 'همه',
                                  category: 'همه',
                                }))}
                              >
                                {kind}
                              </button>
                            ))}
                          </div>
                          <label className="inventory-share-select">
                            <span>گروه</span>
                            <select
                              value={inventoryShareSetting.group}
                              onChange={(event) => setInventoryShareSetting((current) => ({
                                ...current,
                                group: event.target.value,
                                category: 'همه',
                              }))}
                            >
                              <option value="همه">همهٔ گروه‌های {inventoryShareSetting.kind}</option>
                              {inventoryShareGroups.map((group) => <option key={group} value={group}>{group}</option>)}
                            </select>
                          </label>
                        </div>
                      )}
                    </section>

                    <section className="inventory-share-section" aria-label="فیلتر دسته‌بندی">
                      <h3>دسته‌بندی</h3>
                      <div className="inventory-share-choice-card" role="radiogroup" aria-label="محدودهٔ دسته‌بندی">
                        <button
                          className="inventory-share-choice"
                          type="button"
                          role="radio"
                          aria-checked={!inventoryShareSetting.categoryEnabled}
                          onClick={() => setInventoryShareSetting((current) => ({
                            ...current,
                            categoryEnabled: false,
                            category: 'همه',
                          }))}
                        >
                          <span className="inventory-share-radio" aria-hidden="true" />
                          <span>ارسال همهٔ دسته‌بندی‌ها</span>
                        </button>
                        <button
                          className="inventory-share-choice"
                          type="button"
                          role="radio"
                          aria-checked={inventoryShareSetting.categoryEnabled}
                          onClick={() => setInventoryShareSetting((current) => ({ ...current, categoryEnabled: true }))}
                        >
                          <span className="inventory-share-radio" aria-hidden="true" />
                          <span>انتخاب دسته‌بندی</span>
                        </button>
                      </div>
                      {inventoryShareSetting.categoryEnabled && (
                        <label className="inventory-share-select">
                          <span>دسته‌بندی</span>
                          <select
                            value={inventoryShareSetting.category}
                            onChange={(event) => setInventoryShareSetting((current) => ({ ...current, category: event.target.value }))}
                          >
                            <option value="همه">همهٔ دسته‌بندی‌ها</option>
                            {inventoryShareCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                          </select>
                        </label>
                      )}
                    </section>

                    {([
                      { key: 'includeZeroStock', title: 'کالاهای بدون موجودی ارسال شوند؟', yes: 'ارسال شوند', no: 'ارسال نشوند' },
                      { key: 'includePrices', title: 'قیمت کالاها درج شود؟', yes: 'قیمت درج شود', no: 'قیمت درج نشود' },
                      { key: 'includeStock', title: 'موجودی کالاها درج شود؟', yes: 'موجودی درج شود', no: 'موجودی درج نشود' },
                    ] as const).map(({ key, title, yes, no }) => (
                      <section className="inventory-share-setting-card" key={key} role="radiogroup" aria-label={title}>
                        <h3>{title}</h3>
                        {[{ value: true, label: yes }, { value: false, label: no }].map((choice) => (
                          <button
                            className="inventory-share-choice"
                            key={String(choice.value)}
                            type="button"
                            role="radio"
                            aria-checked={inventoryShareSetting[key] === choice.value}
                            onClick={() => setInventoryShareSetting((current) => ({ ...current, [key]: choice.value }))}
                          >
                            <span className="inventory-share-radio" aria-hidden="true" />
                            <span>{choice.label}</span>
                          </button>
                        ))}
                      </section>
                    ))}
                  </div>

                  <div className="inventory-share-footer">
                    <span>{formatPersonBalance(inventoryShareItems.length)} کالا برای ارسال</span>
                    <div className="inventory-share-actions">
                      <button type="button" onClick={() => void shareInventoryImage()}>
                        <span aria-hidden="true">▧</span>
                        ارسال به صورت تصویر
                      </button>
                      <button type="button" onClick={() => printInventoryShare(true)}>
                        <span aria-hidden="true">PDF</span>
                        ارسال به صورت PDF
                      </button>
                      <button type="button" onClick={() => printInventoryShare(false)}>
                        <span aria-hidden="true">↧</span>
                        ذخیره و چاپ
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        ) : activeTab === 'گزارش‌ها' ? (
          <div className="reports-view">
            <section className="page-intro reports-intro">
              <span className="intro-eyebrow">داشبورد مالی</span>
              <h1>گزارش‌ها</h1>
              <p>گزارش‌های مالی و عملکرد کسب‌وکارت</p>
            </section>
            <section className="content-section reports-page">
              <div className="section-heading">
                <h2 className="section-title">همه گزارش‌ها</h2>
                <span className="section-count">{reports.length} گزارش</span>
              </div>
              <div className="link-grid">
                {reports.map((item) => (
                  <button
                    className="list-link report-link"
                    key={item.label}
                    type="button"
                    onClick={() => showComingSoon(item.label)}
                  >
                    <span className="list-link-icon report-icon"><Icon name={item.icon} /></span>
                    <span>{item.label}</span>
                    <span className="chevron" aria-hidden="true">‹</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : activeTab === 'اشخاص' ? (
          <div className="people-page">
            <section className="people-hero">
              <span className="people-hero-icon"><Icon name="people" /></span>
              <div className="people-hero-copy">
                <span className="people-eyebrow">مدیریت ارتباط‌ها</span>
                <h1>اشخاص</h1>
                <p>مشتری‌ها، تأمین‌کننده‌ها و همکارانت را یک‌جا ببین.</p>
              </div>
            </section>

            <section className="people-summary" aria-label="خلاصه اشخاص">
              {[
                { label: 'همه', title: 'همهٔ اشخاص', icon: 'people', tone: 'mint' },
                { label: 'بدهکاران', title: 'بدهکاران', icon: 'cart', tone: 'blue' },
                { label: 'بستانکاران', title: 'بستانکاران', icon: 'box', tone: 'amber' },
                { label: 'تسویه شده', title: 'تسویه شده', icon: 'accounts', tone: 'mint' },
              ].map(({ label, title, icon, tone }) => (
                <button
                  className="people-summary-card"
                  type="button"
                  aria-pressed={peopleFilter === label}
                  key={label}
                  onClick={() => setPeopleFilter(label)}
                >
                  <span className={`people-summary-icon ${tone}`}><Icon name={icon} /></span>
                  <span className="people-summary-copy">
                    <strong>{allPeople.filter((person) => label === 'همه' || person.accountStatus === label).length}</strong>
                    <small>{title}</small>
                  </span>
                </button>
              ))}
            </section>

            <section className="people-list-section" aria-label="فهرست اشخاص">
              <div className="people-list-heading">
                <div>
                  <h2>فهرست اشخاص</h2>
                  <p>جست‌وجو و مشاهدهٔ خلاصهٔ حساب</p>
                </div>
                <span className="people-sample-badge">ذخیرهٔ محلی</span>
              </div>

              <div
                className="people-filters"
                ref={peopleFiltersRef}
                role="group"
                aria-label="دسته‌بندی اشخاص"
                onPointerDown={(event) => {
                  if (event.pointerType !== 'mouse' || event.button !== 0) return
                  if ((event.target as Element).closest('.people-group-actions')) return
                  peopleFilterDrag.current = {
                    pointerId: event.pointerId,
                    startX: event.clientX,
                    startScrollLeft: event.currentTarget.scrollLeft,
                    isDragging: false,
                  }
                }}
                onClickCapture={(event) => {
                  if (!suppressPeopleFilterClick.current) return
                  suppressPeopleFilterClick.current = false
                  event.preventDefault()
                  event.stopPropagation()
                }}
              >
                <button
                  className="people-add-group"
                  type="button"
                  aria-expanded={isAddingPeopleGroup}
                  onClick={() => {
                    setIsAddingPeopleGroup(!isAddingPeopleGroup)
                    setEditingPeopleGroup(null)
                    setPeopleGroupInput('')
                    setPeopleGroupError('')
                  }}
                >
                  <span aria-hidden="true">+</span>
                  گروه جدید
                </button>
                {[...peopleFilters, ...peopleGroupState.groups].map((filter) => (
                  <span
                    className={`people-filter-wrap${peopleFilters.includes(filter) ? '' : ` has-actions${peopleFilter === filter ? ' active' : ''}`}`}
                    key={filter}
                    onContextMenu={(event) => {
                      if (peopleFilters.includes(filter)) return
                      event.preventDefault()
                      openPeopleGroupMenu(filter, event.clientX, event.clientY)
                    }}
                    onPointerDown={(event) => {
                      clearPeopleGroupPressTimer()
                      suppressPeopleGroupClick.current = false
                      if (peopleFilters.includes(filter) || (event.pointerType !== 'touch' && event.pointerType !== 'pen')) return
                      if ((event.target as Element).closest('.people-group-actions')) return
                      const { clientX, clientY } = event
                      peopleGroupPressOrigin.current = { x: clientX, y: clientY }
                      peopleGroupPressTimer.current = window.setTimeout(() => {
                        suppressPeopleGroupClick.current = true
                        openPeopleGroupMenu(filter, clientX, clientY)
                        peopleGroupPressTimer.current = null
                      }, 550)
                    }}
                    onPointerMove={(event) => {
                      const origin = peopleGroupPressOrigin.current
                      if (!origin) return
                      if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 10) {
                        clearPeopleGroupPressTimer()
                      }
                    }}
                    onPointerUp={clearPeopleGroupPressTimer}
                    onPointerCancel={clearPeopleGroupPressTimer}
                  >
                    <button
                      className={`people-filter ${peopleFilter === filter ? 'active' : ''}`}
                      type="button"
                      aria-pressed={peopleFilter === filter}
                      aria-haspopup={peopleFilters.includes(filter) ? undefined : 'menu'}
                      onClick={() => {
                        if (suppressPeopleGroupClick.current) {
                          suppressPeopleGroupClick.current = false
                          return
                        }
                        setPeopleFilter(filter)
                        setPeopleGroupMenu(null)
                      }}
                    >
                      {filter}
                    </button>
                    {!peopleFilters.includes(filter) && (
                      <button
                        className="people-group-actions"
                        type="button"
                        aria-label={`گزینه‌های گروه ${filter}`}
                        title={`گزینه‌های گروه ${filter}`}
                        onClick={(event) => {
                          const bounds = event.currentTarget.getBoundingClientRect()
                          openPeopleGroupMenu(filter, bounds.left, bounds.bottom + 5)
                        }}
                      >
                        <span aria-hidden="true">⋮</span>
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {peopleGroupMenu && (
                <div
                  className="people-group-menu"
                  role="menu"
                  aria-label={`عملیات گروه ${peopleGroupMenu.group}`}
                  style={{ left: peopleGroupMenu.x, top: peopleGroupMenu.y }}
                >
                  <span className="people-group-menu-title">{peopleGroupMenu.group}</span>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setEditingPeopleGroup(peopleGroupMenu.group)
                      setPeopleGroupInput(peopleGroupMenu.group)
                      setIsAddingPeopleGroup(true)
                      setPeopleGroupError('')
                      setPeopleGroupMenu(null)
                    }}
                  >
                    ویرایش گروه
                  </button>
                  <button
                    className="delete"
                    type="button"
                    role="menuitem"
                    onClick={() => deletePeopleGroup(peopleGroupMenu.group)}
                  >
                    حذف گروه
                  </button>
                </div>
              )}

              {isAddingPeopleGroup && (
                <form className="people-add-group-form" onSubmit={addPeopleGroup}>
                  <label htmlFor="people-group-name">
                    {editingPeopleGroup ? 'ویرایش نام گروه' : 'نام گروه جدید'}
                  </label>
                  <input
                    id="people-group-name"
                    autoFocus
                    maxLength={40}
                    value={peopleGroupInput}
                    onChange={(event) => {
                      setPeopleGroupInput(event.target.value)
                      setPeopleGroupError('')
                    }}
                    placeholder="مثلاً همکاران"
                  />
                  <button type="submit">{editingPeopleGroup ? 'ذخیره تغییر' : 'افزودن گروه'}</button>
                </form>
              )}
              {(peopleGroupState.error || peopleGroupError) && (
                <p className="people-group-error" role="alert">
                  {peopleGroupError || peopleGroupState.error}
                </p>
              )}

              <div className="people-search-toolbar" ref={peopleToolbarRef}>
                <div className="people-toolbar-actions">
                  <div className="people-toolbar-action-wrap">
                    <button
                      className="people-toolbar-action-button"
                      type="button"
                      aria-label="گزینه‌های خروجی"
                      title="گزینه‌های خروجی"
                      aria-haspopup="menu"
                      aria-expanded={peopleToolbarMenu === 'export'}
                      onClick={() => setPeopleToolbarMenu(peopleToolbarMenu === 'export' ? null : 'export')}
                    >
                      <span className="people-toolbar-more" aria-hidden="true">⋮</span>
                    </button>
                    {peopleToolbarMenu === 'export' && (
                      <div className="people-toolbar-menu" role="menu" aria-label="گزینه‌های خروجی اشخاص">
                        <button type="button" role="menuitem" onClick={downloadPeopleExcel}>
                          خروجی اکسل
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setPeopleToolbarMenu(null)
                            window.requestAnimationFrame(() => window.print())
                          }}
                        >
                          چاپ فهرست
                        </button>
                        <button type="button" role="menuitem" onClick={downloadPeopleCsv}>
                          تهیه خروجی
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="people-toolbar-action-wrap">
                    <button
                      className="people-toolbar-action-button"
                      type="button"
                      aria-label="مرتب‌سازی اشخاص"
                      title={`مرتب‌سازی بر اساس ${peopleSortOptions.find((option) => option.value === peopleSortBy)?.label}، ${peopleSortDirection === 'asc' ? 'صعودی' : 'نزولی'}`}
                      aria-haspopup="menu"
                      aria-expanded={peopleToolbarMenu === 'sort'}
                      onClick={() => setPeopleToolbarMenu(peopleToolbarMenu === 'sort' ? null : 'sort')}
                    >
                      <PeopleToolbarIcon name="sort" />
                    </button>
                    {peopleToolbarMenu === 'sort' && (
                      <div className="people-toolbar-menu" role="menu" aria-label="مرتب‌سازی اشخاص">
                        {peopleSortOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            role="menuitemradio"
                            aria-checked={peopleSortBy === option.value}
                            onClick={() => {
                              if (peopleSortBy === option.value) {
                                setPeopleSortDirection(peopleSortDirection === 'asc' ? 'desc' : 'asc')
                              } else {
                                setPeopleSortBy(option.value)
                                setPeopleSortDirection(option.direction)
                              }
                              setPeopleToolbarMenu(null)
                            }}
                          >
                            <span className="people-sort-radio" aria-hidden="true">
                              <span />
                            </span>
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    className="people-toolbar-action-button"
                    type="button"
                    aria-label="گزارشات"
                    title="گزارشات"
                    onClick={() => {
                      setPeopleToolbarMenu(null)
                      setAccountReportGroup(allAccountReportGroups)
                      setActiveTab('گزارشات')
                    }}
                  >
                    <PeopleToolbarIcon name="chart" />
                  </button>
                </div>

                <label className="people-search">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="10.8" cy="10.8" r="6.8" />
                    <path d="m16 16 5 5" />
                  </svg>
                  <input
                    type="search"
                    value={peopleSearch}
                    onChange={(event) => setPeopleSearch(event.target.value)}
                    placeholder="جست‌وجوی نام یا شماره تماس..."
                    aria-label="جست‌وجو در اشخاص"
                  />
                </label>
              </div>

              <div className="people-list">
                {filteredPeople.map((person) => (
                    <article className="person-card" key={person.id}>
                      <span className={`person-avatar ${person.tone}`} aria-hidden="true">
                        {person.name.slice(0, 1)}
                      </span>
                      <span className="person-details">
                        <strong>{person.name}</strong>
                        {person.phone && <span className="person-contact">{person.phone}</span>}
                        {person.address && <span className="person-contact">{person.address}</span>}
                        {person.accountNumber && (
                          <span className="person-contact">حساب {person.accountNumber}</span>
                        )}
                        <span className="person-identity">
                          <span className="person-role">{person.group || person.role}</span>
                          <span className="person-code">کد {person.code}</span>
                        </span>
                      </span>
                      <span className="person-balance">
                        <small>ماندهٔ حساب</small>
                        <strong className={person.accountStatus === 'بدهکاران' ? 'debit' : person.accountStatus === 'بستانکاران' ? 'credit' : 'zero'}>
                          {formatPersonBalance(person.balance)}
                        </strong>
                        <small>ریال</small>
                      </span>
                    </article>
                  ))}
                {filteredPeople.length === 0 && (
                  <div className="people-empty">
                    <span className="people-empty-icon"><Icon name="people" /></span>
                    <strong>شخصی پیدا نشد</strong>
                    <span>عبارت جست‌وجو یا دسته‌بندی را تغییر بده.</span>
                  </div>
                )}
              </div>
            </section>
            {!personFormOpen && (
              <button
                className="people-add-button"
                type="button"
                aria-label="شخص جدید"
                title="شخص جدید"
                onClick={() => openPersonForm()}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="8" cy="7" r="3.5" />
                  <path d="M1.8 20v-1.2a4.3 4.3 0 0 1 4.3-4.3h3.8a4.3 4.3 0 0 1 4.3 4.3V20" />
                  <g className="people-add-icon-plus">
                    <path d="M19 4.5v7M15.5 8h7" />
                  </g>
                </svg>
                <span className="people-add-button-label">شخص جدید</span>
              </button>
            )}
            {personFormOpen && (
              <div
                className="person-modal-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) closePersonForm()
                }}
              >
                <section
                  className="person-modal"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="person-form-title"
                >
                  <div className="person-modal-heading">
                    <span className="person-modal-icon"><Icon name="people" /></span>
                    <div>
                      <span className="person-modal-eyebrow">دفتر اشخاص</span>
                      <h2 id="person-form-title">
                        معرفی {personFormRole === 'تأمین‌کننده' ? 'تأمین‌کننده' : 'شخص'} جدید
                      </h2>
                      <p>اطلاعات تماس و وضعیت حساب را ثبت کن.</p>
                    </div>
                    <button
                      className="person-modal-close"
                      type="button"
                      aria-label="بستن فرم"
                      onClick={closePersonForm}
                    >
                      ×
                    </button>
                  </div>
                  <div className="person-form-tabs" role="tablist" aria-label="بخش‌های فرم شخص">
                    <button
                      id="person-basic-tab"
                      type="button"
                      role="tab"
                      aria-selected={personFormTab === 'basic'}
                      aria-controls="person-basic-panel"
                      onClick={() => setPersonFormTab('basic')}
                    >
                      <span>۱</span> مشخصات اصلی
                    </button>
                    <button
                      id="person-extra-tab"
                      type="button"
                      role="tab"
                      aria-selected={personFormTab === 'extra'}
                      aria-controls="person-extra-panel"
                      onClick={() => setPersonFormTab('extra')}
                    >
                      <span>۲</span> حساب و مانده
                    </button>
                  </div>
                  <form className="person-form" onSubmit={savePerson}>
                    {personFormTab === 'basic' ? (
                      <div
                        className="person-form-panel"
                        id="person-basic-panel"
                        role="tabpanel"
                        aria-labelledby="person-basic-tab"
                      >
                        <div className="person-form-grid">
                          <label className="person-field person-field-code">
                            <span>کد شخص</span>
                            <input value={personFormFields.code} readOnly dir="ltr" />
                            <small>به‌صورت خودکار ایجاد می‌شود</small>
                          </label>
                          <label className="person-field person-field-name">
                            <span>نام و نام خانوادگی <b>*</b></span>
                            <input
                              required
                              maxLength={80}
                              value={personFormFields.name}
                              onChange={(event) => setPersonFormFields({ ...personFormFields, name: event.target.value })}
                              placeholder="نام شخص یا کسب‌وکار"
                            />
                          </label>
                          <label className="person-field">
                            <span>گروه شخص{peopleGroupState.groups.length > 0 && <b> *</b>}</span>
                            <div className="person-group-picker" ref={personGroupPickerRef}>
                              <button
                                className="person-group-picker-trigger"
                                type="button"
                                role="combobox"
                                aria-haspopup="listbox"
                                aria-expanded={personGroupPickerOpen}
                                aria-controls="person-group-options"
                                onClick={() => setPersonGroupPickerOpen(!personGroupPickerOpen)}
                              >
                                <span className={personFormFields.group ? '' : 'placeholder'}>
                                  {personFormFields.group || (peopleGroupState.groups.length > 0 ? 'انتخاب گروه' : 'بدون گروه')}
                                </span>
                                <span className="dropdown-chevron person-group-picker-chevron" aria-hidden="true">⌄</span>
                              </button>
                              {personGroupPickerOpen && (
                                <div
                                  className="person-group-picker-options"
                                  id="person-group-options"
                                  role="listbox"
                                  aria-label="انتخاب گروه شخص"
                                >
                                  <button
                                    className={personFormFields.group ? '' : 'selected'}
                                    type="button"
                                    role="option"
                                    aria-selected={!personFormFields.group}
                                    onClick={() => {
                                      setPersonFormFields({ ...personFormFields, group: '' })
                                      setPersonFormError('')
                                      setPersonGroupPickerOpen(false)
                                    }}
                                  >
                                    {peopleGroupState.groups.length > 0 ? 'انتخاب گروه' : 'بدون گروه'}
                                  </button>
                                  {peopleGroupState.groups.map((group) => (
                                    <button
                                      className={personFormFields.group === group ? 'selected' : ''}
                                      key={group}
                                      type="button"
                                      role="option"
                                      aria-selected={personFormFields.group === group}
                                      onClick={() => {
                                        setPersonFormFields({ ...personFormFields, group })
                                        setPersonFormError('')
                                        setPersonGroupPickerOpen(false)
                                      }}
                                    >
                                      {group}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {peopleGroupState.groups.length === 0 && (
                              <small>برای انتخاب گروه، ابتدا از نوار اشخاص یک گروه بسازید.</small>
                            )}
                          </label>
                          <label className="person-field">
                            <span>شماره تماس</span>
                            <input
                              type="tel"
                              maxLength={20}
                              value={personFormFields.phone}
                              onChange={(event) => setPersonFormFields({ ...personFormFields, phone: event.target.value })}
                              placeholder="مثلاً ۰۹۱۲۱۲۳۴۵۶۷"
                              dir="ltr"
                            />
                          </label>
                          <label className="person-field person-field-full">
                            <span>نشانی</span>
                            <input
                              maxLength={180}
                              value={personFormFields.address}
                              onChange={(event) => setPersonFormFields({ ...personFormFields, address: event.target.value })}
                              placeholder="استان، شهر، خیابان"
                            />
                          </label>
                        </div>
                        <div className="person-form-hint">
                          <Icon name="check" />
                          <span>کد شخص برای پیگیری و جست‌وجوی سریع ثبت می‌شود.</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="person-form-panel"
                        id="person-extra-panel"
                        role="tabpanel"
                        aria-labelledby="person-extra-tab"
                      >
                        <div className="person-form-grid">
                          <label className="person-field person-field-full">
                            <span>شماره حساب شخص <small>(اختیاری)</small></span>
                            <input
                              maxLength={40}
                              value={personFormFields.accountNumber}
                              onChange={(event) => setPersonFormFields({ ...personFormFields, accountNumber: event.target.value })}
                              placeholder="شماره حساب در دفتر شما"
                            />
                          </label>
                          <label className="person-field">
                            <span>ماندهٔ اولیه <small>(ریال)</small></span>
                            <input
                              inputMode="numeric"
                              value={formatAccountBalanceInput(personFormFields.balance)}
                              onChange={(event) => setPersonFormFields({
                                ...personFormFields,
                                balance: formatAccountBalanceInput(event.target.value),
                              })}
                              placeholder="۰"
                              dir="ltr"
                            />
                          </label>
                        </div>
                        <fieldset className="person-balance-options">
                          <legend>ماهیت مانده</legend>
                          <label className={personFormFields.balanceDirection === 'debit' ? 'selected debit' : 'debit'}>
                            <input
                              type="radio"
                              name="person-balance-direction"
                              value="debit"
                              checked={personFormFields.balanceDirection === 'debit'}
                              onChange={() => setPersonFormFields({ ...personFormFields, balanceDirection: 'debit' })}
                            />
                            <span className="person-balance-radio" />
                            <span>بدهکار</span>
                          </label>
                          <label className={personFormFields.balanceDirection === 'credit' ? 'selected credit' : 'credit'}>
                            <input
                              type="radio"
                              name="person-balance-direction"
                              value="credit"
                              checked={personFormFields.balanceDirection === 'credit'}
                              onChange={() => setPersonFormFields({ ...personFormFields, balanceDirection: 'credit' })}
                            />
                            <span className="person-balance-radio" />
                            <span>بستانکار</span>
                          </label>
                        </fieldset>
                        {personFormFields.balance === '0' && (
                          <p className="person-settled-hint">ماندهٔ صفر به‌عنوان «تسویه شده» ثبت می‌شود.</p>
                        )}
                      </div>
                    )}
                    {(personFormError || storedPeopleState.error) && (
                      <p className="person-form-error" role="alert">
                        {personFormError || storedPeopleState.error}
                      </p>
                    )}
                    <div className="person-form-actions">
                      <button
                        className="person-form-cancel"
                        type="button"
                        onClick={closePersonForm}
                      >
                        انصراف
                      </button>
                      {personFormTab === 'basic' ? (
                        <button
                          className="person-form-next"
                          type="button"
                          onClick={() => {
                            if (!personFormFields.name.trim()) {
                              setPersonFormError('نام شخص را وارد کنید.')
                              return
                            }
                            setPersonFormError('')
                            setPersonFormTab('extra')
                          }}
                        >
                          ادامهٔ مشخصات <span aria-hidden="true">←</span>
                        </button>
                      ) : (
                        <button className="person-form-save" type="submit">
                          ثبت شخص <span aria-hidden="true">✓</span>
                        </button>
                      )}
                    </div>
                  </form>
                </section>
              </div>
            )}
          </div>
        ) : activeTab === 'فروشگاه' ? (
          <div className="store-page">
            <section className="store-hero">
              <span className="store-hero-icon"><Icon name="shop" /></span>
              <div>
                <span className="store-eyebrow">مدیریت کسب‌وکار</span>
                <h1>فروشگاه‌های من</h1>
                <p>اطلاعات فروشگاه‌هایت را اینجا مدیریت کن.</p>
              </div>
              <span className="store-count">{stores.length} فروشگاه</span>
            </section>

            {storeState.error && (
              <p className="store-storage-error" role="alert">{storeState.error}</p>
            )}

            <section className="store-list-section" aria-label="فهرست فروشگاه‌ها">
              <div className="store-list-heading">
                <div>
                  <h2>فهرست فروشگاه‌ها</h2>
                  <p>برای ورود به محیط هر فروشگاه، آن را انتخاب کن.</p>
                </div>
                <span className="store-list-count">{stores.length}</span>
              </div>

              {stores.length > 0 ? (
                <div className="store-list">
                  {stores.map((store) => (
                    <article
                      className={`store-card ${activeStoreId === store.id ? 'active' : ''}`}
                      key={store.id}
                    >
                      <span className="store-card-icon"><Icon name="shop" /></span>
                      <div className="store-card-details">
                        <h3>{store.name}</h3>
                        <p>{store.phone}</p>
                        <p>{store.address}</p>
                      </div>
                      <button
                        className={`store-select-button ${activeStoreId === store.id ? 'selected' : ''}`}
                        type="button"
                        aria-pressed={activeStoreId === store.id}
                        onClick={() => {
                          const entered = updateStoreState((current) => ({
                            ...current,
                            activeStoreId: store.id,
                          }))
                          if (entered) setActiveTab('خانه')
                        }}
                      >
                        ورود به فروشگاه
                      </button>
                      <button
                        className="store-edit-button"
                        type="button"
                        onClick={() => openStoreForm(store)}
                      >
                        ویرایش
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="store-empty">
                  <span className="store-empty-icon"><Icon name="shop" /></span>
                  <h3>هنوز فروشگاهی ثبت نشده</h3>
                  <p>برای شروع، اطلاعات اولین فروشگاهت را وارد کن.</p>
                </div>
              )}
            </section>

            <div className="store-scope-note">
              <Icon name="note" />
              <p>
                فهرست اشخاص، کالاها، گروه‌ها و تنظیمات فاکتور هر فروشگاه جداگانه ذخیره می‌شود.
              </p>
            </div>

            <button
              className="store-create-button"
              type="button"
              onClick={() => openStoreForm()}
            >
              <span aria-hidden="true">+</span>
              ایجاد فروشگاه جدید
            </button>

            {storeFormOpen && (
              <div
                className="store-modal-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) setStoreFormOpen(false)
                }}
              >
                <section
                  className="store-modal"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="store-form-title"
                >
                  <div className="store-modal-heading">
                    <span className="store-modal-icon"><Icon name="shop" /></span>
                    <div>
                      <h2 id="store-form-title">
                        {editingStoreId === null ? 'ایجاد فروشگاه' : 'ویرایش فروشگاه'}
                      </h2>
                      <p>اطلاعات فروشگاه را وارد کن</p>
                    </div>
                    <button
                      className="store-modal-close"
                      type="button"
                      aria-label="بستن فرم"
                      onClick={() => setStoreFormOpen(false)}
                    >
                      ×
                    </button>
                  </div>
                  <form className="store-form" onSubmit={saveStore}>
                    <label className="store-field">
                      <span>نام فروشگاه</span>
                      <input
                        autoFocus
                        required
                        maxLength={80}
                        value={storeFields.name}
                        onChange={(event) => setStoreFields({ ...storeFields, name: event.target.value })}
                        placeholder="مثلاً فروشگاه مرکزی"
                      />
                    </label>
                    <label className="store-field">
                      <span>آدرس</span>
                      <input
                        required
                        maxLength={180}
                        value={storeFields.address}
                        onChange={(event) => setStoreFields({ ...storeFields, address: event.target.value })}
                        placeholder="استان، شهر، خیابان"
                      />
                    </label>
                    <label className="store-field">
                      <span>تلفن</span>
                      <input
                        required
                        type="tel"
                        maxLength={20}
                        value={storeFields.phone}
                        onChange={(event) => setStoreFields({ ...storeFields, phone: event.target.value })}
                        placeholder="شماره تماس فروشگاه"
                        dir="ltr"
                      />
                    </label>
                    <label className="store-field">
                      <span>کد اقتصادی <small>(اختیاری)</small></span>
                      <input
                        maxLength={40}
                        value={storeFields.code}
                        onChange={(event) => setStoreFields({ ...storeFields, code: event.target.value })}
                        placeholder="کد اقتصادی"
                      />
                    </label>
                    <label className="store-field">
                      <span>واحد پول</span>
                      <select
                        value={storeFields.currency}
                        onChange={(event) => setStoreFields({ ...storeFields, currency: event.target.value })}
                      >
                        <option value="ریال">ریال</option>
                        <option value="تومان">تومان</option>
                      </select>
                    </label>
                    <div className="store-form-actions">
                      <button
                        className="store-cancel-button"
                        type="button"
                        onClick={() => setStoreFormOpen(false)}
                      >
                        انصراف
                      </button>
                      <button className="store-save-button" type="submit">
                        ذخیره اطلاعات
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            )}
          </div>
        ) : (
          <>
        <section className="page-intro" aria-label="نمای کلی">
          <div className="intro-copy">
            <span className="intro-eyebrow">مدیریت مالی کسب‌وکار</span>
            <h1>همه‌چیز مرتب و شفاف</h1>
            <p>عملیات روزانه‌ات را از اینجا مدیریت کن.</p>
          </div>
          <div className="date-tools">
            <div className="date-pill" aria-label="تاریخ و ساعت ایران">
              <Icon name="calendar" />
              <span className="iran-date">
                {formatCalendarDate(
                  new Date(`${getIranDateValue(now)}T12:00:00Z`),
                  'persian',
                  true,
                )}
              </span>
              <span className="date-divider" aria-hidden="true" />
              <span className="iran-time">
                <Icon name="clock" />
                <time dateTime={now.toISOString()}>{getIranTime(now)}</time>
              </span>
            </div>
          </div>
        </section>

        <section className="quick-section" aria-label="داشبورد">
          <div className="section-heading">
            <div>
              <h2 className="section-title">داشبورد</h2>
            </div>
            {activeStore && (
              <span className="dashboard-store-name" title={activeStore.name}>
                {activeStore.name}
              </span>
            )}
          </div>
          <div className="shortcut-grid">
            {quickLinks.map((item) => (
              <button
                className="shortcut"
                key={item.label}
                type="button"
                onClick={() => (
                  item.label === 'پشتیبانی'
                    ? (setSupportFaqOpen(false), setSupportOpen(true))
                    : item.label === 'فروشگاه'
                      ? setActiveTab('فروشگاه')
                      : item.label === 'تنظیمات'
                        ? (setActiveSettingsSection(''), setActiveTab('تنظیمات'))
                      : showComingSoon(item.label)
                )}
              >
                <span className={`shortcut-icon ${item.tone}`}>
                  <Icon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="content-section entry-section">
          <div className="section-heading">
            <div>
              <h2 className="section-title">ثبت سند</h2>
              <p className="section-subtitle">عملیات مالی موردنظرت را انتخاب کن</p>
            </div>
            <span className="section-count">{entries.length} عملیات</span>
          </div>
          <div className="entry-grid">
            {entries.map((item) => (
              <button
                className={[
                  'entry-card',
                  item.label === 'فاکتور خرید' && 'purchase-invoice-card',
                ].filter(Boolean).join(' ')}
                key={item.label}
                type="button"
                onClick={() => item.label === 'فاکتور فروش'
                  ? openSalesInvoice()
                  : item.label === 'فاکتور خرید'
                    ? openPurchaseInvoice()
                    : item.label === 'برگشت از فروش'
                      ? openReturnSalesInvoice()
                      : item.label === 'برگشت به خرید'
                        ? openReturnPurchaseInvoice()
                      : item.label === 'دریافت چک'
                        ? openMoneyDocumentForm('دریافت چک')
                          : item.label === 'پرداخت چک'
                            ? openMoneyDocumentForm('پرداخت چک')
                              : item.label === 'خرج چک'
                                ? openMoneyDocumentForm('خرج چک')
                              : isMoneyDocumentKind(item.label)
                      ? openMoneyDocumentForm(item.label)
                    : showComingSoon(item.label)}
              >
                <span className="entry-icon"><Icon name={item.icon} /></span>
                <span className="entry-copy">
                  <span className="entry-label">{item.label}</span>
                  <span className="entry-hint">{item.hint}</span>
                </span>
                <span className="entry-chevron" aria-hidden="true">‹</span>
              </button>
            ))}
          </div>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <div>
              <h2 className="section-title">اسناد</h2>
              <p className="section-subtitle">مشاهده و پیگیری اسناد ثبت‌شده</p>
            </div>
            <span className="section-count">{documents.length} دسته</span>
          </div>
          <div className="link-grid">
            {documents.map((item) => (
              <button
                className="list-link"
                key={item.label}
                type="button"
                onClick={() => {
                  if (activeTab === 'خانه') {
                    homeScrollPositionRef.current = homeContentRef.current?.scrollTop ?? null
                  }
                  if (item.label === 'فاکتورهای فروش') {
                    setSalesInvoiceListFilter('all')
                    setSalesInvoiceListSearch('')
                    setSalesInvoiceListSearchOpen(false)
                    setActiveTab('فاکتورهای فروش')
                  } else if (item.label === 'فاکتورهای خرید') {
                    setPurchaseInvoiceListSearch('')
                    setPurchaseInvoiceListSearchOpen(false)
                    setStoredPurchaseInvoices(readStoredPurchaseInvoices(activeStoreId))
                    setActiveTab('فاکتورهای خرید')
                  } else if (item.label === 'برگشت از فروش') {
                    setReturnInvoiceListSearch('')
                    setReturnInvoiceListSearchOpen(false)
                    setStoredReturnSalesInvoices(
                      readStoredReturnInvoices(RETURN_SALES_INVOICES_STORAGE_KEY, 'sales', activeStoreId),
                    )
                    setActiveTab('فهرست برگشت از فروش')
                  } else if (item.label === 'برگشت به خرید') {
                    setReturnInvoiceListSearch('')
                    setReturnInvoiceListSearchOpen(false)
                    setStoredReturnPurchaseInvoices(
                      readStoredReturnInvoices(RETURN_PURCHASE_INVOICES_STORAGE_KEY, 'purchase', activeStoreId),
                    )
                    setActiveTab('فهرست برگشت به خرید')
                  } else if (item.label === 'چک‌های دریافتی') {
                    setCheckListFilter('all')
                    setCheckListSearch('')
                    setCheckListSearchOpen(false)
                    setStoredReceivedChecks(readStoredReceivedChecks(activeStoreId))
                    setActiveTab('فهرست چک‌های دریافتی')
                  } else if (item.label === 'چک‌های پرداختی') {
                    setCheckListFilter('all')
                    setCheckListSearch('')
                    setCheckListSearchOpen(false)
                    setStoredPaidChecks(readStoredPaidChecks(activeStoreId))
                    setActiveTab('فهرست چک‌های پرداختی')
                  } else if (item.label === 'دریافت‌ها' || item.label === 'پرداخت‌ها') {
                    setCashDocumentListSearch('')
                    setCashDocumentListSearchOpen(false)
                    setStoredMoneyDocuments(readStoredMoneyDocuments(activeStoreId))
                    setActiveTab(item.label === 'دریافت‌ها' ? 'فهرست دریافت‌ها' : 'فهرست پرداخت‌ها')
                  } else if (item.label === 'درآمدها') {
                    setIncomeListSearch('')
                    setIncomeListSearchOpen(false)
                    setStoredMoneyDocuments(readStoredMoneyDocuments(activeStoreId))
                    setActiveTab('فهرست درآمدها')
                  } else if (item.label === 'هزینه‌ها') {
                    setExpenseListSearch('')
                    setExpenseListSearchOpen(false)
                    setStoredMoneyDocuments(readStoredMoneyDocuments(activeStoreId))
                    setActiveTab('فهرست هزینه‌ها')
                  } else {
                    showComingSoon(item.label)
                  }
                }}
              >
                <span className="list-link-icon"><Icon name={item.icon} /></span>
                <span>{item.label}</span>
                <span className="chevron" aria-hidden="true">‹</span>
              </button>
            ))}
          </div>
        </section>

          </>
        )}
      </main>

      {supportOpen && (
        <div
          className="support-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSupportOpen(false)
          }}
        >
          <section
            className="support-page"
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-page-title"
          >
            <div className="support-sheet-handle" aria-hidden="true" />
            <header className="support-page-heading">
              <span aria-hidden="true" />
              <h1 id="support-page-title">پشتیبانی</h1>
              <button
                type="button"
                aria-label="بستن پنل پشتیبانی"
                onClick={() => setSupportOpen(false)}
              >
                ×
              </button>
            </header>

            <div className="support-page-intro">
              جهت ارتباط با پشتیبانی، یکی از پیام‌رسان‌های زیر را که در گوشی خود نصب دارید، انتخاب کنید.
            </div>

            <div className="support-options" aria-label="راه‌های ارتباط با پشتیبانی">
              <div className="support-option-group">
                <button
                  className="support-option"
                  type="button"
                  aria-expanded={supportFaqOpen}
                  onClick={() => setSupportFaqOpen((open) => !open)}
                >
                  <span className="support-option-chevron" aria-hidden="true">‹</span>
                  <span className="support-option-label">سوالات متداول و پرتکرار</span>
                  <span className="support-option-icon faq" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M9.6 9a2.5 2.5 0 1 1 4.4 1.6c-.8.9-2 1.2-2 2.7M12 16.8v.1" />
                    </svg>
                  </span>
                </button>
                {supportFaqOpen && (
                  <div className="support-faq-content">
                    محتوای سوالات متداول به‌زودی اضافه می‌شود. برای دریافت راهنمایی، از گفتگوی مستقیم داخل برنامه استفاده کنید.
                  </div>
                )}
              </div>

              <button className="support-option" type="button" onClick={openSupportChat}>
                <span className="support-option-chevron" aria-hidden="true">‹</span>
                <span className="support-option-label">ارتباط مستقیم از داخل برنامه</span>
                <span className="support-option-icon chat" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 5.5h16v12H9l-5 3v-15Z" />
                    <path d="M8 9h8M8 13h6" />
                  </svg>
                </span>
              </button>

              <button
                className="support-option"
                type="button"
                onClick={() => setNotice('برای فعال‌سازی ارتباط واتساپ، اطلاعات تماس پشتیبانی لازم است.')}
              >
                <span className="support-option-chevron" aria-hidden="true">‹</span>
                <span className="support-option-label">ارتباط از طریق واتساپ</span>
                <span className="support-option-icon whatsapp" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M20 11.7a8 8 0 0 1-11.8 7L4 20l1.3-4A8 8 0 1 1 20 11.7Z" />
                    <path d="M9 8.5c.3-.6.7-.5 1-.1l.8 1.2c.2.3.1.6-.2.9l-.5.5c.6 1.2 1.5 2.1 2.8 2.7l.5-.6c.2-.3.5-.3.8-.2l1.2.6c.4.2.5.6.2 1-.4.6-.9.9-1.6.9-2.2-.2-5.8-3.4-5.8-5.8 0-.5.3-.9.8-1.1Z" />
                  </svg>
                </span>
              </button>

              <button
                className="support-option"
                type="button"
                onClick={() => setNotice('برای فعال‌سازی ارتباط ایتا، نشانی پشتیبانی لازم است.')}
              >
                <span className="support-option-chevron" aria-hidden="true">‹</span>
                <span className="support-option-label">ارتباط از طریق ایتا</span>
                <span className="support-option-icon eitaa" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M20.2 5.2 17 19c-.2 1-1 1.2-1.8.7l-4.8-3.5-2.3 2.2c-.3.3-.6.5-1.1.5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.3L4.6 12.6l-4-1.3c-.9-.3-.9-.9.2-1.3L19 3.4c.8-.3 1.5.2 1.2 1.8Z" />
                  </svg>
                </span>
              </button>
            </div>
          </section>
        </div>
      )}

      {moneyDocumentKind && (
        <div
          className="sales-invoice-receipt-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !moneyDocumentSaving) {
              setMoneyDocumentKind(null)
              setMoneyDocumentError('')
            }
          }}
        >
          <section
            className="sales-invoice-receipt-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="money-document-title"
          >
            <header className="sales-invoice-receipt-header">
              <h2 id="money-document-title">
                {moneyDocumentKind === 'خرج چک'
                  ? 'واگذاری چک دریافتی'
                  : `ثبت ${moneyDocumentKind}${moneyDocumentKind === 'دریافت' || moneyDocumentKind === 'پرداخت' ? ' وجه' : ''}`}
              </h2>
              <p>سند شمارهٔ {formatPersonCode(
                moneyDocumentKind === 'خرج چک'
                  ? storedReceivedChecks.checks.filter((check) => check.transfer).length + 1
                  : moneyDocumentKind === 'دریافت چک'
                  ? storedReceivedChecks.checks.length + 1
                  : moneyDocumentKind === 'پرداخت چک'
                    ? storedPaidChecks.checks.length + 1
                  : storedMoneyDocuments.documents.filter((item) => item.kind === moneyDocumentKind).length + 1,
              )}</p>
            </header>
            <form onSubmit={saveMoneyDocument}>
              <div className={`sales-invoice-receipt-tools money-document-tools${moneyDocumentKind === 'خرج چک' ? ' money-document-check-transfer-tools' : ''}`}>
                <div className="sales-invoice-receipt-tool-group">
                  <button
                    className="sales-invoice-receipt-date"
                    type="button"
                    aria-label={`انتخاب تاریخ ${moneyDocumentKind}`}
                    onClick={() => openMoneyDocumentDatePicker()}
                  >
                    <span aria-hidden="true">▦</span>
                    <span className="sales-invoice-receipt-control-copy">
                      <small>
                        تاریخ {moneyDocumentKind} · {
                          invoiceCalendars.find((calendar) => calendar.id === moneyDocumentCalendar)?.label ?? 'شمسی'
                        }
                      </small>
                      <strong>{formatCalendarDate(
                        new Date(`${moneyDocumentFields.date}T12:00:00Z`),
                        moneyDocumentCalendar,
                      )}</strong>
                    </span>
                    <span className="dropdown-chevron sales-invoice-receipt-control-chevron" aria-hidden="true">⌄</span>
                  </button>
                  <button
                    className="sales-invoice-receipt-time"
                    type="button"
                    aria-label={`انتخاب ساعت ${moneyDocumentKind}`}
                    onClick={openMoneyDocumentTimePicker}
                  >
                    <span aria-hidden="true">◷</span>
                    <span className="sales-invoice-receipt-control-copy">
                      <small>ساعت {moneyDocumentKind}</small>
                      <strong>{moneyDocumentFields.time.replace(/\d/g, (digit) => (
                        String.fromCharCode(0x06f0 + Number(digit))
                      ))}</strong>
                    </span>
                    <span className="dropdown-chevron sales-invoice-receipt-control-chevron" aria-hidden="true">⌄</span>
                  </button>
                </div>
                <div className="sales-invoice-receipt-tool-group secondary">
                  <button
                    type="button"
                    aria-label={moneyDocumentKind === 'دریافت چک' || moneyDocumentKind === 'پرداخت چک'
                      ? moneyDocumentNoteOpen ? 'بستن یادداشت' : 'افزودن یادداشت'
                      : moneyDocumentNoteOpen ? 'بستن توضیحات' : 'افزودن توضیحات'}
                    aria-pressed={moneyDocumentNoteOpen}
                    className={moneyDocumentNoteOpen ? 'active' : ''}
                    onClick={() => setMoneyDocumentNoteOpen((open) => !open)}
                  >
                    <span aria-hidden="true">▤</span>
                    <span>{moneyDocumentKind === 'دریافت چک' || moneyDocumentKind === 'پرداخت چک'
                      ? 'یادداشت' : 'توضیحات'}</span>
                  </button>
                  <button
                    type="button"
                    className={moneyDocumentFields.attachment ? 'active' : ''}
                    aria-label={moneyDocumentFields.attachment ? 'مدیریت پیوست سند' : 'افزودن پیوست سند'}
                    aria-expanded={moneyDocumentAttachmentPickerOpen}
                    onClick={openMoneyDocumentAttachmentPicker}
                  >
                    <span aria-hidden="true">{moneyDocumentFields.attachment ? '✓' : '↗'}</span>
                    <span>{moneyDocumentFields.attachment ? 'پیوست شد' : 'پیوست'}</span>
                  </button>
                  <input
                    ref={moneyDocumentAttachmentInputRef}
                    className="money-document-file-input"
                    type="file"
                    accept="image/*"
                    aria-label="انتخاب عکس سند از گالری"
                    onChange={handleMoneyDocumentAttachmentChange}
                  />
                  <input
                    ref={moneyDocumentCameraInputRef}
                    className="money-document-file-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    aria-label="گرفتن عکس سند با دوربین"
                    onChange={handleMoneyDocumentAttachmentChange}
                  />
                </div>
              </div>
              <div className="sales-invoice-receipt-fields">
                {(moneyDocumentKind === 'دریافت' || moneyDocumentKind === 'پرداخت'
                  || moneyDocumentKind === 'دریافت چک' || moneyDocumentKind === 'پرداخت چک'
                  || moneyDocumentKind === 'خرج چک') && (
                  <label className="sales-invoice-receipt-field">
                    <span className="sales-invoice-receipt-field-icon" aria-hidden="true">♙</span>
                    <span className="sales-invoice-receipt-field-label">
                      {moneyDocumentKind === 'دریافت چک'
                        ? 'طرف حساب:'
                        : moneyDocumentKind === 'پرداخت چک' ? 'پرداخت به:'
                          : moneyDocumentKind === 'خرج چک' ? 'واگذاری به:' : 'شخص:'}
                    </span>
                    <span className="sales-invoice-receipt-account-wrap">
                      <select
                        aria-label={moneyDocumentKind === 'خرج چک'
                          ? 'شخص مقصد واگذاری چک'
                          : moneyDocumentKind === 'دریافت چک' || moneyDocumentKind === 'پرداخت چک'
                          ? 'طرف حساب چک' : 'شخص سند'}
                        value={moneyDocumentFields.personId}
                        onChange={(event) => setMoneyDocumentFields((fields) => ({
                          ...fields,
                          personId: event.target.value,
                        }))}
                        required
                      >
                        <option value="">انتخاب شخص</option>
                        {storedPeopleState.people.map((person) => (
                          <option key={person.id} value={person.id}>
                            {person.name} · {person.role}
                          </option>
                        ))}
                      </select>
                      {storedPeopleState.people.find((person) => person.id === moneyDocumentFields.personId) && (
                        <small>
                          ماندهٔ حساب:{' '}
                          {formatPersonBalance(
                            storedPeopleState.people.find((person) => (
                              person.id === moneyDocumentFields.personId
                            ))?.balance ?? 0,
                          )} ریال
                        </small>
                      )}
                      {storedPeopleState.people.length === 0 && (
                        <small className="sales-invoice-receipt-no-account">
                          برای ثبت {moneyDocumentKind}، ابتدا شخص را در بخش اشخاص اضافه کنید.
                        </small>
                      )}
                    </span>
                  </label>
                )}
                {moneyDocumentKind === 'خرج چک' && (
                  <section className="money-document-check-picker" aria-label="انتخاب چک برای واگذاری">
                    <div className="money-document-check-picker-heading">
                      <div>
                        <strong>چک دریافتی</strong>
                        <small>چکی را که می‌خواهی واگذار کنی انتخاب کن</small>
                      </div>
                      <span aria-hidden="true">▤</span>
                    </div>
                    {storedReceivedChecks.error ? (
                      <p className="sales-invoice-receipt-error" role="alert">
                        {storedReceivedChecks.error}
                      </p>
                    ) : (
                      <>
                        {(() => {
                          const selectedCheck = storedReceivedChecks.checks.find((check) => (
                            check.id === moneyDocumentSelectedCheckId && !check.transfer
                          ))
                          return selectedCheck ? (
                            <div className="money-document-selected-check">
                              <div>
                                <span>شماره چک</span>
                                <strong>{selectedCheck.number}</strong>
                              </div>
                              <div>
                                <span>نام بانک</span>
                                <strong>{selectedCheck.bankName}</strong>
                              </div>
                              <div>
                                <span>مبلغ چک</span>
                                <strong>{formatPersonBalance(selectedCheck.amount)} <small>ریال</small></strong>
                              </div>
                              <button
                                type="button"
                                aria-label="حذف چک انتخاب‌شده"
                                onClick={() => setMoneyDocumentSelectedCheckId('')}
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <p className="money-document-no-check-selected">
                              هنوز چکی برای واگذاری انتخاب نشده است.
                            </p>
                          )
                        })()}
                        <button
                          className="money-document-check-picker-trigger"
                          type="button"
                          aria-expanded={moneyDocumentCheckPickerOpen}
                          onClick={() => setMoneyDocumentCheckPickerOpen((open) => !open)}
                        >
                          <span aria-hidden="true">{moneyDocumentCheckPickerOpen ? '−' : '+'}</span>
                          {moneyDocumentCheckPickerOpen ? 'بستن فهرست چک‌ها' : 'انتخاب چک دریافتی'}
                        </button>
                        {moneyDocumentCheckPickerOpen && (
                          <div className="money-document-check-options" role="listbox" aria-label="چک‌های آماده واگذاری">
                            {storedReceivedChecks.checks.filter((check) => !check.transfer).length > 0 ? (
                              storedReceivedChecks.checks
                                .filter((check) => !check.transfer)
                                .map((check) => (
                                  <button
                                    key={check.id}
                                    type="button"
                                    role="option"
                                    aria-selected={moneyDocumentSelectedCheckId === check.id}
                                    onClick={() => {
                                      setMoneyDocumentSelectedCheckId(check.id)
                                      setMoneyDocumentCheckPickerOpen(false)
                                    }}
                                  >
                                    <span className="money-document-check-option-icon" aria-hidden="true">▤</span>
                                    <span className="money-document-check-option-copy">
                                      <strong>{check.bankName} · چک {check.number}</strong>
                                      <small>{check.personName} · سررسید {formatCalendarDate(
                                        new Date(`${check.dueDate}T12:00:00Z`),
                                        check.calendar,
                                      )}</small>
                                    </span>
                                    <strong className="money-document-check-option-amount">
                                      {formatPersonBalance(check.amount)} <small>ریال</small>
                                    </strong>
                                  </button>
                                ))
                            ) : (
                              <p>چک دریافتیِ آمادهٔ واگذاری وجود ندارد.</p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </section>
                )}
                {(moneyDocumentKind === 'دریافت چک' || moneyDocumentKind === 'پرداخت چک') && (
                  <>
                    <label className="sales-invoice-receipt-field">
                      <span className="sales-invoice-receipt-field-icon" aria-hidden="true">⌁</span>
                      <span className="sales-invoice-receipt-field-label">شناسه صیادی:</span>
                      <span className="sales-invoice-receipt-input-wrap">
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          aria-label="شناسه صیادی چک"
                          value={moneyDocumentFields.sayadiId}
                          onChange={(event) => setMoneyDocumentFields((fields) => ({
                            ...fields,
                            sayadiId: normalizeAccountDigits(event.target.value).slice(0, 16),
                          }))}
                          maxLength={16}
                          required
                        />
                      </span>
                    </label>
                    <label className="sales-invoice-receipt-field">
                      <span className="sales-invoice-receipt-field-icon" aria-hidden="true">▦</span>
                      <span className="sales-invoice-receipt-field-label">تاریخ سررسید:</span>
                      <button
                        className="sales-invoice-receipt-input-wrap money-document-due-date"
                        type="button"
                        aria-label="انتخاب تاریخ سررسید چک"
                        aria-haspopup="dialog"
                        onClick={() => openMoneyDocumentDatePicker('dueDate')}
                      >
                        {formatCalendarDate(
                          new Date(`${moneyDocumentFields.dueDate}T12:00:00Z`),
                          moneyDocumentCalendar,
                        )}
                      </button>
                    </label>
                  </>
                )}
                {(moneyDocumentKind === 'هزینه' || moneyDocumentKind === 'درآمد') && (
                  <label className="sales-invoice-receipt-field">
                    <span className="sales-invoice-receipt-field-icon" aria-hidden="true">▤</span>
                    <span className="sales-invoice-receipt-field-label">شرح:</span>
                    <span className="sales-invoice-receipt-input-wrap">
                      <input
                        type="text"
                        aria-label={`شرح ${moneyDocumentKind}`}
                        value={moneyDocumentFields.description}
                        onChange={(event) => setMoneyDocumentFields((fields) => ({
                          ...fields,
                          description: event.target.value,
                        }))}
                        maxLength={120}
                        placeholder={`شرح ${moneyDocumentKind}`}
                        required
                      />
                    </span>
                  </label>
                )}
                {moneyDocumentKind !== 'خرج چک' && (
                  <label className="sales-invoice-receipt-field">
                    <span className="sales-invoice-receipt-field-icon money" aria-hidden="true">＄</span>
                    <span className="sales-invoice-receipt-field-label">مبلغ:</span>
                    <span className="sales-invoice-receipt-input-wrap">
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        aria-label={`مبلغ ${moneyDocumentKind} به ریال`}
                        value={formatAccountBalanceInput(moneyDocumentFields.amount)}
                        onChange={(event) => setMoneyDocumentFields((fields) => ({
                          ...fields,
                          amount: formatAccountBalanceInput(event.target.value),
                        }))}
                        required
                      />
                      <small>ریال</small>
                    </span>
                  </label>
                )}
                {(moneyDocumentKind === 'دریافت چک' || moneyDocumentKind === 'پرداخت چک') && (
                  <label className="sales-invoice-receipt-field">
                    <span className="sales-invoice-receipt-field-icon bank" aria-hidden="true">▤</span>
                    <span className="sales-invoice-receipt-field-label">بانک:</span>
                    <span className="sales-invoice-receipt-input-wrap">
                      <input
                        type="text"
                        aria-label="بانک صادرکننده چک"
                        value={moneyDocumentFields.bankName}
                        onChange={(event) => setMoneyDocumentFields((fields) => ({
                          ...fields,
                          bankName: event.target.value,
                        }))}
                        maxLength={80}
                        required
                      />
                    </span>
                  </label>
                )}
                {moneyDocumentKind !== 'دریافت چک' && moneyDocumentKind !== 'پرداخت چک'
                  && moneyDocumentKind !== 'خرج چک' && (
                  <label className="sales-invoice-receipt-field">
                    <span className="sales-invoice-receipt-field-icon bank" aria-hidden="true">▤</span>
                    <span className="sales-invoice-receipt-field-label">
                      {moneyDocumentKind === 'دریافت' || moneyDocumentKind === 'درآمد' ? 'واریز به:' : 'برداشت از:'}
                    </span>
                    <span className="sales-invoice-receipt-account-wrap">
                      <select
                        aria-label="حساب سند"
                        value={moneyDocumentFields.accountId}
                        onChange={(event) => setMoneyDocumentFields((fields) => ({
                          ...fields,
                          accountId: event.target.value,
                        }))}
                        required
                      >
                        <option value="">انتخاب حساب</option>
                        {storedAccounts.accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.kind === 'بانکی' ? account.bankName || account.name : account.name}
                          </option>
                        ))}
                      </select>
                      {storedAccounts.accounts.length === 0 && (
                        <small className="sales-invoice-receipt-no-account">
                          برای ثبت سند، ابتدا در بخش حساب‌ها یک حساب یا صندوق اضافه کنید.
                        </small>
                      )}
                    </span>
                  </label>
                )}
                {moneyDocumentNoteOpen && (
                  <label className="sales-invoice-receipt-note">
                    <span>{moneyDocumentKind === 'دریافت چک' || moneyDocumentKind === 'پرداخت چک'
                      ? `یادداشت ${moneyDocumentKind}`
                      : `توضیحات ${moneyDocumentKind}`}</span>
                    <textarea
                      maxLength={500}
                      value={moneyDocumentFields.note}
                      onChange={(event) => setMoneyDocumentFields((fields) => ({
                        ...fields,
                        note: event.target.value,
                      }))}
                      placeholder={moneyDocumentKind === 'دریافت چک' || moneyDocumentKind === 'پرداخت چک'
                        ? `یادداشت ${moneyDocumentKind}...`
                        : `توضیحات ${moneyDocumentKind}...`}
                      rows={2}
                    />
                  </label>
                )}
                {moneyDocumentFields.attachment && (
                  <p className="sales-invoice-receipt-attachment-name">
                    <span>پیوست: {moneyDocumentFields.attachment.name}</span>
                    <button
                      type="button"
                      aria-label="حذف پیوست"
                      onClick={() => setMoneyDocumentFields((fields) => ({
                        ...fields,
                        attachment: null,
                      }))}
                    >
                      ×
                    </button>
                  </p>
                )}
                {moneyDocumentError && (
                  <p className="sales-invoice-receipt-error" role="alert">{moneyDocumentError}</p>
                )}
              </div>
              <footer className="sales-invoice-receipt-actions">
                <button
                  type="button"
                  className="cancel"
                  disabled={moneyDocumentSaving}
                  onClick={() => {
                    setMoneyDocumentKind(null)
                    setMoneyDocumentError('')
                  }}
                >
                  <span aria-hidden="true">×</span>
                  لغو
                </button>
                <button className="confirm" type="submit" disabled={moneyDocumentSaving}>
                  <span aria-hidden="true">✓</span>
                  {moneyDocumentSaving ? 'در حال ثبت…' : `تأیید و ثبت ${moneyDocumentKind}`}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {moneyDocumentDatePickerOpen && moneyDocumentKind && (
        <div
          className="sales-invoice-date-backdrop sales-invoice-receipt-picker-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMoneyDocumentDatePickerOpen(false)
          }}
        >
          <section
            className="sales-invoice-date-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="money-document-date-title"
          >
            <header className="sales-invoice-date-heading">
              <div>
                <span>{moneyDocumentDateTarget === 'dueDate'
                  ? 'تاریخ سررسید چک'
                  : `تاریخ ثبت ${moneyDocumentKind}`}</span>
                <h2 id="money-document-date-title">انتخاب تاریخ</h2>
              </div>
              <button
                type="button"
                aria-label="بستن انتخاب تاریخ سند"
                onClick={() => setMoneyDocumentDatePickerOpen(false)}
              >
                ×
              </button>
            </header>
            <div className="sales-invoice-date-previews" aria-label="تاریخ در سه تقویم">
              {invoiceCalendars.map((calendar) => (
                <div key={calendar.id}>
                  <span>{calendar.label}</span>
                  <strong>{formatCalendarDate(moneyDocumentDraftDate, calendar.id)}</strong>
                </div>
              ))}
            </div>
            <div className="sales-invoice-calendar-tabs" role="tablist" aria-label="نوع تقویم">
              {invoiceCalendars.map((calendar) => (
                <button
                  key={calendar.id}
                  type="button"
                  role="tab"
                  aria-selected={moneyDocumentDraftCalendar === calendar.id}
                  className={moneyDocumentDraftCalendar === calendar.id ? 'active' : ''}
                  onClick={() => {
                    setMoneyDocumentDraftCalendar(calendar.id)
                    setMoneyDocumentVisibleMonth(moneyDocumentDraftDate)
                  }}
                >
                  {calendar.label}
                </button>
              ))}
            </div>
            <div className="sales-invoice-calendar-month">
              <button
                type="button"
                aria-label="ماه قبل"
                onClick={() => setMoneyDocumentVisibleMonth((month) => (
                  getAdjacentCalendarMonthDate(month, moneyDocumentDraftCalendar, -1)
                ))}
              >
                ‹
              </button>
              <strong>
                {new Intl.DateTimeFormat(`fa-IR-u-ca-${moneyDocumentDraftCalendar}-nu-arabext`, {
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'UTC',
                }).format(moneyDocumentVisibleMonth)}
              </strong>
              <button
                type="button"
                aria-label="ماه بعد"
                onClick={() => setMoneyDocumentVisibleMonth((month) => (
                  getAdjacentCalendarMonthDate(month, moneyDocumentDraftCalendar, 1)
                ))}
              >
                ›
              </button>
            </div>
            <div className="sales-invoice-calendar-grid" role="grid" aria-label="روزهای ماه">
              {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day, index) => (
                <span className="weekday" role="columnheader" key={`${day}-${index}`}>{day}</span>
              ))}
              {(() => {
                const dates = getCalendarMonthDates(
                  moneyDocumentVisibleMonth,
                  moneyDocumentDraftCalendar,
                )
                const firstDayOffset = (dates[0].getUTCDay() + 1) % 7
                const selectedDate = normalizeUtcDate(moneyDocumentDraftDate).toISOString().slice(0, 10)

                return (
                  <>
                    {Array.from({ length: firstDayOffset }, (_, index) => (
                      <span className="empty-day" role="gridcell" key={`empty-${index}`} />
                    ))}
                    {dates.map((date) => {
                      const dateKey = date.toISOString().slice(0, 10)
                      const isSelected = dateKey === selectedDate
                      return (
                        <button
                          className={[
                            dateKey === moneyDocumentToday ? 'today' : '',
                            isSelected ? 'selected' : '',
                          ].filter(Boolean).join(' ')}
                          type="button"
                          role="gridcell"
                          aria-label={formatCalendarDate(date, moneyDocumentDraftCalendar, true)}
                          aria-pressed={isSelected}
                          key={dateKey}
                          onClick={() => setMoneyDocumentDraftDate(date)}
                        >
                          {new Intl.DateTimeFormat(
                            `fa-IR-u-ca-${moneyDocumentDraftCalendar}-nu-arabext`,
                            { day: 'numeric', timeZone: 'UTC' },
                          ).format(date)}
                        </button>
                      )
                    })}
                  </>
                )
              })()}
            </div>
            <div className="sales-invoice-date-actions">
              <button
                className="today-action"
                type="button"
                onClick={() => {
                  const today = normalizeUtcDate(new Date())
                  setMoneyDocumentDraftDate(today)
                  setMoneyDocumentVisibleMonth(today)
                }}
              >
                امروز
              </button>
              <div>
                <button type="button" onClick={() => setMoneyDocumentDatePickerOpen(false)}>
                  انصراف
                </button>
                <button className="confirm" type="button" onClick={saveMoneyDocumentDate}>
                  تأیید تاریخ
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {moneyDocumentTimePickerOpen && moneyDocumentKind && (
        <div
          className="sales-invoice-date-backdrop sales-invoice-time-backdrop sales-invoice-receipt-picker-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMoneyDocumentTimePickerOpen(false)
          }}
        >
          <section
            className={`sales-invoice-date-dialog sales-invoice-time-dialog ${moneyDocumentTimeMode === 'keyboard' ? 'keyboard-mode' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="money-document-time-title"
          >
            <header className="sales-invoice-date-heading">
              <div>
                <span>زمان ثبت {moneyDocumentKind} · ۲۴ ساعته</span>
                <h2 id="money-document-time-title">انتخاب ساعت</h2>
              </div>
              <button
                type="button"
                aria-label="بستن انتخاب ساعت سند"
                onClick={() => setMoneyDocumentTimePickerOpen(false)}
              >
                ×
              </button>
            </header>
            {moneyDocumentTimeMode === 'clock' && (
              <div className="sales-invoice-time-display" aria-label="زمان انتخاب‌شده">
                <button
                  className={moneyDocumentTimeField === 'hour' ? 'active' : ''}
                  type="button"
                  aria-label="انتخاب ساعت"
                  onClick={() => setMoneyDocumentTimeField('hour')}
                >
                  {formatClockNumber(moneyDocumentDraftTime.hours).padStart(2, '۰')}
                </button>
                <span aria-hidden="true">:</span>
                <button
                  className={moneyDocumentTimeField === 'minute' ? 'active' : ''}
                  type="button"
                  aria-label="انتخاب دقیقه"
                  onClick={() => setMoneyDocumentTimeField('minute')}
                >
                  {formatClockNumber(moneyDocumentDraftTime.minutes).padStart(2, '۰')}
                </button>
              </div>
            )}
            {moneyDocumentTimeMode === 'clock' ? (
              <div className={`sales-invoice-clock-face ${moneyDocumentTimeField === 'minute' ? 'minute-mode' : ''}`}>
                {moneyDocumentTimeField === 'hour'
                  ? Array.from({ length: 24 }, (_, hour) => {
                    const clockValue = hour % 12
                    const ring = hour < 12 ? 41 : 26
                    const angle = (clockValue * 30 - 90) * Math.PI / 180
                    const isSelected = moneyDocumentDraftTime.hours === hour
                    return (
                      <button
                        className={`${hour >= 12 ? 'inner' : ''} ${isSelected ? 'selected' : ''}`}
                        type="button"
                        aria-label={`${formatClockNumber(hour).padStart(2, '۰')} ساعت`}
                        aria-pressed={isSelected}
                        key={hour}
                        style={{
                          left: `${50 + Math.cos(angle) * ring}%`,
                          top: `${50 + Math.sin(angle) * ring}%`,
                        }}
                        onClick={() => {
                          setMoneyDocumentDraftTime((time) => ({ ...time, hours: hour }))
                          setMoneyDocumentTimeField('minute')
                        }}
                      >
                        {formatClockNumber(hour).padStart(2, '۰')}
                      </button>
                    )
                  })
                  : (
                    <div
                      className="sales-invoice-minute-dial"
                      role="slider"
                      tabIndex={0}
                      aria-label="انتخاب دقیقه"
                      aria-valuemin={0}
                      aria-valuemax={59}
                      aria-valuenow={moneyDocumentDraftTime.minutes}
                      aria-valuetext={`${formatClockNumber(moneyDocumentDraftTime.minutes).padStart(2, '۰')} دقیقه`}
                      onPointerDown={(event) => {
                        const bounds = event.currentTarget.getBoundingClientRect()
                        const minutes = getClockMinuteFromPoint(
                          event.clientX - bounds.left,
                          event.clientY - bounds.top,
                          bounds.width,
                          bounds.height,
                        )
                        setMoneyDocumentDraftTime((time) => ({ ...time, minutes }))
                        event.currentTarget.focus()
                      }}
                      onPointerMove={(event) => {
                        if (event.buttons === 0) return
                        const bounds = event.currentTarget.getBoundingClientRect()
                        const minutes = getClockMinuteFromPoint(
                          event.clientX - bounds.left,
                          event.clientY - bounds.top,
                          bounds.width,
                          bounds.height,
                        )
                        setMoneyDocumentDraftTime((time) => (
                          time.minutes === minutes ? time : { ...time, minutes }
                        ))
                      }}
                      onKeyDown={(event) => {
                        const minute = moneyDocumentDraftTime.minutes
                        let nextMinute: number | null = null
                        if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
                          nextMinute = (minute + 1) % 60
                        } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
                          nextMinute = (minute + 59) % 60
                        } else if (event.key === 'Home') {
                          nextMinute = 0
                        } else if (event.key === 'End') {
                          nextMinute = 59
                        }
                        if (nextMinute !== null) {
                          event.preventDefault()
                          setMoneyDocumentDraftTime((time) => ({ ...time, minutes: nextMinute }))
                        }
                      }}
                    >
                      {Array.from({ length: 60 }, (_, minute) => {
                        const angle = (minute * 6 - 90) * Math.PI / 180
                        const isSelected = moneyDocumentDraftTime.minutes === minute
                        return (
                          <span
                            aria-hidden="true"
                            className={[
                              'sales-invoice-clock-minute-tick',
                              minute % 5 === 0 ? 'major' : '',
                              isSelected ? 'selected' : '',
                            ].filter(Boolean).join(' ')}
                            key={minute}
                            style={{
                              left: `${50 + Math.cos(angle) * 43}%`,
                              top: `${50 + Math.sin(angle) * 43}%`,
                            }}
                          >
                            {minute % 5 === 0 ? formatClockNumber(minute).padStart(2, '۰') : ''}
                          </span>
                        )
                      })}
                      <span
                        className="sales-invoice-minute-hand"
                        aria-hidden="true"
                        style={{
                          transform: `translateX(-50%) rotate(${moneyDocumentDraftTime.minutes * 6}deg)`,
                        }}
                      />
                    </div>
                  )}
                <span className="sales-invoice-clock-center" aria-hidden="true" />
              </div>
            ) : (
              <div className="sales-invoice-time-keyboard" aria-label="ورود زمان با صفحه‌کلید">
                <label className={moneyDocumentTimeField === 'hour' ? 'active' : ''}>
                  <input
                    aria-label="ساعت سند"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9۰-۹٠-٩]*"
                    maxLength={2}
                    value={formatClockNumber(moneyDocumentDraftTime.hours).padStart(2, '۰')}
                    onFocus={(event) => {
                      setMoneyDocumentTimeField('hour')
                      event.currentTarget.select()
                    }}
                    onChange={(event) => updateMoneyDocumentTimeField('hour', event.target.value)}
                  />
                  <span>ساعت</span>
                </label>
                <span className="separator" aria-hidden="true">:</span>
                <label className={moneyDocumentTimeField === 'minute' ? 'active' : ''}>
                  <input
                    aria-label="دقیقه سند"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9۰-۹٠-٩]*"
                    maxLength={2}
                    value={formatClockNumber(moneyDocumentDraftTime.minutes).padStart(2, '۰')}
                    onFocus={(event) => {
                      setMoneyDocumentTimeField('minute')
                      event.currentTarget.select()
                    }}
                    onChange={(event) => updateMoneyDocumentTimeField('minute', event.target.value)}
                  />
                  <span>دقیقه</span>
                </label>
              </div>
            )}
            <div className="sales-invoice-date-actions sales-invoice-time-actions">
              <button
                className="sales-invoice-time-mode"
                type="button"
                aria-label={moneyDocumentTimeMode === 'clock' ? 'ورود با صفحه‌کلید' : 'نمایش ساعت عقربه‌ای'}
                onClick={() => setMoneyDocumentTimeMode((mode) => (
                  mode === 'clock' ? 'keyboard' : 'clock'
                ))}
              >
                {moneyDocumentTimeMode === 'clock' ? '⌨' : '◷'}
              </button>
              <div>
                <button type="button" onClick={() => setMoneyDocumentTimePickerOpen(false)}>
                  انصراف
                </button>
                <button className="confirm" type="button" onClick={saveMoneyDocumentTime}>
                  تأیید ساعت
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {moneyDocumentAttachmentPickerOpen && moneyDocumentKind && (
        <div
          className="sales-invoice-date-backdrop sales-invoice-attachment-backdrop sales-invoice-receipt-picker-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeMoneyDocumentAttachmentPicker()
          }}
        >
          <section
            className="sales-invoice-date-dialog sales-invoice-attachment-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="money-document-attachment-title"
          >
            <header className="sales-invoice-date-heading">
              <div>
                <span>تصویر سند {moneyDocumentKind}</span>
                <h2 id="money-document-attachment-title">پیوست عکس</h2>
              </div>
              <button
                type="button"
                aria-label="بستن پنجره پیوست سند"
                onClick={closeMoneyDocumentAttachmentPicker}
              >
                ×
              </button>
            </header>
            <div className="sales-invoice-attachment-content">
              <div className="sales-invoice-attachment-choices">
                <button type="button" onClick={() => moneyDocumentAttachmentInputRef.current?.click()}>
                  <span aria-hidden="true">▧</span>
                  <strong>انتخاب از گالری</strong>
                  <small>عکس موجود در گوشی یا دستگاه</small>
                </button>
                <button type="button" onClick={() => moneyDocumentCameraInputRef.current?.click()}>
                  <span aria-hidden="true">◎</span>
                  <strong>گرفتن عکس</strong>
                  <small>باز کردن دوربین دستگاه</small>
                </button>
              </div>
              {moneyDocumentError && (
                <p className="sales-invoice-attachment-error" role="alert">{moneyDocumentError}</p>
              )}
              {moneyDocumentDraftAttachment ? (
                <div className="sales-invoice-attachment-preview">
                  <img
                    src={moneyDocumentDraftAttachment.dataUrl}
                    alt={`پیش‌نمایش ${moneyDocumentDraftAttachment.name}`}
                  />
                  <div className="sales-invoice-attachment-file">
                    <strong>{moneyDocumentDraftAttachment.name || 'تصویر پیوست'}</strong>
                    <small>تصویر پیوست سند</small>
                  </div>
                </div>
              ) : (
                <div className="sales-invoice-attachment-empty">
                  <span aria-hidden="true">▧</span>
                  <strong>هنوز عکسی انتخاب نشده</strong>
                  <small>از گالری انتخاب کن یا با دوربین عکس بگیر.</small>
                </div>
              )}
            </div>
            <div className="sales-invoice-date-actions sales-invoice-attachment-actions">
              <button
                className="sales-invoice-attachment-remove"
                type="button"
                aria-label="حذف عکس پیوست سند"
                disabled={!moneyDocumentDraftAttachment}
                onClick={() => {
                  setMoneyDocumentDraftAttachment(null)
                  setMoneyDocumentError('')
                }}
              >
                <span aria-hidden="true">×</span>
                حذف
              </button>
              <div className="sales-invoice-attachment-actions-group">
                <button
                  className="sales-invoice-attachment-cancel"
                  type="button"
                  onClick={closeMoneyDocumentAttachmentPicker}
                >
                  لغو
                </button>
                <button className="confirm" type="button" onClick={confirmMoneyDocumentAttachment}>
                  تأیید پیوست
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {demoEntered && notice && <div className="toast" role="status">{notice}</div>}

      {demoEntered
        && stores.length > 0
        && activeTab !== 'فاکتور فروش'
        && activeTab !== 'فاکتور خرید'
        && activeTab !== 'تنظیمات'
        && activeTab !== 'فروشگاه' && (
        <nav className="bottom-nav" aria-label="ناوبری اصلی">
          {navigation.map((item) => {
            const isActive = activeTab === item.label
              || (['گزارشات طرف حساب‌ها', 'گزارشات'].includes(activeTab) && item.label === 'گزارش‌ها')
              || (activeTab === 'فروشگاه' && item.label === 'خانه')
            return (
              <button
                className={`nav-item ${item.label === 'اشخاص' ? 'nav-item-people' : ''} ${isActive ? 'active' : ''}`}
                key={item.label}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  setActiveTab(item.label)
                  if (item.label !== 'خانه' && item.label !== 'گزارش‌ها' && item.label !== 'اشخاص' && item.label !== 'کالا و انبار' && item.label !== 'حساب‌ها') {
                    showComingSoon(item.label)
                  }
                }}
              >
                <Icon name={item.icon} className="nav-icon" />
                <span>{item.label}</span>
              </button>
            )
          })}
          <span className="home-indicator" aria-hidden="true" />
        </nav>
      )}
    </div>
  )
}

export default App
