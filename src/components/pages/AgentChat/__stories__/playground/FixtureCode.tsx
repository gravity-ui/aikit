export function FixtureCode({children, diff = false}: {children: string; diff?: boolean}) {
    return (
        <pre className="chat-playground__code">
            <code>
                {children.split('\n').map((line, index) => (
                    <span
                        key={index}
                        className={[
                            diff && line.startsWith('+') && 'chat-playground__added',
                            diff && line.startsWith('-') && 'chat-playground__removed',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        {line}
                        {'\n'}
                    </span>
                ))}
            </code>
        </pre>
    );
}
