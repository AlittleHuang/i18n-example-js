
let dictionaries = {

    "zh-cn": {
        "test-key": "测试一下",
        "zh-cn": "中文",
        "en-us": "English"
    },
    "en-us": {
        "姓名": "name",
        "中文": "Chinese",
        "英语": "English",
        "年龄": "age",
        "单价:{?}，数量{?}": "price:$1, count:$2",
        "zh-cn": "中文",
        "en-us": "English",
        "test-key": "this is test key"
    }

}

const mark_reg = "{?}";
const fix_reg = /{\\\?}/g;
const special = ".*?+^$|\\";

for (let lan in dictionaries) {
    let dictionary = dictionaries[lan]
    for (let k in dictionary) {
        // noinspection JSUnfilteredForInLoop
        let key = k;
        let value = dictionary[key];
        if (key.includes(mark_reg)) {
            let result = "^";
            for (let i = 0; i < key.length; i++) {
                if (special.includes(key[i])) result += "\\";
                result += key[i];
            }
            result += "$";
            let regExp = new RegExp(result.replace(fix_reg, "(.*?)"));
            let regulars = dictionary.___regulars___ = dictionary.___regulars___ || []
            regulars.push({ regExp, value });
            console.log(dictionary)
        }
    }

}


let language = 'en-us'

function translate(i18nKey, cache = true) {
    const dic = dictionaries[language];
    if (dic && dic[i18nKey] !== undefined) {
        return dic[i18nKey]
    }
    if (dic.___regulars___) {
        for (let regular of dic.___regulars___) {
            if (regular.regExp.test(i18nKey)) {
                result = i18nKey.replace(regular.regExp, regular.value);
                if (cache) {
                    dic[i18nKey] = result;
                }
                return result;
            }
        }
    }
    return i18nKey;
}


function translateNode(node) {
    if (!node || ["style", "script", "code", "pre"].includes(node.nodeName.toLowerCase())) {
        return;
    } else if (node.nodeName === "#text" && node.textContent) {
        let i18nKey = node.i18nKey = node.i18nKey || node.textContent
        node.textContent = translate(i18nKey)
    } else {
        for (let i = 0; i < node.childNodes.length; i++) {
            translateNode(node.childNodes[i])
        }
    }
}

function updateLanguage(newLanguage) {
    if (language === newLanguage) return
    language = newLanguage;
    translateNode(document.body)
}


const config = { attributes: true, childList: true, subtree: true };

const observer = new MutationObserver(mutationsList => {
    for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
            for (const node of mutation.addedNodes) {
                if (node.nodeName === "#text") {
                    let i18nKey = node.i18nKey = node.i18nKey || node.textContent
                    const value = translate(i18nKey);
                    node.textContent = value
                }
            }
        }
    }
});

observer.observe(document, config);