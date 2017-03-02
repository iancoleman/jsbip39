/*
 * Tests run in the browser
 * Javascript Library tests run in 4.065s
 * Python Reference   tests run in 2.392s
 *
 * To run tests:
 * $ cd /path/to/repo/
 * $ python -m SimpleHTTPServer
 * Open http://localhost:8000/test/ in your browser
 */

QUnit.test("hashing", function(assert) {
    var val = "あ";
    var hash = "dc5a4d3d82f7e15792959dc661538ae0e541ce66494516f5c9cfd9cd3308494d";
    var result = sjcl.hash.sha256.hash(val);
    var resultHex = sjcl.codec.hex.fromBits(result);
    assert.equal(resultHex, hash);
});

function hexStringToArray(str) {
    var arrayLen = str.length / 2;
    var array = [];
    for (var i=0; i<arrayLen; i++) {
        var valueStr = str.substring(0,2);
        var value = parseInt(valueStr, 16);
        array.push(value);
        str = str.slice(2);
    }
    return array;
}

// check_list
function checkList(assert, language, vectors) {
}

// test_vectors
(function() {
    for (var language in allVectors) {
        var vectors = allVectors[language];
        (function(testLanguage, testVectors) {
            QUnit.test("check_list", function(assert) {
                var mnemo = new Mnemonic(testLanguage);
                for (var i=0; i<testVectors.length; i++) {
                    var v = testVectors[i];
                    var array = hexStringToArray(v.entropy);
                    var code = mnemo.toMnemonic(array);
                    var seed = mnemo.toSeed(code, v.passphrase);
                    assert.ok(mnemo.check(v.mnemonic));
                    assert.ok(v.mnemonic == code);
                    assert.ok(v.seed == seed);
                }
            });
        })(language, vectors);
    }
})();

// mnemonic.generate
QUnit.test("mnemonic.generate", function(assert) {
    var mnemo = new Mnemonic("english");
    for (var i=0; i<30; i++) {
        var m = mnemo.generate();
        assert.ok(mnemo.check(m));
    }
});

// test_failed_checksum
QUnit.test("test_failed_checksum", function(assert) {
    var code = 'bless cloud wheel regular tiny venue bird web grief security dignity zoo';
    var mnemo = new Mnemonic('english');
    assert.equal(mnemo.check(code), false);
});

// test_detection
QUnit.test("test_detection", function(assert) {
    // Method not implemented
    assert.ok(true);
});

// test_collision
QUnit.test("test_collision", function(assert) {
    // Tests language detection which is not implemented
    assert.ok(true);
});

// test_lengths
// from https://github.com/trezor/python-mnemonic/blob/f9f7720ab79b07a86e0c10071d56d2a3ed5ab27c/test_mnemonic.py#L76
QUnit.test("test_lengths", function(assert) {
    var languages = ["english"];
    for (var i=0; i<languages.length; i++) {
        var language = languages[i];
        var wordlist = WORDLISTS[language];
        for (var j=0; j<wordlist.length; j++) {
            var word = wordlist[j];
            assert.ok(word.length >= 3);
            assert.ok(word.length <= 8);
        }
    }
});

// Test French lengths
// from https://github.com/bitcoin/bips/blob/master/bip-0039/bip-0039-wordlists.md#french
QUnit.test("test_lengths", function(assert) {
    var languages = ["french"];
    for (var i=0; i<languages.length; i++) {
        var language = languages[i];
        var wordlist = WORDLISTS[language];
        for (var j=0; j<wordlist.length; j++) {
            var word = wordlist[j];
            // Wordlist uses combining diacritical marks, so must normalize for correct length
            var wordnorm = word.normalize();
            assert.ok(wordnorm.length >= 5);
            assert.ok(wordnorm.length <= 8);
        }
    }
});

// Test Italian lengths
// from https://github.com/bitcoin/bips/blob/master/bip-0039/bip-0039-wordlists.md#italian
// see https://github.com/bitcoin/bips/pull/468
QUnit.test("test_lengths", function(assert) {
    var languages = ["italian"];
    for (var i=0; i<languages.length; i++) {
        var language = languages[i];
        var wordlist = WORDLISTS[language];
        for (var j=0; j<wordlist.length; j++) {
            var word = wordlist[j];
            assert.ok(word.length >= 4);
            assert.ok(word.length <= 9);
        }
    }
});

// test_validchars
// from https://github.com/trezor/python-mnemonic/blob/f9f7720ab79b07a86e0c10071d56d2a3ed5ab27c/test_mnemonic.py#L86
QUnit.test("test_validchars", function(assert) {
    var alphabet = 'abcdefghijklmnopqrstuvwxyz';
    var languages = ["english", "italian"];
    for (var i=0; i<languages.length; i++) {
        var language = languages[i];
        var wordlist = WORDLISTS[language];
        for (var i=0; i<wordlist.length; i++) {
            var word = wordlist[i];
            for (var j=0; j<word.length; j++) {
                var letter = word[j];
                assert.ok(alphabet.indexOf(letter) > -1);
            }
        }
    }
});

