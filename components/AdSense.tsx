import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Eye, AlertCircle } from "lucide-react";

// Ads stay OFF until a real publisher id is provided (e.g. as the Pages build
// variable VITE_ADSENSE_CLIENT=ca-pub-1234567890123456). A placeholder id only
// produces console errors and blank boxes.
const ENV_CLIENT = (import.meta.env.VITE_ADSENSE_CLIENT as string | undefined) ?? "";
export const adsEnabled = /^ca-pub-\d{10,}$/.test(ENV_CLIENT);

interface AdSenseProps {
  client?: string;
  slot?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  test?: boolean;
}

interface AdBlockDetectorProps {
  onAdBlockDetected: () => void;
  onAdBlockDisabled: () => void;
}

// Google AdSense Component
export function AdSense({
  client = ENV_CLIENT,
  slot = "",
  format = "auto",
  responsive = true,
  className = "",
  style = {},
  test = false,
}: AdSenseProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  useEffect(() => {
    if (!adsEnabled || !adRef.current) return;

    // Load AdSense script if not already loaded
    if (!window.adsbygoogle) {
      const script = document.createElement("script");
      script.async = true;
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
      script.crossOrigin = "anonymous";
      script.onload = () => {
        initializeAd();
      };
      script.onerror = () => {
        setAdError(true);
      };
      document.head.appendChild(script);
    } else {
      initializeAd();
    }
  }, [client, slot]);

  const initializeAd = () => {
    try {
      if (window.adsbygoogle && adRef.current) {
        // Push ad to AdSense queue
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      }
    } catch (error) {
      console.error("AdSense error:", error);
      setAdError(true);
    }
  };

  const getAdStyle = () => {
    const baseStyle: React.CSSProperties = {
      display: "block",
      ...style,
    };

    if (format === "rectangle") {
      return { ...baseStyle, width: "300px", height: "250px" };
    } else if (format === "horizontal") {
      return { ...baseStyle, width: "728px", height: "90px" };
    } else if (format === "vertical") {
      return { ...baseStyle, width: "160px", height: "600px" };
    }

    return baseStyle;
  };

  // Test mode - show placeholder
  if (test) {
    return (
      <Card
        className={`bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-dashed border-gray-500/50 ${className}`}
      >
        <CardContent className="p-6 text-center">
          <div className="text-blue-400 mb-2">📺</div>
          <p className="text-gray-400 text-sm">AdSense Placeholder</p>
          <p className="text-gray-500 text-xs">
            {format} - {client}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (adError) {
    return (
      <Card className={`bg-red-500/10 border-red-500/30 ${className}`}>
        <CardContent className="p-4 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400 text-sm">فشل في تحميل الإعلان</p>
        </CardContent>
      </Card>
    );
  }

  if (!adsEnabled) return null;

  return (
    <div className={`ad-container ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={getAdStyle()}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
      {!adLoaded && (
        <Card className="bg-gray-500/10 border-gray-500/30 animate-pulse">
          <CardContent className="p-8 text-center">
            <div className="w-8 h-8 bg-gray-500/30 rounded mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">جاري تحميل الإعلان...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Ad Block Detector Component
export function AdBlockDetector({
  onAdBlockDetected,
  onAdBlockDisabled,
}: AdBlockDetectorProps) {
  useEffect(() => {
    const detectAdBlock = async () => {
      // Create a test ad element
      const testAd = document.createElement("div");
      testAd.innerHTML = "&nbsp;";
      testAd.className = "adsbox ad ads advertisement banner-ad";
      testAd.style.cssText =
        "position:absolute;top:-999px;left:-999px;width:1px;height:1px;";

      document.body.appendChild(testAd);

      // Wait for potential ad blocker to act
      setTimeout(() => {
        const adBlocked =
          testAd.offsetHeight === 0 ||
          testAd.offsetWidth === 0 ||
          testAd.style.display === "none" ||
          testAd.style.visibility === "hidden";

        document.body.removeChild(testAd);

        if (adBlocked) {
          onAdBlockDetected();
        } else {
          onAdBlockDisabled();
        }
      }, 100);
    };

    detectAdBlock();

    // Re-check periodically
    const interval = setInterval(detectAdBlock, 10000);

    return () => clearInterval(interval);
  }, [onAdBlockDetected, onAdBlockDisabled]);

  return null;
}

// Strategic Ad Placements

// Header Banner Ad
export function HeaderBannerAd() {
  return (
    <div className="w-full flex justify-center py-4 border-b border-gray-700/30">
      <AdSense
        format="horizontal"
        className="max-w-full"
        test={process.env.NODE_ENV === "development"}
      />
    </div>
  );
}

// Sidebar Ad
export function SidebarAd() {
  return (
    <div className="sticky top-4">
      <Card className="bg-black/20 border-gray-500/30 backdrop-blur-sm mb-4">
        <CardContent className="p-2">
          <div className="flex items-center justify-between mb-2">
            <Badge
              variant="outline"
              className="text-xs border-gray-500 text-gray-400"
            >
              إعلان
            </Badge>
            <Eye className="w-3 h-3 text-gray-500" />
          </div>
          <AdSense
            format="rectangle"
            test={process.env.NODE_ENV === "development"}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// In-Content Ad (between chapters/volumes)
export function InContentAd() {
  return (
    <div className="my-8 py-6 border-t border-b border-gray-700/30">
      <div className="text-center mb-4">
        <Badge variant="outline" className="border-gray-500 text-gray-400">
          الإعلانات تدعم المحتوى المجاني
        </Badge>
      </div>
      <AdSense
        format="auto"
        responsive={true}
        className="max-w-2xl mx-auto"
        test={process.env.NODE_ENV === "development"}
      />
    </div>
  );
}

// Footer Ad
export function FooterAd() {
  return (
    <div className="w-full py-6 border-t border-gray-700/30 bg-black/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <Badge variant="outline" className="border-gray-500 text-gray-400">
            إعلان | Advertisement
          </Badge>
        </div>
        <div className="flex justify-center">
          <AdSense
            format="horizontal"
            test={process.env.NODE_ENV === "development"}
          />
        </div>
      </div>
    </div>
  );
}

// Mobile Banner Ad
export function MobileBannerAd() {
  return (
    <div className="block md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/90 border-t border-gray-700/30">
      <div className="p-2">
        <AdSense
          format="auto"
          responsive={true}
          style={{ height: "60px" }}
          test={process.env.NODE_ENV === "development"}
        />
      </div>
    </div>
  );
}

// AdSense Auto Ads (Page-level ads)
export function AutoAds() {
  useEffect(() => {
    if (!adsEnabled) return;
    // Load AdSense script with auto ads
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ENV_CLIENT}`;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    // Initialize auto ads
    const autoAdScript = document.createElement("script");
    autoAdScript.innerHTML = `
      (adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: "${ENV_CLIENT}",
        enable_page_level_ads: true
      });
    `;
    document.head.appendChild(autoAdScript);

    return () => {
      // Cleanup scripts on unmount
      document.head.removeChild(script);
      document.head.removeChild(autoAdScript);
    };
  }, []);

  return null;
}

// Smart Ad Container - automatically chooses best ad format based on space
export function SmartAd({
  containerWidth,
  containerHeight,
  className = "",
}: {
  containerWidth?: number;
  containerHeight?: number;
  className?: string;
}) {
  const getOptimalFormat = () => {
    if (!containerWidth || !containerHeight) return "auto";

    if (containerWidth >= 728 && containerHeight >= 90) {
      return "horizontal";
    } else if (containerWidth >= 300 && containerHeight >= 250) {
      return "rectangle";
    } else if (containerWidth >= 160 && containerHeight >= 600) {
      return "vertical";
    }

    return "auto";
  };

  return (
    <AdSense
      format={getOptimalFormat()}
      className={className}
      test={process.env.NODE_ENV === "development"}
    />
  );
}

// TypeScript declarations for global AdSense
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default AdSense;
