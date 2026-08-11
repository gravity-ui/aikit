import {act, renderHook} from '@testing-library/react';

import {usePromptInput} from '../usePromptInput';

describe('usePromptInput onValueChange', () => {
    it('reports accepted changes and submit clearing', async () => {
        const onValueChange = jest.fn();
        const onSend = jest.fn().mockResolvedValue(undefined);
        const {result} = renderHook(() => usePromptInput({onSend, onValueChange}));

        act(() => result.current.handleChange('hello'));
        expect(onValueChange).toHaveBeenLastCalledWith('hello');

        await act(() => result.current.handleSubmit());
        expect(onSend).toHaveBeenCalledWith({content: 'hello'});
        expect(onValueChange).toHaveBeenLastCalledWith('');
    });

    it('does not report values rejected by maxLength', () => {
        const onValueChange = jest.fn();
        const {result} = renderHook(() =>
            usePromptInput({onSend: jest.fn(), onValueChange, maxLength: 2}),
        );
        act(() => result.current.handleChange('too long'));
        expect(onValueChange).not.toHaveBeenCalled();
    });
});
