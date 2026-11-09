import { forwardRef, useEffect, useRef, useState, type ReactNode } from 'react'
import HTMLFlipBook from 'react-pageflip'

interface PageFlipControl {
  getCurrentPageIndex: () => number
  flipNext: () => void
  flipPrev: () => void
  turnToPage: (page: number) => void
}

interface PageFlipHandle {
  pageFlip: () => PageFlipControl | null
}

interface BookPageProps {
  children?: ReactNode
  density?: 'hard' | 'soft'
  className?: string
}

const BookPage = forwardRef<HTMLDivElement, BookPageProps>(
  ({ children, density = 'soft', className = '' }, ref) => (
    <div ref={ref} className={`auth-book-page ${className}`} data-density={density}>
      {children}
    </div>
  ),
)

BookPage.displayName = 'BookPage'

function FirstAccountingPage() {
  return (
    <div className="book-paper-content" dir="rtl">
      <span className="book-page-kicker">گزارش مالی</span>
      <strong className="book-page-title">عملکرد فروش</strong>
      <div className="book-report-chart" aria-hidden="true">
        <i /><i /><i /><i /><i />
      </div>
      <div className="book-page-total"><b>+۱۸٪</b><span>رشد این ماه</span></div>
    </div>
  )
}

function MonthlyAccountingPage() {
  return (
    <div className="book-paper-content" dir="rtl">
      <span className="book-page-kicker">گزارش درآمد</span>
      <strong className="book-page-title">روند ماهانه</strong>
      <div className="book-report-chart book-report-chart-tall" aria-hidden="true">
        <i /><i /><i /><i /><i />
      </div>
      <div className="book-chart-caption">درآمد این ماه</div>
    </div>
  )
}

function BookCoverArtwork({ insideContent = <FirstAccountingPage /> }: { insideContent?: ReactNode }) {
  return (
    <>
      <div className="book-cover-face book-cover-front book-cover-design" dir="rtl">
        <span className="book-cover-logo">ترازینو</span>
        <span className="book-cover-caption">حسابداری هوشمند</span>
        <span className="book-cover-emblem">
          <img src="/trazino-mark.svg" alt="" />
        </span>
        <span className="book-cover-title">دفتر حساب‌ها</span>
      </div>
      <div className="book-cover-face book-cover-inside">
        {insideContent}
      </div>
    </>
  )
}

