import {
    ArrowRotateLeft,
    ChevronLeft,
    ChevronRight,
    ForwardStep,
    Pause,
    Play,
} from '@gravity-ui/icons';
import {Button, Icon, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';

interface PlaybackControlsProps {
    speed: string;
    onSpeedChange: (value: string) => void;
    busy: boolean;
    paused: boolean;
    step: number;
    phase: string;
    previousDisabled: boolean;
    nextDisabled: boolean;
    skipDisabled: boolean;
    replayDisabled: boolean;
    onPlay: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onPause: () => void;
    onSkip: () => void;
    onReplay: () => void;
    onReset: () => void;
}

export function PlaybackControls(props: PlaybackControlsProps) {
    return (
        <>
            <SegmentedRadioGroup
                aria-label="Speed"
                value={props.speed}
                disabled={props.busy || props.paused}
                onUpdate={props.onSpeedChange}
                width="max"
            >
                {['0.5', '1', '2', '4'].map((value) => (
                    <SegmentedRadioGroup.Option key={value} value={value}>
                        {value}×
                    </SegmentedRadioGroup.Option>
                ))}
            </SegmentedRadioGroup>
            <Button view="action" disabled={props.busy || props.paused} onClick={props.onPlay}>
                <Icon data={Play} size={16} />
                Play scenario
            </Button>
            <div className="chat-playground__step-controls">
                <Button size="m" disabled={props.previousDisabled} onClick={props.onPrevious}>
                    <Icon data={ChevronLeft} size={16} />
                    Prev step
                </Button>
                <Button size="m" disabled={props.nextDisabled} onClick={props.onNext}>
                    Next step
                    <Icon data={ChevronRight} size={16} />
                </Button>
            </div>
            <Text color="secondary">
                {props.step < 0 ? 'Not started' : `Step ${props.step + 1}`}
            </Text>
            <Button disabled={!props.busy && !props.paused} onClick={props.onPause}>
                <Icon data={props.paused ? Play : Pause} size={16} />
                {props.paused ? 'Resume' : 'Pause'}
            </Button>
            <Button disabled={props.skipDisabled} onClick={props.onSkip}>
                <Icon data={ForwardStep} size={16} />
                Skip to end
            </Button>
            <Button disabled={props.replayDisabled} onClick={props.onReplay}>
                <Icon data={ArrowRotateLeft} size={16} />
                Replay
            </Button>
            <Button onClick={props.onReset}>
                <Icon data={ArrowRotateLeft} size={16} />
                Reset
            </Button>
            <Text color="secondary" aria-live="polite">
                {props.paused ? `Paused · ${props.phase}` : props.phase}
            </Text>
        </>
    );
}
