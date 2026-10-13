// Generated from ../reveal.svg. Edit the SVG source instead.
import type {SVGProps} from 'react';
const Reveal = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-20 -12 162 84"
        className="g-aikit-mascot-reveal"
        {...props}
    >
        <defs>
            <radialGradient
                id={`${props.id}-zk-reveal`}
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
                '\n        .g-aikit-mascot-reveal-zoom {\n            transform-box: fill-box;\n            transform-origin: 50% 50%;\n            animation: g-aikit-mascot-reveal-zoom 480ms both;\n        }\n        @keyframes g-aikit-mascot-reveal-zoom {\n            0% {\n                transform: scale(0);\n                animation-timing-function: cubic-bezier(0.2, 0.7, 0.3, 1);\n            }\n            62% {\n                transform: scale(1.3);\n                animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);\n            }\n            82% {\n                transform: scale(0.88);\n            }\n            100% {\n                transform: scale(1);\n            }\n        }\n        @media (prefers-reduced-motion: reduce) {\n            .g-aikit-mascot-reveal-zoom {\n                animation: none;\n            }\n        }\n        @media (prefers-reduced-motion: reduce) {\n            .g-aikit-mascot-reveal * {\n                animation: none;\n            }\n        }\n    '
            }
        </style>
        <g className="g-aikit-mascot-reveal-zoom">
            <rect
                width={120.691}
                height={59.588}
                rx={29.794}
                fill={`url(#${props.id}-zk-reveal)`}
            />
            <rect
                x={75.748}
                y={14.6445}
                width={30.299}
                height={30.299}
                rx={15.1495}
                fill="#FFFFFF"
                style={{
                    fill: 'var(--g-aikit-mascot-eye-color, #ffffff)',
                }}
            />
            <rect
                x={15.1484}
                y={14.6445}
                width={30.299}
                height={30.299}
                rx={15.1495}
                fill="#FFFFFF"
                style={{
                    fill: 'var(--g-aikit-mascot-eye-color, #ffffff)',
                }}
            />
            <rect
                x={22.7227}
                y={22.2188}
                width={15.1504}
                height={15.1504}
                rx={7.57519}
                fill="#000000"
                style={{
                    fill: 'var(--g-aikit-mascot-pupil-color, #000000)',
                }}
            />
            <rect
                x={83.3223}
                y={22.2188}
                width={15.1504}
                height={15.1504}
                rx={7.57519}
                fill="#000000"
                style={{
                    fill: 'var(--g-aikit-mascot-pupil-color, #000000)',
                }}
            />
        </g>
    </svg>
);
export default Reveal;
