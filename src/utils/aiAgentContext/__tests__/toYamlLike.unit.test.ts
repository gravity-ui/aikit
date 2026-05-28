import {toYamlLike} from '../toYamlLike';

describe('toYamlLike', () => {
    describe('primitives', () => {
        it('should serialize string', () => {
            expect(toYamlLike('hello')).toBe('hello');
        });

        it('should serialize number', () => {
            expect(toYamlLike(42)).toBe('42');
        });

        it('should serialize boolean', () => {
            expect(toYamlLike(true)).toBe('true');
            expect(toYamlLike(false)).toBe('false');
        });

        it('should serialize null', () => {
            expect(toYamlLike(null)).toBe('null');
        });

        it('should serialize undefined', () => {
            expect(toYamlLike(undefined)).toBe('null');
        });
    });

    describe('multiline strings', () => {
        it('should use block scalar for multiline', () => {
            expect(toYamlLike('line1\nline2')).toBe('|\n  line1\n  line2');
        });
    });

    describe('plain objects', () => {
        it('should serialize flat object', () => {
            const result = toYamlLike({name: 'Alice', email: 'alice@example.com'});
            expect(result).toBe('name: Alice\nemail: alice@example.com');
        });

        it('should serialize nested object', () => {
            const result = toYamlLike({
                name: 'Alice',
                address: {city: 'New York', zip: '10001'},
            });
            expect(result).toBe('name: Alice\naddress:\n  city: New York\n  zip: 10001');
        });

        it('should serialize empty object', () => {
            expect(toYamlLike({})).toBe('{}');
        });
    });

    describe('arrays', () => {
        it('should serialize array of primitives', () => {
            const result = toYamlLike(['admin', 'active']);
            expect(result).toBe('- admin\n- active');
        });

        it('should serialize array of objects', () => {
            const result = toYamlLike([
                {id: 1, name: 'Widget'},
                {id: 2, name: 'Gadget'},
            ]);
            expect(result).toBe('- id: 1\n  name: Widget\n- id: 2\n  name: Gadget');
        });

        it('should serialize empty array', () => {
            expect(toYamlLike([])).toBe('[]');
        });
    });

    describe('complex nested structures', () => {
        it('should serialize object with array field', () => {
            const result = toYamlLike({
                name: 'Alice',
                tags: ['admin', 'active'],
            });
            expect(result).toBe('name: Alice\ntags:\n  - admin\n  - active');
        });

        it('should serialize array of objects with nested array fields', () => {
            const result = toYamlLike({
                products: [
                    {
                        category: 'Open Source',
                        products: [
                            {id: 1, name: 'Product 1', price: 100},
                            {id: 2, name: 'Product 2', price: 200},
                        ],
                    },
                ],
            });
            expect(result).toBe(
                'products:\n' +
                    '  - category: Open Source\n' +
                    '    products:\n' +
                    '      - id: 1\n' +
                    '        name: Product 1\n' +
                    '        price: 100\n' +
                    '      - id: 2\n' +
                    '        name: Product 2\n' +
                    '        price: 200',
            );
        });
    });

    describe('circular references', () => {
        it('should handle self-referencing object', () => {
            const obj: Record<string, unknown> = {name: 'Alice'};
            obj.self = obj;

            expect(toYamlLike(obj)).toBe('name: Alice\nself: [Circular]');
        });

        it('should handle circular references between objects', () => {
            const a: Record<string, unknown> = {id: 'a'};
            const b: Record<string, unknown> = {id: 'b', ref: a};
            a.ref = b;

            expect(toYamlLike(a)).toBe('id: a\nref:\n  id: b\n  ref: [Circular]');
        });

        it('should handle circular array reference', () => {
            const arr: unknown[] = [1];
            arr.push(arr);

            expect(toYamlLike(arr)).toBe('- 1\n- [Circular]');
        });
    });

    describe('unsupported types', () => {
        it('should fall back to String() for functions', () => {
            const fn = () => 42;
            const result = toYamlLike(fn);
            expect(result).toBe(String(fn));
        });
    });
});
