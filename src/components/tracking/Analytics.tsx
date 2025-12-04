// src/components/tracking/Analytics.tsx
// Server Component - renders tracking scripts in HTML

interface AnalyticsProps {
  gtmId?: string;
  ga4Id?: string;
  fbPixelId?: string;
  twitterPixelId?: string;
}

/**
 * Analytics component that injects tracking scripts dynamically from WordPress settings.
 * Prioritizes Google Tag Manager (GTM) if available, otherwise loads individual scripts.
 * Server Component to ensure scripts appear in initial HTML.
 */
export default function Analytics({ gtmId, ga4Id, fbPixelId, twitterPixelId }: AnalyticsProps) {
  // If GTM is configured, use it exclusively (manages all other trackers)
  if (gtmId) {
    return (
      <>
        {/* Google Tag Manager */}
        {/* eslint-disable-next-line @next/next/next-script-for-ga */}
        <script
          id="gtm"
          dangerouslySetInnerHTML={{
            __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
          }}
        />
        {/* GTM noscript fallback */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      </>
    );
  }

  // Fallback: Load individual tracking scripts if GTM is not configured
  return (
    <>
      {/* Google Analytics 4 */}
      {ga4Id && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} />
          <script
            id="google-analytics"
            dangerouslySetInnerHTML={{
              __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4Id}');
            `,
            }}
          />
        </>
      )}

      {/* Facebook Pixel */}
      {fbPixelId && (
        <script
          id="facebook-pixel"
          dangerouslySetInnerHTML={{
            __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbPixelId}');
            fbq('track', 'PageView');
          `,
          }}
        />
      )}

      {/* Twitter Pixel */}
      {twitterPixelId && (
        <script
          id="twitter-pixel"
          dangerouslySetInnerHTML={{
            __html: `
            !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
            },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
            a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
            twq('config','${twitterPixelId}');
          `,
          }}
        />
      )}
    </>
  );
}
