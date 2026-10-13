// Generated from ../speaking.svg. Edit the SVG source instead.
import type {SVGProps} from 'react';
const Speaking = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-10 -12 141 84"
        className="g-aikit-mascot-speaking"
        {...props}
    >
        <defs>
            <radialGradient
                id={`${props.id}-zk-speaking`}
                cx={0}
                cy={0}
                r={1}
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(26.726 5.134) rotate(33.6363) scale(86.555 72.625)"
            >
                <stop
                    offset={0.0287184}
                    stopColor="#FFFF00"
                    style={{
                        stopColor: 'var(--g-aikit-mascot-body-center-color, #ffff00)',
                    }}
                />
                <stop
                    offset={1}
                    stopColor="#FF3377"
                    style={{
                        stopColor: 'var(--g-aikit-mascot-body-edge-color, #ff3377)',
                    }}
                />
            </radialGradient>
        </defs>
        <style>
            {
                '\n        .g-aikit-mascot-speaking-sr {\n            animation: g-aikit-mascot-speaking-readScan 2.2s linear infinite;\n        }\n        @keyframes g-aikit-mascot-speaking-readScan {\n            0% {\n                transform: translate(-4.5px, -3px);\n            }\n            18% {\n                transform: translate(4.5px, -3px);\n            }\n            21% {\n                transform: translate(-4.5px, 0);\n            }\n            39% {\n                transform: translate(4.5px, 0);\n            }\n            42% {\n                transform: translate(-4.5px, 3px);\n            }\n            60% {\n                transform: translate(4.5px, 3px);\n            }\n            63% {\n                transform: translate(-4.5px, -3px);\n            }\n            100% {\n                transform: translate(-4.5px, -3px);\n            }\n        }\n        .g-aikit-mascot-speaking-sm {\n            animation: g-aikit-mascot-speaking-mutter 0.28s ease-in-out infinite;\n        }\n        @keyframes g-aikit-mascot-speaking-mutter {\n            0%,\n            100% {\n                transform: translate(0, 0) rotate(0);\n            }\n            50% {\n                transform: translate(0.64px, 1.6px) rotate(1.44deg);\n            }\n        }\n        @media (prefers-reduced-motion: reduce) {\n            .g-aikit-mascot-speaking * {\n                animation: none;\n            }\n        }\n    '
            }
        </style>
        <g className="g-aikit-mascot-speaking-sm">
            <rect
                width={120.691}
                height={59.588}
                rx={29.794}
                fill={`url(#${props.id}-zk-speaking)`}
            />
            <circle
                cx={30.298}
                cy={29.794}
                r={15.1495}
                fill="#FFFFFF"
                style={{
                    fill: 'var(--g-aikit-mascot-eye-color, #ffffff)',
                }}
            />
            <circle
                cx={90.897}
                cy={29.794}
                r={15.1495}
                fill="#FFFFFF"
                style={{
                    fill: 'var(--g-aikit-mascot-eye-color, #ffffff)',
                }}
            />
            <g className="g-aikit-mascot-speaking-sr">
                <circle
                    cx={30.298}
                    cy={29.794}
                    r={7.5752}
                    fill="#000000"
                    style={{
                        fill: 'var(--g-aikit-mascot-pupil-color, #000000)',
                    }}
                />
                <circle
                    cx={90.897}
                    cy={29.794}
                    r={7.5752}
                    fill="#000000"
                    style={{
                        fill: 'var(--g-aikit-mascot-pupil-color, #000000)',
                    }}
                />
            </g>
        </g>
    </svg>
);
export default Speaking;
