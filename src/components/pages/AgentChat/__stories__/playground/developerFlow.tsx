import {
    Archive,
    CodeCommitHorizontal,
    CodePullRequest,
    Eye,
    FilePlus,
    Magnifier,
    Pencil,
} from '@gravity-ui/icons';
import {Icon, Text} from '@gravity-ui/uikit';

import {developerChanges} from './changedFilesFixture';

export const developerPrompt =
    'Add search and category filters to the product catalog, preserve the selection in the URL, and cover the behavior with tests.';
export const developerReasoning =
    'I will inspect the catalog and existing UI patterns, add accessible filter controls, connect search and category state to the URL, and write focused tests. I will review the written source, ask before committing, and prepare a draft pull request. The available repository tools do not execute a local test runner.';
export const developerCommentary: Record<number, string> = {
    4: 'The catalog already uses a shared hook and role-based UI tests. I will add controlled filter inputs and keep the URL as the source of truth so shared links and browser navigation restore the selection.',
    8: 'The controls, catalog integration and URL state are written. I added search/category and URL-state tests; next I will read the test source for consistency. This simulation has not executed those tests.',
};
export function developerResponse(recovered: boolean) {
    return `${recovered ? 'Repository search timed out; I located the catalog using the directory listing and continued with direct file reads.\n\n' : ''}### Catalog filters ready for review\n\nAdded accessible search and category controls. Filters combine, empty results are handled, and the selection is preserved in \`q\` and \`category\` URL parameters while retaining unrelated parameters.\n\n**Changes**\n- \`src/components/ProductFilters.tsx\`: new controlled filter inputs.\n- \`src/components/ProductList.tsx\`: catalog integration and empty state.\n- \`src/hooks/useProducts.ts\`: filtering and URL state.\n- \`tests/catalogFilters.test.ts\`: search, combined category filters and URL-state cases.\n\n**Verification**\nReviewed the written test source through simulated \`read_file\`. No local tests or CI checks were executed.\n\n**Ready for review**\nDemo commit **f7a9c2d** and draft PR **#44 · Add catalog search and filters** target \`main\` from \`feat/catalog-filters\`. Four files changed, **+98 / −7** against the scenario baseline.\n\nAll edits, commits and pull requests in this Playground are local fixtures. Expand the activity or the change summary to inspect them.`;
}

