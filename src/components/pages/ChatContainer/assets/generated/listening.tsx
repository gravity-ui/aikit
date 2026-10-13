// Generated from ../listening.svg. Edit the SVG source instead.
import type {SVGProps} from 'react';
const Listening = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="-10 -10 141 80"
        className="g-aikit-mascot-listening"
        {...props}
    >
        <defs>
            <radialGradient
                id={`${props.id}-zk-listening`}
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
                '\n        .g-aikit-mascot-listening-lv {\n            transform-box: fill-box;\n            transform-origin: 50% 50%;\n            animation: g-aikit-mascot-listening-lvPulse 1.6s ease-in-out infinite;\n        }\n        @keyframes g-aikit-mascot-listening-lvPulse {\n            0%,\n            100% {\n                transform: scale(1);\n            }\n            50% {\n                transform: scale(1.06);\n            }\n        }\n        .g-aikit-mascot-listening-ci-ring {\n            transform-box: fill-box;\n            transform-origin: 50% 50%;\n            animation: g-aikit-mascot-listening-ringShrink 2s linear infinite;\n        }\n        .g-aikit-mascot-listening-lv g .g-aikit-mascot-listening-ci-ring:nth-child(2) {\n            animation-delay: -0.67s;\n        }\n        .g-aikit-mascot-listening-lv g .g-aikit-mascot-listening-ci-ring:nth-child(3) {\n            animation-delay: -1.33s;\n        }\n        @keyframes g-aikit-mascot-listening-ringShrink {\n            0% {\n                transform: scale(1);\n                opacity: 0;\n            }\n            12% {\n                opacity: 1;\n            }\n            80% {\n                opacity: 1;\n            }\n            100% {\n                transform: scale(0.05);\n                opacity: 0;\n            }\n        }\n        @media (prefers-reduced-motion: reduce) {\n            .g-aikit-mascot-listening * {\n                animation: none;\n            }\n        }\n    '
            }
        </style>
        <defs>
            <clipPath id={`${props.id}-elL`}>
                <circle cx={30.298} cy={29.794} r={15.1495} />
            </clipPath>
            <clipPath id={`${props.id}-elR`}>
                <circle cx={90.897} cy={29.794} r={15.1495} />
            </clipPath>
        </defs>
        <g className="g-aikit-mascot-listening-lv">
            <rect
                width={120.691}
                height={59.588}
                rx={29.794}
                fill={`url(#${props.id}-zk-listening)`}
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
            <g clipPath={`url(#${props.id}-elL)`}>
                <circle
                    className="g-aikit-mascot-listening-ci-ring"
                    cx={30.298}
                    cy={29.794}
                    r={15.1495}
                    fill="none"
                    stroke="#000000"
                    style={{
                        stroke: 'var(--g-aikit-mascot-pupil-color, #000000)',
                    }}
                    strokeWidth={3.6}
                />
                <circle
                    className="g-aikit-mascot-listening-ci-ring"
                    cx={30.298}
                    cy={29.794}
                    r={15.1495}
                    fill="none"
                    stroke="#000000"
                    style={{
                        stroke: 'var(--g-aikit-mascot-pupil-color, #000000)',
                    }}
                    strokeWidth={3.6}
                />
                <circle
                    className="g-aikit-mascot-listening-ci-ring"
                    cx={30.298}
                    cy={29.794}
                    r={15.1495}
                    fill="none"
                    stroke="#000000"
                    style={{
                        stroke: 'var(--g-aikit-mascot-pupil-color, #000000)',
                    }}
                    strokeWidth={3.6}
                />
            </g>
            <g clipPath={`url(#${props.id}-elR)`}>
                <circle
                    className="g-aikit-mascot-listening-ci-ring"
                    cx={90.897}
                    cy={29.794}
                    r={15.1495}
                    fill="none"
                    stroke="#000000"
                    style={{
                        stroke: 'var(--g-aikit-mascot-pupil-color, #000000)',
                    }}
                    strokeWidth={3.6}
                />
                <circle
                    className="g-aikit-mascot-listening-ci-ring"
                    cx={90.897}
                    cy={29.794}
                    r={15.1495}
                    fill="none"
                    stroke="#000000"
                    style={{
                        stroke: 'var(--g-aikit-mascot-pupil-color, #000000)',
                    }}
                    strokeWidth={3.6}
                />
                <circle
                    className="g-aikit-mascot-listening-ci-ring"
                    cx={90.897}
                    cy={29.794}
                    r={15.1495}
                    fill="none"
                    stroke="#000000"
                    style={{
                        stroke: 'var(--g-aikit-mascot-pupil-color, #000000)',
                    }}
                    strokeWidth={3.6}
                />
            </g>
        </g>
    </svg>
);
export default Listening;
