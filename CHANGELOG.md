## Change Log

### v0.10.1 (2015/06/17)
- Ensure border for highlighted region doesn't overlap other lines ([@richrace])

### v0.10.0 (2015/06/14)
- Add special case for PHP variables beginning with `$` ([@richrace])
- Add debounce/timeout when selections change ([@richrace])
- Remove `atom-space-pen-views` ([@JCCR])

### v0.9.3 (2015/05/15)
- Fix `Uncaught TypeError: Cannot read property 'dispose' of undefined` ([@yongkangchen])

### v0.9.2 (2015/04/18)
- Fix hide highlight on multi select ([@hmatsuda])

### v0.9.1 (2015/03/01)
- Fix 1px border on panel ([@richrace])

### v0.9.0 (2015/02/13)
- Fix atom engine semver ([@izuzak])
- Add minimum length option ([@hmatsuda])
- Update Dev Dependencies (latest is no longer supported) ([@richrace])

### v0.8.0 (2015/02/01)
- Remove deprecations; move to Atom API v1 ([@hmatsuda])

### v0.7.0 (2014/12/17)
- Enable support for Shadow Dom ([@yongkangchen])

### v0.6.3 (2014/11/20)
- Fix for hiding highlight on the selected word when tabs are used not spaces ([@yongkangchen])

### v0.6.2 (2014/09/20)
- Improve the styling for light themes ([@Bengt])

### v0.6.1 (2014/09/15)
- Remove deprecated call to `getSelection()` with `getLastSelection()` ([@richrace])

### v0.6.0 (2014/08/23)
- Remove the Underlayer ([@richrace])
- Add tmp folder to ignore ([@richrace])
- Initial work of Specs ([@richrace])
- Add Travis and Rakefile ([@richrace])
- Project specific Coffee Lint properties ([@richrace])
- Update Docs ([@richrace])
- Don't require destroying when pane removed. ([@richrace])
- Fix for settings view ([@richrace])
- Update specs ([@richrace])
- Fix inconsistent whitespace ([@richrace])
- Add developer dependencies for CoffeeLint ([@richrace])

