"use client"
import Script from 'next/script'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export function Analytics() {
  if (!GA_ID) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Analytics] NEXT_PUBLIC_GA_ID missing; GA disabled')
    }
    return null
  }
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
      {/* Scroll depth tracking */}
      <Script id="scroll-depth" strategy="afterInteractive">
        {`
          (function(){
            const thresholds = [25,50,75,90];
            const fired = new Set();
            function send(percent){
              if (!window.gtag) return;
              if (fired.has(percent)) return;
              fired.add(percent);
              window.gtag('event','scroll_depth',{
                event_category:'engagement',
                event_label:String(percent),
                value:percent
              });
            }
            function check(){
              const doc = document.documentElement;
              const scrollTop = window.pageYOffset || doc.scrollTop;
              const scrollHeight = doc.scrollHeight - doc.clientHeight;
              if (scrollHeight <= 0) return;
              const percent = Math.round((scrollTop / scrollHeight) * 100);
              thresholds.forEach(t => { if (percent >= t) send(t); });
            }
            window.addEventListener('scroll', check, { passive: true });
            check();
          })();
        `}
      </Script>
    </>
  )
}

export default Analytics
