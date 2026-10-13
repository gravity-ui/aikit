// Generated from ../done.svg. Edit the SVG source instead.
import type {SVGProps} from 'react';
const Done = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-12 -26 145 100"
        className="g-aikit-mascot-done"
        {...props}
    >
        <defs>
            <radialGradient
                id={`${props.id}-zk-done`}
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
                '\n        .g-aikit-mascot-done-pb {\n            transform-box: fill-box;\n            transform-origin: 50% 100%;\n            animation: g-aikit-mascot-done-popBody 600ms both;\n        }\n        .g-aikit-mascot-done-pe {\n            animation: g-aikit-mascot-done-popEyes 600ms cubic-bezier(0.35, 0.1, 0.25, 1) both;\n        }\n        @keyframes g-aikit-mascot-done-popBody {\n            0% {\n                transform: translateY(0) scale(1, 1);\n                animation-timing-function: cubic-bezier(0.3, 0.6, 0.2, 1);\n            }\n            18% {\n                transform: translateY(-16px) scale(0.98, 1.05);\n                animation-timing-function: cubic-bezier(0.4, 0, 0.5, 1);\n            }\n            40% {\n                transform: translateY(0) scale(1.07, 0.9);\n                animation-timing-function: cubic-bezier(0.3, 0.7, 0.3, 1);\n            }\n            58% {\n                transform: translateY(-5.1px) scale(0.99, 1.02);\n                animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);\n            }\n            76% {\n                transform: translateY(0) scale(1.02, 0.99);\n            }\n            100% {\n                transform: translateY(0) scale(1, 1);\n            }\n        }\n        @keyframes g-aikit-mascot-done-popEyes {\n            0% {\n                transform: translateY(0);\n            }\n            18% {\n                transform: translateY(5.72px);\n            }\n            40% {\n                transform: translateY(-4.4px);\n            }\n            55% {\n                transform: translateY(6.6px);\n            }\n            70% {\n                transform: translateY(-3.74px);\n            }\n            83% {\n                transform: translateY(1.98px);\n            }\n            92% {\n                transform: translateY(-0.77px);\n            }\n            100% {\n                transform: translateY(0);\n            }\n        }\n        @media (prefers-reduced-motion: reduce) {\n            .g-aikit-mascot-done-pb,\n            .g-aikit-mascot-done-pe {\n                animation: none;\n            }\n        }\n        @media (prefers-reduced-motion: reduce) {\n            .g-aikit-mascot-done * {\n                animation: none;\n            }\n        }\n    '
            }
        </style>
        <g className="g-aikit-mascot-done-pb">
            <rect width={120.691} height={59.588} rx={29.794} fill={`url(#${props.id}-zk-done)`} />
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
            <g className="g-aikit-mascot-done-pe">
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
        </g>
    </svg>
);
export default Done;