// test_sorted_unique
// from https://github.com/trezor/python-mnemonic/blob/f9f7720ab79b07a86e0c10071d56d2a3ed5ab27c/test_mnemonic.py#L97
QUnit.test("test_sorted_unique", function(assert) {
    var languages = ["english"];
    for (var i=0; i<languages.length; i++) {
        var language = languages[i];
        var wordlist = WORDLISTS[language];
        var clone = [];
        for (var i=0; i<wordlist.length; i++) {
            clone.push(wordlist[i]);
        }
        clone.sort();
        for (var i=0; i<clone.length; i++) {
            // Sorted
            assert.equal(clone[i], wordlist[i]);
            // Unique
            if (i != 0) {
                assert.notEqual(clone[i-1], clone[i]);
            }
        }
    }
});

// test_root_len
// from https://github.com/trezor/python-mnemonic/blob/f9f7720ab79b07a86e0c10071d56d2a3ed5ab27c/test_mnemonic.py#L113
// and https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki#wordlist
QUnit.test("test_root_len", function(assert) {
    var languages = ["english", "spanish", "french", "italian"];
    for (var i=0; i<languages.length; i++) {
        var language = languages[i];
        var wordlist = WORDLISTS[language];
        var mnemo = Mnemonic(language);
        var prefixes = [];
        for (var i=0; i<wordlist.length; i++) {
            var w = wordlist[i];
            var pref = w.substring(0,4);
            assert.equal(prefixes.indexOf(pref), -1);
            prefixes.push(pref);
        }
    }
});

// test_similarity
// from https://github.com/trezor/python-mnemonic/blob/f9f7720ab79b07a86e0c10071d56d2a3ed5ab27c/test_mnemonic.py#L135
QUnit.test("test_similarity", function(assert) {
    var similar = [
        'ac', 'ae', 'ao',
        'bd', 'bh', 'bp', 'bq', 'br',
        'ce', 'cg', 'cn', 'co', 'cq', 'cu',
        'dg', 'dh', 'do', 'dp', 'dq',
        'ef', 'eo',
        'fi', 'fj', 'fl', 'fp', 'ft',
        'gj', 'go', 'gp', 'gq', 'gy',
        'hk', 'hl', 'hm', 'hn', 'hr',
        'ij', 'il', 'it', 'iy',
        'jl', 'jp', 'jq', 'jy',
        'kx',
        'lt',
        'mn', 'mw',
        'nu', 'nz',
        'op', 'oq', 'ou', 'ov',
        'pq', 'pr',
        'qy',
        'sz',
        'uv', 'uw', 'uy',
        'vw', 'vy'
    ]

    var languages = ["english"];
    for (var i=0; i<languages.length; i++) {
        var language = languages[i];
        var wordlist = WORDLISTS[language];
        for (var i=0; i<wordlist.length; i++) {
            for (var j=0; j<wordlist.length; j++) {
                var w1 = wordlist[i];
                var w2 = wordlist[j];
                if (w1.length != w2.length) {
                    continue;
                }
                if (w1 == w2) {
                    continue;
                }
                if (w1 > w2) {
                    // No need to print warning twice
                    continue;
                }
                var diff = [];
                for (var k=0; k<w1.length; k++) {
                    if (w1[k] != w2[k]) {
                        var pair = "";
                        if (w1[k] < w2[k]) {
                            pair = w1[k] + w2[k];
                        }
                        else {
                            pair = w2[k] + w1[k];
                        }
                        diff.push(pair);
                    }
                }
                if (diff.length == 1) {
                    assert.ok(similar.indexOf(diff[0]) == -1);
                }
            }
        }
    }
});

