import {type CSSProperties, type ReactNode, useEffect, useState} from 'react';

import {Button, Sheet, Text, useUniqId} from '@gravity-ui/uikit';

import {ContentWrapper} from '../ContentWrapper';

import './StoryPlayground.scss';

export interface StoryPlaygroundProps {
    children: ReactNode;
    controls: ReactNode;
    title?: string;
    mobile?: boolean;
    previewStyle?: CSSProperties;
}

/** Story-only controls stay outside the product preview and accept arbitrary form controls. */
export function StoryPlayground({
    children,
    controls,
    title = 'Example controls',
    mobile = false,
    previewStyle,
}: StoryPlaygroundProps) {
    const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 760px)').matches);
    const [open, setOpen] = useState(false);
    const id = useUniqId();
    useEffect(() => {
        const query = window.matchMedia('(max-width: 760px)');
        const update = () => setNarrow(query.matches);
        update();
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);
    const compact = mobile || narrow;
    // UIKit 7 controls Sheet with visible; UIKit 8 uses open.
    const sheetVisibility = {open, visible: open};
    return (
        <div className={`story-playground${compact ? ' story-playground_compact' : ''}`}>
            {compact ? (
                <>
                    <Button onClick={() => setOpen(true)} aria-expanded={open}>
                        Example controls
                    </Button>
                    <Sheet id={id} {...sheetVisibility} onOpenChange={setOpen} title={title}>
                        <div className="story-playground__controls">
                            {controls}
                            <Button onClick={() => setOpen(false)}>Done</Button>
                        </div>
                    </Sheet>
                </>
            ) : (
                <aside className="story-playground__panel" aria-label={title}>
                    <Text variant="subheader-2">{title}</Text>
                    <div className="story-playground__controls">{controls}</div>
                </aside>
            )}
            <div className="story-playground__preview">
                <ContentWrapper
                    height="760px"
                    width={mobile ? '360px' : '100%'}
                    maxWidth="100%"
                    boxSizing="border-box"
                    {...previewStyle}
                >
                    {children}
                </ContentWrapper>
            </div>
        </div>
    );
}
