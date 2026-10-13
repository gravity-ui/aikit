// Generated from ../stopped.svg. Edit the SVG source instead.
import type {SVGProps} from 'react';
const Stopped = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-14 -16 149 96"
        className="g-aikit-mascot-stopped"
        {...props}
    >
        <defs>
            <radialGradient
                id={`${props.id}-zk-stopped`}
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
                '\n        .g-aikit-mascot-stopped-sw {\n            transform-box: fill-box;\n            transform-origin: 50% 50%;\n            animation: g-aikit-mascot-stopped-winkR 300ms ease both;\n        }\n        .g-aikit-mascot-stopped-ss {\n            transform-box: fill-box;\n            transform-origin: 50% 50%;\n            animation: g-aikit-mascot-stopped-shiftB 300ms ease both;\n        }\n        @keyframes g-aikit-mascot-stopped-winkR {\n            0% {\n                transform: scaleY(1);\n            }\n            35% {\n                transform: scaleY(0.08);\n            }\n            55% {\n                transform: scaleY(0.08);\n            }\n            100% {\n                transform: scaleY(1);\n            }\n        }\n        @keyframes g-aikit-mascot-stopped-shiftB {\n            0% {\n                transform: translate(0, 0) rotate(0);\n            }\n            35% {\n                transform: translate(4px, 2px) rotate(4.8deg);\n            }\n            100% {\n                transform: translate(0, 0) rotate(0);\n            }\n        }\n        @media (prefers-reduced-motion: reduce) {\n            .g-aikit-mascot-stopped * {\n                animation: none;\n            }\n        }\n    '
            }
        </style>
        <g className="g-aikit-mascot-stopped-ss">
            <rect
                width={120.691}
                height={59.588}
                rx={29.794}
                fill={`url(#${props.id}-zk-stopped)`}
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
                cx={30.298}
                cy={29.794}
                r={7.5752}
                fill="#000000"
                style={{
                    fill: 'var(--g-aikit-mascot-pupil-color, #000000)',
                }}
            />
            <g className="g-aikit-mascot-stopped-sw">
                <circle
                    cx={90.897}
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
export default Stopped;
