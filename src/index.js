let fetch;
const {writeFile, readFile, mkdir} = require("fs/promises");
const {getExtension} = require('mime');
const {join, relative, dirname} = require("path");
const regex = /["'](https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=;]*))["']/g

async function process(inputHTML, outputAssets) {
    if(fetch == null)
        fetch = (await import("node-fetch")).default;
    await mkdir(outputAssets, {recursive: true});
    let html = await readFile(inputHTML, "utf8");
    let htmlDir = dirname(inputHTML);
    let urls = [];
    let match;
    do {
        match = regex.exec(html);
        if (match)
            urls.push(match[1]);
    } while (match);
    for (const i in urls) {
        let url = urls[i];
        let data = await fetch(url);
        let rawData = Buffer.of(await data.arrayBuffer());

        let header = data.headers.get("Content-Type");
        let extension;
        if(header != null)
            extension = getExtension(header);
        else
            extension = url.split(/[#?]/)[0].split('.').pop().trim();
        let outFile = join(outputAssets, i + "." + extension);
        await writeFile(outFile, rawData);
        html = html.replace(url, relative(htmlDir, outFile));
    }
    await writeFile(inputHTML, html);
}
module.exports = {
    process
}