// test_utf8_nfkd
// from https://github.com/trezor/python-mnemonic/blob/f9f7720ab79b07a86e0c10071d56d2a3ed5ab27c/test_mnemonic.py#L196
QUnit.test("test_utf8_nfkd", function(assert) {
    // The same sentence in various UTF-8 forms
    var words_nfkd = "Pr\u030ci\u0301s\u030cerne\u030c z\u030clut\u030couc\u030cky\u0301 ku\u030an\u030c u\u0301pe\u030cl d\u030ca\u0301belske\u0301 o\u0301dy za\u0301ker\u030cny\u0301 uc\u030cen\u030c be\u030cz\u030ci\u0301 pode\u0301l zo\u0301ny u\u0301lu\u030a";
    var words_nfc = "P\u0159\xed\u0161ern\u011b \u017elu\u0165ou\u010dk\xfd k\u016f\u0148 \xfap\u011bl \u010f\xe1belsk\xe9 \xf3dy z\xe1ke\u0159n\xfd u\u010de\u0148 b\u011b\u017e\xed pod\xe9l z\xf3ny \xfal\u016f";
    var words_nfkc = "P\u0159\xed\u0161ern\u011b \u017elu\u0165ou\u010dk\xfd k\u016f\u0148 \xfap\u011bl \u010f\xe1belsk\xe9 \xf3dy z\xe1ke\u0159n\xfd u\u010de\u0148 b\u011b\u017e\xed pod\xe9l z\xf3ny \xfal\u016f";
    var words_nfd = "Pr\u030ci\u0301s\u030cerne\u030c z\u030clut\u030couc\u030cky\u0301 ku\u030an\u030c u\u0301pe\u030cl d\u030ca\u0301belske\u0301 o\u0301dy za\u0301ker\u030cny\u0301 uc\u030cen\u030c be\u030cz\u030ci\u0301 pode\u0301l zo\u0301ny u\u0301lu\u030a";

    var passphrase_nfkd = "Neuve\u030cr\u030citelne\u030c bezpec\u030cne\u0301 hesli\u0301c\u030cko";
    var passphrase_nfc = "Neuv\u011b\u0159iteln\u011b bezpe\u010dn\xe9 hesl\xed\u010dko";
    var passphrase_nfkc = "Neuv\u011b\u0159iteln\u011b bezpe\u010dn\xe9 hesl\xed\u010dko";
    var passphrase_nfd = "Neuve\u030cr\u030citelne\u030c bezpec\u030cne\u0301 hesli\u0301c\u030cko";

    var mnemo = new Mnemonic("english");
    var seed_nfkd = mnemo.toSeed(words_nfkd, passphrase_nfkd)
    var seed_nfc = mnemo.toSeed(words_nfc, passphrase_nfc)
    var seed_nfkc = mnemo.toSeed(words_nfkc, passphrase_nfkc)
    var seed_nfd = mnemo.toSeed(words_nfd, passphrase_nfd)

    assert.equal(seed_nfkd, seed_nfc);
    assert.equal(seed_nfkd, seed_nfkc);
    assert.equal(seed_nfkd, seed_nfd);
});

// Test handling multiple consecutive spaces
// See https://github.com/iancoleman/bip39/issues/19
QUnit.test("test multiple spaces", function(assert) {
    var mnemo = new Mnemonic("english");
    var seed = mnemo.toSeed("urge cat  bid");
    assert.ok(seed == "e0d441a3030c22ce7b271d39dfbdb8b6754bbff513af100689fe81a106b041855cad240b818051a326dedd1d7deb336b98a7eaf939e5ef5013e671c412f3a119");
});

// Test use of ideographic space for Japanese language
// from https://github.com/bitcoin/bips/blob/master/bip-0039/bip-0039-wordlists.md#japanese
QUnit.test("test_ideographic_space", function(assert) {
    var mnemo = new Mnemonic("japanese");
    var m = mnemo.generate();
    // has no ascii spaces
    var asciiSpace = " ";
    assert.equal(m.indexOf(asciiSpace), -1);
    // has ideographic spaces
    var ideographicSpace = "\u3000";
    assert.ok(m.indexOf(ideographicSpace) > -1);
});

// Special Spanish characters like 'ñ', 'ü', 'á', etc... are considered equal to 'n', 'u', 'a'
// https://github.com/bitcoin/bips/blob/master/bip-0039/bip-0039-wordlists.md#spanish
// TODO

// There are no words in common between the Spanish wordlist and any other language wordlist.
// https://github.com/bitcoin/bips/blob/master/bip-0039/bip-0039-wordlists.md#spanish
QUnit.test("test_words_unique_to_language", function(assert) {
    var uniqueWordsLanguages = ["spanish", "italian"];
    for (var i=0; i<uniqueWordsLanguages.length; i++) {
        var uniqueWordsLanguage = uniqueWordsLanguages[i];
        for (var language in WORDLISTS) {
            if (language == uniqueWordsLanguage) {
                continue;
            }
            var wordlist = WORDLISTS[language];
            for (var j=0; j<wordlist.length; j++) {
                var word = wordlist[j];
                var isUnique = WORDLISTS[uniqueWordsLanguage].indexOf(word) > -1;
                assert.ok(!isUnique);
            }
        }
    }
});

QUnit.test("blank mnemonic", function(assert) {
    var m = new Mnemonic("english");
    var isValid = m.check("");
    assert.ok(!isValid);
});

// French: No very similar words with 1 letter of difference. TODO
// French: No words with "ô;â;ç;ê;œ;æ;î;ï;û;ù;à;ë;ÿ". TODO
// French: No words ending by "é;ée;è;et;ai;ait". TODO
// French: No words in conflict with the spelling corrections of 1990 TODO