function TrazinoBook() {
  const bookRef = useRef<PageFlipHandle>(null)
  const closingBookRef = useRef<PageFlipHandle>(null)
  const isClosingRef = useRef(false)
  const closingFlipStartedRef = useRef(false)
  const [cyclePhase, setCyclePhase] = useState<'idle' | 'closing' | 'closed' | 'opening'>('idle')
  const [isClosingFlipStarted, setIsClosingFlipStarted] = useState(false)

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timerId: number | undefined
    let resetTimerId: number | undefined
    let openTimerId: number | undefined
    let initialOpenTimerId: number | undefined

    const updateAutoplay = () => {
      if (timerId !== undefined) window.clearInterval(timerId)
      if (resetTimerId !== undefined) window.clearTimeout(resetTimerId)
      if (openTimerId !== undefined) window.clearTimeout(openTimerId)
      if (initialOpenTimerId !== undefined) window.clearTimeout(initialOpenTimerId)
      timerId = undefined
      resetTimerId = undefined
      openTimerId = undefined
      initialOpenTimerId = undefined
      isClosingRef.current = false
      if (motionPreference.matches) {
        setCyclePhase('idle')
        initialOpenTimerId = window.setTimeout(() => {
          bookRef.current?.pageFlip()?.turnToPage(1)
          initialOpenTimerId = undefined
        }, 0)
        return
      }

      initialOpenTimerId = window.setTimeout(() => {
        setCyclePhase('opening')
        bookRef.current?.pageFlip()?.flipNext()
        initialOpenTimerId = undefined
      }, 1200)

      timerId = window.setInterval(() => {
        const pageFlip = bookRef.current?.pageFlip()
        if (!pageFlip || isClosingRef.current) return

        const currentPage = pageFlip.getCurrentPageIndex()
        if (currentPage >= 3) {
          isClosingRef.current = true
          setIsClosingFlipStarted(false)
          setCyclePhase('closing')
          return
        }

        pageFlip.flipNext()
      }, 5200)
    }

    updateAutoplay()
    motionPreference.addEventListener('change', updateAutoplay)
    return () => {
      if (timerId !== undefined) window.clearInterval(timerId)
      if (resetTimerId !== undefined) window.clearTimeout(resetTimerId)
      if (openTimerId !== undefined) window.clearTimeout(openTimerId)
      if (initialOpenTimerId !== undefined) window.clearTimeout(initialOpenTimerId)
      motionPreference.removeEventListener('change', updateAutoplay)
    }
  }, [])

  useEffect(() => {
    if (cyclePhase !== 'closing') return
    closingFlipStartedRef.current = false
    closingFlipStartedRef.current = false
    const startClosingFlip = () => {
      const pageFlip = closingBookRef.current?.pageFlip()
      if (pageFlip?.getCurrentPageIndex() !== 1 || closingFlipStartedRef.current) return

      closingFlipStartedRef.current = true
      pageFlip.flipPrev()
      setIsClosingFlipStarted(true)
    }

    const startupTimerId = window.setTimeout(startClosingFlip, 150)
    return () => window.clearTimeout(startupTimerId)
  }, [cyclePhase])

  useEffect(() => {
    if (cyclePhase !== 'closed') return

    const openTimerId = window.setTimeout(() => {
      const pageFlip = bookRef.current?.pageFlip()
      if (pageFlip) {
        setCyclePhase('opening')
        pageFlip.flipNext()
      }
    }, 5200)
    return () => window.clearTimeout(openTimerId)
  }, [cyclePhase])

  return (
    <div className="auth-book-scene" aria-hidden="true">
      <div className={`auth-book-wrap${cyclePhase === 'idle' ? '' : ` is-${cyclePhase}`}${cyclePhase === 'closing' && isClosingFlipStarted ? ' is-closing-flip-started' : ''}`}>
        <HTMLFlipBook
          ref={bookRef}
          className="auth-pageflip"
          style={{}}
          startPage={0}
          width={140}
          height={184}
          size="fixed"
          minWidth={140}
          maxWidth={140}
          minHeight={184}
          maxHeight={184}
          drawShadow
          flippingTime={1850}
          usePortrait={false}
          startZIndex={0}
          autoSize={false}
          maxShadowOpacity={0.48}
          showCover
          mobileScrollSupport={false}
          clickEventForward
          useMouseEvents
          swipeDistance={30}
          showPageCorners={false}
          disableFlipByClick={false}
          onFlip={() => {
            if (bookRef.current?.pageFlip()?.getCurrentPageIndex() === 1) {
              isClosingRef.current = false
              setCyclePhase((phase) => (phase === 'opening' ? 'idle' : phase))
            }
          }}
        >
        <BookPage density="hard" className="book-front-cover">
          <BookCoverArtwork />
        </BookPage>
          <BookPage>
            <div className="book-first-page">
              <FirstAccountingPage />
            </div>
          </BookPage>
          <BookPage>
            <div className="book-paper-content" dir="rtl">
              <span className="book-page-kicker">فاکتور فروش</span>
              <strong className="book-page-title">خلاصه فروش</strong>
              <div className="book-invoice-row"><i /><b>۱۲,۸۵۰</b></div>
              <div className="book-invoice-row"><i /><b>۳,۴۰۰</b></div>
              <div className="book-invoice-row"><i /><b>۸,۲۵۰</b></div>
              <div className="book-page-total"><b>۲۴,۵۰۰</b><span>جمع کل</span></div>
            </div>
          </BookPage>
          <BookPage className="book-monthly-page">
            <MonthlyAccountingPage />
          </BookPage>
          <BookPage>
            <div className="book-paper-content" dir="rtl">
              <span className="book-page-kicker">دفتر روزانه</span>
              <strong className="book-page-title">تراکنش‌ها</strong>
              <div className="book-ledger-row"><i>+</i><span /><b /></div>
              <div className="book-ledger-row"><i>−</i><span /><b /></div>
              <div className="book-ledger-row"><i>+</i><span /><b /></div>
              <div className="book-ledger-row"><i>−</i><span /><b /></div>
            </div>
          </BookPage>
        </HTMLFlipBook>
        {(cyclePhase === 'closing' || cyclePhase === 'closed') && (
          <HTMLFlipBook
            ref={closingBookRef}
            className="book-closing-flipbook"
            style={{}}
            startPage={1}
            width={140}
            height={184}
            size="fixed"
            minWidth={140}
            maxWidth={140}
            minHeight={184}
            maxHeight={184}
            drawShadow
            flippingTime={1850}
            usePortrait={false}
            startZIndex={20}
            autoSize={false}
            maxShadowOpacity={0.48}
            showCover
            mobileScrollSupport={false}
            clickEventForward={false}
            useMouseEvents={false}
            swipeDistance={30}
            showPageCorners={false}
            disableFlipByClick
            onFlip={() => {
              if (closingBookRef.current?.pageFlip()?.getCurrentPageIndex() === 0) {
                bookRef.current?.pageFlip()?.turnToPage(0)
                setIsClosingFlipStarted(false)
                setCyclePhase('closed')
              }
            }}
          >
            <BookPage density="hard" className="book-front-cover book-closing-cover">
              <BookCoverArtwork insideContent={<MonthlyAccountingPage />} />
            </BookPage>
            <BookPage className="book-closing-transparent-page" />
            <BookPage className="book-closing-transparent-page" />
          </HTMLFlipBook>
        )}
      </div>
    </div>
  )
}

export default TrazinoBook
