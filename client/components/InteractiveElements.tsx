import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// مكون الزر التفاعلي
export interface InteractiveButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "magic" | "energy" | "crystal" | "fire" | "ice";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  children,
  onClick,
  variant = "magic",
  size = "md",
  className = "",
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const variantStyles = {
    magic:
      "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-purple-500/50",
    energy:
      "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 border-blue-500/50",
    crystal:
      "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-indigo-500/50",
    fire: "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 border-red-500/50",
    ice: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-cyan-500/50",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    // إنشاء جسيم��ت عند التحويم
    const newParticles = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setParticles(newParticles);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setParticles([]);
  };

  return (
    <Button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative overflow-hidden border transition-all duration-300 
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}
        ${isHovered ? "scale-105 shadow-2xl" : "scale-100"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {/* خلفية متحركة */}
      <div
        className={`
        absolute inset-0 opacity-0 transition-opacity duration-300
        ${isHovered ? "opacity-20" : "opacity-0"}
        bg-gradient-to-r from-white via-transparent to-white
        animate-pulse
      `}
      />

      {/* جسيمات تفاعلية */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-ping"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}

      {/* محتوى الزر */}
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>
    </Button>
  );
};

// مكون البطاقة التفاعلية
export interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  enableHover?: boolean;
  style?: React.CSSProperties;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className = "",
  onClick,
  enableHover = true,
  style,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enableHover || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <Card
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={style}
      className={`
        relative overflow-hidden transition-all duration-300 cursor-pointer bg-cover bg-center bg-no-repeat
        ${isHovered && enableHover ? "scale-[1.02] shadow-2xl" : "scale-100"}
        ${className}
      `}
    >
      {/* تأثير الإضاءة المتتبعة للماوس */}
      {enableHover && (
        <div
          className={`
            absolute w-32 h-32 rounded-full pointer-events-none transition-opacity duration-300
            ${isHovered ? "opacity-10" : "opacity-0"}
            bg-gradient-radial from-white to-transparent
          `}
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {/* محتوى البطاقة */}
      <div className="relative z-10">{children}</div>
    </Card>
  );
};

// مكون التأثيرات البصرية
export const VisualEffectsComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // تحديد حجم الكانفاس
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // إنشاء جسيمات عائمة
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      opacity: number;
    }> = [];

    // إنشاء جسيمات عشوائية
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        color: ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"][
          Math.floor(Math.random() * 4)
        ],
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    // دالة الرسم
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // تحديث المواقع
        particle.x += particle.vx;
        particle.y += particle.vy;

        // إعادة تدوير الجسيمات
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // رسم الجسيمات
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ zIndex: 0 }}
    />
  );
};

// مكون التجربة التفاعلية
export const InteractiveExperience: React.FC = () => {
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const effects = [
    {
      id: "lightning",
      name: "⚡ البرق",
      color: "from-yellow-500 to-orange-500",
    },
    { id: "ice", name: "❄️ الجليد", color: "from-cyan-500 to-blue-500" },
    { id: "fire", name: "🔥 النار", color: "from-red-500 to-orange-500" },
    { id: "magic", name: "�� السحر", color: "from-purple-500 to-pink-500" },
  ];

  const triggerEffect = (effectId: string) => {
    setActiveEffect(effectId);
    setScore((prev) => prev + 10);

    // إرسال حدث مخصص
    window.dispatchEvent(new CustomEvent("sao-special-event"));

    setTimeout(() => setActiveEffect(null), 2000);
  };

  return (
    <div className="text-center py-8">
      <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        🎮 تجربة تفاعلية
      </h3>

      <div className="mb-6">
        <span className="text-lg text-gray-300">النقاط: </span>
        <span className="text-2xl font-bold text-blue-400">{score}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        {effects.map((effect) => (
          <InteractiveButton
            key={effect.id}
            variant="magic"
            onClick={() => triggerEffect(effect.id)}
            className={`
              ${activeEffect === effect.id ? "animate-pulse scale-110" : ""}
              bg-gradient-to-r ${effect.color}
            `}
          >
            {effect.name}
          </InteractiveButton>
        ))}
      </div>

      {/* تأثير بصري عند التفعيل */}
      {activeEffect && (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
          <div className="text-6xl animate-bounce">
            {effects.find((e) => e.id === activeEffect)?.name}
          </div>
        </div>
      )}
    </div>
  );
};

export default {
  InteractiveButton,
  InteractiveCard,
  VisualEffectsComponent,
  InteractiveExperience,
};
