export default function LogoMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="7.5" stroke="#D4A853" strokeWidth="1.5"/>
      <path d="M2.5 9 Q9 3.8 15.5 9 Q9 14.2 2.5 9Z" stroke="#D4A853" strokeWidth="1.2" fill="rgba(212,168,83,0.15)"/>
      <circle cx="9" cy="9" r="2.1" fill="#D4A853"/>
      <circle cx="7.9" cy="7.9" r="0.55" fill="#F0C97A" opacity="0.85"/>
    </svg>
  );
}
