import type {CSSProperties} from 'react';

export type TestMascotProps = {
    state?: string;
    size?: CSSProperties['inlineSize'];
    animated?: boolean;
    decorative?: boolean;
};

/** Shared mascot fixture for stories and component tests. */
export function TestMascot({
    state = 'idle',
    size = '6rem',
    animated = false,
    decorative = false,
}: TestMascotProps) {
    return (
        <svg
            aria-hidden={decorative || undefined}
            aria-label={decorative ? undefined : `Mascot: ${state}`}
            data-qa="test-mascot"
            viewBox="0 0 160 120"
            role={decorative ? undefined : 'img'}
            style={{display: 'block', inlineSize: size, blockSize: 'auto'}}
        >
            <g>
                {animated && (
                    <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0 0; 0 -3; 0 0"
                        dur="1.8s"
                        repeatCount="indefinite"
                    />
                )}

                <path
                    d="M80 7 88 18 100 10 104 24 120 20 119 36 136 39 127 53 141 63 125 71 132 87 114 87 111 102 97 94 88 108 79 96 68 107 61 93 45 100 43 84 25 84 33 69 18 60 34 50 25 36 43 34 44 18 60 24 67 9 80 20Z"
                    fill="#171717"
                />
                <circle cx="80" cy="58" r="42" fill="#050505" />
                <ellipse cx="61" cy="55" rx="15" ry="18" fill="#fff" />
                <ellipse cx="99" cy="55" rx="15" ry="18" fill="#fff" />
                <circle cx="65" cy="59" r="7" fill="#171717" />
                <circle cx="95" cy="59" r="7" fill="#171717" />
                <circle cx="67" cy="56" r="2" fill="#fff" />
                <circle cx="97" cy="56" r="2" fill="#fff" />
                <path
                    d="M70 78c6 5 14 5 20 0"
                    fill="none"
                    stroke="#666"
                    strokeLinecap="round"
                    strokeWidth="3"
                />
            </g>
            <text
                x="50%"
                y="114"
                fill="currentColor"
                fontSize="14"
                fontWeight="600"
                textAnchor="middle"
            >
                {state}
            </text>
        </svg>
    );
}