function Code({children, diff = false}: {children: string; diff?: boolean}) {
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

export const developerSteps = [
    {
        name: 'Inspect storefront',
        compactContext: {
            pending: 'demo/storefront \u00b7 main',
            completed: 'demo/storefront \u00b7 main',
        },
        tool: 'list_repo_entries',
        icon: Archive,
        target: 'demo/storefront \u00b7 main',
        summary: 'Catalog component, hooks and tests located',
        body: (
            <Code>
                {
                    'src/components/ProductList.tsx\nsrc/hooks/useProducts.ts\nsrc/components/SearchField.tsx\ntests/productCatalog.test.tsx\npackage.json'
                }
            </Code>
        ),
    },
    {
        name: 'Find catalog patterns',
        compactContext: {
            pending: 'ProductList \u00b7 useProducts',
            completed: 'ProductList \u00b7 useProducts \u00b7 3 matches',
        },
        tool: 'repo_code_search',
        icon: Magnifier,
        target: 'ProductList \u00b7 useProducts \u00b7 SearchField',
        summary: 'Catalog entry points and input patterns found',
        body: (
            <Code>
                {
                    'src/components/ProductList.tsx:1\nsrc/hooks/useProducts.ts:4\nsrc/components/SearchField.tsx:8'
                }
            </Code>
        ),
    },
    {
        name: 'Read catalog',
        compactContext: {
            filePath: 'src/components/ProductList.tsx',
            action: 'Read',
            pending: 'src/components/ProductList.tsx',
            completed: 'src/components/ProductList.tsx',
        },
        tool: 'read_file',
        icon: Eye,
        target: 'src/components/ProductList.tsx',
        summary: 'Catalog currently renders the full product list',
        body: (
            <Code>
                {
                    'export function ProductList({products}) {\n  return <ProductGrid products={products} />;\n}'
                }
            </Code>
        ),
    },
    {
        name: 'Read product hook',
        compactContext: {
            filePath: 'src/hooks/useProducts.ts',
            action: 'Read',
            pending: 'src/hooks/useProducts.ts',
            completed: 'src/hooks/useProducts.ts',
        },
        tool: 'read_file',
        icon: Eye,
        target: 'src/hooks/useProducts.ts',
        summary: 'URL search parameters are not connected yet',
        body: (
            <Code>
                {
                    "import {useSearchParams} from 'react-router-dom';\nimport {catalog, type Product} from '../data/products';\n\nexport function useProducts() {\n  const products = catalog;\n  return {products};\n}"
                }
            </Code>
        ),
    },
    {
        name: 'Read UI test patterns',
        compactContext: {
            filePath: 'tests/productCatalog.test.tsx',
            action: 'Read',
            pending: 'tests/productCatalog.test.tsx',
            completed: 'tests/productCatalog.test.tsx',
        },
        tool: 'read_file',
        icon: Eye,
        target: 'tests/productCatalog.test.tsx',
        summary: 'Existing tests use role-based queries and memory routing',
        body: (
            <Code>
                {
                    "render(<MemoryRouter><ProductList /></MemoryRouter>);\nexpect(screen.getByRole('heading', {name: 'Products'})).toBeVisible();\n// Reuse accessible labels and URL-backed state for the new filters."
                }
            </Code>
        ),
    },
    {
        name: 'Create filter controls',
        compactContext: {
            filePath: 'src/components/ProductFilters.tsx',
            action: 'Create',
            pending: 'src/components/ProductFilters.tsx',
            completed: 'src/components/ProductFilters.tsx',
            changes: developerChanges.files[0],
        },
        tool: 'add_entry',
        icon: FilePlus,
        target: 'src/components/ProductFilters.tsx',
        summary: 'Accessible search and category controls created',
        body: (
            <Code>
                {
                    'import type {ChangeEvent} from \'react\';\n\ntype ProductFiltersProps = {\n  query: string;\n  category: string;\n  onQueryChange: (query: string) => void;\n  onCategoryChange: (category: string) => void;\n};\n\nexport function ProductFilters(props: ProductFiltersProps) {\n  const changeQuery = (event: ChangeEvent<HTMLInputElement>) => {\n    props.onQueryChange(event.target.value);\n  };\n  return (\n    <section aria-label="Catalog filters">\n      <label>\n        Search products\n        <input value={props.query} onChange={changeQuery} />\n      </label>\n      <label>\n        Category\n        <select value={props.category}\n          onChange={(event) => props.onCategoryChange(event.target.value)}>\n          <option value="">All categories</option>\n          <option value="books">Books</option>\n        </select>\n      </label></section>);\n}'
                }
            </Code>
        ),
    },
    {
        name: 'Integrate catalog filters',
        compactContext: {
            filePath: 'src/components/ProductList.tsx',
            action: 'Edit',
            pending: 'src/components/ProductList.tsx',
            completed: 'src/components/ProductList.tsx',
            changes: developerChanges.files[1],
        },
        tool: 'replace_file_fragment',
        icon: Pencil,
        target: 'src/components/ProductList.tsx',
        summary: 'Filter controls and empty results integrated',
        body: (
            <Code diff>
                {
                    "@@ -1,3 +1,14 @@\n-export function ProductList({products}) {\n-  return <ProductGrid products={products} />;\n-}\n+import {ProductFilters} from './ProductFilters';\n+import {useProducts} from '../hooks/useProducts';\n+\n+export function ProductList() {\n+  const {products, query, category, setQuery, setCategory} = useProducts();\n+  return (\n+    <>\n+      <ProductFilters query={query} category={category}\n+        onQueryChange={setQuery} onCategoryChange={setCategory} />\n+      <ProductGrid products={products} />\n+      {products.length === 0 && <p>No products match your filters.</p>}\n+    </>\n+  );\n+}"
                }
            </Code>
        ),
    },
    {
        name: 'Persist selection in URL',
        compactContext: {
            filePath: 'src/hooks/useProducts.ts',
            action: 'Edit',
            pending: 'src/hooks/useProducts.ts',
            completed: 'src/hooks/useProducts.ts',
            changes: developerChanges.files[2],
        },
        tool: 'replace_file_fragment',
        icon: Pencil,
        target: 'src/hooks/useProducts.ts',
        summary: 'Search/category state reads and writes URL parameters',
        body: (
            <Code diff>
                {
                    "@@ -4,4 +4,22 @@\n-export function useProducts() {\n-  const products = catalog;\n-  return {products};\n-}\n+export function readFilters(search: string) {\n+  const params = new URLSearchParams(search);\n+  return {query: params.get('q') ?? '', category: params.get('category') ?? ''};\n+}\n+export function writeFilters(search: string, query: string, category: string) {\n+  const params = new URLSearchParams(search);\n+  query ? params.set('q', query) : params.delete('q');\n+  category ? params.set('category', category) : params.delete('category');\n+  return params.toString();\n+}\n+export function filterProducts(products: Product[], query: string, category: string) {\n+  return products.filter(product =>\n+    product.name.toLowerCase().includes(query.trim().toLowerCase()) &&\n+    (!category || product.category === category));\n+}\n+export function useProducts() {\n+  const [params, setParams] = useSearchParams();\n+  const {query, category} = readFilters(params.toString());\n+  const setFilters = (q: string, c: string) => setParams(writeFilters(params.toString(), q, c));\n+  return {products: filterProducts(catalog, query, category), query, category,\n+    setQuery: (q: string) => setFilters(q, category), setCategory: (c: string) => setFilters(query, c)};\n+}"
                }
            </Code>
        ),
    },
    {
        name: 'Create filter tests',
        compactContext: {
            filePath: 'tests/catalogFilters.test.ts',
            action: 'Create',
            pending: 'tests/catalogFilters.test.ts',
            completed: 'tests/catalogFilters.test.ts',
            changes: developerChanges.files[3],
        },
        tool: 'add_entry',
        icon: FilePlus,
        target: 'tests/catalogFilters.test.ts',
        summary: 'Search, combined filters, URL state and empty results covered',
        body: (
            <Code>
                {
                    "import {describe, expect, it} from 'vitest';\nimport {filterProducts, readFilters, writeFilters} from '../src/hooks/useProducts';\n\nconst products = [\n  {id: 'book', name: 'Design systems', category: 'books'},\n  {id: 'lamp', name: 'Desk lamp', category: 'home'},\n];\n\ndescribe('catalog filters', () => {\n  it('matches search without case sensitivity', () => {\n    expect(filterProducts(products, 'DESIGN', '')).toEqual([products[0]]);\n  });\n  it('combines search and category', () => {\n    expect(filterProducts(products, 'design', 'books')).toEqual([products[0]]);\n    expect(filterProducts(products, 'design', 'home')).toEqual([]);\n  });\n  it('reads a shared URL', () => {\n    expect(readFilters('?q=desk&category=home')).toEqual({\n      query: 'desk', category: 'home',\n    });\n  });\n  it('retains unrelated query parameters', () => {\n    expect(writeFilters('?sort=price', 'desk', 'home')).toBe(\n      'sort=price&q=desk&category=home',\n    );\n  });\n  it('removes empty filters from the URL', () => {\n    expect(writeFilters('?q=desk&category=home', '', '')).toBe('');\n  });\n  it('shows all products when filters are empty', () => {\n    expect(filterProducts(products, '', '')).toEqual(products);\n  });\n});\n// Simulated source review only; this story does not execute a test runner."
                }
            </Code>
        ),
    },
    {
        name: 'Review written tests',
        compactContext: {
            filePath: 'tests/catalogFilters.test.ts',
            action: 'Read',
            pending: 'tests/catalogFilters.test.ts',
            completed: 'tests/catalogFilters.test.ts',
        },
        tool: 'read_file',
        icon: Eye,
        target: 'tests/catalogFilters.test.ts',
        summary: 'Test source reviewed; no runner executed',
        body: (
            <Code>
                {
                    "import {describe, expect, it} from 'vitest';\nimport {filterProducts, readFilters, writeFilters} from '../src/hooks/useProducts';\n\nconst products = [\n  {id: 'book', name: 'Design systems', category: 'books'},\n  {id: 'lamp', name: 'Desk lamp', category: 'home'},\n];\n\ndescribe('catalog filters', () => {\n  it('matches search without case sensitivity', () => {\n    expect(filterProducts(products, 'DESIGN', '')).toEqual([products[0]]);\n  });\n  it('combines search and category', () => {\n    expect(filterProducts(products, 'design', 'books')).toEqual([products[0]]);\n    expect(filterProducts(products, 'design', 'home')).toEqual([]);\n  });\n  it('reads a shared URL', () => {\n    expect(readFilters('?q=desk&category=home')).toEqual({\n      query: 'desk', category: 'home',\n    });\n  });\n  it('retains unrelated query parameters', () => {\n    expect(writeFilters('?sort=price', 'desk', 'home')).toBe(\n      'sort=price&q=desk&category=home',\n    );\n  });\n  it('removes empty filters from the URL', () => {\n    expect(writeFilters('?q=desk&category=home', '', '')).toBe('');\n  });\n  it('shows all products when filters are empty', () => {\n    expect(filterProducts(products, '', '')).toEqual(products);\n  });\n});\n// Simulated source review only; this story does not execute a test runner."
                }
            </Code>
        ),
    },
    {
        name: 'Commit feature',
        compactContext: {
            pending: 'feat/catalog-filters \u00b7 4 files',
            completed: 'f7a9c2d \u00b7 4 files',
            changes: {added: developerChanges.added, deleted: developerChanges.deleted},
        },
        tool: 'commit_changes',
        icon: CodeCommitHorizontal,
        target: 'feat/catalog-filters \u00b7 4 files',
        summary: 'Demo feature commit f7a9c2d prepared',
        confirmation: true,
        body: (
            <div>
                <Text variant="subheader-2">feat: add URL-backed product catalog filters</Text>
                <p>
                    Review the four-file baseline diff before continuing. This approval advances
                    only the local simulation.
                </p>
                <Code>
                    {
                        'src/components/ProductFilters.tsx  +28  0\nsrc/components/ProductList.tsx     +14 -3\nsrc/hooks/useProducts.ts           +22 -4\ntests/catalogFilters.test.ts       +34  0\n\nBranch: feat/catalog-filters\nBaseline total: +98 -7'
                    }
                </Code>
            </div>
        ),
    },
    {
        name: 'Create feature pull request',
        compactContext: {
            pending: 'feat/catalog-filters \u2192 main',
            completed: '#44 \u00b7 Add catalog search and filters \u00b7 draft',
        },
        tool: 'create_pull_request',
        icon: CodePullRequest,
        target: 'feat/catalog-filters \u2192 main',
        summary: 'Demo draft PR #44 prepared for review',
        body: (
            <div>
                <Text variant="subheader-2">Add catalog search and category filters</Text>
                <p>Accessible controls, combined filtering, shareable URL state and new tests.</p>
                <Code>
                    {
                        'Base: main\nHead: feat/catalog-filters\nFiles changed: 4\nAdditions: 98 \u00b7 Deletions: 7\nStatus: draft \u00b7 simulated\nVerification: test source reviewed; tests were not executed'
                    }
                </Code>
            </div>
        ),
    },
];
export function stepIcon(icon: typeof Eye) {
    return <Icon data={icon} size={16} />;
}