### v0.5.5 (2014/08/22 22:32 +00:00)
- [1dd19fd](https://github.com/richrace/highlight-selected/commit/1dd19fdbc6a355bdef253ad67fa3dff0ff20f00f) Destroy Marker not decorations. (@richrace)
- [7e3c65c](https://github.com/richrace/highlight-selected/commit/7e3c65c304d15bab8163c4e814dc855888bdbe08) Don't use leading whitespace. (@richrace)
- [f6c8687](https://github.com/richrace/highlight-selected/commit/f6c8687d6355f12289e38b939de8ab27135a9ca7) Prepare 0.5.5 release (@richrace)

### v0.5.4 (2014/08/19 08:22 +00:00)
- [d851c03](https://github.com/richrace/highlight-selected/commit/d851c037e7e78cb197fb0545fa2074d7390c7d34) Add .editor class to README to be explicit. (@richrace)
- [935a6f7](https://github.com/richrace/highlight-selected/commit/935a6f7a89a86907b780046ff1fffd5a1505dc29) Use Less not CSS (@richrace)
- [ad20ee9](https://github.com/richrace/highlight-selected/commit/ad20ee9e99a95d4fb99ddf384816f387e47409db) Correct typo (@richrace)
- [84a0f8e](https://github.com/richrace/highlight-selected/commit/84a0f8ef50f0c1a126609baab6c981c9a53a6a6d) Prepare 0.5.4 release (@richrace)

### v0.5.3 (2014/08/18 21:17 +00:00)
- [3a2141d](https://github.com/richrace/highlight-selected/commit/3a2141d0a5092ee7663e8f4a2aa46657c770f918) Be less explicit with the class structure (@richrace)
- [c905e3e](https://github.com/richrace/highlight-selected/commit/c905e3e278a015e0f122ba440a3c9eed32776807) Prepare 0.5.3 release (@richrace)

### v0.5.2 (2014/08/18 19:41 +00:00)
- [b3aad78](https://github.com/richrace/highlight-selected/commit/b3aad78cc085335aa746db31e793a68d7839ee52) Add background and options for light theme (@richrace)
- [44695fe](https://github.com/richrace/highlight-selected/commit/44695fe41c23fa70a2f3f160863e6042686595f5) Prepare 0.5.2 release (@richrace)

### v0.5.1 (2014/08/18 08:01 +00:00)
- [fd58912](https://github.com/richrace/highlight-selected/commit/fd589123155f394052468e1ac4cb29d5e067965b) Fix required Atom version. (@richrace)
- [fcb3926](https://github.com/richrace/highlight-selected/commit/fcb39265ca6e31a4c2784cd2a829765efeff606a) Prepare 0.5.1 release (@richrace)

### v0.5.0 (2014/08/17 14:00 +00:00)
- [6fccb39](https://github.com/richrace/highlight-selected/commit/6fccb3926b863ba66bdc5d34bf2bada3a9e37c59) Add Ignore Case Option ([@andreldm])
- [524f345](https://github.com/richrace/highlight-selected/commit/524f34554ba308690b9284642384c6b1dd8125e9) Use Decorations API; Requires latest Atom. (@richrace)
- [0f8b15e](https://github.com/richrace/highlight-selected/commit/0f8b15e89104476c2f931207be0cd0213613d6bd) Removed unused specs (@richrace)
- [0540f45](https://github.com/richrace/highlight-selected/commit/0540f451bc7fe22146842304562e7659f4869a35) Prepare 0.5.0 release (@richrace)

### v0.4.1 (2014/07/19 10:23 +00:00)
- [2ddcfb3](https://github.com/richrace/highlight-selected/commit/2ddcfb3be8b7b56c7544bfb9f2beb52d3a633af2) Add option to hide highlight on current selected word (@richrace)
- [f02ff7a](https://github.com/richrace/highlight-selected/commit/f02ff7abe23a9748e53263824b94bdbed42d26ba) Prepare 0.4.1 release (@richrace)

### v0.4.0 (2014/07/03 18:38 +00:00)
- [6e9964a](https://github.com/richrace/highlight-selected/commit/6e9964a382e6a55e66b190ec42b0434fc6740c35) Use editorView instead of editor for pixelPositionForScreenPosition to fix React Editor ([@taylorludwig])
- [4306bc4](https://github.com/richrace/highlight-selected/commit/4306bc42e9ed7167dcdfa16989c887fe27ebc94a) Prepare 0.4.0 release (@richrace)

### v0.3.0 (2014/06/29 19:07 +00:00)
- [670f9e7](https://github.com/richrace/highlight-selected/commit/670f9e72d5cafd8d7097aa07e839ddf193d32e81) fix(marker-view.coffee): on Windows, fix bug getting lineHeight value from @editor ([@nickeddy])
- [b3097f0](https://github.com/richrace/highlight-selected/commit/b3097f07760a2d1d9c8cc3333c7867af44c2d6c6) Prepare 0.3.0 release (@richrace)

### v0.2.11 (2014/04/06 15:26 +00:00)
- [068b5c3](https://github.com/richrace/highlight-selected/commit/068b5c37895375f1d17db2383ffbce15962ddc99) Correct word boundary. (@richrace)
- [86134bb](https://github.com/richrace/highlight-selected/commit/86134bb5e3f591089cbfe937d1a8b45cf34dc213) Prepare 0.2.11 release (@richrace)

### v0.2.10 (2014/04/06 15:12 +00:00)
- [feac807](https://github.com/richrace/highlight-selected/commit/feac807214b7e01d09494d7f8db5f2f7c2b410cf) Only highlight whole words as an option (@richrace)
- [fe8cb20](https://github.com/richrace/highlight-selected/commit/fe8cb208920f87670a726fb22e787bacbd578412) Prepare 0.2.10 release (@richrace)

### v0.2.9 (2014/03/22 09:27 +00:00)
- [5d4724a](https://github.com/richrace/highlight-selected/commit/5d4724a0b46bbb0c5b21b43b4277f3e3704d063b) Add Support for Symbols at the beginning of selected. (@richrace)
- [31cd7df](https://github.com/richrace/highlight-selected/commit/31cd7dffc8b5e0367b7a153054fe1c1536228f39) Prepare 0.2.9 release (@richrace)

### v0.2.8 (2014/03/15 22:49 +00:00)
- [2293459](https://github.com/richrace/highlight-selected/commit/229345932a2ea2bfcdd2a6c1ef0bd4506f10a7a6) Grammar (@richrace)
- [484b404](https://github.com/richrace/highlight-selected/commit/484b4043cddab6c7e6919a6d8b1dfbbf2463efc8) Only highlight a whole word and not some selection. (@richrace)
- [aa1e09f](https://github.com/richrace/highlight-selected/commit/aa1e09fc4dfdffcd4523999e2fcf8df6e18440aa) More coffee tidy up (@richrace)
- [11204ce](https://github.com/richrace/highlight-selected/commit/11204cecb3be161301bd167d3dd2f48aac06f60c) Prepare 0.2.8 release (@richrace)

### v0.2.7 (2014/03/15 16:12 +00:00)
- [69c0976](https://github.com/richrace/highlight-selected/commit/69c09762154c579b4692c50bca4b53da07cfb922) Don't need to use pane. (@richrace)
- [96d55db](https://github.com/richrace/highlight-selected/commit/96d55db7d5cacefba97cb0ae750f94e0127c4fca) Correct removing event. (@richrace)
- [8275841](https://github.com/richrace/highlight-selected/commit/8275841d8870da9e2d32d3cabf38f1cd59d67bce) Prepare 0.2.7 release (@richrace)

### v0.2.6 (2014/03/13 21:34 +00:00)
- [c747297](https://github.com/richrace/highlight-selected/commit/c7472979afefa3f32b9e61d4b3fc1bca6d5c16b7) Try to improve performance and memory useage (@richrace)
- [cd90754](https://github.com/richrace/highlight-selected/commit/cd90754dff449fd7bbdef8dad67608168791f0d8) Prepare 0.2.6 release (@richrace)

### v0.2.5 (2014/03/05 22:44 +00:00)
- [9dc686e](https://github.com/richrace/highlight-selected/commit/9dc686e47903f8ebe1c8071b1176612d9e264197) Only start doing parsing etc if there is more than one character (@richrace)
- [53fa717](https://github.com/richrace/highlight-selected/commit/53fa717f362a410a012ca303e8b1e26ac6c7e19e) Prepare 0.2.5 release (@richrace)

### v0.2.4 (2014/03/05 22:41 +00:00)
- [0871be4](https://github.com/richrace/highlight-selected/commit/0871be42792d82c58f3b7e6fde854d5ba20fd7d8) Fix range for editors using \t not spaces (@richrace)
- [612dfef](https://github.com/richrace/highlight-selected/commit/612dfef069e6b27feba92585653661c6d6b55369) Prepare 0.2.4 release (@richrace)

### v0.2.3 (2014/03/05 22:00 +00:00)
- [c9efa9f](https://github.com/richrace/highlight-selected/commit/c9efa9fee701560c559d47bf3173499d37f9fe9e) Typo (@richrace)
- [4e1d38c](https://github.com/richrace/highlight-selected/commit/4e1d38ceb8ab1f07f5f080f610f0d81c158e5c10) Only show markers on the active pane. (@richrace)
- [e64f1c5](https://github.com/richrace/highlight-selected/commit/e64f1c55788c4f12ec3ec02f1cfb1adf73fd196d) Prepare 0.2.3 release (@richrace)

### v0.2.2 (2014/03/04 22:25 +00:00)
- [e7b6cdc](https://github.com/richrace/highlight-selected/commit/e7b6cdcbf9b2b98bd22fb77f4a2e65aafda82683) Update todo. Reformat. And it does work 100% of the time. (@richrace)
- [12a27d4](https://github.com/richrace/highlight-selected/commit/12a27d42901cfe87f3b6933a9914341ea41b7273) Prepare 0.2.2 release (@richrace)

### v0.2.1 (2014/03/04 21:32 +00:00)
- [51c76cc](https://github.com/richrace/highlight-selected/commit/51c76cc1b2ad6d9b0a16c12f2f29344502144243) Renamed method to be more descriptive. (@richrace)
- [51ef411](https://github.com/richrace/highlight-selected/commit/51ef411b58922900d3e3e7e633e791070912b1fc) Prepare 0.2.1 release (@richrace)

### v0.2.0 (2014/03/04 21:24 +00:00)
- [660df7a](https://github.com/richrace/highlight-selected/commit/660df7ac5c5115c5c969d7d27eb00f9dbe51771f) Better performance. Does highlights selection based on a word (@richrace)
- [dc7c81d](https://github.com/richrace/highlight-selected/commit/dc7c81d27ea3fde834341b9f16c7aac7cd849e75) Prepare 0.2.0 release (@richrace)

### v0.1.3 (2014/03/03 20:32 +00:00)
- [6bb5417](https://github.com/richrace/highlight-selected/commit/6bb54177d1a21ca265e0bb160bbb0d4adc37a7cc) Found new issue with regex, added to issues/todo. (@richrace)
- [ee906d1](https://github.com/richrace/highlight-selected/commit/ee906d1af7299c1afe6c0b12c79cf8837fc7468a) Found another issue. (@richrace)
- [d9771a9](https://github.com/richrace/highlight-selected/commit/d9771a9769ec2657c074159c178fa73764a18bb1) Added another issue. (@richrace)
- [7ce6fe0](https://github.com/richrace/highlight-selected/commit/7ce6fe0daf280d1346ec7bf2286697f50ac90b32) Remove makers on keypress, reassign events to pane views. (@richrace)
- [115fa73](https://github.com/richrace/highlight-selected/commit/115fa7358c102b499de24d4d994e67308445e83b) Stop crashing for RegEx (@richrace)
- [6b94189](https://github.com/richrace/highlight-selected/commit/6b94189abf2cbab9dd8e087129a223b7e262d217) Prepare 0.1.3 release (@richrace)

### v0.1.2 (2014/03/02 19:17 +00:00)
- [e7d4578](https://github.com/richrace/highlight-selected/commit/e7d4578cce9556aa18596b5bfc002d6b5dbc5724) Fix being able to uninstall package (@richrace)
- [bbbf2d2](https://github.com/richrace/highlight-selected/commit/bbbf2d21daf1f61bbaa63877b0cbcd4c8471c984) Prepare 0.1.2 release (@richrace)

### v0.1.1 (2014/03/02 19:07 +00:00)
- [55eff4e](https://github.com/richrace/highlight-selected/commit/55eff4e258677bd31c16c1d8655a5dcba9a5d5a2) Oops, crashed on install (@richrace)
- [cbc8e28](https://github.com/richrace/highlight-selected/commit/cbc8e28722ecd02bf96d7e6d80b4ef73f16feb57) Prepare 0.1.1 release (@richrace)

### v0.1.0 (2014/03/02 19:04 +00:00)
- [6a35111](https://github.com/richrace/highlight-selected/commit/6a35111b27d087957b6ec9d0fa56c6b095c11fb2) Initial commit (@richrace)
- [ab1ef7b](https://github.com/richrace/highlight-selected/commit/ab1ef7b2faf25a65b19787eb544d4cbb306143c1) Update name (@richrace)
- [0855c83](https://github.com/richrace/highlight-selected/commit/0855c83a38e5640b97cc899a39d342273e84f105) Update Readme (@richrace)
- [7ac1439](https://github.com/richrace/highlight-selected/commit/7ac1439e146e773110efcbf028d68f5309716c7d) Prepare 0.1.0 release (@richrace)

[@richrace]: https://github.com/richrace
[@andreldm]: https://github.com/andreldm
[@taylorludwig]: https://github.com/taylorludwig
[@nickeddy]: https://github.com/nickeddy
[@Bengt]: https://github.com/Bengt
[@yongkangchen]: https://github.com/yongkangchen
[@hmatsuda]: https://github.com/hmatsuda
[@izuzak]: https://github.com/izuzak
[@JCCR]: https://github.com/JCCR
