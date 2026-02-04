# Changelog

## [1.3.2](https://github.com/gravity-ui/aikit/compare/v1.3.1...v1.3.2) (2026-02-04)


### Bug Fixes

* add newline to notices ([1fa3a4c](https://github.com/gravity-ui/aikit/commit/1fa3a4c39871c20a07ebb3b011766056ac2d2849))
* **ChatContainer:** add folding logic ([a5dac44](https://github.com/gravity-ui/aikit/commit/a5dac4488abfaea75027f1387c769427e2c347a0))
* small fix to legal files ([e41a3ce](https://github.com/gravity-ui/aikit/commit/e41a3ce7b7e2e91e9dad5c37b9dd80a278da1185))

## [1.3.1](https://github.com/gravity-ui/aikit/compare/v1.3.0...v1.3.1) (2026-01-29)


### Bug Fixes

* **PromptInput:** remove padding from textarea for fullview ([526efcc](https://github.com/gravity-ui/aikit/commit/526efcca5dfcb650508af1b27d156b3139920cc5))
* **ToolMessage:** change data-qa attribute to qa ([4e07493](https://github.com/gravity-ui/aikit/commit/4e07493d3526089a8d995c0fde3b5502ed53711d))

## [1.3.0](https://github.com/gravity-ui/aikit/compare/v1.2.1...v1.3.0) (2026-01-27)


### Features

* **ThinkingMessage:** add default copy logic and hide duplicate assistant actions ([3cff655](https://github.com/gravity-ui/aikit/commit/3cff655a5d86b187ff1a58d723e4b891738b058d))

## [1.2.1](https://github.com/gravity-ui/aikit/compare/v1.2.0...v1.2.1) (2026-01-23)


### Bug Fixes

* do not include uikit styles ([a7704dd](https://github.com/gravity-ui/aikit/commit/a7704dd717c95e9e3d589f713687c9170e7faaa4))
* fix tests ([f8b1967](https://github.com/gravity-ui/aikit/commit/f8b19670f940d9d9690cfb42f36493fbd5cba909))

## [1.2.0](https://github.com/gravity-ui/aikit/compare/v1.1.0...v1.2.0) (2026-01-20)


### Features

* **MarkdownRenderer:** add blocks memoization and parsing incompled chunks ([b283ac8](https://github.com/gravity-ui/aikit/commit/b283ac8fb0483fbb49ac51877622f059333dae7d))

## [1.1.0](https://github.com/gravity-ui/aikit/compare/v1.0.2...v1.1.0) (2025-12-17)


### Features

* **readme:** add ru translate readme ([e161d1d](https://github.com/gravity-ui/aikit/commit/e161d1d9de8c97a764266c1663ef37037a115ef8))


### Bug Fixes

* **MarkdownRenderer:** fix color for dark theme ([cac5118](https://github.com/gravity-ui/aikit/commit/cac5118933f6d4f6c0679fa20108e57765f060d1))

## [1.0.2](https://github.com/gravity-ui/aikit/compare/v1.0.1...v1.0.2) (2025-12-16)


### Bug Fixes

* remove broken link in docs ([4f1f90a](https://github.com/gravity-ui/aikit/commit/4f1f90a03fc10906f70784f7c59958e362eec51e))

## [1.0.1](https://github.com/gravity-ui/aikit/compare/1.0.0...v1.0.1) (2025-12-15)


### Bug Fixes

* **MessageList:** update scroll behaviour ([9d74619](https://github.com/gravity-ui/aikit/commit/9d74619272db182c955427e8c8ef4b306ddb788e))

## [1.0.0](https://github.com/gravity-ui/aikit/compare/v0.6.1...v1.0.0) (2025-12-09)


### ⚠️ Breaking Changes

- Unification of project actions to one realization via ActionButton

#### BaseMessage
- change type name from BaseMessageAction to BaseMessageActionType
- change prop name type (type of default action) to actionType

#### Header
- change `additionalActions` to base Action type


### Bug Fixes

* **dependance:** move extra dependencies to peerDependencies ([90d8e8d](https://github.com/gravity-ui/aikit/commit/90d8e8dd63dcacec8c2e176e3548c80ac3f39c4d))
* **actions:** add extra button props to action ([3ea6f26](https://github.com/gravity-ui/aikit/commit/3ea6f267d83b6195f303c85e680e025ca4011361))

## [0.6.1](https://github.com/gravity-ui/aikit/compare/v0.6.0...v0.6.1) (2025-12-09)


### Bug Fixes

* **History:** fix the search in a list ([2776db8](https://github.com/gravity-ui/aikit/commit/2776db8054de2ad8fc1694fb8fb856069c2fc3bf))
* **History:** improve keyboard navigation ([76f86e3](https://github.com/gravity-ui/aikit/commit/76f86e3772a32819109a0e3493a3965502e2f650))

## [0.6.0](https://github.com/gravity-ui/aikit/compare/v0.5.0...v0.6.0) (2025-12-03)


### Features

* **SubmitButton:** add cancelable text support and update icon ([27f37a0](https://github.com/gravity-ui/aikit/commit/27f37a0a45ef7761d52715258099d1c1b6715323))

## [0.5.0](https://github.com/gravity-ui/aikit/compare/v0.4.5...v0.5.0) (2025-12-02)


### Features

* **PromptInputFooterConfig:** add submitButtonQa prop ([134511b](https://github.com/gravity-ui/aikit/commit/134511bc2bf239f1939f7ab7a49c368aed82f56a))

## [0.4.5](https://github.com/gravity-ui/aikit/compare/v0.4.4...v0.4.5) (2025-12-02)


### Bug Fixes

* **UserMessage:** correctly display messages that are wider than the chat ([bffc01d](https://github.com/gravity-ui/aikit/commit/bffc01d3ddac6c58f7c4a31bc993cbebf0dcecc1))

## [0.4.4](https://github.com/gravity-ui/aikit/compare/v0.4.3...v0.4.4) (2025-11-28)


### Bug Fixes

* **Disclaimer:** add prop to text variant ([9d104f8](https://github.com/gravity-ui/aikit/commit/9d104f8786f6386ee732cab72cdfcca7b77fe303))

## [0.4.3](https://github.com/gravity-ui/aikit/compare/v0.4.2...v0.4.3) (2025-11-28)


### Bug Fixes

* **history and suggest:** some fix for history and suggest ([e9a850a](https://github.com/gravity-ui/aikit/commit/e9a850ab045d7f805e796fc95313c056a6adfe85))

## [0.4.2](https://github.com/gravity-ui/aikit/compare/v0.4.1...v0.4.2) (2025-11-28)


### Bug Fixes

* **MessageList:** hide assistant actions on submitted status ([4365c8e](https://github.com/gravity-ui/aikit/commit/4365c8e8e42ca29dc2e3715f02212bcf92a5db90))

## [0.4.1](https://github.com/gravity-ui/aikit/compare/v0.4.0...v0.4.1) (2025-11-27)


### Bug Fixes

* **qa:** add lost qa attrs ([d8ced02](https://github.com/gravity-ui/aikit/commit/d8ced025931aff986a0e894bdfe93496686d8670))

## [0.4.0](https://github.com/gravity-ui/aikit/compare/v0.3.2...v0.4.0) (2025-11-27)


### Features

* **Alert:** add collapsible content feature ([520eed7](https://github.com/gravity-ui/aikit/commit/520eed7ac4ff11dd96ce722b65645885f32e6190))
* **ToolHeader:** add 'cancelled' tool message status ([3838879](https://github.com/gravity-ui/aikit/commit/3838879cbff582bf6a660ef4d198714ea11511e2))
* **ToolMessage:** add autoCollapseOnCancelled prop ([4c35662](https://github.com/gravity-ui/aikit/commit/4c35662ccf9b1a222ac87a9226b8d7b2360593a3))
* **ToolMessage:** add autoCollapseOnSuccess prop ([0f2349d](https://github.com/gravity-ui/aikit/commit/0f2349d0900366fa92300270fae1def693a5471b))

## [0.3.2](https://github.com/gravity-ui/aikit/compare/v0.3.1...v0.3.2) (2025-11-25)


### Bug Fixes

* **texts:** some fix for text view and text types ([2042a39](https://github.com/gravity-ui/aikit/commit/2042a39aec2ccb4b7180761c136a0a50ebab81a7))

## [0.3.1](https://github.com/gravity-ui/aikit/compare/v0.3.0...v0.3.1) (2025-11-24)


### Bug Fixes

* **ChatContainer:** change MessageListConfig to extend MessageListProps ([8842123](https://github.com/gravity-ui/aikit/commit/8842123c8cb9899cff179008c3dd36e45e583407))

## [0.3.0](https://github.com/gravity-ui/aikit/compare/v0.2.2...v0.3.0) (2025-11-24)


### Features

* **ContextItem:** make onRemove props optional ([d38dd45](https://github.com/gravity-ui/aikit/commit/d38dd45b6ff5366cd6cd409896f502cf16e2d0eb))
* **header:** add 'withIcon' prop to control icon visibility ([2684923](https://github.com/gravity-ui/aikit/commit/26849231d8dcd7c6cbaee9e723aa662166a461f4))
* **history:** add loading state to History ([346817b](https://github.com/gravity-ui/aikit/commit/346817ba319b6b3f2ac96a5c8499bac21db987e3))
* **MessageList:** add pagination ([8c9d4d1](https://github.com/gravity-ui/aikit/commit/8c9d4d13883ffd98c67a1a71ac0cb7271df52e85))
* **MessageList:** remove message status ([57b16e1](https://github.com/gravity-ui/aikit/commit/57b16e13bf15ac4ff8f52e880fbf02669342570e))
* **PromptInput:** add initialValue prop ([742d539](https://github.com/gravity-ui/aikit/commit/742d5392bc5f8d97ae3ab6826be70852c1ba3e63))
* **PromptInput:** remove isSending state and update canSubmit logic ([7f92245](https://github.com/gravity-ui/aikit/commit/7f922451775d9489fa9caf336cda6bf3a6c5ce74))


### Bug Fixes

* **ChatContainer:** fix props for inner components ([5d44a8a](https://github.com/gravity-ui/aikit/commit/5d44a8a83c20adbe86a2a74c5fc5f678ae02e0ea))
* **HistoryList:** use castom loader ([86b7208](https://github.com/gravity-ui/aikit/commit/86b7208969012f1d1ee3df009f5c58ab172d96e9))
* **MessageList:** add padding for scroll position ([ab5735d](https://github.com/gravity-ui/aikit/commit/ab5735d0bfee2f30bea99c4f5c080b762077ed8a))
* **shimmer:** remove duplicate mask-clip property ([138fb52](https://github.com/gravity-ui/aikit/commit/138fb523af77dd97d8d2e5449a8632e9a5c89702))
* **shimmer:** support dark theme ([bfff965](https://github.com/gravity-ui/aikit/commit/bfff965c72ca0e586d72996cde857c3c6ee6fe7f))

## [0.2.2](https://github.com/gravity-ui/aikit/compare/v0.2.1...v0.2.2) (2025-11-21)


### Bug Fixes

* **styled:** fix class name ([7fc795c](https://github.com/gravity-ui/aikit/commit/7fc795c65b2960667eebbb4b71f7bbed788df0fc))

## [0.2.1](https://github.com/gravity-ui/aikit/compare/v0.2.0...v0.2.1) (2025-11-21)


### Bug Fixes

* **styles:** add some fix for styles ai chat and customizing ([bf9adb6](https://github.com/gravity-ui/aikit/commit/bf9adb6880fc2219af43255c3d3a8db500da945f))

## [0.2.0](https://github.com/gravity-ui/aikit/compare/v0.1.2...v0.2.0) (2025-11-20)


### Features

* **ChatContainer:** add background to css variables ([20a4e0b](https://github.com/gravity-ui/aikit/commit/20a4e0b5bd170d4d19bacdb104831569916e4dd2))
* **suggestion:** add title to suggestion ([a37d365](https://github.com/gravity-ui/aikit/commit/a37d3650407925fda911b54239c6f2f1d5d57dc6))
* **suggestion:** add wrap mode for text ([1f2f8c9](https://github.com/gravity-ui/aikit/commit/1f2f8c9d53eec9cbf21c58f61aee3ee19b17a6d6))

## [0.1.2](https://github.com/gravity-ui/aikit/compare/v0.1.1...v0.1.2) (2025-11-19)


### Bug Fixes

* **build:** fix build package dependencies ([ea53950](https://github.com/gravity-ui/aikit/commit/ea53950296d8d2b525e8837f40e4f2a43a532c05))

## [0.1.1](https://github.com/gravity-ui/aikit/compare/v0.1.0...v0.1.1) (2025-11-19)


### Bug Fixes

* **scripts:** add playwright test to ci ([4fe82d7](https://github.com/gravity-ui/aikit/commit/4fe82d76b02dfc78ef366af585eed6172c9c57b9))
* **scripts:** fix start playwright test on release ci ([1c5998b](https://github.com/gravity-ui/aikit/commit/1c5998b1e77ab40bbc2d3edf8eda0d8fb024c5e9))
* **test:** fix test script ([24b1295](https://github.com/gravity-ui/aikit/commit/24b1295967d3dce4cdd2c2e7dabf1d806ad8d4fd))
* **test:** fix test script ([30067df](https://github.com/gravity-ui/aikit/commit/30067df1136634791bd6b02ff2ad15bc76ffe862))

## [0.1.0](https://github.com/gravity-ui/aikit/compare/v0.0.1...v0.1.0) (2025-11-19)


### Features

* **MessageList:** add default actions for user and assistant messages ([da79272](https://github.com/gravity-ui/aikit/commit/da79272d2ac86de91a1f2c41ce18af957f97e1bf))
* **MessageList:** conditionally render actions based on message status ([b55cc9e](https://github.com/gravity-ui/aikit/commit/b55cc9e719f8de4b2fc1891e9aa0bd405f637f74))
* **MessageList:** implement smart scrolling ([a70c0a1](https://github.com/gravity-ui/aikit/commit/a70c0a137b330d83b30382e2db1ca1f3b3225ec5))
* **MessageList:** minor style improvements ([1f9fb7e](https://github.com/gravity-ui/aikit/commit/1f9fb7e5370893ee294cd5e735f6711aa84b9d68))

## 0.0.1 (2025-11-19)


### Features

* **action-button:** add new atom ([719a811](https://github.com/gravity-ui/aikit/commit/719a8118168ac3c02639f48d5c58d07c5fd1672a))
* add ToolIndicator component ([2beef47](https://github.com/gravity-ui/aikit/commit/2beef47174037bbc65ef2606fbe8ac02d20e8d08))
* **Alert:** add Alert component ([#18](https://github.com/gravity-ui/aikit/issues/18)) ([508b905](https://github.com/gravity-ui/aikit/commit/508b905e5e94e9648bf933efcb623cc3114307d0))
* **AssistantMessage:** add AssistantMessage component ([ce187d1](https://github.com/gravity-ui/aikit/commit/ce187d1e9892ab840dd087b19c755a021eab81a1))
* **AssistantMessage:** register ThinkingMessage renderer for 'thinking' message type ([286543d](https://github.com/gravity-ui/aikit/commit/286543d1cfa58f4341d4ce6934c052f9af5fa088))
* **atom:** Add loader ([#11](https://github.com/gravity-ui/aikit/issues/11)) ([33a1502](https://github.com/gravity-ui/aikit/commit/33a1502f377d34c2ede73d768730f30ba7552fba))
* **BaseMessage:** add BaseMessage component ([#17](https://github.com/gravity-ui/aikit/issues/17)) ([ecc19aa](https://github.com/gravity-ui/aikit/commit/ecc19aaa6c64e253a26932a84ed4f130c4cf7201))
* **ButtonGroup:** add ButtonGroup component ([#14](https://github.com/gravity-ui/aikit/issues/14)) ([426517b](https://github.com/gravity-ui/aikit/commit/426517b54a4fbd9d18712ed589f2cd6c14e6a756))
* **ChatContainer:** create main container for ai chat ([2db3bab](https://github.com/gravity-ui/aikit/commit/2db3babe372d964a04f0ec7e98bd5ad7107b85f4))
* **ChatContainer:** create main container for ai chat ([#36](https://github.com/gravity-ui/aikit/issues/36)) ([9362d72](https://github.com/gravity-ui/aikit/commit/9362d7206b495d2dd00d0d68e6f719fbd72dae95))
* **ChatContent:** add new ChatContent template ([#33](https://github.com/gravity-ui/aikit/issues/33)) ([e33a7a0](https://github.com/gravity-ui/aikit/commit/e33a7a084e7bb57728c91a7eac38092b4b6f6b23))
* **ChatDate:** add atom component ChatDate ([#20](https://github.com/gravity-ui/aikit/issues/20)) ([132ee92](https://github.com/gravity-ui/aikit/commit/132ee926c419b0f64f47619d1f84752657428085))
* **ContextIndicator:** add atom element ContextIndicator ([#3](https://github.com/gravity-ui/aikit/issues/3)) ([e0abf03](https://github.com/gravity-ui/aikit/commit/e0abf03e2b2cc8e6e2fb902306f51061591afca6))
* **ContextItem:** add ContextItem ([#35](https://github.com/gravity-ui/aikit/issues/35)) ([7357425](https://github.com/gravity-ui/aikit/commit/7357425eba787b9243185b85757b0a7588819b00))
* **core:** add default types ([8f56e20](https://github.com/gravity-ui/aikit/commit/8f56e20fbc628ae72242f231895bac75137c86d0))
* **core:** add PromptBox and change core functionality ([#21](https://github.com/gravity-ui/aikit/issues/21)) ([77e3b7f](https://github.com/gravity-ui/aikit/commit/77e3b7fe463baeb844b1ed365269d9a61a8cbd65))
* **core:** change name of lib ([17838c6](https://github.com/gravity-ui/aikit/commit/17838c690be5e63ca9b81d1bf056c57484ba1c57))
* **core:** init project ([e21a6fb](https://github.com/gravity-ui/aikit/commit/e21a6fb782f713e288f50caa92cec64b20c1b8fa))
* **DiffStat:** add a DiffStat component ([#9](https://github.com/gravity-ui/aikit/issues/9)) ([3323a5e](https://github.com/gravity-ui/aikit/commit/3323a5e774b34fdc6a6a18b30857878416031a5d))
* **Disclaimer:** add atom Disclaimer ([bc17f4b](https://github.com/gravity-ui/aikit/commit/bc17f4babf05a5f90feb2ca89c42951fae08a755))
* **EmptyContainer:** add template EmptyContainer ([ae470ac](https://github.com/gravity-ui/aikit/commit/ae470ac4499c40113d55efbd477b2eec3d7aeddb))
* **header:** add Header ([#19](https://github.com/gravity-ui/aikit/issues/19)) ([aeb82bf](https://github.com/gravity-ui/aikit/commit/aeb82bfbd5af9446b6a41d3a765835f238261b6c))
* **history:** add new history chat ([6af132c](https://github.com/gravity-ui/aikit/commit/6af132ca222c1788f318ec8555ad4ec2a194d4cc))
* **MarkdownRenderer:** add MarkdownRenderer component ([#28](https://github.com/gravity-ui/aikit/issues/28)) ([32a81b1](https://github.com/gravity-ui/aikit/commit/32a81b164cb42e92a000be2b8e1383ef0616974e))
* **MarkdownRenderer:** add transformOptions prop for customizable markdown rendering ([b8b5d2b](https://github.com/gravity-ui/aikit/commit/b8b5d2b356e85a20c1483df001f0216779faefef))
* **MessageBalloon:** add MessageBalloon component ([#12](https://github.com/gravity-ui/aikit/issues/12)) ([7e703f9](https://github.com/gravity-ui/aikit/commit/7e703f9d676aced814597cfe2971907e28694517))
* **MessageList:** add MessageList component ([1e6a010](https://github.com/gravity-ui/aikit/commit/1e6a010d3a6a616d0980299301a6217498a03d10))
* **MessageList:** add support for 'error' status ([8228842](https://github.com/gravity-ui/aikit/commit/8228842135a3bcdd3261bcc71d341aa4c277e729))
* **MessageList:** add support for 'submitted' status ([bea6d69](https://github.com/gravity-ui/aikit/commit/bea6d699697bb7ad2eca7f8136034b04f77a447b))
* **messages:** enhance type safety with generic message parts ([d78714e](https://github.com/gravity-ui/aikit/commit/d78714e9c7ce6a8da04cb40e931e0c8bc350f585))
* **Shimmer:** add Shimmer component ([770f252](https://github.com/gravity-ui/aikit/commit/770f252b798b15ed54e9138b185cbd680dbd88d5))
* **SubmitButton:** create atom SubmitButton ([#13](https://github.com/gravity-ui/aikit/issues/13)) ([a89ae0d](https://github.com/gravity-ui/aikit/commit/a89ae0de1135849b36fe45e48368a28bd5d40b8c))
* **Suggestions:** add molecule Suggestions ([#16](https://github.com/gravity-ui/aikit/issues/16)) ([0ae54a1](https://github.com/gravity-ui/aikit/commit/0ae54a162e0904bff6586c37103ad921fe6a274a))
* **system:** add default reviewers ([5286a62](https://github.com/gravity-ui/aikit/commit/5286a6244b623bf2ec0402fcf6ca73911a807625))
* **Tabs:** introduce Tabs component ([#27](https://github.com/gravity-ui/aikit/issues/27)) ([413dc68](https://github.com/gravity-ui/aikit/commit/413dc68afb570292c4dcdf44e82fa9b8382066c4))
* **ThinkingMessage:** introduce ThinkingMessage component ([#32](https://github.com/gravity-ui/aikit/issues/32)) ([8490035](https://github.com/gravity-ui/aikit/commit/84900351f027ac0d65a8dcc1fd08d12020779eda))
* **ToolMessage:** add ToolMessage component ([#22](https://github.com/gravity-ui/aikit/issues/22)) ([8372d3f](https://github.com/gravity-ui/aikit/commit/8372d3f5f6e660bb4b2bc5033033b28cc0533a02))
* **UserMessage:** add UserMessage component ([#25](https://github.com/gravity-ui/aikit/issues/25)) ([89aa28d](https://github.com/gravity-ui/aikit/commit/89aa28d38a39e379688ad8de7b364b0fb301fc10))
* **useToolMessage:** integrate i18n for action labels and status messages ([6cb8095](https://github.com/gravity-ui/aikit/commit/6cb80950b035e6bfbf1f80e2ac44ffa3860f5c4f))


### Bug Fixes

* **BaseMessage:** conditionally render action buttons based on presence of actions ([d2ebd56](https://github.com/gravity-ui/aikit/commit/d2ebd567e99db332c5b6da345d78b43c61e0d8ec))
* **ci:** add install browser for playwright ([c08a280](https://github.com/gravity-ui/aikit/commit/c08a280bf068c43eb4754568f4038e34aa689f1a))
* **ci:** add maxDiffPixelRatio test ([7237bca](https://github.com/gravity-ui/aikit/commit/7237bca3cf7ff0188587ac52c1b289678ca16d07))
* **ci:** fix release script ([1fc004d](https://github.com/gravity-ui/aikit/commit/1fc004d74353ffe404e867a1507a008fa4cb8c1a))
* **ci:** fix screnshot name ([99d8369](https://github.com/gravity-ui/aikit/commit/99d8369aa6f1b95ab4cf8c1be6f6815e670bd8eb))
* **ci:** fix workflow ([f1c05a8](https://github.com/gravity-ui/aikit/commit/f1c05a8c620aea93532d0af0f9626afd79087ed7))
* **docs:** fix docs ([bb9a388](https://github.com/gravity-ui/aikit/commit/bb9a388b31374063af98e378dff717c2c3a440d2))
* **MarkdownRenderer:** handle non-string content and improve error logging ([813eec8](https://github.com/gravity-ui/aikit/commit/813eec830a639b8f5779176d771719748755d830))
* **prompt-input:** add new design features and fix problems ([473a16f](https://github.com/gravity-ui/aikit/commit/473a16fb74dc4037986ef5268ad0d38da02acb06))
* **storybook:** fix change themes for all storybook ([c34075b](https://github.com/gravity-ui/aikit/commit/c34075b57e2d212c9b24ee4371e410fc2b88fe07))
* **system:** fix codeowners nickname ([89839fc](https://github.com/gravity-ui/aikit/commit/89839fc138b0a3480c43e0cefa3d0b5febffb89e))
* **tests:** fix unit test pattern ([e35951f](https://github.com/gravity-ui/aikit/commit/e35951fc1e03d188e6400b020867827df1085c21))
* **ToolHeader:** add gap spacing to header layout ([9378122](https://github.com/gravity-ui/aikit/commit/93781227385b6c9f96ba61eae7df91f89e5fab06))
* **ToolHeader:** use ActionButton instead custom component ([037117c](https://github.com/gravity-ui/aikit/commit/037117c30c4d28cc3945de103818c49c81c88de2))
