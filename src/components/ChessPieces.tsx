import React from 'react';

interface PieceProps {
  type: string; // 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
  color: 'w' | 'b';
  className?: string;
}

export const ChessPiece: React.FC<PieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'w';
  const fill = isWhite ? '#ffffff' : '#262421';
  const stroke = isWhite ? '#262421' : '#ffffff';

  // Crisp standard vector chess pieces
  switch (type.toLowerCase()) {
    case 'p':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'n':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="m 22,10 c 10.5,1 16.5,8 16,29 L 15,39 C 15,30 11.5,23.5 9,21 8,20 8.5,18 10,18 c 2.5,0 4.5,1.5 6,3 0.5,-3 2.5,-6.5 5,-8.5 -0.5,-1 -1,-1.5 -1.5,-2 0,-0.5 0.5,-1 1,-1 1,0 1.5,0.5 1.5,0.5 z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="15" cy="14" r="1.5" fill={stroke} />
        </svg>
      );
    case 'b':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z" />
            <path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,30 30,30 C 30,27.5 27.5,26 22.5,26 C 17.5,26 15,27.5 15,30 C 15,30 14.5,30.5 15,32 z" />
            <path d="m 22.5,9 c -4,0 -7,4 -7,10 0,3 1.5,5 3.5,6.5 2,1.5 5,1.5 7,0 2,-1.5 3.5,-3.5 3.5,-6.5 0,-6 -3,-10 -7,-10 z" />
            <path d="M 22.5,6 L 22.5,9" />
            <path d="M 21,7.5 L 24,7.5" />
          </g>
        </svg>
      );
    case 'r':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 9,39 L 36,39 L 36,36 L 9,36 z" />
            <path d="M 12,36 L 12,32 L 33,32 L 33,36 z" />
            <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 z" />
            <path d="M 12,14 L 33,14 L 31,32 L 14,32 z" />
          </g>
        </svg>
      );
    case 'q':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,14.5 L 31,25 L 22.5,12 L 14,25 L 6.5,14.5 z" />
            <path d="M 9,26 L 11.5,34 L 33.5,34 L 36,26 z" />
            <path d="M 9,37 L 36,37 L 36,34 L 9,34 z" />
            <circle cx="6" cy="12" r="2" />
            <circle cx="14" cy="9" r="2" />
            <circle cx="22.5" cy="8" r="2" />
            <circle cx="31" cy="9" r="2" />
            <circle cx="39" cy="12" r="2" />
          </g>
        </svg>
      );
    case 'k':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 22.5,11.5 L 22.5,4.5 M 19,7 L 26,7" />
            <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 L 33.5,34 C 28,37.5 17,37.5 11.5,34 z" />
            <path d="M 12,34 L 33,34 L 31,29 C 28,31 17,31 14,29 z" />
            <path d="M 14,29 C 11,26 12,19 16,16 C 18,14.5 20,15 22.5,17 C 25,15 27,14.5 29,16 C 33,19 34,26 31,29 z" />
          </g>
        </svg>
      );
    default:
      return null;
  }
};
