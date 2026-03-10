import pgLogo from "@/assets/pg-logo.jpg";

interface PGLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-8",
  md: "h-12",
  lg: "h-16",
};

const PGLogo = ({ className = "", size = "md" }: PGLogoProps) => {
  return (
    <img
      src={pgLogo}
      alt="PG Electroplast"
      className={`${sizes[size]} w-auto object-contain ${className}`}
    />
  );
};

export default PGLogo;
